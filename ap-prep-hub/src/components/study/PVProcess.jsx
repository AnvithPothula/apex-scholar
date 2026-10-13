import React, { useState } from 'react';

// Start state: 100 kPa and 2.0 L of an ideal monatomic gas. kPa × L = J, so
// every energy below is in joules without conversion factors.
const P1 = 100; const V1 = 2;
const GAMMA = 5 / 3;

const PROCESSES = {
  isobaric: { label: 'Isobaric', hint: 'constant pressure', vary: 'V' },
  isochoric: { label: 'Isovolumetric', hint: 'constant volume', vary: 'P' },
  isothermal: { label: 'Isothermal', hint: 'constant temperature', vary: 'V' },
  adiabatic: { label: 'Adiabatic', hint: 'no heat (Q = 0)', vary: 'V' },
};

/**
 * Final state and the first-law bookkeeping for one process starting at
 * (P1, V1). W is the work done ON the gas (W = −PΔV for constant pressure),
 * so ΔU = Q + W, as on the AP Physics 2 equation sheet. Energies in J.
 * `x` is the final volume (L) or, for the isovolumetric process, the final
 * pressure (kPa). Exported for tests.
 */
export function processStep(kind, x) {
  let P2; let V2; let W;
  if (kind === 'isobaric') { P2 = P1; V2 = x; W = -P1 * (V2 - V1); }
  else if (kind === 'isochoric') { P2 = x; V2 = V1; W = 0; }
  else if (kind === 'isothermal') { V2 = x; P2 = (P1 * V1) / V2; W = -P1 * V1 * Math.log(V2 / V1); }
  else { V2 = x; P2 = P1 * (V1 / V2) ** GAMMA; W = null; }
  const dU = 1.5 * (P2 * V2 - P1 * V1); // U = (3/2)nRT = (3/2)PV for a monatomic ideal gas
  if (kind === 'adiabatic') W = dU; // Q = 0, so all of ΔU came from work
  const Q = dU - W;
  return { P2, V2, W, dU, Q, Tratio: (P2 * V2) / (P1 * V1) };
}

/** Points along the process path, for drawing. */
function path(kind, x) {
  const pts = [];
  for (let i = 0; i <= 40; i += 1) {
    const t = i / 40;
    if (kind === 'isochoric') { pts.push([V1, P1 + (x - P1) * t]); continue; }
    const v = V1 + (x - V1) * t;
    const p = kind === 'isobaric' ? P1 : kind === 'isothermal' ? (P1 * V1) / v : P1 * (V1 / v) ** GAMMA;
    pts.push([v, p]);
  }
  return pts;
}

const W_ = 300; const H_ = 190; const L = 36; const B = 28;
const sx = (v) => L + (v / 4.5) * (W_ - L - 10);
const sy = (p) => H_ - B - (p / 350) * (H_ - B - 10);
const j = (n) => `${n > 0.5 ? '+' : n < -0.5 ? '−' : ''}${Math.abs(n) < 0.5 ? '0' : Math.round(Math.abs(n))} J`;

/**
 * Pick a process, change the volume (or pressure), and read W, Q and ΔU off
 * the first law. The shaded area under the path is |W|.
 */
export default function PVProcess() {
  const [kind, setKind] = useState('isobaric');
  const [x, setX] = useState(3);
  const meta = PROCESSES[kind];
  const r = processStep(kind, x);
  const pts = path(kind, x);
  const line = pts.map(([v, p]) => `${sx(v).toFixed(1)},${sy(p).toFixed(1)}`).join(' ');
  const area = `${sx(pts[0][0])},${sy(0)} ${line} ${sx(pts[pts.length - 1][0])},${sy(0)}`;

  const choose = (k) => { setKind(k); setX(PROCESSES[k].vary === 'P' ? 200 : 3); };

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · PV diagram and the first law</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Thermodynamic process">
        {Object.entries(PROCESSES).map(([k, p]) => (
          <button key={k} type="button" onClick={() => choose(k)} aria-pressed={kind === k}
            className={`px-3 py-1.5 rounded-md border text-body-sm transition-colors ${kind === k ? 'border-primary-500 bg-primary-900/40 text-content-primary' : 'border-border-strong text-content-secondary hover:text-content-primary'}`}>
            {p.label}
          </button>
        ))}
      </div>
      <p className="text-caption text-content-muted mt-1">{meta.hint}</p>
      <svg viewBox={`0 0 ${W_} ${H_}`} className="w-full max-w-md mx-auto block mt-2" role="img"
        aria-label={`${meta.label} process from 100 kPa, 2.0 L to ${Math.round(r.P2)} kPa, ${r.V2.toFixed(1)} L`}>
        <line x1={L} y1={sy(0)} x2={W_ - 6} y2={sy(0)} className="stroke-border-strong" />
        <line x1={L} y1={sy(0)} x2={L} y2="6" className="stroke-border-strong" />
        {[1, 2, 3, 4].map((v) => <text key={v} x={sx(v)} y={sy(0) + 12} fontSize="9" textAnchor="middle" className="fill-content-muted">{v}</text>)}
        {[100, 200, 300].map((p) => <text key={p} x={L - 4} y={sy(p) + 3} fontSize="9" textAnchor="end" className="fill-content-muted">{p}</text>)}
        <text x={(W_ + L) / 2} y={H_ - 4} fontSize="9" textAnchor="middle" className="fill-content-secondary">V (L)</text>
        <text x="8" y={(H_ - B) / 2} fontSize="9" textAnchor="middle" transform={`rotate(-90 8 ${(H_ - B) / 2})`} className="fill-content-secondary">P (kPa)</text>
        {kind !== 'isochoric' && <polygon points={area} className="fill-primary-500" style={{ opacity: 0.18 }} />}
        <polyline points={line} fill="none" strokeWidth="2.5" className="stroke-primary-400" />
        <circle cx={sx(V1)} cy={sy(P1)} r="4" className="fill-content-secondary" />
        <circle cx={sx(r.V2)} cy={sy(r.P2)} r="4" className="fill-warning-400" />
      </svg>
      <label className="block mt-2">
        <span className="text-body-sm text-content-primary">
          {meta.vary === 'P' ? 'Final pressure' : 'Final volume'}: <strong>{meta.vary === 'P' ? `${x} kPa` : `${x.toFixed(1)} L`}</strong>
        </span>
        <input type="range" min={meta.vary === 'P' ? 50 : 1} max={meta.vary === 'P' ? 200 : 4} step={meta.vary === 'P' ? 10 : 0.1}
          value={x} onChange={(e) => setX(Number(e.target.value))} className="w-full mt-1 accent-primary-500"
          aria-valuetext={meta.vary === 'P' ? `${x} kilopascals` : `${x} liters`} />
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-center">
        {[['Work on gas, W', j(r.W)], ['Heat in, Q', j(r.Q)], ['ΔU = Q + W', j(r.dU)], ['Temperature', `×${r.Tratio.toFixed(2)}`]].map(([k, v]) => (
          <div key={k} className="p-2 rounded-md bg-base-800">
            <div className="text-body font-semibold text-content-primary">{v}</div>
            <div className="text-caption text-content-muted">{k}</div>
          </div>
        ))}
      </div>
      <p className="text-body-sm text-content-secondary mt-3" aria-live="polite">
        {kind === 'isochoric' && 'No volume change, so no work: every joule of ΔU came from heating (or left by cooling).'}
        {kind === 'isobaric' && (r.V2 > V1
          ? 'The gas expands, so it does work and W on it is negative; the shaded area is |W|. Its temperature rises, so Q must cover both ΔU and the work.'
          : 'The gas is compressed: W on it is positive, yet its temperature falls, so it loses more energy by cooling than the work adds.')}
        {kind === 'isothermal' && 'Temperature is constant, so ΔU = 0 and Q = −W: the heat in equals the work the gas does.'}
        {kind === 'adiabatic' && 'No heat flows (Q = 0), so ΔU = W: compress it and it heats up; let it expand and it cools.'}
        {' '}Start state: 100 kPa, 2.0 L (gray dot).
      </p>
    </div>
  );
}
