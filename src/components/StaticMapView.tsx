import { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon } from 'ol/style';
import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';
import 'ol/ol.css';

interface StaticMapViewProps {
  latitude: number;
  longitude: number;
  title?: string;
  address?: string;
}

const StaticMapView = ({ latitude, longitude, title, address }: StaticMapViewProps) => {
  const mapRef = useRef<Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const coordinates = fromLonLat([longitude, latitude]);

    // Create marker feature
    const markerFeature = new Feature({
      geometry: new Point(coordinates),
    });

    // Create marker style
    const markerStyle = new Style({
      image: new Icon({
        src: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        anchor: [0.5, 1],
        scale: 1,
      }),
    });

    markerFeature.setStyle(markerStyle);

    // Create vector layer for marker
    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [markerFeature],
      }),
    });

    // Initialize map
    const map = new Map({
      target: containerRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: coordinates,
        zoom: 15,
      }),
      controls: [],
    });

    mapRef.current = map;

    // Add popup if title or address provided
    if ((title || address) && popupRef.current) {
      const overlay = new Overlay({
        element: popupRef.current,
        positioning: 'bottom-center',
        offset: [0, -10],
        autoPan: true,
      });
      
      map.addOverlay(overlay);
      overlay.setPosition(coordinates);
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(undefined);
        mapRef.current = null;
      }
    };
  }, [latitude, longitude, title, address]);

  return (
    <>
      <div 
        ref={containerRef} 
        className="w-full h-[300px] rounded-lg overflow-hidden border border-border"
      />
      {(title || address) && (
        <div 
          ref={popupRef}
          className="bg-background border border-border rounded-lg shadow-lg p-2"
        >
          <div className="text-sm">
            {title && <div className="font-semibold mb-1">{title}</div>}
            {address && <div className="text-muted-foreground">{address}</div>}
          </div>
        </div>
      )}
    </>
  );
};

export default StaticMapView;
