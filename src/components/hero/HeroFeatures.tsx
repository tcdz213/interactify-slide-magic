
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const HeroFeatures = () => {
  const { t } = useTranslation();
  
  const features = [
    { id: 'multilingual', text: t('hero.features.multilingual', 'Multiple Languages') },
    { id: 'verified', text: t('hero.features.verified', 'Verified Programs') },
    { id: 'personalized', text: t('hero.features.personalized', 'Personalized Learning') },
  ];
  
  return (
    <motion.div 
      className="flex flex-wrap justify-center gap-3 md:gap-5 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      {features.map((feature, index) => (
        <motion.div
          key={feature.id}
          className="flex items-center bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border shadow-sm"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 + (index * 0.1), duration: 0.4 }}
        >
          <CheckCircle2 className="h-4 w-4 text-primary mr-1.5" />
          <span className="text-sm font-medium">{feature.text}</span>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default HeroFeatures;
