/**
 * Pricing Store — localStorage-backed state for ClientTypes, ProductPrices, PriceHistory.
 * Now with full financial snapshot tracking (price + cost + margin).
 */
import { useState, useCallback, useEffect } from "react";
import type { ClientType } from "@/modules/client-types/clientType.schema";
import type { ProductPrice, PriceHistoryEntry } from "@/modules/pricing/pricing.types";
import { calcMargin, migratePriceHistoryEntry } from "@/modules/pricing/pricing.types";
import { products } from "@/data/masterData";

const STORAGE_KEY = "jawda-pricing-store";

interface PricingState {
  clientTypes: ClientType[];
  productPrices: ProductPrice[];
  priceHistory: PriceHistoryEntry[];
}

// ── Seed Data ──
const defaultClientTypes: ClientType[] = [
  { id: "CT-001", name: "Grossiste", description: "Clients achetant en gros volumes", isDefault: true, status: "active" },
  { id: "CT-002", name: "Détaillant", description: "Points de vente et magasins", isDefault: false, status: "active" },
  { id: "CT-003", name: "Institutionnel", description: "Marchés publics et institutions", isDefault: false, status: "active" },
  { id: "CT-004", name: "Export", description: "Clients à l'export", isDefault: false, status: "inactive" },
];

function seedPrices(): ProductPrice[] {
  const prices: ProductPrice[] = [];
  const now = new Date().toISOString();
  for (const ct of defaultClientTypes) {
    if (ct.status === "inactive") continue;
    for (const p of products.slice(0, 20)) {
      const multiplier = ct.id === "CT-001" ? 0.9 : ct.id === "CT-002" ? 1.0 : 0.85;
      prices.push({
        id: `PP-${ct.id}-${p.id}`,
        productId: p.id,
        clientTypeId: ct.id,
        unitPrice: Math.round(p.unitPrice * multiplier),
        minQty: ct.id === "CT-001" ? 100 : ct.id === "CT-003" ? 50 : undefined,
        approvalStatus: "approved",
        updatedAt: now,
        updatedBy: "system",
      });
    }
  }
  return prices;
}

function getDefault(): PricingState {
  return {
    clientTypes: defaultClientTypes,
    productPrices: seedPrices(),
    priceHistory: [],
  };
}

function load(): PricingState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefault();
    const parsed = JSON.parse(raw) as PricingState;
    // Migrate legacy history entries
    parsed.priceHistory = parsed.priceHistory.map(migratePriceHistoryEntry);
    return parsed;
  } catch {
    return getDefault();
  }
}

function save(state: PricingState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Resolve current cost for a product from master data */
function getProductCost(productId: string): number {
  return products.find((p) => p.id === productId)?.unitCost ?? 0;
}

export function usePricingStore() {
  const [state, setState] = useState<PricingState>(load);

  useEffect(() => { save(state); }, [state]);

  // ── Client Types ──
  const setClientTypes = useCallback((fn: (prev: ClientType[]) => ClientType[]) => {
    setState((s) => ({ ...s, clientTypes: fn(s.clientTypes) }));
  }, []);

  const addClientType = useCallback((ct: Omit<ClientType, "id">) => {
    const id = `CT-${String(Date.now()).slice(-6)}`;
    setClientTypes((prev) => {
      const updated = ct.isDefault ? prev.map((x) => ({ ...x, isDefault: false })) : prev;
      return [...updated, { ...ct, id }];
    });
    return id;
  }, [setClientTypes]);

  const updateClientType = useCallback((id: string, patch: Partial<ClientType>) => {
    setClientTypes((prev) => {
      let updated = prev.map((x) => (x.id === id ? { ...x, ...patch } : x));
      if (patch.isDefault) {
        updated = updated.map((x) => ({ ...x, isDefault: x.id === id }));
      }
      return updated;
    });
  }, [setClientTypes]);

  // ── Product Prices ──
  const setProductPrices = useCallback((fn: (prev: ProductPrice[]) => ProductPrice[]) => {
    setState((s) => ({ ...s, productPrices: fn(s.productPrices) }));
  }, []);

  const upsertPrice = useCallback((price: Omit<ProductPrice, "id">, userId: string) => {
    setState((s) => {
      const existing = s.productPrices.find(
        (p) => p.productId === price.productId && p.clientTypeId === price.clientTypeId
      );
      const now = new Date().toISOString();
      const cost = getProductCost(price.productId);
      let newHistory = s.priceHistory;
      let newPrices: ProductPrice[];

      if (existing) {
        if (existing.unitPrice !== price.unitPrice) {
          newHistory = [
            ...newHistory,
            {
              id: `PH-${Date.now()}`,
              productPriceId: existing.id,
              changeType: "price" as const,
              oldPrice: existing.unitPrice,
              newPrice: price.unitPrice,
              oldCost: cost,
              newCost: cost,
              oldMargin: calcMargin(existing.unitPrice, cost),
              newMargin: calcMargin(price.unitPrice, cost),
              changedAt: now,
              changedBy: userId,
              source: "pricing" as const,
            },
          ];
        }
        newPrices = s.productPrices.map((p) =>
          p.id === existing.id ? { ...p, ...price, updatedAt: now, updatedBy: userId } : p
        );
      } else {
        const id = `PP-${Date.now()}`;
        newPrices = [...s.productPrices, { ...price, id, updatedAt: now, updatedBy: userId }];
        // 7.6 — Create initial history entry when first price is set
        newHistory = [
          ...newHistory,
          {
            id: `PH-${Date.now()}-init`,
            productPriceId: id,
            changeType: "price" as const,
            oldPrice: 0,
            newPrice: price.unitPrice,
            oldCost: cost,
            newCost: cost,
            oldMargin: 0,
            newMargin: calcMargin(price.unitPrice, cost),
            changedAt: now,
            changedBy: userId,
            reason: "Prix initial défini",
            source: "pricing" as const,
          },
        ];
      }
      return { ...s, productPrices: newPrices, priceHistory: newHistory };
    });
  }, []);

  const bulkUpdatePrices = useCallback(
    (priceIds: string[], percentChange: number, userId: string) => {
      setState((s) => {
        const now = new Date().toISOString();
        const newHistory = [...s.priceHistory];
        const newPrices = s.productPrices.map((p) => {
          if (!priceIds.includes(p.id)) return p;
          const cost = getProductCost(p.productId);
          const newUnitPrice = Math.round(p.unitPrice * (1 + percentChange / 100));
          newHistory.push({
            id: `PH-${Date.now()}-${p.id}`,
            productPriceId: p.id,
            changeType: "bulk_price" as const,
            oldPrice: p.unitPrice,
            newPrice: newUnitPrice,
            oldCost: cost,
            newCost: cost,
            oldMargin: calcMargin(p.unitPrice, cost),
            newMargin: calcMargin(newUnitPrice, cost),
            changedAt: now,
            changedBy: userId,
            reason: `Bulk ${percentChange > 0 ? "+" : ""}${percentChange}%`,
            source: "pricing" as const,
          });
          return { ...p, unitPrice: newUnitPrice, updatedAt: now, updatedBy: userId, approvalStatus: "pending" as const };
        });
        return { ...s, productPrices: newPrices, priceHistory: newHistory };
      });
    },
    []
  );

  /** Record cost change from Products module — creates history entries for ALL prices of that product */
  const recordCostChange = useCallback(
    (productId: string, oldCost: number, newCost: number, userId: string) => {
      setState((s) => {
        const now = new Date().toISOString();
        const newHistory = [...s.priceHistory];
        const affectedPrices = s.productPrices.filter((p) => p.productId === productId);

        for (const pp of affectedPrices) {
          newHistory.push({
            id: `PH-${Date.now()}-${pp.id}-cost`,
            productPriceId: pp.id,
            changeType: "cost" as const,
            oldPrice: pp.unitPrice,
            newPrice: pp.unitPrice, // price unchanged
            oldCost,
            newCost,
            oldMargin: calcMargin(pp.unitPrice, oldCost),
            newMargin: calcMargin(pp.unitPrice, newCost),
            changedAt: now,
            changedBy: userId,
            reason: `Coût modifié: ${oldCost} → ${newCost}`,
            source: "products" as const,
          });
        }

        return { ...s, priceHistory: newHistory };
      });
    },
    []
  );

  const getPriceHistory = useCallback(
    (productPriceId: string) =>
      state.priceHistory.filter((h) => h.productPriceId === productPriceId).sort((a, b) => b.changedAt.localeCompare(a.changedAt)),
    [state.priceHistory]
  );

  const resetPricingData = useCallback(() => {
    const def = getDefault();
    setState(def);
  }, []);

  return {
    clientTypes: state.clientTypes,
    productPrices: state.productPrices,
    priceHistory: state.priceHistory,
    addClientType,
    updateClientType,
    setClientTypes,
    setProductPrices,
    upsertPrice,
    bulkUpdatePrices,
    recordCostChange,
    getPriceHistory,
    resetPricingData,
  };
}
