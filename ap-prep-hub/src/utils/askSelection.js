/**
 * Highlight-to-ask in study packs: the prompt for a question about a passage
 * the student selected. Pure so it can be tested.
 */

export const MAX_QUOTE = 1200;
const MAX_CONTEXT = 700;

const squash = (s, max) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
};

/** Is this selection worth offering the menu for? */
export function usableQuote(text) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  return t.length >= 2 && /[\p{L}\p{N}]/u.test(t);
}

/**
 * history: earlier turns in this side chat, [{ question, answer }], oldest first.
 * Only the last three are sent, to keep the prompt small.
 */
export function buildSelectionPrompt({ subject, unit, section, quote, context, question, history = [] }) {
  const where = [unit, section].filter(Boolean).join(', ');
  const lines = [
    `You are a concise ${subject || 'AP'} tutor. A student is reading a study pack${where ? ` (${where})` : ''} and highlighted this passage:`,
    `"""${squash(quote, MAX_QUOTE)}"""`,
  ];
  // Surrounding text only helps when it adds something beyond the selection itself.
  const fullCtx = squash(context, Infinity);
  if (fullCtx && !squash(quote, Infinity).includes(fullCtx)) lines.push(`Text around it: """${squash(context, MAX_CONTEXT)}"""`);
  for (const turn of history.slice(-3)) {
    lines.push(`Earlier question: ${squash(turn.question, 300)}`, `Your earlier answer: ${squash(turn.answer, 600)}`);
  }
  lines.push(
    `Student's question: ${squash(question, 500)}`,
    'Answer directly, usually in 2–6 sentences; use short steps only if the question needs a calculation. Stay within what the AP course expects. ' +
    'Use Markdown, and LaTeX between $ signs for math. Don\'t restate the question or the passage, and don\'t tell the student to ask a tutor.',
  );
  return lines.join('\n');
}

export const EXPLAIN_QUESTION = 'Explain this in simpler words, with an example if it helps.';

const WORD = /[\p{L}\p{N}'’-]/u;

/**
 * Grow a range so it doesn't cut a word in half ("photoele|ctron"). Only text
 * node edges are adjusted; element boundaries are left alone. 
 */
export function snapToWords(range) {
  const { startContainer: sc, endContainer: ec } = range;
  if (sc.nodeType === 3) {
    let i = range.startOffset;
    while (i > 0 && WORD.test(sc.data[i - 1]) && WORD.test(sc.data[i] || ' ')) i -= 1;
    range.setStart(sc, i);
  }
  if (ec.nodeType === 3) {
    let j = range.endOffset;
    while (j < ec.data.length && WORD.test(ec.data[j]) && j > 0 && WORD.test(ec.data[j - 1])) j += 1;
    range.setEnd(ec, j);
  }
  return range;
}
