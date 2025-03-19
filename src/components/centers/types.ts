
export interface Center {
  id: number;
  name: string;
  category: string;
  subcategory?: string;
  rating: number;
  reviews: number;
  location: string;
  image: string;
  price: string;
  currency: string;
  featured: boolean;
  description: string;
  features: string[];
  status: string;
  verified: boolean;
}

export const featureLabels: Record<string, string> = {
  'certified': 'Certified',
  'online': 'Online',
  'in_person': 'In-Person',
  'group': 'Group',
  'private': 'Private',
  'equipment': 'Equipment',
  'accessible': 'Accessible',
  'parking': 'Parking'
};

export const currencySymbols: Record<string, string> = {
  'USD': '$',
  'EUR': '€',
  'DZD': 'DA',
  'GBP': '£',
  'SAR': 'SAR'
};
