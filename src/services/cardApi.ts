import { toast } from "@/hooks/use-toast"
import { 
  BusinessCard, 
  BusinessCardFormData, 
  BusinessCardUpdateData 
} from "@/types/business-card"
import { errorHandler } from "@/utils/errorHandler"

// Maintain backward compatibility aliases
export type ApiCard = BusinessCard
export type CreateCardData = BusinessCardFormData
export type UpdateCardData = BusinessCardUpdateData

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken')
}

// Create headers with auth token
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

// API base URL - using environment variable or fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://your-api-domain.com/api/v1' 
    : 'http://localhost:3000/api/v1')

// Helper to transform request data before sending to API
const prepareRequestData = (cardData: BusinessCardFormData | BusinessCardUpdateData): any => {
  // Convert subdomain_key to string for API (use first element if array)
  const subdomain = Array.isArray(cardData.subdomain_key) 
    ? cardData.subdomain_key[0] 
    : cardData.subdomain_key
  
  // Get primary phone from mobile_phones array
  const phone = cardData.mobile_phones && cardData.mobile_phones.length > 0 
    ? cardData.mobile_phones[0] 
    : ''
  
  // Convert location format
  const location = cardData.location || { lat: 0, lng: 0 }
  
  return {
    name: cardData.title, // API uses 'name' field
    title: cardData.title,
    company: cardData.company,
    domain_key: cardData.domain_key,
    subdomain: subdomain, // API uses 'subdomain' not 'subdomain_key'
    description: cardData.description || '',
    phone: phone, // Primary phone
    mobile_phones: cardData.mobile_phones || [],
    landline_phones: cardData.landline_phones || [],
    fax_numbers: cardData.fax_numbers || [],
    whatsapp: cardData.social_links?.whatsapp || phone, // Use social link or default to phone
    email: cardData.email || '',
    website: cardData.website || '',
    address: cardData.address || '',
    city: cardData.address ? cardData.address.split(',')[0] : '', // Extract city from address
    location: {
      lat: location.lat,
      lng: location.lng
    },
    work_hours: cardData.work_hours || '',
    languages: cardData.languages || [],
    tags: cardData.tags || [],
    social_links: cardData.social_links || {},
    ...('is_public' in cardData && { is_public: cardData.is_public })
  }
}

// Helper to transform API response to BusinessCard type
const transformApiResponse = (response: any): BusinessCard => {
  // Handle location format from API
  const location = response.location && typeof response.location === 'object' && 'lat' in response.location && 'lng' in response.location
    ? { lat: response.location.lat, lng: response.location.lng }
    : { lat: 0, lng: 0 }
  
  // Convert single phone to array
  const mobile_phones = response.phone ? [response.phone] : response.mobile_phones || []
  
  return {
    _id: response._id || response.id,
    user_id: response.user_id,
    title: response.name || response.title, // API returns 'name'
    company: response.company || '',
    domain_key: response.domain_key,
    subdomain_key: response.subdomain || response.subdomain_key || '', // API uses 'subdomain'
    description: response.description || '',
    mobile_phones: mobile_phones,
    landline_phones: response.landline_phones || [],
    fax_numbers: response.fax_numbers || [],
    email: response.email || response.contact?.email || '',
    website: response.website || response.contact?.website || '',
    address: response.address || response.location?.address || '',
    work_hours: response.hours ? JSON.stringify(response.hours) : response.work_hours || '',
    languages: response.languages || [],
    tags: response.tags || [],
    social_links: response.social_links || {},
    location: location,
    is_public: response.is_public ?? true,
    verified: response.is_verified || response.verified || false,
    scans: response.stats?.contact_clicks || response.scans || 0,
    views: response.stats?.views || response.views || 0,
    created_at: response.created_at,
    updated_at: response.updated_at
  }
}

class CardApiService {
  /**
   * Create a new card
   */
  async createCard(cardData: BusinessCardFormData): Promise<BusinessCard> {
    try {
      const requestData = prepareRequestData(cardData)
      
      const response = await fetch(`${API_BASE_URL}/dashboard/cards`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error?.message || errorData.message || `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      // API returns { success: true, data: {...}, message: "..." }
      const message = data.message || "Your business card has been created successfully."
      const responseCardData = data.data || data
      const card = transformApiResponse(responseCardData)
      
      errorHandler.showSuccess(message, "✅ Success!")

      return card
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create card"
      errorHandler.showApiError('createCard', errorMessage, error)
      throw error
    }
  }

  /**
   * Get all user cards
   */
  async getUserCards(): Promise<BusinessCard[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/cards`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error?.message || errorData.message || `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      // API returns { cards: [...], pagination: {...} }
      const cardsData = data.cards || data.data?.cards || (Array.isArray(data) ? data : [])
      
      return cardsData.map((card: any) => transformApiResponse(card))
    } catch (error) {
      errorHandler.logError('cardApi.getUserCards', error)
      throw error
    }
  }

  /**
   * Get a specific card by ID
   */
  async getCard(cardId: string): Promise<BusinessCard> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/cards/${cardId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error?.message || errorData.message || `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      // API may return direct card object or wrapped in data
      const cardData = data.data || data
      return transformApiResponse(cardData)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load card details"
      errorHandler.showApiError('getCard', errorMessage, error)
      throw error
    }
  }

  /**
   * Update an existing card
   */
  async updateCard(cardId: string, cardData: BusinessCardUpdateData): Promise<BusinessCard> {
    try {
      const requestData = prepareRequestData(cardData)
      
      const response = await fetch(`${API_BASE_URL}/dashboard/cards/${cardId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error?.message || errorData.message || `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      // API returns { success: true, data: {...}, message: "..." }
      const message = data.message || "Your business card has been updated successfully."
      const responseCardData = data.data || data
      const card = transformApiResponse(responseCardData)
      
      errorHandler.showSuccess(message, "Success!")

      return card
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update card"
      errorHandler.showApiError('updateCard', errorMessage, error)
      throw error
    }
  }

  /**
   * Delete a card
   */
  async deleteCard(cardId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/cards/${cardId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      errorHandler.showSuccess(data.message || "Your business card has been deleted successfully.", "Success!")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete card"
      errorHandler.showApiError('deleteCard', errorMessage, error)
      throw error
    }
  }

  /**
   * Toggle card public/private status
   */
  async toggleCardVisibility(cardId: string, isPublic: boolean): Promise<BusinessCard> {
    try {
      // Try PATCH endpoint first (recommended), fallback to PUT
      const endpoint = `${API_BASE_URL}/dashboard/cards/${cardId}/visibility`
      const fallbackEndpoint = `${API_BASE_URL}/dashboard/cards/${cardId}`
      
      let response = await fetch(endpoint, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_public: isPublic })
      })

      // If PATCH fails, try PUT as fallback
      if (!response.ok && response.status === 404) {
        response = await fetch(fallbackEndpoint, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ is_public: isPublic })
        })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error?.message || errorData.message || `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      // API returns { success: true, data: { id, is_public } }
      const cardData = data.data || data
      const card = transformApiResponse(cardData)
      
      errorHandler.showSuccess(data.message || `Card is now ${isPublic ? 'public' : 'private'}`, "Success!")

      return card
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update card visibility"
      errorHandler.showApiError('toggleCardVisibility', errorMessage, error)
      throw error
    }
  }
}

// Export singleton instance
export const cardApi = new CardApiService()

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken()
}

// Helper function to require authentication
export const requireAuth = (): string => {
  const token = getAuthToken()
  if (!token) {
    errorHandler.showApiError('requireAuth', 'Please sign in to continue')
    throw new Error('Authentication required')
  }
  return token
}