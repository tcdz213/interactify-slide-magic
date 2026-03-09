// Mapping logic for tenants

export const WAREHOUSE_TO_TENANT: Record<string, string> = {
  "wh-oran-food": "T-ENT-01",
  "wh-alger-construction": "T-ENT-02",
  "wh-constantine-tech": "T-ENT-03",
  "wh-se-ghardaia": "T-ENT-04",
  "wh-sahel-supplier": "T-FRN-01",
};

export function getTenantByWarehouse(warehouseId?: string): string {
  if (!warehouseId) return "T-ENT-01";
  return WAREHOUSE_TO_TENANT[warehouseId] || "T-ENT-01";
}

export function getTenantByProductSku(sku?: string): string {
  if (!sku) return "T-ENT-01";
  if (sku.startsWith("FOOD-")) return "T-ENT-01";
  if (sku.startsWith("CONST-")) return "T-ENT-02";
  if (sku.startsWith("TECH-")) return "T-ENT-03";
  return "T-ENT-01";
}

export function getTenantByCustomerOrVendor(name?: string): string {
  if (!name) return "T-ENT-01";
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes("cevital") || lowerName.includes("sim") || lowerName.includes("ifri") || lowerName.includes("agro") || lowerName.includes("cafe") || lowerName.includes("market") || lowerName.includes("boulangerie")) {
    return "T-ENT-01";
  }
  if (lowerName.includes("gica") || lowerName.includes("arcelormittal") || lowerName.includes("seror") || lowerName.includes("btp") || lowerName.includes("promoteur") || lowerName.includes("bâtiment")) {
    return "T-ENT-02";
  }
  if (lowerName.includes("condor") || lowerName.includes("iris") || lowerName.includes("tech") || lowerName.includes("info") || lowerName.includes("cyber") || lowerName.includes("université")) {
    return "T-ENT-03";
  }
  return "T-ENT-01";
}

export function assignTenant(item: any, strategy: "warehouse" | "productSku" | "customerVendor" | "default"): void {
  if (item.tenantId) return; // Already assigned

  let tenantId = "T-ENT-01";
  
  switch (strategy) {
    case "warehouse":
      tenantId = getTenantByWarehouse(item.warehouseId || item.deliveryWarehouseId);
      break;
    case "productSku":
      if (item.sku) {
          tenantId = getTenantByProductSku(item.sku);
      } else if (item.productId) {
          if (["P001","P002","P003","P004","P005","P006","P007","P008","P025","P026","P027","P028","P029","P030","P031","P032","P051","P052","P053"].includes(item.productId)) tenantId = "T-ENT-02";
          else if (["P017","P018","P019","P020","P021","P022","P023","P024","P041","P042","P043","P044","P045","P046","P047","P048","P049","P050"].includes(item.productId)) tenantId = "T-ENT-03";
          else tenantId = "T-ENT-01";
      }
      break;
    case "customerVendor":
      tenantId = getTenantByCustomerOrVendor(item.vendorName || item.customerName || item.name);
      break;
    default:
      tenantId = "T-ENT-01";
  }
  
  item.tenantId = tenantId;
}
