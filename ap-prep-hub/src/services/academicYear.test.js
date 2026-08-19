import { apYearOf, currentApYear, isCurrentWork, currentWorkOnly } from './academicYear';

const at = (y, m, d) => new Date(y, m - 1, d, 12);
const ts = (date) => ({ toDate: () => date });

describe('apYearOf', () => {
  it('labels the year by its May exam, like College Board does', () => {
    expect(apYearOf(at(2026, 8, 20))).toBe(2027); // Aug 2026 -> AP 2027
    expect(apYearOf(at(2026, 12, 1))).toBe(2027);
    expect(apYearOf(at(2027, 5, 6))).toBe(2027);  // exam day
    expect(apYearOf(at(2027, 7, 31))).toBe(2027); // still the same year
  });

  it('rolls over on 1 August, not 1 January', () => {
    // A student studying in December is in the SAME year as the May exam; a
    // calendar-year boundary would wipe their autumn work every January.
    expect(apYearOf(at(2026, 7, 31))).toBe(2026);
    expect(apYearOf(at(2026, 8, 1))).toBe(2027);
  });

  it('returns null on an unparseable date instead of guessing', () => {
    expect(apYearOf('not a date')).toBeNull();
  });
});

describe('isCurrentWork', () => {
  const now = at(2026, 9, 15); // AP 2027

  it('drops a test from a previous AP year', () => {
    expect(isCurrentWork({ subject: 'AP Biology', createdAt: ts(at(2026, 3, 1)) }, { now })).toBe(false);
  });

  it('keeps work from the current AP year', () => {
    expect(isCurrentWork({ subject: 'AP Chemistry', createdAt: ts(at(2026, 9, 1)) }, { now })).toBe(true);
  });

  it('drops a subject the student is no longer enrolled in', () => {
    expect(isCurrentWork(
      { subject: 'AP Biology', createdAt: ts(at(2026, 9, 1)) },
      { now, enrolledSubjects: ['AP Chemistry'] }
    )).toBe(false);
  });

  it('ignores the enrolment filter when the list is empty', () => {
    // Most students never fill this in; an empty list must not hide everything.
    for (const list of [[], undefined, null]) {
      expect(isCurrentWork(
        { subject: 'AP Biology', createdAt: ts(at(2026, 9, 1)) },
        { now, enrolledSubjects: list }
      )).toBe(true);
    }
  });

  it('keeps an undated record rather than silently discarding history', () => {
    expect(isCurrentWork({ subject: 'AP Chemistry' }, { now })).toBe(true);
  });

  it('reads whichever date field the collection happens to use', () => {
    const old = at(2025, 4, 1);
    expect(isCurrentWork({ completedAt: ts(old) }, { now })).toBe(false);
    expect(isCurrentWork({ timestamp: ts(old) }, { now })).toBe(false);
    expect(isCurrentWork({ date: old.toISOString() }, { now })).toBe(false);
  });

  it('is false for a missing record', () => {
    expect(isCurrentWork(null, { now })).toBe(false);
  });
});

describe('currentWorkOnly', () => {
  it('keeps this year and drops last year', () => {
    const now = at(2026, 9, 15);
    const kept = currentWorkOnly([
      { subject: 'AP Biology', createdAt: ts(at(2026, 2, 1)) },
      { subject: 'AP Chemistry', createdAt: ts(at(2026, 9, 2)) },
    ], { now });
    expect(kept.map((r) => r.subject)).toEqual(['AP Chemistry']);
  });

  it('tolerates a non-array', () => {
    expect(currentWorkOnly(null)).toEqual([]);
  });
});

describe('currentApYear', () => {
  it('tracks the same August boundary', () => {
    expect(currentApYear(at(2026, 8, 18))).toBe(2027);
  });
});
