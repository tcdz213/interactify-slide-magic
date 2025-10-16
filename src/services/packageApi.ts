import { API_CONFIG, getAuthHeaders } from '@/config/api';
import { 
  Package, 
  UserPackage, 
  PackageUsage, 
  CreatePackageData, 
  UpdatePackageData,
  BoostCard 
} from '@/types/package';

class PackageApiService {
  // Admin: Get all packages
  async getAllPackages(): Promise<Package[]> {
    const response = await fetch(`${API_CONFIG.baseURL}/admin/packages`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch packages');
    }

    return response.json();
  }

  // Admin: Create package
  async createPackage(data: CreatePackageData): Promise<Package> {
    const response = await fetch(`${API_CONFIG.baseURL}/admin/packages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create package');
    }

    return response.json();
  }

  // Admin: Update package
  async updatePackage(id: string, data: UpdatePackageData): Promise<Package> {
    const response = await fetch(`${API_CONFIG.baseURL}/admin/packages/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update package');
    }

    return response.json();
  }

  // Admin: Delete package
  async deletePackage(id: string): Promise<void> {
    const response = await fetch(`${API_CONFIG.baseURL}/admin/packages/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete package');
    }
  }

  // Public: Get available packages
  async getAvailablePackages(): Promise<Package[]> {
    const response = await fetch(`${API_CONFIG.baseURL}/packages`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch available packages');
    }

    return response.json();
  }

  // User: Get current subscription
  async getCurrentSubscription(): Promise<UserPackage> {
    const response = await fetch(`${API_CONFIG.baseURL}/subscriptions/current`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch current subscription');
    }

    return response.json();
  }

  // User: Get package usage
  async getPackageUsage(): Promise<PackageUsage> {
    const response = await fetch(`${API_CONFIG.baseURL}/subscriptions/usage`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch package usage');
    }

    return response.json();
  }

  // User: Subscribe to package
  async subscribeToPackage(packageId: string, paymentMethodId?: string): Promise<UserPackage> {
    const response = await fetch(`${API_CONFIG.baseURL}/subscriptions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ packageId, paymentMethodId }),
    });

    if (!response.ok) {
      throw new Error('Failed to subscribe to package');
    }

    return response.json();
  }

  // User: Cancel subscription
  async cancelSubscription(reason?: string): Promise<void> {
    const response = await fetch(`${API_CONFIG.baseURL}/subscriptions/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason, cancelImmediately: false }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }
  }

  // User: Boost card
  async boostCard(cardId: string, duration: number): Promise<BoostCard> {
    const response = await fetch(`${API_CONFIG.baseURL}/cards/${cardId}/boost`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ duration }),
    });

    if (!response.ok) {
      throw new Error('Failed to boost card');
    }

    return response.json();
  }

  // User: Get active boosts
  async getActiveBoosts(): Promise<BoostCard[]> {
    const response = await fetch(`${API_CONFIG.baseURL}/boosts/active`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch active boosts');
    }

    return response.json();
  }

  // Admin: Get all user subscriptions
  async getAllSubscriptions(page = 1, limit = 20): Promise<{ data: UserPackage[], pagination: any }> {
    const response = await fetch(
      `${API_CONFIG.baseURL}/admin/subscriptions?page=${page}&limit=${limit}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch subscriptions');
    }

    return response.json();
  }

  // Admin: Schedule package activation/deactivation
  async schedulePackage(id: string, activateAt?: string, deactivateAt?: string): Promise<Package> {
    const response = await fetch(`${API_CONFIG.baseURL}/admin/packages/${id}/schedule`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ scheduledActivateAt: activateAt, scheduledDeactivateAt: deactivateAt }),
    });

    if (!response.ok) {
      throw new Error('Failed to schedule package');
    }

    return response.json();
  }

  // Admin: Get revenue report
  async getRevenueReport(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await fetch(`${API_CONFIG.baseURL}/admin/packages/revenue-report?${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch revenue report');
    }

    return response.json();
  }

  // Admin: Get plan usage statistics
  async getPlanUsageStats(): Promise<any> {
    const response = await fetch(`${API_CONFIG.baseURL}/admin/packages/usage-stats`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plan usage stats');
    }

    return response.json();
  }

  // Admin: Get subscribers by package
  async getSubscribersByPackage(packageId: string, page = 1, limit = 20): Promise<{ data: any[], pagination: any }> {
    const response = await fetch(
      `${API_CONFIG.baseURL}/admin/packages/${packageId}/subscribers?page=${page}&limit=${limit}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch subscribers');
    }

    return response.json();
  }

  // Admin: Send renewal reminder
  async sendRenewalReminder(userId: string, packageId: string): Promise<void> {
    const response = await fetch(`${API_CONFIG.baseURL}/admin/subscriptions/send-reminder`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, packageId, type: 'renewal' }),
    });

    if (!response.ok) {
      throw new Error('Failed to send renewal reminder');
    }
  }

  // Admin: Send upgrade offer
  async sendUpgradeOffer(userId: string, targetPackageId: string): Promise<void> {
    const response = await fetch(`${API_CONFIG.baseURL}/admin/subscriptions/send-reminder`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, packageId: targetPackageId, type: 'upgrade' }),
    });

    if (!response.ok) {
      throw new Error('Failed to send upgrade offer');
    }
  }

  // Admin: Export billing data
  async exportBillingData(startDate?: string, endDate?: string): Promise<Blob> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await fetch(`${API_CONFIG.baseURL}/admin/packages/export-billing?${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to export billing data');
    }

    return response.blob();
  }
}

export const packageApi = new PackageApiService();
