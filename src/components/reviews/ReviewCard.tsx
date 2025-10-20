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
    <Card className="p-4 md:p-6">
      <div className="flex items-start gap-3 md:gap-4">
        <Avatar className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0">
          <AvatarImage src={review.user_avatar} alt={review.user_name} />
          <AvatarFallback>{review.user_name[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-foreground text-sm md:text-base">{review.user_name}</h4>
                {review.verified_purchase && (
                  <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
              </p>
            </div>

            <div className="flex-shrink-0">
              <RatingStars rating={review.rating} size={18} />
            </div>
          </div>

          <div>
            <h5 className="font-medium text-foreground mb-1.5 text-sm md:text-base">{review.title}</h5>
            <p className="text-muted-foreground whitespace-pre-wrap text-sm md:text-base leading-relaxed">{review.comment}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            {!isOwner && onMarkHelpful && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkHelpful}
                className="gap-2 h-9 text-sm"
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="hidden xs:inline">
                  {review.helpful_count ? `Helpful (${review.helpful_count})` : 'Helpful'}
                </span>
                <span className="xs:hidden">
                  {review.helpful_count || 0}
                </span>
              </Button>
            )}

            {isOwner && (
              <>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onEdit}
                    className="gap-2 h-9 text-sm"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="hidden xs:inline">Edit</span>
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="gap-2 text-destructive hover:text-destructive h-9 text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden xs:inline">Delete</span>
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
