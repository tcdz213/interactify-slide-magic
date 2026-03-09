/**
 * FinancialTrackingContext — Shared context bridging Products ↔ Pricing modules.
 * When unitCost changes in /wms/products, this propagates history entries to pricing store.
 */
import { createContext, useContext, useCallback, type ReactNode } from "react";
import { usePricingStore } from "@/store/pricing.store";
import { products as masterProducts } from "@/data/masterData";
import { calcMargin } from "@/modules/pricing/pricing.types";

interface FinancialTrackingContextType {
  /** Call when a product's unitCost changes from the Products module */
  onProductCostChanged: (productId: string, oldCost: number, newCost: number, userId: string) => void;
  /** Pricing store pass-through */
  pricingStore: ReturnType<typeof usePricingStore>;
}

const FinancialTrackingContext = createContext<FinancialTrackingContextType | null>(null);

export function FinancialTrackingProvider({ children }: { children: ReactNode }) {
  const pricingStore = usePricingStore();

  const onProductCostChanged = useCallback(
    (productId: string, oldCost: number, newCost: number, userId: string) => {
      if (oldCost === newCost) return;
      pricingStore.recordCostChange(productId, oldCost, newCost, userId);
    },
    [pricingStore.recordCostChange]
  );

  return (
    <FinancialTrackingContext.Provider value={{ onProductCostChanged, pricingStore }}>
      {children}
    </FinancialTrackingContext.Provider>
  );
}

export function useFinancialTracking() {
  const ctx = useContext(FinancialTrackingContext);
  if (!ctx) throw new Error("useFinancialTracking must be used within FinancialTrackingProvider");
  return ctx;
}
