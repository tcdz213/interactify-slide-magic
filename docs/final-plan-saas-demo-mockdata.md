# 🎯 PLAN FINAL — Restructuration Mock Data SaaS Multi-Tenant

> **Version** : 1.0 — Mars 2026  
> **Objectif** : Transformer les mock data actuels en un environnement SaaS réaliste avec plusieurs entreprises indépendantes, chacune ayant son propre CEO, staff, produits, entrepôts — toutes liées comme abonnés dans le Owner Dashboard.

---

## 1. Problème Actuel

### Ce qui ne va pas :
| Problème | Détail |
|----------|--------|
| **Un seul tenant "Jawda"** | Tous les users (U001–U014) appartiennent à `company: "Jawda"` |
| **Pas d'isolation réelle** | Les produits, PO, SO, GRN sont partagés — pas de `tenant_id` |
| **Owner déconnecté du WMS** | Les subscribers du Owner Dashboard (`SUB-E001`...) n'existent pas dans le WMS |
| **Un seul CEO** | Ahmed Mansour (U001) gère tout — pas de multi-CEO |
| **Fournisseurs incomplets** | Agro Sahel a 4 users mais pas de données métier propres |
| **Clients non isolés** | Les `customers` du WMS ne sont pas rattachés à un entrepôt spécifique |

### Fichiers à remplacer :
```
src/data/userData.ts           → 20 users (1 tenant)
src/data/masterData.ts         → produits, warehouses, vendors (1 tenant)
src/data/transactionalData.ts  → PO, SO, GRN, invoices (1 tenant)
src/data/operationalData.ts    → QC, putaway, movements (1 tenant)
src/data/historicalData.ts     → historique (1 tenant)
src/owner/data/mockOwnerData.ts → subscribers (déconnectés du WMS)
src/mobile/data/mockSalesData.ts → commercial mobile (1 tenant)
src/delivery/data/mockDeliveryData.ts → chauffeur (1 tenant)
src/portal/data/mockPortalData.ts → portail client (1 tenant)
src/supplier/data/mockSupplierData.ts → portail fournisseur (1 tenant)
```

---

## 2. Architecture Cible — 4 Entreprises + 5 Fournisseurs

### 2.1 Entreprises Abonnées (Entrepôts)

| ID | Nom | Secteur | Ville | Plan | CEO | Entrepôts | Users |
|----|-----|---------|-------|------|-----|-----------|-------|
| `T-ENT-01` | **Bennet Eddar** | Agroalimentaire | Alger | Enterprise | Youssef Khelifi | 2 (Alger, Oran) | 14 |
| `T-ENT-02` | **Atlas BTP Distribution** | Construction/BTP | Constantine | Pro | Nabil Boumediene | 1 (Constantine) | 8 |
| `T-ENT-03` | **TechnoLog Algérie** | Électronique/Tech | Oran | Pro | Samira Hadj | 1 (Oran) | 8 |
| `T-ENT-04` | **Sahara Express** | Distribution générale | Ghardaia | Standard | Omar Touati | 1 (Ghardaia) | 5 |

### 2.2 Fournisseurs Abonnés (avec WMS propre)

| ID | Nom | Secteur | Ville | Plan | CEO |
|----|-----|---------|-------|------|-----|
| `T-FRN-01` | **Agro Sahel Distribution** | Agroalimentaire | Alger | Pro | Karim Benmoussa |
| `T-FRN-02` | **Céramique Atlas** | Matériaux | Ghardaia | Pro | Youcef Krim |
| `T-FRN-03` | **TechParts Algérie** | Électronique | Constantine | Standard | Farid Meddour |

### 2.3 Fournisseurs Externes (portail léger uniquement)

| ID | Nom | Secteur | Portail |
|----|-----|---------|---------|
| `T-EXT-01` | **Laiterie du Tell** | Laitier | `/supplier/*` |
| `T-EXT-02` | **Dattes El Oued Premium** | Agroalimentaire | `/supplier/*` |

### 2.4 PlatformOwner

| ID | Nom | Email |
|----|-----|-------|
| `T-OWN-01` | **Yacine Hadj-Ali** | yacine@jawda.dz |

---

## 3. Structure des Données par Tenant

### 3.1 Schéma `tenant_id` — Ajout systématique

Chaque entité aura un champ `tenantId: string` :

```typescript
// Nouveau champ sur TOUTES les entités
interface TenantScoped {
  tenantId: string; // "T-ENT-01", "T-FRN-01", etc.
}

// Exemples :
interface Product extends TenantScoped { id: string; name: string; ... }
interface PurchaseOrder extends TenantScoped { id: string; ... }
interface User extends TenantScoped { id: string; ... }
interface Warehouse extends TenantScoped { id: string; ... }
```

### 3.2 Helper de filtrage (simule RLS)

```typescript
// src/lib/tenantFilter.ts
export function filterByTenant<T extends { tenantId: string }>(
  items: T[], 
  tenantId: string
): T[] {
  return items.filter(item => item.tenantId === tenantId);
}

export function getCurrentTenantId(): string {
  // Basé sur l'utilisateur connecté
  const user = getCurrentUser();
  return user?.tenantId ?? "T-ENT-01";
}
```

---

## 4. Données Détaillées par Entreprise

### 4.1 🏭 Bennet Eddar (T-ENT-01) — Agroalimentaire

**Entrepôts :**
| ID | Nom | Ville | Type | Capacité |
|----|-----|-------|------|----------|
| `wh-be-alger` | Entrepôt Central Alger | Alger | Distribution | 15,000 m² |
| `wh-be-oran` | Dépôt Oran Ouest | Oran | Régional | 5,000 m² |

**Users (14) :**
| ID | Nom | Rôle | Entrepôt |
|----|-----|------|----------|
| `BE-U01` | Youssef Khelifi | CEO | all |
| `BE-U02` | Anis Boucetta | FinanceDirector | all |
| `BE-U03` | Rachid Benali | OpsDirector | all |
| `BE-U04` | Farid Khelifi | RegionalManager | alger + oran |
| `BE-U05` | Karim Ben Ali | WarehouseManager | alger |
| `BE-U06` | Samir Rafik | WarehouseManager | oran |
| `BE-U07` | Sara Khalil | QCOfficer | all |
| `BE-U08` | Nadia Salim | Accountant | all |
| `BE-U09` | Leila Rached | BIAnalyst | all |
| `BE-U10` | Mourad Ziani | Supervisor | oran |
| `BE-U11` | Tarek Daoui | Operator | alger |
| `BE-U12` | Hamza Mekki | Operator | oran |
| `BE-U13` | Omar Fadel | Driver | oran |
| `BE-U14` | Youssef Hamdi | Driver | alger |

**Produits (12) :** Farine, huile, sucre, pâtes, riz, conserves, lait, café, eau, sardines, semoule, thé  
**Clients (8) :** Café Central, Market Express, Épicerie Nord, Superette El Baraka, Boulangerie Sami, Restaurant El Djazair, Mini Market Soltane, Pâtisserie Rania  
**Fournisseurs liés :** Agro Sahel, Laiterie du Tell, Dattes El Oued  

---

### 4.2 🏗️ Atlas BTP Distribution (T-ENT-02) — Construction

**Entrepôts :**
| ID | Nom | Ville | Type |
|----|-----|-------|------|
| `wh-ab-constantine` | Dépôt BTP Constantine | Constantine | Central |

**Users (8) :**
| ID | Nom | Rôle |
|----|-----|------|
| `AB-U01` | Nabil Boumediene | CEO |
| `AB-U02` | Fatima Zerhouni | FinanceDirector |
| `AB-U03` | Khaled Messaoud | OpsDirector |
| `AB-U04` | Redouane Hafsi | WarehouseManager |
| `AB-U05` | Djamila Bencheikh | QCOfficer |
| `AB-U06` | Hocine Amrani | Supervisor |
| `AB-U07` | Slimane Guendouz | Operator |
| `AB-U08` | Adel Kouri | Driver |

**Produits (10) :** Ciment Portland, barres acier, briques, gravier, sable, tubes PVC, câbles électriques, peinture, plâtre, carrelage  
**Clients (6) :** Entreprise Bâtiment Est, Promoteur Immobilier X, Artisan Plomberie Y...  
**Fournisseurs liés :** Céramique Atlas  

---

### 4.3 💻 TechnoLog Algérie (T-ENT-03) — Électronique

**Entrepôts :**
| ID | Nom | Ville | Type |
|----|-----|-------|------|
| `wh-tl-oran` | Hub Tech Oran | Oran | Haute sécurité |

**Users (8) :**
| ID | Nom | Rôle |
|----|-----|------|
| `TL-U01` | Samira Hadj | CEO |
| `TL-U02` | Sofiane Belkacem | FinanceDirector |
| `TL-U03` | Amina Sellami | OpsDirector |
| `TL-U04` | Mehdi Larbi | WarehouseManager |
| `TL-U05` | Rania Boudiaf | QCOfficer |
| `TL-U06` | Walid Ferhat | Supervisor |
| `TL-U07` | Ismail Tlemcani | Operator |
| `TL-U08` | Zaki Chaouch | Driver |

**Produits (8) :** Smartphones, laptops, tablettes, câbles HDMI, batteries, écrans, routeurs, imprimantes  
**Clients (5) :** Boutique Info Center, Cyberstore Oran...  
**Fournisseurs liés :** TechParts Algérie  

---

### 4.4 🚚 Sahara Express (T-ENT-04) — Distribution générale

**Entrepôts :**
| ID | Nom | Ville | Type |
|----|-----|-------|------|
| `wh-se-ghardaia` | Entrepôt Sahara Ghardaia | Ghardaia | Multi-secteur |

**Users (5) :**
| ID | Nom | Rôle |
|----|-----|------|
| `SE-U01` | Omar Touati | CEO |
| `SE-U02` | Aicha Bensalem | WarehouseManager |
| `SE-U03` | Moussa Seddiki | Operator |
| `SE-U04` | Habib Charef | Driver |
| `SE-U05` | Naima Khelif | Accountant |

**Produits (6) :** Mix agroalimentaire + ménager  
**Clients (4) :** Petits commerces du sud algérien  

---

## 5. Mapping Owner Dashboard ↔ WMS Tenants

### 5.1 Subscribers alignés

| Owner Subscriber ID | Tenant ID | Nom | Type | Plan | Monthly Fee | Users | Warehouses |
|---------------------|-----------|-----|------|------|-------------|-------|------------|
| `SUB-E001` | `T-ENT-01` | Bennet Eddar | entrepot | enterprise | 150,000 DZD | 14/999 | 2/999 |
| `SUB-E002` | `T-ENT-02` | Atlas BTP Distribution | entrepot | pro | 85,000 DZD | 8/25 | 1/3 |
| `SUB-E003` | `T-ENT-03` | TechnoLog Algérie | entrepot | pro | 85,000 DZD | 8/25 | 1/3 |
| `SUB-E004` | `T-ENT-04` | Sahara Express | entrepot | standard | 45,000 DZD | 5/10 | 1/1 |
| `SUB-F001` | `T-FRN-01` | Agro Sahel Distribution | fournisseur | pro | 35,000 DZD | 4/10 | 1/1 |
| `SUB-F002` | `T-FRN-02` | Céramique Atlas | fournisseur | pro | 35,000 DZD | 3/10 | 0/0 |
| `SUB-F003` | `T-FRN-03` | TechParts Algérie | fournisseur | standard | 15,000 DZD | 5/10 | 0/0 |
| `SUB-F004` | `T-EXT-01` | Laiterie du Tell | fournisseur | trial | 0 DZD | 1/3 | 0/0 |
| `SUB-F005` | `T-EXT-02` | Dattes El Oued Premium | fournisseur | standard | 15,000 DZD | 2/3 | 0/0 |

### 5.2 KPIs recalculés automatiquement

```typescript
// Les KPIs Owner se calculent à partir des vrais subscribers
const mrr = allSubscribers
  .filter(s => s.status === "active")
  .reduce((sum, s) => sum + s.monthlyFee, 0);
// = 150,000 + 85,000 + 85,000 + 45,000 + 35,000 + 35,000 + 15,000 + 15,000
// = 465,000 DZD
```

---

## 6. Flux E2E — Ce qui doit fonctionner à 100%

### 6.1 Flux par portail

| Portail | Route | Flux | Tenant source |
|---------|-------|------|---------------|
| **Owner** | `/owner/*` | Login → Dashboard KPIs → Subscriptions → Billing → Onboarding → Support | Platform |
| **WMS Bennet Eddar** | `/` | Login CEO → Dashboard → PO → GRN → Stock → Sales → Delivery → Invoice → Payment | T-ENT-01 |
| **WMS Atlas BTP** | `/` | Login CEO → Dashboard → PO → GRN → Stock → Sales | T-ENT-02 |
| **WMS TechnoLog** | `/` | Login CEO → Dashboard → PO → GRN → Stock → Sales | T-ENT-03 |
| **WMS Sahara Express** | `/` | Login CEO → Dashboard → Stock → Sales | T-ENT-04 |
| **Mobile Commercial** | `/mobile/*` | Login PIN → Dashboard → Clients → Nouvelle commande → Route | T-ENT-01 |
| **Mobile Chauffeur** | `/delivery/*` | Login → Trip → Stops → Proof → Cash → EOD | T-ENT-01 |
| **Portail Client** | `/portal/*` | Login → Commander → Suivi → Factures → Paiements | T-ENT-01 (client) |
| **Portail Fournisseur** | `/supplier/*` | Login → PO reçues → Livraisons → Factures | T-FRN-01 |

### 6.2 Flux inter-entreprises (B2B)

```
Bennet Eddar (T-ENT-01) crée PO-2026-0050 → Agro Sahel (T-FRN-01)
  ↓
Agro Sahel voit la PO dans son WMS comme SalesOrder
  ↓
Agro Sahel prépare, expédie, facture
  ↓
Bennet Eddar fait GRN → 3-way match → paiement
```

---

## 7. Plan de Migration — Étapes

### Phase 1 : Infrastructure tenant (1-2 jours)
| Tâche | Fichier | Action |
|-------|---------|--------|
| 1.1 | `src/lib/tenantFilter.ts` | **CRÉER** — helper `filterByTenant()`, `getCurrentTenantId()` |
| 1.2 | `src/data/userData.ts` | **REMPLACER** — 4 CEOs + staff par tenant (≈45 users total) |
| 1.3 | `src/data/masterData.ts` | **REMPLACER** — produits, warehouses, vendors par tenant |
| 1.4 | `src/contexts/AuthContext.tsx` | **MODIFIER** — ajouter `tenantId` au contexte user |

### Phase 2 : Données transactionnelles (2-3 jours)
| Tâche | Fichier | Action |
|-------|---------|--------|
| 2.1 | `src/data/transactionalData.ts` | **REMPLACER** — PO, SO, GRN, invoices, payments par tenant |
| 2.2 | `src/data/operationalData.ts` | **REMPLACER** — QC, putaway, movements par tenant |
| 2.3 | `src/data/historicalData.ts` | **REMPLACER** — historique par tenant |
| 2.4 | `src/data/mockData.ts` | **METTRE À JOUR** — barrel exports (pas de breaking change) |

### Phase 3 : Owner Dashboard aligné (1 jour)
| Tâche | Fichier | Action |
|-------|---------|--------|
| 3.1 | `src/owner/data/mockOwnerData.ts` | **REMPLACER** — subscribers = vrais tenants |
| 3.2 | `src/owner/types/owner.ts` | **MODIFIER** — ajouter `tenantId` au `Subscriber` |
| 3.3 | Owner screens | **VÉRIFIER** — KPIs calculés depuis vrais subscribers |

### Phase 4 : Portails externes alignés (1 jour)
| Tâche | Fichier | Action |
|-------|---------|--------|
| 4.1 | `src/mobile/data/mockSalesData.ts` | **REMPLACER** — commercial Bennet Eddar (T-ENT-01) |
| 4.2 | `src/delivery/data/mockDeliveryData.ts` | **ADAPTER** — chauffeur Bennet Eddar |
| 4.3 | `src/portal/data/mockPortalData.ts` | **ADAPTER** — client de Bennet Eddar |
| 4.4 | `src/supplier/data/mockSupplierData.ts` | **ADAPTER** — Agro Sahel (T-FRN-01) |

### Phase 5 : Filtrage WMS par tenant (2 jours)
| Tâche | Fichier | Action |
|-------|---------|--------|
| 5.1 | `src/contexts/WMSDataContext.tsx` | **MODIFIER** — filtrer toutes les données par `tenantId` |
| 5.2 | Pages WMS (toutes) | **VÉRIFIER** — affichent uniquement les données du tenant connecté |
| 5.3 | Login page `/` | **MODIFIER** — sélecteur d'entreprise ou détection auto |

### Phase 6 : Tests & Validation (1 jour)
| Tâche | Fichier | Action |
|-------|---------|--------|
| 6.1 | `src/test/multi-tenant-isolation.test.ts` | **CRÉER** — tests isolation entre tenants |
| 6.2 | `src/test/owner-subscriber-sync.test.ts` | **CRÉER** — tests cohérence Owner ↔ WMS |
| 6.3 | `src/test/e2e-cross-tenant.test.ts` | **CRÉER** — tests PO B2B inter-entreprises |
| 6.4 | Tests existants | **ADAPTER** — mettre à jour avec `tenantId` |

---

## 8. Login Demo — Comptes de démonstration

### 8.1 Page de login avec sélecteur entreprise

```
┌─────────────────────────────────────────┐
│           JAWDA — Connexion             │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 👑 Owner (Fondateur Jawda)       │  │
│  │    PIN: 999999                    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 🏭 Bennet Eddar (Agro, Alger)    │  │
│  │    CEO: Youssef Khelifi           │  │
│  │    PIN: 100001                    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 🏗️ Atlas BTP (Construction)      │  │
│  │    CEO: Nabil Boumediene          │  │
│  │    PIN: 200001                    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 💻 TechnoLog (Électronique)      │  │
│  │    CEO: Samira Hadj              │  │
│  │    PIN: 300001                    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 🚚 Sahara Express (Distribution) │  │
│  │    CEO: Omar Touati              │  │
│  │    PIN: 400001                    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 📦 Agro Sahel (Fournisseur)      │  │
│  │    CEO: Karim Benmoussa           │  │
│  │    PIN: 500001                    │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 8.2 Table complète des PINs

| PIN | User | Rôle | Entreprise | Portail |
|-----|------|------|------------|---------|
| `999999` | Yacine Hadj-Ali | PlatformOwner | Jawda | `/owner/*` |
| `100001` | Youssef Khelifi | CEO | Bennet Eddar | `/` |
| `100002` | Anis Boucetta | FinanceDirector | Bennet Eddar | `/` |
| `100003` | Rachid Benali | OpsDirector | Bennet Eddar | `/` |
| `100010` | Mourad Ziani | Supervisor | Bennet Eddar | `/` |
| `100011` | Tarek Daoui | Operator | Bennet Eddar | `/` |
| `100013` | Omar Fadel | Driver | Bennet Eddar | `/delivery/*` |
| `100014` | Youssef Hamdi | Driver | Bennet Eddar | `/delivery/*` |
| `200001` | Nabil Boumediene | CEO | Atlas BTP | `/` |
| `300001` | Samira Hadj | CEO | TechnoLog | `/` |
| `400001` | Omar Touati | CEO | Sahara Express | `/` |
| `500001` | Karim Benmoussa | CEO | Agro Sahel | `/` |
| `600001` | Yacine Ferhat | Supplier (ext) | Laiterie du Tell | `/supplier/*` |
| `700001` | Café Central | Client | — | `/portal/*` |
| `123456` | Yassine Khelifi | Commercial | Bennet Eddar | `/mobile/*` |

---

## 9. Résumé des volumes

| Métrique | Valeur actuelle | Valeur cible |
|----------|:-:|:-:|
| Tenants (entreprises) | 1 (+1 partiel) | **4 entrepôts + 3 fournisseurs** |
| CEOs | 1 | **4 + 3 = 7** |
| Users total | 20 | **≈45** |
| Warehouses | 3 | **6** |
| Produits | 12 | **≈40** (par tenant) |
| Customers | 8 | **≈25** (répartis) |
| Subscribers Owner | 13 | **9** (alignés 1:1 avec tenants) |
| PO | 5 | **≈20** (par tenant) |
| Sales Orders | 5 | **≈15** (par tenant) |
| Isolation tenant | ❌ Aucune | ✅ `tenantId` partout |

---

## 10. Règles de cohérence

### ✅ INVARIANTS à respecter :

1. **Chaque subscriber Owner = 1 tenant WMS** (même `tenantId`)
2. **Un user ne voit JAMAIS les données d'un autre tenant**
3. **Les produits sont propres à chaque tenant** (pas de catalogue partagé)
4. **Les PO B2B créent un lien vendor→customer entre tenants**
5. **Le Owner Dashboard agrège TOUS les tenants** (vue plateforme)
6. **Les PIN sont uniques globalement**
7. **`company` dans User = nom affiché, `tenantId` = clé technique**
8. **Le `wmsStorage.ts` persiste par tenant** (clé `flow-food-wms-state-{tenantId}`)
9. **Les tests vérifient l'isolation** (aucun leak cross-tenant)
10. **L'interface de login propose le choix de l'entreprise**

---

## 11. Fichiers à créer / modifier

### Nouveaux fichiers :
```
src/lib/tenantFilter.ts                    → Helper filtrage tenant
src/data/tenants.ts                         → Définition des tenants
src/test/multi-tenant-isolation.test.ts     → Tests isolation
src/test/owner-subscriber-sync.test.ts      → Tests cohérence Owner ↔ WMS
```

### Fichiers à réécrire (mock data) :
```
src/data/userData.ts                        → ≈45 users, 7 tenants
src/data/masterData.ts                      → Produits/warehouses par tenant
src/data/transactionalData.ts               → PO/SO/GRN par tenant
src/data/operationalData.ts                 → QC/putaway par tenant
src/data/historicalData.ts                  → Historique par tenant
src/owner/data/mockOwnerData.ts             → 9 subscribers = 9 tenants
src/mobile/data/mockSalesData.ts            → Commercial T-ENT-01
src/delivery/data/mockDeliveryData.ts       → Chauffeur T-ENT-01
src/portal/data/mockPortalData.ts           → Client T-ENT-01
src/supplier/data/mockSupplierData.ts       → Fournisseur T-FRN-01
```

### Fichiers à modifier (logique) :
```
src/contexts/AuthContext.tsx                → tenantId dans session
src/contexts/WMSDataContext.tsx             → filtrage par tenant
src/lib/wmsStorage.ts                       → persistance par tenant
src/pages/Login.tsx                         → sélecteur entreprise
src/data/mockData.ts                        → barrel re-exports (compat)
```

---

## 12. Priorité d'exécution

```
[P0] Phase 1 → Créer tenants.ts + tenantFilter.ts + nouveaux users
[P0] Phase 2 → Réécrire données transactionnelles par tenant
[P0] Phase 3 → Aligner Owner subscribers avec tenants
[P1] Phase 4 → Adapter portails mobiles/client/fournisseur
[P1] Phase 5 → Brancher filtrage tenant dans WMS
[P2] Phase 6 → Tests de validation complète
```

**Estimation totale : 7-10 jours de développement**

---

> ✅ Ce plan garantit un environnement SaaS démo **100% réaliste** avec isolation multi-tenant, 4 CEOs indépendants, des flux métier complets, et une cohérence totale entre le Owner Dashboard et les WMS de chaque abonné.
