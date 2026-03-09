# 📦 Scénario Détaillé — Condor Distribution (Fournisseur Abonné WMS v3.0)

> **Contexte** : Condor Distribution est un fournisseur B2B indépendant abonné à Jawda
> **Scope** : 1 semaine type de Condor (Lun 10/03 → Ven 14/03/2026)
> **Objectif** : Démontrer flux multi-WMS natif avec négociation, modifications, livraisons
> **Utilisateurs** : 5 (Mohamed CEO, Fatima WhMgr, Yacine Op, Karim Driver, Naima Compta)

---

## 📍 Contexte Initial — Condor Distribution

```
Entreprise: CONDOR DISTRIBUTION
├─ Statut: Fournisseur Abonné (Plan PRO)
├─ Secteur: Distribution générale (agroalimentaire, pièces auto, électronique)
├─ Siège: Zone Oued Smar, Alger
├─ Clients: ~20 entrepôts à travers l'Algérie
├─ Portefeuille:
│  ├─ Alger Construction (fournisseur régulier)
│  ├─ Oran Food Distribution (nouveau client)
│  ├─ Constantine Tech (partenaire logistique)
│  ├─ + 17 autres clients petits/moyen
│  └─ Revenu mensuel estimé: 15-20 M DZD
│
└─ Infrastructure Condor
   ├─ Entrepôt principal: 8,000 m² Oued Smar
   ├─ Produits: 2,500+ références (mix secteurs)
   ├─ Stock valorisé: ~245 M DZD
   ├─ Équipe: 15 personnes
   └─ Fournisseurs propres: Mittal Steel, Cimenterie Chlef, Dattes El Oued, TechParts

WMS Jawda (Instance Condor):
├─ URL: jawda.dz/condor/
├─ Dashboard: Voit TOUTES ses PO reçues (cross-client search)
├─ Capacité: Gère sa propre chaîne logistique (picking, packing, livraison)
└─ Facturation: Crée ses propres factures clients
```

---

## 📅 Lundi 10 Mars — Matin (7h–12h)

### 7h30 — Mohamed (CEO Condor) accède à son WMS

```
👤 Utilisateur: Mohamed Ben Cherif (CEO)
🔐 PIN: 8888
📱 Device: iPad desktop
🏢 WMS Instance: Condor Distribution
```

**Étape 1 : Login**
```
URL: jawda.dz/condor/login

Écran de login:
┌──────────────────────────────────────┐
│      JAWDA CONDOR DISTRIBUTION       │
│                                      │
│  Utilisateur:                        │
│  ┌──────────────────────────────────┐│
│  │ Mohamed Ben Cherif              ││
│  └──────────────────────────────────┘│
│                                      │
│  PIN:                                │
│  ┌──────────────────────────────────┐│
│  │ ••••••                           ││
│  └──────────────────────────────────┘│
│                                      │
│  [Biometric] [Se connecter]          │
└──────────────────────────────────────┘

Résultat: ✅ Authentifié
│
├─ Session créée:
│  ├─ userId: U030
│  ├─ role: CEO
│  ├─ wmsInstanceId: "condor"
│  └─ permissions: [all, can_modify_incoming_po, can_refuse_po]
│
└─ Redirect: /condor/
```

**Étape 2 : Dashboard Condor**
```
URL: /condor/

┌─────────────────────────────────────────────────────────────────┐
│  🏭 CONDOR DISTRIBUTION — Tableau de Bord                     │
│  Lundi 10 Mars 2026                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─ KPI CARTES ───────────────────────────────────────┐         │
│  │ 📊 Stock Total     📈 CA Mois    💰 Encours      │         │
│  │ 1,247 articles     12,450K DZD   2,845K DZD      │         │
│  │ 245M DZD valorisé  (+18% vs mois dernier)       │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                   │
│  ⚠️ ALERTES IMPORTANTES                                        │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 🔴 3 PO REÇUES CE WEEK-END (En attente)             │    │
│  │    • PO-0100 (Alger) — 500T Ciment — 1.25M DZD      │    │
│  │    • PO-0101 (Oran) — 200L Huile — 640K DZD         │    │
│  │    • PO-0102 (Constantine) — 50T Acier — 2.25M DZD  │    │
│  │                                                       │    │
│  │    Action requise: [Voir les 3 PO]                   │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
│  📊 GRAPHIQUES (Mini-vues)                                     │
│  ┌────────┬────────┬────────────────────┐                      │
│  │ CA     │ Clients│ Produits populaires│                      │
│  │ Mar 5M │8 actif│ 1.Ciment 2.Huile   │                      │
│  │ Avr 6M │ +2    │ 3.Acier 4.Farine  │                      │
│  │ Mai 7M │ +1    │ 5.Sucre 6.Pâtes   │                      │
│  └────────┴────────┴────────────────────┘                      │
│                                                                   │
│  🎯 ACTIONS RAPIDES                                           │
│  [📋 Mes PO Reçues] [🛒 Mes Commandes] [📦 Stock]  [🚚 Livr] │
│                                                                   │
├─ Sidebar ──────────────────────────────────┤                  │
│                                            │                  │
│ 📍 Condor Distribution                     │                  │
│    Oued Smar, Alger                        │                  │
│ ───────────────────────────                │                  │
│ 📊 Dashboard                               │                  │
│ 📦 Mes Produits                           │                  │
│ 📋 PO Reçues         [3]                   │                  │
│ 🛒 Mes Commandes     [2]                   │                  │
│ 📈 Stock                                   │                  │
│ 🚚 Livraisons                              │                  │
│ 💳 Comptabilité                            │                  │
│ 👥 Utilisateurs                            │                  │
│ ⚙️ Paramètres                              │                  │
│ ───────────────────────────                │                  │
│ 🔄 Autres WMS (Lecture)                    │                  │
│    • Alger Construction                    │                  │
│    • Oran Food                             │                  │
│    • Constantine Tech                      │                  │
│ ─────────────────────────                  │                  │
│ 👑 Owner Dashboard                         │                  │
│ 🚪 Déconnexion                             │                  │
│                                            │                  │
└────────────────────────────────────────────┘                  │
```

**Observations Mohamed:**
- ✅ "Bon, 3 PO reçues. Il faut que je les valide ce matin."
- ⚠️ "Oui, j'ai besoin de recruter un responsable commercial, mon CA stagne à 12M."
- 📍 "Vérifier: Est-ce qu'on peut livrer 500T ciment avec notre capacité logistique?"

---

### 8h00 — Consulter les 3 PO Reçues

**Étape 3 : Accès à la page "PO Reçues"**
```
URL: /condor/incoming-pos/

┌──────────────────────────────────────────────────────────────────┐
│  📋 MES COMMANDES REÇUES (3)                                    │
│  Lundi 10 Mars 2026 | Tri: Plus récent                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  🔍 Filtres: [Tous ▼] [Statut ▼] [Client ▼] [Montant ▼]        │
│                                                                   │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ # │ CLIENT    │ PRODUIT         │ QTE    │ MONTANT  │ STATUT │ │
│ ├──────────────────────────────────────────────────────────────┤ │
│ │   │           │                 │        │          │        │ │
│ │ 1 │ Alger     │ Ciment CEM-32   │ 500 T  │ 1.25M    │ ⏳     │ │
│ │   │ Constr.   │                 │        │ DZD      │ Pending│ │
│ │   │ [PO-0100] │                 │        │          │        │ │
│ │   │           │ 🔹 Délai: 3j    │        │          │        │ │
│ │   │           │ 🔹 Net 30       │        │          │        │ │
│ │   │           │ 🔹 À Alger      │        │          │        │ │
│ │   │ Actions:  │ [Voir] [✅ Conf][❌ Ref][📝 Modif] │        │ │
│ ├──────────────────────────────────────────────────────────────┤ │
│ │   │           │                 │        │          │        │ │
│ │ 2 │ Oran Food │ Huile olive     │ 200 L  │ 640K     │ ⏳     │ │
│ │   │ Distrib.  │                 │        │ DZD      │ Pending│ │
│ │   │ [PO-0101] │                 │        │          │        │ │
│ │   │           │ 🔹 Délai: 5j    │        │          │        │ │
│ │   │           │ 🔹 Net 30       │        │          │        │ │
│ │   │           │ 🔹 À Oran       │        │          │        │ │
│ │   │ Actions:  │ [Voir] [✅ Conf][❌ Ref][📝 Modif] │        │ │
│ ├──────────────────────────────────────────────────────────────┤ │
│ │   │           │                 │        │          │        │ │
│ │ 3 │ Constant. │ Acier FeE400    │ 50 T   │ 2.25M    │ ⏳     │ │
│ │   │ Tech      │                 │        │ DZD      │ Pending│ │
│ │   │ [PO-0102] │                 │        │          │        │ │
│ │   │           │ 🔹 Délai: urgent│        │          │        │ │
│ │   │           │ 🔹 COD (paiement│        │          │        │ │
│ │   │           │    d'abord)     │        │          │        │ │
│ │   │           │ 🔹 À Constantine│        │          │        │ │
│ │   │ Actions:  │ [Voir] [✅ Conf][❌ Ref][📝 Modif] │        │ │
│ ├──────────────────────────────────────────────────────────────┤ │
│ │ TOTAL WEEK-END: 4,140K DZD potentiels                        │ │
│ │ Si confirmé tout = +4.14M CA pour Condor cette semaine ✅   │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  📊 Statistiques rapides:                                       │
│  • Clients uniques: 3 (Alger, Oran, Constantine)               │
│  • Délai moyen: 3-5 jours (urgent possible)                    │
│  • Paiement: Surtout Net 30 (sauf Constantine = COD)           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Pensée Mohamed:**
- "Alger demande 500T ciment → j'en ai ~800T en stock ✅"
- "Oran veut 200L huile → possible mais serré (je vérifierai après)"
- "Constantine urgent + COD → risqué, faut vérifier trésorerie"

---

### 8h30 — Consulter PO-0100 (Alger) en détail

**Étape 4 : Ouvrir détail PO-0100**
```
URL: /condor/incoming-pos/PO-0100/

┌─────────────────────────────────────────────────────────────────┐
│  📋 DÉTAIL COMMANDE REÇUE                                      │
│  PO-0100 | Alger Construction | Créée le 09/03 à 14h32        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CLIENT: Entrepôt Alger Construction                           │
│  ├─ Contact: Karim Ben Ali (WhMgr)                             │
│  ├─ Email: karim@alger-wms.jawda.dz                            │
│  ├─ Téléphone: +213 21 XXX XXXX                                │
│  ├─ Adresse livraison: Ain Naâja, Alger                        │
│  └─ Historique: 45 commandes depuis 1 an, paiement OK ✅      │
│                                                                  │
│  PRODUITS COMMANDÉS:                                           │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Ciment Portland CEM-32                                    │ │
│  │                                                           │ │
│  │ Quantité: 500 tonnes                                      │ │
│  │ Prix unitaire: 2,500 DZD/tonne                            │ │
│  │ Prix total: 1,250,000 DZD                                 │ │
│  │                                                           │ │
│  │ 📦 STOCK CONDOR:                                         │ │
│  │    Disponible: 847 tonnes (en entrepôt)                   │ │
│  │    → Suffisant ✅                                         │ │
│  │                                                           │ │
│  │ 📊 Coût pour Condor:                                     │ │
│  │    Coût d'achat: 2,100 DZD/T (Chlef)                     │ │
│  │    Marge: 400 DZD/T × 500 = 200,000 DZD ✅             │ │
│  │    % Marge: 16% (acceptable)                             │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  CONDITIONS:                                                    │
│  ├─ Délai livraison: 3 jours (avant 13/03)                    │
│  ├─ Paiement: Net 30 (facture à réception)                    │
│  ├─ Transport: Condor livre (frais inclus dans prix)          │
│  ├─ TVA: 19%                                                   │
│  └─ Total TTC: 1,487,500 DZD                                   │
│                                                                  │
│  LOGISTIQUE CONDOR:                                            │
│  ├─ Picking: 1-2 jours                                        │
│  ├─ Packing: 0,5 jour                                         │
│  ├─ Livraison (Alger): 0,5 jour (même ville)                  │
│  └─ Total en chaîne: 2 jours ✅ (avant délai 3j)             │
│                                                                  │
│  ACTIONS:                                                       │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ [✅ CONFIRMER]  [❌ REFUSER]  [📝 MODIFIER]              │ │
│  │                                                           │ │
│  │ [📞 CONTACTER ALGER]  [📎 PIÈCES JOINTES]              │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  💬 NOTES INTERNES (Condor):                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Vous pouvez ajouter des notes (visibles que par Condor)  │ │
│  │                                                           │ │
│  │ [Alger client régulier, toujours paye] ← déjà noté      │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Analyse Mohamed:**
- ✅ Stock OK (847T > 500T demandé)
- ✅ Marge OK (16% acceptable)
- ✅ Délai OK (3j faisable en 2j)
- ✅ Client de confiance (45 commandes, paiement bon)

**Décision: CONFIRMER PO-0100**

```
Mohamed clique: [✅ CONFIRMER]

┌────────────────────────────────────────────────────────┐
│ Confirmation de la commande PO-0100                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Êtes-vous sûr de confirmer cette PO?                 │
│                                                        │
│ • 500T Ciment @ 2,500 DZD/T = 1,250,000 DZD          │
│ • Délai: 3 jours                                      │
│ • Livraison: Condor → Alger                          │
│                                                        │
│ [❌ Annuler]  [✅ Confirmer]                          │
└────────────────────────────────────────────────────────┘

Mohamed confirme → Système:
│
├─ PO-0100 statut: "pending" → "confirmed_by_supplier"
├─ Stock réservé: 500T Ciment bloqués pour Alger
├─ Picking créé: Tâche assignée à Fatima (WhMgr)
├─ Notif vers Alger WMS: "Votre PO-0100 est confirmée, en préparation"
├─ Audit log: "CEO Condor (Mohamed) confirme PO-0100 à 08:45"
├─ Task dashboard Condor:
│  ├─ Fatima voit: "Nouveau picking: 500T ciment pour Alger"
│  └─ Yacine voit: "Picking task créée: PKG-0450"
│
└─ Toast: "✅ PO-0100 confirmée! Picking en cours."
```

---

### 9h00 — Consulter PO-0101 (Oran) — Stock Limité

**Étape 5 : Ouvrir détail PO-0101**
```
URL: /condor/incoming-pos/PO-0101/

SITUATION:
• Oran demande: 200L huile olive
• Stock Condor: 150L disponible UNIQUEMENT
• Fournisseur (Dattes El Oued): 300L en stock, livraison 5 jours
```

**Affichage alerte stock:**
```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ ALERTE STOCK — Quantité insuffisante                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Demandé: 200 L                                                   │
│ Disponible: 150 L                                                │
│ Écart: -50 L (25% manquant)                                     │
│                                                                  │
│ OPTIONS POUR ORAN:                                              │
│                                                                  │
│ 1️⃣ LIVRER PARTIELLEMENT (150L maintenant)                      │
│    ├─ Livraison immédiate: 150L                                │
│    ├─ Reste (50L): Dans 5 jours                                │
│    └─ Oran paie 2 fois (deux factures) ❌ Complexe            │
│                                                                  │
│ 2️⃣ PROPOSER ALTERNATIVE                                        │
│    ├─ Huile arachide (équivalent): 200L disponible ✅          │
│    ├─ Même prix: 3,200 DZD/L                                   │
│    └─ Oran peut accepter ou refuser                            │
│                                                                  │
│ 3️⃣ ATTENDRE 5 JOURS                                            │
│    ├─ Nouvelle arrivage: 300L (Dattes El Oued)                │
│    ├─ Livraison complète: 200L le 15/03                        │
│    └─ Oran attend (PO reporte à 15/03)                         │
│                                                                  │
│ 4️⃣ CONTRE-PROPOSER (150L maintenant + 50L dans 5j)            │
│    ├─ Demande accord Oran                                       │
│    ├─ Oran reçoit les 150L demain, paye partiellement          │
│    └─ Reste livré après (reste à créditer)                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Décision Mohamed : Option 4 (Contre-proposition 150L + 50L)**

```
Mohamed sélectionne: [📝 MODIFIER/CONTRE-PROPOSER]

Formulaire contre-proposition:
┌────────────────────────────────────────┐
│ Proposer une contre-offre à Oran      │
├────────────────────────────────────────┤
│                                        │
│ Quantité proposée: [150] L             │
│ (Livraison immédiate)                  │
│                                        │
│ Reste à livrer: 50 L dans 5 jours     │
│ (Paiement des 150L maintenant, reste  │
│  crédité après livraison des 50L)     │
│                                        │
│ Motif: [Rupture stock temporaire     │
│         Réapprovisionnement prévu    │
│         dans 5 jours ▼]              │
│                                        │
│ Message à Oran:                        │
│ ┌──────────────────────────────────┐  │
│ │ "Nous proposons 150L immédiate   │  │
│ │ + 50L le 15/03. Acceptez-vous?" │  │
│ └──────────────────────────────────┘  │
│                                        │
│ [Envoyer proposition] [Annuler]       │
└────────────────────────────────────────┘

Résultat:
│
├─ PO-0101 statut: "pending" → "awaiting_customer_approval"
├─ Notif vers Oran WMS:
│  ├─ Titre: "Contre-proposition Condor pour PO-0101"
│  ├─ Message: "150L huile maintenant + 50L dans 5 jours"
│  ├─ Oran CEO voit: [✅ Accepter] [❌ Refuser]
│  └─ Deadline: 24h pour répondre
│
├─ Condor sidebar:
│  └─ PO-0101 status: "En négociation" ⚖️
│
└─ Toast: "📨 Proposition envoyée à Oran"
```

---

### 10h00 — Consulter PO-0102 (Constantine) — Refuser

**Étape 6 : Ouvrir PO-0102**
```
URL: /condor/incoming-pos/PO-0102/

SITUATION:
• Constantine demande: 50T Acier FeE400
• Stock Condor: 0T (rupture complète)
• Fournisseur (Mittal): 200T en stock MAIS appro 7 jours
• Conditions PO: COD (paiement avant livraison) → RISQUE pour Condor
```

**Affichage détail avec alerte CRITIQUE:**
```
┌─────────────────────────────────────────────────────────────────┐
│ 🔴 IMPOSSIBLE DE CONFIRMER                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ CLIENT: Constantine Tech                                        │
│ PRODUIT: Acier FeE400                                          │
│ QUANTITÉ: 50 tonnes                                             │
│ MONTANT: 2,250,000 DZD                                         │
│ CONDITION PAIEMENT: COD (paiement avant livraison)             │
│                                                                  │
│ 🚫 PROBLÈME #1: Stock                                         │
│    ├─ Demandé: 50T                                             │
│    ├─ Stock Condor: 0T                                         │
│    └─ Rupture: Oui                                             │
│                                                                  │
│ 🚫 PROBLÈME #2: Approvisionnement                             │
│    ├─ Fournisseur: Mittal Steel                               │
│    ├─ Délai appro: 7 jours (15/03)                            │
│    ├─ Délai PO Constantine: Urgent (3 jours max)              │
│    └─ Incompatible ❌                                          │
│                                                                  │
│ 🚫 PROBLÈME #3: Paiement                                      │
│    ├─ Type: COD (argent avant livraison)                      │
│    ├─ Montant: 2,250,000 DZD                                   │
│    ├─ Trésorerie Condor: OK mais risqué                       │
│    └─ Si Constantine abandonne → Perte                         │
│                                                                  │
│ DÉCISION RECOMMANDÉE: REFUSER                                   │
│ (Indiquer alternatives si possible)                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Mohamed clique: [❌ REFUSER]**

```
Formulaire refus:
┌────────────────────────────────────────┐
│ Refuser la commande PO-0102           │
├────────────────────────────────────────┤
│                                        │
│ MOTIF DE REFUS:                       │
│ □ Produit en rupture stock             │
│ ☑ Délai d'approvisionnement impossible│
│ □ Client non solvable                 │
│ □ Produit discontinué                 │
│ □ Autre                               │
│                                        │
│ DÉTAILS:                              │
│ ┌──────────────────────────────────┐  │
│ │ "Acier FeE400 en rupture. Nouvel │  │
│ │ stock disponible le 15/03. Delai │  │
│ │ urgent incompatible. Proposons   │  │
│ │ alternative:                      │  │
│ │ - Acier FeE250 (disponible)       │  │
│ │ - Acier FeE400 (15/03 possible)  │  │
│ │ Contactez-nous pour discuter."   │  │
│ └──────────────────────────────────┘  │
│                                        │
│ SUGGESTIONS ALTERNATIVES:              │
│ ☑ Proposer Acier FeE250               │
│ ☑ Proposer Acier FeE400 + 5 jours     │
│ □ Contacter directement client        │
│                                        │
│ [Envoyer refus + suggestions]          │
└────────────────────────────────────────┘

Résultat:
│
├─ PO-0102 statut: "pending" → "refused_by_supplier"
├─ Notif vers Constantine WMS:
│  ├─ Titre: "Condor refuse PO-0102"
│  ├─ Motif: "Rupture stock, délai impossible"
│  ├─ Alternatives proposées:
│  │  ├─ Acier FeE250 (équivalent, dispo maintenant)
│  │  └─ Acier FeE400 (dispo 15/03)
│  │
│  └─ Constantine peut:
│     ├─ Accepter FeE250
│     ├─ Attendre jusqu'au 15/03
│     └─ Chercher ailleurs
│
├─ Condor sidebar:
│  └─ PO-0102: Refusée ❌
│
└─ Toast: "📨 Refus + suggestions envoyés à Constantine"
```

---

### 10h30 — Bilan du matin Mohamed

```
Résumé actions CEO Condor (Lundi matin):

PO-0100 (Alger) ✅ CONFIRMÉE
├─ 500T Ciment
├─ 1.25M DZD
├─ Picking en cours
└─ Livraison prévue: 12/03 (demain)

PO-0101 (Oran) ⚖️ EN NÉGOCIATION
├─ Contre-prop: 150L maintenant + 50L dans 5j
├─ En attente réponse Oran
└─ Décision finale: +24h

PO-0102 (Constantine) ❌ REFUSÉE
├─ Motif: Rupture stock
├─ Alternatives proposées
└─ Constantine peut choisir

TRÉSORERIE CONDOR CET WEEK-END:
├─ Confirmée: +1.25M DZD (Alger)
├─ Potentielle: +640K DZD (si Oran accepte)
├─ Refusée: -2.25M DZD (Constantine)
└─ Total réaliste: ~1.9M DZD

AUDIT LOG:
├─ [08:45] CEO Condor confirme PO-0100
├─ [09:30] CEO Condor propose contre-offre PO-0101
├─ [10:15] CEO Condor refuse PO-0102
└─ Tous les changements tracés (traçabilité B2B)
```

---

## 🏭 Lundi Midi → Condor Ops Team (Picking & Livraison)

### 11h00 — Fatima (WhMgr Condor) voit le picking

```
👤 Fatima Zerhouni (WarehouseManager Condor)
🔐 PIN: 2121
📍 Entrepôt Condor, Oued Smar

URL: /condor/picking-tasks/

Nouveaux picking:
┌─────────────────────────────────────────────────────┐
│ 📦 TÂCHES DE PICKING ASSIGNÉES (2)                 │
├─────────────────────────────────────────────────────┤
│                                                      │
│ URGENT 🔴                                           │
│ ┌────────────────────────────────────────────────┐ │
│ │ PKG-0450: Ciment CEM-32 pour Alger (PO-0100)  │ │
│ │ Quantité: 500 tonnes                          │ │
│ │ Emplacement source: Zone A-12                 │ │
│ │ Statut: Ready for picking                     │ │
│ │ Assigné à: Yacine (Operator)                  │ │
│ │ Deadline: Aujourd'hui 17h                     │ │
│ │ [👁️ Détail] [✅ Début] [📍 Localiser]        │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ NORMAL                                             │
│ ┌────────────────────────────────────────────────┐ │
│ │ PKG-0451: Huile Olive pour Oran (PO-0101)     │ │
│ │ Quantité: 150 litres (contre-prop)             │ │
│ │ Emplacement source: Zone C-05                 │ │
│ │ Statut: Awaiting customer approval             │ │
│ │ Note: Attendre confirmation Oran avant picking│ │
│ │ [⏸️ En attente]                                │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
└─────────────────────────────────────────────────────┘

Fatima analyse:
• PKG-0450 OK, peut démarrer immédiatement
• PKG-0451 en freeze (attendre Oran)
• Workload aujourd'hui: Heavy (500T est du volume)
```

---

### 11h30 — Yacine (Operator) fait le Picking

```
👤 Yacine Krim (Operator Condor)
Device: Handheld scanner (WMS app mobile)
Task: PKG-0450 (500T Ciment pour Alger)

URL: /condor/picking/:taskId/

┌────────────────────────────────────────────────────┐
│ 📦 PICKING TASK #0450                             │
│ Lundi 10/03 — 11h45                               │
├────────────────────────────────────────────────────┤
│                                                    │
│ 🎯 Objectif:                                      │
│    Prélever 500T Ciment CEM-32 (Zone A-12)       │
│    → Staging area Quai 2 (pour Alger)            │
│                                                    │
│ 📍 Localisation:                                  │
│    Zone: A-12                                     │
│    Aisle: A                                       │
│    Rack: 12                                       │
│    Bin: A-12-03 (425T) + A-12-04 (125T)         │
│                                                    │
│ 📊 Stock avant: 847T                             │
│    À prélever: 500T                              │
│    Stock après: 347T                             │
│                                                    │
│ 🚚 Étapes:                                        │
│    1️⃣ Aller à A-12 (navigation guidée)           │
│    2️⃣ Scanner code-barre bin A-12-03             │
│    3️⃣ Prélever 425T (chariot/engin)              │
│    4️⃣ Apporter Staging Quai 2                    │
│    5️⃣ Déposer et scanner                         │
│    6️⃣ Revenir A-12 pour les 75T restants        │
│    7️⃣ Confirmer picking = 500T OK                │
│                                                    │
│ ⏱️ Temps estimé: 2h (grosse charge)              │
│                                                    │
│ [Démarrer picking] [Pause] [Besoin aide]         │
│                                                    │
└────────────────────────────────────────────────────┘

Yacine commence: "Ici Yacine, je vais au zone A-12"
│
├─ App guide: "🔴 Aller zone A-12. À 150m →"
├─ Yacine arrive A-12
├─ Scanner bin A-12-03 → ✅ Reconnu (425T ciment)
├─ Chariot élévateur → Charge 425T
├─ Transport Quai 2 (en cours GPS tracking)
├─ Dépôt Quai 2
├─ Scanner Quai 2 → ✅ Confirmé (425T reçus)
├─ Revenir A-12 pour 125T
├─ Scanner A-12-04 → ✅ Reconnu (125T)
├─ Transport Quai 2 (chargement supplémentaire)
├─ Dépôt final
├─ Total prélevé: 500T ✅
│
├─ Stock real-time updated:
│  ├─ Zone A-12: 847T → 347T
│  ├─ Quai 2 (staging): 500T Ciment CEM-32
│  └─ Task PKG-0450: COMPLETED ✅
│
└─ Notif Fatima: "✅ Picking PKG-0450 complété. Ciment prêt packing."

Temps réel: 11h45 → 13h45 (2h pile)
```

---

### 14h00 — Karim (Driver Condor) Charge & Livre

```
👤 Karim Boudjemaa (Driver Condor)
Device: Mobile app `/delivery/*` (même app que chauffeurs entrepôts)
Route: Condor → Alger (60km)

URL: /delivery/trip/

┌─────────────────────────────────────────────────────┐
│ 🚚 MA TOURNÉE CONDOR — Lundi 10/03                │
│ Karim Chauffeur                                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 🚗 Véhicule assigné:                              │
│    Marque: Renault (semi-remorque)               │
│    Immatriculation: ALG-4590-ZZ                  │
│    Capacité: 30T                                 │
│    Kilométrage départ: 156,420 km               │
│                                                     │
│ 📋 Stops à livrer (1):                           │
│    ┌──────────────────────────────────────────┐  │
│    │ STOP #1: Alger Construction              │  │
│    │ Adresse: Ain Naâja, Alger                │  │
│    │ Distance: 60 km                          │  │
│    │ ETA: 15:15 (75 min)                      │  │
│    │ Charge: 500T Ciment (17 palettes)        │  │
│    │ Contact: Karim Ben Ali (WhMgr)            │  │
│    │ Téléphone: +213 21 XXX XXXX              │  │
│    │ Déchargement estimé: 30 min              │  │
│    │ [👁️ Détail] [🗺️ Naviguer] [📞 Appeler]   │  │
│    └──────────────────────────────────────────┘  │
│                                                     │
│ ✅ PRÉ-DÉPART:                                    │
│    [✓] Inspection véhicule                      │  │
│    [✓] Stock marqué (palettes comptées)        │  │
│    [✓] Coordonnées client OK                   │  │
│    [✓] Conditions météo: OK                    │  │
│                                                     │
│ [GPS Activate] [Start delivery]                 │  │
│                                                     │
└─────────────────────────────────────────────────────┘

Karim clique: [Start delivery]
│
├─ GPS tracking démarre
├─ Condor ops voit: "Karim en route vers Alger (60km, ETA 15:15)"
├─ Alger WMS reçoit: "Driver Karim (Condor) en route, ETA 15:15"
│
│ 14h30 — Karim sur autoroute
│ └─ "👍 Tout va bien, sur ma route"
│
│ 15h10 — Karim arrive à Alger
│ └─ GPS détecte: "Arrivé chez Alger Construction"
│
│ 15h20 — Déchargement commence
│   • Karim et équipe Alger déchargent 17 palettes
│   • Scans des palettes (vérif quantité)
│   • Pas de cassure ✅
│
│ 15h50 — Déchargement complété
│ Écran Karim:
│ ┌────────────────────────────────────────┐
│ │ ✅ LIVRAISON ALGER COMPLÈTÉE           │
│ │                                        │
│ │ Produit: 500T Ciment CEM-32            │
│ │ Palettes: 17/17 reçues ✅              │
│ │ Dommages: Aucun ✅                     │
│ │                                        │
│ │ 📸 Preuve:                             │
│ │ [Prendre photo] ✓ Photo prise         │
│ │ [Signature client] ✓ Signé par Karim  │
│ │                                        │
│ │ [Confirmer livraison]                 │
│ └────────────────────────────────────────┘
│
│ Karim confirme → Système:
│
├─ Condor WMS:
│  ├─ PO-0100 statut: "delivered"
│  ├─ Fatima notifiée: "PO-0100 livrée à Alger ✅"
│  └─ Karim retour Condor (60km retour)
│
├─ Alger WMS:
│  ├─ Notif: "Livraison Condor reçue ✅"
│  ├─ Tarek (Operator) peut créer GRN immédiatement
│  ├─ QC Sara inspecte les palettes
│  └─ Stock Alger +500T Ciment
│
└─ Owner Dashboard:
   └─ "Condor revenue +1.25M (Alger livraison OK)"

Temps: 14h → 16h (2h total aller-retour + décharge)
```

---

## 📊 Mardi 11 Mars — Oran Répond à la Contre-Prop

### 9h00 — Oran CEO Accepte Proposition Condor

```
👤 Omar Samir (OpsDirector Oran) – reçoit notif lundi soir
WMS: Alger (attendez... Oran!) 

Wait, scenario error! Oran a un WMS propre? 
Vérifier: Oran = wh-oran-food (entrepôt Alger) vs WMS Oran indépendant?

Pour ce scénario: Oran = Entrepôt indépendant abonné (WMS propre URL: /oran/)

URL: /oran/incoming-po-responses/ (Oran a aussi WMS, reçoit PO)

Notif reçue Lundi 18h:
┌────────────────────────────────────────────────────┐
│ 📬 NOTIFICATION CONDOR                            │
│                                                    │
│ Condor propose contre-offre PO-0101:              │
│ • 150L maintenant                                 │
│ • 50L dans 5 jours                                │
│                                                    │
│ [📋 Voir la proposition] [✅ Accepter] [❌ Refuser]│
│                                                    │
└────────────────────────────────────────────────────┘

Mardi matin, Omar consulte:
URL: /oran/incoming-pos/PO-0101/response/

Détail proposition:
├─ Client: Condor Distribution
├─ Produit: Huile olive
├─ Proposition: 150L + 50L (5j après)
├─ Prix: Inchangé (3,200 DZD/L)
├─ Motif Condor: "Réappro prévue 15/03"
├─ Conditions: "Paiement 150L maintenant, reste crédité après livraison 50L"
│
├─ Analyse Oran:
│  ├─ Besoin: 200L urgence ✅ (150L couvre 75%)
│  ├─ Peut attendre 5j pour 50L ✅
│  ├─ Trésorerie: OK pour payer 150L maintenant
│  └─ Risque: Faible (Condor client régulier)
│
└─ Décision: ✅ ACCEPTER

Omar clique: [✅ Accepter proposition]

Résultat système:
│
├─ PO-0101 modifiée:
│  ├─ Status: "accepted_with_modification"
│  ├─ Quantité livraison 1: 150L (Mardi 11/03)
│  ├─ Quantité livraison 2: 50L (Dimanche 15/03)
│  ├─ Créé 2 PO separées au système (PKG-0101-A, PKG-0101-B)
│  └─ Paiement split: 480K (150L) + 160K (50L)
│
├─ Condor Ops reçoit notif:
│  ├─ "Oran accepte proposition!"
│  ├─ Nouveau picking: 150L Huile (immédiat)
│  ├─ Nouveau picking 2: 50L Huile (15/03)
│  └─ Fatima crée: PKG-0451-A (urgent), PKG-0451-B (report)
│
└─ Owner sees: +640K confirmed revenue Oran
```

---

## 💳 Mercredi 12 Mars — Condor Comptabilité & Facturation

### 11h00 — Naima (Comptable Condor) Crée les Factures

```
👤 Naima Kherroubi (Accountant Condor)
Role: Créer factures clients

URL: /condor/invoicing/

Factures à créer:

1️⃣ ALGER LIVRAISON COMPLÈTE (12/03)
┌──────────────────────────────────────┐
│ Facture: INV-COND-2026-001          │
│ Client: Alger Construction           │
│ Lié à: PO-0100                      │
│ Produit: 500T Ciment CEM-32         │
│ Prix unitaire: 2,500 DZD/T           │
│ Montant HT: 1,250,000 DZD            │
│ TVA (19%): 237,500 DZD               │
│ Montant TTC: 1,487,500 DZD           │
│ Condition paiement: Net 30 (11/04)   │
│ Statut: Envoyée à Alger              │
│ Numéro matricule fiscal: 24124214021 │
│ Date: 12/03/2026                     │
└──────────────────────────────────────┘

2️⃣ ORAN LIVRAISON PARTIELLE (12/03 - 150L)
┌──────────────────────────────────────┐
│ Facture: INV-COND-2026-002          │
│ Client: Oran Food                    │
│ Lié à: PO-0101 Part A                │
│ Produit: 150L Huile olive            │
│ Prix unitaire: 3,200 DZD/L           │
│ Montant HT: 480,000 DZD              │
│ TVA (19%): 91,200 DZD                │
│ Montant TTC: 571,200 DZD             │
│ Condition paiement: Net 30 (11/04)   │
│ Statut: Envoyée à Oran               │
│ Note: "Acompte pour 200L. Reste 50L  │
│        à livrer 15/03, facture 2"    │
│ Date: 12/03/2026                     │
└──────────────────────────────────────┘

2B️⃣ ORAN LIVRAISON RESTE (15/03 - 50L) — FUTUR
┌──────────────────────────────────────┐
│ Facture: INV-COND-2026-003 (Draft)   │
│ Client: Oran Food                    │
│ Lié à: PO-0101 Part B                │
│ Produit: 50L Huile olive             │
│ Prix unitaire: 3,200 DZD/L           │
│ Montant HT: 160,000 DZD              │
│ TVA (19%): 30,400 DZD                │
│ Montant TTC: 190,400 DZD             │
│ Statut: À créer le 15/03             │
│ Créé automatiquement à livraison      │
│ Paiement: Ajouter aux 150L après     │
│ Date: 15/03/2026                     │
└──────────────────────────────────────┘

TOTAL CONDOR CET WEEK (12-15 mars):
├─ Alger: 1.25M HT
├─ Oran Part 1: 480K HT
├─ Oran Part 2: 160K HT (15/03)
└─ TOTAL: 1.89M HT (2.256M TTC avec TVA)

Trésorerie CONDOR (Net 30):
├─ À encaisser: 1.89M HT
├─ Date échéance: 11/04 (Alger), 11/04 (Oran)
└─ Risque crédit: FAIBLE (clients réguliers)

Naima envoie factures → Systèmes Alger + Oran
│
├─ Alger Compta reçoit: INV-COND-2026-001
│  └─ 3-Way Match: PO-0100 ✓ GRN-5060 ✓ INV-COND-2026-001 ✓
│
└─ Oran Compta reçoit: INV-COND-2026-002
   └─ Attente GRN (en création) avant 3-Way Match
```

---

## 📈 Dimanche 15 Mars — Clôture Week & Monitoring Owner

### 15h00 — Condor Dashboard End-of-Week

```
URL: /condor/weekly-summary/

SYNTHÈSE SEMAINE CONDOR (10-14 Mars 2026):
┌──────────────────────────────────────────────────┐
│ 📊 BILAN ACTIVITÉ CONDOR (Lun-Ven)              │
├──────────────────────────────────────────────────┤
│                                                  │
│ 📥 PO REÇUES: 3                                │
│ ├─ Confirmées: 1 (Alger - PO-0100)             │
│ ├─ Modifiées: 1 (Oran - PO-0101, propositions)│
│ └─ Refusées: 1 (Constantine - PO-0102)         │
│                                                  │
│ 🚚 LIVRAISONS: 2 + 1 en cours                  │
│ ├─ Alger: 500T Ciment (complète) ✅            │
│ ├─ Oran: 150L Huile (partielle 1) ✅           │
│ └─ Oran: 50L Huile (dimanche 15/03) ⏳         │
│                                                  │
│ 💰 CHIFFRE D'AFFAIRES:                         │
│ ├─ Confirmé cette semaine: 1,730K HT          │
│ │  (Alger 1,250K + Oran 480K)                 │
│ ├─ À confirmer (si Oran 50L livré): +160K HT │
│ ├─ Total potentiel: 1,890K HT                 │
│ ├─ Estimation TTC (19% TVA): 2,256K DZD       │
│ └─ % du CA mensuel: 15% (vers 12,6M/mois)     │
│                                                  │
│ 📦 STOCK VARIATION:                            │
│ ├─ Ciment CEM-32: 847T → 347T (-500T)         │
│ ├─ Huile olive: 150L → 0L (-150L)             │
│ ├─ Acier FeE400: 0T (rupture, new appro 15/3)│
│ └─ Valorisation: 245M → 241M DZD (stock ↓)   │
│                                                  │
│ 👥 CLIENTS ACTIFS: 2/3                        │
│ ├─ Alger Construction: Commande confirmée ✅  │
│ ├─ Oran Food: Négociation réussie ⚖️          │
│ └─ Constantine Tech: Refusée, alternatives... │
│                                                  │
│ 🎯 PERFORMANCE:                               │
│ ├─ Taux confirmation: 33% (1/3)               │
│ ├─ Taux refus: 33% (1/3)                      │
│ ├─ Taux négociation réussie: 100% (1/1)       │
│ ├─ Délai picking: 2h (bon)                    │
│ ├─ Livraison on-time: 100% (0 retard)         │
│ └─ Qualité: 100% (pas de casse)               │
│                                                  │
│ 📋 TÂCHES RESTANTES:                          │
│ ├─ ⏳ Dimanche 15/03: Livrer 50L Huile Oran   │
│ ├─ ⏳ Mercredi 17/03: Recevoir 300L Huile     │
│ │   (réappro Dattes El Oued)                  │
│ └─ ⏳ Lundi 17/03: Créer facture 50L Oran     │
│                                                  │
└──────────────────────────────────────────────────┘

🎓 APPRENTISSAGES POUR CONDOR:
├─ ✅ Système multi-WMS fonctionne bien
├─ ✅ Négociation de PO possible & fluide
├─ ❌ Rupture stock (acier) → perte client potentiel
├─ ⚠️ Constantine recherchera alternative
└─ 📝 À améliorer: Prévoir mieux les appros
```

### 16h00 — Owner (Yacine) Voit le CA Condor

```
URL: /owner/monitoring/

👤 Yacine Hadj-Ali (PlatformOwner)

┌─────────────────────────────────────────────────────┐
│ 👑 MONITORING PLATEFORME                          │
│ Dimanche 15 Mars 2026 — Fin de semaine            │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📊 ABONNÉS ACTIFS (9):                           │
│ ┌─────────────────────────────────────────────┐   │
│ │ Condor Distribution          │ 1.89M HT    │   │
│ │ (Fournisseur Abonné)         │ +630K/j     │   │
│ ├─────────────────────────────────────────────┤   │
│ │ Alger Construction           │ 2.34M HT    │   │
│ │ (Entrepôt)                   │ +780K/j     │   │
│ ├─────────────────────────────────────────────┤   │
│ │ Oran Food Distribution       │ 1.50M HT    │   │
│ │ (Entrepôt)                   │ +500K/j     │   │
│ ├─────────────────────────────────────────────┤   │
│ │ Constantine Tech             │ 890K HT     │   │
│ │ (Entrepôt)                   │ +300K/j     │   │
│ ├─────────────────────────────────────────────┤   │
│ │ Agro Sahel Distribution      │ 1.27M HT    │   │
│ │ (Fournisseur Abonné)         │ +420K/j     │   │
│ ├─ ... (4 autres petits abonnés)              │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ 💰 SEMAINE CONDOR (10-15 Mars):                  │
│    Plateforme gagne:                              │
│    ├─ Condor paie abonnement: 35K DZD/mois       │
│    │  (Plan PRO: 35K/10 jours = 3,500/j)         │
│    ├─ Condor génère CA: 1.89M HT                 │
│    │  → 2% commission Jawda = 37.8K HT           │
│    └─ Total semaine Condor: ~40K gain            │
│                                                     │
│ 📈 PLATEFORME GLOBALE:                          │
│    ├─ MRR (Monthly Recurring): 485K DZD          │
│    │  (9 abonnés × tarif moyen)                   │
│    ├─ Transaction fees (GMV 2% cut): ~180K/mois │
│    ├─ TOTAL MENSUEL: ~665K DZD                   │
│    └─ Growth: +15% vs mars (Condor nouveau)      │
│                                                     │
│ 🎯 INSIGHTS:                                     │
│    ✅ Condor test case réussi                   │
│    ✅ Multi-WMS isolation fonctionne             │
│    ✅ Négociation PO crée valeur ajoutée        │
│    ⚠️ Constantine churn risk (refus PO)         │
│    → Proposer solution alternative                │
│                                                     │
└─────────────────────────────────────────────────────┘

Yacine note dans son CRM:
• "Condor onboarding réussi, multi-WMS v3.0 stable ✓"
• "Prochaines targets: Tunis Express, Setif Logistics"
• "Refactor réussi, architecture scalable"
```

---

## 🎓 Résumé Scénario Condor

### Ce qui a été démontré:

| Aspect | Détail | ✅ Status |
|--------|--------|:---:|
| **Multi-WMS** | Condor a son WMS propre indépendant | ✅ |
| **Incoming POs** | Dashboard centralisé pour voir TOUS les PO | ✅ |
| **Confirmation** | Condor confirme rapidement (Alger) | ✅ |
| **Modification** | Condor propose contre-offre (Oran) | ✅ |
| **Refus** | Condor refuse + alternatives (Constantine) | ✅ |
| **Stock** | Vérif stock avant engagement | ✅ |
| **Picking** | Picking task créée, exécutée | ✅ |
| **Livraison** | Driver Condor livre en cross-tenant | ✅ |
| **Facturation** | Factures Condor indépendantes | ✅ |
| **Isolation** | Données Condor jamais croisées avec Alger | ✅ |
| **Audit trail** | Tous les changements loggés | ✅ |
| **Commercial** | Négociation flexible (N-to-N) | ✅ |

### Bénéfices Architecturaux:

```
AVANT (v2.0)                      APRÈS (v3.0)
─────────────────────             ─────────────────────
Condor = Portail léger            Condor = WMS complet
Pas d'autonomie stock             Stock propre géré
Pas de picking/packing            Picking/packing natif
Pas de facturation indépendante    Factures clients propres
Limité à 3-4 PO max               Scalable N clients
Manual tracking PO                 Dashboard centralisé
Pas de négociation                Contre-propositions fluides
Fournisseur = Service limité      Fournisseur = Client égal
```

---

## 📚 Intégration dans la Documentation v3.0

Ce scénario devient la **section "Real-World Example"** de:
1. `01-ARCHITECTURE-MULTIWMS-OVERVIEW.md` ✅
2. `02-CONDOR-SCENARIO-DETAILED.md` ← (ce fichier)
3. `03-IMPLEMENTATION-ROADMAP.md` (créer après)
4. `04-CONDOR-TECHNICAL-SPECS.md` (créer après)

