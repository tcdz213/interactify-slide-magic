import { useState, useEffect, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { messagingApi } from "@/services/messagingApi"
import { Conversation } from "@/types/messaging"
import { AnimatedLoading } from "@/components/AnimatedLoading"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { useMessagingWebSocket } from "@/hooks/use-messaging-websocket"
import { ConversationsListSkeleton } from "./ConversationSkeleton"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface ConversationsListProps {
  onSelectConversation: (conversation: Conversation) => void
  selectedConversationId?: string
}

export const ConversationsList = ({
  onSelectConversation,
  selectedConversationId
}: ConversationsListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState(false)

  // WebSocket for real-time updates - NO MORE POLLING!
  useMessagingWebSocket({
    onConversationUpdate: useCallback((updatedConversation: Conversation) => {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === updatedConversation.id ? updatedConversation : conv
        )
      )
    }, [])
  })

  // Load conversations once on mount
  const loadConversations = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    
    try {
      const data = await messagingApi.getConversations()
      setConversations(data)
      setError(false)
    } catch (err) {
      console.error('Failed to load conversations:', err)
      setError(true)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    loadConversations(true)
  }

  useEffect(() => {
    loadConversations()
  }, [])

  if (isLoading && conversations.length === 0) {
    return <ConversationsListSkeleton />
  }

  if (error && conversations.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-destructive">Unable to load conversations</p>
        <p className="text-sm text-muted-foreground">Please check your connection</p>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
          Try Again
        </Button>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground space-y-2">
        <p>No conversations yet.</p>
        <p className="text-sm">Start messaging businesses to see your conversations here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {isRefreshing && (
        <div className="flex items-center justify-center py-2">
          <RefreshCw className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
          <span className="ml-2 text-sm text-muted-foreground">Refreshing...</span>
        </div>
      )}
      <div className="space-y-2">
      {conversations.map((conversation) => (
        <Card
          key={conversation.id}
          className={cn(
            "p-4 cursor-pointer transition-colors active:scale-[0.98] min-h-[44px]",
            "active:bg-accent/80",
            selectedConversationId === conversation.id && "bg-accent"
          )}
          onClick={() => onSelectConversation(conversation)}
          role="button"
          tabIndex={0}
          aria-label={`Conversation with ${conversation.business_name}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onSelectConversation(conversation)
            }
          }}
        >
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={conversation.business_avatar}
                alt={conversation.business_name}
              />
              <AvatarFallback>
                {conversation.business_name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-foreground truncate">
                  {conversation.business_name}
                </h4>
                {conversation.unread_count > 0 && (
                  <Badge variant="default" className="ml-auto flex-shrink-0">
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
                  {formatDistanceToNow(new Date(conversation.last_message_at), {
                    addSuffix: true
                  })}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
      </div>
    </div>
  )
}
