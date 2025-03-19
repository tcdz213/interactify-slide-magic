
import { useTranslation } from 'react-i18next';
import { useCountry } from '@/contexts/CountryContext';

/**
 * Hook to access country-specific content
 * @param key The content key
 * @param defaultValue Optional default value if content is not found
 * @returns The country-specific content or default value
 */
export function useCountryContent(key: string, defaultValue: string = ''): string {
  const { i18n } = useTranslation();
  const { currentCountry } = useCountry();
  
  // Try to get content from current country namespace
  const content = i18n.t(`${currentCountry.code}:${key}`, { 
    defaultValue: null,
    lng: i18n.language
  });
  
  // If content is not found for the specific country, return default value
  return content || defaultValue;
}

/**
 * Function to create conditional content based on country
 * @param defaultContent Default content
 * @param countryOverrides Country-specific overrides
 * @returns The content for the current country
 */
export function useConditionalContent(
  defaultContent: string,
  countryOverrides: Record<string, string> = {}
): string {
  const { currentCountry } = useCountry();
  
  return countryOverrides[currentCountry.code] || defaultContent;
}
