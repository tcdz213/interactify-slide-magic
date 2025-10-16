import { toast } from "@/hooks/use-toast"
import { API_CONFIG } from "@/config/api"
import { errorHandler } from "@/utils/errorHandler"

// Types for domains API responses
export interface Keywords {
  ar: string[]
  fr: string[]
  en: string[]
}

export interface Subcategory {
  key: string
  category_key: string
  ar: string
  fr: string
  en: string
  keywords: Keywords
}

export interface Domain {
  key: string
  ar: string
  fr: string
  en: string
  keywords: Keywords
  subcategories: Subcategory[]
}

export interface DomainsResponse {
  domains: Domain[]
}

class DomainsApiService {
  /**
   * Get all available domains
   */
  async getAllDomains(): Promise<Domain[]> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/domains`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data: DomainsResponse = await response.json()
      return data.domains
    } catch (error) {
      // Silently log error - fallback domains will be used
      errorHandler.logError('domainsApi.getAllDomains', error)
      return []
    }
  }

  /**
   * Get specific domain by key
   */
  async getDomainByKey(domainKey: string): Promise<Domain> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/domains/${domainKey}`, {
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
      return data.domain
    } catch (error) {
      errorHandler.showApiError('getDomainByKey', 'Failed to load category details', error)
      throw error
    }
  }

  /**
   * Search domains by name and keywords (client-side filtering)
   */
  async searchDomains(searchTerm: string, language: 'ar' | 'fr' | 'en' = 'fr'): Promise<Domain[]> {
    try {
      const domains = await this.getAllDomains()
      
      if (!searchTerm.trim()) {
        return domains
      }

      const searchLower = searchTerm.toLowerCase()

      const filtered = domains.filter(domain => {
        const domainName = domain[language]?.toLowerCase() || ''
        const domainKeywords = domain.keywords?.[language] || []
        
        // Check domain name
        if (domainName.includes(searchLower)) return true
        
        // Check domain keywords
        if (domainKeywords.some(kw => kw.toLowerCase().includes(searchLower))) return true
        
        // Check subcategories
        const subdomainMatches = domain.subcategories.some(sub => {
          const subName = sub[language]?.toLowerCase() || ''
          const subKeywords = sub.keywords?.[language] || []
          
          return subName.includes(searchLower) || 
                 subKeywords.some(kw => kw.toLowerCase().includes(searchLower))
        })
        
        return subdomainMatches
      })

      return filtered
    } catch (error) {
      errorHandler.logError('domainsApi.searchDomains', error)
      return []
    }
  }

  /**
   * Create a new domain (Admin only)
   */
  async createDomain(domainData: {
    key: string
    ar: string
    fr: string
    en: string
    keywords: Keywords
    subcategories?: Omit<Subcategory, 'category_key'>[]
  }, token: string): Promise<Domain> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/domains`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(domainData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create domain"
      errorHandler.showApiError('createDomain', message, error)
      throw error
    }
  }

  /**
   * Update an existing domain (Admin only)
   */
  async updateDomain(domainKey: string, updates: {
    ar?: string
    fr?: string
    en?: string
    keywords?: Keywords
  }, token: string): Promise<Domain> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/domains/${domainKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update domain"
      errorHandler.showApiError('updateDomain', message, error)
      throw error
    }
  }

  /**
   * Delete a domain (Admin only)
   */
  async deleteDomain(domainKey: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/domains/${domainKey}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      errorHandler.showSuccess("Domain deleted successfully")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete domain"
      errorHandler.showApiError('deleteDomain', message, error)
      throw error
    }
  }

  /**
   * Add subcategory to domain (Admin only)
   */
  async addSubcategory(domainKey: string, subcategoryData: {
    key: string
    ar: string
    fr: string
    en: string
    keywords: Keywords
  }, token: string): Promise<Domain> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/domains/${domainKey}/subcategories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subcategoryData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      errorHandler.showSuccess("Subcategory added successfully")
      return data.data
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add subcategory"
      errorHandler.showApiError('addSubcategory', message, error)
      throw error
    }
  }

  /**
   * Update subcategory (Admin only)
   */
  async updateSubcategory(domainKey: string, subcategoryKey: string, updates: {
    ar?: string
    fr?: string
    en?: string
    keywords?: Keywords
  }, token: string): Promise<Domain> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/domains/${domainKey}/subcategories/${subcategoryKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      errorHandler.showSuccess("Subcategory updated successfully")
      return data.data
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update subcategory"
      errorHandler.showApiError('updateSubcategory', message, error)
      throw error
    }
  }

  /**
   * Delete subcategory (Admin only)
   */
  async deleteSubcategory(domainKey: string, subcategoryKey: string, token: string): Promise<Domain> {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/admin/domains/${domainKey}/subcategories/${subcategoryKey}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      errorHandler.showSuccess("Subcategory deleted successfully")
      return data.data
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete subcategory"
      errorHandler.showApiError('deleteSubcategory', message, error)
      throw error
    }
  }
}

// Export singleton instance
export const domainsApi = new DomainsApiService()