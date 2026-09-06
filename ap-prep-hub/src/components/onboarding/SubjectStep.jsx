import React, { useMemo, useState } from 'react';
import { Check, Search } from 'lucide-react';
import { getAvailableSubjects, getSubjectName } from '../../constants/comprehensiveCurriculum';
import POPULAR_SUBJECTS from './POPULAR_SUBJECTS';

/**
 * "Which APs are you taking?" — the step this whole rebuild exists for.
 *
 * Two affordances, because one does not fit both cases: tappable chips for the
 * dozen courses most students are actually in, and a search box for the rest.
 * The old flow asked nothing and pointed at Settings; 4 of 92 users followed.
 */
export default function SubjectStep({ selected, onChange, returning = false }) {
  const [query, setQuery] = useState('');
  const all = useMemo(() => getAvailableSubjects(), []);

  const toggle = (key) => {
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
  };

  // Popular chips first; searching switches to the full list so a student
  // looking for AP Latin isn't told it doesn't exist.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return POPULAR_SUBJECTS.filter((k) => all.includes(k));
    return all.filter((k) => getSubjectName(k).toLowerCase().includes(q)).slice(0, 24);
  }, [query, all]);

  // Anything chosen from search stays visible after the query is cleared.
  const offList = selected.filter((k) => !results.includes(k));

  return (
    <div>
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-content-muted absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search all 40 AP subjects…"
          aria-label="Search AP subjects"
          className="w-full bg-base-800 border border-border rounded-md pl-9 pr-3 py-2 text-body-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>

      <div className="flex flex-wrap gap-2 max-h-[210px] overflow-y-auto pr-1">
        {[...results, ...offList].map((key) => {
          const on = selected.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              aria-pressed={on}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-body-sm transition-colors ${
                on
                  ? 'border-primary-400 bg-primary-500/15 text-content-primary'
                  : 'border-border bg-base-800 text-content-secondary hover:bg-base-750'
              }`}
            >
              {on && <Check className="w-3.5 h-3.5 text-primary-400" strokeWidth={2} />}
              {getSubjectName(key)}
            </button>
          );
        })}
        {!results.length && !offList.length && (
          <p className="text-body-sm text-content-muted py-2">No subject matches “{query}”.</p>
        )}
      </div>

      <p className="text-caption text-content-muted mt-3">
        {selected.length
          ? `${selected.length} selected. This turns on your exam countdown, study schedule, and personalised practice.`
          : returning
            ? 'Pick what you are taking this year. Saved as you go — you can close this and nothing is lost.'
            : 'Pick every AP you are taking this year. You can change these any time in Settings.'}
      </p>
    </div>
  );
}
