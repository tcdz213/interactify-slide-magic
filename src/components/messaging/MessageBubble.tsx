import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Message } from "@/services/messagingApi"
import { cn } from "@/lib/utils"
import { formatMessageTime, getInitials } from "@/utils/messageFormatting"
import { memo } from "react"
import { Check, CheckCheck } from "lucide-react"

interface MessageBubbleProps {
  message: Message
  isCurrentUser: boolean
  showAvatar?: boolean
  isFirstInGroup?: boolean
}

export const MessageBubble = memo(({ 
  message, 
  isCurrentUser, 
  showAvatar = true,
  isFirstInGroup = true 
}: MessageBubbleProps) => {
  return (
    <div 
      className={cn(
        "flex gap-3", 
        isCurrentUser && "flex-row-reverse",
        !isFirstInGroup && "mt-1"
      )}
      role="article"
      aria-label={`Message from ${message.sender_name}`}
    >
      {/* Avatar - only show for first message in group */}
      {showAvatar ? (
        <Avatar className="h-8 w-8 flex-shrink-0" aria-hidden="true">
          <AvatarImage src={message.sender_avatar} alt="" />
          <AvatarFallback>{getInitials(message.sender_name)}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="h-8 w-8 flex-shrink-0" aria-hidden="true" />
      )}

      <div className={cn("flex flex-col gap-1 max-w-[70%]", isCurrentUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-200",
            "hover:shadow-md",
            isCurrentUser
              ? "bg-primary text-primary-foreground"
              : "bg-card/80 backdrop-blur-sm border border-border/50 text-foreground"
          )}
        >
          {/* Image attachment */}
          {message.image_url && (
            <div className="mb-2">
              <img 
                src={message.image_url} 
                alt="Attachment" 
                className="rounded-lg max-w-full h-auto max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.image_url, '_blank')}
              />
            </div>
          )}
          
          {/* Message text */}
          {message.content && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>
        
        {/* Timestamp and read receipt */}
        <div className="flex items-center gap-1 px-2">
          <time 
            className="text-xs text-muted-foreground/70"
            dateTime={message.created_at}
          >
            {formatMessageTime(message.created_at)}
          </time>
          
          {/* Read receipt - only for current user's messages */}
          {isCurrentUser && (
            <span className="text-muted-foreground/70" aria-label={message.read ? "Seen" : "Sent"}>
              {message.read ? (
                <CheckCheck className="h-3 w-3" aria-hidden="true" />
              ) : (
                <Check className="h-3 w-3" aria-hidden="true" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
})

MessageBubble.displayName = 'MessageBubble'
