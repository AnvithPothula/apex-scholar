/**
 * Closed taxonomy of distractor misconceptions.
 *
 * Closed on purpose. Free-text tags would produce ~10,000 unique strings across
 * the bank and aggregate to nothing; the whole value of tagging is that the same
 * tag recurs across items, so "you make sign errors" can be said at all.
 *
 * Derived from the mechanism vocabulary that actually appears in the bank's own
 * distractor rationales (measured over 600 of them), not invented. A purely
 * rule-based pass over that text reaches only 13% coverage — the rationales are
 * short (median 56 characters) and mostly say "incorrect" without saying how —
 * which is why tagging reads the ITEM rather than the explanation.
 *
 * Import-free so scripts can data:-URL load it.
 */
export const MISCONCEPTIONS = {
  sign_or_direction:   'Sign flipped, inequality reversed, or the right magnitude in the wrong direction.',
  inverted_relationship: 'Reciprocal taken, numerator and denominator swapped, or cause and effect reversed.',
  omitted_step:        'A required term, factor, coefficient or condition was left out.',
  wrong_rule:          'A real rule or formula applied where a different one was needed.',
  arithmetic_slip:     'Correct method, wrong computation.',
  confused_concepts:   'One concept, term or quantity mistaken for a neighbouring one.',
  overgeneralized:     'A rule applied outside the conditions where it holds.',
  partial_reasoning:   'Correct start, stopped before the final step.',
  misread_stem:        'Answers a different question than the one asked.',
  // The honest escape hatch. Without it the model invents a misconception for a
  // distractor that is simply filler, and the tag budget fills with fiction.
  // It also cross-checks the `implausible_distractors` flaw from the IWF sweep.
  not_a_misconception: 'Not a plausible student error — the option is filler.',
};

export const TAGS = Object.keys(MISCONCEPTIONS);

/** True when `t` is a tag the taxonomy actually defines. */
export const isTag = (t) => Object.prototype.hasOwnProperty.call(MISCONCEPTIONS, t);

/**
 * Mechanism patterns that appear verbatim in the bank's own distractor
 * rationales. Measured coverage: 13% of 600 distractor explanations, with the
 * hits precise on inspection. That is far too low to tag the bank with — the
 * rationales mostly say "incorrect" without saying how, and 16.7% are under 35
 * characters of boilerplate ("Calculated incorrectly.") carrying no mechanism
 * at all.
 *
 * It is kept for the job it IS good at: scoring the model tagger. Where a rule
 * fires, it is an independent read of the same distractor, so agreement between
 * the two is a precision estimate that costs no human labelling.
 */
const RULES = [
  ['sign_or_direction',     /\b(sign|negative of|positive instead|opposite sign|flipped the sign)\b/i],
  ['inverted_relationship', /\b(reciprocal|inverted|inverse|flipped|swapped|reversed|backwards|transposed)\b/i],
  ['omitted_step',          /\b(ignores?|ignoring|forgets?|omits?|fails? to|does not (account|include|apply)|leaves out)\b/i],
  ['wrong_rule',            /\b((power|chain|product|quotient|sum) rule|wrong (rule|formula|method)|used the .{0,20}(formula|method))\b/i],
  ['arithmetic_slip',       /\b(calculat\w+ (error|incorrect)|arithmetic|computed? incorrectly|miscalculat\w+|incorrect (z-score|calculation|evaluation|exponent))\b/i],
  ['confused_concepts',     /\b(confus\w+|mistakes? .{0,25} for|instead of|rather than|mixes? up|conflates?|definition|defines?)\b/i],
  ['partial_reasoning',     /\b(only (accounts|considers|applies)|stops? (at|short)|incomplete|halfway)\b/i],
];

/** Tags a rule can be confident about from explanation text, or [] . */
export function ruleTags(text) {
  const t = String(text || '');
  // Too short to contain a mechanism. Saying so beats guessing one.
  if (t.trim().length < 35) return [];
  return RULES.filter(([, rx]) => rx.test(t)).map(([tag]) => tag);
}
