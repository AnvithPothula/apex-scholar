import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/UIComponents';

export const WORDS = ['apple', 'river', 'candle', 'tiger', 'window', 'piano', 'garden', 'rocket', 'pencil', 'cloud', 'bridge', 'lemon'];
const SHOW_MS = 1500;
const DELAY_S = 20;

/** Which list positions were recalled (case-insensitive, any order). Exported for tests. */
export function scoreRecall(text, words = WORDS) {
  const said = new Set(String(text || '').toLowerCase().split(/[^a-z]+/).filter(Boolean));
  return words.map((w) => said.has(w));
}

/**
 * A real serial-position experiment: watch 12 words one at a time, type what
 * you remember, and see which positions you recalled. Optionally count
 * backward first, which removes the recency effect but not primacy.
 */
export default function SerialPosition() {
  const [phase, setPhase] = useState('ready'); // ready | showing | delay | recall | result
  const [i, setI] = useState(0);
  const [delay, setDelay] = useState(false);
  const [left, setLeft] = useState(DELAY_S);
  const [text, setText] = useState('');
  const [hits, setHits] = useState([]);
  const input = useRef(null);

  useEffect(() => {
    if (phase !== 'showing') return undefined;
    const t = setTimeout(() => {
      if (i < WORDS.length - 1) setI(i + 1);
      else setPhase(delay ? 'delay' : 'recall');
    }, SHOW_MS);
    return () => clearTimeout(t);
  }, [phase, i, delay]);

  useEffect(() => {
    if (phase !== 'delay') return undefined;
    if (left <= 0) { setPhase('recall'); return undefined; }
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, left]);

  useEffect(() => { if (phase === 'recall') input.current?.focus(); }, [phase]);

  const start = () => { setI(0); setText(''); setHits([]); setLeft(DELAY_S); setPhase('showing'); };
  const finish = () => { setHits(scoreRecall(text)); setPhase('result'); };

  const first = hits.slice(0, 4).filter(Boolean).length;
  const middle = hits.slice(4, 8).filter(Boolean).length;
  const last = hits.slice(8).filter(Boolean).length;

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Experiment · serial position effect</p>

      {phase === 'ready' && (
        <>
          <p className="text-body-sm text-content-secondary">
            You'll see {WORDS.length} words, one at a time. Don't write anything down. Then type every word you remember, in any order.
          </p>
          <label className="flex items-center gap-2 mt-3 text-body-sm text-content-secondary">
            <input type="checkbox" checked={delay} onChange={(e) => setDelay(e.target.checked)} className="accent-primary-500" />
            Count backward for {DELAY_S} seconds before recalling (try it the second time)
          </label>
          <Button size="sm" className="mt-3" onClick={start}>Start</Button>
        </>
      )}

      {phase === 'showing' && (
        <div className="py-8 text-center" aria-live="assertive">
          <p className="text-caption text-content-muted">Word {i + 1} of {WORDS.length}</p>
          <p className="text-display font-bold text-content-primary mt-1">{WORDS[i]}</p>
        </div>
      )}

      {phase === 'delay' && (
        <div className="py-6 text-center" aria-live="polite">
          <p className="text-body text-content-primary">Count backward by 3s from 100, out loud.</p>
          <p className="text-h2 font-bold text-primary-400 mt-2">{left}s</p>
        </div>
      )}

      {phase === 'recall' && (
        <>
          <label className="block">
            <span className="text-body-sm text-content-primary">Type every word you remember:</span>
            <textarea ref={input} value={text} onChange={(e) => setText(e.target.value)} rows={3}
              className="w-full mt-2 p-2.5 rounded-lg bg-base-800 border border-border text-content-primary" />
          </label>
          <Button size="sm" className="mt-2" onClick={finish}>See my results</Button>
        </>
      )}

      {phase === 'result' && (
        <>
          <div className="flex items-end gap-1 h-24 mt-1" role="img"
            aria-label={`Recalled ${first} of the first 4, ${middle} of the middle 4, ${last} of the last 4`}>
            {hits.map((h, k) => (
              // h-full gives the bar something to be a percentage of; without
              // it every bar collapsed to zero height and the chart was blank.
              <div key={WORDS[k]} className="flex-1 h-full flex items-end" title={`${k + 1}. ${WORDS[k]}: ${h ? 'recalled' : 'missed'}`}>
                <div className={`w-full rounded-t ${h ? 'bg-primary-500' : 'bg-base-750 border border-border-subtle'}`} style={{ height: h ? '100%' : '10%' }} />
              </div>
            ))}
          </div>
          <div className="flex gap-1 text-caption text-content-muted mt-1" aria-hidden="true">
            {WORDS.map((w, k) => <span key={w} className="flex-1 text-center">{k + 1}</span>)}
          </div>
          <div className="flex justify-between text-caption text-content-muted">
            <span>First word</span><span>Last word</span>
          </div>
          <p className="text-body-sm text-content-secondary mt-3" aria-live="polite">
            You recalled <strong>{first}/4</strong> from the start, <strong>{middle}/4</strong> from the middle and <strong>{last}/4</strong> from the end.{' '}
            {delay
              ? 'With the delay, recency usually disappears (the end of the list fell out of short-term memory) while primacy holds.'
              : 'Most people do best at the start (primacy, rehearsed into long-term memory) and the end (recency, still in short-term memory). Try again with the delay.'}
          </p>
          <Button size="sm" variant="secondary" className="mt-3" onClick={() => setPhase('ready')}>Try again</Button>
        </>
      )}
    </div>
  );
}
