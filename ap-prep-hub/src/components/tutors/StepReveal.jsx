import React, { useMemo, useState } from 'react';
import { ListOrdered, ChevronRight, Eye, RotateCcw } from 'lucide-react';
import { parseStepsSpec } from '../../utils/widgetSpec';

/**
 * A worked solution revealed one step at a time (```apex-steps).
 *
 * A wall of finished steps invites reading instead of thinking. Showing one
 * step, then asking the student to predict the next before revealing it, is
 * the difference between watching a solution and doing one.
 *
 * `renderMarkdown` is passed in by MarkdownRenderer (which imports this file),
 * so step bodies get the same LaTeX/markdown handling without a circular import.
 */
export default function StepReveal({ spec: raw, fallback, renderMarkdown }) {
  const spec = useMemo(() => parseStepsSpec(raw), [raw]);
  const [shown, setShown] = useState(1);

  if (!spec) {
    // Never lose the content: an unparseable block is still the tutor's answer.
    return fallback || null;
  }

  const total = spec.steps.length;
  const done = shown >= total;
  const md = (text) => (renderMarkdown ? renderMarkdown(text) : <p>{text}</p>);

  return (
    <div className="not-prose my-4 w-[36rem] max-w-full rounded-lg border border-border-strong bg-base-900 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border bg-base-850">
        <div className="flex items-center gap-2 min-w-0">
          <ListOrdered className="w-4 h-4 text-primary-400 shrink-0" strokeWidth={1.5} />
          {/* Titles carry math ("Differentiate $y = \\sin(3x^2)$"), so they go
              through the markdown renderer like the step bodies do. */}
          <span className="text-sm font-semibold text-content-primary min-w-0 [&_div]:inline [&_div]:mb-0">
            {spec.title ? md(spec.title) : 'Step by step'}
          </span>
        </div>
        <span className="text-xs text-content-muted shrink-0" aria-live="polite">
          Step {Math.min(shown, total)} of {total}
        </span>
      </div>

      {/* progress */}
      <div className="h-1 bg-base-800" aria-hidden="true">
        <div className="h-full bg-primary-500 transition-all duration-300" style={{ width: `${(Math.min(shown, total) / total) * 100}%` }} />
      </div>

      <ol className="divide-y divide-border">
        {spec.steps.slice(0, shown).map((s, i) => (
          <li key={i} className="flex gap-3 px-3 py-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-900/60 border border-primary-500/40 text-primary-400 text-xs font-semibold flex items-center justify-center">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1 text-sm text-content-secondary">
              {s.title && <div className="font-semibold text-content-primary mb-1">{md(s.title)}</div>}
              {s.body && md(s.body)}
            </div>
          </li>
        ))}
      </ol>

      {done && spec.answer && (
        <div className="mx-3 mb-3 rounded-md border border-success-500/40 bg-success-900/30 px-3 py-2 text-sm text-content-primary">
          <span className="font-semibold text-success-400">Answer: </span>
          <span className="[&>div]:inline [&>div]:mb-0">{md(spec.answer)}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-t border-border bg-base-850">
        {!done ? (
          <>
            <span className="text-xs text-content-muted">Try the next step yourself, then check it.</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShown(total)}
                className="inline-flex items-center gap-1 text-xs text-content-muted hover:text-content-primary px-2 py-1"
              >
                <Eye className="w-3.5 h-3.5" strokeWidth={1.5} /> Show all
              </button>
              <button
                type="button"
                onClick={() => setShown((n) => Math.min(total, n + 1))}
                className="inline-flex items-center gap-1 text-xs font-semibold rounded-md bg-content-primary text-base-950 px-3 py-1.5 hover:opacity-90"
              >
                Next step <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          </>
        ) : (
          <>
            <span className="text-xs text-content-muted">All {total} steps shown.</span>
            {total > 1 && (
              <button
                type="button"
                onClick={() => setShown(1)}
                className="inline-flex items-center gap-1 text-xs text-content-muted hover:text-content-primary px-2 py-1"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} /> Start over
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
