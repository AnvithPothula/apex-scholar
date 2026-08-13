/**
 * The diagnostic told a student who scored 13% "Great job! No major weak areas
 * identified", because no single topic in a 15-question test cleared the
 * minimum sample size, so the weaknesses array was empty and the empty-state
 * copy fired. These lock in the honest behaviour.
 */

/** Mirrors Diagnostics.js: topics where the student got nothing right. */
const missedTopicsFrom = (topicScores) =>
  Object.entries(topicScores)
    .filter(([, sc]) => sc.correct === 0 && sc.total > 0)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([concept, sc]) => `${concept} (0 of ${sc.total})`)
    .slice(0, 5);

describe('diagnostic result analysis', () => {
  const lowScore = {
    'Network Security': { correct: 0, total: 3 },
    'Security Fundamentals': { correct: 0, total: 2 },
    'Cryptography': { correct: 1, total: 2 },
    'Network Protocols': { correct: 1, total: 1 },
    'Malware': { correct: 0, total: 1 },
  };

  it('surfaces the topics a struggling student missed entirely', () => {
    const m = missedTopicsFrom(lowScore);
    expect(m).toContain('Network Security (0 of 3)');
    expect(m).toContain('Security Fundamentals (0 of 2)');
    expect(m).toContain('Malware (0 of 1)');
  });

  it('orders them by how much evidence there is', () => {
    // 0/3 is a stronger signal than 0/1 and should be named first.
    expect(missedTopicsFrom(lowScore)[0]).toBe('Network Security (0 of 3)');
  });

  it('never lists a topic the student scored on', () => {
    const m = missedTopicsFrom(lowScore);
    expect(m.some((x) => x.startsWith('Cryptography'))).toBe(false);
    expect(m.some((x) => x.startsWith('Network Protocols'))).toBe(false);
  });

  it('is empty when the student missed nothing outright', () => {
    expect(missedTopicsFrom({ A: { correct: 2, total: 2 }, B: { correct: 1, total: 2 } }))
      .toEqual([]);
  });
});

describe('diagnostic evidence bar', () => {
  const { levelFor } = require('../services/mastery');

  it('can actually reach a verdict at the diagnostic bar of 3', () => {
    // The whole bug: at MIN_SAMPLES=5 a 3-question concept was always
    // 'insufficient', so no diagnostic ever produced a strength or a weakness.
    expect(levelFor(100, 3)).toBe('insufficient');
    expect(levelFor(100, 3, 3)).toBe('green');
    expect(levelFor(0, 3, 3)).toBe('red');
  });

  it('still refuses a verdict on a single question', () => {
    expect(levelFor(100, 1, 3)).toBe('insufficient');
  });
});

describe('missed topic list', () => {
  it('caps at 5 so a 15-question wipeout is not a wall of noise', () => {
    const scores = {};
    for (let i = 0; i < 12; i++) scores[`Topic ${i}`] = { correct: 0, total: 1 };
    expect(missedTopicsFrom(scores)).toHaveLength(5);
  });
});

describe('diagnostic concept spread', () => {
  // Mirrors geminiService.generateDiagnosticQuestions. Without this constraint
  // the model emits one concept per question, so every topic is 1-of-1 and the
  // evidence bar can never be cleared.
  const spread = (count) => {
    const conceptCount = Math.max(2, Math.round(count / 3));
    return { conceptCount, perConcept: Math.round(count / conceptCount) };
  };

  it('gives a 15-question diagnostic 5 concepts of 3', () => {
    expect(spread(15)).toEqual({ conceptCount: 5, perConcept: 3 });
  });

  it('clears the diagnostic evidence bar of 3', () => {
    const { levelFor } = require('../services/mastery');
    expect(levelFor(0, spread(15).perConcept, 3)).not.toBe('insufficient');
  });

  it('never asks for fewer than 2 concepts on a short test', () => {
    expect(spread(3).conceptCount).toBe(2);
    expect(spread(1).conceptCount).toBe(2);
  });
});
