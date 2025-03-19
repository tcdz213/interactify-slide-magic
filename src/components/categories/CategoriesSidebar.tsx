
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CategoriesSidebarProps } from './types';

export const CategoriesSidebar = ({ 
  categories, 
  selectedCategory, 
  setSelectedCategory, 
  getTranslatedName 
}: CategoriesSidebarProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="lg:col-span-1">
      <div className="bg-card rounded-xl shadow-sm border p-6 sticky top-24">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          {t('categories.browseBy', 'Browse By Category')}
        </h2>
        
        <div className="space-y-1">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              className="w-full justify-start text-left group"
              onClick={() => setSelectedCategory(category.id)}
            >
              <span>{getTranslatedName(category.name)}</span>
              <Badge variant="outline" className="ml-auto group-hover:bg-background/80">
                {category.subcategories.length}
              </Badge>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
