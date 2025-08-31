import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const LaTeX = ({ children, block = false, ...props }) => {
  try {
    if (block) {
      return <BlockMath math={children} {...props} />;
    }
    return <InlineMath math={children} {...props} />;
  } catch (error) {
    // If LaTeX parsing fails, just render the raw text
    return <span className="text-red-400 font-mono">{children}</span>;
  }
};

// Function to render text with LaTeX support
export const renderWithLaTeX = (text) => {
  if (!text) return text;
  
  // Split text by LaTeX delimiters
  const parts = text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/);
  
  return parts.map((part, index) => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
      // Block math
      const math = part.slice(2, -2);
      return <LaTeX key={index} block>{math}</LaTeX>;
    } else if (part.startsWith('$') && part.endsWith('$')) {
      // Inline math
      const math = part.slice(1, -1);
      return <LaTeX key={index}>{math}</LaTeX>;
    } else {
      // Regular text
      return part;
    }
  });
};

export default LaTeX;
