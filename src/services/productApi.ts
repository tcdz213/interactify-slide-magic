import type { Product, ProductListParams, ProductListResponse } from '@/types/product';
import { apiFetch } from '@/lib/api';

const BASE_URL = '/products';

export const productsApi = {
  async list(params: ProductListParams = {}): Promise<ProductListResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', String(params.page));
    if (params.limit) searchParams.append('limit', String(params.limit));
    if (params.status) searchParams.append('status', params.status);
    if (params.platform) searchParams.append('platform', params.platform);
    if (params.search) searchParams.append('search', params.search);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    return apiFetch<ProductListResponse>(`${BASE_URL}${query ? `?${query}` : ''}`);
  },

  async getById(id: string): Promise<{ data: Product }> {
    return apiFetch<{ data: Product }>(`${BASE_URL}/${id}`);
  },
};
