import React, { useRef, useState } from 'react';

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NATURAL = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const STEPS = [0, 2, 4, 5, 7, 9, 11]; // W W H W W W H
const ACC = { '-2': '𝄫', '-1': '♭', 0: '', 1: '♯', 2: '𝄪' };
export const TONICS = ['C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'C♯', 'F', 'B♭', 'E♭', 'A♭', 'D♭', 'G♭', 'C♭'];
const DEGREES = ['Tonic', 'Supertonic', 'Mediant', 'Subdominant', 'Dominant', 'Submediant', 'Leading tone'];

const pcOf = (name) => (NATURAL[name[0]] + (name.includes('♯') ? 1 : name.includes('♭') ? -1 : 0) + 12) % 12;

/** The correctly spelled major scale on a tonic like "E♭" (seven notes). Exported for tests. */
export function majorScale(tonic) {
  const start = LETTERS.indexOf(tonic[0]);
  const t = pcOf(tonic);
  return STEPS.map((step, i) => {
    const letter = LETTERS[(start + i) % 7];
    let diff = (t + step - NATURAL[letter]) % 12;
    if (diff > 6) diff -= 12;
    if (diff < -6) diff += 12;
    return letter + ACC[diff];
  });
}

/** Key signature for a major key: { type, count, list } in the standard order. Exported for tests. */
export function keySignature(tonic) {
  const notes = majorScale(tonic);
  const sharps = notes.filter((n) => n.includes('♯'));
  const flats = notes.filter((n) => n.includes('♭'));
  const order = sharps.length ? ['F', 'C', 'G', 'D', 'A', 'E', 'B'] : ['B', 'E', 'A', 'D', 'G', 'C', 'F'];
  const marked = sharps.length ? sharps : flats;
  const list = order.filter((l) => marked.some((n) => n[0] === l)).map((l) => l + (sharps.length ? '♯' : '♭'));
  return { type: sharps.length ? 'sharps' : flats.length ? 'flats' : 'none', count: list.length, list };
}

/**
 * Pick a tonic, see the major scale spelled with its whole and half steps,
 * scale-degree names and key signature, and hear it played.
 */
export default function ScaleBuilder() {
  const [tonic, setTonic] = useState('D');
  const [playing, setPlaying] = useState(-1);
  const ctx = useRef(null);
  const notes = majorScale(tonic);
  const sig = keySignature(tonic);

  const play = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx.current = ctx.current || new AC();
    const ac = ctx.current;
    let midi = 60 + pcOf(tonic); // tonic near middle C
    if (midi > 66) midi -= 12;
    const pitches = [...STEPS, 12].map((s) => midi + s);
    pitches.forEach((m, i) => {
      const t0 = ac.currentTime + 0.05 + i * 0.4;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'triangle';
      osc.frequency.value = 440 * 2 ** ((m - 69) / 12);
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.25, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.38);
      osc.connect(gain).connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + 0.4);
      setTimeout(() => setPlaying(i), (0.05 + i * 0.4) * 1000);
    });
    setTimeout(() => setPlaying(-1), (0.05 + pitches.length * 0.4) * 1000);
  };

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · major scale builder</p>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Tonic">
        {TONICS.map((t) => (
          <button key={t} type="button" onClick={() => setTonic(t)} aria-pressed={tonic === t}
            className={`min-w-[2.5rem] px-2 py-1 rounded-md border text-body-sm ${tonic === t ? 'border-primary-500 bg-primary-900/40 text-content-primary' : 'border-border-strong text-content-secondary'}`}>
            {t}
          </button>
        ))}
      </div>
      <ol className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 mt-4" aria-label={`${tonic} major scale`}>
        {[...notes, notes[0]].map((n, i) => (
          <li key={i} className={`text-center rounded-md border p-1.5 ${playing === i ? 'border-primary-500 bg-primary-900/50' : 'border-border-subtle'}`}>
            <span className="block text-h4 font-semibold text-content-primary">{n}</span>
            <span className="block text-caption text-content-muted">{i === 7 ? '1 (octave)' : i + 1}</span>
            {i < 7 && <span className="block text-[0.65rem] leading-tight text-content-muted">{DEGREES[i]}</span>}
          </li>
        ))}
      </ol>
      <p className="text-body-sm text-content-secondary mt-2 font-mono" aria-label="Step pattern">
        {['W', 'W', 'H', 'W', 'W', 'W', 'H'].map((s, i) => `${notes[i]}–${notes[(i + 1) % 7]} ${s}`).join(' · ')}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
        <p className="text-body-sm text-content-primary" aria-live="polite">
          Key signature: <strong>{sig.count === 0 ? 'no sharps or flats' : `${sig.count} ${sig.type}`}</strong>
          {sig.count > 0 && <span className="text-content-secondary"> ({sig.list.join(' ')})</span>}
        </p>
        <button type="button" onClick={play} className="px-3 py-1.5 rounded-md bg-primary-600 text-white text-body-sm">▶ Play scale</button>
      </div>
    </div>
  );
}
