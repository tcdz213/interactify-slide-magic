import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Phone, User, ArrowLeft } from "lucide-react"
import { Verified } from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

interface MessagingHeaderProps {
  businessId: string
  businessName: string
  businessAvatar?: string
  isOnline?: boolean
  isVerified?: boolean
}

export const MessagingHeader = ({
  businessId,
  businessName,
  businessAvatar,
  isOnline = false,
  isVerified = false
}: MessagingHeaderProps) => {
  const navigate = useNavigate()

  const handleViewProfile = () => {
    navigate(`/card/${businessId}`)
  }

  const handleCall = () => {
    // This would need phone number from business data
    // For now, navigate to profile where phone is shown
    navigate(`/card/${businessId}`)
  }

  return (
    <header 
      className="border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-4 py-3"
      role="banner"
    >
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Back button + Business Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 md:hidden"
            onClick={() => navigate('/messages')}
            aria-label="Back to conversations"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={businessAvatar} alt={businessName} />
                <AvatarFallback className="bg-gradient-primary text-white text-sm">
                  {businessName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Online status indicator */}
              {isOnline && (
                <div 
                  className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"
                  aria-label="Online"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className="font-semibold text-sm truncate">
                  {businessName}
                </h2>
                {isVerified && (
                  <div className="shrink-0 bg-primary rounded-full p-0.5">
                    <Verified 
                      className="w-3 h-3 text-primary-foreground" 
                      fill="currentColor"
                      aria-label="Verified business"
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground/70">
                {isOnline ? 'Active now' : 'Offline'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-accent/50"
            onClick={handleCall}
            aria-label="Call business"
          >
            <Phone className="h-5 w-5" strokeWidth={1.5} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-accent/50"
            onClick={handleViewProfile}
            aria-label="View business profile"
          >
            <User className="h-5 w-5" strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </header>
  )
}
