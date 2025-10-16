/**
 * Request browser notification permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return 'denied'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission
  }

  return Notification.permission
}

/**
 * Show a browser notification for a new message
 */
export const showMessageNotification = (
  senderName: string,
  messageContent: string,
  conversationId: string
): void => {
  if (Notification.permission !== 'granted') {
    return
  }

  const notification = new Notification(`New message from ${senderName}`, {
    body: messageContent.slice(0, 100), // Limit length
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: conversationId, // Replace previous notification for same conversation
    requireInteraction: false,
    silent: false
  })

  notification.onclick = () => {
    window.focus()
    notification.close()
    // Navigate to conversation
    window.location.hash = `#conversation-${conversationId}`
  }
}

/**
 * Check if notifications are supported and enabled
 */
export const areNotificationsEnabled = (): boolean => {
  return 'Notification' in window && Notification.permission === 'granted'
}

/**
 * Get total unread count
 */
export const getTotalUnreadCount = (conversations: Array<{ unread_count: number }>): number => {
  return conversations.reduce((total, conv) => total + conv.unread_count, 0)
}

/**
 * Update page title with unread count
 */
export const updatePageTitle = (unreadCount: number, baseTitle: string = 'Messages'): void => {
  if (unreadCount > 0) {
    document.title = `(${unreadCount}) ${baseTitle}`
  } else {
    document.title = baseTitle
  }
}

/**
 * Play notification sound
 */
export const playNotificationSound = (): void => {
  try {
    const audio = new Audio('/notification.mp3')
    audio.volume = 0.3
    audio.play().catch(err => {
      console.warn('Could not play notification sound:', err)
    })
  } catch (err) {
    console.warn('Notification sound not available')
  }
}
