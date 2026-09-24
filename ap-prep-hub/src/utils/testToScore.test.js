import { estimateFromTest, calculatorUrl } from './testToScore';
import { getScoreModel, AP_SCORE_MODELS } from '../constants/apScoreModels';
import { scoreFor } from './apScore';

const mcq = (right, total) => Array.from({ length: total }, (_, i) => ({
  type: 'mcq', score: i < right ? 1 : 0, maxPoints: 1,
}));

describe('estimateFromTest', () => {
  it('scales a partial MCQ test to the full section and predicts the rest', () => {
    const e = estimateFromTest('AP Biology', mcq(9, 12)); // 75%
    expect(e.raws.mcq).toBe(45); // 75% of 60
    expect(e.raws.frq).toBe(Math.round(0.75 * 34)); // predicted at the same rate
    expect(e.measured).toEqual(['mcq']);
    expect(e.predicted).toEqual(['frq']);
  });

  it('matches what the calculator shows for the same sliders', () => {
    const e = estimateFromTest('AP Calculus AB', [...mcq(20, 30), { type: 'calculator-frq', score: 6, maxPoints: 9 }]);
    expect(e.score).toBe(scoreFor('AP Calculus AB', e.raws).score);
    expect(e.predicted).toEqual([]);
  });

  it('keeps history sections separate', () => {
    const e = estimateFromTest('AP US History', [
      ...mcq(55, 55),
      { type: 'dbq', score: 0, maxPoints: 7 },
    ]);
    expect(e.raws.mcq).toBe(55);
    expect(e.raws.dbq).toBe(0);
    // SAQ and LEQ weren't taken: predicted from the average of the parts that were.
    expect(e.predicted.sort()).toEqual(['leq', 'saq']);
    expect(e.raws.saq).toBe(Math.round(0.5 * 9));
  });

  it('ignores ungraded responses rather than scoring them zero', () => {
    const e = estimateFromTest('AP Biology', [...mcq(6, 6), { type: 'long-frq', score: 0, maxPoints: 0, ungraded: true }]);
    expect(e.raws.mcq).toBe(60);
    expect(e.predicted).toEqual(['frq']);
  });

  it('returns null when nothing was graded', () => {
    expect(estimateFromTest('AP Biology', [{ type: 'frq', ungraded: true, score: 0, maxPoints: 0 }])).toBeNull();
  });

  it('fills every section of every modelled exam', () => {
    for (const subject of Object.keys(AP_SCORE_MODELS)) {
      const e = estimateFromTest(subject, mcq(5, 10));
      const ids = getScoreModel(subject).sections.map((s) => s.id);
      expect(Object.keys(e.raws).sort()).toEqual([...ids].sort());
      expect(e.score).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('calculatorUrl', () => {
  it('carries the sliders and marks predicted sections', () => {
    const url = calculatorUrl('AP Biology', estimateFromTest('AP Biology', mcq(9, 12)));
    expect(url).toBe('/ap-score-calculator/ap-biology?from=test&mcq=45&frq=26&est=frq');
  });
});

describe('estimateForSavedTest', () => {
  const { estimateForSavedTest } = require('./testToScore');
  it('prefers the estimate stored with the test', () => {
    const stored = { apScore: 3, scoreEstimate: { raws: { mcq: 1 }, predicted: [] } };
    expect(estimateForSavedTest('AP Biology', stored).score).toBe(3);
  });
  it('re-derives old tests from their questions', () => {
    const results = { apScore: 5, questionResults: [{ questionId: 1, score: 0, maxPoints: 1 }] };
    const e = estimateForSavedTest('AP Biology', results, [{ id: 1, type: 'mcq' }]);
    expect(e.score).toBe(1); // 0/1 correct is a 1, whatever the old curve stored
  });
});
