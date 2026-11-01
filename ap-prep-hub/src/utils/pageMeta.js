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

/** Nicknames students actually search ("ap bio", "apush"). They go in the
 *  description as search terms; titles use the official course name, the
 *  same one every page shows (constants/subjects). Keyed by official name. */
const ALIASES = {
  'AP Biology': ['AP Bio'],
  'AP Chemistry': ['AP Chem'],
  'AP Calculus AB': ['AP Calc AB'],
  'AP Calculus BC': ['AP Calc BC'],
  'AP Precalculus': ['AP Precalc'],
  'AP U.S. History': ['APUSH', 'AP US History'],
  'AP World History: Modern': ['AP World'],
  'AP European History': ['AP Euro'],
  'AP Environmental Science': ['APES'],
  'AP Computer Science A': ['AP CSA'],
  'AP Computer Science Principles': ['AP CSP'],
  'AP U.S. Government and Politics': ['AP Gov'],
  'AP Comparative Government and Politics': ['AP Comp Gov'],
  'AP Psychology': ['AP Psych'],
  'AP Macroeconomics': ['AP Macro'],
  'AP Microeconomics': ['AP Micro'],
  'AP Statistics': ['AP Stats'],
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

/** The May exam a page is for: from August on, next May's (the AP year runs
 *  with the school year, as in services/academicYear, which this file can't
 *  import because the prerender loads it on its own). */
export function examYear(now = new Date()) {
  return now.getMonth() >= 7 ? now.getFullYear() + 1 : now.getFullYear();
}

/** Under ~65 chars survives untruncated in a result listing; long course
 *  names drop the brand rather than being shortened. The year is there
 *  because students search "ap bio score calculator 2027", and every page
 *  ranking above us had it. */
export function scoreCalculatorTitle(subject, now = new Date()) {
  const year = examYear(now);
  if (!subject) return `AP Score Calculator ${year} — Apex Scholar`;
  const full = `${subject} Score Calculator ${year} — Apex Scholar`;
  return full.length <= 65 ? full : `${subject} Score Calculator ${year}`;
}

/** Kept near 160 characters, where a result snippet is cut off. */
export function scoreCalculatorDescription(subject, now = new Date()) {
  if (!subject) {
    return 'Free AP score calculators for every subject. Turn raw section scores into an estimated 1–5 and see the curve behind it.';
  }
  const aliases = aliasesFor(subject);
  const name = aliases.length ? `${subject} (${aliases.join(', ')})` : subject;
  const base = `Free ${name} score calculator for ${examYear(now)}. Enter your multiple-choice and free-response points to get a predicted 1–5`;
  const full = `${base} and the points to the next score.`;
  return full.length <= 165 ? full : `${base}.`;
}

/** index.html's robots value, for pages search engines should list. */
export const INDEX_ROBOTS = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
/** For pages with nothing to search for (sign-in, a 404, signed-in screens). */
export const NOINDEX_ROBOTS = 'noindex, follow';

export function canonicalFor(path, origin = 'https://apex-scholar.com') {
  const clean = String(path || '/').split('?')[0].split('#')[0].replace(/\/+$/, '');
  return `${origin}${clean || '/'}`;
}
