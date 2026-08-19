import { waitSecondsFor, parseRetrySpec, formatWait } from './RetryCountdown';

describe('waitSecondsFor', () => {
  it('backs off as failures repeat', () => {
    // A static "try again in 60 seconds" was wrong by the 5th consecutive 502.
    expect(waitSecondsFor(1)).toBe(15);
    expect(waitSecondsFor(2)).toBe(30);
    expect(waitSecondsFor(3)).toBe(60);
    expect(waitSecondsFor(4)).toBe(120);
  });

  it('caps the wait so the number stays actionable', () => {
    expect(waitSecondsFor(99)).toBe(600);
  });

  it('prefers a server-supplied retry-after over the backoff curve', () => {
    expect(waitSecondsFor(5, 45)).toBe(45);
    expect(waitSecondsFor(1, 3600)).toBe(600); // still capped
  });

  it('treats a missing or nonsense attempt as the first failure', () => {
    expect(waitSecondsFor(undefined)).toBe(15);
    expect(waitSecondsFor(0)).toBe(15);
    expect(waitSecondsFor(NaN)).toBe(15);
  });

  it('ignores a non-positive retryAfter', () => {
    expect(waitSecondsFor(2, 0)).toBe(30);
    expect(waitSecondsFor(2, -5)).toBe(30);
  });
});

describe('parseRetrySpec', () => {
  it('reads the fence the tutor emits', () => {
    expect(parseRetrySpec('attempt=2 retryAfter=45 reason=502'))
      .toEqual({ attempt: 2, retryAfter: 45, reason: '502' });
  });

  it('keeps reason as text even when it is numeric', () => {
    expect(parseRetrySpec('reason=502').reason).toBe('502');
  });

  it('survives an empty or malformed spec', () => {
    expect(parseRetrySpec('')).toEqual({});
    expect(parseRetrySpec(null)).toEqual({});
    expect(parseRetrySpec('garbage')).toEqual({});
  });
});

describe('formatWait', () => {
  it('reads naturally at every scale', () => {
    expect(formatWait(0)).toBe('now');
    expect(formatWait(45)).toBe('45s');
    expect(formatWait(60)).toBe('1m');
    expect(formatWait(125)).toBe('2m 5s');
  });
});
