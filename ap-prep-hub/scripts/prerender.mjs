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

const HIDDEN = 'position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;';

// The hubs every page's crawler block links to, so a crawler that does not run
// JavaScript can still walk from any page to the rest of the site.
const EXPLORE = [
  ['/study', 'Free AP unit lessons'],
  ['/ap-score-calculator', 'AP score calculators'],
  ['/study/timelines/ap-us-history', 'APUSH timeline'],
  ['/start', 'Free AP score check'],
  ['/ai-tutors', 'AI tutors for every AP subject'],
];
const exploreList = () =>
  `<ul>${EXPLORE.map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join('')}</ul>`;

/**
 * index.html's JSON-LD (Organization, WebSite, SoftwareApplication) describes
 * the homepage. Every other page gets a BreadcrumbList instead, or nothing:
 * the same organisation markup on ~140 pages is noise, and Google shows a
 * breadcrumb trail in place of the URL for pages that have one.
 */
function setStructuredData(html, crumbs) {
  let out = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  if (crumbs && crumbs.length > 1) {
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map(([name, href], i) => ({
        '@type': 'ListItem', position: i + 1, name, item: `${ORIGIN}${href}`,
      })),
    };
    const json = JSON.stringify(ld).replace(/</g, '\\u003c');
    out = out.replace('</head>', `<script type="application/ld+json">${json}</script></head>`);
  }
  return out;
}

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
        ${exploreList()}
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
    html = setStructuredData(html, [
      ['Apex Scholar', '/'],
      ['AP Score Calculators', '/ap-score-calculator'],
      ...(page.subject ? [[page.subject, `/ap-score-calculator/${page.slug}`]] : []),
    ]);

    if (page.subject) {
      const model = AP_SCORE_MODELS[page.subject];
      const body = buildBody(page.subject, model, description, subjects, slugFor, curveRows);
      html = html.replace(FALLBACK, body);
    } else {
      html = html.replace(FALLBACK, `
      <div style="${HIDDEN}">
        <h1>AP Score Calculators</h1>
        <p>${esc(description)}</p>
        <ul>${subjects.map((s) => `<li><a href="/ap-score-calculator/${slugFor(s)}">${esc(s)} score calculator</a></li>`).join('')}</ul>
        ${exploreList()}
      </div>`);
    }

    await writeFile(page.file, html, 'utf8');
  }

  console.log(`prerendered ${pages.length} score-calculator pages`);

  // Every other route with its own meta. Without a file here, Netlify's SPA
  // fallback serves index.html, whose <head> says canonical = "/" and carries
  // the homepage title. Google read /start as a duplicate of "/" for exactly
  // that reason ("Google chose different canonical than user", Oct 2026).
  // Netlify serves /start from start.html before the /* fallback applies.
  const { ROUTE_META } = await loadEsm('src/constants/routeMeta.js');
  const { PACKS } = await loadEsm('src/data/packs/index.js');
  let routes = 0;
  for (const [route, m] of Object.entries(ROUTE_META)) {
    if (route === '/') continue;
    const canonical = meta.canonicalFor(route, ORIGIN);
    let html = template.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(m.title)}</title>`);
    html = setTag(html, 'name="description"', 'content', m.description);
    html = setTag(html, 'property="og:title"', 'content', m.title);
    html = setTag(html, 'property="og:description"', 'content', m.description);
    html = setTag(html, 'property="og:url"', 'content', canonical);
    html = setTag(html, 'name="twitter:title"', 'content', m.title);
    html = setTag(html, 'name="twitter:description"', 'content', m.description);
    html = setTag(html, 'rel="canonical"', 'href', canonical);
    if (m.robots) html = setTag(html, 'name="robots"', 'content', m.robots);

    const study = route.startsWith('/study/') ? route.slice('/study/'.length) : null;
    const packEntry = study && PACKS[study];
    const classPacks = study && !packEntry ? Object.entries(PACKS).filter(([slug]) => slug.startsWith(`${study}/`)) : [];
    const heading = m.title.split(' — ')[0];
    let crumbs = null;
    let body;
    if (packEntry) {
      // Study packs: crawlers get the topic list and summaries, like the
      // calculators get their curve tables.
      const pack = { ...(await loadEsm(`src/data/packs/${packEntry.file}.js`)).default, ...packEntry.overrides };
      const classId = study.split('/')[0];
      crumbs = [['Apex Scholar', '/'], ['Learn', '/study'], [pack.subject, `/study/${classId}`], [pack.unit, route]];
      body = `
        <h1>${esc(pack.subject)} ${esc(pack.unit)}</h1>
        <p>${esc(pack.intro)}</p>
        ${pack.sections.map((s) => `<h2>${esc(s.id)} ${esc(s.title)}</h2><p>${esc(s.summary)}</p>`).join('\n        ')}
        <p><a href="/study/${classId}">More ${esc(pack.subject)} units</a></p>`;
    } else if (classPacks.length) {
      const subject = classPacks[0][1].subject;
      crumbs = [['Apex Scholar', '/'], ['Learn', '/study'], [subject, route]];
      body = `
        <h1>${esc(subject)} study packs</h1>
        <p>${esc(m.description)}</p>
        <ul>${classPacks.map(([slug, p]) => `<li><a href="/study/${slug}">${esc(p.title)}</a></li>`).join('')}</ul>`;
    } else if (route === '/study') {
      crumbs = [['Apex Scholar', '/'], ['Learn', '/study']];
      body = `
        <h1>Study packs</h1>
        <p>${esc(m.description)}</p>
        <ul>${[...new Set(Object.keys(PACKS).map((slug) => slug.split('/')[0]))].map((id) => `<li><a href="/study/${id}">${esc(Object.entries(PACKS).find(([slug]) => slug.startsWith(`${id}/`))[1].subject)}</a></li>`).join('')}</ul>
        <ul>${Object.entries(PACKS).map(([slug, p]) => `<li><a href="/study/${slug}">${esc(p.subject)} ${esc(p.title)}</a></li>`).join('')}</ul>`;
    } else {
      // Everything else (the score check, tutors, legal pages...) used to keep
      // the homepage's own crawler text, so to anything that does not run
      // JavaScript each of them read as a copy of the homepage.
      if (route.startsWith('/study/timelines/')) crumbs = [['Apex Scholar', '/'], ['Learn', '/study'], [heading.split(',')[0], route]];
      body = `
        <h1>${esc(heading)}</h1>
        <p>${esc(m.description)}</p>`;
    }
    html = setStructuredData(html, crumbs);
    html = html.replace(FALLBACK, `
      <div style="${HIDDEN}">${body}
        ${exploreList()}
      </div>`);
    const file = path.join(BUILD, `${route.slice(1)}.html`);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, html, 'utf8');
    routes += 1;
  }
  console.log(`prerendered ${routes} route heads`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
