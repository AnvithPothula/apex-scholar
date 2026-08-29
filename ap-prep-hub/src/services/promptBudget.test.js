import { promptBudget, briefCurriculum } from './promptBudget';

const CURRICULUM = {
  name: 'AP Biology',
  units: [
    { name: 'Chemistry of Life', weight: '8-11%', topics: ['Water', 'Elements', 'Macromolecules', 'Nucleic acids', 'Enzymes'] },
    { name: 'Cell Structure and Function', weight: '10-13%', topics: ['Cell size', 'Organelles', 'Membranes'] },
  ],
};

describe('promptBudget', () => {
  it('sends everything on the opening turn', () => {
    const b = promptBudget({ turn: 1, message: 'hi' });
    expect(b).toEqual({ curriculum: 'full', scoringBrief: true, siteBrief: true });
  });

  it('drops the heavy blocks on an ordinary follow-up', () => {
    // This is the saving: a mid-thread "what about the light reactions?" no
    // longer resends every unit, the site brief and the exam curve.
    const b = promptBudget({ turn: 4, message: 'what about the light reactions' });
    expect(b.curriculum).toBe('brief');
    expect(b.scoringBrief).toBe(false);
    expect(b.siteBrief).toBe(false);
  });

  it('brings the scoring brief back when the student asks about scores', () => {
    for (const q of [
      'how many can I miss and still get a 4',
      'what raw score do I need',
      'how is the FRQ weighted',
      'what percentage is a 5',
    ]) {
      expect(promptBudget({ turn: 5, message: q }).scoringBrief).toBe(true);
    }
  });

  it('brings the site brief back when the student asks what to do next', () => {
    for (const q of [
      'what should I study next',
      'can I take a practice test',
      'any flashcards for this',
    ]) {
      expect(promptBudget({ turn: 5, message: q }).siteBrief).toBe(true);
    }
  });

  it('treats a missing or malformed turn as the first', () => {
    expect(promptBudget({ message: 'hi' }).curriculum).toBe('full');
    expect(promptBudget({ turn: NaN, message: 'hi' }).curriculum).toBe('full');
    expect(promptBudget().curriculum).toBe('full');
  });
});

describe('briefCurriculum', () => {
  it('keeps unit names so the tutor cannot invent units', () => {
    const out = briefCurriculum(CURRICULUM);
    expect(out).toContain('Chemistry of Life');
    expect(out).toContain('Cell Structure and Function');
  });

  it('drops the topics and weights, which is where the tokens were', () => {
    const out = briefCurriculum(CURRICULUM);
    expect(out).not.toContain('Macromolecules');
    expect(out).not.toContain('8-11%');
  });

  it('is substantially smaller than the full block', () => {
    const full = CURRICULUM.units
      .map((u, i) => `Unit ${i + 1}: ${u.name} (${u.weight}) — ${u.topics.join(', ')}`).join('\n');
    expect(briefCurriculum(CURRICULUM).length).toBeLessThan(full.length);
  });

  it('degrades safely with no curriculum', () => {
    expect(briefCurriculum(null)).toMatch(/AP-level curriculum/);
    expect(briefCurriculum({ name: 'AP Latin' })).toBe('CURRICULUM: AP Latin');
  });
});
