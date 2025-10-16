import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RatingStars } from "./RatingStars"
import { Review } from "@/services/reviewsApi"
import { ThumbsUp, Edit, Trash2, BadgeCheck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ReviewCardProps {
  review: Review
  isOwner?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onMarkHelpful?: () => void
}

export const ReviewCard = ({
  review,
  isOwner = false,
  onEdit,
  onDelete,
  onMarkHelpful
}: ReviewCardProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={review.user_avatar} alt={review.user_name} />
          <AvatarFallback>{review.user_name[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">{review.user_name}</h4>
                {review.verified_purchase && (
                  <BadgeCheck className="h-4 w-4 text-primary" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
              </p>
            </div>

            <RatingStars rating={review.rating} />
          </div>

          <div>
            <h5 className="font-medium text-foreground mb-1">{review.title}</h5>
            <p className="text-muted-foreground whitespace-pre-wrap">{review.comment}</p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            {!isOwner && onMarkHelpful && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkHelpful}
                className="gap-2"
              >
                <ThumbsUp className="h-4 w-4" />
                {review.helpful_count ? `Helpful (${review.helpful_count})` : 'Helpful'}
              </Button>
            )}

            {isOwner && (
              <>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onEdit}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
