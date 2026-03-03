/**
 * Phase 4 — Per-product anomaly detection thresholds.
 * Overrides default detection parameters for specific products.
 */

export interface ProductAnomalyThreshold {
  productId: string;
  volumeSpikeMultiplier?: number;    // override default 3.0
  maxSingleOrderBase?: number;       // absolute max per order (in base units)
  allowedUnits?: string[];           // restrict to specific unit IDs
  blockOnSpike?: boolean;            // false = warn, true = block
}

/**
 * Per-product anomaly thresholds.
 * Products not listed here use the global defaults.
 */
export const productAnomalyThresholds: ProductAnomalyThreshold[] = [
  // Cement — high volume normal for construction, but >500T per order is unusual for retail
  { productId: "P001", maxSingleOrderBase: 500000, volumeSpikeMultiplier: 5 },
  // Fer à béton — max 50T per single order
  { productId: "P002", maxSingleOrderBase: 4692, volumeSpikeMultiplier: 4 },
  // Laptops — never sell more than 50 at once
  { productId: "P017", maxSingleOrderBase: 50, blockOnSpike: true },
  // Servers — never more than 20
  { productId: "P020", maxSingleOrderBase: 20, blockOnSpike: true },
  // Oil — seasonal spikes normal
  { productId: "P010", volumeSpikeMultiplier: 8 },
  // Farine — bakeries have regular large orders
  { productId: "P009", volumeSpikeMultiplier: 6, maxSingleOrderBase: 50000 },
  // Sugar — similar to farine
  { productId: "P012", volumeSpikeMultiplier: 6, maxSingleOrderBase: 25000 },
  // Sardines — low volume product
  { productId: "P016", maxSingleOrderBase: 2400, blockOnSpike: false },
];

/**
 * Get anomaly threshold for a specific product.
 * Returns undefined if no custom threshold configured.
 */
export function getProductAnomalyThreshold(productId: string): ProductAnomalyThreshold | undefined {
  return productAnomalyThresholds.find(t => t.productId === productId);
}
