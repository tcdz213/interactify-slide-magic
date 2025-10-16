import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const ConversationSkeleton = () => {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </Card>
  )
}

export const ConversationsListSkeleton = () => {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <ConversationSkeleton key={i} />
      ))}
    </div>
  )
}
