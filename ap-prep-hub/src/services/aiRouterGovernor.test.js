/**
 * @jest-environment node
 */
/**
 * The router's load-adaptive limits and the failure modes they replaced.
 *
 * Free Gemini capacity is a fixed daily pool, so the Governor can only decide
 * how it is shared: nobody is limited when the site is quiet, heavy users are
 * trimmed toward an equal share when it is busy, and the site as a whole is
 * held to a per-minute ceiling when it is slammed.
 *
 * The integration half drives the real fetch handler with a mocked Google and
 * a mocked KV, for the three ways the old router fell over under load:
 *   - a KV write limit turned one good answer into up to 55 Gemini calls and
 *     a 502, because the failed cache write was caught as an upstream error;
 *   - a KV read or quota-counter failure escaped fetch() entirely;
 *   - one slow project (61 s for five tokens, measured) held the whole request
 *     until the client gave up, with ten idle keys never tried.
 */
const fs = require('fs');
const path = require('path');
// Jest 27's node environment does not expose Node's fetch classes or WebCrypto,
// so the worker gets them handed in explicitly (undici needs web streams first).
Object.assign(global, {
  ReadableStream: require('stream/web').ReadableStream,
  WritableStream: require('stream/web').WritableStream,
  TransformStream: require('stream/web').TransformStream,
  TextEncoder: require('util').TextEncoder,
  TextDecoder: require('util').TextDecoder,
  MessagePort: require('worker_threads').MessagePort,
  MessageChannel: require('worker_threads').MessageChannel,
  Blob: require('buffer').Blob,
});
const { Request, Response } = require('undici');
const { webcrypto } = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..');
const workerSrc = fs.readFileSync(path.join(ROOT, 'cloudflare/ai-router/src/index.js'), 'utf8');

// Same approach as aiRouterAuth.test.js: the worker is import-free ESM, so it
// runs as a function body once the module syntax is stripped.
const loadWorker = ({ abortAfter = (ms) => ms } = {}) => {
  const body = workerSrc
    .replace(/^export default \{/m, 'const __default = {')
    .replace(/^export /gm, '');
  // Stand-in for AbortSignal.timeout so a test can shrink the 25 s attempt
  // ceiling instead of waiting it out (Jest 27 cannot fake Node's timers).
  const AbortSignalShim = {
    timeout: (ms) => {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(Object.assign(new Error('timed out'), { name: 'TimeoutError' })), abortAfter(ms));
      if (t.unref) t.unref();
      return c.signal;
    },
  };
  // eslint-disable-next-line no-new-func
  return new Function('Request', 'Response', 'crypto', 'AbortSignal', `${body}
    return { worker: __default, GovernorState, Governor, fairCap, governorConfig, GOVERNOR_DEFAULTS,
             walkBudgetMs, isCacheable, pacificDay };`)(Request, Response, webcrypto, AbortSignalShim);
};

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
// 10:00 PDT, 14 hours before the Pacific-midnight quota reset.
const T0 = Date.parse('2026-10-24T17:00:00Z');

describe('fairCap', () => {
  const { fairCap } = loadWorker();

  it('caps nobody when total use fits the budget', () => {
    expect(fairCap([{ used: 5, weight: 1 }, { used: 10, weight: 1 }], 100)).toBe(Infinity);
  });

  it('trims only the heavy user, leaving light users whole', () => {
    // 1 + 1 + min(10, c) = 6  ->  c = 4
    expect(fairCap([{ used: 1, weight: 1 }, { used: 1, weight: 1 }, { used: 10, weight: 1 }], 6)).toBe(4);
  });

  it('splits evenly when everyone wants more than their share', () => {
    expect(fairCap([{ used: 50, weight: 1 }, { used: 50, weight: 1 }], 20)).toBe(10);
  });

  it('gives a lower-weight caller (a guest) a proportionally smaller share', () => {
    // 1 * c + 0.5 * c = 30  ->  c = 20; the guest's share is 10
    expect(fairCap([{ used: 100, weight: 1 }, { used: 100, weight: 0.5 }], 30)).toBe(20);
  });
});

describe('GovernorState', () => {
  const { GovernorState, GOVERNOR_DEFAULTS } = loadWorker();
  const fresh = (cfg = {}) => new GovernorState({ ...GOVERNOR_DEFAULTS, ...cfg });

  it('lets one student use up to HOURLY_MAX when the site is quiet', () => {
    const g = fresh({ hourlyMax: 10, burstPerMinute: 100 });
    for (let i = 0; i < 10; i++) expect(g.admit({ who: 'u:a' }, T0 + i * 1000).ok).toBe(true);
    const no = g.admit({ who: 'u:a' }, T0 + 11000);
    expect(no).toMatchObject({ ok: false, scope: 'share' });
    // The first hit ages out an hour after it was made.
    expect(no.retryAfter).toBe(Math.ceil((T0 + HOUR - (T0 + 11000)) / 1000));
  });

  it('tightens the share as load rises, but never below HOURLY_MIN', () => {
    // 1,400 left over 14 hours = 100 an hour for the whole site.
    const g = fresh({ dailyCapacity: 1400, hourlyMax: 60, hourlyMin: 6, burstPerMinute: 1000, rpmCapacity: 100000 });
    expect(g.capFor(false, T0)).toBe(60);
    // Fifty students each used 20 this hour: 1,000 against a budget of ~93.
    for (let s = 0; s < 50; s++) {
      for (let i = 0; i < 20; i++) g.admit({ who: `u:${s}` }, T0 + i * 1000);
    }
    const later = T0 + 30 * 1000 + 5000; // past the cap cache
    expect(g.capFor(false, later)).toBe(6);
    expect(g.admit({ who: 'u:0' }, later)).toMatchObject({ ok: false, scope: 'share' });
    // A newcomer still gets in: the floor is per student, not shared.
    expect(g.admit({ who: 'u:new' }, later).ok).toBe(true);
  });

  it('leaves light users alone while trimming a heavy one', () => {
    const g = fresh({ dailyCapacity: 700, hourlyMax: 60, hourlyMin: 1, burstPerMinute: 1000, rpmCapacity: 100000 });
    // Budget ~50/hour. Ten light users at 2, one heavy user at 40: total 60.
    for (let s = 0; s < 10; s++) for (let i = 0; i < 2; i++) g.admit({ who: `u:light${s}` }, T0 + i);
    for (let i = 0; i < 40; i++) g.admit({ who: 'u:heavy' }, T0 + i);
    const later = T0 + 6000;
    const cap = g.capFor(false, later);
    expect(cap).toBeGreaterThan(2);       // light users are below it
    expect(cap).toBeLessThan(40);         // the heavy user is above it
    expect(g.admit({ who: 'u:light0' }, later).ok).toBe(true);
    expect(g.admit({ who: 'u:heavy' }, later)).toMatchObject({ ok: false, scope: 'share' });
  });

  it('gives guests a smaller share of the same pool', () => {
    const g = fresh();
    expect(g.capFor(true, T0)).toBe(GOVERNOR_DEFAULTS.guestHourlyMax);
    expect(g.capFor(true, T0)).toBeLessThan(g.capFor(false, T0));
  });

  it('stops a one-minute burst without touching the hourly share', () => {
    const g = fresh({ burstPerMinute: 3 });
    for (let i = 0; i < 3; i++) expect(g.admit({ who: 'u:a' }, T0 + i * 100).ok).toBe(true);
    const no = g.admit({ who: 'u:a' }, T0 + 500);
    expect(no).toMatchObject({ ok: false, scope: 'burst' });
    expect(no.retryAfter).toBeLessThanOrEqual(60);
    expect(g.admit({ who: 'u:a' }, T0 + MIN + 1).ok).toBe(true);
  });

  it('holds the whole site to RPM_CAPACITY with a seconds-long wait', () => {
    const g = fresh({ rpmCapacity: 5 });
    for (let s = 0; s < 5; s++) expect(g.admit({ who: `u:${s}` }, T0).ok).toBe(true);
    const no = g.admit({ who: 'u:late' }, T0 + 1000);
    expect(no).toMatchObject({ ok: false, scope: 'busy' });
    expect(no.retryAfter).toBeGreaterThanOrEqual(1);
    expect(no.retryAfter).toBeLessThanOrEqual(65);
  });

  it('gives each guest on a shared IP their own share, under one IP ceiling', () => {
    const g = fresh({ guestHourlyMax: 2, guestHourlyMin: 1, groupHourlyMax: 5, burstPerMinute: 100 });
    // Three classmates behind one school IP, two calls each: all admitted.
    let admitted = 0;
    for (const kid of ['a', 'b', 'c']) {
      for (let i = 0; i < 2; i++) {
        if (g.admit({ who: `g:1.2.3.4:${kid}`, guest: true, group: 'ip:1.2.3.4' }, T0 + admitted).ok) admitted++;
      }
    }
    expect(admitted).toBe(5);  // the sixth hit the IP ceiling
    expect(g.admit({ who: 'g:1.2.3.4:d', guest: true, group: 'ip:1.2.3.4' }, T0 + 10)).toMatchObject({ ok: false, scope: 'group' });
    expect(g.admit({ who: 'g:5.6.7.8:e', guest: true, group: 'ip:5.6.7.8' }, T0 + 10).ok).toBe(true);
  });

  it('starts a fresh pool at midnight Pacific', () => {
    const g = fresh({ dailyCapacity: 10 });
    g.admit({ who: 'u:a' }, T0);
    expect(g.usedToday).toBe(1);
    g.admit({ who: 'u:a' }, Date.parse('2026-10-25T08:00:01Z')); // 00:00:01 PDT next day
    expect(g.usedToday).toBe(1);
  });

  it('survives a restart with today\'s spend and the dead pairs', () => {
    const g = fresh();
    for (let i = 0; i < 7; i++) g.admit({ who: `u:${i}` }, T0);
    g.report([{ pair: '3:gemini-3.1-flash-lite', until: T0 + HOUR }], T0);
    const back = fresh();
    back.restore(JSON.parse(JSON.stringify(g.snapshot(T0))), T0 + 1000);
    expect(back.usedToday).toBe(7);
    expect(back.coolingList(T0 + 1000)).toEqual([['3:gemini-3.1-flash-lite', T0 + HOUR]]);
    // A snapshot from yesterday does not eat today's pool.
    const tomorrow = fresh();
    tomorrow.restore(g.snapshot(T0), Date.parse('2026-10-25T17:00:00Z'));
    expect(tomorrow.usedToday).toBe(0);
  });

  it('reports pressure from 0 (idle) toward 1 (spending as fast as the pool lasts)', () => {
    const g = fresh({ dailyCapacity: 1400, burstPerMinute: 1000, rpmCapacity: 100000, hourlyMax: 1000 });
    expect(g.pressure(T0)).toBe(0);
    for (let i = 0; i < 200; i++) g.admit({ who: `u:${i % 20}` }, T0 + i);
    expect(g.pressure(T0 + 6000)).toBe(1);
  });
});

describe('governorConfig', () => {
  const { governorConfig, GOVERNOR_DEFAULTS } = loadWorker();
  it('reads wrangler vars and falls back on anything missing or junk', () => {
    const cfg = governorConfig({ DAILY_CAPACITY: '50000', HOURLY_MIN: 'abc' });
    expect(cfg.dailyCapacity).toBe(50000);
    expect(cfg.hourlyMin).toBe(GOVERNOR_DEFAULTS.hourlyMin);
  });

  it('matches what wrangler.jsonc ships', () => {
    const wrangler = fs.readFileSync(path.join(ROOT, 'cloudflare/ai-router/wrangler.jsonc'), 'utf8');
    for (const name of ['DAILY_CAPACITY', 'RPM_CAPACITY', 'HOURLY_MAX', 'HOURLY_MIN', 'GUEST_HOURLY_MAX', 'GUEST_HOURLY_MIN', 'BURST_PER_MINUTE', 'GROUP_HOURLY_MAX']) {
      expect(wrangler).toMatch(new RegExp(`"${name}":\\s*"\\d+"`));
    }
    expect(wrangler).toMatch(/"class_name":\s*"Governor"/);
    expect(wrangler).toMatch(/"new_sqlite_classes":\s*\["Governor"\]/);
  });
});

describe('router handler under failure', () => {
  const realFetch = global.fetch;
  afterEach(() => { global.fetch = realFetch; });

  const ok = (text = 'hi') => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
  const keys = Object.fromEntries(Array.from({ length: 11 }, (_, i) => [`GEMINI_API_KEY${i ? `_${i + 1}` : ''}`, `k${i + 1}`]));
  const request = (body) => new Request('https://ai.apex-scholar.com/', {
    method: 'POST',
    headers: { origin: 'https://apex-scholar.com', 'cf-connecting-ip': '9.9.9.9', 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'explain osmosis' }] }], task: 'tutorChat', ...body }),
  });
  const ctx = () => {
    const waits = [];
    return { waits, waitUntil: (p) => waits.push(p) };
  };

  it('answers once when the KV cache write fails, instead of re-asking every key', async () => {
    const { worker } = loadWorker();
    const calls = [];
    global.fetch = jest.fn(async (url) => { calls.push(String(url)); return ok(); });
    const env = {
      ...keys,
      ALLOWED_ORIGINS: 'https://apex-scholar.com',
      CACHE: {
        get: async () => null,
        put: async () => { throw new Error('KV put() limit exceeded for the day.'); },
      },
    };
    const c = ctx();
    const res = await worker.fetch(request(), env, c);
    await Promise.all(c.waits);
    expect(res.status).toBe(200);
    expect(calls.filter((u) => u.includes('generativelanguage'))).toHaveLength(1);
  });

  it('still answers when KV reads are failing', async () => {
    const { worker } = loadWorker();
    global.fetch = jest.fn(async () => ok());
    const env = {
      ...keys,
      ALLOWED_ORIGINS: 'https://apex-scholar.com',
      CACHE: { get: async () => { throw new Error('KV get() limit exceeded'); }, put: async () => {} },
    };
    const res = await worker.fetch(request(), env, ctx());
    expect(res.status).toBe(200);
  });

  it('gives up on a hung project and tries the next key', async () => {
    const asked = [];
    const { worker } = loadWorker({ abortAfter: (ms) => { asked.push(ms); return 5; } });
    let n = 0;
    global.fetch = jest.fn((url, init) => {
      n++;
      // The first project never answers on its own; only the abort ends it.
      if (n === 1) return new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(init.signal.reason)));
      return Promise.resolve(ok('second key'));
    });
    const env = { ...keys, ALLOWED_ORIGINS: 'https://apex-scholar.com' };
    const res = await worker.fetch(request(), env, ctx());
    expect(res.status).toBe(200);
    expect(n).toBe(2);
    // Tutor chat gets the interactive ceiling, not the client's whole budget.
    expect(asked[0]).toBe(25000);
  });

  it('refuses with the scope and a real wait once a guest has used their share', async () => {
    const { worker } = loadWorker();
    global.fetch = jest.fn(async () => ok());
    const env = { ...keys, ALLOWED_ORIGINS: 'https://apex-scholar.com', GUEST_HOURLY_MAX: '2', GUEST_HOURLY_MIN: '1' };
    expect((await worker.fetch(request({ guestId: 'abc' }), env, ctx())).status).toBe(200);
    expect((await worker.fetch(request({ guestId: 'abc' }), env, ctx())).status).toBe(200);
    const res = await worker.fetch(request({ guestId: 'abc' }), env, ctx());
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.scope).toBe('share');
    expect(Number(res.headers.get('retry-after'))).toBeGreaterThan(60);
    // A classmate on the same IP is unaffected.
    expect((await worker.fetch(request({ guestId: 'xyz' }), env, ctx())).status).toBe(200);
  });

  it('asks the global Governor when it is bound, and shares what it learned', async () => {
    const { worker, Governor } = loadWorker();
    const store = new Map();
    const gov = new Governor({
      blockConcurrencyWhile: (fn) => fn(),
      storage: { get: async (k) => store.get(k), put: async (k, v) => { store.set(k, v); } },
    }, {});
    const seen = [];
    const GOVERNOR = {
      idFromName: (n) => n,
      get: () => ({ fetch: (url, init) => { seen.push(JSON.parse(init.body).op); return gov.fetch(new Request(url, init)); } }),
    };
    let n = 0;
    global.fetch = jest.fn(async () => {
      n++;
      if (n === 1) return new Response('{"error":{"details":[{"retryDelay":"20s"}]}}', { status: 429 });
      return ok();
    });
    const env = { ...keys, ALLOWED_ORIGINS: 'https://apex-scholar.com', GOVERNOR };
    const c = ctx();
    const res = await worker.fetch(request(), env, c);
    await Promise.all(c.waits);
    expect(res.status).toBe(200);
    expect(seen).toEqual(['admit', 'report']);
    expect(gov.gov.coolingList(Date.now())).toHaveLength(1);
    expect(store.get('snapshot')).toBeTruthy();
  });

  it('caches only answers that repeat across students', () => {
    const { isCacheable } = loadWorker();
    expect(isCacheable('explain', [{}])).toBe(true);
    expect(isCacheable('tutorChat', [{}])).toBe(true);           // a first message
    expect(isCacheable('tutorChat', [{}, {}, {}])).toBe(false);  // a conversation
    expect(isCacheable('frqGrade', [{}])).toBe(false);           // a student's own work
  });

  it('keeps the walk inside the client\'s own deadline', () => {
    const { walkBudgetMs } = loadWorker();
    expect(walkBudgetMs(undefined)).toBe(85000);
    expect(walkBudgetMs(175000)).toBe(175000);
    expect(walkBudgetMs(999999)).toBe(175000);
    expect(walkBudgetMs(1)).toBe(10000);
  });
});

describe('site load for the usage meter', () => {
  const { GovernorState, GOVERNOR_DEFAULTS, worker } = loadWorker();
  const noon = Date.UTC(2026, 10, 7, 20); // midday Pacific, so the hour budget is steady
  const fresh = () => new GovernorState({ ...GOVERNOR_DEFAULTS });
  const hourBudget = (g) => g.hourBudget(noon);

  test('nobody here is load 0', () => {
    expect(fresh().load(noon)).toBe(0);
  });

  test('open tabs and AI users both raise it, AI users far more', () => {
    const visitors = fresh();
    for (let i = 0; i < 100; i++) visitors.heartbeat(`tab${i}xxxxx`, noon);
    const ai = fresh();
    for (let i = 0; i < 100; i++) ai.admit({ who: `u${i}` }, noon);
    expect(visitors.load(noon)).toBeGreaterThan(0);
    expect(ai.load(noon)).toBeGreaterThan(visitors.load(noon));
  });

  test('tops out at 1 when the people here would outrun the pool', () => {
    const g = fresh();
    const needed = Math.ceil(hourBudget(g) / 10) + 5;
    for (let i = 0; i < needed; i++) g.admit({ who: `u${i}` }, noon);
    expect(g.load(noon)).toBe(1);
  });

  test('tabs that stop checking in stop counting, and repeats count once', () => {
    const g = fresh();
    for (let i = 0; i < 3; i++) g.heartbeat('samesession1', noon + i);
    expect(g.stats(noon + 10).online).toBe(1);
    expect(g.stats(noon + 7 * 60 * 1000).online).toBe(0);
  });

  test('stats count who is online; GET /load returns only the load', async () => {
    const env = { ALLOWED_ORIGINS: 'https://apex-scholar.com' };
    const res = await worker.fetch(
      new Request('https://ai.apex-scholar.com/load?s=abcdefgh12345', { headers: { origin: 'https://apex-scholar.com' } }),
      env,
      { waitUntil() {} },
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('access-control-allow-origin')).toBe('https://apex-scholar.com');
    const body = await res.json();
    expect(Object.keys(body)).toEqual(['load']);
    expect(body.load).toBeGreaterThanOrEqual(0);
    expect(body.load).toBeLessThanOrEqual(1);
  });
});
