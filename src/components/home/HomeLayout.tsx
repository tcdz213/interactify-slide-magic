
import React, { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sponsors from "@/components/Sponsors";

interface HomeLayoutProps {
  children: React.ReactNode;
}

const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-white">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <Sponsors />
      <Footer />
    </div>
  );
};

export default HomeLayout;
