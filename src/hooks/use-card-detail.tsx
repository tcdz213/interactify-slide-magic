import { useState, useEffect } from 'react'
import { cardApi } from '@/services/cardApi'
import { businessApi } from '@/services/businessApi'
import { BusinessCardDisplay, toDisplayCard } from '@/types/business-card'

interface UseCardDetailOptions {
  cardId: string | undefined
  currentUserId: string | null
}

export const useCardDetail = ({ cardId, currentUserId }: UseCardDetailOptions) => {
  const [card, setCard] = useState<BusinessCardDisplay | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwnCard, setIsOwnCard] = useState(false)

  useEffect(() => {
    const loadCard = async () => {
      if (!cardId) return

      setLoading(true)
      setError(null)

      try {
        let businessCard: BusinessCardDisplay
        let isOwn = false
        
        // First try to fetch as user's own card (authenticated endpoint)
        try {
          const userCard = await cardApi.getCard(cardId)
          businessCard = toDisplayCard(userCard)
          isOwn = true
        } catch (authError) {
          // If auth fails, try public business endpoint
          businessCard = await businessApi.getBusinessById(cardId)
        }
        
        setCard(businessCard)
        setIsOwnCard(isOwn)
        
        // Record view only for public cards (not user's own cards)
        if (!isOwn && (!businessCard.user_id || businessCard.user_id !== currentUserId)) {
          await businessApi.recordView(businessCard._id, 'direct_link')
        }
      } catch (error) {
        console.error('Failed to load card:', error)
        setError('Failed to load business card')
      } finally {
        setLoading(false)
      }
    }

    loadCard()
  }, [cardId, currentUserId])

  return {
    card,
    loading,
    error,
    isOwnCard,
    refetch: () => {
      if (cardId) {
        setLoading(true)
        // Re-run the effect by updating a dependency
      }
    }
  }
}

export default useCardDetail
