/**
 * Pull a stratified sample of banked questions out for human labelling.
 *
 * The bank holds 3,600 AI-generated items that passed `isUsableQuestion` —
 * which checks SHAPE ONLY: four choices, four explanations, an answer index in
 * range. Nothing has ever checked whether the marked answer is correct. This
 * exports a sample so that can be measured, and so the labelled result can be
 * published as a dataset.
 *
 * Stratified by subject, because an unstratified draw from 36 subjects lands
 * lopsided and a per-subject error rate is one of the things worth reporting.
 *
 * Usage (from ap-prep-hub/):
 *   node scripts/export-label-sample.mjs --n 300 --out docs/research/sample.jsonl
 *   node scripts/export-label-sample.mjs --n 300 --seed 7      # different draw
 *   node scripts/export-label-sample.mjs --n 180 --subjects "AP Biology,AP Calculus BC"
 *
 * `--subjects` exists because a label is only worth what the labeller knows. An
 * annotator guessing on AP Japanese does not measure the item, they measure
 * themselves: at 50% accuracy on a subject, a true 5% key-error rate reads as
 * 0.05*0.5 + 0.95*0.5 = 50% disagreement. Better a narrow honest dataset than a
 * wide contaminated one.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Deterministic shuffle so a run is reproducible from its seed. */
function shuffle(items, seed) {
  const out = [...items];
  let s = Number(seed) || 1;
  const rand = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return Math.abs(s) / 2 ** 31; };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function parseArgs(argv) {
  const out = { n: 300, seed: 1, out: 'docs/research/sample.jsonl', subjects: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--n') out.n = Number(argv[++i]);
    else if (argv[i] === '--seed') out.seed = Number(argv[++i]);
    else if (argv[i] === '--out') out.out = argv[++i];
    else if (argv[i] === '--subjects') {
      out.subjects = argv[++i].split(',').map((x) => x.trim()).filter(Boolean);
    }
  }
  if (!Number.isInteger(out.n) || out.n < 1) throw new Error('--n must be a positive integer');
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  try { process.loadEnvFile(path.join(ROOT, '.env')); } catch { /* real env instead */ }

  const admin = require('firebase-admin');
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    })});
  }
  const db = admin.firestore();

  // Group every banked question by subject.
  const bySubject = new Map();
  const snap = await db.collection('questionBank').get();
  snap.forEach((d) => {
    const b = d.data();
    const subject = b.subject || 'unknown';
    if (!bySubject.has(subject)) bySubject.set(subject, []);
    (b.questions || []).forEach((q, i) => {
      bySubject.get(subject).push({ ...q, _bundle: d.id, _index: i, _model: b.model, subject });
    });
  });

  let subjects = [...bySubject.keys()].sort();
  if (args.subjects) {
    const wanted = new Set(args.subjects);
    const unknown = args.subjects.filter((x) => !bySubject.has(x));
    if (unknown.length) {
      throw new Error(`unknown subject(s): ${unknown.join(', ')}\nknown: ${subjects.join(', ')}`);
    }
    subjects = subjects.filter((s) => wanted.has(s));
  }
  const total = [...bySubject.values()].reduce((a, v) => a + v.length, 0);
  console.log(`bank: ${total} questions across ${subjects.length} subjects`);

  // Even quota per subject, then top up from the largest pools so the total
  // lands exactly on n rather than n rounded down 36 times.
  const per = Math.floor(args.n / subjects.length);
  const picked = [];
  const leftovers = [];
  for (const s of subjects) {
    const pool = shuffle(bySubject.get(s), args.seed + s.length);
    picked.push(...pool.slice(0, per));
    leftovers.push(...pool.slice(per));
  }
  picked.push(...shuffle(leftovers, args.seed).slice(0, Math.max(0, args.n - picked.length)));

  // Shuffled again so the labeller doesn't work through one subject at a time —
  // grading nine AP Chem items in a row invites a different standard than
  // grading them scattered.
  const rows = shuffle(picked, args.seed * 31).map((q, i) => ({
    id: `q${String(i + 1).padStart(4, '0')}`,
    source_bundle: q._bundle,
    source_index: q._index,
    generator_model: q._model || null,
    subject: q.subject,
    concept: q.concept || null,
    question: q.question,
    choices: q.choices,
    stored_answer: q.correctAnswer,
    explanations: q.explanations,
  }));

  const outPath = path.join(ROOT, args.out);
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, rows.map((r) => JSON.stringify(r)).join('\n') + '\n', 'utf8');

  const counts = {};
  rows.forEach((r) => { counts[r.subject] = (counts[r.subject] || 0) + 1; });
  const spread = Object.values(counts);
  console.log(`wrote ${rows.length} rows -> ${args.out}`);
  console.log(`subjects covered: ${Object.keys(counts).length}, ${Math.min(...spread)}-${Math.max(...spread)} per subject`);
  process.exit(0);
}

main().catch((err) => { console.error(err.message || err); process.exit(1); });
