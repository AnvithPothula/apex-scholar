import fs from 'fs';
import path from 'path';
import { getScoreModel, canonicalSubject } from './apScoreModels';

// Subjects whose exam structure has NOT been researched yet. They correctly
// fall back to the generic model, which labels itself as a rough estimate.
// Removing a name from this list means a real model now exists for it.
// Every AP subject in subjects.js now has a researched model. The generic
// fallback still exists for anything unrecognised — see the last test.
const KNOWN_UNMODELLED = [];

describe('subject name → score model', () => {
  const subjectsSrc = fs.readFileSync(path.join(__dirname, 'subjects.js'), 'utf8');
  const names = [...new Set(
    [...subjectsSrc.matchAll(/"(AP [^"]+)"|'(AP [^']+)'/g)].map((m) => m[1] || m[2])
  )];

  it('finds AP subject names to check', () => {
    expect(names.length).toBeGreaterThan(20);
  });

  it('never silently drops a modelled subject onto the generic curve', () => {
    // The app used several spellings ("AP U.S. History" vs "AP US History",
    // "AP Physics 1: Algebra-Based" vs "AP Physics 1"). getScoreModel did an
    // exact key lookup, so those students got the generic 50/50 fallback even
    // though a researched model existed — and nothing surfaced it.
    const wronglyGeneric = names
      .filter((n) => !KNOWN_UNMODELLED.includes(n))
      .filter((n) => getScoreModel(n).generic === true);
    expect(wronglyGeneric).toEqual([]);
  });

  it('still falls back to the honest generic model for an unknown subject', () => {
    // Coverage is complete today, but the fallback must keep working — a new
    // AP course, or a typo, must not silently get another subject's curve.
    KNOWN_UNMODELLED.forEach((n) => expect(getScoreModel(n).generic).toBe(true));
    expect(getScoreModel('AP Basket Weaving').generic).toBe(true);
    expect(getScoreModel('').generic).toBe(true);
  });

  it('covers every AP subject the app offers', () => {
    const uncovered = names.filter((n) => getScoreModel(n).generic === true);
    expect(uncovered).toEqual([]);
  });

  it('resolves an alias to its canonical key', () => {
    expect(canonicalSubject('AP U.S. History')).toBe('AP US History');
    expect(canonicalSubject('AP Physics 1: Algebra-Based')).toBe('AP Physics 1');
    expect(canonicalSubject('AP Biology')).toBe('AP Biology');
  });
});
