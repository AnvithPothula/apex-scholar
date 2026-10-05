import {
  FIRST_RUN_SUBJECTS, subjectKeyFor, defaultSubject, daysToExam, wilson,
  predictFromCheck, missedConcepts, homePath,
} from './firstRun';

describe('first-run check', () => {
  it('offers only subjects with a score model, and maps names back to curriculum keys', () => {
    expect(FIRST_RUN_SUBJECTS).toContain('AP Biology');
    expect(FIRST_RUN_SUBJECTS).toContain('AP U.S. History');
    expect(FIRST_RUN_SUBJECTS.some((s) => /Seminar|Research/.test(s))).toBe(false);
    expect(subjectKeyFor('AP Biology')).toBe('biology');
    expect(defaultSubject(['research', 'biology'])).toBe('AP Biology');
    expect(defaultSubject([])).toBeNull();
  });

  it('counts whole days to the main sitting', () => {
    expect(daysToExam('AP Biology', new Date(2027, 4, 1, 23, 0))).toBe(2); // exam May 3
    expect(daysToExam('AP Biology', new Date(2027, 5, 1))).toBeNull();
    expect(daysToExam('Not an exam')).toBeNull();
  });

  it('gives a range that brackets the point estimate and narrows with more questions', () => {
    const [lo, hi] = wilson(7, 10);
    expect(lo).toBeLessThan(0.7);
    expect(hi).toBeGreaterThan(0.7);
    const [lo2, hi2] = wilson(70, 100);
    expect(hi2 - lo2).toBeLessThan(hi - lo);
  });

  it('predicts a score with low <= estimate <= high', () => {
    const p = predictFromCheck('AP Biology', 6, 10);
    expect(p.low).toBeLessThanOrEqual(p.estimate.score);
    expect(p.high).toBeGreaterThanOrEqual(p.estimate.score);
    expect(p.estimate.predicted).toContain('frq');
    expect(predictFromCheck('AP Biology', 10, 10).estimate.score).toBe(5);
  });

  it('lists missed concepts most-missed first', () => {
    const qs = [
      { concept: 'A', correctAnswer: 0 }, { concept: 'B', correctAnswer: 0 },
      { concept: 'B', correctAnswer: 0 }, { concept: 'C', correctAnswer: 0 },
    ];
    expect(missedConcepts(qs, { 0: 1, 1: 2, 2: 3, 3: 0 })).toEqual(['B', 'A']);
  });

  it('routes home: guests and new accounts to /start, done or loading never bounced', () => {
    expect(homePath({ isGuest: true })).toBe('/start');
    expect(homePath({ isGuest: true, localDone: true })).toBe('/ai-tutors');
    expect(homePath({ user: { uid: 'u' } })).toBeNull(); // profile not loaded yet
    expect(homePath({ user: { uid: 'u', profileLoaded: true } })).toBe('/start');
    expect(homePath({ user: { uid: 'u', profileLoaded: true, firstRunAt: 'x' } })).toBe('/ai-tutors');
    expect(homePath({ user: { uid: 'u', profileLoaded: true, firstRunSkippedAt: 'x' } })).toBe('/ai-tutors');
    expect(homePath({})).toBeNull();
  });
});
