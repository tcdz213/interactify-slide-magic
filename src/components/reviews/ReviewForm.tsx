import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RatingStars } from "./RatingStars"
import { Card } from "@/components/ui/card"

interface ReviewFormProps {
  businessId: string
  initialData?: {
    rating: number
    title: string
    comment: string
  }
  onSubmit: (data: { rating: number; title: string; comment: string }) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

export const ReviewForm = ({
  businessId,
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Submit Review"
}: ReviewFormProps) => {
  const [rating, setRating] = useState(initialData?.rating || 0)
  const [title, setTitle] = useState(initialData?.title || "")
  const [comment, setComment] = useState(initialData?.comment || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({ rating, title, comment })
      if (!initialData) {
        // Reset form only if creating new review
        setRating(0)
        setTitle("")
        setComment("")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label>Your Rating *</Label>
          <div className="mt-2">
            <RatingStars
              rating={rating}
              interactive
              onRatingChange={setRating}
              size={32}
            />
          </div>
          {rating === 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Please select a rating
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="title">Review Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sum up your experience"
            required
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="comment">Your Review *</Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this business..."
            required
            rows={6}
            className="mt-2"
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0 || !title.trim() || !comment.trim()}
          >
            {isSubmitting ? "Submitting..." : submitLabel}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}
