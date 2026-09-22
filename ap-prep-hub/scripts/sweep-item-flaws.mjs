/**
 * Deterministic item-writing-flaw sweep over the question bank.
 *
 *   node scripts/sweep-item-flaws.mjs --input docs/research/sample.jsonl
 *   node scripts/sweep-item-flaws.mjs --firestore            # needs FIREBASE_SERVICE_ACCOUNT
 *
 * Writes a flagged-items JSONL next to the input so the hits can be read, and
 * prints prevalence with a Wilson interval — a rate off 200 sampled items is an
 * estimate, and reporting it bare would invite treating it as a census.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { argv, exit } from 'node:process';

// Accepts both `--input=path` and `--input path`. The =-only version silently
// set input to boolean true and crashed inside readFile.
const args = {};
for (let i = 2; i < argv.length; i++) {
  const a = argv[i];
  if (!a.startsWith('--')) continue;
  const [k, v] = a.slice(2).split('=');
  if (v !== undefined) args[k] = v;
  else if (argv[i + 1] && !argv[i + 1].startsWith('--')) args[k] = argv[++i];
  else args[k] = true;
}

// Same data:-URL trick the seeder uses: src/ is ESM inside a CJS-typed package,
// and itemFlaws.js is import-free so it loads standalone.
async function loadEsm(path) {
  const src = await readFile(path, 'utf8');
  return import(`data:text/javascript;base64,${Buffer.from(src).toString('base64')}`);
}

async function fromFirestore() {
  // Same as scripts/seed-question-bank.mjs: Node reads .env only when asked,
  // and without this the credentials sit in .env while the script reports them
  // missing.
  try {
    const { fileURLToPath } = await import('node:url');
    const path = await import('node:path');
    process.loadEnvFile(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env'));
  } catch { /* no .env — real environment variables are expected instead */ }
  const { getAdminApp } = await import('../netlify/lib/firebaseAdmin.js');
  const { app, error } = getAdminApp();
  if (!app) {
    console.error(`Cannot read the bank: ${error}`);
    console.error('Set FIREBASE_SERVICE_ACCOUNT in .env, or pass --input <jsonl>.');
    exit(1);
  }
  const snap = await app.firestore().collection('questionBank').get();
  const out = [];
  snap.forEach((doc) => {
    const qs = doc.data().questions || [];
    // Bundle ids are `<subject-slug>__<unit>__<n>`; the questions themselves
    // carry no subject field, so without this every row reports subject
    // "undefined" and the per-subject breakdown — the only part that says where
    // to start fixing — is empty.
    const subject = String(doc.id).split('__')[0];
    qs.forEach((q, i) => out.push({ ...q, id: `${doc.id}#${i}`, source_bundle: doc.id, subject }));
  });
  return out;
}

async function fromJsonl(path) {
  const text = await readFile(path, 'utf8');
  return text.split('\n').filter(Boolean).map((l) => JSON.parse(l));
}

// Wilson score interval — normal approximation is wrong at the low rates most
// of these flaws sit at, and 0/200 is not "0%".
function wilson(k, n, z = 1.96) {
  if (!n) return [0, 0];
  const p = k / n;
  const d = 1 + (z * z) / n;
  const c = p + (z * z) / (2 * n);
  const s = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return [Math.max(0, (c - s) / d), Math.min(1, (c + s) / d)];
}

const pct = (x) => `${(x * 100).toFixed(1)}%`;

const { detectFlaws, FATAL, UNACCEPTABLE_AT, TIER, counted } = await loadEsm('src/utils/itemFlaws.js');

const items = args.firestore ? await fromFirestore() : await fromJsonl(args.input || 'docs/research/sample.jsonl');
if (!items.length) { console.error('No items read.'); exit(1); }

const counts = new Map();
const flagged = [];
let fatalCount = 0;
let unacceptable = 0;
const perSubject = new Map();

for (const item of items) {
  const flaws = detectFlaws(item);
  for (const f of flaws) counts.set(f, (counts.get(f) || 0) + 1);
  const fatal = flaws.filter((f) => FATAL.has(f));
  if (fatal.length) fatalCount++;
  const real = flaws.filter(counted);
  if (real.length >= UNACCEPTABLE_AT) unacceptable++;
  const s = perSubject.get(item.subject) || { n: 0, flaws: 0, bad: 0 };
  s.n++; s.flaws += real.length; if (real.length >= UNACCEPTABLE_AT) s.bad++;
  perSubject.set(item.subject, s);
  if (flaws.length) flagged.push({ id: item.id, subject: item.subject, flaws, question: item.question, choices: item.choices, stored_answer: item.stored_answer });
}

const n = items.length;
console.log(`\nSwept ${n} items from ${args.firestore ? 'Firestore' : args.input || 'docs/research/sample.jsonl'}\n`);
console.log('flaw                         count   rate    95% CI          action');
console.log('-'.repeat(58));
for (const [flaw, k] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
  const [lo, hi] = wilson(k, n);
  const mark = `  ${TIER[flaw] || '?'}`;
  console.log(`${flaw.padEnd(28)} ${String(k).padStart(4)}  ${pct(k / n).padStart(6)}  ${pct(lo)}–${pct(hi)}${mark}`);
}
const totalFlaws = [...counts.values()].reduce((a, b) => a + b, 0);
console.log('-'.repeat(58));
console.log(`items with >=1 flaw           ${String(flagged.length).padStart(4)}  ${pct(flagged.length / n)}`);
console.log(`items with >=${UNACCEPTABLE_AT} flaws ("unacceptable", Tarrant 2006)  ${String(unacceptable).padStart(4)}  ${pct(unacceptable / n)}`);
console.log(`items with a FATAL flaw       ${String(fatalCount).padStart(4)}  ${pct(fatalCount / n)}`);
console.log(`mean flaws per item           ${(totalFlaws / n).toFixed(2)}   (Schmucker & Moore 2025 report 1.48 across 7,126 school MCQs)`);

console.log('\nby subject:');
for (const [subj, s] of [...perSubject.entries()].sort((a, b) => b[1].bad / b[1].n - a[1].bad / a[1].n)) {
  console.log(`  ${String(subj).padEnd(34)} n=${String(s.n).padStart(3)}  mean=${(s.flaws / s.n).toFixed(2)}  unacceptable=${pct(s.bad / s.n)}`);
}

// Default the name from what was actually swept. Deriving it from `args.input`
// meant a --firestore run with no --out fell through to the input DEFAULT and
// silently overwrote the sample's flagged file with 3,560 bank rows.
const base = args.out
  || (args.firestore ? 'docs/research/bank' : String(args.input).replace(/\.jsonl$/, ''));
const out = `${base}.flagged.jsonl`;
await writeFile(out, flagged.map((f) => JSON.stringify(f)).join('\n') + '\n', 'utf8');
console.log(`\nwrote ${flagged.length} flagged items -> ${out}`);
