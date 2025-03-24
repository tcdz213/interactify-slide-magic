
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import SectionTitle from "./common/SectionTitle";
import { categoriesData } from "@/data/categoriesData";

const PopularCategories = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  const navigateToCategory = (categoryName: string) => {
    navigate(`/discover?category=${encodeURIComponent(categoryName)}`);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section 
      className="section-padding"
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
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {categoriesData.map((category) => (
            <motion.div key={category.id} variants={item}>
              <Card 
                className={`border-none shadow-sm overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md ${
                  hoveredCategory === category.id ? "ring-1 ring-primary/30" : ""
                }`}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => navigateToCategory(category.name)}
                aria-label={`View ${category.name} category with ${category.count} centers`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-lg ${category.color} flex items-center justify-center text-2xl ${category.iconColor}`} aria-hidden="true">
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{category.name}</h3>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-muted text-muted-foreground">
                          {category.count} centers
                        </Badge>
                        {hoveredCategory === category.id && (
                          <motion.span 
                            className="text-primary text-sm"
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
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
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PopularCategories;
