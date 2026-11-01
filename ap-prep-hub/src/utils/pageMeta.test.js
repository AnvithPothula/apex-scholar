import { scoreCalculatorTitle, scoreCalculatorDescription, canonicalFor, aliasesFor, examYear } from './pageMeta';
import { MODELLED_SUBJECTS } from '../constants/apScoreModels';

const OCT_2026 = new Date(2026, 9, 29);

describe('examYear', () => {
  it('is next May from August on, this May before', () => {
    expect(examYear(new Date(2026, 7, 1))).toBe(2027);
    expect(examYear(OCT_2026)).toBe(2027);
    expect(examYear(new Date(2027, 4, 10))).toBe(2027);
    expect(examYear(new Date(2027, 6, 31))).toBe(2027);
  });
});

describe('scoreCalculatorTitle', () => {
  it('uses the official course name and the exam year', () => {
    expect(scoreCalculatorTitle('AP Biology', OCT_2026)).toBe('AP Biology Score Calculator 2027 — Apex Scholar');
    expect(scoreCalculatorTitle('AP U.S. History', OCT_2026)).toBe('AP U.S. History Score Calculator 2027 — Apex Scholar');
  });

  it('drops the brand, not the name, when the name is long', () => {
    expect(scoreCalculatorTitle('AP Physics C: Electricity and Magnetism', OCT_2026)).toBe('AP Physics C: Electricity and Magnetism Score Calculator 2027');
  });

  it('has a sensible generic form for the index page', () => {
    expect(scoreCalculatorTitle(null, OCT_2026)).toBe('AP Score Calculator 2027 — Apex Scholar');
  });

  it('never runs past 65 characters', () => {
    MODELLED_SUBJECTS.forEach((s) => expect(scoreCalculatorTitle(s, OCT_2026).length).toBeLessThanOrEqual(65));
  });
});

describe('scoreCalculatorDescription', () => {
  it('names both the full subject and its aliases', () => {
    const d = scoreCalculatorDescription('AP Biology');
    expect(d).toContain('AP Biology');
    expect(d).toContain('AP Bio');
  });

  it('stays short enough to show in full, and names each subject once', () => {
    MODELLED_SUBJECTS.forEach((s) => expect(scoreCalculatorDescription(s, OCT_2026).length).toBeLessThanOrEqual(170));
    const d = scoreCalculatorDescription('AP Biology', OCT_2026);
    expect(d.split('AP Biology').length).toBe(2);
    expect(d).toContain('2027');
  });

  it('describes what the page does, not just what it is', () => {
    const d = scoreCalculatorDescription('AP Chemistry');
    expect(d).toMatch(/multiple-choice/);
    expect(d).toMatch(/1–5|out of 5/);
  });
});

describe('aliasesFor', () => {
  it('covers the abbreviations students type', () => {
    expect(aliasesFor('AP Environmental Science')).toContain('APES');
    expect(aliasesFor('AP English Literature and Composition')).toContain('AP Lit');
  });

  it('returns an empty list rather than undefined for unknown subjects', () => {
    expect(aliasesFor('AP Latin')).toEqual([]);
    expect(aliasesFor(undefined)).toEqual([]);
  });
});

describe('canonicalFor', () => {
  it('builds an absolute URL', () => {
    expect(canonicalFor('/ap-score-calculator/ap-biology'))
      .toBe('https://apex-scholar.com/ap-score-calculator/ap-biology');
  });

  it('strips query strings, hashes and trailing slashes', () => {
    // Otherwise ?from=test creates a duplicate URL competing with itself.
    expect(canonicalFor('/ap-score-calculator/ap-biology?from=test&mcq=40'))
      .toBe('https://apex-scholar.com/ap-score-calculator/ap-biology');
    expect(canonicalFor('/practice/')).toBe('https://apex-scholar.com/practice');
  });

  it('handles the root path', () => {
    expect(canonicalFor('/')).toBe('https://apex-scholar.com/');
  });
});

describe('titles for every modelled subject', () => {
  it('keeps every title short enough to survive a search result', () => {
    const long = MODELLED_SUBJECTS
      .map((s) => scoreCalculatorTitle(s))
      .filter((t) => t.length > 65);
    expect(long).toEqual([]);
  });

  it('keeps the nicknames students search in the description', () => {
    const d = scoreCalculatorDescription('AP U.S. History');
    expect(d).toContain('AP U.S. History');
    expect(d).toContain('APUSH');
  });

  it('has a nickname entry only under names a model actually uses', () => {
    const known = new Set(MODELLED_SUBJECTS);
    expect(['AP Biology', 'AP U.S. History', 'AP Physics 1: Algebra-Based'].every((s) => known.has(s) && aliasesFor(s).length)).toBe(true);
  });
});
