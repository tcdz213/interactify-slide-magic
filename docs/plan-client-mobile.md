# Plan — Portail Client (Client Mobile)

> **Référence** : [jawda-platform-complete.md](./jawda-platform-complete.md) — § 4.13, § 5, § 7.3, § 8.8
> **Version** : 2.0 — Mars 2026

---

## 1. Vue d'ensemble

Le **Portail Client** est l'interface accessible à `/portal/*` pour les clients finaux des entrepôts abonnés. Les clients peuvent passer des commandes, suivre leurs livraisons, consulter leurs factures et gérer leur compte.

```
┌─────────────────────────────────────────────────────┐
│                 PORTAIL CLIENT                       │
│                  /portal/*                            │
│                                                     │
│  👤 Rôle : Client (externe, pas d'abonnement)       │
│  📱 Portail : Web responsive (mobile-first)          │
│  🔗 Données : Ses propres commandes/factures         │
│  💰 Pas d'accès : WMS, prix achat, marges, stock    │
│                                                     │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  │
│  │ Home │  │Catalog│ │Orders│  │Bills │  │ More │  │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  │
│              Bottom Navigation Bar                   │
└─────────────────────────────────────────────────────┘
```

---

## 2. Rôle — Client

> Source : jawda-platform-complete.md § 4.13

| Attribut | Détail |
|----------|--------|
| **Portail** | `/portal/*` |
| **Scope** | Ses propres données uniquement |
| **Niveau RBAC** | Externe (pas dans la hiérarchie) |
| **Relation** | Client d'un entrepôt abonné Jawda |
| **Coût** | Gratuit (c'est l'entrepôt qui paie) |

### Permissions

| Action | Autorisé |
|--------|:---:|
| Passer des commandes | ✅ |
| Voir catalogue produits (prix vente) | ✅ |
| Suivre ses commandes | ✅ |
| Consulter ses factures | ✅ |
| Voir son solde crédit | ✅ |
| Demander un retour | ✅ |
| Télécharger factures PDF | ✅ |
| Voir prix d'achat / marges | ❌ |
| Voir le stock global | ❌ |
| Accéder au WMS | ❌ |
| Voir les données d'autres clients | ❌ |

### Matrice d'accès (réf. § 6)

| Module | Accès |
|--------|:---:|
| Ventes | W (commandes) |
| Finance | R (ses factures) |
| Livraison | R (suivi) |
| WMS / Stock / Admin / BI | ❌ |

---

## 3. Écrans & Navigation

### 3.1 🏠 Dashboard (`/portal/`)

| KPI | Description |
|-----|-------------|
| Commandes en cours | Nombre actives |
| Dernière commande | Date et statut |
| Solde crédit | Disponible / Limite |
| Factures impayées | Montant total dû |
| Prochaine livraison | ETA estimée |

**Widgets :**
- Jauge de crédit (utilisé / disponible / limite)
- 3 dernières commandes avec statut
- Notifications récentes
- Bouton "Commander" prominent

---

### 3.2 📦 Catalogue & Commande (`/portal/place-order`)

**Flux :**
```
1. Parcourir le catalogue
   └── Recherche par nom / catégorie
   └── Prix selon type client (grossiste/détaillant)
   └── Indication "En stock" / "Rupture" (pas quantité exacte)

2. Ajouter au panier
   └── Sélection quantité + UdM
   └── Vérification crédit temps réel

3. Récapitulatif
   └── Total HT / TVA / TTC
   └── Adresse de livraison
   └── Notes / instructions

4. Validation
   └── Commande soumise (pending)
   └── Notification push
   └── Numéro attribué
```

**Contrôles :**
- ⚠️ Crédit dépassé → "Contactez votre commercial"
- ⚠️ Produit en rupture → alerte
- ✅ Prix automatique selon type client

> **Scénario** (réf. § 8.8) : "Épicerie Benali" ouvre `/portal/` → 155,000 DZD crédit disponible → commande 151,500 DZD → credit check OK → SO-2026-0451 créée → confirmation 2h plus tard → livraison lendemain → facture disponible.

---

### 3.3 📋 Mes Commandes (`/portal/orders`)

| Colonne | Description |
|---------|-------------|
| N° commande | Identifiant |
| Date | Date de création |
| Montant | Total TTC |
| Statut | pending → confirmed → picking → shipped → delivered |
| ETA | Livraison estimée |

**Statuts visuels :**
```
pending    → 🟡 En attente
confirmed  → 🔵 Confirmée
picking    → 🟣 En préparation
shipped    → 🚚 Expédiée
delivered  → ✅ Livrée
cancelled  → ❌ Annulée
```

#### Détail (`/portal/orders/:id`)

| Section | Contenu |
|---------|---------|
| Statut | Timeline visuelle |
| Lignes | Produit, quantité, prix unitaire, total |
| Livraison | Adresse, ETA, chauffeur |
| Paiement | Mode, statut |
| Actions | Annuler (si pending), Retour (si livrée) |

---

### 3.4 💳 Factures & Paiements (`/portal/invoices`)

| Colonne | Description |
|---------|-------------|
| N° facture | Identifiant |
| Commande liée | Référence |
| Montant | Total TTC |
| Solde | Restant dû |
| Statut | paid / pending / overdue |
| Échéance | Date limite |

**Actions :** 📥 Télécharger PDF | 💰 Payer en ligne (futur)

#### Relevé de compte (`/portal/statement`)
- Historique mouvements (factures, paiements, avoirs)
- Solde courant
- Export PDF / Excel

---

### 3.5 🔔 Notifications (`/portal/notifications`)

| Type | Exemple |
|------|---------|
| Commande | "Votre commande #SO-xxx a été confirmée" |
| Livraison | "Livraison prévue demain entre 9h et 12h" |
| Facture | "Nouvelle facture #INV-xxx disponible" |
| Paiement | "Paiement reçu, merci !" |
| Rappel | "Facture #INV-xxx en retard de 5 jours" |
| Promo | "Offre spéciale : -10% cette semaine" |

---

### 3.6 🔄 Retours (`/portal/returns`)

> Source : jawda-platform-complete.md § 7.4

```
1. Sélectionner la commande livrée
2. Choisir les produits à retourner
3. Motif : Défectueux / Erreur / Qualité / Autre
4. Photos (optionnel)
5. Soumettre → "pending" → "approved" → "collected" → "refunded"
```

**Cycle complet** (réf. § 7.4) : Client demande retour → WhMgr approuve → Driver collecte → QCOfficer inspecte → stock ou destruction → avoir émis.

---

### 3.7 ⚡ Plus (`/portal/more`)

| Page | Description |
|------|-------------|
| Mon profil | Nom, adresse, contact |
| Adresses de livraison | Gérer les adresses |
| Mon crédit | Détail limite, utilisation |
| Conditions | CGV, conditions paiement |
| Support | Contacter l'entrepôt |
| Déconnexion | |

---

## 4. Crédit Client — Règles

```
┌────────────────────────────────────────┐
│        JAUGE DE CRÉDIT CLIENT          │
│                                        │
│  Limite :      500,000 DZD             │
│  Utilisé :     320,000 DZD  [████░░]   │
│  Disponible :  180,000 DZD             │
│  Jours retard moyen : 12j             │
│  Factures en retard : 2               │
└────────────────────────────────────────┘
```

**Règles :**
1. Commande impossible si `encours + nouvelle commande > limite`
2. Commande impossible si factures en retard > X jours
3. Message clair : "Crédit insuffisant. Contactez votre commercial."
4. CEO/FinanceDirector peut débloquer manuellement

---

## 5. Authentification

| Méthode | Description |
|---------|-------------|
| **Email + OTP** | Code 6 chiffres SMS/email |
| **Mot de passe** | Option classique |
| **Lien magique** | Email (futur) |

> Le client n'a **pas de PIN** (réservé aux rôles internes). Auth par email/SMS.

---

## 6. UX Mobile-First

- **Mobile-first** : Conçu pour smartphone
- **Bottom nav** : 5 onglets max
- **Cards** : Commandes/factures en cartes swipables
- **Pull-to-refresh** | **Skeleton loading** | **Empty states**

```
┌────────┬────────┬────────┬────────┬────────┐
│  🏠   │  📦   │  🛒   │  💳   │  ⚡   │
│ Home  │Catalog │Orders │ Bills │ More  │
└────────┴────────┴────────┴────────┴────────┘
```

---

## 7. Relations avec le WMS

> Source : jawda-platform-complete.md § 7.3

```
Client ──passe commande──→ SalesOrder (pending)
WarehouseManager ──confirme──→ confirmed
Operator ──picking + packing──→ Préparation
Driver ──livre──→ Client (photo + signature)
Comptable ──émet facture──→ Client consulte /portal/invoices
Client ──paie──→ Comptable enregistre
```

---

## 8. Données visibles vs cachées

| Donnée | Visible | Caché |
|--------|:---:|:---:|
| Prix de vente | ✅ | |
| Prix d'achat / Marge | | ❌ |
| Stock exact (quantités) | | ❌ |
| Disponibilité (oui/non) | ✅ | |
| Ses commandes / factures | ✅ | |
| Données d'autres clients | | ❌ |
| Données WMS | | ❌ |

---

## 9. Sécurité

> Source : jawda-platform-complete.md § 11

1. **Isolation stricte** : `client_id` filter
2. **Pas de prix d'achat** : Jamais exposé dans l'API
3. **Crédit check serveur** : Validation côté serveur
4. **Rate limiting** : Protection commandes abusives
5. **Session timeout** : 30 min inactivité
6. **HTTPS only** : Communications chiffrées
