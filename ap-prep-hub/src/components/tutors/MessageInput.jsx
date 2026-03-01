import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button, Textarea } from '../ui/UIComponents';

export function MessageInput({ onSendMessage, isLoading }) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-4 items-end max-w-4xl mx-auto">
      <div className="flex-1 relative">
        <Textarea 
          placeholder="Ask your AP tutor anything..." 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          onKeyPress={handleKeyPress} 
          className="min-h-[60px] max-h-48 resize-none pr-12 border-2 border-border-strong focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 rounded-sm" 
          disabled={isLoading} 
        />
        <div className="absolute right-3 bottom-3 text-xs text-content-muted">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
      <Button 
        onClick={handleSend} 
        disabled={!message.trim() || isLoading} 
        size="lg" 
        className="h-[60px] px-6 bg-primary-500 hover:bg-primary-600 text-base-950 transition-all duration-200 shadow-raised hover:shadow-floating rounded-sm"
      >
        <Send strokeWidth={1.5} className="w-5 h-5" />
      </Button>
    </div>
  );
}