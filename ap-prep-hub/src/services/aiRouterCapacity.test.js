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

describe('task routing agrees across all three runtimes', () => {
  const { TASK_TO_CHAIN } = require('../constants/modelChains');

  const routingIn = (src) => {
    const block = src.match(/TASK_TO_CHAIN\s*=\s*\{([\s\S]*?)\n\s*\};/);
    if (!block) return null;
    const out = {};
    for (const m of block[1].matchAll(/(\w+):\s*'(\w+)'/g)) out[m[1]] = m[2];
    return out;
  };

  it('maps every task to the same chain everywhere', () => {
    for (const src of [worker, proxy]) {
      const routing = routingIn(src);
      expect(routing).not.toBeNull();
      expect(routing).toEqual(TASK_TO_CHAIN);
    }
  });

  it('never lets Gemma LEAD a chain', () => {
    // Measured twice against the app's own prompts:
    //   mcqGenerate (JSON):  gemma-4-31b-it 2/3 parsed, flash-lite 3/3
    //   explain     (prose): gemma-4-31b-it 0/3 clean,  flash-lite 3/3
    // Same failure both times: given an instruction-list prompt it restates the
    // task as a plan and calls that the answer. Every prompt in this app is an
    // instruction list, so Gemma leading anything ships slop.
    for (const [name, chain] of Object.entries(MODEL_CHAINS)) {
      expect([name, chain[0].startsWith('gemma-')]).toEqual([name, false]);
    }
  });

  it('still keeps Gemma reachable as a tail', () => {
    // Its 14,400 RPD is the only thing standing between a flash-lite exhaustion
    // and a hard failure, and a 2-in-3 answer beats none.
    for (const name of ['bulk', 'interactive', 'verify']) {
      expect(MODEL_CHAINS[name].some((m) => m.startsWith('gemma-'))).toBe(true);
    }
  });

  it('keeps live tutor chat on the low-latency chain', () => {
    expect(TASK_TO_CHAIN.tutorChat).toBe('interactive');
  });
});

describe('rate-limit signalling', () => {
  // The worker is ESM inside a CommonJS package and jest-resolve rejects a
  // data: URL import, so the function is sliced out of the source and evaluated
  // on its own — consistent with how the rest of this file treats the worker as
  // text. Extraction failing is a test failure, not a silent skip.
  const retryDelaySeconds = (() => {
    const start = worker.indexOf('export function retryDelaySeconds');
    if (start === -1) throw new Error('retryDelaySeconds not found in the worker');
    let depth = 0;
    let end = -1;
    for (let i = worker.indexOf('{', start); i < worker.length; i++) {
      if (worker[i] === '{') depth++;
      else if (worker[i] === '}' && --depth === 0) { end = i + 1; break; }
    }
    if (end === -1) throw new Error('retryDelaySeconds body is unbalanced');
    // eslint-disable-next-line no-new-func
    return new Function(`${worker.slice(start, end).replace('export ', '')}
      return retryDelaySeconds;`)();
  })();

  it('reads the delay Google actually sends', () => {
    // Google puts this in the BODY as a RetryInfo detail, not in a Retry-After
    // header. The worker read the header, always got NaN, and fell back to a
    // flat 60s — so the countdown shown to a student was never the real wait.
    const body = JSON.stringify({
      error: {
        code: 429,
        details: [
          { '@type': 'type.googleapis.com/google.rpc.RetryInfo', retryDelay: '26s' },
        ],
      },
    });
    expect(retryDelaySeconds(null, body)).toBe(26);
  });

  it('prefers a Retry-After header when one exists', () => {
    expect(retryDelaySeconds('30', '{"retryDelay":"5s"}')).toBe(30);
  });

  it('rounds a fractional delay up rather than down', () => {
    // Waiting 1s on a 1.5s delay just earns a second 429.
    expect(retryDelaySeconds(null, '"retryDelay": "1.5s"')).toBe(2);
  });

  it('treats a daily-quota 429 as an hour, not a minute', () => {
    // A per-day quota clears at midnight Pacific. Telling a student to retry in
    // 60 seconds sends them into a loop of identical failures.
    expect(retryDelaySeconds(null, 'GenerateRequestsPerDayPerProjectPerModel')).toBe(3600);
  });

  it('returns 0 when the response says nothing about timing', () => {
    expect(retryDelaySeconds(null, '{}')).toBe(0);
    expect(retryDelaySeconds(null, '')).toBe(0);
  });

  it('answers 429 with a retryAfter, not a bare 502', () => {
    // "Busy, wait 26 seconds" and "broken" need different words in front of a
    // student, and only the status code lets the client tell them apart.
    expect(worker).toMatch(/status: 429|429,\s*$|\b429\b/m);
    expect(worker).toMatch(/retryAfter/);
    expect(worker).toMatch(/'Retry-After'/);
  });
});

describe('the client can actually read the wait', () => {
  it('exposes Retry-After through CORS in both runtimes', () => {
    // A Retry-After the browser hides from JS is the same as no Retry-After:
    // res.headers.get() returns null and the countdown invents 60 seconds.
    for (const src of [worker, proxy]) {
      const m = /Access-Control-Expose-Headers':\s*'([^']+)'/.exec(src);
      expect(m).not.toBeNull();
      expect(m[1]).toMatch(/Retry-After/);
    }
  });

  it('also puts the number in the JSON body', () => {
    // Survives any hop that strips headers.
    for (const src of [worker, proxy]) {
      expect(src).toMatch(/retryAfter/);
    }
  });
});
