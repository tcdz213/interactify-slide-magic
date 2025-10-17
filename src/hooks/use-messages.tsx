import { useState, useEffect, useCallback } from "react"
import { messagingApi, Message } from "@/services/messagingApi"

interface UseMessagesProps {
  conversationId: string
  currentUserId: string
}

export const useMessages = ({ conversationId, currentUserId }: UseMessagesProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [failedMessages, setFailedMessages] = useState<Set<string>>(new Set())

  const loadMessages = useCallback(async () => {
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
  }, [conversationId])

  const sendMessage = useCallback(async (content: string) => {
    if (isSending) return
    
    setIsSending(true)
    const tempId = `temp-${Date.now()}`
    
    try {
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

      const sentMessage = await messagingApi.sendMessage({
        conversation_id: conversationId,
        content
      })

      setMessages(prev => prev.map(m => 
        m.id === tempId ? sentMessage : m
      ))
      
      setFailedMessages(prev => {
        const next = new Set(prev)
        next.delete(tempId)
        return next
      })
    } catch (error) {
      setFailedMessages(prev => new Set(prev).add(tempId))
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }, [conversationId, currentUserId, isSending])

  const retryMessage = useCallback(async (messageId: string) => {
    const failedMsg = messages.find(m => m.id === messageId)
    if (!failedMsg) return

    setMessages(prev => prev.filter(m => m.id !== messageId))
    setFailedMessages(prev => {
      const next = new Set(prev)
      next.delete(messageId)
      return next
    })

    await sendMessage(failedMsg.content)
  }, [messages, sendMessage])

  const deleteFailedMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId))
    setFailedMessages(prev => {
      const next = new Set(prev)
      next.delete(messageId)
      return next
    })
  }, [])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  return {
    messages,
    isLoading,
    isSending,
    failedMessages,
    sendMessage,
    retryMessage,
    deleteFailedMessage
  }
}
