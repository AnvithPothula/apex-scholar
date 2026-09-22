/**
 * The taxonomy is the contract between the tagger script and anything that ever
 * reads a tag. Two ways it silently breaks: a tag gets renamed on one side only,
 * or `confused_concepts` quietly becomes the catch-all that swallows everything
 * (measured at 42.8% on a 60-item sample — legitimate there, because 76 of its
 * 77 concept strings were distinct, but worth a tripwire).
 */
import { MISCONCEPTIONS, TAGS, isTag, ruleTags } from './misconceptions';

describe('taxonomy', () => {
  it('is closed and self-consistent', () => {
    expect(TAGS.length).toBe(10);
    for (const t of TAGS) {
      expect(isTag(t)).toBe(true);
      expect(t).toMatch(/^[a-z][a-z_]+$/);            // stable as a Firestore value
      expect(MISCONCEPTIONS[t].length).toBeGreaterThan(20); // a definition, not a label
    }
    expect(isTag('made_up')).toBe(false);
    expect(isTag('constructor')).toBe(false);          // prototype keys are not tags
  });

  it('keeps the escape hatch that stops invented misconceptions', () => {
    // Without this the model labels filler distractors with a plausible-sounding
    // error and the tag budget fills with fiction.
    expect(isTag('not_a_misconception')).toBe(true);
  });
});

describe('ruleTags — the scoring instrument, not the tagger', () => {
  it('reads a mechanism when the explanation states one', () => {
    expect(ruleTags('This is the negative of the tangent slope, so the sign is wrong.')).toContain('sign_or_direction');
    expect(ruleTags('This result ignores the product rule components entirely.')).toEqual(
      expect.arrayContaining(['omitted_step', 'wrong_rule'])
    );
  });

  it('stays silent on boilerplate rather than guessing', () => {
    // 16.7% of the bank's distractor rationales are this short. A tag invented
    // from "Calculated incorrectly." is noise wearing a label.
    for (const s of ['Calculated incorrectly.', 'Incorrect exponent.', '', null, undefined]) {
      expect(ruleTags(s)).toEqual([]);
    }
  });

  it('only ever emits tags the taxonomy defines', () => {
    const samples = [
      'This ignores the stoichiometric coefficients of the balanced equation.',
      'The student confused the definition of a Type I error with a Type II error.',
      'This is the reciprocal of the actual slope of the tangent line.',
      'An incorrect z-score calculation produces this particular value here.',
    ];
    for (const s of samples) for (const t of ruleTags(s)) expect(isTag(t)).toBe(true);
  });
});
