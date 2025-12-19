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
        <title>DevCycle - Product Development Platform for Modern Teams</title>
        <meta 
          name="description" 
          content="DevCycle is the complete product development platform that unifies feature lifecycle, sprint management, team collaboration, and release pipeline in one place." 
        />
        <meta name="keywords" content="product development, sprint planning, agile, project management, software development, team collaboration, feature management" />
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
