import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
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
    <div className="space-y-2">
      {error && (
        <p className="text-xs text-destructive px-1">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <Textarea
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            disabled={disabled || isSending}
            rows={1}
            className={cn(
              "min-h-[44px] max-h-[120px] resize-none",
              "rounded-[22px] px-4 py-3 pr-12",
              "border-muted bg-muted/50",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "focus-visible:border-primary/30",
              "transition-all duration-200"
            )}
            aria-label="Message input"
            maxLength={2000}
          />
          {content.length > 1800 && (
            <p className="text-[11px] text-muted-foreground/70 mt-1 px-3">
              {2000 - content.length} characters remaining
            </p>
          )}
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={!content.trim() || isSending || disabled}
          aria-label="Send message"
          className={cn(
            "h-11 w-11 rounded-full flex-shrink-0",
            "transition-all duration-200",
            content.trim() ? "scale-100 opacity-100" : "scale-90 opacity-50"
          )}
        >
          <Send className="h-5 w-5" aria-hidden="true" />
        </Button>
      </form>
    </div>
  )
}
