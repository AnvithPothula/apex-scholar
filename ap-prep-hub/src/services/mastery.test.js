import { levelFor, subjectMastery, masteryBySubject, weakestArea, isAbandoned } from './mastery';

// Fixtures must answer the SAME question ids their questionResults use —
// mastery now scores only attempted questions, so a mismatch silently drops one.
const answersFor = (ids) => Object.fromEntries(ids.map((i) => [i, 'A']));
const range = (n, start = 0) => Array.from({ length: n }, (_, i) => i + start);

const test1 = {
  subject: 'AP Biology',
  createdAt: 1000,
  selectedUnits: ['Unit 3'],
  userAnswers: answersFor(range(6, 1)),
  questions: [
    { id: 1, type: 'mcq' }, { id: 2, type: 'mcq' }, { id: 3, type: 'mcq' },
    { id: 4, type: 'mcq' }, { id: 5, type: 'mcq' }, { id: 6, type: 'mcq' },
  ],
  results: {
    apScore: 3,
    questionResults: [
      { questionId: 1, correct: true, score: 1, maxPoints: 1 },
      { questionId: 2, correct: true, score: 1, maxPoints: 1 },
      { questionId: 3, correct: false, score: 0, maxPoints: 1 },
      { questionId: 4, correct: false, score: 0, maxPoints: 1 },
      { questionId: 5, correct: false, score: 0, maxPoints: 1 },
      { questionId: 6, correct: false, score: 0, maxPoints: 1 },
    ],
    breakdown: {
      mcq: { correct: 2, total: 6 },
      frq: { correct: 0, total: 0 },
    },
  },
};

describe('mastery levels', () => {
  it('refuses to grade an area without enough evidence', () => {
    // Two questions right out of two is not proof of mastery.
    expect(levelFor(100, 2)).toBe('insufficient');
    expect(levelFor(0, 1)).toBe('insufficient');
  });

  it('grades red/yellow/green once there are enough samples', () => {
    expect(levelFor(90, 10)).toBe('green');
    expect(levelFor(65, 10)).toBe('yellow');
    expect(levelFor(30, 10)).toBe('red');
  });
});

describe('subjectMastery', () => {
  it('scores from per-question results and surfaces real weak areas', () => {
    const m = subjectMastery('AP Biology', [test1]);
    expect(m.questionsAnswered).toBe(6);
    expect(m.accuracy).toBe(33);
    expect(m.level).toBe('red');
    expect(m.latestAPScore).toBe(3);

    const mcq = m.areas.find((a) => a.key === 'type:mcq');
    expect(mcq.accuracy).toBe(33);
    expect(m.weakAreas.map((a) => a.key)).toContain('type:mcq');
    // An empty section must never become a weakness.
    expect(m.areas.find((a) => a.key === 'type:frq')).toBeUndefined();
  });

  it('tracks a unit when the test recorded exactly one', () => {
    const m = subjectMastery('AP Biology', [test1]);
    expect(m.areas.find((a) => a.key === 'unit:Unit 3').accuracy).toBe(33);
  });

  it('never reports a weakness with too few samples', () => {
    const thin = {
      subject: 'AP Chemistry',
      userAnswers: answersFor([1]),
      questions: [{ id: 1, type: 'mcq' }],
      results: {
        questionResults: [{ questionId: 1, correct: false, score: 0, maxPoints: 1 }],
        breakdown: { mcq: { correct: 0, total: 1 } },
      },
    };
    const m = subjectMastery('AP Chemistry', [thin]);
    expect(m.level).toBe('insufficient');
    expect(m.weakAreas).toHaveLength(0);
  });

  it('counts an essay as ONE question but scores it on points', () => {
    // Regression: the saved `breakdown` totals are maxPoints, so 6 six-point
    // FRQs used to be reported as "36 questions" and treated as 36 samples.
    const frqTest = {
      subject: 'AP Biology',
      userAnswers: answersFor(range(6)),
      questions: Array.from({ length: 6 }, (_, i) => ({ id: i, type: 'frq' })),
      results: {
        questionResults: Array.from({ length: 6 }, (_, i) => ({
          questionId: i, correct: false, score: 3, maxPoints: 6,
        })),
        breakdown: { frq: { correct: 18, total: 36 } },
      },
    };
    const area = subjectMastery('AP Biology', [frqTest]).areas.find((a) => a.key === 'type:frq');
    expect(area.count).toBe(6);   // six essays, not thirty-six
    expect(area.total).toBe(36);  // points still tracked
    expect(area.accuracy).toBe(50); // partial credit, not a flat zero
  });
});

describe('masteryBySubject / weakestArea', () => {
  it('groups by subject and finds the single worst evidenced area', () => {
    const strong = {
      subject: 'AP Psychology',
      createdAt: 2000,
      userAnswers: answersFor(range(10)),
      questions: Array.from({ length: 10 }, (_, i) => ({ id: i, type: 'mcq' })),
      results: {
        questionResults: Array.from({ length: 10 }, (_, i) => ({
          questionId: i, correct: true, score: 1, maxPoints: 1,
        })),
        breakdown: { mcq: { correct: 10, total: 10 } },
      },
    };
    const all = masteryBySubject([test1, strong]);
    expect(all).toHaveLength(2);
    // Most recently studied first.
    expect(all[0].subject).toBe('AP Psychology');

    const worst = weakestArea(all);
    expect(worst.subject).toBe('AP Biology');
    expect(worst.accuracy).toBe(33);
  });

  it('returns null when nothing has enough evidence', () => {
    expect(weakestArea([])).toBeNull();
  });
});

describe('abandoned tests', () => {
  // Regression: opening a 66-question test and submitting it blank scored 0%
  // and made the app announce a "weakest area" to someone who had never
  // actually practiced. Not answering is not the same as being wrong.
  const blank = {
    subject: 'AP Biology',
    userAnswers: {},
    questions: Array.from({ length: 60 }, (_, i) => ({ id: i, type: 'mcq' })),
    results: {
      questionResults: Array.from({ length: 60 }, (_, i) => ({
        questionId: i, correct: false, score: 0, maxPoints: 1,
      })),
      breakdown: { mcq: { correct: 0, total: 60 } },
    },
  };

  it('flags a submission with no answers', () => {
    expect(isAbandoned(blank)).toBe(true);
    expect(isAbandoned({ userAnswers: { 0: '   ', 1: null } })).toBe(true);
    expect(isAbandoned({ userAnswers: { 0: 'B' } })).toBe(false);
  });

  it('keeps an abandoned test out of mastery entirely', () => {
    expect(masteryBySubject([blank])).toHaveLength(0);
    expect(weakestArea(masteryBySubject([blank]))).toBeNull();
  });

  it('still counts a test where only some answers were left blank', () => {
    const partial = { ...blank, userAnswers: { 0: 'A', 1: 'B', 2: 'C' } };
    expect(isAbandoned(partial)).toBe(false);
    expect(masteryBySubject([partial])).toHaveLength(1);
  });

  it('scores ONLY attempted questions, never counting skips as wrong', () => {
    // The real report: 4 of 66 answered, everything else skipped. Grading the
    // skips produced "0% across 60 questions" and a confident weakest area.
    const mostlySkipped = { ...blank, userAnswers: { 0: 'A', 1: 'B', 2: 'C', 3: 'D' } };
    const m = subjectMastery('AP Biology', [mostlySkipped]);

    expect(m.questionsAnswered).toBe(4);          // not 60
    expect(m.level).toBe('insufficient');         // 4 < MIN_SAMPLES
    expect(m.weakAreas).toHaveLength(0);
    expect(weakestArea(masteryBySubject([mostlySkipped]))).toBeNull();
  });
});
