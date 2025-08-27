import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

const HelpTooltip = ({ content, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className={`text-slate-400 hover:text-slate-300 transition-colors ${className}`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)} // For mobile
        aria-label="Help"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      
      {isVisible && (
        <div className="absolute z-50 w-64 p-3 bg-slate-900 border border-slate-600 rounded-lg shadow-lg text-sm text-slate-300 -top-2 left-6 transform">
          <div className="absolute -left-2 top-3 w-2 h-2 bg-slate-900 border-l border-t border-slate-600 transform rotate-45"></div>
          {content}
        </div>
      )}
    </div>
  );
};

export default HelpTooltip;
