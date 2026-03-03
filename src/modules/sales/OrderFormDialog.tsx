import { useMemo, useState } from "react";
import { Plus, Trash2, AlertTriangle, ClipboardCheck, Tag, BookOpen, ShieldAlert, Ban, CheckCircle2, XCircle, PackageCheck, Ruler, SquareIcon } from "lucide-react";
import AnomalyWarningDialog from "@/components/AnomalyWarningDialog";
import { useUnitConversion } from "@/hooks/useUnitConversion";
import { currency } from "@/data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useWMSData } from "@/contexts/WMSDataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCombobox } from "@/components/ProductCombobox";
import { MarginBadge } from "@/modules/pricing/MarginBadge";
import { DateFilter } from "@/components/DateFilter";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { CHANNEL_LABELS, TAX_RATE } from "./orderStatus";
import type { useOrderForm } from "./useOrderForm";

type FormHook = ReturnType<typeof useOrderForm>;

interface OrderFormDialogProps {
  hook: FormHook;
}

export function OrderFormDialog({ hook }: OrderFormDialogProps) {
  const {
    newOrderOpen, setNewOrderOpen,
    confirmDialogOpen, setConfirmDialogOpen,
    customers, salesReps, productOptions, stockMap, stockFactorMap,
    newOrderCustomerId, setNewOrderCustomerId,
    newOrderSalesRep, setNewOrderSalesRep,
    newOrderChannel, setNewOrderChannel,
    newOrderDate, setNewOrderDate,
    newOrderDeliveryDate, setNewOrderDeliveryDate,
    newOrderPaymentTerms, setNewOrderPaymentTerms,
    newOrderDiscountPct, setNewOrderDiscountPct,
    newOrderNotes, setNewOrderNotes,
    newOrderLines, setNewOrderLines,
    newOrderAcceptPartial, setNewOrderAcceptPartial,
    resolvePrice, createOrder, checkNegotiated,
  } = hook;

  const { getUnitsForProduct, getDefaultUnit, adjustPrice: adjustPriceFn, getBaseUnitAbbr, toStockUnits, getDimensionsForProduct } = useUnitConversion();
  
  // R4: Track m² input per line
  const [areaInputs, setAreaInputs] = useState<Record<number, number>>({});

  const validLines = newOrderLines.filter((l) => l.productId && l.orderedQty > 0 && l.unitPrice >= 0);
  const subtotal = validLines.reduce((s, l) => s + l.orderedQty * l.unitPrice, 0);
  const afterDiscount = subtotal * (1 - newOrderDiscountPct / 100);
  const taxAmount = Math.round(afterDiscount * TAX_RATE);
  const totalAmount = afterDiscount + taxAmount;
  const customer = customers.find((c) => c.id === newOrderCustomerId);

  // 3.6 — check for negative margins
  const hasNegativeMargin = validLines.some((l) => l.unitCost > 0 && l.unitPrice < l.unitCost);

  // R5 — Decimal validation for integer units
  const decimalIssues = useMemo(() => {
    return validLines.filter((l) => {
      if (!l.productId || l.orderedQty <= 0) return false;
      const units = getUnitsForProduct(l.productId);
      const selectedUnit = units.find(u => u.unitAbbreviation === l.unitAbbr);
      return selectedUnit?.isInteger && !Number.isInteger(l.orderedQty);
    }).map(l => l.productName);
  }, [validLines, getUnitsForProduct]);

  // BR-7 — Stock availability check (blocking)
  const stockIssues = useMemo(() => {
    return validLines
      .filter((l) => {
        const available = stockMap.get(l.productId) ?? 0;
        const stockFactor = stockFactorMap.get(l.productId) ?? 1;
        const stockNeeded = (l.orderedQty * (l.conversionFactor || 1)) / stockFactor;
        return stockNeeded > available;
      })
      .map((l) => {
        const available = stockMap.get(l.productId) ?? 0;
        const stockFactor = stockFactorMap.get(l.productId) ?? 1;
        const stockNeeded = (l.orderedQty * (l.conversionFactor || 1)) / stockFactor;
        return {
          productName: l.productName,
          requested: Math.ceil(stockNeeded),
          available,
        };
      });
  }, [validLines, stockMap, stockFactorMap]);

  // BR-2 — Debt warning (overdue invoices)
  const { invoices: allInvoices } = useWMSData();
  const debtInfo = useMemo(() => {
    if (!customer) return { overdueDays: 0, overdueAmount: 0, overdueCount: 0, blocked: false };
    const now = new Date();
    const customerInvoices = allInvoices.filter(
      (inv) => inv.customerId === customer.id && inv.balance > 0 && !["Paid", "Cancelled"].includes(inv.status)
    );
    const overdueInvs = customerInvoices.filter((inv) => new Date(inv.dueDate) < now);
    if (overdueInvs.length === 0) return { overdueDays: 0, overdueAmount: 0, overdueCount: 0, blocked: false };
    const maxDays = Math.max(...overdueInvs.map((inv) => Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / 86400000)));
    const totalOverdue = overdueInvs.reduce((s, inv) => s + inv.balance, 0);
    return { overdueDays: maxDays, overdueAmount: totalOverdue, overdueCount: overdueInvs.length, blocked: maxDays >= 60 };
  }, [customer, allInvoices]);

  // BR-8 — Minimum order value per client type
  const MIN_ORDER_VALUES: Record<string, number> = {
    "Grand Compte": 500000,
    "Entreprise": 200000,
    "Grossiste": 300000,
    "Détaillant": 50000,
    "PME": 100000,
    "Artisan": 30000,
  };
  const minOrderValue = customer ? (MIN_ORDER_VALUES[customer.type] ?? 0) : 0;
  const isBelowMinOrder = totalAmount > 0 && totalAmount < minOrderValue;

  // BR-1 — Credit check
  const isCreditExceeded = customer ? customer.creditUsed + totalAmount > customer.creditLimit : false;

  const canSubmit = !hasNegativeMargin && stockIssues.length === 0 && !debtInfo.blocked && !isBelowMinOrder && decimalIssues.length === 0;

  const handleValidate = () => {
    if (!customer) {
      toast({ title: "Client requis", description: "Veuillez sélectionner un client.", variant: "destructive" });
      return;
    }
    if (validLines.length === 0) {
      toast({ title: "Lignes requises", description: "Ajoutez au moins une ligne avec produit, quantité et prix.", variant: "destructive" });
      return;
    }
    if (!canSubmit) {
      toast({ title: "⛔ Commande bloquée", description: "Résolvez les erreurs avant de valider.", variant: "destructive" });
      return;
    }
    setConfirmDialogOpen(true);
  };

  return (
    <>
      <Dialog open={newOrderOpen} onOpenChange={setNewOrderOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{hook.editingOrderId ? `Modifier commande ${hook.editingOrderId}` : "Nouvelle commande"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Client</Label>
                <Select value={newOrderCustomerId} onValueChange={(v) => {
                  setNewOrderCustomerId(v);
                  setNewOrderLines((prev) => prev.map((l) => {
                    if (!l.productId) return l;
                    return { ...l, unitPrice: resolvePrice(l.productId, v), isNegotiated: checkNegotiated(l.productId, v) };
                  }));
                }}>
                  <SelectTrigger><SelectValue placeholder="Choisir un client" /></SelectTrigger>
                  <SelectContent>
                    {customers.filter((c) => c.status === "Active").map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} ({c.type})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Vendeur</Label>
                <Select value={newOrderSalesRep} onValueChange={hook.setNewOrderSalesRep}>
                  <SelectTrigger><SelectValue placeholder="Choisir un vendeur" /></SelectTrigger>
                  <SelectContent>
                    {salesReps.map((u) => (
                      <SelectItem key={u.id} value={u.name}>{u.name} ({u.roleLabel})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Canal de vente</Label>
                <Select value={newOrderChannel} onValueChange={(v) => setNewOrderChannel(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CHANNEL_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date de commande</Label>
                <DateFilter value={newOrderDate} onChange={setNewOrderDate} placeholder="Date commande" />
              </div>
              <div className="space-y-2">
                <Label>Date de livraison souhaitée</Label>
                <DateFilter value={newOrderDeliveryDate} onChange={setNewOrderDeliveryDate} placeholder="Date livraison" />
              </div>
              <div className="space-y-2">
                <Label>Conditions de paiement</Label>
                <Select value={newOrderPaymentTerms} onValueChange={(v) => setNewOrderPaymentTerms(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Comptant</SelectItem>
                    <SelectItem value="Net_15">Net 15</SelectItem>
                    <SelectItem value="Net_30">Net 30</SelectItem>
                    <SelectItem value="Net_60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Remise globale (%)</Label>
                <Input type="number" min={0} max={100} step={0.5} value={newOrderDiscountPct} onChange={(e) => setNewOrderDiscountPct(Number(e.target.value) || 0)} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Notes</Label>
                <Input value={newOrderNotes} onChange={(e) => setNewOrderNotes(e.target.value)} placeholder="Notes optionnelles" />
              </div>
            </div>

            {/* Order lines table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Lignes de commande</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setNewOrderLines((prev) => [...prev, { productId: "", productName: "", orderedQty: 0, unitPrice: 0, unitCost: 0, unitAbbr: "", unitName: "", conversionFactor: 1 }])}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter une ligne
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">Produit</th>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground w-24">Unité</th>
                      <th className="text-right p-2 text-xs font-medium text-muted-foreground w-20">Stock</th>
                      <th className="text-right p-2 text-xs font-medium text-muted-foreground w-24">Qté</th>
                      <th className="text-right p-2 text-xs font-medium text-muted-foreground w-28">Prix unit.</th>
                      <th className="text-right p-2 text-xs font-medium text-muted-foreground w-24">Total</th>
                      <th className="w-14" />
                    </tr>
                  </thead>
                  <tbody>
                    {newOrderLines.map((line, idx) => {
                      const available = stockMap.get(line.productId) ?? 0;
                      const units = line.productId ? getUnitsForProduct(line.productId) : [];
                      const stockFactor = stockFactorMap.get(line.productId) ?? 1;
                      const stockUnitsNeeded = line.orderedQty > 0 && line.conversionFactor
                        ? (line.orderedQty * line.conversionFactor) / stockFactor
                        : line.orderedQty;
                      const isOverStock = line.productId && stockUnitsNeeded > available;
                      const isNegativeMargin = line.productId && line.unitCost > 0 && line.unitPrice < line.unitCost;
                      const baseUnitAbbr = line.productId ? getBaseUnitAbbr(line.productId) : "";
                      const showBreakdown = line.productId && line.orderedQty > 0 && line.conversionFactor > 1;
                      // R4: Detect dimensional product
                      const dims = line.productId ? getDimensionsForProduct(line.productId) : null;
                      const areaPerPiece = dims ? (dims.widthCm / 100) * (dims.heightCm / 100) : 0;
                      const areaM2 = areaInputs[idx] ?? 0;
                      // R5: Check if current unit is integer
                      const selectedUnit = line.productId ? (getUnitsForProduct(line.productId).find(u => u.unitAbbreviation === line.unitAbbr)) : null;
                      const isDecimalError = selectedUnit?.isInteger && line.orderedQty > 0 && !Number.isInteger(line.orderedQty);
                      return (
                        <tr key={idx} className="border-b border-border/50">
                          <td className="p-2">
                            <ProductCombobox
                              products={productOptions}
                              value={line.productId}
                              onSelect={(p) => {
                                const effectivePrice = newOrderCustomerId ? resolvePrice(p.id, newOrderCustomerId) : p.unitPrice;
                                const negotiated = newOrderCustomerId ? checkNegotiated(p.id, newOrderCustomerId) : false;
                                const defaultUnit = getDefaultUnit(p.id);
                                const adjPrice = defaultUnit ? adjustPriceFn(p.id, effectivePrice, defaultUnit.conversionFactor) : effectivePrice;
                                const adjCost = defaultUnit ? adjustPriceFn(p.id, p.unitCost, defaultUnit.conversionFactor) : p.unitCost;
                                setNewOrderLines((prev) => prev.map((l, i) => (i === idx ? {
                                  ...l,
                                  productId: p.id, productName: p.name,
                                  unitPrice: adjPrice, unitCost: adjCost,
                                  isNegotiated: negotiated,
                                  unitAbbr: defaultUnit?.unitAbbreviation ?? "",
                                  unitName: defaultUnit?.unitName ?? "",
                                  conversionFactor: defaultUnit?.conversionFactor ?? 1,
                                } : l)));
                              }}
                              className="w-full"
                            />
                          </td>
                          <td className="p-2">
                            {line.productId && units.length <= 1 ? (
                              <span className="text-xs text-muted-foreground">{line.unitAbbr || units[0]?.unitAbbreviation || "—"}</span>
                            ) : line.productId && units.length > 1 ? (
                              <Select
                                value={line.unitAbbr}
                                onValueChange={(abbr) => {
                                  const unit = units.find(u => u.unitAbbreviation === abbr);
                                  if (!unit) return;
                                  const basePrice = newOrderCustomerId ? resolvePrice(line.productId, newOrderCustomerId) : (productOptions.find(p => p.id === line.productId)?.unitPrice ?? 0);
                                  const baseCost = productOptions.find(p => p.id === line.productId)?.unitCost ?? 0;
                                  setNewOrderLines(prev => prev.map((l, i) => i === idx ? {
                                    ...l,
                                    unitAbbr: unit.unitAbbreviation,
                                    unitName: unit.unitName,
                                    conversionFactor: unit.conversionFactor,
                                    unitPrice: adjustPriceFn(line.productId, basePrice, unit.conversionFactor),
                                    unitCost: adjustPriceFn(line.productId, baseCost, unit.conversionFactor),
                                  } : l));
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {units.map(u => (
                                    <SelectItem key={u.id} value={u.unitAbbreviation}>
                                      {u.unitAbbreviation}{u.isStockUnit ? " ●" : ""}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : null}
                          </td>
                          <td className="p-2 text-right">
                            {line.productId && (
                              <span className={`text-xs font-medium ${available < 20 ? "text-destructive" : "text-muted-foreground"}`}>{available}</span>
                            )}
                          </td>
                          <td className="p-2">
                            {/* R4: m² input for dimensional products */}
                            {dims && areaPerPiece > 0 && (
                              <div className="mb-1">
                                <div className="flex items-center gap-1">
                                  <SquareIcon className="h-3 w-3 text-muted-foreground" />
                                  <Input
                                    type="number"
                                    min={0}
                                    step={0.1}
                                    className="h-7 text-right text-xs w-20"
                                    placeholder="m²"
                                    value={areaM2 || ""}
                                    onChange={(e) => {
                                      const m2 = Number(e.target.value) || 0;
                                      setAreaInputs(prev => ({ ...prev, [idx]: m2 }));
                                      if (m2 > 0) {
                                        const piecesNeeded = Math.ceil(m2 / areaPerPiece);
                                        // Round to cartons if partial not allowed
                                        let finalPieces = piecesNeeded;
                                        if (!dims.allowPartialCarton) {
                                          const cartonConv = getUnitsForProduct(line.productId).find(u => u.unitAbbreviation === "Ctn");
                                          if (cartonConv) {
                                            finalPieces = Math.ceil(piecesNeeded / cartonConv.conversionFactor) * cartonConv.conversionFactor;
                                          }
                                        }
                                        // Convert to current unit
                                        const qtyInUnit = line.conversionFactor > 0 ? Math.ceil(finalPieces / line.conversionFactor) : finalPieces;
                                        setNewOrderLines(prev => prev.map((l, i) => i === idx ? { ...l, orderedQty: qtyInUnit } : l));
                                      }
                                    }}
                                  />
                                  <span className="text-[10px] text-muted-foreground">m²</span>
                                </div>
                                {areaM2 > 0 && (
                                  <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {areaM2.toFixed(1)} m² = {Math.ceil(areaM2 / areaPerPiece)} pce
                                    {line.conversionFactor > 1 && ` = ${line.orderedQty} ${line.unitAbbr}`}
                                    {` → ${(line.orderedQty * line.conversionFactor * areaPerPiece).toFixed(1)} m² réel`}
                                  </p>
                                )}
                              </div>
                            )}
                            <Input type="number" min={1} step={isDecimalError ? 1 : "any"} className={`h-9 text-right ${isOverStock ? "border-destructive" : ""} ${isDecimalError ? "border-destructive" : ""}`} value={line.orderedQty || ""} onChange={(e) => setNewOrderLines((prev) => prev.map((l, i) => (i === idx ? { ...l, orderedQty: Number(e.target.value) || 0 } : l)))} />
                            {showBreakdown && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Ruler className="h-2.5 w-2.5 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground">
                                  = {Math.round(line.orderedQty * line.conversionFactor)} {baseUnitAbbr}
                                </span>
                              </div>
                            )}
                            {/* R5: Decimal error */}
                            {isDecimalError && (
                              <p className="text-[10px] text-destructive mt-0.5">
                                ⚠️ {line.unitAbbr} doit être un nombre entier
                              </p>
                            )}
                          </td>
                          <td className="p-2">
                            <Input type="number" min={0} className={`h-9 text-right ${isNegativeMargin ? "border-destructive" : ""}`} value={line.unitPrice || ""} onChange={(e) => setNewOrderLines((prev) => prev.map((l, i) => (i === idx ? { ...l, unitPrice: Number(e.target.value) || 0 } : l)))} />
                          </td>
                          <td className="p-2 text-right">
                            <div>
                              <span className="font-medium">{currency(line.orderedQty * line.unitPrice)}</span>
                              {line.productId && (
                                <div className="mt-0.5 flex items-center justify-end gap-1">
                                  {line.isNegotiated ? (
                                    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-primary"><Tag className="h-2.5 w-2.5" />Négocié</span>
                                  ) : (
                                    <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground"><BookOpen className="h-2.5 w-2.5" />Catalogue</span>
                                  )}
                                </div>
                              )}
                              {line.productId && line.unitCost > 0 && (
                                <div className="mt-0.5"><MarginBadge unitPrice={line.unitPrice} cost={line.unitCost} /></div>
                              )}
                              {isOverStock && (
                                <div className="text-[10px] text-destructive flex items-center justify-end gap-0.5">
                                  <AlertTriangle className="h-3 w-3" /> Stock insuff.
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            {newOrderLines.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setNewOrderLines((prev) => prev.filter((_, i) => i !== idx))}>
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BR-3 — Partial delivery flag */}
            <div className="flex items-center gap-2 py-1">
              <Checkbox
                id="acceptPartial"
                checked={newOrderAcceptPartial}
                onCheckedChange={(checked) => setNewOrderAcceptPartial(checked === true)}
              />
              <label htmlFor="acceptPartial" className="text-sm cursor-pointer flex items-center gap-1.5">
                <PackageCheck className="h-3.5 w-3.5 text-muted-foreground" />
                Accepter la livraison partielle
              </label>
            </div>

            {/* Summary preview */}
            {validLines.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Sous-total</span><span>{currency(subtotal)}</span></div>
                {newOrderDiscountPct > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Remise ({newOrderDiscountPct}%)</span><span className="text-destructive">-{currency(subtotal - afterDiscount)}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">TVA (15%)</span><span>{currency(taxAmount)}</span></div>
                <div className="flex justify-between font-bold border-t border-border pt-1"><span>Total TTC</span><span>{currency(totalAmount)}</span></div>
              </div>
            )}

            {/* BR-2 — Debt warning banner */}
            {customer && debtInfo.overdueDays > 0 && (
              <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${debtInfo.blocked ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-amber-400/30 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"}`}>
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  {debtInfo.blocked
                    ? <><strong>⛔ Commande bloquée</strong> — {debtInfo.overdueCount} facture(s) impayée(s) depuis {debtInfo.overdueDays} jours ({currency(debtInfo.overdueAmount)}). Les commandes sont interdites au-delà de 60 jours.</>
                    : <><strong>⚠️ Attention dette</strong> — {debtInfo.overdueCount} facture(s) en retard de {debtInfo.overdueDays} jours ({currency(debtInfo.overdueAmount)})</>
                  }
                </span>
              </div>
            )}

            {/* BR-7 — Stock blocking warning */}
            {stockIssues.length > 0 && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                <Ban className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Stock insuffisant — commande bloquée</strong>
                  <ul className="mt-1 text-xs space-y-0.5">
                    {stockIssues.map((s, i) => (
                      <li key={i}>• {s.productName}: {s.available} dispo / {s.requested} demandé</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* BR-8 — Min order value */}
            {isBelowMinOrder && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                <Ban className="h-4 w-4 shrink-0" />
                <span><strong>Montant minimum non atteint</strong> — Le type <em>{customer?.type}</em> requiert un minimum de {currency(minOrderValue)}. Actuel : {currency(totalAmount)}</span>
              </div>
            )}

            {/* R5 — Decimal validation warning */}
            {decimalIssues.length > 0 && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                <Ban className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Quantités décimales non autorisées</strong>
                  <ul className="mt-1 text-xs space-y-0.5">
                    {decimalIssues.map((name, i) => (
                      <li key={i}>• {name} : cette unité nécessite un nombre entier</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {customer && isCreditExceeded && !debtInfo.blocked && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 px-3 py-2 text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>⚠️ Crédit sera dépassé — commande sera placée en <strong>Credit Hold</strong> ({currency(customer.creditUsed)} + {currency(totalAmount)} &gt; {currency(customer.creditLimit)})</span>
              </div>
            )}

            {/* 3.6 — Negative margin warning */}
            {hasNegativeMargin && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>Une ou plusieurs lignes ont une <strong>marge négative</strong>. La création est bloquée tant que les prix ne sont pas corrigés.</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setNewOrderOpen(false)}>Annuler</Button>
              <Button onClick={handleValidate} disabled={!canSubmit}>
                <ClipboardCheck className="h-4 w-4 mr-1" /> Vérifier & Créer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la commande</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Client :</span> <span className="font-medium">{customer?.name}</span></div>
                  <div><span className="text-muted-foreground">Vendeur :</span> {newOrderSalesRep}</div>
                  <div><span className="text-muted-foreground">Canal :</span> {CHANNEL_LABELS[newOrderChannel]}</div>
                  <div><span className="text-muted-foreground">Paiement :</span> {newOrderPaymentTerms.replace(/_/g, " ")}</div>
                </div>
                <div className="text-sm space-y-0.5">
                  <p className="font-medium">{validLines.length} ligne(s) :</p>
                  {validLines.map((l, i) => (
                    <div key={i} className="flex justify-between text-xs text-muted-foreground">
                      <span>{l.productName} × {l.orderedQty} {l.unitAbbr}</span>
                      <span>{currency(l.orderedQty * l.unitPrice)}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-2 space-y-0.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Sous-total</span><span>{currency(subtotal)}</span></div>
                  {newOrderDiscountPct > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Remise ({newOrderDiscountPct}%)</span><span className="text-destructive">-{currency(subtotal - afterDiscount)}</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">TVA (15%)</span><span>{currency(taxAmount)}</span></div>
                  <div className="flex justify-between font-bold border-t border-border pt-1"><span>Total TTC</span><span className="text-primary">{currency(totalAmount)}</span></div>
                </div>

                {/* Order Review — Check results */}
                <div className="rounded-lg border border-border bg-muted/20 p-2 space-y-1 text-xs">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Vérifications</p>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Stock disponible pour toutes les lignes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isCreditExceeded
                      ? <><XCircle className="h-3.5 w-3.5 text-amber-500" /><span className="text-amber-600 dark:text-amber-400">Crédit dépassé → statut <strong>Credit Hold</strong></span></>
                      : <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /><span>Crédit OK ({Math.round(((customer?.creditUsed ?? 0) + totalAmount) / (customer?.creditLimit ?? 1) * 100)}%)</span></>
                    }
                  </div>
                  <div className="flex items-center gap-1.5">
                    {debtInfo.overdueDays > 0
                      ? <><AlertTriangle className="h-3.5 w-3.5 text-amber-500" /><span className="text-amber-600 dark:text-amber-400">Facture(s) en retard : {debtInfo.overdueDays}j</span></>
                      : <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /><span>Aucune dette en retard</span></>
                    }
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Montant minimum respecté ({currency(minOrderValue)})</span>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Modifier</AlertDialogCancel>
            <AlertDialogAction onClick={createOrder}>Confirmer la création</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Phase 4 — Anomaly Warning Dialog */}
      {hook.anomalies && hook.anomalies.length > 0 && (
        <AnomalyWarningDialog
          open={hook.anomalyDialogOpen}
          onOpenChange={hook.setAnomalyDialogOpen}
          anomalies={hook.anomalies}
          productName={hook.anomalyProductName}
          onConfirm={() => {
            hook.setAnomalyConfirmed(true);
            hook.setAnomalyDialogOpen(false);
            hook.setConfirmDialogOpen(true);
          }}
          onCancel={() => hook.setAnomalyDialogOpen(false)}
        />
      )}
    </>
  );
}
