/**
 * Deterministic item-writing-flaw (IWF) detection for banked MCQs.
 *
 * Every question in `questionBank` was admitted by `isUsableQuestion`, which
 * checks shape only: four choices, four explanations, an in-range index.
 * Nothing has ever looked at whether the item is a *good* item. This does the
 * half of that job that needs no model and no judgement call.
 *
 * Grounded in the 19-criterion Tarrant et al. (2006) IWF rubric, and scoped by
 * two empirical results:
 *
 *   - Moore et al. (arXiv:2307.08161) compared a rule-based IWF detector to
 *     GPT-4 against human raters on 200 MCQs. The rules WON overall (Hamming
 *     loss 0.09 vs 0.21) but per-flaw F1 varied enormously: near-1.0 for the
 *     structural flaws below, and 0.00 in all four domains for `logical cues`,
 *     `word repeats` and `vague terms`. Those three are deliberately NOT
 *     implemented here — a detector with F1 0.00 is noise with a name.
 *   - Schmucker & Moore (arXiv:2503.10533) regressed 19 IWFs against IRT
 *     parameters for 7,126 MCQs answered by 448,000 students. The three flaws
 *     most damaging to both discrimination and difficulty were `more than one
 *     correct` (gamma=-0.317), `longest option correct` (gamma=-0.216) and
 *     `all of the above` (gamma=-0.101). Two of those three are pure string
 *     checks, which is why a deterministic sweep is worth running before any
 *     model is involved.
 *
 * NOT attempted here, on purpose: implausible distractors, ambiguous language,
 * convergence cues, gratuitous information, unfocused stem, and whether the
 * marked answer is actually right. Those need a model or a human.
 *
 * Import-free so `scripts/sweep-item-flaws.mjs` can data:-URL load it.
 */

// Tarrant et al.: an item violating 2+ rubric criteria is "unacceptable".
export const UNACCEPTABLE_AT = 2;

/**
 * How much each detector's output is worth, set by the per-flaw rule-based F1
 * Moore et al. measured against human raters, not by how confident the regex
 * looks:
 *
 *   quarantine - logically exact, or F1 >= 0.80 across their four domains.
 *                The item is not answerable as written. Pull it.
 *   revise     - the item is answerable but cues the answer or distorts
 *                difficulty. Worth rewriting, not worth removing.
 *   advisory   - the literature's rule-based F1 is unstable (0.00-0.71) and
 *                this corpus triggers the exception case constantly. Count it,
 *                never act on a single hit.
 *
 * Only quarantine and revise count toward the "unacceptable" threshold. Letting
 * an advisory detector push items over it would launder noise into a number
 * that looks like a finding.
 */
export const TIER = {
  key_out_of_range: 'quarantine',
  blank_choice: 'quarantine',
  malformed_explanations: 'quarantine',
  duplicate_choices: 'quarantine',
  // Retiered from quarantine after reading all 11 hits in the 200-item sample:
  // 7 were boilerplate rationales repeated across distractors ("Calculated
  // incorrectly." three times), and 4 were a genuinely shared reason that rules
  // out two distractors at once ("f'(x) > 0 means it cannot be decreasing"),
  // which is correct pedagogy, not a defect. So ~64% actionable, and what it
  // actually measures is "a student who picks this distractor is told nothing",
  // not "this item is broken".
  duplicate_explanations: 'revise',
  // Damaging (Schmucker & Moore put "all of the above" at gamma=-0.101,
  // beta=-0.364) but the item is still answerable, so this is a rewrite, not a
  // removal. All six hits across the full bank were true positives.
  all_of_the_above: 'revise',
  none_of_the_above: 'revise',
  true_false_options: 'quarantine',
  fill_in_the_blank: 'revise',
  longest_option_correct: 'revise',
  negative_stem: 'revise',
  unordered_numeric_options: 'revise',
  k_type: 'revise',
  absolute_terms: 'advisory',
};

export const counted = (f) => TIER[f] !== 'advisory';
export const FATAL = new Set(
  Object.keys(TIER).filter((f) => TIER[f] === 'quarantine')
);

// Deliberately conservative. The first version of this stripped every
// non-alphanumeric character, which in a bank that is half Calculus and
// Chemistry collapsed "2" with "-2", "(sqrt(6)+sqrt(2))/4" with
// "(sqrt(6)-sqrt(2))/4", and "as x -> infinity" with "as x -> -infinity". It
// reported 21 duplicate-choice items and every one inspected was a sign
// distinction.
//
// Lowercasing was the second half of the same mistake: it collapsed "ii" with
// "II" (minor vs major Roman numerals in Music Theory) and "r" with "R"
// (distance vs wire radius in Physics C), which was three of the four
// duplicate-choice hits across the full bank. Case is semantic here too. Only
// smart quotes, unicode minus, whitespace and trailing punctuation go.
const norm = (s) =>
  String(s == null ? '' : s)
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[−–—]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[.,;:]+$/, '')
    .trim();

const AOTA = /\b(all of (the |these )?above|all of these|all of the (options|choices))\b/i;
const NOTA = /\b(none of (the |these )?above|none of these|none of the (options|choices)|neither of (the|these))\b/i;
// "A and B only", "I and III", "both X and Y" - Tarrant's K-type.
const KTYPE = /(\b(both|either|neither) .{1,40} and\b|\b[abcd] and [abcd]\b|\b(i{1,3}|iv) and (i{1,3}|iv)\b)/i;
// Tarrant's rule is "no absolute terms UNLESS the statement is truly absolute",
// and in a maths and science bank the exception is the common case: "all real
// numbers", "always increasing", "never negative" are correct answers, not
// cues. Moore et al. measured rule-based F1 of 0.00-0.71 on this criterion for
// exactly that reason, so the legitimately-absolute phrasings are carved out
// and the flaw is advisory regardless.
const ABSOLUTE = /\b(always|never|every|entirely|exclusively|cannot ever)\b/i;
const ABSOLUTE_OK = /\b(all real numbers|all (positive|negative|integer|rational|natural|complex|whole)|for all x|always (increasing|decreasing|continuous|differentiable|positive|negative|true|conserved|equal)|never (negative|positive|zero|decreasing|increasing))\b/i;
const TRUEFALSE = /^(true|false)\b/i;
// Uppercase NOT/EXCEPT is the classic negative stem. Lowercase "not" is far too
// common in ordinary prose to flag - it fires on "is not defined at x = 2".
const NEG_STEM = /\b(NOT|EXCEPT|LEAST|FALSE|INCORRECT)\b/;
const BLANK = /(_{3,}|\.{4,})/;

const numeric = (s) => {
  const m = String(s).trim().match(/^[-+]?\$?\s*(\d[\d,]*(?:\.\d+)?)\s*(%|[a-zA-Z/°]{0,6})?$/);
  if (!m) return null;
  const v = Number(m[1].replace(/,/g, ''));
  return String(s).trim().startsWith('-') ? -v : v;
};

const monotonic = (xs) =>
  xs.every((v, i) => i === 0 || v >= xs[i - 1]) || xs.every((v, i) => i === 0 || v <= xs[i - 1]);

const dupes = (values) => {
  const seen = new Map();
  for (const v of values) {
    const n = norm(v);
    if (!n) continue;
    seen.set(n, (seen.get(n) || 0) + 1);
  }
  return [...seen.values()].some((n) => n > 1);
};

/**
 * Returns an array of flaw codes for one banked question.
 * `item` is `{ question, choices[], stored_answer|correctAnswer, explanations[] }`.
 */
export function detectFlaws(item) {
  const flaws = [];
  const stem = String((item && item.question) || '');
  const choices = Array.isArray(item && item.choices) ? item.choices : [];
  const key = Number.isInteger(item && item.stored_answer)
    ? item.stored_answer
    : (item && item.correctAnswer);
  const expl = Array.isArray(item && item.explanations) ? item.explanations : [];

  // ---- quarantine: the item is not answerable as written ----
  if (!Number.isInteger(key) || key < 0 || key >= choices.length) flaws.push('key_out_of_range');
  if (choices.some((c) => !norm(c))) flaws.push('blank_choice');
  if (expl.length !== choices.length || expl.some((e) => !String(e || '').trim())) {
    flaws.push('malformed_explanations');
  }
  if (dupes(choices)) flaws.push('duplicate_choices');
  // Two choices sharing one rationale means at least one is mislabelled or the
  // pair is interchangeable. Exact match after normalisation only.
  if (dupes(expl)) flaws.push('duplicate_explanations');
  if (choices.some((c) => AOTA.test(String(c)))) flaws.push('all_of_the_above');
  if (choices.some((c) => NOTA.test(String(c)))) flaws.push('none_of_the_above');
  if (choices.length > 0 && choices.every((c) => TRUEFALSE.test(String(c).trim()))) {
    flaws.push('true_false_options');
  }

  // ---- revise: answerable, but it cues or distorts ----
  if (choices.length > 1 && Number.isInteger(key) && choices[key] != null) {
    const lens = choices.map((c) => String(c || '').trim().length);
    const keyLen = lens[key];
    const others = lens.filter((_, i) => i !== key);
    // Strictly longest AND meaningfully so. Plain "is longest" fires on a
    // one-character edge, which no student could read as a cue.
    const meanOther = others.reduce((a, b) => a + b, 0) / others.length;
    // Ratio, not absolute length: "greater than 7.0" beside "7.0" and "1.0" is
    // a real cue at three characters' margin, while a 1-char edge never is at
    // any length. So both a 25% lead on the mean distractor AND at least two
    // characters clear of the longest one.
    if (keyLen - Math.max(...others) >= 2 && keyLen >= 1.25 * meanOther) {
      flaws.push('longest_option_correct');
    }
  }
  if (choices.some((c) => KTYPE.test(String(c)))) flaws.push('k_type');
  if (NEG_STEM.test(stem)) flaws.push('negative_stem');
  if (BLANK.test(stem)) flaws.push('fill_in_the_blank');
  const nums = choices.map(numeric);
  if (nums.length > 2 && nums.every((n) => n !== null) && !monotonic(nums)) {
    flaws.push('unordered_numeric_options');
  }

  // ---- advisory ----
  if (choices.some((c) => ABSOLUTE.test(String(c)) && !ABSOLUTE_OK.test(String(c)))) {
    flaws.push('absolute_terms');
  }

  return flaws;
}

/** `{ flaws, fatal, unacceptable }` — the shape the sweep report is built from. */
export function scoreItem(item) {
  const flaws = detectFlaws(item);
  return {
    flaws,
    fatal: flaws.filter((f) => FATAL.has(f)),
    unacceptable: flaws.filter(counted).length >= UNACCEPTABLE_AT,
  };
}
