import { useState, useEffect, useCallback } from "react"
import { messagingApi, Conversation } from "@/services/messagingApi"
import { useMessagingWebSocket } from "./use-messaging-websocket"

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // WebSocket for real-time updates
  useMessagingWebSocket({
    onConversationUpdate: useCallback((updatedConversation: Conversation) => {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === updatedConversation.id ? updatedConversation : conv
        )
      )
    }, [])
  })

  const loadConversations = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    
    try {
      const data = await messagingApi.getConversations()
      setConversations(data)
      setError(null)
    } catch (err) {
      console.error('Failed to load conversations:', err)
      setError(err instanceof Error ? err : new Error('Failed to load conversations'))
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      await messagingApi.deleteConversation(conversationId)
      setConversations(prev => prev.filter(conv => conv.id !== conversationId))
    } catch (err) {
      console.error('Failed to delete conversation:', err)
      throw err
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  return {
    conversations,
    isLoading,
    isRefreshing,
    error,
    refresh: () => loadConversations(true),
    deleteConversation
  }
}
