// ============================================================
// Jawda — Barrel Re-export (backward-compatible)
// All imports from "@/data/mockData" continue to work.
// Data is now split into domain files for maintainability.
// ============================================================

// Master Data
export { currency, pct } from "./masterData";
export type { Product, ProductType, CostMethod, Vendor, VendorPaymentTerms, VendorStatus, Warehouse, WarehouseType, WarehouseStatus, WarehouseLocation, Sector, ProductCategory, SubCategory, UnitOfMeasure, UnitKind, Carrier, BarcodeType, Barcode, PaymentTerm } from "./masterData";
export { products, vendors, warehouses, warehouseLocations, sectors, productCategories, subCategories, unitsOfMeasure, carriers, barcodes, paymentTerms } from "./masterData";

// Users & Governance
export type { UserRole, GovernancePermission, User } from "./userData";
export { GOVERNANCE_LABELS, USER_ROLE_LABELS, USER_ROLE_LEVEL, users } from "./userData";

// Transactional Data
export type { POStatus, POLine, PurchaseOrder, GrnStatus, GrnLine, Grn, CycleCountStatus, CycleCountLine, CycleCount, AdjustmentType, AdjustmentStatus, StockAdjustment, TransferStatus, StockTransfer, Customer, SalesOrderStatus, SOLine, SalesOrder, TripStatus, DeliveryStatus, DeliveryOrder, DeliveryTrip, InvoiceStatus, Invoice, PaymentMethod, PaymentStatus, Payment, ReturnType, ReturnStatus, ReturnOrder, ReturnLine, ReturnReasonCode, DispositionCode, RefundMethod, AlertPriority, AlertCategory, Alert, InventoryItem, CreditNoteType, CreditNoteStatus, CreditNoteRefType, CreditNoteLine, CreditNote, ClaimType, ClaimStatus, ClaimPriority, SettlementType, RootCauseCode, QualityClaim } from "./transactionalData";
export { purchaseOrders, grns, cycleCounts, stockAdjustments, stockTransfers, customers, salesOrders, deliveryTrips, invoices, payments, returns, alerts, inventory, creditNotes, qualityClaims } from "./transactionalData";

// Operational Data
export type { QCInspectionStatus, QCDefectType, QCInspectionLine, QCInspection, PutawayStatus, PutawayStrategy, PutawayTask, MovementType, StockMovement, CrossDockStatus, CrossDock, KitStatus, KitComponent, KitRecipe, KitOrder, StockBlockStatus, StockBlock, RepackStatus, RepackOrder, LotStatus, LotBatch, SerialStatus, SerialNumber } from "./operationalData";
export { qcInspections, putawayTasks, MOVEMENT_TYPE_LABELS, stockMovements, crossDocks, kitRecipes, kitOrders, stockBlocks, repackOrders, lotBatches, serialNumbers } from "./operationalData";

// Historical Data (Jan 2024 → Nov 2025)
export { historicalPOs, historicalSOs, historicalInvoices, historicalPayments, historicalGrns, historicalCycleCounts } from "./historicalData";
