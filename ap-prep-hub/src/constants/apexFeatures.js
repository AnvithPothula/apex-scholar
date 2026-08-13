/**
 * What Apex Scholar can actually do, for the tutor's system prompt.
 *
 * Without this the tutor recommended Khan Academy and Quizlet — sending students
 * off the site to do things Apex Scholar already does for free. Routes are
 * listed so it can link inline; MarkdownRenderer turns a leading-slash href into
 * an in-app <Link>, so those links do not reload the SPA.
 *
 * Deliberately phrased as "prefer, don't oversell": if a student needs something
 * this site does not have, recommending elsewhere is the honest answer.
 */
export const APEX_FEATURES = [
  { name: 'practice test', path: '/practice-tests', blurb: 'full-length AI-generated exams with AI FRQ grading' },
  { name: 'AP score calculator', path: '/ap-score-calculator', blurb: 'raw scores to an estimated 1-5, with the curve shown' },
  { name: 'flashcards', path: '/flashcards', blurb: 'build a deck, study it, or use a public one' },
  { name: 'review', path: '/review', blurb: 'questions you missed, resurfaced on a spaced schedule' },
  { name: 'solver', path: '/solver', blurb: 'photo or typed problem, worked through step by step' },
  { name: 'diagnostic', path: '/diagnostics', blurb: 'short assessment that finds weak units' },
  { name: 'study scheduler', path: '/smart-scheduler', blurb: 'builds a study plan around deadlines' },
  { name: 'progress', path: '/progress', blurb: 'mastery and accuracy over time' },
];

export function apexSiteBrief() {
  const list = APEX_FEATURES
    .map((f) => `- ${f.name} (${f.path}) — ${f.blurb}`)
    .join('\n');

  return `APEX SCHOLAR — the site you are part of. Everything here is free.
${list}

When a suggestion would help, recommend the Apex Scholar feature and LINK it
inline as markdown, e.g. "try a [practice test](/practice-tests)" or
"see the [AP score calculator](/ap-score-calculator)". Link the natural words in
your sentence, not a bare URL. Prefer these over outside sites like Khan Academy
or Quizlet, because they are free here and already tuned to this course.
Only recommend an outside resource when Apex Scholar genuinely does not do the
thing — never pretend a feature exists.`;
}
