/**
 * Mock Push Notification Service — simulates Web Push with in-app toasts.
 * Phase 5.4.4 / Risk R9: graceful degradation without real backend.
 */

import { toast } from "@/hooks/use-toast";

export type NotificationType =
  | "order_approved"
  | "order_rejected"
  | "credit_hold"
  | "stock_low"
  | "new_assignment"
  | "sync_complete";

interface PushNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
}

const STORAGE_KEY = "jawda-notifications";
const listeners: Set<() => void> = new Set();

function load(): PushNotification[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function save(items: PushNotification[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  listeners.forEach((fn) => fn());
}

/** Subscribe to notification changes. */
export function onNotificationsChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Get all notifications. */
export function getNotifications(): PushNotification[] {
  return load();
}

/** Get unread count. */
export function getUnreadCount(): number {
  return load().filter((n) => !n.read).length;
}

/** Mark notification as read. */
export function markRead(id: string): void {
  const items = load();
  const item = items.find((n) => n.id === id);
  if (item) {
    item.read = true;
    save(items);
  }
}

/** Mark all as read. */
export function markAllRead(): void {
  const items = load().map((n) => ({ ...n, read: true }));
  save(items);
}

/** Send a mock push notification — shows toast + persists. */
export function sendNotification(
  type: NotificationType,
  title: string,
  body: string
): PushNotification {
  const notification: PushNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    title,
    body,
    timestamp: Date.now(),
    read: false,
  };

  const items = load();
  items.unshift(notification);
  if (items.length > 100) items.length = 100;
  save(items);

  // Show in-app toast (simulating push)
  const icons: Record<NotificationType, string> = {
    order_approved: "✅",
    order_rejected: "❌",
    credit_hold: "⚠️",
    stock_low: "📦",
    new_assignment: "📋",
    sync_complete: "🔄",
  };

  toast({
    title: `${icons[type] || "🔔"} ${title}`,
    description: body,
  });

  // Also try native Notification API if granted
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    try {
      new Notification(title, { body, icon: "/favicon.ico" });
    } catch {
      // Silent fail
    }
  }

  return notification;
}

/** Request browser notification permission (mock-safe). */
export async function requestPermission(): Promise<boolean> {
  if (typeof Notification === "undefined") return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

/**
 * Simulate periodic push notifications for demo purposes.
 * Call once on app mount; returns cleanup function.
 */
export function startMockPushSimulation(): () => void {
  // Simulate a random notification every 5-10 minutes
  const interval = setInterval(() => {
    const scenarios: Array<{ type: NotificationType; title: string; body: string }> = [
      { type: "order_approved", title: "Commande approuvée", body: "CMD-2026-0342 a été approuvée par le manager" },
      { type: "stock_low", title: "Stock bas", body: "Thé Vert Menthe — stock < seuil minimum (50 unités)" },
      { type: "new_assignment", title: "Nouvelle tournée", body: "5 clients assignés pour demain — vérifier votre route" },
      { type: "sync_complete", title: "Sync terminée", body: "3 commandes synchronisées avec succès" },
    ];
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    sendNotification(scenario.type, scenario.title, scenario.body);
  }, 5 * 60_000 + Math.random() * 5 * 60_000);

  return () => clearInterval(interval);
}
