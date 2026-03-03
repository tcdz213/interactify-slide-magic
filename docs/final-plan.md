# 📋 Plan Final — Produits, Catégories & Unités de Mesure

## Architecture Complète : Logique Métier, CRUD Admin, UX Optimisée & Roadmap

**Version** : 3.0 (Consolidée — fusion plan-dev-1 + plan-dev-2)  
**Date** : Mars 2026  
**Statut** : ✅ Prêt pour implémentation

---

## 📑 Table des matières

| # | Section | Priorité |
|---|---------|----------|
| 1 | [Modèle de données](#1-modèle-de-données) | Référence |
| 2 | [Diagramme de relations](#2-diagramme-de-relations) | Référence |
| 3 | [Gestion d'état (WMSDataContext)](#3-gestion-détat) | Référence |
| 4 | [Scénarios Admin — Produits](#4-scénarios-admin--produits) | 🔴 Core |
| 5 | [Scénarios Admin — Catégories](#5-scénarios-admin--catégories) | 🔴 Core |
| 6 | [Scénarios Admin — Unités de Mesure](#6-scénarios-admin--udm) | 🔴 Core |
| 7 | [Flux de filtrage](#7-flux-de-filtrage) | Référence |
| 8 | [Dépendances inter-modules](#8-dépendances-inter-modules) | Référence |
| 9 | [États et transitions](#9-états-et-transitions) | Référence |
| 10 | [Validations (Zod schemas)](#10-validations) | 🟠 Implémentation |
| 11 | [Contrôle d'accès (RBAC)](#11-contrôle-daccès) | 🟠 Implémentation |
| 12 | [Scénarios cross-entités](#12-scénarios-cross-entités) | 🟡 P3 |
| 13 | [Audit Trail](#13-audit-trail) | 🟡 P2 |
| 14 | [Dette technique & problèmes](#14-dette-technique) | 🔴 P0 |
| 15 | [UX optimisée — Spécifications](#15-ux-optimisée) | 🟠 P1-P2 |
| 16 | [Matrice récapitulative](#16-matrice-récapitulative) | Référence |
| 17 | [Roadmap & Sprints](#17-roadmap) | Planification |
| 18 | [Checklist d'implémentation](#18-checklist) | Exécution |

---

## 1. Modèle de données

### 1.1 Product

**Fichier** : `src/data/masterData.ts`

```typescript
interface Product {
  id: string;            // "P001" ou "P-{uuid8}" (auto-généré)
  name: string;          // min 2 car., max 100
  sku: string;           // unique, regex: [A-Za-z0-9\-_]{3,}
  category: string;      // ⚠ TEXT = ProductCategory.name (pas l'ID !)
  uom: string;           // Label unité de base ("Sac", "Pièce", "m²")
  baseUnitId?: string;   // FK → UnitOfMeasure.id
  unitCost: number;      // Coût unitaire (DZD) ≥ 0
  unitPrice: number;     // Prix de vente (DZD) ≥ 0
  reorderPoint: number;  // Seuil réapprovisionnement ≥ 0
  isActive: boolean;     // Actif / Inactif
  isDeleted?: boolean;   // Soft-delete — restaurable
  baseUnit?: string;     // Nom unité de base (legacy)
  baseUnitAbbr?: string; // Abréviation (legacy)
}
```

### 1.2 ProductCategory

```typescript
interface ProductCategory {
  id: string;            // "CAT-001" ou "CAT-{n}"
  name: string;          // unique (case-insensitive)
  parentId?: string;     // Hiérarchie parent (future tree view)
  description: string;
  productCount: number;  // ⚠ DEPRECATED → utiliser dynamicCounts
  status: "Active" | "Inactive";
  isDeleted?: boolean;   // Soft-delete (NEW — cohérence avec Product)
}
```

### 1.3 UnitOfMeasure

```typescript
interface UnitOfMeasure {
  id: string;                 // "UOM-001"
  name: string;               // unique (case-insensitive)
  abbreviation: string;       // unique (case-insensitive), max 10
  type: "Weight" | "Volume" | "Count" | "Length" | "Area";
  unitKind: "PHYSICAL";
  baseUnit?: string;          // Abréviation UDM de base (ex: "kg")
  conversionFactor?: number;  // 1 de cette unité = X de l'unité de base
  isDeleted?: boolean;        // Soft-delete (NEW)
}
```

### 1.4 ProductUnitConversion

**Fichier** : `src/lib/unitConversion.ts`

```typescript
interface ProductUnitConversion {
  id: string;                    // "PUC-{productId}-{idx}"
  productId: string;             // FK → Product.id
  unitName: string;              // "Carton"
  unitAbbreviation: string;      // "Ctn" — unique par productId
  conversionFactor: number;      // 1 Ctn = 24 unités de base (> 0)
  allowBuy: boolean;
  allowSell: boolean;
  sortOrder: number;
  isInteger?: boolean;           // Quantité entière obligatoire
  usedInTransactions?: boolean;  // Verrouillé si true
  lockedAt?: string;             // ISO date du verrouillage
  validFrom?: string;            // Effective dating
  validTo?: string;
  decimalPlaces?: number;        // Précision arrondi
  roundingMode?: "ceil" | "floor" | "round";
}
```

### 1.5 ProductBaseUnit

```typescript
interface ProductBaseUnit {
  productId: string;             // FK → Product.id
  baseUnitName: string;          // "Pièce"
  baseUnitAbbreviation: string;  // "Pce"
}
```

### 1.6 ProductHistory (NEW — Audit Trail)

```typescript
interface ProductHistory {
  id: string;           // "PH-{timestamp}-{uuid8}"
  productId: string;    // FK → Product.id
  action: "created" | "modified" | "deleted" | "undeleted";
  changedFields?: Record<string, { oldValue: any; newValue: any }>;
  changedBy: string;    // user email/name
  changedAt: string;    // ISO8601
  reason?: string;
}
```

---

## 2. Diagramme de relations

```
┌─────────────────────────┐        ┌─────────────────────────┐
│    UnitOfMeasure        │◄───────│    ProductBaseUnit       │
│  id: "UOM-001"          │  par   │  productId → Product.id  │
│  name: "Sac"            │  nom/  │  baseUnitName            │
│  abbreviation: "Sac"    │  abbr  │  baseUnitAbbreviation    │
│  type: "Count"          │        └─────────────┬───────────┘
│  baseUnit?: "kg"        │  CYCLE DETECTION:   │
│  conversionFactor?: 50  │  A→B→C→A = ERROR   │
└─────────────────────────┘                      │
         ▲                                     productId
         │ peut dériver                          │
         │ (si baseUnit défini)                  │
┌─────────────────────────┐        ┌─────────────▼───────────┐
│   ProductCategory       │◄───────│       Product            │
│  id: "CAT-001"          │  par   │  category: "Ciment…"     │
│  name: "Ciment…"        │  NAME  │  baseUnitId?: "UOM-001"  │
│  status: Active         │  ⚠    │  uom: "Sac"             │
│  isDeleted?: false      │        │  isActive: true          │
└─────────────────────────┘        └─────────────┬───────────┘
                                                 │
                                    ┌────────────┼────────────┬──────────────┐
                                    ▼            ▼            ▼              ▼
                          ┌──────────────┐ ┌──────────┐ ┌──────────────┐ ┌──────────────┐
                          │InventoryItem │ │ PO/SO    │ │ProductUnitCnv│ │ProductHistory│
                          │productId     │ │lines[]   │ │productId     │ │productId     │
                          │warehouseId   │ │productId │ │unitName      │ │action        │
                          │qtyOnHand     │ │          │ │factor        │ │changedBy     │
                          └──────────────┘ └──────────┘ └──────────────┘ └──────────────┘

LÉGENDE : ⚠ = Lien par NOM (problème critique → auto-cascade P0)
```

### ⚠️ Problème critique : FK textuelle

- `Product.category` = **nom textuel** de la catégorie (pas l'ID)
- `Product.uom` = **nom/abréviation** de l'UDM (pas l'ID)
- **Impact** : Renommer une catégorie/UDM **casse le lien** avec les produits
- **Solution P0** : Auto-cascade systématique (§5.2, §6.2)

---

## 3. Gestion d'état

**Fichier** : `src/contexts/WMSDataContext.tsx`

| State | Setter | Consommateurs |
|-------|--------|---------------|
| `products` | `setProducts` | ProductsPage, OrderForm, Inventory, PO, SO |
| `productCategories` | `setProductCategories` | CategoriesPage, ProductFormDialog |
| `unitsOfMeasure` | `setUnitsOfMeasure` | UomPage, ProductFormDialog, UnitSelector |
| `productUnitConversions` | `setProductUnitConversions` | ProductFormDialog, UnitSelector, Orders |
| `productBaseUnits` | `setProductBaseUnits` | ProductFormDialog, useUnitConversion |
| `inventory` | `setInventory` | Stock totals, filtres entrepôt |
| `productHistory` | `setProductHistory` | ProductDetailDrawer (tab Historique) — **NEW** |

### Règles de synchronisation (auto-cascade)

```typescript
// Renommage catégorie → cascade products
if (oldName !== newName) {
  setProducts(prev => prev.map(p =>
    p.category === oldName ? { ...p, category: newName } : p
  ));
}

// Renommage UDM abréviation → cascade products + conversions + UDM dérivées
if (oldAbbr !== newAbbr) {
  setProducts(prev => prev.map(p =>
    p.uom === oldAbbr ? { ...p, uom: newAbbr } : p
  ));
  setProductUnitConversions(prev => prev.map(c =>
    c.unitAbbreviation === oldAbbr ? { ...c, unitAbbreviation: newAbbr } : c
  ));
  setUnitsOfMeasure(prev => prev.map(u =>
    u.baseUnit === oldAbbr ? { ...u, baseUnit: newAbbr } : u
  ));
}
```

---

## 4. Scénarios Admin — Produits

### 4.1 🟢 CRÉER un produit (UX optimisée — 1 dialog unifié)

**Chemin** : `ProductsPage → "+ Nouveau produit" → ProductFormDialog`

```
┌─────────────────────────────────────────────┐
│         Créer un produit                    │
├─────────────────────────────────────────────┤
│ INFOS DE BASE                               │
│ Nom * [_______________]                      │
│ SKU * [_______________]                      │
│ Catégorie * ▼ [Ciment]  [+ Créer] ← inline │
│ Unité de base * ▼ [Sac] [+ Créer] ← inline │
│ Coût unitaire (DZD) [0.00]                  │
│ Prix unitaire (DZD) [0.00]                  │
│ Seuil réappro. [0]                          │
│ Statut ☑ Actif                             │
├─────────────────────────────────────────────┤
│ ▼ CONVERSIONS D'UNITÉS (collapsible)        │
│   Base : Sac (auto) f=1 [A☑V☑]             │
│   [+ Ajouter une unité]                     │
│   ├─ Carton f=24 [A☑V☑] [X]               │
│   └─ Palette f=400 [A☑V☐] [X]             │
├─────────────────────────────────────────────┤
│        [Créer]              [Annuler]       │
└─────────────────────────────────────────────┘
```

**Logique handleSave** :

1. Validation Zod (productSchema + conversionSchema[])
2. SKU unique check : `products.some(p => p.sku === form.sku)`
3. ID auto : `P-${crypto.randomUUID().substring(0, 8)}`
4. `setProducts(prev => [...prev, newProduct])`
5. Auto-ajouter base unit comme conversion (factor=1)
6. Sauvegarder conversions supplémentaires
7. Audit trail → `setProductHistory([...prev, { action: "created" }])`
8. Toast "Produit créé" → fermer dialog

**Gain UX** : 2 dialogs → 1 dialog | ~12 clics → ~7 clics (**-38%**)

---

### 4.2 🔵 MODIFIER un produit

**Chemin** : `ProductsPage → icône ✏️ → ProductFormDialog (mode edit)`

**Logique** :
1. Pré-remplir form avec valeurs + conversions existantes
2. **Si stock > 0** → champ "Unité de base" **verrouillé** (disabled)
3. Step tabs : `1. Infos de base` | `2. Unités`
4. Validation Zod (SKU unique excluant self)
5. Détection changements → `changedFields` pour audit
6. `setProducts(prev => prev.map(...))`
7. Si `unitCost` changé → `onCostChanged()` (FinancialTrackingContext)
8. Audit trail → `{ action: "modified", changedFields }`
9. Toast "Produit modifié"

**Clics** : Modifier champs → 1 clic "Enregistrer"

---

### 4.3 🔴 SUPPRIMER un produit (Soft Delete)

**Chemin** : `ProductsPage → icône 🗑 → ProductDeleteDialog`

**Pré-vérification** `getDeleteBlockReasons(product)` :

| Condition | Bloqueur |
|-----------|----------|
| Stock > 0 dans inventory | ❌ BLOQUÉ — "Stock existant: X unités" |
| PO ouvertes (≠ Received/Cancelled) | ❌ BLOQUÉ — "PO ouvertes: PO-001, PO-002" |
| SO ouvertes (≠ Delivered/Invoiced/Cancelled) | ❌ BLOQUÉ — "SO ouvertes: SO-001" |

**Si aucun bloqueur** :
```typescript
setProducts(prev => prev.map(p =>
  p.id === id ? { ...p, isActive: false, isDeleted: true } : p
));
// Audit trail: action: "deleted"
```

**Clics** : 1 poubelle → 1 confirmer

---

### 4.4 🟡 ACTIVER / DÉSACTIVER

**Chemin** : `ProductsPage → switch toggle`

- Désactivation : bloquée si SO ouvertes
- Activation : aucune restriction
- `setProducts(prev => prev.map(p => { ...p, isActive: !p.isActive }))`

**Clics** : 1

---

### 4.5 👁 VOIR le détail

**Chemin** : `ProductsPage → icône 👁 → ProductDetailDrawer`

Tabs : Infos générales | Unités de conversion | Historique (NEW) | Mouvements stock

---

### 4.6 💰 GÉRER le pricing

**Chemin** : `ProductsPage → icône 💰 → ProductPricingDialog`

---

### 4.7 📏 GÉRER les unités (standalone)

**Chemin** : `ProductsPage → icône 📏 → ProductUnitsDialog`

---

### 4.8 📤 EXPORTER

**Chemin** : `ProductsPage → "Exporter" → ExportDialog`

Colonnes : SKU, Nom, Catégorie, Unité, Coût, Prix, Seuil, Statut  
Formats : CSV (+ future XLSX)

---

### 4.9 📏 AJOUTER une conversion d'unité (inline)

**Chemin** : `ProductFormDialog → Section Conversions → "+ Ajouter"`

Validation :
- unitName non vide
- unitAbbreviation unique par produit, max 10 car.
- conversionFactor > 0
- Si factor=1 → auto-set comme unité de base

---

### 4.10 🗑 SUPPRIMER une conversion d'unité

**Chemin** : `ProductFormDialog → icône X sur la ligne`

**Vérification (NEW — P0)** :
```typescript
const usedInPOs = purchaseOrders.flatMap(po => po.lines).some(l => l.unitId === convId);
const usedInSOs = salesOrders.flatMap(so => so.lines).some(l => l.unitId === convId);

if (usedInPOs || usedInSOs) {
  Toast.error("Impossible : utilisée dans des PO/SO ouvertes");
  return;
}
```

---

## 5. Scénarios Admin — Catégories

### 5.1 🟢 CRÉER une catégorie

- Nom unique (case-insensitive)
- Description optionnelle
- Statut Active/Inactive (défaut: Active)
- ID auto : `CAT-{n}`

**Clics** : 3 champs → 1 "Créer"

**Inline (NEW)** : Créable directement depuis ProductFormDialog sans navigation.

---

### 5.2 🔵 MODIFIER une catégorie (avec AUTO-CASCADE)

```typescript
// Si renommage
if (oldName !== newName) {
  const affectedCount = products.filter(p => p.category === oldName).length;
  setProducts(prev => prev.map(p =>
    p.category === oldName ? { ...p, category: newName } : p
  ));
  Toast.success(`${affectedCount} produit(s) mis à jour automatiquement`);
}
```

**Gain** : N actions manuelles → 0 (**auto-cascade**)

---

### 5.3 🔴 SUPPRIMER une catégorie (avec RÉASSIGNATION EN MASSE)

```
┌─────────────────────────────────────────────┐
│  Réassigner avant suppression               │
├─────────────────────────────────────────────┤
│ "Ciment & Liants" contient 15 produit(s)    │
│                                             │
│ Réassigner vers : ▼ [Aciers & Métaux]       │
├─────────────────────────────────────────────┤
│   [Réassigner & Supprimer]  [Annuler]       │
└─────────────────────────────────────────────┘
```

- Si 0 produits → confirmation directe
- Si N produits → dialog réassignation → cascade + soft-delete
- **Cohérence** : Soft-delete (comme Product) au lieu de hard-delete

**Gain** : ∞ actions (bloqué) → 2 clics

---

### 5.4 🔍 FILTRER les catégories (NEW)

- Recherche par nom
- Filtre par statut : Active / Inactive / Tous
- Compteur dynamique de produits par catégorie
- Exclusion isDeleted

---

## 6. Scénarios Admin — UDM

### 6.1 🟢 CRÉER une UDM

- Nom + abréviation uniques (case-insensitive)
- Type : Weight / Volume / Count / Length / Area
- UDM de base optionnelle → facteur > 0 obligatoire si défini
- **Détection cycle** : `wouldCreateCycle(targetBase, currentAbbr)` → A→B→C→A = BLOQUÉ

**Inline (NEW)** : Créable directement depuis ProductFormDialog.

---

### 6.2 🔵 MODIFIER une UDM (avec AUTO-CASCADE)

```typescript
if (oldAbbr !== newAbbr) {
  // 1. Mettre à jour products.uom
  setProducts(prev => prev.map(p =>
    p.uom === oldAbbr ? { ...p, uom: newAbbr } : p
  ));
  // 2. Mettre à jour productUnitConversions
  setProductUnitConversions(prev => prev.map(c =>
    c.unitAbbreviation === oldAbbr ? { ...c, unitAbbreviation: newAbbr } : c
  ));
  // 3. Mettre à jour UDM dérivées
  setUnitsOfMeasure(prev => prev.map(u =>
    u.baseUnit === oldAbbr ? { ...u, baseUnit: newAbbr } : u
  ));
}
```

---

### 6.3 🔴 SUPPRIMER une UDM

**Bloqueurs** :
- Produits utilisant cette UDM (`product.uom === abbr/name`)
- UDM dérivées (`baseUnit === abbr`)

Si aucun bloqueur → soft-delete.

---

### 6.4 📤 EXPORTER (CSV)

Colonnes : Abréviation, Nom, Type, UDM de base, Facteur

### 6.5 📥 IMPORTER (CSV)

- Colonnes attendues : Abréviation, Nom, Type, UDM de base, Facteur
- Détection en-têtes FR/EN
- Doublons abréviation → skip
- Toast récapitulatif

### 6.6 🔍 FILTRER

- Recherche par nom ou abréviation
- Filtre par type
- Compteur d'utilisation par produit (usageCountMap)

---

## 7. Flux de filtrage

```typescript
// useProductFilters({ products, inventory })
const pipeline = products
  .filter(p => !p.isDeleted)                    // Toujours exclure
  .filter(p => matchSearch(p, search))           // nom ou SKU
  .filter(p => matchCategory(p, filterCat))      // par nom texte
  .filter(p => matchWarehouse(p, filterWh, inv)) // par stock entrepôt
  .filter(p => matchStatus(p, filterStatus));     // active/inactive/all

// Métriques calculées :
// stockTotals, categories, activeCount, criticalStockCount, avgCost, avgPrice
```

---

## 8. Dépendances inter-modules

| Module | Utilisation | Criticité |
|--------|-------------|:---------:|
| Commandes achat (PO) | productId, UnitSelector | 🔴 Haute |
| Commandes vente (SO) | productId, unitId, conversionFactor | 🔴 Haute |
| Inventaire | InventoryItem.productId → stock | 🔴 Haute |
| GRN | Réception → validation productId | 🟠 Moyenne |
| Conversions | ProductUnitConversion.productId | 🔴 Haute |
| Garde suppression | Vérifie PO, SO, Inventory | 🔴 Haute |
| Pricing | Règles de prix par produit | 🟡 Basse |
| Ajustements stock | productId + unité | 🟠 Moyenne |
| Suivi financier | onCostChanged → FinancialTracking | 🟡 Basse |
| Mobile (SFA) | ProductCatalogItem (type simplifié) | 🟡 Basse |
| Portail client | PortalOrderLine.productId | 🟡 Basse |

---

## 9. États et transitions

### 9.1 Produit

```
     ┌──────────┐       ┌──────────┐
     │  ACTIVE  │◄─────►│ INACTIVE │
     └────┬─────┘       └────┬─────┘
          │ (stock=0,        │
          │  PO/SO=0)        │
          ▼                  ▼
     ┌───────────────────────────┐
     │ DELETED (soft)            │
     │ isDeleted=true            │
     │ isActive=false            │
     │ Restaurable (future)      │
     └───────────────────────────┘
```

- Toggle isActive → bloqué si SO ouvertes (désactivation)
- Soft-delete → bloqué si stock > 0 ou PO/SO ouvertes

### 9.2 Catégorie

```
     ┌──────────┐       ┌──────────┐
     │  ACTIVE  │◄─────►│ INACTIVE │
     └────┬─────┘       └────┬─────┘
          │ (réassigner       │
          │  produits)        │
          ▼                  ▼
     ┌───────────────────────────┐
     │ DELETED (soft — NEW)      │
     │ Produits réassignés       │
     └───────────────────────────┘
```

### 9.3 UDM

```
     ┌──────────────┐
     │ UNITÉ DE BASE│ (baseUnit=null)
     └───────┬──────┘
             │ peut créer dérivée
     ┌───────▼──────────┐
     │ UNITÉ DÉRIVÉE    │ (baseUnit="kg", f=1000)
     └───────┬──────────┘
             │ ⚠ CYCLE = BLOQUÉ (A→B→C→A)
     ┌───────▼──────────┐
     │ DOUBLE-DÉRIVÉE   │
     └──────────────────┘

Suppression : Bloquée si produits ou UDM dérivées existent → sinon soft-delete
```

---

## 10. Validations

### 10.1 Product (Zod)

```typescript
const productSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  sku: z.string().min(3).max(50)
    .regex(/^[A-Za-z0-9\-_]+$/)
    .transform(val => val.toUpperCase())
    .refine(val => !existingSkus.includes(val), "SKU déjà utilisé"),
  category: z.string().min(1)
    .refine(val => categories.some(c => c.name === val && c.status === "Active")),
  uom: z.string().min(1)
    .refine(val => unitsOfMeasure.some(u => u.name === val || u.abbreviation === val)),
  unitCost: z.number().nonnegative().finite(),
  unitPrice: z.number().nonnegative().finite(),
  reorderPoint: z.number().nonnegative().int(),
  isActive: z.boolean().default(true),
});
```

### 10.2 Category (Zod)

```typescript
const categorySchema = z.object({
  name: z.string().min(1).max(100)
    .refine(val => !existingNames.includes(val.toLowerCase()), "Nom déjà utilisé"),
  description: z.string().max(500).optional(),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  parentId: z.string().optional()
    .refine(val => !val || categories.some(c => c.id === val)),
});
```

### 10.3 UnitOfMeasure (Zod)

```typescript
const uomSchema = z.object({
  name: z.string().min(1).max(100)
    .refine(val => !existingNames.includes(val.toLowerCase())),
  abbreviation: z.string().min(1).max(10).regex(/^[A-Za-z0-9]+$/)
    .transform(val => val.toUpperCase())
    .refine(val => !existingAbbr.includes(val)),
  type: z.enum(["Weight", "Volume", "Count", "Length", "Area"]),
  baseUnit: z.string().optional()
    .refine(val => !val || !wouldCreateCycle(val, data.abbreviation), "Cycle détecté"),
  conversionFactor: z.number().gt(0).finite().optional()
    .refine(val => !data.baseUnit || val !== undefined, "Facteur requis si UDM de base"),
});
```

### 10.4 ProductUnitConversion (Zod)

```typescript
const conversionSchema = z.object({
  unitName: z.string().min(1).max(50),
  unitAbbreviation: z.string().min(1).max(10).regex(/^[A-Za-z0-9]+$/)
    .refine(val => !existingAbbrevForProduct.includes(val)),
  conversionFactor: z.number().gt(0).finite(),
  allowBuy: z.boolean(),
  allowSell: z.boolean(),
});
```

---

## 11. Contrôle d'accès

```
┌────────────────┬──────────┬────────────┬──────────┬─────────────────┐
│ Rôle           │ Créer    │ Modifier   │ Supprimer│ Export/Import   │
│                │ Prod/Cat │ Prod/Cat   │ Prod/Cat │                 │
├────────────────┼──────────┼────────────┼──────────┼─────────────────┤
│ ADMIN          │ ✅ / ✅  │ ✅ / ✅    │ ✅ / ✅  │ ✅ / ✅          │
│ Manager Stock  │ ✅ / ❌  │ ✅ / ❌    │ ❌ / ❌  │ ✅ / ❌          │
│ Manager Achat  │ ✅ / ❌  │ ⚠️* / ❌  │ ❌ / ❌  │ ✅ / ❌          │
│ Manager Vente  │ ✅ / ❌  │ ⚠️** / ❌ │ ❌ / ❌  │ ✅ / ❌          │
│ User Lecture   │ ❌ / ❌  │ ❌ / ❌    │ ❌ / ❌  │ ✅ / ❌          │
└────────────────┴──────────┴────────────┴──────────┴─────────────────┘

⚠️*  = Peut modifier unitCost uniquement
⚠️** = Peut modifier unitPrice uniquement
```

---

## 12. Scénarios cross-entités

### 12.1 Import en masse de produits

1. Parser CSV (colonnes : SKU, Nom, Catégorie, UDM)
2. Détecter catégories/UDM manquantes
3. Dialog confirmation : "Créer X catégories, Y UDM manquantes ?"
4. Auto-création en cascade
5. Créer produits
6. Toast récapitulatif

### 12.2 Cloner un produit

- Menu "⋮" → "Cloner"
- Dialog pré-rempli (nom + " (copie)", SKU vide)
- Copier les conversions d'unités

### 12.3 Réapprovisionnement intelligent

- Identifier produits en sous-stock (stock < reorderPoint)
- Suggérer quantités (2x seuil - stock actuel)
- Créer PO pré-remplie

---

## 13. Audit Trail

### Modèle

Chaque action admin enregistre un `ProductHistory` :

| Action | changedFields | Exemple |
|--------|--------------|---------|
| created | - | Produit P-001 créé |
| modified | `{ unitCost: { old: 100, new: 120 } }` | Coût modifié |
| deleted | - | Produit archivé (raison: "Obsolète") |
| undeleted | - | Restauration |

### UI

- Tab "Historique" dans ProductDetailDrawer
- Tableau : Date | Action | Champ | Ancien | Nouveau | Par
- Pagination (20 items)
- Export CSV audit trail

---

## 14. Dette technique

### 🔴 Critiques (P0 — Sprint 1)

| # | Problème | Impact | Solution |
|---|----------|--------|----------|
| 1 | **Lien catégorie par NOM** | Renommage casse les produits | Auto-cascade (§5.2) |
| 2 | **Pas de cascade UDM** | Changement abbr casse product.uom | Auto-cascade (§6.2) |
| 3 | **Suppression conversion sans vérif.** | Casse PO/SO existantes | Check avant suppression (§4.10) |

### 🟡 Importants (P1-P2)

| # | Problème | Solution |
|---|----------|----------|
| 4 | Hard delete catégories ≠ soft delete produits | Soft-delete catégories |
| 5 | productCount statique sur Category | dynamicCounts partout |
| 6 | Conversions uniquement en mode édition | Form unifié |
| 7 | Pas de filtre statut CategoriesPage | Ajouter filtre |
| 8 | Pas de détection cycle UDM | wouldCreateCycle() |
| 9 | Facteur UDM dérivée non propagé | Documenter le comportement |

### 🟢 Améliorations (P3+)

| # | Opportunité |
|---|------------|
| 10 | Hiérarchie catégories (tree view) |
| 11 | Défauts par catégorie |
| 12 | Restauration produit supprimé |
| 13 | Clic compteur catégorie → filtre produits |
| 14 | Import/Export CSV catégories |
| 15 | Règles de prix par catégorie/client |

---

## 15. UX optimisée

### 15.1 Formulaire produit unifié (P1)

**Avant** : 2 dialogs, ~12 clics  
**Après** : 1 dialog avec sections collapsibles, ~7 clics (**-38%**)

### 15.2 Catégorie inline dans form produit (P2)

**Avant** : Quitter dialog → CategoriesPage → créer → revenir (~8 clics)  
**Après** : Bouton "+ Créer" → form inline → auto-sélection (~2 clics, **-75%**)

### 15.3 UDM inline dans form produit (P2)

Même principe que catégories. **-75%** clics.

### 15.4 Auto-cascade renommage catégorie (P0)

**Avant** : Renommer + N modifications manuelles  
**Après** : Renommer → auto-cascade → 0 action manuelle

### 15.5 Auto-cascade renommage UDM (P0)

Cascade : products.uom + conversions + UDM dérivées

### 15.6 Réassignation en masse avant suppression catégorie (P1)

**Avant** : Bloqué (∞ actions manuelles)  
**Après** : Dropdown réassignation + 1 bouton (2 clics)

### 15.7 Vérification suppression conversion (P0)

Check PO/SO avant suppression. Prévient corruption données.

### 15.8 Soft delete catégories (P2)

Aligner avec comportement Product. Ajout isDeleted. Restaurable.

### Spécifications UI — Inline Creation

#### Catégorie inline (état ouvert)

```
┌──────────────────────────────────────┐
│ Catégorie (nouvelle)                 │
│ ┌──────────────────────────────────┐ │
│ │ Nom * [_____________________]    │ │
│ │ Description [_________________]  │ │
│ │ Statut ☑ Actif                  │ │
│ ├──────────────────────────────────┤ │
│ │ [Créer et sélectionner] [Annuler]│ │
│ └──────────────────────────────────┘ │
│ ou sélectionner existante ▼ [...]    │
└──────────────────────────────────────┘
```

#### UDM inline (état ouvert)

```
┌──────────────────────────────────────┐
│ Unité de mesure (nouvelle)           │
│ ┌──────────────────────────────────┐ │
│ │ Nom * [_____________________]    │ │
│ │ Abréviation * [___] (max 10)     │ │
│ │ Type * ▼ [Count]                 │ │
│ │ ☐ Dérivée → Base ▼ [_] f=[_]   │ │
│ ├──────────────────────────────────┤ │
│ │ [Créer et sélectionner] [Annuler]│ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

---

## 16. Matrice récapitulative

| Entité | Action | Clics actuel | Clics optimisé | Gain |
|--------|--------|:------------:|:--------------:|:----:|
| **Produit** | Créer | 8+ (2 dialogs) | 5 (1 dialog) | **-38%** |
| **Produit** | Modifier | 4 | 3 | **-25%** |
| **Produit** | Supprimer | 2 | 2 | — |
| **Produit** | Toggle statut | 1 | 1 | — |
| **Produit** | Voir détail | 1 | 1 | — |
| **Produit** | Ajouter unité | 5+ (rouvrir) | 3 (inline) | **-40%** |
| **Produit** | Exporter | 2 | 2 | — |
| **Produit** | Importer | N/A | 3 (CSV) | **Nouveau** |
| **Produit** | Cloner | N/A | 3 | **Nouveau** |
| **Catégorie** | Créer | 4 | 2 (inline) | **-50%** |
| **Catégorie** | Renommer | 2 + N | 2 (auto-cascade) | **-N** |
| **Catégorie** | Supprimer | ∞ (bloqué) | 2 (réassigner) | **-∞** |
| **Catégorie** | Filtrer | 3 | 3 | — |
| **UDM** | Créer | 5 | 2 (inline) | **-60%** |
| **UDM** | Renommer | 2 + N | 2 (auto-cascade) | **-N** |
| **UDM** | Supprimer | 2 | 2 | — |
| **UDM** | Import CSV | 3 | 3 | — |
| **UDM** | Export CSV | 1 | 1 | — |

---

## 17. Roadmap

### 🎯 Sprint 1 (Semaine 1-2) — Data Integrity (P0)

| Tâche | Fichier(s) | Effort |
|-------|-----------|--------|
| Auto-cascade renommage catégorie | CategoriesPage, WMSDataContext | 30 min |
| Auto-cascade renommage UDM | UomPage, WMSDataContext | 45 min |
| Vérif. suppression conversion | ProductFormDialog | 30 min |

### 🎨 Sprint 2 (Semaine 3-4) — UX Produit (P1)

| Tâche | Fichier(s) | Effort |
|-------|-----------|--------|
| Form produit unifié (step 1+2 merged) | ProductFormDialog (refactor majeur) | 4h |
| Réassignation en masse catégorie | CategoriesPage | 2h |

### ⚡ Sprint 3 (Semaine 5-6) — Inline Creation (P2)

| Tâche | Fichier(s) | Effort |
|-------|-----------|--------|
| Catégorie inline dans form produit | ProductFormDialog | 2h |
| UDM inline dans form produit | ProductFormDialog | 2h |

### 🔧 Sprint 4 (Semaine 7-8) — Polish (P2-P3)

| Tâche | Fichier(s) | Effort |
|-------|-----------|--------|
| Soft delete catégories | masterData, CategoriesPage | 1h |
| Filtre statut CategoriesPage | CategoriesPage | 30 min |
| Audit trail (ProductHistory) | ProductHistory, ProductDetailDrawer | 3h |

### 🚀 Sprint 5+ — Nice-to-have (P3)

| Tâche | Effort |
|-------|--------|
| Cloner un produit | 1h |
| Réapprovisionnement intelligent | 3h |
| Import/Export CSV catégories | 1.5h |
| Hiérarchie catégories (tree view) | 5h (si décision ✅) |

### Estimation globale

| Phase | Durée | Impact |
|-------|:-----:|:------:|
| P0 — Data Integrity | 1-2 sem. | 🔴 Critique |
| P1 — UX Produit | 2 sem. | 🟠 Élevé |
| P2 — Inline Creation | 2 sem. | 🟡 Moyen |
| P2-P3 — Polish | 2 sem. | 🟡 Moyen |
| P3+ — Advanced | Variable | 🟢 Faible |

**Total P0-P2** : ~8 semaines (2 mois)

---

## 18. Checklist d'implémentation

### Phase 1 — Data Integrity (P0)

- [ ] Auto-cascade renommage catégorie
  - [ ] Test : renommer → produits mis à jour
  - [ ] Toast : "X produit(s) mis à jour"
- [ ] Auto-cascade renommage UDM
  - [ ] Test : renommer abbr → product.uom + conversions + UDM dérivées
  - [ ] Toast : "Y entités mises à jour"
- [ ] Vérification suppression conversion
  - [ ] Check PO ouvertes
  - [ ] Check SO ouvertes
  - [ ] Toast d'erreur si bloqué

### Phase 2 — UX Produit (P1)

- [ ] Form unifié produit
  - [ ] Section 1 : Infos de base
  - [ ] Section 2 : Conversions (collapsible)
  - [ ] Validation Zod complet
  - [ ] Tests e2e
- [ ] Réassignation en masse
  - [ ] Dialog avec dropdown catégories
  - [ ] Bouton "Réassigner et supprimer"

### Phase 3 — Inline Creation (P2)

- [ ] Catégorie inline
  - [ ] Form inline collapsible
  - [ ] Validation idem CategoriesPage
  - [ ] Auto-sélection après création
- [ ] UDM inline
  - [ ] Form inline collapsible
  - [ ] Validation idem UomPage
  - [ ] Auto-sélection après création

### Phase 4 — Polish (P2-P3)

- [ ] Soft delete catégories
- [ ] Filtre statut CategoriesPage
- [ ] Audit trail complet (ProductHistory + tab + export CSV)

### Phase 5+ — Nice-to-have

- [ ] Cloner un produit
- [ ] Réappro intelligent
- [ ] Import/Export CSV catégories
- [ ] Hiérarchie catégories (si validé)

---

## 📝 Décisions à valider

| Question | Proposition | Impact dev |
|----------|------------|:----------:|
| Hiérarchie catégories réelle ? | Reporter P3, valider besoin | 5h si oui |
| Audit trail persisté (DB) ou mémoire ? | MVP mémoire → DB future | +2h pour DB |
| Réappro intelligent → valeur métier ? | À valider utilisateurs | 3h si oui |
| Soft delete catégories ? | ✅ Proposé (cohérence) | +1h |

---

**Version** : 3.0 | **Statut** : ✅ Plan consolidé — Prêt pour implémentation 🚀
