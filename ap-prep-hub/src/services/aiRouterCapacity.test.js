/**
 * Capacity contract for the three copies of the model chain: the Cloudflare
 * worker, the Netlify proxy, and src/constants/modelChains.js. They cannot
 * import each other, so drift is caught here.
 *
 * Two failures this pins:
 *
 * 1. `interactive` (tutorChat — the busiest call in the app) ended on
 *    gemini-2.5-flash, which is 20 RPD per project. Once the models above it
 *    were out, the entire account had ~220 tutor messages per day.
 *
 * 2. A 503 rotated to the next KEY. Verified against the live API that a 503 is
 *    model-scoped, not key-scoped: on one key in one second,
 *    gemini-3.1-flash-lite returned 503 while five other models returned 200.
 *    Rotating keys fired more doomed requests into an overloaded model AND
 *    sidelined healthy keys.
 */
const fs = require('fs');
const path = require('path');
const { MODEL_CHAINS } = require('../constants/modelChains');

const ROOT = path.resolve(__dirname, '..', '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const worker = read('cloudflare/ai-router/src/index.js');
const proxy = read('netlify/functions/ai-proxy.js');

/** Measured free-tier RPD per project. */
const SCARCE = ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3-flash-preview'];

const chainsIn = (src) => {
  const block = src.match(/MODEL_CHAINS\s*=\s*\{([\s\S]*?)\n\s*\};/);
  if (!block) return null;
  const out = {};
  for (const m of block[1].matchAll(/(\w+):\s*\[([^\]]+)\]/g)) {
    out[m[1]] = m[2].split(',').map((x) => x.trim().replace(/^'|'$/g, '')).filter(Boolean);
  }
  return out;
};

describe('model chains agree across all three runtimes', () => {
  it('the worker and the proxy carry the same chains as src/', () => {
    for (const src of [worker, proxy]) {
      const chains = chainsIn(src);
      expect(chains).not.toBeNull();
      expect(Object.keys(chains).sort()).toEqual(Object.keys(MODEL_CHAINS).sort());
      for (const name of Object.keys(MODEL_CHAINS)) {
        expect(chains[name]).toEqual(MODEL_CHAINS[name]);
      }
    }
  });

  it('no text chain floors on a 20-RPD model, in any runtime', () => {
    for (const src of [worker, proxy]) {
      const chains = chainsIn(src);
      for (const [name, chain] of Object.entries(chains)) {
        if (name === 'vision') continue;
        expect(SCARCE).not.toContain(chain[chain.length - 1]);
      }
    }
  });
});

describe('503 is handled as a model outage in both server runtimes', () => {
  it('the worker abandons the model instead of walking the key ring', () => {
    expect(worker).toMatch(/isModelScoped\(resp\.status\)\)\s*break/);
    expect(worker).toMatch(/isModelScoped\s*=\s*\(status\)\s*=>\s*status\s*>=\s*500/);
  });

  it('the proxy abandons the model and does not cool the key on a 5xx', () => {
    expect(proxy).toMatch(/resp\.status\s*>=\s*500/);
    expect(proxy).toMatch(/modelDown\s*=\s*true/);
  });
});

describe('a key keeps serving models it still has quota for', () => {
  it('both runtimes cool the (key, model) pair on 429, not the whole key', () => {
    // Quota is per model per project: a key out of flash-lite still has all
    // 14,400 of its Gemma budget.
    expect(worker).toMatch(/coolPair\(pairCooldown, keyIdx, m/);
    expect(worker).toMatch(/pairIsCooling\(pairCooldown, keyIdx, m, now\)\)\s*continue/);
    expect(proxy).toMatch(/modelKeyCooldown\.set\(`\$\{keyIdx\}:\$\{m\}`/);
    expect(proxy).toMatch(/modelKeyCooldown\.get\(`\$\{keyIdx\}:\$\{m\}`\)/);
  });

  it('skipping a cooled pair costs no attempt in the worker', () => {
    // `spent` only increments on a real request, so a fully-cooled model falls
    // through to the next model with zero upstream calls.
    expect(worker).toMatch(/spent\s*<\s*perModelKeys/);
    expect(worker).toMatch(/continue;\s*\n\s*spent\+\+/);
  });
});

describe('Gemma is skipped when the prompt cannot fit its 16K TPM', () => {
  it('is guarded in both server runtimes', () => {
    expect(worker).toMatch(/isGemma\(m\)\s*&&\s*payloadChars\s*>\s*GEMMA_MAX_CHARS/);
    expect(proxy).toMatch(/m\.startsWith\('gemma-'\)\s*&&\s*payloadChars\s*>\s*48_000/);
  });

  it('never strips the whole chain', () => {
    expect(worker).toMatch(/if \(usable\.length\) models = usable/);
    expect(proxy).toMatch(/if \(usableModels\.length\) models = usableModels/);
  });
});
