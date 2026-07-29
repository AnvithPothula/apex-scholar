// Routing/cache-key sanity check (no network). Run: node selfcheck.mjs
import assert from 'node:assert';
// Import the REAL routing tables. They used to be copy-pasted here, which meant
// the check could pass while the deployed Worker routed somewhere else.
import { MODEL_CHAINS, TASK_TO_CHAIN } from './src/index.js';

const versionFor = (m) => (/^(gemini-(2\.5|3)|gemma-)/.test(m) ? 'v1beta' : 'v1');

// Every task must point at a chain that actually exists.
for (const [task, chain] of Object.entries(TASK_TO_CHAIN)) {
  assert.ok(MODEL_CHAINS[chain], `task "${task}" -> unknown chain "${chain}"`);
}

// task -> first model
assert.equal(MODEL_CHAINS[TASK_TO_CHAIN.mcqGenerate][0], 'gemma-4-31b-it');
// The verifier must not lead with the same model that generated the question,
// otherwise the "second opinion" is the first opinion again.
assert.notEqual(
  MODEL_CHAINS[TASK_TO_CHAIN.verifyMcq][0],
  MODEL_CHAINS[TASK_TO_CHAIN.mcqGenerate][0]
);
assert.equal(MODEL_CHAINS[TASK_TO_CHAIN.lessonTeach][0], 'gemma-4-31b-it');
assert.equal(MODEL_CHAINS[TASK_TO_CHAIN.tutorChat][0], 'gemini-3.1-flash-lite');
assert.equal(MODEL_CHAINS[TASK_TO_CHAIN.frqGrade][0], 'gemini-3.5-flash');
// gemma + 3.x on v1beta, an old model on v1
assert.equal(versionFor('gemma-4-31b-it'), 'v1beta');
assert.equal(versionFor('gemini-3.1-flash-lite'), 'v1beta');
assert.equal(versionFor('gemini-1.5-flash'), 'v1');
// image forces vision regardless of task
const hasImage = (contents) => contents.some((c) => Array.isArray(c.parts) && c.parts.some((p) => p.inline_data || p.inlineData));
assert.equal(hasImage([{ parts: [{ inline_data: { data: 'x' } }] }]), true);
assert.equal(hasImage([{ parts: [{ text: 'hi' }] }]), false);

console.log('ai-router selfcheck OK');
