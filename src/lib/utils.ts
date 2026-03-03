import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format as fnsFormat, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string or Date to dd/MM/yyyy (or dd/MM/yyyy HH:mm for datetime).
 * Accepts ISO strings, "YYYY-MM-DD", "YYYY-MM-DD HH:mm", or Date objects.
 */
export function formatDate(date: string | Date | null | undefined, withTime = false): string {
  if (!date) return "—";
  try {
    const d = typeof date === "string"
      ? date.includes("T") ? parseISO(date) : new Date(date.replace(/-/g, "/"))
      : date;
    if (isNaN(d.getTime())) return String(date);
    return fnsFormat(d, withTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy", { locale: fr });
  } catch {
    return String(date);
  }
}
