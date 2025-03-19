
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, Bookmark } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CategoryGridProps } from './types';

export const CategoryGrid = ({ 
  categories, 
  setSelectedCategory, 
  getTranslatedName 
}: CategoryGridProps) => {
  const { t } = useTranslation();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05 
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };
  
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="mb-6 flex flex-wrap bg-card/50 p-1">
        <TabsTrigger value="all">{t('categories.allCategories', 'All Categories')}</TabsTrigger>
        <TabsTrigger value="popular">{t('categories.popular', 'Popular')}</TabsTrigger>
        <TabsTrigger value="trending">{t('categories.trending', 'Trending')}</TabsTrigger>
        <TabsTrigger value="new">{t('categories.new', 'New')}</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-0">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {categories.map((category) => (
            <motion.div key={category.id} variants={itemVariants}>
              <Card className="h-full hover:shadow-md transition-shadow border border-border/50 bg-card/50 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Bookmark className="h-4 w-4 text-primary" />
                    <h3 className="text-xl font-semibold">
                      {getTranslatedName(category.name)}
                    </h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {category.subcategories.slice(0, 4).map((subcategory) => (
                      <Badge key={subcategory.id} variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20">
                        {getTranslatedName(subcategory.name)}
                      </Badge>
                    ))}
                    {category.subcategories.length > 4 && (
                      <Badge variant="outline">+{category.subcategories.length - 4}</Badge>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-2 group"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {t('categories.viewSubcategories', 'View Subcategories')}
                    <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </TabsContent>
      
      <TabsContent value="popular" className="mt-0">
        <div className="text-center py-12 bg-card/50 rounded-lg border border-dashed">
          <p className="text-muted-foreground">
            {t('categories.comingSoon', 'Coming soon...')}
          </p>
        </div>
      </TabsContent>
      
      <TabsContent value="trending" className="mt-0">
        <div className="text-center py-12 bg-card/50 rounded-lg border border-dashed">
          <p className="text-muted-foreground">
            {t('categories.comingSoon', 'Coming soon...')}
          </p>
        </div>
      </TabsContent>
      
      <TabsContent value="new" className="mt-0">
        <div className="text-center py-12 bg-card/50 rounded-lg border border-dashed">
          <p className="text-muted-foreground">
            {t('categories.comingSoon', 'Coming soon...')}
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};
