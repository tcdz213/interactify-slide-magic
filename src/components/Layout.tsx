
import React, { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./navigation/Navbar";
import Footer from "./Footer";
import Sponsors from "./Sponsors";
import { Toaster } from "@/components/ui/toaster";
import { GuidedTour } from "./ui/guided-tour";
import { useTour } from "@/hooks/useTour";
import SmoothScroll from "./home/SmoothScroll";

interface LayoutProps {
  children?: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { showTour, setShowTour, completeTour } = useTour();

  // Define the tour steps
  const tourSteps = [
    {
      title: "Welcome to our platform",
      description: "This guided tour will help you discover all the key features of our platform.",
      element: "nav", // Target the navigation bar first
    },
    {
      title: "Discover training centers",
      description: "Browse through our extensive collection of training centers and find the perfect match for your needs.",
      element: "main", // Target the main content area
    },
    {
      title: "Customize your experience",
      description: "Use filters and search to narrow down results and find exactly what you're looking for.",
      element: "footer", // End by highlighting the footer
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SmoothScroll />
      <Navbar />
      <main className="flex-1 pt-16 md:pt-20">{children || <Outlet />}</main>
      <Sponsors />
      <Footer />
      <Toaster />
      
      {/* Guided Tour */}
      <GuidedTour 
        steps={tourSteps}
        isOpen={showTour}
        onOpenChange={setShowTour}
        onComplete={completeTour}
      />
    </div>
  );
};

export default Layout;
