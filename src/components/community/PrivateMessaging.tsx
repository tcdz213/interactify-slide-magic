
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send, ChevronLeft, AlertCircle, RefreshCw } from 'lucide-react';
import useCommunityNotifications from '@/hooks/useCommunityNotifications';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface Message {
  id: string;
  content: string;
  from: string;
  to: string;
  timestamp: string;
  read: boolean;
  status?: 'sending' | 'sent' | 'error';
}

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  online: boolean;
}

const mockContacts: Contact[] = [
  {
    id: 'contact-1',
    name: 'Sarah Johnson',
    lastMessage: 'Hey, are you attending the webinar tomorrow?',
    lastMessageTime: '2 min ago',
    unreadCount: 2,
    online: true
  },
  {
    id: 'contact-2',
    name: 'Michael Thompson',
    lastMessage: 'The workshop was fantastic! Thanks for recommending it.',
    lastMessageTime: '1 hour ago',
    unreadCount: 0,
    online: true
  },
  {
    id: 'contact-3',
    name: 'Amy Liu',
    lastMessage: 'Can you share your notes from yesterday\'s session?',
    lastMessageTime: '2 hours ago',
    unreadCount: 0,
    online: false
  }
];

const mockMessages: Message[] = [
  {
    id: 'msg-1',
    content: 'Hey, are you attending the webinar tomorrow?',
    from: 'contact-1',
    to: 'me',
    timestamp: '14:22',
    read: true
  },
  {
    id: 'msg-2',
    content: "Yes, I've already registered. Are you going too?",
    from: 'me',
    to: 'contact-1',
    timestamp: '14:25',
    read: true
  },
  {
    id: 'msg-3',
    content: "Great! I'll see you there then. I heard they'll be covering some new teaching methods.",
    from: 'contact-1',
    to: 'me',
    timestamp: '14:28',
    read: true
  },
  {
    id: 'msg-4',
    content: "Perfect, I'm looking forward to it!",
    from: 'me',
    to: 'contact-1',
    timestamp: '14:30',
    read: true
  }
];

const PrivateMessaging = () => {
  const [activeContact, setActiveContact] = useState<Contact | null>(mockContacts[0]);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const { notifyMention } = useCommunityNotifications();
  const isMobile = useIsMobile();
  const [showContacts, setShowContacts] = useState(!isMobile);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedMessages, setFailedMessages] = useState<Set<string>>(new Set());
  
  // New loading states
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // Simulate loading contacts
  useEffect(() => {
    // Simulate API call to fetch contacts
    const loadContacts = async () => {
      setIsLoadingContacts(true);
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Contacts already loaded from mockContacts
        setIsLoadingContacts(false);
      } catch (err) {
        setError("Failed to load contacts. Please refresh the page.");
        setIsLoadingContacts(false);
      }
    };
    
    loadContacts();
  }, []);

  // Reset showContacts when screen size changes
  useEffect(() => {
    setShowContacts(!isMobile || !activeContact);
  }, [isMobile, activeContact]);

  const handleContactSelect = (contact: Contact) => {
    try {
      setIsLoadingConversation(true);
      setActiveContact(contact);
      
      if (isMobile) {
        setShowContacts(false);
      }
      
      // Clear any previous errors when changing contacts
      setError(null);
      
      // Simulate loading conversation data
      setTimeout(() => {
        // In a real app, this would load actual messages for the selected contact
        setIsLoadingConversation(false);
      }, 1000);
      
    } catch (err) {
      setError("Failed to load conversation. Please try again.");
      setIsLoadingConversation(false);
      toast({
        title: "Error",
        description: "Could not load the conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBackToContacts = () => {
    setShowContacts(true);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeContact) return;
    
    // Create new message with "sending" status
    const messageId = `msg-${Date.now()}`;
    const message: Message = {
      id: messageId,
      content: newMessage,
      from: 'me',
      to: activeContact.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      status: 'sending'
    };
    
    // Add message to chat
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setError(null);
    setIsSendingMessage(true);
    
    try {
      // Simulate network request
      setIsLoading(true);
      
      // In a real app this would be a try/catch around an API call
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          // 10% chance of simulated failure for demo purposes
          if (Math.random() < 0.1) {
            reject(new Error("Network error"));
          } else {
            resolve();
          }
        }, 1000);
      });
      
      // Update message status to sent
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'sent' } : msg
        )
      );
      
      // Simulate reply for demo (in a real app this would come from a real-time service)
      if (newMessage.includes('@')) {
        setTimeout(() => {
          notifyMention('Private message', activeContact.name);
        }, 1000);
      }
      
      // Simulate a response after a delay
      setTimeout(() => {
        const responseMessage: Message = {
          id: `msg-${Date.now()}`,
          content: `Thanks for your message! I'll get back to you soon.`,
          from: activeContact.id,
          to: 'me',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          status: 'sent'
        };
        setMessages(prev => [...prev, responseMessage]);
      }, 3000);
      
    } catch (err) {
      // Handle error - mark message as failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'error' } : msg
        )
      );
      
      setFailedMessages(prev => new Set(prev).add(messageId));
      
      const errorMessage = err instanceof Error ? err.message : "Failed to send message";
      setError(errorMessage);
      
      toast({
        title: "Message not sent",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsSendingMessage(false);
    }
  };

  const handleRetry = (messageId: string) => {
    // Find the failed message
    const failedMessage = messages.find(msg => msg.id === messageId);
    if (!failedMessage || !activeContact) return;
    
    // Remove the failed message from the list
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    setFailedMessages(prev => {
      const newSet = new Set(prev);
      newSet.delete(messageId);
      return newSet;
    });
    
    // Set the new message content and trigger send
    setNewMessage(failedMessage.content);
    // Don't auto-send to give user a chance to edit
  };

  // Loading skeleton for contacts
  const ContactsSkeleton = () => (
    <div className="space-y-3 p-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );

  // Loading skeleton for messages
  const MessagesSkeleton = () => (
    <div className="space-y-4 p-3">
      <div className="flex justify-start">
        <Skeleton className="h-12 w-2/3 rounded-lg" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-12 w-2/3 rounded-lg" />
      </div>
      <div className="flex justify-start">
        <Skeleton className="h-12 w-1/2 rounded-lg" />
      </div>
    </div>
  );

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Messages
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex flex-1 overflow-hidden">
        {/* Contacts list - conditionally shown on mobile */}
        {showContacts && (
          <div className={`${isMobile ? 'w-full' : 'w-1/3'} border-r border-border/40 overflow-y-auto`}>
            {isLoadingContacts ? (
              <ContactsSkeleton />
            ) : (
              mockContacts.map(contact => (
                <div 
                  key={contact.id}
                  onClick={() => handleContactSelect(contact)}
                  className={`p-3 cursor-pointer ${activeContact?.id === contact.id ? 'bg-muted' : 'hover:bg-muted/50'} transition-colors`}
                >
                  <div className="flex gap-2 items-center">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={contact.avatar} alt={contact.name} />
                        <AvatarFallback>{contact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {contact.online && (
                        <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-background"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium truncate">{contact.name}</p>
                        {contact.lastMessageTime && (
                          <span className="text-xs text-muted-foreground">{contact.lastMessageTime}</span>
                        )}
                      </div>
                      {contact.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate">{contact.lastMessage}</p>
                      )}
                    </div>
                    {contact.unreadCount > 0 && (
                      <div className="min-w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-[10px] text-primary-foreground font-medium">{contact.unreadCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {/* Messages area - conditionally shown on mobile */}
        {(!isMobile || !showContacts) && activeContact && (
          <div className="flex-1 flex flex-col h-full">
            <div className="p-3 border-b border-border/40 flex items-center gap-2">
              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 mr-1" 
                  onClick={handleBackToContacts}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <Avatar className="h-8 w-8">
                <AvatarImage src={activeContact.avatar} alt={activeContact.name} />
                <AvatarFallback>{activeContact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{activeContact.name}</p>
                <p className="text-xs text-muted-foreground">
                  {activeContact.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive" className="m-3 py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2 text-sm">{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {isLoadingConversation ? (
                <MessagesSkeleton />
              ) : messages.length > 0 ? (
                messages.map(message => (
                  <div 
                    key={message.id}
                    className={`flex ${message.from === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] md:max-w-[70%] rounded-lg px-3 py-2 ${
                        message.from === 'me' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-foreground'
                      } ${message.status === 'error' ? 'opacity-50' : ''}`}
                    >
                      <p className="text-sm break-words">{message.content}</p>
                      <div className="flex justify-between items-center mt-1">
                        <div>
                          {message.status === 'error' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-5 p-0 text-[10px] text-destructive hover:text-destructive/80"
                              onClick={() => handleRetry(message.id)}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" /> Retry
                            </Button>
                          )}
                          {message.status === 'sending' && (
                            <span className="text-[10px] opacity-70">Sending...</span>
                          )}
                        </div>
                        <p className="text-[10px] opacity-70 text-right">{message.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No messages yet. Start the conversation!
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-border/40 flex gap-2">
              <Input 
                placeholder={isSendingMessage ? "Sending..." : "Type a message..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                className="flex-1"
                disabled={isSendingMessage}
              />
              <Button 
                size="icon" 
                onClick={handleSendMessage} 
                disabled={isSendingMessage || !newMessage.trim()}
                className="relative"
              >
                {isSendingMessage ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                
                {/* Animated sending indicator */}
                {isSendingMessage && (
                  <span className="absolute inset-0 rounded-md border-2 border-primary/30 animate-ping" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Empty state when no contact is selected */}
        {(!activeContact && !showContacts) && (
          <div className="flex items-center justify-center h-full w-full">
            <p className="text-muted-foreground">Select a conversation to start messaging</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrivateMessaging;
