
import { HomeLayout, SmoothScroll } from "@/components/home";
import { 
  LandingHero,
  FeatureGrid,
  HowItWorksBanner,
  PopularCategoriesGrid,
  TestimonialsGrid,
  StatsRow,
  CTABanner,
  FeaturedTeachersSection,
  VIPCenters
} from "@/components/sections";

const Index = () => {
  return (
    <HomeLayout>
      <SmoothScroll />
      
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center relative bg-gradient-to-b from-background to-muted/20">
        <LandingHero />
      </section>
      
      {/* Stats Counter */}
      <StatsRow />
      
      {/* Features Grid */}
      <FeatureGrid />
      
      {/* How It Works */}
      <HowItWorksBanner />
      
      {/* Popular Categories */}
      <PopularCategoriesGrid />
      
      {/* VIP Centers */}
      <VIPCenters />
      
      {/* Featured Teachers */}
      <FeaturedTeachersSection />
      
      {/* Testimonials */}
      <TestimonialsGrid />
      
      {/* Call to Action */}
      <CTABanner />
    </HomeLayout>
  );
};

export default Index;
