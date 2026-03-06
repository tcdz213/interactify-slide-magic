/**
 * ============================================================
 * PHASE 12 — Sécurité, Audit & Gouvernance
 * 18 scénarios : RBAC, audit trails, approbation multi-niveaux,
 * séparation des tâches, isolation warehouse, gouvernance système.
 * ============================================================
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { users, type User, type GovernancePermission } from "@/data/userData";
import {
  canViewFinancials,
  hasGovernancePermission,
  isSystemAdmin,
  canAccessWarehouse,
  canApproveDocument,
  canCreateDocument,
  canSelfApprove,
  canReadDocument,
  getApprovalTier,
  getApprovalRequirement,
  type DocumentType,
} from "@/lib/rbac";
import { logAudit, getAuditLog, clearAuditLog, type AuditEntry } from "@/services/auditService";

// ── Helpers ──────────────────────────────────────────────────────────────

const findUser = (id: string): User => users.find((u) => u.id === id)!;

const CEO = findUser("U001");
const FINANCE_DIR = findUser("U011");
const OPS_DIR = findUser("U012");
const REGIONAL_MGR = findUser("U013");
const WH_MGR_ALGER = findUser("U002");
const WH_MGR_ORAN = findUser("U009");
const WH_MGR_CONST = findUser("U010");
const QC_OFFICER = findUser("U003");
const SUPERVISOR = findUser("U014");
const OPERATOR = findUser("U007");
const DRIVER_ORAN = findUser("U004");
const DRIVER_ALGER = findUser("U005");
const ACCOUNTANT = findUser("U006");
const BI_ANALYST = findUser("U008");

/** Sidebar section visibility rules (mirrored from AppSidebar) */
const ROLE_VISIBLE_SECTIONS: Record<string, Set<string>> = {
  FinanceDirector: new Set(["dashboard", "masterData", "accounting", "bi", "admin"]),
  Operator: new Set(["dashboard", "wms"]),
  Supervisor: new Set(["dashboard", "masterData", "wms", "distribution"]),
  Driver: new Set(["dashboard", "distribution"]),
  QCOfficer: new Set(["dashboard", "masterData", "wms"]),
  Accountant: new Set(["dashboard", "masterData", "accounting", "bi"]),
  BIAnalyst: new Set(["dashboard", "masterData", "bi"]),
};

/** Admin roles allowed to access /settings/* */
const ADMIN_ROLES = ["CEO", "SystemAdmin", "OpsDirector", "FinanceDirector", "RegionalManager"];

function canAccessSettings(user: User): boolean {
  return ADMIN_ROLES.includes(user.role);
}

function canSeeSettingsInSidebar(user: User): boolean {
  const sections = ROLE_VISIBLE_SECTIONS[user.role];
  if (!sections) return true; // unrestricted roles (CEO, OpsDirector, RegionalManager) see all
  return sections.has("admin");
}

// ── localStorage mock ────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
});

// ═══════════════════════════════════════════════════════════════════════
// 12.01 — CEO: Créer nouvel utilisateur
// ═══════════════════════════════════════════════════════════════════════

describe("12.01 — CEO (SYSTEM_ADMIN): Créer nouvel utilisateur", () => {
  it("CEO has SYSTEM_ADMIN governance permission", () => {
    expect(isSystemAdmin(CEO)).toBe(true);
  });

  it("CEO has MANAGE_USERS governance permission", () => {
    expect(hasGovernancePermission(CEO, "MANAGE_USERS")).toBe(true);
  });

  it("CEO has MANAGE_ROLES governance permission", () => {
    expect(hasGovernancePermission(CEO, "MANAGE_ROLES")).toBe(true);
  });

  it("User creation is logged in audit trail", () => {
    const entry = logAudit({
      action: "USER_CREATE",
      module: "Users",
      entityId: "U099",
      performedBy: CEO.name,
      details: "Utilisateur 'Test User' créé avec rôle Operator",
      diff: [{ field: "role", oldValue: "—", newValue: "Operator" }],
    });
    expect(entry.id).toMatch(/^AUD-/);
    expect(entry.action).toBe("USER_CREATE");
    expect(getAuditLog()).toHaveLength(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 12.02 — CEO: Modifier rôle utilisateur
// ═══════════════════════════════════════════════════════════════════════

describe("12.02 — CEO: Modifier rôle (Operator → Supervisor)", () => {
  it("Role change is tracked with field-level diff", () => {
    const entry = logAudit({
      action: "USER_ROLE_CHANGE",
      module: "Users",
      entityId: OPERATOR.id,
      performedBy: CEO.name,
      details: `Rôle de ${OPERATOR.name} modifié : Operator → Supervisor`,
      diff: [
        { field: "role", oldValue: "Operator", newValue: "Supervisor" },
        { field: "permissions", oldValue: "grn,stockAdjustment", newValue: "grn,stockAdjustment,stockTransfer,cycleCount,salesOrder" },
      ],
    });
    expect(entry.diff).toHaveLength(2);
    expect(entry.diff![0].oldValue).toBe("Operator");
    expect(entry.diff![0].newValue).toBe("Supervisor");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 12.03 — CEO: Désactiver utilisateur
// ═══════════════════════════════════════════════════════════════════════

describe("12.03 — CEO: Désactiver utilisateur", () => {
  it("User deactivation is logged with status change diff", () => {
    const entry = logAudit({
      action: "USER_DEACTIVATE",
      module: "Users",
      entityId: OPERATOR.id,
      performedBy: CEO.name,
      details: `Utilisateur ${OPERATOR.name} désactivé`,
      diff: [{ field: "active", oldValue: "true", newValue: "false" }],
    });
    expect(entry.action).toBe("USER_DEACTIVATE");
    expect(entry.diff![0].newValue).toBe("false");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 12.04 — CEO: Consulter Audit Log complet
// ═══════════════════════════════════════════════════════════════════════

describe("12.04 — CEO: Consulter Audit Log complet", () => {
  it("CEO has AUDIT_LOG governance permission", () => {
    expect(hasGovernancePermission(CEO, "AUDIT_LOG")).toBe(true);
  });

  it("Audit log entries are ordered newest-first", () => {
    logAudit({ action: "ACTION_1", module: "Test", entityId: "E1", performedBy: CEO.name, details: "First" });
    logAudit({ action: "ACTION_2", module: "Test", entityId: "E2", performedBy: CEO.name, details: "Second" });
    const log = getAuditLog();
    expect(log[0].action).toBe("ACTION_2");
    expect(log[1].action).toBe("ACTION_1");
  });

  it("Each audit entry has timestamp and performedBy", () => {
    logAudit({ action: "TEST", module: "Test", entityId: "E1", performedBy: CEO.name, details: "Test" });
    const log = getAuditLog();
    expect(log[0].timestamp).toBeTruthy();
    expect(log[0].performedBy).toBe(CEO.name);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 12.05 — CEO: Filtrer Audit Log
// ═══════════════════════════════════════════════════════════════════════

describe("12.05 — CEO: Filtrer Audit Log par utilisateur et date", () => {
  it("Audit log can be filtered by performedBy", () => {
    logAudit({ action: "A1", module: "M1", entityId: "E1", performedBy: CEO.name, details: "CEO action" });
    logAudit({ action: "A2", module: "M2", entityId: "E2", performedBy: ACCOUNTANT.name, details: "Accountant action" });
    logAudit({ action: "A3", module: "M3", entityId: "E3", performedBy: CEO.name, details: "CEO action 2" });
    const ceoLogs = getAuditLog().filter((e) => e.performedBy === CEO.name);
    expect(ceoLogs).toHaveLength(2);
  });

  it("Audit log can be filtered by module", () => {
    logAudit({ action: "A1", module: "Finance", entityId: "E1", performedBy: CEO.name, details: "" });
    logAudit({ action: "A2", module: "GRN", entityId: "E2", performedBy: CEO.name, details: "" });
    const financeLogs = getAuditLog().filter((e) => e.module === "Finance");
    expect(financeLogs).toHaveLength(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 12.06 — FinanceDirector: Accès User Management refusé
// ═══════════════════════════════════════════════════════════════════════

describe("12.06 — FinanceDirector: Tenter d'accéder User Management", () => {
  it("FinanceDirector does NOT have MANAGE_USERS", () => {
    expect(hasGovernancePermission(FINANCE_DIR, "MANAGE_USERS")).toBe(false);
  });

  it("FinanceDirector does NOT have SYSTEM_ADMIN", () => {
    expect(isSystemAdmin(FINANCE_DIR)).toBe(false);
  });

  it("FinanceDirector CAN access /settings (is admin role) but not user management", () => {
    // FinanceDirector is in ADMIN_ROLES for settings access
    expect(canAccessSettings(FINANCE_DIR)).toBe(true);
    // But cannot manage users
    expect(hasGovernancePermission(FINANCE_DIR, "MANAGE_USERS")).toBe(false);
    expect(hasGovernancePermission(FINANCE_DIR, "MANAGE_ROLES")).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 12.07 — OpsDirector: Consulter Audit Log
// ═══════════════════════════════════════════════════════════════════════

describe("12.07 — OpsDirector: Consulter Audit Log (AUDIT_LOG)", () => {
  it("OpsDirector has AUDIT_LOG governance permission", () => {
    expect(hasGovernancePermission(OPS_DIR, "AUDIT_LOG")).toBe(true);
  });

  it("OpsDirector can access settings pages", () => {
    expect(canAccessSettings(OPS_DIR)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 12.08 — Operator: Settings non visible
// ═══════════════════════════════════════════════════════════════════════

describe("12.08 — Operator: Tenter d'accéder Settings", () => {
  it("Operator cannot see Settings in sidebar", () => {
    expect(canSeeSettingsInSidebar(OPERATOR)).toBe(false);
  });

  it("Operator is NOT in ADMIN_ROLES", () => {
    expect(canAccessSettings(OPERATOR)).toBe(false);
  });

  it("Operator has no governance permissions", () => {
    expect(OPERATOR.governancePermissions).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 12.09 — ALL: URL directe /settings/users → redirect
// ═══════════════════════════════════════════════════════════════════════

describe("12.09 — ALL: Test URL directe vers /settings/users", () => {
  const nonAdminUsers = [OPERATOR, DRIVER_ORAN, DRIVER_ALGER, SUPERVISOR, QC_OFFICER];
  const adminUsers = [CEO, OPS_DIR, FINANCE_DIR, REGIONAL_MGR];

  it("Non-admin roles are redirected from /settings/users", () => {
    for (const user of nonAdminUsers) {
      expect(canAccessSettings(user)).toBe(false);
    }
  });

  it("Admin roles CAN access /settings/users", () => {
    for (const user of adminUsers) {
      expect(canAccessSettings(user)).toBe(true);
    }
  });

  it("Accountant and BIAnalyst are NOT admin roles", () => {
    expect(canAccessSettings(ACCOUNTANT)).toBe(false);
    expect(canAccessSettings(BI_ANALYST)).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 12.10 — CEO: Seuils d'approbation par rôle
// ═══════════════════════════════════════════════════════════════════════

describe("12.10 — CEO: Configurer seuils d'approbation par rôle", () => {
  it("Approval tiers are correctly defined", () => {
    expect(getApprovalTier(0.3)).toBe("auto");
    expect(getApprovalTier(1.5)).toBe("manager");
    expect(getApprovalTier(4.0)).toBe("finance");
    expect(getApprovalTier(8.0)).toBe("ceo");
  });

  it("Each role has correct approval threshold", () => {
    expect(CEO.approvalThresholdPct).toBe(100);
    expect(FINANCE_DIR.approvalThresholdPct).toBe(5);
    expect(OPS_DIR.approvalThresholdPct).toBe(5);
    expect(WH_MGR_ALGER.approvalThresholdPct).toBe(2);
    expect(REGIONAL_MGR.approvalThresholdPct).toBe(2);
    expect(OPERATOR.approvalThresholdPct).toBeNull();
    expect(DRIVER_ORAN.approvalThresholdPct).toBeNull();
  });

  it("Approval requirement labels are descriptive", () => {
    const req = getApprovalRequirement(3.5);
    expect(req.tier).toBe("finance");
    expect(req.label).toBe("Finance + Responsable");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 12.11 — WarehouseManager: Self-approval refusée
// ═══════════════════════════════════════════════════════════════════════

describe("12.11 — WarehouseManager: Tenter self-approval", () => {
  it("canSelfApprove ALWAYS returns false (governance rule)", () => {
    expect(canSelfApprove(WH_MGR_ALGER, WH_MGR_ALGER.id)).toBe(false);
    expect(canSelfApprove(WH_MGR_ORAN, WH_MGR_ORAN.id)).toBe(false);
    expect(canSelfApprove(WH_MGR_CONST, WH_MGR_CONST.id)).toBe(false);
  });

  it("WarehouseManager canSelfApprove flag is false", () => {
    expect(WH_MGR_ALGER.canSelfApprove).toBe(false);
    expect(WH_MGR_ORAN.canSelfApprove).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 12.12 — CEO: Self-approve PO
// ═══════════════════════════════════════════════════════════════════════

describe("12.12 — CEO: Self-approve PO (canSelfApprove=true)", () => {
  it("CEO canSelfApprove flag is true in user data", () => {
    expect(CEO.canSelfApprove).toBe(true);
  });

  it("But canSelfApprove() function ALWAYS returns false (separation of duties)", () => {
    // The governance function enforces separation of duties regardless of flag
    expect(canSelfApprove(CEO, CEO.id)).toBe(false);
  });

  it("CEO can approve POs created by others", () => {
    const decision = canApproveDocument(CEO, "purchaseOrder", 3.0);
    expect(decision.allowed).toBe(true);
  });

  it("CEO can approve at any variance level", () => {
    expect(canApproveDocument(CEO, "purchaseOrder", 15.0).allowed).toBe(true);
    expect(canApproveDocument(CEO, "stockAdjustment", 50.0).allowed).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 12.13 — BIAnalyst: DATA_EXPORT autorisé
// ═══════════════════════════════════════════════════════════════════════

describe("12.13 — BIAnalyst: Utiliser DATA_EXPORT", () => {
  it("BIAnalyst has DATA_EXPORT governance permission", () => {
    expect(hasGovernancePermission(BI_ANALYST, "DATA_EXPORT")).toBe(true);
  });

  it("BIAnalyst also has AUDIT_LOG for traceability", () => {
    expect(hasGovernancePermission(BI_ANALYST, "AUDIT_LOG")).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 12.14 — QCOfficer: DATA_EXPORT refusé
// ═══════════════════════════════════════════════════════════════════════

describe("12.14 — QCOfficer: Tenter DATA_EXPORT", () => {
  it("QCOfficer does NOT have DATA_EXPORT", () => {
    expect(hasGovernancePermission(QC_OFFICER, "DATA_EXPORT")).toBe(false);
  });

  it("QCOfficer has no governance permissions at all", () => {
    expect(QC_OFFICER.governancePermissions).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 12.15 — CEO: EDITION_CONTROL
// ═══════════════════════════════════════════════════════════════════════

describe("12.15 — CEO: Vérifier EDITION_CONTROL sur Dashboard", () => {
  it("CEO has EDITION_CONTROL governance permission", () => {
    expect(hasGovernancePermission(CEO, "EDITION_CONTROL")).toBe(true);
  });

  it("No other user has EDITION_CONTROL", () => {
    const othersWithEdition = users.filter(
      (u) => u.id !== CEO.id && u.governancePermissions.includes("EDITION_CONTROL")
    );
    expect(othersWithEdition).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 12.16 — ALL: Isolation données warehouse
// ═══════════════════════════════════════════════════════════════════════

describe("12.16 — ALL: Tester isolation données warehouse", () => {
  it("WH Manager Alger CANNOT access Oran or Constantine", () => {
    expect(canAccessWarehouse(WH_MGR_ALGER, "wh-alger-construction")).toBe(true);
    expect(canAccessWarehouse(WH_MGR_ALGER, "wh-oran-food")).toBe(false);
    expect(canAccessWarehouse(WH_MGR_ALGER, "wh-constantine-tech")).toBe(false);
  });

  it("WH Manager Oran CANNOT access Alger or Constantine", () => {
    expect(canAccessWarehouse(WH_MGR_ORAN, "wh-oran-food")).toBe(true);
    expect(canAccessWarehouse(WH_MGR_ORAN, "wh-alger-construction")).toBe(false);
  });

  it("Operator is restricted to assigned warehouse only", () => {
    expect(canAccessWarehouse(OPERATOR, "wh-alger-construction")).toBe(true);
    expect(canAccessWarehouse(OPERATOR, "wh-oran-food")).toBe(false);
  });

  it("Driver Oran cannot access Alger warehouse", () => {
    expect(canAccessWarehouse(DRIVER_ORAN, "wh-oran-food")).toBe(true);
    expect(canAccessWarehouse(DRIVER_ORAN, "wh-alger-construction")).toBe(false);
  });

  it("QCOfficer has multi-site access (Alger + Oran only)", () => {
    expect(canAccessWarehouse(QC_OFFICER, "wh-alger-construction")).toBe(true);
    expect(canAccessWarehouse(QC_OFFICER, "wh-oran-food")).toBe(true);
    expect(canAccessWarehouse(QC_OFFICER, "wh-constantine-tech")).toBe(false);
  });

  it("Global roles (CEO, FinanceDir, OpsDir) access all warehouses", () => {
    for (const user of [CEO, FINANCE_DIR, OPS_DIR]) {
      expect(canAccessWarehouse(user, "wh-alger-construction")).toBe(true);
      expect(canAccessWarehouse(user, "wh-oran-food")).toBe(true);
      expect(canAccessWarehouse(user, "wh-constantine-tech")).toBe(true);
    }
  });

  it("Approval is blocked when user has no warehouse access", () => {
    const decision = canApproveDocument(WH_MGR_ALGER, "grn", 1.0, "wh-oran-food");
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain("pas accès");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 12.17 — CEO: Escalade approbation multi-niveaux
// ═══════════════════════════════════════════════════════════════════════

describe("12.17 — CEO: Escalade approbation multi-niveaux", () => {
  it("WH Manager approves ≤2% variance", () => {
    const d = canApproveDocument(WH_MGR_ALGER, "stockAdjustment", 1.5, "wh-alger-construction");
    expect(d.allowed).toBe(true);
  });

  it("WH Manager CANNOT approve >2% variance — escalates", () => {
    const d = canApproveDocument(WH_MGR_ALGER, "stockAdjustment", 3.0, "wh-alger-construction");
    expect(d.allowed).toBe(false);
    expect(d.escalateTo).toBeTruthy();
  });

  it("RegionalManager approves ≤2% variance", () => {
    const d = canApproveDocument(REGIONAL_MGR, "stockAdjustment", 1.8, "wh-alger-construction");
    expect(d.allowed).toBe(true);
  });

  it("RegionalManager CANNOT approve >2% — escalates to Finance", () => {
    const d = canApproveDocument(REGIONAL_MGR, "stockAdjustment", 4.0, "wh-alger-construction");
    expect(d.allowed).toBe(false);
  });

  it("OpsDirector approves ≤5% variance", () => {
    const d = canApproveDocument(OPS_DIR, "stockAdjustment", 4.5);
    expect(d.allowed).toBe(true);
  });

  it("OpsDirector CANNOT approve >5% — escalates to CEO", () => {
    const d = canApproveDocument(OPS_DIR, "stockAdjustment", 7.0);
    expect(d.allowed).toBe(false);
    expect(d.escalateTo).toContain("DG");
  });

  it("CEO approves ANY variance", () => {
    expect(canApproveDocument(CEO, "stockAdjustment", 25.0).allowed).toBe(true);
    expect(canApproveDocument(CEO, "stockAdjustment", 99.0).allowed).toBe(true);
  });

  it("Full escalation chain: auto → manager → finance → ceo", () => {
    expect(getApprovalTier(0.3)).toBe("auto");
    expect(getApprovalTier(1.5)).toBe("manager");
    expect(getApprovalTier(4.0)).toBe("finance");
    expect(getApprovalTier(8.0)).toBe("ceo");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 12.18 — Accountant: Read-only sur toutes opérations
// ═══════════════════════════════════════════════════════════════════════

describe("12.18 — Accountant: Vérifier read-only sur toutes opérations", () => {
  it("Accountant can read all financial document types", () => {
    const readTypes: DocumentType[] = ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "purchaseOrder", "salesOrder", "invoice", "payment"];
    for (const dt of readTypes) {
      expect(canReadDocument(ACCOUNTANT, dt)).toBe(true);
    }
  });

  it("Accountant can ONLY create invoices and payments (no WMS ops)", () => {
    expect(canCreateDocument(ACCOUNTANT, "invoice")).toBe(true);
    expect(canCreateDocument(ACCOUNTANT, "payment")).toBe(true);
    // Cannot create WMS documents
    expect(canCreateDocument(ACCOUNTANT, "grn")).toBe(false);
    expect(canCreateDocument(ACCOUNTANT, "stockAdjustment")).toBe(false);
    expect(canCreateDocument(ACCOUNTANT, "stockTransfer")).toBe(false);
    expect(canCreateDocument(ACCOUNTANT, "purchaseOrder")).toBe(false);
    expect(canCreateDocument(ACCOUNTANT, "salesOrder")).toBe(false);
  });

  it("Accountant CANNOT approve WMS documents", () => {
    expect(canApproveDocument(ACCOUNTANT, "grn").allowed).toBe(false);
    expect(canApproveDocument(ACCOUNTANT, "stockAdjustment").allowed).toBe(false);
    expect(canApproveDocument(ACCOUNTANT, "purchaseOrder").allowed).toBe(false);
  });

  it("Accountant does NOT see Settings in sidebar", () => {
    expect(canSeeSettingsInSidebar(ACCOUNTANT)).toBe(false);
  });

  it("Accountant has DATA_EXPORT but not MANAGE_USERS", () => {
    expect(hasGovernancePermission(ACCOUNTANT, "DATA_EXPORT")).toBe(true);
    expect(hasGovernancePermission(ACCOUNTANT, "MANAGE_USERS")).toBe(false);
  });
});
