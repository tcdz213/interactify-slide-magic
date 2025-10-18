import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { ConversationsList } from "@/components/messaging/ConversationsList"
import { MessageThread } from "@/components/messaging/MessageThread"
import { MessagingHeader } from "@/components/messaging/MessagingHeader"
import { Conversation } from "@/services/messagingApi"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, ArrowLeft, Search } from "lucide-react"
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
import { toast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { getConversationPartner } from "@/utils/messageFormatting"

const Messages = () => {
  const { user } = useAuth()
  const { isAuthenticated, isLoading } = useProtectedRoute('/profile')
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const currentUserId = user?.id || localStorage.getItem('userId') || 'current-user-id'
  const isMobile = useIsMobile()
  const { conversations } = useConversations()

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv => {
    const partner = getConversationPartner(conv, currentUserId)
    return partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const handleCall = () => {
    toast({
      title: "Call feature",
      description: "Phone call functionality coming soon!",
    })
  }

  const handleViewProfile = () => {
    if (selectedConversation?.business_id) {
      navigate(`/card/${selectedConversation.business_id}`)
    }
  }

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
      <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Full-screen messaging layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Mobile: Single column with conditional view */}
        {isMobile ? (
          <AnimatePresence mode="wait">
            {!selectedConversation ? (
              /* Conversations List - Mobile */
              <motion.div
                key="conversations"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col bg-background pb-20"
              >
                {/* Header */}
                <header className="p-4 border-b bg-card/50 backdrop-blur-sm">
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-3">
                    <MessageSquare className="h-6 w-6" aria-hidden="true" />
                    Messages
                  </h1>
                  
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-muted/50 border-none focus-visible:ring-1"
                    />
                  </div>
                </header>

                {/* Conversations List */}
                <div className="flex-1 overflow-auto p-4">
                  <ConversationsList
                    conversations={filteredConversations}
                    onSelectConversation={handleSelectConversation}
                    selectedConversationId={selectedConversation?.id}
                    currentUserId={currentUserId}
                  />
                </div>
              </motion.div>
            ) : (
              /* Message Thread - Mobile */
              <motion.div
                key="thread"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col bg-background pb-20"
              >
                <div className="border-b flex items-center gap-2 px-2 py-2 bg-card/50 backdrop-blur-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackToList}
                    className="h-10 w-10 active:scale-95 transition-all hover:bg-accent/80"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                  </Button>
                  <div className="flex-1">
                    {(() => {
                      const partner = getConversationPartner(selectedConversation, currentUserId)
                      return (
                        <MessagingHeader
                          businessName={partner.name}
                          businessAvatar={partner.avatar}
                          isVerified={partner.isVerified}
                          isOnline={false}
                          onCall={handleCall}
                          onViewProfile={handleViewProfile}
                        />
                      )
                    })()}
                  </div>
                </div>
                <MessageThread
                  conversationId={selectedConversation.id}
                  currentUserId={currentUserId}
                />
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          /* Desktop: Two-column full-screen layout */
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel - Conversations */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="w-full md:w-96 lg:w-[420px] border-r bg-card/30 backdrop-blur-sm flex flex-col"
            >
              {/* Header with Search */}
              <header className="p-4 border-b space-y-3">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <MessageSquare className="h-6 w-6" aria-hidden="true" />
                  Messages
                </h1>
                
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-muted/50 border-none focus-visible:ring-1"
                  />
                </div>
              </header>

              {/* Conversations List */}
              <div className="flex-1 overflow-auto p-4">
                <ConversationsList
                  conversations={filteredConversations}
                  onSelectConversation={handleSelectConversation}
                  selectedConversationId={selectedConversation?.id}
                  currentUserId={currentUserId}
                />
              </div>
            </motion.div>

            {/* Right Panel - Chat View */}
            <div className="flex-1 flex flex-col bg-muted/20 overflow-hidden">
              <AnimatePresence mode="wait">
                {selectedConversation ? (
                  <motion.div
                    key={selectedConversation.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    {(() => {
                      const partner = getConversationPartner(selectedConversation, currentUserId)
                      return (
                        <MessagingHeader
                          businessName={partner.name}
                          businessAvatar={partner.avatar}
                          isVerified={partner.isVerified}
                          isOnline={false}
                          onCall={handleCall}
                          onViewProfile={handleViewProfile}
                        />
                      )
                    })()}
                    <MessageThread
                      conversationId={selectedConversation.id}
                      currentUserId={currentUserId}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex items-center justify-center text-muted-foreground"
                    role="status"
                  >
                    <div className="text-center space-y-3 max-w-sm px-4">
                      <div className="relative">
                        <MessageSquare className="h-20 w-20 mx-auto opacity-20" aria-hidden="true" />
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="h-16 w-16 rounded-full bg-primary/5" />
                        </motion.div>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Your Messages</h3>
                      <p className="text-sm">Select a conversation to start chatting</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
      </div>
    </>
  )
}

export default Messages
