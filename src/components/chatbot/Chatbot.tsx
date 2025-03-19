
import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { ChatbotProvider } from './ChatbotContext';
import { ChatbotHeader } from './ChatbotHeader';
import { ChatbotContent } from './ChatbotContent';

export const Chatbot = () => {
  return (
    <ChatbotProvider>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            className="rounded-full h-14 w-14 fixed bottom-6 right-6 shadow-lg z-50"
            size="icon"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[90%] sm:w-[380px] p-0">
          <div className="flex flex-col h-full">
            <ChatbotHeader />
            
            <div className="flex flex-col flex-1 overflow-hidden">
              <ChatbotContent />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </ChatbotProvider>
  );
};
