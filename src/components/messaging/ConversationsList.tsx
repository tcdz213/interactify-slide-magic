import { memo, useState as useReactState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Conversation } from "@/types/messaging"
import { cn } from "@/lib/utils"
import { ConversationsListSkeleton } from "./ConversationSkeleton"
import { Button } from "@/components/ui/button"
import { RefreshCw, Trash2, Check, BellOff } from "lucide-react"
import { useConversations } from "@/hooks/use-conversations"
import { formatConversationTime, getInitials } from "@/utils/messageFormatting"
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

interface ConversationsListProps {
  onSelectConversation: (conversation: Conversation) => void
  selectedConversationId?: string
}

// Memoized conversation item with swipe actions
const ConversationItem = memo(({ 
  conversation, 
  isSelected, 
  onSelect,
  onDelete,
  onMarkRead,
  onMute
}: { 
  conversation: Conversation
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onMarkRead: () => void
  onMute: () => void
}) => {
  const [swipeOffset, setSwipeOffset] = useReactState(0)
  const [startX, setStartX] = useReactState(0)
  const [isSwiping, setIsSwiping] = useReactState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return
    const diff = e.touches[0].clientX - startX
    if (diff < 0) {
      setSwipeOffset(Math.max(diff, -120))
    }
  }

  const handleTouchEnd = () => {
    setIsSwiping(false)
    if (swipeOffset < -60) {
      setSwipeOffset(-120)
    } else {
      setSwipeOffset(0)
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Swipe action buttons */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-2">
        <Button
          size="icon"
          variant="ghost"
          className="h-12 w-12 bg-green-500 hover:bg-green-600 text-white rounded-full"
          onClick={(e) => {
            e.stopPropagation()
            onMarkRead()
            setSwipeOffset(0)
          }}
          aria-label="Mark as read"
        >
          <Check className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-12 w-12 bg-orange-500 hover:bg-orange-600 text-white rounded-full"
          onClick={(e) => {
            e.stopPropagation()
            onMute()
            setSwipeOffset(0)
          }}
          aria-label="Mute conversation"
        >
          <BellOff className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-12 w-12 bg-red-500 hover:bg-red-600 text-white rounded-full"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
            setSwipeOffset(0)
          }}
          aria-label="Delete conversation"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Conversation item */}
      <div
        className={cn(
          "relative bg-white dark:bg-gray-950 transition-all duration-200",
          "hover:bg-gray-50 dark:hover:bg-gray-900/50 active:bg-gray-100 dark:active:bg-gray-900",
          "border-b border-gray-200/50 dark:border-gray-800/50 last:border-0",
          "cursor-pointer",
          isSelected && "bg-gray-50 dark:bg-gray-900/50"
        )}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onClick={onSelect}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="button"
        tabIndex={0}
        aria-label={`Conversation with ${conversation.business_name}${conversation.unread_count > 0 ? `, ${conversation.unread_count} unread messages` : ''}`}
        aria-current={isSelected ? 'true' : undefined}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar className="h-14 w-14 ring-2 ring-gray-200 dark:ring-gray-800" aria-hidden="true">
            <AvatarImage
              src={conversation.business_avatar}
              alt=""
            />
            <AvatarFallback className="text-sm font-semibold bg-gradient-primary text-white">
              {getInitials(conversation.business_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2 mb-0.5">
              <h4 className={cn(
                "text-[15px] truncate",
                conversation.unread_count > 0 ? "font-bold text-foreground" : "font-medium text-foreground/90"
              )}>
                {conversation.business_name}
              </h4>
              {conversation.last_message_at && (
                <span className={cn(
                  "text-[12px] flex-shrink-0",
                  conversation.unread_count > 0 ? "text-primary font-semibold" : "text-muted-foreground/60"
                )}>
                  {formatConversationTime(conversation.last_message_at)}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-2">
              {conversation.last_message && (
                <p className={cn(
                  "text-[13.5px] truncate leading-tight",
                  conversation.unread_count > 0 ? "text-foreground font-semibold" : "text-muted-foreground/70 font-normal"
                )}>
                  {conversation.last_message}
                </p>
              )}
              {conversation.unread_count > 0 && (
                <div 
                  className="h-5 min-w-[20px] px-1.5 rounded-full bg-gradient-primary text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0 shadow-sm"
                  aria-label={`${conversation.unread_count} unread messages`}
                >
                  {conversation.unread_count}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

ConversationItem.displayName = 'ConversationItem'

export const ConversationsList = ({
  onSelectConversation,
  selectedConversationId
}: ConversationsListProps) => {
  const { conversations, isLoading, isRefreshing, error, refresh, deleteConversation } = useConversations()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Keyboard navigation
  useKeyboardNavigation({
    onArrowDown: () => {
      setSelectedIndex(prev => Math.min(prev + 1, conversations.length - 1))
    },
    onArrowUp: () => {
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    },
    onEnter: () => {
      if (conversations[selectedIndex]) {
        onSelectConversation(conversations[selectedIndex])
      }
    },
    enabled: conversations.length > 0
  })

  const handleDelete = async () => {
    if (!conversationToDelete) return
    
    try {
      await deleteConversation(conversationToDelete)
      setDeleteDialogOpen(false)
      setConversationToDelete(null)
    } catch (err) {
      console.error('Failed to delete conversation:', err)
    }
  }

  if (isLoading && conversations.length === 0) {
    return <ConversationsListSkeleton />
  }

  if (error && conversations.length === 0) {
    return (
      <div className="text-center py-8 space-y-4" role="alert" aria-live="polite">
        <p className="text-destructive">Unable to load conversations</p>
        <p className="text-sm text-muted-foreground">Please check your connection</p>
        <Button onClick={refresh} variant="outline" size="sm" aria-label="Retry loading conversations">
          <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
          Try Again
        </Button>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground space-y-2" role="status">
        <p>No conversations yet.</p>
        <p className="text-sm">Start messaging businesses to see your conversations here.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-0" role="list" aria-label="Conversations">
        {isRefreshing && (
          <div className="flex items-center justify-center py-3 border-b border-border/50" role="status" aria-live="polite">
            <RefreshCw className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
            <span className="ml-2 text-sm text-muted-foreground">Refreshing...</span>
          </div>
        )}
        <div>
          {conversations.map((conversation, index) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversationId === conversation.id || selectedIndex === index}
              onSelect={() => onSelectConversation(conversation)}
              onDelete={() => {
                setConversationToDelete(conversation.id)
                setDeleteDialogOpen(true)
              }}
              onMarkRead={() => {
                // Mark as read logic
                console.log('Mark as read:', conversation.id)
              }}
              onMute={() => {
                // Mute logic
                console.log('Mute:', conversation.id)
              }}
            />
          ))}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation and all its messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
