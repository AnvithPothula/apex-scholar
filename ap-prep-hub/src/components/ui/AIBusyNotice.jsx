import React, { useEffect, useState } from 'react';
import { RefreshCw, Clock } from 'lucide-react';
import { waitSecondsFor, formatWait } from '../../services/aiRetry';
import useAIWait from '../../hooks/useAIWait';

/**
 * "The AI is busy — try again in N" with a live countdown.
 *
 * The tutor chat has had this since Round 40, rendered from an `apex-retry`
 * fence in the model's own reply. Nowhere else did: a rate limit in practice
 * tests, flashcards, the solver or review surfaced as "Failed to generate,
 * please try again", which gives a student no way to tell a ten-second wait
 * from a done-for-the-day one. Same words and same number everywhere now.
 *
 * `seconds` should come from the server (Retry-After / the `retryAfter` body
 * field the router now sends). `attempt` is only the fallback when there is no
 * server number.
 */
export default function AIBusyNotice({
  seconds,
  attempt = 1,
  reason,
  onRetry,
  compact = false,
  className = '',
}) {
  // The queue is authoritative while it is holding work: it knows about calls
  // this component never saw, and its number moves up as well as down.
  const queued = useAIWait();
  const total = waitSecondsFor(attempt, seconds);
  const [left, setLeft] = useState(total);

  // Re-arm when the wait changes: a second failure raises it, and a counter
  // still running down the old number is worse than no counter.
  useEffect(() => {
    setLeft(total);
    if (total <= 0) return undefined;
    const id = setInterval(() => setLeft((v) => (v <= 1 ? 0 : v - 1)), 1000);
    return () => clearInterval(id);
  }, [total]);

  // Whichever is longer is the honest answer — a caller parked behind three
  // others waits longer than the raw retry-after suggests.
  const shown = Math.max(left, queued);
  const ready = shown <= 0;

  // Inside a toast the surrounding card already supplies the chrome and the
  // icon, so the compact form is just the sentence with the live number.
  if (compact) {
    return (
      <span>
        {ready ? (
          'The AI is free again — try that once more.'
        ) : (
          <>
            The AI is busy. Everyone shares the same free capacity. Try again in{' '}
            <strong className="text-content-primary tabular-nums">{formatWait(shown)}</strong>.
          </>
        )}
      </span>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-md border border-warning-500/40 bg-warning-900/20 p-3 ${className}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-4 h-4 text-warning-500 shrink-0" strokeWidth={1.5} />
        <span className="text-body-sm font-medium text-content-primary">
          The AI is busy right now
        </span>
      </div>
      <p className="text-body-sm text-content-secondary">
        {ready ? (
          'You can try again now.'
        ) : (
          <>
            Everyone shares the same free AI capacity. Try again in{' '}
            <strong className="text-content-primary tabular-nums">{formatWait(shown)}</strong>.
          </>
        )}
        {reason ? <span className="text-content-muted"> (last error: {reason})</span> : null}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={!ready}
          className="mt-2 inline-flex items-center gap-1.5 text-body-sm rounded-md border border-border px-2.5 py-1 text-content-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-base-800"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${ready ? '' : 'opacity-60'}`} strokeWidth={1.5} />
          Retry
        </button>
      )}
    </div>
  );
}
