/**
 * LaTeX commands whose first letter is also a JSON escape character.
 *
 * The repair pipeline deliberately left \b \f \n \r \t \u alone because those
 * ARE valid JSON escapes. In question text they almost never are:
 *   "$S \to P$"      parsed to  TAB      + "o P"     -> a card read "S o P"
 *   "$\frac{a}{b}$"  parsed to  FORMFEED + "rac{a}{b}"
 *   "$\text{H}_2$"   parsed to  TAB      + "ext{H}_2"
 * \text and \frac are the two most common commands in chemistry and maths
 * questions, so this silently corrupted a large share of generated content.
 *
 * Mirrors the whitelist repair in services/ai/jsonParser.js.
 */
const LATEX_ESCAPE = /(?<!\\)\\(?=(?:text|theta|times|triangle|therefore|tfrac|tan|tau|to|frac|forall|floor|neq|nabla|nonumber|not|nu|beta|binom|bullet|bar|rightarrow|rangle|right|rho|upsilon|underline|uparrow|unit)\b)/g;

const repair = (raw) => raw.replace(LATEX_ESCAPE, '\\\\');
const parseAfterRepair = (raw) => JSON.parse(repair(raw)).q;

describe('LaTeX survives JSON parsing', () => {
  it.each([
    ['\\\\to', '$S \\to P$'],
    ['\\\\frac', '$\\frac{a}{b}$'],
    ['\\\\text', '$\\text{H}_2\\text{O}$'],
    ['\\\\theta', '$\\theta = 30$'],
    ['\\\\neq', '$a \\neq b$'],
    ['\\\\beta', '$\\beta$ decay'],
    ['\\\\rho', '$\\rho = m/V$'],
  ])('keeps %s intact', (_name, latex) => {
    const raw = `{"q":${JSON.stringify(latex).replace(/\\\\/g, '\\')}}`;
    expect(parseAfterRepair(raw)).toBe(latex);
  });

  it('leaves a genuine newline escape alone', () => {
    // The reason this is a whitelist and not a blanket rule.
    expect(JSON.parse(repair('{"q":"line1\\nline2"}')).q).toBe('line1\nline2');
    expect(JSON.parse(repair('{"q":"col1\\tcol2"}')).q).toBe('col1\tcol2');
  });

  it('does not double-escape an already-correct backslash', () => {
    const already = '{"q":"$\\\\frac{a}{b}$"}';
    expect(repair(already)).toBe(already);
    expect(JSON.parse(already).q).toBe('$\\frac{a}{b}$');
  });

  it('is wired into the parser, not just defined here', () => {
    const src = require('fs').readFileSync(
      require('path').resolve(__dirname, 'ai/jsonParser.js'), 'utf8');
    expect(src).toMatch(/text\|theta\|times/);
  });
});
