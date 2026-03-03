// ============================================================
// Domain: Sales Agents (Vendeurs) & Route Plans
// ============================================================

import type { PlannedVisit } from "@/pages/sales/RouteMapView";

export interface SalesAgent {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  warehouseId: string;
  zone: string;
  quotaTarget: number;
  quotaCurrent: number;
  visitsToday: number;
  visitsDone: number;
}

export const salesAgents: SalesAgent[] = [
  // Alger Construction
  {
    id: "AGT-001", name: "Yassine Khelifi", avatar: "YK", phone: "0555-111-001",
    warehouseId: "wh-alger-construction", zone: "Alger Centre",
    quotaTarget: 500000, quotaCurrent: 385000, visitsToday: 6, visitsDone: 3,
  },
  {
    id: "AGT-002", name: "Amine Boudjema", avatar: "AB", phone: "0555-111-002",
    warehouseId: "wh-alger-construction", zone: "Bab El Oued",
    quotaTarget: 400000, quotaCurrent: 210000, visitsToday: 5, visitsDone: 1,
  },
  {
    id: "AGT-003", name: "Redouane Slimani", avatar: "RS", phone: "0555-111-003",
    warehouseId: "wh-alger-construction", zone: "Kouba / El Biar",
    quotaTarget: 450000, quotaCurrent: 420000, visitsToday: 4, visitsDone: 4,
  },
  // Oran Food
  {
    id: "AGT-004", name: "Mehdi Belkacemi", avatar: "MB", phone: "0555-222-001",
    warehouseId: "wh-oran-food", zone: "Oran Centre",
    quotaTarget: 600000, quotaCurrent: 490000, visitsToday: 7, visitsDone: 5,
  },
  {
    id: "AGT-005", name: "Nassim Djebbar", avatar: "ND", phone: "0555-222-002",
    warehouseId: "wh-oran-food", zone: "Es-Sénia / Bir El Djir",
    quotaTarget: 350000, quotaCurrent: 175000, visitsToday: 5, visitsDone: 2,
  },
  {
    id: "AGT-006", name: "Karim Haddad", avatar: "KH", phone: "0555-222-003",
    warehouseId: "wh-oran-food", zone: "Aïn El Turk",
    quotaTarget: 300000, quotaCurrent: 65000, visitsToday: 4, visitsDone: 0,
  },
  // Constantine Tech
  {
    id: "AGT-007", name: "Sofiane Mebarki", avatar: "SM", phone: "0555-333-001",
    warehouseId: "wh-constantine-tech", zone: "Constantine Centre",
    quotaTarget: 700000, quotaCurrent: 560000, visitsToday: 5, visitsDone: 3,
  },
  {
    id: "AGT-008", name: "Walid Touati", avatar: "WT", phone: "0555-333-002",
    warehouseId: "wh-constantine-tech", zone: "El Khroub",
    quotaTarget: 550000, quotaCurrent: 320000, visitsToday: 6, visitsDone: 2,
  },
];

/** Route plans keyed by agent ID */
export const agentRoutePlans: Record<string, PlannedVisit[]> = {
  "AGT-001": [
    { customerId: "C001", name: "Boulangerie El Baraka", lat: 36.7538, lng: 3.0588, time: "08:30", zone: "Alger Centre" },
    { customerId: "C002", name: "Supermarché Rahma", lat: 36.7650, lng: 3.0470, time: "09:30", zone: "Bab El Oued" },
    { customerId: "C003", name: "Restaurant Le Palmier", lat: 36.7720, lng: 3.0600, time: "10:30", zone: "Hydra" },
    { customerId: "C004", name: "Épicerie Fine Yasmine", lat: 36.7480, lng: 3.0700, time: "11:30", zone: "El Biar" },
    { customerId: "C005", name: "Café Le Terminus", lat: 36.7400, lng: 3.0850, time: "14:00", zone: "Kouba" },
    { customerId: "C006", name: "Pâtisserie Lalla", lat: 36.7580, lng: 3.0350, time: "15:00", zone: "Bab El Oued" },
  ],
  "AGT-002": [
    { customerId: "C010", name: "Quincaillerie Atlas", lat: 36.7610, lng: 3.0420, time: "08:00", zone: "Bab El Oued" },
    { customerId: "C011", name: "Matériaux El Amir", lat: 36.7550, lng: 3.0380, time: "09:30", zone: "Bab El Oued" },
    { customerId: "C012", name: "Bâti Plus", lat: 36.7590, lng: 3.0510, time: "11:00", zone: "Alger Centre" },
    { customerId: "C013", name: "Plomberie Générale", lat: 36.7630, lng: 3.0450, time: "14:00", zone: "Bab El Oued" },
    { customerId: "C014", name: "Électricité Salim", lat: 36.7670, lng: 3.0530, time: "15:30", zone: "Casbah" },
  ],
  "AGT-003": [
    { customerId: "C015", name: "Constructions Modernes", lat: 36.7450, lng: 3.0750, time: "08:00", zone: "Kouba" },
    { customerId: "C016", name: "Villa Déco", lat: 36.7520, lng: 3.0680, time: "10:00", zone: "El Biar" },
    { customerId: "C017", name: "Peintures du Sud", lat: 36.7480, lng: 3.0720, time: "11:30", zone: "Kouba" },
    { customerId: "C018", name: "Menuiserie Ben Amar", lat: 36.7510, lng: 3.0800, time: "14:30", zone: "El Biar" },
  ],
  "AGT-004": [
    { customerId: "C020", name: "Café Central Oran", lat: 35.6971, lng: -0.6308, time: "08:00", zone: "Oran Centre" },
    { customerId: "C021", name: "Supermarché El Wouroud", lat: 35.7000, lng: -0.6250, time: "09:00", zone: "Oran Centre" },
    { customerId: "C022", name: "Pâtisserie Rania Oran", lat: 35.6930, lng: -0.6350, time: "10:30", zone: "Oran Centre" },
    { customerId: "C023", name: "Restaurant La Mer", lat: 35.7050, lng: -0.6180, time: "11:30", zone: "Front de mer" },
    { customerId: "C024", name: "Épicerie Mosta", lat: 35.6990, lng: -0.6280, time: "14:00", zone: "Oran Centre" },
    { customerId: "C025", name: "Mini Market Bel Air", lat: 35.7020, lng: -0.6220, time: "15:00", zone: "Oran Centre" },
    { customerId: "C026", name: "Boucherie El Baraka", lat: 35.6960, lng: -0.6320, time: "16:00", zone: "Oran Centre" },
  ],
  "AGT-005": [
    { customerId: "C030", name: "Grossiste Dali", lat: 35.6350, lng: -0.5800, time: "08:30", zone: "Es-Sénia" },
    { customerId: "C031", name: "Superette Bir El Djir", lat: 35.6700, lng: -0.5650, time: "10:00", zone: "Bir El Djir" },
    { customerId: "C032", name: "Cash & Carry Zone", lat: 35.6500, lng: -0.5750, time: "11:30", zone: "Es-Sénia" },
    { customerId: "C033", name: "Fromagerie Tlemcen", lat: 35.6600, lng: -0.5700, time: "14:00", zone: "Bir El Djir" },
    { customerId: "C034", name: "Boulangerie Es-Salem", lat: 35.6450, lng: -0.5850, time: "15:30", zone: "Es-Sénia" },
  ],
  "AGT-006": [
    { customerId: "C040", name: "Hôtel El Mountazah", lat: 35.7300, lng: -0.7700, time: "09:00", zone: "Aïn El Turk" },
    { customerId: "C041", name: "Restaurant Corniche", lat: 35.7350, lng: -0.7750, time: "10:30", zone: "Aïn El Turk" },
    { customerId: "C042", name: "Épicerie Plage", lat: 35.7280, lng: -0.7650, time: "12:00", zone: "Aïn El Turk" },
    { customerId: "C043", name: "Café Brise de Mer", lat: 35.7320, lng: -0.7680, time: "14:30", zone: "Aïn El Turk" },
  ],
  "AGT-007": [
    { customerId: "C050", name: "TechStore Constantine", lat: 36.3650, lng: 6.6147, time: "08:30", zone: "Constantine Centre" },
    { customerId: "C051", name: "InfoPlus", lat: 36.3600, lng: 6.6100, time: "10:00", zone: "Constantine Centre" },
    { customerId: "C052", name: "Électro Ziane", lat: 36.3700, lng: 6.6200, time: "11:30", zone: "Constantine Centre" },
    { customerId: "C053", name: "NetCom Solutions", lat: 36.3680, lng: 6.6180, time: "14:00", zone: "Constantine Centre" },
    { customerId: "C054", name: "Smart Devices DZ", lat: 36.3620, lng: 6.6130, time: "15:30", zone: "Constantine Centre" },
  ],
  "AGT-008": [
    { customerId: "C060", name: "Électronique El Khroub", lat: 36.2650, lng: 6.6950, time: "08:00", zone: "El Khroub" },
    { customerId: "C061", name: "PC World El Khroub", lat: 36.2700, lng: 6.7000, time: "09:30", zone: "El Khroub" },
    { customerId: "C062", name: "Phone Center", lat: 36.2680, lng: 6.6980, time: "11:00", zone: "El Khroub" },
    { customerId: "C063", name: "Bureau Équip", lat: 36.2620, lng: 6.6920, time: "13:30", zone: "El Khroub" },
    { customerId: "C064", name: "Security Cam DZ", lat: 36.2750, lng: 6.7050, time: "15:00", zone: "El Khroub" },
    { customerId: "C065", name: "Réseau Plus", lat: 36.2730, lng: 6.7020, time: "16:30", zone: "El Khroub" },
  ],
};
