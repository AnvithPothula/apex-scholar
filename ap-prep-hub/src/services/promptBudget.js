/**
 * Decides which heavy context blocks belong in a tutor system prompt.
 *
 * Every turn shipped the full curriculum (all units + 5 topics each), the site
 * feature brief, and the exam scoring brief — thousands of tokens of static
 * text resent verbatim on the 2nd, 5th and 20th message of a thread even
 * though nothing about them had changed and the model had them in context from
 * the conversation history.
 *
 * The rules below are deliberately conservative: anything the model needs to
 * answer correctly stays, and anything it only needs occasionally is sent when
 * the student's message actually calls for it.
 *
 * Pure — no firebase, no React — so it is testable in jsdom.
 */

/** Cheap keyword gate. Broad on purpose: a false positive costs a few hundred
 *  tokens, a false negative makes the tutor invent an exam curve. */
const SCORE_INTENT = /\b(scores?|scoring|curves?|cutoffs?|composite|raw|points?|grades?|grading|percent|percentage|mcq|frq|sections?|weight(?:ed|ing)?|get a [1-5]\b|need to (get|miss)|how many.*(miss|right|wrong))\b/i;

/** Mentions of studying elsewhere, or asking what to do next. */
const SITE_INTENT = /\b(practice|tests?|flashcards?|quiz(?:zes)?|study|review|diagnostics?|schedule|plans?|what should i|where do i|next|resources?|website|khan)\b/i;

/**
 * @param {object} opts
 * @param {number} opts.turn 1 for the first student message in this thread
 * @param {string} opts.message the student's message
 * @returns {{curriculum:'full'|'brief', scoringBrief:boolean, siteBrief:boolean}}
 */
export function promptBudget({ turn = 1, message = '' } = {}) {
  const first = !Number.isFinite(turn) || turn <= 1;
  const text = String(message || '');
  return {
    // Full unit+topic list on the opening turn so the tutor is grounded, then
    // unit names only. Names alone still stop it inventing units.
    curriculum: first ? 'full' : 'brief',
    // Only when the student is actually asking about scores. Sending the
    // section maxima on every turn is what made this block expensive.
    scoringBrief: first || SCORE_INTENT.test(text),
    // Only when there is something to recommend.
    siteBrief: first || SITE_INTENT.test(text),
  };
}

/**
 * Unit names only — no topics, no weights.
 * @param {object} curriculumData
 */
export function briefCurriculum(curriculumData) {
  if (!curriculumData) return 'AP-level curriculum with comprehensive academic standards';
  const units = Array.isArray(curriculumData.units) ? curriculumData.units : [];
  if (!units.length) return `CURRICULUM: ${curriculumData.name}`;
  return `CURRICULUM: ${curriculumData.name}\nUnits: ${units
    .map((u, i) => `${i + 1}. ${u?.name}`)
    .filter((n) => !/undefined/.test(n))
    .join(' · ')}`;
}
