/**
 * `breakLength` was a fully-formed preference — clamped to 5-30, defaulted to
 * 10 with a research citation, exposed as OPTIMAL_BREAK_MINUTES — that nothing
 * read. Overlap used strict inequalities, so a session starting the exact
 * minute the previous ended was "no conflict" and the scheduler packed study
 * blocks back to back for hours.
 *
 * These pin the buffer and the study-window defaults, which had drifted into
 * three inline values two hours apart.
 */
import IntelligentScheduler, {
  DEFAULT_STUDY_START_HOUR,
  DEFAULT_STUDY_END_HOUR,
  studyWindowEnd,
} from './intelligentScheduler';

const at = (h, m = 0) => new Date(2026, 8, 22, h, m, 0, 0);
const existing = [{ taskName: 'Calc', startTime: at(9), endTime: at(10) }];

const make = (prefs) => {
  const s = Object.create(IntelligentScheduler);
  const inst = typeof IntelligentScheduler === 'function' ? new IntelligentScheduler(prefs) : IntelligentScheduler;
  return inst;
};

describe('study window defaults', () => {
  it('match the documented scientific defaults', () => {
    // The inline fallbacks said 7/23, 7/23 and 7/21. The documented default is
    // 22. Same user, different code path, two-hour difference in their day.
    expect(DEFAULT_STUDY_START_HOUR).toBe(7);
    expect(DEFAULT_STUDY_END_HOUR).toBe(22);
  });
});

describe('checkScheduleConflict buffer', () => {
  const scheduler = make({});

  it('treats a back-to-back slot as free when no buffer is asked for', () => {
    // Existing behaviour for every caller that does not pass a buffer.
    expect(scheduler.checkScheduleConflict(at(10), at(11), existing)).toBe(false);
  });

  it('refuses a slot that starts the minute the previous session ends', () => {
    expect(scheduler.checkScheduleConflict(at(10), at(11), existing, 10)).toBe(true);
  });

  it('refuses a slot inside the break but allows one just past it', () => {
    expect(scheduler.checkScheduleConflict(at(10, 5), at(11), existing, 10)).toBe(true);
    expect(scheduler.checkScheduleConflict(at(10, 10), at(11), existing, 10)).toBe(false);
  });

  it('applies the break before an existing session too, not only after', () => {
    // A 50-minute block ending at 09:00 is just as jammed as one starting there.
    expect(scheduler.checkScheduleConflict(at(8, 10), at(9), existing, 10)).toBe(true);
    expect(scheduler.checkScheduleConflict(at(8), at(8, 50), existing, 10)).toBe(false);
  });

  it('still catches a genuine overlap', () => {
    expect(scheduler.checkScheduleConflict(at(9, 30), at(10, 30), existing, 0)).toBe(true);
    expect(scheduler.checkScheduleConflict(at(9, 30), at(10, 30), existing, 10)).toBe(true);
  });

  it('ignores a junk buffer rather than producing NaN comparisons', () => {
    // NaN in the comparison would make every slot look free.
    for (const junk of [undefined, null, NaN, -5, 'ten']) {
      expect(scheduler.checkScheduleConflict(at(10), at(11), existing, junk)).toBe(false);
    }
  });

  it('is a no-op when there is nothing scheduled', () => {
    expect(scheduler.checkScheduleConflict(at(10), at(11), [], 10)).toBe(false);
    expect(scheduler.checkScheduleConflict(at(10), at(11), null, 10)).toBe(false);
  });
});

describe('studyWindowEnd — the end-of-day boundary', () => {
  const day = new Date(2026, 8, 25, 13, 37, 0, 0);   // mid-afternoon, to prove
                                                      // the time of day is ignored
  it('closes at the given hour on the same day', () => {
    const e = studyWindowEnd(day, 22);
    expect(e.getDate()).toBe(25);
    expect(e.getHours()).toBe(22);
    expect(e.getMinutes()).toBe(0);
  });

  it('treats 24 as midnight tomorrow, which the preference clamp allows', () => {
    // Math.min(24, ...) makes 24 a legal studyEndTime, and setHours(24) is not
    // reliably next-midnight — this is why the helper adds minutes instead.
    const e = studyWindowEnd(day, 24);
    expect(e.getDate()).toBe(26);
    expect(e.getHours()).toBe(0);
  });

  it('falls back to the documented default for junk', () => {
    for (const junk of [undefined, null, NaN, 'late']) {
      expect(studyWindowEnd(day, junk).getHours()).toBe(DEFAULT_STUDY_END_HOUR);
    }
  });
});

describe('sessions never run past the study window', () => {
  const D = (h, m = 0) => new Date(2026, 8, 25, h, m, 0, 0);

  it('refuses a late slot rather than booking past midnight', () => {
    // Before the fix this returned 23:15 -> 01:15 the NEXT DAY: the check
    // compared slotEnd.getHours() (1) against endHour (24) and passed.
    const s = new IntelligentScheduler({ studyStartTime: 7, studyEndTime: 24, sessionLength: 120 });
    const busy = [];
    for (let h = 7; h < 23; h++) busy.push({ taskName: `b${h}`, startTime: D(h), endTime: D(h + 1) });
    const slot = s.findAvailableTimeSlot(D(0), 120, { name: 'Late', subject: 'AP Calculus AB' }, busy);
    if (slot) expect(slot.end.getDate()).toBe(slot.start.getDate());
  });

  it('still books a session that fits inside the window', () => {
    const s = new IntelligentScheduler({ studyStartTime: 7, studyEndTime: 22, sessionLength: 60 });
    const slot = s.findAvailableTimeSlot(D(0), 60, { name: 'Early', subject: 'AP Calculus AB' }, []);
    expect(slot).toBeTruthy();
    expect(slot.end <= studyWindowEnd(D(0), 22)).toBe(true);
  });
});

describe('blackout time overlap', () => {
  const s = new IntelligentScheduler({});

  it('detects a normal overlap and a clean miss', () => {
    expect(s.hasTimeOverlap('09:00', '10:00', '09:30', '11:00')).toBe(true);
    expect(s.hasTimeOverlap('09:00', '10:00', '10:00', '11:00')).toBe(false);
    expect(s.hasTimeOverlap('09:00', '10:00', '07:00', '09:00')).toBe(false);
  });

  it('is not fooled by unpadded hours', () => {
    // Minute arithmetic, not string comparison — "9:00" must not sort after "10:00".
    expect(s.hasTimeOverlap('9:00', '10:00', '9:30', '11:00')).toBe(true);
    expect(s.hasTimeOverlap('9:00', '10:00', '10:00', '11:00')).toBe(false);
  });

  it('treats an unparseable range as a conflict instead of ignoring it', () => {
    // Every comparison against NaN is false, so this used to return "no
    // overlap" and the scheduler booked straight through a blackout in
    // silence. Failing closed costs a slot; failing open costs the user's
    // blocked time. "9:00 AM" is the shape that does it: Number("00 AM") = NaN.
    expect(s.hasTimeOverlap('09:00', '10:00', '9:00 AM', '11:00 AM')).toBe(true);
    expect(s.hasTimeOverlap('09:00', '10:00', 'lunch', 'later')).toBe(true);
    expect(s.hasTimeOverlap('09:00', '10:00', undefined, null)).toBe(true);
  });
});
