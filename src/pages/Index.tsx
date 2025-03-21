
import { HomeLayout, SmoothScroll } from "@/components/home";
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import PopularCategories from "@/components/sections/PopularCategories";
import VIPCenters from "@/components/VIPCenters";
import FeaturedCenters from "@/components/FeaturedCenters";
import FeaturedTeachers from "@/components/sections/FeaturedTeachers";
import Testimonials from "@/components/testimonials";
import CallToAction from "@/components/sections/CallToAction";

const Index = () => {
  return (
    <HomeLayout>
      <SmoothScroll />
      <Hero />
      <PopularCategories />
      <HowItWorks />
      <VIPCenters />
      <FeaturedCenters />
      <FeaturedTeachers />
      <Testimonials />
      <CallToAction />
    </HomeLayout>
  );
};

export default Index;
