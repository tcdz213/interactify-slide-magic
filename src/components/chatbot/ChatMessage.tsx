
import React from 'react';
import { Message } from './types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CornerDownLeft } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';
  
  if (isSystem) {
    return (
      <div className="py-2 px-3 text-center">
        <p className="text-xs text-muted-foreground bg-muted inline-block py-1 px-2 rounded-full">
          {message.content}
        </p>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "flex items-start gap-3 py-2", 
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar className={cn("h-8 w-8", isUser ? "bg-primary" : "bg-muted")}>
        <AvatarFallback>
          {isUser ? 'U' : 'B'}
        </AvatarFallback>
      </Avatar>
      <div className={cn(
        "rounded-lg py-2 px-3 max-w-[80%]",
        isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
      )}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};
