import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  grns as initialGrns,
  purchaseOrders as initialPOs,
  inventory as initialInventory,
  stockAdjustments as initialAdjustments,
  stockTransfers as initialTransfers,
  cycleCounts as initialCycleCounts,
  returns as initialReturns,
  salesOrders as initialSalesOrders,
  customers as initialCustomers,
  invoices as initialInvoices,
  payments as initialPayments,
  deliveryTrips as initialDeliveryTrips,
  alerts as initialAlerts,
  vendors as initialVendors,
  warehouses as initialWarehouses,
  warehouseLocations as initialWarehouseLocations,
  products as initialProducts,
  productCategories as initialCategories,
  sectors as initialSectors,
  subCategories as initialSubCategories,
  unitsOfMeasure as initialUOM,
  carriers as initialCarriers,
  barcodes as initialBarcodes,
  paymentTerms as initialPaymentTerms,
  qcInspections as initialQCInspections,
  putawayTasks as initialPutawayTasks,
  stockMovements as initialStockMovements,
  crossDocks as initialCrossDocks,
  kitRecipes as initialKitRecipes,
  kitOrders as initialKitOrders,
  stockBlocks as initialStockBlocks,
  repackOrders as initialRepackOrders,
  lotBatches as initialLotBatches,
  serialNumbers as initialSerialNumbers,
  creditNotes as initialCreditNotes,
  qualityClaims as initialQualityClaims,
} from "@/data/mockData";
import type {
  Grn, PurchaseOrder, StockAdjustment, StockTransfer, CycleCount, ReturnOrder,
  SalesOrder, Customer, Invoice, Payment, DeliveryTrip, Alert, Vendor, Warehouse,
  WarehouseLocation, Product, Sector, ProductCategory, SubCategory, UnitOfMeasure, Carrier, Barcode,
  QCInspection, PutawayTask, StockMovement,
  CrossDock, KitRecipe, KitOrder, StockBlock, RepackOrder,
  LotBatch, SerialNumber, PaymentTerm,
  CreditNote, QualityClaim,
} from "@/data/mockData";
import type { InventoryItem } from "@/data/mockData";
import {
  dockSlots as initialDockSlots,
  truckCheckIns as initialTruckCheckIns,
  gateLogs as initialGateLogs,
  putawayRules as initialPutawayRules,
  alertRules as initialAlertRules,
  locationTypes as initialLocationTypes,
  integrations as initialIntegrations,
  importJobs as initialImportJobs,
} from "@/data/mockDataPhase20_22";
import type {
  DockSlot, TruckCheckIn, GateLog,
  PutawayRule, AlertRule, LocationType,
  Integration, ImportJob,
} from "@/data/mockDataPhase20_22";
import { productUnitConversions as initialPUC, productBaseUnits as initialPBU, productDimensions as initialPDim, warehouseProducts as initialWHP } from "@/data/productUnitConversions";
import type { ProductUnitConversion, ProductDimensions, WarehouseProduct } from "@/lib/unitConversion";
import type { ProductBaseUnit } from "@/data/productUnitConversions";
import type { ProductHistory } from "@/types/productHistory";
import { loadPersistedState, savePersistedState, type PersistedWMSState } from "@/lib/wmsStorage";

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

function getDefaultPersistedState(): PersistedWMSState {
  return {
    grns: [...initialGrns],
    purchaseOrders: [...initialPOs],
    inventory: [...initialInventory],
    stockAdjustments: [...initialAdjustments],
    stockTransfers: [...initialTransfers],
    cycleCounts: [...initialCycleCounts],
    returns: [...initialReturns],
    salesOrders: [...initialSalesOrders],
    customers: [...initialCustomers],
    invoices: [...initialInvoices],
    payments: [...initialPayments],
    deliveryTrips: [...initialDeliveryTrips],
    alerts: [...initialAlerts],
    vendors: [...initialVendors],
    paymentTerms: [...initialPaymentTerms],
    warehouses: [...initialWarehouses],
    warehouseLocations: [...initialWarehouseLocations],
    products: [...initialProducts],
    productCategories: [...initialCategories],
    sectors: [...initialSectors],
    subCategories: [...initialSubCategories],
    unitsOfMeasure: [...initialUOM],
    carriers: [...initialCarriers],
    barcodes: [...initialBarcodes],
    qcInspections: [...initialQCInspections],
    putawayTasks: [...initialPutawayTasks],
    stockMovements: [...initialStockMovements],
    crossDocks: [...initialCrossDocks],
    kitRecipes: [...initialKitRecipes],
    kitOrders: [...initialKitOrders],
    stockBlocks: [...initialStockBlocks],
    repackOrders: [...initialRepackOrders],
    lotBatches: [...initialLotBatches],
    serialNumbers: [...initialSerialNumbers],
    // Phase 20-22
    dockSlots: [...initialDockSlots],
    truckCheckIns: [...initialTruckCheckIns],
    gateLogs: [...initialGateLogs],
    putawayRules: [...initialPutawayRules],
    alertRules: [...initialAlertRules],
    locationTypes: [...initialLocationTypes],
    integrations: [...initialIntegrations],
    importJobs: [...initialImportJobs],
    // Unit conversion system
    productUnitConversions: [...initialPUC],
    productBaseUnits: [...initialPBU],
    productDimensions: [...initialPDim],
    warehouseProducts: [...initialWHP],
    productHistory: [],
    // ERP Returns & Claims
    creditNotes: [...initialCreditNotes],
    qualityClaims: [...initialQualityClaims],
  };
}

interface WMSDataContextValue {
  grns: Grn[]; setGrns: SetState<Grn[]>;
  purchaseOrders: PurchaseOrder[]; setPurchaseOrders: SetState<PurchaseOrder[]>;
  inventory: InventoryItem[]; setInventory: SetState<InventoryItem[]>;
  stockAdjustments: StockAdjustment[]; setStockAdjustments: SetState<StockAdjustment[]>;
  stockTransfers: StockTransfer[]; setStockTransfers: SetState<StockTransfer[]>;
  cycleCounts: CycleCount[]; setCycleCounts: SetState<CycleCount[]>;
  returns: ReturnOrder[]; setReturns: SetState<ReturnOrder[]>;
  salesOrders: SalesOrder[]; setSalesOrders: SetState<SalesOrder[]>;
  customers: Customer[]; setCustomers: SetState<Customer[]>;
  invoices: Invoice[]; setInvoices: SetState<Invoice[]>;
  payments: Payment[]; setPayments: SetState<Payment[]>;
  deliveryTrips: DeliveryTrip[]; setDeliveryTrips: SetState<DeliveryTrip[]>;
  alerts: Alert[]; setAlerts: SetState<Alert[]>;
  vendors: Vendor[]; setVendors: SetState<Vendor[]>;
  paymentTerms: PaymentTerm[]; setPaymentTerms: SetState<PaymentTerm[]>;
  warehouses: Warehouse[]; setWarehouses: SetState<Warehouse[]>;
  warehouseLocations: WarehouseLocation[]; setWarehouseLocations: SetState<WarehouseLocation[]>;
  products: Product[]; setProducts: SetState<Product[]>;
  sectors: Sector[]; setSectors: SetState<Sector[]>;
  productCategories: ProductCategory[]; setProductCategories: SetState<ProductCategory[]>;
  subCategories: SubCategory[]; setSubCategories: SetState<SubCategory[]>;
  unitsOfMeasure: UnitOfMeasure[]; setUnitsOfMeasure: SetState<UnitOfMeasure[]>;
  carriers: Carrier[]; setCarriers: SetState<Carrier[]>;
  barcodes: Barcode[]; setBarcodes: SetState<Barcode[]>;
  qcInspections: QCInspection[]; setQCInspections: SetState<QCInspection[]>;
  putawayTasks: PutawayTask[]; setPutawayTasks: SetState<PutawayTask[]>;
  stockMovements: StockMovement[]; setStockMovements: SetState<StockMovement[]>;
  crossDocks: CrossDock[]; setCrossDocks: SetState<CrossDock[]>;
  kitRecipes: KitRecipe[]; setKitRecipes: SetState<KitRecipe[]>;
  kitOrders: KitOrder[]; setKitOrders: SetState<KitOrder[]>;
  stockBlocks: StockBlock[]; setStockBlocks: SetState<StockBlock[]>;
  repackOrders: RepackOrder[]; setRepackOrders: SetState<RepackOrder[]>;
  lotBatches: LotBatch[]; setLotBatches: SetState<LotBatch[]>;
  serialNumbers: SerialNumber[]; setSerialNumbers: SetState<SerialNumber[]>;
  // Phase 20-22
  dockSlots: DockSlot[]; setDockSlots: SetState<DockSlot[]>;
  truckCheckIns: TruckCheckIn[]; setTruckCheckIns: SetState<TruckCheckIn[]>;
  gateLogs: GateLog[]; setGateLogs: SetState<GateLog[]>;
  putawayRules: PutawayRule[]; setPutawayRules: SetState<PutawayRule[]>;
  alertRules: AlertRule[]; setAlertRules: SetState<AlertRule[]>;
  locationTypes: LocationType[]; setLocationTypes: SetState<LocationType[]>;
  integrations: Integration[]; setIntegrations: SetState<Integration[]>;
  importJobs: ImportJob[]; setImportJobs: SetState<ImportJob[]>;
  // Unit conversion system
  productUnitConversions: ProductUnitConversion[]; setProductUnitConversions: SetState<ProductUnitConversion[]>;
  productBaseUnits: ProductBaseUnit[]; setProductBaseUnits: SetState<ProductBaseUnit[]>;
  productDimensions: ProductDimensions[]; setProductDimensions: SetState<ProductDimensions[]>;
  warehouseProducts: WarehouseProduct[]; setWarehouseProducts: SetState<WarehouseProduct[]>;
  productHistory: ProductHistory[]; setProductHistory: SetState<ProductHistory[]>;
  // ERP Returns & Claims
  creditNotes: CreditNote[]; setCreditNotes: SetState<CreditNote[]>;
  qualityClaims: QualityClaim[]; setQualityClaims: SetState<QualityClaim[]>;
  resetData: () => void;
}

const WMSDataContext = createContext<WMSDataContextValue | null>(null);

function makeSetter<T>(setState: React.Dispatch<React.SetStateAction<PersistedWMSState>>, key: keyof PersistedWMSState): SetState<T[]> {
  return useCallback(
    (action: React.SetStateAction<T[]>) => {
      setState((prev) => ({
        ...prev,
        [key]: typeof action === "function" ? (action as (prev: T[]) => T[])(prev[key] as T[]) : action,
      }));
    },
    [key, setState]
  );
}

export function WMSDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedWMSState>(() => {
    const loaded = loadPersistedState();
    if (loaded) {
      // Migration: add new fields if missing from old persisted state
      if (!loaded.warehouses) loaded.warehouses = [...initialWarehouses];
      if (!loaded.warehouseLocations) loaded.warehouseLocations = [...initialWarehouseLocations];
      if (!loaded.products) loaded.products = [...initialProducts];
      if (!loaded.productCategories) loaded.productCategories = [...initialCategories];
      if (!loaded.sectors) loaded.sectors = [...initialSectors];
      if (!loaded.subCategories) loaded.subCategories = [...initialSubCategories];
      if (!loaded.unitsOfMeasure) loaded.unitsOfMeasure = [...initialUOM];
      if (!loaded.carriers) loaded.carriers = [...initialCarriers];
      if (!loaded.barcodes) loaded.barcodes = [...initialBarcodes];
      if (!loaded.qcInspections) loaded.qcInspections = [...initialQCInspections];
      if (!loaded.putawayTasks) loaded.putawayTasks = [...initialPutawayTasks];
      if (!loaded.stockMovements) loaded.stockMovements = [...initialStockMovements];
      // Phase 18 migration
      if (!loaded.crossDocks) loaded.crossDocks = [...initialCrossDocks];
      if (!loaded.kitRecipes) loaded.kitRecipes = [...initialKitRecipes];
      if (!loaded.kitOrders) loaded.kitOrders = [...initialKitOrders];
      if (!loaded.stockBlocks) loaded.stockBlocks = [...initialStockBlocks];
      if (!loaded.repackOrders) loaded.repackOrders = [...initialRepackOrders];
      // Phase 19 migration
      if (!loaded.lotBatches) loaded.lotBatches = [...initialLotBatches];
      if (!loaded.serialNumbers) loaded.serialNumbers = [...initialSerialNumbers];
      // Phase 20-22 migration
      if (!loaded.dockSlots) loaded.dockSlots = [...initialDockSlots];
      if (!loaded.truckCheckIns) loaded.truckCheckIns = [...initialTruckCheckIns];
      if (!loaded.gateLogs) loaded.gateLogs = [...initialGateLogs];
      if (!loaded.putawayRules) loaded.putawayRules = [...initialPutawayRules];
      if (!loaded.alertRules) loaded.alertRules = [...initialAlertRules];
      if (!loaded.locationTypes) loaded.locationTypes = [...initialLocationTypes];
      if (!loaded.integrations) loaded.integrations = [...initialIntegrations];
      if (!loaded.importJobs) loaded.importJobs = [...initialImportJobs];
      // Unit conversion migration
      if (!loaded.productUnitConversions) loaded.productUnitConversions = [...initialPUC];
      if (!loaded.productBaseUnits) loaded.productBaseUnits = [...initialPBU];
      if (!loaded.productDimensions) loaded.productDimensions = [...initialPDim];
      if (!loaded.warehouseProducts) loaded.warehouseProducts = [...initialWHP];
      if (!loaded.productHistory) loaded.productHistory = [];
      // ERP Payment Terms migration
      if (!loaded.paymentTerms) loaded.paymentTerms = [...initialPaymentTerms];
      // ERP Returns & Claims migration
      if (!loaded.creditNotes) loaded.creditNotes = [...initialCreditNotes];
      if (!loaded.qualityClaims) loaded.qualityClaims = [...initialQualityClaims];
      return loaded;
    }
    return getDefaultPersistedState();
  });

  useEffect(() => {
    savePersistedState(state);
  }, [state]);

  const resetData = useCallback(() => {
    setState(getDefaultPersistedState());
  }, []);

  return (
    <WMSDataContext.Provider
      value={{
        grns: state.grns as Grn[], setGrns: makeSetter<Grn>(setState, "grns"),
        purchaseOrders: state.purchaseOrders as PurchaseOrder[], setPurchaseOrders: makeSetter<PurchaseOrder>(setState, "purchaseOrders"),
        inventory: state.inventory as InventoryItem[], setInventory: makeSetter<InventoryItem>(setState, "inventory"),
        stockAdjustments: state.stockAdjustments as StockAdjustment[], setStockAdjustments: makeSetter<StockAdjustment>(setState, "stockAdjustments"),
        stockTransfers: state.stockTransfers as StockTransfer[], setStockTransfers: makeSetter<StockTransfer>(setState, "stockTransfers"),
        cycleCounts: state.cycleCounts as CycleCount[], setCycleCounts: makeSetter<CycleCount>(setState, "cycleCounts"),
        returns: state.returns as ReturnOrder[], setReturns: makeSetter<ReturnOrder>(setState, "returns"),
        salesOrders: state.salesOrders as SalesOrder[], setSalesOrders: makeSetter<SalesOrder>(setState, "salesOrders"),
        customers: state.customers as Customer[], setCustomers: makeSetter<Customer>(setState, "customers"),
        invoices: state.invoices as Invoice[], setInvoices: makeSetter<Invoice>(setState, "invoices"),
        payments: state.payments as Payment[], setPayments: makeSetter<Payment>(setState, "payments"),
        deliveryTrips: state.deliveryTrips as DeliveryTrip[], setDeliveryTrips: makeSetter<DeliveryTrip>(setState, "deliveryTrips"),
        alerts: state.alerts as Alert[], setAlerts: makeSetter<Alert>(setState, "alerts"),
        vendors: state.vendors as Vendor[], setVendors: makeSetter<Vendor>(setState, "vendors"),
        paymentTerms: state.paymentTerms as PaymentTerm[], setPaymentTerms: makeSetter<PaymentTerm>(setState, "paymentTerms"),
        warehouses: state.warehouses as Warehouse[], setWarehouses: makeSetter<Warehouse>(setState, "warehouses"),
        warehouseLocations: state.warehouseLocations as WarehouseLocation[], setWarehouseLocations: makeSetter<WarehouseLocation>(setState, "warehouseLocations"),
        products: state.products as Product[], setProducts: makeSetter<Product>(setState, "products"),
        sectors: state.sectors as Sector[], setSectors: makeSetter<Sector>(setState, "sectors"),
        productCategories: state.productCategories as ProductCategory[], setProductCategories: makeSetter<ProductCategory>(setState, "productCategories"),
        subCategories: state.subCategories as SubCategory[], setSubCategories: makeSetter<SubCategory>(setState, "subCategories"),
        unitsOfMeasure: state.unitsOfMeasure as UnitOfMeasure[], setUnitsOfMeasure: makeSetter<UnitOfMeasure>(setState, "unitsOfMeasure"),
        carriers: state.carriers as Carrier[], setCarriers: makeSetter<Carrier>(setState, "carriers"),
        barcodes: state.barcodes as Barcode[], setBarcodes: makeSetter<Barcode>(setState, "barcodes"),
        qcInspections: state.qcInspections as QCInspection[], setQCInspections: makeSetter<QCInspection>(setState, "qcInspections"),
        putawayTasks: state.putawayTasks as PutawayTask[], setPutawayTasks: makeSetter<PutawayTask>(setState, "putawayTasks"),
        stockMovements: state.stockMovements as StockMovement[], setStockMovements: makeSetter<StockMovement>(setState, "stockMovements"),
        crossDocks: state.crossDocks as CrossDock[], setCrossDocks: makeSetter<CrossDock>(setState, "crossDocks"),
        kitRecipes: state.kitRecipes as KitRecipe[], setKitRecipes: makeSetter<KitRecipe>(setState, "kitRecipes"),
        kitOrders: state.kitOrders as KitOrder[], setKitOrders: makeSetter<KitOrder>(setState, "kitOrders"),
        stockBlocks: state.stockBlocks as StockBlock[], setStockBlocks: makeSetter<StockBlock>(setState, "stockBlocks"),
        repackOrders: state.repackOrders as RepackOrder[], setRepackOrders: makeSetter<RepackOrder>(setState, "repackOrders"),
        lotBatches: state.lotBatches as LotBatch[], setLotBatches: makeSetter<LotBatch>(setState, "lotBatches"),
        serialNumbers: state.serialNumbers as SerialNumber[], setSerialNumbers: makeSetter<SerialNumber>(setState, "serialNumbers"),
        // Phase 20-22
        dockSlots: state.dockSlots as DockSlot[], setDockSlots: makeSetter<DockSlot>(setState, "dockSlots"),
        truckCheckIns: state.truckCheckIns as TruckCheckIn[], setTruckCheckIns: makeSetter<TruckCheckIn>(setState, "truckCheckIns"),
        gateLogs: state.gateLogs as GateLog[], setGateLogs: makeSetter<GateLog>(setState, "gateLogs"),
        putawayRules: state.putawayRules as PutawayRule[], setPutawayRules: makeSetter<PutawayRule>(setState, "putawayRules"),
        alertRules: state.alertRules as AlertRule[], setAlertRules: makeSetter<AlertRule>(setState, "alertRules"),
        locationTypes: state.locationTypes as LocationType[], setLocationTypes: makeSetter<LocationType>(setState, "locationTypes"),
        integrations: state.integrations as Integration[], setIntegrations: makeSetter<Integration>(setState, "integrations"),
        importJobs: state.importJobs as ImportJob[], setImportJobs: makeSetter<ImportJob>(setState, "importJobs"),
        // Unit conversion system
        productUnitConversions: state.productUnitConversions as ProductUnitConversion[], setProductUnitConversions: makeSetter<ProductUnitConversion>(setState, "productUnitConversions"),
        productBaseUnits: state.productBaseUnits as ProductBaseUnit[], setProductBaseUnits: makeSetter<ProductBaseUnit>(setState, "productBaseUnits"),
        productDimensions: state.productDimensions as ProductDimensions[], setProductDimensions: makeSetter<ProductDimensions>(setState, "productDimensions"),
        warehouseProducts: state.warehouseProducts as WarehouseProduct[], setWarehouseProducts: makeSetter<WarehouseProduct>(setState, "warehouseProducts"),
        productHistory: state.productHistory as ProductHistory[], setProductHistory: makeSetter<ProductHistory>(setState, "productHistory"),
        // ERP Returns & Claims
        creditNotes: state.creditNotes as CreditNote[], setCreditNotes: makeSetter<CreditNote>(setState, "creditNotes"),
        qualityClaims: state.qualityClaims as QualityClaim[], setQualityClaims: makeSetter<QualityClaim>(setState, "qualityClaims"),
        resetData,
      }}
    >
      {children}
    </WMSDataContext.Provider>
  );
}

export function useWMSData() {
  const ctx = useContext(WMSDataContext);
  if (!ctx) throw new Error("useWMSData must be used within WMSDataProvider");
  return ctx;
}

export function useWMSDataOptional() {
  return useContext(WMSDataContext);
}
