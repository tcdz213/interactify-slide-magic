
import React from 'react';
import { FilterX } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface NoResultsProps {
  clearFilters: () => void;
}

const NoResults: React.FC<NoResultsProps> = ({ clearFilters }) => {
  return (
    <div className="text-center py-16 discover-filter rounded-xl p-8">
      <h3 className="text-xl font-medium mb-2 dark:text-gray-200">No results found</h3>
      <p className="text-muted-foreground mb-6 dark:text-gray-400">Try adjusting your filters to find more training centers.</p>
      <Button onClick={clearFilters} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200">
        <FilterX className="h-4 w-4 mr-2" />
        Clear All Filters
      </Button>
    </div>
  );
};

export default NoResults;
