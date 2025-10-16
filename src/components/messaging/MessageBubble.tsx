import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Message } from "@/services/messagingApi"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface MessageBubbleProps {
  message: Message
  isCurrentUser: boolean
}

export const MessageBubble = ({ message, isCurrentUser }: MessageBubbleProps) => {
  return (
    <div className={cn("flex gap-3", isCurrentUser && "flex-row-reverse")}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={message.sender_avatar} alt={message.sender_name} />
        <AvatarFallback>{message.sender_name[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className={cn("flex flex-col gap-1 max-w-[70%]", isCurrentUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2",
            isCurrentUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <span className="text-xs text-muted-foreground px-2">
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </span>
      </div>
    </div>
  )
}
