import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Locate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatedLoading } from '@/components/AnimatedLoading';

// Fix default marker icon issue with Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  useGeolocation?: boolean; // Whether to use user's current location on mount
}

export const LocationMapPicker = ({ 
  initialLat = 24.7136, // Riyadh default
  initialLng = 46.6753,
  onLocationSelect,
  useGeolocation = true // Default to true for create card
}: LocationMapPickerProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    setIsLoading(true);

    // Get user's location first only if useGeolocation is true
    if (useGeolocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          initializeMap(userLat, userLng);
        },
        () => {
          // Fallback to initial location
          initializeMap(initialLat, initialLng);
        }
      );
    } else {
      // Use initial location directly without geolocation
      initializeMap(initialLat, initialLng);
    }

    function initializeMap(lat: number, lng: number) {
      if (!containerRef.current) return;

      // Initialize map
      const map = L.map(containerRef.current, {
        zoomControl: false,
      }).setView([lat, lng], 15);
      
      // Add zoom control to top right
      L.control.zoom({ position: 'topright' }).addTo(map);
      
      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Create custom marker icon
      const customIcon = L.divIcon({
        className: 'custom-location-marker',
        html: `
          <div class="relative">
            <div class="w-10 h-10 bg-primary rounded-full shadow-lg flex items-center justify-center animate-bounce">
              <svg class="w-6 h-6 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      // Add initial marker
      const marker = L.marker([lat, lng], {
        draggable: true,
        icon: customIcon,
      }).addTo(map);

      // Handle marker drag
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        onLocationSelect(position.lat, position.lng);
      });

      // Handle map click
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        map.flyTo([lat, lng], map.getZoom(), { duration: 0.5 });
        onLocationSelect(lat, lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
      setIsMapReady(true);
      setIsLoading(false);
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const centerOnCurrentLocation = () => {
    if (navigator.geolocation && mapRef.current && markerRef.current) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapRef.current?.flyTo([latitude, longitude], 15, { duration: 1.5 });
          markerRef.current?.setLatLng([latitude, longitude]);
          onLocationSelect(latitude, longitude);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoading(false);
        }
      );
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !mapRef.current || !markerRef.current) return;
    
    setIsLoading(true);
    try {
      // Use Nominatim for geocoding (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const { lat, lon } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        
        mapRef.current.flyTo([latitude, longitude], 15, { duration: 1.5 });
        markerRef.current.setLatLng([latitude, longitude]);
        onLocationSelect(latitude, longitude);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleSearch}
          disabled={!searchQuery.trim()}
        >
          <Search className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={centerOnCurrentLocation}
          title="Use my location"
        >
          <Locate className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Click on the map or drag the marker to select your location
      </p>

      {/* Map Container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <AnimatedLoading size={50} />
          </div>
        )}
        <div 
          ref={containerRef} 
          className="w-full h-[400px] rounded-lg border border-border overflow-hidden shadow-lg transition-all"
          style={{ zIndex: 0 }}
        />
      </div>
    </div>
  );
};
