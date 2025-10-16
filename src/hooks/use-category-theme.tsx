import { useEffect } from 'react';

export type CategoryId = 
  | 'automobile' 
  | 'sante' 
  | 'services' 
  | 'alimentation' 
  | 'beaute' 
  | 'education' 
  | 'commerce' 
  | 'immobilier' 
  | 'technologie'
  | 'default';

// Map domain IDs to category themes
const domainToCategoryMap: Record<number, CategoryId> = {
  1: 'automobile',      // Automobile
  2: 'services',        // Construction & Travaux
  3: 'commerce',        // Commerces & Boutiques
  4: 'services',        // Administratif & Idara
  5: 'education',       // Éducation & Formation
  6: 'immobilier',      // Immobilier & Location
  7: 'sante',          // Santé & Bien-être
  8: 'commerce',        // Événements & Fêtes
  9: 'technologie',     // Technologie & Télécoms
  10: 'alimentation',   // Agriculture & Produits locaux
  11: 'automobile',     // Transport & Logistique
  12: 'services',       // Services à domicile
  13: 'alimentation',   // Restauration & Alimentation
  14: 'commerce',       // Loisirs & Sport
  15: 'services',       // Services juridiques & Financiers
};

export const useCategoryTheme = (domainId?: number | string) => {
  useEffect(() => {
    if (!domainId) {
      document.body.removeAttribute('data-category');
      return;
    }

    const id = typeof domainId === 'string' ? parseInt(domainId) : domainId;
    const category = domainToCategoryMap[id] || 'default';
    
    document.body.setAttribute('data-category', category);

    return () => {
      document.body.removeAttribute('data-category');
    };
  }, [domainId]);
};

export const getCategoryId = (domainId?: number | string): CategoryId => {
  if (!domainId) return 'default';
  const id = typeof domainId === 'string' ? parseInt(domainId) : domainId;
  return domainToCategoryMap[id] || 'default';
};
