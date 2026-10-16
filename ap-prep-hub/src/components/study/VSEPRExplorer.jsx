import React, { useState } from 'react';

/**
 * VSEPR shapes for a central atom with identical outer atoms, keyed by
 * electron domains and lone pairs. Hybridization only for ≤ 4 domains: the
 * AP Chemistry CED excludes hybridization involving d orbitals.
 * Exported for tests.
 */
export const SHAPES = {
  '2-0': { electron: 'linear', shape: 'linear', angle: '180°', example: 'CO₂', polar: false },
  '3-0': { electron: 'trigonal planar', shape: 'trigonal planar', angle: '120°', example: 'BF₃', polar: false },
  '3-1': { electron: 'trigonal planar', shape: 'bent', angle: 'slightly less than 120°', example: 'SO₂', polar: true },
  '4-0': { electron: 'tetrahedral', shape: 'tetrahedral', angle: '109.5°', example: 'CH₄', polar: false },
  '4-1': { electron: 'tetrahedral', shape: 'trigonal pyramidal', angle: 'about 107°', example: 'NH₃', polar: true },
  '4-2': { electron: 'tetrahedral', shape: 'bent', angle: 'about 104.5°', example: 'H₂O', polar: true },
  '5-0': { electron: 'trigonal bipyramidal', shape: 'trigonal bipyramidal', angle: '90° and 120°', example: 'PCl₅', polar: false },
  '5-1': { electron: 'trigonal bipyramidal', shape: 'seesaw', angle: 'less than 90° and 120°', example: 'SF₄', polar: true },
  '5-2': { electron: 'trigonal bipyramidal', shape: 'T-shaped', angle: 'less than 90°', example: 'ClF₃', polar: true },
  '5-3': { electron: 'trigonal bipyramidal', shape: 'linear', angle: '180°', example: 'XeF₂', polar: false },
  '6-0': { electron: 'octahedral', shape: 'octahedral', angle: '90°', example: 'SF₆', polar: false },
  '6-1': { electron: 'octahedral', shape: 'square pyramidal', angle: 'less than 90°', example: 'BrF₅', polar: true },
  '6-2': { electron: 'octahedral', shape: 'square planar', angle: '90°', example: 'XeF₄', polar: false },
};

const HYBRID = { 2: 'sp', 3: 'sp²', 4: 'sp³' };
const MAX_LP = { 2: 0, 3: 1, 4: 2, 5: 3, 6: 2 };

/** Shape record plus hybridization for `domains` electron domains, `lp` of them lone pairs. */
export function vsepr(domains, lp) {
  const s = SHAPES[`${domains}-${lp}`];
  return s && { ...s, bonded: domains - lp, hybrid: HYBRID[domains] || null };
}

// 2-D sketch positions (unit circle-ish) for each electron geometry. Lone
// pairs take the slots listed first in LP_SLOTS: equatorial for 5 domains,
// opposite each other for 6, as VSEPR predicts.
const POS = {
  2: [[1, 0], [-1, 0]],
  3: [[0, -1], [-0.87, 0.5], [0.87, 0.5]],
  4: [[0, -1], [-0.94, 0.33], [0.94, 0.33], [0.3, 0.8]],
  5: [[0.95, 0.15], [-0.7, -0.3], [-0.7, 0.55], [0, -1], [0, 1]],
  6: [[0, -1], [0, 1], [1, 0], [-1, 0], [0.55, -0.45], [-0.55, 0.45]],
};
const LP_SLOTS = { 3: [0], 4: [0, 3], 5: [0, 1, 2], 6: [0, 1] };

/**
 * Pick the number of electron domains and lone pairs on a central atom and
 * see the electron geometry, molecular shape, bond angle, hybridization and
 * polarity. Modeled on the VSEPR geometry builder MicroSim in Dan McCreary's
 * "Chemistry" (CC BY-NC-SA 4.0), rebuilt as an Apex component.
 */
export default function VSEPRExplorer() {
  const [domains, setDomains] = useState(4);
  const [lp, setLp] = useState(0);
  const s = vsepr(domains, lp);
  const lpSet = new Set((LP_SLOTS[domains] || []).slice(0, lp));
  const pick = (d) => { setDomains(d); setLp((l) => Math.min(l, MAX_LP[d])); };
  const btn = (on) => `min-w-9 px-2.5 py-1 rounded border text-body-sm ${on ? 'border-primary-500 bg-primary-900/40 text-content-primary' : 'border-border-strong text-content-secondary'}`;

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · VSEPR shapes</p>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <div>
          <p className="text-caption text-content-muted mb-1">Electron domains on the central atom</p>
          <div className="flex gap-1.5" role="group" aria-label="Electron domains">
            {[2, 3, 4, 5, 6].map((d) => (
              <button key={d} type="button" aria-pressed={domains === d} onClick={() => pick(d)} className={btn(domains === d)}>{d}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-caption text-content-muted mb-1">How many are lone pairs</p>
          <div className="flex gap-1.5" role="group" aria-label="Lone pairs">
            {Array.from({ length: MAX_LP[domains] + 1 }, (_, l) => (
              <button key={l} type="button" aria-pressed={lp === l} onClick={() => setLp(l)} className={btn(lp === l)}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid sm:grid-cols-[160px_1fr] gap-4 items-center mt-4">
        <svg viewBox="-60 -60 120 120" className="w-40 h-40 mx-auto" role="img" aria-label={`${s.shape} molecule with ${s.bonded} bonded atoms and ${lp} lone pair${lp === 1 ? '' : 's'}`}>
          {POS[domains].map(([x, y], i) => (lpSet.has(i) ? (
            <g key={i} className="text-warning-400">
              <ellipse cx={x * 26} cy={y * 26} rx="6" ry="9" fill="none" stroke="currentColor" strokeDasharray="2 2"
                transform={`rotate(${(Math.atan2(y, x) * 180) / Math.PI + 90} ${x * 26} ${y * 26})`} />
              <circle cx={x * 26 - y * 2.5} cy={y * 26 + x * 2.5} r="1.8" fill="currentColor" />
              <circle cx={x * 26 + y * 2.5} cy={y * 26 - x * 2.5} r="1.8" fill="currentColor" />
            </g>
          ) : (
            <g key={i}>
              <line x1="0" y1="0" x2={x * 42} y2={y * 42} className="stroke-content-secondary" strokeWidth="2.5" />
              <circle cx={x * 46} cy={y * 46} r="9" className="fill-info-900 stroke-info-400" strokeWidth="1.5" />
              <text x={x * 46} y={y * 46 + 3.5} textAnchor="middle" fontSize="10" className="fill-content-primary">X</text>
            </g>
          )))}
          <circle cx="0" cy="0" r="11" className="fill-primary-900 stroke-primary-400" strokeWidth="1.5" />
          <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="600" className="fill-content-primary">A</text>
        </svg>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-body-sm">
          <dt className="text-content-muted">Electron geometry</dt><dd className="text-content-primary">{s.electron}</dd>
          <dt className="text-content-muted">Molecular shape</dt><dd className="text-content-primary font-semibold">{s.shape}</dd>
          <dt className="text-content-muted">Bond angle</dt><dd className="text-content-primary">{s.angle}</dd>
          <dt className="text-content-muted">Hybridization</dt><dd className="text-content-primary">{s.hybrid || 'not tested (would need d orbitals)'}</dd>
          <dt className="text-content-muted">Polar?</dt><dd className="text-content-primary">{s.polar ? 'Yes: the bond dipoles don\'t cancel' : 'No: the bond dipoles cancel'}</dd>
          <dt className="text-content-muted">Example</dt><dd className="text-content-primary">{s.example}</dd>
        </dl>
      </div>
      <p className="text-caption text-content-muted mt-3">
        Polarity assumes identical outer atoms (X). Lone pairs repel more than bonding pairs, so they squeeze bond angles below the ideal values.
      </p>
    </div>
  );
}
