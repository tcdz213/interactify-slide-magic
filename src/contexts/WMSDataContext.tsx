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
import { useCurrentTenantId, filterByTenant } from "@/lib/tenantFilter";

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

function makeSetter<T>(
  setState: React.Dispatch<React.SetStateAction<PersistedWMSState>>, 
  key: keyof PersistedWMSState,
  tenantId: string | null | undefined
): SetState<T[]> {
  return useCallback(
    (action: React.SetStateAction<T[]>) => {
      setState((globalState) => {
        const globalArray = globalState[key] as T[];
        const isOwner = !tenantId || tenantId === "T-OWN-01";
        
        // Compute what the user currently sees
        const tenantArray = isOwner 
          ? globalArray 
          : globalArray.filter((item: any) => (item.tenantId || "T-ENT-01") === tenantId);
        
        // Run the action on the scoped array
        const newTenantArray = typeof action === "function" 
          ? (action as (prev: T[]) => T[])(tenantArray) 
          : action;
        
        // If owner, the new array is the global array
        if (isOwner) {
          return { ...globalState, [key]: newTenantArray };
        }
        
        // Otherwise, merge back: keep items from other tenants
        const otherTenantsArray = globalArray.filter((item: any) => {
           const itemTenant = item.tenantId || "T-ENT-01";
           return itemTenant !== tenantId;
        });
        
        return {
          ...globalState,
          [key]: [...otherTenantsArray, ...newTenantArray],
        };
      });
    },
    [key, setState, tenantId]
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

  const tenantId = useCurrentTenantId();

  return (
    <WMSDataContext.Provider
      value={{
        grns: filterByTenant(state.grns, tenantId) as Grn[], setGrns: makeSetter<Grn>(setState, "grns", tenantId),
        purchaseOrders: filterByTenant(state.purchaseOrders, tenantId) as PurchaseOrder[], setPurchaseOrders: makeSetter<PurchaseOrder>(setState, "purchaseOrders", tenantId),
        inventory: filterByTenant(state.inventory, tenantId) as InventoryItem[], setInventory: makeSetter<InventoryItem>(setState, "inventory", tenantId),
        stockAdjustments: filterByTenant(state.stockAdjustments, tenantId) as StockAdjustment[], setStockAdjustments: makeSetter<StockAdjustment>(setState, "stockAdjustments", tenantId),
        stockTransfers: filterByTenant(state.stockTransfers, tenantId) as StockTransfer[], setStockTransfers: makeSetter<StockTransfer>(setState, "stockTransfers", tenantId),
        cycleCounts: filterByTenant(state.cycleCounts, tenantId) as CycleCount[], setCycleCounts: makeSetter<CycleCount>(setState, "cycleCounts", tenantId),
        returns: filterByTenant(state.returns, tenantId) as ReturnOrder[], setReturns: makeSetter<ReturnOrder>(setState, "returns", tenantId),
        salesOrders: filterByTenant(state.salesOrders, tenantId) as SalesOrder[], setSalesOrders: makeSetter<SalesOrder>(setState, "salesOrders", tenantId),
        customers: filterByTenant(state.customers, tenantId) as Customer[], setCustomers: makeSetter<Customer>(setState, "customers", tenantId),
        invoices: filterByTenant(state.invoices, tenantId) as Invoice[], setInvoices: makeSetter<Invoice>(setState, "invoices", tenantId),
        payments: filterByTenant(state.payments, tenantId) as Payment[], setPayments: makeSetter<Payment>(setState, "payments", tenantId),
        deliveryTrips: filterByTenant(state.deliveryTrips, tenantId) as DeliveryTrip[], setDeliveryTrips: makeSetter<DeliveryTrip>(setState, "deliveryTrips", tenantId),
        alerts: filterByTenant(state.alerts, tenantId) as Alert[], setAlerts: makeSetter<Alert>(setState, "alerts", tenantId),
        vendors: filterByTenant(state.vendors, tenantId) as Vendor[], setVendors: makeSetter<Vendor>(setState, "vendors", tenantId),
        paymentTerms: filterByTenant(state.paymentTerms, tenantId) as PaymentTerm[], setPaymentTerms: makeSetter<PaymentTerm>(setState, "paymentTerms", tenantId),
        warehouses: filterByTenant(state.warehouses, tenantId) as Warehouse[], setWarehouses: makeSetter<Warehouse>(setState, "warehouses", tenantId),
        warehouseLocations: filterByTenant(state.warehouseLocations, tenantId) as WarehouseLocation[], setWarehouseLocations: makeSetter<WarehouseLocation>(setState, "warehouseLocations", tenantId),
        products: filterByTenant(state.products, tenantId) as Product[], setProducts: makeSetter<Product>(setState, "products", tenantId),
        sectors: filterByTenant(state.sectors, tenantId) as Sector[], setSectors: makeSetter<Sector>(setState, "sectors", tenantId),
        productCategories: filterByTenant(state.productCategories, tenantId) as ProductCategory[], setProductCategories: makeSetter<ProductCategory>(setState, "productCategories", tenantId),
        subCategories: filterByTenant(state.subCategories, tenantId) as SubCategory[], setSubCategories: makeSetter<SubCategory>(setState, "subCategories", tenantId),
        unitsOfMeasure: filterByTenant(state.unitsOfMeasure, tenantId) as UnitOfMeasure[], setUnitsOfMeasure: makeSetter<UnitOfMeasure>(setState, "unitsOfMeasure", tenantId),
        carriers: filterByTenant(state.carriers, tenantId) as Carrier[], setCarriers: makeSetter<Carrier>(setState, "carriers", tenantId),
        barcodes: filterByTenant(state.barcodes, tenantId) as Barcode[], setBarcodes: makeSetter<Barcode>(setState, "barcodes", tenantId),
        qcInspections: filterByTenant(state.qcInspections, tenantId) as QCInspection[], setQCInspections: makeSetter<QCInspection>(setState, "qcInspections", tenantId),
        putawayTasks: filterByTenant(state.putawayTasks, tenantId) as PutawayTask[], setPutawayTasks: makeSetter<PutawayTask>(setState, "putawayTasks", tenantId),
        stockMovements: filterByTenant(state.stockMovements, tenantId) as StockMovement[], setStockMovements: makeSetter<StockMovement>(setState, "stockMovements", tenantId),
        crossDocks: filterByTenant(state.crossDocks, tenantId) as CrossDock[], setCrossDocks: makeSetter<CrossDock>(setState, "crossDocks", tenantId),
        kitRecipes: filterByTenant(state.kitRecipes, tenantId) as KitRecipe[], setKitRecipes: makeSetter<KitRecipe>(setState, "kitRecipes", tenantId),
        kitOrders: filterByTenant(state.kitOrders, tenantId) as KitOrder[], setKitOrders: makeSetter<KitOrder>(setState, "kitOrders", tenantId),
        stockBlocks: filterByTenant(state.stockBlocks, tenantId) as StockBlock[], setStockBlocks: makeSetter<StockBlock>(setState, "stockBlocks", tenantId),
        repackOrders: filterByTenant(state.repackOrders, tenantId) as RepackOrder[], setRepackOrders: makeSetter<RepackOrder>(setState, "repackOrders", tenantId),
        lotBatches: filterByTenant(state.lotBatches, tenantId) as LotBatch[], setLotBatches: makeSetter<LotBatch>(setState, "lotBatches", tenantId),
        serialNumbers: filterByTenant(state.serialNumbers, tenantId) as SerialNumber[], setSerialNumbers: makeSetter<SerialNumber>(setState, "serialNumbers", tenantId),
        // Phase 20-22
        dockSlots: filterByTenant(state.dockSlots, tenantId) as DockSlot[], setDockSlots: makeSetter<DockSlot>(setState, "dockSlots", tenantId),
        truckCheckIns: filterByTenant(state.truckCheckIns, tenantId) as TruckCheckIn[], setTruckCheckIns: makeSetter<TruckCheckIn>(setState, "truckCheckIns", tenantId),
        gateLogs: filterByTenant(state.gateLogs, tenantId) as GateLog[], setGateLogs: makeSetter<GateLog>(setState, "gateLogs", tenantId),
        putawayRules: filterByTenant(state.putawayRules, tenantId) as PutawayRule[], setPutawayRules: makeSetter<PutawayRule>(setState, "putawayRules", tenantId),
        alertRules: filterByTenant(state.alertRules, tenantId) as AlertRule[], setAlertRules: makeSetter<AlertRule>(setState, "alertRules", tenantId),
        locationTypes: filterByTenant(state.locationTypes, tenantId) as LocationType[], setLocationTypes: makeSetter<LocationType>(setState, "locationTypes", tenantId),
        integrations: filterByTenant(state.integrations, tenantId) as Integration[], setIntegrations: makeSetter<Integration>(setState, "integrations", tenantId),
        importJobs: filterByTenant(state.importJobs, tenantId) as ImportJob[], setImportJobs: makeSetter<ImportJob>(setState, "importJobs", tenantId),
        // Unit conversion system
        productUnitConversions: filterByTenant(state.productUnitConversions, tenantId) as ProductUnitConversion[], setProductUnitConversions: makeSetter<ProductUnitConversion>(setState, "productUnitConversions", tenantId),
        productBaseUnits: filterByTenant(state.productBaseUnits, tenantId) as ProductBaseUnit[], setProductBaseUnits: makeSetter<ProductBaseUnit>(setState, "productBaseUnits", tenantId),
        productDimensions: filterByTenant(state.productDimensions, tenantId) as ProductDimensions[], setProductDimensions: makeSetter<ProductDimensions>(setState, "productDimensions", tenantId),
        warehouseProducts: filterByTenant(state.warehouseProducts, tenantId) as WarehouseProduct[], setWarehouseProducts: makeSetter<WarehouseProduct>(setState, "warehouseProducts", tenantId),
        productHistory: filterByTenant(state.productHistory, tenantId) as ProductHistory[], setProductHistory: makeSetter<ProductHistory>(setState, "productHistory", tenantId),
        // ERP Returns & Claims
        creditNotes: filterByTenant(state.creditNotes, tenantId) as CreditNote[], setCreditNotes: makeSetter<CreditNote>(setState, "creditNotes", tenantId),
        qualityClaims: filterByTenant(state.qualityClaims, tenantId) as QualityClaim[], setQualityClaims: makeSetter<QualityClaim>(setState, "qualityClaims", tenantId),
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
