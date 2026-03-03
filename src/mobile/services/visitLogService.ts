/**
 * Visit logging service — tracks field rep check-in/check-out with GPS.
 * Stores visits in localStorage (mock) and queues for offline sync.
 */

import { enqueue } from "@/services/offlineSync";
import type { GPSPosition } from "@/mobile/hooks/useGPS";

export interface VisitLog {
  id: string;
  customerId: string;
  customerName: string;
  repId: string;
  checkInTime: string;
  checkInGPS: GPSPosition | null;
  checkOutTime?: string;
  checkOutGPS?: GPSPosition | null;
  notes?: string;
  duration?: number; // minutes
}

const STORAGE_KEY = "jawda-visit-logs";

function getVisits(): VisitLog[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveVisits(visits: VisitLog[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
}

export function logCheckIn(
  customerId: string,
  customerName: string,
  repId: string,
  gps: GPSPosition | null
): VisitLog {
  const visit: VisitLog = {
    id: `visit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    customerId,
    customerName,
    repId,
    checkInTime: new Date().toISOString(),
    checkInGPS: gps,
  };

  const visits = getVisits();
  visits.push(visit);
  saveVisits(visits);

  // Queue for sync
  enqueue({
    type: "check_in",
    payload: { ...visit } as unknown as Record<string, unknown>,
  });

  return visit;
}

export function logCheckOut(
  visitId: string,
  gps: GPSPosition | null,
  notes?: string
): VisitLog | null {
  const visits = getVisits();
  const idx = visits.findIndex((v) => v.id === visitId);
  if (idx === -1) return null;

  const visit = visits[idx];
  visit.checkOutTime = new Date().toISOString();
  visit.checkOutGPS = gps;
  visit.notes = notes;
  visit.duration = Math.round(
    (new Date(visit.checkOutTime).getTime() - new Date(visit.checkInTime).getTime()) / 60000
  );

  visits[idx] = visit;
  saveVisits(visits);

  // Queue for sync
  enqueue({
    type: "check_out",
    payload: { visitId, checkOutTime: visit.checkOutTime, gps, notes, duration: visit.duration } as unknown as Record<string, unknown>,
  });

  return visit;
}

export function getActiveVisit(customerId: string): VisitLog | null {
  return getVisits().find((v) => v.customerId === customerId && !v.checkOutTime) ?? null;
}

export function getTodayVisits(): VisitLog[] {
  const today = new Date().toISOString().slice(0, 10);
  return getVisits().filter((v) => v.checkInTime.startsWith(today));
}

export function getAllVisits(): VisitLog[] {
  return getVisits();
}
