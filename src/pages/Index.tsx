import { lazy, Suspense } from "react";
import { HomeLayout, SmoothScroll } from "@/components/home";
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/how-it-works";
import PopularCategories from "@/components/sections/PopularCategories";
import VIPCenters from "@/components/sections/VIPCenters";
import FeaturedCenters from "@/components/sections/FeaturedCenters";
import FeaturedTeachers from "@/components/sections/FeaturedTeachers";
import Testimonials from "@/components/testimonials";
import CallToAction from "@/components/sections/CallToAction";
import SectionContainer from "@/components/home/SectionContainer";

// Use SuspenseWrapper for below-the-fold content
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <div className="h-96 flex items-center justify-center">Loading...</div>
    }
  >
    {children}
  </Suspense>
);

const Index = () => {
  return (
    <HomeLayout>
      <SmoothScroll />

      {/* Above-the-fold content - load immediately */}
      <Hero />

      {/* Below-the-fold content - can be lazy loaded */}
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
        <SectionContainer>
          <Testimonials />
        </SectionContainer>
      </SuspenseWrapper>

      <SectionContainer className="bg-primary/5">
        <CallToAction />
      </SectionContainer>
    </HomeLayout>
  );
};

export default Index;
