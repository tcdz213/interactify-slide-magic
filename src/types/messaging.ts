import { z } from "zod"

// ============= API Response Types =============
export interface ApiResponse<T> {
  data: T
  pagination?: PaginationData
  success: boolean
  message?: string
}

export interface PaginationData {
  current_page: number
  total_pages: number
  total_items: number
  limit: number
  has_next: boolean
  has_prev: boolean
}

// ============= Message Types =============
export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender_name: string
  sender_avatar?: string
  content: string
  read: boolean
  created_at: string
  updated_at?: string
}

export interface Conversation {
  id: string
  business_id: string
  business_name: string
  business_avatar?: string
  user_id: string
  user_name: string
  user_avatar?: string
  last_message?: string
  last_message_at?: string
  unread_count: number
  created_at: string
  updated_at?: string
}

// ============= Request Types =============
export interface CreateConversationData {
  business_id: string
  initial_message?: string
}

export interface SendMessageData {
  conversation_id: string
  content: string
}

// ============= Response Types =============
export interface ConversationsResponse {
  conversations: Conversation[]
  pagination?: PaginationData
}

export interface MessagesResponse {
  messages: Message[]
  pagination?: PaginationData
}

export interface ConversationResponse {
  conversation: Conversation
}

export interface MessageResponse {
  message: Message
}

// ============= WebSocket Event Types =============
export interface MessageInsertPayload {
  new: Message
  old: null
  eventType: 'INSERT'
}

export interface MessageUpdatePayload {
  new: Message
  old: Message
  eventType: 'UPDATE'
}

export interface ConversationUpdatePayload {
  new: Conversation
  old: Conversation
  eventType: 'UPDATE'
}

// ============= Validation Schemas =============
export const messageContentSchema = z
  .string()
  .trim()
  .min(1, { message: "Message cannot be empty" })
  .max(2000, { message: "Message must be less than 2000 characters" })
  .refine(
    (content) => {
      // Prevent script tags
      const scriptPattern = /<script[^>]*>.*?<\/script>/gi
      return !scriptPattern.test(content)
    },
    { message: "Invalid message content" }
  )

export const conversationIdSchema = z.string().uuid({ message: "Invalid conversation ID" })

export const sendMessageSchema = z.object({
  conversation_id: conversationIdSchema,
  content: messageContentSchema
})

export const createConversationSchema = z.object({
  business_id: z.string().min(1, { message: "Business ID is required" }),
  initial_message: messageContentSchema.optional()
})

// ============= Validation Functions =============
export const validateMessageContent = (content: string): { valid: boolean; error?: string } => {
  try {
    messageContentSchema.parse(content)
    return { valid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message }
    }
    return { valid: false, error: "Invalid message content" }
  }
}

export const sanitizeMessageContent = (content: string): string => {
  return content
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .slice(0, 2000) // Enforce max length
}
