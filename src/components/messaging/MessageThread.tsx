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
import { motion } from "framer-motion"

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
    <div className="flex flex-col h-full bg-muted/30" role="log" aria-live="polite" aria-label="Message thread">
      <div className="relative flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollRef} onScroll={handleScroll}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4" role="status">
                <div className="relative mb-4">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-10 w-10 text-primary/40" aria-hidden="true" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-primary/5"
                  />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Start the Conversation</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Send a message to begin chatting. They'll be notified right away.
                </p>
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

      <div className="border-t bg-card/50 backdrop-blur-sm p-4">
        <MessageInput 
          onSend={sendMessage}
          disabled={isSending}
        />
      </div>
    </div>
  )
}
