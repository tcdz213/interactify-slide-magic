
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { featureLabels } from '../types';
import { Center } from '../types';
import { CurrencyDisplay } from '@/components/home';
import { ViewDetailsButton } from './';

interface GridCardContentProps {
  center: Center;
  handleViewDetails: (centerId: number) => void;
}

const GridCardContent: React.FC<GridCardContentProps> = ({ center, handleViewDetails }) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-2">{center.name}</h3>
      <div className="flex items-center text-muted-foreground text-sm mb-2">
        <svg className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>{center.location}</span>
      </div>
      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
        {center.description}
      </p>
      
      <div className="flex flex-wrap gap-1 mb-3">
        {center.features.slice(0, 2).map(feature => (
          <Badge key={feature} variant="outline" className="text-xs rounded-full px-2 py-0 bg-primary/5">
            {featureLabels[feature]}
          </Badge>
        ))}
        {center.features.length > 2 && (
          <Badge variant="outline" className="text-xs rounded-full px-2 py-0 bg-primary/5">
            +{center.features.length - 2} more
          </Badge>
        )}
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <svg className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12.75C13.63 12.75 15.07 13.14 16.24 13.65C17.32 14.13 18 15.21 18 16.38V17C18 17.55 17.55 18 17 18H7C6.45 18 6 17.55 6 17V16.39C6 15.21 6.68 14.13 7.76 13.66C8.93 13.14 10.37 12.75 12 12.75ZM4 13C5.1 13 6 12.1 6 11C6 9.9 5.1 9 4 9C2.9 9 2 9.9 2 11C2 12.1 2.9 13 4 13ZM5.13 14.1C4.76 14.04 4.39 14 4 14C3.01 14 2.07 14.21 1.22 14.58C0.48 14.9 0 15.62 0 16.43V17C0 17.55 0.45 18 1 18H4.5V16.39C4.5 15.56 4.73 14.78 5.13 14.1ZM20 13C21.1 13 22 12.1 22 11C22 9.9 21.1 9 20 9C18.9 9 18 9.9 18 11C18 12.1 18.9 13 20 13ZM24 16.43C24 15.62 23.52 14.9 22.78 14.58C21.93 14.21 20.99 14 20 14C19.61 14 19.24 14.04 18.87 14.1C19.27 14.78 19.5 15.56 19.5 16.39V18H23C23.55 18 24 17.55 24 17V16.43ZM12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6Z" fill="currentColor"/>
          </svg>
          <span>{center.reviews} reviews</span>
        </div>
        <div className="text-primary font-medium">
          <CurrencyDisplay amount={center.price} currency={center.currency} />
        </div>
      </div>
      
      <ViewDetailsButton 
        variant="outline"
        onClick={() => handleViewDetails(center.id)}
        fullWidth={true}
      />
    </div>
  );
};

export default GridCardContent;
