import { useState, useEffect } from "react"
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

const Messages = () => {
  const { user } = useAuth()
  const { isAuthenticated, isLoading } = useProtectedRoute('/profile')
  const { language } = useLanguage()
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const currentUserId = user?.id || localStorage.getItem('userId') || 'current-user-id'
  const isMobile = useIsMobile()
  const { conversations } = useConversations()

  // Update page title with unread count
  useEffect(() => {
    const unreadCount = getTotalUnreadCount(conversations)
    updatePageTitle(unreadCount, 'Messages')
  }, [conversations])

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
              <Card className="h-full flex flex-col overflow-hidden">
                <header className="p-4 border-b">
                  <h2 className="text-lg font-semibold">Messages</h2>
                  <p className="text-sm text-muted-foreground">Your conversations</p>
                </header>
                <div className="flex-1 overflow-auto p-4">
                  <ConversationsList
                    onSelectConversation={handleSelectConversation}
                    selectedConversationId={selectedConversation?.id}
                  />
                </div>
              </Card>
            ) : (
              /* Message Thread - Mobile */
              <Card className="h-full flex flex-col overflow-hidden">
                <header className="border-b p-4 flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackToList}
                    className="h-10 w-10 active:scale-95"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                  </Button>
                  <h2 className="text-lg font-semibold text-foreground flex-1">
                    {selectedConversation.business_name}
                  </h2>
                </header>
                <MessageThread
                  conversationId={selectedConversation.id}
                  currentUserId={currentUserId}
                />
              </Card>
            )}
          </main>
        ) : (
          /* Desktop: Two-column layout */
          <main className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Conversations List */}
            <Card className="lg:col-span-1 p-4 overflow-auto" role="complementary" aria-label="Conversations sidebar">
              <h2 className="text-lg font-semibold mb-4">Conversations</h2>
              <ConversationsList
                onSelectConversation={handleSelectConversation}
                selectedConversationId={selectedConversation?.id}
              />
            </Card>

            {/* Message Thread */}
            <Card className="lg:col-span-2 flex flex-col overflow-hidden" role="main">
              {selectedConversation ? (
                <>
                  <header className="border-b p-4">
                    <h2 className="text-lg font-semibold text-foreground">
                      {selectedConversation.business_name}
                    </h2>
                  </header>
                  <MessageThread
                    conversationId={selectedConversation.id}
                    currentUserId={currentUserId}
                  />
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground" role="status">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" aria-hidden="true" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </Card>
          </main>
        )}
      </div>

      <BottomNavigation />
      </div>
    </>
  )
}

export default Messages
