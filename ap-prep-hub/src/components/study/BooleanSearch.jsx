import React, { useState } from 'react';

/** A fictional mini-database: invented titles, for practicing search logic only. */
export const RECORDS = [
  { title: 'Later school start times and teen sleep: a district study', year: 2021, peer: true },
  { title: 'Teen sleep, smartphones and grades', year: 2019, peer: true },
  { title: 'Why my school should start later (student blog)', year: 2023, peer: false },
  { title: 'Smartphone bans in classrooms: effects on attention', year: 2022, peer: true },
  { title: 'Screen time and adolescent sleep: a review', year: 2016, peer: true },
  { title: 'School start times and car accidents among teen drivers', year: 2011, peer: true },
  { title: 'Ten tips for better sleep (magazine)', year: 2024, peer: false },
  { title: 'Later start times and attendance in rural schools', year: 2018, peer: true },
  { title: 'Social media use and teen anxiety', year: 2020, peer: true },
  { title: 'Smartphones and family dinners: a survey', year: 2017, peer: false },
];

const has = (title, term) => term.trim() !== '' && title.toLowerCase().includes(term.trim().toLowerCase());

/** Does a record match `a OP b` plus the filters? Exported for tests. */
export function matches(rec, a, op, b, { peerOnly = false, since = 0 } = {}) {
  if (peerOnly && !rec.peer) return false;
  if (rec.year < since) return false;
  const A = has(rec.title, a);
  if (!b.trim()) return A;
  const B = has(rec.title, b);
  if (op === 'AND') return A && B;
  if (op === 'OR') return A || B;
  return A && !B; // NOT
}

/**
 * Two keywords joined by AND / OR / NOT, plus peer-review and date filters,
 * over a tiny invented database. Shows how each choice narrows or widens
 * the results.
 */
export default function BooleanSearch() {
  const [a, setA] = useState('sleep');
  const [op, setOp] = useState('AND');
  const [b, setB] = useState('start');
  const [peerOnly, setPeerOnly] = useState(false);
  const [recent, setRecent] = useState(false);
  const hits = RECORDS.filter((r) => matches(r, a, op, b, { peerOnly, since: recent ? 2015 : 0 }));
  const input = (value, set, label) => (
    <input value={value} onChange={(e) => set(e.target.value)} aria-label={label} maxLength={20}
      className="w-28 bg-base-800 border border-border-strong rounded px-2 py-1 text-body-sm text-content-primary" />
  );

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · database search</p>
      <div className="flex flex-wrap items-center gap-2">
        {input(a, setA, 'First keyword')}
        <div className="flex gap-1" role="group" aria-label="Boolean operator">
          {['AND', 'OR', 'NOT'].map((o) => (
            <button key={o} type="button" onClick={() => setOp(o)} aria-pressed={op === o}
              className={`px-2 py-1 rounded border text-caption font-mono ${op === o ? 'border-primary-500 bg-primary-900/40 text-content-primary' : 'border-border-strong text-content-secondary'}`}>{o}</button>
          ))}
        </div>
        {input(b, setB, 'Second keyword')}
      </div>
      <div className="flex flex-wrap gap-4 mt-2 text-body-sm text-content-secondary">
        <label className="flex items-center gap-1.5"><input type="checkbox" checked={peerOnly} onChange={(e) => setPeerOnly(e.target.checked)} className="accent-primary-500" />Peer-reviewed only</label>
        <label className="flex items-center gap-1.5"><input type="checkbox" checked={recent} onChange={(e) => setRecent(e.target.checked)} className="accent-primary-500" />2015 or later</label>
      </div>
      <p className="text-body-sm text-content-primary mt-3" aria-live="polite"><strong>{hits.length}</strong> of {RECORDS.length} records match.</p>
      <ul className="mt-2 space-y-1.5">
        {hits.map((r) => (
          <li key={r.title} className="text-body-sm text-content-secondary border-l-2 border-primary-500 pl-2">
            {r.title} <span className="text-caption text-content-muted">({r.year}{r.peer ? ', peer-reviewed' : ''})</span>
          </li>
        ))}
      </ul>
      <p className="text-caption text-content-muted mt-2">Invented titles for practice. AND narrows, OR widens, NOT excludes; filters narrow further.</p>
    </div>
  );
}
