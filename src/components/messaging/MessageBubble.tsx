import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Message } from "@/services/messagingApi"
import { cn } from "@/lib/utils"
import { formatMessageTime, getInitials } from "@/utils/messageFormatting"
import { memo } from "react"

interface MessageBubbleProps {
  message: Message
  isCurrentUser: boolean
}

export const MessageBubble = memo(({ message, isCurrentUser }: MessageBubbleProps) => {
  return (
    <div 
      className={cn(
        "flex gap-2 mb-1 animate-fade-in",
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      )}
      role="article"
      aria-label={`Message from ${message.sender_name}`}
    >
      {/* Avatar - only show for other user */}
      {!isCurrentUser && (
        <Avatar className="h-7 w-7 flex-shrink-0 mt-auto" aria-hidden="true">
          <AvatarImage src={message.sender_avatar} alt="" />
          <AvatarFallback className="text-xs">{getInitials(message.sender_name)}</AvatarFallback>
        </Avatar>
      )}

      <div className={cn(
        "flex flex-col gap-0.5 max-w-[75%]",
        isCurrentUser && "items-end"
      )}>
        <div
          className={cn(
            "rounded-[20px] px-4 py-2.5 transition-all duration-200",
            "shadow-sm",
            isCurrentUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted text-foreground rounded-bl-sm"
          )}
        >
          <p className="text-[15px] leading-[1.4] whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <time 
          className={cn(
            "text-[11px] text-muted-foreground/70 px-3 mt-0.5",
            isCurrentUser && "text-right"
          )}
          dateTime={message.created_at}
        >
          {formatMessageTime(message.created_at)}
        </time>
      </div>

      {/* Spacer for current user to balance with avatar */}
      {isCurrentUser && <div className="w-7 flex-shrink-0" />}
    </div>
  )
})

MessageBubble.displayName = 'MessageBubble'
