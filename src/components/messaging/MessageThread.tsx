import { useState, useEffect, useRef, useCallback } from "react"
import { MessageBubble } from "./MessageBubble"
import { MessageInput } from "./MessageInput"
import { messagingApi } from "@/services/messagingApi"
import { Message } from "@/types/messaging"
import { AnimatedLoading } from "@/components/AnimatedLoading"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMessagingWebSocket } from "@/hooks/use-messaging-websocket"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WifiOff, Wifi, AlertCircle } from "lucide-react"
import { MessageThreadSkeleton } from "./MessageSkeleton"
import { TypingIndicator } from "./TypingIndicator"
import { Button } from "@/components/ui/button"

interface MessageThreadProps {
  conversationId: string
  currentUserId: string
}

export const MessageThread = ({ conversationId, currentUserId }: MessageThreadProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [failedMessages, setFailedMessages] = useState<Set<string>>(new Set())
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // WebSocket connection for real-time updates
  const { isConnected, connectionError, sendTypingIndicator } = useMessagingWebSocket({
    conversationId,
    onNewMessage: useCallback((message: Message) => {
      if (message.conversation_id === conversationId) {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === message.id)) return prev
          return [...prev, message]
        })
        
        // Mark as read if it's from another user
        if (message.sender_id !== currentUserId) {
          messagingApi.markAsRead(conversationId)
        }
      }
    }, [conversationId, currentUserId]),
    onMessageUpdate: useCallback((message: Message) => {
      if (message.conversation_id === conversationId) {
        setMessages(prev => prev.map(m => m.id === message.id ? message : m))
      }
    }, [conversationId]),
    onTyping: useCallback((userId: string, typing: boolean) => {
      if (userId !== currentUserId) {
        setIsTyping(typing)
      }
    }, [currentUserId])
  })

  // Load initial messages
  const loadMessages = async () => {
    setIsLoading(true)
    try {
      const data = await messagingApi.getMessages(conversationId)
      setMessages(data)
      await messagingApi.markAsRead(conversationId)
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [conversationId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (isSending) return
    
    setIsSending(true)
    const tempId = `temp-${Date.now()}`
    
    try {
      // Optimistic update - add message immediately
      const optimisticMessage: Message = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: currentUserId,
        sender_name: 'You',
        content,
        read: false,
        created_at: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, optimisticMessage])

      // Send to server
      const sentMessage = await messagingApi.sendMessage({
        conversation_id: conversationId,
        content
      })

      // Replace optimistic message with real one
      setMessages(prev => prev.map(m => 
        m.id === tempId ? sentMessage : m
      ))
      
      // Remove from failed messages if it was there
      setFailedMessages(prev => {
        const next = new Set(prev)
        next.delete(tempId)
        return next
      })
    } catch (error) {
      // Mark message as failed
      setFailedMessages(prev => new Set(prev).add(tempId))
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleRetryMessage = async (messageId: string) => {
    const failedMsg = messages.find(m => m.id === messageId)
    if (!failedMsg) return

    // Remove failed message
    setMessages(prev => prev.filter(m => m.id !== messageId))
    setFailedMessages(prev => {
      const next = new Set(prev)
      next.delete(messageId)
      return next
    })

    // Retry sending
    await handleSendMessage(failedMsg.content)
  }

  const handleDeleteFailedMessage = (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId))
    setFailedMessages(prev => {
      const next = new Set(prev)
      next.delete(messageId)
      return next
    })
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
    <div className="flex flex-col h-full">
      {/* Connection status indicator */}
      {!isConnected && connectionError && (
        <Alert variant="destructive" className="m-2">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            {connectionError} - Messages will not update in real-time
          </AlertDescription>
        </Alert>
      )}

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => {
              const isFailed = failedMessages.has(message.id)
              return (
                <div key={message.id}>
                  <MessageBubble
                    message={message}
                    isCurrentUser={message.sender_id === currentUserId}
                  />
                  {isFailed && (
                    <div className="flex justify-end gap-2 mt-1">
                      <Alert variant="destructive" className="w-auto py-2 px-3">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center gap-2">
                          <span className="text-xs">Failed to send</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleRetryMessage(message.id)}
                          >
                            Retry
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleDeleteFailedMessage(message.id)}
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
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <MessageInput 
          onSend={handleSendMessage} 
          onTyping={handleTyping}
          disabled={isSending}
        />
      </div>
    </div>
  )
}
