import { API_CONFIG, getAuthHeaders } from "@/config/api"
import { errorHandler } from "@/utils/errorHandler"
import {
  Message,
  Conversation,
  CreateConversationData,
  SendMessageData,
  ConversationsResponse,
  MessagesResponse,
  ConversationResponse,
  MessageResponse,
  sendMessageSchema,
  createConversationSchema,
  sanitizeMessageContent,
  validateMessageContent
} from "@/types/messaging"

// Re-export types for backwards compatibility
export type { Message, Conversation, CreateConversationData, SendMessageData }

class MessagingApiService {
  /**
   * Get all conversations for current user
   */
  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/conversations`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to fetch conversations')
      }

      const data: ConversationsResponse = await response.json()
      return data.conversations || []
    } catch (error) {
      errorHandler.logError('messagingApi.getConversations', error)
      return []
    }
  }

  /**
   * Get a specific conversation
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/conversations/${conversationId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to fetch conversation')
      }

      const data: ConversationResponse = await response.json()
      return data.conversation
    } catch (error) {
      errorHandler.logError('messagingApi.getConversation', error)
      return null
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(conversationData: CreateConversationData): Promise<Conversation> {
    try {
      // Validate input
      const validationResult = createConversationSchema.safeParse(conversationData)
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0].message)
      }

      // Sanitize initial message if provided
      const sanitizedData = {
        ...conversationData,
        initial_message: conversationData.initial_message
          ? sanitizeMessageContent(conversationData.initial_message)
          : undefined
      }

      const response = await fetch(`${API_CONFIG.baseURL}/conversations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(sanitizedData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to create conversation')
      }

      const data: ConversationResponse = await response.json()
      return data.conversation
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to start conversation"
      errorHandler.showApiError('createConversation', errorMessage, error)
      throw error
    }
  }

  /**
   * Get messages in a conversation
   */
  async getMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<Message[]> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/conversations/${conversationId}/messages?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data: MessagesResponse = await response.json()
      return data.messages || []
    } catch (error) {
      errorHandler.logError('messagingApi.getMessages', error)
      return []
    }
  }

  /**
   * Send a message
   */
  async sendMessage(messageData: SendMessageData): Promise<Message> {
    try {
      // Validate input
      const validationResult = sendMessageSchema.safeParse(messageData)
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0].message)
      }

      // Client-side rate limiting (max 60 messages per minute)
      const now = Date.now()
      const rateLimitKey = 'msg_rate_limit'
      const rateLimitData = localStorage.getItem(rateLimitKey)
      
      if (rateLimitData) {
        const { count, timestamp } = JSON.parse(rateLimitData)
        if (now - timestamp < 60000) { // Within 1 minute
          if (count >= 60) {
            throw new Error('Too many messages. Please wait a moment.')
          }
          localStorage.setItem(rateLimitKey, JSON.stringify({ count: count + 1, timestamp }))
        } else {
          localStorage.setItem(rateLimitKey, JSON.stringify({ count: 1, timestamp: now }))
        }
      } else {
        localStorage.setItem(rateLimitKey, JSON.stringify({ count: 1, timestamp: now }))
      }

      // Sanitize content
      const sanitizedData = {
        ...messageData,
        content: sanitizeMessageContent(messageData.content)
      }

      const response = await fetch(`${API_CONFIG.baseURL}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(sanitizedData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to send message')
      }

      const data: MessageResponse = await response.json()
      return data.message
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send message"
      errorHandler.showApiError('sendMessage', errorMessage, error)
      throw error
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/conversations/${conversationId}/read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to mark messages as read')
      }
    } catch (error) {
      errorHandler.logError('messagingApi.markAsRead', error)
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to delete conversation')
      }

      errorHandler.showSuccess("Conversation deleted successfully.", "Success!")
    } catch (error) {
      errorHandler.showApiError('deleteConversation', "Failed to delete conversation", error)
      throw error
    }
  }
}

export const messagingApi = new MessagingApiService()
