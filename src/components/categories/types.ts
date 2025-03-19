
import { Category } from '@/data/categories';

export interface CategoriesSidebarProps {
  categories: Category[];
  selectedCategory: number | null;
  setSelectedCategory: (id: number | null) => void;
  currentLanguage: string;
  getTranslatedName: (nameObj: { en: string; fr: string; ar: string }) => string;
}

export interface CategoryDetailProps {
  category: Category;
  getTranslatedName: (nameObj: { en: string; fr: string; ar: string }) => string;
  onBack: () => void;
  currentLanguage: string;
}

export interface CategoryGridProps {
  categories: Category[];
  setSelectedCategory: (id: number | null) => void;
  getTranslatedName: (nameObj: { en: string; fr: string; ar: string }) => string;
}

export interface CategoriesHeroProps {
  currentLanguage: string;
}
