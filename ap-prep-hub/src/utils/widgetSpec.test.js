import { parseModelJson, parseGraphSpec, parseStepsSpec } from './widgetSpec';

describe('parseModelJson', () => {
  it('keeps single-backslash LaTeX that JSON would otherwise eat', () => {
    // "\frac" is a legal JSON escape (form feed) and "\theta" is a tab + "heta".
    const v = parseModelJson('{"body": "$\\frac{a}{b}$ and $\\theta$, line\\nbreak"}');
    expect(v.body).toBe('$\\frac{a}{b}$ and $\\theta$, line\nbreak');
  });

  it('leaves correctly doubled backslashes alone', () => {
    expect(parseModelJson('{"b": "$\\\\frac{1}{2}$"}').b).toBe('$\\frac{1}{2}$');
  });

  it('returns null for non-objects and garbage', () => {
    expect(parseModelJson('[1,2]')).toBeNull();
    expect(parseModelJson('')).toBeNull();
    expect(parseModelJson('not json at all')).toBeNull();
  });
});

describe('parseGraphSpec', () => {
  it('builds compiled curves and clamped params', () => {
    const g = parseGraphSpec(JSON.stringify({
      title: 'Sine', x: [-6.28, 6.28],
      curves: [{ expr: 'a*sin(b*x)', label: 'y' }],
      params: { a: { min: 0, max: 3, value: 9 }, b: { min: 0.5, max: 4, value: 1, step: 0.5 } },
    }));
    expect(g.params.map((p) => [p.name, p.value])).toEqual([['a', 3], ['b', 1]]);
    expect(g.curves[0].fn({ x: Math.PI / 2, a: 2, b: 1 })).toBeCloseTo(2);
    expect(g.yRange).toBeNull();
  });

  it('accepts a single top-level expr', () => {
    expect(parseGraphSpec('{"expr": "x^2"}').curves).toHaveLength(1);
  });

  it('rejects unsafe or broken specs outright', () => {
    expect(parseGraphSpec('{"curves": [{"expr": "alert(1)"}]}')).toBeNull();
    expect(parseGraphSpec('{"curves": [{"expr": "k*x"}]}')).toBeNull(); // k not declared
    expect(parseGraphSpec('{"curves": []}')).toBeNull();
    expect(parseGraphSpec('{"expr": "x", "params": {"x": {"min": 0, "max": 1}}}')).toBeNull();
    expect(parseGraphSpec('{"expr": "a*x", "params": {"a": {"min": 5, "max": 1}}}')).toBeNull();
  });
});

describe('parseStepsSpec', () => {
  it('normalises steps and keeps the answer', () => {
    const s = parseStepsSpec('{"title": "Chain rule", "steps": [{"title": "Identify", "body": "Let $u = 3x$."}, "Differentiate"], "answer": "$3\\cos(3x)$"}');
    expect(s.steps).toEqual([{ title: 'Identify', body: 'Let $u = 3x$.' }, { title: '', body: 'Differentiate' }]);
    expect(s.answer).toBe('$3\\cos(3x)$');
  });

  it('returns null without steps', () => {
    expect(parseStepsSpec('{"title": "x"}')).toBeNull();
    expect(parseStepsSpec('{"steps": []}')).toBeNull();
  });
});
