import React, { useMemo, useState } from 'react';
import { Play, RotateCcw, Flag } from 'lucide-react';
import { parseSimSpec } from '../../utils/widgetSpec';

/**
 * A branching scenario the tutor writes (```apex-sim): make a choice, watch the
 * meters move, read what happened, choose again. For processes where decisions
 * have consequences (checks and balances, a bill becoming law, a central bank's
 * response) that a slider graph can't show.
 *
 * `renderMarkdown` comes from MarkdownRenderer (which imports this file), so
 * scene text gets the same LaTeX/markdown handling without a circular import.
 */
// Meters can be rates like 5.5%; rounding showed "6" and made the deltas
// (-2 from 6 is 4?) look wrong. One decimal where the value has one.
const fmt = (n) => String(Math.round(n * 10) / 10);

export default function SimWidget({ spec: raw, fallback, renderMarkdown }) {
  const spec = useMemo(() => parseSimSpec(raw), [raw]);
  const initial = useMemo(() => (spec ? Object.fromEntries(spec.meters.map((m) => [m.id, m.value])) : {}), [spec]);
  const [scene, setScene] = useState(null);
  const [meters, setMeters] = useState(initial);
  const [last, setLast] = useState(null); // the choice just made, for its feedback
  const [path, setPath] = useState([]);

  if (!spec) return fallback || null;

  const current = spec.scenes[scene || spec.start];
  const ended = !current.choices.length;
  const md = (text) => (renderMarkdown ? renderMarkdown(text) : <p>{text}</p>);

  const choose = (c) => {
    setMeters((m) => Object.fromEntries(spec.meters.map((x) => [x.id, Math.min(x.max, Math.max(x.min, (m[x.id] ?? x.value) + (c.effects[x.id] || 0)))])));
    setLast(c);
    setPath((p) => [...p, c.label]);
    setScene(c.next);
  };
  const restart = () => { setScene(null); setMeters(initial); setLast(null); setPath([]); };

  return (
    <div className="not-prose my-4 w-[36rem] max-w-full rounded-lg border border-border-strong bg-base-900 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border bg-base-850">
        <div className="flex items-center gap-2 min-w-0">
          <Play className="w-4 h-4 text-primary-400 shrink-0" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-content-primary min-w-0 [&_div]:inline [&_div]:mb-0">
            {spec.title ? md(spec.title) : 'Simulation'}
          </span>
        </div>
        <span className="text-xs text-content-muted shrink-0">{ended ? 'Outcome' : `Decision ${path.length + 1}`}</span>
      </div>

      {spec.meters.length > 0 && (
        <div className="grid gap-2 px-3 py-2 border-b border-border sm:grid-cols-3" aria-live="polite">
          {spec.meters.map((m) => {
            const v = meters[m.id] ?? m.value;
            const pct = ((v - m.min) / (m.max - m.min)) * 100;
            const delta = last?.effects[m.id];
            return (
              <div key={m.id} className="min-w-0">
                <div className="flex justify-between gap-2 text-xs text-content-muted">
                  <span className="truncate">{m.label}</span>
                  <span className="tabular-nums text-content-secondary">
                    {fmt(v)}
                    {delta ? <span className={delta > 0 ? 'text-success-400' : 'text-error-400'}> {delta > 0 ? '+' : ''}{fmt(delta)}</span> : null}
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded bg-base-800" role="meter" aria-label={m.label} aria-valuemin={m.min} aria-valuemax={m.max} aria-valuenow={Math.round(v)}>
                  <div className="h-full rounded bg-primary-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="px-3 py-3 space-y-3 text-sm text-content-secondary">
        {!path.length && spec.intro && <div className="text-content-muted">{md(spec.intro)}</div>}
        {last?.feedback && (
          <div className="rounded-md border border-primary-500/30 bg-primary-900/20 px-3 py-2">
            <span className="font-semibold text-content-primary">What happened: </span>
            <span className="[&>div]:inline [&>div]:mb-0">{md(last.feedback)}</span>
          </div>
        )}
        {current.text && <div className="text-content-primary">{md(current.text)}</div>}
      </div>

      <div className="flex flex-col gap-2 px-3 pb-3">
        {current.choices.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => choose(c)}
            className="text-left rounded-md border border-border-strong bg-base-850 hover:bg-base-800 hover:border-primary-500/60 px-3 py-2 text-sm text-content-primary transition-colors"
          >
            {c.label}
          </button>
        ))}
        {ended && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-content-muted">
              <Flag className="w-3.5 h-3.5" strokeWidth={1.5} /> Your path: {path.join(' → ')}
            </span>
            <button type="button" onClick={restart} className="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-500 px-2 py-1">
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} /> Try a different path
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
