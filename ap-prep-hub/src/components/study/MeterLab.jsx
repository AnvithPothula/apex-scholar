import React, { useEffect, useRef, useState } from 'react';

const TOPS = [2, 3, 4, 6, 9, 12];
const BOTTOMS = [2, 4, 8, 16];
const VALUE = { 1: 'whole note', 2: 'half note', 4: 'quarter note', 8: 'eighth note', 16: 'sixteenth note', 32: 'thirty-second note' };
const DOTTED = { 2: 'dotted whole note', 4: 'dotted half note', 8: 'dotted quarter note', 16: 'dotted eighth note' };

/** Describe a time signature the way the CED does. Exported for tests. */
export function meterType(top, bottom) {
  const compound = top % 3 === 0 && top > 3;
  const beats = compound ? top / 3 : top;
  const grouping = { 2: 'duple', 3: 'triple', 4: 'quadruple' }[beats];
  return {
    kind: compound ? 'compound' : 'simple',
    grouping,
    beats,
    divisionsPerBeat: compound ? 3 : 2,
    beatValue: compound ? DOTTED[bottom] : VALUE[bottom],
    divisionValue: compound ? VALUE[bottom] : VALUE[bottom * 2],
  };
}

/**
 * Pick a time signature and hear its beats (accented downbeat) with the
 * divisions ticking underneath: two per beat in simple meter, three in compound.
 */
export default function MeterLab() {
  const [top, setTop] = useState(6);
  const [bottom, setBottom] = useState(8);
  const [pulse, setPulse] = useState(-1);
  const [on, setOn] = useState(false);
  const ctx = useRef(null);
  const timers = useRef([]);
  const m = meterType(top, bottom);
  const divisions = m.beats * m.divisionsPerBeat;

  const stop = () => { timers.current.forEach(clearTimeout); timers.current = []; setOn(false); setPulse(-1); };
  // stop only touches refs and state setters, so it is safe to omit from deps.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => stop, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { stop(); }, [top, bottom]);

  const play = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx.current = ctx.current || new AC();
    const ac = ctx.current;
    stop();
    setOn(true);
    const step = 0.6 / m.divisionsPerBeat; // beat = 0.6 s (100 beats per minute)
    const total = divisions * 2; // two measures
    for (let i = 0; i < total; i += 1) {
      const d = i % divisions;
      const t0 = ac.currentTime + 0.05 + i * step;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const level = d === 0 ? 0.5 : d % m.divisionsPerBeat === 0 ? 0.25 : 0.08;
      osc.frequency.value = d === 0 ? 1320 : d % m.divisionsPerBeat === 0 ? 880 : 660;
      gain.gain.setValueAtTime(level, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.06);
      osc.connect(gain).connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + 0.07);
      timers.current.push(setTimeout(() => setPulse(d), (0.05 + i * step) * 1000));
    }
    timers.current.push(setTimeout(stop, (0.05 + total * step) * 1000 + 150));
  };

  const pick = (vals, cur, set, label) => (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={label}>
      <span className="text-caption text-content-muted w-full sm:w-16">{label}</span>
      {vals.map((v) => (
        <button key={v} type="button" onClick={() => set(v)} aria-pressed={cur === v}
          className={`w-9 py-1 rounded-md border text-body-sm ${cur === v ? 'border-primary-500 bg-primary-900/40 text-content-primary' : 'border-border-strong text-content-secondary'}`}>{v}</button>
      ))}
    </div>
  );

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · meter lab</p>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="text-center font-bold text-content-primary leading-none text-h2 w-12 shrink-0" aria-label={`Time signature ${top} over ${bottom}`}>
          <div>{top}</div><div>{bottom}</div>
        </div>
        <div className="space-y-2">
          {pick(TOPS, top, setTop, 'Upper')}
          {pick(BOTTOMS, bottom, setBottom, 'Lower')}
        </div>
      </div>
      <div className="flex items-end gap-1 mt-4 h-10" aria-hidden="true">
        {Array.from({ length: divisions }, (_, d) => {
          const beat = d % m.divisionsPerBeat === 0;
          return (
            <div key={d} className={`flex-1 rounded border ${pulse === d ? 'bg-primary-500 border-primary-500' : beat ? 'bg-base-700 border-border-strong' : 'bg-base-800 border-border'} ${d === 0 ? 'h-10' : beat ? 'h-8' : 'h-5'} transition-colors`} />
          );
        })}
      </div>
      <p className="text-body-sm text-content-primary mt-3" aria-live="polite">
        <strong>{m.kind} {m.grouping}</strong>: {m.beats} beats per measure, each a <strong>{m.beatValue}</strong>, divided into{' '}
        {m.divisionsPerBeat} {m.divisionValue}s.
      </p>
      <button type="button" onClick={on ? stop : play} className="mt-3 px-3 py-1.5 rounded-md bg-primary-600 text-white text-body-sm">
        {on ? '■ Stop' : '▶ Play two measures'}
      </button>
    </div>
  );
}
