import aiUsageLimiter, {
  consume,
  consumeTestDaily,
  setBypass,
  setUser,
  isExempt,
  peekGeneral,
  AiUsageLimitError,
  GENERAL_5H_LIMIT,
  GENERAL_WEEK_LIMIT,
  TEST_DAILY_LIMIT,
} from './aiUsageLimiter';

const KEY = 'apex.ai.usage.v2';

// No setUser(uid) -> guest/localStorage path (no Firestore needed for tests).
beforeEach(() => {
  localStorage.clear();
  setBypass(false);
  setUser(null);
});

describe('aiUsageLimiter general budget (guest/localStorage)', () => {
  test('allows up to the 5-hour limit, then throws', async () => {
    for (let i = 0; i < GENERAL_5H_LIMIT; i++) {
      await expect(consume('general')).resolves.toBeUndefined();
    }
    await expect(consume('general')).rejects.toBeInstanceOf(AiUsageLimitError);
    try {
      await consume('general');
      throw new Error('expected throw');
    } catch (e) {
      expect(e.code).toBe('ai_usage_limit');
      expect(e.scope).toBe('5h');
    }
  });

  test('resets the 5-hour window once it has elapsed', async () => {
    const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
    localStorage.setItem(KEY, JSON.stringify({
      fiveHour: { start: sixHoursAgo, count: GENERAL_5H_LIMIT },
      week: { start: Date.now(), count: 1 },
      testDay: { day: '1970-01-01', count: 0 },
    }));
    await expect(consume('general')).resolves.toBeUndefined();
  });

  test('enforces the weekly cap independently of the 5h window', async () => {
    localStorage.setItem(KEY, JSON.stringify({
      fiveHour: { start: Date.now(), count: 0 },
      week: { start: Date.now(), count: GENERAL_WEEK_LIMIT },
      testDay: { day: '1970-01-01', count: 0 },
    }));
    try {
      await consume('general');
      throw new Error('expected throw');
    } catch (e) {
      expect(e).toBeInstanceOf(AiUsageLimitError);
      expect(e.scope).toBe('week');
    }
  });

  test('exempt categories and admins are never metered', async () => {
    expect(isExempt('practiceTest')).toBe(true);
    for (let i = 0; i < GENERAL_5H_LIMIT + 5; i++) {
      await expect(consume('practiceTest')).resolves.toBeUndefined();
    }
    setBypass(true);
    for (let i = 0; i < GENERAL_5H_LIMIT + 5; i++) {
      await expect(consume('general')).resolves.toBeUndefined();
    }
  });
});

describe('aiUsageLimiter practice-test budget (guest/localStorage)', () => {
  test('allows one test per day, then throws', async () => {
    for (let i = 0; i < TEST_DAILY_LIMIT; i++) {
      await expect(consumeTestDaily()).resolves.toBeUndefined();
    }
    try {
      await consumeTestDaily();
      throw new Error('expected throw');
    } catch (e) {
      expect(e).toBeInstanceOf(AiUsageLimitError);
      expect(e.scope).toBe('testDaily');
    }
  });

  test('does not count against the general budget', async () => {
    await consumeTestDaily();
    expect(peekGeneral().fiveHourRemaining).toBe(GENERAL_5H_LIMIT);
  });

  test('admins bypass the daily test cap', async () => {
    setBypass(true);
    await expect(consumeTestDaily()).resolves.toBeUndefined();
    await expect(consumeTestDaily()).resolves.toBeUndefined();
  });
});
