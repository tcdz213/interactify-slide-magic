
import React from "react";
import { DiscoverHeader, BrowseCategoryButton } from "@/components/centers";

const DiscoverPageHeader: React.FC = () => {
  return (
    <div className="flex justify-between items-center mb-8">
      <DiscoverHeader />
      <BrowseCategoryButton />
    </div>
  );
};

export default DiscoverPageHeader;
