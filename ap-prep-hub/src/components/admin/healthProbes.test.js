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
