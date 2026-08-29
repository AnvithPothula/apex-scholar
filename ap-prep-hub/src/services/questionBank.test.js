import {
  slugify,
  bundleId,
  indexId,
  pickBundles,
  isUsableQuestion,
  sampleQuestions,
  extractQuestionArray,
  BUNDLE_SIZE,
} from './questionBank';

const q = (over = {}) => ({
  question: 'What is the powerhouse of the cell?',
  choices: ['Mitochondria', 'Ribosome', 'Nucleus', 'Golgi'],
  correctAnswer: 0,
  explanations: ['Right', 'No', 'No', 'No'],
  ...over,
});

describe('ids', () => {
  it('slugifies subject and unit names into stable keys', () => {
    expect(slugify('AP U.S. History')).toBe('ap-u-s-history');
    expect(slugify('Unit 3: Cell Energetics')).toBe('unit-3-cell-energetics');
    expect(slugify('')).toBe('');
  });

  it('builds a bundle id from subject, unit and index', () => {
    expect(bundleId('AP Biology', 'Unit 2', 0)).toBe('ap-biology__unit-2__0');
  });

  it('falls back to the general unit when none is given', () => {
    // Diagnostics assess the whole course, so they have no unit.
    expect(bundleId('AP Biology', '', 1)).toBe('ap-biology__general__1');
  });

  it('keys the index by subject alone', () => {
    expect(indexId('AP Biology')).toBe('ap-biology');
  });
});

describe('pickBundles', () => {
  it('returns nothing when the bank has no bundles', () => {
    expect(pickBundles(0, 15)).toEqual([]);
    expect(pickBundles(undefined, 15)).toEqual([]);
    expect(pickBundles(-1, 15)).toEqual([]);
  });

  it('never asks for more bundles than exist', () => {
    expect(pickBundles(1, 15)).toEqual([0]);
  });

  it('reads a spare bundle so retakes are not the same questions', () => {
    // 15 questions fit in one 20-question bundle, but drawing from two means a
    // second attempt samples a different subset.
    expect(pickBundles(5, 15, seq([0.0, 0.4])).length).toBe(2);
  });

  it('caps reads at three bundles however large the bank is', () => {
    expect(pickBundles(50, 200, seq([0, 0.1, 0.2, 0.3, 0.4])).length).toBe(3);
  });

  it('returns distinct indices even when the source keeps colliding', () => {
    const picks = pickBundles(4, 15, () => 0.1);
    expect(new Set(picks).size).toBe(picks.length);
  });

  it('always returns in-range indices', () => {
    const picks = pickBundles(3, 40, () => 0.999999);
    expect(picks.every((i) => i >= 0 && i < 3)).toBe(true);
  });
});

describe('isUsableQuestion', () => {
  it('accepts a well-formed question', () => {
    expect(isUsableQuestion(q())).toBe(true);
  });

  it('rejects a question whose answer key is out of range', () => {
    // The UI indexes choices[correctAnswer]; 4 would mark nothing correct and
    // fail every student who answered it.
    expect(isUsableQuestion(q({ correctAnswer: 4 }))).toBe(false);
    expect(isUsableQuestion(q({ correctAnswer: -1 }))).toBe(false);
    expect(isUsableQuestion(q({ correctAnswer: '0' }))).toBe(false);
  });

  it('rejects the wrong number of choices or explanations', () => {
    expect(isUsableQuestion(q({ choices: ['a', 'b', 'c'] }))).toBe(false);
    expect(isUsableQuestion(q({ explanations: ['only one'] }))).toBe(false);
  });

  it('rejects blank stems and blank choices', () => {
    expect(isUsableQuestion(q({ question: '   ' }))).toBe(false);
    expect(isUsableQuestion(q({ choices: ['a', '', 'c', 'd'] }))).toBe(false);
  });

  it('rejects junk', () => {
    expect(isUsableQuestion(null)).toBe(false);
    expect(isUsableQuestion({})).toBe(false);
  });
});

describe('sampleQuestions', () => {
  it('drops unusable entries instead of serving them', () => {
    const bundles = [{ questions: [q(), q({ correctAnswer: 9 }), q({ question: 'Second?' })] }];
    const out = sampleQuestions(bundles, 10, () => 0);
    expect(out).toHaveLength(2);
    expect(out.every(isUsableQuestion)).toBe(true);
  });

  it('deduplicates the same stem appearing in two bundles', () => {
    // Seeding runs are not transactional; a re-run can land the same question
    // in a second bundle, and a diagnostic asking it twice looks broken.
    const bundles = [{ questions: [q()] }, { questions: [q({ question: '  what is the POWERHOUSE of the cell? ' })] }];
    expect(sampleQuestions(bundles, 10, () => 0)).toHaveLength(1);
  });

  it('returns at most the requested count', () => {
    const bundles = [{ questions: Array.from({ length: BUNDLE_SIZE }, (_, i) => q({ question: `Q${i}?` })) }];
    expect(sampleQuestions(bundles, 15, () => 0)).toHaveLength(15);
  });

  it('survives empty and malformed bundles', () => {
    expect(sampleQuestions([], 10)).toEqual([]);
    expect(sampleQuestions(null, 10)).toEqual([]);
    expect(sampleQuestions([{}, { questions: null }], 10)).toEqual([]);
  });
});

/** Deterministic stand-in for Math.random, cycling through fixed values. */
function seq(values) {
  let i = 0;
  return () => values[i++ % values.length];
}

describe('extractQuestionArray', () => {
  it('parses a clean array', () => {
    expect(extractQuestionArray('[{"question":"a"},{"question":"b"}]')).toHaveLength(2);
  });

  it('ignores the prose and code fence a model wraps around it', () => {
    const text = 'Here you go:\n```json\n[{"question":"a"}]\n```\nHope that helps!';
    expect(extractQuestionArray(text)).toEqual([{ question: 'a' }]);
  });

  it('salvages a response truncated mid-object', () => {
    // 20 questions with four explanations each sits near the output-token
    // ceiling, so this is the common failure, not an edge case. Throwing the
    // whole call away wastes a model request that mostly succeeded.
    const text = '[{"question":"a"},{"question":"b"},{"question":"c","choi';
    expect(extractQuestionArray(text)).toEqual([{ question: 'a' }, { question: 'b' }]);
  });

  it('is not fooled by brackets inside a question', () => {
    const text = '[{"question":"which is f(x] } g?"},{"question":"tru';
    expect(extractQuestionArray(text)).toEqual([{ question: 'which is f(x] } g?' }]);
  });

  it('is not fooled by an escaped quote inside a question', () => {
    const text = '[{"question":"he said \\"hi\\" loudly"},{"qu';
    expect(extractQuestionArray(text)).toEqual([{ question: 'he said "hi" loudly' }]);
  });

  it('returns null when there is nothing to salvage', () => {
    expect(extractQuestionArray('no json here')).toBeNull();
    expect(extractQuestionArray('[{"question":"unclosed')).toBeNull();
    expect(extractQuestionArray('')).toBeNull();
  });
});
