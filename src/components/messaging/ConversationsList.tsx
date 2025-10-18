import { memo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Conversation } from "@/types/messaging"
import { cn } from "@/lib/utils"
import { ConversationsListSkeleton } from "./ConversationSkeleton"
import { Button } from "@/components/ui/button"
import { RefreshCw, Trash2, MessageSquare } from "lucide-react"
import { useConversations } from "@/hooks/use-conversations"
import { formatConversationTime, getInitials } from "@/utils/messageFormatting"
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation"
import { motion } from "framer-motion"
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
  conversations?: Conversation[]
  onSelectConversation: (conversation: Conversation) => void
  selectedConversationId?: string
  currentUserId?: string
}

// Memoized conversation item for performance
const ConversationItem = memo(({ 
  conversation, 
  isSelected, 
  onSelect,
  onDelete,
  currentUserId
}: { 
  conversation: Conversation
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  currentUserId?: string
}) => {
  // Import the utility at the component level
  const { getConversationPartner } = require("@/utils/messageFormatting")
  const partner = getConversationPartner(conversation, currentUserId || '')
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "p-4 cursor-pointer transition-all duration-200 active:scale-[0.98] min-h-[44px]",
          "hover:bg-accent/50 hover:shadow-sm active:bg-accent/80",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "border-border/50 bg-card/80 backdrop-blur-sm",
          isSelected && "bg-primary/5 border-primary/30 shadow-sm"
        )}
        onClick={onSelect}
        role="button"
        tabIndex={0}
        aria-label={`Conversation with ${partner.name}${conversation.unread_count > 0 ? `, ${conversation.unread_count} unread messages` : ''}`}
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
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12" aria-hidden="true">
          <AvatarImage
            src={partner.avatar}
            alt=""
          />
          <AvatarFallback>
            {getInitials(partner.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-foreground truncate">
              {partner.name}
            </h4>
            {conversation.unread_count > 0 && (
              <Badge 
                variant="default" 
                className="ml-auto flex-shrink-0"
                aria-label={`${conversation.unread_count} unread messages`}
              >
                {conversation.unread_count}
              </Badge>
            )}
          </div>

          {conversation.last_message && (
            <p className="text-sm text-muted-foreground truncate mt-1">
              {conversation.last_message}
            </p>
          )}

          {conversation.last_message_at && (
            <p className="text-xs text-muted-foreground mt-1">
              {formatConversationTime(conversation.last_message_at)}
            </p>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 h-8 w-8"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          aria-label={`Delete conversation with ${partner.name}`}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </Card>
    </motion.div>
  )
})

ConversationItem.displayName = 'ConversationItem'

export const ConversationsList = ({
  conversations: propConversations,
  onSelectConversation,
  selectedConversationId,
  currentUserId
}: ConversationsListProps) => {
  const { conversations: hookConversations, isLoading, isRefreshing, error, refresh, deleteConversation } = useConversations()
  const conversations = propConversations || hookConversations
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
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-4" role="status">
        <div className="relative mb-4">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-10 w-10 text-primary/40" aria-hidden="true" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-primary/5"
          />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Conversations Yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Start messaging businesses to see your conversations here
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3" role="list" aria-label="Conversations">
        {isRefreshing && (
          <div className="flex items-center justify-center py-2" role="status" aria-live="polite">
            <RefreshCw className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
            <span className="ml-2 text-sm text-muted-foreground">Refreshing conversations...</span>
          </div>
        )}
        <div className="space-y-2 group">
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
              currentUserId={currentUserId}
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
