# 🤝 Contributing Guide — Jawda ERP/WMS

> **Last updated:** 2026-03-08

---

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build:** Vite + SWC
- **Styling:** Tailwind CSS + HSL design tokens
- **Components:** shadcn/ui (Radix primitives)
- **Charts:** Recharts
- **Animations:** Framer Motion
- **i18n:** i18next (FR/EN/AR)
- **Testing:** Vitest + Testing Library
- **State:** React Context + Zustand (pricing store)

---

## Folder Structure

```
src/
├── app/           # App shell, routes, providers, guards
├── features/      # Domain modules (dashboard, wms, sales, etc.)
├── shared/        # Cross-cutting components, hooks, utils
├── components/ui/ # shadcn/ui primitives
├── layouts/       # Layout shells (Admin, Mobile, Delivery, Portal)
├── lib/           # Business logic engines
├── data/          # Mock data (temporary)
├── i18n/          # Translations (fr.json, en.json, ar.json)
├── store/         # Zustand stores
└── test/          # Test setup & integration tests
```

---

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Page | `{Name}Page.tsx` | `GrnPage.tsx` |
| Screen (mobile) | `{Name}Screen.tsx` | `DriverLoginScreen.tsx` |
| Dialog | `{Name}Dialog.tsx` | `DeleteUserDialog.tsx` |
| Drawer | `{Name}Drawer.tsx` | `OrderDetailDrawer.tsx` |
| Hook | `use{Name}.ts` | `usePagination.ts` |
| Test | `{name}.test.ts(x)` | `fifoEngine.test.ts` |
| Types | `{name}.types.ts` | `pricing.types.ts` |

---

## Development Workflow

### 1. Before Starting

- Read relevant docs in `docs/`
- Check `docs/plans/` for ongoing plans
- Review `docs/COMPONENT_LIBRARY.md` for reusable components

### 2. Writing Code

- **Use design tokens** — never hardcode colors (`text-white`, `bg-black` → use `text-foreground`, `bg-background`)
- **Use shared components** — `DataTable`, `PageHeader`, `FilterBar`, `FormDialog`, etc.
- **All strings must be i18n-ready** — use `t("key")` from `useTranslation()`
- **Add translations** to all 3 locales: `fr.json`, `en.json`, `ar.json`
- **Business logic in `src/lib/`** — keep UI and logic separated
- **Small, focused components** — one responsibility per file

### 3. Testing

Run tests:
```bash
npx vitest run           # All tests
npx vitest run src/lib   # Engine tests only
npx vitest --watch       # Watch mode
```

Test guidelines:
- Business engines: unit tests in `*.test.ts` alongside the engine
- Components: `*.test.tsx` with Testing Library
- Minimum: test happy path + edge cases + error states
- Target: 70%+ coverage on critical paths

### 4. Performance

- Use `React.memo` for expensive chart/data components
- Use `VirtualDataTable` for 1000+ row datasets
- Lazy-load routes with `React.lazy()`
- Check bundle size: `rollup-plugin-visualizer` generates `dist/bundle-stats.html`

---

## PR Checklist

- [ ] No hardcoded colors (use design tokens)
- [ ] All user-facing strings use i18n
- [ ] New translations added to FR, EN, AR
- [ ] Tests pass (`npx vitest run`)
- [ ] No TypeScript errors
- [ ] New components documented in `COMPONENT_LIBRARY.md`
- [ ] Follows naming conventions

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/index.css` | Design tokens (HSL variables) |
| `tailwind.config.ts` | Tailwind theme extension |
| `src/app/routes/adminRoutes.tsx` | All admin route definitions |
| `src/lib/rbac.ts` | Role-based access control engine |
| `src/contexts/AuthContext.tsx` | Authentication state |
| `src/contexts/WMSDataContext.tsx` | Global WMS data provider |
| `docs/plans/I18N-TRANSLATION-PLAN.md` | Translation progress |
| `docs/plans/UI-ARCHITECTURE-IMPROVEMENT-PLAN.md` | Architecture plan |
