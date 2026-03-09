# Plan — App Mobile Chauffeur (Driver Delivery)

> **Référence** : [jawda-platform-complete.md](./jawda-platform-complete.md) — § 4.11, § 5, § 7.6, § 8.7
> **Version** : 2.0 — Mars 2026

---

## 1. Vue d'ensemble

L'**App Mobile Chauffeur** est le portail dédié aux livreurs. Accessible à `/delivery/*`, elle permet aux chauffeurs de gérer leur tournée quotidienne, confirmer les livraisons avec preuves, collecter les paiements cash et signaler les incidents.

```
┌─────────────────────────────────────────────────────┐
│              APP MOBILE CHAUFFEUR                     │
│                  /delivery/*                          │
│                                                     │
│  👤 Rôle : Driver (Niveau 5)                         │
│  📱 Portail : App Mobile optimisée terrain            │
│  🔗 Données : Tournée du jour + stops assignés        │
│  📶 Mode : Online + Offline (sync queue)             │
│  📍 GPS : Tracking continu                           │
│                                                     │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  │
│  │ Trip │  │Stops │  │Proofs│  │ Cash │  │ More │  │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  │
│              Bottom Navigation Bar                   │
└─────────────────────────────────────────────────────┘
```

---

## 2. Rôle — Driver (Chauffeur / Livreur)

> Source : jawda-platform-complete.md § 4.11

| Attribut | Détail |
|----------|--------|
| **Portail** | `/delivery/*` |
| **Scope** | Entrepôt assigné + tournée du jour |
| **Niveau RBAC** | 5 |
| **Entrepôt** | Assigné à un seul entrepôt |

### Permissions

| Action | Autorisé |
|--------|:---:|
| Voir ses livraisons assignées | ✅ |
| Confirmer livraison (signature + photo) | ✅ |
| Collecter paiements cash | ✅ |
| Signaler un incident | ✅ |
| Inspecter véhicule (checklist) | ✅ |
| Voir détails commande (produits, quantités) | ✅ |
| Modifier une commande | ❌ |
| Créer un document ERP | ❌ |
| Accéder WMS / Admin | ❌ |
| Voir prix d'achat / marges | ❌ |

### Matrice d'accès (réf. § 6)

| Module | Accès |
|--------|:---:|
| Ventes | R (statut commandes) |
| Livraison | W (preuves, incidents, cash) |
| Finance / WMS / Admin / BI | ❌ |

---

## 3. Écrans & Navigation

### 3.1 🚚 Tournée du Jour (`/delivery/trip`)

| Élément | Description |
|---------|-------------|
| Véhicule | Immatriculation, kilométrage |
| Nombre de stops | Total journée |
| Progression | X/Y livrés |
| Distance estimée | Km restants |
| ETA retour | Heure estimée |

**Pré-départ obligatoire :**
```
1. 🔑 Login (PIN + biometric)
2. 🚗 Inspection véhicule
   └── Checklist : pneus, freins, rétroviseurs, huile
   └── Photo véhicule obligatoire
   └── Kilométrage départ
3. 📦 Vérification chargement
   └── Scan ou confirmation colis
4. ✅ Démarrer la tournée
   └── GPS tracking activé
```

> **Scénario** (réf. § 7.6) : Driver login → inspection → vérification chargement → GPS activé → démarrage tournée.

---

### 3.2 📍 Liste des Stops (`/delivery/stops`)

| Colonne | Description |
|---------|-------------|
| Ordre | #1, #2, #3... |
| Client | Nom + adresse |
| Commande | N° commande |
| Articles | Nombre de colis |
| Montant | Total TTC |
| Paiement | Cash / Crédit / Chèque |
| Statut | 🔵 À livrer / ✅ Livré / ❌ Refusé / ⚠️ Partiel |

**Actions :** 📍 Naviguer GPS | 📞 Appeler | 👁️ Détail

---

### 3.3 📦 Détail d'un Stop (`/delivery/stops/:id`)

| Section | Contenu |
|---------|---------|
| Client | Nom, adresse, téléphone, notes |
| Commande | N°, date |
| Produits | Liste + quantités |
| Paiement attendu | Montant + mode |
| Instructions | Notes spéciales |

**Actions :**
```
┌─────────────────────────────────────┐
│     CONFIRMER LA LIVRAISON          │
│                                     │
│  ✅ Livraison complète              │
│  ⚠️ Livraison partielle            │
│  ❌ Refus client                    │
│  🚫 Client absent                  │
│  🔄 Report demain                  │
└─────────────────────────────────────┘
```

---

### 3.4 ✅ Confirmation (`/delivery/confirm/:id`)

```
1. Statut : Complète / Partielle (sélection articles)
2. Preuves :
   └── 📸 Photo colis (obligatoire)
   └── ✍️ Signature client (canvas tactile)
   └── 📝 Nom réceptionnaire
3. Paiement (si cash) :
   └── 💰 Montant collecté
   └── Mode : Cash / Chèque
   └── N° chèque (si applicable)
4. Notes + signalement qualité
5. ✅ Valider → Sync → Notification WhMgr
```

> **Scénario** (réf. § 8.7) : Bilal → Stop 1 "Épicerie Benali" → livraison complète → photo + signature → cash 120,000 DZD. Stop 2 → client absent → incident. Stop 3 → colis endommagé → livraison partielle → cash 95,000/120,000.

---

### 3.5 📸 Preuves (`/delivery/proofs`)

| Type | Description |
|------|-------------|
| Photos livraison | Colis déposés |
| Signatures | Canvas signature client |
| Photos incident | Dommage, colis ouvert |
| Photo véhicule | Inspection pré-départ |

Stockage local → sync background. Liées à chaque commande dans le WMS.

---

### 3.6 💰 Collecte Cash (`/delivery/cash`)

| Colonne | Description |
|---------|-------------|
| Stop | Client livré |
| Attendu | Montant à collecter |
| Collecté | Montant reçu |
| Mode | Cash / Chèque |
| Écart | Différence |

```
┌────────────────────────────────┐
│   RÉSUMÉ CAISSE DU JOUR       │
│                                │
│   Cash collecté :  245,000 DZD │
│   Chèques :         80,000 DZD │
│   Total :          325,000 DZD │
│   Attendu :        350,000 DZD │
│   Écart :          -25,000 DZD │
│   ⚠️ Justifier l'écart        │
└────────────────────────────────┘
```

> **Scénario** (réf. § 8.7 clôture) : Cash 1,245,000 + chèques 380,000 = 1,625,000 / attendu 1,750,000 → écart -125,000 (justifié : absent + endommagé) → remise caisse + signature.

---

### 3.7 🚨 Incidents (`/delivery/incidents`)

| Type | Description | Urgence |
|------|-------------|---------|
| Refus client | Refuse la livraison | 🟡 |
| Colis endommagé | Dommage constaté | 🔴 |
| Client absent | Personne pour réceptionner | 🟡 |
| Accident | Accident route | 🔴 Critique |
| Panne véhicule | Véhicule immobilisé | 🔴 |
| Erreur commande | Produits incorrects | 🟠 |
| Retour marchandise | Client veut retourner | 🟡 |

**Flux :** Type → Stop concerné → Description → Photos (obligatoire si dommage) → GPS auto → Soumettre → Notification WhMgr.

---

### 3.8 🏁 Fin de Journée (`/delivery/end-of-day`)

```
1. ✅ Toutes livraisons traitées (ou justifiées)
2. 💰 Remise de caisse (cash + chèques + signature responsable)
3. 📦 Retour marchandise (colis non livrés + retours)
4. 🚗 Véhicule (kilométrage retour + photo + problème mécanique)
5. ✅ Clôture → Résumé PDF → Sync final → Session terminée
```

---

### 3.9 ⚡ Plus (`/delivery/more`)

| Page | Description |
|------|-------------|
| Mon profil | Infos personnelles |
| Historique tournées | 30 derniers jours |
| Performance | Taux livraison, ponctualité |
| Véhicule | Fiche véhicule assigné |
| Déconnexion | |

---

## 4. GPS & Tracking

```
Position GPS envoyée toutes les 30 secondes
├── Stockée localement si offline
├── Batch sync quand connecté
├── Visible temps réel par WarehouseManager
└── Archivée pour historique
```

| Événement | Action |
|-----------|--------|
| Arrivée client (< 100m) | Timer visite démarre |
| Départ client (> 200m) | Timer s'arrête |
| Arrêt prolongé (> 15 min hors stop) | Alerte dispatch |
| Retour entrepôt | Proposition clôture |
| Vitesse excessive | Log sécurité |

---

## 5. Mode Offline

| Donnée | Fraîcheur |
|--------|-----------|
| Tournée du jour | Sync au démarrage |
| Détails clients | Sync au démarrage |
| Détails commandes | Sync au démarrage |
| Carte offline | Tuiles cachées |

```
Confirmation livraison → IndexedDB →
  Quand connecté → Sync automatique →
    Mise à jour WMS
```

Photos compressées, envoyées en background. Si pas de réseau : stockage local.

---

## 6. Inspection Véhicule

| Item | Type |
|------|------|
| Pneus (état, pression) | Checkbox + photo |
| Freins | Checkbox |
| Rétroviseurs | Checkbox |
| Feux avant/arrière | Checkbox |
| Niveau huile | Checkbox |
| Niveau carburant | Gauge (%) |
| Propreté véhicule | Checkbox |
| Kilométrage | Input numérique |
| Photo globale | Photo obligatoire |
| Commentaire | Texte libre |

> Le chauffeur ne peut pas démarrer sans compléter l'inspection.

---

## 7. Relations avec le WMS

> Source : jawda-platform-complete.md § 7.6

```
WarehouseManager ──assigne tournée──→ Driver
Driver ──démarre──→ GPS tracking
Driver ──confirme livraison──→ WMS (SalesOrder → delivered)
Driver ──collecte cash──→ Caisse
Driver ──signale incident──→ Notification WhMgr
Driver ──fin de journée──→ Clôture + remise caisse
Comptable ──vérifie──→ Cash collecté vs attendu
```

---

## 8. Métriques (côté WMS)

| Métrique | Description |
|----------|-------------|
| Livraisons / jour | Nombre |
| Taux de réussite | % complètes |
| Temps moyen / stop | Minutes |
| Distance parcourue | Km / jour |
| Cash collecté | Montant / jour |
| Incidents | Nombre / type |
| Ponctualité | % dans le créneau |
| Consommation carburant | Estimation km/L |

---

## 9. Notifications Push

| Événement | Notification |
|-----------|-------------|
| Nouvelle tournée | "Votre tournée du [date] : X stops" |
| Modification stop | "Stop #3 modifié (nouvel article)" |
| Client annule | "Client [Nom] a annulé" |
| Rappel clôture | "N'oubliez pas de clôturer" |
| Alerte vitesse | "Vitesse élevée — conduisez prudemment" |

---

## 10. UX Mobile Terrain

- **Gants-friendly** : Boutons extra-larges (min 56px)
- **Soleil lisible** : Contraste élevé, mode high-contrast
- **One-tap actions** : Minimiser les étapes
- **Confirmation audio** : Bip de confirmation
- **Mode paysage** : Support tablette dashboard

```
┌────────┬────────┬────────┬────────┬────────┐
│  🚚   │  📍   │  📸   │  💰   │  ⚡   │
│ Trip  │ Stops │Proofs │ Cash  │ More  │
└────────┴────────┴────────┴────────┴────────┘
```

**Couleurs de statut :**
🔵 À livrer | 🟢 Livré complet | 🟡 Livré partiel | 🔴 Refusé/Incident | ⚪ Non traité

---

## 11. Sécurité

> Source : jawda-platform-complete.md § 11

1. **Scope strict** : Tournée du jour uniquement
2. **Pas de données financières** : Aucun prix d'achat, marge, coût
3. **GPS obligatoire** : Pas de livraison sans GPS
4. **Photos horodatées** : EXIF + timestamp serveur
5. **Cash accountability** : Chaque collecte enregistrée
6. **Session liée au véhicule** : 1 chauffeur = 1 véhicule / jour
7. **Biometric login** : PIN + empreinte
8. **Auto-lock** : 5 min inactivité

---

## 12. Utilisateurs Mock

| ID | Nom | Rôle | Entrepôt | PIN |
|----|-----|------|----------|-----|
| U004 | Omar Fadel | Driver | Oran Food | 4567 |
| U005 | Youssef Hamdi | Driver | Alger Construction | 5678 |
| U023 | Bilal Kaddour | Driver | Agro Sahel (wh-sahel) | 2323 |

> Bilal est référencé dans le scénario 7 et Omar/Youssef dans le scénario 10 de jawda-platform-complete.md.

---

## 13. Tech Stack

| Couche | Technologie |
|--------|-------------|
| Framework | React (responsive) → React Native (futur) |
| Offline | IndexedDB (idb) + Service Worker |
| GPS | Geolocation API (watchPosition) |
| Camera | MediaDevices API |
| Signature | Canvas 2D (touch events) |
| Maps | Leaflet + OpenStreetMap |
| Sync | Background Sync + retry queue |
| Push | Push API + FCM (futur) |
| Auth | PIN + WebAuthn (biometric) |
