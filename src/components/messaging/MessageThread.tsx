import { useRef, useEffect, useState, memo } from "react"
import { MessageBubble } from "./MessageBubble"
import { MessageInput } from "./MessageInput"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WifiOff, AlertCircle, ArrowDown } from "lucide-react"
import { MessageThreadSkeleton } from "./MessageSkeleton"
import { TypingIndicator } from "./TypingIndicator"
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
    isTyping,
    isConnected,
    connectionError,
    sendMessage,
    retryMessage,
    deleteFailedMessage,
    sendTypingIndicator
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

  const handleTyping = () => {
    sendTypingIndicator(true)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <MessageThreadSkeleton />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full" role="log" aria-live="polite" aria-label="Message thread">
      {/* Connection status indicator */}
      {!isConnected && connectionError && (
        <Alert variant="destructive" className="m-2" role="alert">
          <WifiOff className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>
            {connectionError} - Messages will not update in real-time
          </AlertDescription>
        </Alert>
      )}

      <div className="relative flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollRef} onScroll={handleScroll}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8" role="status">
                No messages yet. Start the conversation!
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
                      <div className="flex justify-end gap-2 mt-1">
                        <Alert variant="destructive" className="w-auto py-2 px-3" role="alert">
                          <AlertCircle className="h-4 w-4" aria-hidden="true" />
                          <AlertDescription className="flex items-center gap-2">
                            <span className="text-xs">Failed to send</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs"
                              onClick={() => retryMessage(message.id)}
                              aria-label="Retry sending message"
                            >
                              Retry
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs"
                              onClick={() => deleteFailedMessage(message.id)}
                              aria-label="Delete failed message"
                            >
                              Delete
                            </Button>
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>
                )
              })
            )}
            {isTyping && (
              <div aria-live="polite" aria-atomic="true">
                <span className="sr-only">Someone is typing</span>
                <TypingIndicator />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "absolute bottom-4 right-4 rounded-full shadow-lg",
              "transition-all duration-200 active:scale-95"
            )}
            onClick={scrollToBottom}
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      <div className="border-t p-4">
        <MessageInput 
          onSend={sendMessage} 
          onTyping={handleTyping}
          disabled={isSending}
        />
      </div>
    </div>
  )
}
