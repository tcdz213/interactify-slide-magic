
import { useState, useCallback, memo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import SectionTitle from "./common/SectionTitle";
import { categoriesData } from "@/data/categoriesData";

const CategoryCard = memo(({ 
  category, 
  index, 
  isHovered, 
  onHover, 
  onNavigate 
}: { 
  category: any; 
  index: number; 
  isHovered: boolean;
  onHover: (id: number | null) => void;
  onNavigate: (name: string) => void;
}) => {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      className="h-full"
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card 
        className={`border-none h-full shadow-sm overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md ${
          isHovered ? "ring-1 ring-primary/30 transform scale-[1.02]" : ""
        }`}
        onMouseEnter={() => onHover(category.id)}
        onMouseLeave={() => onHover(null)}
        onClick={() => onNavigate(category.name)}
        aria-label={`View ${category.name} category with ${category.count} centers`}
      >
        <CardContent className="p-6 h-full">
          <div className="flex items-start gap-4 h-full">
            <div 
              className={`h-12 w-12 rounded-lg ${category.color} flex items-center justify-center text-2xl ${category.iconColor} transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}
              aria-hidden="true"
            >
              {category.icon}
            </div>
            <div className="flex-1 flex flex-col h-full">
              <h3 className="font-medium mb-1">{category.name}</h3>
              <div className="flex items-center justify-between mt-auto">
                <Badge variant="secondary" className="bg-muted text-muted-foreground">
                  {category.count} centers
                </Badge>
                {isHovered && (
                  <motion.span 
                    className="text-primary text-sm font-medium"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    Explore →
                  </motion.span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

CategoryCard.displayName = 'CategoryCard';

const PopularCategories = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  const navigateToCategory = useCallback((categoryName: string) => {
    navigate(`/discover?category=${encodeURIComponent(categoryName)}`);
  }, [navigate]);

  return (
    <section 
      className="section-padding bg-background"
      aria-labelledby="popular-categories-title"
    >
      <div className="container-custom">
        <SectionTitle
          title={t('categories.popularTitle', 'Popular Categories')}
          description={t('categories.description', 'Browse our most popular training categories with top-rated centers and courses.')}
          id="popular-categories-title"
        />

        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
        >
          {categoriesData.map((category, index) => (
            <CategoryCard 
              key={category.id}
              category={category}
              index={index}
              isHovered={hoveredCategory === category.id}
              onHover={setHoveredCategory}
              onNavigate={navigateToCategory}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default memo(PopularCategories);
