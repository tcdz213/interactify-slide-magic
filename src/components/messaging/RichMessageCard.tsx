import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ExternalLink, Tag } from "lucide-react"

interface RichMessageCardProps {
  type: 'offer' | 'listing' | 'promotion'
  title: string
  description?: string
  image?: string
  price?: string
  originalPrice?: string
  badge?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export const RichMessageCard = ({
  type,
  title,
  description,
  image,
  price,
  originalPrice,
  badge,
  actionLabel = 'View Details',
  onAction,
  className
}: RichMessageCardProps) => {
  return (
    <Card className={cn(
      "overflow-hidden border-gray-200 dark:border-gray-800",
      "shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)]",
      "hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]",
      "transition-all duration-300",
      "max-w-[280px]",
      className
    )}>
      {image && (
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-900">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
          {badge && (
            <Badge className="absolute top-2 right-2 bg-gradient-primary text-white shadow-lg">
              <Tag className="h-3 w-3 mr-1" />
              {badge}
            </Badge>
          )}
        </div>
      )}
      
      <div className="p-4 space-y-3">
        <div>
          <h4 className="font-semibold text-[15px] text-foreground mb-1 line-clamp-2">
            {title}
          </h4>
          {description && (
            <p className="text-[13px] text-muted-foreground/80 line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {(price || originalPrice) && (
          <div className="flex items-baseline gap-2">
            {price && (
              <span className="text-xl font-bold text-foreground">
                {price}
              </span>
            )}
            {originalPrice && (
              <span className="text-sm text-muted-foreground/60 line-through">
                {originalPrice}
              </span>
            )}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full rounded-full font-medium hover:bg-gradient-primary hover:text-white hover:border-transparent transition-all"
          onClick={onAction}
        >
          {actionLabel}
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </Card>
  )
}
