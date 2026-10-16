import {
  consume,
  consumeTestDaily,
  setBypass,
  setUser,
  isExempt,
  peekGeneral,
  AiUsageLimitError,
  GUEST_5H_LIMIT,
  GUEST_WEEK_LIMIT,
  TASK_COST,
  DEFAULT_COST,
  TEST_DAILY_LIMIT,
  getUsageStatus,
} from './aiUsageLimiter';

const KEY = 'apex.ai.usage.v2';

// No setUser(uid) -> guest/localStorage path (no Firestore needed for tests).
beforeEach(() => {
  localStorage.clear();
  setBypass(false);
  setUser(null);
});

describe('aiUsageLimiter general budget (guest/localStorage)', () => {
  test('allows tasks until the 5-hour budget is spent, then throws', async () => {
    const sends = Math.ceil(GUEST_5H_LIMIT / TASK_COST.tutor);
    for (let i = 0; i < sends; i++) {
      await expect(consume('tutor')).resolves.toBeUndefined();
    }
    await expect(consume('tutor')).rejects.toBeInstanceOf(AiUsageLimitError);
    await expect(consume('ask')).rejects.toMatchObject({ code: 'ai_usage_limit', scope: '5h' });
  });

  test('each task spends its own cost, shown as % used', async () => {
    await consume('flashcards');
    await consume('somethingUntagged');
    const spent = TASK_COST.flashcards + DEFAULT_COST;
    expect(peekGeneral().fiveHourRemaining).toBe(GUEST_5H_LIMIT - spent);
    const s = await getUsageStatus();
    expect(s.general.fiveHour.pct).toBe(Math.round((spent / GUEST_5H_LIMIT) * 100));
    expect(s.general.week.pct).toBe(Math.round((spent / GUEST_WEEK_LIMIT) * 100));
  });

  test('resets the 5-hour window once it has elapsed', async () => {
    const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
    localStorage.setItem(KEY, JSON.stringify({
      fiveHour: { start: sixHoursAgo, count: GUEST_5H_LIMIT },
      week: { start: Date.now(), count: 1 },
      testDay: { day: '1970-01-01', count: 0 },
    }));
    await expect(consume('general')).resolves.toBeUndefined();
  });

  test('enforces the weekly cap independently of the 5h window', async () => {
    localStorage.setItem(KEY, JSON.stringify({
      fiveHour: { start: Date.now(), count: 0 },
      week: { start: Date.now(), count: GUEST_WEEK_LIMIT },
      testDay: { day: '1970-01-01', count: 0 },
    }));
    await expect(consume('general')).rejects.toMatchObject({ scope: 'week' });
    await expect(consume('general')).rejects.toBeInstanceOf(AiUsageLimitError);
  });

  test('exempt categories and admins are never metered', async () => {
    expect(isExempt('practiceTest')).toBe(true);
    for (let i = 0; i < 40; i++) {
      await expect(consume('practiceTest')).resolves.toBeUndefined();
    }
    setBypass(true);
    for (let i = 0; i < 40; i++) {
      await expect(consume('general')).resolves.toBeUndefined();
    }
  });
});

describe('aiUsageLimiter practice-test budget (guest/localStorage)', () => {
  test('allows one test per day, then throws', async () => {
    for (let i = 0; i < TEST_DAILY_LIMIT; i++) {
      await expect(consumeTestDaily()).resolves.toBeUndefined();
    }
    await expect(consumeTestDaily()).rejects.toBeInstanceOf(AiUsageLimitError);
    await expect(consumeTestDaily()).rejects.toMatchObject({ scope: 'testDaily' });
  });

  test('does not count against the general budget', async () => {
    await consumeTestDaily();
    expect(peekGeneral().fiveHourRemaining).toBe(GUEST_5H_LIMIT);
  });

  test('admins bypass the daily test cap', async () => {
    setBypass(true);
    await expect(consumeTestDaily()).resolves.toBeUndefined();
    await expect(consumeTestDaily()).resolves.toBeUndefined();
  });
});

describe('practice-test daily budget: check before, spend after', () => {
  const { assertTestDailyAvailable } = require('./aiUsageLimiter');

  test('checking does not spend the day\'s test', async () => {
    await assertTestDailyAvailable();
    await assertTestDailyAvailable();
    // Still available: a failed generation after the check costs nothing.
    await expect(consumeTestDaily()).resolves.toBeUndefined();
  });

  test('refuses once the day\'s test has been spent', async () => {
    await consumeTestDaily();
    await expect(assertTestDailyAvailable()).rejects.toBeInstanceOf(AiUsageLimitError);
  });

  test('the day key is the LOCAL calendar date, not UTC', async () => {
    await consumeTestDaily();
    const d = new Date();
    const local = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    expect(JSON.parse(localStorage.getItem(KEY)).testDay.day).toBe(local);
  });
});
