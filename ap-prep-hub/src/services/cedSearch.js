// CED (Course and Exam Description) search, used to ground tutor and timeline
// answers. Reads public/ced-index/<name>.json, the page text of each PDF in
// public/ced, built by scripts/build-ced-index.mjs.
//
// It used to open the PDF itself with pdf.js on every tutor message: 2 to 43 MB
// per subject pulled from Netlify, where bandwidth costs credits, for an exact
// match of the whole message that almost never hit. The index is 50 to 300 KB
// compressed per subject and is fetched once per tab.

const SUBJECT_TO_PDF = {
  // Sciences
  'AP Biology': 'ap-biology-course-and-exam-description.pdf',
  'AP Business with Personal Finance': 'ap-business-personal-finance-course-and-exam-description.pdf',
  'AP Cybersecurity': 'ap-cybersecurity-course-and-exam-description.pdf',
  'AP Chemistry': 'ap-chemistry-course-and-exam-description.pdf',
  'AP Environmental Science': 'ap-environmental-science-course-and-exam-description.pdf',
  'AP Physics 1': 'ap-physics-1-course-and-exam-description.pdf',
  'AP Physics 1: Algebra-Based': 'ap-physics-1-course-and-exam-description.pdf',
  'AP Physics 2': 'ap-physics-2-course-and-exam-description.pdf',
  'AP Physics 2: Algebra-Based': 'ap-physics-2-course-and-exam-description.pdf',
  'AP Physics C: Mechanics': 'ap-physics-c-mechanics-course-and-exam-description.pdf',
  'AP Physics C: Electricity and Magnetism': 'ap-physics-c-electricity-and-magnetism-course-and-exam-description.pdf',
  'AP Psychology': 'ap-psychology-course-and-exam-description.pdf',

  // Math
  'AP Calculus AB': 'ap-calculus-ab-and-bc-course-and-exam-description.pdf',
  'AP Calculus BC': 'ap-calculus-ab-and-bc-course-and-exam-description.pdf',
  'AP Precalculus': 'ap-precalculus-course-and-exam-description.pdf',
  'AP Statistics': 'ap-statistics-course-and-exam-description.pdf',

  // Computer Science
  'AP Computer Science A': 'ap-computer-science-a-course-and-exam-description.pdf',
  'AP Computer Science Principles': 'ap-computer-science-principles-course-and-exam-description.pdf',

  // English
  'AP English Language and Composition': 'ap-english-language-and-composition-course-and-exam-description.pdf',
  'AP English Literature and Composition': 'ap-english-literature-and-composition-course-and-exam-description.pdf',

  // History & Social Sciences
  'AP African American Studies': 'ap-african-american-studies-course-and-exam-description.pdf',
  'AP Art History': 'ap-art-history-course-and-exam-description.pdf',
  'AP Comparative Government and Politics': 'ap-comparative-government-and-politics-course-and-exam-description.pdf',
  'AP Government and Politics: Comparative': 'ap-comparative-government-and-politics-course-and-exam-description.pdf',
  'AP European History': 'ap-european-history-course-and-exam-description.pdf',
  'AP Human Geography': 'ap-human-geography-course-and-exam-description.pdf',
  'AP Macroeconomics': 'ap-macroeconomics-course-and-exam-description.pdf',
  'AP Microeconomics': 'ap-microeconomics-course-and-exam-description.pdf',
  'AP United States History': 'ap-us-history-course-and-exam-description.pdf',
  'AP U.S. History': 'ap-us-history-course-and-exam-description.pdf',
  'AP US History': 'ap-us-history-course-and-exam-description.pdf',
  'AP United States Government and Politics': 'ap-us-government-and-politics-course-and-exam-description.pdf',
  'AP U.S. Government and Politics': 'ap-us-government-and-politics-course-and-exam-description.pdf',
  'AP World History: Modern': 'ap-world-history-modern-course-and-exam-description.pdf',
  'AP World History': 'ap-world-history-modern-course-and-exam-description.pdf',

  // Arts
  'AP Art and Design': 'ap-art-and-design-course-and-exam-description.pdf',
  'AP Studio Art and Design': 'ap-art-and-design-course-and-exam-description.pdf',
  // One CED covers all three Art and Design courses. Without these three lines
  // their tutors got no CED grounding at all — cedSearch does an exact lookup
  // and returns [] on a miss, so the failure was completely silent.
  'AP 2-D Art and Design': 'ap-art-and-design-course-and-exam-description.pdf',
  'AP 3-D Art and Design': 'ap-art-and-design-course-and-exam-description.pdf',
  'AP Drawing': 'ap-art-and-design-course-and-exam-description.pdf',
  'AP Studio Art: 2-D Design': 'ap-art-and-design-course-and-exam-description.pdf',
  'AP Studio Art: 3-D Design': 'ap-art-and-design-course-and-exam-description.pdf',
  'AP Studio Art: Drawing': 'ap-art-and-design-course-and-exam-description.pdf',
  'AP Music Theory': 'ap-music-theory-course-and-exam-description.pdf',

  // World Languages
  'AP Chinese Language and Culture': 'ap-chinese-language-and-culture-course-and-exam-description.pdf',
  'AP French Language and Culture': 'ap-french-language-and-culture-course-and-exam-description.pdf',
  'AP German Language and Culture': 'ap-german-language-and-culture-course-and-exam-description.pdf',
  'AP Italian Language and Culture': 'ap-italian-language-and-culture-course-and-exam-description.pdf',
  'AP Japanese Language and Culture': 'ap-japanese-language-and-culture-course-and-exam-description.pdf',
  'AP Latin': 'ap-latin-course-and-exam-description.pdf',
  'AP Spanish Language and Culture': 'ap-spanish-language-and-culture-course-and-exam-description.pdf',
  'AP Spanish Literature and Culture': 'ap-spanish-literature-and-culture-course-and-exam-description.pdf',
};

// Helper to add timeout to a promise
const withTimeout = (promise, ms, fallbackValue = []) =>
  Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(fallbackValue), ms))
  ]);

// Simple in-memory cache for CED search results
const cedCache = new Map();
const CED_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const STOPWORDS = new Set((
  'a an and are as at be been but by can could did do does for from had has have how i if in into is it its ' +
  'me my of on or our so than that the their them then there these they this to was we were what when where ' +
  'which who whom why will with would you your about also explain tell help please give show more just like ' +
  'some any much many very really thing things example examples question answer'
).split(' '));

/** Lower case without accents, so "Chatelier" finds "Châtelier". */
const fold = (text) => String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/** The words of a query worth searching for, at most 12, in order. */
export function queryTerms(query) {
  const terms = new Set();
  for (const w of fold(query).match(/[a-z0-9][a-z0-9'-]*/g) || []) {
    const t = w.replace(/'s$/, '').replace(/['-]+$/, '');
    if (t.length >= 3 && !STOPWORDS.has(t)) terms.add(t);
    if (terms.size >= 12) break;
  }
  return [...terms];
}

/**
 * Pages ranked by how many of the query's words they hold, rarer words counting
 * more. A page that holds the whole query as typed (a timeline event's name)
 * ranks first. Needs two distinct words to match when the query has two, so a
 * single common word does not pull in an unrelated page.
 */
export function searchPages(index, query, maxSnippets = 2) {
  const { pages } = index;
  const lower = index.lower || pages.map(fold);
  const terms = queryTerms(query);
  if (!terms.length || !pages.length) return [];
  const weight = terms.map((t) => {
    let df = 0;
    for (const text of lower) if (text.includes(t)) df++;
    return df ? Math.log(1 + pages.length / df) : 0;
  });
  const phrase = fold(query).replace(/\s+/g, ' ').trim();
  const need = Math.min(2, terms.length);
  const ranked = [];
  lower.forEach((text, i) => {
    let score = 0;
    let matched = 0;
    let at = -1;
    let atWeight = 0;
    terms.forEach((t, j) => {
      const pos = text.indexOf(t);
      if (pos < 0) return;
      matched++;
      score += weight[j];
      if (weight[j] > atWeight) { atWeight = weight[j]; at = pos; }
    });
    const whole = phrase.length >= 8 ? text.indexOf(phrase) : -1;
    if (whole >= 0) { score += 100; at = whole; }
    if (matched >= need || whole >= 0) ranked.push({ i, score, at });
  });
  ranked.sort((a, b) => b.score - a.score || a.i - b.i);
  return ranked.slice(0, maxSnippets).map(({ i, at }) => ({
    page: i + 1,
    snippet: pages[i].slice(Math.max(0, at - 160), at + 200).replace(/\s+/g, ' ').trim(),
  }));
}

const indexes = new Map(); // pdf file name -> Promise<{ pages, lower }>

function loadIndex(file) {
  if (!indexes.has(file)) {
    const url = `/ced-index/${file.replace(/\.pdf$/, '.json')}`;
    const loading = fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status} for ${url}`))))
      .then((j) => {
        const pages = Array.isArray(j && j.pages) ? j.pages.map(String) : [];
        return { pages, lower: pages.map(fold) };
      })
      .catch((e) => {
        indexes.delete(file); // let the next message try again
        throw e;
      });
    indexes.set(file, loading);
  }
  return indexes.get(file);
}

export async function cedSearch(subjectName, query, { maxSnippets = 2 } = {}) {
  try {
    const file = SUBJECT_TO_PDF[subjectName];
    if (!file) return [];

    // Check cache
    const cacheKey = `${subjectName}|${query}|${maxSnippets}`;
    const cached = cedCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CED_CACHE_TTL) {
      return cached.data;
    }

    // At most 2 s, so a slow connection never holds up the AI answer. The
    // fetch keeps going and the next message uses it.
    const index = await withTimeout(loadIndex(file), 2000, null);
    if (!index) return [];
    const url = `/ced/${file}`;
    const result = searchPages(index, query, maxSnippets).map((h) => ({ url, page: h.page, snippet: h.snippet }));
    cedCache.set(cacheKey, { data: result, ts: Date.now() });
    return result;
  } catch (e) {
    console.warn('[CED] cedSearch failed', e);
    return [];
  }
}

const cedSearchService = { cedSearch };
export default cedSearchService;
