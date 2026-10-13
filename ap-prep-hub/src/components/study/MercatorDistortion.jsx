import React, { useState } from 'react';

/** Mercator stretches lengths by sec(latitude) in every direction, so areas by sec². Exported for tests. */
export function mercatorScale(latDeg) {
  const k = 1 / Math.cos((latDeg * Math.PI) / 180);
  return { linear: k, area: k * k };
}

const fmt = (n) => (n < 10 ? n.toFixed(1) : Math.round(n).toString());
const BOX = 22; // px for a square that is drawn true-to-size at the equator

/**
 * The same 500 km × 500 km square drawn on a Mercator map at the equator and
 * at a chosen latitude: the further from the equator, the bigger it's drawn.
 */
export default function MercatorDistortion() {
  const [lat, setLat] = useState(60);
  const { linear, area } = mercatorScale(lat);
  const side = BOX * linear;
  const H = 170; // the largest square (75°, 85 px) ends at y ≈ 111, above the equator line at H − 30

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · map projection distortion</p>
      <svg viewBox={`0 0 300 ${H}`} className="w-full max-w-md mx-auto block" role="img"
        aria-label={`On a Mercator map, a square at ${lat} degrees latitude is drawn ${fmt(area)} times larger in area than the same square at the equator`}>
        {/* equator and the chosen parallel */}
        <line x1="10" y1={H - 30} x2="290" y2={H - 30} strokeDasharray="4 3" className="stroke-border-strong" />
        <text x="12" y={H - 34} fontSize="10" className="fill-content-muted">Equator (0°)</text>
        <rect x="90" y={H - 30 - BOX / 2} width={BOX} height={BOX} className="fill-primary-500" />
        <text x={90 + BOX / 2} y={H - 8} fontSize="10" textAnchor="middle" className="fill-content-secondary">×1</text>

        <line x1="10" y1="22" x2="290" y2="22" strokeDasharray="4 3" className="stroke-border-strong" />
        <text x="12" y="16" fontSize="10" className="fill-content-muted">{lat}° N</text>
        <rect x={200 - side / 2} y={Math.max(26, 22 + 4)} width={side} height={side}
          className="fill-warning-400" style={{ opacity: 0.85 }} />
        <text x="200" y={Math.min(H - 40, 26 + side + 14)} fontSize="10" textAnchor="middle" className="fill-content-secondary">
          ×{fmt(area)} area
        </text>
      </svg>
      <label className="block mt-3">
        <span className="text-body-sm text-content-primary">Latitude of the second square: <strong>{lat}°</strong></span>
        <input type="range" min="0" max="75" step="5" value={lat} onChange={(e) => setLat(Number(e.target.value))}
          className="w-full mt-1 accent-primary-500" aria-valuetext={`${lat} degrees`} />
      </label>
      <p className="text-body-sm text-content-secondary mt-2" aria-live="polite">
        Both squares are really 500 km on a side. At {lat}° the Mercator projection stretches every length by {linear.toFixed(2)}×, so the
        square is drawn {fmt(area)}× too big in area. {lat >= 70
          ? 'That is why Greenland, near 72° N, looks about as big as Africa, though Africa is about 14 times larger.'
          : 'Keep going toward the poles and watch it grow.'}
        {' '}Mercator keeps shapes and compass directions correct for small areas, which is why it’s used for navigation, but no flat map can keep everything.
      </p>
    </div>
  );
}
