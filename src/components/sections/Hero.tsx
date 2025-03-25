import { useState, useEffect, useCallback, memo } from "react";
import { motion } from "framer-motion";
<<<<<<< HEAD
import {
  HeroTitle,
  HeroActions,
  HeroBackground,
  ScrollIndicator,
  NeonGlowCursor,
  SearchBox,
} from "@/components/home";
=======
import { HeroTitle, HeroActions, HeroBackground, ScrollIndicator, NeonGlowCursor, SearchBox } from "@/components/hero";
import { useSectionInView } from "@/components/home/hooks/useSectionInView";
import { useRef } from "react";
>>>>>>> 709ce0c632a57b402101b5cffe82a0f5dc050795

const backgroundImages = ["gradient-1", "gradient-2", "gradient-3"];

const HeroInner = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const isInView = useSectionInView(heroRef, { threshold: 0.1 });

  // Change background image every 6 seconds for softer transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % backgroundImages.length
      );
<<<<<<< HEAD
    }, 5000);

=======
    }, 6000);
    
>>>>>>> 709ce0c632a57b402101b5cffe82a0f5dc050795
    return () => clearInterval(interval);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
<<<<<<< HEAD
        staggerChildren: 0.2,
        duration: 0.5,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7 } },
  };

=======
        staggerChildren: 0.3,
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

>>>>>>> 709ce0c632a57b402101b5cffe82a0f5dc050795
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
<<<<<<< HEAD
        <motion.div variants={item}>
          <HeroTitle className="mb-8 md:mb-12" />
        </motion.div>

        <motion.div variants={item} className="w-full">
          <SearchBox className="mb-12" />
        </motion.div>

        <motion.div variants={item}>
          <HeroActions className="mt-8" />
        </motion.div>
=======
        <HeroTitle className="mb-10 md:mb-14" />
        <SearchBox className="mb-14 w-full" />
        <HeroActions className="mt-8" />
>>>>>>> 709ce0c632a57b402101b5cffe82a0f5dc050795
      </motion.div>

      <ScrollIndicator targetId="featured" className="z-10" />
    </section>
  );
};

const Hero = memo(HeroInner);

export default Hero;
