import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Testimonials } from "@/components/Testimonials";
import { Pricing } from "@/components/Pricing";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>DevCycle - Ship Software 10x Faster | Product Development Platform</title>
        <meta 
          name="description" 
          content="DevCycle is the complete product development platform for modern teams. From ideation to production with AI-powered sprint planning, feature lifecycle management, and real-time analytics." 
        />
        <meta name="keywords" content="product development, sprint planning, agile, project management, software development, team collaboration" />
        <link rel="canonical" href="https://devcycle.app" />
      </Helmet>
      <main className="min-h-screen bg-background">
        <Navbar />
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <CTA />
        <Footer />
      </main>
    </>
  );
};

export default Index;
