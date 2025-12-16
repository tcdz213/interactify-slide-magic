// Product types matching the API documentation

export type ProductPlatform = 'web' | 'android' | 'ios' | 'api' | 'desktop';
export type ProductStatus = 'active' | 'archived';

export interface Product {
  id: string;
  name: string;
  description: string;
  platforms: ProductPlatform[];
  ownerId: string;
  ownerName: string;
  status: ProductStatus;
  featuresCount: number;
  bugsCount: number;
  teamMembersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  platforms: ProductPlatform[];
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  platforms?: ProductPlatform[];
}

export interface ProductStats {
  totalFeatures: number;
  activeFeatures: number;
  completedFeatures: number;
  openBugs: number;
  resolvedBugs: number;
  activeSprintsCount: number;
  teamMembersCount: number;
  lastActivityAt: string;
}

export interface ProductTeamMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  role: string;
  joinedAt: string;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  status?: ProductStatus;
  platform?: ProductPlatform;
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ProductListResponse {
  data: Product[];
  pagination: PaginationInfo;
}
