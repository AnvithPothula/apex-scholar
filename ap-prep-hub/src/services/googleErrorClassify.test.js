/**
 * A 503 UNAVAILABLE is Google's capacity for a MODEL, shared by every key in
 * the account. Verified directly against the live API: on one key, in one
 * second, gemini-3.1-flash-lite returned 503 while gemma-4-31b-it,
 * gemini-3.5-flash-lite, gemini-2.5-flash, gemini-3.5-flash and
 * gemini-3.6-flash all returned 200.
 *
 * The old code called markCurrentKeyFailed(30) on it and rotated, so four
 * retries sidelined four healthy keys over an outage that had nothing to do
 * with the keys — and fired four more doomed requests into an overloaded model.
 */

// Mirrors geminiService._classifyGoogleError. Kept standalone because importing
// geminiService pulls in firebase, which jsdom cannot load (TextEncoder).
const classify = (status, responseText = '') => {
  const text = String(responseText || '').toLowerCase();
  const isRateLimit =
    status === 429 ||
    text.includes('quota') ||
    text.includes('rate limit') ||
    text.includes('resource exhausted');
  const isModelOutage = status >= 500;
  const shouldRetry =
    isRateLimit || isModelOutage || status === 403 || status === 408 || status === 409;
  return { isRateLimit, isModelOutage, shouldRetry };
};

describe('Google error classification', () => {
  it('treats 503 as a model outage, not a key fault', () => {
    const c = classify(503, '{"error":{"code":503,"status":"UNAVAILABLE"}}');
    expect(c.isModelOutage).toBe(true);
    expect(c.isRateLimit).toBe(false);
    expect(c.shouldRetry).toBe(true);
  });

  it('treats every 5xx the same way', () => {
    for (const s of [500, 502, 503, 504]) {
      expect(classify(s).isModelOutage).toBe(true);
    }
  });

  it('keeps 429 key-scoped so key rotation still helps', () => {
    const c = classify(429, 'Resource has been exhausted');
    expect(c.isRateLimit).toBe(true);
    expect(c.isModelOutage).toBe(false);
  });

  it('does not mistake a 403 referrer block for a model outage', () => {
    // Referrer-restricted keys return 403; that IS key-scoped.
    const c = classify(403, 'Requests from referer <empty> are blocked.');
    expect(c.isModelOutage).toBe(false);
    expect(c.shouldRetry).toBe(true);
  });

  it('still catches quota wording behind a non-429 status', () => {
    expect(classify(400, 'Quota exceeded for model').isRateLimit).toBe(true);
  });

  it('does not retry a genuine bad request', () => {
    expect(classify(400, 'Invalid JSON payload').shouldRetry).toBe(false);
  });
});
