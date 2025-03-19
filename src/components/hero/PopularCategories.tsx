
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion";

interface PopularCategoriesProps {
  className?: string;
}

const PopularCategories = ({ className }: PopularCategoriesProps) => {
  const { t } = useTranslation();
  const categories = ['Fitness', 'Business', 'IT & Software', 'Language', 'Arts', 'Professional Skills'];
  
  return (
    <motion.div 
      className={`flex flex-wrap gap-2 mt-6 justify-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      aria-label="Popular categories"
    >
      <span className="text-sm font-medium text-muted-foreground">{t('hero.popular')}</span>
      {categories.map((tag, index) => (
        <motion.a
          key={tag}
          href={`/discover?category=${encodeURIComponent(tag)}`}
          className="text-sm px-3 py-1.5 rounded-full bg-background/80 border border-border hover:bg-primary/5 hover:border-primary/60 hover:text-primary transition-all duration-300 shadow-sm"
          aria-label={`Search ${tag} category`}
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
        >
          {tag}
        </motion.a>
      ))}
    </motion.div>
  );
};

export default PopularCategories;
