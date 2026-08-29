import {
  waitSecondsFor,
  formatWait,
  parseRetrySpec,
  retryAfterFrom,
  MAX_WAIT_SECONDS,
} from './aiRetry';

describe('waitSecondsFor', () => {
  it('trusts the server over the backoff guess', () => {
    // Google sends a real RetryInfo delay. Backing off 240s when the server
    // said 26 leaves a student sitting there for no reason.
    expect(waitSecondsFor(5, 26)).toBe(26);
  });

  it('backs off exponentially when the server said nothing', () => {
    expect([1, 2, 3, 4].map((n) => waitSecondsFor(n))).toEqual([15, 30, 60, 120]);
  });

  it('caps the wait so the number stays actionable', () => {
    expect(waitSecondsFor(99)).toBe(MAX_WAIT_SECONDS);
    expect(waitSecondsFor(1, 99999)).toBe(MAX_WAIT_SECONDS);
  });

  it('treats junk as a first attempt', () => {
    expect(waitSecondsFor(undefined, undefined)).toBe(15);
    expect(waitSecondsFor(0, -5)).toBe(15);
  });
});

describe('formatWait', () => {
  it('reads as time, not as a seconds count', () => {
    expect(formatWait(45)).toBe('45s');
    expect(formatWait(120)).toBe('2m');
    expect(formatWait(150)).toBe('2m 30s');
    expect(formatWait(0)).toBe('now');
  });
});

describe('parseRetrySpec', () => {
  it('parses the fence spec the tutor emits', () => {
    expect(parseRetrySpec('attempt=2 retryAfter=45 reason=502'))
      .toEqual({ attempt: 2, retryAfter: 45, reason: '502' });
  });

  it('keeps reason a string even when it is all digits', () => {
    expect(parseRetrySpec('reason=429').reason).toBe('429');
  });

  it('survives an empty or malformed spec', () => {
    expect(parseRetrySpec('')).toEqual({});
    expect(parseRetrySpec(null)).toEqual({});
  });
});

describe('retryAfterFrom', () => {
  it('reads a RateLimitError thrown by the proxy client', () => {
    const e = Object.assign(new Error('busy'), { isRateLimit: true, retryAfter: 26 });
    expect(retryAfterFrom(e)).toBe(26);
  });

  it('recognises a 429 with no number and falls back', () => {
    expect(retryAfterFrom({ status: 429 })).toBe(60);
  });

  it('recognises a rate limit by message when nothing is tagged', () => {
    expect(retryAfterFrom(new Error('Resource exhausted: quota exceeded'))).toBe(60);
  });

  it('returns null for a failure that is not a rate limit', () => {
    // The caller must show a real error here, not a countdown to nothing.
    expect(retryAfterFrom(new Error('network down'))).toBeNull();
    expect(retryAfterFrom(null)).toBeNull();
  });
});
