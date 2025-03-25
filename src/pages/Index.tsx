<<<<<<< HEAD
import { lazy, Suspense } from "react";
=======

import { lazy, Suspense, useRef } from "react";
>>>>>>> 709ce0c632a57b402101b5cffe82a0f5dc050795
import { HomeLayout, SmoothScroll } from "@/components/home";
import { motion } from "framer-motion";
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/how-it-works";
import PopularCategories from "@/components/sections/PopularCategories";
import VIPCenters from "@/components/sections/VIPCenters";
import FeaturedCenters from "@/components/sections/FeaturedCenters";
import FeaturedTeachers from "@/components/sections/FeaturedTeachers";
import Testimonials from "@/components/testimonials";
import CallToAction from "@/components/sections/CallToAction";
import SectionContainer from "@/components/home/SectionContainer";
import { SectionDivider } from "@/components/sections";

// Use SuspenseWrapper for below-the-fold content
<<<<<<< HEAD
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <div className="h-96 flex items-center justify-center">Loading...</div>
    }
  >
=======
const SuspenseWrapper = ({ children, fallbackHeight = "24rem" }: { children: React.ReactNode, fallbackHeight?: string }) => (
  <Suspense fallback={
    <div 
      className="flex items-center justify-center bg-muted/20 animate-pulse rounded-xl" 
      style={{ height: fallbackHeight }}
    >
      <div className="text-muted-foreground">Loading...</div>
    </div>
  }>
>>>>>>> 709ce0c632a57b402101b5cffe82a0f5dc050795
    {children}
  </Suspense>
);

const Index = () => {
  // Create refs for scroll animations if needed
  const featuredRef = useRef<HTMLDivElement>(null);
  
  return (
    <HomeLayout>
      <SmoothScroll />

      {/* Above-the-fold content - load immediately */}
      <Hero />

      {/* Below-the-fold content - can be lazy loaded */}
<<<<<<< HEAD
      <SectionContainer>
        <PopularCategories />
      </SectionContainer>

      <SectionContainer className="bg-muted/30">
        <HowItWorks />
      </SectionContainer>

      <SuspenseWrapper>
        <VIPCenters showFullBackground={true} />
      </SuspenseWrapper>

      <SuspenseWrapper>
        <SectionContainer id="featured">
          <FeaturedCenters />
        </SectionContainer>
      </SuspenseWrapper>

      <SuspenseWrapper>
        <SectionContainer className="bg-muted/30">
          <FeaturedTeachers />
        </SectionContainer>
      </SuspenseWrapper>

      <SuspenseWrapper>
=======
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
>>>>>>> 709ce0c632a57b402101b5cffe82a0f5dc050795
        <SectionContainer>
          <PopularCategories />
        </SectionContainer>
<<<<<<< HEAD
      </SuspenseWrapper>

      <SectionContainer className="bg-primary/5">
        <CallToAction />
      </SectionContainer>
=======
        
        <SectionContainer className="bg-muted/30">
          <HowItWorks />
        </SectionContainer>
        
        <SuspenseWrapper>
          <VIPCenters showFullBackground={true} />
        </SuspenseWrapper>
        
        <SectionDivider variant="wave" color="background" className="transform -translate-y-1" />
        
        <SuspenseWrapper>
          <SectionContainer id="featured" ref={featuredRef}>
            <FeaturedCenters />
          </SectionContainer>
        </SuspenseWrapper>
        
        <SectionDivider variant="curve" color="muted" className="transform -translate-y-1" />
        
        <SuspenseWrapper>
          <SectionContainer className="bg-muted/30">
            <FeaturedTeachers />
          </SectionContainer>
        </SuspenseWrapper>
        
        <SuspenseWrapper>
          <SectionContainer>
            <Testimonials />
          </SectionContainer>
        </SuspenseWrapper>
        
        <SectionContainer className="bg-primary/5">
          <CallToAction />
        </SectionContainer>
      </motion.div>
>>>>>>> 709ce0c632a57b402101b5cffe82a0f5dc050795
    </HomeLayout>
  );
};

export default Index;
