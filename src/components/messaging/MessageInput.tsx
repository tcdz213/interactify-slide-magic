import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Smile, Image, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"

interface MessageInputProps {
  onSend: (content: string) => Promise<void>
  disabled?: boolean
}

export const MessageInput = ({ onSend, disabled }: MessageInputProps) => {
  const [content, setContent] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || isSending || disabled) return

    // Validate content length
    if (content.length > 2000) {
      setError("Message must be less than 2000 characters")
      return
    }

    setIsSending(true)
    setError(null)
    try {
      await onSend(content.trim())
      setContent("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    setError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="px-4 pb-4 pt-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-border/40">
      {error && (
        <p className="text-xs text-destructive px-1 mb-2">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="relative">
        <div className={cn(
          "flex items-end gap-3 p-2 pr-3",
          "bg-gray-100 dark:bg-gray-900/50 rounded-[24px]",
          "shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]",
          "transition-all duration-200",
          "hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
        )}>
          {/* Action Icons */}
          <div className="flex items-center gap-1 pb-2.5 pl-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Add emoji"
            >
              <Smile className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Add photo"
            >
              <Image className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Add document"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          </div>

          {/* Text Input */}
          <div className="flex-1 relative">
            <Textarea
              value={content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Write a message…"
              disabled={disabled || isSending}
              rows={1}
              className={cn(
                "min-h-[36px] max-h-[120px] resize-none",
                "bg-transparent border-0 px-2 py-2",
                "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none",
                "placeholder:text-muted-foreground/60",
                "transition-all duration-200 text-sm"
              )}
              aria-label="Message input"
              maxLength={2000}
            />
            {content.length > 1800 && (
              <p className="text-[10px] text-muted-foreground/70 absolute -bottom-5 left-2">
                {2000 - content.length} characters remaining
              </p>
            )}
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            size="icon"
            disabled={!content.trim() || isSending || disabled}
            aria-label="Send message"
            className={cn(
              "h-9 w-9 rounded-full flex-shrink-0 mb-0.5",
              "transition-all duration-300 ease-out",
              content.trim() 
                ? "scale-100 opacity-100 bg-gradient-primary hover:shadow-[0_0_20px_rgba(var(--primary),0.4)]" 
                : "scale-90 opacity-40 bg-muted"
            )}
          >
            <Send className={cn(
              "h-4 w-4 transition-transform duration-300",
              content.trim() && "translate-x-[1px]"
            )} aria-hidden="true" />
          </Button>
        </div>
      </form>
    </div>
  )
}
