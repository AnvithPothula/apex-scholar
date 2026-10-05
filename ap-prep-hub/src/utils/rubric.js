/**
 * Recognise a scoring rubric in a markdown table.
 *
 * Tutors present AP rubrics as tables ("Category | Points | Requirement"). When
 * one has a points column, the renderer turns it into a rubric card: point
 * values become badges, a total is shown, and the student can score their own
 * work row by row. Pure, so it can be tested without rendering.
 */

const POINTS_HEADER = /^(max(imum)?\s+)?(points?|pts\.?|score|point\s+value|possible\s+points|points?\s+possible|value)(\s*\(.*\))?$/i;

/** Plain text of a hast node (what react-markdown passes as `node`). */
export function hastText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
  if (Array.isArray(node.children)) return node.children.map(hastText).join('');
  return '';
}

const childElements = (node, tag) =>
  (node && Array.isArray(node.children) ? node.children : []).filter(
    (c) => c && c.type === 'element' && (!tag || c.tagName === tag)
  );

/** Header labels of a hast <table>. */
export function tableHeaders(tableNode) {
  const thead = childElements(tableNode, 'thead')[0];
  const row = thead && childElements(thead, 'tr')[0];
  return row ? childElements(row, 'th').map((th) => hastText(th).trim()) : [];
}

/** Index of the column holding point values, or -1. Never the first column. */
export function pointsColumn(headers = []) {
  for (let i = 1; i < headers.length; i++) {
    if (POINTS_HEADER.test(String(headers[i] || '').replace(/\*/g, '').trim())) return i;
  }
  return -1;
}

/**
 * The most a row is worth, read from its points cell: "0–4" → 4, "1 point" → 1,
 * "Up to 2 pts" → 2. null when the cell has no number (a header-ish row, "—").
 * Capped, so a stray year or page number never becomes a 1998-point row.
 */
export function maxPoints(cellText) {
  const nums = String(cellText || '').match(/\d+(\.\d+)?/g);
  if (!nums) return null;
  const max = Math.max(...nums.map(Number));
  return Number.isFinite(max) && max > 0 && max <= 20 ? max : null;
}

/** Cells of each body row, as plain text. */
export function bodyRows(tableNode) {
  const tbody = childElements(tableNode, 'tbody')[0];
  return tbody ? childElements(tbody, 'tr').map((tr) => childElements(tr).map((c) => hastText(c).trim())) : [];
}

/**
 * Rubric info for a hast table, or null when it is not a rubric: it needs a
 * points column and at least two rows that carry a point value.
 */
export function rubricInfo(tableNode) {
  const col = pointsColumn(tableHeaders(tableNode));
  if (col < 0) return null;
  const maxes = bodyRows(tableNode).map((cells) => maxPoints(cells[col]));
  const scored = maxes.filter((m) => m !== null);
  if (scored.length < 2) return null;
  return { pointsCol: col, rowMax: maxes, total: scored.reduce((a, b) => a + b, 0) };
}
