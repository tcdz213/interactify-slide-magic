# Produits, Catégories & Unités de Mesure — Logique, Relations, Flux et Scénarios Admin

> **Objectif** : Documenter exhaustivement la logique métier actuelle, chaque action admin (CRUD complet), les relations entre entités, et proposer une UX optimisée avec un minimum d'actions.

---

## 1. Modèle de données

### 1.1 Product (`Product` — `src/data/masterData.ts`)

```ts
{
  id: string;            // "P001" ou "P-XXXXXXXX" (auto-généré)
  name: string;          // "Ciment CPJ 42.5 (50kg)"
  sku: string;           // "CONST-001" — unique, [A-Za-z0-9\-_]
  category: string;      // ⚠ TEXT = ProductCategory.name (pas l'ID !)
  uom: string;           // Label unité de base ("Sac", "Pièce", "m²")
  baseUnitId?: string;   // FK → UnitOfMeasure.id
  unitCost: number;      // Coût unitaire (DZD par unité de base)
  unitPrice: number;     // Prix de vente unitaire (DZD)
  reorderPoint: number;  // Seuil de réapprovisionnement
  isActive: boolean;     // Actif / Inactif
  isDeleted?: boolean;   // Soft-delete
  baseUnit?: string;     // Nom unité de base (legacy)
  baseUnitAbbr?: string; // Abréviation (legacy)
}
```

### 1.2 ProductCategory (`ProductCategory` — `src/data/masterData.ts`)

```ts
{
  id: string;            // "CAT-001"
  name: string;          // "Ciment & Liants" — sert de FK textuelle
  parentId?: string;     // Hiérarchie parent (défini mais inutilisé en UI)
  description: string;
  productCount: number;  // Valeur seed statique (remplacée par dynamicCounts en UI)
  status: "Active" | "Inactive";
}
```

### 1.3 UnitOfMeasure (`UnitOfMeasure` — `src/data/masterData.ts`)

```ts
{
  id: string;            // "UOM-001"
  name: string;          // "Kilogramme"
  abbreviation: string;  // "kg" — unique
  type: "Weight" | "Volume" | "Count" | "Length" | "Area";
  unitKind: "PHYSICAL";
  baseUnit?: string;     // Abréviation de l'UDM de base (ex: "kg" pour "Tonne")
  conversionFactor?: number; // 1 de cette unité = X de l'unité de base
}
```

### 1.4 ProductUnitConversion (`src/lib/unitConversion.ts`)

```ts
{
  id: string;            // "PUC-XXXXXXXX"
  productId: string;     // FK → Product.id
  unitName: string;      // "Carton"
  unitAbbreviation: string; // "Ctn"
  conversionFactor: number; // 1 Ctn = 24 unités de base
  allowBuy: boolean;     // Utilisable en achat
  allowSell: boolean;    // Utilisable en vente
  sortOrder: number;
}
```

### 1.5 ProductBaseUnit (`src/lib/unitConversion.ts`)

```ts
{
  productId: string;           // FK → Product.id
  baseUnitName: string;        // "Pièce"
  baseUnitAbbreviation: string; // "Pce"
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
│  baseUnit?: "kg"        │                      │
│  conversionFactor?: 50  │                      │ productId
└─────────────────────────┘                      │
                                                 │
┌─────────────────────────┐        ┌─────────────▼───────────┐
│   ProductCategory       │◄───────│       Product            │
│                         │  par   │                          │
│  id: "CAT-001"          │  name  │  category: "Ciment…"     │
│  name: "Ciment…"        │ (TEXT  │  baseUnitId?: "UOM-001"  │
│  status: Active         │  ⚠)   │  uom: "Sac"             │
│  parentId?: …           │        │  sku: "CONST-001"        │
└─────────────────────────┘        │  isActive: true          │
                                   └─────────────┬───────────┘
                                                 │
                                    ┌────────────┼────────────┐
                                    │            │            │
                                    ▼            ▼            ▼
                          ┌──────────────┐ ┌──────────┐ ┌─────────────────┐
                          │InventoryItem │ │ PO/SO    │ │ProductUnitConv  │
                          │productId     │ │ lines[]  │ │productId        │
                          │warehouseId   │ │productId │ │unitName:"Carton"│
                          │qtyOnHand     │ │          │ │factor: 24       │
                          └──────────────┘ └──────────┘ └─────────────────┘
```

### ⚠ Problème critique : Catégorie liée par NOM, pas par ID

- `Product.category` stocke le **nom textuel** de la catégorie
- Renommer une catégorie **casse le lien** avec tous ses produits
- L'UI avertit mais ne cascade PAS le renommage

---

## 3. Gestion d'état (`WMSDataContext`)

| State                     | Setter                       | Pages/modules consommateurs                    |
|---------------------------|------------------------------|-------------------------------------------------|
| `products`                | `setProducts`                | ProductsPage, OrderForm, Inventory, PO, SO      |
| `productCategories`       | `setProductCategories`       | CategoriesPage, ProductFormDialog (dropdown)     |
| `unitsOfMeasure`          | `setUnitsOfMeasure`          | UomPage, ProductFormDialog, UnitSelector         |
| `productUnitConversions`  | `setProductUnitConversions`  | ProductFormDialog (step 2), UnitSelector, Orders |
| `productBaseUnits`        | `setProductBaseUnits`        | ProductFormDialog, useUnitConversion             |
| `inventory`               | `setInventory`               | Stock totals, filtres entrepôt                   |

---

## 4. Scénarios Admin — Produits (CRUD complet)

### 4.1 🟢 CRÉER un produit

**Chemin** : `ProductsPage → "+ Nouveau produit" → ProductFormDialog`

```
Étape 1 — Formulaire (Step 1 : Infos de base)
├─ Champs requis : nom (min 2 car.), SKU (min 3, alphanum+tirets), catégorie, unité de base
├─ Champs optionnels : coût unitaire, prix unitaire, seuil réappro, statut
├─ Catégorie → dropdown filtré status="Active" uniquement
├─ Unité de base → dropdown UnitOfMeasure → auto-remplit `uom` avec le nom
│
Étape 2 — Validation (handleSave)
├─ Zod schema → productSchema.safeParse(form)
├─ SKU unique → products.some(p => p.sku === form.sku) → erreur si doublon
├─ ID auto → "P-{uuid8}" (crypto.randomUUID)
├─ Simulation async (400ms delay)
│
Étape 3 — Résultat
├─ setProducts(prev => [...prev, newProduct])
├─ Toast "Produit créé"
└─ Dialog fermé
```

**Actions admin** : 7 champs à remplir → 1 clic "Créer"

**⚠ Limite actuelle** : Les conversions d'unités ne peuvent être ajoutées qu'APRÈS la création (step 2 visible uniquement en mode édition). L'admin doit rouvrir le produit pour les ajouter.

### 4.2 🔵 MODIFIER un produit

**Chemin** : `ProductsPage → icône crayon → ProductFormDialog (mode editing)`

```
Étape 1 — Pré-remplissage
├─ openEdit(product) → form pré-rempli avec valeurs actuelles
├─ Si stock > 0 → champ "Unité de base" verrouillé (disabled)
│
Étape 2 — Step tabs visibles (1. Infos de base | 2. Unités)
├─ Step 1 : modifier nom, SKU, catégorie, coûts, seuil, statut
├─ Step 2 : gérer les conversions d'unités (voir §4.9)
│
Étape 3 — Sauvegarde (handleSave)
├─ Zod validation
├─ SKU unique (excluant self)
├─ setProducts(prev => prev.map(...))
├─ Si unitCost changé → onCostChanged(productId, oldCost, newCost, userName)
│  └─ Déclenche le suivi financier (FinancialTrackingContext)
├─ Toast "Produit modifié"
└─ Dialog fermé
```

**Actions admin** : Modifier champs souhaités → 1 clic "Enregistrer"

### 4.3 🔴 SUPPRIMER un produit (Soft Delete)

**Chemin** : `ProductsPage → icône poubelle → ProductDeleteDialog`

```
Pré-vérification — getDeleteBlockReasons(product)
├─ ❌ Stock > 0 dans inventory → BLOQUÉ ("Stock existant: X unités")
├─ ❌ PO ouvertes (status ≠ Received/Cancelled) avec ce productId → BLOQUÉ
├─ ❌ SO ouvertes (status ≠ Delivered/Invoiced/Cancelled) avec ce productId → BLOQUÉ
│
Si aucun bloqueur :
├─ Dialog confirmation avec liste des raisons (vide = ok)
├─ setProducts(prev => prev.map(p => 
│    p.id === id ? { ...p, isActive: false, isDeleted: true } : p
│  ))
├─ Toast "Produit archivé" (soft delete, reste dans le tableau)
│
Si bloqueurs :
└─ Toast destructif avec raisons → dialog fermé, aucune action
```

**Actions admin** : 1 clic poubelle → 1 clic confirmer (si autorisé)

### 4.4 🟡 ACTIVER / DÉSACTIVER un produit

**Chemin** : `ProductsPage → switch toggle dans la colonne Statut`

```
handleToggleActive(product)
├─ Si désactivation (isActive → false) :
│  └─ Vérifier SO ouvertes → BLOQUÉ si commandes de vente en cours
├─ Si activation : aucune restriction
├─ setProducts(prev => prev.map(p => { ...p, isActive: !p.isActive }))
└─ Toast "Produit activé/désactivé"
```

**Actions admin** : 1 clic toggle

### 4.5 👁 VOIR le détail d'un produit

**Chemin** : `ProductsPage → icône œil → ProductDetailDrawer`

- Drawer latéral avec toutes les infos du produit
- Stock par entrepôt, historique de mouvements
- Aucune modification possible

### 4.6 💰 GÉRER le pricing d'un produit

**Chemin** : `ProductsPage → icône prix → ProductPricingDialog`

- Voir/modifier les règles de prix spécifiques
- Historique des changements de prix

### 4.7 📏 GÉRER les unités d'un produit (standalone)

**Chemin** : `ProductsPage → icône unités → ProductUnitsDialog`

- Liste des conversions existantes
- Ajouter/supprimer des conversions
- Identique au Step 2 du ProductFormDialog

### 4.8 📤 EXPORTER les produits

**Chemin** : `ProductsPage → "Exporter" → ExportDialog`

- Colonnes : SKU, Nom, Catégorie, Unité
- Formats : CSV (via exportUtils)
- Données : liste filtrée courante

### 4.9 📏 AJOUTER une conversion d'unité (inline dans ProductFormDialog)

**Chemin** : `ProductFormDialog → Step 2 → "+ Ajouter une unité"`

```
Formulaire inline
├─ Nom de l'unité (ex: "Carton")
├─ Abréviation (ex: "Ctn", max 10 car.)
├─ Facteur de conversion (1 Ctn = X unités de base)
├─ Checkbox Achat / Vente
│
Validation
├─ Tous les champs requis non vides
├─ Facteur > 0
├─ Abréviation unique parmi les conversions existantes
├─ Produit doit être sauvegardé d'abord (pas de création inline en mode create)
│
Résultat
├─ setProductUnitConversions(prev => [...prev, newConv])
├─ Si facteur=1 et pas de base unit → auto-set comme unité de base
├─ Toast "Unité ajoutée"
```

### 4.10 🗑 SUPPRIMER une conversion d'unité

**Chemin** : `ProductFormDialog → Step 2 → icône poubelle sur la ligne`

```
├─ Aucune vérification (⚠ peut casser des commandes existantes)
├─ setProductUnitConversions(prev => prev.filter(c => c.id !== convId))
└─ Toast "Unité supprimée"
```

---

## 5. Scénarios Admin — Catégories (CRUD complet)

### 5.1 🟢 CRÉER une catégorie

**Chemin** : `CategoriesPage → "+ Nouvelle catégorie" → Dialog`

```
Formulaire
├─ Nom (requis) — vérifié unique (case-insensitive)
├─ Description
├─ Statut (Active/Inactive)
│
Sauvegarde
├─ Doublon nom → Toast erreur
├─ ID auto : "CAT-{n}" (séquentiel)
├─ setData(prev => [...prev, newCat])
└─ Toast "Catégorie créée"
```

**Actions admin** : 3 champs → 1 clic "Créer"

### 5.2 🔵 MODIFIER une catégorie

**Chemin** : `CategoriesPage → icône crayon → Dialog pré-rempli`

```
├─ Modifier nom, description, statut
├─ Si renommage :
│  ├─ Toast d'avertissement "Pensez à mettre à jour les produits"
│  └─ ⚠ NE MET PAS À JOUR les Product.category automatiquement !
├─ setData(prev => prev.map(...))
└─ Toast "Catégorie modifiée"
```

**⚠ Problème UX critique** : Le renommage casse les liens produits. L'admin doit manuellement réassigner chaque produit.

### 5.3 🔴 SUPPRIMER une catégorie (Hard Delete)

**Chemin** : `CategoriesPage → icône poubelle → Dialog confirmation`

```
Pré-vérification — dynamicCounts
├─ Compte les produits (non-deleted) ayant category === cat.name
├─ Si count > 0 → BLOQUÉ ("Réassignez d'abord")
│  └─ Bouton poubelle grisé avec tooltip
├─ Si count = 0 → Dialog confirmation
│  └─ setData(prev => prev.filter(c => c.id !== cat.id))
│  └─ ⚠ HARD DELETE — supprimé définitivement du tableau
└─ Toast "Catégorie supprimée"
```

**Incohérence** : Produits → soft delete, Catégories → hard delete.

### 5.4 🔍 FILTRER les catégories

```
├─ Recherche par nom uniquement
├─ Pas de filtre par statut (Active/Inactive)
├─ Pas de tri
├─ Compteur dynamique de produits par catégorie (dynamicCounts)
```

---

## 6. Scénarios Admin — Unités de Mesure (CRUD complet)

### 6.1 🟢 CRÉER une UDM

**Chemin** : `UomPage → "+ Nouvelle UDM" → Dialog`

```
Formulaire
├─ Nom (requis)
├─ Abréviation (requis, unique case-insensitive)
├─ Type (Weight/Volume/Count/Length/Area)
├─ UDM de base (optionnel) → dropdown des UDM sans baseUnit
├─ Facteur de conversion (conditionnel, affiché si baseUnit sélectionné, doit être > 0)
│
Validation
├─ Nom + abréviation non vides
├─ Abréviation unique parmi toutes les UDM
├─ Si baseUnit → facteur > 0 obligatoire
│
Sauvegarde
├─ ID auto : "UOM-{n}" (séquentiel)
├─ setData(prev => [...prev, newUom])
└─ Toast "UDM créée"
```

### 6.2 🔵 MODIFIER une UDM

**Chemin** : `UomPage → icône crayon → Dialog pré-rempli`

```
├─ Modifier nom, abréviation, type, base, facteur
├─ Abréviation unique (excluant self)
├─ setData(prev => prev.map(...))
└─ Toast "UDM modifiée"
```

**⚠** : Si l'abréviation change, les produits utilisant `product.uom = oldAbbr` ne sont pas mis à jour.

### 6.3 🔴 SUPPRIMER une UDM

**Chemin** : `UomPage → icône poubelle → Dialog confirmation`

```
Pré-vérification — getDeleteBlockers(uom)
├─ Produits utilisant cette UDM (product.uom === abbr ou name)
├─ UDM dérivées (autres UDM avec baseUnit === abbr)
├─ Si l'un ou l'autre > 0 → BLOQUÉ
│  └─ Affiche la liste des produits/UDM bloquants
├─ Si aucun bloqueur → confirmer
│  └─ setData(prev => prev.filter(u => u.id !== uom.id))
│  └─ ⚠ HARD DELETE
└─ Toast "UDM supprimée"
```

### 6.4 📤 EXPORTER les UDM (CSV)

```
├─ Colonnes : Abréviation, Nom, Type, UDM de base, Facteur
├─ Données : liste filtrée courante
└─ exportToCSV → téléchargement automatique
```

### 6.5 📥 IMPORTER des UDM (CSV)

**Chemin** : `UomPage → "Import CSV" → Dialog textarea`

```
├─ Coller le contenu CSV brut
├─ Colonnes attendues : Abréviation, Nom, Type, UDM de base, Facteur
├─ Détection automatique des en-têtes (français/anglais)
├─ Doublons d'abréviation → ignorés (skip)
├─ ID auto : "UOM-IMP-{timestamp}-{index}"
├─ Toast récapitulatif : "X ajoutée(s), Y ignorée(s)"
```

### 6.6 🔍 FILTRER les UDM

```
├─ Recherche par nom ou abréviation
├─ Filtre par type (Weight/Volume/Count/Length/Area)
├─ Compteur de produits utilisant chaque UDM (usageCountMap)
```

---

## 7. Flux de filtrage et affichage (Products)

```
useProductFilters({ products, inventory })
  ├─ search: nom ou SKU (case-insensitive)
  ├─ filterCat: Product.category === catName (texte)
  ├─ filterWh: products dont l'ID existe dans inventory[warehouseId=X]
  ├─ filterStatus: "active" | "inactive" | "all"
  ├─ Exclusion: isDeleted === true → toujours exclu
  │
  └─ Métriques calculées :
       ├─ stockTotals: Map<productId, somme qtyOnHand>
       ├─ categories: unique Set de product.category
       ├─ activeCount: nb produits actifs
       ├─ criticalStockCount: nb produits avec stock < 20
       ├─ avgCost: moyenne des unitCost
       └─ avgPrice: moyenne des unitPrice
```

---

## 8. Dépendances inter-modules

| Module                  | Utilisation de Products/Categories/UDM              |
|-------------------------|-----------------------------------------------------|
| **Commandes achat (PO)**| Lignes PO → `productId`, UnitSelector pour l'unité |
| **Commandes vente (SO)**| Lignes SO → `productId`, `unitId`, `conversionFactor` |
| **Inventaire**          | `InventoryItem.productId` → niveaux de stock        |
| **GRN**                 | Réception → `productId`                             |
| **Pricing**             | Règles de prix par produit                          |
| **Conversions**         | `ProductUnitConversion.productId`                   |
| **Ajustements stock**   | Référence `productId`                               |
| **Inventaire cyclique** | Référence `productId`                               |
| **Garde suppression**   | Vérifie PO, SO, Inventory avant delete              |
| **Suivi financier**     | `onCostChanged` → FinancialTrackingContext           |
| **Mobile (SFA)**        | `ProductCatalogItem` (type simplifié)               |
| **Portail client**      | `PortalOrderLine.productId`                         |

---

## 9. Problèmes connus et dette technique

### 🔴 Critiques

| # | Problème | Impact | Fichiers concernés |
|---|----------|--------|--------------------|
| 1 | **Lien catégorie par NOM, pas par ID** | Renommer une catégorie casse TOUS les produits liés | `masterData.ts`, `CategoriesPage.tsx`, `useProductFilters.ts` |
| 2 | **Pas de cascade renommage catégorie** | L'admin doit manuellement réassigner chaque produit | `CategoriesPage.tsx` |
| 3 | **Pas de cascade renommage UDM** | Changer l'abréviation UDM casse `product.uom` | `UomPage.tsx` |

### 🟡 Importants

| # | Problème | Impact |
|---|----------|--------|
| 4 | Hard delete catégories vs soft delete produits | Incohérence de comportement |
| 5 | `productCount` statique sur Category | Valeur seed jamais synchronisée |
| 6 | Conversions d'unités uniquement en mode édition | Admin doit sauver le produit puis le rouvrir pour les unités |
| 7 | Suppression de conversion sans vérification | Peut casser des commandes existantes utilisant cette unité |
| 8 | Pas de filtre statut sur CategoriesPage | Manque de cohérence avec ProductsPage |
| 9 | UDM dérivées : pas de mise à jour en cascade du facteur | Changer le facteur d'une UDM base ne propage pas |

### 🟢 Améliorations souhaitées

| # | Opportunité |
|---|-------------|
| 10 | Hiérarchie catégories (parentId existe mais inutilisé) |
| 11 | Défauts par catégorie (UDM, seuil réappro, pricing) |
| 12 | Réassignation en masse lors suppression/fusion catégorie |
| 13 | Clic compteur catégorie → navigation filtrée vers produits |
| 14 | Import/Export CSV pour catégories (comme UDM) |
| 15 | Historique des modifications produit (audit trail) |

---

## 10. UX Optimisée Proposée — Actions Minimales

### 10.1 Création produit en UNE étape (au lieu de 2)

**Problème actuel** : L'admin crée le produit (step 1), doit le rouvrir pour ajouter les conversions (step 2).

**Solution** :
```
Nouveau formulaire unifié
├─ Section "Infos de base" (toujours visible)
├─ Section "Conversions d'unités" (collapsible, disponible dès la création)
│  └─ Sauvegarder le tout en une seule action
├─ L'unité de base est auto-ajoutée comme conversion factor=1
└─ 1 clic "Créer" → produit + base unit + conversions sauvegardés ensemble
```

**Réduction** : 2 ouvertures dialog → 1 | ~12 clics → ~7 clics

### 10.2 Catégorie inline dans le formulaire produit

**Problème actuel** : Si la catégorie n'existe pas, l'admin doit quitter le dialog, aller sur CategoriesPage, créer la catégorie, revenir.

**Solution** :
```
Dropdown catégorie avec bouton "+ Créer"
├─ Cliquer sur "+ Créer" → mini-form inline (nom + description)
├─ Catégorie créée instantanément et auto-sélectionnée
└─ Pas de navigation, pas de perte de contexte
```

**Réduction** : 6+ actions (navigation aller-retour) → 2 clics

### 10.3 UDM inline dans le formulaire produit

**Problème actuel** : Même problème que catégories — l'admin doit aller sur UomPage.

**Solution** :
```
Dropdown UDM avec bouton "+ Créer"
├─ Mini-form inline (nom, abréviation, type)
├─ UDM créée et auto-sélectionnée comme unité de base
└─ Conversions dérivées ajoutables ensuite dans la même vue
```

### 10.4 Auto-cascade renommage catégorie

**Problème actuel** : Renommer une catégorie ne met pas à jour les produits.

**Solution** :
```
CategoriesPage.handleSave (nouveau)
├─ Si oldName !== newName :
│  ├─ setProducts(prev => prev.map(p =>
│  │    p.category === oldName ? { ...p, category: newName } : p
│  │  ))
│  └─ Toast "X produit(s) mis à jour automatiquement"
└─ Aucune action manuelle requise
```

**Réduction** : N actions manuelles (1 par produit) → 0

### 10.5 Auto-cascade renommage UDM

```
UomPage.handleSave (nouveau)
├─ Si oldAbbreviation !== newAbbreviation :
│  ├─ Mettre à jour products.uom
│  ├─ Mettre à jour productUnitConversions
│  └─ Mettre à jour les UDM dérivées (baseUnit)
└─ 0 action manuelle
```

### 10.6 Réassignation en masse avant suppression catégorie

**Problème actuel** : Si des produits existent, suppression bloquée — l'admin doit les réassigner un par un.

**Solution** :
```
Dialog de suppression amélioré
├─ Si produits > 0 :
│  ├─ Afficher "X produits utilisent cette catégorie"
│  ├─ Dropdown "Réassigner vers :" (autres catégories actives)
│  ├─ 1 clic "Réassigner et supprimer"
│  │  ├─ setProducts(prev => prev.map(p =>
│  │  │    p.category === cat.name ? { ...p, category: newCatName } : p
│  │  │  ))
│  │  └─ setData(prev => prev.filter(c => c.id !== cat.id))
│  └─ Toast "X produits réassignés, catégorie supprimée"
└─ Aucune navigation nécessaire
```

**Réduction** : N+2 actions → 2 clics

### 10.7 Vérification avant suppression de conversion d'unité

**Problème actuel** : Aucune vérification — peut casser des commandes existantes.

**Solution** :
```
handleDeleteUnit (amélioré)
├─ Vérifier si des lignes SO/PO utilisent cette unitId
├─ Si oui → BLOQUÉ avec message
├─ Si non → confirmer → supprimer
```

### 10.8 Soft delete pour catégories (cohérence)

```
Aligner avec le comportement produit :
├─ Ajouter isDeleted à ProductCategory
├─ Filtrer isDeleted dans les dropdowns
├─ Possibilité de restaurer
```

---

## 11. Matrice récapitulative — Actions Admin

| Entité | Action | Nb clics actuel | Nb clics optimisé | Gain |
|--------|--------|:---------------:|:------------------:|:----:|
| **Produit** | Créer | 8+ (2 dialogs) | 5 (1 dialog) | -38% |
| **Produit** | Modifier | 4 | 3 | -25% |
| **Produit** | Supprimer | 2 | 2 | — |
| **Produit** | Toggle statut | 1 | 1 | — |
| **Produit** | Voir détail | 1 | 1 | — |
| **Produit** | Ajouter unité | 5+ (rouvrir) | 3 (inline) | -40% |
| **Produit** | Exporter | 2 | 2 | — |
| **Catégorie** | Créer | 4 | 2 (inline prod.) | -50% |
| **Catégorie** | Renommer | 2 + N (manuels) | 2 (auto-cascade) | -N |
| **Catégorie** | Supprimer | ∞ (bloqué) | 2 (réassigner+del) | -∞ |
| **UDM** | Créer | 5 | 2 (inline prod.) | -60% |
| **UDM** | Renommer | 2 + N (manuels) | 2 (auto-cascade) | -N |
| **UDM** | Supprimer | 2 | 2 | — |
| **UDM** | Import CSV | 3 | 3 | — |
| **UDM** | Export CSV | 1 | 1 | — |

---

## 12. Priorités d'implémentation

| Priorité | Amélioration | Impact UX | Effort dev |
|:--------:|-------------|:---------:|:----------:|
| 🔴 P0 | Auto-cascade renommage catégorie (§10.4) | Critique | Faible |
| 🔴 P0 | Auto-cascade renommage UDM (§10.5) | Critique | Faible |
| 🟠 P1 | Formulaire produit unifié avec unités (§10.1) | Fort | Moyen |
| 🟠 P1 | Réassignation en masse catégorie (§10.6) | Fort | Moyen |
| 🟡 P2 | Catégorie inline dans form produit (§10.2) | Moyen | Faible |
| 🟡 P2 | UDM inline dans form produit (§10.3) | Moyen | Faible |
| 🟡 P2 | Vérification suppression conversion (§10.7) | Moyen | Faible |
| 🟢 P3 | Soft delete catégories (§10.8) | Faible | Faible |
| 🟢 P3 | Hiérarchie catégories en tree view | Faible | Élevé |
| 🟢 P3 | Import/Export CSV catégories | Faible | Faible |
