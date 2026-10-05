import { MODEL_CHAINS, TASK_TO_CHAIN, DEEP_POOL, chainFor, GEMMA_MAX_CHARS } from './modelChains';

// Measured free-tier RPD per project. A chain that ENDS on a 20-RPD model gives
// the whole account ~220 requests/day for that task once everything above it is
// exhausted, which is what `interactive` used to do with gemini-2.5-flash.
const RPD = {
  'gemma-4-31b-it': 14400,
  'gemma-4-26b-a4b-it': 14400,
  'gemini-3.1-flash-lite': 500,
  'gemini-3.5-flash-lite': 500,
  'gemini-2.5-flash': 20,
  'gemini-3.5-flash': 20,
  'gemini-3.6-flash': 20,
  'gemini-3-flash-preview': 20,
};

describe('model chains', () => {
  it('never floors a text chain on a 20-RPD model', () => {
    for (const [name, chain] of Object.entries(MODEL_CHAINS)) {
      if (name === 'vision') continue; // Gemma has no image input; see below
      const floor = chain[chain.length - 1];
      expect(`${name}:${floor}`).toBe(`${name}:${floor}`);
      expect(RPD[floor]).toBeGreaterThanOrEqual(500);
      expect(DEEP_POOL.test(floor)).toBe(true);
    }
  });

  it('keeps Gemma out of the vision chain entirely', () => {
    expect(MODEL_CHAINS.vision.some((m) => m.startsWith('gemma-'))).toBe(false);
  });

  it('routes the highest-volume tasks to the deepest pool first', () => {
    // tutorChat is the busiest call in the app.
    expect(TASK_TO_CHAIN.tutorChat).toBe('interactive');
    expect(RPD[MODEL_CHAINS.interactive[0]]).toBeGreaterThanOrEqual(500);
    expect(TASK_TO_CHAIN.practiceTest).toBe('bulk');
    // Gemma is the floor, not the lead — see "never lets Gemma LEAD a chain"
    // in aiRouterCapacity.test.js for the measurements behind that.
    expect(MODEL_CHAINS.bulk[0].startsWith('gemma-')).toBe(false);
    expect(MODEL_CHAINS.bulk[MODEL_CHAINS.bulk.length - 1].startsWith('gemma-')).toBe(true);
  });

  it('gives every chain somewhere to go when the lead model 503s', () => {
    for (const chain of Object.values(MODEL_CHAINS)) {
      expect(chain.length).toBeGreaterThanOrEqual(3);
      expect(new Set(chain).size).toBe(chain.length);
    }
  });
});

describe('chainFor', () => {
  it('puts an explicitly requested model first without dropping the rest', () => {
    const c = chainFor('tutorChat', 'gemini-3.5-flash');
    expect(c[0]).toBe('gemini-3.5-flash');
    expect(c).toContain('gemma-4-31b-it');
    expect(new Set(c).size).toBe(c.length);
  });

  it('strips the models/ and google/ prefixes', () => {
    expect(chainFor('tutorChat', 'models/gemini-3.5-flash')[0]).toBe('gemini-3.5-flash');
  });

  it('ignores a non-Google model instead of injecting a bad id', () => {
    expect(chainFor('tutorChat', 'claude-sonnet-4', 0, { rand: () => 1 })[0]).toBe('gemini-3.1-flash-lite');
  });

  it('ignores a requested model the chain would never use', () => {
    // The picker's generic "Gemini Flash" entry is gemini-2.0-flash, whose
    // free-tier quota is 0/0. Leading with it was a guaranteed 429 per key.
    const c = chainFor('tutorChat', 'gemini-2.0-flash', 0, { rand: () => 1 });
    expect(c).not.toContain('gemini-2.0-flash');
    expect(c[0]).toBe('gemini-3.1-flash-lite');
  });

  it('splits the two equal flash-lite pools instead of always leading with 3.1', () => {
    expect(chainFor('tutorChat', null, 0, { rand: () => 0.9 })[0]).toBe('gemini-3.1-flash-lite');
    expect(chainFor('tutorChat', null, 0, { rand: () => 0.1 })[0]).toBe('gemini-3.5-flash-lite');
    const heads = new Set(Array.from({ length: 50 }, () => chainFor('practiceTest')[0]));
    expect(heads).toEqual(new Set(['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite']));
  });

  it('moves an avoided model off the head (MCQ verification)', () => {
    const c = chainFor('verifyMcq', null, 0, { avoid: 'gemini-3.1-flash-lite', rand: () => 1 });
    expect(c.slice(0, 2)).toEqual(['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite']);
    const d = chainFor('verifyMcq', null, 0, { avoid: 'gemini-3.5-flash-lite', rand: () => 0 });
    expect(d[0]).toBe('gemini-3.1-flash-lite');
  });

  it('drops Gemma when the prompt exceeds its 16K TPM ceiling', () => {
    // Gemma would return 429 on this, so trying it just burns a round trip.
    const c = chainFor('practiceTest', null, GEMMA_MAX_CHARS + 1);
    expect(c.some((m) => m.startsWith('gemma-'))).toBe(false);
    expect(c.length).toBeGreaterThan(0);
  });

  it('keeps Gemma reachable as the tail for normal-sized prompts', () => {
    // Once flash-lite is exhausted, a 2-in-3 chance beats no answer at all.
    const chain = chainFor('summarize', null, 5000);
    expect(chain[0].startsWith('gemma-')).toBe(false);
    expect(chain.some((m) => m.startsWith('gemma-'))).toBe(true);
  });

  it('falls back to interactive for an unknown task', () => {
    expect(chainFor('somethingNew', null, 0, { rand: () => 1 })).toEqual(MODEL_CHAINS.interactive);
  });
});
