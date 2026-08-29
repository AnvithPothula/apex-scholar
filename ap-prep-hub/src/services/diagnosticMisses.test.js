/**
 * The review queue (services/srs.js) has been fed by practice tests since it
 * was built, but never by diagnostics — the one assessment whose entire purpose
 * is finding weak spots was the one that dropped them.
 *
 * Mirrors the mapping in pages/Diagnostics.js. Kept standalone because
 * importing the page pulls in firebase, which jsdom cannot load.
 */
// srs.js pulls in Firestore, which blows up under jsdom (no TextEncoder).
// Same stub srs.test.js uses — the scheduling logic under test is pure.
jest.mock('../config/firestore', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}));

// eslint-disable-next-line import/first
import { cardFromMiss } from './srs';

const missesFrom = (questions, answers, subject) =>
  questions
    .map((q, i) => ({ q, i }))
    .filter(({ q, i }) => answers[i] !== q.correctAnswer)
    .map(({ q, i }) => ({
      question: q.question,
      subject,
      unit: q.concept || null,
      options: Array.isArray(q.choices) ? q.choices : null,
      correctIndex: Number.isInteger(q.correctAnswer) ? q.correctAnswer : null,
      userAnswer: answers[i] != null ? q.choices?.[answers[i]] : '',
      correctAnswer: q.choices?.[q.correctAnswer] ?? '',
      explanation: q.explanations?.[answers[i]] || q.explanations?.[q.correctAnswer] || '',
    }));

const QUESTIONS = [
  {
    question: 'Which organelle performs the light reactions?',
    concept: 'Photosynthesis',
    choices: ['Mitochondrion', 'Thylakoid', 'Nucleus', 'Ribosome'],
    correctAnswer: 1,
    explanations: ['Wrong: that is respiration', 'Correct', 'Wrong', 'Wrong'],
  },
  {
    question: 'What is the powerhouse of the cell?',
    concept: 'Cell Structure',
    choices: ['Mitochondrion', 'Thylakoid', 'Nucleus', 'Ribosome'],
    correctAnswer: 0,
    explanations: ['Correct', 'Wrong', 'Wrong', 'Wrong'],
  },
];

describe('diagnostic misses feed the review queue', () => {
  it('queues only the questions that were missed', () => {
    const misses = missesFrom(QUESTIONS, { 0: 0, 1: 0 }, 'AP Biology');
    expect(misses).toHaveLength(1);
    expect(misses[0].question).toMatch(/light reactions/);
  });

  it('queues nothing on a perfect run', () => {
    expect(missesFrom(QUESTIONS, { 0: 1, 1: 0 }, 'AP Biology')).toEqual([]);
  });

  it('counts a skipped question as missed', () => {
    // undefined !== correctAnswer, so skips are queued — which is right: you
    // did not know it.
    expect(missesFrom(QUESTIONS, {}, 'AP Biology')).toHaveLength(2);
  });

  it('explains the choice the student actually picked', () => {
    const [m] = missesFrom(QUESTIONS, { 0: 0, 1: 0 }, 'AP Biology');
    expect(m.explanation).toBe('Wrong: that is respiration');
  });

  it('falls back to the correct-answer explanation when the pick has none', () => {
    const q = [{ ...QUESTIONS[0], explanations: [undefined, 'Correct answer text'] }];
    expect(missesFrom(q, { 0: 0 }, 'AP Biology')[0].explanation).toBe('Correct answer text');
  });

  it('produces cards srs accepts, due immediately', () => {
    const [m] = missesFrom(QUESTIONS, { 0: 0, 1: 0 }, 'AP Biology');
    const card = cardFromMiss(m, 1000);
    expect(card).not.toBeNull();
    expect(card.due).toBe(1000);
    expect(card.subject).toBe('AP Biology');
    expect(card.unit).toBe('Photosynthesis');
    expect(card.options).toHaveLength(4);
    expect(card.correctIndex).toBe(1);
    expect(card.correctAnswer).toBe('Thylakoid');
    expect(card.userAnswer).toBe('Mitochondrion');
  });

  it('gives the same question a stable id so re-missing updates one card', () => {
    const [m] = missesFrom(QUESTIONS, { 0: 0, 1: 0 }, 'AP Biology');
    expect(cardFromMiss(m, 1).id).toBe(cardFromMiss(m, 999).id);
  });
});
