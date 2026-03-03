/**
 * GPS Tracker service — mock implementation
 */
export interface GPSPoint {
  lat: number;
  lng: number;
  speed: number;
  timestamp: string;
}

let watchId: number | null = null;
const gpsLog: GPSPoint[] = [];

export function startGPSTracking(onPoint?: (p: GPSPoint) => void) {
  if (watchId !== null) return;
  if (!navigator.geolocation) {
    console.warn("GPS not available");
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const point: GPSPoint = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        speed: pos.coords.speed ?? 0,
        timestamp: new Date().toISOString(),
      };
      gpsLog.push(point);
      onPoint?.(point);
    },
    (err) => console.warn("GPS error:", err.message),
    { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
  );
}

export function stopGPSTracking() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}

export function getGPSLog() {
  return [...gpsLog];
}

export function isTracking() {
  return watchId !== null;
}
