import { buildActivityMap, totalStudyMinutes, toDate, dateKey, MINUTES_PER_UNTIMED_TEST } from './activityMap';

const ts = (d) => ({ toDate: () => d });
const D = (y, m, day) => new Date(y, m - 1, day, 12, 0, 0);

describe('toDate', () => {
  it('accepts every shape Firestore and legacy docs produce', () => {
    const d = D(2026, 8, 14);
    expect(toDate(ts(d))).toEqual(d);
    expect(toDate(d)).toEqual(d);
    expect(toDate({ seconds: Math.floor(d.getTime() / 1000) }).getFullYear()).toBe(2026);
    expect(toDate(d.getTime()).getTime()).toBe(d.getTime());
    expect(toDate('2026-08-14T12:00:00Z')).toBeInstanceOf(Date);
  });

  it('returns null rather than throwing on junk', () => {
    expect(toDate(null)).toBeNull();
    expect(toDate('not a date')).toBeNull();
    expect(toDate({ toDate: () => { throw new Error('bad'); } })).toBeNull();
    expect(toDate(new Date('nope'))).toBeNull();
  });
});

describe('buildActivityMap', () => {
  it('counts practice tests and diagnostics, not just studySessions', () => {
    // The bug: 169 questions answered, completely blank heatmap, because only
    // studySessions was read and that collection was wired up late.
    const map = buildActivityMap({
      studySessions: [],
      practiceTests: [{ createdAt: ts(D(2026, 8, 10)) }, { createdAt: ts(D(2026, 8, 10)) }],
      diagnostics: [{ completedAt: ts(D(2026, 8, 11)) }],
    });
    expect(map['2026-08-10']).toBe(2);
    expect(map['2026-08-11']).toBe(1);
  });

  it('uses local dates so the key matches StreakCalendar', () => {
    const map = buildActivityMap({ practiceTests: [{ createdAt: ts(D(2026, 1, 5)) }] });
    expect(Object.keys(map)).toEqual(['2026-01-05']);
    expect(dateKey(D(2026, 1, 5))).toBe('2026-01-05');
  });

  it('skips records with no usable date instead of dropping the whole map', () => {
    const map = buildActivityMap({
      practiceTests: [{ createdAt: null }, { createdAt: ts(D(2026, 8, 12)) }, {}],
    });
    expect(map).toEqual({ '2026-08-12': 1 });
  });

  it('is empty, not broken, with no data at all', () => {
    expect(buildActivityMap()).toEqual({});
    expect(buildActivityMap({ studySessions: null })).toEqual({});
  });
});

describe('totalStudyMinutes', () => {
  it('sums recorded durations', () => {
    expect(totalStudyMinutes({ studySessions: [{ duration: 30 }, { duration: 15 }] })).toBe(45);
  });

  it('estimates for practice tests that predate duration tracking', () => {
    // These represent real time spent; reporting "0 minutes" was wrong.
    expect(totalStudyMinutes({ practiceTests: [{ createdAt: ts(D(2026, 8, 1)) }] }))
      .toBe(MINUTES_PER_UNTIMED_TEST);
  });

  it('does not double-count a test that already has a session', () => {
    const day = ts(D(2026, 8, 3));
    expect(totalStudyMinutes({
      studySessions: [{ type: 'practice_test', timestamp: day, duration: 45 }],
      practiceTests: [{ createdAt: day }],
    })).toBe(45);
  });

  it('ignores negative and non-numeric durations', () => {
    expect(totalStudyMinutes({ studySessions: [{ duration: -5 }, { duration: 'abc' }, { duration: 10 }] }))
      .toBe(10);
  });

  it('is zero for a user with no history', () => {
    expect(totalStudyMinutes()).toBe(0);
  });
});
