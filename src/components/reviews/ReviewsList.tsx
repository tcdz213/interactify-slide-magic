import { useState, useEffect } from "react"
import { ReviewCard } from "./ReviewCard"
import { RatingStars } from "./RatingStars"
import { Review, ReviewStats, reviewsApi } from "@/services/reviewsApi"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { AnimatedLoading } from "@/components/AnimatedLoading"

interface ReviewsListProps {
  businessId: string
  currentUserId?: string
  onEditReview?: (review: Review) => void
}

export const ReviewsList = ({ businessId, currentUserId, onEditReview }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null)

  const loadReviews = async () => {
    setIsLoading(true)
    try {
      const data = await reviewsApi.getBusinessReviews(businessId)
      setReviews(data.reviews)
      setStats(data.stats)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [businessId])

  const handleDelete = async () => {
    if (!deleteReviewId) return

    try {
      await reviewsApi.deleteReview(deleteReviewId)
      await loadReviews()
      setDeleteReviewId(null)
    } catch (error) {
      console.error('Failed to delete review:', error)
    }
  }

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await reviewsApi.markHelpful(reviewId)
      await loadReviews()
    } catch (error) {
      console.error('Failed to mark as helpful:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <AnimatedLoading />
      </div>
    )
  }

  if (!stats || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Reviews Summary */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-5xl font-bold text-foreground">{stats.average_rating.toFixed(1)}</div>
            <RatingStars rating={stats.average_rating} size={24} className="justify-center mt-2" />
            <p className="text-muted-foreground mt-2">{stats.total_reviews} reviews</p>
          </div>
        </div>

        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.rating_distribution[star as keyof typeof stats.rating_distribution] || 0
            const percentage = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0

            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm font-medium w-8">{star}★</span>
                <Progress value={percentage} className="flex-1" />
                <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Customer Reviews</h3>
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isOwner={currentUserId === review.user_id}
              onEdit={onEditReview ? () => onEditReview(review) : undefined}
              onDelete={() => setDeleteReviewId(review.id)}
              onMarkHelpful={() => handleMarkHelpful(review.id)}
            />
          ))}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteReviewId} onOpenChange={() => setDeleteReviewId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
