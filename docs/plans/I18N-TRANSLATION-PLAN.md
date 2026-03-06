# 🌐 Plan de Traduction i18n — Jawda ERP/WMS

> **Objectif** : Internationaliser toutes les pages restantes (FR / EN / AR).
> **Date** : 2026-03-06
> **Langues** : Français (fr — défaut), English (en), العربية (ar — RTL)

---

## 📊 État actuel

### ✅ Pages déjà i18n (11 pages)
| # | Page | Clé i18n |
|---|------|----------|
| 1 | `Dashboard.tsx` | `dashboard.*` |
| 2 | `wms/ProductsPage.tsx` | `productPage.*`, `products.*` |
| 3 | `wms/VendorsPage.tsx` | `vendors.*` |
| 4 | `wms/WarehousesPage.tsx` | `warehouses.*` |
| 5 | `wms/LocationsPage.tsx` | `locations.*` |
| 6 | `wms/BarcodesPage.tsx` | `barcodes.*` |
| 7 | `wms/CarriersPage.tsx` | `carriers.*` |
| 8 | `wms/PaymentTermsPage.tsx` | `paymentTermsPage.*` |
| 9 | `wms/QualityControlPage.tsx` | `qc.*` |
| 10 | `settings/CurrencyRatesPage.tsx` | inline |
| 11 | `settings/TaxConfigPage.tsx` | inline |

### ✅ Composants déjà i18n (5)
| # | Composant | Clé i18n |
|---|-----------|----------|
| 1 | `modules/products/ProductTable.tsx` | `table.*` |
| 2 | `modules/products/ProductFilterBar.tsx` | `productPage.*` |
| 3 | `modules/products/ProductKPICards.tsx` | `productPage.*` |
| 4 | `DataTablePagination.tsx` | `pagination.*` |
| 5 | `ExportDialog.tsx` | `export.*` |

---

## 🔴 Pages à traduire (55 pages)

### Phase 1 — WMS Core (Priority: 🔴 Haute)
| ID | Fichier | Namespace proposé | Status |
|----|---------|-------------------|--------|
| T1.01 | `wms/PurchaseOrdersPage.tsx` | `purchaseOrders` | ✅ |
| T1.02 | `wms/GrnPage.test.tsx` → `wms/GrnPage.tsx` (non trouvé, skip) | — | ⏭️ |
| T1.03 | `wms/CycleCountPage.tsx` | `cycleCount` | ✅ |
| T1.04 | `wms/StockAdjustmentsPage.tsx` | `stockAdjustments` | ✅ |
| T1.05 | `wms/StockTransfersPage.tsx` | `stockTransfers` | ✅ |
| T1.06 | `wms/MovementJournalPage.tsx` | `movementJournal` | ✅ |
| T1.07 | `wms/WarehouseStockDashboard.tsx` | `stockDashboard` | ✅ |
| T1.08 | `wms/StockValuationPage.tsx` | `stockValuation` | ✅ |
| T1.09 | `wms/StockBlockPage.tsx` | `stockBlock` | ✅ |
| T1.10 | `wms/CategoriesPage.tsx` | `categories` | ✅ |
| T1.11 | `wms/UomPage.tsx` | `uom` (existant, étendre) | ✅ |

### Phase 2 — WMS Outbound (Priority: 🔴 Haute)
| ID | Fichier | Namespace proposé | Status |
|----|---------|-------------------|--------|
| T2.01 | `wms/PickingPage.tsx` | `pickingPage` | ✅ |
| T2.02 | `wms/PackingPage.tsx` | `packingPage` | ✅ |
| T2.03 | `wms/ShippingPage.tsx` | `shippingPage` | ✅ |
| T2.04 | `wms/WavesPage.tsx` | `wavesPage` | ✅ |
| T2.05 | `wms/PutawayPage.tsx` | `putawayPage` | ✅ |
| T2.06 | `wms/ReservationsPage.tsx` | `reservationsPage` | ✅ |
| T2.07 | `wms/ReplenishmentRulesPage.tsx` | `replenishmentPage` | ✅ |

### Phase 3 — WMS Traçabilité (Priority: 🟡 Moyenne)
| ID | Fichier | Namespace proposé | Status |
|----|---------|-------------------|--------|
| T3.01 | `wms/LotBatchPage.tsx` | `lotBatch` | ✅ |
| T3.02 | `wms/SerialNumbersPage.tsx` | `serialNumbers` | ✅ |
| T3.03 | `wms/CrossDockingPage.tsx` | `crossDocking` | ✅ |
| T3.04 | `wms/KittingPage.tsx` | `kitting` | ✅ |
| T3.05 | `wms/RepackingPage.tsx` | `repacking` | ✅ |
| T3.06 | `wms/YardDockPage.tsx` | `yardDock` | ✅ |
| T3.07 | `wms/TaskQueuePage.tsx` | `taskQueue` | ✅ |

### Phase 4 — Ventes & Clients (Priority: 🔴 Haute)
| ID | Fichier | Namespace proposé | Status |
|----|---------|-------------------|--------|
| T4.01 | `sales/index.tsx` (OrdersPage) | `orders` (existant, étendre) | ✅ |
| T4.02 | `sales/CustomerDetailPage.tsx` | `customerDetail` | ✅ |
| T4.03 | `sales/RoutePlanPage.tsx` | `routePlan` | ✅ |
| T4.04 | `sales/RouteMapView.tsx` | `routePlan` | ✅ |
| T4.05 | `modules/sales/OrderFormDialog.tsx` | `orders` | ✅ |
| T4.06 | `modules/sales/OrderDetailDrawer.tsx` | `orders` | ✅ |

### Phase 5 — Fournisseurs & Achats (Priority: 🟡 Moyenne)
| ID | Fichier | Namespace proposé | Status |
|----|---------|-------------------|--------|
| T5.01 | `wms/SupplierContractsPage.tsx` | `supplierContracts` | ⬜ |
| T5.02 | `wms/SupplierReturnsPage.tsx` | `supplierReturns` | ⬜ |
| T5.03 | `wms/VendorScorecardPage.tsx` | `vendorScorecard` | ⬜ |
| T5.04 | `wms/QualityClaimsPage.tsx` | `qualityClaims` | ⬜ |
| T5.05 | `wms/MatchExceptionsPage.tsx` | `matchExceptions` | ⬜ |
| T5.06 | `wms/CreditNotesPage.tsx` | `creditNotes` | ⬜ |
| T5.07 | `wms/PriceHistoryPage.tsx` | `priceHistory` | ⬜ |

### Phase 6 — Comptabilité (Priority: 🟡 Moyenne)
| ID | Fichier | Namespace proposé | Status |
|----|---------|-------------------|--------|
| T6.01 | `accounting/index.tsx` (PaymentsPage) | `accountingPayments` | ⬜ |
| T6.02 | `accounting/ChartOfAccountsPage.tsx` | `chartOfAccounts` | ⬜ |
| T6.03 | `accounting/BankReconciliationPage.tsx` | `bankReconciliation` | ⬜ |
| T6.04 | `accounting/BudgetCostCentersPage.tsx` | `budgetCostCenters` | ⬜ |
| T6.05 | `accounting/PaymentRunsPage.tsx` | `paymentRuns` | ⬜ |
| T6.06 | `accounting/GrniReportPage.tsx` | `grniReport` | ⬜ |
| T6.07 | `DailyClosingPage.tsx` | `dailyClosing` | ⬜ |

### Phase 7 — Tarification & Types clients (Priority: 🟡 Moyenne)
| ID | Fichier | Namespace proposé | Status |
|----|---------|-------------------|--------|
| T7.01 | `modules/pricing/PricingPage.tsx` | `pricing` (existant, étendre) | ⬜ |
| T7.02 | `modules/pricing/PriceForm.tsx` | `pricing` | ⬜ |
| T7.03 | `modules/pricing/PriceHistoryDrawer.tsx` | `pricing` | ⬜ |
| T7.04 | `modules/pricing/BulkUpdateDialog.tsx` | `pricing` | ⬜ |
| T7.05 | `modules/client-types/ClientTypesPage.tsx` | `clientTypes` | ⬜ |
| T7.06 | `modules/client-types/ClientTypeForm.tsx` | `clientTypes` | ⬜ |

### Phase 8 — BI & Rapports (Priority: 🟢 Basse)
| ID | Fichier | Namespace proposé | Status |
|----|---------|-------------------|--------|
| T8.01 | `bi/ProfitabilityDashboard.tsx` | `biProfitability` | ⬜ |
| T8.02 | `bi/CategoryDistributionPage.tsx` | `biCategory` | ⬜ |
| T8.03 | `reports/ReportsOverviewPage.tsx` | `reports` | ⬜ |
| T8.04 | `reports/ReportBuilderPage.tsx` | `reportBuilder` | ⬜ |
| T8.05 | `reports/MarginHistoryPage.tsx` | `marginHistory` | ⬜ |

### Phase 9 — Admin & Settings (Priority: 🟢 Basse)
| ID | Fichier | Namespace proposé | Status |
|----|---------|-------------------|--------|
| T9.01 | `settings/UserManagementPage.tsx` | `userManagement` | ⬜ |
| T9.02 | `settings/SystemSettingsPage.tsx` | `systemSettings` | ⬜ |
| T9.03 | `settings/AlertRulesPage.tsx` | `alertRules` | ⬜ |
| T9.04 | `settings/ApprovalWorkflowsPage.tsx` | `approvalWorkflows` | ⬜ |
| T9.05 | `settings/IntegrationsPage.tsx` | `integrations` | ⬜ |
| T9.06 | `settings/AuditLogPage.tsx` | `auditLog` | ⬜ |
| T9.07 | `settings/PickingStrategyPage.tsx` | `pickingStrategy` | ⬜ |
| T9.08 | `settings/PutawayRulesPage.tsx` | `putawayRules` | ⬜ |
| T9.09 | `settings/LocationTypesPage.tsx` | `locationTypes` | ⬜ |

### Phase 10 — Login & Navigation (Priority: 🟢 Basse)
| ID | Fichier | Namespace proposé | Status |
|----|---------|-------------------|--------|
| T10.01 | `Login.tsx` | `login` | ⬜ |
| T10.02 | `Index.tsx` | `index` | ⬜ |
| T10.03 | `NotFound.tsx` | `notFound` | ⬜ |
| T10.04 | `components/AppSidebar.tsx` | `nav` (existant) | ⬜ |
| T10.05 | `components/NotificationCenter.tsx` | `notifications` | ⬜ |

### Phase 11 — Portails (Mobile, Driver, Client) (Priority: 🟢 Basse)
| ID | Fichier | Namespace proposé | Status |
|----|---------|-------------------|--------|
| T11.01 | `portal/screens/*.tsx` (9 écrans) | `portal` | ⬜ |
| T11.02 | `mobile/screens/*.tsx` (9 écrans) | `mobile` | ⬜ |
| T11.03 | `delivery/screens/*.tsx` (13 écrans) | `delivery` | ⬜ |

---

## 📋 Méthodologie par page

Pour chaque page :
1. **Extraire** tous les textes en dur (titres, labels, messages, tooltips, toasts)
2. **Créer** les clés dans le namespace dédié
3. **Ajouter** `useTranslation()` + `t('namespace.key')` dans le composant
4. **Traduire** dans les 3 fichiers JSON (fr, en, ar)
5. **Tester** le rendu en FR, EN et AR (RTL)

---

## 📈 Progression

| Phase | Pages | Terminées | % |
|-------|-------|-----------|---|
| Phase 1 — WMS Core | 11 | 10 | 91% |
| Phase 2 — WMS Outbound | 7 | 7 | 100% |
| Phase 3 — WMS Traçabilité | 7 | 7 | 100% |
| Phase 4 — Ventes & Clients | 6 | 6 | 100% |
| Phase 5 — Fournisseurs & Achats | 7 | 0 | 0% |
| Phase 6 — Comptabilité | 7 | 0 | 0% |
| Phase 7 — Tarification | 6 | 0 | 0% |
| Phase 8 — BI & Rapports | 5 | 0 | 0% |
| Phase 9 — Admin & Settings | 9 | 0 | 0% |
| Phase 10 — Login & Nav | 5 | 0 | 0% |
| Phase 11 — Portails | 3 lots | 0 | 0% |
| **TOTAL** | **~73** | **30** | **41%** |

---

## ⚠️ Règles

- **Namespace** : 1 namespace par page/module (pas de clés à la racine)
- **Interpolation** : utiliser `{variable}` pour les données dynamiques → `t('key', { count: 5 })`
- **Pluriels** : utiliser `_one` / `_other` quand nécessaire
- **RTL** : vérifier le rendu arabe avec `dir="rtl"` sur chaque page
- **Fallback** : la langue de secours est `fr` (configuré dans `src/i18n/index.ts`)
- **Toasts** : les messages de toast doivent aussi être traduits
- **Statuts** : les badges de statut (StatusBadge) doivent utiliser des clés i18n
