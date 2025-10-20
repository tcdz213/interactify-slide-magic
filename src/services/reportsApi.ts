import { apiRequest } from '@/config/api';

export interface CreateReportData {
  card_id: string;
  report_type: 'inappropriate' | 'incorrect' | 'spam' | 'copyright' | 'other';
  details?: string;
}

export interface Report {
  id: string;
  card_id: string;
  user_id: string;
  report_type: string;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  updated_at: string;
}

export const reportsApi = {
  /**
   * Submit a report for a business card
   */
  createReport: async (data: CreateReportData): Promise<Report> => {
    return apiRequest<Report>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get user's submitted reports
   */
  getUserReports: async (): Promise<Report[]> => {
    return apiRequest<Report[]>('/reports/user');
  },

  /**
   * Get report by ID (admin or owner only)
   */
  getReportById: async (reportId: string): Promise<Report> => {
    return apiRequest<Report>(`/reports/${reportId}`);
  },

  /**
   * Delete a report (owner only)
   */
  deleteReport: async (reportId: string): Promise<void> => {
    return apiRequest<void>(`/reports/${reportId}`, {
      method: 'DELETE',
    });
  },
};
