
import React from "react";
import LearnerProfileManagement from "@/components/learners/LearnerProfileManagement";
import Header from "@/components/Header";
import Sponsors from "@/components/Sponsors";
import Footer from "@/components/Footer";

const LearnerProfilePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container max-w-6xl mx-auto px-4">
          <LearnerProfileManagement />
        </div>
      </main>
      <Sponsors />
      <Footer />
    </div>
  );
};

export default LearnerProfilePage;
