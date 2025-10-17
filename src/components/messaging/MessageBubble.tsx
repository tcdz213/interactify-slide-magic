import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Message } from "@/services/messagingApi"
import { cn } from "@/lib/utils"
import { formatMessageTime, getInitials } from "@/utils/messageFormatting"
import { memo } from "react"
import { RichMessageCard } from "./RichMessageCard"

interface MessageBubbleProps {
  message: Message & {
    rich_content?: {
      type: 'offer' | 'listing' | 'promotion'
      title: string
      description?: string
      image?: string
      price?: string
      originalPrice?: string
      badge?: string
    }
  }
  isCurrentUser: boolean
}

export const MessageBubble = memo(({ message, isCurrentUser }: MessageBubbleProps) => {
  // Check if this is a rich message
  const isRichMessage = !isCurrentUser && message.rich_content

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
        "flex flex-col gap-1 max-w-[75%]",
        isCurrentUser && "items-end"
      )}>
        {isRichMessage ? (
          <>
            <RichMessageCard
              type={message.rich_content!.type}
              title={message.rich_content!.title}
              description={message.rich_content!.description}
              image={message.rich_content!.image}
              price={message.rich_content!.price}
              originalPrice={message.rich_content!.originalPrice}
              badge={message.rich_content!.badge}
              onAction={() => console.log('Rich message action')}
            />
            {message.content && (
              <div
                className={cn(
                  "rounded-[22px] px-4 py-3 transition-all duration-200",
                  "shadow-[0_1px_2px_rgba(0,0,0,0.1)]",
                  "bg-gray-100 dark:bg-gray-800 text-foreground rounded-bl-md mt-1"
                )}
              >
                <p className="text-[15px] leading-[1.47] whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>
            )}
          </>
        ) : (
          <div
            className={cn(
              "rounded-[22px] px-4 py-3 transition-all duration-200",
              "shadow-[0_1px_2px_rgba(0,0,0,0.1)]",
              isCurrentUser
                ? "bg-gradient-primary text-white rounded-br-md"
                : "bg-gray-100 dark:bg-gray-800 text-foreground rounded-bl-md"
            )}
          >
            <p className="text-[15px] leading-[1.47] whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
        )}
        
        <time 
          className={cn(
            "text-[11px] text-muted-foreground/60 px-2",
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
