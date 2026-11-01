#!/usr/bin/env node
// Builds public/ced-index/<name>.json (the text of each page) from the CED PDFs
// in public/ced. Run it again whenever a PDF there is added or replaced:
//
//   node scripts/build-ced-index.mjs
//
// Why: the tutor and the timeline used to ground answers by opening the whole
// CED PDF in the browser on every message, 2 to 43 MB each. On Netlify's
// credit plan bandwidth costs 20 credits per GB, so a few hundred students
// asking one question each would pause the site. The page text is 50 to 300 KB
// compressed per subject, and cedSearch reads that instead. The PDFs stay in
// public/ced for anyone who opens one.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'public/ced');
const OUT = path.join(ROOT, 'public/ced-index');

const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

mkdirSync(OUT, { recursive: true });
for (const file of readdirSync(SRC).filter((f) => f.endsWith('.pdf')).sort()) {
  const data = new Uint8Array(readFileSync(path.join(SRC, file)));
  const doc = await pdfjs.getDocument({ data, verbosity: 0 }).promise;
  const pages = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const content = await (await doc.getPage(p)).getTextContent();
    pages.push(content.items.map((it) => ('str' in it ? it.str : '')).join(' ').replace(/\s+/g, ' ').trim());
  }
  await doc.destroy();
  const out = path.join(OUT, file.replace(/\.pdf$/, '.json'));
  writeFileSync(out, JSON.stringify({ source: `/ced/${file}`, pages }));
  console.log(`${path.relative(ROOT, out)}  ${pages.length} pages`);
}
