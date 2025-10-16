import { API_CONFIG, getAuthHeaders } from "@/config/api"
import { errorHandler } from "@/utils/errorHandler"

// Types for analytics API responses
export interface DashboardStats {
  total_cards: number
  total_views: number
  total_scans: number
  public_cards: number
  private_cards: number
  verified_cards: number
  pending_verification: number
  monthly_growth: {
    views: number
    scans: number
  }
}

export interface RecentActivity {
  card_id: string
  card_title: string
  action: string
  timestamp: string
  metadata?: {
    source?: string
    location?: string
  }
}

export interface CardAnalytics {
  card_id: string
  period: string
  summary: {
    total_views: number
    total_scans: number
    unique_visitors: number
    engagement_rate: number
    avg_daily_views: number
    peak_day: string
  }
  daily_metrics: Array<{
    date: string
    views: number
    scans: number
    unique_visitors: number
  }>
  traffic_sources: Array<{
    source: string
    visits: number
    percentage: number
  }>
}

class AnalyticsApiService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/dashboard/stats`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.stats
    } catch (error) {
      errorHandler.logError('analyticsApi.getDashboardStats', error)
      throw error
    }
  }

  /**
   * Get card performance analytics
   */
  async getCardAnalytics(cardId: string, period: '7d' | '30d' | '90d' = '30d'): Promise<CardAnalytics> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/dashboard/cards/${cardId}/analytics?period=${period}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      errorHandler.showApiError('getCardAnalytics', "Failed to load analytics data", error)
      throw error
    }
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/dashboard/activity?limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.recent_activity || []
    } catch (error) {
      errorHandler.logError('analyticsApi.getRecentActivity', error)
      // Silently fail for activity - not critical
      return []
    }
  }
}

// Export singleton instance
export const analyticsApi = new AnalyticsApiService()