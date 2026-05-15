// Lock-in tests for the LaTeX preprocessor.
// Each describe block names a real-world failure mode the AI has produced
// (or could produce). If KaTeX breaks again on one of these patterns, a
// failing test should pin down which preprocessor stage regressed.

import { preprocessContent } from './latexPreprocess';

describe('preprocessContent — LaTeX failure modes', () => {
  describe('bare LaTeX without delimiters', () => {
    it('wraps bare \\theta in $...$', () => {
      const out = preprocessContent('When \\theta = 0, the answer is zero.');
      expect(out).toContain('$\\theta$');
    });

    it('wraps bare \\Rightarrow', () => {
      const out = preprocessContent('f(0) = 1 \\Rightarrow correct.');
      expect(out).toContain('$\\Rightarrow$');
    });

    it('wraps \\frac{a}{b}', () => {
      const out = preprocessContent('Simplify \\frac{1}{2} please.');
      expect(out).toContain('$\\frac{1}{2}$');
    });
  });

  describe('nested dollars inside math expressions', () => {
    it('strips inner $ when wrapping a brace expression', () => {
      // Reproduces the Taylor Series Sentry case where the AI emitted
      // \sum_{n=0}^{$\infty$} and the wrap created a nested-$ mess.
      const out = preprocessContent('e^x = \\sum_{n=0}^{$\\infty$} \\frac{x^n}{n!}');
      // \infty should still be there
      expect(out).toContain('\\infty');
      // But not as a $\infty$ — the inner $ markers must be stripped from
      // the wrapped \frac expression
      expect(out).not.toContain('{$\\infty$}');
    });
  });

  describe('alternate delimiter styles', () => {
    it('converts \\(...\\) to $...$', () => {
      const out = preprocessContent('Solve \\(x^2 + 1\\) for x.');
      expect(out).toContain('$x^2 + 1$');
      expect(out).not.toContain('\\(');
    });

    it('converts \\[...\\] to $$...$$', () => {
      const out = preprocessContent('\\[\\int_0^1 x\\,dx\\]');
      expect(out).toContain('$$\\int_0^1 x\\,dx$$');
      expect(out).not.toContain('\\[');
    });

    it('handles multiline display math \\[...\\]', () => {
      const input = '\\[\n\\frac{a}{b} + c\n\\]';
      const out = preprocessContent(input);
      expect(out).toContain('$$\\frac{a}{b} + c$$');
    });
  });

  describe('code-fenced math', () => {
    it('unwraps ```latex fenced blocks', () => {
      const input = 'Here:\n```latex\n\\frac{a}{b}\n```\nDone.';
      const out = preprocessContent(input);
      expect(out).toContain('$$\\frac{a}{b}$$');
      expect(out).not.toMatch(/```latex/i);
    });

    it('unwraps ```math fenced blocks', () => {
      const input = '```math\nE = mc^2\n```';
      const out = preprocessContent(input);
      expect(out).toContain('$$E = mc^2$$');
    });

    it('leaves regular code fences alone', () => {
      const input = '```python\nx = 5\n```';
      const out = preprocessContent(input);
      expect(out).toContain('```python');
      expect(out).toContain('x = 5');
    });
  });

  describe('control characters', () => {
    it('strips form-feed bytes (0x0C)', () => {
      const input = 'The answer is \x0c5\x0c.';
      const out = preprocessContent(input);
      expect(out).toBe('The answer is 5.');
    });

    it('strips other C0 control chars but keeps \\n and \\t', () => {
      const input = 'a\x00b\x07c\nd\te';
      const out = preprocessContent(input);
      expect(out).toBe('abc\nd\te');
    });
  });

  describe('unbalanced dollars', () => {
    it('closes a paragraph that opens but never closes $', () => {
      const out = preprocessContent('The formula is $\\frac{a}{b without a close.');
      // The processor must end with a closing $ for the dangling expression
      expect(out.trim().endsWith('$')).toBe(true);
    });

    it('leaves balanced $ alone', () => {
      const out = preprocessContent('The formula $x+1$ is balanced.');
      // Count non-escaped $ — should still be exactly 2
      const count = (out.match(/(?<!\\)\$/g) || []).length;
      expect(count).toBe(2);
    });

    it('does not over-balance when $$ display math is present', () => {
      const out = preprocessContent('Display: $$\\int_0^1 x\\,dx$$ and that is all.');
      expect(out).toContain('$$\\int_0^1 x\\,dx$$');
    });
  });

  describe('single-dollar nested case (live AI emission)', () => {
    it('flattens $A$\\cmd$B$ four-dollar nesting into one block', () => {
      // Real AI emission from Calc BC Maclaurin series prompt.
      const input = '$e^x $\\approx$ 1 + x + \\frac{x^2}{2} + \\frac{x^3}{6}$';
      const out = preprocessContent(input);
      // Should produce a single balanced $...$ pair with \approx inline
      const dollarCount = (out.match(/(?<!\\)\$/g) || []).length;
      expect(dollarCount).toBe(2);
      expect(out).toContain('\\approx');
      // The expression should still have the fraction parts
      expect(out).toContain('\\frac{x^2}{2}');
    });

    it('handles multiple nested commands in one line', () => {
      const input = '$a $\\alpha$ b $\\beta$ c$';
      const out = preprocessContent(input);
      const dollarCount = (out.match(/(?<!\\)\$/g) || []).length;
      expect(dollarCount).toBe(2);
      expect(out).toContain('\\alpha');
      expect(out).toContain('\\beta');
    });
  });

  describe('chemistry MCQ regression', () => {
    it('leaves already-wrapped $\\text{CH}_3$ alone', () => {
      // After JSONParser repairs lone backslashes, the choice string is
      // $\text{CH}_3$. Preprocessing should not double-wrap it.
      const out = preprocessContent('$\\text{CH}_3\\text{OH}$');
      expect(out).toBe('$\\text{CH}_3\\text{OH}$');
    });
  });

  describe('null/empty/non-string input', () => {
    it('handles null', () => {
      expect(preprocessContent(null)).toBe('');
    });
    it('handles undefined', () => {
      expect(preprocessContent(undefined)).toBe('');
    });
    it('handles empty string', () => {
      expect(preprocessContent('')).toBe('');
    });
    it('handles number', () => {
      expect(preprocessContent(42)).toBe('');
    });
  });

  describe('idempotence', () => {
    it('running twice produces the same result as once (no double-wrap)', () => {
      const input = 'Simplify \\frac{1}{2} and \\(x^2\\) please.';
      const once = preprocessContent(input);
      const twice = preprocessContent(once);
      expect(twice).toBe(once);
    });
  });
});
