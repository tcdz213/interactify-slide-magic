import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { todayTrip } from "../data/mockDeliveryData";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function TripMapScreen() {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView([35.6950, -0.6300], 13);
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    const statusColors: Record<string, string> = {
      delivered: "#22c55e",
      partially_delivered: "#f59e0b",
      refused: "#ef4444",
      in_progress: "#3b82f6",
      pending: "#9ca3af",
      skipped: "#6b7280",
    };

    todayTrip.stops.forEach((stop) => {
      const color = statusColors[stop.status] ?? "#9ca3af";
      const icon = L.divIcon({
        className: "",
        html: `<div style="background:${color};color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)">${stop.sequence}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker([stop.lat, stop.lng], { icon })
        .bindPopup(`<b>#${stop.sequence} ${stop.customerName}</b><br/>${stop.address}`)
        .addTo(map);
    });

    // Draw route line
    const coords: [number, number][] = todayTrip.stops.map((s) => [s.lat, s.lng]);
    L.polyline(coords, { color: "hsl(var(--primary))", weight: 3, opacity: 0.6, dashArray: "8 4" }).addTo(map);

    // Fit bounds
    if (coords.length > 0) {
      map.fitBounds(L.latLngBounds(coords), { padding: [30, 30] });
    }

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 p-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">🗺️ Carte tournée</h1>
      </div>
      <div ref={mapRef} className="flex-1 min-h-[400px]" />
    </div>
  );
}
