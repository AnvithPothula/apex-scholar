import React, { useState } from 'react';

/** n independent trials with success probability p. Exported for tests. */
export function simulate(p, n, rng = Math.random) {
  return Array.from({ length: n }, () => rng() < p);
}

/** Running relative frequency of success after each trial. Exported for tests. */
export function runningProportions(outcomes) {
  let hits = 0;
  return outcomes.map((o, i) => (hits += o ? 1 : 0) / (i + 1));
}

const EVENTS = [
  { label: 'Coin lands heads', p: 0.5 },
  { label: 'Die shows a 6', p: 1 / 6 },
  { label: 'Spinner lands on red (30%)', p: 0.3 },
];
const MAX = 5000;
const W = 300;
const H = 150;
const PAD = { l: 30, r: 8, t: 8, b: 22 };

/**
 * The law of large numbers by doing it: run trials of a chance process and
 * watch the running relative frequency settle toward the true probability.
 * Modeled on the law-of-large-numbers MicroSim in Dan McCreary's "Statistics"
 * (CC BY-NC-SA 4.0), rebuilt as an Apex component.
 */
export default function LargeNumbersLab() {
  const [ev, setEv] = useState(0);
  const [outcomes, setOutcomes] = useState([]);
  const { p } = EVENTS[ev];
  const run = (k) => setOutcomes((o) => o.concat(simulate(p, Math.min(k, MAX - o.length))));
  const pick = (i) => { setEv(i); setOutcomes([]); };
  const props = runningProportions(outcomes);
  const n = outcomes.length;
  const last = n ? props[n - 1] : null;

  // Log-scaled trial axis, so the jumpy early trials aren't squashed against
  // the left edge. Draw every early trial, then geometrically spaced ones.
  const span = Math.log10(Math.max(n, 10));
  const xs = (i) => PAD.l + (Math.log10(i + 1) / span) * (W - PAD.l - PAD.r);
  const ys = (v) => PAD.t + (1 - v) * (H - PAD.t - PAD.b);
  const idx = [];
  for (let i = 0; i < Math.min(n, 200); i++) idx.push(i);
  for (let x = 200; x < n; x *= 1.02) idx.push(Math.floor(x));
  if (n > 200) idx.push(n - 1);
  const pts = idx.map((i) => `${xs(i).toFixed(1)},${ys(props[i]).toFixed(1)}`);
  const ticks = [1, 10, 100, 1000].filter((t) => t <= Math.max(n, 10));
  const btn = 'px-2.5 py-1 rounded border border-border-strong text-body-sm text-content-primary disabled:opacity-40';

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · law of large numbers</p>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Chance process">
        {EVENTS.map((e, i) => (
          <button key={e.label} type="button" aria-pressed={ev === i} onClick={() => pick(i)}
            className={`px-2.5 py-1 rounded border text-body-sm ${ev === i ? 'border-primary-500 bg-primary-900/40 text-content-primary' : 'border-border-strong text-content-secondary'}`}>{e.label}</button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto block mt-3" role="img"
        aria-label={n ? `After ${n} trials the relative frequency is ${last.toFixed(3)}; the true probability is ${p.toFixed(3)}` : 'No trials yet'}>
        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={ys(v)} y2={ys(v)} className="stroke-border-strong" opacity="0.5" />
            <text x={PAD.l - 4} y={ys(v) + 3} fontSize="9" textAnchor="end" className="fill-content-muted">{v}</text>
          </g>
        ))}
        <line x1={PAD.l} x2={W - PAD.r} y1={ys(p)} y2={ys(p)} strokeDasharray="4 3" className="stroke-warning-400" />
        <text x={W - PAD.r} y={ys(p) - 4} fontSize="9" textAnchor="end" className="fill-warning-400">true P = {p.toFixed(3)}</text>
        {n > 0 && <polyline points={pts.join(' ')} fill="none" className="stroke-primary-400" strokeWidth="1.8" />}
        {ticks.map((t) => <text key={t} x={xs(t - 1)} y={H - 10} fontSize="8" textAnchor="middle" className="fill-content-muted">{t}</text>)}
        <text x={(W + PAD.l) / 2} y={H - 1} fontSize="8" textAnchor="middle" className="fill-content-muted">number of trials (log scale)</text>
      </svg>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {[1, 10, 100, 1000].map((k) => (
          <button key={k} type="button" className={btn} disabled={n >= MAX} onClick={() => run(k)}>+{k} trial{k > 1 ? 's' : ''}</button>
        ))}
        <button type="button" className={btn} disabled={!n} onClick={() => setOutcomes([])}>Reset</button>
      </div>
      <p className="text-body-sm text-content-secondary mt-3" aria-live="polite">
        {n
          ? `${n} trials, ${outcomes.filter(Boolean).length} successes: relative frequency ${last.toFixed(3)}, off from the true probability by ${Math.abs(last - p).toFixed(3)}.`
          : 'Run a few trials, then a few thousand. Early on the line jumps around; with more trials it settles near the dashed line.'}
      </p>
      <p className="text-caption text-content-muted mt-1">Each run is random, so yours will differ from a classmate's. The settling is what's guaranteed, not the exact path. Up to {MAX} trials.</p>
    </div>
  );
}
