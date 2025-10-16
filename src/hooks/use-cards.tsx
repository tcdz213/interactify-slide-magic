import { useState, useEffect } from 'react'
import { cardApi, isAuthenticated } from '@/services/cardApi'
import { BusinessCard } from '@/types/business-card'
import { useToast } from '@/hooks/use-toast'

export const useCards = () => {
  const [cards, setCards] = useState<BusinessCard[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch user cards
  const fetchCards = async () => {
    if (!isAuthenticated()) {
      setCards([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const userCards = await cardApi.getUserCards()
      setCards(userCards)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cards'
      console.error('Cards fetch error:', errorMessage)
      setError(errorMessage)
      setCards([])
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch a single card by ID
  const fetchCardById = async (cardId: string): Promise<BusinessCard | null> => {
    try {
      const card = await cardApi.getCard(cardId)
      return card
    } catch (err) {
      console.error('Failed to fetch card:', err)
      return null
    }
  }

  // Delete a card
  const deleteCard = async (cardId: string) => {
    try {
      await cardApi.deleteCard(cardId)
      // Remove from local state
      setCards(prev => prev.filter(card => card._id !== cardId))
    } catch (err) {
      console.error('Failed to delete card:', err)
    }
  }

  // Toggle card visibility
  const toggleCardVisibility = async (cardId: string, isPublic: boolean) => {
    try {
      const updatedCard = await cardApi.toggleCardVisibility(cardId, isPublic)
      // Update local state
      setCards(prev => prev.map(card => 
        card._id === cardId ? updatedCard : card
      ))
    } catch (err) {
      console.error('Failed to toggle card visibility:', err)
    }
  }

  // Refresh cards
  const refreshCards = () => {
    fetchCards()
  }

  // Auto-fetch on mount
  useEffect(() => {
    fetchCards()
  }, [])

  return {
    cards,
    isLoading,
    error,
    fetchCards,
    fetchCardById,
    deleteCard,
    toggleCardVisibility,
    refreshCards
  }
}

export default useCards