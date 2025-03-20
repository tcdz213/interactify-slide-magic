
import { HomeLayout, SmoothScroll } from "@/components/home";
import Hero from "@/components/Hero";
import VIPCenters from "@/components/VIPCenters";
import FeaturedCenters from "@/components/FeaturedCenters";
import Testimonials from "@/components/Testimonials";
import CallToAction from "@/components/CallToAction";

const Index = () => {
  return (
    <HomeLayout>
      <SmoothScroll />
      <Hero />
      <VIPCenters />
      <FeaturedCenters />
      <Testimonials />
      <CallToAction />
    </HomeLayout>
  );
};

export default Index;
