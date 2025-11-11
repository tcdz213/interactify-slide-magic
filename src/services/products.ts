import api, { handleApiError } from './api';
import { API_CONFIG } from '@/config/api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  category: string;
  images: string[];
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  currency?: string;
  stock: number;
  category: string;
}

export const productsService = {
  async getAll(): Promise<Product[]> {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.PRODUCTS.LIST);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getById(id: string): Promise<Product> {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.PRODUCTS.GET(id));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async create(data: CreateProductData): Promise<Product> {
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.PRODUCTS.CREATE, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async update(id: string, data: Partial<CreateProductData>): Promise<Product> {
    try {
      const response = await api.put(API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE(id), data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await api.delete(API_CONFIG.ENDPOINTS.PRODUCTS.DELETE(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async uploadImage(id: string, file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post(
        API_CONFIG.ENDPOINTS.PRODUCTS.UPLOAD_IMAGE(id),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.imageUrl;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
