import { cn } from "@/lib/utils"

interface DateSeparatorProps {
  date: string
  className?: string
}

export const DateSeparator = ({ date, className }: DateSeparatorProps) => {
  return (
    <div className={cn("flex items-center justify-center my-6", className)} role="separator">
      <div className="flex-1 border-t border-border/30" aria-hidden="true" />
      <span className="px-4 text-xs font-medium text-muted-foreground/70 uppercase tracking-wide">
        {date}
      </span>
      <div className="flex-1 border-t border-border/30" aria-hidden="true" />
    </div>
  )
}
