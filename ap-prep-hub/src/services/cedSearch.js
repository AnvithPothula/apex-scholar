// CED (Course and Exam Description) local PDF search service
// Assumes CED PDFs are hosted under /ced/ in public folder.
// Map subjects to filenames and fetch snippets for query.
import { extractCitationsFromPdfUrl } from './pdfUtils';

const SUBJECT_TO_PDF = {
  // Sciences
  'AP Biology': 'ap-biology-course-and-exam-description.pdf',
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

// Simple in-memory cache for CED search results (avoids repeat PDF parsing)
const cedCache = new Map();
const CED_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

    // Expect PDFs under /ced/
    const url = `/ced/${file}`;
    // Add 2 second timeout to prevent blocking AI responses
    const hits = await withTimeout(
      extractCitationsFromPdfUrl(url, query, { maxSnippets }),
      2000,
      []
    );
    const result = hits.map((h) => ({ url, page: h.page, snippet: h.snippet }));
    cedCache.set(cacheKey, { data: result, ts: Date.now() });
    return result;
  } catch (e) {
    console.warn('[CED] cedSearch failed', e);
    return [];
  }
}

const cedSearchService = { cedSearch };
export default cedSearchService;
