/**
 * Which questions of an assignment a student gets.
 *
 * "same": every item. "bank": `perStudent` items drawn from the bank, the same
 * draw every time for that student (seeded by uid + assignment id), so a reload
 * never deals a new set and the server can recompute exactly what was shown.
 * src/services/classAssignments.js carries an identical copy (CRA can't import
 * from outside src); src/services/assignmentPick.test.js keeps them equal.
 */
function hash32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function pickItemIds(itemIds, { mode, perStudent } = {}, uid = '', assignmentId = '') {
  const ids = Array.isArray(itemIds) ? itemIds.slice() : [];
  const n = Math.floor(Number(perStudent) || 0);
  if (mode !== 'bank' || n <= 0 || n >= ids.length) return ids;
  let seed = hash32(`${uid}:${assignmentId}`) || 1;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = ids.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  // Keep the teacher's order within the draw.
  const chosen = new Set(ids.slice(0, n));
  return itemIds.filter((id) => chosen.has(id));
}

module.exports = { pickItemIds, hash32 };
