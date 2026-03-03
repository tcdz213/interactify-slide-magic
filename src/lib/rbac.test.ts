import { describe, it, expect } from "vitest";
import {
  getApprovalTier,
  getApprovalRequirement,
  canAccessWarehouse,
  canApproveDocument,
  canSelfApprove,
  canCreateDocument,
  canReadDocument,
  getRoleBadgeStyle,
  getWarehouseBadgeStyle,
  getWarehouseShortName,
  getRoleLevel,
  hasGovernancePermission,
  isSystemAdmin,
  getUserGovernancePermissions,
  APPROVAL_TIERS,
} from "./rbac";
import { users } from "@/data/mockData";
import type { User } from "@/data/mockData";

// Helper to find user by role
const findUser = (role: string) => users.find((u) => u.role === role)!;

describe("RBAC — Approval Tiers", () => {
  it("returns 'auto' for variance ≤ 0.5%", () => {
    expect(getApprovalTier(0)).toBe("auto");
    expect(getApprovalTier(0.5)).toBe("auto");
    expect(getApprovalTier(-0.3)).toBe("auto");
  });

  it("returns 'manager' for 0.5% < variance ≤ 2%", () => {
    expect(getApprovalTier(0.6)).toBe("manager");
    expect(getApprovalTier(2)).toBe("manager");
    expect(getApprovalTier(-1.5)).toBe("manager");
  });

  it("returns 'finance' for 2% < variance ≤ 5%", () => {
    expect(getApprovalTier(2.1)).toBe("finance");
    expect(getApprovalTier(5)).toBe("finance");
  });

  it("returns 'ceo' for variance > 5%", () => {
    expect(getApprovalTier(5.1)).toBe("ceo");
    expect(getApprovalTier(10)).toBe("ceo");
    expect(getApprovalTier(-8)).toBe("ceo");
  });

  it("returns 'manager' for null variance", () => {
    expect(getApprovalTier(null)).toBe("manager");
  });

  it("getApprovalRequirement returns correct tier object", () => {
    const req = getApprovalRequirement(3);
    expect(req.tier).toBe("finance");
    expect(req.label).toContain("Finance");
    expect(req.requiredRoles).toContain("FinanceDirector");
  });

  it("all approval tiers have required fields", () => {
    for (const tier of Object.values(APPROVAL_TIERS)) {
      expect(tier.tier).toBeTruthy();
      expect(tier.label).toBeTruthy();
      expect(tier.description).toBeTruthy();
      expect(tier.color).toBeTruthy();
      expect(tier.badgeColor).toBeTruthy();
      expect(Array.isArray(tier.requiredRoles)).toBe(true);
    }
  });
});

describe("RBAC — Warehouse Access", () => {
  it("CEO can access any warehouse", () => {
    const ceo = findUser("CEO");
    expect(canAccessWarehouse(ceo, "WH01")).toBe(true);
    expect(canAccessWarehouse(ceo, "WH02")).toBe(true);
    expect(canAccessWarehouse(ceo, "WH03")).toBe(true);
    expect(canAccessWarehouse(ceo, "WH99")).toBe(true);
  });

  it("WarehouseManager can only access assigned warehouses", () => {
    const whMgr = findUser("WarehouseManager");
    const assigned = whMgr.assignedWarehouseIds;
    if (assigned !== "all" && assigned.length > 0) {
      expect(canAccessWarehouse(whMgr, assigned[0])).toBe(true);
      expect(canAccessWarehouse(whMgr, "WH99")).toBe(false);
    }
  });

  it("Driver has limited warehouse access", () => {
    const driver = findUser("Driver");
    expect(canAccessWarehouse(driver, "WH99")).toBe(false);
  });
});

describe("RBAC — Document Permissions", () => {
  it("CEO can create salesOrder", () => {
    expect(canCreateDocument(findUser("CEO"), "salesOrder")).toBe(true);
  });

  it("Driver cannot create any documents", () => {
    const driver = findUser("Driver");
    expect(canCreateDocument(driver, "grn")).toBe(false);
    expect(canCreateDocument(driver, "stockAdjustment")).toBe(false);
    expect(canCreateDocument(driver, "salesOrder")).toBe(false);
  });

  it("Operator can create GRN and stock adjustments", () => {
    const op = findUser("Operator");
    expect(canCreateDocument(op, "grn")).toBe(true);
    expect(canCreateDocument(op, "stockAdjustment")).toBe(true);
    expect(canCreateDocument(op, "invoice")).toBe(false);
  });

  it("Accountant can create invoices and payments", () => {
    const acc = findUser("Accountant");
    expect(canCreateDocument(acc, "invoice")).toBe(true);
    expect(canCreateDocument(acc, "payment")).toBe(true);
    expect(canCreateDocument(acc, "grn")).toBe(false);
  });

  it("BIAnalyst cannot create any documents", () => {
    const bi = findUser("BIAnalyst");
    expect(canCreateDocument(bi, "grn")).toBe(false);
    expect(canCreateDocument(bi, "salesOrder")).toBe(false);
    expect(canCreateDocument(bi, "invoice")).toBe(false);
  });

  it("CEO can read all document types", () => {
    const ceo = findUser("CEO");
    expect(canReadDocument(ceo, "grn")).toBe(true);
    expect(canReadDocument(ceo, "invoice")).toBe(true);
    expect(canReadDocument(ceo, "writeOff")).toBe(true);
  });

  it("Driver can only read salesOrder", () => {
    const driver = findUser("Driver");
    expect(canReadDocument(driver, "salesOrder")).toBe(true);
    expect(canReadDocument(driver, "grn")).toBe(false);
    expect(canReadDocument(driver, "invoice")).toBe(false);
  });
});

describe("RBAC — Approval Decisions", () => {
  it("CEO can approve any document at any variance", () => {
    const ceo = findUser("CEO");
    expect(canApproveDocument(ceo, "stockAdjustment", 10).allowed).toBe(true);
    expect(canApproveDocument(ceo, "grn", null).allowed).toBe(true);
  });

  it("WarehouseManager can approve GRN at ≤2% variance", () => {
    const whMgr = findUser("WarehouseManager");
    const result = canApproveDocument(whMgr, "grn", 1.5);
    expect(result.allowed).toBe(true);
  });

  it("WarehouseManager cannot approve at >5% variance", () => {
    const whMgr = findUser("WarehouseManager");
    const result = canApproveDocument(whMgr, "stockAdjustment", 6);
    expect(result.allowed).toBe(false);
    expect(result.escalateTo).toBeTruthy();
  });

  it("Operator cannot approve any document", () => {
    const op = findUser("Operator");
    expect(canApproveDocument(op, "grn", null).allowed).toBe(false);
    expect(canApproveDocument(op, "stockAdjustment", 0.1).allowed).toBe(false);
  });

  it("auto-approves for ≤0.5% variance regardless of role", () => {
    const ceo = findUser("CEO");
    const result = canApproveDocument(ceo, "stockAdjustment", 0.3);
    expect(result.allowed).toBe(true);
    expect(result.reason).toContain("automatique");
  });

  it("denies approval for wrong warehouse", () => {
    const whMgr = findUser("WarehouseManager");
    if (whMgr.assignedWarehouseIds !== "all") {
      const result = canApproveDocument(whMgr, "grn", null, "WH99");
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("accès");
    }
  });
});

describe("RBAC — Self-Approval Prevention", () => {
  it("canSelfApprove always returns false", () => {
    const ceo = findUser("CEO");
    expect(canSelfApprove(ceo, ceo.id)).toBe(false);
    expect(canSelfApprove(ceo, "other-user")).toBe(false);
  });
});

describe("RBAC — UI Helpers", () => {
  it("getRoleBadgeStyle returns a class string for each role", () => {
    const roles = ["CEO", "FinanceDirector", "OpsDirector", "WarehouseManager", "Operator", "Driver", "BIAnalyst"] as const;
    roles.forEach((role) => {
      const style = getRoleBadgeStyle(role);
      expect(style).toContain("bg-");
      expect(style).toContain("text-");
    });
  });

  it("getWarehouseBadgeStyle returns distinct styles", () => {
    const whAlger = getWarehouseBadgeStyle("wh-alger-construction");
    const whOran = getWarehouseBadgeStyle("wh-oran-food");
    expect(whAlger).not.toBe(whOran);
    expect(getWarehouseBadgeStyle("WH99")).toContain("gray");
  });

  it("getWarehouseShortName returns friendly names", () => {
    expect(getWarehouseShortName("wh-alger-construction")).toBe("Construction-Alger");
    expect(getWarehouseShortName("wh-oran-food")).toBe("Food-Oran");
    expect(getWarehouseShortName("wh-constantine-tech")).toBe("Tech-Constantine");
    expect(getWarehouseShortName("WH99")).toBe("WH99");
  });

  it("getRoleLevel returns correct hierarchy", () => {
    expect(getRoleLevel("CEO")).toBe(1);
    expect(getRoleLevel("FinanceDirector")).toBe(2);
    expect(getRoleLevel("WarehouseManager")).toBe(3);
    expect(getRoleLevel("Operator")).toBe(5);
    expect(getRoleLevel("Driver")).toBe(5);
  });
});

describe("RBAC — Governance Layer", () => {
  it("CEO is system admin", () => {
    const ceo = findUser("CEO");
    expect(isSystemAdmin(ceo)).toBe(true);
  });

  it("Operator is not system admin", () => {
    const op = findUser("Operator");
    expect(isSystemAdmin(op)).toBe(false);
  });

  it("hasGovernancePermission checks correctly", () => {
    const ceo = findUser("CEO");
    expect(hasGovernancePermission(ceo, "SYSTEM_ADMIN")).toBe(true);
    expect(hasGovernancePermission(ceo, "MANAGE_USERS")).toBe(true);
  });

  it("getUserGovernancePermissions returns user permissions", () => {
    const ceo = findUser("CEO");
    const perms = getUserGovernancePermissions(ceo);
    expect(Array.isArray(perms)).toBe(true);
    expect(perms.length).toBeGreaterThan(0);
  });

  it("Driver has no governance permissions", () => {
    const driver = findUser("Driver");
    const perms = getUserGovernancePermissions(driver);
    expect(perms.length).toBe(0);
  });
});

describe("RBAC — All users exist with correct structure", () => {
  it("has at least 14 users with required fields", () => {
    expect(users.length).toBeGreaterThanOrEqual(14);
    users.forEach((u) => {
      expect(u.id).toBeTruthy();
      expect(u.name).toBeTruthy();
      expect(u.role).toBeTruthy();
      expect(u.roleLabel).toBeTruthy();
      expect(u.avatar).toBeTruthy();
      expect(u.approvalThresholdPct === null || typeof u.approvalThresholdPct === "number").toBe(true);
      expect(Array.isArray(u.governancePermissions)).toBe(true);
    });
  });

  it("covers all 11 distinct roles", () => {
    const roles = new Set(users.map((u) => u.role));
    expect(roles.size).toBeGreaterThanOrEqual(11);
  });
});
