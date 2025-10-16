import { Domain } from '@/services/domainsApi';
import { BusinessSearchFilters } from '@/services/businessApi';

// Mapping of common search keywords to domain keys
const domainKeywords: Record<string, { domainId: string; subcategories?: string[] }> = {
  'auto': { domainId: 'automobile' },
  'voiture': { domainId: 'automobile' },
  'car': { domainId: 'automobile' },
  'garage': { domainId: 'automobile', subcategories: ['mechanic'] },
  'mechanic': { domainId: 'automobile', subcategories: ['mechanic'] },
  'plombier': { domainId: 'home_services', subcategories: ['plumber'] },
  'électricien': { domainId: 'home_services', subcategories: ['electrician'] },
  'construction': { domainId: 'construction' },
  'restaurant': { domainId: 'food', subcategories: ['restaurant'] },
  'café': { domainId: 'food', subcategories: ['cafe'] },
  'médecin': { domainId: 'health', subcategories: ['general_doctor'] },
  'doctor': { domainId: 'health', subcategories: ['general_doctor'] },
  'école': { domainId: 'education', subcategories: ['school'] },
  'avocat': { domainId: 'professional', subcategories: ['lawyer'] },
  'immobilier': { domainId: 'real_estate', subcategories: ['real_estate_agency'] },
};

interface MatchResult {
  domainId?: string;
  subcategories?: string[];
  confidence: number;
}

export function analyzeSearchQuery(query: string, domains: Domain[]): MatchResult {
  const words = query.toLowerCase().split(/\s+/);
  let bestMatch: { domainId?: string; subcategories?: string[] } = {};
  let matchScore = 0;
  
  for (const word of words) {
    if (domainKeywords[word]) {
      const match = domainKeywords[word];
      bestMatch.domainId = match.domainId;
      if (match.subcategories) {
        bestMatch.subcategories = match.subcategories;
      }
      matchScore += 10;
    }
  }
  
  const confidence = Math.min(100, matchScore * 10);
  return { ...bestMatch, confidence };
}

export function applySmartFilters(
  searchQuery: string,
  currentFilters: BusinessSearchFilters,
  domains: Domain[]
): BusinessSearchFilters {
  const analysis = analyzeSearchQuery(searchQuery, domains);
  
  if (analysis.confidence > 30) {
    const newFilters = { ...currentFilters };
    
    if (!currentFilters.domain && analysis.domainId && analysis.confidence > 40) {
      newFilters.domain = analysis.domainId;
    }
    
    if (analysis.subcategories && analysis.subcategories.length > 0 && analysis.confidence > 60) {
      newFilters.domain = analysis.domainId;
      newFilters.subdomain = analysis.subcategories[0];
    }
    
    return newFilters;
  }
  
  return currentFilters;
}

export function getSearchSuggestions(
  query: string,
  domains: Domain[],
  limit: number = 5,
  language: 'fr' | 'ar' | 'en' = 'fr'
): Array<{ text: string; domainId: string; subcategory?: string }> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const normalizedQuery = query.toLowerCase();
  const suggestions: Array<{ text: string; domainId: string; subcategory?: string; score: number }> = [];
  
  for (const domain of domains) {
    const domainName = domain[language]?.toLowerCase() || '';
    if (domainName.includes(normalizedQuery)) {
      suggestions.push({
        text: domain[language] || domain.fr,
        domainId: domain.key,
        score: 10
      });
    }
    
    for (const subcategory of domain.subcategories) {
      const subName = subcategory[language]?.toLowerCase() || '';
      if (subName.includes(normalizedQuery)) {
        suggestions.push({
          text: `${subcategory[language] || subcategory.fr} (${domain[language] || domain.fr})`,
          domainId: domain.key,
          subcategory: subcategory.key,
          score: 15
        });
      }
    }
  }
  
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ text, domainId, subcategory }) => ({ text, domainId, subcategory }));
}
