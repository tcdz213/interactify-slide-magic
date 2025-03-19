// Common types for filter components
export type FilterState = {
  searchQuery: string;
  category: string;
  subcategory: string | null;
  subcategories: string[];
  location: string;
  rating: string;
  priceRange: number[];
  sort: string;
  features: string[];
};

export const availableFeatures = [
  { id: "certified", label: "Certified Trainers" },
  { id: "online", label: "Online Classes" },
  { id: "in_person", label: "In-Person Classes" },
  { id: "group", label: "Group Sessions" },
  { id: "private", label: "Private Sessions" },
  { id: "equipment", label: "Equipment Provided" },
  { id: "accessible", label: "Accessibility Features" },
  { id: "parking", label: "Free Parking" },
];

// Import categories directly from data source
import { categories as categoryData } from '@/data/categories';

// Helper function to format categories for select components - moved to a separate hook
export const categories = [
  { value: "all", label: "All Categories" },
  { value: "fitness", label: "Fitness & Health" },
  { value: "programming", label: "Programming" },
  { value: "language", label: "Language Learning" },
  { value: "professional", label: "Professional Skills" },
  { value: "arts", label: "Arts & Design" },
  { value: "cooking", label: "Cooking" },
];

export const locations = [
  { value: "all", label: "All Locations" },
  { value: "san_francisco", label: "San Francisco, CA" },
  { value: "new_york", label: "New York, NY" },
  { value: "chicago", label: "Chicago, IL" },
  { value: "austin", label: "Austin, TX" },
  { value: "seattle", label: "Seattle, WA" },
  { value: "portland", label: "Portland, OR" },
];

export const ratings = [
  { value: "any", label: "Any Rating" },
  { value: "4.5", label: "4.5 & Up" },
  { value: "4.0", label: "4.0 & Up" },
  { value: "3.5", label: "3.5 & Up" },
  { value: "3.0", label: "3.0 & Up" },
];

export const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "rating_high", label: "Highest Rated" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

// Adding subcategory filter types
export const subcategoryOptions = {
  technology: [
    { value: "all", label: "All Subcategories" },
    { value: "web", label: "Web Development" },
    { value: "mobile", label: "Mobile Development" },
    { value: "data", label: "Data Science" },
    { value: "ai", label: "Artificial Intelligence" },
    { value: "cloud", label: "Cloud Computing" }
  ],
  programming: [
    { value: "all", label: "All Subcategories" },
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "ruby", label: "Ruby" }
  ],
  design: [
    { value: "all", label: "All Subcategories" },
    { value: "ui", label: "UI Design" },
    { value: "ux", label: "UX Design" },
    { value: "graphic", label: "Graphic Design" },
    { value: "motion", label: "Motion Design" }
  ],
  business: [
    { value: "all", label: "All Subcategories" },
    { value: "marketing", label: "Marketing" },
    { value: "finance", label: "Finance" },
    { value: "management", label: "Management" },
    { value: "entrepreneurship", label: "Entrepreneurship" }
  ],
  default: [
    { value: "all", label: "All Subcategories" }
  ]
};

export interface FilterOption {
  value: string;
  label: string;
}
