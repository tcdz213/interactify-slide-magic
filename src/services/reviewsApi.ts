import { toast } from "@/hooks/use-toast"
import { API_CONFIG, getAuthHeaders } from "@/config/api"
import { errorHandler } from "@/utils/errorHandler"

export interface Review {
  id: string
  business_id: string
  user_id: string
  user_name: string
  user_avatar?: string
  rating: number
  title: string
  comment: string
  created_at: string
  updated_at: string
  helpful_count?: number
  verified_purchase?: boolean
}

export interface ReviewStats {
  average_rating: number
  total_reviews: number
  rating_distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

export interface CreateReviewData {
  business_id: string
  rating: number
  title: string
  comment: string
}

export interface UpdateReviewData {
  rating?: number
  title?: string
  comment?: string
}

class ReviewsApiService {
  /**
   * Get reviews for a specific business
   */
  async getBusinessReviews(businessId: string, page: number = 1, limit: number = 10): Promise<{ reviews: Review[], stats: ReviewStats }> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/businesses/${businessId}/reviews?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        reviews: data.reviews || [],
        stats: data.stats || {
          average_rating: 0,
          total_reviews: 0,
          rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
      }
    } catch (error) {
      errorHandler.logError('reviewsApi.getBusinessReviews', error)
      return {
        reviews: [],
        stats: {
          average_rating: 0,
          total_reviews: 0,
          rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
      }
    }
  }

  /**
   * Get user's reviews
   */
  async getUserReviews(): Promise<Review[]> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/reviews/user`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user reviews')
      }

      const data = await response.json()
      return data.reviews || []
    } catch (error) {
      errorHandler.logError('reviewsApi.getUserReviews', error)
      return []
    }
  }

  /**
   * Check if user has already reviewed this business
   */
  async getUserReviewForBusiness(businessId: string): Promise<Review | null> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/businesses/${businessId}/reviews/user`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null // No review found
        }
        throw new Error('Failed to check for existing review')
      }

      const data = await response.json()
      return data.review || null
    } catch (error) {
      errorHandler.logError('reviewsApi.getUserReviewForBusiness', error)
      return null
    }
  }

  /**
   * Create a new review
   */
  async createReview(reviewData: CreateReviewData): Promise<Review> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/reviews`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(reviewData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to create review')
      }

      const data = await response.json()
      
      errorHandler.showSuccess("Your review has been posted successfully.", "Success!")

      return data.review
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to post review"
      errorHandler.showApiError('createReview', errorMessage, error)
      throw error
    }
  }

  /**
   * Update an existing review
   */
  async updateReview(reviewId: string, reviewData: UpdateReviewData): Promise<Review> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/reviews/${reviewId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(reviewData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to update review')
      }

      const data = await response.json()
      
      errorHandler.showSuccess("Your review has been updated successfully.", "Success!")

      return data.review
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update review"
      errorHandler.showApiError('updateReview', errorMessage, error)
      throw error
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to delete review')
      }

      errorHandler.showSuccess("Your review has been deleted successfully.", "Success!")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete review"
      errorHandler.showApiError('deleteReview', errorMessage, error)
      throw error
    }
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to mark review as helpful')
      }

      errorHandler.showSuccess("This review has been marked as helpful.", "Thanks for your feedback!")
    } catch (error) {
      errorHandler.showApiError('markHelpful', "Failed to mark review as helpful", error)
      throw error
    }
  }
}

export const reviewsApi = new ReviewsApiService()
