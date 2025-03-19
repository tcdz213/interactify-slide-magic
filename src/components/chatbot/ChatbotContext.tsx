
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ChatbotState, Message, ChatOption, ChatbotMode } from './types';
import { findFAQs } from './faqData';
import { useToast } from "@/hooks/use-toast";

// Initial bot responses for each mode
const initialResponses: Record<ChatbotMode, string> = {
  faq: "Hello! I'm here to help answer your questions. What would you like to know about?",
  feedback: "We'd love to hear your thoughts on our platform! Please share your feedback or suggestions.",
  issue: "I'm sorry you're experiencing an issue. Please provide details so we can help resolve it quickly.",
  general: "Hi there! How can I assist you today? Feel free to ask about anything related to our platform."
};

interface ChatbotContextType {
  state: ChatbotState;
  addMessage: (content: string, type: 'user' | 'bot' | 'system') => void;
  handleSelectOption: (option: ChatOption) => void;
  handleSendMessage: (message: string) => Promise<void>;
  handleFeedbackSubmit: (rating: number, feedback: string) => void;
  handleIssueSubmit: (category: string, description: string) => void;
  handleReset: () => void;
}

// Make sure to export the ChatbotContext
export const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const ChatbotProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ChatbotState>({
    messages: [],
    isOpen: false,
    mode: 'general',
    isLoading: false,
  });
  
  const { toast } = useToast();
  
  // Simulated bot responses based on mode and input
  const generateBotResponse = async (userMessage: string, mode: ChatbotMode): Promise<string> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (mode === 'faq') {
      const faqs = findFAQs(userMessage);
      if (faqs.length > 0) {
        return `Here's what I found:\n\n${faqs.map(faq => `**${faq.question}**\n${faq.answer}`).join('\n\n')}`;
      } else {
        return "I couldn't find a specific answer to your question. Would you like to try rephrasing, or would you prefer to speak with a human agent?";
      }
    } else if (mode === 'general') {
      if (userMessage.toLowerCase().includes("hello") || userMessage.toLowerCase().includes("hi")) {
        return "Hello! How can I help you today?";
      } else if (userMessage.toLowerCase().includes("thank")) {
        return "You're welcome! Is there anything else I can help you with?";
      } else if (userMessage.toLowerCase().includes("agent") || userMessage.toLowerCase().includes("human")) {
        return "I'll connect you with a human agent soon. They typically respond within 2 hours. Would you like me to notify you when they reply?";
      } else {
        return "I'm here to help! Would you like me to search for answers to your question, or would you prefer assistance with something specific?";
      }
    }
    
    return "I'm processing your request. A member of our team will follow up if needed. Is there anything else I can help you with?";
  };
  
  // Add a message to the chat
  const addMessage = (content: string, type: 'user' | 'bot' | 'system') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      type,
      timestamp: new Date()
    };
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
  };
  
  // Handle user selecting a chat option
  const handleSelectOption = (option: ChatOption) => {
    setState(prev => ({
      ...prev,
      mode: option.mode,
      messages: [
        ...prev.messages,
        {
          id: Date.now().toString(),
          content: `Selected: ${option.label}`,
          type: 'system',
          timestamp: new Date()
        },
        {
          id: (Date.now() + 1).toString(),
          content: initialResponses[option.mode],
          type: 'bot',
          timestamp: new Date()
        }
      ]
    }));
  };
  
  // Handle sending a user message
  const handleSendMessage = async (message: string) => {
    addMessage(message, 'user');
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await generateBotResponse(message, state.mode);
      addMessage(response, 'bot');
    } catch (error) {
      addMessage("Sorry, I'm having trouble connecting. Please try again later.", 'bot');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };
  
  // Handle feedback submission
  const handleFeedbackSubmit = (rating: number, feedback: string) => {
    setState(prev => ({ 
      ...prev, 
      feedbackRating: rating
    }));
    
    // Customize message based on rating
    let responseMessage = rating >= 4
      ? "Thank you for your positive feedback! We're glad you're enjoying our platform."
      : "Thank you for your feedback. We're sorry your experience didn't meet expectations. We'll use your input to improve.";
    
    addMessage(`Submitted a ${rating}-star rating${feedback ? ` with comment: "${feedback}"` : ''}`, 'system');
    addMessage(responseMessage, 'bot');
    
    toast({
      title: "Feedback submitted",
      description: "Thank you for helping us improve our platform!",
    });
  };
  
  // Handle issue report submission
  const handleIssueSubmit = (category: string, description: string) => {
    setState(prev => ({ 
      ...prev, 
      issueCategory: category
    }));
    
    addMessage(`Reported a "${category}" issue: "${description}"`, 'system');
    addMessage("Thank you for reporting this issue. Our team has been notified and will investigate. If needed, we'll follow up with you directly.", 'bot');
    
    toast({
      title: "Issue report submitted",
      description: "We'll look into this and get back to you soon.",
    });
  };
  
  // Reset chat to starting state
  const handleReset = () => {
    setState({
      messages: [],
      isOpen: true,
      mode: 'general',
      isLoading: false
    });
  };

  return (
    <ChatbotContext.Provider 
      value={{ 
        state, 
        addMessage, 
        handleSelectOption, 
        handleSendMessage, 
        handleFeedbackSubmit, 
        handleIssueSubmit, 
        handleReset 
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};
