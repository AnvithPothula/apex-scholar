import { normalizeFrqResult, normalizeMcqResult, partScope } from './grader';

jest.mock('./geminiService', () => ({}));

test('FRQ score is the sum of capped criteria, and the official total wins', () => {
  const r = normalizeFrqResult({
    score: 9,
    maxPoints: 9,
    criteria: [
      { name: 'Thesis', possible: 1, earned: 1, reason: 'clear claim' },
      { name: 'Evidence', possible: 2, earned: 5, reason: 'over-awarded' },
      { name: 'Analysis', possible: 2, earned: -1, reason: 'negative' },
      { name: '', possible: 1, earned: 1 },
    ],
  }, 7);
  expect(r.criteria.map((c) => c.earned)).toEqual([1, 2, 0]);
  expect(r.score).toBe(3);
  expect(r.maxPoints).toBe(7);
});

test('FRQ without criteria falls back to the model total, capped', () => {
  expect(normalizeFrqResult({ score: 12, maxPoints: 6 })).toMatchObject({ score: 6, maxPoints: 6 });
});

test('MCQ correctness comes from comparing letters, not the model flag', () => {
  const r = normalizeMcqResult({ items: [
    { number: 1, studentAnswer: '(b)', correctAnswer: 'B', correct: false },
    { number: 2, studentAnswer: 'C', correctAnswer: 'D', correct: true },
    { number: 3, studentAnswer: '', correctAnswer: 'A' },
    { number: 4, studentAnswer: 'A', correctAnswer: '' },
  ] });
  expect(r.items.map((i) => i.correct)).toEqual([true, false, false]);
  expect(r).toMatchObject({ score: 1, total: 3 });
});

test('grading some parts of an official question names them and caps the maximum', () => {
  const parts = [{ id: 'a', label: '(a)', points: 2 }, { id: 'b', label: '(b)', points: 3 }, { id: 'c', label: '(c)', points: 4 }];
  expect(partScope({ parts, selected: ['a', 'b', 'c'] })).toEqual({ note: '', max: null });
  const s = partScope({ parts, selected: ['a', 'c'] });
  expect(s.max).toBe(6);
  expect(s.note).toMatch(/GRADE ONLY THESE PARTS: \(a\), \(c\)/);
  expect(partScope({ parts: [{ id: 'a', label: '(a)', points: null }, { id: 'b', label: '(b)', points: 1 }], selected: ['a'] }).max).toBeNull();
  expect(partScope({}).note).toBe('');
});
