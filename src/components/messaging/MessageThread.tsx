import { useRef, useEffect, useState, memo } from "react"
import { MessageBubble } from "./MessageBubble"
import { MessageInput } from "./MessageInput"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowDown, MessageSquare } from "lucide-react"
import { MessageThreadSkeleton } from "./MessageSkeleton"
import { Button } from "@/components/ui/button"
import { useMessages } from "@/hooks/use-messages"
import { cn } from "@/lib/utils"

interface MessageThreadProps {
  conversationId: string
  currentUserId: string
}

// Memoized message bubble for performance
const MemoizedMessageBubble = memo(MessageBubble)

export const MessageThread = ({ conversationId, currentUserId }: MessageThreadProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [userScrolled, setUserScrolled] = useState(false)

  // Use custom hook for all message state management
  const {
    messages,
    isLoading,
    isSending,
    failedMessages,
    sendMessage,
    retryMessage,
    deleteFailedMessage
  } = useMessages({ conversationId, currentUserId })

  // Smart scrolling - only auto-scroll if user is at bottom
  useEffect(() => {
    if (!userScrolled && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, userScrolled])

  // Handle scroll events to detect if user scrolled up
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const isAtBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100
    
    setUserScrolled(!isAtBottom)
    setShowScrollButton(!isAtBottom && messages.length > 0)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setUserScrolled(false)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <MessageThreadSkeleton />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background" role="log" aria-live="polite" aria-label="Message thread">
      <div className="relative flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4 pt-4 pb-2" ref={scrollRef} onScroll={handleScroll}>
          <div className="space-y-2 max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground/60 py-12" role="status">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" aria-hidden="true" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs mt-1">Send a message to start the conversation</p>
              </div>
            ) : (
              messages.map((message) => {
                const isFailed = failedMessages.has(message.id)
                return (
                  <div key={message.id}>
                    <MemoizedMessageBubble
                      message={message}
                      isCurrentUser={message.sender_id === currentUserId}
                    />
                    {isFailed && (
                      <div className={cn(
                        "flex gap-2 mt-1 mb-2",
                        message.sender_id === currentUserId ? "justify-end" : "justify-start"
                      )}>
                        <Alert variant="destructive" className="w-auto py-1.5 px-3 text-xs" role="alert">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-3 w-3" aria-hidden="true" />
                            <span>Failed to send</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 px-2 text-xs hover:bg-destructive/20"
                              onClick={() => retryMessage(message.id)}
                              aria-label="Retry sending message"
                            >
                              Retry
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 px-2 text-xs hover:bg-destructive/20"
                              onClick={() => deleteFailedMessage(message.id)}
                              aria-label="Delete failed message"
                            >
                              Delete
                            </Button>
                          </div>
                        </Alert>
                      </div>
                    )}
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Scroll to bottom button - Instagram style */}
        {showScrollButton && (
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "absolute bottom-6 right-6 h-10 w-10 rounded-full",
              "shadow-lg hover:shadow-xl",
              "transition-all duration-300 animate-fade-in",
              "bg-card border border-border",
              "hover:scale-105 active:scale-95"
            )}
            onClick={scrollToBottom}
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      <div className="border-t bg-background/95 backdrop-blur-sm px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <MessageInput 
            onSend={sendMessage}
            disabled={isSending}
          />
        </div>
      </div>
    </div>
  )
}
