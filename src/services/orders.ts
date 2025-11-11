import api, { handleApiError } from './api';
import { API_CONFIG } from '@/config/api';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  delivered: number;
  revenue: number;
}

export const ordersService = {
  async getAll(): Promise<Order[]> {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.ORDERS.LIST);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getById(id: string): Promise<Order> {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.ORDERS.GET(id));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    try {
      const response = await api.put(API_CONFIG.ENDPOINTS.ORDERS.UPDATE_STATUS(id), {
        status,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getStats(): Promise<OrderStats> {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.ORDERS.STATS);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
