import fs from 'fs';
import path from 'path';
import { getScoreModel, canonicalSubject } from './apScoreModels';

// Subjects whose exam structure has NOT been researched yet. They correctly
// fall back to the generic model, which labels itself as a rough estimate.
// Removing a name from this list means a real model now exists for it.
// Every AP subject in subjects.js now has a researched model. The generic
// fallback still exists for anything unrecognised — see the last test.
// Portfolio courses are scored on submitted work, with no section raw scores
// to model, so the generic fallback is right for them.
const KNOWN_UNMODELLED = [
  'AP Art and Design', 'AP 2-D Art and Design', 'AP 3-D Art and Design', 'AP Drawing',
  'AP Studio Art and Design', 'AP Studio Art: 2-D Design', 'AP Studio Art: 3-D Design', 'AP Studio Art: Drawing',
];

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
    expect(getScoreModel('AP Basket Weaving').generic).toBe(true);
    expect(getScoreModel('').generic).toBe(true);
  });

  it('covers every AP subject the app offers', () => {
    const uncovered = names.filter((n) => !KNOWN_UNMODELLED.includes(n) && getScoreModel(n).generic === true);
    expect(uncovered).toEqual([]);
  });

  it('resolves an alias to its canonical key', () => {
    expect(canonicalSubject('AP US History')).toBe('AP U.S. History');
    expect(canonicalSubject('AP Physics 1')).toBe('AP Physics 1: Algebra-Based');
    expect(canonicalSubject('AP Government and Politics: Comparative')).toBe('AP Comparative Government and Politics');
    expect(canonicalSubject('AP Biology')).toBe('AP Biology');
  });
});
