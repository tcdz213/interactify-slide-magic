import { describe, it, expect } from "vitest";
import {
  products,
  vendors,
  warehouses,
  warehouseLocations,
  users,
  currency,
  pct,
} from "@/data/mockData";

describe("Mock Data — Products", () => {
  it("has at least 12 products", () => {
    expect(products.length).toBeGreaterThanOrEqual(12);
  });

  it("every product has required fields", () => {
    products.forEach((p) => {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.sku).toBeTruthy();
      expect(p.category).toBeTruthy();
      expect(p.uom).toBeTruthy();
      expect(typeof p.unitCost).toBe("number");
      expect(typeof p.unitPrice).toBe("number");
      expect(p.unitPrice).toBeGreaterThan(p.unitCost);
    });
  });

  it("product IDs are unique", () => {
    const ids = new Set(products.map((p) => p.id));
    expect(ids.size).toBe(products.length);
  });

  it("SKUs are unique", () => {
    const skus = new Set(products.map((p) => p.sku));
    expect(skus.size).toBe(products.length);
  });

  it("covers at least 4 categories", () => {
    const categories = new Set(products.map((p) => p.category));
    expect(categories.size).toBeGreaterThanOrEqual(4);
  });
});

describe("Mock Data — Vendors", () => {
  it("has at least 5 vendors", () => {
    expect(vendors.length).toBeGreaterThanOrEqual(5);
  });

  it("vendors have required fields", () => {
    vendors.forEach((v) => {
      expect(v.id).toBeTruthy();
      expect(v.name).toBeTruthy();
      expect(v.contact).toBeTruthy();
      expect(v.phone).toBeTruthy();
      expect(v.city).toBeTruthy();
      expect(typeof v.rating).toBe("number");
      expect(v.rating).toBeGreaterThanOrEqual(0);
      expect(v.rating).toBeLessThanOrEqual(5);
    });
  });
});

describe("Mock Data — Warehouses", () => {
  it("has at least 3 warehouses", () => {
    expect(warehouses.length).toBeGreaterThanOrEqual(3);
  });

  it("each warehouse has locations", () => {
    warehouses.forEach((wh) => {
      const locs = warehouseLocations.filter((l) => l.warehouseId === wh.id);
      expect(locs.length).toBeGreaterThan(0);
    });
  });

  it("warehouse utilization is between 0 and 100", () => {
    warehouses.forEach((wh) => {
      expect(wh.utilization).toBeGreaterThanOrEqual(0);
      expect(wh.utilization).toBeLessThanOrEqual(100);
    });
  });
});

describe("Mock Data — Users", () => {
  it("has at least 14 users", () => {
    expect(users.length).toBeGreaterThanOrEqual(14);
  });

  it("covers all 11 distinct roles", () => {
    const roles = new Set(users.map((u) => u.role));
    const expectedRoles = [
      "CEO", "FinanceDirector", "OpsDirector", "RegionalManager",
      "WarehouseManager", "QCOfficer", "Supervisor", "Operator",
      "Driver", "Accountant", "BIAnalyst",
    ];
    expectedRoles.forEach((r) => {
      expect(roles.has(r as any), `Missing role: ${r}`).toBe(true);
    });
  });

  it("user IDs are unique", () => {
    const ids = new Set(users.map((u) => u.id));
    expect(ids.size).toBe(users.length);
  });

  it("assignedWarehouseIds is valid", () => {
    users.forEach((u) => {
      if (u.assignedWarehouseIds !== "all") {
        expect(Array.isArray(u.assignedWarehouseIds)).toBe(true);
        u.assignedWarehouseIds.forEach((whId) => {
          expect(warehouses.some((wh) => wh.id === whId)).toBe(true);
        });
      }
    });
  });
});

describe("Mock Data — Helpers", () => {
  it("currency formats correctly", () => {
    const formatted = currency(1000);
    expect(formatted).toContain("DZD");
  });

  it("pct formats correctly", () => {
    expect(pct(12.345)).toBe("12.3%");
    expect(pct(0)).toBe("0.0%");
  });
});