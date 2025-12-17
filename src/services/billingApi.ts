import { apiFetch } from '@/lib/api';
import type {
  Plan,
  Subscription,
  Usage,
  Invoice,
  PaymentMethod,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
} from '@/types/billing';

export const billingApi = {
  getPlans: async (): Promise<Plan[]> => {
    const response = await apiFetch<{ data: Plan[] }>('/billing/plans');
    return response.data;
  },

  getSubscription: async (): Promise<Subscription> => {
    const response = await apiFetch<{ data: Subscription }>('/billing/subscription');
    return response.data;
  },

  createSubscription: async (data: CreateSubscriptionRequest): Promise<Subscription> => {
    const response = await apiFetch<{ data: Subscription }>('/billing/subscription', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  updateSubscription: async (data: UpdateSubscriptionRequest): Promise<Subscription> => {
    const response = await apiFetch<{ data: Subscription }>('/billing/subscription', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  cancelSubscription: async (): Promise<{ message: string }> => {
    const response = await apiFetch<{ data: { message: string } }>('/billing/subscription', {
      method: 'DELETE',
    });
    return response.data;
  },

  getUsage: async (): Promise<Usage> => {
    const response = await apiFetch<{ data: Usage }>('/billing/usage');
    return response.data;
  },

  getInvoices: async (): Promise<Invoice[]> => {
    const response = await apiFetch<{ data: Invoice[] }>('/billing/invoices');
    return response.data;
  },

  getInvoice: async (id: string): Promise<Invoice> => {
    const response = await apiFetch<{ data: Invoice }>(`/billing/invoices/${id}`);
    return response.data;
  },

  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await apiFetch<{ data: PaymentMethod[] }>('/billing/payment-methods');
    return response.data;
  },

  addPaymentMethod: async (token: string): Promise<PaymentMethod> => {
    const response = await apiFetch<{ data: PaymentMethod }>('/billing/payment-methods', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    return response.data;
  },

  deletePaymentMethod: async (id: string): Promise<void> => {
    await apiFetch(`/billing/payment-methods/${id}`, { method: 'DELETE' });
  },

  setDefaultPaymentMethod: async (id: string): Promise<PaymentMethod> => {
    const response = await apiFetch<{ data: PaymentMethod }>(`/billing/payment-methods/${id}/default`, {
      method: 'POST',
    });
    return response.data;
  },
};
