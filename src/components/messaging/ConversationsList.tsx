import { memo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Conversation } from "@/types/messaging"
import { cn } from "@/lib/utils"
import { ConversationsListSkeleton } from "./ConversationSkeleton"
import { Button } from "@/components/ui/button"
import { RefreshCw, Trash2 } from "lucide-react"
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

// Memoized conversation item for performance
const ConversationItem = memo(({ 
  conversation, 
  isSelected, 
  onSelect,
  onDelete 
}: { 
  conversation: Conversation
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}) => {
  return (
    <div
      className={cn(
        "group px-4 py-3 cursor-pointer transition-all duration-200",
        "hover:bg-muted/50 active:bg-muted/80",
        "border-b border-border/50 last:border-0",
        "min-h-[72px]",
        isSelected && "bg-muted/70"
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-label={`Conversation with ${conversation.business_name}${conversation.unread_count > 0 ? `, ${conversation.unread_count} unread messages` : ''}`}
      aria-current={isSelected ? 'true' : undefined}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        } else if (e.key === 'Delete' && e.shiftKey) {
          e.preventDefault()
          onDelete()
        }
      }}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-14 w-14 border-2 border-muted" aria-hidden="true">
          <AvatarImage
            src={conversation.business_avatar}
            alt=""
          />
          <AvatarFallback className="text-sm font-semibold">
            {getInitials(conversation.business_name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h4 className={cn(
              "text-[15px] truncate",
              conversation.unread_count > 0 ? "font-semibold text-foreground" : "font-medium text-foreground/90"
            )}>
              {conversation.business_name}
            </h4>
            {conversation.last_message_at && (
              <span className={cn(
                "text-[12px] flex-shrink-0",
                conversation.unread_count > 0 ? "text-primary font-medium" : "text-muted-foreground/70"
              )}>
                {formatConversationTime(conversation.last_message_at)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            {conversation.last_message && (
              <p className={cn(
                "text-[13px] truncate",
                conversation.unread_count > 0 ? "text-foreground font-medium" : "text-muted-foreground/70"
              )}>
                {conversation.last_message}
              </p>
            )}
            {conversation.unread_count > 0 && (
              <div 
                className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                aria-label={`${conversation.unread_count} unread messages`}
              >
                {conversation.unread_count}
              </div>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 h-8 w-8 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          aria-label={`Delete conversation with ${conversation.business_name}`}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
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
