import { toast } from "@/hooks/use-toast"
import { BusinessCard, toDisplayCard, BusinessCardDisplay } from "@/types/business-card"
import { sampleBusinesses } from "@/data/sampleBusinesses"
import { errorHandler } from "@/utils/errorHandler"

// Re-export types for backward compatibility
export type { BusinessCard, BusinessCardDisplay } from "@/types/business-card"

// Types for business search API
export interface BusinessSearchFilters {
  search?: string
  domain?: string
  subdomain?: string | string[]
  city?: string
  radius?: number
  rating?: number
  languages?: string[]
  availability?: string
  verified?: boolean
  is_public?: boolean
  tags?: string[]
  has_photo?: 'any' | 'with' | 'without'
  latitude?: number
  longitude?: number
}

export interface BusinessSearchParams extends BusinessSearchFilters {
  page?: number
  limit?: number
  sort_by?: 'relevance' | 'popular' | 'rating' | 'nearest' | 'newest'
  latitude?: number
  longitude?: number
}

export interface BusinessSearchResponse {
  businesses: BusinessCardDisplay[]
  pagination: {
    current_page: number
    total_pages: number
    total_businesses: number
    limit: number
    has_next: boolean
    has_prev: boolean
  }
  filters_applied: BusinessSearchFilters
  total_results: number
}

export interface FeaturedBusinessesResponse {
  featured: BusinessCardDisplay[]
  categories: Array<{
    domain_key: string
    count: number
    businesses: BusinessCardDisplay[]
  }>
}

// API base URL - using environment variable or fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://your-api-domain.com/api/v1' 
    : 'http://localhost:3000/api/v1')

class BusinessApiService {
  /**
   * Search for businesses with filters
   */
  async searchBusinesses(params: BusinessSearchParams): Promise<BusinessSearchResponse> {
    try {
      console.log('🔍 searchBusinesses called with params:', params);
      
      const queryParams = new URLSearchParams()
      
      // Map 'search' to 'q' for API compatibility (required by API spec)
      if (params.search?.trim()) {
        queryParams.append('q', params.search.trim())
      }
      
      // Build query parameters according to API spec
      Object.entries(params).forEach(([key, value]) => {
        // Skip 'search' as we already mapped it to 'q'
        if (key === 'search') return
        
        // Skip undefined, null, empty strings
        if (value === undefined || value === null || value === '') return
        
        // Skip empty arrays
        if (Array.isArray(value) && value.length === 0) return
        
        // Skip placeholder city values
        if (key === 'city' && (value === 'Selected Location' || value === 'Unknown')) return
        
        // Skip invalid latitude/longitude
        if (key === 'latitude' && (typeof value !== 'number' || isNaN(value))) return
        if (key === 'longitude' && (typeof value !== 'number' || isNaN(value))) return
        
        // Handle arrays: tags, languages, subdomain (join with comma per API spec)
        if (Array.isArray(value)) {
          const filtered = value.filter(v => v && v.toString().trim().length > 0);
          if (filtered.length > 0) {
            queryParams.append(key, filtered.join(','))
          }
        } 
        // Handle subdomain as string or array
        else if (key === 'subdomain' && typeof value === 'string') {
          queryParams.append(key, value)
        }
        // Handle numeric values (including 0)
        else if (typeof value === 'number') {
          queryParams.append(key, value.toString())
        }
        // Handle boolean values
        else if (typeof value === 'boolean') {
          queryParams.append(key, value.toString())
        }
        // Handle string values (trim whitespace)
        else if (typeof value === 'string' && value.trim()) {
          queryParams.append(key, value.trim())
        }
      })

      const finalUrl = `${API_BASE_URL}/businesses/search?${queryParams.toString()}`;
      console.log('🌐 Sending request to:', finalUrl);
      console.log('📦 Query params object:', Object.fromEntries(queryParams.entries()));

      const response = await fetch(finalUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Transform API response to display cards
      const transformedBusinesses = data.businesses?.map((business: any) => 
        toDisplayCard({
          _id: business._id || business.id,
          title: business.title || business.name || '',
          company: business.company || business.name || '',
          domain_key: business.domain_key || '',
          subdomain_key: business.subdomain_key || business.subdomain || '',
          description: business.description || '',
          mobile_phones: business.mobile_phones || [],
          landline_phones: business.landline_phones || [],
          fax_numbers: business.fax_numbers || [],
          email: business.email,
          website: business.website,
          address: business.address,
          location: business.location || (business.latitude && business.longitude ? { lat: business.latitude, lng: business.longitude } : { lat: 0, lng: 0 }),
          work_hours: business.work_hours,
          languages: business.languages || [],
          tags: business.tags || [],
          social_links: business.social_links || {},
          is_public: business.is_public !== false,
          verified: business.is_verified || business.verified || false,
          scans: business.scans || 0,
          views: business.views || 0,
          created_at: business.created_at || new Date().toISOString(),
          updated_at: business.updated_at || new Date().toISOString()
        })
      ) || []

      return {
        businesses: transformedBusinesses,
        pagination: data.pagination || {
          current_page: 1,
          total_pages: 1,
          total_businesses: transformedBusinesses.length,
          limit: params.limit || 20,
          has_next: false,
          has_prev: false
        },
        filters_applied: data.filters_applied || {},
        total_results: data.total_results || transformedBusinesses.length
      }
    } catch (error) {
      // Silently log and use fallback data
      errorHandler.logError('businessApi.searchBusinesses', error)
      
      // Use sample data as fallback
      let filteredBusinesses = [...sampleBusinesses]
      
      // Apply filters to sample data
      if (params.domain) {
        filteredBusinesses = filteredBusinesses.filter(b => b.domain_key === params.domain)
      }
      if (params.city) {
        filteredBusinesses = filteredBusinesses.filter(b => b.address?.toLowerCase().includes(params.city.toLowerCase()))
      }
      if (params.search) {
        const searchLower = params.search.toLowerCase()
        filteredBusinesses = filteredBusinesses.filter(b => 
          b.title?.toLowerCase().includes(searchLower) ||
          b.company?.toLowerCase().includes(searchLower) ||
          b.description?.toLowerCase().includes(searchLower) ||
          b.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        )
      }
      if (params.verified) {
        filteredBusinesses = filteredBusinesses.filter(b => b.verified)
      }
      
      return {
        businesses: filteredBusinesses,
        pagination: {
          current_page: 1,
          total_pages: 1,
          total_businesses: filteredBusinesses.length,
          limit: params.limit || 20,
          has_next: false,
          has_prev: false
        },
        filters_applied: params,
        total_results: filteredBusinesses.length
      }
    }
  }

  /**
   * Get featured businesses for home page
   */
  async getFeaturedBusinesses(latitude?: number, longitude?: number, radius?: number): Promise<FeaturedBusinessesResponse> {
    try {
      const params = new URLSearchParams()
      
      if (latitude !== undefined && longitude !== undefined) {
        params.append('latitude', latitude.toString())
        params.append('longitude', longitude.toString())
        if (radius !== undefined) {
          params.append('radius', radius.toString())
        }
      }

      console.log(latitude, longitude, radius);
      
      const queryString = params.toString() ? `?${params.toString()}` : ''
      const response = await fetch(`${API_BASE_URL}/businesses/featured${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      const transformFeatured = (businesses: any[]) => 
        businesses?.map((business: any) => 
          toDisplayCard({
            _id: business._id || business.id,
            title: business.title || business.name || '',
            company: business.company || business.name || '',
            domain_key: business.domain_key || '',
            subdomain_key: business.subdomain_key || business.subdomain || '',
            description: business.description || '',
            mobile_phones: business.mobile_phones || [],
            landline_phones: business.landline_phones || [],
            fax_numbers: business.fax_numbers || [],
            email: business.email,
            website: business.website,
            address: business.address,
            location: business.location || (business.latitude && business.longitude ? { lat: business.latitude, lng: business.longitude } : { lat: 0, lng: 0 }),
            work_hours: business.work_hours,
            languages: business.languages || [],
            tags: business.tags || [],
            social_links: business.social_links || {},
            is_public: business.is_public !== false,
            verified: business.is_verified || business.verified || false,
            scans: business.scans || 0,
            views: business.views || 0,
            created_at: business.created_at || new Date().toISOString(),
            updated_at: business.updated_at || new Date().toISOString()
          })
        ) || []

      const featured = transformFeatured(data.featured)
      const categories = data.categories?.map((category: any) => ({
        ...category,
        businesses: transformFeatured(category.businesses)
      })) || []

      return { featured, categories }
    } catch (error) {
      errorHandler.logError('businessApi.getFeaturedBusinesses', error)
      // Use sample data as fallback
      return {
        featured: sampleBusinesses.slice(0, 6),
        categories: []
      }
    }
  }

  /**
   * Get business by ID (public view)
   */
  async getBusinessById(businessId: string): Promise<BusinessCardDisplay> {
    try {
      const response = await fetch(`${API_BASE_URL}/businesses/${businessId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const business = await response.json()
      
      return toDisplayCard({
        _id: business._id || business.id,
        title: business.title || business.name || '',
        company: business.company || business.name || '',
        domain_key: business.domain_key || '',
        subdomain_key: business.subdomain_key || business.subdomain || '',
        description: business.description || '',
        mobile_phones: business.mobile_phones || [],
        landline_phones: business.landline_phones || [],
        fax_numbers: business.fax_numbers || [],
        email: business.email,
        website: business.website,
        address: business.address,
        location: business.location || (business.latitude && business.longitude ? { lat: business.latitude, lng: business.longitude } : { lat: 0, lng: 0 }),
        work_hours: business.work_hours,
        languages: business.languages || [],
        tags: business.tags || [],
        social_links: business.social_links || {},
        is_public: business.is_public !== false,
        verified: business.is_verified || business.verified || false,
        scans: business.scans || 0,
        views: business.views || 0,
        created_at: business.created_at || new Date().toISOString(),
        updated_at: business.updated_at || new Date().toISOString()
      })
    } catch (error) {
      errorHandler.showApiError('getBusinessById', 'Failed to load business details', error)
      throw error
    }
  }

  /**
   * Get businesses by location (nearest)
   */
  async getNearbyBusinesses(latitude: number, longitude: number, radius: number = 10, limit: number = 20): Promise<BusinessCardDisplay[]> {
    try {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius: radius.toString(),
        limit: limit.toString()
      })

      const response = await fetch(`${API_BASE_URL}/businesses/search?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return []
      }

      const data = await response.json()
      
      return data.businesses?.map((business: any) => 
        toDisplayCard({
          _id: business._id || business.id,
          title: business.title || business.name || '',
          company: business.company || business.name || '',
          domain_key: business.domain_key || '',
          subdomain_key: business.subdomain_key || business.subdomain || '',
          description: business.description || '',
          mobile_phones: business.mobile_phones || [],
          landline_phones: business.landline_phones || [],
          fax_numbers: business.fax_numbers || [],
          email: business.email,
          website: business.website,
          address: business.address,
          location: business.location || (business.latitude && business.longitude ? { lat: business.latitude, lng: business.longitude } : { lat: 0, lng: 0 }),
          work_hours: business.work_hours,
          languages: business.languages || [],
          tags: business.tags || [],
          social_links: business.social_links || {},
          is_public: business.is_public !== false,
          verified: business.is_verified || business.verified || false,
          scans: business.scans || 0,
          views: business.views || 0,
          created_at: business.created_at || new Date().toISOString(),
          updated_at: business.updated_at || new Date().toISOString()
        })
      ) || []
    } catch (error) {
      errorHandler.logError('businessApi.getNearbyBusinesses', error)
      return []
    }
  }

  /**
   * Record business view (analytics)
   */
  async recordView(businessId: string, source: string = 'browse'): Promise<void> {
    try {
      // For now, just silently succeed - can add analytics endpoint later
      console.debug('View recorded for business:', businessId, source)
    } catch (error) {
      console.debug('Failed to record view:', error)
    }
  }

  /**
   * Record business scan (QR code scan)
   */
  async recordScan(businessId: string, source: string = 'qr_code'): Promise<void> {
    try {
      // For now, just silently succeed - can add analytics endpoint later
      console.debug('Scan recorded for business:', businessId, source)
    } catch (error) {
      console.debug('Failed to record scan:', error)
    }
  }
}

// Export singleton instance
export const businessApi = new BusinessApiService()