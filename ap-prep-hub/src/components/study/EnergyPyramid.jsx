import React, { useState } from 'react';

const BAR = ['bg-primary-600', 'bg-primary-500', 'bg-primary-400', 'bg-accent-400'];
const LEVELS = ['Producers', 'Primary consumers', 'Secondary consumers', 'Tertiary consumers'];

/** Energy reaching each trophic level, given producer energy and the transfer efficiency (0–1). Exported for tests. */
export function energyLevels(producers, efficiency, n = LEVELS.length) {
  return Array.from({ length: n }, (_, i) => producers * efficiency ** i);
}

const fmt = (n) => (n >= 10 ? Math.round(n).toLocaleString('en-US') : n >= 1 ? n.toFixed(1) : n.toFixed(2));

/**
 * The 10% rule as a pyramid: set the producers' energy and the transfer
 * efficiency, and see how little reaches the top. Bar widths are on a log
 * scale, since on a linear one the top two levels are invisible.
 */
export default function EnergyPyramid() {
  const [base, setBase] = useState(20000);
  const [pct, setPct] = useState(10);
  const levels = energyLevels(base, pct / 100);
  const max = Math.log10(base);
  const width = (e) => Math.max(8, (Math.log10(Math.max(e, 1)) / max) * 100);

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · energy pyramid</p>
      <div className="flex flex-col-reverse gap-1.5" role="img"
        aria-label={levels.map((e, i) => `${LEVELS[i]}: ${fmt(e)} kcal per square metre per year`).join('; ')}>
        {levels.map((e, i) => (
          <div key={LEVELS[i]} className="flex flex-col items-center">
            <div className={`h-8 rounded-sm flex items-center justify-center text-caption font-semibold text-base-950 transition-all ${BAR[i]}`}
              style={{ width: `${width(e)}%` }}>
              {width(e) > 30 ? `${fmt(e)}` : ''}
            </div>
            <span className="text-caption text-content-muted mt-0.5">{LEVELS[i]}: {fmt(e)} kcal/m²/yr</span>
          </div>
        ))}
      </div>
      <p className="text-caption text-content-disabled text-center mt-1">Bar widths on a log scale</p>
      <div className="grid sm:grid-cols-2 gap-3 mt-3">
        <label className="block">
          <span className="text-body-sm text-content-primary">Energy captured by producers: <strong>{fmt(base)} kcal/m²/yr</strong></span>
          <input type="range" min="1000" max="50000" step="1000" value={base} onChange={(e) => setBase(Number(e.target.value))}
            className="w-full mt-1 accent-primary-500" aria-valuetext={`${base} kcal per square metre per year`} />
        </label>
        <label className="block">
          <span className="text-body-sm text-content-primary">Passed to the next level: <strong>{pct}%</strong></span>
          <input type="range" min="5" max="20" step="1" value={pct} onChange={(e) => setPct(Number(e.target.value))}
            className="w-full mt-1 accent-primary-500" aria-valuetext={`${pct} percent`} />
        </label>
      </div>
      <p className="text-body-sm text-content-secondary mt-3" aria-live="polite">
        Only {fmt(levels[3])} of {fmt(base)} kcal reach the tertiary consumers ({((levels[3] / base) * 100).toPrecision(2)}%).
        The other {100 - pct}% at each step is used for the organisms' own life processes and lost as heat, which is why food
        chains rarely have more than four or five levels.
      </p>
    </div>
  );
}
