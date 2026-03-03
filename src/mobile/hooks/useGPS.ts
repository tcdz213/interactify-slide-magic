import { useState, useCallback } from "react";

export interface GPSPosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

interface UseGPSReturn {
  position: GPSPosition | null;
  loading: boolean;
  error: string | null;
  getPosition: () => Promise<GPSPosition | null>;
}

export function useGPS(): UseGPSReturn {
  const [position, setPosition] = useState<GPSPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPosition = useCallback(async (): Promise<GPSPosition | null> => {
    if (!navigator.geolocation) {
      setError("Géolocalisation non supportée");
      return null;
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const gps: GPSPosition = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          };
          setPosition(gps);
          setLoading(false);
          resolve(gps);
        },
        (err) => {
          // Fallback: return mock position for demo
          const mockGps: GPSPosition = {
            lat: 36.7538 + (Math.random() - 0.5) * 0.01,
            lng: 3.0588 + (Math.random() - 0.5) * 0.01,
            accuracy: 15,
            timestamp: Date.now(),
          };
          setPosition(mockGps);
          setError(`GPS indisponible (démo) — ${err.message}`);
          setLoading(false);
          resolve(mockGps);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    });
  }, []);

  return { position, loading, error, getPosition };
}
