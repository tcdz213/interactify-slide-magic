import { useEffect, useState, useCallback, useRef } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Message, Conversation } from "@/types/messaging"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface UseMessagingWebSocketProps {
  conversationId?: string
  onNewMessage?: (message: Message) => void
  onMessageUpdate?: (message: Message) => void
  onConversationUpdate?: (conversation: Conversation) => void
  onTyping?: (userId: string, isTyping: boolean) => void
}

export const useMessagingWebSocket = ({
  conversationId,
  onNewMessage,
  onMessageUpdate,
  onConversationUpdate,
  onTyping
}: UseMessagingWebSocketProps = {}) => {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase.channel('messaging-realtime')

    // Listen for new messages
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        ...(conversationId && { filter: `conversation_id=eq.${conversationId}` })
      },
      (payload) => {
        const message = payload.new as Message
        onNewMessage?.(message)
      }
    )

    // Listen for message updates (read status, etc)
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        ...(conversationId && { filter: `conversation_id=eq.${conversationId}` })
      },
      (payload) => {
        const message = payload.new as Message
        onMessageUpdate?.(message)
      }
    )

    // Listen for conversation updates
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations'
      },
      (payload) => {
        const conversation = payload.new as Conversation
        onConversationUpdate?.(conversation)
      }
    )

    // Subscribe and handle connection status
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true)
        setConnectionError(null)
      } else if (status === 'CHANNEL_ERROR') {
        setIsConnected(false)
        setConnectionError('Failed to connect to real-time messaging')
      } else if (status === 'TIMED_OUT') {
        setIsConnected(false)
        setConnectionError('Connection timed out')
      } else if (status === 'CLOSED') {
        setIsConnected(false)
      }
    })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [conversationId, onNewMessage, onMessageUpdate, onConversationUpdate])

  // Listen for typing indicators
  useEffect(() => {
    if (!channelRef.current || !onTyping) return

    const handleTyping = (payload: any) => {
      if (payload.payload?.conversation_id === conversationId) {
        onTyping(payload.payload.user_id, payload.payload.is_typing)
      }
    }

    channelRef.current.on('broadcast', { event: 'typing' }, handleTyping)
  }, [conversationId, onTyping])

  // Send typing indicator
  const sendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      if (!channelRef.current || !conversationId) return

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Send typing state
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          conversation_id: conversationId,
          is_typing: isTyping
        }
      })

      // Auto-clear typing after 3 seconds
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          channelRef.current?.send({
            type: 'broadcast',
            event: 'typing',
            payload: {
              conversation_id: conversationId,
              is_typing: false
            }
          })
        }, 3000)
      }
    },
    [conversationId]
  )

  return {
    isConnected,
    connectionError,
    sendTypingIndicator
  }
}
