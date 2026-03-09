/**
 * 🏢 Tenant Registry — SaaS Multi-Tenant Architecture
 * Each tenant = one independent business on the Jawda platform.
 * Aligned with Owner Dashboard subscribers and WMS data isolation.
 */

export interface Tenant {
  id: string;
  name: string;
  type: "entrepot" | "fournisseur" | "external" | "platform";
  sector: string;
  city: string;
  wilaya: string;
  plan: "trial" | "standard" | "pro" | "enterprise" | "platform";
  ceoName: string;
  ceoUserId: string;
  warehouseIds: string[];
  icon: string;
  status: "active" | "trial" | "suspended" | "cancelled";
}

export const tenants: Tenant[] = [
  // ── Entrepôts (Warehouses / Distributors) ──
  {
    id: "T-ENT-01",
    name: "Bennet Eddar",
    type: "entrepot",
    sector: "Agroalimentaire",
    city: "Alger",
    wilaya: "Alger",
    plan: "enterprise",
    ceoName: "Ahmed Mansour",
    ceoUserId: "U001",
    warehouseIds: ["wh-oran-food"],
    icon: "🏭",
    status: "active",
  },
  {
    id: "T-ENT-02",
    name: "Atlas BTP Distribution",
    type: "entrepot",
    sector: "Matériaux de construction",
    city: "Alger",
    wilaya: "Alger",
    plan: "pro",
    ceoName: "Nabil Boumediene",
    ceoUserId: "U030",
    warehouseIds: ["wh-alger-construction"],
    icon: "🏗️",
    status: "active",
  },
  {
    id: "T-ENT-03",
    name: "TechnoLog Algérie",
    type: "entrepot",
    sector: "Technologie",
    city: "Constantine",
    wilaya: "Constantine",
    plan: "pro",
    ceoName: "Samira Hadj",
    ceoUserId: "U031",
    warehouseIds: ["wh-constantine-tech"],
    icon: "💻",
    status: "active",
  },
  {
    id: "T-ENT-04",
    name: "Sahara Express",
    type: "entrepot",
    sector: "Distribution générale",
    city: "Oran",
    wilaya: "Oran",
    plan: "standard",
    ceoName: "Mourad Zeroual",
    ceoUserId: "U016",
    warehouseIds: [],
    icon: "🚚",
    status: "active",
  },

  // ── Fournisseurs Abonnés (avec WMS) ──
  {
    id: "T-FRN-01",
    name: "Agro Sahel Distribution",
    type: "fournisseur",
    sector: "Agroalimentaire",
    city: "Alger",
    wilaya: "Alger",
    plan: "pro",
    ceoName: "Karim Benmoussa",
    ceoUserId: "U020",
    warehouseIds: ["wh-sahel-supplier"],
    icon: "📦",
    status: "active",
  },
  {
    id: "T-FRN-02",
    name: "Céramique Atlas",
    type: "fournisseur",
    sector: "Matériaux",
    city: "Ghardaia",
    wilaya: "Ghardaia",
    plan: "pro",
    ceoName: "Youcef Krim",
    ceoUserId: "U032",
    warehouseIds: [],
    icon: "🧱",
    status: "active",
  },
  {
    id: "T-FRN-03",
    name: "TechParts Algérie",
    type: "fournisseur",
    sector: "Électronique & Pièces",
    city: "Constantine",
    wilaya: "Constantine",
    plan: "standard",
    ceoName: "Farid Meddour",
    ceoUserId: "U033",
    warehouseIds: [],
    icon: "🔌",
    status: "active",
  },

  // ── Fournisseurs Externes (portail léger) ──
  {
    id: "T-EXT-01",
    name: "Laiterie du Tell",
    type: "external",
    sector: "Produits laitiers",
    city: "Sétif",
    wilaya: "Sétif",
    plan: "trial",
    ceoName: "Rachid Hamidi",
    ceoUserId: "U034",
    warehouseIds: [],
    icon: "🥛",
    status: "trial",
  },
  {
    id: "T-EXT-02",
    name: "Dattes El Oued Premium",
    type: "external",
    sector: "Agroalimentaire",
    city: "El Oued",
    wilaya: "El Oued",
    plan: "standard",
    ceoName: "Omar Djelloul",
    ceoUserId: "U035",
    warehouseIds: [],
    icon: "🌴",
    status: "suspended",
  },

  // ── Platform Owner ──
  {
    id: "T-OWN-01",
    name: "Jawda (Plateforme)",
    type: "platform",
    sector: "SaaS",
    city: "Alger",
    wilaya: "Alger",
    plan: "platform",
    ceoName: "Yacine Hadj-Ali",
    ceoUserId: "U015",
    warehouseIds: [],
    icon: "👑",
    status: "active",
  },
];

/** Get tenant by ID */
export function getTenant(tenantId: string): Tenant | undefined {
  return tenants.find(t => t.id === tenantId);
}

/** Get all active entrepôt tenants */
export function getEntrepotTenants(): Tenant[] {
  return tenants.filter(t => t.type === "entrepot");
}

/** Get all fournisseur tenants */
export function getFournisseurTenants(): Tenant[] {
  return tenants.filter(t => t.type === "fournisseur" || t.type === "external");
}

/** All subscriber tenants (excluding platform owner) */
export function getSubscriberTenants(): Tenant[] {
  return tenants.filter(t => t.type !== "platform");
}
