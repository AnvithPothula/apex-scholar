import React, { useState } from 'react';
import { Button } from '../ui/UIComponents';

const MAX = 9;

/**
 * Dehydration synthesis vs hydrolysis, by doing it. Every join releases one
 * water; every split uses one. The counters make "n monomers, n − 1 bonds"
 * something the student sees rather than memorizes.
 */
export default function PolymerBuilder() {
  // One state object so fast double-clicks can't desync the counters.
  const [s, setS] = useState({ n: 2, released: 1, used: 0, last: 'Two monomers joined by one covalent bond. One water was released to make it.' });
  const { n, released, used, last } = s;

  const join = () => setS((p) => (p.n >= MAX ? p : {
    n: p.n + 1, released: p.released + 1, used: p.used,
    last: 'Dehydration synthesis: an H from one monomer and an OH from the other left as H₂O, and a new covalent bond formed.',
  }));
  const split = () => setS((p) => (p.n <= 1 ? p : {
    n: p.n - 1, released: p.released, used: p.used + 1,
    last: 'Hydrolysis: a water molecule was split across the bond (H to one monomer, OH to the other) and the bond broke.',
  }));

  return (
    <div className="my-5 p-4 rounded-lg border border-border-strong bg-base-850">
      <p className="text-label text-content-muted uppercase tracking-wide mb-3">Simulation · build and break a polymer</p>
      <div className="flex items-center flex-wrap gap-y-2 min-h-[44px]" aria-label={`Chain of ${n} monomers`}>
        {Array.from({ length: n }).map((_, i) => (
          // Bond and monomer wrap together, so a wrapped row starts with the
          // bond that joins it instead of ending the row on a dangling bond.
          <span key={i} className="flex items-center">
            {i > 0 && <span className="w-5 h-0.5 bg-primary-400" aria-hidden="true" />}
            <span className="w-9 h-9 rounded-full border-2 border-primary-500 bg-base-800 flex items-center justify-center text-caption text-content-secondary">
              {i + 1}
            </span>
          </span>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        <Stat label="Monomers" value={n} />
        <Stat label="Bonds" value={n - 1} />
        <Stat label="H₂O released / used" value={`${released} / ${used}`} />
      </div>
      <p className="text-body-sm text-content-secondary mt-3" aria-live="polite">{last}</p>
      <div className="flex flex-wrap gap-2 mt-3">
        <Button size="sm" onClick={join} disabled={n >= MAX}>Join a monomer (dehydration)</Button>
        <Button size="sm" variant="secondary" onClick={split} disabled={n <= 1}>Break a bond (hydrolysis)</Button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="p-2 rounded-md bg-base-800">
      <div className="text-h4 font-semibold text-content-primary">{value}</div>
      <div className="text-caption text-content-muted">{label}</div>
    </div>
  );
}
