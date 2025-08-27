import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const LaTeXRenderer = ({ content, inline = false }) => {
  if (!content) return null;

  // Function to process mixed LaTeX and regular text
  const processContent = (text) => {
    if (typeof text !== 'string') return text;

    // Pattern to match both inline $...$ and block $$...$$ LaTeX
    const latexPattern = /(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$)/g;
    const parts = text.split(latexPattern);
    
    return parts.map((part, index) => {
      if (!part) return null;
      
      // Check if this part is LaTeX
      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Block math
        const math = part.slice(2, -2).trim();
        try {
          return <BlockMath key={`block-${index}-${math.length}`} math={math} />;
        } catch (error) {
          console.warn('LaTeX parsing error (block):', error);
          return <span key={`block-error-${index}-${part.length}`} className="text-red-400">[LaTeX Error: {part}]</span>;
        }
      } else if (part.startsWith('$') && part.endsWith('$')) {
        // Inline math
        const math = part.slice(1, -1).trim();
        try {
          return <InlineMath key={`inline-${index}-${math.length}`} math={math} />;
        } catch (error) {
          console.warn('LaTeX parsing error (inline):', error);
          return <span key={`inline-error-${index}-${part.length}`} className="text-red-400">[LaTeX Error: {part}]</span>;
        }
      } else {
        // Regular text
        return <span key={`text-${index}-${part.length}`}>{part}</span>;
      }
    }).filter(Boolean);
  };

  if (inline) {
    return <span className="latex-content">{processContent(content)}</span>;
  }

  return <div className="latex-content">{processContent(content)}</div>;
};

export default LaTeXRenderer;
