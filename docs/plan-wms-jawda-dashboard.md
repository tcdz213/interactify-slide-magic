# Plan — WMS Jawda Dashboard (Admin ERP)

> **Référence** : [jawda-platform-complete.md](./jawda-platform-complete.md) — Section 5, 6, 7
> **Version** : 2.0 — Mars 2026

---

## 1. Vue d'ensemble

Le **WMS Dashboard** est le cœur de la plateforme Jawda. Portail principal accessible à `/` pour tous les rôles internes d'une entreprise abonnée (CEO → Operator). Chaque rôle voit un **scope filtré** selon ses permissions RBAC et ses entrepôts assignés.

```
JAWDA PLATFORM — WMS ADMIN DASHBOARD (/)
|
|-- Rôles internes : CEO, FinDir, OpsDir, RegMgr, WhMgr, QC, Supv, Op, Compta, BI
|-- Multi-entrepôts : scopé par assignedWarehouseIds
|-- Multi-tenant : isolé par company_id
|
┌─────────────────────────────────────────────────────────────┐
│                    WMS DASHBOARD (/)                         │
│                                                             │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │Dashboard │  │ Données  │  │   WMS    │  │   Ventes   │  │
│  │  KPI     │  │ de Base  │  │ Complet  │  │ & Clients  │  │
│  └─────────┘  └──────────┘  └──────────┘  └────────────┘  │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │Tarifi-  │  │Distribu- │  │Compta-   │  │  BI &      │  │
│  │cation   │  │tion      │  │bilité    │  │ Rapports   │  │
│  └─────────┘  └──────────┘  └──────────┘  └────────────┘  │
│  ┌─────────┐  ┌──────────┐                                 │
│  │  Admin  │  │Fourniss. │                                 │
│  │Système  │  │  /my/*   │                                 │
│  └─────────┘  └──────────┘                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. RBAC — Visibilité par Rôle

> Source : jawda-platform-complete.md § 3 + § 6

| Rôle | Niveau | Dashboard | Données Base | WMS | Ventes | Tarification | Distribution | Comptabilité | BI | Admin |
|------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| CEO | 1 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| FinanceDirector | 1 | ✅ | ✅ | R | R | R | — | ✅ | ✅ | ✅ |
| OpsDirector | 1 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | R | ✅ | ✅ |
| RegionalManager | 2 | ✅ | ✅ | ✅ | ✅ | R | ✅ | — | R | — |
| WarehouseManager | 3 | ✅ | ✅ | ✅ | ✅ | — | ✅ | — | — | — |
| QCOfficer | 3 | ✅ | ✅ | Inbound QC | — | — | — | — | — | — |
| Accountant | 3 | ✅ | ✅ | R | R | — | — | ✅ | R | — |
| BIAnalyst | 3 | ✅ | ✅ | R | R | — | — | R | ✅ | — |
| Supervisor | 4 | ✅ | ✅ | ✅ | ✅ | — | ✅ | — | — | — |
| Operator | 5 | ✅ | — | GRN,CC,Pick,Put | — | — | — | — | — | — |
| Supplier (ext.) | — | `/my/*` | — | — | — | — | — | — | — | — |

**Légende :** ✅ = Écriture | R = Lecture seule | — = Pas d'accès

---

## 3. Dashboard Principal (`/`)

### KPI selon le rôle

| KPI | CEO/OpsDir | FinDir | WhMgr | Supv | Op |
|-----|:---:|:---:|:---:|:---:|:---:|
| CA du jour/mois | ✅ | ✅ | — | — | — |
| Commandes en cours | ✅ | R | ✅ | ✅ | — |
| Stock total valorisé | ✅ | ✅ | ✅ | — | — |
| Alertes stock bas | ✅ | — | ✅ | ✅ | ✅ |
| GRN à réceptionner | ✅ | — | ✅ | ✅ | ✅ |
| Tâches du jour | — | — | ✅ | ✅ | ✅ |
| Livraisons en cours | ✅ | — | ✅ | ✅ | — |
| Performance fournisseurs | ✅ | — | ✅ | — | — |

### Composants

- `SalesKpiGrid` — KPI ventes (CA, marge, commandes)
- `StockKpiGrid` — KPI stock (valorisation, rotations, alertes)
- `WeeklySalesChart` — Graphique ventes hebdomadaires
- `InventoryPieChart` — Répartition stock par catégorie
- `RecentOrdersTable` — Dernières commandes
- `ActivityTimeline` — Fil d'activité récente
- `AlertsFeed` — Alertes et notifications
- `WarehouseScopePanel` — Sélecteur scope entrepôt

### Filtrage

- Scope entrepôt (sélecteur multi-entrepôts si autorisé)
- Période (jour, semaine, mois, trimestre)
- Auto-filtré par `assignedWarehouseIds`

---

## 4. Modules & Pages

### 4.1 🗂️ Données de Base

| Page | Route | Description |
|------|-------|-------------|
| Produits | `/wms/products` | Catalogue avec hiérarchie Secteur/Catégorie/Sous-catégorie |
| Catégories | `/wms/categories` | Hiérarchie de catégorisation |
| Unités de mesure | `/wms/uom` | UdM + conversions (kg↔sac, L↔bouteille) |
| Codes-barres | `/wms/barcodes` | Codes EAN/QR |
| Fournisseurs | `/wms/vendors` | Fiches fournisseurs avec scorecard |
| Transporteurs | `/wms/carriers` | Prestataires de livraison |
| Conditions paiement | `/wms/payment-terms` | Net30, Net60, avance |
| Devises & Taux | `/settings/currencies` | Taux de change (DZD, EUR, USD) |
| Configuration fiscale | `/settings/tax-config` | TVA, timbre fiscal, exonérations |
| Entrepôts | `/wms/warehouses` | Sites de stockage |
| Emplacements | `/wms/locations` | Zones, allées, étagères, bins |

### 4.2 🏭 WMS (Warehouse Management)

#### Inbound (Réception)
| Page | Route | Flux |
|------|-------|------|
| Bons de commande (PO) | `/wms/purchase-orders` | Création → Envoi → Suivi |
| Bons de réception (GRN) | `/wms/grn` | PO → GRN → QC → Putaway |
| Contrôle qualité | `/wms/quality-control` | Inspection lots, conformité (HACCP) |
| Rangement (Putaway) | `/wms/putaway` | Affectation emplacement |
| Cross Docking | `/wms/cross-docking` | Transit direct sans stockage |
| 3-Way Match | `/wms/match-exceptions` | PO vs GRN vs Facture |
| Contrats fournisseurs | `/wms/supplier-contracts` | Tarifs négociés, volumes |

> **Scénario** (réf. jawda-platform-complete § 8.3) : Karim (WhMgr) reçoit 980 sacs/1000 → variance -2% → WhMgr approuve → stock +980 → facture ajustée.

#### Outbound (Expédition)
| Page | Route | Flux |
|------|-------|------|
| Vagues | `/wms/waves` | Regroupement commandes |
| Picking | `/wms/picking` | Prélèvement FIFO/FEFO |
| Packing | `/wms/packing` | Colisage et étiquetage |
| Expédition | `/wms/shipping` | Chargement camion |
| Réapprovisionnement | `/wms/replenishment-rules` | Seuils min/max |
| Réservations | `/wms/reservations` | Blocage stock pour commande |

#### Stock
| Page | Route | Description |
|------|-------|-------------|
| Tableau de bord stock | `/wms/stock-dashboard` | Vue synthétique multi-entrepôts |
| Journal mouvements | `/wms/movements` | Historique entrées/sorties |
| Comptage cyclique | `/wms/cycle-count` | Inventaires tournants |
| Ajustements | `/wms/adjustments` | Corrections (+/-) avec approbation |
| Transferts | `/wms/transfers` | Inter-entrepôts et inter-zones |
| Blocage stock | `/wms/stock-block` | Quarantaine, rappels |

#### Traçabilité
| Page | Route | Description |
|------|-------|-------------|
| Lots / Batch | `/wms/lot-batch` | Suivi par lot de fabrication |
| N° de série | `/wms/serial-numbers` | Traçabilité unitaire |
| Valorisation stock | `/wms/stock-valuation` | PMP, FIFO, coût moyen |
| Historique prix | `/wms/price-history` | Évolution prix achat/vente |

#### Opérations internes
| Page | Route | Description |
|------|-------|-------------|
| Kitting / Assemblage | `/wms/kitting` | Composition de kits |
| Reconditionnement | `/wms/repacking` | Changement d'emballage |
| Retours fournisseur | `/wms/returns` | Renvoi marchandise défectueuse |
| Avoirs | `/wms/credit-notes` | Notes de crédit |
| Réclamations qualité | `/wms/quality-claims` | Litiges fournisseurs |
| Scorecard fournisseur | `/wms/vendor-scorecard` | Notation performance |

#### Gestion terrain
| Page | Route | Description |
|------|-------|-------------|
| File de tâches | `/wms/tasks` | Picking, putaway, comptage |
| Yard & Dock | `/wms/yard-dock` | Gestion cour / quais |
| Automatisation | `/wms/automation` | API, webhooks, robots |

### 4.3 🛒 Ventes

| Page | Route | Description |
|------|-------|-------------|
| Commandes vente | `/sales/orders` | Cycle : draft → confirmed → picking → shipped → delivered |
| Clients | `/sales/customers` | Fiches clients avec solde crédit |
| Détail client | `/sales/customers/:id` | Historique, encours, limite crédit |
| Plan de tournée | `/sales/route-plan` | Carte des visites commerciales |

> **Scénario** (réf. § 7.3) : Client commande → Credit check → SalesOrder (draft) → WhMgr confirme → Picking → Packing → Shipping → Driver livre → Facture.

### 4.4 💰 Tarification

| Page | Route | Description |
|------|-------|-------------|
| Types de clients | `/pricing/client-types` | Grossiste, détaillant, VIP |
| Grille tarifaire | `/pricing/prices` | Prix par type client, paliers volume |

### 4.5 🚚 Distribution

| Page | Route | Description |
|------|-------|-------------|
| Routes | `/distribution/routes` | Définition des tournées |
| Livraisons | `/distribution/deliveries` | Suivi en temps réel |
| Clôture quotidienne | `/closing` | Bilan fin de journée (cash, retours) |

### 4.6 💳 Comptabilité (rôles Finance)

| Page | Route | Description |
|------|-------|-------------|
| Factures | `/accounting/invoices` | Émission et suivi |
| Paiements | `/accounting/payments` | Encaissements et décaissements |
| Runs de paiement | `/accounting/payment-runs` | Paiements en lot |
| Rapport GRNI | `/accounting/grni` | Goods Received Not Invoiced |
| Rapprochement bancaire | `/accounting/bank-reconciliation` | Matching relevés |
| Plan comptable | `/accounting/chart-of-accounts` | Structure comptable |
| Budgets & centres coût | `/accounting/budgets` | Suivi budgétaire |

> **Scénario** (réf. § 8.12) : Nadia (Comptable) importe relevé bancaire → auto-match 45 paiements → 3 écarts → rapprochement → rapport.

### 4.7 📈 BI & Reporting

| Page | Route | Description |
|------|-------|-------------|
| Rapports WMS | `/reports` | Rapports opérationnels |
| Report Builder | `/reports/builder` | Constructeur rapports personnalisés |
| Historique marges | `/reports/margin-history` | Évolution marges par produit |
| Rentabilité | `/bi/profitability` | Analyse P&L par produit/client |
| Distribution catégories | `/bi/categories` | Répartition du CA |

### 4.8 ⚙️ Administration (CEO + Admin)

| Page | Route | Description |
|------|-------|-------------|
| Utilisateurs & Accès | `/settings/users` | CRUD users + rôles |
| Journal d'audit | `/settings/audit-log` | Traçabilité actions |
| Stratégie picking | `/settings/picking-strategy` | FIFO, FEFO, zone |
| Workflows approbation | `/settings/approval-workflows` | Escalade et seuils |
| Règles putaway | `/settings/putaway-rules` | Affectation automatique |
| Règles alertes | `/settings/alert-rules` | Notifications et seuils |
| Types emplacements | `/settings/location-types` | Froid, sec, vrac |
| Intégrations | `/settings/integrations` | API tierces |
| Paramètres système | `/settings/system` | Config globale (admin only) |

### 4.9 📦 Espace Fournisseur (`/my/*`)

> Visible uniquement pour le rôle `Supplier` dans la sidebar.

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/my/dashboard` | KPI fournisseur (produits, commandes, revenus) |
| Mes Produits | `/my/products` | CRUD produits propres |
| Mes Commandes | `/my/orders` | Commandes contenant ses items |
| Factures | `/my/invoices` | Factures et paiements |
| Statistiques | `/my/stats` | CA mensuel, top produits |
| Profil | `/my/profile` | Infos entreprise, RIB, NIF |

> **Scénario** (réf. § 8.9) : WhMgr Oran crée PO vers Agro Sahel → Karim (Supplier) confirme → livre → GRN créé → facture → paiement.

---

## 5. Approbation & Escalade

> Source : jawda-platform-complete.md § 9

| Tier | Variance | Approuveur | Action |
|------|----------|------------|--------|
| **Auto** | ≤0.5% | Système | Approbation automatique |
| **Manager** | ≤2% | WarehouseManager / RegionalManager | Approbation manuelle |
| **Finance** | ≤5% | FinanceDirector + WarehouseManager | Double approbation |
| **CEO** | >5% | CEO + Investigation obligatoire | Enquête + approbation |

**Règle anti-auto-approbation** : Créateur ≠ Approbateur (toujours).

---

## 6. Sécurité & Isolation

1. **Multi-tenant** : Chaque entreprise isolée par `company_id`
2. **Scope entrepôt** : Filtrage par `assignedWarehouseIds`
3. **Séparation des tâches** : Interdiction auto-approbation
4. **Audit trail** : Toutes actions loguées (user, timestamp, IP)
5. **Session timeout** : 30 min inactivité → logout
6. **PIN + Biométrie** : Auth 2 facteurs rôles internes

---

## 7. Stack Technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + TypeScript + Tailwind CSS + shadcn/ui |
| State | React Context + React Query |
| Charts | Recharts |
| Routing | React Router v6 (lazy loading) |
| i18n | i18next (fr, en, ar) |
| Animations | Framer Motion |
| Auth | PIN-based (mock) → Supabase Auth (production) |
| Backend | Node.js + Express + TypeScript (futur) |
| DB | PostgreSQL via Supabase (futur) |
| Sidebar | macOS Finder-style avec glassmorphism |

---

## 8. Utilisateurs Mock (WMS Roles)

| ID | Nom | Rôle | Entrepôt | PIN |
|----|-----|------|----------|-----|
| U001 | Ahmed Mansour | CEO | Tous | 1234 |
| U002 | Karim Ben Ali | WarehouseManager | Alger Construction | 2345 |
| U003 | Sara Khalil | QCOfficer | Alger + Oran | 3456 |
| U006 | Nadia Salim | Accountant | Tous | 6789 |
| U007 | Tarek Daoui | Operator | Alger Construction | 7890 |
| U008 | Leila Rached | BIAnalyst | Tous | 8901 |
| U009 | Samir Rafik | WarehouseManager | Oran Food | 9012 |
| U010 | Hassan Nour | WarehouseManager | Constantine Tech | 0123 |
| U011 | Anis Boucetta | FinanceDirector | Tous | 1111 |
| U012 | Rachid Benali | OpsDirector | Tous | 2222 |
| U013 | Farid Khelifi | RegionalManager | Alger + Oran | 3333 |
| U014 | Mourad Ziani | Supervisor | Oran Food | 4444 |
| U016 | Karim Benmoussa | Supplier | Agro Sahel | 1616 |
