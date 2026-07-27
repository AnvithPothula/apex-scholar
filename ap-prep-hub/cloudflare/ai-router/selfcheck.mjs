// Routing/cache-key sanity check (no network). Run: node selfcheck.mjs
import assert from 'node:assert';

const MODEL_CHAINS = {
  bulk: ['gemma-4-31b-it', 'gemma-4-26b-a4b-it', 'gemini-3.1-flash-lite'],
  interactive: ['gemini-3.1-flash-lite', 'gemma-4-31b-it', 'gemini-2.5-flash'],
  premium: ['gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-3.1-flash-lite'],
  vision: ['gemini-3.1-flash-lite', 'gemini-2.5-flash', 'gemini-3.5-flash'],
};
const TASK_TO_CHAIN = { tutorChat: 'interactive', mcqGenerate: 'bulk', frqGrade: 'premium', solver: 'vision' };
const versionFor = (m) => (/^(gemini-(2\.5|3)|gemma-)/.test(m) ? 'v1beta' : 'v1');

// task -> first model
assert.equal(MODEL_CHAINS[TASK_TO_CHAIN.mcqGenerate][0], 'gemma-4-31b-it');
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
