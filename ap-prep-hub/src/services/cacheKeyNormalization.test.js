/**
 * The worker's KV cache keyed on a hash of the RAW request, so
 * "explain photosynthesis", "Explain photosynthesis." and
 * "explain  photosynthesis" were three separate entries for one answer.
 *
 * Mirrors normalizeText/normalizeForCache in cloudflare/ai-router/src/index.js.
 * Only the cache KEY is normalized — the model still gets the original wording.
 */
const fs = require('fs');
const path = require('path');

const workerSrc = fs.readFileSync(
  path.resolve(__dirname, '..', '..', 'cloudflare/ai-router/src/index.js'), 'utf8');

const normalizeText = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/(?<!\d)\.(?!\d)/g, ' ')
    .replace(/[^\p{L}\p{N}\s'"+\-=/^_.]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

describe('cache key normalization', () => {
  it('collapses the ways students phrase the same question', () => {
    const target = 'explain photosynthesis';
    for (const variant of [
      'Explain photosynthesis',
      'explain photosynthesis.',
      'Explain  photosynthesis!',
      '  EXPLAIN PHOTOSYNTHESIS?  ',
    ]) {
      expect(normalizeText(variant)).toBe(target);
    }
  });

  it('normalizes smart quotes from phone keyboards', () => {
    expect(normalizeText('What’s a derivative?')).toBe("what's a derivative");
  });

  it('keeps math characters that change the meaning', () => {
    expect(normalizeText('Solve x^2 + 3x - 4 = 0')).toBe('solve x^2 + 3x - 4 = 0');
    expect(normalizeText('pi is 3.14')).toBe('pi is 3.14');
    expect(normalizeText('what is 1/2 + 1/4')).toBe('what is 1/2 + 1/4');
  });

  it('still separates genuinely different questions', () => {
    expect(normalizeText('explain mitosis')).not.toBe(normalizeText('explain meiosis'));
    expect(normalizeText('define an acid')).not.toBe(normalizeText('define a base'));
  });

  it('is wired into the worker cache key, not just defined', () => {
    expect(workerSrc).toMatch(/sha256\(JSON\.stringify\(\{ contents: normalizeForCache\(contents\)/);
  });

  it('leaves image parts untouched', () => {
    // Images skip the cache entirely, but the mapper must not corrupt them.
    expect(workerSrc).toMatch(/typeof p\?\.text === 'string' \? \{ text: normalizeText\(p\.text\) \} : p/);
  });
});
