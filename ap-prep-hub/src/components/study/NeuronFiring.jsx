import React, { useState } from 'react';
import { Button } from '../ui/UIComponents';

const RESTING = -70;
const THRESHOLD = -55;
const PEAK = 30;

/**
 * Spikes produced by a stimulus that depolarizes the neuron by `boost` mV.
 * Below threshold: none. At or above: always full-size, and a stronger
 * stimulus means more of them (rate coding), never taller ones.
 */
export function spikesFor(boost) {
  if (RESTING + boost < THRESHOLD) return 0;
  return Math.min(5, 1 + Math.floor((boost - (THRESHOLD - RESTING)) / 4));
}

/** Membrane potential trace (x: 0–240, y: mV) for one stimulation. */
function trace(boost) {
  const n = spikesFor(boost);
  const pts = [[0, RESTING], [20, RESTING]];
  if (!n) return [...pts, [30, RESTING + boost], [60, RESTING], [240, RESTING]];
  let x = 30;
  for (let i = 0; i < n; i++) {
    pts.push([x, THRESHOLD], [x + 5, PEAK], [x + 12, RESTING - 10], [x + 30, RESTING]);
    x += 36;
  }
  return [...pts, [240, RESTING]];
}

const toY = (mv) => 10 + ((PEAK - mv) / (PEAK - (RESTING - 15))) * 100;

/** Stimulate a neuron and see threshold, all-or-nothing and firing rate. */
export default function NeuronFiring() {
  const [boost, setBoost] = useState(8);
  const [shown, setShown] = useState(null);
  const n = shown === null ? null : spikesFor(shown);

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · threshold and all-or-nothing</p>
      <svg viewBox="0 0 240 120" className="w-full max-w-md mx-auto block text-content-secondary" role="img"
        aria-label={shown === null ? 'Membrane potential at rest' : `${n} action potential${n === 1 ? '' : 's'}`}>
        <line x1="0" x2="240" y1={toY(THRESHOLD)} y2={toY(THRESHOLD)} stroke="currentColor" strokeDasharray="4 3" className="text-warning-400" />
        <text x="236" y={toY(THRESHOLD) - 3} textAnchor="end" fontSize="8" className="fill-current text-warning-400">threshold −55 mV</text>
        <text x="236" y={toY(RESTING) + 11} textAnchor="end" fontSize="8" className="fill-current">resting −70 mV</text>
        <polyline fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-400"
          points={(shown === null ? [[0, RESTING], [240, RESTING]] : trace(shown)).map(([x, mv]) => `${x},${toY(mv)}`).join(' ')} />
      </svg>
      <label className="block mt-3">
        <span className="text-body-sm text-content-primary">Stimulus strength: pushes the neuron up by <strong>{boost} mV</strong></span>
        <input type="range" min="2" max="30" step="1" value={boost} onChange={(e) => setBoost(Number(e.target.value))}
          className="w-full mt-1 accent-primary-500" aria-valuetext={`${boost} millivolts`} />
      </label>
      <Button size="sm" className="mt-2" onClick={() => setShown(boost)}>Stimulate</Button>
      <p className="text-body-sm text-content-secondary mt-3" aria-live="polite">
        {shown === null && 'Set a strength and stimulate. Try one below 15 mV, then a few above it.'}
        {shown !== null && n === 0 && `−70 + ${shown} = ${String(RESTING + shown).replace('-', '−')} mV never reaches threshold (−55 mV): no action potential at all.`}
        {shown !== null && n > 0 && `Threshold reached: ${n} action potential${n === 1 ? '' : 's'}, each the same height (+30 mV). A stronger stimulus fires the neuron more often, never harder. The dip after each spike is the refractory period.`}
      </p>
    </div>
  );
}
