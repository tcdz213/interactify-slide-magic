import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"

interface MessageInputProps {
  onSend: (content: string) => Promise<void>
  onTyping?: () => void
  disabled?: boolean
}

export const MessageInput = ({ onSend, onTyping, disabled }: MessageInputProps) => {
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
    onTyping?.()
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
        <p className="text-xs text-destructive">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Press Enter to send)"
            disabled={disabled || isSending}
            rows={1}
            className="min-h-[40px] max-h-[120px] resize-none"
            aria-label="Message input"
            maxLength={2000}
          />
          {content.length > 1800 && (
            <p className="text-xs text-muted-foreground mt-1">
              {2000 - content.length} characters remaining
            </p>
          )}
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={!content.trim() || isSending || disabled}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>
    </div>
  )
}
