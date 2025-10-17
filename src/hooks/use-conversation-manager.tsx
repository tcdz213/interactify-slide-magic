import { useState, useCallback } from "react"
import { messagingApi, Conversation } from "@/services/messagingApi"
import { useNavigate } from "react-router-dom"
import { toast } from "@/hooks/use-toast"

/**
 * Hook to manage conversations from listing cards
 * Handles checking for existing conversations and creating new ones
 */
export const useConversationManager = () => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  /**
   * Start or continue a conversation with a business
   * Checks if conversation exists, otherwise creates new one
   */
  const startOrContinueConversation = useCallback(async (
    businessId: string,
    initialMessage?: string
  ): Promise<Conversation | null> => {
    setIsLoading(true)
    
    try {
      // First, try to get all conversations and find existing one
      const conversations = await messagingApi.getConversations()
      const existingConversation = conversations.find(
        conv => conv.business_id === businessId
      )

      if (existingConversation) {
        // Open existing conversation
        console.log('Found existing conversation:', existingConversation.id)
        navigate(`/messages?conversation=${existingConversation.id}`)
        return existingConversation
      }

      // No existing conversation, create new one
      console.log('Creating new conversation for business:', businessId)
      const newConversation = await messagingApi.createConversation({
        business_id: businessId,
        initial_message: initialMessage
      })

      // Navigate to the new conversation
      navigate(`/messages?conversation=${newConversation.id}`)
      return newConversation

    } catch (error) {
      console.error('Failed to start/continue conversation:', error)
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive"
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  /**
   * Get an existing conversation by business ID
   */
  const getConversationByBusinessId = useCallback(async (
    businessId: string
  ): Promise<Conversation | null> => {
    try {
      const conversations = await messagingApi.getConversations()
      return conversations.find(conv => conv.business_id === businessId) || null
    } catch (error) {
      console.error('Failed to get conversation:', error)
      return null
    }
  }, [])

  return {
    startOrContinueConversation,
    getConversationByBusinessId,
    isLoading
  }
}
