# 📋 Master Plan — Produits, Catégories & Unités de Mesure
## Logique métier, Relations, Flux, Scénarios Admin et UX optimisée

**Version** : 2.0 (Enrichie)  
**Date** : Mars 2026  
**Statut** : Prêt pour développement

---

## 📑 Table des matières

1. [Modèle de données](#1-modèle-de-données)
2. [Diagramme de relations](#2-diagramme-de-relations)
3. [Gestion d'état](#3-gestion-détat)
4. [Scénarios Admin — Produits (CRUD complet)](#4-scénarios-admin--produits-crud-complet)
5. [Scénarios Admin — Catégories (CRUD complet)](#5-scénarios-admin--catégories-crud-complet)
6. [Scénarios Admin — Unités de Mesure (CRUD complet)](#6-scénarios-admin--unités-de-mesure-crud-complet)
7. [Flux de filtrage et affichage](#7-flux-de-filtrage-et-affichage-products)
8. [Dépendances inter-modules](#8-dépendances-inter-modules)
9. [États et transitions](#9-états-et-transitions)
10. [Validations client + serveur](#10-validations-client--serveur)
11. [Contrôle d'accès (Permissions)](#11-contrôle-daccès-permissions-par-rôle)
12. [Scénarios complexes (cross-entités)](#12-scénarios-complexes-cross-entités)
13. [Audit Trail & Historique](#13-audit-trail--historique)
14. [Problèmes connus et dette technique](#14-problèmes-connus-et-dette-technique)
15. [UX optimisée proposée](#15-ux-optimisée-proposée--actions-minimales)
16. [Matrice récapitulative — Actions Admin](#16-matrice-récapitulative--actions-admin)
17. [Spécifications UI — Inline Creation](#17-spécifications-ui--inline-creation)
18. [Priorités d'implémentation](#18-priorités-dimplémentation)
19. [Roadmap d'implémentation](#19-roadmap-dimplémentation)

---

## 1. Modèle de données

### 1.1 Product (`Product` — `src/data/masterData.ts`)

```typescript
{
  id: string;            // "P001" ou "P-XXXXXXXX" (auto-généré)
  name: string;          // "Ciment CPJ 42.5 (50kg)" — min 2 car.
  sku: string;           // "CONST-001" — unique, [A-Za-z0-9\-_]{3,}
  category: string;      // ⚠ TEXT = ProductCategory.name (pas l'ID !)
  uom: string;           // Label unité de base ("Sac", "Pièce", "m²")
  baseUnitId?: string;   // FK → UnitOfMeasure.id
  unitCost: number;      // Coût unitaire (DZD par unité de base) ≥ 0
  unitPrice: number;     // Prix de vente unitaire (DZD) ≥ 0
  reorderPoint: number;  // Seuil de réapprovisionnement ≥ 0
  isActive: boolean;     // Actif / Inactif
  isDeleted?: boolean;   // Soft-delete — restaurable
  baseUnit?: string;     // Nom unité de base (legacy)
  baseUnitAbbr?: string; // Abréviation (legacy)
}
```

### 1.2 ProductCategory (`ProductCategory` — `src/data/masterData.ts`)

```typescript
{
  id: string;            // "CAT-001"
  name: string;          // "Ciment & Liants" — unique (case-insensitive)
  parentId?: string;     // Hiérarchie parent (pour future tree view)
  description: string;   // Description optionnelle
  productCount: number;  // ⚠ DEPRECATED — utiliser dynamicCounts en UI
  status: "Active" | "Inactive";
  isDeleted?: boolean;   // Soft-delete (nouveau, pour cohérence)
}
```

### 1.3 UnitOfMeasure (`UnitOfMeasure` — `src/data/masterData.ts`)

```typescript
{
  id: string;                 // "UOM-001"
  name: string;               // "Kilogramme" — unique (case-insensitive)
  abbreviation: string;       // "kg" — unique (case-insensitive)
  type: "Weight" | "Volume" | "Count" | "Length" | "Area";
  unitKind: "PHYSICAL";
  baseUnit?: string;          // Abréviation de l'UDM de base (ex: "kg" pour "Tonne")
  conversionFactor?: number;  // 1 de cette unité = X de l'unité de base (> 0)
}
```

### 1.4 ProductUnitConversion (`src/lib/unitConversion.ts`)

```typescript
{
  id: string;                    // "PUC-XXXXXXXX"
  productId: string;             // FK → Product.id
  unitName: string;              // "Carton"
  unitAbbreviation: string;      // "Ctn" — unique par productId
  conversionFactor: number;      // 1 Ctn = 24 unités de base (> 0)
  allowBuy: boolean;             // Utilisable en achat
  allowSell: boolean;            // Utilisable en vente
  sortOrder: number;             // Ordre d'affichage
}
```

### 1.5 ProductBaseUnit (`src/lib/unitConversion.ts`)

```typescript
{
  productId: string;             // FK → Product.id
  baseUnitName: string;          // "Pièce"
  baseUnitAbbreviation: string;  // "Pce"
}
```

### 1.6 ProductHistory (NEW — Audit Trail)

```typescript
{
  id: string;                    // "PH-{timestamp}-{uuid}"
  productId: string;             // FK → Product.id
  action: "created" | "modified" | "deleted" | "undeleted";
  changedFields?: {
    [fieldName]: {
      oldValue: any;
      newValue: any;
    }
  };
  changedBy: string;             // user email ou ID
  changedAt: ISO8601 timestamp;
  reason?: string;               // raison suppression/modification
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
         ▲                                        │
         │ peut dériver                          │
         │ (si baseUnit défini)                  │
         │                                    productId
         └────────────────────────────────┐      │
                                          │      │
┌─────────────────────────┐        ┌─────┴──────▼───────────┐
│   ProductCategory       │◄───────│       Product            │
│                         │  par   │                          │
│  id: "CAT-001"          │  name  │  category: "Ciment…"     │
│  name: "Ciment…"        │ (TEXT  │  baseUnitId?: "UOM-001"  │
│  status: Active         │  ⚠)   │  uom: "Sac"             │
│  isDeleted?: false      │        │  sku: "CONST-001"        │
│  parentId?: …           │        │  isActive: true          │
└─────────────────────────┘        │  isDeleted?: false       │
                                   └─────────────┬───────────┘
                                                 │
                                    ┌────────────┼────────────┬─────────────────┐
                                    │            │            │                 │
                                    ▼            ▼            ▼                 ▼
                          ┌──────────────┐ ┌──────────┐ ┌──────────────┐ ┌──────────────┐
                          │InventoryItem │ │ PO/SO    │ │ProductUnitConv│ │ProductHistory│
                          │productId     │ │ lines[]  │ │productId     │ │productId    │
                          │warehouseId   │ │productId │ │unitName      │ │action       │
                          │qtyOnHand     │ │unitId    │ │factor        │ │changedBy    │
                          └──────────────┘ │          │ └──────────────┘ │changedAt    │
                                           └──────────┘                   └──────────────┘

LEGENDE:
  ⚠ = Lien par NOM (problématique, à corriger avec P0)
  FK = Foreign Key (relation logique)
```

### ⚠️ Problème critique : Catégorie liée par NOM, pas par ID

- `Product.category` stocke le **nom textuel** de la catégorie
- Renommer une catégorie **casse le lien** avec tous ses produits
- **Solution P0** : Auto-cascade renommage (voir § 18)

---

## 3. Gestion d'état (`WMSDataContext`)

| State                     | Setter                       | Type de données                       | Pages/modules consommateurs                    |
|---------------------------|------------------------------|---------------------------------------|-------------------------------------------------------|
| `products`                | `setProducts`                | `Product[]`                          | ProductsPage, OrderForm, Inventory, PO, SO           |
| `productCategories`       | `setProductCategories`       | `ProductCategory[]`                  | CategoriesPage, ProductFormDialog (dropdown)         |
| `unitsOfMeasure`          | `setUnitsOfMeasure`          | `UnitOfMeasure[]`                    | UomPage, ProductFormDialog, UnitSelector             |
| `productUnitConversions`  | `setProductUnitConversions`  | `ProductUnitConversion[]`            | ProductFormDialog (step 2), UnitSelector, Orders     |
| `productBaseUnits`        | `setProductBaseUnits`        | `ProductBaseUnit[]`                  | ProductFormDialog, useUnitConversion                 |
| `inventory`               | `setInventory`               | `InventoryItem[]`                    | Stock totals, filtres entrepôt                       |
| `productHistory`          | `setProductHistory`          | `ProductHistory[]`                   | ProductDetailDrawer (tab Historique) — future        |

### Règles de synchronisation

```typescript
// Quand une ProductCategory est renommée:
// 1. setProductCategories([...updated])
// 2. setProducts(prev => prev.map(p => 
//      p.category === oldName ? { ...p, category: newName } : p
//    ))
// 3. Toast: "X produit(s) mis à jour automatiquement"

// Quand une UnitOfMeasure.abbreviation change:
// 1. setUnitsOfMeasure([...updated])
// 2. setProducts(prev => prev.map(p =>
//      p.uom === oldAbbr ? { ...p, uom: newAbbr } : p
//    ))
// 3. setProductUnitConversions(prev => prev.map(c =>
//      c.unitAbbreviation === oldAbbr ? { ...c, unitAbbreviation: newAbbr } : c
//    ))
// 4. setUnitsOfMeasure(prev => prev.map(u =>
//      u.baseUnit === oldAbbr ? { ...u, baseUnit: newAbbr } : u
//    ))
// 5. Toast: "Y UDM dérivées mises à jour"
```

---

## 4. Scénarios Admin — Produits (CRUD complet)

### 4.1 🟢 CRÉER un produit (UX optimisée — 1 dialog)

**Chemin** : `ProductsPage → "+ Nouveau produit" → ProductFormDialog (unifié)`

#### Étape 1 — Formulaire unifié (NEW)

```
┌─────────────────────────────────────────────┐
│         Créer un produit                    │
├─────────────────────────────────────────────┤
│                                             │
│ INFOS DE BASE (section 1)                   │
│ ─────────────────────────────────────────   │
│                                             │
│ Nom du produit * ______________________     │
│   Validation: min 2 car., unique OK         │
│                                             │
│ SKU * ______________________                │
│   Format: [A-Za-z0-9\-_]{3,}, unique       │
│                                             │
│ Catégorie * ▼ [Ciment & Liants]            │
│   [+ Créer une catégorie] ← green btn       │
│   (inline form if clicked — voir § 17)      │
│                                             │
│ Unité de base * ▼ [Sac]                    │
│   [+ Créer une UDM] ← green btn             │
│   (inline form if clicked — voir § 17)      │
│                                             │
│ Coût unitaire (DZD) [0.00]                  │
│   Validation: number ≥ 0                    │
│                                             │
│ Prix unitaire (DZD) [0.00]                  │
│   Validation: number ≥ 0                    │
│                                             │
│ Seuil réappro. [0]                          │
│   Validation: number ≥ 0                    │
│                                             │
│ Statut ☐ Actif (default)                   │
│                                             │
├─────────────────────────────────────────────┤
│ CONVERSIONS D'UNITÉS (section 2 — collapsible)
│ ─────────────────────────────────────────   │
│                                             │
│ ▼ Convertisseurs (expansion panel)          │
│                                             │
│   Unité de base : Sac (auto) — factor=1    │
│   [Achat ☑] [Vente ☑]                      │
│                                             │
│   [+ Ajouter une unité]                     │
│   ├─ Carton          factor=24 [A☑V☑] [X]  │
│   ├─ Palette         factor=400 [A☑V☐] [X] │
│                                             │
│   Formulaire inline (si clicked):           │
│   ├─ Nom: [_________]                       │
│   ├─ Abrév: [__]                            │
│   ├─ Factor: [__]                           │
│   └─ [Ajouter] [Annuler]                    │
│                                             │
├─────────────────────────────────────────────┤
│        [Créer]              [Annuler]       │
└─────────────────────────────────────────────┘
```

#### Étape 2 — Validation (handleSave)

```typescript
const productSchema = z.object({
  name: z.string().min(2, "Min 2 caractères").max(100),
  sku: z.string()
    .regex(/^[A-Za-z0-9\-_]{3,}$/, "Format invalide")
    .refine(val => !existingSkus.includes(val), "SKU déjà utilisé"),
  category: z.string().min(1, "Catégorie requise")
    .refine(val => categories.some(c => c.name === val), "Cat. inexistante"),
  uom: z.string().min(1, "Unité de base requise"),
  unitCost: z.number().nonnegative("Doit être ≥ 0"),
  unitPrice: z.number().nonnegative("Doit être ≥ 0"),
  reorderPoint: z.number().nonnegative("Doit être ≥ 0"),
  isActive: z.boolean().default(true),
});

const conversionSchema = z.object({
  unitName: z.string().min(1),
  unitAbbreviation: z.string().min(1).max(10)
    .refine(val => !existingConvAbbrForProduct.includes(val), "Abbr. dupliquée"),
  conversionFactor: z.number().gt(0, "Doit être > 0"),
  allowBuy: z.boolean(),
  allowSell: z.boolean(),
});

// Validation du formulaire
const result = productSchema.safeParse(formData);
if (!result.success) {
  Toast.error(result.error.flatten());
  return;
}

// Génération ID
const newProduct: Product = {
  id: `P-${crypto.randomUUID().substring(0, 8)}`,
  ...result.data,
  baseUnitId: unitsOfMeasure.find(u => u.name === formData.uom)?.id,
  isDeleted: false,
};

// Validation conversions
const validConversions = formData.conversions?.every(c =>
  conversionSchema.safeParse(c).success
) ?? true;
if (!validConversions) {
  Toast.error("Conversions invalides");
  return;
}

// Simulation async (demo)
await delay(400);

// Sauvegarde
setProducts(prev => [...prev, newProduct]);

// Ajouter conversions
if (formData.conversions && formData.conversions.length > 0) {
  const newConversions = formData.conversions.map((c, idx) => ({
    id: `PUC-${newProduct.id}-${idx}`,
    productId: newProduct.id,
    ...c,
  }));
  setProductUnitConversions(prev => [...prev, ...newConversions]);
}

// Audit trail
setProductHistory(prev => [...prev, {
  id: `PH-${Date.now()}-${crypto.randomUUID().substring(0, 8)}`,
  productId: newProduct.id,
  action: "created",
  changedBy: currentUser.email,
  changedAt: new Date().toISOString(),
  changedFields: undefined,
}]);

Toast.success("Produit créé avec conversions");
dialog.close();
```

#### Étape 3 — Résultat

- ✅ Produit créé avec ID auto
- ✅ Unité de base auto-ajoutée comme conversion (factor=1)
- ✅ Conversions supplémentaires sauvegardées immédiatement
- ✅ Historique créé
- ✅ Toast confirmation
- ✅ Dialog fermé

**Actions admin** : 7+ champs → 1 clic "Créer" (vs 2 dialogs avant)

---

### 4.2 🔵 MODIFIER un produit

**Chemin** : `ProductsPage → icône crayon → ProductFormDialog (mode editing)`

#### Étape 1 — Pré-remplissage

```typescript
const openEdit = (product: Product) => {
  const conversions = productUnitConversions.filter(
    c => c.productId === product.id
  );
  const baseUnit = productBaseUnits.find(p => p.productId === product.id);
  
  setFormData({
    ...product,
    conversions, // Toutes les conversions existantes
  });
  
  // Si stock > 0 → verrouiller champ unité de base
  const stock = inventory.reduce((sum, i) => 
    i.productId === product.id ? sum + i.qtyOnHand : sum, 0
  );
  if (stock > 0) {
    setFieldDisabled("uom", true);
    setFieldDisabled("baseUnitId", true);
  }
  
  setMode("edit");
  dialog.open();
};
```

#### Étape 2 — Step tabs visibles

```
┌─────────────────────────────────────────────┐
│  Modifier : Ciment CPJ 42.5                 │
├───────────────────┬─────────────────────────┤
│ 1. Infos de base  │ 2. Unités               │
├─────────────────────────────────────────────┤
│  ... (identique à création)                 │
│                                             │
│ Unité de base ▼ [Sac] (DISABLED si stock)   │
│   ⚠️ "Ne peut pas changer si stock > 0"     │
│                                             │
└─────────────────────────────────────────────┘
```

#### Étape 3 — Sauvegarde (handleSave)

```typescript
const handleSave = async (formData) => {
  // Validations
  const result = productSchema.safeParse(formData);
  if (!result.success) {
    Toast.error(result.error.flatten());
    return;
  }
  
  const oldProduct = products.find(p => p.id === formData.id)!;
  
  // Détection changements
  const changedFields: Record<string, any> = {};
  Object.keys(result.data).forEach(key => {
    if (oldProduct[key] !== result.data[key]) {
      changedFields[key] = {
        oldValue: oldProduct[key],
        newValue: result.data[key],
      };
    }
  });
  
  // Sauvegarde produit
  setProducts(prev => prev.map(p =>
    p.id === formData.id ? { ...p, ...result.data } : p
  ));
  
  // Sauvegarde conversions
  const oldConversions = productUnitConversions.filter(
    c => c.productId === formData.id
  );
  
  formData.conversions?.forEach((conv, idx) => {
    const existing = oldConversions[idx];
    if (existing) {
      // Update
      setProductUnitConversions(prev => prev.map(c =>
        c.id === existing.id ? { ...c, ...conv } : c
      ));
    } else {
      // Add new
      setProductUnitConversions(prev => [...prev, {
        id: `PUC-${formData.id}-${Date.now()}`,
        productId: formData.id,
        ...conv,
      }]);
    }
  });
  
  // Trigger financiel (si coût changé)
  if ("unitCost" in changedFields) {
    onCostChanged(
      formData.id,
      changedFields.unitCost.oldValue,
      changedFields.unitCost.newValue,
      currentUser.email
    );
  }
  
  // Audit trail
  setProductHistory(prev => [...prev, {
    id: `PH-${Date.now()}-${crypto.randomUUID().substring(0, 8)}`,
    productId: formData.id,
    action: "modified",
    changedFields: Object.keys(changedFields).length > 0 ? changedFields : undefined,
    changedBy: currentUser.email,
    changedAt: new Date().toISOString(),
  }]);
  
  Toast.success("Produit modifié");
  dialog.close();
};
```

**Actions admin** : Modifier champs souhaités → 1 clic "Enregistrer"

---

### 4.3 🔴 SUPPRIMER un produit (Soft Delete)

**Chemin** : `ProductsPage → icône poubelle → ProductDeleteDialog`

```typescript
const getDeleteBlockReasons = (product: Product): BlockReason[] => {
  const reasons: BlockReason[] = [];
  
  // Vérifier stock
  const totalStock = inventory.reduce((sum, i) =>
    i.productId === product.id ? sum + i.qtyOnHand : sum, 0
  );
  if (totalStock > 0) {
    reasons.push({
      type: "STOCK_EXISTS",
      message: `Stock existant: ${totalStock} unités`,
      canOverride: false, // Admin peut forcer ? À décider
    });
  }
  
  // Vérifier PO ouvertes
  const openPOs = purchaseOrders.filter(po =>
    po.status !== "Received" &&
    po.status !== "Cancelled" &&
    po.lines.some(l => l.productId === product.id)
  );
  if (openPOs.length > 0) {
    reasons.push({
      type: "OPEN_PO",
      message: `PO ouvertes: ${openPOs.map(p => p.id).join(", ")}`,
      canOverride: false,
    });
  }
  
  // Vérifier SO ouvertes
  const openSOs = salesOrders.filter(so =>
    so.status !== "Delivered" &&
    so.status !== "Invoiced" &&
    so.status !== "Cancelled" &&
    so.lines.some(l => l.productId === product.id)
  );
  if (openSOs.length > 0) {
    reasons.push({
      type: "OPEN_SO",
      message: `SO ouvertes: ${openSOs.map(s => s.id).join(", ")}`,
      canOverride: false,
    });
  }
  
  return reasons;
};

const handleDelete = async (product: Product) => {
  const blockReasons = getDeleteBlockReasons(product);
  
  if (blockReasons.some(r => !r.canOverride)) {
    // Afficher les raisons
    setBlockedReasons(blockReasons);
    setCanProceed(false);
    return;
  }
  
  // Dialog confirmation
  const confirmed = await confirm(
    `Supprimer "${product.name}" ? Cette action ne peut pas être annulée.`
  );
  
  if (!confirmed) return;
  
  // Soft delete
  setProducts(prev => prev.map(p =>
    p.id === product.id
      ? { ...p, isActive: false, isDeleted: true }
      : p
  ));
  
  // Audit trail
  setProductHistory(prev => [...prev, {
    id: `PH-${Date.now()}-${crypto.randomUUID().substring(0, 8)}`,
    productId: product.id,
    action: "deleted",
    changedBy: currentUser.email,
    changedAt: new Date().toISOString(),
    reason: "Suppression via Admin",
  }]);
  
  Toast.success("Produit archivé");
};
```

**Actions admin** : 1 clic poubelle → 1 clic confirmer (si autorisé)

---

### 4.4 🟡 ACTIVER / DÉSACTIVER un produit

**Chemin** : `ProductsPage → switch toggle dans la colonne Statut`

```typescript
const handleToggleActive = async (product: Product) => {
  const willDeactivate = product.isActive;
  
  if (willDeactivate) {
    // Vérifier SO ouvertes
    const openSOs = salesOrders.filter(so =>
      so.status !== "Delivered" &&
      so.status !== "Invoiced" &&
      so.status !== "Cancelled" &&
      so.lines.some(l => l.productId === product.id)
    );
    
    if (openSOs.length > 0) {
      Toast.error(
        `Impossible de désactiver : ${openSOs.length} SO ouverte(s)`
      );
      return;
    }
  }
  
  // Toggle
  setProducts(prev => prev.map(p =>
    p.id === product.id ? { ...p, isActive: !p.isActive } : p
  ));
  
  // Audit trail
  setProductHistory(prev => [...prev, {
    id: `PH-${Date.now()}-${crypto.randomUUID().substring(0, 8)}`,
    productId: product.id,
    action: "modified",
    changedFields: { isActive: { oldValue: product.isActive, newValue: !product.isActive } },
    changedBy: currentUser.email,
    changedAt: new Date().toISOString(),
  }]);
  
  Toast.success(`Produit ${!product.isActive ? "activé" : "désactivé"}`);
};
```

**Actions admin** : 1 clic toggle

---

### 4.5 👁 VOIR le détail d'un produit

**Chemin** : `ProductsPage → icône œil → ProductDetailDrawer`

```typescript
// Drawer latéral avec :
// ├─ Tab 1 : Infos générales
// │  ├─ Name, SKU, Category, UOM
// │  ├─ Coûts, seuil réappro, statut
// │  └─ Stock par entrepôt
// │
// ├─ Tab 2 : Unités de conversion
// │  └─ Tableau des conversions existantes
// │
// ├─ Tab 3 : Historique (ProductHistory)
// │  ├─ Colonne: Date | Action | Champ | Ancien | Nouveau | Par
// │  ├─ Exemple: "2025-03-01 | modified | unitCost | 100 | 120 | admin@..."
// │  └─ Pagination (20 items)
// │
// └─ Tab 4 : Mouvements stock
//    └─ Inventaire par warehouse + historique
```

---

### 4.6 💰 GÉRER le pricing d'un produit

**Chemin** : `ProductsPage → icône prix → ProductPricingDialog`

- Voir/modifier les règles de prix spécifiques
- Historique des changements de prix (via ProductHistory)
- Lier à des périodes/clients spécifiques (si besoin)

---

### 4.7 📏 GÉRER les unités d'un produit (standalone)

**Chemin** : `ProductsPage → icône unités → ProductUnitsDialog`

- Identique au Step 2 du formulaire produit (création/modif)
- Permet gérer conversions sans ouvrir la fiche produit

---

### 4.8 📤 EXPORTER les produits

**Chemin** : `ProductsPage → "Exporter" → ExportDialog`

```typescript
const exportProducts = (filtered: Product[], format: "csv" | "xlsx") => {
  const data = filtered.map(p => ({
    SKU: p.sku,
    Nom: p.name,
    Catégorie: p.category,
    UnitéBase: p.uom,
    CoutUnitaire: p.unitCost,
    PrixUnitaire: p.unitPrice,
    SeuilRéappro: p.reorderPoint,
    Statut: p.isActive ? "Actif" : "Inactif",
  }));
  
  if (format === "csv") {
    exportToCSV(data, "products.csv");
  } else if (format === "xlsx") {
    exportToExcel(data, "products.xlsx");
  }
};
```

---

### 4.9 📏 AJOUTER une conversion d'unité (inline dans ProductFormDialog)

**Chemin** : `ProductFormDialog → Step 2 → "+ Ajouter une unité"`

```typescript
const handleAddConversion = (conversion: ProductUnitConversion) => {
  // Validations
  const schema = z.object({
    unitName: z.string().min(1, "Nom requis"),
    unitAbbreviation: z.string()
      .min(1, "Abréviation requise")
      .max(10, "Max 10 caractères")
      .refine(
        val => !formData.conversions.some(c => c.unitAbbreviation === val),
        "Abréviation déjà utilisée"
      ),
    conversionFactor: z.number()
      .gt(0, "Doit être > 0"),
    allowBuy: z.boolean(),
    allowSell: z.boolean(),
  });
  
  const result = schema.safeParse(conversion);
  if (!result.success) {
    Toast.error("Conversion invalide");
    return;
  }
  
  // Si factor = 1 et pas de base unit → auto-set comme base
  if (conversion.conversionFactor === 1) {
    setFormData(prev => ({
      ...prev,
      baseUnitId: unitOfMeasure.find(u => u.name === conversion.unitName)?.id,
    }));
  }
  
  // Ajouter à la liste
  setFormData(prev => ({
    ...prev,
    conversions: [...prev.conversions, {
      id: `PUC-TEMP-${Date.now()}`,
      productId: formData.id || "NEW",
      ...result.data,
    }],
  }));
  
  Toast.success("Unité ajoutée");
  setInlineFormVisible(false); // Fermer le formulaire inline
};
```

---

### 4.10 🗑 SUPPRIMER une conversion d'unité

**Chemin** : `ProductFormDialog → Step 2 → icône poubelle sur la ligne`

```typescript
const handleDeleteConversion = (conversionId: string) => {
  // NEW: Vérifier si utilisée dans PO/SO
  const usedInPOs = purchaseOrders.flatMap(po => po.lines).some(l =>
    l.unitId === conversionId
  );
  
  const usedInSOs = salesOrders.flatMap(so => so.lines).some(l =>
    l.unitId === conversionId
  );
  
  if (usedInPOs || usedInSOs) {
    Toast.error(
      "Impossible de supprimer : utilisée dans des PO/SO ouvertes"
    );
    return;
  }
  
  // Supprimer
  setFormData(prev => ({
    ...prev,
    conversions: prev.conversions.filter(c => c.id !== conversionId),
  }));
  
  Toast.success("Unité supprimée");
};
```

---

## 5. Scénarios Admin — Catégories (CRUD complet)

### 5.1 🟢 CRÉER une catégorie

**Chemin** : `CategoriesPage → "+ Nouvelle catégorie" → Dialog`

```typescript
const handleCreateCategory = (data: ProductCategory) => {
  // Validation
  const schema = z.object({
    name: z.string()
      .min(1, "Nom requis")
      .refine(
        val => !categories.some(c => c.name.toLowerCase() === val.toLowerCase()),
        "Catégorie déjà existante"
      ),
    description: z.string().optional(),
    status: z.enum(["Active", "Inactive"]).default("Active"),
  });
  
  const result = schema.safeParse(data);
  if (!result.success) {
    Toast.error(result.error.flatten());
    return;
  }
  
  // Créer
  const newCategory: ProductCategory = {
    id: `CAT-${categories.length + 1}`,
    ...result.data,
    productCount: 0, // Will be computed dynamically
    isDeleted: false,
  };
  
  setProductCategories(prev => [...prev, newCategory]);
  
  Toast.success("Catégorie créée");
  dialog.close();
};
```

**Actions admin** : 2-3 champs → 1 clic "Créer"

---

### 5.2 🔵 MODIFIER une catégorie (avec auto-cascade)

**Chemin** : `CategoriesPage → icône crayon → Dialog pré-rempli`

```typescript
const handleUpdateCategory = (id: string, data: Partial<ProductCategory>) => {
  const oldCategory = productCategories.find(c => c.id === id)!;
  const oldName = oldCategory.name;
  const newName = data.name || oldName;
  
  // Validation
  const schema = z.object({
    name: z.string().min(1)
      .refine(
        val => !productCategories.some(c =>
          c.id !== id && c.name.toLowerCase() === val.toLowerCase()
        ),
        "Nom déjà utilisé"
      ),
    description: z.string().optional(),
    status: z.enum(["Active", "Inactive"]).optional(),
  });
  
  const result = schema.safeParse(data);
  if (!result.success) {
    Toast.error(result.error.flatten());
    return;
  }
  
  // Mettre à jour catégorie
  setProductCategories(prev => prev.map(c =>
    c.id === id ? { ...c, ...result.data } : c
  ));
  
  // AUTO-CASCADE: Mettre à jour tous les produits
  if (oldName !== newName) {
    const affectedCount = products.filter(p => p.category === oldName).length;
    
    setProducts(prev => prev.map(p =>
      p.category === oldName ? { ...p, category: newName } : p
    ));
    
    if (affectedCount > 0) {
      Toast.success(`${affectedCount} produit(s) mis à jour automatiquement`);
    }
  }
  
  // Audit (optionnel)
  Toast.info("Catégorie modifiée");
  dialog.close();
};
```

**✅ Nouveau** : AUTO-CASCADE — Aucune action manuelle requise

---

### 5.3 🔴 SUPPRIMER une catégorie (avec réassignation en masse)

**Chemin** : `CategoriesPage → icône poubelle → Dialog optimisée`

```typescript
const handleDeleteCategory = async (category: ProductCategory) => {
  // Compter produits
  const affectedProducts = products.filter(p => p.category === category.name);
  const count = affectedProducts.length;
  
  if (count > 0) {
    // Dialog 1: Proposer réassignation
    const targetCategory = await showReassignmentDialog({
      affectedCount: count,
      availableCategories: productCategories.filter(c => c.id !== category.id),
    });
    
    if (!targetCategory) return; // Annulé
    
    // Réassigner en masse
    setProducts(prev => prev.map(p =>
      p.category === category.name
        ? { ...p, category: targetCategory.name }
        : p
    ));
    
    Toast.success(`${count} produit(s) réassignés vers "${targetCategory.name}"`);
  }
  
  // Soft delete (NEW: cohérence avec products)
  setProductCategories(prev => prev.map(c =>
    c.id === category.id
      ? { ...c, isDeleted: true, status: "Inactive" }
      : c
  ));
  
  Toast.success("Catégorie supprimée");
};
```

#### UI Réassignation

```
┌─────────────────────────────────────────────┐
│  Réassigner avant suppression               │
├─────────────────────────────────────────────┤
│                                             │
│ La catégorie "Ciment & Liants" contient:    │
│ ✓ 15 produit(s)                             │
│                                             │
│ Vers quelle catégorie les réassigner ?      │
│                                             │
│ ▼ [Aciers & Métaux]                         │
│   Options: Aciers & Métaux, Électricité,   │
│            Plomberie, Isolation, ...         │
│                                             │
├─────────────────────────────────────────────┤
│   [Réassigner & Supprimer]  [Annuler]       │
└─────────────────────────────────────────────┘
```

---

### 5.4 🔍 FILTRER les catégories

```typescript
const filteredCategories = productCategories
  .filter(c => !c.isDeleted) // Exclure les soft-deleted
  .filter(c => {
    if (searchTerm) {
      return c.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  })
  .filter(c => {
    if (filterStatus !== "all") {
      return c.status === (filterStatus === "active" ? "Active" : "Inactive");
    }
    return true;
  });

// Compteur dynamique
const dynamicCounts = filteredCategories.map(cat => ({
  categoryId: cat.id,
  count: products.filter(p => p.category === cat.name && !p.isDeleted).length,
}));
```

**Nouveau** : Filtre par statut + comptage dynamique

---

## 6. Scénarios Admin — Unités de Mesure (CRUD complet)

### 6.1 🟢 CRÉER une UDM

**Chemin** : `UomPage → "+ Nouvelle UDM" → Dialog`

```typescript
const handleCreateUom = (data: UnitOfMeasure) => {
  const schema = z.object({
    name: z.string().min(1)
      .refine(
        val => !unitsOfMeasure.some(u => u.name.toLowerCase() === val.toLowerCase()),
        "Nom déjà utilisé"
      ),
    abbreviation: z.string()
      .min(1).max(10)
      .refine(
        val => !unitsOfMeasure.some(u => u.abbreviation.toLowerCase() === val.toLowerCase()),
        "Abréviation déjà utilisée"
      ),
    type: z.enum(["Weight", "Volume", "Count", "Length", "Area"]),
    baseUnit: z.string().optional()
      .refine(
        val => !val || unitsOfMeasure.some(u => u.abbreviation === val),
        "UDM de base inexistante"
      )
      .refine(
        val => !val || !wouldCreateCycle(val, data.abbreviation),
        "Cycle détecté (A→B→C→A)"
      ),
    conversionFactor: z.number()
      .gt(0, "Doit être > 0")
      .optional()
      .refine(
        val => !data.baseUnit || val, // Si baseUnit → factor obligatoire
        "Facteur requis si UDM de base définie"
      ),
  });
  
  const result = schema.safeParse(data);
  if (!result.success) {
    Toast.error(result.error.flatten());
    return;
  }
  
  const newUom: UnitOfMeasure = {
    id: `UOM-${unitsOfMeasure.length + 1}`,
    type: result.data.type,
    unitKind: "PHYSICAL",
    ...result.data,
  };
  
  setUnitsOfMeasure(prev => [...prev, newUom]);
  Toast.success("UDM créée");
  dialog.close();
};

// Détection cycle
const wouldCreateCycle = (targetBase: string, currentAbbr: string): boolean => {
  const visited = new Set<string>();
  let current = targetBase;
  
  while (current) {
    if (visited.has(current)) return true; // Cycle détecté
    if (current === currentAbbr) return true; // Créerait une boucle
    
    visited.add(current);
    const next = unitsOfMeasure.find(u => u.abbreviation === current);
    current = next?.baseUnit;
  }
  
  return false;
};
```

---

### 6.2 🔵 MODIFIER une UDM (avec auto-cascade)

**Chemin** : `UomPage → icône crayon → Dialog pré-rempli`

```typescript
const handleUpdateUom = (id: string, data: Partial<UnitOfMeasure>) => {
  const oldUom = unitsOfMeasure.find(u => u.id === id)!;
  const oldAbbr = oldUom.abbreviation;
  const newAbbr = data.abbreviation || oldAbbr;
  
  // Validations idem création
  const schema = z.object({
    abbreviation: z.string().min(1).max(10)
      .refine(
        val => val === oldAbbr || !unitsOfMeasure.some(u =>
          u.id !== id && u.abbreviation.toLowerCase() === val.toLowerCase()
        ),
        "Abréviation déjà utilisée"
      ),
    // ...autres champs
  });
  
  const result = schema.safeParse(data);
  if (!result.success) {
    Toast.error(result.error.flatten());
    return;
  }
  
  // Mettre à jour UDM
  setUnitsOfMeasure(prev => prev.map(u =>
    u.id === id ? { ...u, ...result.data } : u
  ));
  
  // AUTO-CASCADE: Mettre à jour tous les produits
  if (oldAbbr !== newAbbr) {
    setProducts(prev => prev.map(p =>
      p.uom === oldAbbr ? { ...p, uom: newAbbr } : p
    ));
    
    // Mettre à jour les conversions
    setProductUnitConversions(prev => prev.map(c =>
      c.unitAbbreviation === oldAbbr
        ? { ...c, unitAbbreviation: newAbbr }
        : c
    ));
    
    // Mettre à jour les UDM dérivées
    setUnitsOfMeasure(prev => prev.map(u =>
      u.baseUnit === oldAbbr
        ? { ...u, baseUnit: newAbbr }
        : u
    ));
    
    Toast.success("Abréviation mise à jour (changements en cascade)");
  }
  
  // Si facteur change pour une UDM dérivée
  if (data.conversionFactor && data.conversionFactor !== oldUom.conversionFactor) {
    Toast.warning(
      "Note: Les produits utilisant cette UDM ne sont pas recalculés"
    );
  }
  
  dialog.close();
};
```

**✅ Nouveau** : AUTO-CASCADE sur abréviation

---

### 6.3 🔴 SUPPRIMER une UDM

**Chemin** : `UomPage → icône poubelle → Dialog confirmation`

```typescript
const getDeleteBlockers = (uom: UnitOfMeasure): BlockReason[] => {
  const blockers: BlockReason[] = [];
  
  // Produits utilisant cette UDM
  const productsUsing = products.filter(p =>
    p.uom === uom.abbreviation || p.uom === uom.name
  );
  if (productsUsing.length > 0) {
    blockers.push({
      type: "PRODUCTS_USING",
      message: `Utilisée par ${productsUsing.length} produit(s)`,
    });
  }
  
  // UDM dérivées
  const derivedUnits = unitsOfMeasure.filter(u =>
    u.baseUnit === uom.abbreviation
  );
  if (derivedUnits.length > 0) {
    blockers.push({
      type: "DERIVED_UNITS",
      message: `${derivedUnits.length} UDM dérivée(s) : ${derivedUnits.map(u => u.name).join(", ")}`,
    });
  }
  
  return blockers;
};

const handleDeleteUom = (id: string) => {
  const uom = unitsOfMeasure.find(u => u.id === id)!;
  const blockers = getDeleteBlockers(uom);
  
  if (blockers.length > 0) {
    Toast.error(blockers.map(b => b.message).join("; "));
    return;
  }
  
  // Soft delete (cohérence)
  setUnitsOfMeasure(prev => prev.map(u =>
    u.id === id
      ? { ...u, isDeleted: true }
      : u
  ));
  
  Toast.success("UDM supprimée");
};
```

---

### 6.4 📤 EXPORTER les UDM (CSV)

```typescript
const exportUom = () => {
  const data = unitsOfMeasure
    .filter(u => !u.isDeleted)
    .map(u => ({
      Abréviation: u.abbreviation,
      Nom: u.name,
      Type: u.type,
      UDMdeBase: u.baseUnit || "-",
      Facteur: u.conversionFactor || 1,
    }));
  
  exportToCSV(data, "units-of-measure.csv");
};
```

---

### 6.5 📥 IMPORTER des UDM (CSV)

**Chemin** : `UomPage → "Import CSV" → Dialog textarea`

```typescript
const handleImportUom = async (csvContent: string) => {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) {
    Toast.error("CSV invalide (au moins 2 lignes)");
    return;
  }
  
  // Détection en-têtes (FR/EN)
  const headerLine = lines[0].split(",").map(h => h.trim().toLowerCase());
  const abbrevIdx = headerLine.findIndex(h =>
    ["abbreviation", "abréviation", "abbr"].includes(h)
  );
  const nameIdx = headerLine.findIndex(h =>
    ["name", "nom"].includes(h)
  );
  const typeIdx = headerLine.findIndex(h =>
    ["type"].includes(h)
  );
  
  if (abbrevIdx === -1 || nameIdx === -1) {
    Toast.error("Colonnes manquantes (Abréviation, Nom)");
    return;
  }
  
  // Parser lignes
  let added = 0, skipped = 0;
  
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",").map(c => c.trim());
    const abbr = cells[abbrevIdx];
    const name = cells[nameIdx];
    const type = cells[typeIdx] || "Count";
    
    // Vérifier doublon
    if (unitsOfMeasure.some(u => u.abbreviation.toLowerCase() === abbr.toLowerCase())) {
      skipped++;
      continue;
    }
    
    // Créer
    const newUom: UnitOfMeasure = {
      id: `UOM-IMP-${Date.now()}-${i}`,
      name,
      abbreviation: abbr,
      type: type as any,
      unitKind: "PHYSICAL",
    };
    
    setUnitsOfMeasure(prev => [...prev, newUom]);
    added++;
  }
  
  Toast.success(`${added} importée(s), ${skipped} ignorée(s)`);
};
```

---

### 6.6 🔍 FILTRER les UDM

```typescript
const filteredUom = unitsOfMeasure
  .filter(u => !u.isDeleted)
  .filter(u => {
    if (searchTerm) {
      return u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             u.abbreviation.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  })
  .filter(u => {
    if (filterType !== "all") {
      return u.type === filterType;
    }
    return true;
  });

// Compteur d'utilisation
const usageCountMap = new Map<string, number>();
filteredUom.forEach(u => {
  const count = products.filter(p => p.uom === u.abbreviation).length;
  usageCountMap.set(u.id, count);
});
```

---

## 7. Flux de filtrage et affichage (Products)

```typescript
interface ProductFiltersState {
  search: string;        // nom ou SKU
  filterCat: string;     // ProductCategory.name ou ""
  filterWh: string;      // warehouse ID ou ""
  filterStatus: "active" | "inactive" | "all";
  sortBy: "name" | "sku" | "cost" | "price" | "stock";
  sortDir: "asc" | "desc";
}

const useProductFilters = (
  products: Product[],
  inventory: InventoryItem[],
  filters: ProductFiltersState
) => {
  const filtered = products
    .filter(p => !p.isDeleted) // ⚠ TOUJOURS exclure
    .filter(p => {
      if (filters.search) {
        const term = filters.search.toLowerCase();
        return p.name.toLowerCase().includes(term) ||
               p.sku.toLowerCase().includes(term);
      }
      return true;
    })
    .filter(p => {
      if (filters.filterCat) {
        return p.category === filters.filterCat;
      }
      return true;
    })
    .filter(p => {
      if (filters.filterWh) {
        return inventory.some(i =>
          i.productId === p.id &&
          i.warehouseId === filters.filterWh &&
          i.qtyOnHand > 0
        );
      }
      return true;
    })
    .filter(p => {
      if (filters.filterStatus === "active") {
        return p.isActive;
      } else if (filters.filterStatus === "inactive") {
        return !p.isActive;
      }
      return true;
    });
  
  // Tri
  const sorted = [...filtered].sort((a, b) => {
    let aVal, bVal;
    
    switch (filters.sortBy) {
      case "name":
        aVal = a.name;
        bVal = b.name;
        break;
      case "sku":
        aVal = a.sku;
        bVal = b.sku;
        break;
      case "cost":
        aVal = a.unitCost;
        bVal = b.unitCost;
        break;
      case "price":
        aVal = a.unitPrice;
        bVal = b.unitPrice;
        break;
      case "stock":
        aVal = inventory.reduce((sum, i) =>
          i.productId === a.id ? sum + i.qtyOnHand : sum, 0
        );
        bVal = inventory.reduce((sum, i) =>
          i.productId === b.id ? sum + i.qtyOnHand : sum, 0
        );
        break;
      default:
        return 0;
    }
    
    if (aVal < bVal) return filters.sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return filters.sortDir === "asc" ? 1 : -1;
    return 0;
  });
  
  // Métriques
  return {
    filtered: sorted,
    metrics: {
      total: products.filter(p => !p.isDeleted).length,
      shown: sorted.length,
      categories: new Set(products.map(p => p.category)),
      activeCount: products.filter(p => p.isActive && !p.isDeleted).length,
      criticalStockCount: products.filter(p => {
        const stock = inventory.reduce((sum, i) =>
          i.productId === p.id ? sum + i.qtyOnHand : sum, 0
        );
        return stock < p.reorderPoint;
      }).length,
      avgCost: products.reduce((sum, p) => sum + p.unitCost, 0) / products.length,
      avgPrice: products.reduce((sum, p) => sum + p.unitPrice, 0) / products.length,
    },
  };
};
```

---

## 8. Dépendances inter-modules

| Module                  | Utilisation de Products/Categories/UOM              | Impact critique |
|-------------------------|-----------------------------------------------------|:---------------:|
| **Commandes achat (PO)**| Lignes PO → `productId`, UnitSelector pour l'unité | 🔴 Haute        |
| **Commandes vente (SO)**| Lignes SO → `productId`, `unitId`, calcul facto    | 🔴 Haute        |
| **Inventaire**          | `InventoryItem.productId` → niveaux de stock        | 🔴 Haute        |
| **GRN**                 | Réception → validation `productId`                  | 🟠 Moyenne      |
| **Pricing**             | Règles de prix par produit + historique             | 🟡 Basse        |
| **Conversions**         | `ProductUnitConversion.productId`                   | 🔴 Haute        |
| **Ajustements stock**   | Référence `productId` + unité                       | 🟠 Moyenne      |
| **Inventaire cyclique** | Référence `productId` + validation                  | 🟠 Moyenne      |
| **Garde suppression**   | Vérifie PO, SO, Inventory avant delete              | 🔴 Haute        |
| **Suivi financier**     | `onCostChanged` → FinancialTrackingContext           | 🟡 Basse        |
| **Mobile (SFA)**        | `ProductCatalogItem` (type simplifié)              | 🟡 Basse        |
| **Portail client**      | `PortalOrderLine.productId`                         | 🟡 Basse        |

---

## 9. États et transitions

### 9.1 États produit

```
                 ┌──────────────────────────────┐
                 │      ÉTAT PRODUIT            │
                 └──────────────────────────────┘
                            │
                            ├─ isActive = true
                            ├─ isDeleted = false
                            └─ Stock = X
                            
                ┌──────────────┐       ┌──────────────┐
                │    ACTIVE    │◄─────►│   INACTIVE   │
                └──────┬───────┘       └──────┬───────┘
                       │                      │
         (stock = 0 +  │                      │
          PO/SO = 0)   │                      │
                       ▼                      ▼
                  ┌─────────────────────────────────┐
                  │ DELETED (soft)                  │
                  │ isDeleted=true, isActive=false  │
                  │ • Exclui de l'UI                │
                  │ • Conserve l'historique         │
                  │ • Restaurable (future)          │
                  └─────────────────────────────────┘

Actions:
├─ Toggle isActive → bloqué si SO ouvertes
├─ Soft-delete → bloqué si stock > 0 ou PO/SO ouvertes
└─ Restauration (future) → historique visible
```

### 9.2 États catégorie

```
                ┌──────────────────────────────┐
                │      ÉTAT CATÉGORIE          │
                └──────────────────────────────┘
                            │
                            ├─ status = Active | Inactive
                            ├─ isDeleted = false
                            └─ products count = X
                            
                ┌──────────────┐       ┌──────────────┐
                │    ACTIVE    │◄─────►│   INACTIVE   │
                └──────┬───────┘       └──────┬───────┘
                       │                      │
        (count = 0)    │                      │
                       ▼                      ▼
                  ┌─────────────────────────────────┐
                  │ DELETED (soft)                  │
                  │ isDeleted=true                  │
                  │ • Produits réassignés           │
                  │ • Restaurable (future)          │
                  └─────────────────────────────────┘

Actions:
├─ Renommage → auto-cascade produits
├─ Suppression → dialog réassignation (count > 0)
└─ Statut → aucune restriction
```

### 9.3 États UDM

```
                ┌──────────────────────────────┐
                │      ÉTAT UDM                │
                └──────────────────────────────┘
                            │
                            ├─ Type = Weight | Volume | Count | …
                            ├─ baseUnit = null ou "kg" (pour dérivée)
                            └─ isDeleted = false
                            
                  ┌─────────────────┐
                  │  UNITÉ DE BASE  │
                  │ (baseUnit=null) │
                  └────────┬────────┘
                           │
                (peut créer dérivée)
                           │
              ┌────────────▼────────────┐
              │  UNITÉ DÉRIVÉE          │
              │ (baseUnit="kg", f=1000) │
              └────────────┬────────────┘
                           │
                (peut avoir ses propres dérivées)
                           │
              ┌────────────▼────────────┐
              │  UNITÉ DOUBLE-DÉRIVÉE   │
              │ (baseUnit="Tonne", …)   │
              └────────────┬────────────┘
                           │
              ⚠️ CYCLE DÉTECTION OBLIGATOIRE
              └─ A→B→C→A = BLOQUÉ
              
              
Suppression:
├─ Bloquée si produits l'utilisent
├─ Bloquée si unités dérivées existent
└─ Soft-delete si aucun bloqueur
```

---

## 10. Validations client + serveur

### 10.1 Validations Product

```typescript
// CLIENT-SIDE (ZOD)
const productSchema = z.object({
  name: z.string()
    .min(2, "Min 2 caractères")
    .max(100, "Max 100 caractères")
    .trim(),
  
  sku: z.string()
    .min(3, "Min 3 caractères")
    .max(50, "Max 50 caractères")
    .regex(/^[A-Za-z0-9\-_]+$/, "Alphanum, tirets, underscores uniquement")
    .transform(val => val.toUpperCase())
    .refine(
      val => !existingSkus.includes(val),
      "SKU déjà utilisé"
    ),
  
  category: z.string()
    .min(1, "Catégorie requise")
    .refine(
      val => categories.some(c => c.name === val && c.status === "Active"),
      "Catégorie invalide ou inactive"
    ),
  
  uom: z.string()
    .min(1, "Unité de base requise")
    .refine(
      val => unitsOfMeasure.some(u => u.name === val || u.abbreviation === val),
      "UDM inexistante"
    ),
  
  unitCost: z.number()
    .nonnegative("Doit être ≥ 0")
    .finite("Nombre valide requis"),
  
  unitPrice: z.number()
    .nonnegative("Doit être ≥ 0")
    .finite("Nombre valide requis"),
  
  reorderPoint: z.number()
    .nonnegative("Doit être ≥ 0")
    .int("Nombre entier requis"),
  
  isActive: z.boolean().default(true),
});

// SERVER-SIDE (API validation — future)
// ├─ Même schémas ZOD
// ├─ Vérifier FK (product.category existe en DB)
// ├─ Vérifier unicité en DB (SKU, pas de race condition)
// ├─ Vérifier intégrité référentielle (UDM existe)
// └─ Audit trail (créer ProductHistory record)
```

### 10.2 Validations ProductCategory

```typescript
const categorySchema = z.object({
  name: z.string()
    .min(1, "Nom requis")
    .max(100, "Max 100 caractères")
    .refine(
      val => !existingNames.includes(val.toLowerCase()),
      "Catégorie déjà existante"
    ),
  
  description: z.string()
    .max(500, "Max 500 caractères")
    .optional(),
  
  status: z.enum(["Active", "Inactive"]).default("Active"),
  
  parentId: z.string()
    .optional()
    .refine(
      val => !val || categories.some(c => c.id === val),
      "Catégorie parente inexistante"
    ),
});
```

### 10.3 Validations UnitOfMeasure

```typescript
const uomSchema = z.object({
  name: z.string()
    .min(1, "Nom requis")
    .max(100, "Max 100 caractères")
    .refine(
      val => !existingNames.includes(val.toLowerCase()),
      "UDM déjà existante"
    ),
  
  abbreviation: z.string()
    .min(1, "Abréviation requise")
    .max(10, "Max 10 caractères")
    .regex(/^[A-Za-z0-9]+$/, "Alphanum uniquement")
    .transform(val => val.toUpperCase())
    .refine(
      val => !existingAbbr.includes(val),
      "Abréviation déjà utilisée"
    ),
  
  type: z.enum(["Weight", "Volume", "Count", "Length", "Area"]),
  
  baseUnit: z.string()
    .optional()
    .refine(
      val => !val || unitsOfMeasure.some(u => u.abbreviation === val),
      "UDM de base inexistante"
    )
    .refine(
      val => !val || !wouldCreateCycle(val, data.abbreviation),
      "Cycle détecté (A→B→C→A)"
    ),
  
  conversionFactor: z.number()
    .gt(0, "Doit être > 0")
    .finite("Nombre valide requis")
    .optional()
    .refine(
      val => !data.baseUnit || val !== undefined,
      "Facteur requis si UDM de base définie"
    ),
});
```

### 10.4 Validations ProductUnitConversion

```typescript
const conversionSchema = z.object({
  unitName: z.string()
    .min(1, "Nom requis")
    .max(50, "Max 50 caractères"),
  
  unitAbbreviation: z.string()
    .min(1, "Abréviation requise")
    .max(10, "Max 10 caractères")
    .regex(/^[A-Za-z0-9]+$/, "Alphanum uniquement")
    .refine(
      val => !existingAbbrevForProduct.includes(val),
      "Abréviation déjà utilisée pour ce produit"
    ),
  
  conversionFactor: z.number()
    .gt(0, "Doit être > 0")
    .finite("Nombre valide requis"),
  
  allowBuy: z.boolean(),
  allowSell: z.boolean(),
});
```

---

## 11. Contrôle d'accès (Permissions par rôle)

```
┌────────────────────────────────────────────────────────────────────────┐
│                    MATRICE DE PERMISSIONS                              │
├────────────────┬──────────┬────────────┬──────────┬────────────────────┤
│ Rôle           │ Créer    │ Modifier   │ Supprimer│ Exporter/Import    │
│                │ Prod/Cat │ Prod/Cat   │ Prod/Cat │                    │
├────────────────┼──────────┼────────────┼──────────┼────────────────────┤
│ ADMIN          │ ✅ / ✅  │ ✅ / ✅    │ ✅ / ✅  │ ✅ / ✅            │
├────────────────┼──────────┼────────────┼──────────┼────────────────────┤
│ Manager Stock  │ ✅ / ❌  │ ✅ / ❌    │ ❌ / ❌  │ ✅ / ❌            │
├────────────────┼──────────┼────────────┼──────────┼────────────────────┤
│ Manager Achat  │ ✅ / ❌  │ ⚠️* / ❌  │ ❌ / ❌  │ ✅ / ❌            │
├────────────────┼──────────┼────────────┼──────────┼────────────────────┤
│ Manager Vente  │ ✅ / ❌  │ ⚠️** / ❌ │ ❌ / ❌  │ ✅ / ❌            │
├────────────────┼──────────┼────────────┼──────────┼────────────────────┤
│ User Lecture   │ ❌ / ❌  │ ❌ / ❌    │ ❌ / ❌  │ ✅ / ❌            │
└────────────────┴──────────┴────────────┴──────────┴────────────────────┘

Légende:
  ✅ = Autorisé sans restriction
  ⚠️* = Peut modifier unitCost uniquement (coût d'achat)
  ⚠️** = Peut modifier unitPrice uniquement (prix de vente)
  ❌ = Interdit

Notes:
  • Tous les rôles peuvent VOIR (lecture) les produits/catégories
  • Suppression = soft-delete systématiquement
  • Export = données filtrées selon les droits de lecture
```

---

## 12. Scénarios complexes (cross-entités)

### 12.1 Importer des produits + créer catégories/UDM manquantes

**Chemin** : `ProductsPage → "Import CSV" → Dialog`

```typescript
const handleImportProducts = async (csvContent: string) => {
  const lines = csvContent.trim().split("\n");
  
  // Parser CSV
  const headerLine = lines[0].split(",").map(h => h.trim().toLowerCase());
  const skuIdx = headerLine.findIndex(h => h === "sku");
  const nameIdx = headerLine.findIndex(h => h === "name" || h === "nom");
  const catIdx = headerLine.findIndex(h => h === "category" || h === "catégorie");
  const uomIdx = headerLine.findIndex(h => h === "uom" || h === "unité");
  
  if ([skuIdx, nameIdx, catIdx, uomIdx].some(i => i === -1)) {
    Toast.error("Colonnes manquantes");
    return;
  }
  
  // Phase 1: Détection des entités manquantes
  const missingCategories = new Set<string>();
  const missingUoms = new Set<string>();
  const productsToCreate = [];
  
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",").map(c => c.trim());
    const catName = cells[catIdx];
    const uomName = cells[uomIdx];
    
    if (!productCategories.some(c => c.name === catName)) {
      missingCategories.add(catName);
    }
    if (!unitsOfMeasure.some(u => u.name === uomName)) {
      missingUoms.add(uomName);
    }
    
    productsToCreate.push({
      sku: cells[skuIdx],
      name: cells[nameIdx],
      category: catName,
      uom: uomName,
    });
  }
  
  // Phase 2: Confirmation utilisateur
  if (missingCategories.size > 0 || missingUoms.size > 0) {
    const confirmed = await confirm(
      `Créer les entités manquantes ?\n` +
      `Catégories: ${Array.from(missingCategories).join(", ")}\n` +
      `UDM: ${Array.from(missingUoms).join(", ")}\n\n` +
      `Continuer l'import ?`
    );
    
    if (!confirmed) return;
  }
  
  // Phase 3: Auto-création des entités
  missingCategories.forEach(catName => {
    const newCategory: ProductCategory = {
      id: `CAT-${Date.now()}-${catName}`,
      name: catName,
      description: `Auto-créée lors import ${new Date().toLocaleString()}`,
      status: "Active",
      productCount: 0,
      isDeleted: false,
    };
    setProductCategories(prev => [...prev, newCategory]);
  });
  
  missingUoms.forEach(uomName => {
    const newUom: UnitOfMeasure = {
      id: `UOM-IMP-${Date.now()}-${uomName}`,
      name: uomName,
      abbreviation: uomName.substring(0, 5).toUpperCase(),
      type: "Count",
      unitKind: "PHYSICAL",
    };
    setUnitsOfMeasure(prev => [...prev, newUom]);
  });
  
  // Phase 4: Créer les produits
  let created = 0;
  productsToCreate.forEach(data => {
    const newProduct: Product = {
      id: `P-${crypto.randomUUID().substring(0, 8)}`,
      name: data.name,
      sku: data.sku,
      category: data.category,
      uom: data.uom,
      unitCost: 0,
      unitPrice: 0,
      reorderPoint: 0,
      isActive: true,
      isDeleted: false,
    };
    
    setProducts(prev => [...prev, newProduct]);
    created++;
  });
  
  Toast.success(
    `${created} produit(s) créé(s)\n` +
    `${missingCategories.size} catégorie(s) créée(s)\n` +
    `${missingUoms.size} UDM créée(s)`
  );
};
```

---

### 12.2 Réapprovisionnement intelligent

**Chemin** : `InventoryPage → "Réapprovisionner" → Dialog`

```typescript
const handleSmartReorder = () => {
  // Identifier produits en sous-stock
  const lowStockProducts = products.filter(p => {
    const totalStock = inventory.reduce((sum, i) =>
      i.productId === p.id ? sum + i.qtyOnHand : sum, 0
    );
    return totalStock < p.reorderPoint;
  });
  
  // Pré-remplir dialog avec suggestions
  const suggested = lowStockProducts.map(p => {
    const totalStock = inventory.reduce((sum, i) =>
      i.productId === p.id ? sum + i.qtyOnHand : sum, 0
    );
    const suggestedQty = Math.max(
      p.reorderPoint * 2 - totalStock, // Remplir à 2x le seuil
      p.reorderPoint
    );
    
    return {
      productId: p.id,
      productName: p.name,
      currentStock: totalStock,
      reorderPoint: p.reorderPoint,
      suggestedQty,
      unitOfMeasure: p.uom,
    };
  });
  
  // Dialog avec tableau pré-rempli
  openReorderDialog({
    items: suggested,
    onConfirm: (items) => {
      // Créer PO avec ces lignes
      const newPO: PurchaseOrder = {
        id: `PO-${Date.now()}`,
        number: `PO-${new Date().toISOString().split("T")[0]}-001`,
        supplier: "", // À sélectionner
        lines: items.map(item => ({
          productId: item.productId,
          quantity: item.suggestedQty,
          unitId: "", // À sélectionner
          unitPrice: products.find(p => p.id === item.productId)?.unitCost || 0,
        })),
        status: "Draft",
        createdAt: new Date().toISOString(),
      };
      
      Toast.success(`PO ${newPO.id} créée avec ${items.length} ligne(s)`);
    },
  });
};
```

---

### 12.3 Cloner un produit

**Chemin** : `ProductsPage → "⋮" menu → "Cloner" → Dialog`

```typescript
const handleCloneProduct = async (productId: string) => {
  const source = products.find(p => p.id === productId)!;
  
  // Dialog pré-rempli
  const dialog = await showProductDialog({
    mode: "create",
    initialData: {
      ...source,
      name: `${source.name} (copie)`,
      sku: "", // À remplir (pas de doublon)
      id: undefined,
    },
  });
  
  if (!dialog.confirmed) return;
  
  const newProduct: Product = {
    ...dialog.data,
    id: `P-${crypto.randomUUID().substring(0, 8)}`,
    isDeleted: false,
  };
  
  setProducts(prev => [...prev, newProduct]);
  
  // Copier les conversions d'unités
  const sourceConversions = productUnitConversions.filter(c => c.productId === productId);
  const newConversions = sourceConversions.map(c => ({
    ...c,
    id: `PUC-${newProduct.id}-${c.id.split("-").pop()}`,
    productId: newProduct.id,
  }));
  
  setProductUnitConversions(prev => [...prev, ...newConversions]);
  
  Toast.success(`Produit cloné : ${newProduct.name}`);
};
```

---

## 13. Audit Trail & Historique

### 13.1 Modèle ProductHistory

```typescript
interface ProductHistory {
  id: string;           // "PH-{timestamp}-{uuid}"
  productId: string;    // FK → Product.id
  action: "created" | "modified" | "deleted" | "undeleted";
  changedFields?: {
    [fieldName]: {
      oldValue: any;
      newValue: any;
    }
  };
  changedBy: string;    // user email ou ID
  changedAt: string;    // ISO8601 timestamp
  reason?: string;      // raison suppression/modif
}
```

### 13.2 Intégration UI

```typescript
// ProductDetailDrawer.tsx
const renderHistoryTab = () => {
  const history = productHistory.filter(h => h.productId === product.id);
  
  return (
    <div>
      <h3>Historique des modifications</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Action</th>
            <th>Champ</th>
            <th>Ancien</th>
            <th>Nouveau</th>
            <th>Par</th>
          </tr>
        </thead>
        <tbody>
          {history
            .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
            .slice(0, 20) // Pagination
            .map(h => (
              <tr key={h.id}>
                <td>{new Date(h.changedAt).toLocaleString()}</td>
                <td>
                  <Badge variant={h.action}>
                    {h.action === "created" && "Créé"}
                    {h.action === "modified" && "Modifié"}
                    {h.action === "deleted" && "Supprimé"}
                    {h.action === "undeleted" && "Restauré"}
                  </Badge>
                </td>
                <td>
                  {h.changedFields && Object.keys(h.changedFields).map(field => (
                    <div key={field}>{field}</div>
                  ))}
                </td>
                <td>
                  {h.changedFields && Object.values(h.changedFields).map((change, i) => (
                    <div key={i}>{JSON.stringify(change.oldValue)}</div>
                  ))}
                </td>
                <td>
                  {h.changedFields && Object.values(h.changedFields).map((change, i) => (
                    <div key={i}>{JSON.stringify(change.newValue)}</div>
                  ))}
                </td>
                <td>{h.changedBy}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};
```

### 13.3 Export Audit Trail

```typescript
const exportAuditTrail = (productId?: string) => {
  let history = productHistory;
  
  if (productId) {
    history = history.filter(h => h.productId === productId);
  }
  
  const data = history.map(h => ({
    Horodatage: new Date(h.changedAt).toLocaleString(),
    ProduitID: h.productId,
    Action: h.action,
    Champs: JSON.stringify(h.changedFields || {}),
    Utilisateur: h.changedBy,
    Raison: h.reason || "-",
  }));
  
  exportToCSV(data, `audit-trail-${new Date().toISOString()}.csv`);
};
```

---

## 14. Problèmes connus et dette technique

### 🔴 Critiques (À résoudre P0)

| # | Problème | Impact | Solution |
|---|----------|--------|----------|
| **1** | **Lien catégorie par NOM, pas par ID** | Renommer une catégorie casse TOUS les produits | Auto-cascade renommage (§ 5.2) |
| **2** | **Pas de cascade renommage UDM** | Changer l'abréviation UDM casse `product.uom` | Auto-cascade renommage (§ 6.2) |
| **3** | **Suppression conversion sans vérif.** | Peut casser des SO/PO existantes | Vérifier utilisation avant suppression (§ 4.10) |

### 🟡 Importants (À résoudre P1-P2)

| # | Problème | Impact | Solution |
|---|----------|--------|----------|
| **4** | Hard delete catégories vs soft delete produits | Incohérence de comportement | Ajouter isDeleted à Category (soft delete) |
| **5** | `productCount` statique sur Category | Valeur seed jamais synchronisée | Utiliser dynamicCounts PARTOUT |
| **6** | Conversions d'unités uniquement en mode édition | Admin doit sauver le produit puis le rouvrir | Form unifié produit (§ 15.1) |
| **7** | Pas de filtre statut sur CategoriesPage | Manque de cohérence avec ProductsPage | Ajouter filtre status (§ 5.4) |
| **8** | UDM dérivées : facteur non propagé | Changer le facteur d'une UDM base ne propage pas | Documenter le comportement attendu |
| **9** | Pas de détection cycle UDM | A→B→C→A possible | Implémenter wouldCreateCycle() (§ 6.1) |

### 🟢 Améliorations souhaitées (P3+)

| # | Opportunité | Bénéfice |
|---|------------|----------|
| **10** | Hiérarchie catégories (parentId en tree view) | Organisation (future multi-niveau) |
| **11** | Défauts par catégorie (UDM, seuil, pricing) | Économies de clics (bulk setup) |
| **12** | Restauration de produit supprimé | Data recovery (soft delete) |
| **13** | Clic compteur catégorie → filtre produits | Navigation rapide |
| **14** | Import/Export CSV catégories | Gestion en masse |
| **15** | Règles de prix par catégorie/client | Pricing flexible |

---

## 15. UX optimisée proposée — Actions minimales

### 15.1 Création produit en UNE étape (au lieu de 2)

**Amélioration** : Formulaire unifié avec sections collapsibles

**Avant** :
1. Dialog 1 : Créer produit (step 1)
2. Sauvegarder
3. Rouvrir le produit
4. Dialog 2 : Ajouter conversions (step 2)
5. Sauvegarder
= **~12 clics, 2 dialogs**

**Après** :
1. Dialog unique : Infos + conversions (sections collapsibles)
2. Sauvegarder une fois
= **~7 clics, 1 dialog** (-38%)

### 15.2 Catégorie inline dans le formulaire produit

**Amélioration** : Dropdown catégorie + bouton "+ Créer"

**Avant** :
1. Quitter dialog produit
2. Aller CategoriesPage
3. Créer catégorie
4. Revenir au produit
= **~8 clics, navigation**

**Après** :
1. Cliquer "+ Créer catégorie" dans dropdown
2. Form inline minimal (nom, desc)
3. Catégorie créée et auto-sélectionnée
= **~2 clics, sans navigation** (-75%)

### 15.3 UDM inline dans le formulaire produit

**Amélioration** : Même que catégories

= **~2 clics vs ~8** (-75%)

### 15.4 Auto-cascade renommage catégorie

**Amélioration** : handleSave() auto-met-à-jour les produits

**Avant** :
1. Renommer catégorie
2. Manuellement réassigner chaque produit (N clics)
= **N+2 clics**

**Après** :
1. Renommer catégorie
2. Sauvegarde → auto-cascade
= **2 clics** (-N actions)

### 15.5 Auto-cascade renommage UDM

Idem catégories.

### 15.6 Réassignation en masse avant suppression catégorie

**Amélioration** : Dialog avec dropdown "Réassigner vers :" + 1 bouton

**Avant** :
- Suppression bloquée → admin doit réassigner manuellement 1 par 1
= **∞ actions (bloqué)**

**Après** :
1. Cliquer poubelle
2. Dialog : "X produits utilisent cette catégorie"
3. Dropdown : sélectionner nouvelle catégorie
4. Bouton : "Réassigner et supprimer"
= **2 clics** (déblocage)

### 15.7 Vérification avant suppression de conversion d'unité

**Amélioration** : Check des PO/SO ouvertes

**Impact** : Prévient les erreurs data

### 15.8 Soft delete pour catégories (cohérence)

**Amélioration** : Ajouter isDeleted à ProductCategory

**Gain** : Comportement unifié produits ↔ catégories

---

## 16. Matrice récapitulative — Actions Admin

| Entité | Action | Nb clics actuel | Nb clics optimisé | Gain |
|--------|--------|:---------------:|:------------------:|:----:|
| **Produit** | Créer | 8+ (2 dialogs) | 5 (1 dialog) | **-38%** |
| **Produit** | Modifier | 4 | 3 | **-25%** |
| **Produit** | Supprimer | 2 | 2 | — |
| **Produit** | Toggle statut | 1 | 1 | — |
| **Produit** | Voir détail | 1 | 1 | — |
| **Produit** | Ajouter unité | 5+ (rouvrir) | 3 (inline) | **-40%** |
| **Produit** | Exporter | 2 | 2 | — |
| **Produit** | Importer | N/A | 3 (CSV) | **Nouveau** |
| **Produit** | Cloner | N/A | 3 | **Nouveau** |
| **Catégorie** | Créer | 4 | 2 (inline prod.) | **-50%** |
| **Catégorie** | Renommer | 2 + N (manuels) | 2 (auto-cascade) | **-N** |
| **Catégorie** | Supprimer | ∞ (bloqué) | 2 (réassigner+del) | **-∞** |
| **Catégorie** | Filtrer | 3 | 3 | — |
| **UDM** | Créer | 5 | 2 (inline prod.) | **-60%** |
| **UDM** | Renommer | 2 + N (manuels) | 2 (auto-cascade) | **-N** |
| **UDM** | Supprimer | 2 | 2 | — |
| **UDM** | Import CSV | 3 | 3 | — |
| **UDM** | Export CSV | 1 | 1 | — |

---

## 17. Spécifications UI — Inline Creation

### 17.1 Catégorie inline dans ProductFormDialog

#### État fermé
```
┌──────────────────────────────────────┐
│ Catégorie * ▼ [Ciment & Liants]      │
│ [+ Créer une catégorie] ← green btn  │
└──────────────────────────────────────┘
```

#### État ouvert (après clic)
```
┌──────────────────────────────────────┐
│ Catégorie (nouveau)                  │
│ ┌──────────────────────────────────┐ │
│ │ Nom * [_____________________]    │ │
│ │ Description [_________________]  │ │
│ │ Statut ☑ Actif                  │ │
│ ├──────────────────────────────────┤ │
│ │ [Créer et sélectionner] [Annuler]│ │
│ └──────────────────────────────────┘ │
│                                      │
│ ou sélectionner une existante ▼      │
│ [Ciment & Liants]                    │
└──────────────────────────────────────┘
```

#### Comportement
- Clic sur "+ Créer une catégorie" → form inline remplace le dropdown
- Champs : Nom (requis), Description (optionnel), Statut (toggle)
- Validation : même que CategoriesPage
- Clic "Créer et sélectionner" :
  - Créer catégorie → setProductCategories()
  - Auto-sélectionner dans le dropdown → setFormData({ category: newCat.name })
  - Fermer form inline
- Clic "Annuler" → form ferme, dropdown reste visible

---

### 17.2 UDM inline dans ProductFormDialog

#### État fermé
```
┌──────────────────────────────────────┐
│ Unité de base * ▼ [Sac]              │
│ [+ Créer une UDM] ← green btn        │
└──────────────────────────────────────┘
```

#### État ouvert (après clic)
```
┌──────────────────────────────────────┐
│ Unité de mesure (nouvelle)           │
│ ┌──────────────────────────────────┐ │
│ │ Nom * [_____________________]    │ │
│ │ Abréviation * [___] (max 10)     │ │
│ │ Type * ▼ [Count]                 │ │
│ ├──────────────────────────────────┤ │
│ │ ☐ Unité dérivée                  │ │
│ │   Dériver de ▼ [_____] Factor[_] │ │
│ └──────────────────────────────────┘ │
│                                      │
│ [Créer et sélectionner] [Annuler]    │
│                                      │
│ ou sélectionner une existante ▼      │
│ [Sac]                                │
└──────────────────────────────────────┘
```

---

### 17.3 Conversion d'unité inline dans ProductFormDialog Step 2

```
┌──────────────────────────────────────────────┐
│ Convertisseurs                               │
├──────────────────────────────────────────────┤
│ Unité de base : Sac  (auto)  f=1   [A☑V☑]  │
│                                              │
│ [+ Ajouter une unité]                        │
│                                              │
│ Carton      f=24    [A☑V☑] [X]              │
│ Palette     f=400   [A☑V☐] [X]              │
│                                              │
│ ─────────────────────────────────────────── │
│ Form inline (si clicked):                    │
│ ┌──────────────────────────────────────┐    │
│ │ Nom unit. [__________]               │    │
│ │ Abréviation [__] (max 10 car.)      │    │
│ │ Facteur [______] (> 0)              │    │
│ │ ☑ Achat    ☑ Vente                 │    │
│ │ [Ajouter]  [Annuler]                │    │
│ └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

---

## 18. Priorités d'implémentation

| Priorité | Amélioration | Impact UX | Effort | Fichiers |
|:--------:|------------|:---------:|:------:|----------|
| 🔴 **P0-1** | Auto-cascade renommage catégorie (§ 5.2) | 🔴 Critique | Faible | `CategoriesPage`, `WMSDataContext` |
| 🔴 **P0-2** | Auto-cascade renommage UDM (§ 6.2) | 🔴 Critique | Faible | `UomPage`, `WMSDataContext` |
| 🔴 **P0-3** | Vérifier suppression conversion d'unité (§ 4.10) | 🔴 Critique | Faible | `ProductFormDialog` |
| 🟠 **P1-1** | Form produit unifié avec unités (§ 15.1) | 🟠 Fort | Moyen | `ProductFormDialog` (major refactor) |
| 🟠 **P1-2** | Réassignation en masse catégorie (§ 15.6) | 🟠 Fort | Moyen | `CategoriesPage` |
| 🟡 **P2-1** | Catégorie inline dans form produit (§ 15.2) | 🟡 Moyen | Faible | `ProductFormDialog` |
| 🟡 **P2-2** | UDM inline dans form produit (§ 15.3) | 🟡 Moyen | Faible | `ProductFormDialog` |
| 🟡 **P2-3** | Soft delete catégories (§ 15.8) | 🟡 Moyen | Faible | `ProductCategory` model, `CategoriesPage` |
| 🟡 **P2-4** | Filtre statut CategoriesPage (§ 5.4) | 🟡 Moyen | Faible | `CategoriesPage` |
| 🟢 **P3-1** | Audit trail complet (§ 13) | 🟢 Faible | Moyen | `ProductHistory`, `ProductDetailDrawer` |
| 🟢 **P3-2** | Import/Export CSV catégories | 🟢 Faible | Faible | `CategoriesPage` |
| 🟢 **P3-3** | Hiérarchie catégories en tree view | 🟢 Faible | Élevé | `CategoriesPage` (si besoin métier) |
| 🟢 **P3-4** | Cloner un produit (§ 12.3) | 🟢 Faible | Faible | `ProductsPage` |
| 🟢 **P3-5** | Réapprovisionnement intelligent (§ 12.2) | 🟢 Faible | Moyen | Nouveau module `SmartReorder` |

---

## 19. Roadmap d'implémentation

### 🎯 Sprint 1 (Semaine 1-2) — Data Integrity

**Objectif** : Corriger les problèmes critiques (P0)

```markdown
#### Tâches
1. ✅ Auto-cascade renommage catégorie
   └─ handleUpdateCategory() → mettre à jour products
   └─ File: CategoriesPage.tsx
   └─ Effort: 30 min

2. ✅ Auto-cascade renommage UDM
   └─ handleUpdateUom() → mettre à jour products + conversions + UDM dérivées
   └─ File: UomPage.tsx
   └─ Effort: 45 min

3. ✅ Vérification suppression conversion d'unité
   └─ handleDeleteConversion() → check PO/SO ouvertes
   └─ File: ProductFormDialog.tsx (step 2)
   └─ Effort: 30 min

#### Deliverables
- Tests unitaires (validations)
- Changelog (bugfix)
- ✅ Déblocage réassignation catégorie
```

---

### 🎨 Sprint 2 (Semaine 3-4) — UX Produit

**Objectif** : Unifier création produit + ajouter réassignation en masse (P1)

```markdown
#### Tâches
1. ✅ Form produit unifié
   └─ Merger step 1 + step 2 (sections collapsibles)
   └─ Conversions ajoutables dès la création
   └─ File: ProductFormDialog.tsx (major refactor)
   └─ Effort: 4h

2. ✅ Réassignation en masse catégorie
   └─ Dialog : "X produits → sélectionner nouvelle catégorie"
   └─ Bouton : "Réassigner et supprimer"
   └─ File: CategoriesPage.tsx (ProductDeleteDialog amélioré)
   └─ Effort: 2h

#### Deliverables
- Tests e2e (création produit avec unités)
- Snapshot tests (form unifié)
- Performance audit (dialog + conversions)
```

---

### ⚡ Sprint 3 (Semaine 5-6) — Inline Creation

**Objectif** : Créer catégories/UDM sans quitter le formulaire produit (P2-1, P2-2)

```markdown
#### Tâches
1. ✅ Catégorie inline
   └─ Dropdown catégorie + form inline collapsible
   └─ File: ProductFormDialog.tsx (field customization)
   └─ Effort: 2h

2. ✅ UDM inline
   └─ Dropdown UDM + form inline collapsible
   └─ File: ProductFormDialog.tsx (field customization)
   └─ Effort: 2h

#### Deliverables
- UI specs (design review)
- Tests d'intégration (création + auto-sélection)
- Documentation (inline form behavior)
```

---

### 🔧 Sprint 4 (Semaine 7-8) — Polish & Secondary Features

**Objectif** : Soft delete catégories + filtrages (P2-3, P2-4) + audit trail (P3-1)

```markdown
#### Tâches
1. ✅ Soft delete catégories
   └─ Ajouter isDeleted à ProductCategory
   └─ Filtrer en UI
   └─ File: masterData.ts, CategoriesPage.tsx
   └─ Effort: 1h

2. ✅ Filtre statut CategoriesPage
   └─ Ajouter dropdown status filter
   └─ File: CategoriesPage.tsx
   └─ Effort: 30 min

3. ✅ Audit trail (ProductHistory)
   └─ Stocker changedFields dans chaque action
   └─ Tab "Historique" dans ProductDetailDrawer
   └─ File: ProductHistory.ts, ProductDetailDrawer.tsx
   └─ Effort: 3h

#### Deliverables
- Modèle ProductHistory documenté
- Tab historique dans drawer
- Export audit trail CSV
```

---

### 🚀 Sprint 5+ (Nice-to-have) — Advanced Features

**Objectif** : Fonctionnalités optionnelles (P3)

```markdown
#### Tâches (par ordre de valeur)
1. Cloner un produit (P3-4)
   └─ Menu "⋮" → "Cloner"
   └─ Effort: 1h

2. Réapprovisionnement intelligent (P3-5)
   └─ Afficher produits en sous-stock
   └─ Suggérer quantités
   └─ Créer PO directement
   └─ Effort: 3h

3. Import/Export CSV catégories (P3-2)
   └─ Idem UDM
   └─ Effort: 1.5h

4. Hiérarchie catégories (P3-3)
   └─ Tree view (dépend si besoin métier réel)
   └─ Effort: 5h (⚠️ dépendre de PO)

#### Décisions
- Ne pas commencer P3 avant fin P1-P2
- Décider si hiérarchie = vraie besoin métier
- Évaluer ROI réappro. intelligent
```

---

## 📊 Estimation globale

| Phase | Sprints | Durée estimée | Impact | Démarrage |
|-------|---------|:-------------:|:------:|-----------|
| **Data Integrity (P0)** | S1 | 1-2 semaines | 🔴 Critique | **ASAP** |
| **UX Produit (P1)** | S2 | 2 semaines | 🟠 Élevé | S2 (après P0) |
| **Inline Creation (P2)** | S3 | 2 semaines | 🟡 Moyen | S3 (après P1) |
| **Polish (P2-3, P3-1)** | S4 | 2 semaines | 🟡 Moyen | S4 |
| **Advanced (P3)** | S5+ | Variable | 🟢 Faible | S5+ (backlog) |

**Total** : ~8 semaines (2 mois) pour P0-P2 complet + audit trail.

---

## ✅ Checklist d'implémentation

### Phase 1 — Data Integrity

- [ ] Auto-cascade renommage catégorie
  - [ ] Test : renommer cat. → produits mis à jour
  - [ ] Toast : "X produit(s) mis à jour"
  
- [ ] Auto-cascade renommage UDM
  - [ ] Test : renommer abbr. → product.uom + conversions + UDM dérivées
  - [ ] Toast : "Y UDM dérivées mises à jour"
  
- [ ] Vérification suppression conversion
  - [ ] Check PO ouvertes utilisant cette unité
  - [ ] Check SO ouvertes utilisant cette unité
  - [ ] Toast d'erreur si bloqué

### Phase 2 — UX Produit

- [ ] Form unifié produit
  - [ ] Section 1 : Infos de base
  - [ ] Section 2 : Conversions (collapsible)
  - [ ] Validation ZOD complet
  - [ ] Tests e2e création + unités
  
- [ ] Réassignation en masse
  - [ ] Dialog : "X produits → nouvelle cat."
  - [ ] Dropdown catégories (excluant self)
  - [ ] Bouton : "Réassigner et supprimer"
  - [ ] Toast succès

### Phase 3 — Inline Creation

- [ ] Catégorie inline
  - [ ] Dropdown + form inline collapsible
  - [ ] Validation idem CategoriesPage
  - [ ] Auto-sélection après création
  
- [ ] UDM inline
  - [ ] Dropdown + form inline collapsible
  - [ ] Validation idem UomPage
  - [ ] Auto-sélection après création

### Phase 4 — Polish

- [ ] Soft delete catégories
  - [ ] Ajouter isDeleted à modèle
  - [ ] Filtrer en UI
  - [ ] Masquer du dropdown produit
  
- [ ] Filtre statut CategoriesPage
  - [ ] Dropdown : Active/Inactive/Tous
  - [ ] Apply filter
  
- [ ] Audit trail complet
  - [ ] ProductHistory model
  - [ ] Stocker changedFields
  - [ ] Tab dans ProductDetailDrawer
  - [ ] Export CSV

### Phase 5+ — Nice-to-have

- [ ] Cloner un produit
- [ ] Réappro intelligent
- [ ] Import/Export CSV catégories
- [ ] Hiérarchie catégories (si décision positive)

---

## 📝 Notes & Décisions

### À valider avec stakeholders

1. **Hiérarchie catégories** — Est-ce une vraie besoin métier (multi-niveaux) ?
   → **Impact** : 5h de dev si oui, 0 si non
   → **Décision** : À reporter en P3, valider d'abord

2. **Soft delete catégories** — Ou hard delete définitif ?
   → **Proposé** : Soft delete (cohérence produits)
   → **Impact** : +1h de dev, +restauration future

3. **Audit trail** — Stocké en mémoire ou DB ?
   → **MVP** : Mémoire (reset à refresh)
   → **Future** : DB (persistance)
   → **Impact** : +2h pour DB, +API

4. **Réappro intelligent** — Vraie valeur commerciale ?
   → **À valider** : Besoin utilisateurs ?
   → **Impact** : 3h si oui, 0 si repousser

---

## 🎓 Conclusion

Cette master plan couvre **exhaustivement** :

✅ **Modèle de données** — Entités, relations, FK  
✅ **Validations** — Client + serveur, ZOD schemas  
✅ **Scénarios CRUD complets** — Produits, catégories, UDM  
✅ **Permutations cross-entités** — Imports, cloning, réappro  
✅ **UX optimisée** — Réduction 30-60% des clics  
✅ **Audit trail** — Historique complet + export  
✅ **Roadmap pragmatique** — 19 sprints, P0-P3 priorisés  

**Prêt pour développement immédiat !** 🚀

---

**Version** : 2.0 | **Statut** : ✅ Approuvé pour implémentation