import { computeComposite, compositeToScore, scoreFor, curveRows, pointsToNextScore, percentToApScore, scoringBriefFor, clampRawsForModel } from './apScore';
import { getScoreModel, AP_SCORE_MODELS } from '../constants/apScoreModels';

describe('computeComposite', () => {
  it('scales AP Biology FRQ raw 36 up to 60 composite points', () => {
    const model = getScoreModel('AP Biology');
    const { composite } = computeComposite(model, { mcq: 60, frq: 36 });
    expect(composite).toBe(120);
  });

  it('applies the Calculus AB 1.2x MCQ multiplier via weighting', () => {
    const model = getScoreModel('AP Calculus AB');
    // 45/45 MCQ -> 54 composite (i.e. 45 x 1.2), plus 54 FRQ = 108.
    expect(computeComposite(model, { mcq: 45, frq: 54 }).composite).toBe(108);
    expect(computeComposite(model, { mcq: 45, frq: 0 }).composite).toBe(54);
  });

  it('handles APUSH four-section weighting', () => {
    const model = getScoreModel('AP US History');
    expect(computeComposite(model, { mcq: 55, saq: 9, dbq: 7, leq: 6 }).composite).toBe(130);
    // MCQ alone is 40% of 130 = 52.
    expect(computeComposite(model, { mcq: 55 }).composite).toBe(52);
  });

  it('clamps raws above the section max and below zero', () => {
    const model = getScoreModel('AP Biology');
    expect(computeComposite(model, { mcq: 999, frq: 999 }).composite).toBe(120);
    expect(computeComposite(model, { mcq: -10, frq: -5 }).composite).toBe(0);
  });

  it('treats missing and non-numeric sections as zero', () => {
    const model = getScoreModel('AP Biology');
    expect(computeComposite(model, {}).composite).toBe(0);
    expect(computeComposite(model, { mcq: 'abc', frq: null }).composite).toBe(0);
  });
});

describe('compositeToScore', () => {
  it('maps each band for AP Biology', () => {
    const m = getScoreModel('AP Biology');
    expect(compositeToScore(m, 120)).toBe(5);
    expect(compositeToScore(m, 93)).toBe(5);
    expect(compositeToScore(m, 92)).toBe(4);
    expect(compositeToScore(m, 74)).toBe(4);
    expect(compositeToScore(m, 73)).toBe(3);
    expect(compositeToScore(m, 51)).toBe(3);
    expect(compositeToScore(m, 50)).toBe(2);
    expect(compositeToScore(m, 28)).toBe(2);
    expect(compositeToScore(m, 27)).toBe(1);
    expect(compositeToScore(m, 0)).toBe(1);
  });

  it('is subject-specific — the same percentage differs by exam (this is A6)', () => {
    const bio = getScoreModel('AP Biology');
    const bc = getScoreModel('AP Calculus BC');
    // 60% of the composite: a 4 in BC's generous curve, only a 3 in Biology.
    expect(compositeToScore(bc, 0.60 * bc.compositeMax)).toBe(4);
    expect(compositeToScore(bio, 0.60 * bio.compositeMax)).toBe(3);
  });
});

describe('scoreFor', () => {
  it('returns a full breakdown', () => {
    const r = scoreFor('AP Biology', { mcq: 45, frq: 24 });
    expect(r.score).toBeGreaterThanOrEqual(1);
    expect(r.score).toBeLessThanOrEqual(5);
    expect(r.compositeMax).toBe(120);
    expect(r.sections).toHaveLength(2);
    expect(r.isGeneric).toBe(false);
  });

  it('falls back to the generic model for an unmodelled subject, and says so', () => {
    const r = scoreFor('AP Basket Weaving', { mcq: 40, frq: 40 });
    expect(r.isGeneric).toBe(true);
    expect(r.model.note).toMatch(/generic/i);
  });
});

describe('pointsToNextScore', () => {
  it('reports the gap to the next band', () => {
    const m = getScoreModel('AP Biology');
    expect(pointsToNextScore(m, 70)).toEqual({ nextScore: 4, pointsNeeded: 4 });
  });

  it('returns null at a 5 — there is nothing above it', () => {
    expect(pointsToNextScore(getScoreModel('AP Biology'), 118)).toBeNull();
  });
});

describe('curveRows', () => {
  it('produces contiguous, non-overlapping bands covering 0..max', () => {
    Object.keys(AP_SCORE_MODELS).forEach((subject) => {
      const model = getScoreModel(subject);
      const rows = curveRows(model);
      expect(rows).toHaveLength(5);
      expect(rows[4].min).toBe(0);
      expect(rows[0].max).toBe(model.compositeMax);
      // Each band must start exactly one point above the one below it.
      for (let i = 0; i < rows.length - 1; i++) {
        expect(rows[i].min).toBe(rows[i + 1].max + 1);
      }
    });
  });
});

describe('percentToApScore (A6 back-compat shim)', () => {
  it('uses the subject model rather than one universal curve', () => {
    expect(percentToApScore(60, 'AP Calculus BC')).toBe(4);
    expect(percentToApScore(60, 'AP Biology')).toBe(3);
  });

  it('clamps out-of-range percentages', () => {
    expect(percentToApScore(150, 'AP Biology')).toBe(5);
    expect(percentToApScore(-20, 'AP Biology')).toBe(1);
  });
});

describe('model integrity', () => {
  it('every model has section weights summing to its compositeMax', () => {
    Object.entries(AP_SCORE_MODELS).forEach(([name, m]) => {
      const sum = m.sections.reduce((t, s) => t + s.weight, 0);
      expect({ name, sum }).toEqual({ name, sum: m.compositeMax });
    });
  });

  it('every model has strictly descending cutoffs inside its range', () => {
    Object.entries(AP_SCORE_MODELS).forEach(([name, m]) => {
      expect(m.cutoffs[5]).toBeGreaterThan(m.cutoffs[4]);
      expect(m.cutoffs[4]).toBeGreaterThan(m.cutoffs[3]);
      expect(m.cutoffs[3]).toBeGreaterThan(m.cutoffs[2]);
      expect({ name, ok: m.cutoffs[5] <= m.compositeMax }).toEqual({ name, ok: true });
    });
  });
});

describe('scoringBriefFor', () => {
  it('gives the tutor the same numbers the calculator shows', () => {
    const brief = scoringBriefFor('AP Biology');
    expect(brief).toContain('AP Biology');
    expect(brief).toContain('composite out of 120');
    expect(brief).toContain('Multiple choice: 60 raw points');
    expect(brief).toMatch(/Score 5: composite \d+/);
  });

  it('resolves aliases, so "AP U.S. History" is not treated as unmodelled', () => {
    expect(scoringBriefFor('AP U.S. History')).toContain('composite out of 130');
  });

  it('returns null for an unmodelled subject instead of describing the generic curve', () => {
    // Presenting the 50/50 fallback as "the AP Latin curve" would be a
    // fabrication the tutor would then state with confidence.
    expect(scoringBriefFor('AP Basket Weaving')).toBeNull();
  });

  it('tells the tutor the cutoffs are estimates', () => {
    expect(scoringBriefFor('AP Biology')).toMatch(/estimates/i);
  });
});

describe('model metadata consistency', () => {
  it('uses one name for cutoff confidence across every model', () => {
    // Batch 1 shipped `confidence`, batches 2-3 shipped `cutoffConfidence`, and
    // nothing read either — so the "these cutoffs are rougher" signal never
    // reached a student. One name, and the calculator now renders it.
    Object.entries(AP_SCORE_MODELS).forEach(([name, m]) => {
      expect(m.confidence).toBeUndefined();
      expect(['estimated', 'extrapolated']).toContain(m.cutoffConfidence);
      expect(typeof name).toBe('string');
    });
  });
});

describe('clampRawsForModel', () => {
  const bio = getScoreModel('AP Biology');

  it('clamps into range, so neither AI output nor a URL can fake a score', () => {
    expect(clampRawsForModel(bio, { mcq: 9999, frq: -50 })).toEqual({ mcq: 60, frq: 0 });
  });

  it('drops keys the model does not have and values that are not numbers', () => {
    expect(clampRawsForModel(bio, { mcq: 30, nonsense: 5, frq: 'lots' })).toEqual({ mcq: 30 });
  });

  it('rounds fractional raws — a section score is a whole number of points', () => {
    expect(clampRawsForModel(bio, { mcq: 40.4, frq: 12.6 })).toEqual({ mcq: 40, frq: 13 });
  });

  it('is safe on a missing or shapeless model', () => {
    expect(clampRawsForModel(null, { mcq: 5 })).toEqual({});
    expect(clampRawsForModel({}, { mcq: 5 })).toEqual({});
  });
});
