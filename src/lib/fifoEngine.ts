/**
 * FIFO Selling Logic Engine
 * Auto-allocates oldest lots first when creating a sales order.
 */

export interface LotAllocation {
  lotId: string;
  lotNumber: string;
  batchDate: string;
  expiryDate: string;
  qtyAllocated: number;
  qtyAvailable: number;
  warehouseId: string;
  warehouseName: string;
}

export interface AllocationResult {
  productId: string;
  productName: string;
  requestedQty: number;
  allocatedQty: number;
  shortfall: number;
  allocations: LotAllocation[];
  strategy: "FIFO" | "FEFO";
  fullyAllocated: boolean;
}

interface LotInput {
  id: string;
  lotNumber: string;
  productId: string;
  productName: string;
  batchDate: string;
  expiryDate: string;
  qtyAvailable: number;
  warehouseId: string;
  warehouseName: string;
  status: string;
}

/**
 * Allocate lots using FIFO (oldest batch date first) or FEFO (earliest expiry first).
 */
export function allocateFIFO(
  productId: string,
  productName: string,
  requestedQty: number,
  lots: LotInput[],
  strategy: "FIFO" | "FEFO" = "FIFO",
  warehouseId?: string
): AllocationResult {
  // Filter available lots for this product
  let eligible = lots.filter(
    (l) => l.productId === productId && l.status === "Active" && l.qtyAvailable > 0
  );

  if (warehouseId) {
    eligible = eligible.filter((l) => l.warehouseId === warehouseId);
  }

  // Sort: FIFO = by batchDate asc, FEFO = by expiryDate asc
  eligible.sort((a, b) => {
    const dateA = strategy === "FEFO" ? a.expiryDate : a.batchDate;
    const dateB = strategy === "FEFO" ? b.expiryDate : b.batchDate;
    return dateA.localeCompare(dateB);
  });

  const allocations: LotAllocation[] = [];
  let remaining = requestedQty;

  for (const lot of eligible) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, lot.qtyAvailable);
    allocations.push({
      lotId: lot.id,
      lotNumber: lot.lotNumber,
      batchDate: lot.batchDate,
      expiryDate: lot.expiryDate,
      qtyAllocated: take,
      qtyAvailable: lot.qtyAvailable,
      warehouseId: lot.warehouseId,
      warehouseName: lot.warehouseName,
    });
    remaining -= take;
  }

  const allocatedQty = requestedQty - remaining;

  return {
    productId,
    productName,
    requestedQty,
    allocatedQty,
    shortfall: remaining,
    allocations,
    strategy,
    fullyAllocated: remaining === 0,
  };
}

/**
 * Allocate multiple products at once.
 */
export function allocateOrder(
  items: { productId: string; productName: string; qty: number }[],
  lots: LotInput[],
  strategy: "FIFO" | "FEFO" = "FIFO",
  warehouseId?: string
): AllocationResult[] {
  return items.map((item) =>
    allocateFIFO(item.productId, item.productName, item.qty, lots, strategy, warehouseId)
  );
}
