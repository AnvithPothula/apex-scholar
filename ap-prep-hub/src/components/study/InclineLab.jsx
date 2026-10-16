import React, { useState } from 'react';

const G = 10; // m/s², as on the AP Physics 1 exam

/**
 * Forces on a block that starts at rest on an incline. Static friction holds
 * it if mg·sinθ ≤ μs·N; otherwise it slides and kinetic friction μk·N acts.
 * Exported for tests.
 */
export function inclineForces({ deg, m, mus, muk }) {
  const th = (deg * Math.PI) / 180;
  const weight = m * G;
  const along = weight * Math.sin(th);
  const normal = weight * Math.cos(th);
  const staticMax = mus * normal;
  const slides = along > staticMax + 1e-9;
  const friction = slides ? muk * normal : along;
  const net = slides ? along - friction : 0;
  return { weight, along, normal, staticMax, slides, friction, net, a: net / m };
}

const r1 = (n) => (Math.abs(n) < 0.005 ? '0' : n.toFixed(1));

/**
 * Tilt an incline, change the surfaces, and see when static friction stops
 * holding the block. Modeled on the inclined-plane and static friction
 * MicroSims in Dan McCreary's "Introduction to Physics" (CC BY-NC-SA 4.0),
 * rebuilt as an Apex component. The drawing shows whole forces from the
 * block's center, as the exam's free-body diagrams require, not components.
 */
export default function InclineLab() {
  const [deg, setDeg] = useState(20);
  const [m, setM] = useState(2);
  const [mus, setMus] = useState(0.5);
  const [muk, setMuk] = useState(0.3);
  const f = inclineForces({ deg, m, mus, muk });

  // Geometry (SVG y points down). Incline from (20, 200), length 200.
  const th = (deg * Math.PI) / 180;
  const L = 200;
  const top = [20 + L * Math.cos(th), 200 - L * Math.sin(th)];
  const u = [Math.cos(th), -Math.sin(th)]; // up the slope
  const n = [-Math.sin(th), -Math.cos(th)]; // away from the surface
  const s = 0.55 * L;
  const h = 28;
  const c = [20 + s * u[0] + n[0] * (h / 2), 200 + s * u[1] + n[1] * (h / 2)];
  const scale = 75 / f.weight; // weight arrow is 75 px
  const arrow = (dir, F) => [c[0] + dir[0] * F * scale, c[1] + dir[1] * F * scale];
  const forces = [
    { key: 'g', end: arrow([0, 1], f.weight), cls: 'text-warning-400', label: 'Fg' },
    { key: 'n', end: arrow(n, f.normal), cls: 'text-info-400', label: 'Fn' },
    ...(f.friction > 1e-9 ? [{ key: 'f', end: arrow(u, f.friction), cls: 'text-error-400', label: f.slides ? 'fk' : 'fs' }] : []),
  ];

  const slider = (label, value, set, min, max, step, text) => (
    <label className="block">
      <span className="text-body-sm text-content-primary">{label}: <strong>{text}</strong></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))}
        className="w-full mt-1 accent-primary-500" aria-valuetext={text} />
    </label>
  );

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · block on an incline</p>
      <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 items-center">
        <svg viewBox="0 0 300 275" className="w-full max-w-sm mx-auto" role="img"
          aria-label={`Incline at ${deg} degrees; the block ${f.slides ? 'slides' : 'stays at rest'}`}>
          <defs>
            {/* One marker per color: a marker's currentColor comes from <defs>, not the line using it. */}
            {forces.map((fo) => (
              <marker key={fo.key} id={`incline-head-${fo.key}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6"
                orient="auto-start-reverse" className={fo.cls}>
                <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
              </marker>
            ))}
          </defs>
          <polygon points={`20,200 ${top[0]},200 ${top[0]},${top[1]}`} className="fill-base-800 stroke-border-strong" strokeWidth="1.5" />
          <rect x={c[0] - 18} y={c[1] - h / 2} width="36" height={h} rx="3"
            transform={`rotate(${-deg} ${c[0]} ${c[1]})`} className="fill-primary-900 stroke-primary-400" strokeWidth="1.5" />
          {forces.map((fo) => (
            <g key={fo.key} className={fo.cls}>
              <line x1={c[0]} y1={c[1]} x2={fo.end[0]} y2={fo.end[1]} stroke="currentColor" strokeWidth="2.5" markerEnd={`url(#incline-head-${fo.key})`} />
              <text x={fo.end[0] + (fo.key === 'g' || fo.end[0] >= c[0] ? 6 : -6)} y={fo.end[1] + (fo.key === 'g' ? -2 : -4)}
                textAnchor={fo.key === 'g' || fo.end[0] >= c[0] ? 'start' : 'end'} fill="currentColor" fontSize="12" fontWeight="600">{fo.label}</text>
            </g>
          ))}
          <circle cx={c[0]} cy={c[1]} r="2.5" className="fill-content-primary" />
          <text x="34" y="194" fontSize="11" className="fill-content-muted">{deg}°</text>
        </svg>
        <div className="space-y-1 text-body-sm">
          <Row label="Weight, mg" value={`${r1(f.weight)} N`} cls="text-warning-400" />
          <Row label="Normal force, mg cos θ" value={`${r1(f.normal)} N`} cls="text-info-400" />
          <Row label="Pull down the slope, mg sin θ" value={`${r1(f.along)} N`} />
          <Row label="Max static friction, μs·Fn" value={`${r1(f.staticMax)} N`} />
          <Row label={f.slides ? 'Kinetic friction, μk·Fn' : 'Static friction (only what\'s needed)'} value={`${r1(f.friction)} N`} cls="text-error-400" />
          <Row label="Net force along the slope" value={`${r1(f.net)} N`} />
          <Row label="Acceleration" value={`${r1(f.a)} m/s²`} />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mt-4">
        {slider('Angle θ', deg, setDeg, 0, 60, 1, `${deg}°`)}
        {slider('Mass', m, setM, 1, 10, 1, `${m} kg`)}
        {slider('Static coefficient μs', mus, (v) => { setMus(v); if (muk > v) setMuk(v); }, 0, 1, 0.05, mus.toFixed(2))}
        {slider('Kinetic coefficient μk (≤ μs)', muk, (v) => setMuk(Math.min(v, mus)), 0, 1, 0.05, muk.toFixed(2))}
      </div>
      <p className="text-body-sm text-content-secondary mt-3" aria-live="polite">
        {f.slides
          ? `mg sin θ (${r1(f.along)} N) is more than static friction can supply (${r1(f.staticMax)} N), so the block slides and kinetic friction takes over: a = ${r1(f.a)} m/s² down the slope.`
          : `Static friction supplies exactly ${r1(f.friction)} N, matching the pull down the slope, so the net force is zero and the block stays at rest. Tilt past tan⁻¹(μs) = ${r1((Math.atan(mus) * 180) / Math.PI)}° and it slips.`}
      </p>
      <p className="text-caption text-content-muted mt-1">g = 10 N/kg. Mass changes every force equally, so it never decides whether the block slips.</p>
    </div>
  );
}

function Row({ label, value, cls = 'text-content-primary' }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border-subtle py-1">
      <span className="text-content-secondary">{label}</span>
      <span className={`font-semibold tabular-nums whitespace-nowrap ${cls}`}>{value}</span>
    </div>
  );
}
