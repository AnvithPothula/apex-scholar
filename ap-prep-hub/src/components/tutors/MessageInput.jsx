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
          className="min-h-[60px] max-h-48 resize-none pr-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-xl" 
          disabled={isLoading} 
        />
        <div className="absolute right-3 bottom-3 text-xs text-slate-400">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
      <Button 
        onClick={handleSend} 
        disabled={!message.trim() || isLoading} 
        size="lg" 
        className="h-[60px] px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <Send className="w-5 h-5" />
      </Button>
    </div>
  );
}