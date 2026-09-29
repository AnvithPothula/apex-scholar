import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { preprocessContent } from '../utils/latexPreprocess';
import InlineScoreCalculator from './tutors/InlineScoreCalculator';
import RetryCountdown from './tutors/RetryCountdown';
import GraphWidget from './tutors/GraphWidget';
import StepReveal from './tutors/StepReveal';
import CodeBlock from './markdown/CodeBlock';
import {
  MarkdownTable, MarkdownThead, MarkdownTbody, MarkdownTr, MarkdownTh, MarkdownTd,
} from './markdown/MarkdownTable';

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
//
// remark-gfm is what makes tables parse at all. It was missing (it had been
// installed into the repo-root package.json, which the app never sees), so
// every tutor table rendered as one paragraph of pipes. `singleTilde: false`
// keeps "~5 points" from striking through the rest of the line.
const remarkPlugins = [[remarkGfm, { singleTilde: false }], remarkMath];
const rehypePlugins = [[rehypeKatex, {
  strict: false,        // don't crash on unknown commands, render with errorColor
  trust: false,         // SECURITY: disallow \href/\htmlClass/etc. so AI- or
                        // user-supplied LaTeX can't inject links/markup (Codex P2-1).
                        // AP math content doesn't rely on these.
  throwOnError: false,  // never throw — show the original source in errorColor
  errorColor: '#f87171', // tailwind error-400
  macros: KATEX_MACROS,
}]];

// preprocessContent + all LaTeX normalization helpers live in
// ../utils/latexPreprocess so they can be unit-tested without pulling in
// react-markdown (which is ESM-only and breaks under Jest's CRA config).

// Stable component overrides — same reason.
const mdComponents = {
  h1: ({ children }) => <h1 className="text-xl font-display font-bold mt-4 mb-3 first:mt-0 text-content-primary">{children}</h1>,
  h2: ({ children }) => <h2 className="text-lg font-display font-bold mt-4 mb-2 first:mt-0 text-content-primary">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-display font-semibold mt-3 mb-2 first:mt-0 text-content-primary">{children}</h3>,
  h4: ({ children }) => <h4 className="text-sm font-display font-semibold mt-3 mb-1.5 first:mt-0 text-content-primary">{children}</h4>,
  p: ({ children }) => <div className="mb-2 last:mb-0 leading-relaxed">{children}</div>,
  // Outside markers, not `list-inside`: inside markers made a wrapped line
  // start under the bullet instead of under the text, so every multi-line item
  // read as a ragged block.
  ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1 marker:text-content-muted">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1 marker:text-content-muted">{children}</ol>,
  li: ({ children }) => <li className="pl-1 [&>ul]:mt-1 [&>ol]:mt-1">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-content-primary">{children}</strong>,
  em: ({ children }) => <em className="italic text-content-primary">{children}</em>,
  del: ({ children }) => <del className="text-content-muted">{children}</del>,
  hr: () => <hr className="my-4 border-border" />,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-primary-500/60 pl-4 my-3 text-content-secondary">
      {children}
    </blockquote>
  ),
  // react-markdown 10 no longer tells `code` whether it is inline (the
  // `inline` prop was removed), so the old override rendered every inline
  // `snippet` as a full <pre> block in the middle of a sentence. Blocks are
  // now handled by `pre` below, which only ever wraps fenced code, and `code`
  // is always the inline chip.
  code: ({ className, children }) => (
    <code className={`bg-base-800 border border-border px-1 py-0.5 rounded text-[0.9em] font-mono text-content-primary ${className || ''}`}>
      {children}
    </code>
  ),
  pre: ({ children }) => {
    const child = React.Children.toArray(children).find(React.isValidElement);
    const className = child?.props?.className || '';
    const text = String(child?.props?.children ?? '').replace(/\n$/, '');
    const language = (/language-([\w+#-]+)/.exec(className) || [])[1] || '';

    // Fenced apex-* blocks are live widgets, not source code.
    // ```apex-score: the same model the standalone calculator uses, pre-filled
    // with whatever the tutor worked out. Malformed specs render nothing (see
    // parseScoreSpec) rather than a confidently wrong score.
    if (language === 'apex-score') return <InlineScoreCalculator spec={text} />;
    // ```apex-retry: a live countdown. A static "try again in 60 seconds"
    // baked into a chat message is stale the moment it renders.
    if (language === 'apex-retry') return <RetryCountdown spec={text} />;
    // ```apex-graph: a function plot with parameter sliders.
    if (language === 'apex-graph') return <GraphWidget spec={text} />;
    // ```apex-steps: a worked solution revealed one step at a time. If the
    // JSON cannot be read, the raw block is still shown so nothing is lost.
    if (language === 'apex-steps') {
      return (
        <StepReveal
          spec={text}
          renderMarkdown={(md) => <MarkdownRenderer content={md} />}
          fallback={<CodeBlock language="" code={text} />}
        />
      );
    }
    return <CodeBlock language={language} code={text} />;
  },
  // Internal links must stay in the app. The tutor is told to link to Apex
  // Scholar pages ("take a [practice test](/practice-tests)"), and sending
  // those through target="_blank" would spawn a second copy of the SPA in a new
  // tab — losing the conversation and reloading the whole bundle. Only external
  // hrefs get the new-tab + noopener treatment.
  a: ({ children, href }) => {
    const isInternal = typeof href === 'string' && href.startsWith('/');
    if (isInternal) {
      return (
        <Link to={href} className="text-primary-400 hover:text-primary-500 underline underline-offset-2">
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className="text-primary-400 hover:text-primary-500 underline underline-offset-2 break-words" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  // Tables — see markdown/MarkdownTable.jsx. A table with a points column is
  // rendered as an interactive scoring rubric.
  table: MarkdownTable,
  thead: MarkdownThead,
  tbody: MarkdownTbody,
  tr: MarkdownTr,
  th: MarkdownTh,
  td: MarkdownTd,
  // GFM task lists ("- [ ] thesis"): read-only checkboxes that match the theme.
  input: ({ type, checked }) => (type === 'checkbox'
    ? <input type="checkbox" checked={Boolean(checked)} readOnly disabled className="mr-1.5 align-middle accent-primary-500" />
    : null),
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
