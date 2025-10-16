import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Check } from '@/components/ui/icon';
import { toast } from '@/hooks/use-toast';
import { LocationMapPicker } from '@/components/LocationMapPicker';

interface MapLocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialLocation?: { lat: number; lng: number };
}

export const MapLocationPicker = ({ 
  isOpen, 
  onClose, 
  onLocationSelect,
  initialLocation 
}: MapLocationPickerProps) => {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );

  const handleLocationChange = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation.lat, selectedLocation.lng);
      toast({
        title: "✅ Location selected",
        description: "Your location has been updated successfully",
      });
      onClose();
    } else {
      toast({
        title: "⚠️ No location selected",
        description: "Please select a location on the map",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-full sm:w-[95vw] sm:h-[90vh] p-0 sm:p-6 sm:rounded-lg">
        <DialogHeader className="p-4 sm:p-0 border-b sm:border-0">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Choose Location on Map
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-[calc(100vh-8rem)] sm:h-auto space-y-3 sm:space-y-4 p-4 sm:p-0">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Click on the map to select your location. You can also drag the marker.
          </p>
          
          {/* Map Component */}
          <div className="flex-1 w-full min-h-0">
            <LocationMapPicker
              initialLat={initialLocation?.lat}
              initialLng={initialLocation?.lng}
              onLocationSelect={handleLocationChange}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2 pb-2 sm:pb-0">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!selectedLocation}
              className="w-full sm:w-auto bg-gradient-primary"
            >
              <Check className="w-4 h-4 mr-2" />
              Confirm Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
