
import { Briefcase, Dumbbell, Languages, Code, Music, Presentation } from "lucide-react";
import CategoryCard from "@/components/cards/CategoryCard";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useVisibilityObserver } from "@/hooks/useVisibilityObserver";

const PopularCategoriesSection = () => {
  const { t } = useTranslation();
  const { isVisible, elementRef } = useVisibilityObserver({ threshold: 0.1 });
  
  const categories = [
    {
      title: t('categories.business'),
      icon: Briefcase,
      description: t('categories.businessDesc', 'Leadership, management, and professional development courses'),
      color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
      href: "/discover?category=business",
    },
    {
      title: t('categories.fitness'),
      icon: Dumbbell,
      description: t('categories.fitnessDesc', 'Physical fitness, nutrition, and wellness programs'),
      color: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300",
      href: "/discover?category=fitness",
    },
    {
      title: t('categories.language'),
      icon: Languages,
      description: t('categories.languageDesc', 'Foreign language courses for all proficiency levels'),
      color: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300",
      href: "/discover?category=language",
    },
    {
      title: t('categories.technology'),
      icon: Code,
      description: t('categories.technologyDesc', 'Programming, development, and IT certification courses'),
      color: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300",
      href: "/discover?category=technology",
    },
    {
      title: t('categories.arts'),
      icon: Music,
      description: t('categories.artsDesc', 'Creative arts, music, and design courses'),
      color: "bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300",
      href: "/discover?category=arts",
    },
    {
      title: t('categories.professional'),
      icon: Presentation,
      description: t('categories.professionalDesc', 'Career-focused certification and skill development'),
      color: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
      href: "/discover?category=professional",
    },
  ];

  return (
    <section 
      ref={elementRef}
      className="section-padding bg-gradient-to-b from-background to-muted/30"
    >
      <div className="container-custom">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            {t('categories.popularTitle', 'Explore Learning Categories')}
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            {t('categories.popularDesc', 'Discover diverse educational opportunities across various fields and disciplines')}
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div 
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.1 * (index % 3), duration: 0.5 }}
            >
              <CategoryCard {...category} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCategoriesSection;
