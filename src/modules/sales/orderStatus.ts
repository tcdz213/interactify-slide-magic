import type { SalesOrderStatus } from "@/data/mockData";

// --- Status transition engine ---

export const NEXT_STATUS: Partial<Record<SalesOrderStatus, SalesOrderStatus>> = {
  Draft: "Approved",
  Approved: "Picking",
  Picking: "Packed",
  Packed: "Shipped",
  Shipped: "Delivered",
};

export const STATUS_LABELS_FR: Record<string, string> = {
  Draft: "Brouillon",
  Credit_Hold: "Crédit bloqué",
  Approved: "Approuvée",
  Picking: "En préparation",
  Packed: "Emballée",
  Shipped: "Expédiée",
  Partially_Delivered: "Livrée partiellement",
  Delivered: "Livrée",
  Invoiced: "Facturée",
  Cancelled: "Annulée",
};

export const NEXT_STATUS_TOOLTIP: Partial<Record<SalesOrderStatus, string>> = {
  Draft: "Approuver la commande",
  Approved: "Lancer le picking",
  Picking: "Marquer comme emballée",
  Packed: "Expédier la commande",
  Shipped: "Confirmer la livraison",
};

export const CHANNEL_LABELS: Record<string, string> = {
  Web: "Web",
  Phone: "Téléphone",
  Manual: "Saisie manuelle",
  Mobile_App: "Application mobile",
};

export type SalesChannel = "Web" | "Phone" | "Manual" | "Mobile_App";

export const TAX_RATE = 0.15;

// --- Status change history ---

export interface StatusChangeEntry {
  from: string;
  to: string;
  changedAt: string;
  changedBy: string;
}

const statusHistoryMap = new Map<string, StatusChangeEntry[]>();

export function recordStatusChange(orderId: string, from: string, to: string, changedBy: string) {
  const entries = statusHistoryMap.get(orderId) ?? [];
  entries.push({ from, to, changedAt: new Date().toISOString(), changedBy });
  statusHistoryMap.set(orderId, entries);
}

export function getStatusHistory(orderId: string): StatusChangeEntry[] {
  return statusHistoryMap.get(orderId) ?? [];
}

// --- Order ID generation ---

export function nextOrderId(existingOrders: { id: string }[]): string {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `ORD-${today}-`;
  const sameDay = existingOrders.filter((o) => o.id.startsWith(prefix));
  const nums = sameDay.map((o) => parseInt(o.id.slice(prefix.length), 10)).filter((n) => !Number.isNaN(n));
  const nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}${String(nextNum).padStart(4, "0")}`;
}
