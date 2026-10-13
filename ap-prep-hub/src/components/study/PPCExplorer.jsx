import React, { useState } from 'react';

const XMAX = 100; const YMAX = 100; // maximum robots and wheat with today's resources

/**
 * Most wheat that can be made alongside x robots. Bowed-out (increasing
 * opportunity cost) is a quarter ellipse; constant opportunity cost is a
 * straight line. `growth` stretches both axes. Exported for tests.
 */
export function ppcY(x, { bowed = true, growth = 1 } = {}) {
  const xm = XMAX * growth; const ym = YMAX * growth;
  if (x < 0 || x > xm) return NaN;
  return bowed ? ym * Math.sqrt(1 - (x / xm) ** 2) : ym * (1 - x / xm);
}

/** Wheat given up for one more robot at x (the slope of the curve). Exported for tests. */
export function opportunityCost(x, opts = {}) {
  const xm = XMAX * (opts.growth || 1);
  const a = Math.min(x, xm - 1);
  return ppcY(a, opts) - ppcY(a + 1, opts);
}

const W = 300; const H = 220; const L = 34; const B = 30;
const sx = (v) => L + (v / 130) * (W - L - 10);
const sy = (v) => H - B - (v / 130) * (H - B - 10);
const curve = (opts) => {
  const xm = XMAX * (opts.growth || 1);
  const pts = [];
  for (let i = 0; i <= 60; i += 1) { const x = (xm * i) / 60; pts.push(`${sx(x).toFixed(1)},${sy(ppcY(x, opts)).toFixed(1)}`); }
  return pts.join(' ');
};

/**
 * A country's production possibilities for robots and wheat. Slide along the
 * curve to see the opportunity cost of one more robot, leave resources idle to
 * fall inside it, or add resources/technology to shift it out.
 */
export default function PPCExplorer() {
  const [bowed, setBowed] = useState(true);
  const [x, setX] = useState(50);
  const [use, setUse] = useState(100);
  const [growth, setGrowth] = useState(1);
  const opts = { bowed, growth: 1 };
  const onCurve = ppcY(x, opts);
  const point = { x: x * (use / 100), y: onCurve * (use / 100) };
  const oc = opportunityCost(x, opts);
  const beyond = growth > 1;

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · production possibilities curve</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Opportunity cost">
        {[[true, 'Increasing opportunity cost'], [false, 'Constant opportunity cost']].map(([v, label]) => (
          <button key={label} type="button" onClick={() => setBowed(v)} aria-pressed={bowed === v}
            className={`px-3 py-1.5 rounded-md border text-body-sm ${bowed === v ? 'border-primary-500 bg-primary-900/40 text-content-primary' : 'border-border-strong text-content-secondary'}`}>
            {label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto block mt-2" role="img"
        aria-label={`Producing ${Math.round(point.x)} robots and ${Math.round(point.y)} tons of wheat; ${use < 100 ? 'inside the curve, inefficient' : 'on the curve, efficient'}`}>
        <line x1={L} y1={sy(0)} x2={W - 6} y2={sy(0)} className="stroke-border-strong" />
        <line x1={L} y1={sy(0)} x2={L} y2="6" className="stroke-border-strong" />
        {[50, 100].map((v) => (
          <g key={v}>
            <text x={sx(v)} y={sy(0) + 12} fontSize="9" textAnchor="middle" className="fill-content-muted">{v}</text>
            <text x={L - 4} y={sy(v) + 3} fontSize="9" textAnchor="end" className="fill-content-muted">{v}</text>
          </g>
        ))}
        <text x={(W + L) / 2} y={H - 4} fontSize="9" textAnchor="middle" className="fill-content-secondary">Robots</text>
        <text x="9" y={(H - B) / 2} fontSize="9" textAnchor="middle" transform={`rotate(-90 9 ${(H - B) / 2})`} className="fill-content-secondary">Wheat (tons)</text>
        {beyond && <polyline points={curve({ bowed, growth })} fill="none" strokeWidth="2" strokeDasharray="5 3" className="stroke-success-400" />}
        <polyline points={curve(opts)} fill="none" strokeWidth="2.5" className="stroke-primary-400" />
        <circle cx={sx(point.x)} cy={sy(point.y)} r="5" className={use < 100 ? 'fill-warning-400' : 'fill-content-primary'} />
      </svg>
      <p className="text-caption text-content-muted text-center">
        <span className="text-primary-400">━</span> today&apos;s PPC{beyond && <span className="text-success-400 ml-2">┅ after growth</span>}
      </p>
      <div className="grid sm:grid-cols-3 gap-3 mt-3">
        <label className="block">
          <span className="text-body-sm text-content-primary">Robots: <strong>{x}</strong></span>
          <input type="range" min="0" max="100" step="5" value={x} onChange={(e) => setX(Number(e.target.value))} className="w-full mt-1 accent-primary-500" aria-valuetext={`${x} robots`} />
        </label>
        <label className="block">
          <span className="text-body-sm text-content-primary">Resources in use: <strong>{use}%</strong></span>
          <input type="range" min="50" max="100" step="5" value={use} onChange={(e) => setUse(Number(e.target.value))} className="w-full mt-1 accent-primary-500" aria-valuetext={`${use} percent`} />
        </label>
        <label className="block">
          <span className="text-body-sm text-content-primary">Economic growth: <strong>+{Math.round((growth - 1) * 100)}%</strong></span>
          <input type="range" min="1" max="1.3" step="0.05" value={growth} onChange={(e) => setGrowth(Number(e.target.value))} className="w-full mt-1 accent-primary-500" aria-valuetext={`${Math.round((growth - 1) * 100)} percent more resources`} />
        </label>
      </div>
      <p className="text-body-sm text-content-secondary mt-3" aria-live="polite">
        {use < 100
          ? `Inside the curve: with ${100 - use}% of resources idle (unemployment, unused factories), the economy is inefficient. It could make more of both goods.`
          : x >= 100
            ? 'All resources go to robots: no wheat at all.'
            : `On the curve (efficient). One more robot costs about ${oc.toFixed(1)} tons of wheat.${bowed ? ' Slide right: each extra robot costs more wheat, because resources better suited to farming get moved into factories.' : ' With constant opportunity cost, every robot costs the same 1 ton.'}`}
        {beyond && ' The dashed curve shows growth (more resources or better technology): points beyond today\'s curve become attainable.'}
      </p>
    </div>
  );
}
