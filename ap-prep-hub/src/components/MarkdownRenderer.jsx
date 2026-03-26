import React, { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// Stable plugin arrays — defined once at module scope so React.memo
// and ReactMarkdown don't re-parse on every render.
const remarkPlugins = [remarkMath];
const rehypePlugins = [[rehypeKatex, { strict: false, trust: true }]];

// Common bare LaTeX commands that appear outside $...$ delimiters.
// We wrap them so remark-math / KaTeX can render properly.
const BARE_LATEX_RE = /(?<!\$)\\(leftrightharpoons|rightleftharpoons|rightarrow|leftarrow|Rightarrow|Leftarrow|Leftrightarrow|leftrightarrow|uparrow|downarrow|int|iint|iiint|oint|sum|prod|lim|infty|partial|nabla|forall|exists|approx|neq|leq|geq|pm|mp|times|div|cdot|circ|bullet|alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega|Delta|Gamma|Theta|Lambda|Pi|Sigma|Phi|Psi|Omega)(?!\w)(?!\$)/g;

// LaTeX commands that take brace arguments — \frac{}{}, \mathbf{}, etc.
const BRACE_COMMANDS = ['frac','sqrt','overline','underline','hat','bar','vec','dot','ddot','tilde',
  'mathbb','mathcal','mathrm','mathbf','mathit','text','textbf','textit','boldsymbol',
  'left','right','begin','end','binom','underbrace','overbrace'];
const BRACE_CMD_RE = new RegExp(`\\\\(${BRACE_COMMANDS.join('|')})(?=[{(\\\\])`, 'g');

/**
 * Find the end of a LaTeX expression starting at `pos` in `text`.
 * Walks forward matching braces, subscripts, superscripts, and chained commands.
 */
function findLatexExprEnd(text, pos) {
  let i = pos;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '{') {
      // Match balanced braces
      let depth = 1;
      i++;
      while (i < text.length && depth > 0) {
        if (text[i] === '{') depth++;
        else if (text[i] === '}') depth--;
        if (text[i] === '\\') i++; // skip escaped chars
        i++;
      }
    } else if (ch === '(') {
      // Match balanced parens (for \left( ... \right))
      let depth = 1;
      i++;
      while (i < text.length && depth > 0) {
        if (text[i] === '(') depth++;
        else if (text[i] === ')') depth--;
        if (text[i] === '\\') i++;
        i++;
      }
    } else if (ch === '^' || ch === '_') {
      i++;
      if (i < text.length && text[i] === '{') continue; // will be caught by brace match
      // Single char subscript/superscript
      if (i < text.length) i++;
    } else if (ch === '\\') {
      // Another LaTeX command — check if it's a known one
      const remaining = text.slice(i);
      const cmdMatch = remaining.match(/^\\([a-zA-Z]+)/);
      if (cmdMatch) {
        i += cmdMatch[0].length;
        continue; // keep going — part of the same expression
      }
      break;
    } else if (/[a-zA-Z0-9+\-=,.\s]/.test(ch)) {
      // Alphanumeric or basic math operators — could be part of expression
      // But stop at sentence boundaries
      if (/[.!?]/.test(ch) && i + 1 < text.length && /\s[A-Z]/.test(text.slice(i + 1, i + 3))) break;
      i++;
    } else {
      break;
    }
  }
  return i;
}

// Pre-process content to fix common LaTeX rendering issues
// Exported for use by LaTeXRenderer and other components
export function preprocessContent(content) {
  if (!content || typeof content !== 'string') return content || '';

  let processed = content;

  // 1. Wrap bare standalone LaTeX commands in $...$
  processed = processed.replace(BARE_LATEX_RE, (match) => `$${match}$`);

  // 2. Find LaTeX expressions with brace commands outside $...$ and wrap them
  // Build a set of positions already inside $...$ so we don't double-wrap
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
    const expr = processed.slice(m.index, exprEnd).trim();
    result += processed.slice(lastEnd, m.index) + '$' + expr + '$';
    lastEnd = exprEnd;
    BRACE_CMD_RE.lastIndex = exprEnd; // advance past what we consumed
  }
  result += processed.slice(lastEnd);

  return result;
}

// Stable component overrides — same reason.
const mdComponents = {
  h1: ({ children }) => <h1 className="text-xl font-display font-bold mb-3 text-content-primary">{children}</h1>,
  h2: ({ children }) => <h2 className="text-lg font-display font-bold mb-2 text-content-primary">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-display font-semibold mb-2 text-content-primary">{children}</h3>,
  p: ({ children }) => <div className="mb-2 leading-relaxed">{children}</div>,
  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="ml-2">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-content-primary">{children}</strong>,
  em: ({ children }) => <em className="italic text-content-primary">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-content-muted pl-4 italic my-2 text-content-secondary">
      {children}
    </blockquote>
  ),
  code: ({ inline, children }) => {
    if (inline) {
      return <code className="bg-base-800 px-1 py-0.5 rounded-sm text-sm font-mono text-content-muted">{children}</code>;
    }
    return (
      <pre className="bg-base-900 p-3 rounded-sm overflow-x-auto my-2 border border-border">
        <code className="text-success-300 font-mono text-sm">{children}</code>
      </pre>
    );
  },
  a: ({ children, href }) => (
    <a href={href} className="text-content-muted hover:text-content-primary underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  // Table styling
  table: ({ children }) => (
    <div className="overflow-x-auto my-3 rounded-lg border border-border">
      <table className="min-w-full divide-y divide-border text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-base-800/80">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-border/50">{children}</tbody>,
  tr: ({ children }) => <tr className="hover:bg-base-800/30 transition-colors">{children}</tr>,
  th: ({ children }) => (
    <th className="px-3 py-2 text-left text-xs font-semibold text-content-primary uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }) => <td className="px-3 py-2 text-content-secondary whitespace-normal">{children}</td>,
};

const MarkdownRenderer = memo(({ content, className = "" }) => {
  // Pre-process content for LaTeX fixes, then memoize
  const memoizedContent = useMemo(() => preprocessContent(content), [content]);

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={mdComponents}
      >
        {memoizedContent}
      </ReactMarkdown>
    </div>
  );
});

MarkdownRenderer.displayName = 'MarkdownRenderer';

export default MarkdownRenderer;
