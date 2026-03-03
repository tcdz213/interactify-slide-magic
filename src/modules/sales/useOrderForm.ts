import { useState, useMemo } from "react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useFinancialTracking } from "@/contexts/FinancialTrackingContext";
import { useAuth } from "@/contexts/AuthContext";
import { users } from "@/data/userData";
import { toast } from "@/hooks/use-toast";
import { currency } from "@/data/mockData";
import type { SalesOrder, Customer, SalesOrderStatus } from "@/data/mockData";
import type { ProductOption } from "@/components/ProductCombobox";
import { getEffectivePrice, isNegotiatedPrice } from "./pricingResolver";
import { NEXT_STATUS, TAX_RATE, recordStatusChange, nextOrderId, STATUS_LABELS_FR } from "./orderStatus";
import type { SalesChannel } from "./orderStatus";
import { detectAnomalies, hasBlockingAnomaly, hasWarningAnomaly, type AnomalyCheck } from "@/lib/qtyAnomalyDetector";
import { getProductAnomalyThreshold } from "@/data/anomalyThresholds";

export type NewOrderLine = {
  productId: string;
  productName: string;
  orderedQty: number;
  unitPrice: number;
  unitCost: number;
  isNegotiated?: boolean;
  // R2: Unit conversion
  unitAbbr: string;
  unitName: string;
  conversionFactor: number;
};

export function useOrderForm() {
  const { salesOrders, setSalesOrders, customers, products, inventory, setInventory, productUnitConversions, productDimensions } = useWMSData();
  const { pricingStore } = useFinancialTracking();
  const { canCreate, canApprove, currentUser } = useAuth();

  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [cancelDialogOrder, setCancelDialogOrder] = useState<SalesOrder | null>(null);
  const [historyDialogOrder, setHistoryDialogOrder] = useState<SalesOrder | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  // Form fields
  const [newOrderCustomerId, setNewOrderCustomerId] = useState("");
  const [newOrderDeliveryDate, setNewOrderDeliveryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newOrderPaymentTerms, setNewOrderPaymentTerms] = useState<"Cash" | "Net_15" | "Net_30" | "Net_60">("Net_30");
  const [newOrderDiscountPct, setNewOrderDiscountPct] = useState(0);
  const [newOrderNotes, setNewOrderNotes] = useState("");
  const [newOrderLines, setNewOrderLines] = useState<NewOrderLine[]>([{ productId: "", productName: "", orderedQty: 0, unitPrice: 0, unitCost: 0, unitAbbr: "", unitName: "", conversionFactor: 1 }]);
  const [newOrderChannel, setNewOrderChannel] = useState<SalesChannel>("Manual");
  const [newOrderSalesRep, setNewOrderSalesRep] = useState("Omar Fadel");
  const [newOrderDate, setNewOrderDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newOrderAcceptPartial, setNewOrderAcceptPartial] = useState(false);

  const salesReps = useMemo(() => users.filter((u) => ["CEO", "OpsDirector", "RegionalManager", "WarehouseManager", "Supervisor"].includes(u.role)), []);

  const stockMap = useMemo(() => {
    const map = new Map<string, number>();
    inventory.forEach((i) => map.set(i.productId, (map.get(i.productId) ?? 0) + i.qtyOnHand));
    return map;
  }, [inventory]);

  // R1: stock unit factor map — base units per 1 stock unit (product.uom)
  const stockFactorMap = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach(p => {
      const convs = productUnitConversions.filter(c => c.productId === p.id);
      const match = convs.find(c => c.unitAbbreviation === p.uom || c.unitName === p.uom);
      if (match) { map.set(p.id, match.conversionFactor); return; }
      const dims = productDimensions.find(d => d.productId === p.id);
      if (dims && p.uom === "m²") { map.set(p.id, 1 / ((dims.widthCm / 100) * (dims.heightCm / 100))); return; }
      map.set(p.id, 1);
    });
    return map;
  }, [products, productUnitConversions, productDimensions]);

  const productOptions: ProductOption[] = useMemo(
    () =>
      products.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        stock: stockMap.get(p.id) ?? 0,
        unitPrice: p.unitPrice,
        unitCost: p.unitCost,
        isActive: p.isActive,
      })),
    [products, stockMap]
  );

  const filtered = salesOrders.filter((o) => {
    if (filterStatus !== "all" && o.status !== filterStatus) return false;
    if (search && !o.id.toLowerCase().includes(search.toLowerCase()) && !o.customerName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const resolvePrice = (productId: string, customerId: string) =>
    getEffectivePrice(productId, customerId, customers, products, pricingStore);

  const checkNegotiated = (productId: string, customerId: string) =>
    isNegotiatedPrice(productId, customerId, customers, pricingStore);

  const resetForm = () => {
    setNewOrderCustomerId("");
    setNewOrderDeliveryDate(new Date().toISOString().slice(0, 10));
    setNewOrderPaymentTerms("Net_30");
    setNewOrderDiscountPct(0);
    setNewOrderNotes("");
    setNewOrderLines([{ productId: "", productName: "", orderedQty: 0, unitPrice: 0, unitCost: 0, isNegotiated: false, unitAbbr: "", unitName: "", conversionFactor: 1 }]);
    setNewOrderChannel("Manual");
    setNewOrderSalesRep(salesReps[0]?.name ?? "");
    setNewOrderDate(new Date().toISOString().slice(0, 10));
    setNewOrderAcceptPartial(false);
  };

  const handleStatusChange = (orderId: string, nextStatus: SalesOrderStatus) => {
    const order = salesOrders.find((o) => o.id === orderId);
    if (!order) return;

    // BR-5 — Auto stock reservation on approval
    if (nextStatus === "Approved") {
      const reservationLines: string[] = [];
      for (const line of order.lines) {
        const available = stockMap.get(line.productId) ?? 0;
        if (available >= line.orderedQty) {
          reservationLines.push(`${line.productName}: ${line.orderedQty} réservé`);
        } else {
          reservationLines.push(`${line.productName}: ${available}/${line.orderedQty} (partiel)`);
        }
      }
      // Update reserved quantities on the order lines
      setSalesOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                lines: o.lines.map((l) => ({
                  ...l,
                  reservedQty: Math.min(l.orderedQty, stockMap.get(l.productId) ?? 0),
                })),
              }
            : o
        )
      );
      toast({ title: "📦 Stock réservé automatiquement", description: reservationLines.join(" · ") });
    }

    if (nextStatus === "Picking") {
      const insufficientStock: string[] = [];
      for (const line of order.lines) {
        const available = stockMap.get(line.productId) ?? 0;
        // R2: Convert ordered qty to stock units using stored conversion factor
        const lineConvFactor = line.conversionFactor ?? (stockFactorMap.get(line.productId) ?? 1);
        const stockFactor = stockFactorMap.get(line.productId) ?? 1;
        const stockUnitsNeeded = (line.orderedQty * lineConvFactor) / stockFactor;
        if (available < stockUnitsNeeded) {
          const prod = products.find((p) => p.id === line.productId);
          insufficientStock.push(`${prod?.name ?? line.productName}: ${available} ${prod?.uom ?? ""} dispo / ${Math.ceil(stockUnitsNeeded)} demandé`);
        }
      }
      if (insufficientStock.length > 0) {
        toast({ title: "⚠️ Stock insuffisant", description: insufficientStock.join("; "), variant: "destructive" });
        return;
      }
      setInventory((prev) => {
        const updated = [...prev];
        for (const line of order.lines) {
          const lineConvFactor = line.conversionFactor ?? (stockFactorMap.get(line.productId) ?? 1);
          const stockFactor = stockFactorMap.get(line.productId) ?? 1;
          let remaining = (line.orderedQty * lineConvFactor) / stockFactor;
          for (let i = 0; i < updated.length && remaining > 0; i++) {
            if (updated[i].productId === line.productId && updated[i].qtyOnHand > 0) {
              const deduct = Math.min(updated[i].qtyOnHand, remaining);
              updated[i] = { ...updated[i], qtyOnHand: updated[i].qtyOnHand - deduct };
              remaining -= deduct;
            }
          }
        }
        return updated;
      });
    }

    recordStatusChange(orderId, order.status, nextStatus, currentUser?.name ?? "system");
    setSalesOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: nextStatus,
              lines: o.lines.map((l) => (nextStatus === "Shipped" || nextStatus === "Delivered" ? { ...l, shippedQty: l.orderedQty } : l)),
            }
          : o
      )
    );
    toast({ title: "Statut mis à jour", description: `${orderId} → ${STATUS_LABELS_FR[nextStatus] ?? nextStatus}` });
  };

  const handleDuplicate = (order: SalesOrder) => {
    const newOrder: SalesOrder = {
      ...order,
      id: nextOrderId(salesOrders),
      status: "Draft",
      orderDate: `${new Date().toISOString().slice(0, 10)} ${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`,
      deliveryDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      lines: order.lines.map((l) => ({ ...l, reservedQty: 0, shippedQty: 0 })),
      notes: `Dupliquée depuis ${order.id}`,
    };
    setSalesOrders((prev) => [...prev, newOrder]);
    toast({ title: "Commande dupliquée", description: `${newOrder.id} créée depuis ${order.id}` });
  };

  const handleCancel = (order: SalesOrder) => {
    recordStatusChange(order.id, order.status, "Cancelled", currentUser?.name ?? "system");
    setSalesOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: "Cancelled" as SalesOrderStatus } : o)));
    toast({ title: "Commande annulée", description: `${order.id} a été annulée` });
    setCancelDialogOrder(null);
  };

  const createOrder = () => {
    const customer = customers.find((c) => c.id === newOrderCustomerId)!;
    const validLines = newOrderLines.filter((l) => l.productId && l.orderedQty > 0 && l.unitPrice >= 0);
    const subtotal = validLines.reduce((s, l) => s + l.orderedQty * l.unitPrice, 0);
    const afterDiscount = subtotal * (1 - newOrderDiscountPct / 100);
    const taxAmount = Math.round(afterDiscount * TAX_RATE);
    const totalAmount = afterDiscount + taxAmount;

    const lines = validLines.map((l, i) => ({
      lineId: i + 1,
      productId: l.productId,
      productName: l.productName,
      orderedQty: l.orderedQty,
      reservedQty: 0,
      shippedQty: 0,
      unitPrice: l.unitPrice,
      unitCost: l.unitCost,
      unitCostAtSale: l.unitCost,
      lineDiscount: 0,
      lineTotal: l.orderedQty * l.unitPrice,
      // R2: Unit conversion metadata
      unitAbbr: l.unitAbbr,
      unitName: l.unitName,
      conversionFactor: l.conversionFactor,
      baseQty: Math.round(l.orderedQty * l.conversionFactor * 100) / 100,
    }));

    if (editingOrderId) {
      // Update existing Draft order
      setSalesOrders((prev) => prev.map((o) =>
        o.id === editingOrderId ? {
          ...o,
          customerId: customer.id,
          customerName: customer.name,
          salesRep: newOrderSalesRep,
          orderDate: `${newOrderDate} ${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`,
          deliveryDate: newOrderDeliveryDate,
          paymentTerms: newOrderPaymentTerms,
          channel: newOrderChannel,
          discountPct: newOrderDiscountPct,
          notes: newOrderNotes,
          subtotal, taxAmount, totalAmount, lines,
        } : o
      ));
      toast({ title: "✅ Commande modifiée", description: `${editingOrderId} mise à jour` });
      setEditingOrderId(null);
      setConfirmDialogOpen(false);
      setNewOrderOpen(false);
      return;
    }

    const isCreditExceeded = customer.creditUsed + totalAmount > customer.creditLimit;
    const initialStatus: "Draft" | "Credit_Hold" = isCreditExceeded ? "Credit_Hold" : "Draft";

    const orderDateStr = `${newOrderDate} ${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`;

    const newOrder: SalesOrder = {
      id: nextOrderId(salesOrders),
      customerId: customer.id,
      customerName: customer.name,
      salesRep: newOrderSalesRep,
      orderDate: orderDateStr,
      deliveryDate: newOrderDeliveryDate,
      status: initialStatus,
      subtotal,
      discountPct: newOrderDiscountPct,
      taxAmount,
      totalAmount,
      paymentTerms: newOrderPaymentTerms,
      channel: newOrderChannel,
      notes: newOrderNotes,
      acceptPartial: newOrderAcceptPartial,
      lines,
    };

    setSalesOrders((prev) => [...prev, newOrder]);
    if (isCreditExceeded) {
      toast({
        title: "⚠️ Crédit bloqué",
        description: `${newOrder.id} bloquée — ${customer.name} dépasse sa limite de crédit (${currency(customer.creditUsed)} / ${currency(customer.creditLimit)})`,
        variant: "destructive",
      });
    } else {
      toast({ title: "✅ Commande créée", description: `${newOrder.id} — ${customer.name} — ${currency(totalAmount)}` });
    }
    setConfirmDialogOpen(false);
    setNewOrderOpen(false);
  };

  // ── Phase 4: Anomaly Detection ──
  const [anomalies, setAnomalies] = useState<AnomalyCheck[]>([]);
  const [anomalyProductName, setAnomalyProductName] = useState("");
  const [anomalyDialogOpen, setAnomalyDialogOpen] = useState(false);
  const [anomalyConfirmed, setAnomalyConfirmed] = useState(false);

  const checkAnomalies = (): boolean => {
    const allAnomalies: AnomalyCheck[] = [];
    const validLines = newOrderLines.filter(l => l.productId && l.orderedQty > 0);

    for (const line of validLines) {
      const threshold = getProductAnomalyThreshold(line.productId);
      // Build historical orders from existing sales
      const historical = salesOrders
        .filter(so => so.status !== "Cancelled" && so.status !== "Credit_Hold")
        .flatMap(so => so.lines.filter(sl => sl.productId === line.productId).map(sl => ({
          baseQty: (sl.baseQty ?? sl.orderedQty * (sl.conversionFactor ?? 1)),
          unitId: sl.unitAbbr ?? "",
          date: so.orderDate,
        })));

      const lineAnomalies = detectAnomalies(
        line.productId,
        line.orderedQty,
        line.unitAbbr,
        line.conversionFactor,
        {
          historicalOrders: historical,
          unit: { unitAbbreviation: line.unitAbbr, isInteger: true },
          maxSingleOrderBase: threshold?.maxSingleOrderBase,
          blockOnSpike: threshold?.blockOnSpike,
        },
        {
          volumeSpikeMultiplier: threshold?.volumeSpikeMultiplier ?? 3.0,
          capacityCheckEnabled: true,
          unitSwitchDetection: true,
          minimumHistoryOrders: 5,
        }
      );

      if (lineAnomalies.length > 0) {
        setAnomalyProductName(line.productName);
        allAnomalies.push(...lineAnomalies);
      }
    }

    if (allAnomalies.length > 0) {
      setAnomalies(allAnomalies);
      if (hasBlockingAnomaly(allAnomalies)) return false;
      if (hasWarningAnomaly(allAnomalies) && !anomalyConfirmed) {
        setAnomalyDialogOpen(true);
        return false;
      }
    }
    return true;
  };

  return {
    // Data
    salesOrders, customers, products, filtered, productOptions, stockMap, salesReps, stockFactorMap,
    canCreate, canApprove,
    // State
    selectedOrder, setSelectedOrder,
    filterStatus, setFilterStatus,
    search, setSearch,
    newOrderOpen, setNewOrderOpen,
    cancelDialogOrder, setCancelDialogOrder,
    historyDialogOrder, setHistoryDialogOrder,
    confirmDialogOpen, setConfirmDialogOpen,
    editingOrderId, setEditingOrderId,
    // Form fields
    newOrderCustomerId, setNewOrderCustomerId,
    newOrderDeliveryDate, setNewOrderDeliveryDate,
    newOrderPaymentTerms, setNewOrderPaymentTerms,
    newOrderDiscountPct, setNewOrderDiscountPct,
    newOrderNotes, setNewOrderNotes,
    newOrderLines, setNewOrderLines,
    newOrderChannel, setNewOrderChannel,
    newOrderSalesRep, setNewOrderSalesRep,
    newOrderDate, setNewOrderDate,
    newOrderAcceptPartial, setNewOrderAcceptPartial,
    // Phase 4 — Anomaly
    anomalies, anomalyProductName, anomalyDialogOpen, setAnomalyDialogOpen,
    anomalyConfirmed, setAnomalyConfirmed, checkAnomalies,
    // Actions
    resetForm, handleStatusChange, handleDuplicate, handleCancel, createOrder, resolvePrice, checkNegotiated,
  };
}
