import React, { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

// Rough time per question, so the bar's pace matches the real wait. Written
// questions take far longer (generation plus the answer-key check).
const MS_PER_QUESTION = { mcq: 3500, full: 5000 };
const FRQ_MS = 20000;

/**
 * Shown in place of the Generate button while a test is built. A spinner with
 * a "0/2" counter that sits still for a minute reads as stuck; a bar that keeps
 * easing forward, jumps when a batch lands, and names what's happening feels
 * quicker for the same wait.
 *
 * Pure display: the shown fraction is max(real progress, a time-based estimate
 * that slows as it nears the end), never moves backwards, and stays under 96%
 * until the questions are actually in.
 */
export function shownFraction({ elapsed, expected, generated, total }) {
  const real = total ? generated / total : 0;
  const estimate = 0.95 * (1 - Math.exp((-1.6 * elapsed) / expected));
  return Math.min(0.96, Math.max(real, estimate));
}

export default function GenerationProgress({ generated = 0, total = 0, section = 'mcq' }) {
  const start = useRef(Date.now());
  const best = useRef(0);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  const expected = Math.max(12000, total * (MS_PER_QUESTION[section] || FRQ_MS));
  best.current = Math.max(best.current, shownFraction({ elapsed: now - start.current, expected, generated, total }));
  const f = best.current;
  const stage = f < 0.12 ? 'Reading the course framework'
    : f < 0.75 ? 'Writing your questions'
      : f < 0.92 ? 'Checking the answer keys'
        : 'Almost ready';

  return (
    <div className="w-full rounded-md border border-border-strong bg-base-850 px-4 py-3" role="status" aria-live="polite">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="inline-flex items-center gap-2 font-medium text-content-primary">
          <Sparkles className="w-4 h-4 text-primary-400" strokeWidth={1.5} />
          {stage}…
        </span>
        <span className="tabular-nums text-content-muted">
          {generated > 0 ? `${generated} of ${total} ready` : `${Math.round(f * 100)}%`}
        </span>
      </div>
      <div
        className="mt-2 h-2 rounded-full bg-base-800 overflow-hidden"
        role="progressbar"
        aria-label="Building your test"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(f * 100)}
      >
        <div
          className="relative h-full rounded-full bg-primary-500 transition-[width] duration-300 ease-out overflow-hidden"
          style={{ width: `${Math.max(4, f * 100)}%` }}
        >
          {/* A moving sheen: motion reads as progress even between updates. */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[apexSheen_1.6s_linear_infinite] motion-reduce:hidden" />
        </div>
      </div>
      <style>{'@keyframes apexSheen { from { transform: translateX(-100%); } to { transform: translateX(100%); } }'}</style>
    </div>
  );
}
