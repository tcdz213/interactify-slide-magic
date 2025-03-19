
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Grid2X2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CategoryDetailProps } from './types';

export const CategoryDetail = ({ 
  category, 
  getTranslatedName, 
  onBack, 
  currentLanguage 
}: CategoryDetailProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
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
    <div>
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div>
          <Badge className="mb-2">
            <Grid2X2 className="h-3 w-3 mr-1" />
            {category.subcategories.length} {t('categories.subcategories', 'Subcategories')}
          </Badge>
          <h2 className="text-2xl font-bold">
            {getTranslatedName(category.name)}
          </h2>
        </div>
        <Button 
          variant="outline" 
          onClick={onBack}
          size="sm"
        >
          {t('categories.viewAll', 'View All')}
        </Button>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={category.id} // Add key to force animation restart
      >
        {category.subcategories.map((subcategory) => (
          <motion.div key={subcategory.id} variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow border border-border/50 group overflow-hidden">
              <CardContent className="p-5">
                <Button 
                  variant="ghost" 
                  className="p-0 h-auto text-lg font-medium w-full text-left justify-start group-hover:text-primary"
                  onClick={() => navigate(`/discover?category=${subcategory.id}`)}
                >
                  {getTranslatedName(subcategory.name)}
                  <ChevronRight className="h-4 w-4 ml-auto transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
