/**
 * 🚚 Delivery App — Mock Data
 * Today's trip for driver Ahmed with 8 stops in Oran
 */
import type { Trip, TripStop } from "../types/trip";
import type { Vehicle, InspectionItem } from "../types/vehicle";
import type { Incident } from "../types/incident";

// ── Drivers (simplified) ──
export const MOCK_DRIVER = {
  id: "DRV-001",
  name: "Omar Fadel",
  pin: "100010",
  phone: "+213-55-123-456",
  tenantId: "T-ENT-01",
};

// ── Vehicles ──
export const vehicles: Vehicle[] = [
  { id: "VEH-001", plate: "16-04521-31", model: "Hyundai HD72", capacity: 3500, status: "available" },
  { id: "VEH-002", plate: "31-09833-16", model: "Isuzu NPR", capacity: 5000, status: "available" },
  { id: "VEH-003", plate: "31-12445-16", model: "Mitsubishi Canter", capacity: 4000, status: "maintenance" },
];

// ── Inspection checklist template ──
export const INSPECTION_CHECKLIST: InspectionItem[] = [
  { key: "tires", label: "Pneus OK", checked: false },
  { key: "fuel", label: "Carburant > 1/4", checked: false },
  { key: "documents", label: "Documents à bord", checked: false },
  { key: "load", label: "Chargement vérifié", checked: false },
  { key: "mirrors", label: "Rétroviseurs OK", checked: false },
  { key: "lights", label: "Feux fonctionnels", checked: false },
  { key: "brakes", label: "Freins testés", checked: false },
];

// ── Trip Stops ──
const todayStops: TripStop[] = [
  {
    id: "STOP-001", tripId: "TRIP-20260302-001", orderId: "ORD-20260301-010",
    customerId: "C004", customerName: "Supermarché Uno",
    address: "12 Rue Larbi Ben M'hidi, Oran", lat: 35.6971, lng: -0.6308,
    sequence: 1, plannedTime: "08:30", actualTime: "08:35",
    status: "delivered",
    deliveryResult: {
      stopId: "STOP-001",
      lines: [
        { lineId: 1, productId: "P009", productName: "Farine de blé T55 (50kg)", orderedQty: 200, deliveredQty: 200, returnedQty: 0 },
        { lineId: 2, productId: "P010", productName: "Huile de tournesol 5L", orderedQty: 600, deliveredQty: 600, returnedQty: 0 },
      ],
      signatureBase64: "data:image/png;base64,MOCK_SIG",
      photoUrls: [],
      confirmedAt: "2026-03-02T08:40:00",
      confirmedBy: "DRV-001",
      gpsLat: 35.6971, gpsLng: -0.6308,
    },
    cashCollection: {
      stopId: "STOP-001",
      invoiceAmount: 1950000,
      collectedAmount: 1950000,
      method: "cash",
      collectedAt: "2026-03-02T08:42:00",
    },
  },
  {
    id: "STOP-002", tripId: "TRIP-20260302-001", orderId: "ORD-20260301-011",
    customerId: "C005", customerName: "Épicerie El Baraka",
    address: "45 Bd Maata, Oran", lat: 35.6920, lng: -0.6350,
    sequence: 2, plannedTime: "09:15", actualTime: "09:20",
    status: "delivered",
    deliveryResult: {
      stopId: "STOP-002",
      lines: [
        { lineId: 1, productId: "P012", productName: "Sucre blanc 1kg", orderedQty: 50, deliveredQty: 50, returnedQty: 0 },
        { lineId: 2, productId: "P013", productName: "Lait UHT 1L", orderedQty: 100, deliveredQty: 100, returnedQty: 0 },
      ],
      photoUrls: [],
      confirmedAt: "2026-03-02T09:30:00",
      confirmedBy: "DRV-001",
      gpsLat: 35.6920, gpsLng: -0.6350,
    },
    cashCollection: {
      stopId: "STOP-002",
      invoiceAmount: 420000,
      collectedAmount: 420000,
      method: "cash",
      collectedAt: "2026-03-02T09:32:00",
    },
  },
  {
    id: "STOP-003", tripId: "TRIP-20260302-001", orderId: "ORD-20260301-012",
    customerId: "C006", customerName: "Café Central",
    address: "3 Place 1er Novembre, Oran", lat: 35.6995, lng: -0.6340,
    sequence: 3, plannedTime: "10:00", actualTime: "10:10",
    status: "partially_delivered",
    deliveryResult: {
      stopId: "STOP-003",
      lines: [
        { lineId: 1, productId: "P037", productName: "Café moulu Tassili 250g", orderedQty: 48, deliveredQty: 48, returnedQty: 0 },
        { lineId: 2, productId: "P012", productName: "Sucre blanc 1kg", orderedQty: 24, deliveredQty: 20, returnedQty: 4, returnReason: "damaged" },
      ],
      photoUrls: [],
      confirmedAt: "2026-03-02T10:20:00",
      confirmedBy: "DRV-001",
      gpsLat: 35.6995, gpsLng: -0.6340,
      notes: "4 sacs de sucre abîmés pendant le transport",
    },
    cashCollection: {
      stopId: "STOP-003",
      invoiceAmount: 604800,
      collectedAmount: 560000,
      method: "cash",
      shortageReason: "Retour partiel sucre, client demande avoir",
      collectedAt: "2026-03-02T10:25:00",
    },
  },
  {
    id: "STOP-004", tripId: "TRIP-20260302-001", orderId: "ORD-20260301-013",
    customerId: "C007", customerName: "Boulangerie El Amir",
    address: "88 Rue de Mostaganem, Oran", lat: 35.6880, lng: -0.6290,
    sequence: 4, plannedTime: "10:45", actualTime: "10:50",
    status: "delivered",
    deliveryResult: {
      stopId: "STOP-004",
      lines: [
        { lineId: 1, productId: "P009", productName: "Farine de blé T55 (50kg)", orderedQty: 100, deliveredQty: 100, returnedQty: 0 },
      ],
      photoUrls: [],
      confirmedAt: "2026-03-02T11:00:00",
      confirmedBy: "DRV-001",
      gpsLat: 35.6880, gpsLng: -0.6290,
    },
    cashCollection: {
      stopId: "STOP-004",
      invoiceAmount: 480000,
      collectedAmount: 480000,
      method: "check",
      collectedAt: "2026-03-02T11:02:00",
    },
  },
  {
    id: "STOP-005", tripId: "TRIP-20260302-001", orderId: "ORD-20260301-014",
    customerId: "C008", customerName: "Restaurant Le Phare",
    address: "Front de Mer, Oran", lat: 35.7020, lng: -0.6420,
    sequence: 5, plannedTime: "11:30", actualTime: "11:45",
    status: "refused",
    deliveryResult: {
      stopId: "STOP-005",
      lines: [
        { lineId: 1, productId: "P010", productName: "Huile de tournesol 5L", orderedQty: 200, deliveredQty: 0, returnedQty: 200, returnReason: "customer_refused" },
        { lineId: 2, productId: "P014", productName: "Pâtes alimentaires 500g", orderedQty: 100, deliveredQty: 0, returnedQty: 100, returnReason: "customer_refused" },
      ],
      photoUrls: [],
      confirmedAt: "2026-03-02T11:50:00",
      confirmedBy: "DRV-001",
      gpsLat: 35.7020, gpsLng: -0.6420,
      notes: "Client fermé exceptionnellement — refus total",
    },
  },
  {
    id: "STOP-006", tripId: "TRIP-20260302-001", orderId: "ORD-20260301-015",
    customerId: "C009", customerName: "Mini Market Salam",
    address: "22 Rue d'Arzew, Oran", lat: 35.6940, lng: -0.6270,
    sequence: 6, plannedTime: "12:15",
    status: "in_progress",
  },
  {
    id: "STOP-007", tripId: "TRIP-20260302-001", orderId: "ORD-20260301-016",
    customerId: "C010", customerName: "Grossiste Medina",
    address: "Zone Industrielle, Oran", lat: 35.6850, lng: -0.6150,
    sequence: 7, plannedTime: "13:00",
    status: "pending",
  },
  {
    id: "STOP-008", tripId: "TRIP-20260302-001", orderId: "ORD-20260301-017",
    customerId: "C011", customerName: "Supérette El Wiam",
    address: "Hai Es Seddikia, Oran", lat: 35.6780, lng: -0.6200,
    sequence: 8, plannedTime: "13:45",
    status: "pending",
  },
];

// ── Today's Trip ──
export const todayTrip: Trip = {
  id: "TRIP-20260302-001",
  driverId: "DRV-001",
  vehicleId: "VEH-001",
  date: "2026-03-02",
  status: "in_progress",
  stops: todayStops,
  totalExpectedAmount: 6754800,
  totalCollected: 3410000,
  startedAt: "2026-03-02T08:00:00",
  startKm: 45230,
};

// ── Orders for pending stops (mock line data) ──
export const pendingStopOrders: Record<string, { productId: string; productName: string; orderedQty: number }[]> = {
  "STOP-006": [
    { productId: "P011", productName: "Tomate concentrée 800g", orderedQty: 60 },
    { productId: "P016", productName: "Sardines en conserve 125g", orderedQty: 40 },
    { productId: "P036", productName: "Eau minérale Ifri 1.5L (pack 6)", orderedQty: 80 },
  ],
  "STOP-007": [
    { productId: "P009", productName: "Farine de blé T55 (50kg)", orderedQty: 300 },
    { productId: "P010", productName: "Huile de tournesol 5L", orderedQty: 400 },
    { productId: "P012", productName: "Sucre blanc 1kg", orderedQty: 200 },
    { productId: "P015", productName: "Riz basmati 5kg", orderedQty: 150 },
  ],
  "STOP-008": [
    { productId: "P013", productName: "Lait UHT 1L", orderedQty: 120 },
    { productId: "P014", productName: "Pâtes alimentaires 500g", orderedQty: 60 },
  ],
};

// ── Incidents ──
export const mockIncidents: Incident[] = [
  {
    id: "INC-001",
    tripId: "TRIP-20260302-001",
    driverId: "DRV-001",
    type: "road_blocked",
    description: "Route barrée cause travaux Rue de Mostaganem — déviation par Bd Zabana",
    photoUrls: [],
    gpsLat: 35.6900,
    gpsLng: -0.6300,
    reportedAt: "2026-03-02T10:40:00",
    resolved: true,
  },
];
