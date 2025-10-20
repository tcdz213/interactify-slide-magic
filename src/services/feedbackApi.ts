import { apiRequest } from '@/config/api';

export interface CreateFeedbackData {
  card_id: string;
  feedback_type: 'general' | 'bug' | 'feature' | 'improvement' | 'question';
  subject: string;
  message: string;
  email?: string;
  rating?: number;
}

export interface Feedback {
  id: string;
  card_id: string;
  user_id: string;
  feedback_type: string;
  subject: string;
  message: string;
  email?: string;
  rating?: number;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
  updated_at: string;
}

export const feedbackApi = {
  /**
   * Submit feedback for a business card
   */
  createFeedback: async (data: CreateFeedbackData): Promise<Feedback> => {
    return apiRequest<Feedback>('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get user's submitted feedback
   */
  getUserFeedback: async (): Promise<Feedback[]> => {
    return apiRequest<Feedback[]>('/feedback/user');
  },

  /**
   * Get feedback by ID (admin or owner only)
   */
  getFeedbackById: async (feedbackId: string): Promise<Feedback> => {
    return apiRequest<Feedback>(`/feedback/${feedbackId}`);
  },

  /**
   * Delete feedback (owner only)
   */
  deleteFeedback: async (feedbackId: string): Promise<void> => {
    return apiRequest<void>(`/feedback/${feedbackId}`, {
      method: 'DELETE',
    });
  },
};
