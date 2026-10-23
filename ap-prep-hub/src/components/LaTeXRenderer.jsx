import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { preprocessContent } from '../utils/latexPreprocess';

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
  // A counter, so loading KaTeX again after a hot reload still re-renders.
  const [katexLoaded, setKatexLoaded] = useState(InlineMath ? 1 : 0);
  const [loadError, setLoadError] = useState(null);

  // Process basic markdown (bold, italic) in text segments
  const processMarkdown = useCallback((text) => {
    if (typeof text !== 'string' || !text) return text;
    // Split on bold (** or __) and italic (* or _) patterns
    // Process bold first, then italic
    const parts = [];
    // Pattern: **bold**, *italic*, ***bold-italic***
    // and `code` (CS questions name procedures and variables this way)
    const mdPattern = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`([^`\n]+)`)/g;
    let lastIndex = 0;
    let match;
    while ((match = mdPattern.exec(text)) !== null) {
      // Add text before this match
      if (match.index > lastIndex) {
        parts.push(<React.Fragment key={`md-text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</React.Fragment>);
      }
      if (match[2]) {
        // ***bold-italic***
        parts.push(<strong key={`md-bi-${match.index}`}><em>{match[2]}</em></strong>);
      } else if (match[3]) {
        // **bold**
        parts.push(<strong key={`md-b-${match.index}`}>{match[3]}</strong>);
      } else if (match[4]) {
        // *italic*
        parts.push(<em key={`md-i-${match.index}`}>{match[4]}</em>);
      } else if (match[5]) {
        parts.push(<code key={`md-c-${match.index}`} className="font-mono text-[0.9em]">{match[5]}</code>);
      }
      lastIndex = match.index + match[0].length;
    }
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(<React.Fragment key={`md-text-${lastIndex}`}>{text.substring(lastIndex)}</React.Fragment>);
    }
    return parts.length > 0 ? parts : text;
  }, []);

  // Detect if content contains LaTeX
  const hasLatex = useCallback((text) => {
    if (typeof text !== 'string') return false;
    // Escape-aware: \$ is a literal dollar (money), never a delimiter.
    return /\$\$[\s\S]*?\$\$|(?<!\\)\$(?:\\.|[^$\n\\])*\$/.test(text);
  }, []);

  // Pre-process content to wrap bare LaTeX commands in $...$
  const processed = useMemo(() => preprocessContent(content), [content]);

  // Load KaTeX when component mounts and content has LaTeX
  // Check the module variables too: a hot reload re-runs this module (they go
  // back to null) while the component keeps katexLoaded = true, which rendered
  // <null /> and crashed the page.
  const ready = Boolean(katexLoaded && InlineMath && BlockMath);
  useEffect(() => {
    if (!processed || !hasLatex(processed) || ready) return;

    loadKaTeX()
      .then(() => setKatexLoaded((n) => n + 1))
      .catch((error) => setLoadError(error));
  }, [processed, hasLatex, ready]);

  if (!processed) return null;

  // If no LaTeX in content after preprocessing, still process basic markdown (bold/italic)
  if (!hasLatex(processed)) {
    const plain = processed.replace(/\\\$/g, '$');
    return inline ? <span>{processMarkdown(plain)}</span> : <div>{processMarkdown(plain)}</div>;
  }

  // Show loading state while KaTeX loads
  if (!ready) {
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
    const latexPattern = /(\$\$[\s\S]*?\$\$|(?<!\\)\$(?:\\.|[^$\n\\])*\$)/g;
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
        // Regular text — process basic markdown (bold/italic)
        return <span key={`text-${index}-${part.length}`}>{processMarkdown(part.replace(/\\\$/g, '$'))}</span>;
      }
    }).filter(Boolean);
  };

  if (inline) {
    return <span className="latex-content">{processContent(processed)}</span>;
  }

  return <div className="latex-content">{processContent(processed)}</div>;
};

export default LaTeXRenderer;
