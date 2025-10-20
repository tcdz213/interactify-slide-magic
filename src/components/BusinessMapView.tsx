import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BusinessCardDisplay } from '@/services/businessApi';
import { getDomainIcon } from '@/utils/categoryIcons';
import { renderToString } from 'react-dom/server';
import { AnimatedLoading } from '@/components/AnimatedLoading';
import { Button } from '@/components/ui/button';
import { Locate, Maximize2, Minimize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LazyBusinessCard } from '@/components/LazyBusinessCard';

// Fix default marker icon issue with Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface BusinessMapViewProps {
  businesses: BusinessCardDisplay[];
  onBusinessClick: (business: BusinessCardDisplay) => void;
}

export const BusinessMapView = ({ businesses, onBusinessClick }: BusinessMapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const initializedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessCardDisplay | null>(null);

  useEffect(() => {
    if (!containerRef.current || initializedRef.current) return;

    // Initialize map if not already created
    if (!mapRef.current) {
      initializedRef.current = true;
      setIsLoading(true);
      
      // Try to get user's location first
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLoc: [number, number] = [position.coords.latitude, position.coords.longitude];
            setUserLocation(userLoc);
            
            // Initialize map with user's location
            const map = L.map(containerRef.current!, {
              zoomControl: false,
              attributionControl: true,
            }).setView(userLoc, 13);
            
            // Add zoom control to top right
            L.control.zoom({ position: 'topright' }).addTo(map);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19,
            }).addTo(map);

            // Add user location marker
            const userIcon = L.divIcon({
              className: 'user-location-marker',
              html: '<div class="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg animate-pulse"></div>',
              iconSize: [16, 16],
            });
            L.marker(userLoc, { icon: userIcon }).addTo(map);

            mapRef.current = map;
            setIsLoading(false);
          },
          (error) => {
            console.log('Geolocation error, using default location:', error);
            // Fall back to default location (Riyadh)
            const map = L.map(containerRef.current!, {
              zoomControl: false,
              attributionControl: true,
            }).setView([24.7136, 46.6753], 12);
            
            L.control.zoom({ position: 'topright' }).addTo(map);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19,
            }).addTo(map);

            mapRef.current = map;
            setIsLoading(false);
          }
        );
      } else {
        // Geolocation not supported, use default location
        const map = L.map(containerRef.current, {
          zoomControl: false,
          attributionControl: true,
        }).setView([24.7136, 46.6753], 12);
        
        L.control.zoom({ position: 'topright' }).addTo(map);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;
        setIsLoading(false);
      }
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for businesses with valid locations
    const validBusinesses = businesses.filter(b => b.location?.lat && b.location?.lng);
    
    if (validBusinesses.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(
        validBusinesses.map(b => [b.location!.lat!, b.location!.lng!] as [number, number])
      );

      validBusinesses.forEach(business => {
        // Create custom marker icon with category color
        const iconHtml = `
          <div class="relative">
            <div class="w-8 h-8 bg-primary rounded-full shadow-lg flex items-center justify-center animate-scale-in">
              <svg class="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          </div>
        `;
        
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        const marker = L.marker([business.location!.lat!, business.location!.lng!], {
          icon: customIcon,
        }).addTo(mapRef.current!);

        // Create enhanced popup content
        const popupContent = `
          <div class="p-3 min-w-[220px]">
            <h3 class="font-semibold text-base mb-1">${business.company}</h3>
            <p class="text-xs text-muted-foreground mb-1">${business.title}</p>
            ${business.description ? `<p class="text-xs text-muted-foreground mb-2 line-clamp-2">${business.description}</p>` : ''}
            <button 
              class="w-full px-3 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all hover:scale-105"
              onclick="window.dispatchEvent(new CustomEvent('business-map-click', { detail: '${business._id}' }))"
            >
              View Details
            </button>
          </div>
        `;

        marker.bindPopup(popupContent, {
          maxWidth: 250,
          className: 'custom-popup',
        });

        // Add hover effect
        marker.on('mouseover', function() {
          this.openPopup();
        });

        markersRef.current.push(marker);
      });

      // Fit map to show all markers with smooth animation
      mapRef.current.flyToBounds(bounds, { 
        padding: [50, 50],
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }

    // Handle business click events from popups
    const handleBusinessClick = (e: CustomEvent) => {
      const businessId = e.detail;
      const business = businesses.find(b => b._id === businessId);
      if (business) {
        setSelectedBusiness(business);
      }
    };

    window.addEventListener('business-map-click', handleBusinessClick as EventListener);

    return () => {
      window.removeEventListener('business-map-click', handleBusinessClick as EventListener);
    };
  }, [businesses, onBusinessClick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleLocateMe = () => {
    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(newLocation);
          mapRef.current?.flyTo(newLocation, 15, {
            duration: 1.5,
          });
        }
      );
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={cn(
      "relative rounded-xl border border-border overflow-hidden shadow-lg transition-all duration-300",
      isFullscreen ? "fixed inset-4 z-50" : "w-full h-[calc(100vh-280px)]"
    )}>
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center">
            <AnimatedLoading size={60} />
            <p className="mt-4 text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
      
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <Button
          size="icon"
          variant="secondary"
          className="shadow-lg bg-background/95 backdrop-blur-sm hover:scale-110 transition-transform"
          onClick={handleLocateMe}
        >
          <Locate className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="shadow-lg bg-background/95 backdrop-blur-sm hover:scale-110 transition-transform"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>

      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ zIndex: 0 }}
      />

      {/* Business Card Overlay */}
      {selectedBusiness && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] max-w-md mx-auto animate-in slide-in-from-bottom-5">
          <div className="relative bg-background/95 backdrop-blur-sm rounded-lg shadow-2xl border border-border">
            <Button
              size="icon"
              variant="ghost"
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-background shadow-lg hover:scale-110 transition-transform z-10"
              onClick={() => setSelectedBusiness(null)}
            >
              <X className="w-4 h-4" />
            </Button>
            <LazyBusinessCard 
              card={selectedBusiness} 
              variant="compact"
              onClick={() => onBusinessClick(selectedBusiness)}
            />
          </div>
        </div>
      )}
    </div>
  );
};