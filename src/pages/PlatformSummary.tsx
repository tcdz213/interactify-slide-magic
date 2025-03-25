
import React from "react";
import HeaderSection from "@/components/HeaderSection";
import FooterSection from "@/components/FooterSection";
import SponsorsSection from "@/components/SponsorsSection";
import PlatformFeatures from "@/components/marketing/PlatformFeatures";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const PlatformSummary = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderSection />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-24">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {t("platform.title", "A Complete Educational Ecosystem")}
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                {t("platform.subtitle", "Connecting learners, trainers, and training centers to create better educational opportunities for everyone")}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/discover")}
                  className="rounded-full px-6"
                >
                  {t("platform.startLearning", "Start Learning")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => navigate("/teacher-job-listings")}
                  className="rounded-full px-6"
                >
                  {t("platform.becomeTrainer", "Become a Trainer")}
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16">
          <PlatformFeatures />
        </section>
        
        {/* Call to Action */}
        <section className="bg-primary/5 py-16">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="bg-card rounded-xl shadow-lg p-8 md:p-12 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">
                {t("platform.joinCommunity", "Join Our Educational Community")}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t("platform.communityDescription", "Whether you want to learn new skills, share your expertise, or grow your training business, our platform provides all the tools you need.")}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/register")}
                >
                  {t("platform.register", "Register Now")}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => navigate("/contact")}
                >
                  {t("platform.contactUs", "Contact Us")}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SponsorsSection />
      <FooterSection />
    </div>
  );
};

export default PlatformSummary;
