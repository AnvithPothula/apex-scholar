import React, { useState } from 'react';

const SYMBOLS = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar',
  'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr'];
// Aufbau filling order up to krypton.
const ORDER = [['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6], ['4s', 2], ['3d', 10], ['4p', 6]];
const L = { s: 0, p: 1, d: 2 };
// Real ground states that break the Aufbau pattern; the CED says these aren't assessed.
const EXCEPTIONS = { 24: 'Cr', 29: 'Cu' };

/**
 * Aufbau ground-state configuration for Z = 1–36, as [{ sub, e }] in filling
 * order. Exported for tests.
 */
export function configFor(z) {
  const out = [];
  let left = z;
  for (const [sub, cap] of ORDER) {
    if (left <= 0) break;
    const e = Math.min(cap, left);
    out.push({ sub, e });
    left -= e;
  }
  return out;
}

/**
 * Subshells as they appear in a PES spectrum: highest binding energy first.
 * Electrons closer to the nucleus (lower n, then lower l) are held more tightly,
 * so 3d sits to the left of 4s once both are filled. Exported for tests.
 */
export function pesPeaks(z) {
  return configFor(z)
    .map((c) => ({ ...c, n: Number(c.sub[0]), l: L[c.sub[1]] }))
    .sort((a, b) => a.n - b.n || a.l - b.l);
}

const notation = (cfg) => cfg.map((c) => `${c.sub}${c.e}`).join(' ');
const sup = (cfg) => cfg.map((c) => (
  <span key={c.sub} className="mr-1">{c.sub}<sup>{c.e}</sup></span>
));

/**
 * Pick an element and see its electron configuration and the photoelectron
 * spectrum it produces: one peak per subshell, height proportional to the
 * number of electrons, inner subshells at higher binding energy (left).
 */
export default function PESBuilder() {
  const [z, setZ] = useState(16);
  const peaks = pesPeaks(z);
  const W = 300; const H = 160; const base = H - 38;
  const step = (W - 40) / Math.max(peaks.length, 1);
  const valence = Math.max(...peaks.map((p) => p.n));

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · photoelectron spectrum</p>
      <p className="text-h4 font-semibold text-content-primary">
        {SYMBOLS[z - 1]} <span className="text-body-sm text-content-muted font-normal">(Z = {z})</span>
      </p>
      <p className="text-body text-content-secondary mt-1 font-mono">{sup(configFor(z))}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto block mt-2" role="img"
        aria-label={`Photoelectron spectrum of ${SYMBOLS[z - 1]}: ${peaks.map((p) => `${p.sub} peak, ${p.e} electrons`).join('; ')}`}>
        <line x1="20" y1={base} x2={W - 10} y2={base} className="stroke-border-strong" />
        <text x="20" y={H - 8} fontSize="9" className="fill-content-muted">← higher binding energy</text>
        <text x={W - 10} y={H - 8} fontSize="9" textAnchor="end" className="fill-content-muted">lower →</text>
        {peaks.map((p, i) => {
          const x = 20 + step * (i + 0.5);
          const h = (p.e / 10) * (base - 14);
          return (
            <g key={p.sub}>
              <rect x={x - 7} y={base - h} width="14" height={h} rx="2"
                className={p.n === valence ? 'fill-warning-400' : 'fill-primary-500'} />
              <text x={x} y={base - h - 3} fontSize="9" textAnchor="middle" className="fill-content-secondary">{p.e}</text>
              <text x={x} y={base + 11} fontSize="9" textAnchor="middle" className="fill-content-secondary">{p.sub}</text>
            </g>
          );
        })}
      </svg>
      <p className="text-caption text-content-muted text-center">
        Peak height ∝ number of electrons · <span className="text-warning-400">valence shell</span> · <span className="text-primary-400">core</span>
      </p>
      <label className="block mt-3">
        <span className="text-body-sm text-content-primary">Atomic number: <strong>{z}</strong></span>
        <input type="range" min="1" max="36" step="1" value={z} onChange={(e) => setZ(Number(e.target.value))}
          className="w-full mt-1 accent-primary-500" aria-valuetext={`${SYMBOLS[z - 1]}, atomic number ${z}`} />
      </label>
      <p className="text-body-sm text-content-secondary mt-2" aria-live="polite">
        {EXCEPTIONS[z]
          ? `${EXCEPTIONS[z]} is shown by the Aufbau pattern (${notation(configFor(z))}); its real ground state differs slightly, and the AP exam doesn't test these exceptions.`
          : `${peaks.length === 1 ? 'One subshell, so one peak' : `${peaks.length} subshells, so ${peaks.length} peaks`}. The leftmost peak is the 1s electrons, held tightest because they are closest to the nucleus. Removing the rightmost (valence) electrons takes the least energy.`}
      </p>
    </div>
  );
}
