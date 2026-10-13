import React, { useState } from 'react';

const INSIDE = 0.9; // % solute inside the cell, roughly what a red blood cell holds

/** Tonicity of the outside solution relative to the cell, and what follows. Exported for tests. */
export function tonicityOf(outside, inside = INSIDE) {
  if (Math.abs(outside - inside) < 0.05) return 'isotonic';
  return outside < inside ? 'hypotonic' : 'hypertonic';
}

const OUTCOME = {
  animal: {
    hypotonic: { label: 'Swells and may burst (lysis)', scale: 1.3 },
    isotonic: { label: 'Normal shape', scale: 1 },
    hypertonic: { label: 'Shrivels (crenation)', scale: 0.7 },
  },
  plant: {
    hypotonic: { label: 'Turgid: the wall pushes back, so the cell is firm (healthy for plants)', scale: 1 },
    isotonic: { label: 'Flaccid: limp, no net water movement', scale: 0.9 },
    hypertonic: { label: 'Plasmolyzed: the membrane pulls away from the wall', scale: 0.62 },
  },
};

/**
 * Change the outside solute concentration and see which way water moves and
 * what happens to an animal or plant cell. Modeled on the "Osmosis and Water
 * Potential Simulator" MicroSim in Dan McCreary's Biology (CC BY-NC-SA 4.0),
 * rebuilt as an Apex component.
 */
export default function Tonicity() {
  const [outside, setOutside] = useState(INSIDE);
  const [kind, setKind] = useState('animal');
  const t = tonicityOf(outside);
  const o = OUTCOME[kind][t];
  const water = t === 'hypotonic' ? 'into the cell' : t === 'hypertonic' ? 'out of the cell' : 'in both directions equally (no net movement)';

  const r = 34 * o.scale;
  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · tonicity</p>
      <div className="flex gap-2 mb-3" role="radiogroup" aria-label="Cell type">
        {['animal', 'plant'].map((k) => (
          <button key={k} type="button" role="radio" aria-checked={kind === k} onClick={() => setKind(k)}
            className={`px-3 py-1.5 rounded-md text-body-sm border ${kind === k ? 'border-primary-500 bg-base-800 text-content-primary' : 'border-border-strong text-content-secondary'}`}>
            {k === 'animal' ? 'Animal cell' : 'Plant cell'}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 200 110" className="w-full max-w-sm mx-auto block" role="img" aria-label={`${kind} cell in a ${t} solution: ${o.label}`}>
        <rect x="0" y="0" width="200" height="110" rx="8" className="fill-current text-base-800" />
        {kind === 'plant' && (
          <rect x="62" y="17" width="76" height="76" rx="6" fill="none" strokeWidth="4" stroke="currentColor" className="text-success-400" />
        )}
        {kind === 'plant'
          ? <rect x={100 - r} y={55 - r} width={2 * r} height={2 * r} rx={6 * o.scale} className="fill-current text-primary-500" opacity="0.55" />
          : <ellipse cx="100" cy="55" rx={r} ry={r * (t === 'hypertonic' ? 0.8 : 1)} className="fill-current text-error-400" opacity="0.6" />}
        {t !== 'isotonic' && (
          <g stroke="currentColor" strokeWidth="3" className="text-info-400" fill="none" strokeLinecap="round">
            {t === 'hypotonic'
              ? <><path d="M18 55 H44 M38 49 L44 55 L38 61" /><path d="M182 55 H156 M162 49 L156 55 L162 61" /></>
              : <><path d="M44 55 H18 M24 49 L18 55 L24 61" /><path d="M156 55 H182 M176 49 L182 55 L176 61" /></>}
          </g>
        )}
      </svg>
      <label className="block mt-3">
        <span className="text-body-sm text-content-primary">
          Solute outside: <strong>{outside.toFixed(1)}%</strong> (inside the cell: {INSIDE}%)
        </span>
        <input type="range" min="0" max="3" step="0.1" value={outside} onChange={(e) => setOutside(Number(e.target.value))}
          className="w-full mt-1 accent-primary-500" aria-valuetext={`${outside.toFixed(1)} percent solute`} />
      </label>
      <p className="text-body-sm text-content-secondary mt-2" aria-live="polite">
        <strong className="text-content-primary">The solution is {t}.</strong> Water moves {water}. {o.label}.
      </p>
    </div>
  );
}
