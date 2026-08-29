/**
 * Per-page title / description / canonical.
 *
 * Every route served the one generic <title> from index.html, so a search for
 * "ap bio score calculator" had nothing to match — the page existed, was
 * public, and was in the sitemap, but was indistinguishable from every other
 * page in the index.
 *
 * Google renders JS before indexing, so setting these at runtime works; the
 * builders are pure and tested, the DOM write is a one-line hook.
 */

/** Short forms students actually type. "ap bio" gets far more searches than
 *  "AP Biology", and none of them appeared anywhere on the page. */
const ALIASES = {
  'AP Biology': ['AP Bio'],
  'AP Chemistry': ['AP Chem'],
  'AP Calculus AB': ['AP Calc AB'],
  'AP Calculus BC': ['AP Calc BC'],
  'AP Precalculus': ['AP Precalc'],
  'AP US History': ['APUSH', 'AP US History'],
  'AP United States History': ['APUSH', 'AP US History'],
  'AP U.S. History': ['APUSH', 'AP US History'],
  'AP World History: Modern': ['AP World'],
  'AP European History': ['AP Euro'],
  'AP Environmental Science': ['APES'],
  'AP Computer Science A': ['AP CSA'],
  'AP Computer Science Principles': ['AP CSP'],
  'AP United States Government and Politics': ['AP Gov'],
  'AP U.S. Government and Politics': ['AP Gov'],
  'AP Comparative Government and Politics': ['AP Comp Gov'],
  'AP Psychology': ['AP Psych'],
  'AP Macroeconomics': ['AP Macro'],
  'AP Microeconomics': ['AP Micro'],
  'AP Statistics': ['AP Stats'],
  'AP Physics 1': ['AP Physics 1'],
  'AP Physics 1: Algebra-Based': ['AP Physics 1'],
  'AP Physics 2: Algebra-Based': ['AP Physics 2'],
  'AP Physics C: Mechanics': ['AP Physics C Mech'],
  'AP Physics C: Electricity and Magnetism': ['AP Physics C E&M'],
  'AP English Language and Composition': ['AP Lang'],
  'AP English Literature and Composition': ['AP Lit'],
  'AP Human Geography': ['AP HuG'],
  'AP Spanish Language and Culture': ['AP Spanish'],
  'AP Spanish Literature and Culture': ['AP Spanish Lit'],
  'AP French Language and Culture': ['AP French'],
  'AP German Language and Culture': ['AP German'],
  'AP Chinese Language and Culture': ['AP Chinese'],
  'AP Italian Language and Culture': ['AP Italian'],
  'AP Japanese Language and Culture': ['AP Japanese'],
  'AP Business with Personal Finance': ['AP Business'],
};

export const aliasesFor = (subject) => ALIASES[subject] || [];

/** Under ~60 chars survives untruncated in a result listing. */
export function scoreCalculatorTitle(subject) {
  if (!subject) return 'AP Score Calculator — Apex Scholar';
  const short = aliasesFor(subject)[0];
  return `${short || subject} Score Calculator — Apex Scholar`;
}

export function scoreCalculatorDescription(subject) {
  if (!subject) {
    return 'Free AP score calculators for every subject. Turn raw section scores into an estimated 1–5 and see the curve behind it.';
  }
  const names = [subject, ...aliasesFor(subject)];
  return `Free ${subject} score calculator. Enter your multiple-choice and free-response points to see your estimated AP score out of 5, plus the raw score you need for each grade. Also searched as ${names.join(', ')}.`;
}

export function canonicalFor(path, origin = 'https://apex-scholar.com') {
  const clean = String(path || '/').split('?')[0].split('#')[0].replace(/\/+$/, '');
  return `${origin}${clean || '/'}`;
}
