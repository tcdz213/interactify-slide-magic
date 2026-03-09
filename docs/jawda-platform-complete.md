# Jawda Platform — Documentation Technique Complète

> **Version** : 2.0 — Mars 2026
> **Plateforme** : Jawda SaaS — ERP/WMS Multi-Tenant Multi-Secteur
> **Marque** : Bennet Eddar | بِنّة الدار

---

## Table des matières

1. [Architecture Globale](#1-architecture-globale)
2. [Modèle SaaS & Multi-Tenant](#2-modèle-saas--multi-tenant)
3. [Hiérarchie des Rôles](#3-hiérarchie-des-rôles)
4. [Fiches Détaillées par Rôle](#4-fiches-détaillées-par-rôle)
5. [Portails & Applications](#5-portails--applications)
6. [Matrice d'Accès aux Modules](#6-matrice-daccès-aux-modules)
7. [Cycles de Documents (Flux Métier)](#7-cycles-de-documents-flux-métier)
8. [Scénarios Complets par Rôle](#8-scénarios-complets-par-rôle)
9. [Approbation & Escalade](#9-approbation--escalade)
10. [Modèle Économique](#10-modèle-économique)
11. [Sécurité & Gouvernance](#11-sécurité--gouvernance)
12. [Stack Technique](#12-stack-technique)

---

## 1. Architecture Globale

```
JAWDA PLATFORM (SaaS)
Fondateur : PlatformOwner
|
|-- [Portail Owner /owner/*] -- Gestion abonnements, facturation, monitoring
|
|-- Abonne A : "Jawda Construction" (Entrepot Alger)
|   |-- CEO, FinDir, OpsDir, RegMgr, WhMgr, QC, Supv, Op, Driver, Compta, BI, Commercial
|   |-- Portail : / (Admin WMS Dashboard)
|   |-- App Mobile Commercial : /mobile/*
|   |-- App Mobile Chauffeur : /delivery/*
|   |-- Clients de A : /portal/* (Portail Client)
|
|-- Abonne B : "Jawda Agroalimentaire" (Entrepot Oran)
|   |-- (memes roles internes)
|
|-- Abonne C : "Jawda Technologie" (Entrepot Constantine)
|   |-- (memes roles internes)
|
|-- Abonne D : "Agro Sahel Distribution" (Fournisseur-Entrepot)
|   |-- CEO, WhMgr, Operator, Driver
|   |-- Utilise le MEME WMS / que A, B, C
|   |-- Recoit les PO de A et B comme SalesOrders
|
|-- Fournisseur externe (non-abonne)
|   |-- Portail leger : /supplier/* (lecture PO, factures)
|
|-- Clients finaux des entrepots
    |-- Portail : /portal/* (commandes, factures, retours)
```

### Principe fondamental
> Chaque entreprise abonnee est **isolee** (multi-tenant strict). Un utilisateur ne voit **jamais** les donnees d'une autre entreprise.

---

## 2. Modèle SaaS & Multi-Tenant

### 2.1 Types d'abonnés

| Type | Description | Portail | Paie un abonnement |
|------|-------------|---------|:---:|
| **Entrepot/Entreprise** | Utilise le WMS/ERP complet | `/` (Admin Dashboard) | Oui |
| **Fournisseur abonne** | = Entrepot qui vend aux autres | `/` (meme WMS) | Oui |
| **Fournisseur externe** | Referencé mais non-abonné | `/supplier/*` (leger) | Non |
| **Client** | Client final d'un entrepot | `/portal/*` | Non |

### 2.2 Isolation des données

```
Entreprise A                    Entreprise B
+------------------+            +------------------+
| warehouses: [A1] |            | warehouses: [B1] |
| products: [...]  |            | products: [...]  |
| orders: [...]    |            | orders: [...]    |
| users: [...]     |            | users: [...]     |
+------------------+            +------------------+
       |                               |
       |  JAMAIS de croisement         |
       |  sauf PO inter-entreprises    |
       +---------- B2B PO -----------+
```

---

## 3. Hiérarchie des Rôles

### 3.1 Pyramide des rôles

```
=== NIVEAU PLATEFORME ===
Niveau 0 : PlatformOwner (Fondateur Jawda)

=== NIVEAU ENTREPRISE (chaque abonne) ===
Niveau 1 : CEO (DG)
            |-- FinanceDirector (DAF)
            |-- OpsDirector (Dir. Operations)
Niveau 2 : RegionalManager (Resp. Regional)
Niveau 3 : WarehouseManager | QCOfficer | Accountant | BIAnalyst
Niveau 4 : Supervisor | Commercial
Niveau 5 : Operator | Driver

=== NIVEAU EXTERNE ===
Supplier : Fournisseur externe (portail leger)
Client   : Client final (portail commandes)
```

### 3.2 Tableau récapitulatif

| Rôle | Niveau | Portail | Scope | Approuve | Crée documents |
|------|:---:|---------|-------|:---:|:---:|
| PlatformOwner | 0 | `/owner/*` | Toute la plateforme | Abonnements | Abonnements |
| CEO | 1 | `/` | Son entreprise (tous entrepots) | Tout (variance >5%) | Tout |
| FinanceDirector | 1 | `/` | Son entreprise (lecture) | Factures, paiements (var. <=5%) | Factures, paiements |
| OpsDirector | 1 | `/` | Son entreprise (tous entrepots) | GRN, PO, ajustements (var. <=5%) | Commandes vente |
| RegionalManager | 2 | `/` | Entrepots assignes (multi-sites) | GRN, ajustements (var. <=2%) | Non |
| WarehouseManager | 3 | `/` | 1 entrepot assigne | GRN, ajustements (var. <=2%) | GRN, PO, ajustements |
| QCOfficer | 3 | `/` | Entrepots assignes | GRN (qualite) | Non |
| Accountant | 3 | `/` | Son entreprise (lecture) | Factures, paiements | Factures, paiements |
| BIAnalyst | 3 | `/` | Son entreprise (lecture seule) | Non | Non |
| Supervisor | 4 | `/` | 1 entrepot | Non | GRN, ajustements, commandes |
| Commercial | 4 | `/mobile/*` | Sa zone + clients assignes | Non | Commandes vente |
| Operator | 5 | `/` | 1 entrepot | Non | GRN, ajustements |
| Driver | 5 | `/delivery/*` | Tournee du jour | Non | Preuves livraison |
| Supplier (externe) | — | `/supplier/*` | Ses propres PO/factures | Non | Non |
| Client | — | `/portal/*` | Ses propres commandes | Non | Commandes |

---

## 4. Fiches Détaillées par Rôle

### 4.1 PlatformOwner — Fondateur Jawda

**Ce qu'il fait :**
- Gère les abonnements de TOUTES les entreprises
- Valide les inscriptions (onboarding)
- Facture les abonnés (mensuel/annuel)
- Surveille la santé de la plateforme (uptime, erreurs, performance)
- Fournit le support technique
- Configure les plans d'abonnement et limites

**Ce qu'il NE fait PAS :**
- Ne gère pas les operations quotidiennes des entrepots
- Ne modifie pas les stocks, commandes, ou factures des abonnés
- Ne voit les données metier qu'en lecture (support/debug)

**KPI Dashboard :**
| KPI | Exemple |
|-----|---------|
| MRR (Monthly Recurring Revenue) | 2,500,000 DZD |
| Abonnés actifs | 12 entreprises |
| Taux de churn | 2.1% |
| ARPU | 208,000 DZD |
| Nouveaux ce mois | 3 |
| Tickets support ouverts | 7 |

---

### 4.2 CEO — Directeur Général

**Ce qu'il fait :**
- Supervise TOUTE son entreprise
- Approuve les documents critiques (variance >5% = enquete)
- Gère les utilisateurs de son organisation
- Voit toutes les données financieres (marges, couts, P&L)
- Decision finale sur les write-offs et depreciations

**Ce qu'il NE fait PAS :**
- Ne voit pas les données d'autres entreprises
- Ne gère pas son abonnement Jawda (contacte le PlatformOwner)
- Ne modifie pas la configuration plateforme

---

### 4.3 FinanceDirector — DAF

**Ce qu'il fait :**
- Approuve les factures et paiements
- Valide les ajustements de stock ayant un impact financier
- Suit les creances clients et dettes fournisseurs
- Produit les rapports financiers (bilan, tresorerie)

**Seuil d'approbation :** variance <=5%

---

### 4.4 OpsDirector — Directeur des Operations

**Ce qu'il fait :**
- Supervise tous les entrepots de l'entreprise
- Approuve GRN, PO, transferts, cycle counts
- Evaluer la performance des fournisseurs
- Coordonne les operations multi-sites

**Seuil d'approbation :** variance <=5%

---

### 4.5 RegionalManager — Responsable Regional

**Ce qu'il fait :**
- Gère plusieurs entrepots dans sa region
- Approuve les documents pour ses entrepots
- Coordonne les commerciaux de sa zone
- Suit les KPI de sa region

**Seuil d'approbation :** variance <=2%

---

### 4.6 WarehouseManager — Responsable Entrepot

**Ce qu'il fait :**
- Gere un entrepot (stock, receptions, expeditions)
- Approuve GRN, ajustements, transferts
- Cree les PO vers les fournisseurs
- Coordonne les supervisors et operators

**Seuil d'approbation :** variance <=2%
**Ne voit PAS :** données financières (marges, couts)

---

### 4.7 QCOfficer — Responsable Qualite

**Ce qu'il fait :**
- Inspecte les receptions (GRN)
- Valide la conformite qualite (HACCP, normes)
- Emet des reclamations vers les fournisseurs
- Bloque les lots non conformes

---

### 4.8 Supervisor — Chef d'Equipe

**Ce qu'il fait :**
- Dirige les operators au quotidien
- Cree des GRN, ajustements, transferts
- Assigne les taches de picking/packing
- NE peut PAS approuver

---

### 4.9 Operator — Magasinier

**Ce qu'il fait :**
- Execute les receptions physiques (GRN)
- Fait le picking et packing
- Realise les comptages cycliques
- Cree des ajustements de stock

---

### 4.10 Commercial — Vendeur Terrain

**Ce qu'il fait (sur mobile /mobile/*) :**
- Visite les clients sur le terrain (GPS)
- Cree des commandes de vente
- Consulte le catalogue produits (prix vente)
- Voit le stock disponible (quantites, pas les couts)
- Enregistre les visites avec preuve GPS

**Ne voit PAS :** prix d'achat, marges, données WMS internes

---

### 4.11 Driver — Chauffeur/Livreur

**Ce qu'il fait (sur mobile /delivery/*) :**
- Suit sa tournee de livraison du jour
- Confirme les livraisons (photo + signature)
- Collecte les paiements cash
- Signale les incidents (refus, avarie, absence)
- Inspection vehicule pre-depart

**Ne voit PAS :** prix d'achat, marges, données WMS

---

### 4.12 Supplier (externe) — Fournisseur non-abonné

**Ce qu'il fait (sur /supplier/* ou /my/*) :**
- Consulte les PO recues
- Confirme ou refuse les commandes
- Suit ses livraisons
- Consulte ses factures et paiements
- Voit son scorecard performance

---

### 4.13 Client — Client final

**Ce qu'il fait (sur /portal/*) :**
- Passe des commandes depuis le catalogue
- Suit ses commandes (statut, ETA)
- Consulte ses factures et solde credit
- Demande des retours produits
- Telecharge ses factures PDF

---

## 5. Portails & Applications

| Portail | Route | Cible | Type |
|---------|-------|-------|------|
| **WMS Admin Dashboard** | `/` | Roles internes (CEO a Operator) | Desktop web |
| **Owner Dashboard** | `/owner/*` | PlatformOwner | Desktop web |
| **App Mobile Commercial** | `/mobile/*` | Commerciaux terrain | Mobile web |
| **App Mobile Chauffeur** | `/delivery/*` | Chauffeurs/Livreurs | Mobile web |
| **Portail Client** | `/portal/*` | Clients finaux | Mobile-first web |
| **Portail Fournisseur** | `/supplier/*` ou `/my/*` | Fournisseurs externes | Responsive web |

### Architecture des portails

```
Jawda Platform
|
+-- / (WMS Admin)
|   +-- /wms/* (Stock, GRN, PO, Picking...)
|   +-- /sales/* (Commandes, Clients)
|   +-- /accounting/* (Factures, Paiements)
|   +-- /bi/* (Rapports, Analytics)
|   +-- /settings/* (Admin)
|   +-- /my/* (Espace Fournisseur dans le WMS)
|
+-- /owner/* (Dashboard PlatformOwner)
|   +-- /owner/ (KPI plateforme)
|   +-- /owner/subscriptions (Abonnements)
|   +-- /owner/billing (Facturation)
|   +-- /owner/monitoring (Sante systeme)
|
+-- /mobile/* (App Commercial)
|   +-- /mobile/ (Dashboard vendeur)
|   +-- /mobile/customers (Mes clients)
|   +-- /mobile/orders (Historique commandes)
|   +-- /mobile/new-order (Nouvelle commande)
|   +-- /mobile/route (Tournee du jour)
|
+-- /delivery/* (App Chauffeur)
|   +-- /delivery/trip (Tournee)
|   +-- /delivery/stops (Liste stops)
|   +-- /delivery/confirm/:id (Confirmation)
|   +-- /delivery/cash (Collecte)
|   +-- /delivery/incidents (Incidents)
|   +-- /delivery/end-of-day (Cloture)
|
+-- /portal/* (Portail Client)
|   +-- /portal/ (Dashboard client)
|   +-- /portal/place-order (Commander)
|   +-- /portal/orders (Mes commandes)
|   +-- /portal/invoices (Factures)
|   +-- /portal/returns (Retours)
|
+-- /supplier/* (Portail Fournisseur leger)
    +-- /supplier/ (Dashboard)
    +-- /supplier/orders (Commandes recues)
    +-- /supplier/deliveries (Livraisons)
    +-- /supplier/invoices (Factures)
```

---

## 6. Matrice d'Accès aux Modules

| Module | Owner | CEO | FinDir | OpsDir | RegMgr | WhMgr | QC | Supv | Op | Driver | Commercial | Compta | BI | Supplier | Client |
|--------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Owner Dashboard | W | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Admin Dashboard | R | W | W | W | W | W | — | — | — | — | — | W | W | — | — |
| WMS Stock | R | W | R | W | W | W | R | W | W | — | — | R | R | — | — |
| Achats (PO) | R | W | R | W | R | W | — | — | — | — | — | R | R | R | — |
| Ventes | R | W | R | W | W | W | — | W | — | R | W | R | R | — | W |
| Finance | R | W | W | R | — | — | — | — | — | — | — | W | R | R | R |
| Livraison | R | W | — | W | W | W | — | W | — | W | — | — | R | — | R |
| Qualite | R | W | — | W | — | W | W | — | — | — | — | — | R | R | — |
| Rapports BI | R | W | W | W | R | — | — | — | — | — | — | R | W | — | — |
| Parametres | W | W | — | — | — | — | — | — | — | — | — | — | — | — | — |

**Legende :** W = Ecriture | R = Lecture seule | — = Pas d'acces

---

## 7. Cycles de Documents (Flux Metier)

### 7.1 Cycle d'Abonnement

```
Etape 1 : Entreprise demande inscription sur Jawda
Etape 2 : PlatformOwner valide et cree l'abonnement
Etape 3 : PlatformOwner facture mensuellement
Etape 4 : Abonne paie
Etape 5 : Si impaye > 30j, suspension automatique
Etape 6 : Si paiement recu, reactivation
```

### 7.2 Cycle d'Achat Complet

```
Etape 1 : WarehouseManager cree un PurchaseOrder (PO)
Etape 2 : PO envoyee au Fournisseur
Etape 3 : Fournisseur confirme la PO
Etape 4 : Fournisseur livre la marchandise
Etape 5 : Operator cree le GRN (Bon de Reception)
Etape 6 : QCOfficer inspecte et valide la qualite
Etape 7 : WarehouseManager approuve le GRN
Etape 8 : 3-Way Match : PO vs GRN vs Facture
           Si variance <= 0.5% : auto-approuve
           Si variance <= 2% : WarehouseManager approuve
           Si variance <= 5% : FinanceDirector approuve
           Si variance > 5% : CEO + enquete
Etape 9 : Comptable cree la facture fournisseur
Etape 10 : FinanceDirector approuve le paiement
Etape 11 : Paiement execute
```

### 7.3 Cycle de Vente Complet

```
Etape 1 : Client passe commande via Portail OU Commercial sur terrain
Etape 2 : Verification credit client automatique
           Si credit OK : SalesOrder cree (draft)
           Si credit depasse : blocage + message
Etape 3 : WarehouseManager confirme la commande
Etape 4 : Systeme cree les Waves (regroupement)
Etape 5 : Operator fait le Picking (FIFO/FEFO)
Etape 6 : Operator fait le Packing (colisage)
Etape 7 : WarehouseManager approuve l'expedition
Etape 8 : Driver charge le camion
Etape 9 : Driver livre le client
           Photo des colis + Signature client
Etape 10 : Driver collecte le paiement (cash/cheque)
Etape 11 : Comptable emet la facture client
Etape 12 : Client consulte la facture sur /portal/*
```

### 7.4 Cycle de Retour

```
Etape 1 : Client demande un retour via /portal/returns
Etape 2 : WarehouseManager approuve la demande
Etape 3 : Driver collecte les produits retournes
Etape 4 : QCOfficer inspecte la qualite du retour
           Si conforme : retour au stock
           Si defectueux : quarantaine ou destruction
Etape 5 : Comptable emet un avoir / remboursement
Etape 6 : Client voit l'avoir sur son portail
```

### 7.5 Cycle Inter-Entreprises (B2B)

```
Etape 1 : Entrepot A cree une PO vers Fournisseur D (Agro Sahel)
Etape 2 : Chez Fournisseur D, la PO apparait comme SalesOrder
Etape 3 : WhManager de D confirme et prepare la commande
Etape 4 : Driver de D livre a Entrepot A
Etape 5 : Operator de A cree le GRN
Etape 6 : Comptable de A paie Fournisseur D
```

### 7.6 Cycle de Livraison (Journee Chauffeur)

```
Matin :
  1. Driver se connecte (PIN + biometrie)
  2. Inspection vehicule (checklist + photo)
  3. Verification chargement (scan colis)
  4. Demarrage tournee (GPS active)

Tournee :
  5. Arrivee chez Client 1 (GPS detecte)
  6. Livraison + preuves (photo + signature)
  7. Collecte paiement cash
  8. Depart vers Client 2
  ... (repeter pour chaque stop)

Si incident :
  9. Signalement (refus, avarie, absence)
  10. Photo + description
  11. Notification au WarehouseManager

Soir :
  12. Retour entrepot
  13. Remise de caisse (cash + cheques)
  14. Retour marchandise non livree
  15. Cloture journee (resume PDF)
```

---

## 8. Scénarios Complets par Rôle

### Scenario 1 : PlatformOwner — Onboarding d'un nouvel abonné

```
Contexte : Une boulangerie industrielle "Khobz El Dar" veut s'abonner.

1. Yacine (PlatformOwner) recoit la demande d'inscription
2. Il verifie les documents (registre commerce, NIF)
3. Il cree l'abonnement "Plan Standard" (1 entrepot, 10 users)
4. Il configure le premier entrepot "Boulangerie Khobz - Blida"
5. Il cree le compte CEO pour le DG de Khobz El Dar
6. Le CEO recoit ses identifiants et configure son equipe
7. Yacine facture 50,000 DZD/mois
8. Dashboard Owner affiche : +1 abonne, MRR +50,000 DZD
```

### Scenario 2 : CEO — Gestion d'une alerte de stock critique

```
Contexte : Ahmed (CEO Jawda) voit une alerte "Stock ciment < seuil minimum"

1. Ahmed ouvre le Dashboard (/)
2. Il voit l'alerte dans le AlertsFeed
3. Il clique et arrive sur /wms/stock-dashboard
4. Il voit que le ciment CEM-32 est a 5 tonnes (seuil = 20 tonnes)
5. Il demande a Karim (WhMgr Alger) de creer une PO urgente
6. Karim cree PO-2026-0099 vers le fournisseur "Cimenterie de Chlef"
7. Ahmed approuve la PO (montant > seuil WhMgr)
8. Fournisseur confirme, livraison dans 3 jours
```

### Scenario 3 : WarehouseManager — Reception avec ecart

```
Contexte : Karim (WhMgr Alger) recoit 980 sacs de ciment au lieu de 1000 commandes.

1. Operator Tarek cree le GRN-5002 : 980 sacs recus
2. Le systeme detecte un ecart de -2% vs la PO (1000 sacs)
3. QCOfficer Sara inspecte : qualite OK, juste un ecart de quantite
4. Ecart <=2% : Karim (WhMgr) peut approuver
5. Karim approuve le GRN avec note "20 sacs manquants - reclamation"
6. Le stock est mis a jour : +980 sacs
7. Comptable Nadia cree une facture pour 980 sacs (pas 1000)
8. Un log d'audit enregistre toute la chaine
```

### Scenario 4 : WarehouseManager — Reception avec ecart GRAVE

```
Contexte : Meme scenario mais 800 sacs au lieu de 1000 (-20% variance).

1. Operator Tarek cree le GRN : 800 sacs recus
2. Systeme detecte -20% variance → Tier "CEO + Investigation"
3. Karim (WhMgr) NE PEUT PAS approuver (>2%)
4. Anis (FinDir) NE PEUT PAS approuver (>5%)
5. Ahmed (CEO) recoit la notification d'escalade
6. Ahmed lance une enquete : transporteur a detourne 200 sacs ?
7. Apres investigation, Ahmed approuve avec note d'enquete
8. Reclamation formelle au fournisseur/transporteur
```

### Scenario 5 : Commercial — Tournee terrain

```
Contexte : Mehdi (Commercial zone Oran) fait sa tournee.

1. 8h00 : Mehdi ouvre /mobile/ - voit 8 clients a visiter
2. 8h30 : Il arrive chez "Epicerie Benali" (GPS detecte)
3. Il consulte l'encours : 45,000 DZD impaye
4. Le client commande : 50 bouteilles huile + 100 paquets pates
5. Credit check : 45,000 + 120,000 = 165,000 < limite 200,000 → OK
6. Commande SO-2026-0450 creee (draft)
7. Notification push au WhMgr Oran pour confirmation
8. 9h00 : Depart vers le client suivant
9. 12h30 : Client "Restaurant Sidi El Houari" → pas de commande, juste visite
10. Mehdi note : "Client interesse par les tomates pelees, rappeler lundi"
11. 17h00 : Fin de tournee - 6/8 clients visites, 4 commandes passees
12. Dashboard mobile montre : CA jour = 580,000 DZD, objectif mois = 72%
```

### Scenario 6 : Commercial — Credit client depasse

```
Contexte : Client "Grossiste Amine" a 480,000 DZD d'impaye, limite 500,000.

1. Mehdi visite le client
2. Client veut commander 150,000 DZD de marchandise
3. Credit check : 480,000 + 150,000 = 630,000 > 500,000 → BLOCAGE
4. Message : "Credit insuffisant. 20,000 DZD disponible."
5. Options :
   a) Passer une commande reduite a 20,000 DZD
   b) Collecter un paiement partiel d'abord
   c) Demander au FinDir d'augmenter la limite
6. Mehdi collecte 100,000 DZD cash
7. Nouvel encours : 380,000 DZD → peut commander 120,000 DZD
8. Commande reduite creee
```

### Scenario 7 : Driver — Livraison avec incident

```
Contexte : Bilal (Driver Oran) a 12 stops aujourd'hui.

1. 7h00 : Login + inspection vehicule (tout OK)
2. 7h30 : Depart, GPS tracking actif
3. 8h00 : Stop 1 - "Epicerie Benali" - Livraison complete
   → Photo + signature → Cash 120,000 DZD collecte
4. 8h45 : Stop 2 - "Restaurant Sidi" - Client ABSENT
   → Incident "Client absent" + photo porte fermee
   → Notification au WhMgr
5. 9h30 : Stop 3 - "Grossiste Amine" - Colis ENDOMMAGE
   → Incident "Colis endommage" + photo
   → 3 boites de conserves ecrasees
   → Livraison partielle (reste OK)
   → Cash 95,000 DZD (au lieu de 120,000)
6. ...
7. 16h00 : Retour entrepot
8. Cloture journee :
   Cash collecte : 1,245,000 DZD
   Cheques : 380,000 DZD
   Attendu : 1,750,000 DZD
   Ecart : -125,000 DZD (justifie : absent + endommage)
9. Remise caisse au superviseur + signature
```

### Scenario 8 : Client — Commande via portail

```
Contexte : "Epicerie Benali" commande depuis son telephone.

1. Client ouvre /portal/ → Dashboard affiche :
   - 2 commandes en cours
   - Solde credit : 155,000 DZD disponible
   - 1 facture en retard (rappel)
2. Client clique "Commander"
3. Parcourt le catalogue (prix grossiste affiche)
4. Ajoute : 20x Huile olive (64,000), 50x Pates (87,500)
5. Total : 151,500 DZD
6. Credit check : 155,000 disponible → OK
7. Valide la commande
8. Commande SO-2026-0451 creee (pending)
9. Notification push : "Commande soumise, en attente de confirmation"
10. 2h plus tard : "Votre commande a ete confirmee"
11. Lendemain : "Livraison prevue aujourd'hui entre 9h et 12h"
12. Livraison effectuee → "Livraison effectuee, merci !"
13. Facture disponible sur /portal/invoices
```

### Scenario 9 : Fournisseur externe — Gestion PO

```
Contexte : Agro Sahel (non-abonne, portail leger) recoit une PO.

1. WhMgr Oran cree PO-2026-0087 vers Agro Sahel
2. Karim (contact Agro Sahel) recoit notification email
3. Il se connecte sur /supplier/login (OTP)
4. Dashboard : 1 nouvelle commande a confirmer
5. Il ouvre la PO : 500 bouteilles huile + 200 sacs semoule
6. Il confirme → statut "Confirmed"
7. Il prepare la livraison et marque "Shipped"
8. Entrepot Oran recoit → GRN cree
9. Facture generee → Karim la voit sur /my/invoices
10. Paiement recu → statut "Paid"
```

### Scenario 10 : Fournisseur abonné — B2B Inter-Entrepot

```
Contexte : Agro Sahel (abonne WMS) recoit une PO de Entrepot Oran.

1. WhMgr Oran cree PO vers "V-SAHEL" (Agro Sahel)
2. Chez Agro Sahel, la PO apparait comme SalesOrder dans leur WMS (/)
3. Mourad (WhMgr Sahel) confirme la commande
4. Yacine (Operator Sahel) fait le picking
5. Bilal (Driver Sahel) charge et livre a Oran
6. Operator Oran cree le GRN
7. Comptable Sahel emet la facture
8. Comptable Oran paie
```

### Scenario 11 : QCOfficer — Rejet qualité

```
Contexte : Lot de lait UHT recoit par Entrepot Oran, temperature non conforme.

1. Operator cree GRN-5010 : 500 briques lait recues
2. Sara (QCOfficer) inspecte :
   - Temperature a la reception : 12C (max autorise : 8C)
   - Non conforme HACCP
3. Sara REJETTE le lot dans le GRN
4. Stock est mis en QUARANTAINE (/wms/stock-block)
5. Reclamation qualite creee (#QC-025)
6. Notification au fournisseur
7. WhMgr decide : retour fournisseur ou destruction
8. Si retour : Driver collecte et ramene au fournisseur
9. Avoir emis par le comptable
```

### Scenario 12 : Comptable — Rapprochement bancaire

```
Contexte : Nadia (Comptable) fait le rapprochement mensuel.

1. Ouvre /accounting/bank-reconciliation
2. Importe le releve bancaire du mois
3. Le systeme matche automatiquement :
   - 45 paiements clients → matches
   - 12 paiements fournisseurs → matches
   - 3 ecritures non matchees → a investiguer
4. Ecart 1 : Paiement 35,000 DZD non identifie → Client "Amine" avait paye en avance
5. Ecart 2 : Prelevement 15,000 DZD → Frais bancaires
6. Ecart 3 : Virement 200,000 DZD → Paiement partiel fournisseur
7. Nadia rapproche tout et valide
8. Rapport mensuel genere
```

### Scenario 13 : BIAnalyst — Rapport de performance

```
Contexte : Leila (BI Analyst) prepare le rapport trimestriel.

1. Ouvre /bi/profitability
2. Configure : Q1 2026, tous entrepots
3. Analyse :
   - CA total : 45,000,000 DZD
   - Marge brute : 22% (cible : 25%)
   - Top produit : Ciment CEM-32 (35% du CA)
   - Produit a marge negative : Tomates pelees (-3%)
4. Exporte en PDF pour le CEO
5. Cree un rapport personnalise dans /reports/builder
6. Programme un envoi automatique chaque lundi matin
```

---

## 9. Approbation & Escalade

### 9.1 Tiers d'approbation

| Tier | Variance | Approuveur | Action |
|------|----------|------------|--------|
| **Auto** | <=0.5% | Systeme | Approbation automatique |
| **Manager** | <=2% | WarehouseManager / RegionalManager | Approbation manuelle |
| **Finance** | <=5% | FinanceDirector + WarehouseManager | Double approbation |
| **CEO** | >5% | CEO + Investigation obligatoire | Enquete + approbation |

### 9.2 Regle anti-auto-approbation

> Un utilisateur ne peut JAMAIS approuver un document qu'il a cree lui-meme.

```
Karim (WhMgr) cree GRN-5002 → Karim NE PEUT PAS approuver GRN-5002
    → Si variance <=2% : un AUTRE WhMgr ou RegMgr approuve
    → Si aucun autre WhMgr : escalade a OpsDirector
```

### 9.3 Escalade automatique

```
Document cree → Variance calculee → Tier determine
  Si Tier = "auto" → Approuve automatiquement
  Si Tier = "manager" → Notification au WhMgr
    Si WhMgr = createur → Escalade au RegMgr
    Si pas de RegMgr → Escalade a OpsDir
  Si Tier = "finance" → Notification a FinDir + WhMgr
  Si Tier = "ceo" → Notification a CEO + alerte critique
```

---

## 10. Modèle Économique

### 10.1 Plans d'abonnement

| Plan | Cible | Entrepots | Users | Modules | Prix |
|------|-------|:---------:|:-----:|---------|------|
| **Trial** | Nouveaux | 1 | 3 | WMS basique | Gratuit (30j) |
| **Standard** | PME | 1 | 10 | WMS + Ventes | XX DZD/mois |
| **Pro** | Moyennes | 3 | 25 | + BI + Finance + API | XX DZD/mois |
| **Enterprise** | Grandes | Illimite | Illimite | Tout + Support dedie | Sur devis |

### 10.2 Revenus

```
MRR = Somme(Abonnements actifs)
    + Somme(Abonnements fournisseurs)
    + Frais onboarding (one-time)
    + Services premium (API, integrations)
```

---

## 11. Sécurité & Gouvernance

| Regle | Description |
|-------|-------------|
| **Multi-tenant strict** | Chaque entreprise isolee par `company_id` |
| **Scope entrepot** | Filtrage par `assignedWarehouseIds` |
| **Anti-auto-approbation** | Createur =/= approbateur |
| **Escalade automatique** | Variance > seuil → niveau superieur |
| **Audit trail** | Toute action loguee (user, timestamp, IP) |
| **Session timeout** | 30 min inactivite → logout |
| **PIN + Biometrie** | Auth a 2 facteurs pour roles internes |
| **OTP** | Auth par code pour fournisseurs/clients |
| **GPS obligatoire** | Drivers et Commerciaux |
| **Chiffrement offline** | IndexedDB chiffre sur mobile |
| **Suspension auto** | Abonnement impaye → suspension apres 30j |

### Permissions granulaires

```
Permission = Role + Warehouse Scope + Document Type + Governance Layer

Exemple :
  User: Karim (WhMgr)
  Warehouse: wh-alger-construction
  Can approve: GRN, adjustments, transfers (variance <=2%)
  Cannot approve: PO, invoices, payments
  Cannot see: financial data, other warehouses
```

---

## 12. Stack Technique

| Couche | Technologie |
|--------|-------------|
| **Frontend** | React 18 + TypeScript + Tailwind CSS + shadcn/ui |
| **State** | React Context + React Query |
| **Routing** | React Router v6 (lazy loading) |
| **Charts** | Recharts |
| **i18n** | i18next (FR, EN, AR) |
| **Animations** | Framer Motion |
| **Offline** | IndexedDB (idb) + Service Worker (vite-plugin-pwa) |
| **Maps** | Leaflet + OpenStreetMap |
| **Auth (mock)** | PIN-based + WebAuthn |
| **Auth (prod)** | Supabase Auth |
| **Backend (futur)** | Node.js + Express + TypeScript (DDD) |
| **DB (futur)** | PostgreSQL via Supabase |
| **Sidebar** | macOS Finder-style glassmorphism |

---

## Annexe : Utilisateurs Mock

| ID | Nom | Role | Entreprise | Entrepot | PIN |
|----|-----|------|------------|----------|-----|
| U001 | Ahmed Mansour | CEO | Jawda | Tous | 1234 |
| U002 | Karim Ben Ali | WarehouseManager | Jawda | Alger Construction | 2345 |
| U003 | Sara Khalil | QCOfficer | Jawda | Alger + Oran | 3456 |
| U004 | Omar Fadel | Driver | Jawda | Oran Food | 4567 |
| U005 | Youssef Hamdi | Driver | Jawda | Alger Construction | 5678 |
| U006 | Nadia Salim | Accountant | Jawda | Tous | 6789 |
| U007 | Tarek Daoui | Operator | Jawda | Alger Construction | 7890 |
| U008 | Leila Rached | BIAnalyst | Jawda | Tous | 8901 |
| U009 | Samir Rafik | WarehouseManager | Jawda | Oran Food | 9012 |
| U010 | Hassan Nour | WarehouseManager | Jawda | Constantine Tech | 0123 |
| U011 | Anis Boucetta | FinanceDirector | Jawda | Tous | 1111 |
| U012 | Rachid Benali | OpsDirector | Jawda | Tous | 2222 |
| U013 | Farid Khelifi | RegionalManager | Jawda | Alger + Oran | 3333 |
| U014 | Mourad Ziani | Supervisor | Jawda | Oran Food | 4444 |
| U015 | Yacine Hadj-Ali | PlatformOwner | Jawda | Tous | 1515 |
| U016 | Karim Benmoussa | Supplier | Agro Sahel | — | 1616 |
| U020 | Karim Benmoussa | CEO | Agro Sahel | Tous (Sahel) | 2020 |
| U021 | Mourad Sahli | WarehouseManager | Agro Sahel | wh-sahel-supplier | 2121 |
| U022 | Yacine Ferhat | Operator | Agro Sahel | wh-sahel-supplier | 2222 |
| U023 | Bilal Kaddour | Driver | Agro Sahel | wh-sahel-supplier | 2323 |
