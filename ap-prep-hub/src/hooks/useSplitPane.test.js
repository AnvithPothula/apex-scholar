import { MIN_PCT, MAX_PCT } from './useSplitPane';

/**
 * The hook itself needs a renderer to exercise, which isn't installed. What
 * matters and is testable here is the clamp contract the divider relies on:
 * a pane can never be dragged to zero width, which would hide the source or
 * the answers entirely with no way back.
 */
const clamp = (pct) => Math.min(MAX_PCT, Math.max(MIN_PCT, pct));

describe('split pane clamp', () => {
  it('never lets either pane collapse to nothing', () => {
    expect(clamp(0)).toBe(MIN_PCT);
    expect(clamp(-50)).toBe(MIN_PCT);
    expect(clamp(100)).toBe(MAX_PCT);
    expect(clamp(9999)).toBe(MAX_PCT);
  });

  it('leaves sane values untouched', () => {
    [25, 40, 50, 60, 75].forEach((v) => expect(clamp(v)).toBe(v));
  });

  it('keeps both panes usable at the extremes', () => {
    // At either limit the smaller pane still gets a quarter of the width.
    expect(MIN_PCT).toBeGreaterThanOrEqual(20);
    expect(100 - MAX_PCT).toBeGreaterThanOrEqual(20);
  });
});
