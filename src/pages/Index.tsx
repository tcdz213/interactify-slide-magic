
import { HomeLayout, SmoothScroll } from "@/components/home";
import Hero from "@/components/Hero";
import VIPCenters from "@/components/VIPCenters";
import FeaturedCenters from "@/components/FeaturedCenters";
import Testimonials from "@/components/Testimonials";
import CallToAction from "@/components/CallToAction";
import HowItWorks from "@/components/HowItWorks";
import { FeaturedTeachersSection } from "@/components/sections";
import RecommendationsSection from "@/components/centers/RecommendationsSection";

const Index = () => {
  return (
    <HomeLayout>
      <SmoothScroll />
      <Hero />
      <HowItWorks />
      <VIPCenters />
      <FeaturedTeachersSection />
      <RecommendationsSection title="Popular Courses" />
      <FeaturedCenters />
      <Testimonials />
      <CallToAction />
    </HomeLayout>
  );
};

export default Index;
