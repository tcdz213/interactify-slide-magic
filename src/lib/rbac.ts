/**
 * Jawda — RBAC Engine
 * Real-life enterprise access control:
 *   - Geographic responsibility (user ↔ warehouse)
 *   - Separation of duties (no self-approval)
 *   - 4-tier escalation based on variance %
 */

import type { User, UserRole, GovernancePermission } from "@/data/mockData";

// ──────────────────────────────────────────────────────────────────────────
// Approval Escalation Tiers
// ──────────────────────────────────────────────────────────────────────────

export type ApprovalTier = "auto" | "manager" | "finance" | "ceo";

export interface ApprovalRequirement {
    tier: ApprovalTier;
    label: string;
    description: string;
    color: string;          // Tailwind text color
    badgeColor: string;     // Tailwind bg for badge
    requiredRoles: UserRole[];
}

export const APPROVAL_TIERS: Record<ApprovalTier, ApprovalRequirement> = {
    auto: {
        tier: "auto",
        label: "Auto-approuvé",
        description: "Variance ≤ 0.5% — approbation automatique",
        color: "text-emerald-600",
        badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
        requiredRoles: [],
    },
    manager: {
        tier: "manager",
        label: "Responsable Entrepôt",
        description: "Variance ≤ 2% — approbation responsable entrepôt",
        color: "text-blue-600",
        badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
        requiredRoles: ["WarehouseManager", "RegionalManager", "OpsDirector", "CEO"],
    },
    finance: {
        tier: "finance",
        label: "Finance + Responsable",
        description: "Variance ≤ 5% — approbation Finance + Responsable Entrepôt",
        color: "text-amber-600",
        badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
        requiredRoles: ["FinanceDirector", "OpsDirector", "CEO"],
    },
    ceo: {
        tier: "ceo",
        label: "DG + Investigation",
        description: "Variance > 5% — décision DG + enquête obligatoire",
        color: "text-red-600",
        badgeColor: "bg-red-100 text-red-700 border-red-200",
        requiredRoles: ["CEO"],
    },
};

/**
 * Returns which approval tier is required for a given variance %.
 * Null variancePct = general document approval (not value-based).
 */
export function getApprovalTier(variancePct: number | null): ApprovalTier {
    if (variancePct === null) return "manager";
    const abs = Math.abs(variancePct);
    if (abs <= 0.5) return "auto";
    if (abs <= 2) return "manager";
    if (abs <= 5) return "finance";
    return "ceo";
}

export function getApprovalRequirement(variancePct: number | null): ApprovalRequirement {
    return APPROVAL_TIERS[getApprovalTier(variancePct)];
}

// ──────────────────────────────────────────────────────────────────────────
// Role Permission Matrix
// ──────────────────────────────────────────────────────────────────────────

export type DocumentType =
    | "grn"
    | "stockAdjustment"
    | "stockTransfer"
    | "cycleCount"
    | "purchaseOrder"
    | "salesOrder"
    | "invoice"
    | "payment"
    | "writeOff";

interface RolePermissions {
    canApprove: DocumentType[];
    canCreate: DocumentType[];
    canRead: DocumentType[];
    accessScope: "all" | "assigned";
    canApproveFinancial: boolean; // Financial write-offs, high-value adjustments
}

const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
    CEO: {
        canApprove: ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "purchaseOrder", "salesOrder", "invoice", "payment", "writeOff"],
        canCreate: ["salesOrder", "invoice", "payment"],
        canRead: ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "purchaseOrder", "salesOrder", "invoice", "payment", "writeOff"],
        accessScope: "all",
        canApproveFinancial: true,
    },
    FinanceDirector: {
        canApprove: ["stockAdjustment", "invoice", "payment", "writeOff"],
        canCreate: ["invoice", "payment"],
        canRead: ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "purchaseOrder", "salesOrder", "invoice", "payment", "writeOff"],
        accessScope: "all",
        canApproveFinancial: true,
    },
    OpsDirector: {
        canApprove: ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "purchaseOrder", "salesOrder"],
        canCreate: ["salesOrder"],
        canRead: ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "purchaseOrder", "salesOrder", "invoice", "payment"],
        accessScope: "all",
        canApproveFinancial: false,
    },
    RegionalManager: {
        canApprove: ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "salesOrder"],
        canCreate: ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "salesOrder"],
        canRead: ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "purchaseOrder", "salesOrder"],
        accessScope: "assigned",
        canApproveFinancial: false,
    },
    WarehouseManager: {
        canApprove: ["grn", "stockAdjustment", "stockTransfer", "cycleCount"],
        canCreate: ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "purchaseOrder"],
        canRead: ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "purchaseOrder"],
        accessScope: "assigned",
        canApproveFinancial: false,
    },
    QCOfficer: {
        canApprove: ["grn"],  // QC approval only
        canCreate: [],
        canRead: ["grn", "stockAdjustment"],
        accessScope: "assigned",
        canApproveFinancial: false,
    },
    Supervisor: {
        canApprove: [],
        canCreate: ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "salesOrder"],
        canRead: ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "salesOrder"],
        accessScope: "assigned",
        canApproveFinancial: false,
    },
    Operator: {
        canApprove: [],
        canCreate: ["grn", "stockAdjustment"],
        canRead: ["grn", "stockAdjustment", "stockTransfer", "cycleCount"],
        accessScope: "assigned",
        canApproveFinancial: false,
    },
    Driver: {
        canApprove: [],
        canCreate: [],
        canRead: ["salesOrder"],
        accessScope: "assigned",
        canApproveFinancial: false,
    },
    Accountant: {
        canApprove: ["invoice", "payment"],
        canCreate: ["invoice", "payment"],
        canRead: ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "purchaseOrder", "salesOrder", "invoice", "payment"],
        accessScope: "all",
        canApproveFinancial: false,
    },
    BIAnalyst: {
        canApprove: [],
        canCreate: [],
        canRead: ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "purchaseOrder", "salesOrder", "invoice", "payment"],
        accessScope: "all",
        canApproveFinancial: false,
    },
};

// ──────────────────────────────────────────────────────────────────────────
// Core Access Functions
// ──────────────────────────────────────────────────────────────────────────

/**
 * Can the user access a specific warehouse?
 * Users with assignedWarehouseIds === "all" always have access.
 */
export function canAccessWarehouse(user: User, warehouseId: string): boolean {
    if (user.assignedWarehouseIds === "all") return true;
    return user.assignedWarehouseIds.includes(warehouseId);
}

/**
 * Get the list of warehouse IDs accessible to the user.
 * Returns null if access is unrestricted ("all").
 */
export function getAccessibleWarehouses(user: User): string[] | null {
    if (user.assignedWarehouseIds === "all") return null; // null = unrestricted
    return user.assignedWarehouseIds;
}

/**
 * Can the user approve a given document type at a given variance?
 * Takes into account both role permission matrix and approval threshold.
 */
export interface ApprovalDecision {
    allowed: boolean;
    reason: string;
    escalateTo?: string;
}

export function canApproveDocument(
    user: User,
    docType: DocumentType,
    variancePct: number | null = null,
    warehouseId?: string,
): ApprovalDecision {
    const perms = ROLE_PERMISSIONS[user.role];

    // Check warehouse access first
    if (warehouseId && !canAccessWarehouse(user, warehouseId)) {
        return {
            allowed: false,
            reason: `${user.name} n'a pas accès à cet entrepôt`,
            escalateTo: "Responsable de l'entrepôt concerné",
        };
    }

    // Check if role can approve this document type
    if (!perms.canApprove.includes(docType)) {
        return {
            allowed: false,
            reason: `Le rôle "${user.roleLabel}" ne peut pas approuver ce type de document`,
            escalateTo: "Responsable Entrepôt ou supérieur",
        };
    }

    // For non-value-based approvals (no variancePct), role permission is enough
    if (variancePct === null) {
        return { allowed: true, reason: "Approbation autorisée par votre rôle" };
    }

    const tier = getApprovalTier(variancePct);

    // Auto-approved
    if (tier === "auto") {
        return { allowed: true, reason: "Variance ≤ 0.5% — approbation automatique" };
    }

    // Check user's threshold
    if (user.approvalThresholdPct === null) {
        return {
            allowed: false,
            reason: "Votre rôle ne dispose d'aucun seuil d'approbation financière",
            escalateTo: "Responsable Entrepôt",
        };
    }

    const abs = Math.abs(variancePct);
    if (abs <= user.approvalThresholdPct) {
        return {
            allowed: true,
            reason: `Variance ${abs.toFixed(1)}% dans votre seuil d'approbation (≤${user.approvalThresholdPct}%)`,
        };
    }

    // Escalation required
    const req = APPROVAL_TIERS[tier];
    return {
        allowed: false,
        reason: `Variance ${abs.toFixed(1)}% dépasse votre seuil (${user.approvalThresholdPct}%)`,
        escalateTo: req.label,
    };
}

/**
 * Separation of duties: a user can NEVER approve their own transaction.
 */
export function canSelfApprove(_user: User, _createdByUserId: string): false {
    return false; // Always false — fundamental governance rule
}

/**
 * Can this user create (initiate) a given document type?
 */
export function canCreateDocument(user: User, docType: DocumentType, warehouseId?: string): boolean {
    if (warehouseId && !canAccessWarehouse(user, warehouseId)) return false;
    return ROLE_PERMISSIONS[user.role].canCreate.includes(docType);
}

/**
 * Can this user read a given document type?
 */
export function canReadDocument(user: User, docType: DocumentType): boolean {
    return ROLE_PERMISSIONS[user.role].canRead.includes(docType);
}

// ──────────────────────────────────────────────────────────────────────────
// UI Helpers
// ──────────────────────────────────────────────────────────────────────────

/** Level-based badge colors for role display */
export function getRoleBadgeStyle(role: UserRole): string {
    switch (role) {
        case "CEO":
            return "bg-purple-100 text-purple-800 border-purple-200";
        case "FinanceDirector":
        case "OpsDirector":
            return "bg-indigo-100 text-indigo-800 border-indigo-200";
        case "RegionalManager":
            return "bg-violet-100 text-violet-800 border-violet-200";
        case "WarehouseManager":
            return "bg-blue-100 text-blue-800 border-blue-200";
        case "QCOfficer":
        case "Supervisor":
        case "Accountant":
            return "bg-cyan-100 text-cyan-800 border-cyan-200";
        case "BIAnalyst":
            return "bg-teal-100 text-teal-800 border-teal-200";
        case "Operator":
            return "bg-slate-100 text-slate-700 border-slate-200";
        case "Driver":
            return "bg-orange-100 text-orange-800 border-orange-200";
        default:
            return "bg-gray-100 text-gray-700 border-gray-200";
    }
}

/** Warehouse chip color — distinct per warehouse */
export function getWarehouseBadgeStyle(warehouseId: string): string {
    switch (warehouseId) {
        case "wh-alger-construction": return "bg-orange-50 text-orange-700 border-orange-200";
        case "wh-oran-food": return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "wh-constantine-tech": return "bg-blue-50 text-blue-700 border-blue-200";
        default: return "bg-gray-50 text-gray-600 border-gray-200";
    }
}

/** Short warehouse label for chips */
export function getWarehouseShortName(warehouseId: string): string {
    switch (warehouseId) {
        case "wh-alger-construction": return "Construction-Alger";
        case "wh-oran-food": return "Food-Oran";
        case "wh-constantine-tech": return "Tech-Constantine";
        default: return warehouseId;
    }
}

/** Role hierarchy level 1–5 */
export function getRoleLevel(role: UserRole): number {
    const levels: Record<UserRole, number> = {
        CEO: 1,
        FinanceDirector: 2,
        OpsDirector: 2,
        RegionalManager: 3,
        WarehouseManager: 3,
        QCOfficer: 4,
        Supervisor: 4,
        Accountant: 4,
        BIAnalyst: 4,
        Operator: 5,
        Driver: 5,
    };
    return levels[role] ?? 5;
}

// ──────────────────────────────────────────────────────────────────────────
// Layer 3 — Governance (System-Level Capabilities)
// ──────────────────────────────────────────────────────────────────────────

/**
 * Check if a user has a specific governance permission.
 * Governance is INDEPENDENT from role permissions and warehouse scope.
 */
export function hasGovernancePermission(user: User, permission: GovernancePermission): boolean {
    return user.governancePermissions.includes(permission);
}

/**
 * Is this user a System Admin? (has SYSTEM_ADMIN governance permission)
 * This is the highest governance level — controls system edition state,
 * user management, system configuration, etc.
 */
export function isSystemAdmin(user: User): boolean {
    return hasGovernancePermission(user, "SYSTEM_ADMIN");
}

/**
 * Get all governance permissions for a user.
 */
export function getUserGovernancePermissions(user: User): GovernancePermission[] {
    return user.governancePermissions;
}

// ──────────────────────────────────────────────────────────────────────────
// Display-friendly permission map (used by UserManagementPage matrix)
// ──────────────────────────────────────────────────────────────────────────
export interface RolePermissionsDisplay {
    read: DocumentType[];
    create: DocumentType[];
    approve: DocumentType[];
}

export const ROLE_PERMISSIONS_DISPLAY: Record<UserRole, RolePermissionsDisplay> = {
    CEO: {
        read: ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "purchaseOrder", "salesOrder", "invoice", "payment", "writeOff"],
        create: [],
        approve: ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "purchaseOrder", "salesOrder", "invoice", "payment", "writeOff"],
    },
    FinanceDirector: {
        read: ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "purchaseOrder", "salesOrder", "invoice", "payment", "writeOff"],
        create: [],
        approve: ["stockAdjustment", "invoice", "payment", "writeOff"],
    },
    OpsDirector: {
        read: ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "purchaseOrder", "salesOrder", "invoice", "payment"],
        create: [],
        approve: ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "purchaseOrder"],
    },
    RegionalManager: {
        read: ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "purchaseOrder", "salesOrder"],
        create: ["grn", "stockAdjustment", "stockTransfer", "cycleCount"],
        approve: ["grn", "stockAdjustment", "stockTransfer", "cycleCount"],
    },
    WarehouseManager: {
        read: ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "purchaseOrder"],
        create: ["grn", "stockAdjustment", "stockTransfer", "cycleCount"],
        approve: ["grn", "stockAdjustment", "stockTransfer", "cycleCount"],
    },
    QCOfficer: {
        read: ["grn", "stockAdjustment"],
        create: [],
        approve: ["grn"],
    },
    Supervisor: {
        read: ["grn", "stockAdjustment", "stockTransfer", "cycleCount"],
        create: ["grn", "stockAdjustment", "stockTransfer", "cycleCount"],
        approve: [],
    },
    Operator: {
        read: ["grn", "stockAdjustment", "stockTransfer", "cycleCount"],
        create: ["grn", "stockAdjustment"],
        approve: [],
    },
    Driver: {
        read: ["salesOrder"],
        create: [],
        approve: [],
    },
    Accountant: {
        read: ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "purchaseOrder", "salesOrder", "invoice", "payment"],
        create: ["invoice", "payment"],
        approve: ["invoice", "payment"],
    },
    BIAnalyst: {
        read: ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "purchaseOrder", "salesOrder", "invoice", "payment"],
        create: [],
        approve: [],
    },
};

// ──────────────────────────────────────────────────────────────────────────
// Field-Level Permissions (R1 — Hide cost/price from non-finance roles)
// ──────────────────────────────────────────────────────────────────────────

/** Roles allowed to see cost price, PMP, margin, and financial columns */
const FINANCE_ROLES: UserRole[] = [
    "CEO", "FinanceDirector", "OpsDirector", "Accountant", "BIAnalyst",
];

/**
 * Can the user see cost/price/margin fields?
 * Returns false for operational roles (Driver, Operator, Supervisor, etc.)
 */
export function canViewFinancials(user: User): boolean {
    return FINANCE_ROLES.includes(user.role);
}

/**
 * Hook-friendly: check if current user role can view financial columns.
 * Use in components to conditionally render cost/price columns.
 */
export function canRoleViewFinancials(role: UserRole): boolean {
    return FINANCE_ROLES.includes(role);
}
