// ProgressIndicator renders JSX, and this project has no component-rendering
// harness (no @testing-library/react), so these cover the two pure decisions
// the component makes — the ones that carry its honesty guarantees.

/** Mirrors the component: a bar is determinate only with a real total. */
const isDeterminate = (total) => total > 0;

/** Mirrors the component's clock: hidden under 5s, m/s formatting above 60. */
const formatElapsed = (elapsed) =>
  elapsed >= 5
    ? (elapsed < 60 ? `${elapsed}s` : `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`)
    : null;

describe('ProgressIndicator rules', () => {
  it('stays indeterminate when there is no countable work', () => {
    // AI grading is one long call with no per-item signal. Claiming a
    // percentage there would be inventing progress.
    expect(isDeterminate(0)).toBe(false);
    expect(isDeterminate(undefined)).toBe(false);
    expect(isDeterminate(60)).toBe(true);
  });

  it('stays quiet for short waits and shows a clock for long ones', () => {
    expect(formatElapsed(0)).toBeNull();
    expect(formatElapsed(4)).toBeNull();
    expect(formatElapsed(5)).toBe('5s');
    expect(formatElapsed(59)).toBe('59s');
  });

  it('switches to minutes past a minute', () => {
    // A 60-question generation runs ~5 minutes; "312s" is unreadable.
    expect(formatElapsed(60)).toBe('1m 0s');
    expect(formatElapsed(312)).toBe('5m 12s');
  });
});
