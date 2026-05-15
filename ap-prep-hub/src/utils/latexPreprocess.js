/**
 * LaTeX preprocessing pipeline for AI-emitted markdown.
 *
 * Each stage targets one observed failure mode. The transformations are
 * conservative — they only act on patterns the AI is known to produce
 * incorrectly. If a transformation could be ambiguous (e.g. is `$` a math
 * delimiter or a currency sign?), the surrounding context disambiguates.
 *
 * Order matters:
 *   1. stripControlChars      — remove invisible bytes that hide commands
 *   2. unfenceMathBlocks      — unwrap ```latex / ```math fences
 *   3. normalizeDelimiters    — convert \(...\) and \[...\] to $...$ / $$...$$
 *   4. BARE_LATEX_RE wrap     — wrap bare commands like \theta
 *   5. BRACE_CMD_RE wrap      — wrap \frac{a}{b} etc., strip inner $
 *   6. balanceDollars         — close unbalanced trailing $
 *
 * Imported by MarkdownRenderer.jsx (the React renderer) and tested
 * independently. Keeping it pure-JS keeps Jest happy without needing
 * a transformIgnorePatterns override for react-markdown's ESM build.
 */

// Common bare LaTeX commands that appear outside $...$ delimiters.
// We wrap them so remark-math / KaTeX can render properly.
//
// Lookbehinds:
//   (?<!\$)  — not already wrapped (avoid double-wrap)
//   (?<!\{)  — not inside a brace argument like \frac{\pi}{2} or
//              \sum_{n=0}^{\infty}; wrapping there would create nested
//              $...$ that KaTeX rejects.
const BARE_LATEX_RE = /(?<!\$)(?<!\{)\\(leftrightharpoons|rightleftharpoons|rightarrow|leftarrow|Rightarrow|Leftarrow|Leftrightarrow|leftrightarrow|uparrow|downarrow|int|iint|iiint|oint|sum|prod|lim|infty|partial|nabla|forall|exists|approx|neq|leq|geq|pm|mp|times|div|cdot|circ|bullet|alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega|Delta|Gamma|Theta|Lambda|Pi|Sigma|Phi|Psi|Omega)(?!\w)(?!\$)/g;

// LaTeX commands that take some kind of argument:
//   - Brace arguments: \frac{}{}, \mathbf{}, \sqrt{}
//   - Subscript/superscript: \sum_{...}, \int_a^b, \lim_{x \to 0}
//   - Parenthesized arg: \sin(x), \cos(\theta), \log(x)
// All of these need to be wrapped in $...$ if they appear bare in prose.
const BRACE_COMMANDS = [
  // True brace commands (require {})
  'frac','sqrt','overline','underline','hat','bar','vec','dot','ddot','tilde',
  'mathbb','mathcal','mathrm','mathbf','mathit','text','textbf','textit','boldsymbol',
  'left','right','begin','end','binom','underbrace','overbrace',
  // Operators with sub/super arguments — usually followed by _ or ^
  'sum','prod','int','iint','iiint','oint','lim','sup','inf','max','min',
  // Trig & log functions — usually followed by ( or a single arg
  'sin','cos','tan','cot','sec','csc','arcsin','arccos','arctan',
  'sinh','cosh','tanh','log','ln','exp',
];
// Lookahead allows `{`, `(`, `\`, `_`, or `^` — captures \sum_{...}, \cos(x),
// \frac{a}{b}, and \int_a^b uniformly.
const BRACE_CMD_RE = new RegExp(`\\\\(${BRACE_COMMANDS.join('|')})(?=[{(\\\\_^])`, 'g');

/**
 * Find the end of a LaTeX expression starting at `pos` in `text`.
 *
 * Walks balanced braces, parens, sub/super scripts, and chained commands.
 * After a fully balanced group closes, only keeps going if the immediate
 * next character is itself a LaTeX continuation (`{`, `(`, `^`, `_`, `\`).
 * The previous version was too greedy — after `\frac{1}{2}` it would slurp
 * the following English (" please.") into the wrapped expression because
 * letters/spaces match the continuation character class.
 */
function findLatexExprEnd(text, pos) {
  let i = pos;
  // Track whether we've consumed at least one balanced group — once we
  // have, we require an explicit LaTeX continuation to keep extending.
  let justClosedGroup = false;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '{') {
      let depth = 1;
      i++;
      while (i < text.length && depth > 0) {
        if (text[i] === '{') depth++;
        else if (text[i] === '}') depth--;
        if (text[i] === '\\') i++; // skip escaped chars
        i++;
      }
      justClosedGroup = true;
    } else if (ch === '(') {
      let depth = 1;
      i++;
      while (i < text.length && depth > 0) {
        if (text[i] === '(') depth++;
        else if (text[i] === ')') depth--;
        if (text[i] === '\\') i++;
        i++;
      }
      justClosedGroup = true;
    } else if (ch === '^' || ch === '_') {
      i++;
      if (i < text.length && text[i] === '{') continue;
      if (i < text.length) i++;
      justClosedGroup = false;
    } else if (ch === '\\') {
      const remaining = text.slice(i);
      const cmdMatch = remaining.match(/^\\([a-zA-Z]+)/);
      if (cmdMatch) {
        i += cmdMatch[0].length;
        justClosedGroup = false;
        continue;
      }
      break;
    } else if (justClosedGroup) {
      // We just finished a balanced group — only keep extending if the
      // next char is itself a LaTeX continuation. This stops us from
      // eating trailing English prose.
      if (ch === '^' || ch === '_' || ch === '{' || ch === '(' || ch === '\\') {
        justClosedGroup = false;
        continue;
      }
      // Bridge a single span of whitespace if it leads into another
      // LaTeX command. Handles `\sum_{...}^{...} \frac{...}{...}` —
      // the AI usually intends both as one math expression.
      if (/\s/.test(ch)) {
        const rest = text.slice(i);
        const bridgeMatch = rest.match(/^\s+\\[a-zA-Z]/);
        if (bridgeMatch) {
          i += bridgeMatch[0].length - 2; // land on the `\` of the next cmd
          justClosedGroup = false;
          continue;
        }
      }
      break;
    } else if (/[a-zA-Z0-9+\-=,.\s]/.test(ch)) {
      if (/[.!?]/.test(ch) && i + 1 < text.length && /\s[A-Z]/.test(text.slice(i + 1, i + 3))) break;
      i++;
    } else {
      break;
    }
  }
  return i;
}

/**
 * Strip stray `$` characters that appear *inside* a LaTeX expression we're
 * about to wrap. The AI sometimes emits `\sum_{n=0}^{$\infty$}` — `\infty`
 * is already a LaTeX command and shouldn't have its own delimiters. Without
 * this cleanup, KaTeX throws "Can't use function '$' in math mode".
 */
function stripInnerDollars(expr) {
  return expr.replace(/\$+/g, '');
}

/**
 * Normalize alternate math delimiters to the dollar form remark-math expects.
 * AI models trained on traditional LaTeX often emit \(...\) for inline and
 * \[...\] for display. The system prompt forbids these, but defense in depth.
 */
function normalizeDelimiters(text) {
  return text
    .replace(/\\\[\s*([\s\S]+?)\s*\\\]/g, (_match, body) => `$$${body}$$`)
    .replace(/\\\(\s*([\s\S]+?)\s*\\\)/g, (_match, body) => `$${body}$`);
}

/**
 * Some models wrap math in fenced code blocks (```latex, ```math, ```tex).
 * Markdown renders those as code, defeating the math renderer. Unwrap them
 * into $$...$$ so KaTeX sees the math. Preserves all other code fences.
 */
function unfenceMathBlocks(text) {
  return text.replace(
    /```(?:latex|math|tex)\s*\n([\s\S]*?)\n```/gi,
    (_match, body) => `\n$$${body.trim()}$$\n`
  );
}

/**
 * The AI sometimes pre-wraps an expression in $$...$$ AND nests individual
 * symbols in their own $\command$ inside it, e.g.
 *   $$\sum_{n=0}^{$\infty$} \frac{x^n}{n!}$$
 * KaTeX rejects the inner $ with "Can't use function '$' in math mode".
 * Strip every $ inside a $$...$$ block. Same treatment for $...$ blocks
 * that already exist — if there's a nested $...$ inside, it's the AI's
 * mistake; remove the inner markers and keep the content.
 */
function stripNestedDollarsInExistingBlocks(text) {
  // Process $$...$$ first (greedy on outer markers, lazy on body so we
  // don't span across multiple display blocks).
  let out = text.replace(/\$\$([\s\S]*?)\$\$/g, (_m, body) => {
    return '$$' + body.replace(/\$+/g, '') + '$$';
  });
  // Then defensive: $\command$ patterns appearing inside a brace argument
  // are almost certainly the AI nesting an inline-math wrap inside a larger
  // expression (e.g. ^{$\infty$}). Drop the inner $ markers using a function
  // replacement so the `$` characters in the replacement string aren't
  // misinterpreted as backreferences.
  out = out.replace(
    /\{(\s*)\$(\\[a-zA-Z]+)\$(\s*)\}/g,
    (_match, lead, cmd, tail) => '{' + lead + cmd + tail + '}'
  );
  // Single-dollar nested case: AI wraps a whole line in $...$ AND wraps a
  // command inside it independently, producing 4-dollar lines like
  //   $e^x $\approx$ 1 + x + \frac{x^2}{2}...$
  // KaTeX rejects the inner $ with "Can't use function '$' in math mode".
  // Detect the pattern `$A$\cmd$B$` (where A and B are math-looking content)
  // and merge into a single block `$A \cmd B$`. Iterate because the AI may
  // have nested multiple commands; each pass collapses one level.
  let prev;
  let safety = 8;
  do {
    prev = out;
    out = out.replace(
      /\$([^$\n]+?)\$(\\[a-zA-Z]+)\$([^$\n]+?)\$/g,
      (_m, a, cmd, b) => '$' + a + cmd + b + '$'
    );
    safety--;
  } while (out !== prev && safety > 0);
  return out;
}

/**
 * Strip C0 control bytes that occasionally appear in AI output. The worst
 * offender is \f (form-feed, 0x0C) which comes from tokenizer mishaps where
 * \frac becomes \f rac. Keep \t (0x09) and \n (0x0A) — those are legitimate.
 */
function stripControlChars(text) {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g, '');
}

/**
 * Auto-close an unbalanced single $ at the end of a paragraph. AI sometimes
 * truncates mid-expression. Better to render a half-baked formula than to
 * swallow everything after the unmatched $.
 */
function balanceDollars(text) {
  return text.split('\n\n').map(paragraph => {
    const stripped = paragraph.replace(/\$\$[\s\S]*?\$\$/g, '');
    const singleDollars = (stripped.match(/(?<!\\)\$(?!\$)/g) || []).length;
    if (singleDollars % 2 === 1) {
      return paragraph.replace(/\s*$/, '$');
    }
    return paragraph;
  }).join('\n\n');
}

/**
 * Pre-process content to fix common LaTeX rendering issues.
 * Exported for use by MarkdownRenderer and LaTeXRenderer.
 */
export function preprocessContent(content) {
  // Always return a string — downstream renderers assume that.
  if (typeof content !== 'string') return '';
  if (content === '') return '';

  let processed = content;

  // 0. Strip control chars + normalize alternate delimiters BEFORE wrapping.
  // We deliberately do NOT strip nested $ here — doing it before the wrap
  // step lets BARE_LATEX_RE re-wrap the freshly-unwrapped command back into
  // $cmd$, undoing the strip. We do the nested-dollar cleanup at the end.
  processed = stripControlChars(processed);
  processed = unfenceMathBlocks(processed);
  processed = normalizeDelimiters(processed);

  // 1. Wrap bare standalone LaTeX commands in $...$
  processed = processed.replace(BARE_LATEX_RE, (match) => `$${match}$`);

  // 2. Find LaTeX expressions with brace commands outside $...$ and wrap them.
  // Build a set of positions already inside $...$ so we don't double-wrap.
  const dollarRanges = [];
  const dollarRe = /\$\$[\s\S]*?\$\$|\$[^$\n]*?\$/g;
  let dm;
  while ((dm = dollarRe.exec(processed)) !== null) {
    dollarRanges.push([dm.index, dm.index + dm[0].length]);
  }
  const isInsideDollar = (pos) => dollarRanges.some(([s, e]) => pos >= s && pos < e);

  let result = '';
  let lastEnd = 0;
  BRACE_CMD_RE.lastIndex = 0;
  let m;
  while ((m = BRACE_CMD_RE.exec(processed)) !== null) {
    if (isInsideDollar(m.index)) continue;
    const exprEnd = findLatexExprEnd(processed, m.index + m[0].length);
    const rawExpr = processed.slice(m.index, exprEnd).trim();
    const cleanedExpr = stripInnerDollars(rawExpr);
    result += processed.slice(lastEnd, m.index) + '$' + cleanedExpr + '$';
    lastEnd = exprEnd;
    BRACE_CMD_RE.lastIndex = exprEnd;
  }
  result += processed.slice(lastEnd);

  // 3. Now that wrapping is done, clean up any remaining nested $ inside
  // existing math blocks. This handles AI emissions like
  //   $e^x $\approx$ 1 + x + ...$
  // where the AI wrapped both the whole line AND an individual command,
  // leaving 4 dollars on one line that KaTeX rejects.
  result = stripNestedDollarsInExistingBlocks(result);

  // 4. Final safety net: close any unbalanced single $ at paragraph end.
  result = balanceDollars(result);

  return result;
}
