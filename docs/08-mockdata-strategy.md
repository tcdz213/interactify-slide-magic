# Phase 8 — Mock Data Generation Strategy

---

> **Objective**: Build a complete, realistic mock dataset that simulates the full lifecycle of the Jawda SaaS platform — from platform owner setup through subscription plans, company onboarding, user creation, warehouse operations, supplier connections, sales cycles, and financial closing.

---

## 1. Strategy Overview

### Principles
1. **Layered insertion**: Data must be created bottom-up respecting foreign key dependencies
2. **Realistic scenarios**: Each tenant simulates a real Algerian distribution business
3. **Cross-role coverage**: Every user role must have actionable data to interact with
4. **Temporal depth**: Historical data spans Jan 2024 → Mar 2026 for BI/trend analysis
5. **Edge cases included**: Overdue invoices, credit holds, blocked vendors, expired lots, QC failures

### Data Insertion Order (Dependency Graph)
```
Layer 0: Platform Owner + Subscription Plans
Layer 1: Tenants (Companies) — Entrepôts & Fournisseurs
Layer 2: Users & Roles (per tenant)
Layer 3: Master Data — Warehouses, Locations, Products, Categories, UoMs, Vendors, Carriers
Layer 4: Connections (Supplier ↔ Warehouse links)
Layer 5: Procurement — Purchase Orders, GRNs, QC Inspections, Putaway
Layer 6: Inventory — Stock levels, Lot/Batch, Serial Numbers, Stock Blocks
Layer 7: Sales — Customers, Sales Orders, Picking, Packing, Shipping
Layer 8: Distribution — Delivery Trips, Stops, Proofs, Cash Collection
Layer 9: Finance — Invoices, Payments, Credit Notes, Quality Claims
Layer 10: Operations — Transfers, Adjustments, Cycle Counts, Cross-Docking, Kitting
Layer 11: Historical Data — 24 months of POs/SOs/Invoices/Payments
Layer 12: BI & Alerts — Computed KPIs, Alert rules, Anomaly thresholds
```

---

## 2. Layer 0 — Platform Owner & Subscription Plans

### 2.1 Platform Owner Profile
| Field | Value |
|-------|-------|
| ID | `OWNER-001` |
| Name | Yacine Bouzid |
| Email | yacine@jawda.dz |
| Phone | +213 555 000 001 |
| Role | PlatformOwner |
| PIN | 999999 |

### 2.2 Subscription Plans

| Plan | Monthly Fee (DZD) | Max Users | Max Warehouses | Features |
|------|-------------------|-----------|----------------|----------|
| **trial** | 0 | 3 | 1 | Basic WMS, 30-day limit |
| **standard** | 25,000 | 10 | 2 | Full WMS, basic reporting |
| **pro** | 55,000 | 25 | 5 | Full WMS + BI, multi-warehouse, connections |
| **enterprise** | 120,000 | Unlimited | Unlimited | Everything + API, custom reports, priority support |

---

## 3. Layer 1 — Tenants (Companies/Organizations)

### 3.1 Entrepôts (Warehouses — 5 tenants)

| ID | Company Name | Sector | City | Plan | Status | Scenario Purpose |
|----|-------------|--------|------|------|--------|-----------------|
| T-ENT-01 | Alger Construction Materials | BTP | Alger | enterprise | active | **Primary tenant** — full data, all roles, all workflows |
| T-ENT-02 | Blida Agro Distribution | Agroalimentaire | Blida | pro | active | Food-specific: HACCP, cold chain, lot/batch, expiry management |
| T-ENT-03 | Boumerdes Electronics Hub | Électronique | Boumerdes | pro | active | Serial numbers, high-value items, warranty tracking |
| T-ENT-04 | Alger General Distribution | Distribution Générale | Alger | standard | active | Smaller operation: tests standard plan limits |
| T-ENT-05 | Blida Construction Supply | BTP | Blida | trial | trial | **Trial tenant** — tests plan limitations, onboarding flow |

### 3.2 Fournisseurs (Suppliers — 3 tenants)

| ID | Company Name | Sector | City | Plan | Status | Scenario Purpose |
|----|-------------|--------|------|------|--------|-----------------|
| T-FRN-01 | Condor Distribution | Électronique/Électroménager | Bordj Bou Arréridj | pro | active | Major supplier — connected to multiple entrepôts |
| T-FRN-02 | Agro Sahel | Agroalimentaire | Béjaïa | standard | active | Food supplier — connected to T-ENT-02 |
| T-FRN-03 | TechParts SARL | Composants Électroniques | Alger | standard | active | Electronics supplier — connected to T-ENT-03 |

---

## 4. Layer 2 — Users & Roles (35 users)

### 4.1 T-ENT-01 — Alger Construction Materials (14 users)

| ID | Name | Role | Warehouse Access | Governance | Scenario |
|----|------|------|-----------------|------------|----------|
| U001 | Ahmed Benali | CEO | all | SYSTEM_ADMIN, MANAGE_USERS, MANAGE_ROLES, SYSTEM_CONFIG, AUDIT_LOG, DATA_EXPORT, EDITION_CONTROL | Full authority, approval >5% |
| U002 | Anis Cherif | FinanceDirector | all | DATA_EXPORT, AUDIT_LOG | Financial oversight, 5% approval |
| U003 | Rachid Hamidi | OpsDirector | all | AUDIT_LOG | Operations oversight, 5% approval |
| U004 | Karim Meziane | WarehouseManager | [wh-alger-construction] | — | Daily warehouse ops, 2% approval |
| U005 | Sara Boudjemaa | QCOfficer | all | — | Quality inspections, claims |
| U006 | Tarek Ouali | Operator | [wh-alger-construction] | — | Picking, packing, receiving |
| U007 | Omar Belkacem | Driver | [wh-alger-construction] | — | Delivery trips, cash collection |
| U008 | Nadia Ferhat | Accountant | all | DATA_EXPORT | Invoicing, payments, 3-way match |
| U009 | Leila Amrani | BIAnalyst | all | DATA_EXPORT | Reporting, dashboards |
| U010 | Farid Benhaddad | RegionalManager | [wh-alger-construction, wh-alger-general] | MANAGE_USERS | Multi-site supervision |
| U011 | Mourad Kaci | Supervisor | [wh-alger-construction] | — | Team lead, floor supervision |
| U012 | Youssef Tabet | Driver | [wh-alger-construction] | — | Second driver — multi-stop scenarios |
| U013 | Amina Slimani | Operator | [wh-alger-construction] | — | Second operator — cycle count scenarios |
| U014 | Sofiane Rahal | Operator | [wh-alger-construction] | — | Third operator — putaway/packing |

### 4.2 T-ENT-02 — Blida Agro Distribution (5 users)

| ID | Name | Role | Warehouse Access | Scenario |
|----|------|------|-----------------|----------|
| U102 | Samir Bouziane | WarehouseManager | [wh-blida-food] | HACCP operations, cold chain |
| U103 | Fatima Zahra | QCOfficer | [wh-blida-food] | Food quality inspections |
| U104 | Bilal Mansouri | Operator | [wh-blida-food] | Receiving, FEFO picking |
| U105 | Mehdi Khelifi | Driver | [wh-blida-food] | Food delivery, temperature logs |
| U106 | Djamel Saidi | CEO | all | CEO for T-ENT-02 |

### 4.3 T-ENT-03 — Boumerdes Electronics Hub (4 users)

| ID | Name | Role | Warehouse Access | Scenario |
|----|------|------|-----------------|----------|
| U202 | Hassan Larbi | WarehouseManager | [wh-boumerdes-tech] | Serial number tracking |
| U203 | Rania Makhlouf | Operator | [wh-boumerdes-tech] | Electronics receiving |
| U204 | Walid Bencheikh | CEO | all | CEO for T-ENT-03 |
| U205 | Samia Djebbar | Accountant | all | Financial ops for T-ENT-03 |

### 4.4 T-ENT-04 — Alger General Distribution (3 users)

| ID | Name | Role | Warehouse Access | Scenario |
|----|------|------|-----------------|----------|
| U301 | Amine Boudaoud | CEO | all | Standard plan CEO |
| U302 | Lyes Hadjadj | WarehouseManager | [wh-alger-general] | General distribution ops |
| U303 | Zineb Attia | Operator | [wh-alger-general] | Basic operations |

### 4.5 T-ENT-05 — Blida Construction Supply (2 users — trial)

| ID | Name | Role | Warehouse Access | Scenario |
|----|------|------|-----------------|----------|
| U401 | Nassim Bouteldja | CEO | all | Trial plan — limited features |
| U402 | Hamza Belkaid | WarehouseManager | [wh-blida-construction] | Trial warehouse ops |

### 4.6 T-FRN-01 — Condor Distribution (3 users)

| ID | Name | Role | Warehouse Access | Scenario |
|----|------|------|-----------------|----------|
| U501 | Redha Condor | Supplier | [wh-condor-main] | Admin supplier — manages connections |
| U502 | Kenza Bensaid | Supplier | [wh-condor-main] | Order processing |
| U503 | Lotfi Mebarki | Supplier | [wh-condor-main] | Delivery coordination |

### 4.7 T-FRN-02 — Agro Sahel (2 users)

| ID | Name | Role | Warehouse Access | Scenario |
|----|------|------|-----------------|----------|
| U601 | Abdelkader Sahli | Supplier | [wh-agro-sahel] | Food supplier admin |
| U602 | Nawal Rouabhi | Supplier | [wh-agro-sahel] | Order management |

### 4.8 T-FRN-03 — TechParts SARL (2 users)

| ID | Name | Role | Warehouse Access | Scenario |
|----|------|------|-----------------|----------|
| U701 | Fayçal Techni | Supplier | [wh-techparts] | Electronics parts supplier |
| U702 | Ikram Rezgui | Supplier | [wh-techparts] | Parts order management |

---

## 5. Layer 3 — Master Data

### 5.1 Warehouses (9 total)

| ID | Tenant | Name | Type | City | Zones | Capacity | Scenario |
|----|--------|------|------|------|-------|----------|----------|
| wh-alger-construction | T-ENT-01 | Entrepôt Alger BTP | construction | Alger | 6 | 10,000 | Main warehouse, full operations |
| wh-blida-food | T-ENT-02 | Entrepôt Blida Agro | food | Blida | 4 | 5,000 | Cold chain, HACCP certified |
| wh-boumerdes-tech | T-ENT-03 | Entrepôt Boumerdes Tech | technology | Boumerdes | 3 | 3,000 | High-value, serial tracking |
| wh-alger-general | T-ENT-04 | Entrepôt Alger Général | general | Alger | 3 | 4,000 | Standard plan warehouse |
| wh-blida-construction | T-ENT-05 | Entrepôt Blida BTP | construction | Blida | 2 | 2,000 | Trial warehouse |
| wh-condor-main | T-FRN-01 | Usine Condor | technology | Bordj Bou Arréridj | 5 | 15,000 | Supplier main facility |
| wh-condor-depot | T-FRN-01 | Dépôt Condor Alger | general | Alger | 2 | 3,000 | Supplier distribution depot |
| wh-agro-sahel | T-FRN-02 | Entrepôt Agro Sahel | food | Béjaïa | 3 | 4,000 | Supplier food storage |
| wh-techparts | T-FRN-03 | Entrepôt TechParts | technology | Alger | 2 | 2,000 | Electronics parts storage |

### 5.2 Warehouse Locations (31 locations)

Each warehouse gets 3-6 locations following the pattern: `{PREFIX}-{ZONE}{AISLE}-{RACK}`
- Alger BTP: ALG-A1-01 through ALG-F1-02 (12 locations: Ambient, Dry)
- Blida Agro: BLD-A1-01 through BLD-D1-02 (8 locations: Chilled, Frozen, Ambient)
- Boumerdes Tech: BMD-A1-01 through BMD-C1-02 (6 locations: Ambient, Dry)
- Alger General: AGN-A1-01 through AGN-C1-01 (3 locations)
- Blida Construction: BLC-A1-01, BLC-A1-02 (2 locations)

### 5.3 Products (57 products across 4 sectors)

#### Construction Materials (16 products — T-ENT-01, T-ENT-05)
| ID | SKU | Name | UoM | Unit Cost | Unit Price |
|----|-----|------|-----|-----------|------------|
| P001 | CONST-001 | Ciment CPJ 42.5 | kg | 12 | 18 |
| P002 | CONST-002 | Acier Rond Ø12 | kg | 95 | 140 |
| P003 | CONST-003 | Brique Rouge 12cm | Pièce | 25 | 38 |
| P004 | CONST-004 | Sable Lavé | m³ | 3,500 | 5,200 |
| P005 | CONST-005 | Gravier 15/25 | m³ | 3,000 | 4,500 |
| P006 | CONST-006 | Tube PVC Ø110 | Pièce | 450 | 680 |
| P007 | CONST-007 | Plaque Placoplatre BA13 | Pièce | 580 | 870 |
| P008 | CONST-008 | Étanchéité Bitumineuse | m² | 320 | 480 |
| P009 | CONST-009 | Peinture Acrylique 15L | Seau | 4,200 | 6,300 |
| P010 | CONST-010 | Carrelage 40x40 | m² | 850 | 1,280 |
| P011 | CONST-011 | Dalle Alvéolaire | Pièce | 2,800 | 4,200 |
| P012 | CONST-012 | Mortier Colle | Sac | 650 | 980 |
| P013 | CONST-013 | Parpaing 20cm | Pièce | 45 | 68 |
| P014 | CONST-014 | Enduit Facade | Sac | 1,200 | 1,800 |
| P015 | CONST-015 | Fer Angle 40x40 | barre | 780 | 1,170 |
| P016 | CONST-016 | Fil de Fer Recuit | kg | 180 | 270 |

#### Agroalimentaire (18 products — T-ENT-02)
| ID | SKU | Name | UoM | Unit Cost | Unit Price |
|----|-----|------|-----|-----------|------------|
| P017 | FOOD-001 | Farine T55 | kg | 45 | 68 |
| P018 | FOOD-002 | Huile de Table 5L | Bidon | 650 | 950 |
| P019 | FOOD-003 | Sucre Blanc | kg | 85 | 125 |
| P020 | FOOD-004 | Lait UHT 1L | Brique | 40 | 60 |
| P021 | FOOD-005 | Semoule Fine | kg | 55 | 82 |
| P022 | FOOD-006 | Concentré de Tomate | Boîte | 95 | 140 |
| P023 | FOOD-007 | Pâtes Alimentaires 500g | Paquet | 55 | 80 |
| P024 | FOOD-008 | Margarine 500g | Plaquette | 120 | 175 |
| P025 | FOOD-009 | Café Moulu 250g | Paquet | 280 | 420 |
| P026 | FOOD-010 | Thé Vert 200g | Boîte | 180 | 270 |
| P027 | FOOD-011 | Eau Minérale 1.5L | Bouteille | 25 | 35 |
| P028 | FOOD-012 | Jus de Fruit 1L | Brique | 85 | 125 |
| P029 | FOOD-013 | Confiture 400g | Pot | 180 | 270 |
| P030 | FOOD-014 | Sardines en Conserve | Boîte | 120 | 180 |
| P031 | FOOD-015 | Biscuits 250g | Paquet | 65 | 95 |
| P032 | FOOD-016 | Levure Boulangère | kg | 350 | 520 |
| P033 | FOOD-017 | Sel Fin 1kg | Paquet | 30 | 45 |
| P034 | FOOD-018 | Vinaigre 1L | Bouteille | 75 | 110 |

#### Électronique/Technologie (16 products — T-ENT-03)
| ID | SKU | Name | UoM | Unit Cost | Unit Price |
|----|-----|------|-----|-----------|------------|
| P035 | TECH-001 | Laptop Condor 15" | Pièce | 65,000 | 89,000 |
| P036 | TECH-002 | Smartphone Condor 6.5" | Pièce | 22,000 | 32,000 |
| P037 | TECH-003 | Tablette 10" | Pièce | 28,000 | 39,000 |
| P038 | TECH-004 | TV LED 43" | Pièce | 45,000 | 62,000 |
| P039 | TECH-005 | Réfrigérateur 350L | Pièce | 58,000 | 79,000 |
| P040 | TECH-006 | Machine à Laver 8kg | Pièce | 42,000 | 58,000 |
| P041 | TECH-007 | Climatiseur Split 12000 BTU | Pièce | 55,000 | 75,000 |
| P042 | TECH-008 | Imprimante Laser | Pièce | 18,000 | 25,000 |
| P043 | TECH-009 | Routeur WiFi | Pièce | 4,500 | 6,800 |
| P044 | TECH-010 | Câble HDMI 3m | Pièce | 350 | 550 |
| P045 | TECH-011 | Batterie Externe 10000mAh | Pièce | 2,200 | 3,500 |
| P046 | TECH-012 | Casque Bluetooth | Pièce | 3,800 | 5,500 |
| P047 | TECH-013 | Souris Sans Fil | Pièce | 1,200 | 1,800 |
| P048 | TECH-014 | Clavier USB | Pièce | 1,800 | 2,700 |
| P049 | TECH-015 | Webcam HD | Pièce | 3,500 | 5,200 |
| P050 | TECH-016 | Disque Dur Externe 1TB | Pièce | 6,500 | 9,500 |

#### Électricité/Logistique (7 products — T-ENT-04)
| ID | SKU | Name | UoM | Unit Cost | Unit Price |
|----|-----|------|-----|-----------|------------|
| P051 | GEN-001 | Palette Bois Standard | Pièce | 1,500 | 2,200 |
| P052 | GEN-002 | Film Étirable 500mm | Rouleau | 650 | 950 |
| P053 | GEN-003 | Carton Ondulé 60x40 | Pièce | 120 | 180 |
| P054 | GEN-004 | Scotch Emballage 48mm | Rouleau | 85 | 130 |
| P055 | GEN-005 | Sac Tissé 50kg | Pièce | 45 | 70 |
| P056 | GEN-006 | Étiquette Thermique | Rouleau | 350 | 520 |
| P057 | GEN-007 | Gants de Manutention | Paire | 180 | 280 |

### 5.4 Vendors (8 vendors)

| ID | Name | City | Sector | Status | Currency | Linked Supplier Tenant |
|----|------|------|--------|--------|----------|----------------------|
| V001 | GICA Ciment | Alger | BTP | Active | DZD | — |
| V002 | ArcelorMittal Annaba | Annaba | BTP/Sidérurgie | Active | EUR | — |
| V003 | SEROR Céramique | Sétif | BTP/Céramique | Active | DZD | — |
| V004 | Cevital Agroalimentaire | Béjaïa | Agroalimentaire | Active | DZD | — |
| V005 | SIM Blida | Blida | Boissons | Active | DZD | — |
| V006 | Ifri | Tizi Ouzou | Boissons | Active | DZD | — |
| V007 | Condor Electronics | Bordj Bou Arréridj | Électronique | Active | DZD | T-FRN-01 |
| V008 | Iris Sat | Sétif | Électronique | On Hold | DZD | — |

### 5.5 Customers (20 customers)

| ID Range | Type | Zone | Tenant | Count |
|----------|------|------|--------|-------|
| C001-C008 | Détaillant/Grossiste/Demi-Grossiste | Alger, Blida, Tipaza | T-ENT-01 | 8 |
| C009-C014 | Grossiste/Détaillant | Blida, Médéa, Chlef | T-ENT-02 | 6 |
| C015-C018 | Grande Surface/Détaillant | Boumerdes, Tizi Ouzou | T-ENT-03 | 4 |
| C019-C020 | Détaillant | Alger | T-ENT-04 | 2 |

### 5.6 Product Categories & Subcategories

| Sector | Categories | SubCategories |
|--------|-----------|---------------|
| BTP | Gros Œuvre, Second Œuvre, Finitions | Béton, Acier, Maçonnerie, Plomberie, Peinture, Revêtement |
| Agroalimentaire | Céréales & Farines, Corps Gras, Boissons, Conserves, Produits Laitiers, Épicerie | Farine, Semoule, Huile, Margarine, Eaux, Jus, etc. |
| Électronique | Informatique, Téléphonie, Électroménager, Accessoires | Laptops, Smartphones, Réfrigération, Audio, etc. |
| Logistique | Emballage, Manutention | Palettes, Films, Cartons, etc. |

### 5.7 Units of Measure (15 UoMs)

| ID | Name | Abbreviation | Kind |
|----|------|-------------|------|
| UOM-KG | Kilogramme | kg | Weight |
| UOM-T | Tonne | T | Weight |
| UOM-L | Litre | L | Volume |
| UOM-M3 | Mètre Cube | m³ | Volume |
| UOM-M2 | Mètre Carré | m² | Area |
| UOM-ML | Mètre Linéaire | ml | Length |
| UOM-PC | Pièce | Pce | Piece |
| UOM-SAC | Sac | Sac | Packaging |
| UOM-PLT | Palette | Plt | Packaging |
| UOM-CTN | Carton | Ctn | Packaging |
| UOM-BDN | Bidon | Bdn | Packaging |
| UOM-BTE | Boîte | Bte | Packaging |
| UOM-RLX | Rouleau | Rlx | Packaging |
| UOM-SEA | Seau | Seau | Packaging |
| UOM-PAR | Paire | Paire | Count |

### 5.8 Carriers (4 carriers)

| ID | Name | Vehicles | Coverage |
|----|------|----------|----------|
| CAR-001 | Trans Express Alger | 12 | Alger, Blida, Tipaza, Boumerdes |
| CAR-002 | Sahel Logistics | 8 | Blida, Médéa, Chlef |
| CAR-003 | Algérie Fret | 15 | National |
| CAR-004 | Express Kabylie | 6 | Tizi Ouzou, Béjaïa, Bouira |

---

## 6. Layer 4 — Supplier-Warehouse Connections (12 connections)

| ID | Supplier | Warehouse | Status | Initiated By | Scenario |
|----|----------|-----------|--------|-------------|----------|
| CONN-001 | T-FRN-01 (Condor) | wh-alger-construction (T-ENT-01) | CONNECTED | SUPPLIER | Electronics supplier → BTP warehouse |
| CONN-002 | T-FRN-01 (Condor) | wh-boumerdes-tech (T-ENT-03) | CONNECTED | WAREHOUSE | Main tech supplier connection |
| CONN-003 | T-FRN-02 (Agro Sahel) | wh-blida-food (T-ENT-02) | CONNECTED | SUPPLIER | Food supply chain |
| CONN-004 | T-FRN-03 (TechParts) | wh-boumerdes-tech (T-ENT-03) | CONNECTED | WAREHOUSE | Components supply |
| CONN-005 | T-FRN-01 (Condor) | wh-alger-general (T-ENT-04) | PENDING | SUPPLIER | Pending — tests approval flow |
| CONN-006 | T-FRN-02 (Agro Sahel) | wh-alger-construction (T-ENT-01) | REJECTED | WAREHOUSE | Rejected — tests rejection flow |
| CONN-007 | T-FRN-03 (TechParts) | wh-alger-general (T-ENT-04) | PENDING | WAREHOUSE | Pending — tests supplier-side approval |
| CONN-008 | T-FRN-01 (Condor) | wh-blida-food (T-ENT-02) | CONNECTED | SUPPLIER | Cross-sector connection |
| CONN-009 | T-FRN-02 (Agro Sahel) | wh-alger-general (T-ENT-04) | CONNECTED | SUPPLIER | Food→General distribution |
| CONN-010 | T-FRN-01 (Condor) | wh-blida-construction (T-ENT-05) | BLOCKED | WAREHOUSE | Blocked — tests blocked state |
| CONN-011 | T-FRN-03 (TechParts) | wh-alger-construction (T-ENT-01) | CONNECTED | SUPPLIER | Tech parts for BTP |
| CONN-012 | T-FRN-02 (Agro Sahel) | wh-boumerdes-tech (T-ENT-03) | PENDING | SUPPLIER | Cross-sector pending |

---

## 7. Layer 5-10 — Transactional Data Scenarios

### 7.1 Procurement Scenarios (Layer 5)

| # | Scenario | Tenant | Status | Purpose |
|---|----------|--------|--------|---------|
| PO-01 | Standard PO → full GRN → approved | T-ENT-01 | Received | Happy path: complete procurement cycle |
| PO-02 | Multi-line PO → partial GRN | T-ENT-01 | Partially_Received | Partial delivery handling |
| PO-03 | PO with QC failure → rejected items | T-ENT-02 | Confirmed | QC rejection and return flow |
| PO-04 | PO with unit conversion (kg→Sac→Palette) | T-ENT-01 | Received | Unit conversion validation |
| PO-05 | PO from foreign currency vendor (EUR) | T-ENT-01 | Sent | FX conversion testing |
| PO-06 | PO cancelled after sending | T-ENT-01 | Cancelled | Cancellation workflow |
| PO-07 | PO from connected supplier (Condor) | T-ENT-03 | Confirmed | Supplier connection flow |
| PO-08 | Urgent PO — same-day delivery | T-ENT-02 | Draft | Draft state handling |
| PO-09 | PO with variance >5% on GRN | T-ENT-01 | Received | Escalated approval (DG level) |
| PO-10 | Large PO — 15+ lines | T-ENT-01 | Sent | Performance with many lines |
| PO-11 to PO-20 | Additional current POs | Mixed | Various | Coverage for dashboard KPIs |

### 7.2 Inventory & Stock Scenarios (Layer 6)

| # | Scenario | Tenant | Purpose |
|---|----------|--------|---------|
| INV-01 | Normal stock levels | All | Baseline inventory |
| INV-02 | Below reorder point | T-ENT-01 | Low stock alerts |
| INV-03 | Near-expiry lots (FEFO) | T-ENT-02 | Expiry management |
| INV-04 | Blocked stock (quality hold) | T-ENT-02 | Stock block flow |
| INV-05 | Reserved stock (for sales orders) | T-ENT-01 | Reservation system |
| INV-06 | In-transit stock (transfer) | T-ENT-01→T-ENT-04 | Transfer tracking |
| INV-07 | Zero stock items | T-ENT-03 | Out-of-stock handling |
| INV-08 | Serial-tracked items | T-ENT-03 | Serial number lifecycle |
| INV-09 | Multi-batch same product | T-ENT-02 | FIFO/FEFO allocation |
| INV-10 | Overstock items | T-ENT-01 | Excess inventory alerts |

### 7.3 Sales Scenarios (Layer 7)

| # | Scenario | Tenant | Status | Purpose |
|---|----------|--------|--------|---------|
| SO-01 | Standard sale → picked → shipped → delivered → invoiced → paid | T-ENT-01 | Invoiced | Complete sales cycle |
| SO-02 | Sale with credit hold | T-ENT-01 | Credit_Hold | Credit limit enforcement |
| SO-03 | Sale from mobile app (offline) | T-ENT-01 | Approved | Mobile order flow |
| SO-04 | Partial delivery | T-ENT-02 | Shipped | Split delivery |
| SO-05 | Sale with discount (5%) | T-ENT-01 | Delivered | Discount pricing |
| SO-06 | Sale cancelled by customer | T-ENT-01 | Cancelled | Cancellation flow |
| SO-07 | Sale from client portal | T-ENT-03 | Picking | Portal order flow |
| SO-08 | Multi-warehouse sale | T-ENT-01 | Packed | Cross-warehouse picking |
| SO-09 | Sale with return | T-ENT-01 | Delivered | Return flow trigger |
| SO-10 | High-value sale (>1M DZD) | T-ENT-03 | Approved | Approval threshold |

### 7.4 Distribution Scenarios (Layer 8)

| # | Scenario | Driver | Stops | Purpose |
|---|----------|--------|-------|---------|
| TRIP-01 | Full day — 6 stops, all delivered | U007 (Omar) | 6 | Complete trip |
| TRIP-02 | Partial day — 2/4 stops done, 2 pending | U012 (Youssef) | 4 | In-progress trip |
| TRIP-03 | Trip with incident (customer absent) | U007 | 5 | Incident reporting |
| TRIP-04 | Cash collection trip | U105 (Mehdi) | 3 | Cash handling |
| TRIP-05 | Trip with vehicle issue | U007 | 4 | Vehicle check failure |

### 7.5 Finance Scenarios (Layer 9)

| # | Scenario | Purpose |
|---|----------|---------|
| INV-F01 | Paid invoice — full payment | Happy path |
| INV-F02 | Partially paid invoice | Partial payment tracking |
| INV-F03 | Overdue invoice (>30 days) | Overdue alerts, aging |
| INV-F04 | Disputed invoice | Dispute resolution flow |
| INV-F05 | Credit note from return | Return→Credit note flow |
| INV-F06 | Credit note from quality claim | Quality→Credit note flow |
| PAY-01 | Cash payment | Cash collection |
| PAY-02 | Bank transfer (virement) | Wire transfer flow |
| PAY-03 | Cheque payment | Cheque tracking |
| PAY-04 | Mobile payment | Digital payment |

### 7.6 Operations Scenarios (Layer 10)

| # | Scenario | Purpose |
|---|----------|---------|
| TRF-01 | Transfer Alger→Alger General — completed | Intra-city transfer |
| TRF-02 | Transfer Blida→Alger — in transit | Cross-city transit |
| TRF-03 | Transfer cancelled — insufficient stock | Validation failure |
| ADJ-01 | Stock increase — found during count | Positive adjustment |
| ADJ-02 | Stock decrease — damaged goods | Negative adjustment (needs approval) |
| CC-01 | Cycle count — zone A — no variance | Clean count |
| CC-02 | Cycle count — zone B — 1.5% variance | Manager approval required |
| CC-03 | Cycle count — zone C — 8% variance | DG escalation required |
| XD-01 | Cross-dock — direct PO→SO | Cross-docking flow |
| KIT-01 | Kit assembly — laptop bundle | Kitting flow |

---

## 8. Layer 11 — Historical Data (Jan 2024 → Nov 2025)

### Seasonal Patterns

| Month Range | Construction (T-ENT-01) | Agroalimentaire (T-ENT-02) | Électronique (T-ENT-03) |
|------------|------------------------|---------------------------|------------------------|
| Jan-Feb | Low season (winter) | Baseline | Low season |
| Mar | Ramp-up | **Ramadan spike** (2024 & 2025) | Baseline |
| Apr-Jun | **Peak BTP season** | Post-Ramadan normal | Baseline |
| Jul-Aug | Peak continues | Summer baseline | **Back-to-school ramp** |
| Sep | Peak | Baseline | **Peak (rentrée)** |
| Oct | Slowdown | Baseline | Baseline |
| Nov-Dec | Low season | **Year-end spike** | **Year-end peak** |

### Historical Volume Targets

| Entity | Monthly Count (low) | Monthly Count (peak) | Total (24 months) |
|--------|--------------------|--------------------|-------------------|
| Purchase Orders | 3-5 | 8-12 | ~180 |
| Sales Orders | 5-8 | 15-25 | ~350 |
| Invoices | 4-7 | 12-20 | ~280 |
| Payments | 3-6 | 10-18 | ~250 |
| GRNs | 2-4 | 6-10 | ~140 |

---

## 9. Layer 12 — Owner Portal / SaaS KPIs

### 9.1 Owner SaaS KPIs (computed from tenant data)

| KPI | Value | Source |
|-----|-------|--------|
| MRR | 280,000 DZD | Sum of monthly fees (2×55K + 2×25K + 1×120K) |
| MRR Growth | +8.5% | New subscriber T-ENT-05 (trial) |
| Total Subscribers | 8 | 5 entrepôts + 3 fournisseurs |
| Active Subscribers | 7 | Excluding T-ENT-05 (trial) |
| Churn Rate | 0% | No cancellations |
| ARPU | 35,000 DZD | MRR / active subscribers |
| Platform GMV | 45,000,000 DZD | Total transaction value across platform |
| Open Tickets | 3 | Active support tickets |

### 9.2 MRR History (12 months)

Monthly progression showing organic growth from 4 subscribers to 8.

### 9.3 Subscription Invoices

One invoice per subscriber per month (last 3 months = 24 invoices).

### 9.4 Onboarding Requests

| ID | Company | Status | Purpose |
|----|---------|--------|---------|
| ONB-001 | Oran Maritime Supplies | pending | Tests pending onboarding |
| ONB-002 | Constantine Auto Parts | approved | Tests approved→setup flow |
| ONB-003 | Setif Textile Co. | rejected | Tests rejection reason |

### 9.5 Support Tickets

| ID | Subscriber | Priority | Status | Category |
|----|-----------|----------|--------|----------|
| TKT-001 | T-ENT-02 | high | open | Billing |
| TKT-002 | T-FRN-01 | medium | in_progress | Technical |
| TKT-003 | T-ENT-04 | low | open | Feature Request |
| TKT-004 | T-ENT-01 | critical | resolved | Data Issue |
| TKT-005 | T-FRN-03 | medium | closed | Onboarding |

---

## 10. Scenario Coverage Matrix

### 10.1 Documented Flows vs Mock Data Coverage

| Flow (from docs/04) | Covered by Mock Data? | Gap? |
|---------------------|----------------------|------|
| 1.1 CEO Morning Overview | ✅ Full data for dashboard KPIs | — |
| 1.2 Approve High-Variance Cycle Count | ✅ CC-03 (8% variance) | — |
| 1.3 Review Supplier Performance | ✅ Vendor scorecard data | — |
| 1.4 User & Access Management | ✅ 35 users across roles | — |
| 1.5 Financial Review | ✅ Invoices, payments, profitability | — |
| 2.1 Invoice Generation | ✅ SO-01 (delivered→invoiced) | — |
| 2.2 Record Payment | ✅ PAY-01 to PAY-04 | — |
| 2.3 3-Way Match Exception | ✅ PO-09 (variance >5%) | — |
| 2.4 FX Gain/Loss | ✅ PO-05 (EUR vendor) | — |
| 2.5 GRNI Report | ✅ PO-02 (partial GRN, no invoice yet) | — |
| 3.1 Create PO | ✅ PO-01 to PO-10 | — |
| 3.2 Receive Goods (GRN) | ✅ GRN from PO-01, PO-02, PO-04 | — |
| 3.3 Inter-Warehouse Transfer | ✅ TRF-01, TRF-02, TRF-03 | — |
| 3.4 Manage Supplier Connections | ✅ CONN-001 to CONN-012 | — |
| 3.5 Review Incoming Connections | ✅ CONN-005, CONN-007 (PENDING) | — |
| 4.1 Daily Operations Check | ✅ INV-02 (low stock) | — |
| 4.2 Cycle Count Execution | ✅ CC-01 to CC-03 | — |
| 4.3 Putaway Management | ✅ Putaway tasks from GRNs | — |
| 4.4 Stock Adjustment | ✅ ADJ-01, ADJ-02 | — |
| 5.1 QC Inspection on GRN | ✅ PO-03 (QC failure) | — |
| 5.2 Quality Claim Investigation | ✅ INV-F06 + quality claims | — |
| 5.3 Stock Block | ✅ INV-04 (blocked stock) | — |
| 6.1 Picking Execution | ✅ SO-01 (picking state) | — |
| 6.2 Packing & Shipping | ✅ SO-08 (packed), SO-04 (shipped) | — |
| 6.3 Task Queue | ⚠️ Partial — no task queue mock | **GAP**: Add task queue data |
| 7.1 Complete Delivery Day | ✅ TRIP-01 | — |
| 7.2 Report Incident | ✅ TRIP-03 (incident) | — |
| 7.3 View Route Map | ✅ GPS coordinates on customers | — |
| 8.1 Field Sales Day | ✅ Sales agents + customer data | — |
| 8.2 Offline Order Submission | ✅ SO-03 (mobile/offline) | — |
| 8.3 Route Navigation | ✅ Customer geo data | — |
| 9.1 Supplier Manage Connections | ✅ CONN-001 to CONN-012 | — |
| 9.2 Accept Incoming Connection | ✅ CONN-005, CONN-007 | — |
| 9.3 Process Incoming PO | ✅ PO-07 (from connected supplier) | — |
| 9.4 Track Fulfillment | ⚠️ Partial — no supplier-side status | **GAP**: Add supplier fulfillment statuses |
| 9.5 View Performance Metrics | ✅ Vendor scorecard data | — |
| 10.1 Portal: Place Order | ✅ SO-07 (portal order) | — |
| 10.2 Portal: Track Order | ✅ Multiple SO statuses | — |
| 10.3 Portal: View & Pay Invoices | ✅ Invoice/payment data | — |
| 10.4 Portal: Request Return | ✅ SO-09 (sale with return) | — |
| 11.1 Owner: Manage Subscriptions | ✅ 8 subscribers with plans | — |
| 11.2 Owner: Onboard New Tenant | ✅ ONB-001 to ONB-003 | — |
| 11.3 Owner: Monitor System | ⚠️ Partial — no system metrics mock | **GAP**: Add system health metrics |
| 11.4 Owner: Support Tickets | ✅ TKT-001 to TKT-005 | — |
| 12.1 Complete Procurement Cycle | ✅ PO-01 (end-to-end) | — |
| 12.2 Complete Sales Cycle | ✅ SO-01 (end-to-end) | — |
| 12.3 Supplier-Warehouse Connection + First PO | ✅ CONN-002 + PO-07 | — |
| 12.4 Return & Credit Note | ✅ SO-09 + INV-F05 | — |
| 12.5 Multi-WMS Cross-Routing | ⚠️ Partial — IncomingPO types exist but no mock data | **GAP**: Add IncomingPO mock records |

### 10.2 Identified Gaps (Not in Documentation)

| # | Missing Scenario | Impact | Priority | Action |
|---|-----------------|--------|----------|--------|
| GAP-01 | Task queue data (picking/putaway/counting tasks) | TaskQueuePage empty | High | Add 10-15 task records |
| GAP-02 | Supplier fulfillment status tracking (PREPARING→SHIPPED) | Supplier portal incomplete | High | Add supplier-side PO states |
| GAP-03 | System health metrics (CPU, memory, errors) | Owner monitoring empty | Medium | Add monitoring mock data |
| GAP-04 | IncomingPO records for Multi-WMS routing | Cross-instance flow untested | High | Add 5+ IncomingPO records |
| GAP-05 | Replenishment rules data | ReplenishmentRulesPage empty | Medium | Add rule configurations |
| GAP-06 | Reservation records (linked to SO lines) | Reservation system untested | Medium | Add reservation data |
| GAP-07 | Dock scheduling data (time slots) | YardDockPage scheduling empty | Low | Add schedule data |
| GAP-08 | Import job history | IntegrationsPage import tab empty | Low | Add sample import records |
| GAP-09 | Approval workflow configurations | ApprovalWorkflowsPage empty | Medium | Add workflow rules |
| GAP-10 | Budget & cost center data | BudgetCostCentersPage empty | Medium | Add budget allocations |
| GAP-11 | Bank reconciliation records | BankReconciliationPage empty | Medium | Add bank statement data |
| GAP-12 | Chart of accounts data | ChartOfAccountsPage empty | Medium | Add account hierarchy |
| GAP-13 | Sales agent route plans and visit logs | RoutePlanPage partial data | Medium | Add complete route data |
| GAP-14 | Wave picking data | WavesPage empty | Low | Add wave groupings |
| GAP-15 | Mobile offline queue data | OfflineQueueScreen has no pending items | Low | Add offline queue records |

---

## 11. Implementation Plan — Step-by-Step

### Phase A: Foundation Data (Priority: Critical)
**Files to populate**: `userData.ts`, `tenants.ts`, `masterData.ts`

1. Populate `tenants` array (8 records)
2. Populate `users` array (35 records)
3. Populate `products` array (57 records)
4. Populate `vendors` array (8 records)
5. Populate `warehouses` array (9 records)
6. Populate `warehouseLocations` array (31 records)
7. Populate `sectors`, `productCategories`, `subCategories`
8. Populate `unitsOfMeasure` (15 records)
9. Populate `carriers` (4 records)
10. Populate `paymentTerms` (6 records)

### Phase B: Transactional Data (Priority: Critical)
**Files to populate**: `transactionalData.ts`, `connectionData.ts`, `productUnitConversions.ts`

1. Populate `connections` and `connectionNotifications` (12 + 5 records)
2. Populate `purchaseOrders` with lines (20 current records)
3. Populate `grns` with lines (15 records)
4. Populate `customers` (20 records)
5. Populate `salesOrders` with lines (15 current records)
6. Populate `inventory` (80+ records)
7. Populate `invoices` (12 records)
8. Populate `payments` (10 records)
9. Populate `deliveryTrips` with stops (5 records)
10. Populate `returns` (4 records)
11. Populate `creditNotes` (3 records)
12. Populate `qualityClaims` (3 records)
13. Populate `alerts` (15 records)
14. Populate `stockAdjustments` (4 records)
15. Populate `stockTransfers` (3 records)
16. Populate `cycleCounts` with lines (3 records)
17. Populate `productUnitConversions` (80+ records)
18. Populate `barcodes` (30+ records)

### Phase C: Operational Data (Priority: High)
**Files to populate**: `operationalData.ts`

1. Populate `qcInspections` with lines (6 records)
2. Populate `putawayTasks` (8 records)
3. Populate `stockMovements` (30+ records)
4. Populate `crossDocks` (2 records)
5. Populate `kitRecipes` + `kitOrders` (2+2 records)
6. Populate `stockBlocks` (3 records)
7. Populate `repackOrders` (2 records)
8. Populate `lotBatches` (15 records)
9. Populate `serialNumbers` (20 records)

### Phase D: Historical Data (Priority: High)
**Files to populate**: `historicalData.ts`

1. Generate historicalPOs (180 records with seasonal patterns)
2. Generate historicalSOs (350 records)
3. Generate historicalInvoices (280 records)
4. Generate historicalPayments (250 records)
5. Generate historicalGrns (140 records)
6. Generate historicalCycleCounts (24 records — 1/month)

### Phase E: Portal & Owner Data (Priority: Medium)
**Files to populate**: `mockOwnerData.ts`, `salesAgentsData.ts`, mobile/portal/delivery mock data

1. Populate `OWNER_PROFILE`
2. Populate `subscribers` + `supplierSubscribers`
3. Populate `ownerSaaSKpis` (computed)
4. Populate `mrrHistory` (12 points)
5. Populate `planDistribution` (4 records)
6. Populate `subscriptionInvoices` (24 records)
7. Populate `onboardingRequests` (3 records)
8. Populate `supportTickets` (5 records)
9. Populate `ownerAlerts` (5 records)
10. Populate sales agents and route plans

### Phase F: Gap Filling (Priority: Medium)
**New data needed for identified gaps**

1. Add IncomingPO records (GAP-04)
2. Add task queue records (GAP-01)
3. Add supplier fulfillment statuses (GAP-02)
4. Add system health metrics (GAP-03)
5. Add replenishment rules (GAP-05)
6. Add approval workflow configs (GAP-09)
7. Add budget/cost center data (GAP-10)
8. Add bank reconciliation data (GAP-11)
9. Add chart of accounts (GAP-12)
10. Add remaining gaps (GAP-06 to GAP-15)

### Phase G: Test Suite Updates (Priority: High)

1. Update `testUsers.ts` fixtures to match new user IDs
2. Run all 47 test files — fix any broken assertions
3. Add new tests for gap scenarios
4. Verify data integrity test (`mock-data.test.ts`) passes

---

## 12. Data Generation Rules

### ID Conventions
| Entity | Pattern | Example |
|--------|---------|---------|
| Tenant | `T-ENT-{NN}` / `T-FRN-{NN}` | T-ENT-01, T-FRN-02 |
| User | `U{NNN}` | U001, U102, U501 |
| Product | `P{NNN}` | P001, P057 |
| Vendor | `V{NNN}` | V001, V008 |
| Warehouse | `wh-{city}-{type}` | wh-alger-construction |
| Location | `{PREFIX}-{ZONE}{AISLE}-{RACK}` | ALG-A1-01 |
| PO | `PO-{YYYY}-{NNNN}` | PO-2026-0101 |
| GRN | `GRN-{YYYYMMDD}-{NNN}` | GRN-20260213-001 |
| SO | `ORD-{YYYYMMDD}-{NNN}` | ORD-20260220-001 |
| Invoice | `INV-{YYYYMMDD}-{NNN}` | INV-20260225-001 |
| Connection | `CONN-{NNN}` | CONN-001 |

### Financial Rules
- Currency: DZD (Algerian Dinar)
- Tax rate: 19% TVA
- FX rates: EUR = 146.30 DZD, USD = 134.60 DZD
- Credit limits: 500K–5M DZD per customer
- Payment terms: Comptant, Net 15, Net 30, Net 45, Net 60

### Date Ranges
- Current data: Dec 2025 → Mar 2026
- Historical data: Jan 2024 → Nov 2025
- Timestamps: ISO 8601 format

---

## 13. Validation Checklist

After all data is populated, verify:

- [ ] Every PO references a valid vendor and delivery warehouse
- [ ] Every GRN references a valid PO
- [ ] Every SO references valid customers and products
- [ ] Every invoice references a valid SO
- [ ] Every payment references a valid invoice
- [ ] All user `tenantId` values exist in tenants array
- [ ] All user `assignedWarehouseIds` reference valid warehouses
- [ ] All inventory items reference valid products and warehouses
- [ ] All connections reference valid supplier/warehouse tenants
- [ ] Product categories → subcategories → products chain is consistent
- [ ] Unit conversions reference valid products and UoMs
- [ ] Historical data follows seasonal patterns
- [ ] Owner KPIs match computed values from subscriber data
- [ ] Barcodes reference valid products
- [ ] Serial numbers reference valid products with `productType: "Storable"`
- [ ] Lot/batch records reference valid products with expiry dates
- [ ] Credit used ≤ credit limit for non-Credit_Hold customers
- [ ] All test fixtures in `testUsers.ts` resolve correctly

---

*✅ Phase 8 — Mock Data Strategy complete. Ready for implementation.*
