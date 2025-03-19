
import React, { useState, useEffect } from 'react';
import { Grid2X2, List, FilterX } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import CenterCard from './CenterCard';
import NoResults from './NoResults';
import Pagination from './Pagination';
import { Center as CenterType } from '@/types/center.types'; // Use the unified Center type
import { Center as ComponentCenter } from './types'; // Also import the component Center type

interface CentersListProps {
  centers: CenterType[];
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  clearFilters: () => void;
  isLoading?: boolean;
}

const CentersList: React.FC<CentersListProps> = ({ 
  centers, 
  viewMode, 
  setViewMode,
  clearFilters,
  isLoading = false
}) => {
  // Simulated loading states for demonstration
  const [loadingCenters, setLoadingCenters] = useState<ComponentCenter[]>([]);
  
  // Create dummy center placeholders for loading state
  useEffect(() => {
    if (isLoading) {
      const dummyCenters = Array(6).fill(null).map((_, idx) => ({
        id: idx,
        name: 'Loading...',
        location: 'Loading...',
        category: 'Loading...',
        rating: 0,
        reviews: 0,
        image: '',
        price: '$0',
        currency: 'USD',
        featured: false,
        description: 'Loading...',
        features: [],
        status: 'active',
        verified: false
      }));
      setLoadingCenters(dummyCenters);
    }
  }, [isLoading]);

  // Cast centers to the component Center type
  const componentCenters = centers as unknown as ComponentCenter[];

  return (
    <>
      <div className="flex justify-end mb-6">
        <Tabs defaultValue="grid" value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'list')} className="hidden md:block">
          <TabsList>
            <TabsTrigger value="grid" className="flex items-center gap-1">
              <Grid2X2 className="h-4 w-4" />
              <span className="sr-only">Grid view</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-1">
              <List className="h-4 w-4" />
              <span className="sr-only">List view</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {isLoading ? (
        // Show loading skeleton cards
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingCenters.map((center) => (
              <CenterCard key={center.id} center={center} viewMode="grid" isLoading={true} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {loadingCenters.map((center) => (
              <CenterCard key={center.id} center={center} viewMode="list" isLoading={true} />
            ))}
          </div>
        )
      ) : componentCenters.length > 0 ? (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {componentCenters.map((center) => (
                <CenterCard key={center.id} center={center} viewMode="grid" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {componentCenters.map((center) => (
                <CenterCard key={center.id} center={center} viewMode="list" />
              ))}
            </div>
          )}
          
          <Pagination />
        </>
      ) : (
        <NoResults clearFilters={clearFilters} />
      )}
    </>
  );
};

export default CentersList;
