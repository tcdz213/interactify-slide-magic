/**
 * Visit Log Service — GPS check-in/out with timestamps and notes.
 */

export interface VisitLog {
  id: string;
  customerId: string;
  customerName: string;
  repId: string;
  /** GPS coords at check-in */
  checkInLat: number | null;
  checkInLng: number | null;
  checkInTime: string;
  /** GPS coords at check-out */
  checkOutLat: number | null;
  checkOutLng: number | null;
  checkOutTime: string | null;
  /** Duration in minutes */
  duration: number | null;
  notes: string;
  status: "in_progress" | "completed" | "cancelled";
  /** Orders created during visit */
  orderIds: string[];
}

const STORAGE_KEY = "jawda-visit-logs";

function loadLogs(): VisitLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLogs(logs: VisitLog[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export function getAllVisits(): VisitLog[] {
  return loadLogs().sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
}

export function getVisitsByRep(repId: string): VisitLog[] {
  return getAllVisits().filter((v) => v.repId === repId);
}

export function getActiveVisit(repId: string): VisitLog | null {
  return loadLogs().find((v) => v.repId === repId && v.status === "in_progress") ?? null;
}

/** Get current GPS position */
export function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Géolocalisation non disponible"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(`Erreur GPS: ${err.message}`)),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  });
}

export async function checkIn(
  customerId: string,
  customerName: string,
  repId: string,
  notes?: string
): Promise<VisitLog> {
  // Close any existing in-progress visit
  const active = getActiveVisit(repId);
  if (active) {
    await checkOut(active.id, "Fermeture automatique — nouvelle visite");
  }

  let lat: number | null = null;
  let lng: number | null = null;
  try {
    const pos = await getCurrentPosition();
    lat = pos.lat;
    lng = pos.lng;
  } catch {
    // GPS unavailable — continue without coords
  }

  const visit: VisitLog = {
    id: `VIS-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    customerId,
    customerName,
    repId,
    checkInLat: lat,
    checkInLng: lng,
    checkInTime: new Date().toISOString(),
    checkOutLat: null,
    checkOutLng: null,
    checkOutTime: null,
    duration: null,
    notes: notes ?? "",
    status: "in_progress",
    orderIds: [],
  };

  const logs = loadLogs();
  logs.push(visit);
  saveLogs(logs);
  return visit;
}

export async function checkOut(visitId: string, notes?: string): Promise<VisitLog | null> {
  const logs = loadLogs();
  const idx = logs.findIndex((v) => v.id === visitId);
  if (idx === -1) return null;

  let lat: number | null = null;
  let lng: number | null = null;
  try {
    const pos = await getCurrentPosition();
    lat = pos.lat;
    lng = pos.lng;
  } catch {
    // GPS unavailable
  }

  const now = new Date();
  const checkInTime = new Date(logs[idx].checkInTime);
  const durationMin = Math.round((now.getTime() - checkInTime.getTime()) / 60000);

  logs[idx] = {
    ...logs[idx],
    checkOutLat: lat,
    checkOutLng: lng,
    checkOutTime: now.toISOString(),
    duration: durationMin,
    notes: notes ? `${logs[idx].notes}\n${notes}`.trim() : logs[idx].notes,
    status: "completed",
  };

  saveLogs(logs);
  return logs[idx];
}

export function addOrderToVisit(visitId: string, orderId: string): void {
  const logs = loadLogs();
  const idx = logs.findIndex((v) => v.id === visitId);
  if (idx !== -1 && !logs[idx].orderIds.includes(orderId)) {
    logs[idx].orderIds.push(orderId);
    saveLogs(logs);
  }
}

export function updateVisitNotes(visitId: string, notes: string): void {
  const logs = loadLogs();
  const idx = logs.findIndex((v) => v.id === visitId);
  if (idx !== -1) {
    logs[idx].notes = notes;
    saveLogs(logs);
  }
}

// Mock visit data for demo
export function seedDemoVisits(repId: string): void {
  const existing = getAllVisits();
  if (existing.length > 0) return;

  const demoVisits: VisitLog[] = [
    {
      id: "VIS-DEMO-001",
      customerId: "C001",
      customerName: "Boulangerie El Baraka",
      repId,
      checkInLat: 36.7538,
      checkInLng: 3.0588,
      checkInTime: new Date(Date.now() - 3600000 * 3).toISOString(),
      checkOutLat: 36.7538,
      checkOutLng: 3.0590,
      checkOutTime: new Date(Date.now() - 3600000 * 2.5).toISOString(),
      duration: 30,
      notes: "Commande régulière passée. Stock farine à vérifier.",
      status: "completed",
      orderIds: ["SO-001"],
    },
    {
      id: "VIS-DEMO-002",
      customerId: "C002",
      customerName: "Supermarché Rahma",
      repId,
      checkInLat: 36.7650,
      checkInLng: 3.0470,
      checkInTime: new Date(Date.now() - 3600000 * 2).toISOString(),
      checkOutLat: 36.7652,
      checkOutLng: 3.0472,
      checkOutTime: new Date(Date.now() - 3600000 * 1.2).toISOString(),
      duration: 48,
      notes: "Négociation prix huile d'olive. Reviendra demain.",
      status: "completed",
      orderIds: [],
    },
    {
      id: "VIS-DEMO-003",
      customerId: "C003",
      customerName: "Restaurant Le Palmier",
      repId,
      checkInLat: 36.7720,
      checkInLng: 3.0600,
      checkInTime: new Date(Date.now() - 3600000 * 0.5).toISOString(),
      checkOutLat: null,
      checkOutLng: null,
      checkOutTime: null,
      duration: null,
      notes: "En discussion sur nouvelle commande.",
      status: "in_progress",
      orderIds: [],
    },
  ];

  saveLogs(demoVisits);
}
