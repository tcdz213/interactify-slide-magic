import { BusinessSearchFilters } from "@/services/businessApi";

/**
 * Parse filters from URL query parameters
 * Handles all API-compatible parameters according to SEARCH_API.md spec
 */
export const parseFiltersFromURL = (searchParams: URLSearchParams): BusinessSearchFilters => {
  const filters: BusinessSearchFilters = {};
  
  // Text search (q parameter)
  if (searchParams.has('q')) {
    const q = searchParams.get('q')?.trim();
    if (q) filters.search = q;
  }
  
  // Category filters
  if (searchParams.has('domain')) {
    const domain = searchParams.get('domain')?.trim();
    if (domain) filters.domain = domain;
  }
  
  if (searchParams.has('subdomain')) {
    const subdomains = searchParams.get('subdomain')?.split(',').map(s => s.trim()).filter(Boolean) || [];
    if (subdomains.length > 0) {
      filters.subdomain = subdomains.length === 1 ? subdomains[0] : subdomains;
    }
  }
  
  // Location filters
  if (searchParams.has('city')) {
    const city = searchParams.get('city')?.trim();
    // Exclude placeholder values
    if (city && city !== 'Selected Location' && city !== 'Unknown') {
      filters.city = city;
    }
  }
  
  if (searchParams.has('latitude')) {
    const lat = parseFloat(searchParams.get('latitude') || '');
    if (!isNaN(lat) && lat >= -90 && lat <= 90) {
      filters.latitude = lat;
    }
  }
  
  if (searchParams.has('longitude')) {
    const lng = parseFloat(searchParams.get('longitude') || '');
    if (!isNaN(lng) && lng >= -180 && lng <= 180) {
      filters.longitude = lng;
    }
  }
  
  if (searchParams.has('radius')) {
    const radius = parseInt(searchParams.get('radius') || '10');
    if (!isNaN(radius) && radius >= 1 && radius <= 100) {
      filters.radius = radius;
    }
  }
  
  // Quality filters
  if (searchParams.has('rating')) {
    const rating = parseFloat(searchParams.get('rating') || '0');
    if (!isNaN(rating) && rating >= 0 && rating <= 5) {
      filters.rating = rating;
    }
  }
  
  // Feature filters
  if (searchParams.has('languages')) {
    const languages = searchParams.get('languages')?.split(',').map(l => l.trim()).filter(Boolean) || [];
    if (languages.length > 0) {
      filters.languages = languages;
    }
  }
  
  if (searchParams.has('availability')) {
    const availability = searchParams.get('availability')?.trim();
    if (availability && availability !== 'any') {
      filters.availability = availability;
    }
  }
  
  if (searchParams.has('verified')) {
    filters.verified = searchParams.get('verified') === 'true';
  }
  
  if (searchParams.has('is_public')) {
    filters.is_public = searchParams.get('is_public') === 'true';
  }
  
  if (searchParams.has('tags')) {
    const tags = searchParams.get('tags')?.split(',').map(t => t.trim()).filter(Boolean) || [];
    if (tags.length > 0) {
      filters.tags = tags;
    }
  }
  
  if (searchParams.has('has_photo')) {
    const hasPhoto = searchParams.get('has_photo') as 'any' | 'with' | 'without';
    if (hasPhoto && hasPhoto !== 'any') {
      filters.has_photo = hasPhoto;
    }
  }
  
  return filters;
};

/**
 * Serialize filters to URL query string
 * Converts filter object to URL parameters for sharing/bookmarking
 */
export const serializeFiltersToURL = (filters: BusinessSearchFilters): string => {
  const params = new URLSearchParams();
  
  // Map search to q parameter
  if (filters.search) {
    params.append('q', filters.search);
  }
  
  // Category filters
  if (filters.domain) {
    params.append('domain', filters.domain);
  }
  
  if (filters.subdomain) {
    const subdomains = Array.isArray(filters.subdomain) 
      ? filters.subdomain.join(',') 
      : filters.subdomain;
    if (subdomains) {
      params.append('subdomain', subdomains);
    }
  }
  
  // Location filters
  if (filters.city && filters.city !== 'Selected Location' && filters.city !== 'Unknown') {
    params.append('city', filters.city);
  }
  
  if (filters.latitude !== undefined && filters.latitude !== null) {
    params.append('latitude', filters.latitude.toString());
  }
  
  if (filters.longitude !== undefined && filters.longitude !== null) {
    params.append('longitude', filters.longitude.toString());
  }
  
  if (filters.radius && filters.radius !== 10) {
    params.append('radius', filters.radius.toString());
  }
  
  // Quality filters
  if (filters.rating && filters.rating > 0) {
    params.append('rating', filters.rating.toString());
  }
  
  // Feature filters
  if (filters.languages && filters.languages.length > 0) {
    params.append('languages', filters.languages.join(','));
  }
  
  if (filters.availability && filters.availability !== 'any') {
    params.append('availability', filters.availability);
  }
  
  if (filters.verified) {
    params.append('verified', 'true');
  }
  
  if (filters.is_public) {
    params.append('is_public', 'true');
  }
  
  if (filters.tags && filters.tags.length > 0) {
    params.append('tags', filters.tags.join(','));
  }
  
  if (filters.has_photo && filters.has_photo !== 'any') {
    params.append('has_photo', filters.has_photo);
  }
  
  return params.toString();
};

/**
 * Validate and sanitize filter values
 * Ensures all filter values are within acceptable ranges
 */
export const validateFilters = (filters: BusinessSearchFilters): BusinessSearchFilters => {
  const validated: BusinessSearchFilters = {};
  
  // Text search
  if (filters.search) {
    validated.search = filters.search.trim().substring(0, 200);
  }
  
  // Category filters
  if (filters.domain) {
    validated.domain = filters.domain.trim();
  }
  
  if (filters.subdomain) {
    validated.subdomain = filters.subdomain;
  }
  
  // Location filters - exclude placeholders
  if (filters.city && filters.city !== 'Selected Location' && filters.city !== 'Unknown') {
    validated.city = filters.city.trim();
  }
  
  if (filters.latitude !== undefined && !isNaN(filters.latitude)) {
    validated.latitude = Math.max(-90, Math.min(90, filters.latitude));
  }
  
  if (filters.longitude !== undefined && !isNaN(filters.longitude)) {
    validated.longitude = Math.max(-180, Math.min(180, filters.longitude));
  }
  
  if (filters.radius !== undefined) {
    validated.radius = Math.max(1, Math.min(100, filters.radius));
  }
  
  // Quality filters
  if (filters.rating !== undefined) {
    validated.rating = Math.max(0, Math.min(5, filters.rating));
  }
  
  // Feature filters
  if (filters.languages && filters.languages.length > 0) {
    validated.languages = filters.languages.filter(l => l && l.trim().length > 0);
  }
  
  if (filters.availability) {
    validated.availability = filters.availability;
  }
  
  if (filters.verified !== undefined) {
    validated.verified = filters.verified;
  }
  
  if (filters.is_public !== undefined) {
    validated.is_public = filters.is_public;
  }
  
  if (filters.tags && filters.tags.length > 0) {
    // Remove empty tags and trim whitespace
    validated.tags = filters.tags
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .slice(0, 20); // Max 20 tags
  }
  
  if (filters.has_photo && filters.has_photo !== 'any') {
    validated.has_photo = filters.has_photo;
  }
  
  return validated;
};

/**
 * Check if filters object has any active filters
 */
export const hasActiveFilters = (filters: BusinessSearchFilters): boolean => {
  return !!(
    filters.search ||
    filters.domain ||
    filters.subdomain ||
    filters.city ||
    (filters.rating && filters.rating > 0) ||
    (filters.languages && filters.languages.length > 0) ||
    filters.availability ||
    filters.verified ||
    filters.is_public ||
    (filters.tags && filters.tags.length > 0) ||
    (filters.has_photo && filters.has_photo !== 'any')
  );
};

/**
 * Get default filters
 */
export const getDefaultFilters = (): BusinessSearchFilters => ({
  search: "",
  radius: 10,
  rating: 0,
  languages: [],
  verified: false,
  tags: []
});

/**
 * Debug log filters (for development)
 */
export const debugLogFilters = (filters: BusinessSearchFilters, label: string = 'Filters') => {
  console.group(`🔍 ${label}`);
  console.log('📝 Search:', filters.search || 'none');
  console.log('🏷️ Domain:', filters.domain || 'none');
  console.log('⚡ Subdomain:', filters.subdomain || 'none');
  console.log('📍 Location:', {
    city: filters.city || 'none',
    latitude: filters.latitude ?? 'none',
    longitude: filters.longitude ?? 'none',
    radius: filters.radius || 10
  });
  console.log('⭐ Rating:', filters.rating || 'any');
  console.log('🗣️ Languages:', filters.languages?.length || 0);
  console.log('📅 Availability:', filters.availability || 'any');
  console.log('✅ Verified:', filters.verified || false);
  console.log('👁️ Public:', filters.is_public ?? 'any');
  console.log('#️⃣ Tags:', filters.tags?.length || 0, filters.tags || []);
  console.log('📸 Has Photo:', filters.has_photo || 'any');
  console.groupEnd();
};
