import {
  AP_EXAM_DATES_2027,
  VERIFIED_EXAM_YEARS,
  getTargetExamYear,
  getCurrentYearExamDates,
  SUBJECT_KEY_TO_EXAM_NAME,
  sittingFor,
  getUpcomingExamsSync,
} from './apExamDates';

describe('exam-date freshness', () => {
  // The whole point of this file. Without a verified table for the year students
  // are counting down to, getCurrentYearExamDates() silently returns a schedule
  // generated from the usual May pattern — plausible-looking and wrong for most
  // subjects. This test goes red instead, which is what forces the August
  // re-verification against apcentral.collegeboard.org.
  it('has a hand-verified table for the year students are counting down to', () => {
    expect(VERIFIED_EXAM_YEARS).toContain(getTargetExamYear());
  });

  it('rolls over on June 1, once May testing is done', () => {
    expect(getTargetExamYear(new Date(2027, 3, 15))).toBe(2027); // April
    expect(getTargetExamYear(new Date(2027, 4, 31))).toBe(2027); // May
    expect(getTargetExamYear(new Date(2027, 5, 1))).toBe(2028);  // June
    expect(getTargetExamYear(new Date(2027, 11, 1))).toBe(2028); // December
  });

  it('serves the verified table, not the generated fallback', () => {
    expect(getCurrentYearExamDates()).toBe(AP_EXAM_DATES_2027);
  });
});

describe('2027 schedule shape', () => {
  const entries = Object.entries(AP_EXAM_DATES_2027);

  it('puts every exam in one of the two official testing weeks', () => {
    const offSchedule = entries
      .filter(([, e]) => !e.type)
      .filter(([, e]) => !/^2027-05-(0[3-7]|1[0-4])$/.test(e.date));
    expect(offSchedule).toEqual([]);
  });

  it('schedules every late test inside the May 17-21 window', () => {
    const bad = entries
      .filter(([, e]) => e.lateDate)
      .filter(([, e]) => !/^2027-05-1[7-9]|^2027-05-2[01]$/.test(e.lateDate));
    expect(bad).toEqual([]);
  });

  it('gives every sat exam a late-testing date', () => {
    const missing = entries.filter(([, e]) => !e.type && !e.lateDate).map(([n]) => n);
    expect(missing).toEqual([]);
  });

  it('uses only the two official start times', () => {
    const odd = entries
      .filter(([, e]) => !e.type)
      .filter(([, e]) => !['8:00 AM', '12:00 PM'].includes(e.time));
    expect(odd).toEqual([]);
  });

  it('covers every subject the curriculum can map to an exam', () => {
    // A curriculum key that maps to a name with no date entry means a student
    // enrolled in that subject sees no countdown at all.
    const missing = Object.values(SUBJECT_KEY_TO_EXAM_NAME)
      .filter((name) => !AP_EXAM_DATES_2027[name]);
    expect(missing).toEqual([]);
  });
});

describe('sittingFor', () => {
  const exam = AP_EXAM_DATES_2027['AP Biology'];

  it('returns the main sitting by default', () => {
    expect(sittingFor(exam)).toEqual({ date: '2027-05-03', time: '12:00 PM', isLate: false });
  });

  it('returns the late sitting when the student takes it', () => {
    // The bug this closes: the scheduler read lateDate while ExamCountdown read
    // date, so one student saw two different exam dates on the same screen.
    expect(sittingFor(exam, true)).toEqual({ date: '2027-05-19', time: '8:00 AM', isLate: true });
  });

  it('falls back to the main sitting when there is no late date', () => {
    // Portfolio and Capstone deadlines have none.
    const portfolio = AP_EXAM_DATES_2027['AP Research'];
    expect(sittingFor(portfolio, true)).toEqual({
      date: portfolio.date,
      time: portfolio.time,
      isLate: false,
    });
  });

  it('returns null for an unknown exam', () => {
    expect(sittingFor(undefined, true)).toBeNull();
  });

  it('agrees with what the scheduler shows', () => {
    // Both paths now route through sittingFor; this pins them together so a
    // future change to one cannot silently drift from the other.
    const [row] = getUpcomingExamsSync(['biology'], ['biology']);
    expect({ date: row.date, time: row.time, isLate: row.isLateTesting })
      .toEqual(sittingFor(exam, true));
  });
});

describe('every course a student can enrol in maps to an exam', () => {
  // eslint-disable-next-line global-require
  const { SUBJECT_KEY_BY_DISPLAY_NAME } = require('./curriculum');

  it('is checking a real map, not an empty one', () => {
    // An empty map would make the assertion below pass vacuously.
    expect(Object.keys(SUBJECT_KEY_BY_DISPLAY_NAME).length).toBeGreaterThan(40);
  });

  it('resolves every curriculum display name to a dated exam', () => {
    // The bug this closes: a user doc stores the curriculum's name for a course
    // ("AP United States History") while the exam table uses another
    // ("AP U.S. History"). Three courses silently had no countdown, and three
    // more had no exam-table entry at all. Neither failed loudly.
    const unresolved = Object.entries(SUBJECT_KEY_BY_DISPLAY_NAME)
      .filter(([, key]) => {
        const examName = SUBJECT_KEY_TO_EXAM_NAME[key];
        return !examName || !AP_EXAM_DATES_2027[examName];
      })
      .map(([name]) => name);
    expect(unresolved).toEqual([]);
  });
});
