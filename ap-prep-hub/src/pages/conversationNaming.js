/**
 * Session numbering for tutor conversations.
 *
 * The number used to be `conversations.length + 1`. Delete a thread and the
 * count drops, so the next "New chat" reused a name already on screen —
 * two "AP Biology - Session 2" rows in the same list.
 *
 * Numbering from the highest number actually present is monotonic, which is
 * what a session label is supposed to be.
 */
export function nextSessionNumber(conversations = []) {
  let max = 0;
  for (const c of conversations) {
    const m = /Session\s+(\d+)\s*$/.exec(String(c?.name || ''));
    if (m) {
      const n = Number(m[1]);
      if (Number.isFinite(n) && n > max) max = n;
    }
  }
  return max + 1;
}
