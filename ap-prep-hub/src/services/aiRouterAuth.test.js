/**
 * The AI router used to accept anyone who could read the app token out of
 * main.<hash>.js — which is everyone, because CRA inlines it. The fix is a
 * Firebase ID token, and the ways that fix goes wrong are all silent:
 *
 *   - drop the aud/iss checks and a genuinely Google-signed token minted for
 *     SOMEONE ELSE'S Firebase project passes (the signature is valid, it just
 *     isn't ours);
 *   - lose FIREBASE_PROJECT_ID from the worker config and every signed-in
 *     student drops to the guest tier, i.e. practice tests start 403-ing;
 *   - let the guest allowlists in the two runtimes drift and the Netlify proxy
 *     quietly stays the open door the worker just closed.
 *
 * None of those show up in a build. They show up in the Cloudflare bill.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const workerSrc = read('cloudflare/ai-router/src/index.js');
const proxySrc = read('netlify/functions/ai-proxy.js');
const wranglerSrc = read('cloudflare/ai-router/wrangler.jsonc');

// The worker is import-free ESM, so it evaluates as a plain function body once
// the module syntax is stripped. That gets the REAL verifyClaims under test
// rather than a copy that can drift.
const evalWorker = () => {
  const body = workerSrc
    .replace(/^export default \{/m, 'const __default = {')
    .replace(/^export /gm, '');
  // eslint-disable-next-line no-new-func
  return new Function(`${body}\nreturn { verifyClaims, GUEST_TASKS };`)();
};

const { verifyClaims, GUEST_TASKS } = evalWorker();

const PROJECT = 'ai-study-helper-f2f24';
const NOW = 1700000000;
const header = () => ({ alg: 'RS256', kid: 'somekid' });
const claims = (over = {}) => ({
  sub: 'uid-123',
  aud: PROJECT,
  iss: `https://securetoken.google.com/${PROJECT}`,
  exp: NOW + 3600,
  iat: NOW - 60,
  ...over,
});

describe('verifyClaims', () => {
  it('accepts a well-formed Firebase ID token for this project', () => {
    expect(verifyClaims(header(), claims(), PROJECT, NOW)).toBeNull();
  });

  it.each([
    ['wrong audience', header(), claims({ aud: 'some-other-firebase-project' })],
    ['wrong issuer', header(), claims({ iss: 'https://securetoken.google.com/evil' })],
    ['expired', header(), claims({ exp: NOW - 120 })],
    ['issued in the future', header(), claims({ iat: NOW + 600 })],
    ['no subject', header(), claims({ sub: '' })],
    ['bad header', { alg: 'none' }, claims()],
    ['bad header', { alg: 'HS256', kid: 'k' }, claims()],
    ['bad header', { alg: 'RS256' }, claims()], // no kid -> no key to check against
  ])('rejects %s', (reason, h, p) => {
    expect(verifyClaims(h, p, PROJECT, NOW)).toBe(reason);
  });

  it('refuses everything when no project id is configured', () => {
    // The failure mode that matters: an unset FIREBASE_PROJECT_ID must not make
    // aud/iss vacuously true and turn the check into a rubber stamp.
    expect(verifyClaims(header(), claims(), '', NOW)).toBe('no project id configured');
    expect(verifyClaims(header(), claims(), undefined, NOW)).toBe('no project id configured');
  });

  it('tolerates a minute of clock skew in both directions', () => {
    expect(verifyClaims(header(), claims({ exp: NOW - 30 }), PROJECT, NOW)).toBeNull();
    expect(verifyClaims(header(), claims({ iat: NOW + 30 }), PROJECT, NOW)).toBeNull();
  });
});

describe('guest tier', () => {
  const guestTasks = (src) => {
    const m = src.match(/GUEST_TASKS = new Set\(\[([^\]]*)\]\)/);
    return m ? m[1].split(',').map((s) => s.trim().replace(/^'|'$/g, '')).sort() : null;
  };

  it('allows the tutor and nothing else', () => {
    expect(GUEST_TASKS.has('tutorChat')).toBe(true);
    expect(GUEST_TASKS.has('')).toBe(true);
    // The expensive chains. solver is `vision`, frqGrade is `premium`.
    for (const task of ['solver', 'frqGrade', 'practiceTest', 'mcqGenerate', 'lessonTeach']) {
      expect(GUEST_TASKS.has(task)).toBe(false);
    }
  });

  it('is the same list in both runtimes', () => {
    expect(guestTasks(proxySrc)).toEqual(guestTasks(workerSrc));
  });

  it('refuses images from guests', () => {
    // An image forces the `vision` chain regardless of task, so a task-only
    // check would leave the most expensive pool wide open.
    expect(workerSrc).toMatch(/!GUEST_TASKS\.has\(task\) \|\| hasImage/);
    expect(proxySrc).toMatch(/!GUEST_TASKS\.has\(task\) \|\| hasImage/);
  });
});

describe('worker request order', () => {
  it('checks identity before serving from cache', () => {
    // A refused caller must not get a free answer off someone else's cache
    // entry. Source order is the only thing enforcing this.
    const gate = workerSrc.indexOf("Who is calling, and may they");
    const cacheRead = workerSrc.indexOf('const hit = await env.CACHE.get(cacheKey)');
    expect(gate).toBeGreaterThan(-1);
    expect(cacheRead).toBeGreaterThan(gate);
  });
});

describe('wrangler config', () => {
  it('declares FIREBASE_PROJECT_ID as a var, not a secret', () => {
    // As a secret it could be missing on a fresh deploy and every signed-in
    // user would silently degrade to the guest tier. In vars it ships with the
    // code that reads it.
    expect(wranglerSrc).toMatch(/"FIREBASE_PROJECT_ID":\s*"[a-z0-9-]+"/);
  });
});
