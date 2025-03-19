
export interface Center {
  id: number;
  name: string;
  location: string;
  status: string;
  verified: boolean;
  description: string; // Changed from optional to required to match components/centers/types.ts
  category: string;
  subcategory?: string;
  image: string;
  featured: boolean;
  rating: number;
  reviews: number;
  price: string;
  currency: string;
  features: string[];
}

export interface CenterFormData {
  name: string;
  location: string;
  description: string;
  status: string;
  category?: string;
  subcategory?: string;
}

// Add this new interface for better type safety when working with center details
export interface CenterDetails extends Center {
  address?: string;
  gallery?: string[];
  amenities?: string[];
  courses?: { name: string; price: string; duration: string }[];
  instructors?: any[];
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
    hours?: string;
  };
  reviewList?: {
    user: string;
    rating: number;
    date: string;
    comment: string;
  }[];
}
