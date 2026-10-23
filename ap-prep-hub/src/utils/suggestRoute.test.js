import { suggestRoute } from './suggestRoute';

describe('suggestRoute', () => {
  it('finds the page a typo meant', () => {
    expect(suggestRoute('/practice-test').path).toBe('/practice-tests');
    expect(suggestRoute('/flashcard').path).toBe('/flashcards');
    expect(suggestRoute('/AITutors').path).toBe('/ai-tutors');
    expect(suggestRoute('/ai-tutor/biology').path).toBe('/ai-tutors/biology');
    expect(suggestRoute('/ScoreCalculator').path).toBe('/ap-score-calculator');
    expect(suggestRoute('/ap-score-calc').path).toBe('/ap-score-calculator');
  });
  it('stays quiet when nothing is close', () => {
    expect(suggestRoute('/wp-admin')).toBeNull();
    expect(suggestRoute('/')).toBeNull();
  });
});
