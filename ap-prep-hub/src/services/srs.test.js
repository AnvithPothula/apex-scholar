// These tests cover the pure scheduling logic only, so stub the Firestore
// layer — importing the real firebase app blows up under jsdom (no TextEncoder).
jest.mock('../config/firestore', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}));

import { review, GRADE, cardFromMiss, cardId, dueCards, trim } from './srs';

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_000_000_000_000;

describe('SM-2 review', () => {
  it('walks a new card up the 1 / 6 / interval*ease ladder', () => {
    const a = review({}, GRADE.good, NOW);
    expect(a.reps).toBe(1);
    expect(a.interval).toBe(1);
    expect(a.due).toBe(NOW + DAY);

    const b = review(a, GRADE.good, NOW);
    expect(b.reps).toBe(2);
    expect(b.interval).toBe(6);

    const c = review(b, GRADE.good, NOW);
    expect(c.reps).toBe(3);
    expect(c.interval).toBe(Math.round(6 * c.ease));
  });

  it('resets the interval but keeps history on a lapse', () => {
    const mature = review(review(review({}, GRADE.good, NOW), GRADE.good, NOW), GRADE.good, NOW);
    const lapsed = review(mature, GRADE.again, NOW);

    expect(lapsed.reps).toBe(0);
    // A card you just got wrong returns in minutes, not tomorrow — see the
    // relearning step in srs.js.
    expect(lapsed.interval).toBeCloseTo(10 / (24 * 60), 6);
    expect(lapsed.due - NOW).toBeLessThan(60 * 60 * 1000);
    expect(lapsed.lapses).toBe(1);
    // A lapse must make the card harder, not easier.
    expect(lapsed.ease).toBeLessThan(mature.ease);
  });

  it('never lets ease fall below the SM-2 floor', () => {
    let card = {};
    for (let i = 0; i < 20; i++) card = review(card, GRADE.again, NOW);
    expect(card.ease).toBeGreaterThanOrEqual(1.3);
  });
});

describe('cards', () => {
  it('builds a due-now card from a miss', () => {
    const card = cardFromMiss(
      { question: 'What is osmosis?', subject: 'AP Biology', userAnswer: 'B', correctAnswer: 'C' },
      NOW
    );
    expect(card.due).toBe(NOW);
    expect(card.subject).toBe('AP Biology');
    expect(card.ease).toBe(2.5);
  });

  it('gives the same question the same id so re-misses update one card', () => {
    expect(cardId('AP Biology', 'What is osmosis?')).toBe(cardId('AP Biology', '  what is OSMOSIS?  '));
    expect(cardId('AP Biology', 'x')).not.toBe(cardId('AP Chemistry', 'x'));
  });

  it('ignores an empty question', () => {
    expect(cardFromMiss({ question: '   ', subject: 'AP Biology' })).toBeNull();
  });
});

describe('queue', () => {
  it('returns only due cards, most overdue first', () => {
    const cards = [
      { id: 'a', due: NOW + DAY },
      { id: 'b', due: NOW - 5 * DAY },
      { id: 'c', due: NOW - DAY },
    ];
    expect(dueCards(cards, NOW).map((c) => c.id)).toEqual(['b', 'c']);
  });

  it('trims the longest-scheduled cards when the queue overflows', () => {
    const cards = [
      { id: 'keep', interval: 1 },
      { id: 'drop', interval: 90 },
    ];
    expect(trim(cards, 1).map((c) => c.id)).toEqual(['keep']);
  });
});

describe('grade differentiation on a new card', () => {
  it('makes the four buttons mean four different things', () => {
    // They used to all schedule 1 day, so choosing between them was
    // meaningless and the interval shown on each button read "1d · 1d · 1d · 1d".
    const again = review({}, GRADE.again, NOW);
    const good = review({}, GRADE.good, NOW);
    const easy = review({}, GRADE.easy, NOW);
    expect(again.interval).toBeLessThan(good.interval);
    expect(good.interval).toBeLessThan(easy.interval);
  });

  it('keeps easy ahead of good on the second pass too', () => {
    const seen = review({}, GRADE.good, NOW);
    expect(review(seen, GRADE.easy, NOW).interval)
      .toBeGreaterThan(review(seen, GRADE.good, NOW).interval);
  });

  it('leaves the mature ladder on ease, not on fixed steps', () => {
    const mature = { ease: 2.5, reps: 5, interval: 30, lapses: 0 };
    expect(review(mature, GRADE.good, NOW).interval)
      .toBe(Math.round(30 * review(mature, GRADE.good, NOW).ease));
  });
});
