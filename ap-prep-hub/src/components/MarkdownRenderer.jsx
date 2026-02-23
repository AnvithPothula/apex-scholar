import React, { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// Stable plugin arrays — defined once at module scope so React.memo
// and ReactMarkdown don't re-parse on every render.
const remarkPlugins = [remarkMath];
const rehypePlugins = [rehypeKatex];

// Stable component overrides — same reason.
const mdComponents = {
  h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-slate-100">{children}</h1>,
  h2: ({ children }) => <h2 className="text-lg font-bold mb-2 text-slate-100">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-semibold mb-2 text-slate-200">{children}</h3>,
  p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="ml-2">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-slate-100">{children}</strong>,
  em: ({ children }) => <em className="italic text-slate-200">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 italic my-2 text-slate-300">
      {children}
    </blockquote>
  ),
  code: ({ inline, children }) => {
    if (inline) {
      return <code className="bg-slate-700 px-1 py-0.5 rounded text-sm font-mono text-blue-300">{children}</code>;
    }
    return (
      <pre className="bg-slate-800 p-3 rounded-lg overflow-x-auto my-2">
        <code className="text-green-300 font-mono text-sm">{children}</code>
      </pre>
    );
  },
  a: ({ children, href }) => (
    <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

const MarkdownRenderer = memo(({ content, className = "" }) => {
  // Memoize the content string to avoid re-parsing identical markdown
  const memoizedContent = useMemo(() => content, [content]);

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
