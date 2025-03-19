
import { useState, useEffect, memo } from "react";
import { 
  HeroTitle, 
  HeroActions, 
  HeroBackground, 
  ScrollIndicator, 
  NeonGlowCursor, 
  SearchBox 
} from "@/components/hero";
import HeroFeatures from "@/components/hero/HeroFeatures";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { t } = useTranslation();
  const backgroundImages = [
    "gradient-1",
    "gradient-2",
    "gradient-3"
  ];

  // Change background image every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section 
      id="hero" 
      className="relative min-h-screen flex flex-col items-center justify-center pt-16 pb-12 md:pt-24 md:pb-20 overflow-hidden bg-gradient-to-b from-slate-50/70 via-background to-muted/30 dark:from-gray-900/90 dark:via-background dark:to-background/80"
    >
      <HeroBackground 
        currentImage={backgroundImages[currentImageIndex]} 
        className="opacity-70" 
      />
      <NeonGlowCursor />

      <motion.div 
        className="container-custom relative z-10 flex flex-col items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <HeroTitle className="mb-4 md:mb-8" />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <HeroFeatures />
        </motion.div>
        
        <motion.div variants={itemVariants} className="w-full mt-8">
          <SearchBox className="mb-8 w-full" />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <HeroActions className="mt-4" />
        </motion.div>
      </motion.div>

      <ScrollIndicator targetId="featured" className="z-10" />
    </section>
  );
};

export default memo(HeroSection);
