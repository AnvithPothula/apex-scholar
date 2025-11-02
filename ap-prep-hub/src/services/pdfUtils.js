// Lightweight PDF utilities using pdfjs-dist for client-side text extraction
// Note: Ensure pdfjs-dist is installed and worker is set up.
import * as pdfjsLib from 'pdfjs-dist';
// Use CDN worker to avoid bundler worker config
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
  const { maxPages = 2, maxChars = 3000 } = opts;
  const data = base64ToUint8Array(base64Data);
  const loadingTask = pdfjsLib.getDocument({ data });
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
  const { maxSnippets = 2 } = opts;
  try {
    const loadingTask = pdfjsLib.getDocument(url);
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

const pdfUtils = { base64ToUint8Array, extractPdfTextFromBase64, extractCitationsFromPdfUrl };
export default pdfUtils;
