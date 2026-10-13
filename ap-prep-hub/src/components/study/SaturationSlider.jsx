import React, { useState } from 'react';

const SEGMENTS = 12;
const LEN = 14;
const TAILS = 4;

/**
 * Points along one fatty-acid tail. Each double bond bends the chain ~30°,
 * placed evenly down the tail and alternating direction (so the tail stays in
 * frame), so more double bonds = more kinks.
 */
export function tailPoints(doubleBonds, x0 = 0) {
  const kinkAt = new Set(Array.from({ length: doubleBonds }, (_, i) => Math.round(((i + 1) * SEGMENTS) / (doubleBonds + 1))));
  let x = x0;
  let y = 6;
  let angle = Math.PI / 2; // straight down
  const pts = [[x, y]];
  const doubles = [];
  for (let i = 0; i < SEGMENTS; i++) {
    if (kinkAt.has(i)) { angle += doubles.length % 2 ? 0.52 : -0.52; doubles.push(i); }
    const zig = i % 2 ? 0.35 : -0.35; // the usual carbon zig-zag
    x += Math.cos(angle + zig) * LEN;
    y += Math.sin(angle + zig) * LEN;
    pts.push([x, y]);
  }
  return { pts, doubles };
}

const STATES = [
  { name: 'Saturated', note: 'Only single bonds. The tails are straight and pack tightly, so the fat is solid at room temperature (like butter).' },
  { name: 'Monounsaturated', note: 'One double bond puts one kink in each tail. They can\'t pack tightly, so the fat is liquid at room temperature (like olive oil).' },
  { name: 'Polyunsaturated', note: 'More double bonds, more kinks, even looser packing: more liquid still.' },
  { name: 'Polyunsaturated', note: 'More double bonds, more kinks, even looser packing: more liquid still.' },
];

/** Add double bonds and watch neighbouring tails stop packing together. */
export default function SaturationSlider() {
  const [db, setDb] = useState(0);
  const state = STATES[db];
  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · saturated vs unsaturated</p>
      <svg viewBox="0 0 300 190" className="w-full max-w-sm mx-auto block text-content-secondary" role="img"
        aria-label={`${TAILS} fatty acid tails with ${db} double bond${db === 1 ? '' : 's'} each`}>
        {Array.from({ length: TAILS }).map((_, t) => {
          // Kinked tails can't pack, so the same four take up more room.
          const gap = 22 + db * 14;
          const { pts, doubles } = tailPoints(db, 140 - (gap * (TAILS - 1)) / 2 + t * gap);
          return (
            <g key={t}>
              <circle cx={pts[0][0]} cy={pts[0][1]} r="6" className="fill-current text-primary-500" />
              {pts.slice(1).map(([x, y], i) => (
                <line key={i} x1={pts[i][0]} y1={pts[i][1]} x2={x} y2={y}
                  stroke="currentColor" strokeWidth={doubles.includes(i) ? 4 : 2}
                  className={doubles.includes(i) ? 'text-warning-400' : ''} strokeLinecap="round" />
              ))}
            </g>
          );
        })}
      </svg>
      <label className="block mt-3">
        <span className="text-body-sm text-content-primary">C=C double bonds per tail: <strong>{db}</strong></span>
        <input type="range" min="0" max="3" step="1" value={db} onChange={(e) => setDb(Number(e.target.value))}
          className="w-full mt-1 accent-primary-500" aria-valuetext={`${db} double bonds`} />
      </label>
      <p className="text-body-sm text-content-secondary mt-2" aria-live="polite">
        <strong className="text-content-primary">{state.name}.</strong> {state.note}
      </p>
    </div>
  );
}
