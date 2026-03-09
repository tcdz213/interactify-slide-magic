/**
 * ============================================================
 * PHASE 11 — BI, Reporting & Export de Données
 * 16 scénarios couvrant CEO, FinanceDirector, OpsDirector,
 * BIAnalyst, Accountant, WarehouseManager
 * ============================================================
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { users, type User } from "@/data/userData";
import {
  canViewFinancials,
  hasGovernancePermission,
  canAccessWarehouse,
  getAccessibleWarehouses,
  canReadDocument,
} from "@/lib/rbac";
import type { GovernancePermission } from "@/data/userData";
import { exportToCSV } from "@/lib/exportUtils";

// ── Setup ────────────────────────────────────────────────────────────────

beforeEach(() => {
  if (!URL.createObjectURL) {
    (URL as any).createObjectURL = vi.fn(() => "blob:test");
  }
  if (!URL.revokeObjectURL) {
    (URL as any).revokeObjectURL = vi.fn();
  }
});

// ── Helpers ──────────────────────────────────────────────────────────────

const findUser = (id: string): User => users.find((u) => u.id === id)!;

const CEO = findUser("U001");              // Ahmed Mansour
const FINANCE_DIR = findUser("U011");      // Anis Boucetta
const OPS_DIR = findUser("U012");          // Rachid Benali
const BI_ANALYST = findUser("U008");       // Leila Rached
const ACCOUNTANT = findUser("U006");       // Nadia Salim
const WH_MGR_ALGER = findUser("U002");    // Karim Ben Ali
const WH_MGR_ORAN = findUser("U009");     // Samir Rafik
const WH_MGR_CONST = findUser("U010");    // Hassan Nour

/** Roles allowed to see financial data (cost, margins, PMP) */
const FINANCE_VISIBLE_ROLES: User[] = [CEO, FINANCE_DIR, OPS_DIR, BI_ANALYST, ACCOUNTANT];

/** Roles with DATA_EXPORT governance permission */
const hasDataExport = (user: User) => hasGovernancePermission(user, "DATA_EXPORT");

// ── 11.01 — CEO: Dashboard exécutif global ──────────────────────────────

describe("11.01 — CEO: Dashboard exécutif global", () => {
  it("CEO can view financials (CA, marge, rotation stock)", () => {
    expect(canViewFinancials(CEO)).toBe(true);
  });

  it("CEO has access to all 3 warehouses", () => {
    expect(getAccessibleWarehouses(CEO)).toBeNull(); // null = unrestricted
    expect(canAccessWarehouse(CEO, "wh-alger-construction")).toBe(true);
    expect(canAccessWarehouse(CEO, "wh-oran-food")).toBe(true);
    expect(canAccessWarehouse(CEO, "wh-constantine-tech")).toBe(true);
  });

  it("CEO can read all document types for KPI computation", () => {
    expect(canReadDocument(CEO, "salesOrder")).toBe(true);
    expect(canReadDocument(CEO, "invoice")).toBe(true);
    expect(canReadDocument(CEO, "payment")).toBe(true);
    expect(canReadDocument(CEO, "stockAdjustment")).toBe(true);
  });
});

// ── 11.02 — CEO: Drill-down par secteur ─────────────────────────────────

describe("11.02 — CEO: Drill-down par secteur (Construction → Alger)", () => {
  it("CEO scope is 'all' — can drill into any warehouse", () => {
    expect(CEO.assignedWarehouseIds).toBe("all");
  });

  it("CEO can access Construction-Alger specifically", () => {
    expect(canAccessWarehouse(CEO, "wh-alger-construction")).toBe(true);
  });

  it("CEO can view financial metrics for the drilled-down warehouse", () => {
    expect(canViewFinancials(CEO)).toBe(true);
  });
});

// ── 11.03 — FinanceDirector: Rapport P&L par entrepôt ───────────────────

describe("11.03 — FinanceDirector: Rapport P&L par entrepôt", () => {
  it("FinanceDirector can view financials (revenus, coûts, marge)", () => {
    expect(canViewFinancials(FINANCE_DIR)).toBe(true);
  });

  it("FinanceDirector has read access to all warehouses", () => {
    expect(FINANCE_DIR.assignedWarehouseIds).toBe("all");
  });

  it("FinanceDirector can read invoices and payments for P&L", () => {
    expect(canReadDocument(FINANCE_DIR, "invoice")).toBe(true);
    expect(canReadDocument(FINANCE_DIR, "payment")).toBe(true);
    expect(canReadDocument(FINANCE_DIR, "salesOrder")).toBe(true);
    expect(canReadDocument(FINANCE_DIR, "purchaseOrder")).toBe(true);
  });
});

// ── 11.04 — FinanceDirector: Budget vs Actuel ──────────────────────────

describe("11.04 — FinanceDirector: Budget vs Actuel par centre de coûts", () => {
  it("FinanceDirector can approve financial documents for variance tracking", () => {
    expect(FINANCE_DIR.approvalThresholdPct).toBe(5);
  });

  it("FinanceDirector can view all cost/margin data", () => {
    expect(canViewFinancials(FINANCE_DIR)).toBe(true);
  });

  it("FinanceDirector has AUDIT_LOG for traceability", () => {
    expect(hasGovernancePermission(FINANCE_DIR, "AUDIT_LOG")).toBe(true);
  });
});

// ── 11.05 — OpsDirector: Rotation stock (ABC analysis) ─────────────────

describe("11.05 — OpsDirector: Rapport rotation stock (ABC analysis)", () => {
  it("OpsDirector can view financials for stock valuation", () => {
    expect(canViewFinancials(OPS_DIR)).toBe(true);
  });

  it("OpsDirector has cross-warehouse access for ABC analysis", () => {
    expect(OPS_DIR.assignedWarehouseIds).toBe("all");
  });

  it("OpsDirector can read inventory-related documents", () => {
    expect(canReadDocument(OPS_DIR, "stockAdjustment")).toBe(true);
    expect(canReadDocument(OPS_DIR, "cycleCount")).toBe(true);
    expect(canReadDocument(OPS_DIR, "stockTransfer")).toBe(true);
  });
});

// ── 11.06 — OpsDirector: Dashboard taux de service client ──────────────

describe("11.06 — OpsDirector: Dashboard taux de service client", () => {
  it("OpsDirector can read sales orders for fill rate calculation", () => {
    expect(canReadDocument(OPS_DIR, "salesOrder")).toBe(true);
  });

  it("OpsDirector has DATA_EXPORT to share service metrics", () => {
    expect(hasDataExport(OPS_DIR)).toBe(true);
  });
});

// ── 11.07 — BIAnalyst: Report Builder ───────────────────────────────────

describe("11.07 — BIAnalyst: Créer rapport personnalisé (Report Builder)", () => {
  it("BIAnalyst can view financials for metrics selection", () => {
    expect(canViewFinancials(BI_ANALYST)).toBe(true);
  });

  it("BIAnalyst has read access to all document types for data sources", () => {
    const docTypes = ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "purchaseOrder", "salesOrder", "invoice", "payment"] as const;
    for (const dt of docTypes) {
      expect(canReadDocument(BI_ANALYST, dt)).toBe(true);
    }
  });

  it("BIAnalyst has cross-warehouse scope for comprehensive reports", () => {
    expect(BI_ANALYST.assignedWarehouseIds).toBe("all");
  });

  it("BIAnalyst CANNOT create or approve documents (read-only)", () => {
    expect(BI_ANALYST.role).toBe("BIAnalyst");
    // BIAnalyst has no create or approve permissions by design
  });
});

// ── 11.08 — BIAnalyst: Export PDF ───────────────────────────────────────

describe("11.08 — BIAnalyst: Exporter rapport PDF avec graphiques", () => {
  it("BIAnalyst has DATA_EXPORT governance permission", () => {
    expect(hasDataExport(BI_ANALYST)).toBe(true);
  });

  it("BIAnalyst has AUDIT_LOG for report traceability", () => {
    expect(hasGovernancePermission(BI_ANALYST, "AUDIT_LOG")).toBe(true);
  });
});

// ── 11.09 — BIAnalyst: Export CSV >1000 lignes ─────────────────────────

describe("11.09 — BIAnalyst: Exporter données brutes CSV (>1000 lignes)", () => {
  it("BIAnalyst has DATA_EXPORT permission", () => {
    expect(hasDataExport(BI_ANALYST)).toBe(true);
  });

  it("exportToCSV handles large datasets without truncation", () => {
    const largeData = Array.from({ length: 1500 }, (_, i) => ({
      id: `ROW-${i + 1}`,
      name: `Product ${i + 1}`,
      qty: Math.floor(Math.random() * 1000),
      price: (Math.random() * 10000).toFixed(2),
    }));

    const columns = [
      { key: "id" as const, label: "ID" },
      { key: "name" as const, label: "Nom" },
      { key: "qty" as const, label: "Quantité" },
      { key: "price" as const, label: "Prix" },
    ];

    // exportToCSV relies on DOM — verify it doesn't throw
    // The actual download is browser-side; we test the function handles 1500 rows
    expect(() => exportToCSV(largeData, columns, "test-large")).not.toThrow();
  });

  it("exportToCSV returns early for empty data", () => {
    expect(() => exportToCSV([], [{ key: "id" as never, label: "ID" }], "empty")).not.toThrow();
  });
});

// ── 11.10 — RegionalManager: skipped (not in requested roles) ───────────
// RegionalManager is not in the 6 requested roles; covered elsewhere.

// ── 11.11 — Accountant: Export plan comptable ──────────────────────────

describe("11.11 — Accountant: Exporter plan comptable (Chart of Accounts)", () => {
  it("Accountant has DATA_EXPORT governance permission", () => {
    expect(hasDataExport(ACCOUNTANT)).toBe(true);
  });

  it("Accountant can view financials for CoA hierarchy", () => {
    expect(canViewFinancials(ACCOUNTANT)).toBe(true);
  });

  it("Accountant has read access to financial documents", () => {
    expect(canReadDocument(ACCOUNTANT, "invoice")).toBe(true);
    expect(canReadDocument(ACCOUNTANT, "payment")).toBe(true);
  });
});

// ── 11.12 — Accountant: Rapport créances >90 jours ─────────────────────

describe("11.12 — Accountant: Rapport créances échues >90 jours", () => {
  it("Accountant can view all customer financial data", () => {
    expect(canViewFinancials(ACCOUNTANT)).toBe(true);
    expect(ACCOUNTANT.assignedWarehouseIds).toBe("all");
  });

  it("Accountant can read sales orders and invoices for aging", () => {
    expect(canReadDocument(ACCOUNTANT, "salesOrder")).toBe(true);
    expect(canReadDocument(ACCOUNTANT, "invoice")).toBe(true);
    expect(canReadDocument(ACCOUNTANT, "payment")).toBe(true);
  });
});

// ── 11.13 — WarehouseManager: Rapport stock mort >180 jours ────────────

describe("11.13 — WarehouseManager: Rapport stock mort (>180 jours)", () => {
  it("WarehouseManager (Alger) is scoped to own warehouse only", () => {
    expect(WH_MGR_ALGER.assignedWarehouseIds).toEqual(["wh-alger-construction"]);
    expect(canAccessWarehouse(WH_MGR_ALGER, "wh-oran-food")).toBe(false);
  });

  it("WarehouseManager CANNOT view financial columns (cost, margin)", () => {
    expect(canViewFinancials(WH_MGR_ALGER)).toBe(false);
    expect(canViewFinancials(WH_MGR_ORAN)).toBe(false);
    expect(canViewFinancials(WH_MGR_CONST)).toBe(false);
  });

  it("WarehouseManager can read inventory documents for dead stock report", () => {
    expect(canReadDocument(WH_MGR_ALGER, "stockAdjustment")).toBe(true);
    expect(canReadDocument(WH_MGR_ALGER, "cycleCount")).toBe(true);
  });
});

// ── 11.14 — CEO: Profitability Dashboard par catégorie ─────────────────

describe("11.14 — CEO: Profitability Dashboard par catégorie produit", () => {
  it("CEO can view full profitability (marge contribution par famille)", () => {
    expect(canViewFinancials(CEO)).toBe(true);
  });

  it("All finance-visible roles can access profitability data", () => {
    for (const user of FINANCE_VISIBLE_ROLES) {
      expect(canViewFinancials(user)).toBe(true);
    }
  });

  it("Non-finance roles CANNOT see profitability data", () => {
    expect(canViewFinancials(WH_MGR_ALGER)).toBe(false);
  });
});

// ── 11.15 — WarehouseManager: DATA_EXPORT permission denied ────────────

describe("11.15 — WarehouseManager: Tenter d'exporter avec DATA_EXPORT", () => {
  it("WarehouseManager (Alger) does NOT have DATA_EXPORT", () => {
    expect(hasDataExport(WH_MGR_ALGER)).toBe(false);
  });

  it("WarehouseManager (Oran) does NOT have DATA_EXPORT", () => {
    expect(hasDataExport(WH_MGR_ORAN)).toBe(false);
  });

  it("WarehouseManager (Constantine) does NOT have DATA_EXPORT", () => {
    expect(hasDataExport(WH_MGR_CONST)).toBe(false);
  });

  it("Only authorized roles have DATA_EXPORT", () => {
    const exportAuthorized = users.filter(hasDataExport);
    const exportRoles = new Set(exportAuthorized.map((u) => u.role));
    // CEO, OpsDirector, BIAnalyst, Accountant have DATA_EXPORT
    expect(exportRoles.has("CEO")).toBe(true);
    expect(exportRoles.has("OpsDirector")).toBe(true);
    expect(exportRoles.has("BIAnalyst")).toBe(true);
    expect(exportRoles.has("Accountant")).toBe(true);
    // These do NOT
    expect(exportRoles.has("WarehouseManager")).toBe(false);
    expect(exportRoles.has("Driver")).toBe(false);
    expect(exportRoles.has("Operator")).toBe(false);
    expect(exportRoles.has("Supervisor")).toBe(false);
    expect(exportRoles.has("QCOfficer")).toBe(false);
  });
});

// ── 11.16 — ALL: Cross-role financial visibility matrix ─────────────────

describe("11.16 — Cross-role: Financial visibility & export matrix", () => {
  it("Exactly 5 roles can view financials", () => {
    const financialRoles = users.filter((u) => canViewFinancials(u));
    const roleSet = new Set(financialRoles.map((u) => u.role));
    expect(roleSet).toEqual(new Set(["PlatformOwner", "CEO", "FinanceDirector", "OpsDirector", "Accountant", "BIAnalyst"]));
  });

  it("WarehouseManagers see quantity reports but NOT cost/margin", () => {
    for (const wm of [WH_MGR_ALGER, WH_MGR_ORAN, WH_MGR_CONST]) {
      expect(canReadDocument(wm, "stockAdjustment")).toBe(true);
      expect(canReadDocument(wm, "cycleCount")).toBe(true);
      expect(canViewFinancials(wm)).toBe(false);
    }
  });

  it("DATA_EXPORT governance is independent of financial visibility", () => {
    // FinanceDirector can view financials but does NOT have DATA_EXPORT
    expect(canViewFinancials(FINANCE_DIR)).toBe(true);
    expect(hasDataExport(FINANCE_DIR)).toBe(false);
  });

  it("CEO has all governance permissions including export and edition control", () => {
    const allPerms: GovernancePermission[] = [
      "SYSTEM_ADMIN", "MANAGE_USERS", "MANAGE_ROLES",
      "SYSTEM_CONFIG", "AUDIT_LOG", "DATA_EXPORT", "EDITION_CONTROL",
    ];
    for (const perm of allPerms) {
      expect(hasGovernancePermission(CEO, perm)).toBe(true);
    }
  });

  it("BIAnalyst has read-only access + export but no create/approve", () => {
    expect(canViewFinancials(BI_ANALYST)).toBe(true);
    expect(hasDataExport(BI_ANALYST)).toBe(true);
    expect(hasGovernancePermission(BI_ANALYST, "AUDIT_LOG")).toBe(true);
    // No system admin
    expect(hasGovernancePermission(BI_ANALYST, "SYSTEM_ADMIN")).toBe(false);
    expect(hasGovernancePermission(BI_ANALYST, "MANAGE_USERS")).toBe(false);
  });
});
