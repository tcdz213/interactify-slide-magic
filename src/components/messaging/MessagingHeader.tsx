import { Phone, User, CheckCircle2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface MessagingHeaderProps {
  businessName: string
  businessAvatar?: string
  isVerified?: boolean
  isOnline?: boolean
  onCall?: () => void
  onViewProfile?: () => void
  className?: string
}

export const MessagingHeader = ({
  businessName,
  businessAvatar,
  isVerified = false,
  isOnline = false,
  onCall,
  onViewProfile,
  className,
}: MessagingHeaderProps) => {
  const initials = businessName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <TooltipProvider delayDuration={300}>
      <header
        className={cn(
          "sticky top-0 z-10 border-b bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80",
          "px-3 sm:px-4 py-3",
          "transition-all duration-200",
          className
        )}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Left: Avatar + Name + Badge */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative">
              <Avatar className="h-10 w-10 sm:h-11 sm:w-11 ring-2 ring-border/50 transition-all duration-200">
                <AvatarImage src={businessAvatar} alt={businessName} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              {/* Online indicator */}
              {isOnline && (
                <span
                  className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background"
                  aria-label="Online"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">
                  {businessName}
                </h2>
                
                {/* Verification badge */}
                {isVerified && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CheckCircle2
                        className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-blue-500 flex-shrink-0"
                        aria-label="Verified business"
                      />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      <p>Verified Business</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              
              {/* Status text */}
              <p className="text-xs text-muted-foreground">
                {isOnline ? "Active now" : "Offline"}
              </p>
            </div>
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Call button */}
            {onCall && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onCall}
                    className={cn(
                      "h-10 w-10 rounded-full",
                      "hover:bg-accent/80 hover:text-primary",
                      "transition-all duration-200 active:scale-95",
                      "group"
                    )}
                    aria-label="Call business"
                  >
                    <Phone
                      className="h-[22px] w-[22px] transition-transform group-hover:scale-105"
                      strokeWidth={1.5}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p>Call</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* View profile button */}
            {onViewProfile && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onViewProfile}
                    className={cn(
                      "h-10 w-10 rounded-full",
                      "hover:bg-accent/80 hover:text-primary",
                      "transition-all duration-200 active:scale-95",
                      "group"
                    )}
                    aria-label="View business profile"
                  >
                    <User
                      className="h-[22px] w-[22px] transition-transform group-hover:scale-105"
                      strokeWidth={1.5}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p>View Profile</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </header>
    </TooltipProvider>
  )
}
