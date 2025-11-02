// CED (Course and Exam Description) local PDF search service
// Assumes CED PDFs are hosted under /ced/ in public folder.
// Map subjects to filenames and fetch snippets for query.
import { extractCitationsFromPdfUrl } from './pdfUtils';

const SUBJECT_TO_PDF = {
  'AP Biology': 'ap-biology-course-and-exam-description.pdf',
  'AP Chemistry': 'ap-chemistry-course-and-exam-description.pdf',
  'AP Physics 1': 'ap-physics-1-course-and-exam-description.pdf',
  'AP Physics 2': 'ap-physics-2-course-and-exam-description.pdf',
  'AP Calculus AB': 'ap-calculus-ab-and-bc-course-and-exam-description.pdf',
  'AP Calculus BC': 'ap-calculus-ab-and-bc-course-and-exam-description.pdf',
  'AP Statistics': 'ap-statistics-course-and-exam-description.pdf',
  'AP English Language and Composition': 'ap-english-language-and-composition-course-and-exam-description.pdf',
  'AP English Literature and Composition': 'ap-english-literature-and-composition-course-and-exam-description.pdf',
  'AP United States History': 'ap-us-history-course-and-exam-description.pdf',
  'AP World History: Modern': 'ap-world-history-modern-course-and-exam-description.pdf',
  'AP Macroeconomics': 'ap-macroeconomics-course-and-exam-description.pdf',
  'AP Microeconomics': 'ap-microeconomics-course-and-exam-description.pdf',
};

export async function cedSearch(subjectName, query, { maxSnippets = 2 } = {}) {
  try {
    const file = SUBJECT_TO_PDF[subjectName];
    if (!file) return [];
    // Expect PDFs under /ced/
    const url = `/ced/${file}`;
    const hits = await extractCitationsFromPdfUrl(url, query, { maxSnippets });
    return hits.map((h) => ({ url, page: h.page, snippet: h.snippet }));
  } catch (e) {
    console.warn('[CED] cedSearch failed', e);
    return [];
  }
}

const cedSearchService = { cedSearch };
export default cedSearchService;
