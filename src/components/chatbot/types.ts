
export type MessageType = 'user' | 'bot' | 'system';

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: Date;
}

export type ChatbotMode = 'faq' | 'feedback' | 'issue' | 'general';

export interface ChatbotState {
  messages: Message[];
  isOpen: boolean;
  mode: ChatbotMode;
  isLoading: boolean;
  feedbackRating?: number;
  issueCategory?: string;
}

export interface ChatOption {
  id: string;
  label: string;
  description: string;
  mode: ChatbotMode;
  icon: React.ReactNode;
}
