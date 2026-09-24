jest.mock('../config/firestore', () => ({ db: {} }));
// Exam Eve reads the student's exam dates; stub the lookup so tests pick the day.
jest.mock('../constants/apExamDates', () => ({
  getUpcomingExamsSync: () => [{ date: global.__EXAM_DATE__ }],
}));

const store = {};
jest.mock('firebase/firestore', () => ({
  doc: (_db, col, id) => `${col}/${id}`,
  // Plain functions, not jest.fn: CRA's resetMocks strips jest.fn bodies.
  getDoc: async (ref) => ({ exists: () => !!store[ref], data: () => JSON.parse(JSON.stringify(store[ref])) }),
  setDoc: async (ref, data) => { store[ref] = JSON.parse(JSON.stringify(data)); },
  // Yield before writing so concurrent callers genuinely interleave.
  updateDoc: async (ref, data) => {
    for (let i = 0; i < 5; i++) await Promise.resolve(); // microtask yields, fake-timer safe
    store[ref] = { ...store[ref], ...JSON.parse(JSON.stringify(data)) };
  },
  collection: () => {}, query: () => {}, where: () => {}, getDocs: async () => ({ docs: [] }),
  serverTimestamp: () => null, arrayUnion: () => null, increment: () => null,
}));

const achievementsService = require('./achievementsService').default;

describe('trackActivity', () => {
  beforeEach(() => { for (const k of Object.keys(store)) delete store[k]; });

  it('does not lose increments when several activities fire at once', async () => {
    const uid = 'u1';
    await achievementsService.getUserAchievements(uid); // create the doc
    await Promise.all([
      achievementsService.trackActivity(uid, 'complete_practice_test', { score: 50 }),
      achievementsService.trackActivity(uid, 'study_session', {}),
      achievementsService.trackActivity(uid, 'solve_problem', {}),
    ]);
    const counters = store[`userAchievements/${uid}`].activityCounters;
    expect(counters.complete_practice_test).toBe(1);
    expect(counters.study_session).toBe(1);
    expect(counters.solve_problem).toBe(1);
  });

  it('counts review cards toward the Review achievements', async () => {
    const uid = 'u2';
    await achievementsService.getUserAchievements(uid);
    await achievementsService.trackActivity(uid, 'review_card', { count: 1 });
    const doc = store[`userAchievements/${uid}`];
    expect(doc.activityCounters.review_card).toBe(1);
    expect(doc.unlockedAchievements).toContain('first_review');
  });
});

describe('effectiveStreak', () => {
  const now = new Date(2026, 8, 22, 15, 0, 0);
  const at = (daysAgo) => { const d = new Date(now); d.setDate(d.getDate() - daysAgo); return d; };

  it('keeps a streak alive through today and yesterday', () => {
    expect(achievementsService.effectiveStreak({ current: 5, lastStudyDate: at(0) }, now)).toBe(5);
    expect(achievementsService.effectiveStreak({ current: 5, lastStudyDate: at(1) }, now)).toBe(5);
  });

  it('reports 0 once a day has been missed', () => {
    expect(achievementsService.effectiveStreak({ current: 5, lastStudyDate: at(2) }, now)).toBe(0);
    expect(achievementsService.effectiveStreak({ current: 5, lastStudyDate: { seconds: at(30).getTime() / 1000 } }, now)).toBe(0);
  });
});

describe('achievements that previously had no working trigger', () => {
  const uid = 'u3';
  const unlocked = () => store[`userAchievements/${uid}`].unlockedAchievements;
  beforeEach(async () => {
    for (const k of Object.keys(store)) delete store[k];
    global.__EXAM_DATE__ = null;
    jest.useFakeTimers('modern');
  });
  afterEach(() => jest.useRealTimers());
  const at = async (iso, fn) => { jest.setSystemTime(new Date(iso)); await fn(); };

  it('Weekend Warrior needs Saturday AND the next Sunday', async () => {
    await at('2026-09-26T12:00:00', () => achievementsService.getUserAchievements(uid));
    await at('2026-09-26T12:00:00', () => achievementsService.trackActivity(uid, 'study_session'));
    expect(unlocked()).not.toContain('weekend_warrior'); // Saturday alone
    await at('2026-09-27T12:00:00', () => achievementsService.trackActivity(uid, 'study_session'));
    expect(unlocked()).toContain('weekend_warrior');
  });

  it('a lone Sunday is not a weekend', async () => {
    await at('2026-09-27T12:00:00', () => achievementsService.getUserAchievements(uid));
    await at('2026-09-27T12:00:00', () => achievementsService.trackActivity(uid, 'study_session'));
    expect(unlocked()).not.toContain('weekend_warrior');
  });

  it('Midnight Oil unlocks between 2 and 4 AM', async () => {
    await at('2026-09-23T03:10:00', () => achievementsService.getUserAchievements(uid));
    await at('2026-09-23T03:10:00', () => achievementsService.trackActivity(uid, 'study_session'));
    expect(unlocked()).toContain('midnight_oil');
  });

  it('Polyglot counts five subjects in ONE day', async () => {
    await at('2026-09-23T10:00:00', () => achievementsService.getUserAchievements(uid));
    for (const s of ['A', 'B', 'C', 'D']) {
      await at('2026-09-23T10:00:00', () => achievementsService.trackActivity(uid, 'study_subject', { subject: s }));
    }
    // Fifth subject on a different day doesn't complete it.
    await at('2026-09-24T10:00:00', () => achievementsService.trackActivity(uid, 'study_subject', { subject: 'E' }));
    expect(unlocked()).not.toContain('polyglot');
    for (const s of ['F', 'G', 'H', 'I']) {
      await at('2026-09-24T11:00:00', () => achievementsService.trackActivity(uid, 'study_subject', { subject: s }));
    }
    expect(unlocked()).toContain('polyglot');
  });

  it('Exam Eve unlocks the day before one of your exams', async () => {
    global.__EXAM_DATE__ = '2027-05-04';
    await at('2027-05-03T19:00:00', () => achievementsService.getUserAchievements(uid));
    await at('2027-05-03T19:00:00', () => achievementsService.trackActivity(uid, 'study_session'));
    expect(unlocked()).toContain('exam_eve');
  });

  it('Flawless needs a full-length test; High Scorer does not', async () => {
    await at('2026-09-23T12:00:00', () => achievementsService.getUserAchievements(uid));
    await at('2026-09-23T12:00:00', () => achievementsService.trackActivity(uid, 'complete_practice_test', { score: 100, fullLength: false }));
    expect(unlocked()).toContain('high_scorer');
    expect(unlocked()).not.toContain('flawless');
    await at('2026-09-23T13:00:00', () => achievementsService.trackActivity(uid, 'complete_practice_test', { score: 100, fullLength: true }));
    expect(unlocked()).toContain('flawless');
  });

  it('Perfect Deck, Comeback Kid and Inbox Zero have triggers', async () => {
    await at('2026-09-23T12:00:00', () => achievementsService.getUserAchievements(uid));
    await at('2026-09-23T12:00:00', () => achievementsService.trackActivity(uid, 'study_flashcard', { count: 10, perfectScore: true }));
    await at('2026-09-23T12:00:00', () => achievementsService.trackActivity(uid, 'comeback'));
    await at('2026-09-23T12:00:00', () => achievementsService.trackActivity(uid, 'queue_cleared'));
    expect(unlocked()).toEqual(expect.arrayContaining(['perfect_deck', 'comeback_kid', 'queue_zero']));
  });
});
