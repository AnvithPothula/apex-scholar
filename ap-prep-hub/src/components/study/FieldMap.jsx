import React, { useState } from 'react';

/**
 * Net electric field at (x, y) from point charges [{ q, x, y }], by
 * superposition, in units where k = 1. Exported for tests.
 */
export function fieldAt(x, y, charges) {
  let ex = 0; let ey = 0;
  for (const c of charges) {
    const dx = x - c.x; const dy = y - c.y;
    const r2 = dx * dx + dy * dy;
    if (r2 < 1e-9) continue;
    const r = Math.sqrt(r2);
    ex += (c.q * dx) / (r2 * r);
    ey += (c.q * dy) / (r2 * r);
  }
  return [ex, ey];
}

const W = 300; const H = 200;
const COLS = 15; const ROWS = 10;

/**
 * A vector field map for two point charges: arrows show the direction of E
 * at each grid point (brighter = stronger). Change the right-hand charge and
 * watch the map switch between the "like charges" and "dipole" patterns.
 */
export default function FieldMap() {
  const [q2, setQ2] = useState(-1);
  const charges = [{ q: 1, x: 100, y: 100 }, { q: q2, x: 200, y: 100 }];
  const arrows = [];
  let max = 0;
  const cells = [];
  for (let i = 0; i < COLS; i += 1) {
    for (let j = 0; j < ROWS; j += 1) {
      const x = (i + 0.5) * (W / COLS); const y = (j + 0.5) * (H / ROWS);
      // Skip points so close that the arrow would cover the charge (r = 9) itself.
      const near = charges.some((c) => c.q !== 0 && Math.hypot(x - c.x, y - c.y) < 17);
      if (near) continue;
      const [ex, ey] = fieldAt(x, y, charges);
      const m = Math.hypot(ex, ey);
      max = Math.max(max, m);
      cells.push({ x, y, ex, ey, m });
    }
  }
  for (const c of cells) {
    if (c.m === 0) continue;
    const len = 7;
    const ux = c.ex / c.m; const uy = c.ey / c.m;
    // Opacity on a log scale: field strength spans orders of magnitude.
    const o = Math.max(0.15, Math.min(1, 1 + Math.log10(c.m / max) / 2.2));
    arrows.push(
      <g key={`${c.x},${c.y}`} style={{ opacity: o }}>
        <line x1={c.x - ux * len} y1={c.y - uy * len} x2={c.x + ux * len} y2={c.y + uy * len} strokeWidth="1.4" className="stroke-primary-400" />
        <polygon points={`${c.x + ux * len},${c.y + uy * len} ${c.x + ux * (len - 4) - uy * 2.5},${c.y + uy * (len - 4) + ux * 2.5} ${c.x + ux * (len - 4) + uy * 2.5},${c.y + uy * (len - 4) - ux * 2.5}`} className="fill-primary-400" />
      </g>,
    );
  }
  const [mx, my] = fieldAt(150, 100, charges);
  const mid = Math.hypot(mx, my) < 1e-12 ? 'zero' : mx > 0 ? 'to the right' : 'to the left';
  const label = (q) => (q > 0 ? `+${q}` : `${q}`);

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · electric field map</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto block rounded-md bg-base-900" role="img"
        aria-label={`Field map for charges +1 q and ${label(q2)} q; field at the midpoint is ${mid}`}>
        {arrows}
        {charges.map((c, i) => c.q !== 0 && (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r="9" className={c.q > 0 ? 'fill-error-400' : 'fill-info-400'} />
            <text x={c.x} y={c.y + 4} fontSize="11" textAnchor="middle" className="fill-base-950 font-bold">{c.q > 0 ? '+' : '−'}</text>
          </g>
        ))}
        <circle cx="150" cy="100" r="2.5" className="fill-warning-400" />
      </svg>
      <label className="block mt-3">
        <span className="text-body-sm text-content-primary">Right-hand charge: <strong>{label(q2)} q</strong> (left is +1 q)</span>
        <input type="range" min="-2" max="2" step="0.5" value={q2} onChange={(e) => setQ2(Number(e.target.value))}
          className="w-full mt-1 accent-primary-500" aria-valuetext={`${label(q2)} q`} />
      </label>
      <p className="text-body-sm text-content-secondary mt-2" aria-live="polite">
        At the midpoint (yellow dot) the net field is <strong>{mid}</strong>.{' '}
        {q2 === 1 && 'Equal like charges: their fields cancel exactly at the midpoint, and the lines push apart.'}
        {q2 < 0 && 'Opposite charges: both fields point from + toward −, so they add at the midpoint, a dipole pattern.'}
        {q2 === 0 && 'With only one charge, the field points radially away from it, weakening as 1/r².'}
        {q2 > 0 && q2 !== 1 && 'Unequal like charges: the zero-field point moves toward the smaller charge.'}
        {' '}Arrows show direction only; brighter means stronger.
      </p>
    </div>
  );
}
