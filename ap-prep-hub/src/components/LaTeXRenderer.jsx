import React, { useState, useEffect, useCallback } from 'react';

// Lazy load KaTeX and react-katex only when needed
let InlineMath = null;
let BlockMath = null;
let katexCSSLoaded = false;

const loadKaTeX = async () => {
  if (InlineMath && BlockMath) {
    return { InlineMath, BlockMath };
  }

  try {
    // Load CSS first
    if (!katexCSSLoaded) {
      await import('katex/dist/katex.min.css');
      katexCSSLoaded = true;
    }

    // Load react-katex components
    const reactKatex = await import('react-katex');
    InlineMath = reactKatex.InlineMath;
    BlockMath = reactKatex.BlockMath;

    return { InlineMath, BlockMath };
  } catch (error) {
    console.error('Failed to load KaTeX:', error);
    throw error;
  }
};

const LaTeXRenderer = ({ content, inline = false }) => {
  const [katexLoaded, setKatexLoaded] = useState(!!InlineMath);
  const [loadError, setLoadError] = useState(null);

  // Detect if content contains LaTeX
  const hasLatex = useCallback((text) => {
    if (typeof text !== 'string') return false;
    return /\$\$[\s\S]*?\$\$|\$[^$\n]*?\$/.test(text);
  }, []);

  // Load KaTeX when component mounts and content has LaTeX
  useEffect(() => {
    if (!content || !hasLatex(content) || katexLoaded) return;

    loadKaTeX()
      .then(() => setKatexLoaded(true))
      .catch((error) => setLoadError(error));
  }, [content, hasLatex, katexLoaded]);

  if (!content) return null;

  // If no LaTeX in content, just return plain text
  if (!hasLatex(content)) {
    return inline ? <span>{content}</span> : <div>{content}</div>;
  }

  // Show loading state while KaTeX loads
  if (!katexLoaded) {
    if (loadError) {
      return (
        <span className="text-error-400">
          [Failed to load math renderer]
        </span>
      );
    }
    return (
      <span className="text-content-muted animate-pulse">
        Loading math...
      </span>
    );
  }

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
          return <span key={`block-error-${index}-${part.length}`} className="text-error-400">[LaTeX Error: {part}]</span>;
        }
      } else if (part.startsWith('$') && part.endsWith('$')) {
        // Inline math
        const math = part.slice(1, -1).trim();
        try {
          return <InlineMath key={`inline-${index}-${math.length}`} math={math} />;
        } catch (error) {
          console.warn('LaTeX parsing error (inline):', error);
          return <span key={`inline-error-${index}-${part.length}`} className="text-error-400">[LaTeX Error: {part}]</span>;
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
