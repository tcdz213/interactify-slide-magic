import { Message } from "@/types/messaging"

export interface MessageGroup {
  date: string
  messages: Array<{
    message: Message
    showAvatar: boolean
    isFirstInGroup: boolean
  }>
}

/**
 * Groups messages by date and determines avatar visibility
 */
export const groupMessagesByDate = (messages: Message[]): MessageGroup[] => {
  if (messages.length === 0) return []

  const groups: MessageGroup[] = []
  let currentDate = ""
  let currentGroup: MessageGroup | null = null
  let lastSenderId = ""

  messages.forEach((message, index) => {
    const messageDate = new Date(message.created_at)
    const dateKey = messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: messageDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })

    // Start a new date group
    if (dateKey !== currentDate) {
      if (currentGroup) {
        groups.push(currentGroup)
      }
      currentDate = dateKey
      currentGroup = {
        date: dateKey,
        messages: []
      }
      lastSenderId = ""
    }

    // Determine if we should show the avatar
    // Show avatar for the first message in a group from each sender
    const showAvatar = message.sender_id !== lastSenderId
    const isFirstInGroup = showAvatar

    currentGroup!.messages.push({
      message,
      showAvatar,
      isFirstInGroup
    })

    lastSenderId = message.sender_id
  })

  // Add the last group
  if (currentGroup) {
    groups.push(currentGroup)
  }

  return groups
}

/**
 * Formats a date string for display as a day separator
 */
export const formatDateSeparator = (dateStr: string): string => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const messageDate = new Date(dateStr)
  const todayStr = today.toDateString()
  const yesterdayStr = yesterday.toDateString()
  const messageDateStr = messageDate.toDateString()

  if (messageDateStr === todayStr) {
    return "Today"
  } else if (messageDateStr === yesterdayStr) {
    return "Yesterday"
  }

  return dateStr
}
