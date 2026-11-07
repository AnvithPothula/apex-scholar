import {
  consume,
  refund,
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
  TASK_COST_RANGE,
  costAt,
  setLoad,
  currentLoad,
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
      await expect(consume('tutor')).resolves.toBe(true);
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
    await expect(consume('general')).resolves.toBe(true);
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
      await expect(consume('practiceTest')).resolves.toBe(false);
    }
    setBypass(true);
    for (let i = 0; i < 40; i++) {
      await expect(consume('general')).resolves.toBe(false);
    }
  });

  test('a refund gives back what a failed call was charged, never below zero', async () => {
    await consume('solver');
    await consume('tutor');
    await refund('solver');
    expect(peekGeneral().fiveHourRemaining).toBe(GUEST_5H_LIMIT - TASK_COST.tutor);
    await refund('flashcards');
    expect(peekGeneral().fiveHourRemaining).toBe(GUEST_5H_LIMIT);
  });

  test('a refund leaves a window alone once it has rolled over', async () => {
    const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
    const state = {
      fiveHour: { start: sixHoursAgo, count: 200 },
      week: { start: Date.now(), count: 200 },
      testDay: { day: '1970-01-01', count: 0 },
    };
    localStorage.setItem(KEY, JSON.stringify(state));
    await refund('tutor');
    const after = JSON.parse(localStorage.getItem(KEY));
    expect(after.fiveHour).toEqual(state.fiveHour);
    expect(after.week.count).toBe(200 - TASK_COST.tutor);
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

describe('load-based costs', () => {
  afterEach(() => setLoad(null));

  test('every task costs its min when idle, its normal price at half load, its max when busy', () => {
    for (const [task, { min, max }] of Object.entries(TASK_COST_RANGE)) {
      expect(min).toBeLessThan(TASK_COST[task]);
      expect(max).toBeGreaterThan(TASK_COST[task]);
      expect(costAt(task, 0)).toBe(min);
      expect(costAt(task, 0.5)).toBe(TASK_COST[task]);
      expect(costAt(task, 1)).toBe(max);
    }
    expect(Object.keys(TASK_COST_RANGE).sort()).toEqual(Object.keys(TASK_COST).sort());
  });

  test('out-of-range or missing load stays inside the limits', () => {
    expect(costAt('tutor', -3)).toBe(TASK_COST_RANGE.tutor.min);
    expect(costAt('tutor', 9)).toBe(TASK_COST_RANGE.tutor.max);
    expect(costAt('tutor', NaN)).toBe(TASK_COST.tutor);
    expect(costAt('somethingNew', 0.5)).toBe(DEFAULT_COST);
  });

  test('a reading older than 15 minutes falls back to the normal price', () => {
    const t = Date.now();
    setLoad(1, t);
    expect(currentLoad(t + 1000)).toBe(1);
    expect(currentLoad(t + 16 * 60 * 1000)).toBe(0.5);
  });

  test('the usage snapshot shows the live costs and level', async () => {
    setLoad(0);
    let s = await getUsageStatus();
    expect(s.costs.tutor).toBe(TASK_COST_RANGE.tutor.min);
    expect(s.level).toBe('quiet');
    setLoad(1);
    s = await getUsageStatus();
    expect(s.costs.flashcards).toBe(TASK_COST_RANGE.flashcards.max);
    expect(s.level).toBe('busy');
  });

  test('a refund gives back what was charged even if the load moved', async () => {
    setLoad(1);
    await consume('tutor');
    expect(peekGeneral().fiveHourRemaining).toBe(GUEST_5H_LIMIT - TASK_COST_RANGE.tutor.max);
    setLoad(0);
    await refund('tutor');
    expect(peekGeneral().fiveHourRemaining).toBe(GUEST_5H_LIMIT);
  });
});
