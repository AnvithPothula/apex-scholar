import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { PerformanceIndicator } from './PerformanceIndicator';

const ChatMessageComponent = ({ message }) => {
  const isUser = message.role === "user";
  
  // Simple HTML sanitization for safety
  const sanitizeText = (text) => {
    if (!text) return "";
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  const renderMathInText = (text) => {
    if (!text) return "";
    const parts = text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);
    return parts.map((part, index) => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        return (
          <div key={`block-math-${index}-${part.length}`} className="p-2 my-2 bg-base-900 rounded-sm text-center overflow-x-auto">
            {part.slice(2, -2)}
          </div>
        );
      }
      if (part.startsWith("$") && part.endsWith("$")) {
        return (
          <span key={`inline-math-${index}-${part.length}`} className="mx-1 px-1.5 py-0.5 bg-base-900 rounded">
            {part.slice(1, -1)}
          </span>
        );
      }
      return (
        <span 
          key={`text-${index}-${part.length}`} 
          dangerouslySetInnerHTML={{ __html: sanitizeText(part).replace(/\n/g, '<br />') }} 
        />
      );
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className={`flex items-end gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-base-800 border border-border flex items-center justify-center shadow-raised">
          <Bot strokeWidth={1.5} className="w-5 h-5 text-content-primary" />
        </div>
      )}
      <div className={`max-w-md rounded-md px-5 py-4 shadow-sm ${
        isUser
          ? "bg-base-750 text-content-primary border border-border"
          : "bg-base-800 border border-border text-content-primary"
      }`}>
        <div className="prose prose-sm max-w-none break-words leading-relaxed">
          {renderMathInText(message.content)}
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className={`text-xs opacity-70 ${
            isUser ? 'text-content-muted' : 'text-content-muted'
          }`}>
            {message.timestamp && format(message.timestamp.toDate(), "h:mm a")}
            {message.cached && (
              <span className="ml-2 text-xs text-success-400">⚡ Cached</span>
            )}
          </div>
          {!isUser && message.responseTime && (
            <PerformanceIndicator 
              responseTime={message.responseTime} 
              showDetails={false}
            />
          )}
        </div>
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-base-750 flex items-center justify-center shadow-raised">
          <UserIcon strokeWidth={1.5} className="w-5 h-5 text-content-primary" />
        </div>
      )}
    </motion.div>
  );
};

// Memoize ChatMessage to prevent unnecessary re-renders
// Only re-render if message id or content changes
export const ChatMessage = React.memo(ChatMessageComponent, (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.responseTime === nextProps.message.responseTime &&
    prevProps.message.cached === nextProps.message.cached
  );
});