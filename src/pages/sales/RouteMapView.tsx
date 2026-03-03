/**
 * Map component using raw Leaflet (no react-leaflet dependency).
 * This avoids react-leaflet version compatibility issues with React 18.
 */
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { VisitLog } from "@/services/visitLogService";

// Fix Leaflet default icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const visitIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const activeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

export interface PlannedVisit {
  customerId: string;
  name: string;
  lat: number;
  lng: number;
  time: string;
  zone: string;
}

interface RouteMapViewProps {
  plannedVisits: PlannedVisit[];
  activeVisit: VisitLog | null;
  completedIds: Set<string>;
  onCheckIn: (pv: PlannedVisit) => void;
  onCheckOut: (visit: VisitLog) => void;
}

export default function RouteMapView({ plannedVisits, activeVisit, completedIds, onCheckIn, onCheckOut }: RouteMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([36.755, 3.055], 13);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    const bounds: L.LatLngExpression[] = [];

    plannedVisits.forEach((pv) => {
      const isActive = activeVisit?.customerId === pv.customerId;
      const isDone = completedIds.has(pv.customerId);

      const marker = L.marker([pv.lat, pv.lng], {
        icon: isActive ? activeIcon : visitIcon,
        opacity: isDone ? 0.5 : 1,
      }).addTo(map);

      bounds.push([pv.lat, pv.lng]);

      const statusHtml = isDone
        ? '<span style="color:#059669;font-weight:600">✓ Terminée</span>'
        : isActive
        ? `<button class="leaflet-checkout-btn" data-customer="${pv.customerId}">🚪 Check-out</button>`
        : `<button class="leaflet-checkin-btn" data-customer="${pv.customerId}">📍 Check-in</button>`;

      marker.bindPopup(`
        <div style="min-width:160px">
          <p style="font-weight:600;margin:0 0 4px">${pv.name}</p>
          <p style="color:#888;margin:0 0 6px;font-size:12px">${pv.zone} · ${pv.time}</p>
          ${statusHtml}
        </div>
      `);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [40, 40], maxZoom: 14 });
    }

    // Event delegation for popup buttons
    const handlePopupClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("leaflet-checkin-btn")) {
        const customerId = target.dataset.customer;
        const pv = plannedVisits.find((v) => v.customerId === customerId);
        if (pv) onCheckIn(pv);
      }
      if (target.classList.contains("leaflet-checkout-btn")) {
        if (activeVisit) onCheckOut(activeVisit);
      }
    };

    map.getContainer().addEventListener("click", handlePopupClick);
    return () => {
      map.getContainer().removeEventListener("click", handlePopupClick);
    };
  }, [plannedVisits, activeVisit, completedIds, onCheckIn, onCheckOut]);

  return (
    <>
      <style>{`
        .leaflet-checkin-btn, .leaflet-checkout-btn {
          display: block; width: 100%; padding: 6px 12px; margin-top: 6px;
          border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;
        }
        .leaflet-checkin-btn { background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); }
        .leaflet-checkout-btn { background: hsl(var(--destructive)); color: hsl(var(--destructive-foreground)); }
        .leaflet-checkin-btn:hover { opacity: 0.9; }
        .leaflet-checkout-btn:hover { opacity: 0.9; }
      `}</style>
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
    </>
  );
}
