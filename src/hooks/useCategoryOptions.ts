
import { useTranslation } from 'react-i18next';
import { categories as categoryData } from '@/data/categories';

export function useCategoryOptions() {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'fr' | 'ar';
  
  const getCategories = () => {
    return [
      { value: "all", label: "All Categories" },
      ...categoryData.map(category => ({
        value: category.id.toString(),
        label: category.name[lang] || category.name.en
      }))
    ];
  };
  
  const getSubcategories = (categoryId: string | null) => {
    if (!categoryId || categoryId === 'all') {
      return [{ value: "all", label: "All Subcategories" }];
    }
    
    const category = categoryData.find(c => c.id.toString() === categoryId);
    if (!category) {
      return [{ value: "all", label: "All Subcategories" }];
    }
    
    return [
      { value: "all", label: "All Subcategories" },
      ...category.subcategories.map(sub => ({
        value: sub.id.toString(),
        label: sub.name[lang] || sub.name.en
      }))
    ];
  };

  return {
    getCategories,
    getSubcategories
  };
}
