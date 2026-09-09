/**
 * Push the rotated Gemini keys from .env into both production runtimes.
 *
 * Rotating in Google Cloud and updating .env changes nothing in production.
 * The keys live in three places and .env is the one that does not serve traffic:
 *
 *   .env                     local dev and the seeder
 *   Netlify GEMINI_API_KEYS  the ai-proxy function
 *   Cloudflare secrets       GEMINI_API_KEY, _2 … _11 on the worker
 *
 * After the 2026-09 rotation both production runtimes still held revoked keys
 * and every AI call in the app returned API_KEY_INVALID. This exists so that
 * cannot happen quietly again.
 *
 * Usage (from ap-prep-hub/):
 *   node scripts/sync-ai-keys.mjs --check     # compare, change nothing
 *   node scripts/sync-ai-keys.mjs --apply     # write to both runtimes
 *
 * Never prints key material — only counts, suffixes and match/mismatch.
 */

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WORKER_DIR = path.join(ROOT, 'cloudflare', 'ai-router');
const SUFFIXES = ['', '_2', '_3', '_4', '_5', '_6', '_7', '_8', '_9', '_10', '_11'];

const tail = (k) => '…' + k.slice(-4);

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], ...opts });
}

function localKeys() {
  process.loadEnvFile(path.join(ROOT, '.env'));
  const keys = (process.env.GEMINI_API_KEYS || '').split(',').map((s) => s.trim()).filter(Boolean);
  // Google issues two shapes: the classic AIza + 35, and the newer AQ. format
  // (~53 chars, contains dots). The 2026-09 rotation produced the latter.
  const shaped = (k) => /^AIza[\w-]{35}$/.test(k) || /^AQ\.[\w.-]{40,}$/.test(k);
  const bad = keys.filter((k) => !shaped(k));
  if (!keys.length) throw new Error('GEMINI_API_KEYS is empty in .env');
  if (bad.length) throw new Error(`${bad.length} entr(y|ies) in GEMINI_API_KEYS are not AIza-shaped`);
  if (new Set(keys).size !== keys.length) throw new Error('GEMINI_API_KEYS contains duplicates');
  return keys;
}

/** Ask each runtime whether it is actually serving, rather than reading secrets back. */
async function probe(url, token, label) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://apex-scholar.com', 'x-app-token': token },
      body: JSON.stringify({
        task: 'summarize',
        contents: [{ role: 'user', parts: [{ text: 'Reply with the single word: ok' }] }],
        generationConfig: { maxOutputTokens: 10 },
      }),
    });
    const body = await res.text();
    if (res.ok && body.includes('candidates')) return `${label}: OK`;
    if (/API_KEY_INVALID/.test(body)) return `${label}: BROKEN — still holding revoked keys`;
    return `${label}: HTTP ${res.status} — ${body.replace(/\s+/g, ' ').slice(0, 90)}`;
  } catch (e) {
    return `${label}: unreachable (${e.message})`;
  }
}

async function main() {
  const apply = process.argv.includes('--apply');
  const keys = localKeys();
  console.log(`.env holds ${keys.length} keys: ${keys.slice(0, 3).map(tail).join(', ')} …`);

  const token = process.env.AI_PROXY_APP_TOKEN || '';
  console.log('');
  console.log(await probe('https://ai.apex-scholar.com', token, 'cloudflare worker'));
  console.log(await probe('https://apex-scholar.com/.netlify/functions/ai-proxy', token, 'netlify ai-proxy '));

  if (!apply) {
    console.log('\n--check only. Re-run with --apply to push these keys to both runtimes.');
    return;
  }

  console.log('\npushing to Netlify…');
  run('netlify', ['env:set', 'GEMINI_API_KEYS', keys.join(','), '--context', 'production'], { cwd: ROOT });
  console.log('  GEMINI_API_KEYS set');

  console.log('pushing to the Cloudflare worker…');
  keys.forEach((k, i) => {
    const name = `GEMINI_API_KEY${SUFFIXES[i] ?? `_${i + 1}`}`;
    // Value goes over stdin so it never lands in argv or a shell history.
    run('npx', ['--yes', 'wrangler', 'secret', 'put', name], { cwd: WORKER_DIR, input: k });
    console.log(`  ${name} ${tail(k)}`);
  });

  // The two runtimes differ, and the difference is not obvious:
  //   wrangler secret put -> live immediately, no deploy
  //   netlify env:set     -> the function keeps its old environment until the
  //                          site is redeployed
  // Which is why a --check straight after --apply shows the worker green and
  // Netlify still red, and it looks like the write failed. It did not.
  console.log('\nWorker secrets are live immediately — no deploy needed.');
  console.log('Netlify functions keep their old environment until you redeploy:');
  console.log('  netlify deploy --prod');
  console.log('\nThen re-run with --check. Note the deployed client calls the worker');
  console.log('(https://ai.apex-scholar.com), so the Netlify proxy is a fallback,');
  console.log('not the live path — a red Netlify probe is not an outage.');
}

main().catch((e) => { console.error(e.message || e); process.exit(1); });
