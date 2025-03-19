
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChatOption } from './types';
import { HelpCircle, MessageSquare, Flag, LifeBuoy } from "lucide-react";

interface ChatbotOptionsProps {
  onSelectOption: (option: ChatOption) => void;
}

export const chatOptions: ChatOption[] = [
  {
    id: "faq",
    label: "FAQs & Help",
    description: "Get answers to common questions",
    mode: "faq",
    icon: <HelpCircle className="h-5 w-5" />
  },
  {
    id: "feedback",
    label: "Share Feedback",
    description: "Rate your experience or provide suggestions",
    mode: "feedback",
    icon: <MessageSquare className="h-5 w-5" />
  },
  {
    id: "issue",
    label: "Report an Issue",
    description: "Let us know about any problems",
    mode: "issue",
    icon: <Flag className="h-5 w-5" />
  },
  {
    id: "general",
    label: "General Assistance",
    description: "Get help with anything else",
    mode: "general",
    icon: <LifeBuoy className="h-5 w-5" />
  }
];

export const ChatbotOptions = ({ onSelectOption }: ChatbotOptionsProps) => {
  return (
    <div className="space-y-3 p-3">
      <h3 className="font-medium text-center">How can we help you today?</h3>
      
      <div className="grid gap-2">
        {chatOptions.map((option) => (
          <Button
            key={option.id}
            variant="outline"
            className="flex flex-col h-auto py-3 px-4 justify-start items-start text-left"
            onClick={() => onSelectOption(option)}
          >
            <div className="flex items-center gap-2 mb-1">
              {option.icon}
              <span className="font-medium">{option.label}</span>
            </div>
            <span className="text-xs text-muted-foreground">{option.description}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
