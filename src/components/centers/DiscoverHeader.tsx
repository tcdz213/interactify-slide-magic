
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Search } from 'lucide-react';

const DiscoverHeader: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="mb-8 animate-fade-up">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="bg-primary/10 text-primary border-0 px-3 py-1">
          <Building className="h-3 w-3 mr-1" />
          <span>Training Centers</span>
        </Badge>
        <Badge variant="outline" className="bg-secondary/10 text-secondary border-0 px-3 py-1">
          <MapPin className="h-3 w-3 mr-1" />
          <span>Find Nearby</span>
        </Badge>
      </div>
      
      <h1 className={`text-3xl md:text-4xl font-semibold mb-3 ${
        isDarkMode ? 'text-gradient' : ''
      }`}>
        Discover Training Centers
      </h1>
      <p className="text-muted-foreground max-w-2xl">
        Browse, filter, and find the perfect training center for your needs. 
        We've curated the best centers to help you achieve your goals.
      </p>
      
      <div className="mt-4 h-1 w-20 bg-gradient-to-r from-primary to-primary/40 rounded-full"></div>
    </div>
  );
};

export default DiscoverHeader;
