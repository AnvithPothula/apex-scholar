import React, { useState } from 'react';

/** Labor-force statistics from counts of adults (millions). Exported for tests. */
export function laborStats({ employed, unemployed, notInLaborForce }) {
  const laborForce = employed + unemployed;
  const adults = laborForce + notInLaborForce;
  return {
    laborForce,
    adults,
    unemploymentRate: laborForce ? (unemployed / laborForce) * 100 : 0,
    participationRate: adults ? (laborForce / adults) * 100 : 0,
  };
}

const START = { employed: 120, unemployed: 8, notInLaborForce: 72 };
const EVENTS = [
  { label: 'An unemployed worker gives up looking (discouraged)', move: { unemployed: -1, notInLaborForce: 1 } },
  { label: 'An unemployed worker finds a job', move: { unemployed: -1, employed: 1 } },
  { label: 'A worker is laid off and starts job hunting', move: { employed: -1, unemployed: 1 } },
  { label: 'A retiree starts looking for work again', move: { notInLaborForce: -1, unemployed: 1 } },
  { label: 'A worker retires', move: { employed: -1, notInLaborForce: 1 } },
];

/**
 * Move people between employed, unemployed and not in the labor force (in
 * millions) and watch the unemployment rate and the labor force participation
 * rate respond. Shows why discouraged workers make the measured
 * unemployment rate fall even though no one found a job.
 */
export default function LaborMarketLab() {
  const [c, setC] = useState(START);
  const [last, setLast] = useState(null);
  const s = laborStats(c);
  const prev = last ? laborStats(last.before) : null;
  const apply = (ev) => {
    const next = { ...c };
    Object.entries(ev.move).forEach(([k, d]) => { next[k] += d; });
    if (Object.values(next).some((v) => v < 0)) return;
    setLast({ before: c, label: ev.label });
    setC(next);
  };
  const f2 = (n) => n.toFixed(2);
  const arrow = (now, before) => (before === undefined || Math.abs(now - before) < 0.005 ? '' : now > before ? ' ↑' : ' ↓');

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · measuring unemployment</p>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[['Employed', c.employed, 'text-success-400'], ['Unemployed (looking)', c.unemployed, 'text-warning-400'], ['Not in labor force', c.notInLaborForce, 'text-content-secondary']].map(([label, v, cls]) => (
          <div key={label} className="p-2 rounded-md bg-base-800">
            <div className={`text-h4 font-semibold ${cls}`}>{v}M</div>
            <div className="text-caption text-content-muted">{label}</div>
          </div>
        ))}
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-body-sm mt-3">
        <dt className="text-content-muted">Labor force</dt><dd className="text-content-primary">{s.laborForce}M of {s.adults}M adults</dd>
        <dt className="text-content-muted">Unemployment rate</dt>
        <dd className="text-content-primary font-semibold">{f2(s.unemploymentRate)}%{prev && arrow(s.unemploymentRate, prev.unemploymentRate)} <span className="font-normal text-content-muted">= {c.unemployed} ÷ {s.laborForce}</span></dd>
        <dt className="text-content-muted">Participation rate</dt>
        <dd className="text-content-primary font-semibold">{f2(s.participationRate)}%{prev && arrow(s.participationRate, prev.participationRate)} <span className="font-normal text-content-muted">= {s.laborForce} ÷ {s.adults}</span></dd>
      </dl>
      <div className="flex flex-col gap-1.5 mt-3">
        {EVENTS.map((ev) => (
          <button key={ev.label} type="button" onClick={() => apply(ev)}
            className="text-left px-3 py-1.5 rounded border border-border-strong text-body-sm text-content-primary hover:bg-base-800">
            {ev.label} <span className="text-content-muted">(1 million people)</span>
          </button>
        ))}
        <button type="button" onClick={() => { setC(START); setLast(null); }} disabled={!last}
          className="self-start px-3 py-1.5 rounded border border-border-strong text-body-sm text-content-secondary disabled:opacity-40">Reset</button>
      </div>
      <p className="text-body-sm text-content-secondary mt-3" aria-live="polite">
        {last
          ? `${last.label}: unemployment rate ${f2(prev.unemploymentRate)}% → ${f2(s.unemploymentRate)}%, participation ${f2(prev.participationRate)}% → ${f2(s.participationRate)}%.`
          : 'Pick an event. Try the discouraged worker first: the unemployment rate falls, but nobody got a job.'}
      </p>
    </div>
  );
}
