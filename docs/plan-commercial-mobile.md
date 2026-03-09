# Plan — App Mobile Commercial (Vendeur Terrain)

> **Référence** : [jawda-platform-complete.md](./jawda-platform-complete.md) — § 4.10, § 5, § 8.5, § 8.6
> **Version** : 2.0 — Mars 2026

---

## 1. Vue d'ensemble

L'**App Mobile Commercial** est le portail dédié aux vendeurs terrain. Accessible à `/mobile/*`, elle permet aux commerciaux de gérer leurs tournées, visiter les clients, passer des commandes et suivre leur performance — le tout en mobilité avec support **offline**.

```
┌─────────────────────────────────────────────────────┐
│              APP MOBILE COMMERCIAL                   │
│                  /mobile/*                            │
│                                                     │
│  👤 Rôle : Commercial (Niveau 4)                     │
│  📱 Portail : App Mobile optimisée touch             │
│  🔗 Données : Scopées par zone + clients assignés    │
│  📶 Mode : Online + Offline (sync queue)             │
│                                                     │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  │
│  │ Home │  │Clients│  │Orders│  │Route │  │ More │  │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  │
│              Bottom Navigation Bar                   │
└─────────────────────────────────────────────────────┘
```

---

## 2. Rôle — Commercial (Vendeur Terrain)

> Source : jawda-platform-complete.md § 4.10

| Attribut | Détail |
|----------|--------|
| **Portail** | `/mobile/*` |
| **Scope** | Ses clients assignés + sa zone géographique |
| **Niveau RBAC** | 4 (même que Supervisor) |
| **Entrepôt** | Assigné à un entrepôt (source stock) |

### Permissions

| Action | Autorisé |
|--------|:---:|
| Créer commandes de vente | ✅ |
| Voir catalogue produits (prix vente) | ✅ |
| Voir stock disponible (quantités) | ✅ |
| Consulter historique commandes | ✅ |
| Enregistrer visites clients (GPS) | ✅ |
| Voir encours client (solde crédit) | ✅ |
| Voir prix d'achat / marges | ❌ |
| Modifier prix de vente | ❌ |
| Approuver documents | ❌ |
| Accéder au WMS / Admin | ❌ |

### Matrice d'accès (réf. § 6)

| Module | Accès |
|--------|:---:|
| Ventes | W (commandes) |
| Stock | R (quantités, pas coûts) |
| Finance / Comptabilité | ❌ |
| WMS interne | ❌ |
| BI / Rapports | ❌ |
| Admin | ❌ |

---

## 3. Écrans & Navigation

### 3.1 🏠 Dashboard (`/mobile/`)

**KPI personnels :**

| KPI | Description |
|-----|-------------|
| CA du jour | Montant des commandes passées aujourd'hui |
| CA du mois | Cumul mensuel |
| Objectif mensuel | % d'atteinte |
| Clients visités aujourd'hui | Nombre / objectif |
| Commandes du jour | Nombre créées |
| Encours clients | Total des impayés de ses clients |

**Widgets :**
- Graphique CA hebdomadaire (sparkline)
- Top 5 produits vendus ce mois
- Prochains clients à visiter (tournée du jour)
- Notifications récentes

**Actions rapides :**
- 🛒 Nouvelle commande
- 👤 Ajouter un client
- 📍 Démarrer la tournée

---

### 3.2 👥 Clients (`/mobile/customers`)

**Liste des clients assignés :**

| Colonne | Description |
|---------|-------------|
| Nom | Raison sociale |
| Contact | Nom + téléphone |
| Zone | Quartier / ville |
| Solde | Encours actuel |
| Dernière visite | Date + durée |
| Statut | Actif / En attente / Bloqué |

**Fonctionnalités :**
- 🔍 Recherche par nom / zone
- 📊 Filtrage par statut, solde, dernière visite
- 📍 Vue carte des clients
- ➕ Ajout nouveau client (soumis pour validation)

#### Détail Client (`/mobile/customers/:id`)

| Section | Contenu |
|---------|---------|
| Fiche | Nom, adresse, contact, type (grossiste/détaillant) |
| Crédit | Limite, utilisé, disponible, jours de retard |
| Historique commandes | 20 dernières commandes |
| Historique visites | Dates, GPS, notes, durée |
| Produits favoris | Top produits commandés |

**Actions :** 📞 Appeler | 🛒 Nouvelle commande | 📝 Enregistrer visite | 📍 Naviguer GPS

---

### 3.3 🛒 Commandes (`/mobile/orders`)

| Colonne | Description |
|---------|-------------|
| N° commande | Identifiant unique |
| Client | Raison sociale |
| Montant | Total TTC |
| Statut | draft / confirmed / picking / shipped / delivered / cancelled |
| Date | Date de création |

#### Nouvelle Commande (`/mobile/new-order`)

**Flux :**
```
1. Sélectionner le client
   └── Vérification crédit automatique (blocage si dépassement)
2. Ajouter des produits
   └── Catalogue avec recherche
   └── Stock disponible en temps réel
   └── Prix selon type client (grossiste/détaillant/VIP)
   └── Sélecteur UdM
3. Récapitulatif
   └── Total HT / TVA / TTC
   └── Conditions de paiement
   └── Notes / instructions
4. Validation
   └── Commande créée en statut "draft"
   └── Push notification au WarehouseManager
   └── Sync offline si pas de connexion
```

**Contrôles :**
- ⚠️ Stock insuffisant → alerte
- ⚠️ Crédit client dépassé → blocage
- ⚠️ Produit indisponible → alerte
- ✅ Calcul automatique prix par palier

> **Scénario** (réf. § 8.5) : Mehdi visite "Épicerie Benali" → encours 45,000 DZD → commande 120,000 DZD → credit check 165,000 < 200,000 → OK → SO-2026-0450 créée.

> **Scénario crédit dépassé** (réf. § 8.6) : "Grossiste Amine" a 480,000/500,000 → commande 150,000 → BLOCAGE → collecte 100,000 cash → nouvel encours 380,000 → commande réduite.

---

### 3.4 📍 Tournée (`/mobile/route`)

| Élément | Description |
|---------|-------------|
| Carte | Leaflet/OpenStreetMap avec les clients |
| Ordre optimisé | Itinéraire suggéré |
| Checklist | Clients à visiter (coché quand visité) |
| Tracking GPS | Position en temps réel |

**Flux de visite :**
```
1. Arrivée chez le client (GPS détecté)
2. Timer démarre automatiquement
3. Commercial peut :
   └── Passer une commande
   └── Vérifier l'encours
   └── Prendre des notes
   └── Photographier le rayonnage
4. Départ (timer s'arrête)
5. Visite enregistrée dans le log
6. Sync avec le serveur
```

---

### 3.5 ⚡ Plus (`/mobile/more`)

| Action | Description |
|--------|-------------|
| File d'attente offline | Commandes en attente de sync |
| Mon profil | Infos personnelles |
| Objectifs | Détail objectifs mensuels |
| Historique visites | Toutes les visites |
| Déconnexion | Logout |

---

## 4. Mode Offline

> Le commercial travaille souvent sans connexion (zones rurales).

### Données cachées localement

| Donnée | Fraîcheur |
|--------|-----------|
| Catalogue produits + prix | Sync quotidienne (matin) |
| Liste clients + encours | Sync quotidienne (matin) |
| Stock disponible | Sync quotidienne (snapshot) |
| Commandes en cours | Sync temps réel quand connecté |
| Historique visites | Local + sync |

### Queue offline

```
Commande créée offline → IndexedDB →
  Quand connecté → Sync automatique →
    Confirmation push notification
```

### Gestion des conflits

- Stock épuisé entre-temps → commande en "review"
- Client bloqué entre-temps → même traitement
- Double commande → détection hash client+produits+date

---

## 5. Notifications Push

| Événement | Notification |
|-----------|-------------|
| Commande confirmée | "Commande #SO-xxx confirmée par l'entrepôt" |
| Commande livrée | "Livraison effectuée chez [Client]" |
| Stock bas | "Stock [Produit] < seuil minimum" |
| Objectif atteint | "Bravo ! Objectif mensuel atteint 🎉" |
| Nouveau client assigné | "Nouveau client [Nom] ajouté à votre zone" |

---

## 6. UX Mobile

- **Touch-first** : Boutons min 48px
- **One-handed** : Actions principales en bas
- **Quick actions** : FAB pour nouvelle commande
- **Pull-to-refresh** : Mise à jour des données
- **Swipe** : Gauche sur client → Nouvelle commande
- **Bottom sheet** : Détails dans un drawer du bas

```
┌────────┬────────┬────────┬────────┬────────┐
│  🏠   │  👥   │  🛒   │  📍   │  ⚡   │
│ Home  │Clients │Orders │ Route │ More  │
└────────┴────────┴────────┴────────┴────────┘
```

---

## 7. Relations avec le WMS

> Source : jawda-platform-complete.md § 7.3

```
Commercial (mobile) ──crée commande──→ WMS (SalesOrder draft)
WarehouseManager ──confirme──→ SalesOrder confirmed
Supervisor/Operator ──picking──→ Préparation
Shipping ──expédition──→ Driver
Driver ──livre──→ Client
```

---

## 8. Métriques (côté WMS)

Le **RegionalManager** voit :

| Métrique | Description |
|----------|-------------|
| CA par commercial | Classement vendeurs |
| Visites par jour | Nombre moyen |
| Taux de conversion | Visites → Commandes |
| Panier moyen | Montant moyen par commande |
| Couverture zone | % clients visités / total |
| Objectifs vs réalisé | Suivi targets |

---

## 9. Sécurité

> Source : jawda-platform-complete.md § 11

1. **Scope strict** : Le commercial ne voit QUE ses clients assignés
2. **Pas de prix d'achat** : Aucun coût, marge, ou donnée financière
3. **Crédit check** : Blocage automatique si limite dépassée
4. **GPS obligatoire** : Preuve de visite
5. **Session timeout** : Déconnexion après inactivité
6. **Données offline chiffrées** : IndexedDB avec encryption

---

## 10. Utilisateur Mock

| ID | Nom | Rôle | Zone | Entrepôt | PIN |
|----|-----|------|------|----------|-----|
| U017 | Mehdi Tlemcani | Commercial | Oran | Oran Food | 1717 |

> Mehdi est référencé dans les scénarios 5 et 6 de jawda-platform-complete.md.

---

## 11. Tech Stack

| Couche | Technologie |
|--------|-------------|
| Framework | React (web responsive) → React Native (futur) |
| Offline | IndexedDB (idb) + Service Worker |
| GPS | Geolocation API + Leaflet |
| Sync | Background Sync API + retry queue |
| Push | Push API + FCM (futur) |
| Auth | PIN + biometric (WebAuthn) |
| Maps | Leaflet / OpenStreetMap |
