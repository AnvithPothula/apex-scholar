/**
 * Parse a Quizlet export into flashcards.
 *
 * Quizlet has no public API for reading a set, and scraping quizlet.com would
 * breach their terms — so this takes the text their own exporter produces:
 *   Set page → "..." (More) → Export → Copy text.
 *
 * That export is configurable, which is the whole problem. The user picks the
 * separator between term and definition (Tab, comma, or a custom string) and
 * between cards (newline, semicolon, or custom), and they frequently forget
 * which they chose. So rather than demand the right setting, this sniffs it.
 *
 * Only sets you created can be exported — copied sets can't. That's a Quizlet
 * restriction, not something this can work around, so the UI says so.
 */

const ROW_SEPARATORS = ['\n\n', '\n', ';'];
const TERM_SEPARATORS = ['\t', ' - ', ' – ', ',', '|'];

/** Count how consistently a separator splits rows into exactly two halves. */
function scoreTermSeparator(rows, sep) {
  let good = 0;
  for (const row of rows) {
    const idx = row.indexOf(sep);
    // Must appear, and must leave something on BOTH sides.
    if (idx > 0 && idx < row.length - sep.length) good++;
  }
  return good / rows.length;
}

function splitRows(text) {
  // Prefer the separator producing the most non-empty rows. A blank line
  // between cards is Quizlet's default, but "\n" alone is very common too.
  let best = { sep: '\n', rows: [] };
  for (const sep of ROW_SEPARATORS) {
    const rows = text.split(sep).map((r) => r.trim()).filter(Boolean);
    if (rows.length > best.rows.length) best = { sep, rows };
  }
  return best.rows;
}

/**
 * @param {string} text raw pasted export
 * @param {object} [opts] { termSeparator, rowSeparator } to override sniffing
 * @returns {{ cards: Array<{front:string, back:string}>, termSeparator: string|null, skipped: number }}
 */
export function parseQuizletExport(text, opts = {}) {
  const raw = String(text || '').replace(/\r\n?/g, '\n').trim();
  if (!raw) return { cards: [], termSeparator: null, skipped: 0 };

  const rows = opts.rowSeparator
    ? raw.split(opts.rowSeparator).map((r) => r.trim()).filter(Boolean)
    : splitRows(raw);
  if (!rows.length) return { cards: [], termSeparator: null, skipped: 0 };

  let termSep = opts.termSeparator || null;
  if (!termSep) {
    let bestScore = 0;
    for (const sep of TERM_SEPARATORS) {
      const score = scoreTermSeparator(rows, sep);
      // Tab wins ties: it's Quizlet's default and can't appear inside a term.
      if (score > bestScore) { bestScore = score; termSep = sep; }
    }
    // Below half the rows, we're guessing — treat it as unparseable rather than
    // silently producing garbage cards.
    if (bestScore < 0.5) return { cards: [], termSeparator: null, skipped: rows.length };
  }

  const cards = [];
  let skipped = 0;
  for (const row of rows) {
    const idx = row.indexOf(termSep);
    if (idx <= 0) { skipped++; continue; }
    const front = row.slice(0, idx).trim();
    const back = row.slice(idx + termSep.length).trim();
    if (!front || !back) { skipped++; continue; }
    cards.push({ front: front.slice(0, 1000), back: back.slice(0, 2000) });
  }

  return { cards, termSeparator: termSep, skipped };
}

/** Human label for a separator, for the "detected …" hint. */
export function separatorLabel(sep) {
  if (sep === '\t') return 'Tab';
  if (sep === ',') return 'Comma';
  if (sep === '|') return 'Pipe';
  if (sep === ' - ' || sep === ' – ') return 'Dash';
  return sep ? `"${sep}"` : 'unknown';
}

export default parseQuizletExport;
