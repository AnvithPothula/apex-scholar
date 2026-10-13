import React, { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';

/** Positions the student got right, given events in true order and their picks (indexes). Exported for tests. */
export function checkOrder(events, picked) {
  return picked.map((idx, pos) => idx === pos);
}

/** A fixed, non-chronological starting order (alphabetical, reversed if that happens to be chronological). Exported for tests. */
export function startOrder(events) {
  const order = events.map((_, i) => i).sort((a, b) => events[a].label.localeCompare(events[b].label));
  return order.every((v, i) => v === i) ? order.reverse() : order;
}

/**
 * Put events in chronological order: tap them earliest first, then check.
 * `events` arrive in true order as { year, label }; years stay hidden until
 * checked. `hideYears` is for plot order, where `year` is just a sequence number;
 * `when` is an optional display date (e.g. "c. 2500 BCE") for a numeric `year`.
 */
export default function TimelineOrder({ title = 'Put these in order', events = [], hideYears = false, instruction = 'tap the events from earliest to latest' }) {
  const pool = useMemo(() => startOrder(events), [events]);
  const [picked, setPicked] = useState([]);
  const [checked, setChecked] = useState(false);
  const marks = checked ? checkOrder(events, picked) : [];
  const score = marks.filter(Boolean).length;
  const reset = () => { setPicked([]); setChecked(false); };

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-1">Activity · timeline</p>
      <p className="text-body-sm text-content-primary mb-3">{title}: {instruction}.</p>
      <div className="flex flex-wrap gap-2" aria-label="Events left to place">
        {pool.filter((i) => !picked.includes(i)).map((i) => (
          <button key={i} type="button" onClick={() => setPicked((p) => [...p, i])}
            className="px-3 py-2 rounded-md border border-border-strong bg-base-800 text-body-sm text-content-primary text-left hover:border-content-muted">
            {events[i].label}
          </button>
        ))}
      </div>
      {picked.length > 0 && (
        <ol className="mt-3 space-y-1.5" aria-label="Your order">
          {picked.map((i, pos) => (
            <li key={i} className={`flex items-start gap-2 p-2 rounded-md border text-body-sm ${!checked ? 'border-border-subtle' : marks[pos] ? 'border-success-500 bg-success-900/40' : 'border-error-500 bg-error-900/40'}`}>
              <span className="font-semibold text-content-secondary w-5 shrink-0">{pos + 1}.</span>
              <span className="flex-1 text-content-primary">{events[i].label}</span>
              {checked && !hideYears && <span className="text-content-muted shrink-0">{events[i].when || events[i].year}</span>}
              {checked && (marks[pos] ? <Check className="w-4 h-4 text-success-400 shrink-0" aria-label="Right place" /> : <X className="w-4 h-4 text-error-400 shrink-0" aria-label="Wrong place" />)}
            </li>
          ))}
        </ol>
      )}
      <div className="flex flex-wrap gap-2 mt-3">
        {!checked && picked.length === events.length && events.length > 0 && (
          <button type="button" onClick={() => setChecked(true)} className="px-3 py-1.5 rounded-md bg-primary-600 text-white text-body-sm">Check order</button>
        )}
        {picked.length > 0 && (
          <button type="button" onClick={reset} className="px-3 py-1.5 rounded-md border border-border-strong text-content-secondary text-body-sm">Start over</button>
        )}
      </div>
      {checked && (
        <div className="mt-3 text-body-sm text-content-secondary" aria-live="polite">
          <p>{score === events.length ? 'All in order.' : `${score} of ${events.length} in the right place.`}</p>
          {score < events.length && (
            <p className="mt-1">Correct order: {events.map((e) => (hideYears ? e.label : `${e.label} (${e.when || e.year})`)).join(' → ')}</p>
          )}
        </div>
      )}
    </div>
  );
}
