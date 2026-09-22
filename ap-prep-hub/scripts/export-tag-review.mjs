/**
 * Sample tagged distractors for human review, joined with the item text.
 *
 *   node scripts/export-tag-review.mjs --n 60
 *
 * The tagger reports zero malformed outputs and a floor on agreement with a
 * regex baseline, and neither of those is accuracy. Accuracy needs a person
 * saying "yes, that is the mistake a student would make here" — this produces
 * the smallest file that lets one do it, stratified across tags so the rare
 * ones get looked at rather than drowned by whatever the model uses most.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { argv, exit } from 'node:process';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = {};
for (let i = 2; i < argv.length; i++) {
  if (!argv[i].startsWith('--')) continue;
  const [k, v] = argv[i].slice(2).split('=');
  args[k] = v !== undefined ? v : (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true);
}
try { process.loadEnvFile(path.join(ROOT, '.env')); } catch {}

const { getAdminApp } = await import(path.join(ROOT, 'netlify/lib/firebaseAdmin.js'));
const { app, error } = getAdminApp();
if (!app) { console.error(error); exit(1); }
const db = app.firestore();

const tagDocs = await db.collection('questionBankTags').get();
if (tagDocs.empty) { console.error('No tags yet — run tag-misconceptions.mjs first.'); exit(1); }

// Pull only the bundles that actually have tags.
const rows = [];
for (const d of tagDocs.docs) {
  const bundle = await db.collection('questionBank').doc(d.id).get();
  if (!bundle.exists) continue;
  const qs = bundle.data().questions || [];
  for (const [idx, tags] of Object.entries(d.data().items || {})) {
    const q = qs[Number(idx)];
    if (!q) continue;
    for (const t of tags) {
      if (t.choiceIndex === q.correctAnswer) continue;   // the key has no misconception
      rows.push({
        id: `${d.id}#${idx}:${t.choiceIndex}`,
        subject: String(d.id).split('__')[0],
        question: q.question,
        choices: q.choices,
        correctAnswer: q.correctAnswer,
        distractor: t.choiceIndex,
        tag: t.tag,
        concept: t.concept,
        storedExplanation: (q.explanations || [])[t.choiceIndex] || '',
      });
    }
  }
}
console.log(`${rows.length} tagged distractors available across ${tagDocs.size} bundles`);

// Seeded shuffle so the draw is reproducible, then round-robin by tag so rare
// tags are represented. Sampling uniformly would spend most of the review on
// confused_concepts and say nothing about the tags used ten times.
let seed = Number(args.seed || 20260920) >>> 0;
const rnd = () => (((seed ^= seed << 13), (seed ^= seed >>> 17), (seed ^= seed << 5)) >>> 0) / 4294967296;
const byTag = new Map();
for (const r of rows.sort(() => rnd() - 0.5)) {
  if (!byTag.has(r.tag)) byTag.set(r.tag, []);
  byTag.get(r.tag).push(r);
}
const want = Number(args.n || 60);
const out = [];
const buckets = [...byTag.values()];
for (let i = 0; out.length < want && buckets.some((b) => b.length); i++) {
  const b = buckets[i % buckets.length];
  if (b.length) out.push(b.shift());
}

const dest = path.join(ROOT, 'docs/research/tag-review.jsonl');
await writeFile(dest, out.map((r) => JSON.stringify(r)).join('\n') + '\n', 'utf8');
const dist = out.reduce((m, r) => m.set(r.tag, (m.get(r.tag) || 0) + 1), new Map());
console.log(`sampled ${out.length}, stratified across ${dist.size} tags:`);
for (const [t, c] of [...dist].sort((a, b) => b[1] - a[1])) console.log(`  ${String(c).padStart(3)}  ${t}`);
console.log(`\nwrote ${dest}`);
