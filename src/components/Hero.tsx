
import { memo } from "react";
import { 
  HeroTitle, 
  HeroActions, 
  HeroBackground, 
  ScrollIndicator, 
  NeonGlowCursor,
  SearchBox
} from "./hero";

const Hero = () => {
  return (
    <section className="relative min-h-screen hero-gradient flex items-center pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <HeroBackground />
      <NeonGlowCursor />

      <div className="container-custom relative z-10">
        <HeroTitle className="mb-8 md:mb-10" />
        <SearchBox className="mt-6 mb-8" />
        <HeroActions className="mt-6" />
      </div>

      <ScrollIndicator targetId="featured" className="z-10" />
    </section>
  );
};

export default memo(Hero);
