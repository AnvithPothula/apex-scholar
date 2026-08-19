import React, { useEffect, useState } from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';

/**
 * Live "try again in N" countdown for an AI outage message.
 *
 * The fallback used to say "please try again" with no number, or a hardcoded
 * "60 seconds" that was already stale by the time it rendered. A static number
 * inside a chat message is worse than none: it keeps claiming 60 seconds an
 * hour later, and the student has no idea whether to wait or give up.
 *
 * Rendered from a ```apex-retry fence so the model can emit it inline, the same
 * way it emits the score calculator.
 */

/** Backoff by consecutive failure count. Capped so the number stays useful. */
export function waitSecondsFor(attempt, retryAfter) {
  if (Number.isFinite(retryAfter) && retryAfter > 0) return Math.min(Math.round(retryAfter), 600);
  const n = Number.isFinite(attempt) && attempt > 0 ? attempt : 1;
  return Math.min(15 * 2 ** (n - 1), 600); // 15, 30, 60, 120, 240, 480, 600
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

export function formatWait(s) {
  if (s <= 0) return 'now';
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem ? `${m}m ${rem}s` : `${m}m`;
}

export default function RetryCountdown({ spec, onRetry }) {
  const { attempt, retryAfter, reason } = parseRetrySpec(spec);
  const total = waitSecondsFor(attempt, retryAfter);
  const [left, setLeft] = useState(total);

  // Re-arm whenever the spec changes — a second 502 raises the wait, and the
  // displayed number has to follow it rather than keep counting the old one.
  useEffect(() => {
    setLeft(total);
    if (total <= 0) return undefined;
    const id = setInterval(() => setLeft((v) => (v <= 1 ? 0 : v - 1)), 1000);
    return () => clearInterval(id);
  }, [total]);

  const ready = left <= 0;

  return (
    <div className="my-3 rounded-md border border-warning-500/40 bg-warning-900/20 p-3">
      <div className="flex items-center gap-2 mb-1">
        <WifiOff className="w-4 h-4 text-warning-500 shrink-0" />
        <span className="text-body-sm font-medium text-content-primary">
          The AI service is unreachable right now
        </span>
      </div>
      <p className="text-body-sm text-content-secondary">
        {ready
          ? 'You can try again now.'
          : <>Try again in <strong className="text-content-primary tabular-nums">{formatWait(left)}</strong>.</>}
        {reason ? <span className="text-content-muted"> (last error: {reason})</span> : null}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={!ready}
          className="mt-2 inline-flex items-center gap-1.5 text-body-sm rounded-md border border-border px-2.5 py-1 text-content-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-base-800"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${ready ? '' : 'opacity-60'}`} />
          Retry
        </button>
      )}
    </div>
  );
}
