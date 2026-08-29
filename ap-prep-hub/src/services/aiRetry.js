/**
 * How long to tell a student to wait, and how to say it.
 *
 * Pulled out of components/tutors/RetryCountdown so every surface that can hit
 * a rate limit — practice tests, flashcards, the solver, review explanations —
 * shows the same number in the same words. Before this, only the tutor chat
 * said anything at all; everywhere else a 429 surfaced as a generic "failed,
 * try again", which tells a student nothing about whether to wait ten seconds
 * or give up for the day.
 *
 * No imports, so it can also be loaded by scripts.
 */

/** Longest wait worth displaying. Past this the number stops being actionable. */
export const MAX_WAIT_SECONDS = 600;

/**
 * Seconds to wait.
 *
 * `retryAfter` is the server's real number (Google's RetryInfo, relayed by the
 * router) and always wins — a measured wait beats a guess. Only when there
 * isn't one do we back off exponentially on the consecutive-failure count.
 */
export function waitSecondsFor(attempt, retryAfter) {
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return Math.min(Math.round(retryAfter), MAX_WAIT_SECONDS);
  }
  const n = Number.isFinite(attempt) && attempt > 0 ? attempt : 1;
  return Math.min(15 * 2 ** (n - 1), MAX_WAIT_SECONDS); // 15, 30, 60, 120, 240, 480, 600
}

/** "45s", "2m", "2m 30s" — never a bare number of seconds past a minute. */
export function formatWait(s) {
  if (s <= 0) return 'now';
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem ? `${m}m ${rem}s` : `${m}m`;
}

/** `attempt=2 retryAfter=45 reason=502` -> { attempt: 2, retryAfter: 45, reason: '502' } */
export function parseRetrySpec(spec) {
  const out = {};
  for (const m of String(spec || '').matchAll(/(\w+)\s*=\s*([^\s]+)/g)) {
    const n = Number(m[2]);
    out[m[1]] = Number.isFinite(n) && m[1] !== 'reason' ? n : m[2];
  }
  return out;
}

/**
 * Pull the wait out of whatever the failure turned out to be.
 *
 * Call sites catch a RateLimitError from the proxy, a raw fetch Response, or a
 * plain Error, and each carries the number somewhere different. Returns null
 * when the failure isn't a rate limit at all, so the caller can show a real
 * error instead of a countdown to nothing.
 */
export function retryAfterFrom(error) {
  if (!error) return null;
  const isLimit =
    error.isRateLimit ||
    error.name === 'RateLimitError' ||
    error.status === 429 ||
    /rate limit|quota|too many requests/i.test(String(error.message || ''));
  if (!isLimit) return null;
  const n = Number(error.retryAfter);
  return Number.isFinite(n) && n > 0 ? Math.min(Math.round(n), MAX_WAIT_SECONDS) : 60;
}
