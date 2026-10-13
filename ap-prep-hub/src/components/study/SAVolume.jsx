import React, { useState } from 'react';

/** SA, V and SA:V for a cube of side s. Exported for tests. */
export function cubeStats(s) {
  const sa = 6 * s * s;
  const v = s * s * s;
  return { sa, v, ratio: sa / v };
}

/**
 * Grow a cube-shaped cell and watch the surface-area-to-volume ratio fall.
 * Modeled on the "Surface Area to Volume Ratio Explorer" MicroSim in Dan
 * McCreary's Biology (CC BY-NC-SA 4.0), rebuilt as an Apex component.
 */
export default function SAVolume() {
  const [s, setS] = useState(1);
  const { sa, v, ratio } = cubeStats(s);
  const box = 14 + s * 11; // drawn size, px in a 140-wide viewBox
  const fmt = (n) => (Number.isInteger(n) ? n : n.toFixed(2));

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · surface area vs volume</p>
      <div className="grid sm:grid-cols-[150px_1fr] gap-4 items-center">
        <svg viewBox="0 0 150 150" className="w-36 h-36 mx-auto text-primary-400" role="img" aria-label={`Cube with side ${s} micrometers`}>
          {/* A simple oblique cube: front face, top and side */}
          <g stroke="currentColor" strokeWidth="1.5" fill="none" transform={`translate(${(150 - box * 1.3) / 2}, ${(150 - box * 1.3) / 2 + box * 0.3})`}>
            <rect x="0" y="0" width={box} height={box} className="fill-base-800" />
            <path d={`M0 0 L${box * 0.3} ${-box * 0.3} L${box * 1.3} ${-box * 0.3} L${box} 0 Z`} />
            <path d={`M${box} 0 L${box * 1.3} ${-box * 0.3} L${box * 1.3} ${box * 0.7} L${box} ${box} Z`} />
          </g>
        </svg>
        <div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Surface area (μm²)" value={fmt(sa)} />
            <Stat label="Volume (μm³)" value={fmt(v)} />
            <Stat label="SA : V" value={`${fmt(ratio)} : 1`} />
          </div>
          <div className="mt-3" aria-hidden="true">
            <div className="h-2 rounded-full bg-base-800">
              <div className="h-2 rounded-full bg-primary-500 transition-all" style={{ width: `${(ratio / 6) * 100}%` }} />
            </div>
            <p className="text-caption text-content-muted mt-1">SA : V relative to a 1 μm cube</p>
          </div>
        </div>
      </div>
      <label className="block mt-4">
        <span className="text-body-sm text-content-primary">Side length: <strong>{s} μm</strong></span>
        <input type="range" min="1" max="6" step="1" value={s} onChange={(e) => setS(Number(e.target.value))}
          className="w-full mt-1 accent-primary-500" aria-valuetext={`${s} micrometers`} />
      </label>
      <p className="text-body-sm text-content-secondary mt-2" aria-live="polite">
        {s === 1
          ? 'A 1 μm cube has 6 μm² of membrane for every 1 μm³ of cell. Make it bigger.'
          : `${s}× the side means ${s * s}× the surface but ${s * s * s}× the volume, so each μm³ of cell gets only ${fmt(ratio)} μm² of membrane instead of 6.`}
      </p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="p-2 rounded-md bg-base-800">
      <div className="text-h4 font-semibold text-content-primary">{value}</div>
      <div className="text-caption text-content-muted">{label}</div>
    </div>
  );
}
