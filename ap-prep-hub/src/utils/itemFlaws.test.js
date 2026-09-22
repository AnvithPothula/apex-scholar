/**
 * The detectors are regexes over student-facing content, which is the exact
 * shape of code that silently rots. Two specific regressions are pinned here
 * because both already happened once:
 *
 *   - an over-eager normaliser reported 21 duplicate-choice items in a
 *     200-item sample, every inspected one a sign distinction ("2" vs "-2");
 *   - `absolute_terms` fired on "all real numbers", which is a correct maths
 *     answer, not a test-wise cue.
 */
import { detectFlaws, scoreItem, TIER, counted, UNACCEPTABLE_AT } from './itemFlaws';

const item = (over = {}) => ({
  question: 'What is 2 + 2?',
  choices: ['3', '4', '5', '6'],
  stored_answer: 1,
  explanations: ['too low', 'right', 'too high', 'way too high'],
  ...over,
});

describe('itemFlaws', () => {
  it('finds nothing wrong with a clean item', () => {
    expect(detectFlaws(item())).toEqual([]);
  });

  it('does not confuse a sign for a duplicate', () => {
    // The bug this replaces collapsed every non-alphanumeric character.
    // Asserted on the specific flaw, not on an empty array: 2, -2, 4, -4 is
    // genuinely unsorted, which is a different (correct) finding.
    expect(detectFlaws(item({ choices: ['2', '-2', '4', '-4'] }))).not.toContain('duplicate_choices');
    expect(detectFlaws(item({ choices: ['-4', '-2', '2', '4'] }))).toEqual([]);
    expect(detectFlaws(item({
      choices: ['(sqrt(6) + sqrt(2))/4', '(sqrt(6) - sqrt(2))/4', '(sqrt(2) - sqrt(6))/4', '0'],
      stored_answer: 0,
    }))).toEqual([]);
    expect(detectFlaws(item({
      choices: ['as x -> infinity, f(x) -> infinity', 'as x -> -infinity, f(x) -> infinity', 'a', 'b'],
      stored_answer: 0,
    }))).not.toContain('duplicate_choices');
  });

  it('still catches a real duplicate, ignoring only whitespace and trailing punctuation', () => {
    expect(detectFlaws(item({ choices: ['4', 'four', 'four.', '5'] }))).toContain('duplicate_choices');
    expect(detectFlaws(item({ choices: ['4', 'comter', ' comter ', '5'] }))).toContain('duplicate_choices');
  });

  it('does not confuse case for a duplicate, because case is semantic here', () => {
    // Music Theory: lowercase ii is the minor supertonic, uppercase II major.
    expect(detectFlaws(item({ choices: ['ii', 'ii6', 'ii6/4', 'II6'], stored_answer: 1 })))
      .not.toContain('duplicate_choices');
    // Physics: r is the distance from the axis, R the radius of the wire.
    expect(detectFlaws(item({
      choices: ['mu_0 I r / (2 pi R^2)', 'mu_0 I / (2 pi r)', 'mu_0 I R / (2 pi r^2)', 'zero'],
      stored_answer: 1,
    }))).not.toContain('duplicate_choices');
  });

  it('treats legitimately absolute maths answers as clean', () => {
    for (const c of ['all real numbers', 'always increasing', 'never negative', 'for all x > 0']) {
      expect(detectFlaws(item({ choices: [c, 'a', 'b', 'c'] }))).not.toContain('absolute_terms');
    }
    expect(detectFlaws(item({ choices: ['it always works', 'a', 'b', 'c'] }))).toContain('absolute_terms');
  });

  it('flags the longest option only when the margin is a real cue', () => {
    const cue = item({
      choices: ['short', 'a substantially longer and more carefully qualified statement', 'brief', 'terse'],
      stored_answer: 1,
    });
    expect(detectFlaws(cue)).toContain('longest_option_correct');
    // One character longer is not a cue any student could read.
    expect(detectFlaws(item({ choices: ['abcd', 'abcdz', 'abce', 'abcf'], stored_answer: 1 })))
      .not.toContain('longest_option_correct');
  });

  it('catches the cueing and structural flaws', () => {
    expect(detectFlaws(item({ choices: ['3', '4', '5', 'all of the above'] }))).toContain('all_of_the_above');
    expect(detectFlaws(item({ choices: ['3', '4', '5', 'None of these'] }))).toContain('none_of_the_above');
    expect(detectFlaws(item({ question: 'All of these are true EXCEPT:' }))).toContain('negative_stem');
    expect(detectFlaws(item({ question: 'The capital of France is ___.' }))).toContain('fill_in_the_blank');
    expect(detectFlaws(item({ choices: ['10', '5', '20', '30'], stored_answer: 0 })))
      .toContain('unordered_numeric_options');
    expect(detectFlaws(item({ choices: ['1', '2', '3', '4'] }))).not.toContain('unordered_numeric_options');
    expect(detectFlaws(item({ choices: ['True', 'False', 'true', 'false'] }))).toContain('true_false_options');
    expect(detectFlaws(item({ choices: ['I and II', 'a', 'b', 'c'], stored_answer: 0 }))).toContain('k_type');
  });

  it('catches a broken key and broken explanations', () => {
    expect(detectFlaws(item({ stored_answer: 7 }))).toContain('key_out_of_range');
    expect(detectFlaws(item({ explanations: ['a', 'b'] }))).toContain('malformed_explanations');
    expect(detectFlaws(item({ explanations: ['a', '', 'c', 'd'] }))).toContain('malformed_explanations');
    expect(detectFlaws(item({ choices: ['3', '  ', '5', '6'] }))).toContain('blank_choice');
  });

  it('never lets an advisory flaw alone make an item "unacceptable"', () => {
    // Tarrant's 2+ threshold is a real claim about item quality. A detector the
    // literature scores at F1 0.00-0.71 must not be able to trip it.
    const advisory = Object.keys(TIER).filter((f) => !counted(f));
    expect(advisory).toEqual(['absolute_terms']);
    const onlyAdvisory = item({ choices: ['it always works', 'it never works', 'a', 'b'], stored_answer: 0 });
    const scored = scoreItem(onlyAdvisory);
    expect(scored.flaws).toContain('absolute_terms');
    expect(scored.unacceptable).toBe(false);
  });

  it('marks an item unacceptable at two counted flaws', () => {
    const two = item({
      question: 'Which of the following is NOT true?',
      choices: ['3', '4', '5', 'none of the above'],
    });
    expect(detectFlaws(two).filter(counted).length).toBeGreaterThanOrEqual(UNACCEPTABLE_AT);
    expect(scoreItem(two).unacceptable).toBe(true);
  });

  it('survives a malformed item without throwing', () => {
    for (const junk of [null, undefined, {}, { choices: null }, { choices: [], explanations: null }]) {
      expect(() => detectFlaws(junk)).not.toThrow();
    }
  });
});
