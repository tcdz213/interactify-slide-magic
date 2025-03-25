import { lazy, Suspense } from "react";
import { HomeLayout, SmoothScroll } from "@/components/home";
import Hero from "@/components/Hero";
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
    </HomeLayout>
  );
};

export default Index;
