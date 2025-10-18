import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/utils/messageFormatting"

interface TypingIndicatorProps {
  senderName: string
  senderAvatar?: string
}

export const TypingIndicator = ({ senderName, senderAvatar }: TypingIndicatorProps) => {
  return (
    <div className="flex gap-3" role="status" aria-live="polite" aria-label={`${senderName} is typing`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={senderAvatar} alt="" />
        <AvatarFallback>{getInitials(senderName)}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-1 max-w-[70%]">
        <div className="rounded-2xl px-4 py-3 bg-card/80 backdrop-blur-sm border border-border/50">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-muted-foreground/40"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15
                }}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
        <span className="text-xs text-muted-foreground/70 px-2">
          {senderName} is typing...
        </span>
      </div>
    </div>
  )
}
