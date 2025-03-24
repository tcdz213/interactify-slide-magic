
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
const HowItWorksHeader = () => {
  const {
    t
  } = useTranslation();
  return <div className="text-center mb-16">
      <motion.div initial={{
      scale: 0.8,
      opacity: 0
    }} whileInView={{
      scale: 1,
      opacity: 1
    }} transition={{
      duration: 0.5
    }} viewport={{
      once: true
    }} className="inline-block mb-5">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto dark:bg-primary/20 dark:text-primary/90">
          <Lightbulb className="h-8 w-8" />
        </div>
      </motion.div>
      
      <motion.h2 initial={{
      y: 20,
      opacity: 0
    }} whileInView={{
      y: 0,
      opacity: 1
    }} transition={{
      duration: 0.5,
      delay: 0.1
    }} viewport={{
      once: true
    }} className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
        {t('howItWorks.title')}
      </motion.h2>
      
      <motion.p initial={{
      y: 20,
      opacity: 0
    }} whileInView={{
      y: 0,
      opacity: 1
    }} transition={{
      duration: 0.5,
      delay: 0.2
    }} viewport={{
      once: true
    }} className="text-lg max-w-3xl mx-auto mb-8 text-muted-foreground">
        {t('howItWorks.description')}
      </motion.p>
    </div>;
};
export default HowItWorksHeader;
