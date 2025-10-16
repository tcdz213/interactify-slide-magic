/**
 * Unified Business Card Type System
 * Single source of truth for all card data structures
 */

// Social media platforms supported
export interface SocialLinks {
  whatsapp?: string
  instagram?: string
  linkedin?: string
  twitter?: string
  snapchat?: string
  tiktok?: string
  facebook?: string
}

// Location data
export interface Location {
  lat?: number
  lng?: number
}

// Core business card structure used across the app
export interface BusinessCard {
  // MongoDB ID (primary identifier)
  _id: string
  
  // User reference
  user_id?: string
  
  // Basic information
  title: string
  company: string
  domain_key: string
  subdomain_key: string | string[] // Support both single and multiple subdomains
  description: string
  
  // Contact information (arrays for multiple entries)
  mobile_phones: string[]
  landline_phones: string[]
  fax_numbers: string[]
  email?: string
  website?: string
  
  // Location
  address?: string
  location?: Location
  
  // Additional information
  work_hours?: string
  languages: string[]
  tags: string[]
  social_links: SocialLinks
  
  // Status and metadata
  is_public: boolean
  verified: boolean
  scans: number
  views: number
  created_at: string
  updated_at: string
}

// Form data for creating/updating cards (excludes system fields)
export interface BusinessCardFormData {
  title: string
  company: string
  domain_key: string
  subdomain_key: string | string[] // Support both single and multiple subdomains
  description?: string
  mobile_phones: string[]
  landline_phones: string[]
  fax_numbers: string[]
  email?: string
  website?: string
  address?: string
  work_hours?: string
  languages: string[]
  tags: string[]
  social_links: SocialLinks
  location?: Location
}

// Update data (can include visibility toggle)
export interface BusinessCardUpdateData extends BusinessCardFormData {
  is_public?: boolean
}

// Display card for UI components (with computed fields)
export interface BusinessCardDisplay extends BusinessCard {
  // Computed field for backward compatibility
  phone: string
  // Legacy ID field for components that expect number
  id: string | number
}

// Helper function to get primary phone number
export const getPrimaryPhone = (card: BusinessCard): string => {
  if (card.mobile_phones && card.mobile_phones.length > 0) {
    return card.mobile_phones[0]
  }
  if (card.landline_phones && card.landline_phones.length > 0) {
    return card.landline_phones[0]
  }
  return ''
}

// Helper function to transform API card to display card
export const toDisplayCard = (card: BusinessCard): BusinessCardDisplay => {
  return {
    ...card,
    id: card._id,
    phone: getPrimaryPhone(card)
  }
}

// Helper function to extract form data from card
export const toFormData = (card: BusinessCard): BusinessCardFormData => {
  return {
    title: card.title,
    company: card.company,
    domain_key: card.domain_key,
    subdomain_key: card.subdomain_key,
    description: card.description,
    mobile_phones: card.mobile_phones,
    landline_phones: card.landline_phones,
    fax_numbers: card.fax_numbers,
    email: card.email,
    website: card.website,
    address: card.address,
    work_hours: card.work_hours,
    languages: card.languages,
    tags: card.tags,
    social_links: card.social_links,
    location: card.location
  }
}
