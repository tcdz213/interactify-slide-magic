
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LocationFilterProps {
  locationLabel: string;
}

const LocationFilter: React.FC<LocationFilterProps> = ({ locationLabel }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="h-12 rounded-lg px-4 flex justify-between items-center w-full md:w-auto gap-2"
          aria-label="Select location"
        >
          <MapPin className="h-4 w-4" aria-hidden="true" />
          <span className="text-muted-foreground">{locationLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4">
        <div className="space-y-4">
          <h3 className="font-medium" id="location-heading">Select Location</h3>
          <Label htmlFor="location-input" className="sr-only">Enter location</Label>
          <Input 
            id="location-input" 
            type="text" 
            placeholder="Enter city or zip code" 
            aria-labelledby="location-heading"
          />
          <div className="space-y-2">
            <Label htmlFor="distance-select" id="distance-label" className="text-sm font-medium">Distance</Label>
            <Select defaultValue="10">
              <SelectTrigger id="distance-select" aria-labelledby="distance-label">
                <SelectValue placeholder="Select distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Within 5 miles</SelectItem>
                <SelectItem value="10">Within 10 miles</SelectItem>
                <SelectItem value="25">Within 25 miles</SelectItem>
                <SelectItem value="50">Within 50 miles</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LocationFilter;
