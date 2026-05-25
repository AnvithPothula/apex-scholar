// Lightweight PDF utilities using pdfjs-dist for client-side text extraction
// Lazy loads pdfjs-dist only when PDF extraction is needed

// Cache for loaded pdfjs library
let pdfjsLib = null;

/**
 * Lazy load pdfjs-dist library
 * @returns {Promise} pdfjs library instance
 */
async function loadPdfJs() {
  if (pdfjsLib) {
    return pdfjsLib;
  }

  try {
    // Dynamically import pdfjs-dist
    const pdfjs = await import('pdfjs-dist');
    pdfjsLib = pdfjs;

    // Use unpkg CDN which has the latest versions available
    // pdfjs-dist v4+ uses .mjs extension for workers
    const version = pdfjsLib.version || '5.4.394';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

    if (process.env.NODE_ENV === 'development') {
      console.log('[PDF] pdfjs-dist loaded successfully');
    }

    return pdfjsLib;
  } catch (error) {
    console.error('[PDF] Failed to load pdfjs-dist:', error);
    throw new Error('Failed to load PDF library');
  }
}

export function base64ToUint8Array(b64) {
  try {
    const raw = atob(b64);
    const len = raw.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = raw.charCodeAt(i);
    return bytes;
  } catch (_) {
    return new Uint8Array();
  }
}

export async function extractPdfTextFromBase64(base64Data, opts = {}) {
  // Lazy load pdfjs when actually needed
  const pdfjs = await loadPdfJs();

  const { maxPages = 2, maxChars = 3000 } = opts;
  const data = base64ToUint8Array(base64Data);
  const loadingTask = pdfjs.getDocument({ data });
  const doc = await loadingTask.promise;
  const total = doc.numPages;
  const pagesToRead = Math.min(maxPages, total);
  let text = '';
  for (let p = 1; p <= pagesToRead; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const strings = content.items.map((it) => ('str' in it ? it.str : '')).filter(Boolean);
    text += strings.join(' ') + '\n\n';
    if (text.length > maxChars) {
      text = text.slice(0, maxChars) + '...';
      break;
    }
  }
  return text.trim();
}

export async function extractCitationsFromPdfUrl(url, query, opts = {}) {
  // Lazy load pdfjs when actually needed
  const pdfjs = await loadPdfJs();

  const { maxSnippets = 2 } = opts;
  try {
    const loadingTask = pdfjs.getDocument(url);
    const doc = await loadingTask.promise;
    const total = doc.numPages;
    const q = (query || '').toLowerCase();
    const hits = [];
    for (let p = 1; p <= total; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      const text = content.items.map((it) => ('str' in it ? it.str : '')).join(' ');
      if (!q || text.toLowerCase().includes(q)) {
        const idx = q ? text.toLowerCase().indexOf(q) : 0;
        const start = Math.max(0, idx - 160);
        const end = Math.min(text.length, idx + q.length + 160);
        const snippet = text.slice(start, end).replace(/\s+/g, ' ').trim();
        hits.push({ page: p, snippet });
        if (hits.length >= maxSnippets) break;
      }
    }
    return hits;
  } catch (e) {
    console.warn('[CED] extractCitationsFromPdfUrl error', e);
    return [];
  }
}

/**
 * Extract the full concatenated text of a PDF served at `url` (e.g. a file
 * under /public). Reads every page (up to maxPages) and joins the text with
 * page markers. Used by the curriculum content pipeline to feed noteguide /
 * MCQ PDFs into the AI. Returns '' on failure.
 */
export async function extractPdfTextFromUrl(url, opts = {}) {
  const pdfjs = await loadPdfJs();
  const { maxPages = 60, maxChars = 120000 } = opts;
  try {
    const loadingTask = pdfjs.getDocument(url);
    const doc = await loadingTask.promise;
    const pagesToRead = Math.min(maxPages, doc.numPages);
    let text = '';
    for (let p = 1; p <= pagesToRead; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      const strings = content.items.map((it) => ('str' in it ? it.str : '')).filter(Boolean);
      text += `\n[page ${p}]\n` + strings.join(' ');
      if (text.length > maxChars) {
        text = text.slice(0, maxChars) + '\n...[truncated]';
        break;
      }
    }
    return text.trim();
  } catch (e) {
    console.warn('[PDF] extractPdfTextFromUrl error', e);
    return '';
  }
}

const pdfUtils = { base64ToUint8Array, extractPdfTextFromBase64, extractCitationsFromPdfUrl, extractPdfTextFromUrl };
export default pdfUtils;
