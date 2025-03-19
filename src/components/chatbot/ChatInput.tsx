
import React, { useState, FormEvent, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  maxLength?: number;
}

export const ChatInput = ({ 
  onSendMessage, 
  isLoading, 
  placeholder = "Type your message...",
  maxLength = 500 
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  
  useEffect(() => {
    setCharCount(message.length);
    
    if (message.length > maxLength) {
      setError(`Message is too long (maximum ${maxLength} characters)`);
    } else if (message.trim().length < 2 && message.trim().length > 0) {
      setError("Message is too short (minimum 2 characters)");
    } else {
      setError(null);
    }
  }, [message, maxLength]);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    // Validate message
    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }
    
    if (message.length > maxLength) {
      setError(`Message is too long (maximum ${maxLength} characters)`);
      return;
    }
    
    if (message.trim().length < 2) {
      setError("Message is too short (minimum 2 characters)");
      return;
    }
    
    // If validation passes
    onSendMessage(message);
    setMessage("");
    setError(null);
  };
  
  return (
    <div className="flex flex-col w-full">
      {error && (
        <Alert variant="destructive" className="mb-2 py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2 text-xs">{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t p-3">
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className={`pr-16 ${error ? 'border-destructive' : ''}`}
            maxLength={maxLength + 10} // Allow typing a bit over to show the error
          />
          <span className={`absolute right-2 bottom-1 text-xs ${
            charCount > maxLength ? 'text-destructive' : 'text-muted-foreground'
          }`}>
            {charCount}/{maxLength}
          </span>
        </div>
        <Button 
          type="submit" 
          size="icon" 
          disabled={!!error || !message.trim() || isLoading}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
