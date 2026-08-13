import { parseScoreSpec } from './InlineScoreCalculator';

describe('parseScoreSpec', () => {
  it('reads a well-formed spec and clamps to the section maxima', () => {
    const p = parseScoreSpec('{"subject":"AP Biology","mcq":50,"frq":30}');
    expect(p.model.label).toBe('AP Biology');
    expect(p.raws).toEqual({ mcq: 50, frq: 30 });
  });

  it('clamps out-of-range values rather than rendering an impossible score', () => {
    // The tutor is an LLM; it will occasionally emit 90 for a 60-point section.
    const p = parseScoreSpec('{"subject":"AP Biology","mcq":900,"frq":-5}');
    expect(p.raws).toEqual({ mcq: 60, frq: 0 });
  });

  it('resolves subject aliases the rest of the app uses', () => {
    expect(parseScoreSpec('{"subject":"AP U.S. History"}').model.compositeMax).toBe(130);
  });

  it('returns null for malformed JSON instead of a wrong widget', () => {
    expect(parseScoreSpec('not json')).toBeNull();
    expect(parseScoreSpec('')).toBeNull();
    expect(parseScoreSpec('[1,2,3]')).toBeNull();
    expect(parseScoreSpec('{"mcq":50}')).toBeNull();
  });

  it('refuses subjects with no researched model', () => {
    // Pre-filling a generic 50/50 shape would invent section structure the
    // student would reasonably believe.
    expect(parseScoreSpec('{"subject":"AP Basket Weaving","mcq":10}')).toBeNull();
  });

  it('ignores section ids that are not numbers', () => {
    const p = parseScoreSpec('{"subject":"AP Biology","mcq":"lots","frq":12}');
    expect(p.raws).toEqual({ frq: 12 });
  });
});
