/**
 * Shareable score card.
 *
 * Students screenshot results and post them. Left to a screenshot they crop out
 * the disclaimer, so a "4" estimated from unpublished cut points travels as if
 * College Board had confirmed it. This draws the card deliberately — with the
 * estimate labelled on the image itself, where it cannot be cropped off without
 * taking the score with it.
 *
 * Pure layout and text here; the canvas drawing is in components/ui/ScoreCard.
 */

/** Card size. 2x for retina, and a 5:4-ish frame that survives a Story crop. */
export const CARD_W = 1080;
export const CARD_H = 1080;

const SCORE_COLOR = {
  5: '#2dd4bf',
  4: '#2dd4bf',
  3: '#f5b544',
  2: '#f0645f',
  1: '#f0645f',
};

export const scoreColor = (score) => SCORE_COLOR[score] || '#a0a0a8';

/** What a 1-5 actually means, in the words a student would use. */
export function verdictFor(score) {
  switch (score) {
    case 5: return 'Extremely well qualified';
    case 4: return 'Well qualified';
    case 3: return 'Qualified';
    case 2: return 'Possibly qualified';
    case 1: return 'No recommendation';
    default: return '';
  }
}

/**
 * The lines the card renders.
 *
 * Kept separate from the drawing so the wording is testable and so a caption
 * for the Web Share sheet can reuse exactly the same numbers.
 */
export function scoreCardLines({ subject, result }) {
  if (!result || !result.model) return null;
  const { score, composite, compositeMax, percent, next } = result;
  return {
    subject: subject || result.model.label || 'AP Exam',
    score,
    verdict: verdictFor(score),
    composite: `${composite} / ${compositeMax} composite`,
    percent: `${percent}%`,
    // Field names match pointsToNextScore's real return shape
    // ({ nextScore, pointsNeeded }), which is null at a 5 anyway.
    next: score < 5 && next && next.pointsNeeded > 0
      ? `${next.pointsNeeded} more point${next.pointsNeeded === 1 ? '' : 's'} for a ${next.nextScore}`
      : null,
    disclaimer: 'Estimated. College Board does not publish its cut points.',
  };
}

/** Caption for the native share sheet. Mirrors the card so they can't disagree. */
export function shareCaption(lines) {
  if (!lines) return '';
  const parts = [`${lines.subject}: estimated ${lines.score}/5`, `(${lines.composite})`];
  if (lines.next) parts.push(`— ${lines.next}`);
  return `${parts.join(' ')}\n\nEstimate from apex-scholar.com — College Board doesn't publish cut points, so this is a projection, not a result.`;
}

/** `AP Biology` -> `ap-biology-score-card.png` */
export function scoreCardFilename(subject) {
  const slug = String(subject || 'ap')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug || 'ap'}-score-card.png`;
}
