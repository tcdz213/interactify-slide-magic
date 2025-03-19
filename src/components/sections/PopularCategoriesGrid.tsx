
import { motion } from "framer-motion";
import { useVisibilityObserver } from "@/hooks/useVisibilityObserver";
import { useTranslation } from "react-i18next";
import { CategoryCard } from "@/components/cards";
import { Dumbbell, Code, BookOpen, Languages, Briefcase, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PopularCategoriesGrid = () => {
  const { t } = useTranslation();
  const { elementRef, isVisible } = useVisibilityObserver({ threshold: 0.1 });
  const navigate = useNavigate();
  
  const categories = [
    {
      title: t('categories.fitness', 'Fitness & Health'),
      icon: Dumbbell,
      description: t('categories.fitnessDesc', 'Physical training, nutrition, and wellness programs'),
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      href: "/discover?category=fitness"
    },
    {
      title: t('categories.technology', 'IT & Development'),
      icon: Code,
      description: t('categories.technologyDesc', 'Programming, web development, and IT certifications'),
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      href: "/discover?category=technology"
    },
    {
      title: t('categories.business', 'Business & Management'),
      icon: Briefcase,
      description: t('categories.businessDesc', 'Leadership, marketing, and business administration'),
      color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      href: "/discover?category=business"
    },
    {
      title: t('categories.languages', 'Language Learning'),
      icon: Languages,
      description: t('categories.languagesDesc', 'Foreign language courses and conversation practice'),
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      href: "/discover?category=languages"
    },
    {
      title: t('categories.arts', 'Creative Arts'),
      icon: Music,
      description: t('categories.artsDesc', 'Music, visual arts, photography, and design'),
      color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
      href: "/discover?category=arts"
    },
    {
      title: t('categories.academic', 'Academic Studies'),
      icon: BookOpen,
      description: t('categories.academicDesc', 'Mathematics, science, literature, and humanities'),
      color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
      href: "/discover?category=academic"
    }
  ];

  return (
    <section 
      ref={elementRef}
      className="py-16 md:py-24 bg-background"
    >
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('categories.popularTitle', 'Explore Popular Categories')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('categories.popularDesc', 'Discover training programs across a wide range of disciplines')}
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <CategoryCard
                title={category.title}
                icon={category.icon}
                description={category.description}
                color={category.color}
                href={category.href}
              />
            </motion.div>
          ))}
        </div>
        
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <Button 
            variant="outline" 
            size="lg"
            className="rounded-full"
            onClick={() => navigate('/categories')}
          >
            {t('categories.viewAll', 'View All Categories')}
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default PopularCategoriesGrid;
