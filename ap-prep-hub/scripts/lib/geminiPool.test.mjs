// Run with: node --test scripts/lib/geminiPool.test.mjs
// (Lives beside the pool because CRA's jest only scans src/ and this is .mjs.)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPool, limitsFor, BudgetExhaustedError, msUntilPacificMidnight, pacificDay } from './geminiPool.mjs';

const LITES = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'];

/** A fake clock + fetch that records which (model, key) each call hit. */
function harness({ respond } = {}) {
  let t = Date.parse('2026-09-29T17:00:00Z'); // 10:00 Pacific
  const calls = [];
  const fetchImpl = async (url) => {
    const [, model, key] = /models\/([^:]+):generateContent\?key=(.+)$/.exec(url);
    calls.push({ model, key, at: t });
    const r = respond ? respond({ model, key, n: calls.length }) : { status: 200 };
    return {
      ok: r.status === 200,
      status: r.status,
      headers: { get: () => null },
      json: async () => ({ candidates: [{ content: { parts: [{ text: '[]' }] } }] }),
      text: async () => r.body || '',
    };
  };
  return {
    calls,
    now: () => t,
    sleep: async (ms) => { t += ms; },
    fetchImpl,
  };
}

test('free-tier limits match the AI Studio table', () => {
  assert.deepEqual(limitsFor('gemini-3.1-flash-lite'), { rpm: 15, rpd: 500 });
  assert.deepEqual(limitsFor('gemini-3.5-flash-lite'), { rpm: 15, rpd: 500 });
  assert.deepEqual(limitsFor('gemini-2.5-flash-lite'), { rpm: 10, rpd: 20 });
  assert.deepEqual(limitsFor('gemma-4-31b-it'), { rpm: 30, rpd: 14400 });
  assert.deepEqual(limitsFor('gemini-3.7-flash'), { rpm: 5, rpd: 20 });
});

test('spreads calls evenly over keys and over both flash-lite pools', async () => {
  const h = harness();
  const pool = createPool({ keys: ['k1', 'k2'], models: LITES, reserve: 0, ...h });
  for (let i = 0; i < 40; i++) await pool.call({});
  const per = {};
  for (const c of h.calls) per[`${c.model}|${c.key}`] = (per[`${c.model}|${c.key}`] || 0) + 1;
  assert.equal(Object.keys(per).length, 4, 'all four (key, model) pairs used');
  for (const n of Object.values(per)) assert.equal(n, 10);
});

test('never exceeds a pair\'s per-minute limit', async () => {
  const h = harness();
  const pool = createPool({ keys: ['only'], models: ['gemini-3.1-flash-lite'], reserve: 0, ...h });
  for (let i = 0; i < 60; i++) await pool.call({});
  for (let i = 0; i < h.calls.length; i++) {
    const inWindow = h.calls.filter((c) => c.at > h.calls[i].at - 60_000 && c.at <= h.calls[i].at).length;
    assert.ok(inWindow <= 14, `call ${i}: ${inWindow} requests in 60s (limit 15, pool keeps one spare)`);
  }
});

test('leaves the reserved share of each daily limit for the app', async () => {
  const h = harness();
  // 2.5-flash-lite: 20 RPD; with a 30% reserve the script may use 14.
  const pool = createPool({ keys: ['k'], models: ['gemini-2.5-flash-lite'], reserve: 0.3, ...h });
  let done = 0;
  await assert.rejects(async () => { for (;;) { await pool.call({}); done++; } }, BudgetExhaustedError);
  assert.equal(done, 14);
});

test('parks a pair whose DAILY quota is spent, and keeps using the others', async () => {
  const h = harness({
    respond: ({ model, key }) => (model === 'gemini-3.1-flash-lite' && key === 'k1'
      ? { status: 429, body: '{"error":{"message":"GenerateRequestsPerDayPerProjectPerModel"}}' }
      : { status: 200 }),
  });
  const pool = createPool({ keys: ['k1', 'k2'], models: LITES, reserve: 0, ...h });
  for (let i = 0; i < 30; i++) await pool.call({});
  const deadHits = h.calls.filter((c) => c.model === 'gemini-3.1-flash-lite' && c.key === 'k1').length;
  assert.equal(deadHits, 1, 'the exhausted pair is tried once, then left alone until midnight Pacific');
});

test('a 403 drops the key for the rest of the run', async () => {
  const h = harness({ respond: ({ key }) => (key === 'bad' ? { status: 403, body: 'referer blocked' } : { status: 200 }) });
  const pool = createPool({ keys: ['bad', 'good'], models: ['gemini-3.1-flash-lite'], reserve: 0, ...h });
  for (let i = 0; i < 10; i++) await pool.call({});
  assert.equal(h.calls.filter((c) => c.key === 'bad').length, 1);
});

test('Pacific-day helpers', () => {
  const t = Date.parse('2026-09-29T17:00:00Z'); // 10:00 PDT
  assert.equal(pacificDay(t), '2026-09-29');
  assert.equal(msUntilPacificMidnight(t), 14 * 3600 * 1000);
});
