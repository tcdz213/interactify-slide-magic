# 🧪 Tests — Convention & Structure

## Organisation

Tous les fichiers de test sont centralisés dans `src/test/`. Aucun test ne doit être placé à côté des composants ou dans d'autres dossiers.

```
src/test/
├── setup.ts                          # Configuration globale (jest-dom, i18n)
├── test-utils.tsx                    # Render custom avec providers (Auth, WMS, Router)
├── README.md                         # Ce fichier
│
├── # ── Tests unitaires (libs/engines) ──
├── credit-check.test.ts
├── export-utils.test.ts
├── fifo-engine.test.ts
├── fx-engine.test.ts
├── optimistic-lock.test.ts
├── pmp-engine.test.ts
├── qty-anomaly-detector.test.ts
├── rbac.test.ts
├── three-way-match.test.ts
├── transfer-engine.test.ts
├── unit-conversion.test.ts
│
├── # ── Tests hooks ──
├── use-pagination.test.ts
│
├── # ── Tests composants/pages ──
├── cycle-count-page.test.tsx
├── data-table-pagination.test.tsx
├── grn-page.test.tsx
├── orders-page.test.tsx
├── payments-page.test.tsx
├── purchase-orders-page.test.tsx
├── status-badge.test.tsx
├── warehouse-scope-banner.test.tsx
│
├── # ── Tests données ──
├── mock-data.test.ts
│
├── # ── Tests phases (plan 90 jours) ──
├── phase3-purchase-cycle.test.ts
├── phase3-purchase-cycle-3-11-19.test.ts
├── phase4-stock-management.test.ts
├── phase5-transfers.test.ts
├── phase6-sales.test.ts
├── phase8-returns-quality.test.ts
├── phase9-portal-mobile.test.ts
├── phase11-bi-reporting-export.test.ts
├── phase12-security-audit-governance.test.ts
├── phase13-load-edge-closing.test.ts
│
├── # ── Tests transverses ──
├── fix-plan-verification.test.ts
└── i18n-language-tests.test.ts
```

## Convention de nommage

| Règle | Exemple |
|---|---|
| **kebab-case** pour tous les fichiers | `credit-check.test.ts` |
| Suffixe `.test.ts` pour les tests purs TS | `rbac.test.ts` |
| Suffixe `.test.tsx` pour les tests avec JSX | `status-badge.test.tsx` |
| Préfixe `phase{N}-` pour les tests du plan 90 jours | `phase5-transfers.test.ts` |

## Écrire un test

### Test unitaire (lib/engine)

```ts
import { describe, it, expect } from "vitest";
import { maFonction } from "@/lib/monModule";

describe("maFonction", () => {
  it("retourne le résultat attendu", () => {
    expect(maFonction(input)).toBe(expected);
  });
});
```

### Test de composant/page

```tsx
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/test/test-utils";       // ⬅ Render custom avec providers
import MonComposant from "@/components/MonComposant";

describe("MonComposant", () => {
  it("affiche le titre", () => {
    render(<MonComposant />);
    expect(screen.getByRole("heading", { name: /titre/i })).toBeInTheDocument();
  });
});
```

> **Note** : `@/test/test-utils` wraps le rendu avec `BrowserRouter`, `AuthProvider`, `WMSDataProvider` et `FinancialTrackingProvider`. L'i18n est initialisé globalement dans `setup.ts`.

## Lancer les tests

```bash
pnpm test          # ou npx vitest run
```
