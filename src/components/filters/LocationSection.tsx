import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MapPin, Navigation, X } from "@/components/ui/icon";
import { BusinessSearchFilters } from "@/services/businessApi";
import { useGeolocation } from "@/hooks/use-geolocation";
import { MapLocationPicker } from "@/components/MapLocationPicker";

interface LocationSectionProps {
  filters: BusinessSearchFilters;
  onFilterChange: (key: string, value: any) => void;
}

export const LocationSection = ({ filters, onFilterChange }: LocationSectionProps) => {
  const { location, isLoading: locationLoading, requestLocation, clearLocation } = useGeolocation();
  const [isMapOpen, setIsMapOpen] = useState(false);

  const handleLocationRequest = async () => {
    const result = await requestLocation();
    if (result) {
      console.log('📍 LocationSection: Geolocation result:', result);
      // Update latitude first, then longitude, then city
      onFilterChange("latitude", result.latitude);
      onFilterChange("longitude", result.longitude);
      if (result.city && result.city !== 'Unknown') {
        onFilterChange("city", result.city);
      }
    }
  };

  const handleMapLocationSelect = (lat: number, lng: number, address?: string) => {
    console.log('🗺️ LocationSection: Map location selected:', { lat, lng, address });
    
    // Extract city from address if available
    const city = address?.split(',')[0]?.trim() || '';
    
    // Update all location-related filters
    onFilterChange("latitude", lat);
    onFilterChange("longitude", lng);
    if (city && city !== 'Unknown') {
      onFilterChange("city", city);
    }
    
    setIsMapOpen(false);
  };

  const handleClearLocation = () => {
    console.log('🗑️ LocationSection: Clearing location');
    clearLocation();
    onFilterChange("city", "");
    onFilterChange("latitude", undefined);
    onFilterChange("longitude", undefined);
    onFilterChange("radius", 10);
  };

  // Note: Auto-detection is handled by the parent component (Home)
  // to avoid conflicts with FilterSidebar's local state management

  const hasLocation = location || (filters.latitude !== undefined && filters.longitude !== undefined);
  const displayCity = filters.city || location?.city || 'Current Location';

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
        📍 Position & Range
      </Label>
      
      {/* Current Location Display */}
      {hasLocation && (
        <div className="flex items-center justify-between p-2.5 sm:p-3 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate">
              {displayCity}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-7 w-7 shrink-0 active:scale-95"
            onClick={handleClearLocation}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
      
      {/* Location Selection Buttons */}
      {!hasLocation && (
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="justify-start h-11 active:scale-95"
            onClick={handleLocationRequest}
            disabled={locationLoading}
          >
            <Navigation className="w-4 h-4 mr-2 shrink-0" />
            <span className="text-xs sm:text-sm truncate">
              {locationLoading ? "Loading..." : "My Location"}
            </span>
          </Button>
          
          <Button
            variant="outline"
            className="justify-start h-11 active:scale-95"
            onClick={() => setIsMapOpen(true)}
          >
            <MapPin className="w-4 h-4 mr-2 shrink-0" />
            <span className="text-xs sm:text-sm truncate">Choose on Map</span>
          </Button>
        </div>
      )}
      
      {/* Map Location Picker Dialog */}
      <MapLocationPicker
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onLocationSelect={handleMapLocationSelect}
        initialLocation={location ? { lat: location.latitude, lng: location.longitude } : undefined}
      />
      
      {/* Range Slider - Show when location is available */}
      {hasLocation && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] sm:text-xs text-muted-foreground">
              Search Radius
            </Label>
            <span className="text-xs sm:text-sm font-bold text-primary">
              {filters.radius || 10} km
            </span>
          </div>
          <Slider
            value={[filters.radius || 10]}
            onValueChange={(value) => onFilterChange("radius", value[0])}
            max={100}
            min={1}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
            <span>1 km</span>
            <span>50 km</span>
            <span>100 km</span>
          </div>
        </div>
      )}
    </div>
  );
};
