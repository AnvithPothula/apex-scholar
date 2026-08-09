import { parseExamHour, examTopRem } from './examTime';

describe('parseExamHour', () => {
  it('parses morning times', () => {
    expect(parseExamHour('8:00 AM')).toBe(8);
    expect(parseExamHour('9:30 AM')).toBe(9.5);
  });

  it('parses afternoon and evening times — the bug this fixes', () => {
    // These are in the shipped 2026 data and used to render 12 hours early.
    expect(parseExamHour('12:00 PM')).toBe(12);
    expect(parseExamHour('8:00 PM')).toBe(20);
    expect(parseExamHour('11:59 PM')).toBeCloseTo(23.983, 2);
  });

  it('handles the two hours a naive +12 gets wrong', () => {
    expect(parseExamHour('12:00 AM')).toBe(0);   // midnight, not noon
    expect(parseExamHour('12:30 PM')).toBe(12.5); // noon, not midnight
  });

  it('is tolerant of formatting', () => {
    expect(parseExamHour('8:00am')).toBe(8);
    expect(parseExamHour(' 8:00 a.m. ')).toBe(8);
    expect(parseExamHour('8 PM')).toBe(20);
  });

  it('accepts a bare 24-hour value', () => {
    expect(parseExamHour('13:30')).toBe(13.5);
    expect(parseExamHour('00:00')).toBe(0);
  });

  it('returns null rather than guessing on bad input', () => {
    [null, undefined, '', 'noon', '25:00 AM', '13:00 PM', '8:99 AM', 42, {}].forEach((v) =>
      expect(parseExamHour(v)).toBeNull()
    );
  });
});

describe('examTopRem', () => {
  it('scales by the row height', () => {
    expect(examTopRem('8:00 AM', 4)).toBe(32);
    expect(examTopRem('8:00 PM', 4)).toBe(80);
  });

  it('returns null for unparseable input so callers can skip rendering', () => {
    expect(examTopRem(undefined)).toBeNull();
  });
});
