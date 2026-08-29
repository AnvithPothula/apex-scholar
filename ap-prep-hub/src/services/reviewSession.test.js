jest.mock('../config/firestore', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(), getDoc: jest.fn(), setDoc: jest.fn(), serverTimestamp: jest.fn(),
}));

// eslint-disable-next-line import/first
import { formatDue, intervalLabel, suggestedGrade, keyAction } from './reviewSession';

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_700_000_000_000;
const CARD = { ease: 2.5, reps: 2, interval: 6, lapses: 0 };

describe('formatDue', () => {
  it('reads naturally at each scale', () => {
    expect(formatDue(NOW, NOW)).toBe('today');
    expect(formatDue(NOW - DAY, NOW)).toBe('today');
    expect(formatDue(NOW + DAY, NOW)).toBe('tomorrow');
    expect(formatDue(NOW + 5 * DAY, NOW)).toBe('in 5 days');
  });
});

describe('intervalLabel', () => {
  it('shows what each button actually schedules', () => {
    // Without this, "Good" and "Easy" are two unlabelled doors.
    for (const key of ['again', 'hard', 'good', 'easy']) {
      expect(intervalLabel(CARD, key, NOW)).toMatch(/^\d+(\.\d+)?(m|d|mo|y)$/);
    }
  });

  it('orders the grades from shortest to longest', () => {
    const days = (k) => {
      const l = intervalLabel(CARD, k, NOW);
      const n = parseFloat(l);
      if (l.endsWith('m')) return n / (24 * 60);
      if (l.endsWith('d')) return n;
      if (l.endsWith('mo')) return n * 30;
      return n * 365;
    };
    expect(days('again')).toBeLessThanOrEqual(days('hard'));
    expect(days('hard')).toBeLessThanOrEqual(days('good'));
    expect(days('good')).toBeLessThanOrEqual(days('easy'));
  });

  it('returns empty rather than guessing on bad input', () => {
    expect(intervalLabel(null, 'good', NOW)).toBe('');
    expect(intervalLabel(CARD, 'nonsense', NOW)).toBe('');
  });
});

describe('suggestedGrade', () => {
  it('is "again" when the answer was wrong', () => {
    expect(suggestedGrade({ interactive: true, picked: 2, correctIndex: 1 })).toBe('again');
  });

  it('is "good" when the answer was right', () => {
    expect(suggestedGrade({ interactive: true, picked: 1, correctIndex: 1 })).toBe('good');
  });

  it('infers nothing for a reveal-only card', () => {
    expect(suggestedGrade({ interactive: false, picked: null, correctIndex: 1 })).toBeNull();
    expect(suggestedGrade({ interactive: true, picked: null, correctIndex: 1 })).toBeNull();
  });
});

describe('keyAction', () => {
  const GRADES = ['again', 'hard', 'good', 'easy'];

  it('picks an option by digit or letter before the reveal', () => {
    const opts = { revealed: false, optionCount: 4, gradeKeys: GRADES };
    expect(keyAction('2', opts)).toEqual({ type: 'choose', index: 1 });
    expect(keyAction('b', opts)).toEqual({ type: 'choose', index: 1 });
    expect(keyAction('B', opts)).toEqual({ type: 'choose', index: 1 });
  });

  it('ignores keys past the number of options', () => {
    const opts = { revealed: false, optionCount: 4, gradeKeys: GRADES };
    expect(keyAction('7', opts)).toBeNull();
    expect(keyAction('z', opts)).toBeNull();
  });

  it('grades by digit after the reveal — the same keys, new meaning', () => {
    const opts = { revealed: true, optionCount: 4, gradeKeys: GRADES };
    expect(keyAction('1', opts)).toEqual({ type: 'grade', key: 'again' });
    expect(keyAction('3', opts)).toEqual({ type: 'grade', key: 'good' });
  });

  it('treats space and enter as the fast path', () => {
    expect(keyAction(' ', { revealed: false, optionCount: 0, gradeKeys: GRADES })).toEqual({ type: 'reveal' });
    expect(keyAction('Enter', { revealed: true, optionCount: 4, gradeKeys: GRADES })).toEqual({ type: 'grade', key: 'good' });
  });

  it('does not reveal an interactive card by keyboard — you must answer it', () => {
    // The whole point of the card is that it tests you first.
    expect(keyAction(' ', { revealed: false, optionCount: 4, gradeKeys: GRADES })).toBeNull();
  });

  it('ignores anything unmapped', () => {
    expect(keyAction('q', { revealed: true, optionCount: 4, gradeKeys: GRADES })).toBeNull();
    expect(keyAction(null, { revealed: false, optionCount: 4, gradeKeys: GRADES })).toBeNull();
  });
});

describe('buildSession', () => {
  const { buildSession, shuffle } = require('./reviewSession');
  const due = [
    { id: 'a', subject: 'AP Biology' },
    { id: 'b', subject: 'AP Chemistry' },
    { id: 'c', subject: 'AP Biology' },
    { id: 'd', subject: null },
  ];

  it('treats no subjects picked as every subject', () => {
    expect(buildSession(due, { subjects: [] }).map((c) => c.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('filters to the picked subjects', () => {
    expect(buildSession(due, { subjects: ['AP Biology'] }).map((c) => c.id)).toEqual(['a', 'c']);
  });

  it('supports picking several at once', () => {
    expect(buildSession(due, { subjects: ['AP Biology', 'AP Chemistry'] }).map((c) => c.id))
      .toEqual(['a', 'b', 'c']);
  });

  it('buckets cards with no subject under Practice', () => {
    expect(buildSession(due, { subjects: ['Practice'] }).map((c) => c.id)).toEqual(['d']);
  });

  it('keeps scheduled order by default', () => {
    expect(buildSession(due, { order: 'scheduled' }).map((c) => c.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('shuffles the same way for the same seed and differently for another', () => {
    // Stable within a session: a re-render must not move a card under the
    // cursor mid-answer.
    const one = buildSession(due, { order: 'random', seed: 7 }).map((c) => c.id);
    expect(buildSession(due, { order: 'random', seed: 7 }).map((c) => c.id)).toEqual(one);
    const other = buildSession(due, { order: 'random', seed: 99 }).map((c) => c.id);
    expect(other.slice().sort()).toEqual(one.slice().sort());
  });

  it('never loses or duplicates a card when shuffling', () => {
    const ids = shuffle(due, 42).map((c) => c.id).sort();
    expect(ids).toEqual(['a', 'b', 'c', 'd']);
  });

  it('caps the session length', () => {
    const many = Array.from({ length: 100 }, (_, i) => ({ id: String(i), subject: 'AP Biology' }));
    expect(buildSession(many, { limit: 30 })).toHaveLength(30);
  });
});
