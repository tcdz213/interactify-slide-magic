import { toast } from "@/hooks/use-toast"
import { API_CONFIG, getAuthHeaders } from "@/config/api"
import { errorHandler } from "@/utils/errorHandler"

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: 'admin' | 'moderator' | 'user';
  status: 'active' | 'suspended';
  card_count: number;
  created_at: string;
}

export interface AdminCard {
  id: string;
  name: string;
  title: string;
  company: string;
  domain: string;
  subdomain_key?: string[];
  tags?: string[];
  is_public: boolean;
  is_flagged?: boolean;
  flag_reason?: string;
  view_count: number;
  scan_count?: number;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
  scheduled_publish_at?: string | null;
  scheduled_expire_at?: string | null;
  user_id: string;
  user_email: string;
}

export interface AdminReport {
  id: string;
  card_id: string;
  card_title: string;
  user_id: string;
  user_name: string;
  user_email: string;
  report_type: 'inappropriate' | 'incorrect' | 'spam' | 'copyright' | 'other';
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  admin_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportsResponse {
  reports: AdminReport[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_reports: number;
    per_page: number;
  };
  stats: {
    pending: number;
    resolved: number;
    dismissed: number;
  };
}

export interface AdminStats {
  totalUsers: number;
  totalCards: number;
  totalDomains: number;
  totalReports: number;
  activeUsers: number;
  pendingReviews: number;
  monthlyGrowth: number;
  verifiedCards: number;
  premiumUsers: number;
}

export interface AnalyticsData {
  date: string;
  views: number;
  cards: number;
  users: number;
}

export const adminApi = {
  // Check if current user is admin
  async checkAdminRole(): Promise<boolean> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/check-role`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) return false
      
      const data = await response.json()
      return data.isAdmin === true
    } catch (error) {
      errorHandler.logError('adminApi.checkAdminRole', error)
      return false
    }
  },

  // Fetch all users with their roles
  async getUsers(): Promise<AdminUser[]> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/users`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to fetch users')

      const data = await response.json()
      return data.users || []
    } catch (error) {
      errorHandler.showApiError('getUsers', "Failed to load users", error)
      throw error
    }
  },

  // Fetch all business cards
  async getCards(): Promise<AdminCard[]> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/cards`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to fetch cards')

      const data = await response.json()
      return data.cards || []
    } catch (error) {
      errorHandler.showApiError('getCards', "Failed to load cards", error)
      throw error
    }
  },

  // Fetch all reports with pagination and filters
  async getReports(params?: {
    page?: number;
    limit?: number;
    status?: 'all' | 'pending' | 'resolved' | 'dismissed';
    report_type?: 'all' | 'inappropriate' | 'incorrect' | 'spam' | 'copyright' | 'other';
  }): Promise<ReportsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.limit) queryParams.append('limit', String(params.limit));
      if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params?.report_type && params.report_type !== 'all') queryParams.append('report_type', params.report_type);

      const url = `${API_CONFIG.baseURL}/admin/reports${queryParams.toString() ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to fetch reports')

      const data = await response.json()
      return {
        reports: data.reports || [],
        pagination: data.pagination || {
          current_page: 1,
          total_pages: 1,
          total_reports: 0,
          per_page: 50
        },
        stats: data.stats || {
          pending: 0,
          resolved: 0,
          dismissed: 0
        }
      }
    } catch (error) {
      errorHandler.showApiError('getReports', "Failed to load reports", error)
      throw error
    }
  },

  // Get dashboard stats
  async getStats(): Promise<AdminStats> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/stats`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to fetch stats')

      const data = await response.json()
      return data.stats
    } catch (error) {
      errorHandler.logError('adminApi.getStats', error)
      throw error
    }
  },

  // Get analytics data
  async getAnalytics(days: number = 30): Promise<AnalyticsData[]> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/analytics?days=${days}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to fetch analytics')

      const data = await response.json()
      return data.analytics || []
    } catch (error) {
      errorHandler.logError('adminApi.getAnalytics', error)
      throw error
    }
  },

  // Update user role
  async updateUserRole(userId: string, role: 'admin' | 'moderator' | 'user'): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role })
      })

      if (!response.ok) throw new Error('Failed to update user role')

      toast({
        title: "Success",
        description: "User role updated successfully"
      })
    } catch (error) {
      console.error('Update role error:', error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      })
      throw error
    }
  },

  // Suspend/unsuspend user
  async toggleUserStatus(userId: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to toggle user status')

      errorHandler.showSuccess("User status updated successfully", "Success")
    } catch (error) {
      errorHandler.showApiError('toggleUserStatus', "Failed to toggle user status", error)
      throw error
    }
  },

  // Soft delete business card
  async deleteCard(cardId: string, permanent: boolean = false): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/cards/${cardId}${permanent ? '?permanent=true' : ''}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to delete card')

      errorHandler.showSuccess(permanent ? "Card permanently deleted" : "Card moved to trash", "Success")
    } catch (error) {
      errorHandler.showApiError('deleteCard', "Failed to delete card", error)
      throw error
    }
  },

  // Restore deleted card
  async restoreCard(cardId: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/cards/${cardId}/restore`, {
        method: 'POST',
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to restore card')

      errorHandler.showSuccess("Card restored successfully", "Success")
    } catch (error) {
      errorHandler.showApiError('restoreCard', "Failed to restore card", error)
      throw error
    }
  },

  // Flag/unflag card
  async toggleCardFlag(cardId: string, flag: boolean, reason?: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/cards/${cardId}/flag`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_flagged: flag, flag_reason: reason })
      })

      if (!response.ok) throw new Error('Failed to flag card')

      errorHandler.showSuccess(flag ? "Card flagged successfully" : "Card unflagged successfully", "Success")
    } catch (error) {
      errorHandler.showApiError('toggleCardFlag', "Failed to flag card", error)
      throw error
    }
  },

  // Update card tags
  async updateCardTags(cardId: string, tags: string[]): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/cards/${cardId}/tags`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ tags })
      })

      if (!response.ok) throw new Error('Failed to update tags')

      errorHandler.showSuccess("Tags updated successfully", "Success")
    } catch (error) {
      errorHandler.showApiError('updateCardTags', "Failed to update tags", error)
      throw error
    }
  },

  // Schedule card publishing/expiration
  async scheduleCard(cardId: string, publishAt?: string, expireAt?: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/cards/${cardId}/schedule`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          scheduled_publish_at: publishAt,
          scheduled_expire_at: expireAt
        })
      })

      if (!response.ok) throw new Error('Failed to schedule card')

      errorHandler.showSuccess("Card schedule updated successfully", "Success")
    } catch (error) {
      errorHandler.showApiError('scheduleCard', "Failed to schedule card", error)
      throw error
    }
  },

  // Get card analytics
  async getCardAnalytics(cardId: string, period: '7d' | '30d' | '90d' = '30d'): Promise<any> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/cards/${cardId}/analytics?period=${period}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to fetch analytics')

      const data = await response.json()
      return data.analytics
    } catch (error) {
      errorHandler.logError('adminApi.getCardAnalytics', error)
      throw error
    }
  },

  // Export cards data
  async exportCards(filters?: { 
    domain?: string; 
    flagged?: boolean; 
    deleted?: boolean;
    tags?: string[];
  }): Promise<Blob> {
    try {
      const params = new URLSearchParams()
      if (filters?.domain) params.append('domain', filters.domain)
      if (filters?.flagged !== undefined) params.append('flagged', String(filters.flagged))
      if (filters?.deleted !== undefined) params.append('deleted', String(filters.deleted))
      if (filters?.tags?.length) params.append('tags', filters.tags.join(','))

      const response = await fetch(`${API_CONFIG.baseURL}/admin/cards/export?${params}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to export cards')

      return await response.blob()
    } catch (error) {
      errorHandler.showApiError('exportCards', "Failed to export cards", error)
      throw error
    }
  },

  // Update report status with admin notes
  async updateReportStatus(
    reportId: string, 
    status: 'resolved' | 'dismissed',
    adminNotes?: string
  ): Promise<AdminReport> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          status,
          admin_notes: adminNotes 
        })
      })

      if (!response.ok) throw new Error('Failed to update report status')

      const data = await response.json()
      errorHandler.showSuccess("Report status updated successfully", "Success")
      return data.report
    } catch (error) {
      errorHandler.showApiError('updateReportStatus', "Failed to update report status", error)
      throw error
    }
  },

  // Create new user
  async createUser(userData: { email: string; fullName: string; role: 'admin' | 'moderator' | 'user' }): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      })

      if (!response.ok) throw new Error('Failed to create user')

      errorHandler.showSuccess("User created successfully", "Success")
    } catch (error) {
      errorHandler.showApiError('createUser', "Failed to create user", error)
      throw error
    }
  },

  // Reviews Management
  async getAllReviews(): Promise<any[]> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/reviews`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to fetch reviews')

      const data = await response.json()
      return data.reviews || []
    } catch (error) {
      errorHandler.showApiError('getAllReviews', "Failed to load reviews", error)
      throw error
    }
  },

  async deleteReview(reviewId: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to delete review')

      errorHandler.showSuccess("Review deleted successfully", "Success")
    } catch (error) {
      errorHandler.showApiError('deleteReview', "Failed to delete review", error)
      throw error
    }
  },

  // Feedback Management
  async getAllFeedback(): Promise<any[]> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/feedback`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to fetch feedback')

      const data = await response.json()
      return data.feedback || []
    } catch (error) {
      errorHandler.showApiError('getAllFeedback', "Failed to load feedback", error)
      throw error
    }
  },

  async updateFeedbackStatus(feedbackId: string, status: 'pending' | 'reviewed' | 'resolved'): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/feedback/${feedbackId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      })

      if (!response.ok) throw new Error('Failed to update feedback status')

      errorHandler.showSuccess("Feedback status updated successfully", "Success")
    } catch (error) {
      errorHandler.showApiError('updateFeedbackStatus', "Failed to update feedback status", error)
      throw error
    }
  },

  // Subscription Management
  async getAllSubscriptions(): Promise<any[]> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/subscriptions`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to fetch subscriptions')

      const data = await response.json()
      return data.subscriptions || []
    } catch (error) {
      errorHandler.showApiError('getAllSubscriptions', "Failed to load subscriptions", error)
      throw error
    }
  },

  async updateSubscription(userId: string, plan: 'free' | 'pro' | 'premium', expiresAt?: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/subscriptions/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ plan, expiresAt })
      })

      if (!response.ok) throw new Error('Failed to update subscription')

      errorHandler.showSuccess("Subscription updated successfully", "Success")
    } catch (error) {
      errorHandler.showApiError('updateSubscription', "Failed to update subscription", error)
      throw error
    }
  },

  async cancelSubscription(userId: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/subscriptions/${userId}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to cancel subscription')

      errorHandler.showSuccess("Subscription cancelled successfully", "Success")
    } catch (error) {
      errorHandler.showApiError('cancelSubscription', "Failed to cancel subscription", error)
      throw error
    }
  },
};
