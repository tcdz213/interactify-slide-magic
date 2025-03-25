import { useState, useEffect, memo } from "react";
import HeroTitle from "./hero/HeroTitle";
import HeroBackground from "./hero/HeroBackground";
import NeonGlowCursor from "./hero/NeonGlowCursor";
import SearchBox from "./hero/SearchBox";
import ScrollIndicator from "./hero/ScrollIndicator";

const Hero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const backgroundImages = ["gradient-1", "gradient-2", "gradient-3"];

  // Change background image every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % backgroundImages.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen hero-gradient flex flex-col items-center justify-center pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <HeroBackground currentImage={backgroundImages[currentImageIndex]} />
      <NeonGlowCursor />

      <div className="container-custom relative z-10 flex flex-col items-center">
        <HeroTitle className="mb-8 md:mb-12" />
        <SearchBox className="mb-12 w-full" />
        <ScrollIndicator targetId="featured-section" />
      </div>
    </section>
  );
};

export default memo(Hero);
