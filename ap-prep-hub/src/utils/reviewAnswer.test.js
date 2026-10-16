import { sameAnswer, shownAnswer } from './reviewAnswer';


describe('repeated-mistake check', () => {
  it('matches the saved answer text, a lettered copy, or a bare letter', () => {
    expect(sameAnswer('Glycolysis in the cytosol.', 'Glycolysis in the cytosol.', 0)).toBe(true);
    expect(sameAnswer('A) Glycolysis in the cytosol.', 'Glycolysis in the cytosol.', 0)).toBe(true);
    expect(sameAnswer('A', 'anything', 0)).toBe(true);
    expect(sameAnswer('Glycolysis in the cytosol.', 'Fermentation.', 3)).toBe(false);
  });
  it('shows the answer without its letter or trailing full stop', () => {
    expect(shownAnswer('A) Glycolysis in the cytosol.')).toBe('Glycolysis in the cytosol');
  });
});
