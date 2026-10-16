import React, { useState } from 'react';

// Populations of the values 0–9 (say, minutes waited), as relative weights.
export const POPULATIONS = {
  'Right-skewed': [30, 22, 15, 10, 8, 6, 4, 3, 1, 1],
  Uniform: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  Bimodal: [10, 8, 3, 1, 0.5, 0.5, 1, 3, 8, 10],
};

/** Mean and standard deviation of a population of 0–9 with these weights. Exported for tests. */
export function popStats(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  const mu = weights.reduce((a, w, x) => a + x * w, 0) / total;
  const sigma = Math.sqrt(weights.reduce((a, w, x) => a + (x - mu) ** 2 * w, 0) / total);
  return { mu, sigma };
}

/** Means of `reps` random samples of size n drawn from the population. Exported for tests. */
export function sampleMeans(weights, n, reps, rng = Math.random) {
  const total = weights.reduce((a, b) => a + b, 0);
  const cum = [];
  weights.reduce((a, w, i) => (cum[i] = a + w / total), 0);
  const draw = () => { const u = rng(); const i = cum.findIndex((c) => u < c); return i < 0 ? 9 : i; };
  return Array.from({ length: reps }, () => {
    let s = 0;
    for (let k = 0; k < n; k++) s += draw();
    return s / n;
  });
}

const meanSd = (v) => {
  const m = v.reduce((a, b) => a + b, 0) / v.length;
  return { m, sd: Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / (v.length - 1)) };
};

const SIZES = [1, 2, 5, 10, 30];
const REPS = 1000;
const BINS = 30; // width 0.3 across 0–9
const W = 300;
const H = 130;
const sx = (v) => 10 + (v / 9) * (W - 20);

/**
 * The central limit theorem by simulation: pick a population shape and a
 * sample size, draw 1,000 random samples, and see the shape of the sample
 * means. Modeled on the CLT demonstration MicroSim in Dan McCreary's
 * "Statistics" (CC BY-NC-SA 4.0), rebuilt as an Apex component.
 */
export default function CLTLab() {
  const [pop, setPop] = useState('Right-skewed');
  const [n, setN] = useState(1);
  const [means, setMeans] = useState(() => sampleMeans(POPULATIONS['Right-skewed'], 1, REPS));
  const weights = POPULATIONS[pop];
  const { mu, sigma } = popStats(weights);
  const redraw = (p, size) => setMeans(sampleMeans(POPULATIONS[p], size, REPS));
  const choosePop = (p) => { setPop(p); redraw(p, n); };
  const chooseN = (size) => { setN(size); redraw(pop, size); };

  const counts = Array(BINS).fill(0);
  means.forEach((m) => { counts[Math.min(BINS - 1, Math.floor((m / 9) * BINS))] += 1; });
  const peak = Math.max(...counts);
  const { m, sd } = meanSd(means);
  const maxW = Math.max(...weights);
  const btn = (on) => `px-2.5 py-1 rounded border text-body-sm ${on ? 'border-primary-500 bg-primary-900/40 text-content-primary' : 'border-border-strong text-content-secondary'}`;

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · central limit theorem</p>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <div>
          <p className="text-caption text-content-muted mb-1">Population</p>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Population shape">
            {Object.keys(POPULATIONS).map((p) => (
              <button key={p} type="button" aria-pressed={pop === p} onClick={() => choosePop(p)} className={btn(pop === p)}>{p}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-caption text-content-muted mb-1">Sample size n</p>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Sample size">
            {SIZES.map((s) => (
              <button key={s} type="button" aria-pressed={n === s} onClick={() => chooseN(s)} className={btn(n === s)}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-caption text-content-muted mt-4">Population (values 0–9): μ = {mu.toFixed(2)}, σ = {sigma.toFixed(2)}</p>
      <svg viewBox={`0 0 ${W} 50`} className="w-full max-w-md mx-auto block" role="img" aria-label={`${pop} population`}>
        {weights.map((w, x) => (
          <rect key={x} x={sx(x) - 10} y={46 - (w / maxW) * 40} width="20" height={(w / maxW) * 40} className="fill-accent-500" opacity="0.6" />
        ))}
        <line x1="10" x2={W - 10} y1="46" y2="46" className="stroke-border-strong" />
      </svg>

      <p className="text-caption text-content-muted mt-3">Means of {REPS.toLocaleString()} random samples of size {n}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto block" role="img"
        aria-label={`Histogram of ${REPS} sample means for n = ${n}: centered at ${m.toFixed(2)} with standard deviation ${sd.toFixed(2)}`}>
        {counts.map((c, i) => (
          <rect key={i} x={10 + (i / BINS) * (W - 20)} y={H - 18 - (c / peak) * (H - 26)} width={(W - 20) / BINS - 1} height={(c / peak) * (H - 26)} className="fill-primary-500" />
        ))}
        <line x1="10" x2={W - 10} y1={H - 18} y2={H - 18} className="stroke-border-strong" />
        <line x1={sx(mu)} x2={sx(mu)} y1="4" y2={H - 18} strokeDasharray="3 3" className="stroke-warning-400" />
        {[0, 3, 6, 9].map((t) => <text key={t} x={sx(t)} y={H - 5} fontSize="9" textAnchor="middle" className="fill-content-muted">{t}</text>)}
      </svg>
      <div className="flex flex-wrap items-center gap-3 mt-2">
        <button type="button" onClick={() => redraw(pop, n)} className="px-3 py-1.5 rounded-md bg-primary-600 text-white text-body-sm">Draw new samples</button>
        <span className="text-body-sm text-content-secondary" aria-live="polite">Mean of the means {m.toFixed(2)} (μ = {mu.toFixed(2)}); their spread {sd.toFixed(2)} (σ = {sigma.toFixed(2)})</span>
      </div>
      <p className="text-caption text-content-muted mt-2">
        With n = 1 the means just copy the population. As n grows, the means pile up around μ in a more and more normal, bell shape, and their spread shrinks, whatever the population looks like. Unit 3 gives the formula for that spread.
      </p>
    </div>
  );
}
