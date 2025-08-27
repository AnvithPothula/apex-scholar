import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const MarkdownRenderer = ({ content, className = "" }) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Style headers
          h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-slate-100">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold mb-2 text-slate-100">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold mb-2 text-slate-200">{children}</h3>,
          
          // Style paragraphs
          p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
          
          // Style lists
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="ml-2">{children}</li>,
          
          // Style emphasis
          strong: ({ children }) => <strong className="font-semibold text-slate-100">{children}</strong>,
          em: ({ children }) => <em className="italic text-slate-200">{children}</em>,
          
          // Style blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic my-2 text-slate-300">
              {children}
            </blockquote>
          ),
          
          // Style code blocks
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
          
          // Style links (if any)
          a: ({ children, href }) => (
            <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
