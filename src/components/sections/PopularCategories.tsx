
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

const categories = [
  {
    id: 1,
    name: "Fitness & Health",
    icon: "💪",
    color: "bg-emerald-100 dark:bg-emerald-950/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    count: 128,
  },
  {
    id: 2,
    name: "Business & Finance",
    icon: "📊",
    color: "bg-blue-100 dark:bg-blue-950/50",
    iconColor: "text-blue-600 dark:text-blue-400",
    count: 94,
  },
  {
    id: 3,
    name: "IT & Development",
    icon: "💻",
    color: "bg-violet-100 dark:bg-violet-950/50",
    iconColor: "text-violet-600 dark:text-violet-400",
    count: 152,
  },
  {
    id: 4,
    name: "Language Learning",
    icon: "🌎",
    color: "bg-amber-100 dark:bg-amber-950/50",
    iconColor: "text-amber-600 dark:text-amber-400",
    count: 85,
  },
  {
    id: 5,
    name: "Arts & Creativity",
    icon: "🎨",
    color: "bg-rose-100 dark:bg-rose-950/50",
    iconColor: "text-rose-600 dark:text-rose-400",
    count: 76,
  },
  {
    id: 6,
    name: "Professional Skills",
    icon: "🏆",
    color: "bg-cyan-100 dark:bg-cyan-950/50",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    count: 112,
  },
  {
    id: 7,
    name: "Cooking & Culinary",
    icon: "🍳",
    color: "bg-orange-100 dark:bg-orange-950/50",
    iconColor: "text-orange-600 dark:text-orange-400",
    count: 62,
  },
  {
    id: 8,
    name: "Music & Instruments",
    icon: "🎵",
    color: "bg-indigo-100 dark:bg-indigo-950/50",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    count: 58,
  },
];

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
    <section className="section-padding">
      <div className="container-custom">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold mb-4">{t('categories.popularTitle', 'Popular Categories')}</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            {t('categories.description', 'Browse our most popular training categories with top-rated centers and courses.')}
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {categories.map((category) => (
            <motion.div key={category.id} variants={item}>
              <Card 
                className={`border-none shadow-sm overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md ${
                  hoveredCategory === category.id ? "ring-1 ring-primary/30" : ""
                }`}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => navigateToCategory(category.name)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-lg ${category.color} flex items-center justify-center text-2xl ${category.iconColor}`}>
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
