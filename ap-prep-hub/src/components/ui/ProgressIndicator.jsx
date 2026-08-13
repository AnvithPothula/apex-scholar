import React, { useEffect, useState } from 'react';

/**
 * Progress for long-running AI work.
 *
 * Two rules this exists to enforce:
 *
 *  1. Never claim progress you don't have. Pass `total` only when there is a
 *     real countable unit of work; otherwise the bar goes indeterminate. The
 *     grading screen used to show a static three-step checklist — a permanent
 *     green tick, a permanent spinner, a permanent clock — that was pure
 *     decoration and told the user nothing about what was happening.
 *
 *  2. Show elapsed time. These operations run for minutes (a 60-question
 *     generation takes ~5), and a silent spinner is indistinguishable from a
 *     hang. The clock appears after a few seconds so quick work stays quiet.
 */
export default function ProgressIndicator({
  label,
  done = 0,
  total = 0,
  hint,
  className = '',
}) {
  const determinate = total > 0;
  const pct = determinate ? Math.min(100, Math.round((done / total) * 100)) : null;

  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const startedAt = Date.now();
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const clock = elapsed >= 5
    ? (elapsed < 60 ? `${elapsed}s` : `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`)
    : null;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <span className="text-sm text-content-secondary">{label}</span>
        <span className="text-xs text-content-muted tabular-nums flex-shrink-0">
          {determinate && `${done}/${total}`}
          {determinate && clock && ' · '}
          {clock}
        </span>
      </div>

      <div
        className="h-1.5 w-full bg-base-800 rounded-full overflow-hidden"
        role="progressbar"
        aria-label={label}
        aria-busy={!determinate || pct < 100}
        {...(determinate
          ? { 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100 }
          : {})}
      >
        {determinate ? (
          <div
            className="h-full bg-primary-400 rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        ) : (
          <div className="h-full w-1/4 bg-primary-400 rounded-full animate-indeterminate" />
        )}
      </div>

      {hint && <p className="text-xs text-content-muted mt-2">{hint}</p>}
    </div>
  );
}
