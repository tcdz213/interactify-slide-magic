# 📋 Jawda — Plan de Développement & Suivi d'Avancement

## État Actuel des Modules

### ✅ Phases Complètes (Core Opérationnel)

| #   | Module            | Pages                            | Status                                        |
| --- | ----------------- | -------------------------------- | --------------------------------------------- |
| 1   | Foundation & Auth | `/login`                         | ✅ 6 rôles, mock, i18n AR/FR/EN, sidebar RBAC |
| 2   | Dashboard         | `/dashboard`                     | ✅ Admin KPIs + Opérationnel                  |
| 3   | Products CRUD     | `/products`                      | ✅ CRUD, filtres, drawer, catégories, unités  |
| 4   | Orders            | `/orders`, `/orders/:id`         | ✅ Liste, détail, transitions, timeline       |
| 4   | Invoices          | `/invoices`, `/invoices/:id`     | ✅ Liste, détail, print, fiscal               |
| 4   | Deliveries        | `/deliveries`, `/deliveries/:id` | ✅ Liste, détail, POD, retours                |
| 5   | Inventory         | `/inventory`                     | ✅ 4 tabs, KPIs, mouvements, ajustements      |
| 5   | Suppliers         | `/suppliers`, `/suppliers/:id`   | ✅ 4 tabs, PO, réceptions, rapprochement      |
| 5   | Accounting        | `/accounting`                    | ✅ Journal, Balance, P&L, PCN                 |
| 6   | Tenants           | `/tenants`, `/tenants/:id`       | ✅ Liste, détail, CSV export, create          |
| 6   | Accounts          | `/accounts`, `/accounts/:id`     | ✅ Liste, détail, rôles                       |
| 6   | Billing           | `/billing`                       | ✅ MRR/ARR, graphiques, factures plateforme   |
| 6   | Audit Logs        | `/audit`                         | ✅ Journal, filtres type/sévérité             |
| 6   | Notifications     | `/notifications`                 | ✅ Centre, read/unread, priorité              |
| 6   | Analytics         | `/analytics`                     | ✅ KPIs, growth, churn, géo                   |
| 6   | Settings          | `/settings`                      | ✅ Config plateforme complète                 |
| 6   | Users             | `/users`                         | ✅ Gestion utilisateurs                       |

| Plans Management | `/plans` | ✅ | Cards, EditDrawer, FeatureComparison, i18n |

---

## 🚀 Phases Restantes

### Phase A — Compléter Plans Management ✅

**Priorité: HAUTE** | Complété

- [x] Enrichir PlansManagement.tsx avec cards complètes par plan
- [x] Implémenter EditPlanDrawer fonctionnel
- [x] Ajouter FeatureComparison table
- [x] i18n AR/FR/EN pour tous les labels

### Phase B — Module Clients (Customer Management) ✅

**Priorité: HAUTE** | Complété

- [x] Modèle Client (name, address, NIF/RC, contact, credit limit, tier)
- [x] Page `/clients` avec CRUD, recherche, filtres
- [x] Page `/clients/:id` avec historique commandes/factures/solde
- [x] Tiers client (BRONZE/SILVER/GOLD/VIP) pour tarification
- [x] Lier commandes et factures aux clients
- [x] Service + mock data (17 clients)

### Phase C — Module Paiements ✅

**Priorité: HAUTE** | Complété

- [x] Modèle Payment (amount, date, method, reference, invoiceId)
- [x] Page `/payments` avec liste et enregistrement
- [x] Paiements partiels et rapprochement factures
- [x] Méthodes: espèces, virement, chèque, CIB/DAHABIA
- [x] Tableau de bord impayés et relances
- [x] Intégration dans facture detail (historique paiements)

### Phase D — Module Véhicules & Flotte ✅

**Priorité: MOYENNE** | Complété

- [x] Modèle Vehicle (plate, brand, model, capacity, fuel, insurance)
- [x] Page `/vehicles` avec CRUD, filtres statut/type, KPIs
- [x] Page `/vehicles/:id` avec info, documents, assignation, historique livraisons
- [x] Disponibilité et assignation aux livraisons
- [x] Alertes expiration assurance/documents (expired, expiring soon)
- [x] Lier aux livraisons existantes via vehiclePlate
- [x] i18n AR/FR/EN complet
- [x] VehicleDrawer pour création et édition

### Phase E — Gestion des Prix Avancée ✅

**Priorité: HAUTE** | Complété

## 💰 Core Pricing Features

- [x] Prix par tier client (BRONZE / SILVER / GOLD / VIP)
- [ ] Prix fournisseur par entrepôt
- [x] Historique des prix (date, utilisateur, modification)
- [x] Promotions et remises (montant fixe ou pourcentage)
- [x] Intégration automatique dans la création de commande ✅ NEW

---

## ⚙️ Advanced Pricing Logic

- [x] Prix dynamiques (basés sur quantité / volume) — minQty dans TierPrice
- [x] Règles de pricing (ex: VIP + quantité > 100 → remise auto) ✅ NEW — PricingRulesTab
- [ ] Prix par canal (web, magasin, B2B)
- [ ] Prix par région / wilaya
- [ ] Gestion multi-devise (DZD, EUR, USD…)

---

## 🧾 Taxes & Financials

- [x] Gestion TVA configurable (% par produit ou catégorie)
- [x] Calcul automatique HT / TTC
- [ ] Règles fiscales par région
- [x] Affichage clair dans commandes et factures ✅ NEW — tier pricing visible dans CreateOrderDrawer

---

## 🏷️ Discounts & Promotions (Advanced)

- [x] Système de codes promo (coupons)
- [x] Promotions avec dates (début / fin)
- [x] Remises par produit ou catégorie
- [x] Remises conditionnelles (ex: panier > X) — minOrderAmount
- [x] Gestion du cumul des promotions (stackable ou non)

---

## 📦 Product Pricing Structure

- [x] Prix multiples par produit (achat, vente, tier)
- [x] Calcul automatique des marges
- [x] Prix minimum (éviter vente à perte) ✅ NEW — PricingAlertsTab détecte vente à perte
- [ ] Gestion des bundles (packs produits)

---

## 🚚 Logistics & Extra Costs

- [ ] Intégration des frais de livraison
- [ ] Prix par entrepôt (coût logistique)
- [ ] Frais supplémentaires (emballage, manutention)
- [ ] Impact du stock sur le prix (optionnel)

---

## 📊 Monitoring & Control

- [x] Dashboard de suivi des prix et marges — KPIs + 6 tabs
- [x] Alertes (marge faible, prix incohérent) ✅ NEW — PricingAlertsTab
- [x] Comparaison prix achat vs prix vente
- [x] Logs détaillés des modifications — PriceHistoryTab

---

## 🔐 Permissions & Roles

- [x] Gestion des permissions de modification des prix — RBAC sidebar
- [ ] Validation requise pour certains changements
- [ ] Historique avec possibilité de rollback

---

## 🧠 Smart Features (Optionnel)

- [ ] Suggestion automatique de prix (basée sur marge cible)
- [x] Simulation de prix avant application — PriceSimulator
- [ ] Pricing intelligent (future AI-ready)
- [ ] Import / export des prix (Excel, CSV)


---

### Phase F — Rapports & Exports ⬜

**Priorité: MOYENNE** | Effort: 2 sessions | Réf: GLOBAL-SUGGESTIONS.md §5

- [ ] Rapports ventes (jour/semaine/mois) avec graphiques
- [ ] Rapport valorisation stock
- [ ] Rapport âge créances clients
- [ ] Export PDF factures avec en-tête entreprise
- [ ] Export CSV/Excel pour toutes les listes
- [ ] Page `/reports` centralisée

### Phase G — Améliorations UX Globales ⬜

**Priorité: MOYENNE** | Effort: 2 sessions

- [ ] Dialogues de confirmation pour suppressions
- [ ] Opérations en masse (sélection multiple)
- [ ] Raccourcis clavier
- [ ] Badge notifications non lues dans TopBar
- [ ] Pagination pour toutes les tables
- [ ] Responsive mobile optimisé

### Phase H — Conformité Fiscale Algérienne ⬜

**Priorité: HAUTE** | Effort: 1 session

- [ ] Déclaration G50 TVA
- [ ] Timbre fiscal pour factures > 100K DZD
- [ ] Validation registre commerce
- [ ] Facturation électronique

### Phase I — Architecture & Qualité ⬜

**Priorité: MOYENNE** | Effort: 2 sessions

- [ ] Validation Zod sur tous les formulaires
- [ ] Gestion erreurs API avec retry
- [ ] React Query pour cache
- [ ] Tests intégration workflows
- [ ] Tests E2E principaux flux

### Phase J — Intégrations Locales Algérie ⬜

**Priorité: BASSE** | Effort: 1 session

- [ ] Zones de livraison par wilaya + tarifs
- [ ] Préparation intégration Algérie Poste
- [ ] Préparation intégration CIB/DAHABIA
- [ ] Préparation SMS providers

---

## 📊 Résumé

| Phase | Description            | Status  | Priorité |
| ----- | ---------------------- | ------- | -------- |
| 1-6   | Core Opérationnel      | ✅ FAIT | —        |
| A     | Plans Management       | ✅ FAIT | HAUTE    |
| B     | Module Clients         | ✅ FAIT | HAUTE    |
| C     | Module Paiements       | ✅ FAIT | HAUTE    |
| D     | Module Véhicules       | ✅ FAIT | MOYENNE  |
| E     | Prix Avancés           | ✅ FAIT | HAUTE    |
| F     | Rapports & Exports     | ⬜ TODO | MOYENNE  |
| G     | Améliorations UX       | ⬜ TODO | MOYENNE  |
| H     | Conformité Fiscale     | ⬜ TODO | HAUTE    |
| I     | Architecture & Qualité | ⬜ TODO | MOYENNE  |
| J     | Intégrations Locales   | ⬜ TODO | BASSE    |

**Progression globale: 8/16 phases (50%) — Core + Plans + Véhicules ✅, 8 phases restantes**
