// ============================================================
// Domain: Users, Roles & Governance
// ============================================================

export type UserRole =
  | "CEO" | "FinanceDirector" | "OpsDirector" | "RegionalManager"
  | "WarehouseManager" | "QCOfficer" | "Supervisor" | "Operator"
  | "Driver" | "Accountant" | "BIAnalyst"
  | "Supplier" | "PlatformOwner";

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
  PlatformOwner: 0, CEO: 0, FinanceDirector: 1, OpsDirector: 1, RegionalManager: 2,
  WarehouseManager: 3, QCOfficer: 3, Supervisor: 4, Operator: 5,
  Driver: 5, Accountant: 3, BIAnalyst: 3, Supplier: 6,
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  PlatformOwner: "Propriétaire de la Plateforme",
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
  Supplier: "Fournisseur",
};

export interface User {
  id: string; name: string; role: UserRole; roleLabel: string;
  avatar: string; company: string;
  tenantId: string; // T-ENT-01, T-FRN-01, etc.
  assignedWarehouseIds: "all" | string[];
  approvalThresholdPct: number | null;
  canSelfApprove: boolean;
  accountabilityScope: string;
  governancePermissions: GovernancePermission[];
}

export const users: User[] = [
  {
    id: "U001", name: "Ahmed Mansour", role: "CEO", roleLabel: USER_ROLE_LABELS.CEO,
    avatar: "AM", company: "Bennet Eddar", tenantId: "T-ENT-01", assignedWarehouseIds: "all",
    approvalThresholdPct: 100, canSelfApprove: true,
    accountabilityScope: "Supervision globale — approbation finale toutes opérations critiques multi-secteurs",
    governancePermissions: ["SYSTEM_ADMIN", "MANAGE_USERS", "MANAGE_ROLES", "SYSTEM_CONFIG", "AUDIT_LOG", "DATA_EXPORT", "EDITION_CONTROL"],
  },
  {
    id: "U002", name: "Karim Ben Ali", role: "WarehouseManager", roleLabel: USER_ROLE_LABELS.WarehouseManager,
    avatar: "KB", company: "Atlas BTP", tenantId: "T-ENT-02", assignedWarehouseIds: ["wh-alger-construction"],
    approvalThresholdPct: 2, canSelfApprove: false,
    accountabilityScope: "Entrepôt Construction Alger — gestion matériaux BTP, coordination fournisseurs, approbation ajustements ≤2%",
    governancePermissions: [],
  },
  {
    id: "U003", name: "Sara Khalil", role: "QCOfficer", roleLabel: USER_ROLE_LABELS.QCOfficer,
    avatar: "SK", company: "Bennet Eddar", tenantId: "T-ENT-01", assignedWarehouseIds: ["wh-alger-construction", "wh-oran-food"],
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Contrôle qualité multi-sites — inspections GRN, conformité HACCP (Oran), résistance matériaux (Alger)",
    governancePermissions: [],
  },
  {
    id: "U004", name: "Omar Fadel", role: "Driver", roleLabel: USER_ROLE_LABELS.Driver,
    avatar: "OF", company: "Bennet Eddar", tenantId: "T-ENT-01", assignedWarehouseIds: ["wh-oran-food"],
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Livraisons agroalimentaire Oran — tournées quotidiennes, collecte paiements, retours clients",
    governancePermissions: [],
  },
  {
    id: "U005", name: "Youssef Hamdi", role: "Driver", roleLabel: USER_ROLE_LABELS.Driver,
    avatar: "YH", company: "Atlas BTP", tenantId: "T-ENT-02", assignedWarehouseIds: ["wh-alger-construction"],
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Livraisons matériaux construction — exécution tournées, collecte paiements cash",
    governancePermissions: [],
  },
  {
    id: "U006", name: "Nadia Salim", role: "Accountant", roleLabel: USER_ROLE_LABELS.Accountant,
    avatar: "NS", company: "Bennet Eddar", tenantId: "T-ENT-01", assignedWarehouseIds: "all",
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Finance centrale — suivi créances, paiements, rapports comptables tous secteurs",
    governancePermissions: ["DATA_EXPORT"],
  },
  {
    id: "U007", name: "Tarek Daoui", role: "Operator", roleLabel: USER_ROLE_LABELS.Operator,
    avatar: "TD", company: "Atlas BTP", tenantId: "T-ENT-02", assignedWarehouseIds: ["wh-alger-construction"],
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Construction Alger — réception matériaux, comptages, préparation commandes",
    governancePermissions: [],
  },
  {
    id: "U008", name: "Leila Rached", role: "BIAnalyst", roleLabel: USER_ROLE_LABELS.BIAnalyst,
    avatar: "LR", company: "Bennet Eddar", tenantId: "T-ENT-01", assignedWarehouseIds: "all",
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Analyse transversale — lecture seule sur tous entrepôts et secteurs",
    governancePermissions: ["AUDIT_LOG", "DATA_EXPORT"],
  },
  {
    id: "U009", name: "Samir Rafik", role: "WarehouseManager", roleLabel: USER_ROLE_LABELS.WarehouseManager,
    avatar: "SR", company: "Bennet Eddar", tenantId: "T-ENT-01", assignedWarehouseIds: ["wh-oran-food"],
    approvalThresholdPct: 2, canSelfApprove: false,
    accountabilityScope: "Entrepôt Agroalimentaire Oran — chaîne du froid, HACCP, traçabilité lots",
    governancePermissions: [],
  },
  {
    id: "U010", name: "Hassan Nour", role: "WarehouseManager", roleLabel: USER_ROLE_LABELS.WarehouseManager,
    avatar: "HN", company: "TechStore Pro", tenantId: "T-ENT-03", assignedWarehouseIds: ["wh-constantine-tech"],
    approvalThresholdPct: 2, canSelfApprove: false,
    accountabilityScope: "Entrepôt Technologie Constantine — sécurité haute valeur, traçabilité séries",
    governancePermissions: [],
  },
  {
    id: "U011", name: "Anis Boucetta", role: "FinanceDirector", roleLabel: USER_ROLE_LABELS.FinanceDirector,
    avatar: "AB", company: "Bennet Eddar", tenantId: "T-ENT-01", assignedWarehouseIds: "all",
    approvalThresholdPct: 5, canSelfApprove: false,
    accountabilityScope: "Finance groupe — approbation ajustements >2%, dépréciations, write-offs",
    governancePermissions: ["AUDIT_LOG"],
  },
  {
    id: "U012", name: "Rachid Benali", role: "OpsDirector", roleLabel: USER_ROLE_LABELS.OpsDirector,
    avatar: "RB", company: "Bennet Eddar", tenantId: "T-ENT-01", assignedWarehouseIds: "all",
    approvalThresholdPct: 5, canSelfApprove: false,
    accountabilityScope: "Opérations globales — supervision 3 entrepôts multi-industries",
    governancePermissions: ["AUDIT_LOG", "DATA_EXPORT"],
  },
  {
    id: "U013", name: "Farid Khelifi", role: "RegionalManager", roleLabel: USER_ROLE_LABELS.RegionalManager,
    avatar: "FK", company: "Bennet Eddar", tenantId: "T-ENT-01", assignedWarehouseIds: ["wh-alger-construction", "wh-oran-food"],
    approvalThresholdPct: 2, canSelfApprove: false,
    accountabilityScope: "Région Ouest (Construction Alger + Food Oran) — coordination inter-sites",
    governancePermissions: [],
  },
  {
    id: "U014", name: "Mourad Ziani", role: "Supervisor", roleLabel: USER_ROLE_LABELS.Supervisor,
    avatar: "MZ", company: "Bennet Eddar", tenantId: "T-ENT-01", assignedWarehouseIds: ["wh-oran-food"],
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Agroalimentaire Oran — supervision équipes terrain, contrôle chaîne du froid",
    governancePermissions: [],
  },
  {
    id: "U015", name: "Yacine Hadj-Ali", role: "PlatformOwner", roleLabel: USER_ROLE_LABELS.PlatformOwner,
    avatar: "YH", company: "Jawda (Owner)", tenantId: "T-OWN-01", assignedWarehouseIds: "all",
    approvalThresholdPct: 100, canSelfApprove: true,
    accountabilityScope: "Propriétaire plateforme — accès total, supervision stratégique, configuration système",
    governancePermissions: ["SYSTEM_ADMIN", "MANAGE_USERS", "MANAGE_ROLES", "SYSTEM_CONFIG", "AUDIT_LOG", "DATA_EXPORT", "EDITION_CONTROL"],
  },
  {
    id: "U016", name: "Mourad Zeroual", role: "CEO", roleLabel: USER_ROLE_LABELS.CEO,
    avatar: "MZ", company: "Pharmed Distribution", tenantId: "T-ENT-04", assignedWarehouseIds: "all",
    approvalThresholdPct: 100, canSelfApprove: true,
    accountabilityScope: "Entrepôt Pharmaceutique Oran",
    governancePermissions: ["SYSTEM_ADMIN", "MANAGE_USERS", "SYSTEM_CONFIG", "AUDIT_LOG", "DATA_EXPORT"],
  },
  {
    id: "U017", name: "Karim Benmoussa", role: "Supplier", roleLabel: USER_ROLE_LABELS.Supplier,
    avatar: "KBM", company: "Agro Sahel Distribution", tenantId: "T-FRN-01", assignedWarehouseIds: [],
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Fournisseur externe — consultation commandes, livraisons, factures propres (portail léger)",
    governancePermissions: [],
  },
  // ── Agro Sahel — Fournisseur-Entrepôt (abonné WMS complet) ──
  {
    id: "U020", name: "Karim Benmoussa", role: "CEO", roleLabel: USER_ROLE_LABELS.CEO,
    avatar: "KBM", company: "Agro Sahel Distribution", tenantId: "T-FRN-01", assignedWarehouseIds: "all",
    approvalThresholdPct: 100, canSelfApprove: true,
    accountabilityScope: "DG Agro Sahel — supervision complète entrepôt fournisseur, ventes B2B aux entrepôts Jawda",
    governancePermissions: ["MANAGE_USERS", "SYSTEM_CONFIG", "AUDIT_LOG", "DATA_EXPORT"],
  },
  {
    id: "U021", name: "Mourad Sahli", role: "WarehouseManager", roleLabel: USER_ROLE_LABELS.WarehouseManager,
    avatar: "MS", company: "Agro Sahel Distribution", tenantId: "T-FRN-01", assignedWarehouseIds: ["wh-sahel-supplier"],
    approvalThresholdPct: 2, canSelfApprove: false,
    accountabilityScope: "Entrepôt Agro Sahel Oued Smar — gestion stock agroalimentaire, préparation commandes B2B",
    governancePermissions: [],
  },
  {
    id: "U022", name: "Yacine Ferhat", role: "Operator", roleLabel: USER_ROLE_LABELS.Operator,
    avatar: "YF", company: "Agro Sahel Distribution", tenantId: "T-FRN-01", assignedWarehouseIds: ["wh-sahel-supplier"],
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Magasinier Sahel — réception marchandises, préparation commandes, comptages",
    governancePermissions: [],
  },
  {
    id: "U023", name: "Bilal Kaddour", role: "Driver", roleLabel: USER_ROLE_LABELS.Driver,
    avatar: "BK", company: "Agro Sahel Distribution", tenantId: "T-FRN-01", assignedWarehouseIds: ["wh-sahel-supplier"],
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Livreur Sahel — livraisons B2B aux entrepôts clients (Oran, Alger)",
    governancePermissions: [],
  },
  // ── Atlas BTP — CEO + staff ──
  {
    id: "U030", name: "Nabil Boumediene", role: "CEO", roleLabel: USER_ROLE_LABELS.CEO,
    avatar: "NB", company: "Atlas BTP Distribution", tenantId: "T-ENT-02", assignedWarehouseIds: "all",
    approvalThresholdPct: 100, canSelfApprove: true,
    accountabilityScope: "DG Atlas BTP — supervision complète distribution matériaux de construction",
    governancePermissions: ["SYSTEM_ADMIN", "MANAGE_USERS", "SYSTEM_CONFIG", "AUDIT_LOG", "DATA_EXPORT"],
  },
  {
    id: "U036", name: "Fatima Zerhouni", role: "FinanceDirector", roleLabel: USER_ROLE_LABELS.FinanceDirector,
    avatar: "FZ", company: "Atlas BTP Distribution", tenantId: "T-ENT-02", assignedWarehouseIds: "all",
    approvalThresholdPct: 5, canSelfApprove: false,
    accountabilityScope: "DAF Atlas BTP — finance, facturation, paiements",
    governancePermissions: ["AUDIT_LOG", "DATA_EXPORT"],
  },
  {
    id: "U037", name: "Khaled Messaoud", role: "OpsDirector", roleLabel: USER_ROLE_LABELS.OpsDirector,
    avatar: "KM", company: "Atlas BTP Distribution", tenantId: "T-ENT-02", assignedWarehouseIds: "all",
    approvalThresholdPct: 5, canSelfApprove: false,
    accountabilityScope: "Directeur opérations Atlas BTP — logistique & entrepôt",
    governancePermissions: ["AUDIT_LOG"],
  },
  {
    id: "U038", name: "Djamila Bencheikh", role: "QCOfficer", roleLabel: USER_ROLE_LABELS.QCOfficer,
    avatar: "DB", company: "Atlas BTP Distribution", tenantId: "T-ENT-02", assignedWarehouseIds: ["wh-alger-construction"],
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Contrôle qualité BTP — résistance matériaux, conformité normes",
    governancePermissions: [],
  },
  {
    id: "U039", name: "Hocine Amrani", role: "Supervisor", roleLabel: USER_ROLE_LABELS.Supervisor,
    avatar: "HA", company: "Atlas BTP Distribution", tenantId: "T-ENT-02", assignedWarehouseIds: ["wh-alger-construction"],
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Supervision équipes entrepôt construction Alger",
    governancePermissions: [],
  },
  // ── TechnoLog Algérie — CEO + staff ──
  {
    id: "U031", name: "Samira Hadj", role: "CEO", roleLabel: USER_ROLE_LABELS.CEO,
    avatar: "SH", company: "TechnoLog Algérie", tenantId: "T-ENT-03", assignedWarehouseIds: "all",
    approvalThresholdPct: 100, canSelfApprove: true,
    accountabilityScope: "DG TechnoLog — supervision complète distribution technologie",
    governancePermissions: ["SYSTEM_ADMIN", "MANAGE_USERS", "SYSTEM_CONFIG", "AUDIT_LOG", "DATA_EXPORT"],
  },
  {
    id: "U040", name: "Sofiane Belkacem", role: "FinanceDirector", roleLabel: USER_ROLE_LABELS.FinanceDirector,
    avatar: "SB", company: "TechnoLog Algérie", tenantId: "T-ENT-03", assignedWarehouseIds: "all",
    approvalThresholdPct: 5, canSelfApprove: false,
    accountabilityScope: "DAF TechnoLog — finance, facturation haute valeur",
    governancePermissions: ["AUDIT_LOG", "DATA_EXPORT"],
  },
  {
    id: "U041", name: "Amina Sellami", role: "OpsDirector", roleLabel: USER_ROLE_LABELS.OpsDirector,
    avatar: "AS", company: "TechnoLog Algérie", tenantId: "T-ENT-03", assignedWarehouseIds: "all",
    approvalThresholdPct: 5, canSelfApprove: false,
    accountabilityScope: "Directrice opérations TechnoLog — logistique haute sécurité",
    governancePermissions: ["AUDIT_LOG"],
  },
  {
    id: "U042", name: "Rania Boudiaf", role: "QCOfficer", roleLabel: USER_ROLE_LABELS.QCOfficer,
    avatar: "RBo", company: "TechnoLog Algérie", tenantId: "T-ENT-03", assignedWarehouseIds: ["wh-constantine-tech"],
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Contrôle qualité tech — tests fonctionnels, vérification séries",
    governancePermissions: [],
  },
  {
    id: "U043", name: "Walid Ferhat", role: "Supervisor", roleLabel: USER_ROLE_LABELS.Supervisor,
    avatar: "WF", company: "TechnoLog Algérie", tenantId: "T-ENT-03", assignedWarehouseIds: ["wh-constantine-tech"],
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Supervision entrepôt tech Constantine — sécurité haute valeur",
    governancePermissions: [],
  },
  {
    id: "U044", name: "Ismail Tlemcani", role: "Operator", roleLabel: USER_ROLE_LABELS.Operator,
    avatar: "IT", company: "TechnoLog Algérie", tenantId: "T-ENT-03", assignedWarehouseIds: ["wh-constantine-tech"],
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Magasinier tech — réception, rangement, préparation commandes",
    governancePermissions: [],
  },
  {
    id: "U045", name: "Zaki Chaouch", role: "Driver", roleLabel: USER_ROLE_LABELS.Driver,
    avatar: "ZC", company: "TechnoLog Algérie", tenantId: "T-ENT-03", assignedWarehouseIds: ["wh-constantine-tech"],
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Livreur tech — livraisons sécurisées haute valeur",
    governancePermissions: [],
  },
  // ── Sahara Express — Additional staff ──
  {
    id: "U046", name: "Aicha Bensalem", role: "WarehouseManager", roleLabel: USER_ROLE_LABELS.WarehouseManager,
    avatar: "ABs", company: "Sahara Express", tenantId: "T-ENT-04", assignedWarehouseIds: "all",
    approvalThresholdPct: 2, canSelfApprove: false,
    accountabilityScope: "Responsable entrepôt Sahara Express — gestion stock multi-produits",
    governancePermissions: [],
  },
  {
    id: "U047", name: "Moussa Seddiki", role: "Operator", roleLabel: USER_ROLE_LABELS.Operator,
    avatar: "MSe", company: "Sahara Express", tenantId: "T-ENT-04", assignedWarehouseIds: "all",
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Opérateur Sahara — réception, comptages, préparation",
    governancePermissions: [],
  },
  {
    id: "U048", name: "Habib Charef", role: "Driver", roleLabel: USER_ROLE_LABELS.Driver,
    avatar: "HC", company: "Sahara Express", tenantId: "T-ENT-04", assignedWarehouseIds: "all",
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Livreur Sahara — tournées sud algérien",
    governancePermissions: [],
  },
  {
    id: "U049", name: "Naima Khelif", role: "Accountant", roleLabel: USER_ROLE_LABELS.Accountant,
    avatar: "NK", company: "Sahara Express", tenantId: "T-ENT-04", assignedWarehouseIds: "all",
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Comptable Sahara Express — suivi créances, paiements",
    governancePermissions: ["DATA_EXPORT"],
  },
  // ── Fournisseurs externes ──
  {
    id: "U032", name: "Youcef Krim", role: "Supplier", roleLabel: USER_ROLE_LABELS.Supplier,
    avatar: "YK", company: "Céramique Atlas", tenantId: "T-FRN-02", assignedWarehouseIds: [],
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "DG Céramique Atlas — portail fournisseur",
    governancePermissions: [],
  },
  {
    id: "U033", name: "Farid Meddour", role: "Supplier", roleLabel: USER_ROLE_LABELS.Supplier,
    avatar: "FM", company: "TechParts Algérie", tenantId: "T-FRN-03", assignedWarehouseIds: [],
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "DG TechParts — portail fournisseur",
    governancePermissions: [],
  },
  {
    id: "U034", name: "Rachid Hamidi", role: "Supplier", roleLabel: USER_ROLE_LABELS.Supplier,
    avatar: "RH", company: "Laiterie du Tell", tenantId: "T-EXT-01", assignedWarehouseIds: [],
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Fournisseur externe — portail léger",
    governancePermissions: [],
  },
  {
    id: "U035", name: "Omar Djelloul", role: "Supplier", roleLabel: USER_ROLE_LABELS.Supplier,
    avatar: "OD", company: "Dattes El Oued Premium", tenantId: "T-EXT-02", assignedWarehouseIds: [],
    approvalThresholdPct: null, canSelfApprove: false,
    accountabilityScope: "Fournisseur externe — portail léger",
    governancePermissions: [],
  },
];
