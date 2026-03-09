# 🏗️ Refactorisation Jawda ERP/WMS — Architecture Multi-WMS Intégrée

> **Version** : 3.0 — Réorganisation complète pour multi-WMS natif
> **Date** : Mars 2026
> **Objectif** : Permettre aux fournisseurs d'avoir leur propre WMS intégré sans dupliquer le code

---

## 📊 Problème Actuel vs Solution

### ❌ Architecture Actuelle (Non-Scalable)

```
JAWDA PLATFORM (v2.0)
│
├── Portail Owner (/owner/*)
│   └── Gère abonnements (Entrepôts + Fournisseurs)
│
├── WMS Dashboard (/)
│   └── 1 seul WMS partagé pour TOUS les entrepôts
│   └── Isolé par tenant_id, mais même interface
│
├── Fournisseur Externe (/supplier/*)
│   └── Portail LÉGER uniquement
│   └── Pas de gestion stock, pas de picking, pas d'opérations
│
└── Fournisseur Abonné (= Entrepôt)
    └── Utilise le MÊME WMS (/) que ses clients
    └── Confusion : Est-ce un fournisseur ou un entrepôt ?
    └── Pas de distinction dans l'interface

❌ PROBLÈME : Impossible de scaler
   - Condor (fournisseur) doit avoir un WMS complet MAIS différent d'Alger
   - Condor doit pouvoir CHERCHER les demandes PO depuis d'autres WMS
   - Condor doit pouvoir REFUSER ou MODIFIER les PO reçues
   - Pas de "super-dashboard" pour voir TOUTES ses commandes (de clients différents)
```

### ✅ Architecture Cible (Multi-WMS Natif)

```
JAWDA PLATFORM (v3.0) — Multi-WMS Natif
│
├── 👑 Portail Owner (/owner/*)
│   └── Dashboard SaaS
│   └── Gère abonnements ENTREPÔTS + FOURNISSEURS
│   └── Monitoring agrégé
│
├── 🏭 WMS Instance #1 — Entrepôt Alger Construction (/)
│   ├── Scope: wh-alger-construction
│   ├── Données: Stock, Commandes, Picking, Livraisons d'Alger uniquement
│   └── Voir: PO reçues des fournisseurs (lecture)
│
├── 🏭 WMS Instance #2 — Entrepôt Oran Food (/alger/*)
│   ├── Scope: wh-oran-food
│   └── Données/Interface indépendantes
│
├── 📦 WMS Instance #3 — Fournisseur Condor (/condor/*)
│   ├── Scope: Condor (comme entité autonome)
│   ├── Stock propre, Produits propres
│   ├── Reçoit les PO de ses clients (Alger, Oran, etc.)
│   ├── Voir: Mes PO reçues (dashboard centralisé)
│   ├── Passer: Contre-PO vers mes propres fournisseurs
│   ├── Gestion complète: Picking, Packing, Livraison
│   └── Facturation propre
│
├── 🏭 WMS Instance #4 — Fournisseur Agro Sahel (/agro-sahel/*)
│   └── Même structure que Condor
│
├── 🛍️ Portail Client (/portal/*)
│   └── Identique pour tous (lecture)
│
├── 📱 Apps Mobile
│   ├── /mobile/* — Commercial (scope entrepôt assigné)
│   └── /delivery/* — Chauffeur (scope entrepôt assigné)
│
└── 👤 Portail Fournisseur Externe (/supplier/*)
    └── Léger (pas de WMS complet)
```

---

## 🔑 Principes Fondamentaux (v3.0)

### 1. **WMS = Entité Juridique Autonome**

```typescript
interface WMSInstance {
  id: string;           // "alger-construction", "condor", "agro-sahel"
  name: string;         // "Entrepôt Alger Construction", "Condor Distribution"
  type: "warehouse" | "supplier";
  
  // Données propres
  warehouses: Warehouse[];     // Entrepôts physiques
  products: Product[];         // Catalogue propre
  customers: Customer[];       // Clients/Fournisseurs partenaires
  suppliers: Supplier[];       // Ses propres fournisseurs
  
  // Utilisateurs
  staff: User[];               // Équipe (CEO, WhMgr, Op, etc.)
  
  // Transactions
  purchaseOrders: PO[];        // PO qu'il émet (vers ses fournisseurs)
  salesOrders: SalesOrder[];   // Commandes qu'il reçoit (de ses clients)
  stock: StockLevel[];         // Stock en temps réel
}
```

### 2. **Isolation Stricte par WMS + Tenant**

```typescript
// Avant (v2.0) : isolé par tenant seulement
filter: item.tenantId === "T-ENT-01"

// Après (v3.0) : isolé par WMS INSTANCE
filter: item.wmsInstanceId === "alger-construction" && item.tenantId === "T-ENT-01"

// Exemple Condor :
// - Voit UNIQUEMENT son stock (wmsInstanceId = "condor")
// - Voit UNIQUEMENT ses PO reçues (destinationWmsId = "condor")
// - Ne voit JAMAIS le stock d'Alger (wmsInstanceId ≠ "alger-construction")
```

### 3. **Navigation Multi-WMS — Sélecteur de Contexte**

```
Utilisateur Condor (CEO Condor) se connecte
│
├─ Login → Identifie wmsInstanceId = "condor"
├─ Dashboard (/condor/) → Son WMS (Condor)
├─ Sidebar:
│   ├─ 📊 Dashboard Condor
│   ├─ 📦 Mes Produits (Condor)
│   ├─ 📋 Mes PO Reçues (de Alger, Oran, etc.)
│   ├─ 🛒 Mes Commandes (vers ses fournisseurs)
│   ├─ 📈 Stock Condor
│   ├─ 🚚 Livraisons Condor
│   ├─ 💳 Comptabilité Condor
│   └─ ⚙️ Paramètres Condor
│
└─ Selector "Voir autres WMS" (si accès multi-WMS)
   ├─ Alger Construction → /alger/*
   ├─ Oran Food → /oran/*
   └─ (requiert permission cross-WMS)
```

### 4. **Recherche Globale de PO Inter-WMS**

```typescript
// Condor peut "chercher" si des demandes le concernent
interface POSearchEngine {
  // Depuis le dashboard Condor, voir:
  // "Y a-t-il des PO pour moi dans la plateforme Jawda ?"
  
  async searchIncomingPOs(wmsInstanceId: "condor") {
    return database.query(`
      SELECT po FROM PurchaseOrders
      WHERE destinationWmsId = :wmsInstanceId
      AND status IN ("pending", "confirmed", "in-transit")
    `);
  }
  
  // Résultat : PO-2026-0100 (Alger → Condor)
  //            PO-2026-0102 (Oran → Condor)
  //            PO-2026-0105 (Constantine → Condor)
}
```

### 5. **Factures & Paiements Multi-Sources**

```
Condor reçoit des PO de 3 clients différents:

  Alger → PO-0100 (500 sacs ciment)
  Oran  → PO-0101 (200 litres huile)
  Constantine → PO-0102 (50 tonnes acier)

Condor facture 3 fois (3 clients différents):
  INV-COND-2026-01 → Alger (500 sacs @ 2,500 DZD/sac = 1,250,000 DZD)
  INV-COND-2026-02 → Oran (200 L @ 3,200 DZD/L = 640,000 DZD)
  INV-COND-2026-03 → Constantine (50 T @ 45,000 DZD/T = 2,250,000 DZD)

Condor a 3 clients importants → 3 flux de trésorerie
Owner voit dans le monitoring que Condor génère 4,140,000 DZD de CA
```

---

## 🎯 Cas d'Usage : Fournisseur Condor Distribution

### Scénario Complet (Semaine Type)

#### **Lundi matin — Condor accède à son WMS**

```
URL: jawda.dz/condor/
│
├─ Utilisateur: Mohamed (CEO Condor Distribution)
│  PIN: 8888
│
├─ Dashboard (/condor)
│  ├─ KPI Condor
│  │  ├─ Stock total: 45,000 articles
│  │  ├─ CA ce mois: 12,450,000 DZD
│  │  ├─ PO en attente: 3
│  │  └─ Livraisons en cours: 2
│  │
│  ├─ Alerte: "3 PO reçues ce week-end"
│  │  ├─ PO-0100 (Alger) - En attente
│  │  ├─ PO-0101 (Oran) - En attente
│  │  └─ PO-0102 (Constantine) - Confirmée
│  │
│  └─ Actions rapides
│     ├─ 📋 Mes PO Reçues (3)
│     ├─ 🛒 Mes Commandes vers fournisseurs
│     ├─ 📦 Stock
│     └─ 🚚 Livraisons
```

#### **Lundi 9h — Vérifier les 3 PO reçues**

```
/condor/incoming-pos/

Tableau:
┌────────────────────────────────────────────────┐
│ # │ Client   │ Produits      │ QTE  │ Montant │ Statut   │
├────────────────────────────────────────────────┤
│ 1 │ Alger    │ Ciment CEM-32 │ 500T │ 1.25M   │ pending  │
│ 2 │ Oran     │ Huile olive   │ 200L │ 640K    │ pending  │
│ 3 │ Constant │ Acier FeE400  │ 50T  │ 2.25M   │ confirm. │
└────────────────────────────────────────────────┘

Actions par PO:
├─ Confirmer (change status → confirmed)
├─ Refuser (avec motif)
├─ Modifier quantité (négoce)
├─ Proposer alternative (produit similaire)
└─ Voir détail
```

#### **Lundi 10h — Confirmer PO-0100 d'Alger**

```
/condor/incoming-pos/PO-0100/

Détail PO:
├─ Client: Entrepôt Alger Construction
├─ Produits:
│  └─ Ciment CEM-32 (500 tonnes)
│     ├─ Stock Condor disponible: 800 tonnes ✅
│     ├─ Prix: 2,500 DZD/tonne
│     └─ Total: 1,250,000 DZD
│
├─ Conditions
│  ├─ Délai livraison: 3 jours
│  ├─ Paiement: Net 30
│  └─ Livraison: À Alger (adresse fournie)
│
└─ Actions
   ├─ ✅ CONFIRMER
   ├─ ❌ REFUSER
   └─ 📝 MODIFIER (quantité, délai, etc.)

Mohamed clique CONFIRMER
│
├─ Statut PO-0100: confirmed
├─ Alerte vers Condor Ops: "Nouveau picking à faire pour Alger"
├─ Notif vers Alger WMS: "PO confirmée par Condor, en préparation"
└─ Log audit: "CEO Condor confirme PO-0100 le 10/03 à 10:15"
```

#### **Lundi 11h — Modifier PO-0101 d'Oran**

```
/condor/incoming-pos/PO-0101/

Oran a demandé: 200 litres huile olive

Mohamed vérife son stock:
├─ Huile olive dispo: 150 litres (pas 200)
├─ Nouvelle récolte en 5 jours: +300 litres

Options:
1️⃣ Livrer 150 L maintenant (partiel)
2️⃣ Livrer 200 L dans 5 jours
3️⃣ Livrer 100 L maintenant + 100 L dans 5 jours

Mohamed clique: "Proposer 150 L immédiatement"
│
├─ Système crée une contre-proposition
├─ Notif vers Oran WMS: "Condor propose 150L (au lieu de 200L)"
├─ Oran peut:
│  ├─ Accepter la contre-prop
│  ├─ Rejeter et annuler
│  └─ Négocier davantage
│
└─ Statut PO-0101: pending_negotiation
```

#### **Lundi 14h — Refuser PO-0102 de Constantine**

```
/condor/incoming-pos/PO-0102/

Constantine demande: 50 tonnes acier FeE400

Mohamed vérife son stock:
├─ Acier FeE400 disponible: 0 tonnes ❌
├─ Fournisseur habituel: Sidérurgie Mittal
├─ Délai appro: 7 jours

Mohamed clique: "REFUSER"
│
├─ Motif obligatoire: "Produit en rupture stock"
├─ Suggestion: "Disponible dans 7 jours, le 17/03"
│
├─ Système envoie notif:
│  ├─ Vers Constantine WMS: "Condor refuse - En rupture"
│  ├─ Suggestions alternatives de Condor:
│  │  ├─ Acier FeE250 (équivalent, disponible)
│  │  ├─ Acier FeE400 dans 7 jours
│  │
│  └─ Constantine peut:
│     ├─ Accepter l'alternative
│     ├─ Attendre 7 jours
│     └─ Chercher ailleurs
│
└─ Statut PO-0102: refused
```

---

## 🗂️ Structure Technique (v3.0)

### Dossiers & Routes

```
src/
├── app/
│   ├── routes/
│   │   ├── adminRoutes.tsx          # Routes WMS génériques
│   │   ├── wmsInstanceRoutes.tsx    # 🆕 Routes multi-instance
│   │   ├── condorRoutes.tsx         # 🆕 Routes Condor (/condor/*)
│   │   ├── agrosahel Routes.tsx     # 🆕 Routes Agro Sahel (/agro-sahel/*)
│   │   └── supplierRoutes.tsx       # Routes fournisseur léger
│   │
│   └── App.tsx                      # Main routing logic
│
├── wms/
│   ├── core/                        # 🆕 Core WMS logic (partagé)
│   │   ├── POEngine.ts              # Gestion PO universelle
│   │   ├── StockEngine.ts           # Calcul stock partagé
│   │   ├── PickingEngine.ts         # Algorithme picking (FIFO/FEFO)
│   │   ├── PricingEngine.ts         # Tarification partagée
│   │   └── ShippingEngine.ts        # Logique livraison
│   │
│   ├── instances/                   # 🆕 Instances spécifiques
│   │   ├── WarehouseInstance.ts     # Template pour entrepôts
│   │   ├── SupplierInstance.ts      # Template pour fournisseurs
│   │   ├── condor/                  # Instance Condor
│   │   │   ├── config.ts
│   │   │   ├── data.ts
│   │   │   └── customization.ts
│   │   ├── agro-sahel/              # Instance Agro Sahel
│   │   └── alger/                   # Instance Alger
│   │
│   ├── cross-wms/                   # 🆕 Logique inter-WMS
│   │   ├── PORouter.ts              # Route PO vers le bon WMS
│   │   ├── POSearchEngine.ts        # Chercher PO multi-WMS
│   │   ├── NotificationBus.ts       # Notif inter-WMS
│   │   ├── InvoicingEngine.ts       # Facturation B2B
│   │   └── AuditLog.ts              # Audit globale
│   │
│   └── shared/                      # Composants partagés
│       ├── StockDashboard.tsx       # Réutilisable
│       ├── POForm.tsx               # Form création PO
│       └── ...
│
├── contexts/
│   ├── AuthContext.tsx              # Auth (inclut wmsInstanceId)
│   ├── WMSDataContext.tsx           # Données WMS (partagé)
│   ├── InstanceContext.tsx          # 🆕 Instance active
│   └── NotificationContext.tsx      # 🆕 Notif inter-WMS
│
├── features/
│   ├── incoming-pos/                # 🆕 PO reçues (fournisseurs)
│   │   ├── IncomingPOList.tsx
│   │   ├── IncomingPODetail.tsx
│   │   ├── ConfirmPO.tsx
│   │   ├── RefusePO.tsx
│   │   └── NegotiatePO.tsx
│   │
│   ├── outgoing-pos/                # PO émises
│   ├── picking/
│   ├── shipping/
│   └── ...
│
└── data/
    ├── mockData.ts                  # Cache données
    └── wms-instances.ts             # 🆕 Définition instances
```

### Contexte Utilisateur (v3.0)

```typescript
interface AuthContextType {
  // Existant
  user: User;
  isAuthenticated: boolean;
  
  // 🆕 Multi-WMS
  wmsInstanceId: string;           // "alger-construction", "condor"
  wmsInstance: WMSInstance;        // Données instance
  
  // 🆕 Scope
  scope: {
    warehouses: string[];          // Entrepôts accessibles
    isMultiWMS: boolean;           // Peut voir plusieurs WMS
    isSupplier: boolean;           // Est fournisseur
  };
  
  // 🆕 Permissions inter-WMS
  canViewPO: (fromWms: string, toWms: string) => boolean;
  canEditIncomingPO: (fromWms: string) => boolean;
}
```

---

## 🔄 Flux PO Inter-WMS (v3.0)

### Scénario: Alger envoie PO à Condor

```
┌─ ALGER WMS ─────────────────────────────────────────┐
│                                                      │
│ 1. Karim (WhMgr Alger) crée PO-0100              │
│    ├─ Destination: V-CONDOR (Condor Distribution) │
│    ├─ Produits: 500T ciment CEM-32               │
│    └─ Clique "CONFIRMER"                         │
│                                                   │
│    Status: PO-0100 → "Confirmed"                 │
│                                                   │
└────────────────────┬────────────────────────────────┘
                     │ (API/Sync)
                     │ PORouter.route({
                     │   fromWms: "alger-construction",
                     │   toWms: "condor",
                     │   po: PO-0100
                     │ })
                     ▼
          JAWDA NOTIFICATION BUS
          │
          ├─ Log: "PO-0100 Alger→Condor created"
          ├─ Queue: NotificationQueue
          └─ Event: "po.incoming" (Condor)

                     ▼
┌─ CONDOR WMS ────────────────────────────────────────┐
│                                                      │
│ 2. Dashboard Condor reçoit notif                    │
│    ├─ "1 nouvelle PO reçue"                         │
│    ├─ Alert: "Alger demande 500T ciment"           │
│                                                     │
│ 3. Mohamed (CEO Condor) consulte PO-0100          │
│    └─ /condor/incoming-pos/PO-0100               │
│                                                     │
│ 4. Mohamed clique "CONFIRMER"                      │
│    ├─ Vérifie stock: 800T disponibles ✅          │
│    ├─ Status: PO-0100 → "Confirmed by supplier"   │
│    └─ Crée tâche: "Faire picking 500T ciment"     │
│                                                     │
│ 5. Operator Condor (Yacine)                        │
│    ├─ Voit picking task                            │
│    ├─ Prélève 500T, marque "picking_done"         │
│    └─ Packing stage                               │
│                                                     │
│ 6. Driver Condor livre à Alger                    │
│    ├─ GPS tracking (journée)                      │
│    └─ Signature Alger: "Reçu 500T"               │
│                                                     │
└────────────────────┬────────────────────────────────┘
                     │ (Delivery confirmation)
                     │ updatePOStatus({
                     │   poId: "PO-0100",
                     │   status: "delivered"
                     │ })
                     ▼
          JAWDA NOTIFICATION BUS
          │
          ├─ Alger WMS: "PO-0100 delivered"
          ├─ Condor WMS: "PO-0100 revenue recorded"
          ├─ Owner: "Revenue +1.25M from Condor"
          └─ Audit: Full trail

                     ▼
┌─ ALGER WMS ─────────────────────────────────────────┐
│                                                      │
│ 7. Karim (Alger) reçoit notif "PO livré"         │
│                                                     │
│ 8. Tarek (Operator) crée GRN-5060                 │
│    ├─ Lié à PO-0100                               │
│    ├─ Reçoit 500T                                 │
│    └─ QC: Sara inspecte ✅                        │
│                                                     │
│ 9. Nadia (Compta) voit:                           │
│    ├─ PO-0100 ✅ Reçue                            │
│    ├─ GRN-5060 ✅ Créée                           │
│    ├─ Facture Condor attendue                     │
│    └─ 3-way match                                 │
│                                                     │
│ 10. Mohamed (Condor) crée facture                 │
│     ├─ INV-COND-2026-001                          │
│     ├─ Lié à PO-0100                              │
│     ├─ 500T @ 2,500 DZD = 1,250,000 DZD          │
│     └─ Envoie facture vers Alger                  │
│                                                     │
│ 11. Nadia rapproche:                              │
│     ├─ PO-0100 ✅                                 │
│     ├─ GRN-5060 ✅                                │
│     ├─ INV-COND-2026-001 ✅                      │
│     └─ 3-Way Match OK → Auto-approbation          │
│                                                     │
│ 12. Paiement                                       │
│     ├─ Anis (FinDir Alger) approuve paiement      │
│     ├─ Transfer 1.25M vers Condor                 │
│     └─ Condor reçoit trésorerie                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## ⚙️ Isolation Multi-WMS: Règles Strictes

### Règle #1: Données Scopées

```typescript
// ✅ CORRECT
const poFilter = {
  wmsInstanceId: "condor",      // Instance actuellement active
  tenantId: "T-FRN-01",         // Tenant Condor
  status: { $in: ["pending", "confirmed"] }
};
// Résultat: UNIQUEMENT les PO de/vers Condor

// ❌ INCORRECT (requêtes interdites)
const badFilter = {
  // Pas de wmsInstanceId → tentative voir TOUS les WMS
  status: { $in: ["pending"] }
};
// Error: "wmsInstanceId required"
```

### Règle #2: Navigation Inter-WMS Stricte

```typescript
// Utilisateur Condor navigue vers Alger ?
if (currentUser.wmsInstanceId === "condor" && 
    requestedWms === "alger-construction") {
  
  // Vérify permission cross-WMS
  const hasPermission = await checkCrossWMSAccess({
    fromWms: "condor",
    toWms: "alger-construction",
    user: currentUser,
    action: "view_as_supplier"  // Condor voit ses PO chez Alger
  });
  
  if (!hasPermission) {
    // Bloquer, log, alerte
    throw new ForbiddenError("Cross-WMS access denied");
  }
}
```

### Règle #3: Transactions Doubles (PO Entrante + Sortante)

```typescript
// PO-0100: Alger → Condor
// Dans Alger WMS: C'est une PO sortante (outgoing_po)
// Dans Condor WMS: C'est une PO entrante (incoming_po)

// Alger voit:
interface OutgoingPO {
  id: "PO-0100",
  sourceWms: "alger-construction",
  destinationWms: "condor",
  status: "confirmed",  // Alger a confirmé
}

// Condor voit:
interface IncomingPO {
  id: "PO-0100",  // Même ID
  sourceWms: "alger-construction",
  myWms: "condor",
  status: "pending",  // En attente de confirmation Condor
}

// IMPORTANT: Changement de statut doit SYNC
// Quand Condor confirme → Alger voit "confirmed by supplier"
```

---

## 📱 UX/UI Changes (v3.0)

### Login: Sélection WMS Instance

```
JAWDA — Connexion
═══════════════════════════════════════════

┌─ Mode 1: Multi-WMS (pour Condor CEO) ─────┐
│                                           │
│  Utilisateur: Mohamed Ben Ali            │
│  PIN: [8888]                             │
│                                           │
│  WMS Instance:                            │
│  ┌─────────────────────────────────────┐  │
│  │ 🏭 Condor Distribution (défaut)    │  │
│  │ 🏭 Alger Construction (lecture)     │  │
│  │ 🏭 Oran Food (lecture)              │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  [Se connecter]                          │
└─────────────────────────────────────────┘

┌─ Mode 2: WMS Simple (pour WhMgr Alger) ──┐
│                                           │
│  Utilisateur: Karim Ben Ali              │
│  PIN: [2345]                             │
│                                           │
│  WMS Instance: Alger Construction        │
│  (1 seul WMS assigné)                    │
│                                           │
│  [Se connecter]                          │
└─────────────────────────────────────────┘
```

### Sidebar: WMS Context Indicator

```
Utilisateur Condor connecté sur Condor WMS:

┌─────────────────────────────────┐
│ 📍 CONDOR DISTRIBUTION          │
│    Distribution générale        │
│    (Fournisseur abonné)        │
├─────────────────────────────────┤
│ 📊 Dashboard                    │
│ 📦 Mes Produits                │
│ 📋 PO Reçues (3 en attente)    │ ← 🆕
│ 🛒 Mes Commandes                │
│ 📈 Stock                        │
│ 🚚 Livraisons                   │
│ 💳 Comptabilité                │
│ 👥 Utilisateurs                │
│ ⚙️ Paramètres                   │
├─────────────────────────────────┤
│ 🔄 Switcher WMS:               │ ← 🆕
│   ├─ Alger (lecture)           │
│   ├─ Oran (lecture)            │
│   ├─ Constantine (lecture)     │
│   └─ Owner Dashboard           │
├─────────────────────────────────┤
│ 🚪 Déconnexion                  │
└─────────────────────────────────┘
```

### Dashboard Condor: Incoming PO Widget

```
┌──────────────────────────────────────────────────┐
│ 🔔 PO REÇUES CETTE SEMAINE: 3                  │
├──────────────────────────────────────────────────┤
│                                                  │
│ ✏️ ATTENTE DE CONFIRMATION (2)                 │
│ ┌──────────────────────────────────────────┐    │
│ │ PO-0100 | Alger | 500T Ciment | En ⏳   │    │
│ │ Action: [Confirmer] [Modifier] [Refuser] │    │
│ └──────────────────────────────────────────┘    │
│ ┌──────────────────────────────────────────┐    │
│ │ PO-0101 | Oran | 200L Huile | Négoce ⚖️ │    │
│ │ Contre-prop: 150L maintenant            │    │
│ │ Action: [Envoyer] [Modifier] [Annuler] │    │
│ └──────────────────────────────────────────┘    │
│                                                  │
│ ✅ CONFIRMÉES (1)                              │
│ ┌──────────────────────────────────────────┐    │
│ │ PO-0102 | Constantine | 50T Acier | ✅  │    │
│ │ Status: En picking (Yacine fait)        │    │
│ │ ETA livraison: 15 mars                   │    │
│ └──────────────────────────────────────────┘    │
│                                                  │
│ 🔴 REFUSÉES (0)                                │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 🎓 Avantages Architecturaux (v3.0)

| Aspect | v2.0 (Ancien) | v3.0 (Nouveau) | Bénéfice |
|--------|:-:|:-:|---|
| **Fournisseur Condor** | Portail léger uniquement | WMS complet + autonome | ✅ Gestion stock, picking, livraison |
| **Isolation données** | Par tenant_id | Par wmsInstanceId + tenant_id | ✅ Plus stricte, scalable |
| **PO entrantes** | Non implémenté | Dashboard centralisé | ✅ Condor voit toutes ses PO |
| **Modification PO** | Impossible | Contre-propositions, négociations | ✅ Commerce plus flexible |
| **Facturation** | Partagée | Indépendante par WMS | ✅ N-à-N clients |
| **Escalabilité** | Bloquée à 4-5 WMS | Illimitée (+ providers tier) | ✅ Growth SaaS |
| **Commerce B2B** | Limité | Complet (offres, contre-offres) | ✅ Workflows réalistes |

---

## 📋 Résumé Refactorisation

### Phase 1 (1 semaine)
- [ ] Créer `WMSInstance` model
- [ ] Ajouter `wmsInstanceId` partout
- [ ] Créer contexte `InstanceContext`
- [ ] Routes multi-instance génériques

### Phase 2 (1-2 semaines)
- [ ] Implémenter Condor WMS instance
- [ ] Créer features "Incoming POs"
- [ ] POSearchEngine inter-WMS
- [ ] Notif bus inter-WMS

### Phase 3 (1 semaine)
- [ ] Factures indépendantes par WMS
- [ ] Paiements (clients de Condor)
- [ ] Tests multi-WMS isolation
- [ ] Audit trail global

### Phase 4 (1 semaine)
- [ ] UI multi-WMS switcher
- [ ] Monitoring Owner (par WMS)
- [ ] Documentation & onboarding
- [ ] Demo Condor complet

**Durée totale: 4 semaines pour production v3.0**

