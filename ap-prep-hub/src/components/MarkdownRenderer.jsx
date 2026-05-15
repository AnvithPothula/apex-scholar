import React, { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { preprocessContent } from '../utils/latexPreprocess';

// Re-export so existing imports keep working without churn.
export { preprocessContent };

// KaTeX macros — soft polyfills for commands the AI commonly emits that
// aren't in vanilla KaTeX. Keep this list short and uncontroversial; broad
// macros risk masking real errors. Each entry maps an AI-emitted command
// to its KaTeX equivalent.
const KATEX_MACROS = {
  '\\implies': '\\Rightarrow',
  '\\impliedby': '\\Leftarrow',
  '\\iff': '\\Leftrightarrow',
  '\\R': '\\mathbb{R}',
  '\\N': '\\mathbb{N}',
  '\\Z': '\\mathbb{Z}',
  '\\Q': '\\mathbb{Q}',
  '\\C': '\\mathbb{C}',
  '\\degree': '^{\\circ}',
  // Soft errors instead of hard fails for unknown environments
  '\\align': '\\aligned',
};

// Stable plugin arrays — defined once at module scope so React.memo
// and ReactMarkdown don't re-parse on every render.
const remarkPlugins = [remarkMath];
const rehypePlugins = [[rehypeKatex, {
  strict: false,        // don't crash on unknown commands, render with errorColor
  trust: true,          // allow \htmlClass, \href, etc. (we control the AI prompt)
  throwOnError: false,  // never throw — show the original source in errorColor
  errorColor: '#f87171', // tailwind error-400
  macros: KATEX_MACROS,
}]];

// preprocessContent + all LaTeX normalization helpers live in
// ../utils/latexPreprocess so they can be unit-tested without pulling in
// react-markdown (which is ESM-only and breaks under Jest's CRA config).

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

  if (typeof ReactMarkdown !== 'function') {
    return <div className={`markdown-content ${className}`}>{memoizedContent}</div>;
  }

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
