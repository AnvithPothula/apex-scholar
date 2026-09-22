/**
 * Turn exported review verdicts into a per-tag precision table.
 *
 *   node scripts/score-tag-review.mjs ~/Downloads/tag-verdicts.jsonl
 *
 * The review page reports one overall number. That is the least useful cut:
 * the sample is stratified 6-per-tag, so the overall figure weights a tag used
 * 1.1% of the time equally with one used 53% of the time and describes neither
 * the tagger nor the bank. What matters is which tags are trustworthy, and
 * what the bank-weighted precision actually is.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { argv, exit } from 'node:process';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = argv[2];
if (!arg) { console.error('usage: node scripts/score-tag-review.mjs <tag-verdicts.jsonl>'); exit(1); }
const file = path.isAbsolute(arg) ? arg : path.join(process.cwd(), arg);

let rows;
try {
  rows = (await readFile(file, 'utf8')).split('\n').filter(Boolean).map((l) => JSON.parse(l));
} catch (e) { console.error(`Cannot read ${file}: ${e.message}`); exit(1); }

// Wilson, because 6 per tag quoted as a bare percentage is indistinguishable
// from a made-up number.
function wilson(k, n, z = 1.96) {
  if (!n) return [0, 0];
  const p = k / n, d = 1 + z * z / n;
  const c = p + z * z / (2 * n);
  const s = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n));
  return [Math.max(0, (c - s) / d), Math.min(1, (c + s) / d)];
}
const pct = (x) => `${(100 * x).toFixed(0)}%`;

// Bank-wide tag shares, so the stratified sample can be reweighted to what the
// bank actually looks like.
//
// Read from Firestore, not from bank.tags.jsonl: every tagging run overwrites
// that file, so after the final 108-item straggler pass it holds 108 items, not
// 3,560. Weighting by a 3% slice would quietly misreport the one figure this
// script exists to produce.
let share = new Map();
const counts = new Map();
let total = 0;
try {
  process.loadEnvFile(path.join(ROOT, '.env'));
  const { getAdminApp } = await import(path.join(ROOT, 'netlify/lib/firebaseAdmin.js'));
  const { app } = getAdminApp();
  if (!app) throw new Error('no admin credentials');
  const snap = await app.firestore().collection('questionBankTags').get();
  snap.forEach((d) => {
    for (const tags of Object.values(d.data().items || {})) {
      for (const t of tags) { counts.set(t.tag, (counts.get(t.tag) || 0) + 1); total++; }
    }
  });
  console.log(`(tag shares from Firestore: ${total} distractors)`);
} catch {
  try {
    const tagRows = (await readFile(path.join(ROOT, 'docs/research/bank.tags.jsonl'), 'utf8'))
      .split('\n').filter(Boolean).map((l) => JSON.parse(l));
    for (const r of tagRows) for (const t of r.tags) { counts.set(t.tag, (counts.get(t.tag) || 0) + 1); total++; }
    console.log(`(tag shares from bank.tags.jsonl: ${total} distractors — may be only the last run)`);
  } catch { /* no source — skip the weighting */ }
}
for (const [t, c] of counts) share.set(t, c / total);

const byTag = new Map();
for (const r of rows) {
  if (!byTag.has(r.tag)) byTag.set(r.tag, { yes: 0, no: 0, skip: 0 });
  const b = byTag.get(r.tag);
  if (r.verdict === 'yes') b.yes++; else if (r.verdict === 'no') b.no++; else b.skip++;
}

console.log(`\n${rows.length} verdicts across ${byTag.size} tags\n`);
console.log('tag                       judged  correct  precision   95% CI        bank share');
console.log('-'.repeat(82));
let jTot = 0, yTot = 0, weighted = 0, weightSeen = 0;
for (const [tag, b] of [...byTag.entries()].sort((a, c) => (share.get(c[0]) || 0) - (share.get(a[0]) || 0))) {
  const n = b.yes + b.no;
  jTot += n; yTot += b.yes;
  const p = n ? b.yes / n : 0;
  const [lo, hi] = wilson(b.yes, n);
  const sh = share.get(tag);
  if (sh !== undefined && n) { weighted += sh * p; weightSeen += sh; }
  console.log(
    `${tag.padEnd(24)} ${String(n).padStart(6)} ${String(b.yes).padStart(8)}  ${(n ? pct(p) : '—').padStart(9)}   `
    + `${(n ? `${pct(lo)}–${pct(hi)}` : '—').padEnd(12)}  ${sh !== undefined ? pct(sh) : '—'}`
  );
}
console.log('-'.repeat(82));
const [lo, hi] = wilson(yTot, jTot);
console.log(`unweighted (equal per tag) ${String(jTot).padStart(5)} ${String(yTot).padStart(8)}  ${pct(jTot ? yTot / jTot : 0).padStart(9)}   ${pct(lo)}–${pct(hi)}`);
if (weightSeen > 0) {
  console.log(`bank-weighted precision                       ${pct(weighted / weightSeen).padStart(9)}   <- what a student actually meets`);
}
const skipped = rows.filter((r) => r.verdict === 'skip').length;
if (skipped) console.log(`\n${skipped} skipped (excluded from every figure above).`);
const weak = [...byTag.entries()].filter(([, b]) => b.yes + b.no >= 3 && b.yes / (b.yes + b.no) < 0.6);
if (weak.length) {
  console.log(`\nTags below 60% — do not surface these to students yet:`);
  for (const [t, b] of weak) console.log(`  ${t} (${b.yes}/${b.yes + b.no})`);
}
