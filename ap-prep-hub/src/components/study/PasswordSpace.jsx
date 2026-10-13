import React, { useState } from 'react';

const SETS = [
  { key: 'lower', label: 'a–z', size: 26 },
  { key: 'upper', label: 'A–Z', size: 26 },
  { key: 'digits', label: '0–9', size: 10 },
  { key: 'symbols', label: 'symbols', size: 32 },
];
const WORDLIST = 7776; // a standard diceware list: 6^5 words
const RATE = 1e10; // guesses per second: an offline attack on a fast hash

/** log10 of the number of possible passwords. Exported for tests. */
export function log10Space(mode, length, alphabet) {
  return mode === 'words' ? length * Math.log10(WORDLIST) : length * Math.log10(alphabet);
}

/** Worst-case time to try every possibility, as readable text. Exported for tests. */
export function crackTime(log10, rate = RATE) {
  const secs = 10 ** (log10 - Math.log10(rate));
  const units = [['years', 31557600], ['days', 86400], ['hours', 3600], ['minutes', 60], ['seconds', 1]];
  if (secs < 1) return 'under a second';
  const years = secs / 31557600;
  if (years >= 1e15) return 'more than a thousand trillion years';
  const big = [[1e12, 'trillion'], [1e9, 'billion'], [1e6, 'million']].find(([v]) => years >= v);
  if (big) return `about ${(years / big[0]).toFixed(1)} ${big[1]} years`;
  const [name, s] = units.find(([, u]) => secs >= u);
  const n = secs / s;
  return `about ${n < 10 ? n.toFixed(1) : Math.round(n).toLocaleString('en-US')} ${name}`;
}

/**
 * How length and randomness grow the number of possible passwords. Students
 * pick a length and character sets (or a count of random words); nothing they
 * type is a real password.
 */
export default function PasswordSpace() {
  const [mode, setMode] = useState('chars');
  const [length, setLength] = useState(8);
  const [words, setWords] = useState(4);
  const [on, setOn] = useState({ lower: true, upper: false, digits: true, symbols: false });
  const alphabet = SETS.reduce((n, s) => n + (on[s.key] ? s.size : 0), 0) || 26;
  const lg = log10Space(mode, mode === 'words' ? words : length, alphabet);

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · password search space</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Password type">
        {[['chars', 'Random characters'], ['words', 'Random words (passphrase)']].map(([m, label]) => (
          <button key={m} type="button" onClick={() => setMode(m)} aria-pressed={mode === m}
            className={`px-3 py-1.5 rounded-md border text-body-sm ${mode === m ? 'border-primary-500 bg-primary-900/40 text-content-primary' : 'border-border-strong text-content-secondary'}`}>
            {label}
          </button>
        ))}
      </div>
      {mode === 'chars' ? (
        <>
          <label className="block mt-3 text-body-sm text-content-primary">Length: <strong>{length}</strong> characters
            <input type="range" min="4" max="24" value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full accent-primary-500" aria-label="Password length" />
          </label>
          <div className="flex flex-wrap gap-3 mt-2" role="group" aria-label="Character sets">
            {SETS.map((s) => (
              <label key={s.key} className="flex items-center gap-1.5 text-body-sm text-content-secondary">
                <input type="checkbox" checked={on[s.key]} onChange={(e) => setOn((o) => ({ ...o, [s.key]: e.target.checked }))} className="accent-primary-500" />
                {s.label} ({s.size})
              </label>
            ))}
          </div>
          <p className="text-caption text-content-muted mt-1">{alphabet} possible characters per position{Object.values(on).some(Boolean) ? '' : ' (none chosen, so a–z is assumed)'}.</p>
        </>
      ) : (
        <label className="block mt-3 text-body-sm text-content-primary">Words: <strong>{words}</strong>, each picked at random from {WORDLIST.toLocaleString('en-US')}
          <input type="range" min="2" max="8" value={words} onChange={(e) => setWords(Number(e.target.value))} className="w-full accent-primary-500" aria-label="Number of words" />
        </label>
      )}
      <dl className="grid grid-cols-2 gap-3 mt-3">
        <div className="p-3 rounded-md bg-base-800">
          <dt className="text-caption text-content-muted">Possible passwords</dt>
          <dd className="text-h4 font-bold text-content-primary">≈ 10<sup>{lg.toFixed(1)}</sup></dd>
        </div>
        <div className="p-3 rounded-md bg-base-800">
          <dt className="text-caption text-content-muted">Time to try them all</dt>
          <dd className="text-body font-semibold text-content-primary" aria-live="polite">{crackTime(lg)}</dd>
        </div>
      </dl>
      <p className="text-caption text-content-muted mt-2">
        Assumes 10 billion guesses per second, an offline attack on a stolen, fast-hashed password file. This only holds if the password is
        truly random: patterns like a word + a year + "!" are guessed far sooner, because attackers try them first.
      </p>
    </div>
  );
}
