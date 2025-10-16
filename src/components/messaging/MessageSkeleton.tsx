import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface MessageSkeletonProps {
  isCurrentUser?: boolean
}

export const MessageSkeleton = ({ isCurrentUser = false }: MessageSkeletonProps) => {
  return (
    <div className={cn("flex gap-3", isCurrentUser && "flex-row-reverse")}>
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className={cn("flex flex-col gap-1 max-w-[70%]", isCurrentUser && "items-end")}>
        <Skeleton className="h-16 w-48 rounded-2xl" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

export const MessageThreadSkeleton = () => {
  return (
    <div className="space-y-4 p-4">
      <MessageSkeleton />
      <MessageSkeleton isCurrentUser />
      <MessageSkeleton />
      <MessageSkeleton isCurrentUser />
      <MessageSkeleton />
    </div>
  )
}
