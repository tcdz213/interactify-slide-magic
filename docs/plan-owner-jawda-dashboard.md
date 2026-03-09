# Plan Complet — Dashboard Fondateur Jawda (Plateforme SaaS)

## 1. Vision & Objectif

La plateforme **Jawda** est un SaaS multi-tenant. Le **fondateur** (PlatformOwner) vend des abonnements à deux types de clients :
- **Entrepôts** — accèdent au WMS complet (stock, commandes, livraisons, comptabilité)
- **Fournisseurs** — accèdent au portail fournisseur (catalogue, commandes reçues, facturation)

> ⚠️ Le PlatformOwner ne gère PAS les opérations internes des abonnés. Il gère la **plateforme elle-même** : abonnements, revenus, onboarding, support.

---

## 2. Authentification & Accès

| Élément | Détail |
|---------|--------|
| Rôle | `PlatformOwner` (RBAC niveau 0) |
| Route login | `/owner/login` — PIN sécurisé |
| Layout | `OwnerLayout` — sidebar SaaS dédiée |
| Route prefix | `/owner/*` |
| Session | `localStorage` clé `owner-auth` (mock phase 1) |
| Redirect | Non-authentifié → `/owner/login` |

### Flow d'authentification
```
/owner/* → OwnerAuthGuard vérifie session
  ├─ ✅ Authentifié → Affiche OwnerLayout + page
  └─ ❌ Non authentifié → Redirect /owner/login
```

---

## 3. Pages — Spécifications Complètes

### 3.1 Dashboard SaaS (`/owner`) — Page d'accueil

**Objectif** : Vue d'ensemble instantanée de la santé financière et opérationnelle de la plateforme.

#### KPI Cards (ligne 1 — 4 cartes)
| KPI | Source | Format | Seuil d'alerte |
|-----|--------|--------|----------------|
| MRR | Somme `monthlyFee` des abonnés actifs | `XXX,XXX DZD` | Croissance < 0% → rouge |
| Abonnés actifs | Count status=active/trial | Nombre | — |
| Nouveaux ce mois | Count startDate dans le mois courant | Nombre | — |
| Churn | % abonnés résiliés/suspendus ce mois | `X.X%` | > 5% → rouge, > 3% → orange |

#### KPI Cards (ligne 2 — 6 mini-cartes)
| KPI | Détail |
|-----|--------|
| Entrepôts | Nombre total d'entrepôts abonnés |
| Fournisseurs | Nombre total de fournisseurs abonnés |
| Commandes totales | Somme `totalOrders` de tous les abonnés |
| GMV plateforme | Somme `totalRevenue` de tous les abonnés |
| Tickets ouverts | Count tickets status=open/in_progress |
| Trials actifs | Count status=trial |

#### Graphiques
| Graphique | Type | Données | Interaction |
|-----------|------|---------|-------------|
| Évolution MRR | AreaChart | 7 mois, 3 lignes (total, entrepôts, fournisseurs) | Tooltip au survol |
| Répartition par plan | PieChart donut | Enterprise/Pro/Standard/Trial | Légende cliquable |
| Abonnés par ville | BarChart horizontal | Groupé par ville | Tooltip |

#### Alertes critiques
- Affichées en haut si `severity === "critical"`
- Style : bordure rouge, icône AlertTriangle
- Lien contextuel vers la page concernée

#### Accès rapide
- 6 boutons de navigation : Abonnements, Facturation, Onboarding, Monitoring, Support, Paramètres
- Click → `navigate("/owner/{page}")`

#### Actions utilisateur sur cette page
| Action | Comportement |
|--------|-------------|
| Consulter KPIs | Lecture seule, rafraîchissement au chargement |
| Survoler graphique | Tooltip avec valeur exacte |
| Cliquer alerte critique | Navigation vers module concerné |
| Cliquer accès rapide | Navigation vers page cible |

---

### 3.2 Gestion des abonnements (`/owner/subscriptions`)

**Objectif** : CRUD complet sur les abonnés de la plateforme.

#### Vue principale — Tableau
| Colonne | Type | Tri | Filtre |
|---------|------|-----|--------|
| Abonné | Texte + badge type | ✅ alpha | Recherche texte |
| Type | Badge (Entrepôt/Fournisseur) | ✅ | Select |
| Plan | Badge couleur (Trial/Standard/Pro/Enterprise) | ✅ | Select |
| Statut | Badge (Actif/Trial/Suspendu/Résilié/En attente) | ✅ | Select |
| Ville/Wilaya | Texte | ✅ alpha | Select |
| Redevance mensuelle | Montant DZD | ✅ num | — |
| Utilisateurs | `X / max` avec progress bar | ✅ num | — |
| Dernière activité | Date relative | ✅ date | — |
| Actions | Menu dropdown | — | — |

#### Filtres disponibles
- **Type** : Tous / Entrepôt / Fournisseur
- **Plan** : Tous / Trial / Standard / Pro / Enterprise
- **Statut** : Tous / Actif / Trial / Suspendu / Résilié / En attente
- **Recherche** : texte libre sur nom, ville, contact

#### Actions par abonné (dropdown menu)
| Action | Condition | Comportement | Confirmation |
|--------|-----------|-------------|-------------|
| 👁️ Voir détail | Toujours | Ouvre drawer/modal avec fiche complète | Non |
| ⬆️ Upgrader plan | status=active | Dialog choix de plan supérieur → mise à jour | Oui |
| ⬇️ Downgrader plan | status=active, plan≠trial | Dialog choix de plan inférieur → mise à jour | Oui |
| ⏸️ Suspendre | status=active | Passe status=suspended, accès coupé | Oui — ConfirmDialog |
| ▶️ Réactiver | status=suspended | Passe status=active | Oui |
| ❌ Résilier | status≠cancelled | Passe status=cancelled, fin définitive | Oui — ConfirmDialog danger |
| 📧 Contacter | Toujours | Ouvre email client avec template | Non |

#### Drawer détail abonné
| Section | Contenu |
|---------|---------|
| En-tête | Nom, type (badge), plan (badge), statut |
| Contact | Nom, email, téléphone |
| Localisation | Ville, wilaya, secteur |
| Abonnement | Plan, date début, renouvellement, redevance |
| Utilisation | Users (X/max), entrepôts (X/max), commandes, CA |
| Historique | Timeline des changements de plan et statut |

#### KPI Cards en haut de page
| KPI | Calcul |
|-----|--------|
| Total abonnés | Count all |
| Actifs | Count active |
| MRR | Somme monthlyFee actifs |
| En trial | Count trial |

---

### 3.3 Facturation plateforme (`/owner/billing`)

**Objectif** : Suivi des factures d'abonnement et des paiements.

#### KPI Cards
| KPI | Calcul | Style |
|-----|--------|-------|
| Total facturé | Somme montants | — |
| Payé | Somme status=paid | Vert |
| En attente | Somme status=pending | Orange |
| Impayé / Retard | Somme status=overdue | Rouge |

#### Tableau des factures
| Colonne | Type |
|---------|------|
| N° Facture | ID |
| Abonné | Nom + lien |
| Période | Mois/Année |
| Montant | DZD |
| Statut | Badge (Payée ✅ / En attente ⏳ / Impayée 🔴 / Annulée) |
| Date émission | Date |
| Date échéance | Date |
| Date paiement | Date ou "—" |
| Actions | Menu |

#### Filtres
- **Statut** : Tous / Payée / En attente / Impayée / Annulée
- **Période** : Sélecteur mois
- **Recherche** : nom abonné

#### Actions par facture
| Action | Condition | Comportement |
|--------|-----------|-------------|
| ✅ Marquer payée | status=pending/overdue | Change status → paid, set paidAt | 
| 📧 Relancer | status=overdue | Simule envoi rappel (toast) |
| 🗑️ Annuler | status≠paid | Change status → cancelled |
| 📄 Voir PDF | Toujours | Ouvre aperçu facture |

---

### 3.4 Onboarding (`/owner/onboarding`)

**Objectif** : Valider ou refuser les demandes d'inscription de nouveaux abonnés.

#### KPI Cards
| KPI | Calcul |
|-----|--------|
| En attente | Count status=pending |
| Approuvées | Count status=approved |
| Refusées | Count status=rejected |
| Total demandes | Count all |

#### Tableau des demandes
| Colonne | Type |
|---------|------|
| Entreprise | Nom |
| Type | Entrepôt / Fournisseur |
| Contact | Nom + email |
| Ville/Wilaya | Texte |
| Secteur | Texte |
| Plan demandé | Badge |
| Date demande | Date |
| Statut | Badge |
| Actions | Menu |

#### Actions par demande
| Action | Condition | Comportement |
|--------|-----------|-------------|
| ✅ Approuver | status=pending | Dialog confirmation → change status=approved, crée abonné | 
| ❌ Refuser | status=pending | Dialog avec motif → change status=rejected |
| 👁️ Voir détail | Toujours | Drawer avec notes, historique |
| 📧 Contacter | Toujours | Email au demandeur |

#### Workflow complet d'onboarding
```
Demande reçue (pending)
  ├─ Owner clique "Approuver"
  │   ├─ Dialog confirmation avec résumé
  │   ├─ Statut → approved
  │   ├─ Création automatique du Subscriber dans la liste
  │   ├─ Envoi email de bienvenue (simulé — toast)
  │   └─ Redirect vers /owner/subscriptions
  └─ Owner clique "Refuser"
      ├─ Dialog avec champ motif obligatoire
      ├─ Statut → rejected
      └─ Envoi email de refus (simulé — toast)
```

---

### 3.5 Monitoring abonnés (`/owner/monitoring`)

**Objectif** : Surveillance en lecture seule de l'activité de chaque abonné.

#### Vue — Grille de cartes
Chaque abonné actif a une carte avec :
| Élément | Détail |
|---------|--------|
| En-tête | Nom, ville, badge plan |
| Statut | Pastille couleur (vert=actif, orange=trial, rouge=suspendu) |
| KPI 1 | Commandes totales |
| KPI 2 | Chiffre d'affaires |
| KPI 3 | Utilisateurs actifs / max |
| KPI 4 | Entrepôts / max (si type entrepôt) |
| Dernière activité | Date relative |
| Barre utilisation | Progress bar users/maxUsers |

#### Filtres
- Type : Tous / Entrepôt / Fournisseur
- Recherche texte

#### Actions
| Action | Comportement |
|--------|-------------|
| Cliquer sur carte | Ouvre drawer détail complet |
| Filtrer | Filtre les cartes affichées |

> 🔒 Lecture seule uniquement — pas de modification depuis cette page.

---

### 3.6 Support (`/owner/support`)

**Objectif** : Gérer les tickets de support des abonnés.

#### KPI Cards
| KPI | Calcul | Style |
|-----|--------|-------|
| Ouverts | Count open | Orange |
| En cours | Count in_progress | Bleu |
| Résolus | Count resolved | Vert |
| Total | Count all | — |

#### Tableau des tickets
| Colonne | Type |
|---------|------|
| N° Ticket | ID |
| Abonné | Nom |
| Sujet | Texte |
| Catégorie | Badge |
| Priorité | Badge (Critique 🔴 / Haute 🟠 / Moyenne 🟡 / Basse 🟢) |
| Statut | Badge (Ouvert / En cours / Résolu / Fermé) |
| Créé le | Date |
| Mis à jour | Date |
| Actions | Menu |

#### Actions par ticket
| Action | Condition | Comportement |
|--------|-----------|-------------|
| 🔄 Prendre en charge | status=open | Change → in_progress |
| ✅ Résoudre | status=open/in_progress | Change → resolved |
| 🔒 Fermer | status=resolved | Change → closed |
| 👁️ Voir détail | Toujours | Drawer avec historique |

#### Filtres
- Statut : Tous / Ouvert / En cours / Résolu / Fermé
- Priorité : Toutes / Critique / Haute / Moyenne / Basse
- Recherche texte

---

### 3.7 Paramètres plateforme (`/owner/settings`)

**Objectif** : Configuration globale de la plateforme SaaS.

#### Sections (tabs ou accordéons)

##### 3.7.1 Plans d'abonnement
Tableau éditable des plans :
| Colonne | Contenu |
|---------|---------|
| Plan | Trial / Standard / Pro / Enterprise |
| Prix mensuel (DZD) | Éditable |
| Max utilisateurs | Éditable |
| Max entrepôts | Éditable |
| Fonctionnalités | Liste checkbox |
| Abonnés actuels | Count (lecture seule) |

**Actions** : Modifier prix, modifier limites, activer/désactiver un plan.

##### 3.7.2 Configuration générale
| Paramètre | Valeur actuelle | Éditable |
|-----------|----------------|----------|
| Devise | DZD | Select |
| Langue par défaut | Français | Select |
| Fuseau horaire | Africa/Algiers | Select |
| Email de contact plateforme | yacine@jawda.dz | Input |
| Délai de grâce (jours) | 7 | Input number |

##### 3.7.3 Limites & Quotas
Tableau des limites par plan (éditable) — users, entrepôts, stockage, API calls.

##### 3.7.4 Logs & Audit
| Colonne | Type |
|---------|------|
| Date/Heure | Timestamp |
| Acteur | Owner ou Système |
| Action | Texte (ex: "Plan upgraded for SUB-E001") |
| Module | Badge |

---

## 4. Navigation — Sidebar OwnerLayout

```
👑 Jawda SaaS
─────────────────
📊 Dashboard         → /owner
👥 Abonnements       → /owner/subscriptions
💳 Facturation       → /owner/billing
🚀 Onboarding        → /owner/onboarding
📡 Monitoring        → /owner/monitoring
🎫 Support           → /owner/support
⚙️ Paramètres        → /owner/settings
─────────────────
🚪 Déconnexion       → clear session → /owner/login
```

---

## 5. Architecture technique

```
src/owner/
├── components/
│   ├── OwnerLayout.tsx          # Sidebar + Outlet
│   ├── OwnerAuthGuard.tsx       # Vérifie session → redirect login
│   └── ...                      # Composants réutilisables (KpiCard, charts)
├── screens/
│   ├── OwnerLoginScreen.tsx     # PIN login
│   ├── OwnerDashboardScreen.tsx # KPI + charts + alertes
│   ├── OwnerSubscriptionsScreen.tsx  # Table CRUD abonnés
│   ├── OwnerBillingScreen.tsx        # Factures + paiements
│   ├── OwnerOnboardingScreen.tsx     # Validation demandes
│   ├── OwnerMonitoringScreen.tsx     # Cartes monitoring
│   ├── OwnerSupportScreen.tsx        # Tickets support
│   └── OwnerSettingsScreen.tsx       # Config plateforme
├── data/
│   └── mockOwnerData.ts         # Toutes les données mock
├── types/
│   └── owner.ts                 # Interfaces TypeScript
└── hooks/
    └── useOwnerData.ts          # Hook données (futur API)
```

### Routes (`src/app/routes/ownerRoutes.tsx`)
```tsx
<Route path="/owner/login" element={<OwnerLoginScreen />} />
<Route element={<OwnerAuthGuard />}>
  <Route path="/owner" element={<OwnerLayout />}>
    <Route index element={<OwnerDashboardScreen />} />
    <Route path="subscriptions" element={<OwnerSubscriptionsScreen />} />
    <Route path="billing" element={<OwnerBillingScreen />} />
    <Route path="onboarding" element={<OwnerOnboardingScreen />} />
    <Route path="monitoring" element={<OwnerMonitoringScreen />} />
    <Route path="support" element={<OwnerSupportScreen />} />
    <Route path="settings" element={<OwnerSettingsScreen />} />
  </Route>
</Route>
```

---

## 6. Données Mock — Résumé

| Entité | Quantité | Détail |
|--------|----------|--------|
| Entrepôts | 8 | Blida, Boumerdès, Tizi Ouzou, BBA, Annaba, Adrar, Tamanrasset, Bechar |
| Fournisseurs | 5 | Alger, Sétif, Ghardaia, Constantine, El Oued |
| Factures | 10 | Payées, en attente, impayées |
| Demandes onboarding | 4 | 3 pending, 1 approved |
| Tickets support | 5 | Priorités variées |
| Alertes | 5 | 2 critical, 2 warning, 1 info |
| MRR historique | 7 mois | Sep 2025 → Mar 2026 |

---

## 7. Flux utilisateur complets (User Flows)

### Flow 1 : Connexion Owner
```
1. Utilisateur accède à /owner
2. OwnerAuthGuard détecte pas de session
3. Redirect → /owner/login
4. Saisie PIN → validation
5. Session stockée → redirect /owner (dashboard)
```

### Flow 2 : Consulter la santé de la plateforme
```
1. Dashboard /owner — lecture KPIs (MRR, abonnés, churn)
2. Survol graphique MRR → tooltip détaillé
3. Vérification alertes critiques en haut
4. Si alerte → clic → navigation vers module concerné
```

### Flow 3 : Onboarder un nouvel abonné
```
1. Alerte "3 demandes en attente" sur dashboard
2. Clic → /owner/onboarding
3. Revue des demandes pending
4. Clic "Approuver" sur une demande
5. Dialog confirmation avec résumé
6. Confirmation → statut=approved
7. Abonné créé automatiquement dans la liste
8. Toast "Abonné créé avec succès"
9. Navigation possible vers /owner/subscriptions
```

### Flow 4 : Suspendre un abonné impayé
```
1. Alerte "Bechar — Abonnement impayé" sur dashboard
2. Clic → /owner/subscriptions
3. Filtre statut=suspendu ou recherche "Bechar"
4. Menu actions → "Suspendre"
5. ConfirmDialog "Êtes-vous sûr ?"
6. Confirmation → status=suspended
7. Toast "Abonné suspendu"
```

### Flow 5 : Gérer la facturation
```
1. /owner/billing — voir KPIs (payé, en attente, impayé)
2. Filtre "Impayée" → voir factures overdue
3. Action "Relancer" → toast "Rappel envoyé"
4. Ou action "Marquer payée" → status=paid
```

### Flow 6 : Upgrader un abonné
```
1. /owner/subscriptions → trouver l'abonné
2. Menu actions → "Upgrader plan"
3. Dialog avec sélection nouveau plan
4. Confirmation → plan mis à jour
5. Redevance mensuelle ajustée
6. Toast "Plan mis à jour"
```

### Flow 7 : Résoudre un ticket support
```
1. /owner/support → voir tickets ouverts
2. Clic "Prendre en charge" → status=in_progress
3. Résolution du problème (hors plateforme)
4. Clic "Résoudre" → status=resolved
5. Optionnel : "Fermer" → status=closed
```

### Flow 8 : Modifier les plans d'abonnement
```
1. /owner/settings → section "Plans d'abonnement"
2. Modifier le prix du plan Standard
3. Modifier les limites utilisateurs du plan Pro
4. Sauvegarde → toast "Paramètres sauvegardés"
5. Les nouveaux abonnés verront les nouveaux tarifs
```

### Flow 9 : Monitoring d'un abonné spécifique
```
1. /owner/monitoring → grille de cartes
2. Filtre "Entrepôt" + recherche "Annaba"
3. Carte affiche KPIs (commandes, CA, users)
4. Clic → drawer détail complet
5. Vérification utilisation vs limites
6. Si proche limite → potentiel upsell
```

---

## 8. Phases d'implémentation

| Phase | Contenu | Statut |
|-------|---------|--------|
| ✅ 1 | Layout + Auth + Dashboard KPI SaaS | Fait |
| ✅ 2 | Gestion des abonnements (table + filtres + actions) | Fait |
| ✅ 3 | Facturation (factures + KPI + actions) | Fait |
| ✅ 4 | Onboarding (demandes + workflow approbation) | Fait |
| ✅ 5 | Monitoring (cartes abonnés + filtres) | Fait |
| ✅ 6 | Support (tickets + actions) | Fait |
| ✅ 7 | Paramètres (plans + config + logs) | Fait |
| 🔜 8 | CRUD dialogs (créer abonné, upgrade, suspend avec dialogs) | À faire |
| 🔜 9 | Export PDF/CSV sur factures et abonnés | À faire |
| 🔜 10 | i18n (fr/en/ar) pour toutes les pages Owner | À faire |

---

## 9. Différences clés : Owner SaaS vs Admin Entrepôt

| Aspect | Admin Entrepôt (CEO) | Owner SaaS (Fondateur) |
|--------|----------------------|------------------------|
| **Scope** | Son entreprise / ses entrepôts | Toute la plateforme |
| **Finance** | CA ventes, marges, P&L entreprise | MRR, ARPU, churn, revenus abonnements |
| **Utilisateurs** | Staff de son entreprise | Tous les abonnés (Entrepôts + Fournisseurs) |
| **Opérations** | Gestion stock, commandes, livraisons | Monitoring agrégé (lecture seule) |
| **Objectif** | Gérer son business | Gérer la plateforme & maximiser les abonnements |
| **Actions** | CRUD sur données métier | CRUD sur abonnements, plans, facturation |
