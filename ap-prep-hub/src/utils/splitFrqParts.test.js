import { splitFrqParts } from './testUtils';

// Real generated stems that the old /\(([a-z])\)/ split mangled.
const DRONE = 'A drone is launched. Its height in meters at time $t$ seconds is modeled by the differentiable function $h(t) = 45t \\cdot \\cos\\left(\\frac{t}{4}\\right) - 15\\sin\\left(\\frac{t}{2}\\right) + 10$.\\n\\n(a) Find the average velocity over $2 \\le t \\le 7$. (2 points)\\n\\n(b) Find the value of $h\'(5)$. (3 points)\\n\\n(c) Determine all times for which the velocity equals the average velocity found in part (a). (2 points)\\n\\n(d) The velocity is given by $v(t) = h\'(t)$. Find the acceleration at $t = 5$, $\\neq 0$. (2 points)';

test('function arguments like h(t), v(t) are not part labels', () => {
  const { stem, parts } = splitFrqParts(DRONE);
  expect(stem).toMatch(/\$h\(t\) = 45t .* \+ 10\$\.$/s);
  expect(parts).toHaveLength(4);
  expect(parts[0]).toMatch(/^Find the average velocity/);
  // "part (a)" inside part (c) is a reference, not a new label.
  expect(parts[2]).toMatch(/found in part \(a\)\. \(2 points\)$/);
  expect(parts[3]).toMatch(/\$v\(t\) = h'\(t\)\$/);
});

test('literal \\n becomes a newline but \\neq survives', () => {
  const { stem, parts } = splitFrqParts(DRONE);
  expect(stem).not.toMatch(/\\n/);
  expect(parts[3]).toContain('\\neq 0');
});

test('no split without at least two labelled parts', () => {
  expect(splitFrqParts('Evaluate f(x) at (a) only.')).toBeNull();
  expect(splitFrqParts('Let g(x) = x^2 and f(t) = 3t.')).toBeNull();
});

describe('results rubric box', () => {
  const { buildRubricItems, attachScoresToRubric } = require('./testUtils');
  const q = { type: 'calculator-frq', parts: ['a', 'b', 'c', 'd'], rubric: { totalPoints: 9, pointBreakdown: { part_a: '2 points', part_b: '3 points', part_c: '2 points', part_d: '2 points' } } };
  const earned = (bd) => attachScoresToRubric(buildRubricItems(q), bd).items.map((i) => `${i.earned}/${i.maxPoints}`);

  test('uses the rubric points per part', () => {
    expect(buildRubricItems(q).items.map((i) => i.maxPoints)).toEqual([2, 3, 2, 2]);
  });
  test('reads the wrapped (saved) breakdown, not `true` as a score', () => {
    const wrapped = { __safe_breakdown: true, parts: [{ name: 'part_a', score: 2 }, { name: 'part_b', score: 3 }, { name: 'part_c', score: 2 }, { name: 'part_d', score: 2 }], __original_path: 'x' };
    expect(earned(wrapped)).toEqual(['2/2', '3/3', '2/2', '2/2']);
  });
  test('plain keys in any spelling', () => {
    expect(earned({ part_a: 1, 'Part B': 2, c: 0, part4: 2 })).toEqual(['1/2', '2/3', '0/2', '2/2']);
  });
});

describe('clampCount / clampMinutes', () => {
  const { clampCount, clampMinutes } = require('./testUtils');
  it('keeps setup numbers in range', () => {
    expect(clampCount('150')).toBe(100);
    expect(clampCount('0')).toBe(1);
    expect(clampCount('6')).toBe(6);
    expect(clampMinutes('-1', 70)).toBe(70);
    expect(clampMinutes('0', 70)).toBe(70);
    expect(clampMinutes('999', 70)).toBe(300);
    expect(clampMinutes('25', 70)).toBe(25);
  });
});

describe('fixLaTeXInQuestions', () => {
  const { fixLaTeXInQuestions, fixLaTeXInText } = require('./testUtils');
  it('cleans parts, stimulus and rubric, not just the stem', () => {
    const [q] = fixLaTeXInQuestions([{ question: 'x', parts: ['Find $\\\\frac{1}{2}$'], stimulus: '$\\\\mu$ g', rubric: { scoringGuidelines: '$\\\\sqrt{2}$' } }]);
    expect(q.parts[0]).toBe('Find $\\frac{1}{2}$');
    expect(q.stimulus).toBe('$\\mu$ g');
    expect(q.rubric.scoringGuidelines).toBe('$\\sqrt{2}$');
  });
  it('does not treat prose between two money amounts as math', () => {
    expect(fixLaTeXInText('by $\\$50$ billion with pi and $\\$50$ more')).toBe('by $\\$50$ billion with pi and $\\$50$ more');
  });
});

describe('planFullTest', () => {
  const { planFullTest } = require('./testUtils');
  const apush = { sections: [
    { id: 'mcq', questions: 55 },
    { id: 'frq', questions: 5, subSections: [{ id: 'saq-only', questions: 3 }, { id: 'dbq-only', questions: 1 }, { id: 'leq-only', questions: 1 }, { id: 'all-frq', questions: 5 }] },
    { id: 'full', questions: 60 },
  ] };
  it('reads parts from the config, skipping the all-FRQ option', () => {
    expect(planFullTest(apush).map((p) => `${p.type}:${p.count}`)).toEqual(['mcq:55', 'saq:3', 'dbq:1', 'leq:1']);
  });
  it('scales a custom count but keeps one of each part', () => {
    expect(planFullTest(apush, 12).map((p) => p.count)).toEqual([11, 1, 1, 1]);
  });
  it('uses a plain frq part when there are no subsections', () => {
    expect(planFullTest({ sections: [{ id: 'mcq', questions: 75 }, { id: 'frq', questions: 2 }] }).map((p) => p.type)).toEqual(['mcq', 'frq']);
  });
});

describe('examFormatNote', () => {
  const { examFormatNote } = require('./testUtils');
  it('gives language, CSP, Music Theory and Latin their real formats', () => {
    expect(examFormatNote('AP French Language and Culture', 'frq')).toMatch(/Argumentative Essay.*French/);
    expect(examFormatNote('AP Japanese Language and Culture', 'frq')).toMatch(/Story Narration/);
    expect(examFormatNote('AP Spanish Language and Culture', 'mcq')).toMatch(/in Spanish/);
    expect(examFormatNote('AP Computer Science Principles', 'frq')).toMatch(/pseudocode/);
    expect(examFormatNote('AP Music Theory', 'mcq')).toMatch(/Nonaural/);
    expect(examFormatNote('AP Latin', 'frq')).toMatch(/Latin passage/);
  });
  it('leaves other subjects to the existing prompts', () => {
    expect(examFormatNote('AP Biology', 'frq')).toBe('');
    expect(examFormatNote('AP Spanish Literature and Culture', 'frq')).toBe('');
  });
});

describe('code blocks inside generated questions', () => {
  const { parseAIResponse } = require('./testUtils');
  const JSONParser = require('../services/ai/jsonParser').default;
  const raw = '```json\n[{"id": 1, "type": "frq", "question": "Consider:\\n```text\\nPROCEDURE F(x)\\n{\\n  RETURN x\\n}\\n```\\nExplain."}]\n```';
  it('keeps the fences inside a question while removing the wrapper', () => {
    const viaUtils = parseAIResponse(raw);
    expect(viaUtils[0].question).toContain('```text\nPROCEDURE F(x)');
    const viaParser = new JSONParser().parse(raw, true);
    expect(viaParser.data[0].question).toContain('```text\nPROCEDURE F(x)');
  });
});

describe('splitFrqParts with "a)" labels', () => {
  const { splitFrqParts } = require('./testUtils');
  it('splits line-start a) b) c) parts', () => {
    const out = splitFrqParts('Consider the procedure.\n\na) Describe its purpose.\n\nb) Trace a call.\n\nc) Fix the error.');
    expect(out.stem).toBe('Consider the procedure.');
    expect(out.parts).toEqual(['Describe its purpose.', 'Trace a call.', 'Fix the error.']);
  });
  it('ignores a) in the middle of a sentence', () => {
    expect(splitFrqParts('Pick option a) or option b) as you like.')).toBeNull();
  });
});

describe('generation progress estimate', () => {
  const { shownFraction } = require('../components/practice/GenerationProgress');
  it('moves before any batch lands, jumps to real progress, and never claims done early', () => {
    expect(shownFraction({ elapsed: 3000, expected: 20000, generated: 0, total: 6 })).toBeGreaterThan(0.1);
    expect(shownFraction({ elapsed: 1000, expected: 20000, generated: 3, total: 6 })).toBe(0.5);
    expect(shownFraction({ elapsed: 999999, expected: 20000, generated: 0, total: 6 })).toBeLessThanOrEqual(0.96);
  });
});
