/**
 * Post-build prerender for the AP score calculators.
 *
 * The runtime <title>/<meta> hook (useDocumentMeta) only helps crawlers that
 * execute JavaScript. Google does; Bing, DuckDuckGo, the LLM crawlers, and
 * every link unfurler (Slack, Discord, iMessage, Twitter) do not — they read
 * the raw HTML, which was one generic title shared by all 36 calculators.
 *
 * This writes a real HTML file per subject: correct head meta, plus the
 * subject's actual scoring model in the crawler-fallback block that already
 * exists inside #root. React replaces that block on mount, so nothing changes
 * for a user with JS.
 *
 * Not a headless-browser prerender. Adding puppeteer to boot a Firebase app at
 * build time buys body markup we don't need and a whole class of build
 * failures we don't want.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD = path.join(ROOT, 'build');
const ORIGIN = 'https://apex-scholar.com';

/**
 * src/ is authored as ES modules but package.json has no "type": "module", so
 * Node would parse these files as CommonJS and choke on `export`. Handing the
 * source text to Node as a data: URL forces ESM parsing.
 * Only valid for modules with no imports of their own — both of these qualify.
 */
async function loadEsm(rel) {
  const src = await readFile(path.join(ROOT, rel), 'utf8');
  if (/^\s*import\s/m.test(src)) {
    throw new Error(`${rel} has imports; data: URL loading cannot resolve them`);
  }
  return import(`data:text/javascript;base64,${Buffer.from(src).toString('base64')}`);
}

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Replace the content of a single meta/link tag, matched by its identifying attribute. */
function setTag(html, matcher, attr, value) {
  const re = new RegExp(`(<(?:meta|link)[^>]*${matcher}[^>]*${attr}=")[^"]*(")`, 'i');
  if (!re.test(html)) throw new Error(`prerender: no tag matched ${matcher}`);
  return html.replace(re, `$1${esc(value)}$2`);
}

export function buildBody(subject, model, description, allSubjects, slugFor, curveRows) {
  const rows = curveRows(model)
    .map(
      (r) =>
        `<tr><td>${r.score}</td><td>${r.min}–${r.max}</td><td>${r.percentMin}%</td></tr>`
    )
    .join('');
  const sections = model.sections
    .map(
      (s) =>
        `<li>${esc(s.label)} — ${s.maxRaw} raw points, worth ${s.weight} of ${model.compositeMax} composite points.</li>`
    )
    .join('');
  const others = allSubjects
    .filter((s) => s !== subject)
    .map((s) => `<li><a href="/ap-score-calculator/${slugFor(s)}">${esc(s)} score calculator</a></li>`)
    .join('');

  return `
      <div style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;">
        <h1>${esc(subject)} Score Calculator</h1>
        <p>${esc(description)}</p>
        <h2>How the ${esc(subject)} composite score works</h2>
        <ul>${sections}</ul>
        ${model.note ? `<p>${esc(model.note)}</p>` : ''}
        <h2>Estimated ${esc(subject)} score cutoffs</h2>
        <table>
          <thead><tr><th>AP score</th><th>Composite points</th><th>Percent of composite</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p>
          The College Board does not publish its cut points. These are ${esc(
            model.cutoffConfidence || 'estimated'
          )} from released practice exams and score distributions, and they move a few
          points each year with exam difficulty. Apex Scholar shows the whole curve
          instead of presenting one number as fact.
        </p>
        <h2>Other AP score calculators</h2>
        <ul>${others}</ul>
      </div>`;
}

async function main() {
  const template = await readFile(path.join(BUILD, 'index.html'), 'utf8');
  // Anchored on an id, not an HTML comment: CRA's html-webpack-plugin strips
  // comments when it minifies.
  const FALLBACK = /<div id="crawler-fallback"[\s\S]*?<\/div>/;
  if (!FALLBACK.test(template)) {
    throw new Error('prerender: #crawler-fallback missing from build/index.html');
  }

  const models = await loadEsm('src/constants/apScoreModels.js');
  const meta = await loadEsm('src/utils/pageMeta.js');
  const { SUBJECT_BY_SLUG, AP_SCORE_MODELS, slugFor, curveRows } = models;
  const subjects = Object.keys(AP_SCORE_MODELS);

  const pages = Object.entries(SUBJECT_BY_SLUG).map(([slug, subject]) => ({
    slug,
    subject,
    file: path.join(BUILD, 'ap-score-calculator', `${slug}.html`),
  }));
  // The picker page itself, at /ap-score-calculator.
  pages.push({ slug: '', subject: null, file: path.join(BUILD, 'ap-score-calculator', 'index.html') });

  await mkdir(path.join(BUILD, 'ap-score-calculator'), { recursive: true });

  for (const page of pages) {
    const title = meta.scoreCalculatorTitle(page.subject);
    const description = meta.scoreCalculatorDescription(page.subject);
    const canonical = meta.canonicalFor(
      page.slug ? `/ap-score-calculator/${page.slug}` : '/ap-score-calculator',
      ORIGIN
    );

    let html = template.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
    html = setTag(html, 'name="description"', 'content', description);
    html = setTag(html, 'property="og:title"', 'content', title);
    html = setTag(html, 'property="og:description"', 'content', description);
    html = setTag(html, 'property="og:url"', 'content', canonical);
    html = setTag(html, 'name="twitter:title"', 'content', title);
    html = setTag(html, 'name="twitter:description"', 'content', description);
    html = setTag(html, 'rel="canonical"', 'href', canonical);

    if (page.subject) {
      const model = AP_SCORE_MODELS[page.subject];
      const body = buildBody(page.subject, model, description, subjects, slugFor, curveRows);
      html = html.replace(FALLBACK, body);
    }

    await writeFile(page.file, html, 'utf8');
  }

  console.log(`prerendered ${pages.length} score-calculator pages`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
