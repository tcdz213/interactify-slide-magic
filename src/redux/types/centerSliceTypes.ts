
import { Center } from '@/types/center.types'; // Use the unified Center type

export interface CentersState {
  items: Center[];
  filteredItems: Center[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filters: {
    searchTerm: string;
    category: string | null;
    subcategory: string | null;
    location: string | null;
    rating: string;
    priceRange: number[];
    features: string[];
    currency: string;
    sort: string;
  };
}
