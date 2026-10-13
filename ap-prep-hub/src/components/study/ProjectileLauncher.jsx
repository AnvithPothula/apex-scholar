import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/UIComponents';

const G = 10; // m/s², the value the AP Physics 1 CED uses
const W = 300; const H = 210; const PAD = 24;
// Metres shown, fixed so launches compare honestly. The longest launch the
// sliders allow (30 m/s from 20 m, near 40°) lands about 108 m out.
const X_MAX = 120; const Y_MAX = 70;

/**
 * Time in the air, range, peak height and landing velocity for a launch from
 * height h (m) at speed v (m/s) and angle (degrees above horizontal), with no
 * air resistance. Exported for tests.
 */
export function projectile({ v, angle, h = 0, g = G }) {
  const rad = (angle * Math.PI) / 180;
  const vx = v * Math.cos(rad);
  const vy = v * Math.sin(rad);
  const t = (vy + Math.sqrt(vy * vy + 2 * g * h)) / g;
  return {
    vx, vy, t,
    range: vx * t,
    peak: h + (vy * vy) / (2 * g),
    peakTime: vy / g,
    landingVy: vy - g * t,
  };
}

const sx = (x) => PAD + (x / X_MAX) * (W - PAD - 8);
const sy = (y) => H - PAD - (y / Y_MAX) * (H - PAD - 8);

function pathFor({ v, angle, h }) {
  const p = projectile({ v, angle, h });
  const pts = [];
  for (let i = 0; i <= 60; i += 1) {
    const t = (p.t * i) / 60;
    pts.push(`${sx(p.vx * t).toFixed(1)},${sy(h + p.vy * t - (G * t * t) / 2).toFixed(1)}`);
  }
  return pts.join(' ');
}

const fmt = (n, d = 1) => (Math.abs(n) < 0.05 ? '0' : n.toFixed(d).replace('-', '−'));

/**
 * Launch a ball and read off what stays the same (horizontal velocity) and
 * what changes (vertical velocity) during projectile motion. The previous
 * launch stays as a dashed path to compare against.
 */
export default function ProjectileLauncher() {
  const [s, setS] = useState({ v: 20, angle: 45, h: 0 });
  const [ghost, setGhost] = useState(null);
  const [t, setT] = useState(null); // animation time, null when idle
  const raf = useRef(null);
  const p = projectile(s);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const set = (k) => (e) => { cancelAnimationFrame(raf.current); setT(null); setS((prev) => ({ ...prev, [k]: Number(e.target.value) })); };

  const launch = () => {
    cancelAnimationFrame(raf.current);
    const start = performance.now();
    // Real time is too fast for short flights and slow for long ones; scale to 1.2–2.5 s on screen.
    const scale = Math.min(2.5, Math.max(1.2, p.t)) / p.t;
    const tick = (now) => {
      const tt = ((now - start) / 1000) / scale;
      if (tt >= p.t) { setT(p.t); setGhost(s); return; }
      setT(tt);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const ball = t === null ? null : { x: p.vx * t, y: s.h + p.vy * t - (G * t * t) / 2, vy: p.vy - G * t };

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · projectile launcher</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto block" role="img"
        aria-label={`Launch at ${s.v} m/s, ${s.angle} degrees, from ${s.h} m: lands ${fmt(p.range)} m away after ${fmt(p.t, 2)} s`}>
        {/* axes */}
        <line x1={PAD} y1={sy(0)} x2={W - 4} y2={sy(0)} className="stroke-border-strong" strokeWidth="1" />
        <line x1={PAD} y1={sy(0)} x2={PAD} y2={6} className="stroke-border-strong" strokeWidth="1" />
        {[30, 60, 90, 120].map((x) => (
          <text key={x} x={sx(x)} y={sy(0) + 12} textAnchor="middle" fontSize="9" className="fill-content-muted">{x} m</text>
        ))}
        {[20, 40, 60].map((y) => (
          <text key={y} x={PAD - 4} y={sy(y) + 3} textAnchor="end" fontSize="9" className="fill-content-muted">{y}</text>
        ))}
        {/* launch platform */}
        {s.h > 0 && <rect x={PAD} y={sy(s.h)} width="6" height={sy(0) - sy(s.h)} className="fill-base-750" />}
        {ghost && <polyline points={pathFor(ghost)} fill="none" strokeDasharray="4 3" strokeWidth="1.5" className="stroke-content-muted" />}
        <polyline points={pathFor(s)} fill="none" strokeWidth="2" className="stroke-primary-400" />
        {/* peak marker */}
        <circle cx={sx(p.vx * p.peakTime)} cy={sy(p.peak)} r="2.5" className="fill-warning-400" />
        {ball && (
          <g>
            <circle cx={sx(ball.x)} cy={sy(ball.y)} r="5" className="fill-content-primary" />
            {/* velocity components, scaled 1 m/s → 1.4 px */}
            <line x1={sx(ball.x)} y1={sy(ball.y)} x2={sx(ball.x) + p.vx * 1.4} y2={sy(ball.y)} strokeWidth="2" className="stroke-info-400" />
            <line x1={sx(ball.x)} y1={sy(ball.y)} x2={sx(ball.x)} y2={sy(ball.y) - ball.vy * 1.4} strokeWidth="2" className="stroke-error-400" />
          </g>
        )}
      </svg>
      <p className="text-caption text-content-muted text-center mt-1">
        <span className="text-info-400">━</span> horizontal velocity <span className="text-error-400 ml-2">━</span> vertical velocity
        <span className="text-warning-400 ml-2">●</span> peak{ghost && <span className="ml-2">┅ previous launch</span>}
      </p>

      <div className="grid sm:grid-cols-3 gap-3 mt-3">
        {[['v', 'Launch speed', 5, 30, 1, 'm/s'], ['angle', 'Angle', 0, 90, 5, '°'], ['h', 'Launch height', 0, 20, 5, 'm']].map(([k, label, min, max, step, unit]) => (
          <label key={k} className="block">
            <span className="text-body-sm text-content-primary">{label}: <strong>{s[k]}{unit === '°' ? '' : ' '}{unit}</strong></span>
            <input type="range" min={min} max={max} step={step} value={s[k]} onChange={set(k)}
              className="w-full mt-1 accent-primary-500" aria-valuetext={`${s[k]} ${unit}`} />
          </label>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-center">
        {[['Time in air', `${fmt(p.t, 2)} s`], ['Range', `${fmt(p.range)} m`], ['Peak height', `${fmt(p.peak)} m`],
          [ball ? 'vₓ, v_y now' : 'vₓ, v_y at launch', `${fmt(p.vx)}, ${fmt(ball ? ball.vy : p.vy)} m/s`]].map(([label, value]) => (
          <div key={label} className="p-2 rounded-md bg-base-800">
            <div className="text-body font-semibold text-content-primary">{value}</div>
            <div className="text-caption text-content-muted">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-3">
        <Button size="sm" onClick={launch}>Launch</Button>
        <p className="text-body-sm text-content-secondary flex-1 min-w-[12rem]" aria-live="polite">
          {t !== null && t >= p.t
            ? `Landed. vₓ stayed ${fmt(p.vx)} m/s the whole flight; v_y went from ${fmt(p.vy)} to ${fmt(p.landingVy)} m/s, changing by 10 m/s every second.`
            : 'Try 30° and then 60° at the same speed: same range, different heights and times.'}
        </p>
      </div>
    </div>
  );
}
