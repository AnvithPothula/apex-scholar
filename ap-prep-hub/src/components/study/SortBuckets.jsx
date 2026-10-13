import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

/** Number of items sorted into the right group. Exported for tests. */
export function scoreSort(items, picks) {
  return items.filter((it, i) => picks[i] === it.bucket).length;
}

/**
 * Sort each item into one of 2–6 groups, then check. `items` are
 * { label, bucket, why? } where bucket indexes `buckets`.
 */
export default function SortBuckets({ title = 'Sort these', buckets = [], items = [] }) {
  const [picks, setPicks] = useState({});
  const [checked, setChecked] = useState(false);
  const done = items.every((_, i) => picks[i] !== undefined);
  const score = scoreSort(items, picks);

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-1">Activity · sort</p>
      <p className="text-body-sm text-content-primary mb-3">{title}</p>
      <ul className="space-y-3">
        {items.map((it, i) => {
          const right = checked && picks[i] === it.bucket;
          return (
            <li key={it.label} className={`p-3 rounded-md border ${!checked ? 'border-border-subtle' : right ? 'border-success-500 bg-success-900/40' : 'border-error-500 bg-error-900/40'}`}>
              <div className="flex items-start gap-2">
                <span className="flex-1 text-body-sm text-content-primary">{it.label}</span>
                {checked && (right ? <Check className="w-4 h-4 text-success-400 shrink-0" aria-label="Right" /> : <X className="w-4 h-4 text-error-400 shrink-0" aria-label="Wrong" />)}
              </div>
              {/* Four or more groups don't fit one row on a phone; a grid reads better than a ragged wrap. */}
              <div className={`${buckets.length > 4 ? 'grid grid-cols-2 sm:grid-cols-3' : buckets.length > 3 ? 'grid grid-cols-2 sm:grid-cols-4' : 'flex flex-wrap'} gap-1.5 mt-2`} role="radiogroup" aria-label={`Group for ${it.label}`}>
                {buckets.map((b, bi) => (
                  <button key={b} type="button" role="radio" aria-checked={picks[i] === bi} disabled={checked}
                    onClick={() => setPicks((p) => ({ ...p, [i]: bi }))}
                    className={`px-2.5 py-1 rounded-md border text-caption ${picks[i] === bi ? 'border-primary-500 bg-primary-900/40 text-content-primary' : 'border-border-strong text-content-secondary'} ${checked && bi === it.bucket ? 'ring-1 ring-success-500' : ''}`}>
                    {b}
                  </button>
                ))}
              </div>
              {checked && !right && it.why && <p className="text-caption text-content-secondary mt-2">{buckets[it.bucket]}: {it.why}</p>}
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {!checked && (
          <button type="button" disabled={!done} onClick={() => setChecked(true)}
            className="px-3 py-1.5 rounded-md bg-primary-600 text-white text-body-sm disabled:opacity-50">
            {done ? 'Check' : `Sort all ${items.length} to check`}
          </button>
        )}
        {checked && (
          <>
            <p className="text-body-sm text-content-secondary" aria-live="polite">{score === items.length ? 'All correct.' : `${score} of ${items.length} correct.`}</p>
            <button type="button" onClick={() => { setPicks({}); setChecked(false); }}
              className="px-3 py-1.5 rounded-md border border-border-strong text-content-secondary text-body-sm">Try again</button>
          </>
        )}
      </div>
    </div>
  );
}
