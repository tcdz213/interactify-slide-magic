import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns"

/**
 * Format a timestamp for message display
 * Returns "just now", "2 hours ago", etc.
 */
export const formatMessageTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp)
    return formatDistanceToNow(date, { addSuffix: true })
  } catch {
    return ''
  }
}

/**
 * Format a timestamp for conversation list
 * Returns "Today", "Yesterday", or date
 */
export const formatConversationTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp)
    
    if (isToday(date)) {
      return format(date, 'p') // Time only
    }
    
    if (isYesterday(date)) {
      return 'Yesterday'
    }
    
    return format(date, 'MMM d') // Month and day
  } catch {
    return ''
  }
}

/**
 * Truncate message content for preview
 */
export const truncateMessage = (content: string, maxLength: number = 50): string => {
  if (content.length <= maxLength) return content
  return content.slice(0, maxLength).trim() + '...'
}

/**
 * Get initials from name for avatar fallback
 */
export const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }
  return words
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase()
}

/**
 * Check if a message contains mentions
 */
export const containsMention = (content: string, userId: string): boolean => {
  const mentionPattern = new RegExp(`@${userId}\\b`, 'i')
  return mentionPattern.test(content)
}
