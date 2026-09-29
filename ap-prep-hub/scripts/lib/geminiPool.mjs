/**
 * A paced pool of Gemini API keys for the offline batch scripts
 * (seed-question-bank, tag-misconceptions).
 *
 * Those scripts share their keys with the live app. Before this, they fired as
 * fast as the loop could spin (tag-misconceptions: ~8 calls/s across 11 keys,
 * about 43 requests/minute per key against a 15 RPM limit) and always led with
 * gemini-3.1-flash-lite. That is what the AI Studio dashboard showed: 3.1
 * flash-lite peaking at 23/15 RPM and 620/500 RPD while 3.5 flash-lite, with
 * the same limits, sat at 106/500 — and every student using the app during a
 * run got "the AI is busy".
 *
 * The pool:
 *   - paces every (key, model) pair to its per-minute limit, so bursts never
 *     earn a 429 in the first place;
 *   - picks the least-used pair, spreading work across all keys AND across the
 *     models it is given (the two flash-lite pools are equal, so both are used);
 *   - counts requests per pair per Pacific day in a local file, so several runs
 *     in one day add up, and stops at (1 - reserve) of each daily limit, leaving
 *     the rest for students (default reserve 30%, env GEMINI_SCRIPT_RESERVE);
 *   - parks a pair whose daily quota is spent until midnight Pacific, cools a
 *     pair for Google's stated delay on a per-minute 429, cools a whole MODEL
 *     on a 5xx (that is model-scoped), and drops a key on 403.
 *
 * No SDK and no network in the constructor: `fetchImpl`, `now` and `sleep` are
 * injectable, which is how scripts/lib/geminiPool.test.mjs drives it.
 */

import fs from 'fs';

export const GENERATE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/** Free-tier limits per project, from the AI Studio rate-limit page. */
export function limitsFor(model) {
  if (/^gemini-\d+(\.\d+)?-flash-lite$/.test(model) && !/^gemini-2\.5/.test(model)) return { rpm: 15, rpd: 500 };
  if (/^gemma-/.test(model)) return { rpm: 30, rpd: 14400 };
  if (model === 'gemini-2.5-flash-lite') return { rpm: 10, rpd: 20 };
  return { rpm: 5, rpd: 20 }; // every -flash model
}

/** The current date in America/Los_Angeles, e.g. "2026-09-29" — Google's quota day. */
export function pacificDay(now = Date.now()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(new Date(now));
}

/** Milliseconds until the next Pacific midnight, when daily quotas reset. */
export function msUntilPacificMidnight(now = Date.now()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles', hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(new Date(now));
  const get = (t) => Number((parts.find((p) => p.type === t) || {}).value || 0);
  const elapsed = (get('hour') % 24) * 3600 + get('minute') * 60 + get('second');
  return Math.max(60, 86400 - elapsed) * 1000;
}

/** Seconds to wait from a 429: Retry-After, else Google's RetryInfo body. */
export function retryDelaySeconds(headerValue, bodyText) {
  const fromHeader = parseInt(headerValue || '', 10);
  if (Number.isFinite(fromHeader) && fromHeader > 0) return fromHeader;
  const m = /"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/.exec(String(bodyText || ''));
  return m ? Math.ceil(Number(m[1])) : 0;
}

export class BudgetExhaustedError extends Error {}

export function createPool({
  keys,
  models,
  reserve = Number(process.env.GEMINI_SCRIPT_RESERVE ?? 0.3),
  usageFile = null,
  fetchImpl = (...a) => fetch(...a),
  now = () => Date.now(),
  sleep = (ms) => new Promise((r) => setTimeout(r, ms)),
  log = () => {},
  maxWaitMs = 5 * 60 * 1000,
}) {
  if (!Array.isArray(keys) || !keys.length) throw new Error('geminiPool: no keys');
  if (!Array.isArray(models) || !models.length) throw new Error('geminiPool: no models');
  const share = Math.min(1, Math.max(0, 1 - (Number.isFinite(reserve) ? reserve : 0.3)));

  // usage = { day, counts: { "keyIdx|model": n } } — persisted per Pacific day.
  let usage = { day: pacificDay(now()), counts: {} };
  if (usageFile) {
    try {
      const saved = JSON.parse(fs.readFileSync(usageFile, 'utf8'));
      if (saved && saved.day === usage.day && saved.counts) usage = saved;
    } catch { /* no file yet */ }
  }
  const persist = () => {
    if (!usageFile) return;
    try { fs.writeFileSync(usageFile, JSON.stringify(usage)); } catch { /* best effort */ }
  };
  const rollDay = () => {
    const d = pacificDay(now());
    if (d !== usage.day) usage = { day: d, counts: {} };
  };

  const starts = new Map();    // pairKey -> timestamps of requests in the last minute
  const coolUntil = new Map(); // pairKey -> ms
  const modelDownUntil = new Map(); // model -> ms (5xx is model-scoped)
  const blocked = new Set();   // key indexes rejected with 403

  const pairKey = (k, m) => `${k}|${m}`;
  const dayCap = (m) => Math.floor(limitsFor(m).rpd * share);
  const used = (k, m) => usage.counts[pairKey(k, m)] || 0;

  /** When this pair may next start a request (ms), or Infinity if spent for the day. */
  function readyAt(k, m) {
    if (blocked.has(k)) return Infinity;
    if (used(k, m) >= dayCap(m)) return Infinity;
    const t = now();
    let at = Math.max(t, coolUntil.get(pairKey(k, m)) || 0, modelDownUntil.get(m) || 0);
    const { rpm } = limitsFor(m);
    const recent = (starts.get(pairKey(k, m)) || []).filter((s) => s > t - 60_000);
    starts.set(pairKey(k, m), recent);
    // Stay one under the limit: Google's minute window is not aligned with ours.
    const allowed = Math.max(1, rpm - 1);
    if (recent.length >= allowed) at = Math.max(at, recent[recent.length - allowed] + 60_000);
    return at;
  }

  /** The best pair to use now, or the soonest moment one frees up. */
  function choose() {
    rollDay();
    let best = null;
    let soonest = Infinity;
    const t = now();
    for (const m of models) {
      for (let k = 0; k < keys.length; k++) {
        const at = readyAt(k, m);
        if (at > t) { soonest = Math.min(soonest, at); continue; }
        // Least-used share of the daily cap wins, so load spreads evenly over
        // keys and over equal-sized model pools instead of draining the first.
        const load = used(k, m) / Math.max(1, dayCap(m));
        if (!best || load < best.load) best = { k, m, load };
      }
    }
    return best || { waitUntil: soonest };
  }

  async function call(body) {
    let lastError = 'no attempt';
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = choose();
      if (pick.waitUntil !== undefined) {
        if (!Number.isFinite(pick.waitUntil)) {
          throw new BudgetExhaustedError(
            `every key/model pair has used its share of today's quota (${Math.round(share * 100)}%; ` +
            `the rest is reserved for the app). Resumes after midnight Pacific. Last error: ${lastError}`
          );
        }
        const waitMs = Math.max(250, pick.waitUntil - now());
        if (waitMs > maxWaitMs) throw new Error(`no key free for ${Math.round(waitMs / 1000)}s. Last error: ${lastError}`);
        log(`waiting ${Math.ceil(waitMs / 1000)}s for a key`);
        await sleep(waitMs);
        continue;
      }

      const { k, m } = pick;
      const pk = pairKey(k, m);
      starts.get(pk).push(now());
      let res;
      try {
        res = await fetchImpl(`${GENERATE_URL}/${m}:generateContent?key=${keys[k]}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } catch (e) {
        lastError = `${m} key ${k + 1}: ${e.message}`;
        coolUntil.set(pk, now() + 10_000);
        continue;
      }

      if (res.ok) {
        usage.counts[pk] = used(k, m) + 1;
        persist();
        const json = await res.json();
        return { json, model: m, key: k + 1 };
      }

      const text = await res.text().catch(() => '');
      lastError = `${m} key ${k + 1}: HTTP ${res.status} ${text.slice(0, 120)}`;
      if (res.status === 429) {
        if (/PerDay|per day/i.test(text)) {
          // Spent for today — mark it so and leave it until the reset.
          usage.counts[pk] = Math.max(used(k, m), dayCap(m));
          persist();
          coolUntil.set(pk, now() + msUntilPacificMidnight(now()));
        } else {
          coolUntil.set(pk, now() + (retryDelaySeconds(res.headers?.get?.('retry-after'), text) || 20) * 1000);
        }
      } else if (res.status === 403) {
        blocked.add(k);
        if (blocked.size === keys.length) {
          throw new Error('every key was rejected with 403. Batch scripts need keys with no HTTP-referrer restriction.');
        }
      } else if (res.status >= 500) {
        modelDownUntil.set(m, now() + 30_000);
      } else {
        // 400 and friends are the request's fault; retrying will not help.
        throw new Error(lastError);
      }
    }
    throw new Error(lastError);
  }

  /** Requests used today and the per-pair cap, for a progress line. */
  function summary() {
    rollDay();
    return models.map((m) => {
      const total = keys.reduce((n, _, k) => n + used(k, m), 0);
      return `${m} ${total}/${dayCap(m) * keys.length}`;
    }).join(', ');
  }

  return { call, summary, _choose: choose };
}
