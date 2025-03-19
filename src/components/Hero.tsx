
import HeroTitle from "./hero/HeroTitle";
import HeroActions from "./hero/HeroActions";
import HeroBackground from "./hero/HeroBackground";
import ScrollIndicator from "./hero/ScrollIndicator";
import NeonGlowCursor from "./hero/NeonGlowCursor";
import { memo } from "react";

const Hero = () => {
  return (
    <section className="relative min-h-screen hero-gradient flex items-center pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <HeroBackground />
      <NeonGlowCursor />

      <div className="container-custom relative z-10">
        <HeroTitle className="mb-12 md:mb-16" />
        <HeroActions className="mt-8" />
      </div>

      <ScrollIndicator targetId="featured" className="z-10" />
    </section>
  );
};

export default memo(Hero);
