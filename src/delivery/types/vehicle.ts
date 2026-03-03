export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  capacity: number;
  status: "available" | "in_use" | "maintenance";
}

export interface VehicleInspection {
  vehicleId: string;
  driverId: string;
  date: string;
  checklist: InspectionItem[];
  photoUrl?: string;
  notes?: string;
  passed: boolean;
}

export interface InspectionItem {
  key: string;
  label: string;
  checked: boolean;
}
