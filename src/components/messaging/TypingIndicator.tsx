import { cn } from "@/lib/utils"

interface TypingIndicatorProps {
  className?: string
}

export const TypingIndicator = ({ className }: TypingIndicatorProps) => {
  return (
    <div className={cn("flex gap-3", className)}>
      <div className="flex gap-1 items-center bg-muted rounded-2xl px-4 py-3">
        <div className="flex gap-1">
          <div className="h-2 w-2 bg-muted-foreground/60 rounded-full animate-[bounce_1.4s_infinite_0.0s]" />
          <div className="h-2 w-2 bg-muted-foreground/60 rounded-full animate-[bounce_1.4s_infinite_0.2s]" />
          <div className="h-2 w-2 bg-muted-foreground/60 rounded-full animate-[bounce_1.4s_infinite_0.4s]" />
        </div>
      </div>
    </div>
  )
}
