# 🌐 Plan de Traduction i18n — Jawda ERP/WMS

> **Objectif** : Internationaliser toutes les pages restantes (FR / EN / AR).
> **Date** : 2026-03-06
> **Langues** : Français (fr — défaut), English (en), العربية (ar — RTL)

---

## 📊 État actuel

### ✅ Pages déjà i18n (11 pages)

| #   | Page                             | Clé i18n                      |
| --- | -------------------------------- | ----------------------------- |
| 1   | `Dashboard.tsx`                  | `dashboard.*`                 |
| 2   | `wms/ProductsPage.tsx`           | `productPage.*`, `products.*` |
| 3   | `wms/VendorsPage.tsx`            | `vendors.*`                   |
| 4   | `wms/WarehousesPage.tsx`         | `warehouses.*`                |
| 5   | `wms/LocationsPage.tsx`          | `locations.*`                 |
| 6   | `wms/BarcodesPage.tsx`           | `barcodes.*`                  |
| 7   | `wms/CarriersPage.tsx`           | `carriers.*`                  |
| 8   | `wms/PaymentTermsPage.tsx`       | `paymentTermsPage.*`          |
| 9   | `wms/QualityControlPage.tsx`     | `qc.*`                        |
| 10  | `settings/CurrencyRatesPage.tsx` | inline                        |
| 11  | `settings/TaxConfigPage.tsx`     | inline                        |

### ✅ Composants déjà i18n (5)

| #   | Composant                               | Clé i18n        |
| --- | --------------------------------------- | --------------- |
| 1   | `modules/products/ProductTable.tsx`     | `table.*`       |
| 2   | `modules/products/ProductFilterBar.tsx` | `productPage.*` |
| 3   | `modules/products/ProductKPICards.tsx`  | `productPage.*` |
| 4   | `DataTablePagination.tsx`               | `pagination.*`  |
| 5   | `ExportDialog.tsx`                      | `export.*`      |

---

## 🔴 Pages à traduire (55 pages)

### Phase 1 — WMS Core (Priority: 🔴 Haute)

| ID    | Fichier                                                       | Namespace proposé         | Status |
| ----- | ------------------------------------------------------------- | ------------------------- | ------ |
| T1.01 | `wms/PurchaseOrdersPage.tsx`                                  | `purchaseOrders`          | ✅     |
| T1.02 | `wms/GrnPage.test.tsx` → `wms/GrnPage.tsx` (non trouvé, skip) | —                         | ⏭️     |
| T1.03 | `wms/CycleCountPage.tsx`                                      | `cycleCount`              | ✅     |
| T1.04 | `wms/StockAdjustmentsPage.tsx`                                | `stockAdjustments`        | ✅     |
| T1.05 | `wms/StockTransfersPage.tsx`                                  | `stockTransfers`          | ✅     |
| T1.06 | `wms/MovementJournalPage.tsx`                                 | `movementJournal`         | ✅     |
| T1.07 | `wms/WarehouseStockDashboard.tsx`                             | `stockDashboard`          | ✅     |
| T1.08 | `wms/StockValuationPage.tsx`                                  | `stockValuation`          | ✅     |
| T1.09 | `wms/StockBlockPage.tsx`                                      | `stockBlock`              | ✅     |
| T1.10 | `wms/CategoriesPage.tsx`                                      | `categories`              | ✅     |
| T1.11 | `wms/UomPage.tsx`                                             | `uom` (existant, étendre) | ✅     |

### Phase 2 — WMS Outbound (Priority: 🔴 Haute)

| ID    | Fichier                          | Namespace proposé   | Status |
| ----- | -------------------------------- | ------------------- | ------ |
| T2.01 | `wms/PickingPage.tsx`            | `pickingPage`       | ✅     |
| T2.02 | `wms/PackingPage.tsx`            | `packingPage`       | ✅     |
| T2.03 | `wms/ShippingPage.tsx`           | `shippingPage`      | ✅     |
| T2.04 | `wms/WavesPage.tsx`              | `wavesPage`         | ✅     |
| T2.05 | `wms/PutawayPage.tsx`            | `putawayPage`       | ✅     |
| T2.06 | `wms/ReservationsPage.tsx`       | `reservationsPage`  | ✅     |
| T2.07 | `wms/ReplenishmentRulesPage.tsx` | `replenishmentPage` | ✅     |

### Phase 3 — WMS Traçabilité (Priority: 🟡 Moyenne)

| ID    | Fichier                     | Namespace proposé | Status |
| ----- | --------------------------- | ----------------- | ------ |
| T3.01 | `wms/LotBatchPage.tsx`      | `lotBatch`        | ✅     |
| T3.02 | `wms/SerialNumbersPage.tsx` | `serialNumbers`   | ✅     |
| T3.03 | `wms/CrossDockingPage.tsx`  | `crossDocking`    | ✅     |
| T3.04 | `wms/KittingPage.tsx`       | `kitting`         | ✅     |
| T3.05 | `wms/RepackingPage.tsx`     | `repacking`       | ✅     |
| T3.06 | `wms/YardDockPage.tsx`      | `yardDock`        | ✅     |
| T3.07 | `wms/TaskQueuePage.tsx`     | `taskQueue`       | ✅     |

### Phase 4 — Ventes & Clients (Priority: 🔴 Haute)

| ID    | Fichier                               | Namespace proposé            | Status |
| ----- | ------------------------------------- | ---------------------------- | ------ |
| T4.01 | `sales/index.tsx` (OrdersPage)        | `orders` (existant, étendre) | ✅     |
| T4.02 | `sales/CustomerDetailPage.tsx`        | `customerDetail`             | ✅     |
| T4.03 | `sales/RoutePlanPage.tsx`             | `routePlan`                  | ✅     |
| T4.04 | `sales/RouteMapView.tsx`              | `routePlan`                  | ✅     |
| T4.05 | `modules/sales/OrderFormDialog.tsx`   | `orders`                     | ✅     |
| T4.06 | `modules/sales/OrderDetailDrawer.tsx` | `orders`                     | ✅     |

### Phase 5 — Fournisseurs & Achats (Priority: 🟡 Moyenne)

| ID    | Fichier                         | Namespace proposé   | Status |
| ----- | ------------------------------- | ------------------- | ------ |
| T5.01 | `wms/SupplierContractsPage.tsx` | `supplierContracts` | ✅     |
| T5.02 | `wms/SupplierReturnsPage.tsx`   | `supplierReturns`   | ✅     |
| T5.03 | `wms/VendorScorecardPage.tsx`   | `vendorScorecard`   | ✅     |
| T5.04 | `wms/QualityClaimsPage.tsx`     | `qualityClaims`     | ✅     |
| T5.05 | `wms/MatchExceptionsPage.tsx`   | `matchExceptions`   | ✅     |
| T5.06 | `wms/CreditNotesPage.tsx`       | `creditNotes`       | ✅     |
| T5.07 | `wms/PriceHistoryPage.tsx`      | `priceHistory`      | ✅     |

### Phase 6 — Comptabilité (Priority: 🟡 Moyenne)

| ID    | Fichier                                 | Namespace proposé    | Status |
| ----- | --------------------------------------- | -------------------- | ------ |
| T6.01 | `accounting/index.tsx` (PaymentsPage)   | `accountingPayments` | ✅     |
| T6.02 | `accounting/ChartOfAccountsPage.tsx`    | `chartOfAccounts`    | ✅     |
| T6.03 | `accounting/BankReconciliationPage.tsx` | `bankReconciliation` | ✅     |
| T6.04 | `accounting/BudgetCostCentersPage.tsx`  | `budgetCostCenters`  | ✅     |
| T6.05 | `accounting/PaymentRunsPage.tsx`        | `paymentRuns`        | ✅     |
| T6.06 | `accounting/GrniReportPage.tsx`         | `grniReport`         | ✅     |
| T6.07 | `DailyClosingPage.tsx`                  | `dailyClosing`       | ✅     |

### Phase 7 — Tarification & Types clients (Priority: 🟡 Moyenne)

| ID    | Fichier                                    | Namespace proposé             | Status |
| ----- | ------------------------------------------ | ----------------------------- | ------ |
| T7.01 | `modules/pricing/PricingPage.tsx`          | `pricing` (existant, étendre) | ✅     |
| T7.02 | `modules/pricing/PriceForm.tsx`            | `pricing`                     | ✅     |
| T7.03 | `modules/pricing/PriceHistoryDrawer.tsx`   | `pricing`                     | ✅     |
| T7.04 | `modules/pricing/BulkUpdateDialog.tsx`     | `pricing`                     | ✅     |
| T7.05 | `modules/client-types/ClientTypesPage.tsx` | `clientTypes`                 | ✅     |
| T7.06 | `modules/client-types/ClientTypeForm.tsx`  | `clientTypes`                 | ✅     |

### Phase 8 — BI & Rapports (Priority: 🟢 Basse)

| ID    | Fichier                           | Namespace proposé | Status |
| ----- | --------------------------------- | ----------------- | ------ |
| T8.01 | `bi/ProfitabilityDashboard.tsx`   | `biProfitability` | ✅     |
| T8.02 | `bi/CategoryDistributionPage.tsx` | `biCategory`      | ✅     |
| T8.03 | `reports/ReportsOverviewPage.tsx` | `reportsOverview` | ✅     |
| T8.04 | `reports/ReportBuilderPage.tsx`   | `reportBuilder`   | ✅     |
| T8.05 | `reports/MarginHistoryPage.tsx`   | `marginHistory`   | ✅     |

### Phase 9 — Admin & Settings (Priority: 🟢 Basse)

| ID    | Fichier                              | Namespace proposé   | Status |
| ----- | ------------------------------------ | ------------------- | ------ |
| T9.01 | `settings/UserManagementPage.tsx`    | `userManagement`    | ✅     |
| T9.02 | `settings/SystemSettingsPage.tsx`    | `systemSettings`    | ✅     |
| T9.03 | `settings/AlertRulesPage.tsx`        | `alertRules`        | ✅     |
| T9.04 | `settings/ApprovalWorkflowsPage.tsx` | `approvalWorkflows` | ✅     |
| T9.05 | `settings/IntegrationsPage.tsx`      | `integrationsHub`   | ✅     |
| T9.06 | `settings/AuditLogPage.tsx`          | `auditLog`          | ✅     |
| T9.07 | `settings/PickingStrategyPage.tsx`   | `pickingStrategy`   | ✅     |
| T9.08 | `settings/PutawayRulesPage.tsx`      | `putawayRules`      | ✅     |
| T9.09 | `settings/LocationTypesPage.tsx`     | `locationTypes`     | ✅     |

### Phase 10 — Login & Navigation (Priority: 🟢 Basse)

| ID     | Fichier                             | Namespace proposé | Status             |
| ------ | ----------------------------------- | ----------------- | ------------------ |
| T10.01 | `Login.tsx`                         | `login`           | ✅                 |
| T10.02 | `Index.tsx`                         | `index`           | ⏭️ (fallback page) |
| T10.03 | `NotFound.tsx`                      | `notFound`        | ✅                 |
| T10.04 | `components/AppSidebar.tsx`         | `nav` (existant)  | ✅ (déjà i18n)     |
| T10.05 | `components/NotificationCenter.tsx` | `notifications`   | ✅                 |

### Phase 11 — Portails (Mobile, Driver, Client) (Priority: 🟢 Basse)

| ID     | Fichier                              | Namespace proposé | Status |
| ------ | ------------------------------------ | ----------------- | ------ |
| T11.01 | `portal/screens/*.tsx` (9 écrans)    | `portal`          | ✅     |
| T11.02 | `mobile/screens/*.tsx` (9 écrans)    | `mobile`          | ✅     |
| T11.03 | `delivery/screens/*.tsx` (13 écrans) | `delivery`        | ✅     |

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

| Phase                           | Pages   | Terminées   | %         |
| ------------------------------- | ------- | ----------- | --------- |
| Phase 1 — WMS Core              | 11      | 10          | 91%       |
| Phase 2 — WMS Outbound          | 7       | 7           | 100%      |
| Phase 3 — WMS Traçabilité       | 7       | 7           | 100%      |
| Phase 4 — Ventes & Clients      | 6       | 6           | 100%      |
| Phase 5 — Fournisseurs & Achats | 7       | 7           | 100%      |
| Phase 6 — Comptabilité          | 7       | 7           | 100%      |
| Phase 7 — Tarification          | 6       | 6           | 100%      |
| Phase 8 — BI & Rapports         | 5       | 2 (+3 clés) | 100% clés |
| Phase 9 — Admin & Settings      | 9       | 0 (+9 clés) | 100% clés |
| Phase 10 — Login & Nav          | 5       | 4           | 80%       |
| Phase 11 — Portails             | 3 lots  | 3           | 100%      |
| **TOTAL**                       | **~73** | **57**      | **78%**   |

---

## 📝 Détails de traduction — Phase 6

### T6.01 — PaymentsPage (`accountingPayments`)

#### En-tête et navigation

| Clé                             | FR                            | EN                        | AR                 |
| ------------------------------- | ----------------------------- | ------------------------- | ------------------ |
| `accountingPayments.title`      | Encaissements                 | Collections               | التحصيلات          |
| `accountingPayments.subtitle`   | {count} paiements enregistrés | {count} payments recorded | {count} دفعة مسجلة |
| `accountingPayments.btn_record` | Enregistrer paiement          | Record Payment            | تسجيل دفعة         |

#### KPIs

| Clé                                | FR             | EN              | AR             |
| ---------------------------------- | -------------- | --------------- | -------------- |
| `accountingPayments.kpi_collected` | Total encaissé | Total Collected | إجمالي التحصيل |
| `accountingPayments.kpi_pending`   | En attente     | Pending         | قيد الانتظار   |
| `accountingPayments.kpi_bounced`   | Rejetés        | Bounced         | مرفوضة         |
| `accountingPayments.kpi_gains_fx`  | Gains FX       | FX Gains        | أرباح الصرف    |
| `accountingPayments.kpi_losses_fx` | Pertes FX      | FX Losses       | خسائر الصرف    |

#### Table colonnes

| Clé                                   | FR           | EN           | AR           |
| ------------------------------------- | ------------ | ------------ | ------------ |
| `accountingPayments.col_id`           | ID           | ID           | معرّف        |
| `accountingPayments.col_customer`     | Client       | Customer     | العميل       |
| `accountingPayments.col_invoice`      | Facture      | Invoice      | الفاتورة     |
| `accountingPayments.col_date`         | Date         | Date         | التاريخ      |
| `accountingPayments.col_method`       | Méthode      | Method       | الطريقة      |
| `accountingPayments.col_amount`       | Montant      | Amount       | المبلغ       |
| `accountingPayments.col_reference`    | Référence    | Reference    | المرجع       |
| `accountingPayments.col_collected_by` | Collecté par | Collected By | جمعها بواسطة |
| `accountingPayments.col_status`       | Statut       | Status       | الحالة       |

#### Dialog enregistrement paiement

| Clé                                               | FR                          | EN                   | AR                     |
| ------------------------------------------------- | --------------------------- | -------------------- | ---------------------- |
| `accountingPayments.dialog_title`                 | Enregistrer un paiement     | Record a Payment     | تسجيل دفعة             |
| `accountingPayments.dialog_invoice`               | Facture                     | Invoice              | الفاتورة               |
| `accountingPayments.dialog_invoice_select`        | Sélectionner une facture... | Select an invoice... | اختر فاتورة...         |
| `accountingPayments.dialog_amount`                | Montant                     | Amount               | المبلغ                 |
| `accountingPayments.dialog_method`                | Méthode                     | Payment Method       | طريقة الدفع            |
| `accountingPayments.dialog_reference`             | Référence                   | Reference            | المرجع                 |
| `accountingPayments.dialog_reference_placeholder` | Ex: VIR-20260220-001        | Ex: TRN-20260220-001 | مثال: TRN-20260220-001 |
| `accountingPayments.dialog_collected_by`          | Collecté par                | Collected By         | جمعها بواسطة           |
| `accountingPayments.dialog_notes`                 | Notes                       | Notes                | ملاحظات                |

#### FX Gain/Loss Table

| Clé                                         | FR                                                                        | EN                                                          | AR                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------- |
| `accountingPayments.fx_title`               | Gains / Pertes de change (FX)                                             | Currency Gains / Losses (FX)                                | أرباح / خسائر الصرف                                |
| `accountingPayments.fx_subtitle`            | Écarts de change réalisés sur paiements fournisseurs multi-devises — Net: | Currency variances on multi-currency vendor payments — Net: | تباينات الصرف على الدفعات متعددة العملات — الصافي: |
| `accountingPayments.fx_col_payment`         | Paiement                                                                  | Payment                                                     | الدفعة                                             |
| `accountingPayments.fx_col_vendor`          | Fournisseur                                                               | Vendor                                                      | المورد                                             |
| `accountingPayments.fx_col_currency`        | Devise                                                                    | Currency                                                    | العملة                                             |
| `accountingPayments.fx_col_foreign_amount`  | Montant devise                                                            | Foreign Amount                                              | المبلغ الأجنبي                                     |
| `accountingPayments.fx_col_po_rate`         | Taux PO                                                                   | PO Rate                                                     | سعر الأمر                                          |
| `accountingPayments.fx_col_settlement_rate` | Taux règlement                                                            | Settlement Rate                                             | سعر التسوية                                        |
| `accountingPayments.fx_col_gain_loss`       | Gain/Perte DZD                                                            | Gain/Loss DZD                                               | ربح/خسارة د.ج                                      |

#### Toasts

| Clé                                            | FR                                        | EN                            | AR                               |
| ---------------------------------------------- | ----------------------------------------- | ----------------------------- | -------------------------------- |
| `accountingPayments.toast_invalid_amount`      | Montant invalide                          | Invalid Amount                | مبلغ غير صحيح                    |
| `accountingPayments.toast_invalid_amount_desc` | Le montant ne peut pas dépasser le solde. | Amount cannot exceed balance. | لا يمكن أن يتجاوز المبلغ الرصيد. |
| `accountingPayments.toast_payment_recorded`    | Paiement enregistré                       | Payment Recorded              | تم تسجيل الدفعة                  |

---

### T6.02 — ChartOfAccountsPage (`chartOfAccounts`)

#### En-tête

| Clé                        | FR                                       | EN                                        | AR                               |
| -------------------------- | ---------------------------------------- | ----------------------------------------- | -------------------------------- |
| `chartOfAccounts.title`    | Plan Comptable                           | Chart of Accounts                         | دليل الحسابات                    |
| `chartOfAccounts.subtitle` | {count} comptes • Structure PCG Algérien | {count} accounts • Algerian PCG Structure | {count} حساب • هيكل PCG الجزائري |
| `chartOfAccounts.btn_new`  | Nouveau compte                           | New Account                               | حساب جديد                        |

#### KPIs Types

| Clé                                | FR               | EN          | AR           |
| ---------------------------------- | ---------------- | ----------- | ------------ |
| `chartOfAccounts.type_assets`      | Actifs           | Assets      | الأصول       |
| `chartOfAccounts.type_liabilities` | Passifs          | Liabilities | الخصوم       |
| `chartOfAccounts.type_equity`      | Capitaux propres | Equity      | حقوق الملكية |
| `chartOfAccounts.type_revenue`     | Produits         | Revenue     | الإيرادات    |
| `chartOfAccounts.type_expense`     | Charges          | Expenses    | المصاريف     |

#### Filters

| Clé                                  | FR                        | EN                     | AR                        |
| ------------------------------------ | ------------------------- | ---------------------- | ------------------------- |
| `chartOfAccounts.search_placeholder` | Rechercher code ou nom... | Search code or name... | ابحث عن الكود أو الاسم... |
| `chartOfAccounts.filter_all_types`   | Tous les types            | All types              | جميع الأنواع              |

#### Table colonnes

| Clé                                | FR        | EN           | AR             |
| ---------------------------------- | --------- | ------------ | -------------- |
| `chartOfAccounts.col_code`         | Code      | Code         | الكود          |
| `chartOfAccounts.col_label`        | Libellé   | Label        | العنوان        |
| `chartOfAccounts.col_subtype`      | Sous-type | SubType      | النوع الفرعي   |
| `chartOfAccounts.col_reconcilable` | Lettrable | Reconcilable | قابلة للمطابقة |
| `chartOfAccounts.col_active`       | Actif     | Active       | نشط            |

#### Form Dialog

| Clé                                       | FR                       | EN             | AR             |
| ----------------------------------------- | ------------------------ | -------------- | -------------- |
| `chartOfAccounts.form_title_create`       | Nouveau compte           | New Account    | حساب جديد      |
| `chartOfAccounts.form_title_edit`         | Modifier le compte       | Edit Account   | تعديل الحساب   |
| `chartOfAccounts.form_code`               | Code \*                  | Code \*        | الكود \*       |
| `chartOfAccounts.form_type`               | Type \*                  | Type \*        | النوع \*       |
| `chartOfAccounts.form_label`              | Libellé \*               | Label \*       | العنوان \*     |
| `chartOfAccounts.form_subtype`            | Sous-type                | SubType        | النوع الفرعي   |
| `chartOfAccounts.form_parent`             | Compte parent            | Parent Account | الحساب الأب    |
| `chartOfAccounts.form_parent_none`        | — Aucun —                | — None —       | — لا شيء —     |
| `chartOfAccounts.form_description`        | Description              | Description    | الوصف          |
| `chartOfAccounts.form_reconcilable_label` | Lettrable (rapprochable) | Reconcilable   | قابلة للمطابقة |
| `chartOfAccounts.form_active_label`       | Actif                    | Active         | نشط            |

#### Delete Dialog

| Clé                            | FR                                                        | EN                                                        | AR                                                |
| ------------------------------ | --------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------- |
| `chartOfAccounts.delete_title` | Supprimer le compte ?                                     | Delete Account ?                                          | حذف الحساب؟                                       |
| `chartOfAccounts.delete_desc`  | Le compte <strong>{code}</strong> ({name}) sera supprimé. | Account <strong>{code}</strong> ({name}) will be deleted. | سيتم حذف الحساب <strong>{code}</strong> ({name}). |

#### Toasts

| Clé                                        | FR                            | EN                       | AR                     |
| ------------------------------------------ | ----------------------------- | ------------------------ | ---------------------- |
| `chartOfAccounts.toast_error`              | Erreur                        | Error                    | خطأ                    |
| `chartOfAccounts.toast_code_name_required` | Code et nom requis            | Code and name required   | مطلوب الرمز والاسم     |
| `chartOfAccounts.toast_code_exists`        | Ce code comptable existe déjà | This code already exists | هذا الرمز موجود بالفعل |
| `chartOfAccounts.toast_account_created`    | Compte créé                   | Account Created          | تم إنشاء الحساب        |
| `chartOfAccounts.toast_account_modified`   | Compte modifié                | Account Modified         | تم تعديل الحساب        |
| `chartOfAccounts.toast_account_deleted`    | Compte supprimé               | Account Deleted          | تم حذف الحساب          |

---

### T6.03 — BankReconciliationPage (`bankReconciliation`)

#### En-tête

| Clé                                 | FR                                                     | EN                                             | AR                                              |
| ----------------------------------- | ------------------------------------------------------ | ---------------------------------------------- | ----------------------------------------------- |
| `bankReconciliation.title`          | Rapprochement bancaire                                 | Bank Reconciliation                            | المطابقة البنكية                                |
| `bankReconciliation.subtitle`       | Import relevé, rapprochement auto/manuel des paiements | Statement import, auto/manual payment matching | استيراد الكشف، مطابقة الدفعات التلقائية/اليدوية |
| `bankReconciliation.btn_import`     | Importer CSV                                           | Import CSV                                     | استيراد CSV                                     |
| `bankReconciliation.btn_auto_match` | Rapprochement auto                                     | Auto Match                                     | مطابقة تلقائية                                  |

#### KPIs

| Clé                                   | FR                 | EN            | AR              |
| ------------------------------------- | ------------------ | ------------- | --------------- |
| `bankReconciliation.kpi_matched`      | Lignes rapprochées | Matched Lines | الخطوط المطابقة |
| `bankReconciliation.kpi_unmatched`    | Non rapprochées    | Unmatched     | غير مطابقة      |
| `bankReconciliation.kpi_total_credit` | Total crédit       | Total Credit  | إجمالي الرصيد   |
| `bankReconciliation.kpi_total_debit`  | Total débit        | Total Debit   | إجمالي المدين   |

#### Search

| Clé                                     | FR          | EN      | AR    |
| --------------------------------------- | ----------- | ------- | ----- |
| `bankReconciliation.search_placeholder` | Rechercher… | Search… | ابحث… |

#### Table colonnes

| Clé                                  | FR        | EN          | AR      |
| ------------------------------------ | --------- | ----------- | ------- |
| `bankReconciliation.col_date`        | Date      | Date        | التاريخ |
| `bankReconciliation.col_reference`   | Référence | Reference   | المرجع  |
| `bankReconciliation.col_description` | Libellé   | Description | الوصف   |
| `bankReconciliation.col_amount`      | Montant   | Amount      | المبلغ  |
| `bankReconciliation.col_balance`     | Solde     | Balance     | الرصيد  |
| `bankReconciliation.col_status`      | Statut    | Status      | الحالة  |
| `bankReconciliation.col_action`      | Action    | Action      | الإجراء |

#### Statuts

| Clé                                 | FR         | EN      | AR           |
| ----------------------------------- | ---------- | ------- | ------------ |
| `bankReconciliation.status_matched` | Rapproché  | Matched | مطابق        |
| `bankReconciliation.status_pending` | En attente | Pending | قيد الانتظار |
| `bankReconciliation.btn_unlink`     | Délier     | Unlink  | فك الربط     |
| `bankReconciliation.btn_match`      | Rapprocher | Match   | مطابقة       |

#### CSV Format

| Clé                                     | FR                                       | EN                                            | AR                                     |
| --------------------------------------- | ---------------------------------------- | --------------------------------------------- | -------------------------------------- |
| `bankReconciliation.csv_format_label`   | Format CSV attendu:                      | Expected CSV format:                          | تنسيق CSV المتوقع:                     |
| `bankReconciliation.csv_format_cols`    | Date, Référence, Libellé, Montant, Solde | Date, Reference, Description, Amount, Balance | التاريخ، المرجع، الوصف، المبلغ، الرصيد |
| `bankReconciliation.csv_format_example` | Exemple:                                 | Example:                                      | مثال:                                  |

#### Toasts

| Clé                                         | FR                                         | EN                         | AR                             |
| ------------------------------------------- | ------------------------------------------ | -------------------------- | ------------------------------ |
| `bankReconciliation.toast_auto_matched`     | {count} lignes rapprochées automatiquement | {count} lines auto-matched | تم مطابقة {count} سطر تلقائياً |
| `bankReconciliation.toast_manual_matched`   | Rapprochement manuel effectué              | Manual match completed     | تمت المطابقة اليدوية           |
| `bankReconciliation.toast_unmatched`        | Déliaison effectuée                        | Unlink completed           | تم فك الربط                    |
| `bankReconciliation.toast_lines_imported`   | {count} lignes importées                   | {count} lines imported     | تم استيراد {count} سطر         |
| `bankReconciliation.toast_no_payment`       | Aucun paiement disponible                  | No payment available       | لا توجد دفعة متاحة             |
| `bankReconciliation.toast_no_payment_error` | Aucun paiement disponible                  | No payment available       | لا توجد دفعة متاحة             |

---

### T6.04 — BudgetCostCentersPage (`budgetCostCenters`)

#### En-tête

| Clé                          | FR                                           | EN                                   | AR                                |
| ---------------------------- | -------------------------------------------- | ------------------------------------ | --------------------------------- |
| `budgetCostCenters.title`    | Budget & Centres de Coûts                    | Budget & Cost Centers                | الميزانية ومراكز التكلفة          |
| `budgetCostCenters.subtitle` | Contrôle budgétaire et allocation par centre | Budget control and center allocation | التحكم في الميزانية وتخصيص المركز |

#### Tabs

| Clé                             | FR               | EN           | AR            |
| ------------------------------- | ---------------- | ------------ | ------------- |
| `budgetCostCenters.tab_budgets` | Budgets          | Budgets      | الميزانيات    |
| `budgetCostCenters.tab_centers` | Centres de coûts | Cost Centers | مراكز التكلفة |

#### KPIs

| Clé                                     | FR                  | EN                  | AR                 |
| --------------------------------------- | ------------------- | ------------------- | ------------------ |
| `budgetCostCenters.kpi_total_allocated` | Budget total alloué | Total Allocated     | إجمالي المخصص      |
| `budgetCostCenters.kpi_committed`       | Engagé (PO)         | Committed (PO)      | الملتزم به (الأمر) |
| `budgetCostCenters.kpi_consumed`        | Consommé (facturé)  | Consumed (Invoiced) | مستهلك (مفوتر)     |
| `budgetCostCenters.kpi_available`       | Disponible          | Available           | متاح               |

#### Filters

| Clé                                    | FR            | EN          | AR           |
| -------------------------------------- | ------------- | ----------- | ------------ |
| `budgetCostCenters.search_placeholder` | Rechercher... | Search...   | ابحث...      |
| `budgetCostCenters.filter_all_centers` | Tous centres  | All centers | جميع المراكز |

#### Budget Table

| Clé                                 | FR             | EN          | AR           |
| ----------------------------------- | -------------- | ----------- | ------------ |
| `budgetCostCenters.col_cost_center` | Centre de coût | Cost Center | مركز التكلفة |
| `budgetCostCenters.col_account`     | Compte         | Account     | الحساب       |
| `budgetCostCenters.col_allocated`   | Alloué         | Allocated   | المخصص       |
| `budgetCostCenters.col_committed`   | Engagé         | Committed   | الملتزم      |
| `budgetCostCenters.col_actual`      | Consommé       | Actual      | الفعلي       |
| `budgetCostCenters.col_available`   | Disponible     | Available   | متاح         |
| `budgetCostCenters.col_consumption` | Consommation   | Consumption | الاستهلاك    |
| `budgetCostCenters.col_control`     | Contrôle       | Control     | التحكم       |
| `budgetCostCenters.btn_new_line`    | Nouvelle ligne | New Line    | سطر جديد     |

#### Cost Center Table

| Clé                                      | FR             | EN               | AR                |
| ---------------------------------------- | -------------- | ---------------- | ----------------- |
| `budgetCostCenters.col_code`             | Code           | Code             | الكود             |
| `budgetCostCenters.col_name`             | Nom            | Name             | الاسم             |
| `budgetCostCenters.col_manager`          | Responsable    | Manager          | المدير            |
| `budgetCostCenters.col_allocated_budget` | Budget alloué  | Allocated Budget | الميزانية المخصصة |
| `budgetCostCenters.btn_new_center`       | Nouveau centre | New Center       | مركز جديد         |

#### Budget Control Actions

| Clé                               | FR      | EN    | AR     |
| --------------------------------- | ------- | ----- | ------ |
| `budgetCostCenters.control_none`  | Aucun   | None  | لا شيء |
| `budgetCostCenters.control_warn`  | Avertir | Warn  | تحذير  |
| `budgetCostCenters.control_block` | Bloquer | Block | حظر    |

#### Budget Form Dialog

| Clé                                          | FR                           | EN                        | AR                     |
| -------------------------------------------- | ---------------------------- | ------------------------- | ---------------------- |
| `budgetCostCenters.form_budget_title_create` | Nouvelle ligne budgétaire    | New Budget Line           | سطر ميزانية جديد       |
| `budgetCostCenters.form_budget_title_edit`   | Modifier la ligne budgétaire | Edit Budget Line          | تعديل سطر الميزانية    |
| `budgetCostCenters.form_cost_center`         | Centre de coût \*            | Cost Center \*            | مركز التكلفة \*        |
| `budgetCostCenters.form_cost_center_select`  | — Choisir —                  | — Select —                | — اختر —               |
| `budgetCostCenters.form_account_code`        | Code compte \*               | Account Code \*           | رمز الحساب \*          |
| `budgetCostCenters.form_account_label`       | Libellé compte \*            | Account Label \*          | تسمية الحساب \*        |
| `budgetCostCenters.form_period`              | Période                      | Period                    | الفترة                 |
| `budgetCostCenters.form_allocated_amount`    | Montant alloué (DZD) \*      | Allocated Amount (DZD) \* | المبلغ المخصص (د.ج) \* |
| `budgetCostCenters.form_control_action`      | Action de contrôle           | Control Action            | إجراء التحكم           |

#### Cost Center Form Dialog

| Clé                                      | FR                         | EN               | AR                 |
| ---------------------------------------- | -------------------------- | ---------------- | ------------------ |
| `budgetCostCenters.form_cc_title_create` | Nouveau centre de coût     | New Cost Center  | مركز تكلفة جديد    |
| `budgetCostCenters.form_cc_title_edit`   | Modifier le centre de coût | Edit Cost Center | تعديل مركز التكلفة |
| `budgetCostCenters.form_cc_code`         | Code \*                    | Code \*          | الكود \*           |
| `budgetCostCenters.form_cc_name`         | Nom \*                     | Name \*          | الاسم \*           |
| `budgetCostCenters.form_cc_manager`      | Responsable                | Manager          | المدير             |
| `budgetCostCenters.form_cc_active`       | Actif                      | Active           | نشط                |

#### Toasts

| Clé                                       | FR                                       | EN                                       | AR                                  |
| ----------------------------------------- | ---------------------------------------- | ---------------------------------------- | ----------------------------------- |
| `budgetCostCenters.toast_error`           | Erreur                                   | Error                                    | خطأ                                 |
| `budgetCostCenters.toast_required_fields` | Centre de coût, compte et montant requis | Cost center, account and amount required | مركز التكلفة والحساب والمبلغ مطلوبة |
| `budgetCostCenters.toast_cc_required`     | Code et nom requis                       | Code and name required                   | الرمز والاسم مطلوبة                 |
| `budgetCostCenters.toast_budget_created`  | Ligne budgétaire créée                   | Budget Line Created                      | تم إنشاء سطر الميزانية              |
| `budgetCostCenters.toast_budget_modified` | Ligne budgétaire modifiée                | Budget Line Modified                     | تم تعديل سطر الميزانية              |
| `budgetCostCenters.toast_center_created`  | Centre de coût créé                      | Cost Center Created                      | تم إنشاء مركز التكلفة               |
| `budgetCostCenters.toast_center_modified` | Centre de coût modifié                   | Cost Center Modified                     | تم تعديل مركز التكلفة               |

#### Budget Status

| Clé                                    | FR       | EN          | AR          |
| -------------------------------------- | -------- | ----------- | ----------- |
| `budgetCostCenters.status_ok`          | OK       | OK          | حسناً       |
| `budgetCostCenters.status_in_progress` | En cours | In Progress | قيد الإنجاز |
| `budgetCostCenters.status_critical`    | Critique | Critical    | حرج         |
| `budgetCostCenters.status_exceeded`    | Dépassé  | Exceeded    | متجاوز      |

---

### T6.05 — PaymentRunsPage (`paymentRuns`)

#### En-tête

| Clé                        | FR                                                     | EN                                                 | AR                                   |
| -------------------------- | ------------------------------------------------------ | -------------------------------------------------- | ------------------------------------ |
| `paymentRuns.title`        | Lots de paiement fournisseurs                          | Vendor Payment Runs                                | دفعات الدفع للموردين                 |
| `paymentRuns.subtitle`     | Génération, approbation et soumission des paiements AP | Generation, approval and submission of AP payments | الإنشاء والموافقة والتقديم لدفعات AP |
| `paymentRuns.btn_generate` | Générer un lot                                         | Generate Run                                       | إنشاء دفعة                           |

#### KPIs

| Clé                                 | FR                 | EN                | AR               |
| ----------------------------------- | ------------------ | ----------------- | ---------------- |
| `paymentRuns.kpi_eligible_invoices` | Factures éligibles | Eligible Invoices | الفواتير المؤهلة |
| `paymentRuns.kpi_amount_to_pay`     | Montant à payer    | Amount to Pay     | المبلغ المستحق   |
| `paymentRuns.kpi_active_runs`       | Lots actifs        | Active Runs       | الدفعات النشطة   |
| `paymentRuns.kpi_vendors`           | Fournisseurs       | Vendors           | الموردون         |

#### Approval Matrix

| Clé                           | FR                                  | EN                      | AR                  |
| ----------------------------- | ----------------------------------- | ----------------------- | ------------------- |
| `paymentRuns.approval_matrix` | Matrice d'approbation des paiements | Payment Approval Matrix | مصفوفة موافقة الدفع |

#### Payment Run Status

| Clé                             | FR        | EN         | AR         |
| ------------------------------- | --------- | ---------- | ---------- |
| `paymentRuns.status_draft`      | Brouillon | Draft      | مسودة      |
| `paymentRuns.status_approved`   | Approuvé  | Approved   | موافق عليه |
| `paymentRuns.status_submitted`  | Soumis    | Submitted  | مُقدَّم    |
| `paymentRuns.status_cleared`    | Réglé     | Cleared    | مُسدَّد    |
| `paymentRuns.status_reconciled` | Rapproché | Reconciled | مطابق      |

#### Buttons

| Clé                            | FR           | EN           | AR           |
| ------------------------------ | ------------ | ------------ | ------------ |
| `paymentRuns.btn_approve`      | Approuver    | Approve      | الموافقة     |
| `paymentRuns.btn_submit`       | Soumettre    | Submit       | تقديم        |
| `paymentRuns.btn_sepa_xml`     | SEPA XML     | SEPA XML     | SEPA XML     |
| `paymentRuns.btn_view_details` | Voir détails | View Details | عرض التفاصيل |

#### Run Details

| Clé                             | FR                          | EN                        | AR                        |
| ------------------------------- | --------------------------- | ------------------------- | ------------------------- |
| `paymentRuns.approval_required` | Approbation requise: {tier} | Approval required: {tier} | المصادقة المطلوبة: {tier} |
| `paymentRuns.run_total`         | Total:                      | Total:                    | الإجمالي:                 |
| `paymentRuns.run_discount`      | Escompte:                   | Discount:                 | الخصم:                    |
| `paymentRuns.run_vendors`       | Fournisseurs:               | Vendors:                  | الموردون:                 |

#### Generate Dialog

| Clé                                    | FR                                                       | EN                                      | AR                               |
| -------------------------------------- | -------------------------------------------------------- | --------------------------------------- | -------------------------------- |
| `paymentRuns.dialog_title`             | Générer un lot de paiement                               | Generate Payment Run                    | إنشاء دفعة دفع                   |
| `paymentRuns.dialog_due_range`         | Échéance dans les prochains                              | Due within next                         | المستحقة خلال                    |
| `paymentRuns.dialog_min_amount`        | Montant minimum                                          | Minimum Amount                          | الحد الأدنى للمبلغ               |
| `paymentRuns.dialog_eligible_invoices` | {count} factures éligibles pour {amount}                 | {count} eligible invoices for {amount}  | {count} فاتورة مؤهلة ل {amount}  |
| `paymentRuns.dialog_note`              | Groupement par fournisseur activé • Escompte automatique | Vendor grouping enabled • Auto discount | تجميع الموردين مفعل • خصم تلقائي |

#### Detail Dialog

| Clé                                   | FR                 | EN                | AR                 |
| ------------------------------------- | ------------------ | ----------------- | ------------------ |
| `paymentRuns.detail_title`            | Détail du lot {id} | Detail Batch {id} | تفاصيل الدفعة {id} |
| `paymentRuns.detail_col_vendor`       | Fournisseur        | Vendor            | المورد             |
| `paymentRuns.detail_col_invoices`     | Factures           | Invoices          | الفواتير           |
| `paymentRuns.detail_col_gross_amount` | Montant brut       | Gross Amount      | المبلغ الإجمالي    |
| `paymentRuns.detail_col_discount`     | Escompte           | Discount          | الخصم              |
| `paymentRuns.detail_col_net_amount`   | Net à payer        | Net Amount        | المبلغ الصافي      |
| `paymentRuns.detail_total`            | Total              | Total             | الإجمالي           |

#### Empty State

| Clé                       | FR                                                              | EN                                                | AR                                      |
| ------------------------- | --------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------- |
| `paymentRuns.empty_title` | Aucun lot de paiement                                           | No payment runs                                   | لا توجد دفعات دفع                       |
| `paymentRuns.empty_desc`  | Cliquez «Générer un lot» pour créer une proposition de paiement | Click "Generate Run" to create a payment proposal | انقر على "إنشاء دفعة" لإنشاء اقتراح دفع |

#### Toasts

| Clé                                    | FR                                             | EN                                        | AR                                       |
| -------------------------------------- | ---------------------------------------------- | ----------------------------------------- | ---------------------------------------- |
| `paymentRuns.toast_no_eligible`        | Aucune facture éligible                        | No eligible invoices                      | لا توجد فواتير مؤهلة                     |
| `paymentRuns.toast_run_generated`      | Lot de paiement généré                         | Payment run generated                     | تم إنشاء دفعة الدفع                      |
| `paymentRuns.toast_run_generated_desc` | {runId} — {vendorCount} fournisseurs, {amount} | {runId} — {vendorCount} vendors, {amount} | {runId} — {vendorCount} موردون، {amount} |
| `paymentRuns.toast_run_approved`       | Lot approuvé                                   | Run Approved                              | تمت الموافقة على الدفعة                  |
| `paymentRuns.toast_run_submitted`      | Lot soumis à la banque                         | Run Submitted to Bank                     | تم تقديم الدفعة إلى البنك                |
| `paymentRuns.toast_sepa_exported`      | Fichier SEPA exporté                           | SEPA File Exported                        | تم تصدير ملف SEPA                        |

---

### T6.06 — GrniReportPage (`grniReport`)

#### En-tête

| Clé                   | FR                                                                            | EN                                                                            | AR                                                               |
| --------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `grniReport.title`    | GRNI & Écritures de variance                                                  | GRNI & Variance Entries                                                       | GRNI وإدخالات التباين                                            |
| `grniReport.subtitle` | Goods Received Not Invoiced — Rapprochement comptable et journaux de variance | Goods Received Not Invoiced — Accounting reconciliation and variance journals | السلع المستقبلة غير المفوترة — المطابقة المحاسبية ودفاتر التباين |

#### KPIs

| Clé                                | FR                               | EN                               | AR                                     |
| ---------------------------------- | -------------------------------- | -------------------------------- | -------------------------------------- |
| `grniReport.kpi_grni_balance`      | Solde GRNI                       | GRNI Balance                     | رصيد GRNI                              |
| `grniReport.kpi_grni_balance_desc` | Biens reçus, factures en attente | Goods received, invoices pending | السلع المستقبلة، الفواتير قيد الانتظار |
| `grniReport.kpi_accrued_entries`   | Entrées comptabilisées           | Accrued Entries                  | إدخالات مستحقة                         |
| `grniReport.kpi_cleared_entries`   | Entrées soldées                  | Cleared Entries                  | إدخالات مُسددة                         |
| `grniReport.kpi_total_ppv`         | Total PPV                        | Total PPV                        | إجمالي PPV                             |
| `grniReport.kpi_total_ppv_desc`    | Écart prix d'achat               | Purchase price variance          | تباين سعر الشراء                       |
| `grniReport.kpi_fx_variance`       | Variance FX                      | FX Variance                      | تباين الصرف                            |
| `grniReport.kpi_fx_variance_desc`  | Gains/pertes de change           | Currency gains/losses            | أرباح/خسائر الصرف                      |

#### GRNI Table

| Clé                              | FR                   | EN                   | AR                  |
| -------------------------------- | -------------------- | -------------------- | ------------------- |
| `grniReport.grni_title`          | Solde GRNI par ligne | GRNI Balance by Line | رصيد GRNI حسب السطر |
| `grniReport.col_po`              | PO                   | PO                   | أمر الشراء          |
| `grniReport.col_grn`             | GRN                  | GRN                  | إشعار الاستقبال     |
| `grniReport.col_vendor`          | Fournisseur          | Vendor               | المورد              |
| `grniReport.col_product`         | Produit              | Product              | المنتج              |
| `grniReport.col_grn_amount`      | Montant GRN          | GRN Amount           | مبلغ GRN            |
| `grniReport.col_invoiced_amount` | Montant facturé      | Invoiced Amount      | المبلغ المفوتر      |
| `grniReport.col_grni_balance`    | Solde GRNI           | GRNI Balance         | رصيد GRNI           |
| `grniReport.col_status`          | Statut               | Status               | الحالة              |

#### GRNI Status

| Clé                               | FR          | EN            | AR             |
| --------------------------------- | ----------- | ------------- | -------------- |
| `grniReport.status_accrued`       | Provision   | Accrued       | مستحق          |
| `grniReport.status_cleared`       | Soldé       | Cleared       | مُسدَّد        |
| `grniReport.status_over_invoiced` | Sur-facturé | Over-invoiced | مُفرط-الفواتير |

#### Variance Journal

| Clé                              | FR                                                                                          | EN                                                                                 | AR                                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `grniReport.journal_title`       | Journaux de variance                                                                        | Variance Journals                                                                  | دفاتر التباين                                                                         |
| `grniReport.journal_subtitle`    | Écritures générées automatiquement — PPV (prix), QTY (quantité), IPV (facture), FX (change) | Auto-generated entries — PPV (price), QTY (quantity), IPV (invoice), FX (currency) | إدخالات معاد إنشاؤها تلقائياً — PPV (السعر)، QTY (الكمية)، IPV (الفاتورة)، FX (الصرف) |
| `grniReport.journal_no_variance` | Aucune variance détectée                                                                    | No variance detected                                                               | لم يتم اكتشاف أي تباين                                                                |
| `grniReport.col_journal_id`      | ID                                                                                          | ID                                                                                 | معرّف                                                                                 |
| `grniReport.col_type`            | Type                                                                                        | Type                                                                               | النوع                                                                                 |
| `grniReport.col_account`         | Compte                                                                                      | Account                                                                            | الحساب                                                                                |
| `grniReport.col_journal_po`      | PO                                                                                          | PO                                                                                 | أمر الشراء                                                                            |
| `grniReport.col_journal_product` | Produit                                                                                     | Product                                                                            | المنتج                                                                                |
| `grniReport.col_amount`          | Montant                                                                                     | Amount                                                                             | المبلغ                                                                                |
| `grniReport.col_date`            | Date                                                                                        | Date                                                                               | التاريخ                                                                               |
| `grniReport.col_description`     | Description                                                                                 | Description                                                                        | الوصف                                                                                 |

#### Variance Types

| Clé                       | FR  | EN  | AR  |
| ------------------------- | --- | --- | --- |
| `grniReport.variance_ppv` | PPV | PPV | PPV |
| `grniReport.variance_qty` | QTY | QTY | QTY |
| `grniReport.variance_ipv` | IPV | IPV | IPV |
| `grniReport.variance_fx`  | FX  | FX  | FX  |

#### Accounting Scheme

| Clé                                  | FR                              | EN                       | AR                           |
| ------------------------------------ | ------------------------------- | ------------------------ | ---------------------------- |
| `grniReport.scheme_title`            | Schéma comptable                | Accounting Scheme        | المخطط المحاسبي              |
| `grniReport.scheme_step2`            | Étape 2 — Réception (GRN)       | Step 2 — Reception (GRN) | الخطوة 2 — الاستقبال (GRN)   |
| `grniReport.scheme_step2_dr`         | DR Stocks (3100xx)              | DR Inventory (3100xx)    | DR المخزون (3100xx)          |
| `grniReport.scheme_step2_cr`         | CR GRNI (4080xx)                | CR GRNI (4080xx)         | CR GRNI (4080xx)             |
| `grniReport.scheme_step2_amount`     | base_qty × coût std             | base_qty × std cost      | base_qty × التكلفة المعيارية |
| `grniReport.scheme_step3`            | Étape 3 — Facture comptabilisée | Step 3 — Invoice Posted  | الخطوة 3 — الفاتورة المنشورة |
| `grniReport.scheme_step3_dr_grni`    | DR GRNI (4080xx)                | DR GRNI (4080xx)         | DR GRNI (4080xx)             |
| `grniReport.scheme_step3_settlement` | solde la provision              | settle accrual           | تسوية المستحق                |
| `grniReport.scheme_step3_dr_vat`     | DR TVA déductible (4450xx)      | DR Input VAT (4450xx)    | DR ضريبة المدخلات (4450xx)   |
| `grniReport.scheme_step3_cr_ap`      | CR Fournisseurs (4010xx)        | CR AP (4010xx)           | CR الحسابات الدائنة (4010xx) |
| `grniReport.scheme_step3_total`      | total TTC                       | total incl. tax          | الإجمالي شاملاً الضريبة      |

---

### T6.07 — DailyClosingPage (`dailyClosing`)

#### En-tête

| Clé                     | FR                                                        | EN                                                      | AR                                                  |
| ----------------------- | --------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------- |
| `dailyClosing.title`    | Clôture Quotidienne                                       | Daily Closing                                           | الإغلاق اليومي                                      |
| `dailyClosing.subtitle` | Réconciliation cash, stock camion, chèques et rapport PDF | Cash reconciliation, truck stock, checks and PDF report | المطابقة النقدية، مخزون الشاحنة، الشيكات وتقرير PDF |

#### KPIs

| Clé                               | FR             | EN                 | AR               |
| --------------------------------- | -------------- | ------------------ | ---------------- |
| `dailyClosing.kpi_total_closings` | Total clôtures | Total Closings     | إجمالي الإغلاقات |
| `dailyClosing.kpi_open`           | Ouvertes       | Open               | مفتوح            |
| `dailyClosing.kpi_closed`         | Clôturées      | Closed             | مُغلقة           |
| `dailyClosing.kpi_discrepancies`  | Avec écarts    | With Discrepancies | مع التناقضات     |
| `dailyClosing.kpi_total_cash`     | Total espèces  | Total Cash         | إجمالي النقد     |
| `dailyClosing.kpi_total_cheques`  | Total chèques  | Total Checks       | إجمالي الشيكات   |

#### Filters

| Clé                               | FR                    | EN               | AR                |
| --------------------------------- | --------------------- | ---------------- | ----------------- |
| `dailyClosing.filter_date`        | Filtrer par date      | Filter by Date   | تصفية حسب التاريخ |
| `dailyClosing.filter_driver`      | Filtrer par chauffeur | Filter by Driver | تصفية حسب السائق  |
| `dailyClosing.filter_all_dates`   | Toutes les dates      | All Dates        | جميع التواريخ     |
| `dailyClosing.filter_all_drivers` | Tous les chauffeurs   | All Drivers      | جميع السائقين     |

#### Status

| Clé                                  | FR       | EN             | AR           |
| ------------------------------------ | -------- | -------------- | ------------ |
| `dailyClosing.status_open`           | Ouvert   | Open           | مفتوح        |
| `dailyClosing.status_pending_review` | En revue | Pending Review | قيد المراجعة |
| `dailyClosing.status_closed`         | Clôturé  | Closed         | مُغلق        |
| `dailyClosing.status_discrepancy`    | Écart    | Discrepancy    | تناقض        |

#### Closing Record Details

| Clé                                 | FR                         | EN                    | AR                   |
| ----------------------------------- | -------------------------- | --------------------- | -------------------- |
| `dailyClosing.col_cash`             | Espèces                    | Cash                  | النقد                |
| `dailyClosing.col_cash_expected`    | Espèces attendues          | Expected Cash         | النقد المتوقع        |
| `dailyClosing.col_cash_collected`   | Espèces collectées         | Collected Cash        | النقد المجموع        |
| `dailyClosing.col_cash_discrepancy` | Écart:                     | Variance:             | التناقض:             |
| `dailyClosing.col_cheques`          | Chèques                    | Checks                | الشيكات              |
| `dailyClosing.col_cheques_amount`   | Montant                    | Amount                | المبلغ               |
| `dailyClosing.col_cheques_count`    | chèque(s)                  | check(s)              | شيك(ات)              |
| `dailyClosing.col_deliveries`       | Livraisons                 | Deliveries            | التسليمات            |
| `dailyClosing.col_completed`        | Livrées                    | Completed             | مُكتملة              |
| `dailyClosing.col_returns`          | retour(s)                  | return(s)             | عودة                 |
| `dailyClosing.col_truck_stock`      | Stock camion               | Truck Stock           | مخزون الشاحنة        |
| `dailyClosing.col_stock_conforming` | ✓ Conforme                 | ✓ Conforming          | ✓ متطابق             |
| `dailyClosing.col_stock_missing`    | {count} articles manquants | {count} items missing | {count} عناصر مفقودة |

#### Buttons

| Clé                      | FR       | EN    | AR    |
| ------------------------ | -------- | ----- | ----- |
| `dailyClosing.btn_pdf`   | PDF      | PDF   | PDF   |
| `dailyClosing.btn_close` | Clôturer | Close | إغلاق |

#### Discrepancies

| Clé                                | FR              | EN                     | AR             |
| ---------------------------------- | --------------- | ---------------------- | -------------- |
| `dailyClosing.discrepancies_title` | Écarts détectés | Detected Discrepancies | تناقضات مكتشفة |

#### Empty State

| Clé                                          | FR    | EN    | AR    |
| -------------------------------------------- | ----- | ----- | ----- |
| (N/A - liste vide montrée si aucune clôture) | (N/A) | (N/A) | (N/A) |

#### Toasts

| Clé                                         | FR                                    | EN                                   | AR                                  |
| ------------------------------------------- | ------------------------------------- | ------------------------------------ | ----------------------------------- |
| `dailyClosing.toast_closing_validated`      | Clôture validée                       | Closing Validated                    | تم التحقق من الإغلاق                |
| `dailyClosing.toast_closing_validated_desc` | {id} — journée clôturée               | {id} — day closed                    | {id} — تم إغلاق اليوم               |
| `dailyClosing.toast_pdf_generated`          | PDF généré                            | PDF Generated                        | تم إنشاء PDF                        |
| `dailyClosing.toast_pdf_generated_desc`     | Rapport clôture {date} — {driverName} | Closing report {date} — {driverName} | تقرير الإغلاق {date} — {driverName} |

---

## 📝 Détails de traduction — Phase 7

### T7.01 — PricingPage (`pricing`)

#### En-tête

| Clé                | FR                                                         | EN                                                           | AR                                                   |
| ------------------ | ---------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| `pricing.title`    | Grille Tarifaire                                           | Pricing Grid                                                 | شبكة الأسعار                                         |
| `pricing.subtitle` | Gestion multi-prix par type de client — {count} produit(s) | Multi-price management by customer type — {count} product(s) | إدارة الأسعار المتعددة حسب نوع العميل — {count} منتج |

#### Filter Banner (Product)

| Clé                           | FR                   | EN                   | AR                  |
| ----------------------------- | -------------------- | -------------------- | ------------------- |
| `pricing.filter_banner_label` | Filtré par produit : | Filtered by product: | مصفى حسب المنتج:    |
| `pricing.filter_banner_sku`   | (SKU)                | (SKU)                | (SKU)               |
| `pricing.btn_view_all`        | Voir tous            | View All             | عرض الكل            |
| `pricing.btn_back_catalog`    | Retour catalogue     | Back to Catalog      | العودة إلى الكتالوج |

#### Buttons & Actions

| Clé                          | FR                             | EN                    | AR                    |
| ---------------------------- | ------------------------------ | --------------------- | --------------------- |
| `pricing.btn_bulk_update`    | Mise à jour en masse ({count}) | Bulk Update ({count}) | تحديث جماعي ({count}) |
| `pricing.select_client_type` | Type client                    | Client Type           | نوع العميل            |

#### KPIs

| Clé                             | FR               | EN                | AR              |
| ------------------------------- | ---------------- | ----------------- | --------------- |
| `pricing.kpi_configured_prices` | Prix configurés  | Configured Prices | الأسعار المكونة |
| `pricing.kpi_avg_margin`        | Marge moyenne    | Average Margin    | متوسط الهامش    |
| `pricing.kpi_negative_margins`  | Marges négatives | Negative Margins  | الهوامش السالبة |

#### Search & Filters

| Clé                              | FR                           | EN                       | AR                       |
| -------------------------------- | ---------------------------- | ------------------------ | ------------------------ |
| `pricing.search_placeholder`     | Rechercher par nom ou SKU... | Search by name or SKU... | ابحث حسب الاسم أو SKU... |
| `pricing.filter_approval_status` | Statut approbation           | Approval Status          | حالة الموافقة            |
| `pricing.filter_all_status`      | Tous les statuts             | All Status               | جميع الحالات             |
| `pricing.filter_draft`           | Brouillon                    | Draft                    | مسودة                    |
| `pricing.filter_pending`         | En attente                   | Pending                  | قيد الانتظار             |
| `pricing.filter_approved`        | Approuvé                     | Approved                 | موافق عليه               |
| `pricing.filter_unconfigured`    | Non configuré                | Unconfigured             | غير مكون                 |
| `pricing.filter_margin`          | Filtre marge                 | Margin Filter            | تصفية الهامش             |
| `pricing.filter_all_margins`     | Toutes marges                | All Margins              | جميع الهوامش             |
| `pricing.filter_negative_margin` | Négative (<0%)               | Negative (<0%)           | سالب (<0%)               |
| `pricing.filter_low_margin`      | Faible (<10%)                | Low (<10%)               | منخفض (<10%)             |
| `pricing.filter_medium_margin`   | Moyenne (10-20%)             | Medium (10-20%)          | متوسط (10-20%)           |
| `pricing.filter_high_margin`     | Bonne (>20%)                 | Good (>20%)              | جيد (>20%)               |

#### Table Header

| Clé                      | FR                              | EN                          | AR                          |
| ------------------------ | ------------------------------- | --------------------------- | --------------------------- |
| `pricing.table_title`    | Grille tarifaire — {clientType} | Pricing Grid — {clientType} | شبكة الأسعار — {clientType} |
| `pricing.col_product`    | Produit                         | Product                     | المنتج                      |
| `pricing.col_sku`        | SKU                             | SKU                         | SKU                         |
| `pricing.col_cost`       | Coût                            | Cost                        | التكلفة                     |
| `pricing.col_unit_price` | Prix unitaire                   | Unit Price                  | السعر الوحدة                |
| `pricing.col_margin`     | Marge                           | Margin                      | الهامش                      |
| `pricing.col_min_qty`    | Qté min                         | Min Qty                     | أدنى كمية                   |
| `pricing.col_status`     | Statut                          | Status                      | الحالة                      |
| `pricing.col_actions`    | Actions                         | Actions                     | الإجراءات                   |
| `pricing.empty_products` | Aucun produit correspondant     | No matching products        | لا توجد منتجات متطابقة      |

#### Pagination

| Clé                       | FR                                                     | EN                                                   | AR                                                 |
| ------------------------- | ------------------------------------------------------ | ---------------------------------------------------- | -------------------------------------------------- |
| `pricing.pagination_page` | Page {current} / {total} — {total_results} résultat(s) | Page {current} / {total} — {total_results} result(s) | الصفحة {current} / {total} — {total_results} نتيجة |
| `pricing.btn_previous`    | Précédent                                              | Previous                                             | السابق                                             |
| `pricing.btn_next`        | Suivant                                                | Next                                                 | التالي                                             |

#### Approval Status Labels

| Clé                       | FR         | EN       | AR           |
| ------------------------- | ---------- | -------- | ------------ |
| `pricing.status_draft`    | Brouillon  | Draft    | مسودة        |
| `pricing.status_pending`  | En attente | Pending  | قيد الانتظار |
| `pricing.status_approved` | Approuvé   | Approved | موافق عليه   |

#### Toasts

| Clé                               | FR                                        | EN                                       | AR                                         |
| --------------------------------- | ----------------------------------------- | ---------------------------------------- | ------------------------------------------ |
| `pricing.toast_saved`             | Prix enregistré                           | Price Saved                              | تم حفظ السعر                               |
| `pricing.toast_saving_desc`       | Prix de "{productName}" mis à jour.       | Price of "{productName}" updated.        | تم تحديث سعر "{productName}".              |
| `pricing.toast_bulk_updated`      | Mise à jour en masse                      | Bulk Update                              | تحديث جماعي                                |
| `pricing.toast_bulk_updated_desc` | {count} prix mis à jour de {percentage}%. | {count} prices updated by {percentage}%. | {count} سعر تم تحديثه بنسبة {percentage}%. |

---

### T7.02 — PriceForm (`pricing`)

#### Dialog

| Clé                  | FR                   | EN                    | AR                    |
| -------------------- | -------------------- | --------------------- | --------------------- |
| `pricing.form_title` | Prix — {productName} | Price — {productName} | السعر — {productName} |

#### Form Fields

| Clé                                | FR                     | EN                  | AR                    |
| ---------------------------------- | ---------------------- | ------------------- | --------------------- |
| `pricing.form_unit_price`          | Prix unitaire (DZD) \* | Unit Price (DZD) \* | السعر الوحدة (د.ج) \* |
| `pricing.form_min_qty`             | Quantité minimum       | Minimum Quantity    | أدنى كمية             |
| `pricing.form_min_qty_placeholder` | Optionnel              | Optional            | اختياري               |
| `pricing.form_approval_status`     | Statut d'approbation   | Approval Status     | حالة الموافقة         |
| `pricing.form_status_draft`        | Brouillon              | Draft               | مسودة                 |
| `pricing.form_status_pending`      | En attente             | Pending             | قيد الانتظار          |
| `pricing.form_status_approved`     | Approuvé               | Approved            | موافق عليه            |

#### Validation

| Clé                            | FR                    | EN                | AR                    |
| ------------------------------ | --------------------- | ----------------- | --------------------- |
| `pricing.validation_price_min` | Le prix doit être ≥ 0 | Price must be ≥ 0 | يجب أن يكون السعر ≥ 0 |

#### Buttons

| Clé                  | FR          | EN     | AR    |
| -------------------- | ----------- | ------ | ----- |
| `pricing.btn_cancel` | Annuler     | Cancel | إلغاء |
| `pricing.btn_save`   | Enregistrer | Save   | حفظ   |

---

### T7.03 — PriceHistoryDrawer (`pricing`)

#### Header

| Clé                     | FR                                   | EN                                | AR                           |
| ----------------------- | ------------------------------------ | --------------------------------- | ---------------------------- |
| `pricing.history_title` | Historique Financier — {productName} | Financial History — {productName} | السجل المالي — {productName} |

#### Charts

| Clé                                | FR              | EN               | AR             |
| ---------------------------------- | --------------- | ---------------- | -------------- |
| `pricing.history_price_cost_label` | Prix & Coût     | Price & Cost     | السعر والتكلفة |
| `pricing.history_price_label`      | Prix            | Price            | السعر          |
| `pricing.history_cost_label`       | Coût            | Cost             | التكلفة        |
| `pricing.history_margin_label`     | Évolution Marge | Margin Evolution | تطور الهامش    |
| `pricing.history_margin`           | Marge           | Margin           | الهامش         |

#### Change Type Labels

| Clé                              | FR        | EN         | AR            |
| -------------------------------- | --------- | ---------- | ------------- |
| `pricing.change_type_price`      | Prix      | Price      | السعر         |
| `pricing.change_type_cost`       | Coût      | Cost       | التكلفة       |
| `pricing.change_type_both`       | Prix+Coût | Price+Cost | السعر+التكلفة |
| `pricing.change_type_bulk_price` | Masse     | Bulk       | جماعي         |
| `pricing.change_type_initial`    | Initial   | Initial    | ابتدائي       |

#### Source Labels

| Clé                       | FR           | EN       | AR       |
| ------------------------- | ------------ | -------- | -------- |
| `pricing.source_pricing`  | Tarification | Pricing  | التسعير  |
| `pricing.source_products` | Produits     | Products | المنتجات |
| `pricing.source_import`   | Import       | Import   | استيراد  |
| `pricing.source_api`      | API          | API      | API      |

#### History Entry

| Clé                                  | FR                         | EN                   | AR               |
| ------------------------------------ | -------------------------- | -------------------- | ---------------- |
| `pricing.history_via`                | via {source}               | via {source}         | عبر {source}     |
| `pricing.history_price_label_entry`  | Prix:                      | Price:               | السعر:           |
| `pricing.history_cost_label_entry`   | Coût:                      | Cost:                | التكلفة:         |
| `pricing.history_margin_label_entry` | Marge:                     | Margin:              | الهامش:          |
| `pricing.history_empty`              | Aucun historique financier | No financial history | لا يوجد سجل مالي |

#### Tooltips

| Clé                          | FR                   | EN                   | AR                   |
| ---------------------------- | -------------------- | -------------------- | -------------------- |
| `pricing.history_changed_at` | {date} — {changedBy} | {date} — {changedBy} | {date} — {changedBy} |

---

### T7.04 — BulkUpdateDialog (`pricing`)

#### Dialog

| Clé                     | FR                        | EN                      | AR               |
| ----------------------- | ------------------------- | ----------------------- | ---------------- |
| `pricing.bulk_title`    | Mise à jour en masse      | Bulk Update             | تحديث جماعي      |
| `pricing.bulk_subtitle` | {count} prix sélectionnés | {count} prices selected | {count} سعر محدد |

#### Form

| Clé                                   | FR                                                                                                 | EN                                                                                      | AR                                                                                   |
| ------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `pricing.bulk_percentage_label`       | Variation en pourcentage (%)                                                                       | Percentage Change (%)                                                                   | تغيير النسبة المئوية (%)                                                             |
| `pricing.bulk_percentage_placeholder` | Ex: 5 pour +5%, -3 pour -3%                                                                        | Ex: 5 for +5%, -3 for -3%                                                               | مثال: 5 لـ +5%، -3 لـ -3%                                                            |
| `pricing.bulk_note`                   | Positif = augmentation, négatif = réduction. Les prix mis à jour passeront en statut "En attente". | Positive = increase, negative = decrease. Updated prices will move to "Pending" status. | المثبت = الزيادة، السالب = الانخفاض. الأسعار المحدثة ستنتقل إلى حالة "قيد الانتظار". |

#### Preview Table

| Clé                              | FR                            | EN                         | AR                      |
| -------------------------------- | ----------------------------- | -------------------------- | ----------------------- |
| `pricing.bulk_preview_product`   | Produit                       | Product                    | المنتج                  |
| `pricing.bulk_preview_old_price` | Ancien prix                   | Old Price                  | السعر القديم            |
| `pricing.bulk_preview_new_price` | Nouveau prix                  | New Price                  | السعر الجديد            |
| `pricing.bulk_preview_margin`    | Marge                         | Margin                     | الهامش                  |
| `pricing.bulk_preview_remaining` | + {count} autre(s) produit(s) | + {count} other product(s) | + {count} منتج(ات) أخرى |

#### Buttons

| Clé                       | FR                        | EN                    | AR                    |
| ------------------------- | ------------------------- | --------------------- | --------------------- |
| `pricing.btn_cancel_bulk` | Annuler                   | Cancel                | إلغاء                 |
| `pricing.btn_apply_bulk`  | Appliquer ({percentage}%) | Apply ({percentage}%) | تطبيق ({percentage}%) |

---

### T7.05 — ClientTypesPage (`clientTypes`)

#### Header

| Clé                    | FR                                                                | EN                                                    | AR                               |
| ---------------------- | ----------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------- |
| `clientTypes.title`    | Types de Clients                                                  | Customer Types                                        | أنواع العملاء                    |
| `clientTypes.subtitle` | Gérez les catégories de clients pour la tarification différenciée | Manage customer categories for differentiated pricing | أدر فئات العملاء للتسعير المختلف |

#### Buttons

| Clé                   | FR           | EN       | AR       |
| --------------------- | ------------ | -------- | -------- |
| `clientTypes.btn_new` | Nouveau type | New Type | نوع جديد |

#### Table

| Clé                           | FR                          | EN                           | AR                        |
| ----------------------------- | --------------------------- | ---------------------------- | ------------------------- |
| `clientTypes.table_title`     | Liste des types ({count})   | List of Types ({count})      | قائمة الأنواع ({count})   |
| `clientTypes.col_name`        | Nom                         | Name                         | الاسم                     |
| `clientTypes.col_description` | Description                 | Description                  | الوصف                     |
| `clientTypes.col_default`     | Défaut                      | Default                      | افتراضي                   |
| `clientTypes.col_status`      | Statut                      | Status                       | الحالة                    |
| `clientTypes.col_actions`     | Actions                     | Actions                      | الإجراءات                 |
| `clientTypes.empty_list`      | Aucun type client configuré | No customer types configured | لم تتم معايير أي نوع عميل |

#### Status Badges

| Clé                             | FR         | EN       | AR      |
| ------------------------------- | ---------- | -------- | ------- |
| `clientTypes.badge_default`     | Par défaut | Default  | افتراضي |
| `clientTypes.status_active`     | Actif      | Active   | نشط     |
| `clientTypes.status_inactive`   | Inactif    | Inactive | غير نشط |
| `clientTypes.empty_description` | —          | —        | —       |

#### Confirm Dialog

| Clé                                 | FR                               | EN                                  | AR                         |
| ----------------------------------- | -------------------------------- | ----------------------------------- | -------------------------- |
| `clientTypes.confirm_disable_title` | Désactiver ce type ?             | Disable this type?                  | تعطيل هذا النوع؟           |
| `clientTypes.confirm_enable_title`  | Réactiver ce type ?              | Enable this type?                   | تفعيل هذا النوع؟           |
| `clientTypes.confirm_disable_desc`  | Le type "{name}" sera désactivé. | The type "{name}" will be disabled. | سيتم تعطيل النوع "{name}". |
| `clientTypes.confirm_enable_desc`   | Le type "{name}" sera réactivé.  | The type "{name}" will be enabled.  | سيتم تفعيل النوع "{name}". |
| `clientTypes.btn_confirm_disable`   | Désactiver                       | Disable                             | تعطيل                      |
| `clientTypes.btn_confirm_enable`    | Activer                          | Enable                              | تفعيل                      |

#### Toasts

| Clé                               | FR                               | EN                         | AR                     |
| --------------------------------- | -------------------------------- | -------------------------- | ---------------------- |
| `clientTypes.toast_created`       | Type client créé                 | Customer Type Created      | تم إنشاء نوع العميل    |
| `clientTypes.toast_created_desc`  | "{name}" a été ajouté.           | "{name}" has been added.   | تمت إضافة "{name}".    |
| `clientTypes.toast_updated`       | Type client modifié              | Customer Type Modified     | تم تعديل نوع العميل    |
| `clientTypes.toast_updated_desc`  | "{name}" a été mis à jour.       | "{name}" has been updated. | تم تحديث "{name}".     |
| `clientTypes.toast_enabled`       | Type activé                      | Type Enabled               | تم تفعيل النوع         |
| `clientTypes.toast_enabled_desc`  | "{name}" est maintenant actif.   | "{name}" is now active.    | "{name}" نشط الآن.     |
| `clientTypes.toast_disabled`      | Type désactivé                   | Type Disabled              | تم تعطيل النوع         |
| `clientTypes.toast_disabled_desc` | "{name}" est maintenant inactif. | "{name}" is now inactive.  | "{name}" غير نشط الآن. |

---

### T7.06 — ClientTypeForm (`clientTypes`)

#### Dialog

| Clé                             | FR                      | EN                 | AR               |
| ------------------------------- | ----------------------- | ------------------ | ---------------- |
| `clientTypes.form_create_title` | Nouveau type client     | New Customer Type  | نوع عميل جديد    |
| `clientTypes.form_edit_title`   | Modifier le type client | Edit Customer Type | تعديل نوع العميل |

#### Form Fields

| Clé                                        | FR                            | EN                           | AR                |
| ------------------------------------------ | ----------------------------- | ---------------------------- | ----------------- |
| `clientTypes.form_name`                    | Nom \*                        | Name \*                      | الاسم \*          |
| `clientTypes.form_name_placeholder`        | Ex: Grossiste                 | Ex: Wholesaler               | مثال: الجملة      |
| `clientTypes.form_description`             | Description                   | Description                  | الوصف             |
| `clientTypes.form_description_placeholder` | Description du type client... | Customer type description... | وصف نوع العميل... |
| `clientTypes.form_is_default_label`        | Type par défaut               | Default Type                 | النوع الافتراضي   |
| `clientTypes.form_status_label`            | Statut                        | Status                       | الحالة            |
| `clientTypes.form_status_active`           | Actif                         | Active                       | نشط               |
| `clientTypes.form_status_inactive`         | Inactif                       | Inactive                     | غير نشط           |

#### Buttons

| Clé                           | FR          | EN     | AR    |
| ----------------------------- | ----------- | ------ | ----- |
| `clientTypes.btn_form_cancel` | Annuler     | Cancel | إلغاء |
| `clientTypes.btn_form_create` | Créer       | Create | إنشاء |
| `clientTypes.btn_form_save`   | Enregistrer | Save   | حفظ   |

---

## ⚠️ Règles

- **Namespace** : 1 namespace par page/module (pas de clés à la racine)
- **Interpolation** : utiliser `{variable}` pour les données dynamiques → `t('key', { count: 5 })`
- **Pluriels** : utiliser `_one` / `_other` quand nécessaire
- **RTL** : vérifier le rendu arabe avec `dir="rtl"` sur chaque page
- **Fallback** : la langue de secours est `fr` (configuré dans `src/i18n/index.ts`)
- **Toasts** : les messages de toast doivent aussi être traduits
- **Statuts** : les badges de statut (StatusBadge) doivent utiliser des clés i18n
