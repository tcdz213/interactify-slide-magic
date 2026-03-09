/**
 * PMP Engine — Prix Moyen Pondéré (Weighted Average Cost)
 * Recalculates product cost on each GRN receipt.
 */

export interface PMPInput {
  currentQty: number;
  currentCost: number;
  receivedQty: number;
  receivedUnitCost: number;
}

export interface PMPResult {
  newCost: number;
  newTotalQty: number;
  oldCost: number;
}

/**
 * Calculate new weighted average cost after receiving goods.
 * Formula: newCost = (currentQty * currentCost + receivedQty * receivedUnitCost) / (currentQty + receivedQty)
 */
export function calculatePMP(input: PMPInput): PMPResult {
  const { currentQty, currentCost, receivedQty, receivedUnitCost } = input;
  const totalQty = currentQty + receivedQty;
  if (totalQty <= 0) {
    return { newCost: receivedUnitCost, newTotalQty: 0, oldCost: currentCost };
  }
  const totalValue = currentQty * currentCost + receivedQty * receivedUnitCost;
  const newCost = Math.round(totalValue / totalQty);
  return { newCost, newTotalQty: totalQty, oldCost: currentCost };
}

/**
 * FIFO valuation: given a list of receipt layers, compute total stock value.
 */
export interface FIFOLayer {
  qty: number;
  unitCost: number;
  date: string;
}

export function valuateFIFO(layers: FIFOLayer[]): number {
  return layers.reduce((sum, l) => sum + l.qty * l.unitCost, 0);
}

/**
 * Last Cost valuation: simply qty * last received unit cost.
 */
export function valuateLastCost(totalQty: number, lastUnitCost: number): number {
  return totalQty * lastUnitCost;
}

/**
 * PMP/WAC valuation: qty * weighted average cost.
 */
export function valuatePMP(totalQty: number, avgCost: number): number {
  return totalQty * avgCost;
}
