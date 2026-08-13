import { languageDirective } from './languageDirective';

describe('languageDirective', () => {
  it('tells a world-language tutor to explain in English', () => {
    // The AP Spanish tutor otherwise replies entirely in Spanish — the very
    // language the student is still learning.
    const d = languageDirective('AP Spanish Language and Culture');
    expect(d).toMatch(/ENGLISH by default/);
    expect(d).toMatch(/not reply entirely in Spanish/);
  });

  it('still requires the target language where it belongs', () => {
    const d = languageDirective('AP French Language and Culture');
    expect(d).toMatch(/example sentences/);
    expect(d).toMatch(/French/);
  });

  it('lets the student opt into immersion', () => {
    expect(languageDirective('AP German Language and Culture'))
      .toMatch(/unless the\s*\n?student writes to you in German or explicitly asks/);
  });

  it('covers Latin and Spanish Literature, which are analysed in English', () => {
    expect(languageDirective('AP Latin')).toMatch(/Latin/);
    expect(languageDirective('AP Spanish Literature and Culture')).toMatch(/Spanish/);
  });

  it('adds nothing for a non-language subject', () => {
    expect(languageDirective('AP Biology')).toBe('');
    expect(languageDirective('AP Calculus AB')).toBe('');
    expect(languageDirective(undefined)).toBe('');
  });
});
