
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';
import { CategoriesHeroProps } from './types';

export const CategoriesHero = ({ currentLanguage }: CategoriesHeroProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-gradient-to-b from-primary/10 to-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <div className="mb-2">
            <Badge variant="outline" className="bg-primary/10 border-0 text-primary">
              <Tag className="h-3 w-3 mr-1" />
              <span>{t('categories.explore', 'Explore Categories')}</span>
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('categories.title', 'Training Categories')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('categories.subtitle', 'Explore our wide range of training categories and find the perfect course for you')}
          </p>
        </div>
      </div>
    </div>
  );
};
