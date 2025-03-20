
import { HomeLayout, SmoothScroll } from "@/components/home";
import Hero from "@/components/sections/Hero";
import VIPCenters from "@/components/sections/VIPCenters";
import FeaturedCenters from "@/components/sections/FeaturedCenters";
import Testimonials from "@/components/Testimonials";
import CallToAction from "@/components/sections/CallToAction";
import HowItWorks from "@/components/sections/HowItWorks";
import FeaturedTeachers from "@/components/sections/FeaturedTeachers";
import PopularCategories from "@/components/sections/PopularCategories";

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
