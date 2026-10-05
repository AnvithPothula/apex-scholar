/* The weekly/exam-week email logic lives in netlify/lib (shared with the
 * email-weekly function); tested from here like classScore. */
const { buildDigest, examsFor, cadenceFor } = require('../../netlify/lib/weeklyDigest');
const serverTable = require('../../netlify/lib/examDates');
import { AP_EXAM_DATES_2027, SUBJECT_KEY_TO_EXAM_NAME } from '../constants/apExamDates';

const SUNDAY = new Date(Date.UTC(2026, 9, 4, 14));   // Sun Oct 4 2026
const MONDAY = new Date(Date.UTC(2026, 9, 5, 14));
const bio = { subjects: ['biology'] };               // AP Biology: May 3 2027

describe('server exam table', () => {
  it('matches the source of truth in src/constants/apExamDates.js', () => {
    expect(serverTable.SUBJECT_KEY_TO_EXAM_NAME).toEqual(SUBJECT_KEY_TO_EXAM_NAME);
    const dates = Object.fromEntries(Object.entries(AP_EXAM_DATES_2027).map(([k, v]) => [k, v.date]));
    expect(serverTable.EXAM_DATES).toEqual(dates);
  });
});

describe('cadence', () => {
  it('is weekly on Sundays, silent other days', () => {
    expect(cadenceFor(examsFor(bio, SUNDAY), SUNDAY)).toBe('weekly');
    expect(cadenceFor(examsFor(bio, MONDAY), MONDAY)).toBeNull();
  });

  it('is daily in the 7 days before one of their exams, and not on exam day', () => {
    const fiveOut = new Date(Date.UTC(2027, 3, 28, 14)); // Wed Apr 28
    expect(cadenceFor(examsFor(bio, fiveOut), fiveOut)).toBe('examWeek');
    const examDay = new Date(Date.UTC(2027, 4, 3, 14));
    expect(cadenceFor(examsFor(bio, examDay), examDay)).toBeNull(); // a Monday
    const eightOut = new Date(Date.UTC(2027, 3, 25, 14)); // a Sunday, 8 days out
    expect(cadenceFor(examsFor(bio, eightOut), eightOut)).toBe('weekly');
  });

  it('ignores exams that are not theirs', () => {
    const fiveOut = new Date(Date.UTC(2027, 3, 28, 14));
    expect(cadenceFor(examsFor({ subjects: [] }, fiveOut), fiveOut)).toBeNull();
  });
});

describe('buildDigest', () => {
  it('leads with reviews due and includes one question to try', () => {
    const cards = [{ question: 'Which **organelle** makes ATP?', due: 0 }, { question: 'later', due: Date.UTC(2030, 0, 1) }];
    const d = buildDigest({ user: bio, cards, now: SUNDAY });
    expect(d.subject).toBe('1 AP review due');
    expect(d.body).toContain('**1 question** due for review');
    expect(d.body).toContain('Which organelle makes ATP?'); // markup stripped from user content
    expect(d.body).toContain('**AP Biology**: May 3');
  });

  it('points an inactive student at the 10-question check', () => {
    const d = buildDigest({ user: {}, now: SUNDAY });
    expect(d.subject).toBe('Your AP week');
    expect(d.body).toContain('/start');
  });

  it('shows the latest predicted score per subject', () => {
    const tests = [
      { subject: 'AP Biology', results: { apScore: 2 }, createdAtMs: 1 },
      { subject: 'AP Biology', results: { apScore: 4 }, createdAtMs: 2 },
    ];
    expect(buildDigest({ user: bio, tests, now: SUNDAY }).body).toContain('AP Biology: **4**');
  });

  it('switches to the exam-week email', () => {
    const d = buildDigest({ user: bio, now: new Date(Date.UTC(2027, 4, 2, 14)) });
    expect(d.kind).toBe('examWeek');
    expect(d.subject).toBe('Your AP exam is tomorrow');
    expect(buildDigest({ user: bio, now: MONDAY })).toBeNull();
  });
});

describe('personalised week', () => {
  const { weekSummary } = require('../../netlify/lib/weeklyDigest');
  const now = SUNDAY.getTime();
  const day = 86400000;
  const r = (daysAgo, correct, unit = 'Cell respiration') =>
    ({ atMs: now - daysAgo * day, correct, unit, subject: 'AP Biology' });

  it('summarises this week against last week and finds the weakest topic', () => {
    const responses = [
      r(1, true), r(1, false), r(2, false), r(2, false), r(3, true, 'Genetics'), r(3, true, 'Genetics'), r(3, true, 'Genetics'),
      r(9, false, 'Genetics'), r(9, false), r(10, false), r(10, true), r(11, false),
    ];
    const w = weekSummary(responses, [], now);
    expect(w).toMatchObject({ answered: 7, accuracy: 57, lastWeekAccuracy: 20, activeDays: 3, subjects: ['AP Biology'] });
    expect(w.weakest).toMatchObject({ unit: 'Cell respiration', right: 1, total: 4 });
  });

  it('puts it in the email: counts, trend, weakest topic linked to that subject\'s tutor', () => {
    const responses = [r(1, true), r(1, false), r(2, false), r(2, false), r(3, true), r(9, false), r(9, false), r(10, false), r(10, false), r(11, false)];
    const d = buildDigest({ user: bio, responses, now: SUNDAY });
    expect(d.subject).toBe('Your week: 5 Qs, 40% right');
    expect(d.body).toContain('**5 questions** in AP Biology on 3 days, **40%** correct (up from 0% the week before)');
    expect(d.body).toContain('Most missed: **Cell respiration** (2 of 5). [Ask the tutor about it](https://apex-scholar.com/ai-tutors/biology)');
  });

  it('nudges a student who went quiet, without the first-timer pitch', () => {
    const d = buildDigest({ user: bio, responses: [r(10, true)], now: SUNDAY });
    expect(d.body).toContain('Quiet week');
    expect(d.body).not.toContain('/start');
  });
});
