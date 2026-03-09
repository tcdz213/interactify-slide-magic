# Plan — Portail Fournisseur (Supplier Dashboard)

> **Référence** : [jawda-platform-complete.md](./jawda-platform-complete.md) — § 4.12, § 5, § 7.2, § 7.5, § 8.9, § 8.10
> **Version** : 2.0 — Mars 2026

---

## 1. Vue d'ensemble

Le **Portail Fournisseur** existe en **deux variantes** selon le type de fournisseur :

| Type | Route | Description | Abonné Jawda |
|------|-------|-------------|:---:|
| **Fournisseur externe** (non-abonné) | `/my/*` ou `/supplier/*` | Portail léger : consulter PO, factures, scorecard | Non |
| **Fournisseur abonné** (inter-entreprise) | `/` (WMS complet) | Même WMS que les entrepôts — les PO reçues deviennent des SalesOrders | Oui |

```
JAWDA PLATFORM — PORTAILS FOURNISSEURS
|
|-- Fournisseur EXTERNE (non-abonné, gratuit)
|   |-- Route : /my/* (intégré au WMS) ou /supplier/* (standalone)
|   |-- Rôle : Supplier
|   |-- Scope : Ses propres PO, factures, produits
|   |-- Accès : Portail léger responsive
|   |
|   ┌─────────────────────────────────────────────────────┐
|   │           PORTAIL FOURNISSEUR EXTERNE               │
|   │                                                     │
|   │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐ │
|   │  │Dash  │  │Prods │  │Orders│  │Invoic│  │ More │ │
|   │  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘ │
|   └─────────────────────────────────────────────────────┘
|
|-- Fournisseur ABONNÉ (ex: Agro Sahel Distribution)
|   |-- Route : / (WMS Dashboard complet)
|   |-- Rôles : CEO, WhMgr, Operator, Driver (propres à l'entreprise)
|   |-- Les PO entrantes apparaissent comme SalesOrders dans leur WMS
|   |-- Utilise le MÊME dashboard que les entrepôts clients
```

---

## 2. Fournisseur Externe — Rôle & Permissions

> Source : jawda-platform-complete.md § 4.12

| Attribut | Détail |
|----------|--------|
| **Portail** | `/my/*` (dans le WMS) ou `/supplier/*` (standalone) |
| **Scope** | Ses propres PO, factures, produits, scorecard |
| **Niveau RBAC** | Externe (hors hiérarchie interne) |
| **Relation** | Référencé par un ou plusieurs entrepôts abonnés |
| **Coût** | Gratuit (l'entrepôt client paie l'abonnement) |

### Permissions

| Action | Autorisé |
|--------|:---:|
| Consulter les PO reçues | ✅ |
| Confirmer / refuser une PO | ✅ |
| Voir ses produits référencés | ✅ |
| Ajouter / modifier ses produits | ✅ |
| Désactiver un produit | ✅ |
| Suivre ses livraisons | ✅ |
| Consulter ses factures | ✅ |
| Voir son scorecard performance | ✅ |
| Voir sa fiche profil & la modifier | ✅ |
| Voir le stock global de l'entrepôt | ❌ |
| Voir les commandes d'autres fournisseurs | ❌ |
| Voir les prix de vente / marges | ❌ |
| Accéder au WMS / Admin | ❌ |
| Accéder à la gestion utilisateurs | ❌ |
| Accéder aux analytics globales | ❌ |

### Matrice d'accès (réf. § 6)

| Module | Accès |
|--------|:---:|
| Achats (PO) | R (ses PO uniquement) |
| Finance | R (ses factures) |
| Qualité | R (son scorecard) |
| Ventes / Stock / WMS / Admin / BI | ❌ |

---

## 3. Écrans & Navigation — Portail Externe (`/my/*`)

### 3.1 📊 Dashboard Fournisseur (`/my/dashboard`)

**KPI principaux :**

| KPI | Description | Exemple |
|-----|-------------|---------|
| Produits actifs | Nombre de produits référencés et actifs | 24 |
| Commandes reçues | PO reçues ce mois | 8 |
| Revenus générés | Total facturé ce mois | 1,250,000 DZD |
| Commandes en attente | PO en attente de confirmation | 2 |
| Score qualité | Scorecard fournisseur (sur 100) | 87/100 |
| Taux de livraison | % livraisons conformes | 94% |

**Graphiques :**
- 📈 Ventes mensuelles (bar chart, 12 mois)
- 📊 Commandes par statut (donut : pending, confirmed, shipped, delivered)
- 📉 Évolution du scorecard (line chart, 6 mois)

**Widgets :**
- Dernières commandes (3 dernières PO avec statut)
- Notifications récentes
- Actions rapides : Voir PO en attente, Consulter factures

---

### 3.2 📦 Mes Produits (`/my/products`)

**Table des produits du fournisseur :**

| Colonne | Description |
|---------|-------------|
| Produit | Nom du produit |
| SKU | Code article fournisseur |
| Catégorie | Secteur / Catégorie |
| Stock (chez le client) | Quantité en stock chez l'entrepôt client |
| Prix unitaire | Prix d'achat négocié |
| Statut | Actif / Inactif |

**Actions :**
- ➕ Ajouter un produit (soumis pour validation par le WhMgr)
- ✏️ Modifier un produit (nom, description, prix proposé)
- 🔴 Désactiver un produit
- 🔍 Recherche + filtrage par catégorie, statut

**Filtrage obligatoire backend :** `supplier_id = req.user.id`

**Règles :**
- Le fournisseur ne voit que SES produits
- L'ajout de produit est soumis à validation par le WarehouseManager
- Le prix affiché est le prix d'achat négocié (pas le prix de vente de l'entrepôt)
- Le fournisseur ne connaît PAS la marge de l'entrepôt

---

### 3.3 📋 Mes Commandes (`/my/orders`)

**PO (Purchase Orders) contenant les produits du fournisseur :**

| Colonne | Description |
|---------|-------------|
| N° Commande | Référence PO |
| Entrepôt client | Qui a passé la commande |
| Produits | Nombre d'articles (ses items uniquement) |
| Quantité totale | Unités commandées |
| Montant | Total HT de ses items |
| Statut | pending → confirmed → shipped → delivered → invoiced |
| Date | Date de création |

**Statuts visuels :**
```
pending    → 🟡 En attente de confirmation fournisseur
confirmed  → 🔵 Confirmée (en préparation)
shipped    → 🚚 Expédiée
delivered  → ✅ Livrée (GRN créé)
invoiced   → 💳 Facturée
cancelled  → ❌ Annulée
```

**Important :**
> Une PO peut contenir des produits de **plusieurs fournisseurs**. Le fournisseur ne voit que **ses propres items** dans chaque commande.

**Actions sur une commande :**
- ✅ Confirmer la PO → statut passe à "confirmed"
- ❌ Refuser la PO → motif obligatoire → notification au WhMgr
- 🚚 Marquer "Expédiée" → date d'expédition + n° tracking
- 📄 Voir le détail (produits, quantités, prix)

#### Détail commande (`/my/orders/:id`)

| Section | Contenu |
|---------|---------|
| En-tête | N° PO, date, entrepôt client |
| Lignes | Produit, quantité commandée, quantité livrée, prix unitaire, total |
| Statut | Timeline visuelle |
| Livraison | Date prévue, date réelle, transporteur |
| Notes | Commentaires du WhMgr |
| Actions | Confirmer / Refuser / Marquer expédié |

> **Scénario** (réf. § 8.9) : WhMgr Oran crée PO-2026-0087 → Karim (Agro Sahel) reçoit notification → confirme → prépare → marque "shipped" → Entrepôt Oran reçoit → GRN créé → facture → paiement.

---

### 3.4 💳 Factures (`/my/invoices`)

| Colonne | Description |
|---------|-------------|
| N° Facture | Identifiant |
| PO liée | Référence commande |
| Période | Mois / trimestre |
| Montant | Total HT |
| Statut | paid / pending / overdue |
| Date paiement | Date de règlement (si payée) |
| Échéance | Date limite de paiement |

**Statuts visuels :**
```
paid     → ✅ Payée
pending  → 🟡 En attente
overdue  → 🔴 En retard
```

**Résumé financier (en haut de page) :**
```
┌────────────────────────────────────────┐
│       RÉSUMÉ FINANCIER FOURNISSEUR     │
│                                        │
│  Total facturé ce mois : 1,250,000 DZD │
│  Payé :                    980,000 DZD │
│  En attente :              200,000 DZD │
│  En retard :                70,000 DZD │
│                                        │
│  Prochain paiement prévu : 15 mars     │
└────────────────────────────────────────┘
```

**Actions :**
- 📥 Télécharger facture PDF
- 📊 Filtrer par statut, période
- 📧 Relancer (envoyer rappel si overdue)

---

### 3.5 📈 Statistiques (`/my/stats`)

**Graphiques analytiques :**

| Graphique | Type | Description |
|-----------|------|-------------|
| CA mensuel | Bar chart | Revenus par mois (12 mois glissants) |
| Top produits | Bar horizontal | 10 produits les plus commandés |
| Commandes par statut | Donut | Répartition pending/confirmed/shipped/delivered |
| Évolution scorecard | Line chart | Score qualité sur 6 mois |
| Taux de conformité | Gauge | % livraisons conformes (quantité + qualité) |

**KPI détaillés :**

| KPI | Description |
|-----|-------------|
| CA total (YTD) | Chiffre d'affaires année en cours |
| Commandes totales | Nombre de PO reçues |
| Délai moyen livraison | Jours entre confirmation et livraison |
| Taux de conformité quantité | % GRN sans écart quantité |
| Taux de conformité qualité | % GRN sans rejet qualité |
| Réclamations ouvertes | Nombre de quality claims actives |

---

### 3.6 👤 Profil (`/my/profile`)

| Section | Champs |
|---------|--------|
| **Entreprise** | Raison sociale, forme juridique, secteur |
| **Contact** | Nom gérant, téléphone, email, adresse |
| **Légal** | NIF, NIS, registre de commerce, article d'imposition |
| **Bancaire** | RIB, banque, agence, IBAN |
| **Fiscal** | Assujetti TVA (oui/non), taux applicable |
| **Catalogue** | Catégories de produits fournies |
| **Conditions** | Délai de paiement préféré, MOQ (minimum order qty) |

**Actions :**
- ✏️ Modifier les informations (soumis pour validation)
- 📄 Télécharger la fiche fournisseur PDF
- 🔑 Changer mot de passe / PIN

---

## 4. Portail Standalone (`/supplier/*`)

> Alternative au `/my/*` pour les fournisseurs qui n'accèdent pas via le WMS.

| Route | Écran | Équivalent `/my/*` |
|-------|-------|---------------------|
| `/supplier/login` | Login (OTP email/SMS) | — |
| `/supplier/` | Dashboard | `/my/dashboard` |
| `/supplier/products` | Mes Produits | `/my/products` |
| `/supplier/orders` | Mes Commandes | `/my/orders` |
| `/supplier/orders/:id` | Détail commande | `/my/orders/:id` |
| `/supplier/deliveries` | Mes Livraisons | — |
| `/supplier/invoices` | Factures | `/my/invoices` |
| `/supplier/stats` | Statistiques | `/my/stats` |
| `/supplier/performance` | Scorecard | — |
| `/supplier/notifications` | Notifications | — |
| `/supplier/settings` | Profil & Paramètres | `/my/profile` |

### Page Livraisons (`/supplier/deliveries`)

| Colonne | Description |
|---------|-------------|
| PO liée | Référence commande |
| Entrepôt destination | Site de livraison |
| Date prévue | Date de livraison planifiée |
| Date réelle | Date effective |
| Statut | En préparation / Expédiée / Livrée |
| Écart | Jours avance/retard |

### Page Performance / Scorecard (`/supplier/performance`)

> Source : jawda-platform-complete.md § 4.6 (WhMgr évalue les fournisseurs via `/wms/vendor-scorecard`)

| Critère | Poids | Score |
|---------|:---:|:---:|
| Conformité quantité | 30% | 92% |
| Conformité qualité | 30% | 88% |
| Respect délais | 25% | 85% |
| Réactivité (confirmation PO) | 15% | 95% |
| **Score global** | **100%** | **89/100** |

### Page Notifications (`/supplier/notifications`)

| Type | Exemple |
|------|---------|
| Nouvelle PO | "Nouvelle commande #PO-xxx reçue de Entrepôt Oran" |
| PO modifiée | "Commande #PO-xxx modifiée (quantité mise à jour)" |
| GRN créé | "Réception confirmée pour #PO-xxx" |
| Paiement | "Paiement de 250,000 DZD reçu" |
| Réclamation | "Réclamation qualité #QC-xxx ouverte" |
| Scorecard | "Votre score fournisseur a été mis à jour : 89/100" |

---

## 5. Fournisseur Abonné — Flux B2B Inter-Entreprise

> Source : jawda-platform-complete.md § 7.5, § 8.10

Le fournisseur abonné (ex: **Agro Sahel Distribution**) utilise le **même WMS Dashboard** (`/`) que ses clients. Les PO entrantes apparaissent automatiquement comme des **SalesOrders** dans son WMS.

### Flux complet

```
Entrepôt A (Oran)                      Fournisseur D (Agro Sahel)
┌──────────────────┐                   ┌──────────────────┐
│ WhMgr crée PO    │──── PO envoyée ──→│ PO → SalesOrder  │
│ vers "V-SAHEL"   │                   │ dans le WMS de D │
└──────────────────┘                   └──────────────────┘
                                       │
                                       ├── WhMgr D confirme
                                       ├── Operator D fait picking
                                       ├── Driver D charge + livre
                                       │
┌──────────────────┐                   └──────────────────┐
│ Operator A crée  │←── Livraison ─────│ Driver D livre   │
│ GRN à réception  │                   │ à Entrepôt A     │
└──────────────────┘                   └──────────────────┘
│                                       │
├── QC inspecte                         ├── Comptable D émet facture
├── 3-Way Match                         │
├── Comptable A paie                    └── Paiement reçu ✅
```

> **Scénario** (réf. § 8.10) : WhMgr Oran crée PO vers "V-SAHEL" → Chez Agro Sahel, PO = SalesOrder → Mourad (WhMgr) confirme → Yacine (Operator) picking → Bilal (Driver) livre → Operator Oran GRN → Comptable Sahel facture → Comptable Oran paie.

### Différences Fournisseur Externe vs Abonné

| Aspect | Externe (non-abonné) | Abonné (WMS) |
|--------|:---:|:---:|
| Portail | `/my/*` ou `/supplier/*` | `/` (WMS complet) |
| Gestion stock propre | ❌ | ✅ |
| Picking / Packing | ❌ | ✅ |
| Driver propre | ❌ | ✅ |
| Factures émises | Reçoit du client | Émet lui-même |
| Scorecard | Visible en lecture | Se voit + voit ses fournisseurs |
| Coût | Gratuit | Abonnement Jawda |
| Multi-utilisateurs | 1 compte | CEO, WhMgr, Op, Driver... |

---

## 6. Authentification

| Type fournisseur | Méthode |
|------------------|---------|
| **Externe** | Email + OTP (code 6 chiffres) ou mot de passe |
| **Abonné** | PIN + biométrie (comme les rôles internes) |

### Redirect après login

| Rôle | Redirect |
|------|----------|
| Supplier (externe, via WMS) | `/my/dashboard` |
| Supplier (externe, standalone) | `/supplier/` |
| Supplier (abonné, CEO) | `/` (WMS Dashboard) |

---

## 7. Backend Endpoints

> Toutes les requêtes filtrent par `supplier_id = req.user.id`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/supplier/dashboard` | KPI fournisseur |
| GET | `/supplier/products` | Liste produits du fournisseur |
| POST | `/supplier/products` | Ajouter un produit |
| PUT | `/supplier/products/:id` | Modifier un produit |
| PATCH | `/supplier/products/:id/status` | Activer / désactiver |
| GET | `/supplier/orders` | PO reçues (ses items uniquement) |
| GET | `/supplier/orders/:id` | Détail d'une PO |
| PATCH | `/supplier/orders/:id/confirm` | Confirmer une PO |
| PATCH | `/supplier/orders/:id/refuse` | Refuser une PO |
| PATCH | `/supplier/orders/:id/ship` | Marquer expédiée |
| GET | `/supplier/invoices` | Factures du fournisseur |
| GET | `/supplier/invoices/:id/pdf` | Télécharger facture PDF |
| GET | `/supplier/stats` | Statistiques & scorecard |
| GET | `/supplier/deliveries` | Historique livraisons |
| GET | `/supplier/notifications` | Notifications |
| GET | `/supplier/profile` | Profil fournisseur |
| PUT | `/supplier/profile` | Modifier profil |

---

## 8. Database Models & Relations

```
Warehouse (Entrepôt abonné)
├── Suppliers (fournisseurs référencés)
│     ├── Products (produits du fournisseur)
│     ├── SupplierContracts (contrats / tarifs négociés)
│     └── VendorScorecard (notation performance)
│
├── PurchaseOrders (PO émises vers fournisseurs)
│     └── PurchaseOrderItems (lignes avec supplier_id)
│
├── GoodsReceivedNotes (GRN à réception)
│     └── GRNItems (avec lot, qualité)
│
├── Invoices (factures fournisseur)
│     └── InvoiceItems
│
├── QualityClaims (réclamations qualité)
│
└── Staff (utilisateurs internes)
```

### Filtrage par supplier_id

```sql
-- Produits : uniquement les siens
SELECT * FROM products WHERE supplier_id = :userId;

-- Commandes : uniquement ses items
SELECT po.*, poi.*
FROM purchase_orders po
JOIN purchase_order_items poi ON poi.po_id = po.id
WHERE poi.supplier_id = :userId;

-- Factures : uniquement les siennes
SELECT * FROM invoices WHERE supplier_id = :userId;
```

---

## 9. Sécurité

> Source : jawda-platform-complete.md § 11

| Règle | Description |
|-------|-------------|
| **Isolation stricte** | `supplier_id = req.user.id` sur TOUTES les requêtes |
| **Pas de données croisées** | Jamais d'accès aux données d'autres fournisseurs |
| **Pas de prix de vente** | Le fournisseur ne connaît pas la marge de l'entrepôt |
| **Pas de stock global** | Voit uniquement le stock de SES produits chez le client |
| **Validation produits** | Ajout/modification soumis à validation WhMgr |
| **OTP pour externes** | Authentification par code email/SMS |
| **Rate limiting** | Protection API |
| **Session timeout** | 30 min inactivité |
| **Audit trail** | Toutes actions loguées |

---

## 10. UX Design

### Portail externe — Responsive web

- **Desktop-friendly** : Tableaux riches, graphiques détaillés
- **Mobile-responsive** : Cards empilées sur mobile
- **Sidebar navigation** : Dashboard, Produits, Commandes, Factures, Stats, Profil
- **Actions contextuelles** : Boutons confirmer/refuser sur chaque PO
- **Badges de statut** : Couleurs cohérentes (vert/jaune/rouge)
- **Empty states** : Illustrations quand pas de données

### Navigation Sidebar (dans le WMS `/my/*`)

```
Mon Espace Fournisseur
├── 📊 Dashboard
├── 📦 Mes Produits
├── 📋 Mes Commandes
├── 💳 Factures
├── 📈 Statistiques
└── 👤 Profil
```

### Navigation Standalone (`/supplier/*`)

```
┌──────────────────────────────────────────┐
│  🏢 Agro Sahel Distribution              │
│                                          │
│  📊 Dashboard                            │
│  📦 Mes Produits                         │
│  📋 Mes Commandes                        │
│  🚚 Mes Livraisons                       │
│  💳 Factures                             │
│  📈 Performance                          │
│  🔔 Notifications                        │
│  ⚙️ Paramètres                           │
└──────────────────────────────────────────┘
```

---

## 11. Notifications Push / Email

| Événement | Canal | Message |
|-----------|-------|---------|
| Nouvelle PO reçue | Push + Email | "Nouvelle commande #PO-xxx de Entrepôt Oran" |
| PO modifiée | Push | "Commande #PO-xxx mise à jour" |
| PO annulée | Push + Email | "Commande #PO-xxx annulée par le client" |
| GRN créé | Push | "Réception confirmée pour #PO-xxx" |
| Paiement reçu | Push + Email | "Paiement de 250,000 DZD reçu" |
| Réclamation qualité | Push + Email | "Réclamation #QC-xxx ouverte — action requise" |
| Scorecard mis à jour | Push | "Score fournisseur mis à jour : 89/100" |
| Rappel facture impayée | Email | "Facture #INV-xxx en retard de 15 jours" |

---

## 12. Utilisateurs Mock

| ID | Nom | Type | Entreprise | Entrepôt | PIN | Auth |
|----|-----|------|------------|----------|-----|------|
| U016 | Karim Benmoussa | Externe | Agro Sahel | — | 1616 | PIN (WMS `/my/*`) |
| U020 | Karim Benmoussa | Abonné (CEO) | Agro Sahel | Tous (Sahel) | 2020 | PIN |
| U021 | Mourad Sahli | Abonné (WhMgr) | Agro Sahel | wh-sahel-supplier | 2121 | PIN |
| U022 | Yacine Ferhat | Abonné (Op) | Agro Sahel | wh-sahel-supplier | 2222 | PIN |
| U023 | Bilal Kaddour | Abonné (Driver) | Agro Sahel | wh-sahel-supplier | 2323 | PIN |

> U016 = fournisseur externe (portail léger `/my/*`).
> U020-U023 = équipe Agro Sahel abonnée (WMS complet `/`).

---

## 13. Frontend Structure

```
src/
├── pages/supplier/               # Pages /my/* (dans le WMS)
│   ├── SupplierDashboardPage.tsx
│   ├── SupplierProductsPage.tsx
│   ├── SupplierOrdersPage.tsx
│   ├── SupplierInvoicesPage.tsx
│   ├── SupplierStatsPage.tsx
│   └── SupplierProfilePage.tsx
│
├── supplier/                     # Portail standalone /supplier/*
│   ├── components/
│   │   ├── SupplierAuthGuard.tsx
│   │   └── SupplierLayout.tsx
│   ├── data/
│   │   └── mockSupplierData.ts
│   ├── screens/
│   │   ├── SupplierDashboardScreen.tsx
│   │   ├── SupplierProductsScreen.tsx
│   │   ├── SupplierOrdersScreen.tsx
│   │   ├── SupplierOrderDetailScreen.tsx
│   │   ├── SupplierDeliveriesScreen.tsx
│   │   ├── SupplierInvoicesScreen.tsx
│   │   ├── SupplierPerformanceScreen.tsx
│   │   ├── SupplierNotificationsScreen.tsx
│   │   ├── SupplierSettingsScreen.tsx
│   │   ├── SupplierLoginScreen.tsx
│   │   └── SupplierMoreScreen.tsx
│   └── types/
│       └── supplier.ts
│
└── app/routes/
    └── supplierRoutes.tsx        # Routes /supplier/*
```

---

## 14. Tech Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + TypeScript + Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| State | React Context + React Query |
| Routing | React Router v6 (lazy loading) |
| Auth (externe) | Email + OTP |
| Auth (abonné) | PIN + WebAuthn |
| PDF | jsPDF + jspdf-autotable |
| i18n | i18next (fr, en, ar) |
