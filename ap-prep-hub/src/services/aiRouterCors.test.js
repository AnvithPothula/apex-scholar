/**
 * The Cloudflare AI router and the Netlify ai-proxy implement the same contract
 * in two codebases that cannot import each other. They drifted, and the failure
 * mode was total: the worker gated every request on X-App-Token but never
 * listed it in Access-Control-Allow-Headers, so once APP_TOKEN was set the
 * browser rejected the preflight and ALL AI on the deployed site died with
 * "Request header field X-App-Token is not allowed".
 *
 * A CORS policy must allow every header its own code reads.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const worker = read('cloudflare/ai-router/src/index.js');
const proxy = read('netlify/functions/ai-proxy.js');

const allowedHeaders = (src) => {
  const m = src.match(/'Access-Control-Allow-Headers':\s*'([^']+)'/);
  return m ? m[1].split(',').map((h) => h.trim().toLowerCase()) : null;
};
const exposedHeaders = (src) => {
  const m = src.match(/'Access-Control-Expose-Headers':\s*'([^']+)'/);
  return m ? m[1].split(',').map((h) => h.trim().toLowerCase()) : [];
};

describe('AI router CORS', () => {
  it('allows every request header the worker actually reads', () => {
    const allowed = allowedHeaders(worker);
    expect(allowed).not.toBeNull();
    // Only headers read off the incoming REQUEST need to be allow-listed.
    // `resp.headers.get('retry-after')` reads Google's response, which CORS has
    // no opinion about — anchoring on the request object keeps this from firing
    // every time the router inspects an upstream header.
    const readHeaders = [...worker.matchAll(/(?:^|[^.\w])(?:request|req)\.headers\.get\('([a-z0-9-]+)'\)/g)]
      .map((m) => m[1])
      .filter((h) => h !== 'origin'); // Origin is set by the browser, never by us
    expect(readHeaders.length).toBeGreaterThan(0); // the regex must still match something
    readHeaders.forEach((h) => expect(allowed).toContain(h));
  });

  it('allows X-App-Token in both the worker and the Netlify proxy', () => {
    expect(allowedHeaders(worker)).toContain('x-app-token');
    expect(allowedHeaders(proxy)).toContain('x-app-token');
  });

  it('exposes the model header wherever it is set, or the client reads null', () => {
    [['worker', worker], ['proxy', proxy]].forEach(([name, src]) => {
      if (/'X-Apex-Model'/.test(src)) {
        expect({ name, exposed: exposedHeaders(src).includes('x-apex-model') })
          .toEqual({ name, exposed: true });
      }
    });
  });

  it('never falls back to a wildcard origin', () => {
    expect(worker).not.toMatch(/'Access-Control-Allow-Origin':\s*'\*'/);
    expect(proxy).not.toMatch(/'Access-Control-Allow-Origin':\s*'\*'/);
  });
});
