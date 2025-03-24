
import { useState, useEffect, useCallback, memo } from "react";
import { motion } from "framer-motion";
import { HeroTitle, HeroActions, HeroBackground, ScrollIndicator, NeonGlowCursor, SearchBox } from "@/components/hero";
import { useSectionInView } from "@/components/home/hooks/useSectionInView";
import { useRef } from "react";

const backgroundImages = [
  "gradient-1",
  "gradient-2",
  "gradient-3"
];

const HeroInner = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const isInView = useSectionInView(heroRef, { threshold: 0.1 });

  // Change background image every 6 seconds for softer transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 6000);
    
    return () => clearInterval(interval);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

  return (
    <section 
      className="relative min-h-screen hero-gradient flex flex-col items-center justify-center pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden"
      aria-labelledby="hero-title"
      role="banner"
      ref={heroRef}
    >
      <HeroBackground currentImage={backgroundImages[currentImageIndex]} />
      <NeonGlowCursor />

      <motion.div 
        className="container-custom relative z-10 flex flex-col items-center"
        variants={container}
        initial="hidden"
        animate={isInView ? "show" : "hidden"}
      >
        <HeroTitle className="mb-10 md:mb-14" />
        <SearchBox className="mb-14 w-full" />
        <HeroActions className="mt-8" />
      </motion.div>

      <ScrollIndicator targetId="featured" className="z-10" />
    </section>
  );
};

const Hero = memo(HeroInner);

export default Hero;
