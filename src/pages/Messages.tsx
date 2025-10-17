import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { ConversationsList } from "@/components/messaging/ConversationsList"
import { MessageThread } from "@/components/messaging/MessageThread"
import { Conversation } from "@/services/messagingApi"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, ArrowLeft } from "lucide-react"
import Navbar from "@/components/Navbar"
import BottomNavigation from "@/components/BottomNavigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { SEOHead } from "@/components/SEOHead"
import { useLanguage } from "@/hooks/use-language"
import { getSEOText, SupportedLanguage } from "@/utils/seoTranslations"
import { useAuth } from "@/hooks/use-auth"
import { useProtectedRoute } from "@/hooks/use-protected-route"
import { AnimatedLoading } from "@/components/AnimatedLoading"
import { useConversations } from "@/hooks/use-conversations"
import { getTotalUnreadCount, updatePageTitle } from "@/utils/notificationHelpers"
import { messagingApi } from "@/services/messagingApi"

const Messages = () => {
  const { user } = useAuth()
  const { isAuthenticated, isLoading } = useProtectedRoute('/profile')
  const { language } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const currentUserId = user?.id || localStorage.getItem('userId') || 'current-user-id'
  const isMobile = useIsMobile()
  const { conversations } = useConversations()

  // Update page title with unread count
  useEffect(() => {
    const unreadCount = getTotalUnreadCount(conversations)
    updatePageTitle(unreadCount, 'Messages')
  }, [conversations])

  // Handle conversation query parameter from listing cards
  useEffect(() => {
    const conversationId = searchParams.get('conversation')
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === conversationId)
      if (conversation) {
        setSelectedConversation(conversation)
        // Clear the query parameter after opening
        setSearchParams({})
      } else {
        // If conversation not in list yet, fetch it directly
        messagingApi.getConversation(conversationId).then(conv => {
          if (conv) {
            setSelectedConversation(conv)
            setSearchParams({})
          }
        })
      }
    }
  }, [searchParams, conversations, setSearchParams])

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
  }

  const handleBackToList = () => {
    setSelectedConversation(null)
  }

  const seoLang = (language === 'en' || language === 'ar' || language === 'fr') ? language as SupportedLanguage : 'en';

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <>
        <SEOHead
          title={getSEOText('messagesTitle', seoLang)}
          description={getSEOText('messagesDescription', seoLang)}
          url={window.location.href}
          type="website"
        />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <AnimatedLoading size={60} />
            <p className="text-sm text-muted-foreground mt-4">Loading messages...</p>
          </div>
        </div>
      </>
    )
  }

  // Don't render if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <SEOHead
        title={getSEOText('messagesTitle', seoLang)}
        description={getSEOText('messagesDescription', seoLang)}
        url={window.location.href}
        type="website"
      />
      <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Desktop: Show header */}
        {!isMobile && (
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="h-8 w-8" aria-hidden="true" />
              Messages
            </h1>
            <p className="text-muted-foreground mt-2">
              Connect with businesses and manage your conversations
            </p>
          </header>
        )}

        {/* Mobile: Single column with conditional view */}
        {isMobile ? (
          <main className="h-[calc(100vh-140px)]">
            {!selectedConversation ? (
              /* Conversations List - Mobile */
              <div className="h-full flex flex-col overflow-hidden bg-card rounded-xl shadow-sm border border-border">
                <header className="px-4 py-3 border-b border-border/50 bg-background/95 backdrop-blur-sm">
                  <h2 className="text-lg font-semibold">Messages</h2>
                </header>
                <div className="flex-1 overflow-auto">
                  <ConversationsList
                    onSelectConversation={handleSelectConversation}
                    selectedConversationId={selectedConversation?.id}
                  />
                </div>
              </div>
            ) : (
              /* Message Thread - Mobile */
              <div className="h-full flex flex-col overflow-hidden bg-card rounded-xl shadow-sm border border-border">
                <header className="border-b border-border/50 px-3 py-2.5 flex items-center gap-3 bg-background/95 backdrop-blur-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackToList}
                    className="h-9 w-9 rounded-full hover:bg-muted active:scale-95"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-[15px] font-semibold text-foreground truncate">
                      {selectedConversation.business_name}
                    </h2>
                  </div>
                </header>
                <MessageThread
                  conversationId={selectedConversation.id}
                  currentUserId={currentUserId}
                />
              </div>
            )}
          </main>
        ) : (
          /* Desktop: Two-column layout */
          <main className="grid lg:grid-cols-[380px_1fr] gap-4 h-[calc(100vh-200px)]">
            {/* Conversations List */}
            <div className="flex flex-col overflow-hidden bg-card rounded-xl shadow-sm border border-border" role="complementary" aria-label="Conversations sidebar">
              <div className="px-4 py-3 border-b border-border/50">
                <h2 className="text-lg font-semibold">Messages</h2>
              </div>
              <div className="flex-1 overflow-auto">
                <ConversationsList
                  onSelectConversation={handleSelectConversation}
                  selectedConversationId={selectedConversation?.id}
                />
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex flex-col overflow-hidden bg-card rounded-xl shadow-sm border border-border" role="main">
              {selectedConversation ? (
                <>
                  <header className="border-b border-border/50 px-5 py-3.5 bg-background/95 backdrop-blur-sm">
                    <h2 className="text-[15px] font-semibold text-foreground">
                      {selectedConversation.business_name}
                    </h2>
                  </header>
                  <MessageThread
                    conversationId={selectedConversation.id}
                    currentUserId={currentUserId}
                  />
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground/60" role="status">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" aria-hidden="true" />
                    <p className="text-sm">Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </main>
        )}
      </div>

      <BottomNavigation />
      </div>
    </>
  )
}

export default Messages
