export type PriceApprovalStatus = "draft" | "pending" | "approved";

export type PriceChangeType = "price" | "cost" | "both" | "bulk_price" | "initial";

export interface ProductPrice {
  id: string;
  productId: string;
  clientTypeId: string;
  unitPrice: number;
  minQty?: number;
  approvalStatus: PriceApprovalStatus;
  updatedAt: string;
  updatedBy: string;
}

export interface PriceHistoryEntry {
  id: string;
  productPriceId: string;
  changeType: PriceChangeType;

  // Price snapshot
  oldPrice: number;
  newPrice: number;

  // Cost snapshot
  oldCost: number;
  newCost: number;

  // Margin snapshot (immutable at write-time)
  oldMargin: number;
  newMargin: number;

  changedAt: string;
  changedBy: string;
  reason?: string;

  // Source tracking
  source?: "pricing" | "products" | "import" | "api";
}

export function calcMargin(unitPrice: number, cost: number): number {
  if (unitPrice === 0) return 0;
  return ((unitPrice - cost) / unitPrice) * 100;
}

/** Migrate legacy history entries (pre-cost-tracking) */
export function migratePriceHistoryEntry(h: any): PriceHistoryEntry {
  return {
    ...h,
    changeType: h.changeType ?? "price",
    oldCost: h.oldCost ?? 0,
    newCost: h.newCost ?? 0,
    oldMargin: h.oldMargin ?? 0,
    newMargin: h.newMargin ?? 0,
    source: h.source ?? "pricing",
  };
}
