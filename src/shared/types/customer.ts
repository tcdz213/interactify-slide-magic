/**
 * Shared customer types — used by both Mobile and Admin apps.
 * Extracted per MOBILE_SPLIT_ARCHITECTURE Phase 3.3.
 */

export interface CustomerBase {
  id: string;
  name: string;
  address: string;
  phone: string;
  creditLimit: number;
  creditUsed: number;
}

export interface CustomerWithGeo extends CustomerBase {
  lat: number;
  lng: number;
  oldestOverdueDays: number;
  lastVisit: string;
  category: "A" | "B" | "C";
}
