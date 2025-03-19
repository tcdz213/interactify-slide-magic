
import React, { useRef, useEffect } from 'react';
import { useChatbot } from './ChatbotContext';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatbotOptions } from './ChatbotOptions';
import { FeedbackForm } from './FeedbackForm';
import { IssueReportForm } from './IssueReportForm';

export const ChatbotContent = () => {
  const { state, handleSelectOption, handleSendMessage, handleFeedbackSubmit, handleIssueSubmit } = useChatbot();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);
  
  if (state.messages.length === 0) {
    return <ChatbotOptions onSelectOption={handleSelectOption} />;
  }
  
  if (state.mode === 'feedback' && !state.feedbackRating) {
    return <FeedbackForm onSubmit={handleFeedbackSubmit} />;
  }
  
  if (state.mode === 'issue' && !state.issueCategory) {
    return <IssueReportForm onSubmit={handleIssueSubmit} />;
  }
  
  return (
    <>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {state.messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={state.isLoading}
        placeholder={state.isLoading ? "Bot is typing..." : "Type your message..."}
      />
    </>
  );
};
