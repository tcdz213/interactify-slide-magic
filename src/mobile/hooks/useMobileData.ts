/**
 * React Query hooks for mobile data — mock-backed with caching & stale control.
 * Replaces direct mock imports for proper cache management.
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  mockCustomers,
  mockOrders,
  mockRoutePlan,
  mobileCatalog,
  REP_PROFILE,
  type MobileCustomer,
  type MobileOrder,
  type RoutePlan,
} from "@/mobile/data/mockSalesData";
import { getQueue, getConflicts, type QueuedAction, type SyncConflict } from "@/services/offlineSync";
import { getTodayVisits, type VisitLog } from "@/mobile/services/visitLogService";

// ── Simulate async fetch (like a real API) ──────────────────────
const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

// ── Customer hooks ──────────────────────────────────────────────
export function useMobileCustomers() {
  return useQuery<MobileCustomer[]>({
    queryKey: ["mobile", "customers"],
    queryFn: async () => {
      await delay();
      return [...mockCustomers];
    },
    staleTime: 30_000, // 30s
    gcTime: 5 * 60_000, // 5 min
  });
}

// ── Orders hooks ────────────────────────────────────────────────
export function useMobileOrders() {
  return useQuery<MobileOrder[]>({
    queryKey: ["mobile", "orders"],
    queryFn: async () => {
      await delay();
      return [...mockOrders];
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

// ── Route plan ──────────────────────────────────────────────────
export function useMobileRoute() {
  return useQuery<RoutePlan[]>({
    queryKey: ["mobile", "route"],
    queryFn: async () => {
      await delay();
      return [...mockRoutePlan];
    },
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });
}

// ── Product catalog ─────────────────────────────────────────────
export function useMobileCatalog() {
  return useQuery({
    queryKey: ["mobile", "catalog"],
    queryFn: async () => {
      await delay();
      return [...mobileCatalog];
    },
    staleTime: 5 * 60_000, // Products change less often
    gcTime: 30 * 60_000,
  });
}

// ── Offline queue ───────────────────────────────────────────────
export function useOfflineQueue() {
  return useQuery<QueuedAction[]>({
    queryKey: ["mobile", "offlineQueue"],
    queryFn: () => getQueue(),
    staleTime: 5_000,
    refetchInterval: 10_000, // Auto-refresh every 10s
  });
}

// ── Conflicts ───────────────────────────────────────────────────
export function useConflicts() {
  return useQuery<SyncConflict[]>({
    queryKey: ["mobile", "conflicts"],
    queryFn: async () => {
      const all = await getConflicts();
      return all.filter((c) => !c.resolvedWith);
    },
    staleTime: 5_000,
  });
}

// ── Visit logs ──────────────────────────────────────────────────
export function useTodayVisits() {
  return useQuery<VisitLog[]>({
    queryKey: ["mobile", "todayVisits"],
    queryFn: async () => getTodayVisits(),
    staleTime: 10_000,
  });
}

// ── Rep profile (static for demo) ──────────────────────────────
export function useRepProfile() {
  return useQuery({
    queryKey: ["mobile", "repProfile"],
    queryFn: async () => REP_PROFILE,
    staleTime: Infinity,
  });
}

// ── Delta sync mock — returns "changes since" ───────────────────
export interface DeltaSyncResult {
  customers: MobileCustomer[];
  orders: MobileOrder[];
  routes: RoutePlan[];
  timestamp: number;
}

let lastSyncTs = 0;

export async function fetchDeltaSync(since: number): Promise<DeltaSyncResult> {
  await delay(300);
  // In a real app, server returns only records modified since `since`.
  // In mock mode, we return all data as if everything changed.
  const now = Date.now();
  lastSyncTs = now;
  return {
    customers: [...mockCustomers],
    orders: [...mockOrders],
    routes: [...mockRoutePlan],
    timestamp: now,
  };
}

export function getLastSyncTimestamp() {
  return lastSyncTs;
}

/**
 * Hook to perform delta sync and invalidate all mobile queries.
 */
export function useDeltaSync() {
  const queryClient = useQueryClient();

  const performDeltaSync = async () => {
    const since = getLastSyncTimestamp();
    const result = await fetchDeltaSync(since);

    // Update query caches with fresh data
    queryClient.setQueryData(["mobile", "customers"], result.customers);
    queryClient.setQueryData(["mobile", "orders"], result.orders);
    queryClient.setQueryData(["mobile", "route"], result.routes);

    // Also invalidate queue/conflicts
    queryClient.invalidateQueries({ queryKey: ["mobile", "offlineQueue"] });
    queryClient.invalidateQueries({ queryKey: ["mobile", "conflicts"] });
    queryClient.invalidateQueries({ queryKey: ["mobile", "todayVisits"] });

    return result;
  };

  return { performDeltaSync };
}
