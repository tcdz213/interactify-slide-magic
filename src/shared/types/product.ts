/**
 * Shared product types — used by both Mobile and Admin apps.
 * Extracted per MOBILE_SPLIT_ARCHITECTURE Phase 3.3.
 */

export interface ProductCatalogItem {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  stock: number;
  category: string;
}
