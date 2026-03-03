export interface Trip {
  id: string;
  driverId: string;
  vehicleId: string;
  date: string;
  status: "planned" | "in_progress" | "completed";
  stops: TripStop[];
  totalExpectedAmount: number;
  totalCollected: number;
  startedAt?: string;
  completedAt?: string;
  startKm?: number;
  endKm?: number;
}

export interface TripStop {
  id: string;
  tripId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  address: string;
  lat: number;
  lng: number;
  sequence: number;
  plannedTime?: string;
  actualTime?: string;
  status: StopStatus;
  deliveryResult?: DeliveryResult;
  cashCollection?: CashCollection;
}

export type StopStatus =
  | "pending"
  | "in_progress"
  | "delivered"
  | "partially_delivered"
  | "refused"
  | "skipped";

export interface DeliveryResult {
  stopId: string;
  lines: DeliveryLine[];
  signatureBase64?: string;
  photoUrls: string[];
  confirmedAt: string;
  confirmedBy: string;
  gpsLat: number;
  gpsLng: number;
  notes?: string;
}

export interface DeliveryLine {
  lineId: number;
  productId: string;
  productName: string;
  orderedQty: number;
  deliveredQty: number;
  returnedQty: number;
  returnReason?: ReturnReason;
}

export type ReturnReason =
  | "damaged"
  | "expired"
  | "wrong_product"
  | "customer_refused"
  | "quality_issue"
  | "other";

export interface CashCollection {
  stopId: string;
  invoiceAmount: number;
  collectedAmount: number;
  method: "cash" | "check" | "transfer";
  shortageReason?: string;
  collectedAt: string;
}
