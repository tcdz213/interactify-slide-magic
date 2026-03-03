import type { Customer, Product } from "@/data/mockData";
import type { ClientType } from "@/modules/client-types/clientType.schema";
import type { ProductPrice } from "@/modules/pricing/pricing.types";

interface PricingLookup {
  clientTypes: ClientType[];
  productPrices: ProductPrice[];
}

/**
 * Resolve the customer's clientType ID from the pricing store.
 */
export function getCustomerClientTypeId(customer: Customer, pricingStore: PricingLookup): string | null {
  const ct = pricingStore.clientTypes.find(
    (ct) => ct.status === "active" && ct.name.toLowerCase() === customer.type.toLowerCase()
  );
  if (ct) return ct.id;

  const aliases: Record<string, string[]> = {
    "Grand Compte": ["Entreprise"],
    "Détaillant": ["Artisan", "PME"],
  };
  for (const storeCt of pricingStore.clientTypes.filter((c) => c.status === "active")) {
    const aliasList = aliases[storeCt.name] ?? [];
    if (aliasList.some((a) => a.toLowerCase() === customer.type.toLowerCase())) {
      return storeCt.id;
    }
  }
  return null;
}

/**
 * Check if a negotiated (client-type) price exists for product + customer.
 */
export function isNegotiatedPrice(
  productId: string,
  customerId: string,
  customers: Customer[],
  pricingStore: PricingLookup
): boolean {
  const customer = customers.find((c) => c.id === customerId);
  if (!customer) return false;
  const clientTypeId = getCustomerClientTypeId(customer, pricingStore);
  if (!clientTypeId) return false;
  return !!pricingStore.productPrices.find(
    (pp) => pp.productId === productId && pp.clientTypeId === clientTypeId && pp.approvalStatus === "approved"
  );
}

/**
 * Get effective price for a product + customer, falling back to catalog price.
 */
export function getEffectivePrice(
  productId: string,
  customerId: string,
  customers: Customer[],
  products: Product[],
  pricingStore: PricingLookup
): number {
  const customer = customers.find((c) => c.id === customerId);
  if (customer) {
    const clientTypeId = getCustomerClientTypeId(customer, pricingStore);
    if (clientTypeId) {
      const ctPrice = pricingStore.productPrices.find(
        (pp) => pp.productId === productId && pp.clientTypeId === clientTypeId && pp.approvalStatus === "approved"
      );
      if (ctPrice) return ctPrice.unitPrice;
    }
  }
  return products.find((p) => p.id === productId)?.unitPrice ?? 0;
}
