// ============================================================
// Domain: Users, Roles & Governance
// ============================================================

export type UserRole =
  | "CEO" | "FinanceDirector" | "OpsDirector" | "RegionalManager"
  | "WarehouseManager" | "QCOfficer" | "Supervisor" | "Operator"
  | "Driver" | "Accountant" | "BIAnalyst";

export type GovernancePermission =
  | "SYSTEM_ADMIN" | "MANAGE_USERS" | "MANAGE_ROLES" | "SYSTEM_CONFIG"
  | "AUDIT_LOG" | "DATA_EXPORT" | "EDITION_CONTROL";

export const GOVERNANCE_LABELS: Record<GovernancePermission, string> = {
  SYSTEM_ADMIN: "Super Admin Système",
  MANAGE_USERS: "Gestion des utilisateurs",
  MANAGE_ROLES: "Gestion des rôles",
  SYSTEM_CONFIG: "Configuration système",
  AUDIT_LOG: "Audit & traçabilité",
  DATA_EXPORT: "Export de données",
  EDITION_CONTROL: "Contrôle édition Dashboard",
};

export const USER_ROLE_LEVEL: Record<UserRole, number> = {
  CEO: 0, FinanceDirector: 1, OpsDirector: 1, RegionalManager: 2,
  WarehouseManager: 3, QCOfficer: 3, Supervisor: 4, Operator: 5,
  Driver: 5, Accountant: 3, BIAnalyst: 3,
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  CEO: "Directeur Général (DG)",
  FinanceDirector: "Directeur Administratif & Financier",
  OpsDirector: "Directeur des Opérations",
  RegionalManager: "Responsable Régional",
  WarehouseManager: "Responsable Entrepôt",
  QCOfficer: "Responsable Qualité (QC)",
  Supervisor: "Chef d'Équipe / Superviseur",
  Operator: "Opérateur / Magasinier",
  Driver: "Chauffeur / Livreur",
  Accountant: "Comptable",
  BIAnalyst: "Analyste BI / Reporting",
};

export interface User {
  id: string; name: string; role: UserRole; roleLabel: string;
  avatar: string; company: string;
  assignedWarehouseIds: "all" | string[];
  approvalThresholdPct: number | null;
  canSelfApprove: boolean;
  accountabilityScope: string;
  governancePermissions: GovernancePermission[];
}

export const users: User[] = [
  {
    id: "U001", name: "Ahmed Mansour", role: "CEO", roleLabel: USER_ROLE_LABELS.CEO,
    avatar: "AM", company: "Jawda", assignedWarehouseIds: "all",
    approvalThresholdPct: 100, canSelfApprove: true,
    accountabilityScope: "Supervision globale — approbation finale toutes opérations critiques multi-secteurs",
    governancePermissions: ["SYSTEM_ADMIN", "MANAGE_USERS", "MANAGE_ROLES", "SYSTEM_CONFIG", "AUDIT_LOG", "DATA_EXPORT", "EDITION_CONTROL"],
  },
  {
    id: "U002", name: "Karim Ben Ali", role: "WarehouseManager", roleLabel: USER_ROLE_LABELS.WarehouseManager,
    avatar: "KB", company: "Jawda", assignedWarehouseIds: ["wh-alger-construction"],
    approvalThresholdPct: 2, canSelfApprove: false,
    accountabilityScope: "Entrepôt Construction Alger — gestion matériaux BTP, coordination fournisseurs, approbation ajustements ≤2%",
    governancePermissions: [],
  },
  {
    id: "U003", name: "Sara Khalil", role: "QCOfficer", roleLabel: USER_ROLE_LABELS.QCOfficer,
    avatar: "SK", company: "Jawda", assignedWarehouseIds: ["wh-alger-construction", "wh-oran-food"],
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Contrôle qualité multi-sites — inspections GRN, conformité HACCP (Oran), résistance matériaux (Alger)",
    governancePermissions: [],
  },
  {
    id: "U004", name: "Omar Fadel", role: "Driver", roleLabel: USER_ROLE_LABELS.Driver,
    avatar: "OF", company: "Jawda", assignedWarehouseIds: ["wh-oran-food"],
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Livraisons agroalimentaire Oran — tournées quotidiennes, collecte paiements, retours clients",
    governancePermissions: [],
  },
  {
    id: "U005", name: "Youssef Hamdi", role: "Driver", roleLabel: USER_ROLE_LABELS.Driver,
    avatar: "YH", company: "Jawda", assignedWarehouseIds: ["wh-alger-construction"],
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Livraisons matériaux construction — exécution tournées, collecte paiements cash",
    governancePermissions: [],
  },
  {
    id: "U006", name: "Nadia Salim", role: "Accountant", roleLabel: USER_ROLE_LABELS.Accountant,
    avatar: "NS", company: "Jawda", assignedWarehouseIds: "all",
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Finance centrale — suivi créances, paiements, rapports comptables tous secteurs",
    governancePermissions: ["DATA_EXPORT"],
  },
  {
    id: "U007", name: "Tarek Daoui", role: "Operator", roleLabel: USER_ROLE_LABELS.Operator,
    avatar: "TD", company: "Jawda", assignedWarehouseIds: ["wh-alger-construction"],
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Construction Alger — réception matériaux, comptages, préparation commandes",
    governancePermissions: [],
  },
  {
    id: "U008", name: "Leila Rached", role: "BIAnalyst", roleLabel: USER_ROLE_LABELS.BIAnalyst,
    avatar: "LR", company: "Jawda", assignedWarehouseIds: "all",
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Analyse transversale — lecture seule sur tous entrepôts et secteurs",
    governancePermissions: ["AUDIT_LOG", "DATA_EXPORT"],
  },
  {
    id: "U009", name: "Samir Rafik", role: "WarehouseManager", roleLabel: USER_ROLE_LABELS.WarehouseManager,
    avatar: "SR", company: "Jawda", assignedWarehouseIds: ["wh-oran-food"],
    approvalThresholdPct: 2, canSelfApprove: false,
    accountabilityScope: "Entrepôt Agroalimentaire Oran — chaîne du froid, HACCP, traçabilité lots",
    governancePermissions: [],
  },
  {
    id: "U010", name: "Hassan Nour", role: "WarehouseManager", roleLabel: USER_ROLE_LABELS.WarehouseManager,
    avatar: "HN", company: "Jawda", assignedWarehouseIds: ["wh-constantine-tech"],
    approvalThresholdPct: 2, canSelfApprove: false,
    accountabilityScope: "Entrepôt Technologie Constantine — sécurité haute valeur, traçabilité séries",
    governancePermissions: [],
  },
  {
    id: "U011", name: "Anis Boucetta", role: "FinanceDirector", roleLabel: USER_ROLE_LABELS.FinanceDirector,
    avatar: "AB", company: "Jawda", assignedWarehouseIds: "all",
    approvalThresholdPct: 5, canSelfApprove: false,
    accountabilityScope: "Finance groupe — approbation ajustements >2%, dépréciations, write-offs",
    governancePermissions: ["AUDIT_LOG"],
  },
  {
    id: "U012", name: "Rachid Benali", role: "OpsDirector", roleLabel: USER_ROLE_LABELS.OpsDirector,
    avatar: "RB", company: "Jawda", assignedWarehouseIds: "all",
    approvalThresholdPct: 5, canSelfApprove: false,
    accountabilityScope: "Opérations globales — supervision 3 entrepôts multi-industries",
    governancePermissions: ["AUDIT_LOG", "DATA_EXPORT"],
  },
  {
    id: "U013", name: "Farid Khelifi", role: "RegionalManager", roleLabel: USER_ROLE_LABELS.RegionalManager,
    avatar: "FK", company: "Jawda", assignedWarehouseIds: ["wh-alger-construction", "wh-oran-food"],
    approvalThresholdPct: 2, canSelfApprove: false,
    accountabilityScope: "Région Ouest (Construction Alger + Food Oran) — coordination inter-sites",
    governancePermissions: [],
  },
  {
    id: "U014", name: "Mourad Ziani", role: "Supervisor", roleLabel: USER_ROLE_LABELS.Supervisor,
    avatar: "MZ", company: "Jawda", assignedWarehouseIds: ["wh-oran-food"],
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Agroalimentaire Oran — supervision équipes terrain, contrôle chaîne du froid",
    governancePermissions: [],
  },
];
