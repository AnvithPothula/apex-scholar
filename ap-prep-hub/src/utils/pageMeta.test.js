import { scoreCalculatorTitle, scoreCalculatorDescription, canonicalFor, aliasesFor } from './pageMeta';
import { MODELLED_SUBJECTS } from '../constants/apScoreModels';

describe('scoreCalculatorTitle', () => {
  it('uses the official course name, the one every page shows', () => {
    expect(scoreCalculatorTitle('AP Biology')).toBe('AP Biology Score Calculator — Apex Scholar');
    expect(scoreCalculatorTitle('AP U.S. History')).toBe('AP U.S. History Score Calculator — Apex Scholar');
  });

  it('drops the brand, not the name, when the name is long', () => {
    expect(scoreCalculatorTitle('AP Physics C: Electricity and Magnetism')).toBe('AP Physics C: Electricity and Magnetism Score Calculator');
  });

  it('has a sensible generic form for the index page', () => {
    expect(scoreCalculatorTitle(null)).toBe('AP Score Calculator — Apex Scholar');
  });
});

describe('scoreCalculatorDescription', () => {
  it('names both the full subject and its aliases', () => {
    const d = scoreCalculatorDescription('AP Biology');
    expect(d).toContain('AP Biology');
    expect(d).toContain('AP Bio');
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
