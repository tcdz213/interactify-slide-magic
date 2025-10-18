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
      className={cn("flex gap-3", isCurrentUser && "flex-row-reverse")}
      role="article"
      aria-label={`Message from ${message.sender_name}`}
    >
      <Avatar className="h-8 w-8 flex-shrink-0" aria-hidden="true">
        <AvatarImage src={message.sender_avatar} alt="" />
        <AvatarFallback>{getInitials(message.sender_name)}</AvatarFallback>
      </Avatar>

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
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <time 
          className="text-xs text-muted-foreground/70 px-2"
          dateTime={message.created_at}
        >
          {formatMessageTime(message.created_at)}
        </time>
      </div>
    </div>
  )
})

MessageBubble.displayName = 'MessageBubble'
