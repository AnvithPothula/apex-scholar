import { scoreCalculatorTitle, scoreCalculatorDescription, canonicalFor, aliasesFor } from './pageMeta';
import { MODELLED_SUBJECTS } from '../constants/apScoreModels';

describe('scoreCalculatorTitle', () => {
  it('leads with the short form students actually search', () => {
    // "ap bio score calculator" gets searched far more than "AP Biology…",
    // and the short form appeared nowhere on the page.
    expect(scoreCalculatorTitle('AP Biology')).toBe('AP Bio Score Calculator — Apex Scholar');
    expect(scoreCalculatorTitle('AP United States History')).toBe('APUSH Score Calculator — Apex Scholar');
  });

  it('falls back to the full name when there is no short form', () => {
    expect(scoreCalculatorTitle('AP Art History')).toBe('AP Art History Score Calculator — Apex Scholar');
  });

  it('stays short enough not to be truncated in results', () => {
    for (const s of ['AP Biology', 'AP Environmental Science', 'AP United States Government and Politics']) {
      expect(scoreCalculatorTitle(s).length).toBeLessThanOrEqual(65);
    }
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
  // The first alias becomes the title. An alias keyed off a subject name that
  // no model actually uses is dead weight that silently does nothing — which is
  // how "AP US History" shipped titled "AP US History" instead of "APUSH".
  it('keeps every title short enough to survive a search result', () => {
    const long = MODELLED_SUBJECTS
      .map((s) => scoreCalculatorTitle(s))
      .filter((t) => t.length > 65);
    expect(long).toEqual([]);
  });

  it('gives the heavily-searched subjects their short form', () => {
    expect(scoreCalculatorTitle('AP US History')).toMatch(/^APUSH /);
    expect(scoreCalculatorTitle('AP European History')).toMatch(/^AP Euro /);
    expect(scoreCalculatorTitle('AP Environmental Science')).toMatch(/^APES /);
    expect(scoreCalculatorTitle('AP English Language and Composition')).toMatch(/^AP Lang /);
  });

  it('mentions the subject and its aliases in the description', () => {
    const d = scoreCalculatorDescription('AP US History');
    expect(d).toContain('AP US History');
    expect(d).toContain('APUSH');
  });
});
