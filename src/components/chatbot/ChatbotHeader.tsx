
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";
import { useChatbot } from './ChatbotContext';

export const ChatbotHeader = () => {
  const { state, handleReset } = useChatbot();
  
  return (
    <div className="border-b p-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {state.messages.length > 0 && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 mr-1"
            onClick={handleReset}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <h2 className="font-semibold">Support Chat</h2>
      </div>
      <SheetClose asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </SheetClose>
    </div>
  );
};
