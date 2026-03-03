export interface Incident {
  id: string;
  tripId: string;
  driverId: string;
  type: "breakdown" | "accident" | "road_blocked" | "other";
  description: string;
  photoUrls: string[];
  gpsLat: number;
  gpsLng: number;
  reportedAt: string;
  resolved: boolean;
}
