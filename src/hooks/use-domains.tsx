import { useState, useEffect, useCallback } from 'react';
import { domainsApi, Domain, Keywords } from '@/services/domainsApi';
import { domains as fallbackDomains } from '@/data/domains';

export const useDomains = () => {
  const [domains, setDomains] = useState<Domain[]>(fallbackDomains);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDomains = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const apiDomains = await domainsApi.getAllDomains();
      if (apiDomains && apiDomains.length > 0) {
        setDomains(apiDomains);
      }
    } catch (err) {
      console.error('Failed to fetch domains from API, using fallback:', err);
      setError(err instanceof Error ? err.message : 'Failed to load categories');
      // Keep using fallback domains on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const createDomain = useCallback(async (domainData: {
    key: string
    ar: string
    fr: string
    en: string
    keywords: Keywords
    subcategories?: any[]
  }, token: string) => {
    const newDomain = await domainsApi.createDomain(domainData, token);
    await fetchDomains(); // Refresh list
    return newDomain;
  }, [fetchDomains]);

  const updateDomain = useCallback(async (domainKey: string, updates: {
    ar?: string
    fr?: string
    en?: string
    keywords?: Keywords
  }, token: string) => {
    const updatedDomain = await domainsApi.updateDomain(domainKey, updates, token);
    await fetchDomains(); // Refresh list
    return updatedDomain;
  }, [fetchDomains]);

  const deleteDomain = useCallback(async (domainKey: string, token: string) => {
    await domainsApi.deleteDomain(domainKey, token);
    await fetchDomains(); // Refresh list
  }, [fetchDomains]);

  const addSubcategory = useCallback(async (domainKey: string, subcategoryData: {
    key: string
    ar: string
    fr: string
    en: string
    keywords: Keywords
  }, token: string) => {
    const updatedDomain = await domainsApi.addSubcategory(domainKey, subcategoryData, token);
    await fetchDomains(); // Refresh list
    return updatedDomain;
  }, [fetchDomains]);

  const updateSubcategory = useCallback(async (domainKey: string, subcategoryKey: string, updates: {
    ar?: string
    fr?: string
    en?: string
    keywords?: Keywords
  }, token: string) => {
    const updatedDomain = await domainsApi.updateSubcategory(domainKey, subcategoryKey, updates, token);
    await fetchDomains(); // Refresh list
    return updatedDomain;
  }, [fetchDomains]);

  const deleteSubcategory = useCallback(async (domainKey: string, subcategoryKey: string, token: string) => {
    const updatedDomain = await domainsApi.deleteSubcategory(domainKey, subcategoryKey, token);
    await fetchDomains(); // Refresh list
    return updatedDomain;
  }, [fetchDomains]);

  return {
    domains,
    isLoading,
    error,
    refetch: fetchDomains,
    createDomain,
    updateDomain,
    deleteDomain,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory
  };
};

