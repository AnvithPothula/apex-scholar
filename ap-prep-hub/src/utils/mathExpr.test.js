import { compileExpression, isValidExpression } from './mathExpr';

const at = (expr, scope = {}, vars = ['x', ...Object.keys(scope).filter((k) => k !== 'x')]) =>
  compileExpression(expr, vars)(scope);

describe('compileExpression', () => {
  it('follows normal precedence, with ^ right-associative and -x^2 = -(x^2)', () => {
    expect(at('1 + 2 * 3')).toBe(7);
    expect(at('2^3^2')).toBe(512);
    expect(at('-x^2', { x: 3 })).toBe(-9);
    expect(at('(1+2)*3')).toBe(9);
    expect(at('2^-1')).toBe(0.5);
    expect(at('x**2', { x: 4 })).toBe(16);
  });

  it('supports the implicit multiplication models actually write', () => {
    expect(at('2x', { x: 5 })).toBe(10);
    expect(at('3(x+1)', { x: 1 })).toBe(6);
    expect(at('(x+1)(x-1)', { x: 3 })).toBe(8);
    expect(at('2pi')).toBeCloseTo(2 * Math.PI);
    expect(at('x(1-x)', { x: 0.25 })).toBeCloseTo(0.1875);
  });

  it('knows functions, constants and parameters', () => {
    expect(at('a*sin(b*x) + c', { x: Math.PI / 2, a: 2, b: 1, c: 1 })).toBeCloseTo(3);
    expect(at('ln(e)')).toBeCloseTo(1);
    expect(at('log(1000)')).toBeCloseTo(3);
    expect(at('sqrt(16) + abs(-2) + max(1, 5)')).toBe(11);
    expect(at('|x - 3|', { x: 1 })).toBe(2);
    expect(at('exp(-(x-m)^2/(2*s^2))/(s*sqrt(2*pi))', { x: 0, m: 0, s: 1 })).toBeCloseTo(0.39894, 4);
  });

  it('refuses anything outside the grammar instead of evaluating it', () => {
    for (const bad of ['alert(1)', 'x.constructor', 'window', 'x; y', '1 +', '(x', 'foo(x)', '"x"', 'y', '']) {
      expect(isValidExpression(bad, ['x'])).toBe(false);
    }
    expect(isValidExpression('x'.repeat(301), ['x'])).toBe(false);
  });
});
