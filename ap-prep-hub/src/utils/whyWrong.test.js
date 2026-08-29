import { buildWhyWrongPrompt, wasSkipped, missFromResult, looksLikeReasoningLeak } from './whyWrong';

const miss = {
  subject: 'AP Biology',
  unit: 'Unit 4',
  question: 'Which process moves water across a membrane?',
  userAnswer: 'B) Active transport',
  correctAnswer: 'C) Osmosis',
  explanation: 'Osmosis is passive and needs no ATP.',
};

describe('buildWhyWrongPrompt', () => {
  it('carries the question, both answers, and the subject into the prompt', () => {
    const p = buildWhyWrongPrompt(miss);
    expect(p).toContain('Which process moves water across a membrane?');
    expect(p).toContain('B) Active transport');
    expect(p).toContain('C) Osmosis');
    expect(p).toContain('AP Biology — Unit 4');
  });

  it('asks for the misconception, not the answer', () => {
    expect(buildWhyWrongPrompt(miss)).toContain('misconception');
  });

  it('frames a skipped question as skipped, not as wrong', () => {
    const p = buildWhyWrongPrompt({ ...miss, userAnswer: '   ' });
    expect(p).toContain('I skipped this question');
    expect(p).not.toContain('got this question wrong');
    // No "My answer:" line when there was no answer.
    expect(p).not.toContain('My answer:');
  });

  it('returns empty string with no question, so callers can hide the button', () => {
    expect(buildWhyWrongPrompt({ question: '  ' })).toBe('');
    expect(buildWhyWrongPrompt()).toBe('');
  });

  it('truncates a runaway question instead of sending it whole', () => {
    const p = buildWhyWrongPrompt({ ...miss, question: 'x'.repeat(5000) });
    expect(p).toContain('…');
    expect(p.length).toBeLessThan(3000);
  });

  it('omits optional lines it was not given', () => {
    const p = buildWhyWrongPrompt({ question: 'Why?', correctAnswer: 'A' });
    expect(p).not.toContain('Subject:');
    expect(p).not.toContain('Explanation I was given:');
    expect(p).toContain('Correct answer: A');
  });
});

describe('missFromResult', () => {
  const mcq = {
    id: 'q1',
    type: 'mcq',
    question: 'Which is passive?',
    options: ['Active transport', 'Endocytosis', 'Osmosis'],
    correctAnswer: 2,
  };

  it('turns MCQ indices into letter + option text, not bare numbers', () => {
    const m = missFromResult(mcq, { userAnswer: 0, correctAnswer: 2 }, 'AP Biology');
    expect(m.userAnswer).toBe('A) Active transport');
    expect(m.correctAnswer).toBe('C) Osmosis');
    expect(m.subject).toBe('AP Biology');
  });

  it('falls back to the question\'s correctAnswer when the result omits it', () => {
    const m = missFromResult(mcq, { userAnswer: 1 }, 'AP Biology');
    expect(m.correctAnswer).toBe('C) Osmosis');
  });

  it('keeps index 0 as a real answer rather than treating it as missing', () => {
    const m = missFromResult(mcq, { userAnswer: 0, correctAnswer: 0 });
    expect(m.userAnswer).toBe('A) Active transport');
    expect(wasSkipped(m.userAnswer)).toBe(false);
  });

  it('renders an unanswered MCQ as skipped', () => {
    const m = missFromResult(mcq, { userAnswer: null, correctAnswer: 2 });
    expect(m.userAnswer).toBe('');
    expect(buildWhyWrongPrompt(m)).toContain('I skipped this question');
  });

  it('ignores an out-of-range index instead of emitting garbage', () => {
    expect(missFromResult(mcq, { userAnswer: 99 }).userAnswer).toBe('');
  });

  it('passes FRQ prose through and uses AI feedback as the explanation', () => {
    const m = missFromResult(
      { type: 'frq', question: 'Explain osmosis.' },
      { userAnswer: 'Water moves.', feedback: 'Missing the gradient.' },
      'AP Biology'
    );
    expect(m.userAnswer).toBe('Water moves.');
    expect(m.explanation).toBe('Missing the gradient.');
    // FRQs have no single correct answer, so none is claimed.
    expect(m.correctAnswer).toBe('');
  });

  it('survives empty input', () => {
    expect(() => missFromResult()).not.toThrow();
    expect(buildWhyWrongPrompt(missFromResult())).toBe('');
  });
});

describe('wasSkipped', () => {
  it('treats blank, whitespace, null and undefined as skipped', () => {
    ['', '   ', null, undefined].forEach((v) => expect(wasSkipped(v)).toBe(true));
  });

  it('treats a real answer as answered, including index 0', () => {
    expect(wasSkipped('A')).toBe(false);
    expect(wasSkipped(0)).toBe(false);
  });
});

describe('looksLikeReasoningLeak', () => {
  it('catches the exact shape Gemma produces', () => {
    // Measured output, not invented: 0/3 clean on buildExplainAllPrompt.
    expect(looksLikeReasoningLeak(
      '* Subject: AP Biology. * Question: Which organelle is the primary site of ATP synthesis?'
    )).toBe(true);
    expect(looksLikeReasoningLeak(
      '* Role: Expert AP Biology teacher. * Task: Produce up to 5 questions.'
    )).toBe(true);
  });

  it('catches an opening that echoes a prompt field', () => {
    expect(looksLikeReasoningLeak('Subject: AP Biology\nThe answer is B.')).toBe(true);
    expect(looksLikeReasoningLeak('Goal: explain each choice')).toBe(true);
  });

  it('passes a real explanation through', () => {
    expect(looksLikeReasoningLeak(
      'A) Ribosome — incorrect. Ribosomes assemble proteins; they do not synthesise ATP.\nB) Mitochondrion — correct.'
    )).toBe(false);
  });

  it('does not trip on a legitimate bulleted answer', () => {
    // A single labelled bullet is normal prose, not a restated task.
    expect(looksLikeReasoningLeak(
      'The key idea is chemiosmosis.\n* Note: ATP synthase sits in the inner membrane.'
    )).toBe(false);
  });

  it('handles empty and junk input', () => {
    expect(looksLikeReasoningLeak('')).toBe(false);
    expect(looksLikeReasoningLeak(null)).toBe(false);
  });
});
