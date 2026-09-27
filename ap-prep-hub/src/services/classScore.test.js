/**
 * Tests for netlify/lib/classScore.js — the server-side re-scoring behind the
 * class leaderboard. Lives under src/ because CRA's jest only scans src/ (same
 * arrangement as firebaseAdminEnv.test.js).
 */
const { scoreSavedTest, MAX_QUESTIONS } = require('../../netlify/lib/classScore');

const mcq = (id, correctAnswer) => ({ id, type: 'mcq', correctAnswer });

describe('scoreSavedTest', () => {
  it('re-marks MCQs from the answer key instead of trusting stored results', () => {
    const test = {
      questions: [mcq(1, 0), mcq(2, 1)],
      userAnswers: { 1: 0, 2: 3 },
      // A tampered result claiming both right.
      results: { questionResults: [
        { questionId: 1, correct: true, score: 1, maxPoints: 1 },
        { questionId: 2, correct: true, score: 1, maxPoints: 1 },
      ] },
    };
    expect(scoreSavedTest(test)).toEqual({ answered: 2, correct: 1 });
  });

  it('treats answer index 0 as an answer, and blank as a skip', () => {
    const test = { questions: [mcq(1, 0), mcq(2, 1), mcq(3, 2)], userAnswers: { 1: 0, 2: '  ', 3: null } };
    expect(scoreSavedTest(test)).toEqual({ answered: 1, correct: 1 });
  });

  it('reads Firestore string map keys for numeric question ids', () => {
    const test = { questions: [mcq(7, 2)], userAnswers: { '7': 2 } };
    expect(scoreSavedTest(test)).toEqual({ answered: 1, correct: 1 });
  });

  it('uses stored grades for written responses, but skips ungraded and ungraded-looking ones', () => {
    const test = {
      questions: [{ id: 1, type: 'frq' }, { id: 2, type: 'saq' }, { id: 3, type: 'leq' }, { id: 4, type: 'dbq' }],
      userAnswers: { 1: 'a', 2: 'b', 3: 'c', 4: 'd' },
      results: { questionResults: [
        { questionId: 1, score: 9, maxPoints: 9 },
        { questionId: 2, score: 1, maxPoints: 3 },
        { questionId: 3, ungraded: true, score: 0, maxPoints: 0 },
        { questionId: 4, score: 5, maxPoints: 0 }, // inconsistent: no credit
      ] },
    };
    expect(scoreSavedTest(test)).toEqual({ answered: 2, correct: 1 });
  });

  it('counts a duplicated question id once', () => {
    const test = { questions: [mcq(1, 0), mcq(1, 0)], userAnswers: { 1: 0 } };
    expect(scoreSavedTest(test)).toEqual({ answered: 1, correct: 1 });
  });

  it('rejects docs that are not plausible tests', () => {
    expect(scoreSavedTest(null)).toBeNull();
    expect(scoreSavedTest({ questions: 'nope' })).toBeNull();
    const huge = { questions: Array.from({ length: MAX_QUESTIONS + 1 }, (_, i) => mcq(i, 0)) };
    expect(scoreSavedTest(huge)).toBeNull();
  });
});
