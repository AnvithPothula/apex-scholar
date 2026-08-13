import { interpretProbe, HEALTH_PROBES } from './healthProbes';

describe('interpretProbe', () => {
  it('treats a non-JSON response as "function not running", never as healthy', () => {
    // The CRA dev server answers unknown paths with index.html and HTTP 200.
    // Trusting res.ok would report every function as OK under `npm start`.
    const v = interpretProbe({ status: 200, contentType: 'text/html', payload: null }, [200]);
    expect(v.ok).toBe(false);
    expect(v.detail).toMatch(/netlify dev/);
  });

  it('accepts the statuses a probe declares healthy', () => {
    // ai-proxy answers 400 to an empty body only once it has found its keys,
    // so 400 is the pass signal there — not a failure.
    expect(interpretProbe({ status: 400, contentType: 'application/json', payload: {} }, [400]).ok).toBe(true);
    expect(interpretProbe({ status: 200, contentType: 'application/json', payload: {} }, [200, 400]).ok).toBe(true);
  });

  it("surfaces the function's own error text instead of a bare status", () => {
    const v = interpretProbe(
      { status: 503, contentType: 'application/json', payload: { error: 'SMTP2GO_API_KEY or MAIL_FROM is not set.' } },
      [200, 400]
    );
    expect(v.ok).toBe(false);
    expect(v.detail).toBe('SMTP2GO_API_KEY or MAIL_FROM is not set.');
  });

  it('falls back to the status when the body carries no reason', () => {
    expect(interpretProbe({ status: 500, contentType: 'application/json', payload: null }, [200]))
      .toEqual({ ok: false, detail: 'HTTP 500' });
  });
});

describe('HEALTH_PROBES', () => {
  it('never declares a probe that could send mail or spend AI credit', () => {
    // A POST body other than '{}' could carry real recipients or a real
    // prompt. This is the guard against someone "improving" a probe later.
    HEALTH_PROBES.forEach((p) => {
      expect(['GET', 'POST']).toContain(p.method);
      if (p.method === 'POST') expect(p.body).toBe('{}');
      expect(p.healthy.length).toBeGreaterThan(0);
    });
  });
});

describe('diagnose', () => {
  const { diagnose, interpretProbe } = require('./healthProbes');

  it('does not blame missing Gemini keys for a 401', () => {
    // Live failure: ai-proxy returned 401 Unauthorized and the panel said
    // "Needs GEMINI_API_KEYS". The keys were fine; the app token was not.
    const d = diagnose('ai-proxy', 401, 'Unauthorized');
    expect(d).toMatch(/App-token gate/);
    expect(d).toMatch(/BUILD time/);
    expect(d).not.toMatch(/GEMINI_API_KEYS/);
  });

  it('separates the two different 401s ai-proxy can return', () => {
    expect(diagnose('ai-proxy', 401, 'Authentication required')).toMatch(/Firebase ID token/);
    expect(diagnose('ai-proxy', 401, 'Unauthorized')).toMatch(/REACT_APP_AI_PROXY_APP_TOKEN/);
  });

  it('names a 404 as an undeployed function', () => {
    expect(diagnose('admin-stats', 404)).toMatch(/not deployed/);
  });

  it('stays quiet when it has nothing to add', () => {
    expect(diagnose('admin-stats', 500, 'boom')).toBeNull();
  });

  it('keeps the static hint alongside the diagnosis', () => {
    const r = interpretProbe(
      { status: 401, contentType: 'application/json', payload: { error: 'Unauthorized' } },
      [400],
      'ai-proxy'
    );
    expect(r.ok).toBe(false);
    expect(r.detail).toBe('Unauthorized');
    expect(r.diagnosis).toMatch(/App-token/);
    expect(r.hint).toBeUndefined(); // the static hint comes from the probe, not from here
  });
});

describe('the probe authenticates itself', () => {
  const fs = require('fs');
  const path = require('path');
  const panel = fs.readFileSync(
    path.resolve(__dirname, '..', 'DeveloperSettings.jsx'), 'utf8');

  it('sends X-App-Token, not just a Firebase bearer token', () => {
    // ai-proxy's isAuthorized() accepts X-App-Token OR a bearer equal to the
    // app token. Sending a Firebase ID token as the bearer is neither, so the
    // panel 401'd itself and reported an outage that did not exist.
    expect(panel).toMatch(/'X-App-Token': appToken/);
    expect(panel).toMatch(/REACT_APP_AI_PROXY_APP_TOKEN/);
  });
});
