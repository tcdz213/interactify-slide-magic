import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Package, Eye, CheckCircle, XCircle, ChevronDown, ChevronUp, Search, Send, AlertCircle, Pencil, Trash2, FileText, Printer, Plus, Lock, MapPin, Calendar, MessageSquare, ClipboardList, RotateCcw, Download } from "lucide-react";
import { DateFilter } from "@/components/DateFilter";
import { currency, warehouseLocations, products, users, invoices } from "@/data/mockData";
import { exportToCSV, exportToExcel } from "@/lib/exportUtils";
import ColumnToggle, { useColumnVisibility } from "@/components/ColumnToggle";
import SavedFiltersBar from "@/components/SavedFiltersBar";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWarehouseScope } from "@/hooks/useWarehouseScope";
import StatusBadge from "@/components/StatusBadge";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { FormField, FormSection, formSelectClass, formInputClass, formTextareaClass } from "@/components/ui/form-field";
import type { Grn, GrnLine, PurchaseOrder, ReturnOrder } from "@/data/mockData";
import type { InventoryItem } from "@/data/mockData";
import { calculatePMP } from "@/lib/pmpEngine";
import ExportDialog from "@/components/ExportDialog";
import type { ExportColumn } from "@/lib/exportUtils";
import { useUnitConversion } from "@/hooks/useUnitConversion";
import { toBaseUnits } from "@/lib/unitConversion";
import ThreeWayMatchPanel from "@/components/ThreeWayMatchPanel";

const CURRENT_USER_RECEIVING = users.find(u => u.role === "Operator")?.name ?? "Tarek Daoui";
const CURRENT_USER_QC = users.find(u => u.role === "QCOfficer")?.name ?? "Sara Khalil";
const CURRENT_USER_APPROVER = users.find(u => u.role === "WarehouseManager")?.name ?? "Karim Ben Ali";

const EXPIRY_WARN_DAYS = 30;
function getExpiryAlert(expiryStr: string): "past" | "soon" | null {
  if (!expiryStr) return null;
  const exp = new Date(expiryStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  exp.setHours(0, 0, 0, 0);
  const days = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return "past";
  if (days <= EXPIRY_WARN_DAYS) return "soon";
  return null;
}

type NewLineState = {
  received: number;
  rejected: number;
  batch: string;
  expiry: string;
  productionDate: string;
  loc: string;
  qc: "Passed" | "Failed" | "Conditional";
  rejectionReason?: string;
  /** R3: selected unit ID for this line */
  unitId?: string;
  /** R3: conversion factor for the selected unit */
  unitFactor?: number;
};

/** Map location prefix to warehouse ID */
const LOC_PREFIX_TO_WH: Record<string, string> = {
  ALG: "wh-alger-construction",
  ORA: "wh-oran-food",
  CST: "wh-constantine-tech",
};

/** Derive the warehouse ID from a GRN's first line locationId (e.g. "ALG-A1-01" → "wh-alger-construction") */
function getGrnWarehouseId(grn: Grn): string {
  const prefix = grn.lines[0]?.locationId?.split("-")[0] || "";
  return LOC_PREFIX_TO_WH[prefix] || grn.lines[0]?.locationId?.split("-")[0] || "wh-alger-construction";
}

export function GrnPage() {
  const { grns: data, setGrns: setData, purchaseOrders, setPurchaseOrders, inventory, setInventory, warehouses: warehousesList, products: productsList, setProducts, productUnitConversions, invoices } = useWMSData();
  const { canOperateOn, operationalWarehouses, operationalWarehouseIds, isOperationalRole } = useWarehouseScope();
  const { getUnitsForProduct, getBaseUnitAbbr } = useUnitConversion();

  // Filter available POs to those delivering to user's operational warehouses
  const poForGrn = useMemo(() => purchaseOrders.filter((p: PurchaseOrder) => {
    if (!(p.status === "Sent" || p.status === "Confirmed")) return false;
    if (!p.lines.some((l: { receivedQty: number; qty: number }) => l.receivedQty < l.qty)) return false;
    // Restrict to POs delivering to user's operational warehouses
    if (p.deliveryWarehouseId && operationalWarehouseIds !== null && !operationalWarehouseIds.includes(p.deliveryWarehouseId)) return false;
    return true;
  }), [purchaseOrders, operationalWarehouseIds]);

  const [selectedGrn, setSelectedGrn] = useState<Grn | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newPoId, setNewPoId] = useState("");
  const [newWarehouseId, setNewWarehouseId] = useState(operationalWarehouses[0]?.id ?? "wh-alger-construction");
  const [newLines, setNewLines] = useState<Record<string, NewLineState>>({});
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "vendor" | "value" | "status">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [rejectDialog, setRejectDialog] = useState<{ grn: Grn; type: "QC" | "Approval" } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [editingGrn, setEditingGrn] = useState<Grn | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Grn | null>(null);
  const [newNotes, setNewNotes] = useState("");
  const [exportOpen, setExportOpen] = useState(false);

  const grnExportCols: ExportColumn<Grn>[] = [
    { key: "id", label: "N° GRN" }, { key: "poId", label: "N° PO" }, { key: "vendorName", label: "Fournisseur" },
    { key: "receivedAt", label: "Date réception" }, { key: "totalItems", label: "Articles" },
    { key: "totalValue", label: "Valeur" }, { key: "status", label: "Statut" },
  ];

  const locationsForWarehouse = useMemo(() => warehouseLocations.filter(w => w.warehouseId === newWarehouseId), [newWarehouseId]);

  const filtered = useMemo(() => {
    let list = data.filter((g) => {
      if (filterStatus !== "all" && g.status !== filterStatus) return false;
      if (search && !g.id.toLowerCase().includes(search.toLowerCase()) && !g.vendorName.toLowerCase().includes(search.toLowerCase())) return false;
      if (dateFrom || dateTo) {
        const d = g.receivedAt.split(" ")[0]?.split("/").reverse().join("-") || "";
        if (dateFrom && d < dateFrom) return false;
        if (dateTo && d > dateTo) return false;
      }
      return true;
    });
    const mult = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      if (sortBy === "date") return mult * (a.receivedAt.localeCompare(b.receivedAt));
      if (sortBy === "vendor") return mult * a.vendorName.localeCompare(b.vendorName);
      if (sortBy === "value") return mult * (a.totalValue - b.totalValue);
      return mult * (a.status.localeCompare(b.status));
    });
    return list;
  }, [data, filterStatus, search, dateFrom, dateTo, sortBy, sortDir]);

  const selectedPO = purchaseOrders.find((p: PurchaseOrder) => p.id === newPoId);

  const createValidationError = useMemo(() => {
    if (!selectedPO) return null;
    for (const l of selectedPO.lines.filter((l: { receivedQty: number; qty: number }) => l.receivedQty < l.qty)) {
      const v = newLines[l.productId];
      if (!v) continue;
      const ordered = l.qty - l.receivedQty;
      if (v.received + v.rejected > ordered) return `Pour ${l.productName}: reçu + rejeté (${v.received + v.rejected}) ne doit pas dépasser la quantité à recevoir (${ordered}).`;
    }
    return null;
  }, [selectedPO, newLines]);

  const handleCreateGrn = (asDraft: boolean) => {
    if (!selectedPO) return;
    if (!asDraft && createValidationError) return;
    const lines: GrnLine[] = Object.entries(newLines).map(([pid, v], i) => {
      const pol = selectedPO.lines.find((l: { productId: string }) => l.productId === pid)!;
      // R3: Convert received/rejected from selected unit to base units
      const factor = v.unitFactor ?? 1;
      const receivedBase = Math.round(toBaseUnits(v.received, factor));
      const rejectedBase = Math.round(toBaseUnits(v.rejected, factor));
      return { lineId: i + 1, productId: pid, productName: pol.productName, orderedQty: pol.qty, receivedQty: receivedBase, rejectedQty: rejectedBase, rejectionReason: rejectedBase > 0 ? (v.rejectionReason || undefined) : undefined, batchNumber: v.batch, productionDate: v.productionDate || new Date().toISOString().slice(0, 10), expiryDate: v.expiry, locationId: v.loc, unitCost: pol.unitCost, qcStatus: v.qc };
    });
    const totalValue = lines.reduce((s, l) => s + l.receivedQty * l.unitCost, 0);
    const status = asDraft ? "Draft" : "QC_Pending";
    if (editingGrn) {
      const updated: Grn = { ...editingGrn, vendorId: selectedPO.vendorId, vendorName: selectedPO.vendorName, totalItems: lines.length, totalValue, notes: newNotes.trim(), lines };
      setData(prev => prev.map(g => g.id === editingGrn.id ? updated : g));
      setEditingGrn(null); setShowCreate(false); setNewPoId(""); setNewLines({}); setNewNotes("");
      toast({ title: "Brouillon enregistré", description: updated.id });
      return;
    }
    const newGrn: Grn = { id: `GRN-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(data.length + 1).padStart(4, "0")}`, poId: selectedPO.id, vendorId: selectedPO.vendorId, vendorName: selectedPO.vendorName, receivedBy: CURRENT_USER_RECEIVING, qcBy: CURRENT_USER_QC, receivedAt: new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }), status, totalItems: lines.length, totalValue, notes: newNotes.trim(), lines };
    setData([newGrn, ...data]);
    setShowCreate(false); setNewPoId(""); setNewLines({}); setNewNotes("");
    toast({ title: asDraft ? "GRN enregistré en brouillon" : "GRN créé", description: newGrn.id });
  };

  const applyGrnApproval = (grn: Grn) => {
    const po = purchaseOrders.find((p: PurchaseOrder) => p.id === grn.poId);
    if (po) {
      setPurchaseOrders(prev => prev.map((p) => {
        if (p.id !== grn.poId) return p;
        const newPoLines = p.lines.map((pl) => {
          const gl = grn.lines.find(l => l.productId === pl.productId);
          const add = gl ? gl.receivedQty : 0;
          return { ...pl, receivedQty: pl.receivedQty + add };
        });
        const allReceived = newPoLines.every((l) => l.receivedQty >= l.qty);
        return { ...p, lines: newPoLines, status: (allReceived ? "Received" : "Partially_Received") as PurchaseOrder["status"] };
      }));
    }

    // Phase 10.2 — Recalculate PMP (weighted avg cost) on product master
    setProducts((prev: any[]) => prev.map((product: any) => {
      const grnLine = grn.lines.find(l => l.productId === product.id);
      if (!grnLine || grnLine.receivedQty <= 0) return product;
      // Get current stock qty from inventory
      const currentQty = inventory
        .filter((i: InventoryItem) => i.productId === product.id)
        .reduce((sum: number, i: InventoryItem) => sum + i.qtyOnHand, 0);
      const pmpResult = calculatePMP({
        currentQty,
        currentCost: product.unitCost,
        receivedQty: grnLine.receivedQty,
        receivedUnitCost: grnLine.unitCost,
      });
      if (pmpResult.newCost !== product.unitCost) {
        return { ...product, unitCost: pmpResult.newCost };
      }
      return product;
    }));

    const whById = Object.fromEntries(warehousesList.map(w => [w.id, w]));
    setInventory(prev => {
      const next = [...prev];
      for (const line of grn.lines) {
        if (line.receivedQty <= 0) continue;
        const locPrefix = line.locationId.split("-")[0] || "";
        const warehouseId = LOC_PREFIX_TO_WH[locPrefix] || locPrefix || "wh-alger-construction";
        const wh = whById[warehouseId];
        const existing = next.find((i: InventoryItem) => i.productId === line.productId && i.warehouseId === warehouseId && i.batchNumber === line.batchNumber && i.expiryDate === line.expiryDate);
        const product = products.find(p => p.id === line.productId);
        if (existing) {
          const idx = next.indexOf(existing);
          next[idx] = { ...existing, qtyOnHand: existing.qtyOnHand + line.receivedQty, qtyAvailable: existing.qtyAvailable + line.receivedQty };
        } else {
          const id = `INV-${Date.now()}-${line.productId}-${line.locationId}`;
          const locShort = line.locationId.replace(warehouseId + "-", "") || line.locationId;
          next.push({ id, productId: line.productId, productName: line.productName, sku: product?.sku ?? "", category: product?.category ?? "", warehouseId, warehouseName: wh?.name ?? "", locationId: locShort, batchNumber: line.batchNumber, expiryDate: line.expiryDate, qtyOnHand: line.receivedQty, qtyReserved: 0, qtyAvailable: line.receivedQty, qtyInTransit: 0, unitCostAvg: line.unitCost, reorderPoint: product?.reorderPoint ?? 0, minStockLevel: 0, lastCountedAt: new Date().toISOString().slice(0, 10), daysToExpiry: 365, daysSinceMovement: 0, baseUnitId: line.unitId ?? `DEFAULT-${line.productId}`, baseUnitAbbr: line.unitAbbr ?? "Pce", version: 1 });
        }
      }
      return next;
    });
  };

  const openCreate = () => {
    setEditingGrn(null);
    setNewNotes("");
    const first = poForGrn[0];
    setShowCreate(true);
    const poWh = first?.deliveryWarehouseId ?? operationalWarehouses[0]?.id ?? "wh-alger-construction";
    setNewWarehouseId(poWh);
    if (first) {
      setNewPoId(first.id);
      const defLoc = warehouseLocations.find(w => w.warehouseId === poWh)?.id || `${poWh.split("-").pop()?.toUpperCase()?.slice(0,3) ?? "ALG"}-A1-01`;
      const today = new Date().toISOString().slice(0, 10);
      const lines: Record<string, NewLineState> = {};
      first.lines.filter((l: { receivedQty: number; qty: number }) => l.receivedQty < l.qty).forEach((l: { productId: string; qty: number; receivedQty: number }) => {
        const buyUnits = getUnitsForProduct(l.productId, "buy");
        const defaultUnit = buyUnits.find(u => u.isStockUnit) ?? buyUnits[0];
        lines[l.productId] = { received: l.qty - l.receivedQty, rejected: 0, batch: `B${today.replace(/-/g, "")}`, expiry: "2026-12-31", productionDate: today, loc: defLoc, qc: "Passed", unitId: defaultUnit?.id, unitFactor: defaultUnit?.conversionFactor ?? 1 };
      });
      setNewLines(lines);
    } else setNewLines({});
  };

  const openEditDraft = (grn: Grn) => {
    setEditingGrn(grn);
    setNewPoId(grn.poId);
    const whId = grn.lines[0]?.locationId?.split("-")[0] || "";
    setNewWarehouseId(LOC_PREFIX_TO_WH[whId] || whId || "wh-alger-construction");
    const lines: Record<string, NewLineState> = {};
    grn.lines.forEach(l => {
      lines[l.productId] = { received: l.receivedQty, rejected: l.rejectedQty, batch: l.batchNumber, expiry: l.expiryDate, productionDate: l.productionDate, loc: l.locationId, qc: l.qcStatus, rejectionReason: l.rejectionReason };
    });
    setNewLines(lines);
    setNewNotes(grn.notes || "");
    setShowCreate(true);
  };

  const fillLinesForPo = (po: PurchaseOrder, warehouseId?: string) => {
    const whId = warehouseId ?? newWarehouseId;
    const defLoc = warehouseLocations.find(w => w.warehouseId === whId)?.id || "ALG-A1-01";
    const today = new Date().toISOString().slice(0, 10);
    const lines: Record<string, NewLineState> = {};
    po.lines.filter((l: { receivedQty: number; qty: number }) => l.receivedQty < l.qty).forEach((l: { productId: string; qty: number; receivedQty: number }) => {
      const buyUnits = getUnitsForProduct(l.productId, "buy");
      const defaultUnit = buyUnits.find(u => u.isStockUnit) ?? buyUnits[0];
      lines[l.productId] = { received: l.qty - l.receivedQty, rejected: 0, batch: `B${today.replace(/-/g, "")}`, expiry: "2026-12-31", productionDate: today, loc: defLoc, qc: "Passed", unitId: defaultUnit?.id, unitFactor: defaultUnit?.conversionFactor ?? 1 };
    });
    setNewLines(lines);
  };

  const handleDeleteDraft = () => {
    if (deleteConfirm) {
      setData(prev => prev.filter(g => g.id !== deleteConfirm.id));
      toast({ title: "Brouillon supprimé", description: deleteConfirm.id });
      setDeleteConfirm(null);
    }
  };

  const stats = useMemo(() => ({
    qcPending: data.filter(g => g.status === "QC_Pending").length,
    approvalPending: data.filter(g => g.status === "Approval_Pending").length,
    approved: data.filter(g => g.status === "Approved").length,
    rejected: data.filter(g => g.status === "Rejected").length,
    draft: data.filter(g => g.status === "Draft").length,
  }), [data]);

  return (
    <div className="space-y-6 animate-fade-in">
      <WarehouseScopeBanner />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Réception (GRN)</h1>
            <p className="text-sm text-muted-foreground">Bons de réception et contrôle qualité</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setExportOpen(true)} className="gap-2"><Download className="h-4 w-4" /> Exporter</Button>
          {isOperationalRole && (operationalWarehouseIds === null || (operationalWarehouseIds?.length ?? 0) > 0) && (
            <Button onClick={openCreate} className="gap-2">
              <Package className="h-4 w-4" />
              Nouveau GRN
            </Button>
          )}
        </div>
      </div>

      {/* Recap cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">QC en attente</p>
          <p className="text-xl font-semibold text-warning">{stats.qcPending}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">En approbation</p>
          <p className="text-xl font-semibold text-info">{stats.approvalPending}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Approuvés</p>
          <p className="text-xl font-semibold text-success">{stats.approved}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Rejetés</p>
          <p className="text-xl font-semibold text-destructive">{stats.rejected}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Brouillons</p>
          <p className="text-xl font-semibold text-muted-foreground">{stats.draft}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher GRN ou fournisseur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <DateFilter value={dateFrom} onChange={setDateFrom} placeholder="Du" />
        <DateFilter value={dateTo} onChange={setDateTo} placeholder="Au" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20">
          <option value="all">Tous les statuts</option>
          <option value="Draft">Brouillon</option>
          <option value="QC_Pending">QC en attente</option>
          <option value="Approval_Pending">Approbation</option>
          <option value="Approved">Approuvé</option>
          <option value="Rejected">Rejeté</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
          <option value="date">Tri: Date</option>
          <option value="vendor">Tri: Fournisseur</option>
          <option value="value">Tri: Valeur</option>
          <option value="status">Tri: Statut</option>
        </select>
        <button type="button" onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")} className="h-9 px-2 rounded-lg border border-input bg-muted/50" title={sortDir === "asc" ? "Descendant" : "Ascendant"}>{sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">Aucun bon de réception</p>
            <p className="text-sm mt-1">Ajustez les filtres ou créez un nouveau GRN.</p>
          </div>
        ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">GRN #</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">PO #</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Fournisseur</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Date</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Articles</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Valeur</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Statut</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider sticky right-0 bg-muted/30 min-w-[140px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((grn) => (
              <tr key={grn.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-medium">{grn.id}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{grn.poId}</td>
                <td className="px-4 py-3 font-medium">{grn.vendorName}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{grn.receivedAt}</td>
                <td className="px-4 py-3">{grn.totalItems}</td>
                <td className="px-4 py-3 text-right font-medium">{currency(grn.totalValue)}</td>
                <td className="px-4 py-3"><StatusBadge status={grn.status} /></td>
                <td className="px-4 py-3 text-right sticky right-0 bg-card/90 backdrop-blur-sm min-w-[140px]">
                  <div className="flex items-center justify-end gap-1 flex-wrap">
                    <button onClick={() => setSelectedGrn(grn)} className="p-1.5 rounded-md hover:bg-muted transition-colors" title="Voir détails">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    {grn.status === "Draft" && canOperateOn(getGrnWarehouseId(grn)) && (
                      <>
                        <button onClick={() => openEditDraft(grn)} className="p-1.5 rounded-md hover:bg-muted transition-colors" title="Modifier">
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button onClick={() => setDeleteConfirm(grn)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors" title="Supprimer">
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                        <button onClick={() => { setData(prev => prev.map(g => g.id === grn.id ? { ...g, status: "QC_Pending" as const } : g)); toast({ title: "GRN soumis", description: grn.id }); }} className="p-1.5 rounded-md hover:bg-info/10 transition-colors" title="Soumettre">
                          <Send className="h-3.5 w-3.5 text-info" />
                        </button>
                      </>
                    )}
                    {grn.status === "Draft" && !canOperateOn(getGrnWarehouseId(grn)) && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" title="Hors périmètre"><Lock className="h-3.5 w-3.5" /></span>
                    )}
                    {grn.status === "QC_Pending" && canOperateOn(getGrnWarehouseId(grn)) && (
                      <>
                        {grn.lines.some(l => l.qcStatus === "Failed") ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-destructive bg-destructive/10" title="Une ligne est non conforme — impossible d'approuver QC"><AlertCircle className="h-3.5 w-3.5" /> Ligne non conforme</span>
                        ) : (
                          <button onClick={() => { setData(prev => prev.map(g => g.id === grn.id ? { ...g, status: "Approval_Pending" as const } : g)); toast({ title: "QC approuvé", description: grn.id }); }} className="p-1.5 rounded-md hover:bg-success/10 transition-colors" title="Approuver QC">
                            <CheckCircle className="h-3.5 w-3.5 text-success" />
                          </button>
                        )}
                        <button onClick={() => { setRejectDialog({ grn, type: "QC" }); setRejectReason(""); }} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors" title="Rejeter QC">
                          <XCircle className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </>
                    )}
                    {grn.status === "QC_Pending" && !canOperateOn(getGrnWarehouseId(grn)) && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" title="Hors périmètre"><Lock className="h-3.5 w-3.5" /></span>
                    )}
                    {grn.status === "Approval_Pending" && canOperateOn(getGrnWarehouseId(grn)) && (
                      <>
                        <button onClick={() => { setData(prev => prev.map(g => g.id === grn.id ? { ...g, status: "Approved" as const, approvedBy: CURRENT_USER_APPROVER } : g)); applyGrnApproval(grn); toast({ title: "GRN approuvé", description: grn.id }); }} className="p-1.5 rounded-md hover:bg-success/10 transition-colors" title="Approuver">
                          <CheckCircle className="h-3.5 w-3.5 text-success" />
                        </button>
                        <button onClick={() => { setRejectDialog({ grn, type: "Approval" }); setRejectReason(""); }} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors" title="Rejeter">
                          <XCircle className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </>
                    )}
                    {grn.status === "Approval_Pending" && !canOperateOn(getGrnWarehouseId(grn)) && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" title="Hors périmètre"><Lock className="h-3.5 w-3.5" /></span>
                    )}
                    {/* Change status dropdown */}
                    {canOperateOn(getGrnWarehouseId(grn)) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-md hover:bg-muted transition-colors" title="Changer statut">
                            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(["Draft", "QC_Pending", "Approval_Pending", "Approved", "Rejected"] as const).filter(s => s !== grn.status).map(s => (
                            <DropdownMenuItem key={s} onClick={() => { setData(prev => prev.map(g => g.id === grn.id ? { ...g, status: s } : g)); toast({ title: "Statut modifié", description: `${grn.id} → ${s}` }); }}>
                              <StatusBadge status={s} />
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {/* Delete draft confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Supprimer le brouillon ?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Le GRN {deleteConfirm?.id} sera définitivement supprimé.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDeleteDraft}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject confirmation dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={() => { setRejectDialog(null); setRejectReason(""); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                <XCircle className="h-4 w-4 text-destructive" />
              </div>
              {rejectDialog?.type === "QC" ? "Rejeter le GRN (QC)" : "Confirmer le rejet"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <FormField label="Motif du rejet" hint="Optionnel mais recommandé pour la traçabilité">
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} className={formTextareaClass} placeholder="Ex: Température non conforme, emballage endommagé..." />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectDialog(null); setRejectReason(""); }}>Annuler</Button>
            <Button variant="destructive" className="gap-1.5" onClick={() => { if (rejectDialog) { setData(prev => prev.map(g => g.id === rejectDialog.grn.id ? { ...g, status: "Rejected" as const, rejectionReason: rejectReason || undefined } : g)); toast({ title: "GRN rejeté", description: rejectDialog.grn.id }); setRejectDialog(null); setRejectReason(""); } }}>
              <XCircle className="h-4 w-4" /> Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create GRN Dialog */}
      <Dialog open={showCreate} onOpenChange={(o) => { setShowCreate(o); if (!o) { setNewPoId(""); setNewLines({}); setNewNotes(""); setEditingGrn(null); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-4 w-4 text-primary" />
              </div>
              {editingGrn ? "Modifier le brouillon" : "Nouveau bon de réception (GRN)"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <FormSection title="Commande d'achat" icon={<ClipboardList className="h-3.5 w-3.5" />}>
              <FormField label="Commande d'achat" required>
                <select value={newPoId} onChange={e => { const id = e.target.value; setNewPoId(id); const po = purchaseOrders.find((p: PurchaseOrder) => p.id === id); if (po) { setNewWarehouseId(po.deliveryWarehouseId ?? "WH01"); fillLinesForPo(po, po.deliveryWarehouseId ?? "WH01"); } }} className={formSelectClass} disabled={!!editingGrn}>
                  <option value="">Sélectionner une PO...</option>
                  {poForGrn.map((p: PurchaseOrder) => <option key={p.id} value={p.id}>{p.id} — {p.vendorName}</option>)}
                </select>
              </FormField>
            </FormSection>

            {selectedPO && (
              <FormSection title="Réception" icon={<MapPin className="h-3.5 w-3.5" />}>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Entrepôt" icon={<Package className="h-3.5 w-3.5" />} required
                    hint={selectedPO.deliveryWarehouseId === newWarehouseId ? "Pré-rempli depuis la PO" : undefined}>
                    <select value={newWarehouseId} onChange={e => { const v = e.target.value; setNewWarehouseId(v); fillLinesForPo(selectedPO, v); }} className={formSelectClass}>
                      {(operationalWarehouseIds === null ? warehousesList : operationalWarehouses).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Livraison prévue (PO)" icon={<Calendar className="h-3.5 w-3.5" />}>
                    <div className="h-10 flex items-center px-3 rounded-lg bg-muted/40 border border-input text-sm text-muted-foreground">
                      {selectedPO.expectedDate}
                    </div>
                  </FormField>
                </div>
              </FormSection>
            )}

            {createValidationError && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/5 border border-destructive/20 px-3 py-2.5">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-xs text-destructive">{createValidationError}</p>
              </div>
            )}

            {selectedPO && Object.keys(newLines).length > 0 && (
              <FormSection title="Lignes de réception" icon={<Package className="h-3.5 w-3.5" />}>
                <div className="space-y-3">
                  {selectedPO.lines.filter((l: { receivedQty: number; qty: number }) => l.receivedQty < l.qty).map((l: { productId: string; productName: string; qty: number; receivedQty: number }) => (
                    <div key={l.productId} className="rounded-xl border border-border/80 bg-muted/20 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border/50">
                        <span className="text-sm font-semibold">{l.productName}</span>
                        <span className="text-xs text-muted-foreground">Reste à recevoir : <strong>{l.qty - l.receivedQty}</strong></span>
                      </div>
                      <div className="p-3 space-y-2.5">
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                          <FormField label="Reçu">
                            <input type="number" min={0} value={newLines[l.productId]?.received ?? 0} onChange={e => setNewLines(prev => ({ ...prev, [l.productId]: { ...prev[l.productId], received: Number(e.target.value) } }))} className={formInputClass + " text-right font-medium"} />
                          </FormField>
                          <FormField label="Rejeté">
                            <input type="number" min={0} value={newLines[l.productId]?.rejected ?? 0} onChange={e => setNewLines(prev => ({ ...prev, [l.productId]: { ...prev[l.productId], rejected: Number(e.target.value) } }))} className={formInputClass + " text-right"} />
                          </FormField>
                          {/* R3: Unit selector */}
                          <FormField label="Unité">
                            {(() => {
                              const buyUnits = getUnitsForProduct(l.productId, "buy");
                              if (buyUnits.length <= 1) return <span className="text-xs text-muted-foreground pt-2 block">{getBaseUnitAbbr(l.productId) || "—"}</span>;
                              const lineState = newLines[l.productId];
                              const selectedUnit = buyUnits.find(u => u.id === lineState?.unitId) ?? buyUnits.find(u => u.isStockUnit) ?? buyUnits[0];
                              const baseEquiv = (lineState?.received ?? 0) * (selectedUnit?.conversionFactor ?? 1);
                              return (
                                <div>
                                  <select
                                    value={lineState?.unitId ?? selectedUnit?.id ?? ""}
                                    onChange={e => {
                                      const u = buyUnits.find(u => u.id === e.target.value);
                                      if (u) setNewLines(prev => ({ ...prev, [l.productId]: { ...prev[l.productId], unitId: u.id, unitFactor: u.conversionFactor } }));
                                    }}
                                    className={formSelectClass}
                                  >
                                    {buyUnits.map(u => (
                                      <option key={u.id} value={u.id}>{u.unitAbbreviation} {u.conversionFactor === 1 ? "(base)" : `(×${u.conversionFactor})`}</option>
                                    ))}
                                  </select>
                                  {selectedUnit && !selectedUnit.isStockUnit && baseEquiv > 0 && (
                                    <p className="text-[10px] text-muted-foreground mt-0.5">= {baseEquiv.toLocaleString("fr-FR")} {getBaseUnitAbbr(l.productId)}</p>
                                  )}
                                </div>
                              );
                            })()}
                          </FormField>
                          <FormField label="N° de lot">
                            <input value={newLines[l.productId]?.batch ?? ""} onChange={e => setNewLines(prev => ({ ...prev, [l.productId]: { ...prev[l.productId], batch: e.target.value } }))} className={formInputClass} />
                          </FormField>
                          <FormField label="Contrôle QC">
                            <select value={newLines[l.productId]?.qc ?? "Passed"} onChange={e => setNewLines(prev => ({ ...prev, [l.productId]: { ...prev[l.productId], qc: e.target.value as "Passed" | "Failed" | "Conditional" } }))} className={formSelectClass}>
                              <option value="Passed">✓ Conforme</option>
                              <option value="Conditional">⚠ Conditionnel</option>
                              <option value="Failed">✗ Non conforme</option>
                            </select>
                          </FormField>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          <FormField label="Date prod.">
                            <DateFilter value={newLines[l.productId]?.productionDate ?? ""} onChange={v => setNewLines(prev => ({ ...prev, [l.productId]: { ...prev[l.productId], productionDate: v } }))} placeholder="Date prod." className="w-full" />
                          </FormField>
                          <FormField label="Expiration"
                            error={getExpiryAlert(newLines[l.productId]?.expiry ?? "") === "past" ? "Date déjà passée" : getExpiryAlert(newLines[l.productId]?.expiry ?? "") === "soon" ? "Expire dans <30 jours" : null}>
                            <DateFilter value={newLines[l.productId]?.expiry ?? ""} onChange={v => setNewLines(prev => ({ ...prev, [l.productId]: { ...prev[l.productId], expiry: v } }))} placeholder="Expiration" className="w-full" />
                          </FormField>
                          <FormField label="Emplacement" className="col-span-2">
                            <select value={newLines[l.productId]?.loc ?? ""} onChange={e => setNewLines(prev => ({ ...prev, [l.productId]: { ...prev[l.productId], loc: e.target.value } }))} className={formSelectClass}>
                              <option value="">— Sélectionner —</option>
                              {locationsForWarehouse.map(w => <option key={w.id} value={w.id}>{w.id}</option>)}
                            </select>
                          </FormField>
                        </div>
                        {(newLines[l.productId]?.rejected ?? 0) > 0 && (
                          <FormField label="Motif rejet">
                            <input value={newLines[l.productId]?.rejectionReason ?? ""} onChange={e => setNewLines(prev => ({ ...prev, [l.productId]: { ...prev[l.productId], rejectionReason: e.target.value } }))} className={formInputClass} placeholder="Ex: emballage endommagé" />
                          </FormField>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </FormSection>
            )}
            <FormSection title="Remarques" icon={<MessageSquare className="h-3.5 w-3.5" />}>
              <FormField label="Notes" hint="Remarques sur la réception, conditions de livraison...">
                <textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} className={formTextareaClass} placeholder="Ex: Livraison quai 3, palette endommagée côté droit..." />
              </FormField>
            </FormSection>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => { setShowCreate(false); setEditingGrn(null); setNewNotes(""); }}>Annuler</Button>
            {editingGrn ? (
              <Button onClick={() => handleCreateGrn(true)} disabled={!selectedPO || Object.keys(newLines).length === 0} className="gap-1.5">
                <Pencil className="h-4 w-4" /> Enregistrer
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => handleCreateGrn(true)} disabled={!selectedPO || Object.keys(newLines).length === 0} className="gap-1.5">
                  <FileText className="h-4 w-4" /> Brouillon
                </Button>
                <Button onClick={() => handleCreateGrn(false)} disabled={!selectedPO || Object.keys(newLines).length === 0 || !!createValidationError} className="gap-1.5">
                  <Plus className="h-4 w-4" /> Créer GRN
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!selectedGrn} onOpenChange={() => setSelectedGrn(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedGrn && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className="font-mono">{selectedGrn.id}</span>
                  <StatusBadge status={selectedGrn.status} />
                </DialogTitle>
              </DialogHeader>
              <div className="flex justify-end -mt-2 mb-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { const w = window.open("", "_blank", "width=800,height=600"); if (w) { w.document.write(`<!DOCTYPE html><html><head><title>GRN ${selectedGrn.id}</title><style>body{font-family:system-ui;padding:24px;font-size:12px;} table{border-collapse:collapse;width:100%;} th,td{border:1px solid #ddd;padding:6px 8px;text-align:left;} th{background:#f5f5f5;}</style></head><body><h1>Bon de réception ${selectedGrn.id}</h1><p><strong>Fournisseur:</strong> ${selectedGrn.vendorName} &nbsp;|&nbsp; <strong>PO:</strong> ${selectedGrn.poId} &nbsp;|&nbsp; <strong>Date:</strong> ${selectedGrn.receivedAt} &nbsp;|&nbsp; <strong>Valeur:</strong> ${currency(selectedGrn.totalValue)}</p><table><thead><tr><th>Produit</th><th>Commandé</th><th>Reçu</th><th>Rejeté</th><th>Lot</th><th>Expiration</th><th>QC</th></tr></thead><tbody>${selectedGrn.lines.map(l => `<tr><td>${l.productName}</td><td>${l.orderedQty}</td><td>${l.receivedQty}</td><td>${l.rejectedQty}</td><td>${l.batchNumber}</td><td>${l.expiryDate}</td><td>${l.qcStatus}</td></tr>`).join("")}</tbody></table><p style="margin-top:16px;"><strong>Total articles:</strong> ${selectedGrn.totalItems} &nbsp;|&nbsp; <strong>Valeur totale:</strong> ${currency(selectedGrn.totalValue)}</p></body></html>`); w.document.close(); w.focus(); w.print(); w.close(); } toast({ title: "Impression", description: "Fenêtre d'impression ouverte." }); }}>
                  <Printer className="h-4 w-4" /> Imprimer
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <div><span className="text-muted-foreground">Fournisseur :</span> <span className="font-medium">{selectedGrn.vendorName}</span></div>
                <div><span className="text-muted-foreground">PO :</span> <Link to="/wms/purchase-orders" className="font-mono text-primary hover:underline">{selectedGrn.poId}</Link></div>
                <div><span className="text-muted-foreground">Reçu par :</span> {selectedGrn.receivedBy}</div>
                <div><span className="text-muted-foreground">QC par :</span> {selectedGrn.qcBy}</div>
                <div><span className="text-muted-foreground">Date :</span> {selectedGrn.receivedAt}</div>
                <div><span className="text-muted-foreground">Valeur :</span> <span className="font-medium">{currency(selectedGrn.totalValue)}</span></div>
                {selectedGrn.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes :</span> {selectedGrn.notes}</div>}
                {selectedGrn.rejectionReason && <div className="col-span-2"><span className="text-muted-foreground">Motif rejet :</span> <span className="text-destructive">{selectedGrn.rejectionReason}</span></div>}
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Lignes de réception</h4>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 text-muted-foreground">Produit</th>
                      <th className="text-right py-2 px-2 text-muted-foreground">Commandé</th>
                      <th className="text-right py-2 px-2 text-muted-foreground">Reçu</th>
                      <th className="text-right py-2 px-2 text-muted-foreground">Rejeté</th>
                      <th className="text-left py-2 px-2 text-muted-foreground">Motif rejet</th>
                      <th className="text-left py-2 px-2 text-muted-foreground">Lot</th>
                      <th className="text-left py-2 px-2 text-muted-foreground">Expiration</th>
                      <th className="text-left py-2 px-2 text-muted-foreground">QC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedGrn.lines.map((line) => (
                      <tr key={line.lineId} className="border-b border-border/50">
                        <td className="py-2 px-2 font-medium">{line.productName}</td>
                        <td className="py-2 px-2 text-right">{line.orderedQty}</td>
                        <td className="py-2 px-2 text-right font-medium">{line.receivedQty}</td>
                        <td className="py-2 px-2 text-right">{line.rejectedQty > 0 ? <span className="text-destructive">{line.rejectedQty}</span> : "—"}</td>
                        <td className="py-2 px-2 text-muted-foreground max-w-[120px] truncate" title={line.rejectionReason}>{line.rejectionReason ?? "—"}</td>
                        <td className="py-2 px-2 font-mono">{line.batchNumber}</td>
                        <td className="py-2 px-2">{line.expiryDate}</td>
                        <td className="py-2 px-2"><StatusBadge status={line.qcStatus} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 3-Way Match Panel */}
              {selectedGrn.status !== "Draft" && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <ThreeWayMatchPanel
                    grn={selectedGrn}
                    purchaseOrder={purchaseOrders.find((p: PurchaseOrder) => p.id === selectedGrn.poId)}
                    invoice={invoices.find((inv: any) => inv.orderId === selectedGrn.poId)}
                    conversions={productUnitConversions}
                  />
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} data={filtered} columns={grnExportCols} filename="bons-reception" statusKey="status" statusOptions={["Draft", "QC_Pending", "Approval_Pending", "Approved", "Rejected"]} />
    </div>
  );
}

export function InventoryPage() {
  const navigate = useNavigate();
  const { inventory } = useWMSData();
  const { accessibleWarehouseIds, isFullAccess } = useAuth();
  const { warehouses } = useWMSData();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterWarehouse, setFilterWarehouse] = useState("all");
  const [filterStockLevel, setFilterStockLevel] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "qty" | "expiry" | "movement">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // FIX-14 — ColumnToggle
  const INV_COLUMNS: import("@/components/ColumnToggle").ColumnDef[] = [
    { key: "sku", label: "SKU", alwaysVisible: true },
    { key: "name", label: "Produit", alwaysVisible: true },
    { key: "category", label: "Catégorie" },
    { key: "location", label: "Emplacement" },
    { key: "available", label: "Disponible" },
    { key: "onHand", label: "En main" },
    { key: "reserved", label: "Réservé" },
    { key: "expiry", label: "Expiration" },
    { key: "movement", label: "Mvt (j)" },
  ];
  const colVis = useColumnVisibility(INV_COLUMNS);

  // Filter by warehouse scope
  const scopedInventory = isFullAccess ? inventory : inventory.filter((i: any) => accessibleWarehouseIds?.includes(i.warehouseId));
  const categories = [...new Set(scopedInventory.map((i: any) => i.category))];

  const filtered = scopedInventory
    .filter((item: any) => {
      if (filterCategory !== "all" && item.category !== filterCategory) return false;
      if (filterWarehouse !== "all" && item.warehouseId !== filterWarehouse) return false;
      if (filterStockLevel === "in_stock" && item.qtyAvailable <= 0) return false;
      if (filterStockLevel === "low" && (item.qtyAvailable <= 0 || item.qtyAvailable >= item.reorderPoint)) return false;
      if (filterStockLevel === "out" && item.qtyAvailable > 0) return false;
      if (search && !item.productName.toLowerCase().includes(search.toLowerCase()) && !item.sku.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a: any, b: any) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "name") return a.productName.localeCompare(b.productName) * dir;
      if (sortBy === "qty") return (a.qtyAvailable - b.qtyAvailable) * dir;
      if (sortBy === "expiry") return (a.daysToExpiry - b.daysToExpiry) * dir;
      if (sortBy === "movement") return (a.daysSinceMovement - b.daysSinceMovement) * dir;
      return 0;
    });

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) => {
    if (sortBy !== col) return null;
    return sortDir === "asc" ? <ChevronUp className="h-3 w-3 inline ml-0.5" /> : <ChevronDown className="h-3 w-3 inline ml-0.5" />;
  };

  const getStockAlert = (item: any) => {
    if (item.qtyAvailable <= 0) return "bg-destructive/10 text-destructive";
    if (item.qtyAvailable < item.minStockLevel) return "bg-destructive/10 text-destructive";
    if (item.qtyAvailable < item.reorderPoint) return "bg-warning/10 text-warning";
    return "";
  };

  const getExpiryAlert = (days: number) => {
    if (days <= 7) return "text-destructive font-semibold";
    if (days <= 30) return "text-warning font-semibold";
    return "text-muted-foreground";
  };

  // FIX-15 — SavedFiltersBar
  const currentFilters = useMemo(() => ({
    category: filterCategory,
    warehouse: filterWarehouse,
    stockLevel: filterStockLevel,
    search,
  }), [filterCategory, filterWarehouse, filterStockLevel, search]);

  const handleApplyFilters = (filters: Record<string, string>) => {
    setFilterCategory(filters.category || "all");
    setFilterWarehouse(filters.warehouse || "all");
    setFilterStockLevel(filters.stockLevel || "all");
    setSearch(filters.search || "");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <WarehouseScopeBanner />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Inventaire</h1>
            <p className="text-sm text-muted-foreground">Suivi des stocks en temps réel — {scopedInventory.length} articles</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ColumnToggle columns={INV_COLUMNS} visible={colVis.visible} onToggle={colVis.toggle} />
          <button onClick={() => navigate("/wms/cycle-count")} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Inventaire cyclique
          </button>
          <button onClick={() => navigate("/wms/adjustments")} className="flex items-center gap-2 rounded-lg border border-input px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
            Ajustements
          </button>
          <button onClick={() => navigate("/wms/transfers")} className="flex items-center gap-2 rounded-lg border border-input px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
            Transferts
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Valeur totale stock", value: currency(scopedInventory.reduce((s: number, i: any) => s + i.qtyOnHand * i.unitCostAvg, 0)) },
          { label: "Sous seuil min", value: scopedInventory.filter((i: any) => i.qtyAvailable < i.minStockLevel).length + " articles", alert: true },
          { label: "Expiration < 30j", value: scopedInventory.filter((i: any) => i.daysToExpiry <= 30).length + " articles", alert: true },
          { label: "Dead stock (>90j)", value: scopedInventory.filter((i: any) => i.daysSinceMovement > 90).length + " articles" },
        ].map((card) => (
          <div key={card.label} className="glass-card rounded-xl p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{card.label}</p>
            <p className={`text-lg font-bold mt-1 ${card.alert ? "text-warning" : ""}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* FIX-15 — SavedFiltersBar */}
      <SavedFiltersBar pageKey="inventory" currentFilters={currentFilters} onApply={handleApplyFilters} />

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Rechercher produit ou SKU..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20">
          <option value="all">Toutes catégories</option>
          {categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterWarehouse} onChange={(e) => setFilterWarehouse(e.target.value)}
          className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20">
          <option value="all">Tous les entrepôts</option>
          {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <select value={filterStockLevel} onChange={(e) => setFilterStockLevel(e.target.value)}
          className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20">
          <option value="all">Tous niveaux</option>
          <option value="in_stock">En stock</option>
          <option value="low">Stock faible</option>
          <option value="out">Rupture</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Package className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">Aucun article en stock</p>
            <p className="text-sm mt-1">Ajustez les filtres ou enregistrez une réception (GRN).</p>
          </div>
        ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {colVis.isVisible("sku") && <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">SKU</th>}
              {colVis.isVisible("name") && <th onClick={() => toggleSort("name")} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground">Produit <SortIcon col="name" /></th>}
              {colVis.isVisible("category") && <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Catégorie</th>}
              {colVis.isVisible("location") && <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Emplacement</th>}
              {colVis.isVisible("available") && <th onClick={() => toggleSort("qty")} className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground">Disponible <SortIcon col="qty" /></th>}
              {colVis.isVisible("onHand") && <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">En main</th>}
              {colVis.isVisible("reserved") && <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Réservé</th>}
              {colVis.isVisible("expiry") && <th onClick={() => toggleSort("expiry")} className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground">Expiration <SortIcon col="expiry" /></th>}
              {colVis.isVisible("movement") && <th onClick={() => toggleSort("movement")} className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground">Mvt (j) <SortIcon col="movement" /></th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item: any) => (
              <tr key={item.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                {colVis.isVisible("sku") && <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.sku}</td>}
                {colVis.isVisible("name") && <td className="px-4 py-3 font-medium">{item.productName}</td>}
                {colVis.isVisible("category") && <td className="px-4 py-3 text-muted-foreground text-xs">{item.category}</td>}
                {colVis.isVisible("location") && <td className="px-4 py-3 font-mono text-xs">{item.warehouseName} / {item.locationId}</td>}
                {colVis.isVisible("available") && <td className="px-4 py-3 text-right"><span className={`px-1.5 py-0.5 rounded ${getStockAlert(item)}`}>{item.qtyAvailable}</span></td>}
                {colVis.isVisible("onHand") && <td className="px-4 py-3 text-right text-muted-foreground">{item.qtyOnHand}</td>}
                {colVis.isVisible("reserved") && <td className="px-4 py-3 text-right text-muted-foreground">{item.qtyReserved}</td>}
                {colVis.isVisible("expiry") && <td className={`px-4 py-3 text-right text-xs ${getExpiryAlert(item.daysToExpiry)}`}>{item.daysToExpiry}j</td>}
                {colVis.isVisible("movement") && <td className={`px-4 py-3 text-right text-xs ${item.daysSinceMovement > 90 ? "text-destructive font-semibold" : item.daysSinceMovement > 45 ? "text-warning" : "text-muted-foreground"}`}>{item.daysSinceMovement}</td>}
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}

export function ReturnsPage() {
  const { grns, returns: data, setReturns: setData, setInventory, warehouses, creditNotes, setCreditNotes } = useWMSData();
  const [selectedReturn, setSelectedReturn] = useState<ReturnOrder | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [newRet, setNewRet] = useState({ type: "Customer" as "Customer" | "Vendor", refId: "", partyName: "", reason: "", reasonCode: "DEFECTIVE" as ReturnOrder["reasonCode"], disposition: "" as string, refundMethod: "Credit_Note" as ReturnOrder["refundMethod"], restockingFeePct: 0, items: [{ productId: "", productName: "", qty: 0, reason: "", reasonCode: "DEFECTIVE" as string }] });
  const [createAsDraft, setCreateAsDraft] = useState(false);

  const filtered = data.filter((r) => {
    if (filterType !== "all" && r.type !== filterType) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (search && !r.id.toLowerCase().includes(search.toLowerCase()) && !r.partyName.toLowerCase().includes(search.toLowerCase()) && !r.referenceId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const refOptions = newRet.type === "Customer" ? invoices.map(i => ({ id: i.id, name: i.customerName })) : grns.map(g => ({ id: g.id, name: g.vendorName }));

  const REASON_CODES: { value: string; label: string }[] = [
    { value: "DEFECTIVE", label: "Produit défectueux" },
    { value: "DAMAGED", label: "Endommagé au transport" },
    { value: "DAMAGED_DELIVERY", label: "Endommagé à la livraison" },
    { value: "EXPIRED", label: "Périmé / proche péremption" },
    { value: "WRONG_ITEM", label: "Mauvais produit livré" },
    { value: "WRONG_PRODUCT", label: "Mauvais produit" },
    { value: "WRONG_QTY", label: "Quantité incorrecte" },
    { value: "QUALITY_FAIL", label: "Échec contrôle qualité" },
    { value: "QUALITY_COMPLAINT", label: "Plainte qualité" },
    { value: "RECALL", label: "Rappel fournisseur" },
    { value: "CONTRACT_BREACH", label: "Non-conformité contractuelle" },
    { value: "CHANGE_OF_MIND", label: "Changement d'avis" },
    { value: "WARRANTY", label: "Retour sous garantie" },
    { value: "DUPLICATE_ORDER", label: "Commande en double" },
    { value: "OTHER", label: "Autre" },
  ];

  const DISPOSITION_CODES: { value: string; label: string }[] = [
    { value: "Restock", label: "Remise en stock" },
    { value: "Restock_Discounted", label: "Stock démarqué" },
    { value: "Scrap", label: "Mise au rebut" },
    { value: "Quarantine", label: "Quarantaine" },
    { value: "Return_To_Vendor", label: "Retour fournisseur" },
    { value: "Repair", label: "Réparation" },
  ];

  const handleCreateReturn = (asDraft: boolean) => {
    const validItems = newRet.items.filter(i => i.productId && i.qty > 0);
    if (validItems.length === 0 || !newRet.refId || !newRet.partyName || !newRet.reason) return;
    const items: ReturnOrder["items"] = validItems.map((i, idx) => {
      const product = products.find(p => p.id === i.productId);
      const unitCost = product?.unitCost ?? 0;
      return { lineId: idx + 1, productId: i.productId, productName: product?.name || i.productName, qty: i.qty, unitCost, lineValue: i.qty * unitCost, reason: i.reason || "—", reasonCode: (i.reasonCode || newRet.reasonCode || "DEFECTIVE") as any };
    });
    const party = newRet.type === "Customer" ? invoices.find(i => i.id === newRet.refId)?.customerName : grns.find(g => g.id === newRet.refId)?.vendorName;
    const totalValue = items.reduce((s, i) => s + i.lineValue, 0);
    const netCredit = newRet.restockingFeePct > 0 ? totalValue * (1 - newRet.restockingFeePct / 100) : totalValue;
    const status: ReturnOrder["status"] = asDraft ? "Draft" : "Submitted";
    const newR: ReturnOrder = {
      id: `RET-${String(data.length + 1).padStart(3,"0")}`, type: newRet.type, referenceId: newRet.refId, partyName: party || newRet.partyName,
      date: new Date().toISOString().slice(0,10), status, reason: newRet.reason, reasonCode: newRet.reasonCode as any, totalValue, items, processedBy: CURRENT_USER_APPROVER,
      disposition: (newRet.disposition || undefined) as any, refundMethod: newRet.refundMethod, restockingFeePct: newRet.restockingFeePct, netCredit,
    };
    setData([newR, ...data]);
    setShowCreate(false);
    setNewRet({ type: "Customer", refId: "", partyName: "", reason: "", reasonCode: "DEFECTIVE", disposition: "", refundMethod: "Credit_Note", restockingFeePct: 0, items: [{ productId: "", productName: "", qty: 0, reason: "", reasonCode: "DEFECTIVE" }] });
    toast({ title: asDraft ? "Brouillon enregistré" : "Retour soumis", description: newR.id });
  };

  const applyReturnToInventory = (r: ReturnOrder) => {
    const warehouseId = r.type === "Vendor" && r.referenceId.startsWith("GRN-") ? (() => { const g = grns.find(x => x.id === r.referenceId); return g?.lines[0]?.locationId?.split("-")[0] ?? "WH01"; })() : "WH01";
    setInventory(prev => {
      const next = [...prev];
      for (const item of r.items) {
        const product = products.find(p => p.name === item.productName);
        const productId = product?.id;
        if (!productId || item.qty <= 0) continue;
        const idx = next.findIndex((i: { productId: string; warehouseId: string }) => i.productId === productId && i.warehouseId === warehouseId);
        if (r.type === "Customer") {
          if (idx >= 0) {
            const inv = next[idx];
            next[idx] = { ...inv, qtyOnHand: inv.qtyOnHand + item.qty, qtyAvailable: inv.qtyAvailable + item.qty };
          }
        } else {
          if (idx >= 0) {
            const inv = next[idx];
            next[idx] = { ...inv, qtyOnHand: Math.max(0, inv.qtyOnHand - item.qty), qtyAvailable: Math.max(0, inv.qtyAvailable - item.qty) };
          }
        }
      }
      return next;
    });
  };

  // Workflow actions
  const handleSubmit = (id: string) => {
    setData(prev => prev.map(r => r.id === id ? { ...r, status: "Submitted" as const } : r));
    toast({ title: "Retour soumis", description: id });
  };

  const handleQCAction = (id: string, action: "approve" | "reject") => {
    setData(prev => prev.map(r => r.id === id ? { ...r, status: action === "approve" ? "Approved" as const : "Rejected" as const, qcBy: CURRENT_USER_QC } : r));
    toast({ title: action === "approve" ? "Retour approuvé (QC)" : "Retour rejeté (QC)", description: id });
  };

  const handleShip = (id: string) => {
    const r = data.find(x => x.id === id);
    if (r) applyReturnToInventory(r);
    setData(prev => prev.map(r => r.id === id ? { ...r, status: "Shipped" as const } : r));
    toast({ title: "Retour expédié — stock mis à jour", description: id });
  };

  const handleProcess = (id: string) => {
    setData(prev => prev.map(r => r.id === id ? { ...r, status: "Processed" as const } : r));
    toast({ title: "Retour traité", description: id });
  };

  const handleCredit = (id: string) => {
    setData(prev => prev.map(r => r.id === id ? { ...r, status: "Credited" as const } : r));
    toast({ title: "Retour crédité", description: id });
  };

  const returnsExportCols = [
    { key: "id" as const, label: "ID" }, { key: "type" as const, label: "Type" }, { key: "referenceId" as const, label: "Référence" },
    { key: "partyName" as const, label: "Partie" }, { key: "date" as const, label: "Date" }, { key: "reason" as const, label: "Raison" },
    { key: "totalValue" as const, label: "Valeur" }, { key: "status" as const, label: "Statut" },
  ];
  const handleExportReturnsCSV = () => exportToCSV(data, returnsExportCols, "retours");
  const handleExportReturnsExcel = () => exportToExcel(data, returnsExportCols, "retours");

  const statusCounts = useMemo(() => ({
    draft: data.filter(r => r.status === "Draft").length,
    submitted: data.filter(r => r.status === "Submitted").length,
    pendingQC: data.filter(r => r.status === "Pending_QC").length,
    approved: data.filter(r => r.status === "Approved").length,
    shipped: data.filter(r => r.status === "Shipped").length,
    processed: data.filter(r => r.status === "Processed").length,
    credited: data.filter(r => r.status === "Credited").length,
    rejected: data.filter(r => r.status === "Rejected").length,
  }), [data]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Retours</h1>
            <p className="text-sm text-muted-foreground">Workflow complet : Brouillon → Soumis → QC → Approuvé → Expédié</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportReturnsCSV}>CSV</Button>
          <Button variant="outline" size="sm" onClick={handleExportReturnsExcel}>Excel</Button>
          <Button onClick={() => setShowCreate(true)} className="gap-2"><Plus className="h-4 w-4" /> Nouveau retour</Button>
        </div>
      </div>

      {/* Status recap */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {[
          { label: "Brouillon", count: statusCounts.draft, color: "text-muted-foreground" },
          { label: "Soumis", count: statusCounts.submitted, color: "text-info" },
          { label: "QC", count: statusCounts.pendingQC, color: "text-warning" },
          { label: "Approuvé", count: statusCounts.approved, color: "text-success" },
          { label: "Expédié", count: statusCounts.shipped, color: "text-info" },
          { label: "Traité", count: statusCounts.processed, color: "text-info" },
          { label: "Crédité", count: statusCounts.credited, color: "text-success" },
          { label: "Rejeté", count: statusCounts.rejected, color: "text-destructive" },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-lg p-2 border border-border/50 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className={`text-lg font-semibold ${s.color}`}>{s.count}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Rechercher ID, partie..." value={search} onChange={e => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        {["all", "Customer", "Vendor"].map((t) => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === t ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {t === "all" ? "Tous" : t === "Customer" ? "Clients" : "Fournisseurs"}
          </button>
        ))}
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
          <option value="all">Tous les statuts</option>
          <option value="Draft">Brouillon</option>
          <option value="Submitted">Soumis</option>
          <option value="Pending_QC">QC en attente</option>
          <option value="Approved">Approuvé</option>
          <option value="Shipped">Expédié</option>
          <option value="Processed">Traité</option>
          <option value="Credited">Crédité</option>
          <option value="Rejected">Rejeté</option>
        </select>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Package className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">Aucun retour</p>
            <p className="text-sm mt-1">Ajustez les filtres ou créez un nouveau retour.</p>
          </div>
        ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">ID</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Type</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Réf.</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Partie</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Raison</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Valeur</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Statut</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-medium">{r.id}</td>
                <td className="px-4 py-3"><StatusBadge status={r.type} /></td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.referenceId}</td>
                <td className="px-4 py-3 font-medium">{r.partyName}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{r.date}</td>
                <td className="px-4 py-3 text-xs">{r.reason}</td>
                <td className="px-4 py-3 text-right font-medium">{currency(r.totalValue)}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setSelectedReturn(r)} className="p-1.5 rounded-md hover:bg-muted transition-colors" title="Voir détails">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    {r.status === "Draft" && (
                      <button onClick={() => handleSubmit(r.id)} className="p-1.5 rounded-md hover:bg-info/10 transition-colors" title="Soumettre">
                        <Send className="h-3.5 w-3.5 text-info" />
                      </button>
                    )}
                    {(r.status === "Submitted" || r.status === "Pending_QC") && (
                      <>
                        <button onClick={() => handleQCAction(r.id, "approve")} className="p-1.5 rounded-md hover:bg-success/10 transition-colors" title="Approuver QC">
                          <CheckCircle className="h-3.5 w-3.5 text-success" />
                        </button>
                        <button onClick={() => handleQCAction(r.id, "reject")} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors" title="Rejeter QC">
                          <XCircle className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </>
                    )}
                    {r.status === "Approved" && (
                      <button onClick={() => handleShip(r.id)} className="p-1.5 rounded-md hover:bg-info/10 transition-colors" title="Expédier (met à jour le stock)">
                        <Send className="h-3.5 w-3.5 text-info" />
                      </button>
                    )}
                    {r.status === "Shipped" && (
                      <button onClick={() => handleProcess(r.id)} className="p-1.5 rounded-md hover:bg-success/10 transition-colors" title="Marquer traité">
                        <CheckCircle className="h-3.5 w-3.5 text-success" />
                      </button>
                    )}
                    {r.status === "Processed" && (
                      <button onClick={() => handleCredit(r.id)} className="p-1.5 rounded-md hover:bg-success/10 transition-colors" title="Créditer">
                        <CheckCircle className="h-3.5 w-3.5 text-primary" />
                      </button>
                    )}
                    {/* Change status dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded-md hover:bg-muted transition-colors" title="Changer statut">
                          <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(["Draft", "Submitted", "Pending_QC", "Approved", "Rejected", "Shipped", "Processed", "Credited"] as const).filter(s => s !== r.status).map(s => (
                          <DropdownMenuItem key={s} onClick={() => { setData(prev => prev.map(ret => ret.id === r.id ? { ...ret, status: s } : ret)); toast({ title: "Statut modifié", description: `${r.id} → ${s}` }); }}>
                            <StatusBadge status={s} />
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {/* Create Return Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nouveau retour</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <select value={newRet.type} onChange={e => setNewRet(prev => ({ ...prev, type: e.target.value as "Customer" | "Vendor", refId: "", partyName: "" }))} className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm">
                  <option value="Customer">Client</option>
                  <option value="Vendor">Fournisseur</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Référence</label>
                <select value={newRet.refId} onChange={e => { const opt = refOptions.find(o => o.id === e.target.value); setNewRet(prev => ({ ...prev, refId: e.target.value, partyName: opt?.name || "" })); }} className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm">
                  <option value="">Sélectionner...</option>
                  {refOptions.map(o => <option key={o.id} value={o.id}>{o.id} — {o.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Partie</label>
              <input value={newRet.partyName} onChange={e => setNewRet(prev => ({ ...prev, partyName: e.target.value }))} placeholder="Nom client/fournisseur" className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Code raison</label>
                <select value={newRet.reasonCode} onChange={e => setNewRet(prev => ({ ...prev, reasonCode: e.target.value as any }))} className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm">
                  {REASON_CODES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Raison (texte)</label>
                <input value={newRet.reason} onChange={e => setNewRet(prev => ({ ...prev, reason: e.target.value }))} placeholder="Détails..." className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Disposition</label>
                <select value={newRet.disposition} onChange={e => setNewRet(prev => ({ ...prev, disposition: e.target.value }))} className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm">
                  <option value="">Non définie</option>
                  {DISPOSITION_CODES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Méthode remboursement</label>
                <select value={newRet.refundMethod} onChange={e => setNewRet(prev => ({ ...prev, refundMethod: e.target.value as any }))} className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm">
                  <option value="Credit_Note">Avoir</option>
                  <option value="Cash_Refund">Remboursement</option>
                  <option value="Replacement">Remplacement</option>
                  <option value="Store_Credit">Crédit magasin</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Frais restockage %</label>
                <input type="number" min={0} max={100} value={newRet.restockingFeePct || ""} onChange={e => setNewRet(prev => ({ ...prev, restockingFeePct: Number(e.target.value) }))} placeholder="0" className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Articles</label>
              {newRet.items.map((it, i) => (
                <div key={i} className="flex gap-2 mt-1 mb-2 flex-wrap">
                  <select value={it.productId} onChange={e => setNewRet(prev => { const arr = [...prev.items]; arr[i] = { ...arr[i], productId: e.target.value, productName: products.find(p => p.id === e.target.value)?.name || "" }; return { ...prev, items: arr }; })} className="flex-1 min-w-[150px] h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
                    <option value="">Produit...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" placeholder="Qté" value={it.qty || ""} onChange={e => setNewRet(prev => { const arr = [...prev.items]; arr[i] = { ...arr[i], qty: Number(e.target.value) }; return { ...prev, items: arr }; })} className="w-16 h-9 rounded-lg border border-input px-2 text-sm" />
                  <select value={it.reasonCode} onChange={e => setNewRet(prev => { const arr = [...prev.items]; arr[i] = { ...arr[i], reasonCode: e.target.value }; return { ...prev, items: arr }; })} className="w-40 h-9 rounded-lg border border-input bg-muted/50 px-2 text-xs">
                    {REASON_CODES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <input placeholder="Détail raison" value={it.reason} onChange={e => setNewRet(prev => { const arr = [...prev.items]; arr[i] = { ...arr[i], reason: e.target.value }; return { ...prev, items: arr }; })} className="flex-1 min-w-[120px] h-9 rounded-lg border border-input px-3 text-sm" />
                  {newRet.items.length > 1 && <Button variant="ghost" size="sm" className="h-9 px-2" onClick={() => setNewRet(prev => ({ ...prev, items: prev.items.filter((_, j) => j !== i) }))}><XCircle className="h-3.5 w-3.5" /></Button>}
                </div>
              ))}
              <Button variant="outline" size="sm" className="mt-1" onClick={() => setNewRet(prev => ({ ...prev, items: [...prev.items, { productId: "", productName: "", qty: 0, reason: "", reasonCode: "DEFECTIVE" }] }))}><Plus className="h-3 w-3 mr-1" /> Ligne</Button>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button>
            <Button variant="secondary" onClick={() => handleCreateReturn(true)} disabled={!newRet.refId || !newRet.partyName || !newRet.reason || !newRet.items.some(i => i.productId && i.qty > 0)}>Enregistrer brouillon</Button>
            <Button onClick={() => handleCreateReturn(false)} disabled={!newRet.refId || !newRet.partyName || !newRet.reason || !newRet.items.some(i => i.productId && i.qty > 0)}>Soumettre</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!selectedReturn} onOpenChange={() => setSelectedReturn(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedReturn && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className="font-mono">{selectedReturn.id}</span>
                  <StatusBadge status={selectedReturn.type} />
                  <StatusBadge status={selectedReturn.status} />
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <div><span className="text-muted-foreground">Type :</span> <span className="font-medium">{selectedReturn.type === "Customer" ? "Client" : "Fournisseur"}</span></div>
                <div><span className="text-muted-foreground">Référence :</span> <span className="font-mono">{selectedReturn.referenceId}</span></div>
                <div><span className="text-muted-foreground">Partie :</span> <span className="font-medium">{selectedReturn.partyName}</span></div>
                <div><span className="text-muted-foreground">Date :</span> {selectedReturn.date}</div>
                <div><span className="text-muted-foreground">Valeur brute :</span> <span className="font-medium">{currency(selectedReturn.totalValue)}</span></div>
                {selectedReturn.netCredit !== undefined && <div><span className="text-muted-foreground">Crédit net :</span> <span className="font-medium text-primary">{currency(selectedReturn.netCredit)}</span></div>}
                {selectedReturn.restockingFeePct ? <div><span className="text-muted-foreground">Frais restockage :</span> {selectedReturn.restockingFeePct}%</div> : null}
                <div><span className="text-muted-foreground">Traité par :</span> {selectedReturn.processedBy}</div>
                {selectedReturn.qcBy && <div><span className="text-muted-foreground">QC par :</span> {selectedReturn.qcBy}</div>}
                {selectedReturn.disposition && <div><span className="text-muted-foreground">Disposition :</span> <StatusBadge status={selectedReturn.disposition} /></div>}
                {selectedReturn.refundMethod && <div><span className="text-muted-foreground">Méthode remb. :</span> {selectedReturn.refundMethod.replace(/_/g, " ")}</div>}
                {selectedReturn.creditNoteId && <div><span className="text-muted-foreground">N° avoir :</span> <span className="font-mono text-primary">{selectedReturn.creditNoteId}</span></div>}
                {selectedReturn.reasonCode && <div><span className="text-muted-foreground">Code raison :</span> {selectedReturn.reasonCode}</div>}
                <div className="col-span-2"><span className="text-muted-foreground">Raison :</span> {selectedReturn.reason}</div>
                {selectedReturn.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes :</span> {selectedReturn.notes}</div>}
              </div>

              {/* Workflow actions in detail */}
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                {selectedReturn.status === "Draft" && <Button size="sm" variant="outline" onClick={() => { handleSubmit(selectedReturn.id); setSelectedReturn(null); }}>Soumettre</Button>}
                {(selectedReturn.status === "Submitted" || selectedReturn.status === "Pending_QC") && (
                  <>
                    <Button size="sm" variant="outline" className="text-success border-success/30" onClick={() => { handleQCAction(selectedReturn.id, "approve"); setSelectedReturn(null); }}>Approuver QC</Button>
                    <Button size="sm" variant="outline" className="text-destructive border-destructive/30" onClick={() => { handleQCAction(selectedReturn.id, "reject"); setSelectedReturn(null); }}>Rejeter QC</Button>
                  </>
                )}
                {selectedReturn.status === "Approved" && <Button size="sm" onClick={() => { handleShip(selectedReturn.id); setSelectedReturn(null); }}>Expédier (MAJ stock)</Button>}
                {selectedReturn.status === "Shipped" && <Button size="sm" onClick={() => { handleProcess(selectedReturn.id); setSelectedReturn(null); }}>Marquer traité</Button>}
                {selectedReturn.status === "Processed" && <Button size="sm" onClick={() => { handleCredit(selectedReturn.id); setSelectedReturn(null); }}>Créditer</Button>}
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Articles</h4>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 text-muted-foreground">Produit</th>
                      <th className="text-right py-2 px-2 text-muted-foreground">Qté</th>
                      <th className="text-right py-2 px-2 text-muted-foreground">Coût unit.</th>
                      <th className="text-right py-2 px-2 text-muted-foreground">Valeur</th>
                      <th className="text-left py-2 px-2 text-muted-foreground">Raison</th>
                      <th className="text-left py-2 px-2 text-muted-foreground">Disposition</th>
                      <th className="text-left py-2 px-2 text-muted-foreground">QC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReturn.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="py-2 px-2 font-medium">{item.productName}</td>
                        <td className="py-2 px-2 text-right">{item.qty}</td>
                        <td className="py-2 px-2 text-right">{item.unitCost ? currency(item.unitCost) : "—"}</td>
                        <td className="py-2 px-2 text-right font-medium">{item.lineValue ? currency(item.lineValue) : "—"}</td>
                        <td className="py-2 px-2 text-xs">{item.reason}</td>
                        <td className="py-2 px-2 text-xs">{item.disposition || "—"}</td>
                        <td className="py-2 px-2 text-xs">{item.qcResult ? <StatusBadge status={item.qcResult} /> : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
    </div>
  );
}
