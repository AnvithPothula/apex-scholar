// Dragging the tutor's conversations list by its edge. Narrower than HIDE_AT on
// release closes it; otherwise the width sticks, within MIN..max.
export const SIDEBAR_MIN = 220;
export const SIDEBAR_HIDE_AT = 160;
export const SIDEBAR_DEFAULT = 320;

/** Width while dragging: free between 0 and max so the student sees it shrink away. */
export const dragWidth = (startW, dx, max) => Math.max(0, Math.min(max, startW + dx));

/** What a release means: { hide: true } or { hide: false, width }. */
export function releaseSidebar(startW, dx, max) {
  const w = dragWidth(startW, dx, max);
  if (w < SIDEBAR_HIDE_AT) return { hide: true };
  return { hide: false, width: Math.round(Math.max(SIDEBAR_MIN, w)) };
}
