import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingStarsProps {
  rating: number
  maxRating?: number
  size?: number
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  className?: string
}

export const RatingStars = ({
  rating,
  maxRating = 5,
  size = 20,
  interactive = false,
  onRatingChange,
  className
}: RatingStarsProps) => {
  const handleClick = (selectedRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(selectedRating)
    }
  }

  return (
    <div className={cn("flex gap-1", className)}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1
        const isFilled = starValue <= rating
        const isHalfFilled = starValue - 0.5 === rating

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(starValue)}
            disabled={!interactive}
            className={cn(
              "relative transition-transform",
              interactive && "cursor-pointer hover:scale-110",
              !interactive && "cursor-default"
            )}
          >
            <Star
              size={size}
              className={cn(
                "transition-colors",
                isFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : isHalfFilled
                  ? "fill-yellow-400/50 text-yellow-400"
                  : "fill-muted text-muted-foreground"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
