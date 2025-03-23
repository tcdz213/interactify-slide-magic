
import { useState, useEffect, useCallback, memo } from "react";
import { motion } from "framer-motion";
import HeroTitle from "@/components/hero/HeroTitle";
import HeroActions from "@/components/hero/HeroActions";
import HeroBackground from "@/components/hero/HeroBackground";
import ScrollIndicator from "@/components/hero/ScrollIndicator";
import NeonGlowCursor from "@/components/hero/NeonGlowCursor";
import SearchBox from "@/components/hero/SearchBox";

const backgroundImages = [
  "gradient-1",
  "gradient-2",
  "gradient-3"
];

const HeroInner = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Change background image every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.5
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7 } }
  };

  return (
    <section className="relative min-h-screen hero-gradient flex flex-col items-center justify-center pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <HeroBackground currentImage={backgroundImages[currentImageIndex]} />
      <NeonGlowCursor />

      <motion.div 
        className="container-custom relative z-10 flex flex-col items-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <HeroTitle className="mb-8 md:mb-12" />
        </motion.div>
        
        <motion.div 
          variants={item}
          className="w-full"
        >
          <SearchBox className="mb-12" />
        </motion.div>
        
        <motion.div variants={item}>
          <HeroActions className="mt-8" />
        </motion.div>
      </motion.div>

      <ScrollIndicator targetId="featured" className="z-10" />
    </section>
  );
};

const Hero = memo(HeroInner);

export default Hero;
