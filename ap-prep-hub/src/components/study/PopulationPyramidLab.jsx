import React, { useState } from 'react';

// 0–4, 5–9, …, 100+. Going up to 100+ keeps the open-ended top bar small;
// an 80+ bar would hold everyone past 80 and tower over the cohorts below.
const AGES = Array.from({ length: 21 }, (_, i) => i * 5);

/**
 * A simplified stable population: survival to age a combines child mortality
 * and a Gompertz adult curve, scaled so its mean is the life expectancy; the growth rate r is the one that
 * makes births per person equal the crude birth rate. Cohort sizes are then
 * e^(−ra)·l(a). Real pyramids have bumps from wars, booms and migration; this
 * model has none of that, on purpose. Exported for tests.
 */
export function stablePopulation(cbr, e0) {
  // Child survival to age 5 falls as life expectancy falls (most deaths in
  // high-mortality societies are of young children). Adult deaths follow a
  // Gompertz curve (risk of death rising about 10% a year with age), scaled
  // until the whole life table's mean equals e0.
  const s5 = 1 - 0.4 * Math.max(0, (85 - e0) / 55) ** 2;
  const child = (a) => s5 + (1 - s5) * Math.exp(-a);
  const B = 0.1;
  const adult = (A, a) => Math.exp(-(A / B) * (Math.exp(B * a) - 1));
  const mean = (A) => { let m = 0; for (let a = 0.5; a < 120; a += 1) m += child(a) * adult(A, a); return m; };
  let lo0 = -16; let hi0 = 0; // log A
  for (let i = 0; i < 60; i++) { const mid = (lo0 + hi0) / 2; if (mean(Math.exp(mid)) > e0) lo0 = mid; else hi0 = mid; }
  const A = Math.exp((lo0 + hi0) / 2);
  const l = (a) => child(a) * adult(A, a);
  const integral = (r) => { let s = 0; for (let a = 0.5; a < 120; a += 1) s += Math.exp(-r * a) * l(a); return s; };
  // births per person = 1 / ∫e^(−ra)l(a)da; solve for r by bisection
  let lo = -0.1; let hi = 0.1;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (1 / integral(mid) > cbr / 1000) hi = mid; else lo = mid;
  }
  const r = (lo + hi) / 2;
  const cohorts = AGES.map((a, i) => {
    const top = i === AGES.length - 1 ? 120 : a + 5;
    let s = 0; for (let x = a + 0.5; x < top; x += 1) s += Math.exp(-r * x) * l(x);
    return s;
  });
  const total = cohorts.reduce((x, y) => x + y, 0);
  const share = cohorts.map((c) => c / total);
  const young = share.slice(0, 3).reduce((x, y) => x + y, 0);
  const old = share.slice(13).reduce((x, y) => x + y, 0);
  const nir = r * 100; // percent per year
  const cdr = cbr - r * 1000;
  let stage;
  if (nir < -0.05) stage = 5;
  else if (cdr >= 25) stage = 1;
  else if (cbr >= 30) stage = 2;
  else if (cbr >= 18) stage = 3;
  else stage = 4;
  return {
    r, nir, cdr, share, young, old,
    dependency: ((young + old) / (1 - young - old)) * 100,
    doubling: nir > 0.05 ? 70 / nir : null,
    stage,
  };
}

const STAGES = {
  1: 'Stage 1: high birth and death rates, little growth (no country today)',
  2: 'Stage 2: death rates fall, births stay high, rapid growth',
  3: 'Stage 3: birth rates fall, growth slows',
  4: 'Stage 4: low birth and death rates, little growth',
  5: 'Stage 5: deaths outnumber births, the population shrinks',
};
const W = 300;
const ROW = 9;

/**
 * Set a crude birth rate and a life expectancy and see the population
 * pyramid, natural increase, doubling time, dependency ratio and the
 * demographic-transition stage they resemble.
 */
export default function PopulationPyramidLab() {
  const [cbr, setCbr] = useState(36);
  const [e0, setE0] = useState(30);
  const p = stablePopulation(cbr, e0);
  const maxShare = Math.max(...p.share);
  const half = (W - 60) / 2;
  const cx = W / 2;
  const H = AGES.length * ROW + 18;
  const f1 = (n) => n.toFixed(1);

  const slider = (label, value, set, min, max, text) => (
    <label className="block">
      <span className="text-body-sm text-content-primary">{label}: <strong>{text}</strong></span>
      <input type="range" min={min} max={max} step="1" value={value} onChange={(e) => set(Number(e.target.value))}
        className="w-full mt-1 accent-primary-500" aria-valuetext={text} />
    </label>
  );

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · population pyramid</p>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
        {slider('Crude birth rate', cbr, setCbr, 6, 50, `${cbr} per 1,000`)}
        {slider('Life expectancy', e0, setE0, 30, 85, `${e0} years`)}
      </div>
      <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 items-center mt-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm mx-auto block" role="img"
          aria-label={`Population pyramid: ${f1(p.young * 100)}% under 15, ${f1(p.old * 100)}% aged 65 and over`}>
          {p.share.map((s, i) => {
            const y = H - 16 - (i + 1) * ROW;
            const w = (s / maxShare) * half * 0.98;
            return (
              <g key={i}>
                <rect x={cx - 1 - w} y={y} width={w} height={ROW - 2} className="fill-info-500" />
                <rect x={cx + 1} y={y} width={w} height={ROW - 2} className="fill-error-400" opacity="0.85" />
                {i % 2 === 0 && <text x="2" y={y + ROW - 3} fontSize="8" className="fill-content-muted">{i === AGES.length - 1 ? '100+' : `${AGES[i]}–${AGES[i] + 4}`}</text>}
              </g>
            );
          })}
          <text x={cx - 6} y={H - 3} fontSize="9" textAnchor="end" className="fill-info-400">male</text>
          <text x={cx + 6} y={H - 3} fontSize="9" className="fill-error-400">female</text>
        </svg>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-body-sm">
          <dt className="text-content-muted">Crude death rate</dt><dd className="text-content-primary">{f1(p.cdr)} per 1,000</dd>
          <dt className="text-content-muted">Natural increase</dt><dd className="text-content-primary">{f1(p.nir)}% per year</dd>
          <dt className="text-content-muted">Doubling time</dt><dd className="text-content-primary">{p.doubling ? `about ${Math.round(70 / Number(f1(p.nir)))} years (70 ÷ ${f1(p.nir)})` : p.nir < -0.05 ? 'shrinking' : 'not doubling'}</dd>
          <dt className="text-content-muted">Under 15</dt><dd className="text-content-primary">{f1(p.young * 100)}%</dd>
          <dt className="text-content-muted">65 and over</dt><dd className="text-content-primary">{f1(p.old * 100)}%</dd>
          <dt className="text-content-muted">Dependency ratio</dt><dd className="text-content-primary">{Math.round(p.dependency)} per 100 workers</dd>
        </dl>
      </div>
      <p className="text-body-sm text-content-secondary mt-3" aria-live="polite">Closest to {STAGES[p.stage]}.</p>
      <p className="text-caption text-content-muted mt-1">A simplified model with steady rates and no migration, wars or baby booms, which is why its pyramids are smooth. Males and females are drawn equal.</p>
    </div>
  );
}
