import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { mockCustomers, mobileCatalog } from "@/mobile/data/mockSalesData";
import type { MobileCatalogItem } from "@/mobile/data/mockSalesData";
import { ArrowLeft, Minus, Plus, Search, Check, AlertTriangle, WifiOff, Package, ArrowRightLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { enqueue, isOnline } from "@/services/offlineSync";
import { checkCredit } from "@/shared/utils/creditCheck";
import { detectAnomalies, hasBlockingAnomaly, hasWarningAnomaly, type AnomalyCheck } from "@/lib/qtyAnomalyDetector";
import { getProductAnomalyThreshold } from "@/data/anomalyThresholds";
import AnomalyWarningDialog from "@/components/AnomalyWarningDialog";

const currency = (v: number) => v.toLocaleString("fr-DZ", { maximumFractionDigits: 0 }) + " DZD";

/** Simulates real-time stock fluctuation for demo */
function getRealtimeStock(baseStock: number, productId: string): number {
  // Simulate slight variation to show "real-time" feel
  const seed = productId.charCodeAt(productId.length - 1) + new Date().getMinutes();
  const variance = Math.floor(Math.sin(seed) * 5);
  return Math.max(0, baseStock + variance);
}

export default function MobileNewOrderScreen() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const preselectedCustomer = params.get("customer") || "";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCustomer, setSelectedCustomer] = useState(preselectedCustomer);
  const [cart, setCart] = useState<Record<string, { qty: number; unitAbbr: string; factor: number }>>({});
  const [search, setSearch] = useState("");
  const [acceptPartial, setAcceptPartial] = useState(false);
  const [anomalies, setAnomalies] = useState<AnomalyCheck[]>([]);
  const [showAnomalyDialog, setShowAnomalyDialog] = useState(false);

  const customer = mockCustomers.find(c => c.id === selectedCustomer);

  // Realtime stock map
  const realtimeStockMap = useMemo(() => {
    const map: Record<string, number> = {};
    mobileCatalog.forEach(p => {
      map[p.id] = getRealtimeStock(p.stock, p.id);
    });
    return map;
  }, []);

  const totalAmount = useMemo(() =>
    Object.entries(cart).reduce((sum, [pid, item]) => {
      const p = mobileCatalog.find(x => x.id === pid);
      // Price is per base unit, qty is in selected unit
      return sum + (p ? p.unitPrice * item.qty * item.factor : 0);
    }, 0), [cart]);

  const cartItems = Object.entries(cart).filter(([, item]) => item.qty > 0);

  // Use shared credit check utility
  const creditResult = customer
    ? checkCredit(customer, totalAmount)
    : { passed: true, available: 0, requested: 0, overdueDays: 0, blocked: false };

  // Per-line stock validation (in base units)
  const stockIssues = useMemo(() => {
    const issues: { productName: string; requested: number; available: number; baseUnit: string }[] = [];
    cartItems.forEach(([pid, item]) => {
      const available = realtimeStockMap[pid] ?? 0;
      const requestedBase = item.qty * item.factor;
      if (requestedBase > available) {
        const p = mobileCatalog.find(x => x.id === pid);
        issues.push({ productName: p?.name ?? pid, requested: requestedBase, available, baseUnit: p?.baseUnit ?? "" });
      }
    });
    return issues;
  }, [cartItems, realtimeStockMap]);

  const stockOk = stockIssues.length === 0;
  const minOrderMet = totalAmount >= 5000; // BR-8: 5000 DZD minimum

  const updateQty = (pid: string, delta: number, unitAbbr?: string, factor?: number) => {
    setCart(prev => {
      const current = prev[pid];
      const p = mobileCatalog.find(x => x.id === pid);
      const defaultConv = p?.conversions[0];
      const activeAbbr = unitAbbr ?? current?.unitAbbr ?? defaultConv?.unitAbbr ?? "";
      const activeFactor = factor ?? current?.factor ?? defaultConv?.factor ?? 1;
      const currentQty = current?.qty ?? 0;
      const maxStock = realtimeStockMap[pid] ?? 0;
      const maxQty = Math.floor(maxStock / activeFactor);
      const next = Math.max(0, Math.min(currentQty + delta, maxQty));
      if (next === 0) { const { [pid]: _, ...rest } = prev; return rest; }
      return { ...prev, [pid]: { qty: next, unitAbbr: activeAbbr, factor: activeFactor } };
    });
  };

  const changeUnit = (pid: string, unitAbbr: string, factor: number) => {
    setCart(prev => {
      const current = prev[pid];
      if (!current) return prev;
      const maxStock = realtimeStockMap[pid] ?? 0;
      const maxQty = Math.floor(maxStock / factor);
      const newQty = Math.min(current.qty, maxQty);
      if (newQty === 0) { const { [pid]: _, ...rest } = prev; return rest; }
      return { ...prev, [pid]: { qty: newQty, unitAbbr, factor } };
    });
  };

  const filtered = useMemo(() => {
    if (!search) return mobileCatalog;
    const q = search.toLowerCase();
    return mobileCatalog.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }, [search]);

  /** Run anomaly detection on all cart lines */
  const runAnomalyChecks = (): AnomalyCheck[] => {
    const allAnomalies: AnomalyCheck[] = [];
    for (const [pid, item] of cartItems) {
      const p = mobileCatalog.find(x => x.id === pid);
      if (!p) continue;
      const threshold = getProductAnomalyThreshold(pid);
      const detected = detectAnomalies(
        pid,
        item.qty,
        item.unitAbbr,
        item.factor,
        {
          historicalOrders: [], // no history in mobile mock
          currentStock: realtimeStockMap[pid],
          unit: { isInteger: item.factor >= 1 && Number.isInteger(item.factor), unitAbbreviation: item.unitAbbr },
          maxSingleOrderBase: threshold?.maxSingleOrderBase,
          blockOnSpike: threshold?.blockOnSpike,
        },
        {
          volumeSpikeMultiplier: threshold?.volumeSpikeMultiplier ?? 3,
          capacityCheckEnabled: true,
          unitSwitchDetection: false, // no history available
          minimumHistoryOrders: 5,
        }
      );
      allAnomalies.push(...detected);
    }
    return allAnomalies;
  };

  const handleSubmitOrder = () => {
    // Run anomaly checks before confirming
    const detected = runAnomalyChecks();
    if (detected.length > 0) {
      setAnomalies(detected);
      setShowAnomalyDialog(true);
      return;
    }
    setStep(3);
    proceedWithConfirm();
  };

  const proceedWithConfirm = async () => {
    const orderPayload = {
      customerId: selectedCustomer,
      customerName: customer?.name,
      lines: cartItems.map(([pid, item]) => {
        const p = mobileCatalog.find(x => x.id === pid)!;
        return { productId: pid, productName: p.name, sku: p.sku, qty: item.qty, unitAbbr: item.unitAbbr, factor: item.factor, baseQty: item.qty * item.factor, unitPrice: p.unitPrice, stock: realtimeStockMap[pid] };
      }),
      totalAmount,
      acceptPartial,
      creditCheck: creditResult,
      createdAt: new Date().toISOString(),
    };

    await enqueue({ type: "create_order", payload: orderPayload });

    navigator.vibrate?.(50);
    const offlineMsg = !isOnline() ? " (hors ligne — sera synchronisée)" : "";
    toast({ title: "✅ Commande créée", description: `${currency(totalAmount)} — En attente d'approbation${offlineMsg}` });
    navigate("/mobile/dashboard", { replace: true });
  };

  const canConfirm = creditResult.passed && stockOk && minOrderMet && cartItems.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => step === 1 ? navigate(-1) : setStep(s => (s - 1) as 1 | 2)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-bold text-foreground">
          {step === 1 ? "Sélectionner produits" : step === 2 ? "Récapitulatif" : "Confirmé"}
        </h1>
        <div className="ml-auto flex gap-1">
          {[1, 2, 3].map(s => (
            <div key={s} className={cn("h-1.5 w-6 rounded-full", s <= step ? "bg-primary" : "bg-muted")} />
          ))}
        </div>
      </div>

      {/* Step 1: Products */}
      {step === 1 && (
        <div className="flex-1 overflow-y-auto">
          {/* Customer selector */}
          {!selectedCustomer && (
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs text-muted-foreground mb-2">Choisir un client</p>
              <div className="space-y-1.5">
                {mockCustomers.filter(c => c.oldestOverdueDays < 60).map(c => (
                  <button key={c.id} onClick={() => setSelectedCustomer(c.id)}
                    className="w-full text-left bg-card border border-border rounded-lg p-2.5 text-sm active:bg-muted">
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedCustomer && (
            <>
              <div className="px-4 py-2 bg-muted/50 flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">🏪 {customer?.name}</span>
                <button onClick={() => setSelectedCustomer("")} className="text-xs text-primary">Changer</button>
              </div>

              {/* Credit warning banner */}
              {customer && customer.oldestOverdueDays >= 30 && (
                <div className="mx-4 mt-2 bg-destructive/10 border border-destructive/20 rounded-lg p-2.5 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                  <span className="text-xs font-medium text-destructive">
                    Factures impayées depuis {customer.oldestOverdueDays} jours
                    {customer.oldestOverdueDays >= 60 && " — BLOQUÉ"}
                  </span>
                </div>
              )}

              <div className="px-4 py-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Chercher un produit..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-10 text-sm" />
                </div>
              </div>

               <div className="px-4 space-y-2 pb-28">
                {filtered.map(p => {
                  const cartItem = cart[p.id];
                  const qty = cartItem?.qty ?? 0;
                  const activeUnit = cartItem?.unitAbbr ?? p.conversions[0]?.unitAbbr ?? p.baseUnit;
                  const activeFactor = cartItem?.factor ?? p.conversions[0]?.factor ?? 1;
                  const realStock = realtimeStockMap[p.id] ?? 0;
                  const lowStock = realStock < 20;
                  const outOfStock = realStock === 0;
                  const maxQtyInUnit = Math.floor(realStock / activeFactor);
                  return (
                    <div key={p.id} className={cn("bg-card border border-border rounded-xl p-3", outOfStock && "opacity-50")}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">{p.sku}</span>
                            <Badge variant={outOfStock ? "destructive" : lowStock ? "outline" : "secondary"} className="text-[10px]">
                              <Package className="h-3 w-3 mr-0.5" />
                              {outOfStock ? "Rupture" : `${realStock} ${p.baseUnit}`}
                            </Badge>
                          </div>
                          <p className="text-sm font-bold text-primary mt-1">{currency(p.unitPrice)}/{p.baseUnit}</p>
                          {/* Unit selector */}
                          {p.conversions.length > 1 && (
                            <div className="flex gap-1 mt-1.5 flex-wrap">
                              {p.conversions.filter(c => c.factor >= 1).map(c => (
                                <button
                                  key={c.unitAbbr}
                                  onClick={() => {
                                    if (qty > 0) changeUnit(p.id, c.unitAbbr, c.factor);
                                    else updateQty(p.id, 0, c.unitAbbr, c.factor);
                                  }}
                                  className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors",
                                    activeUnit === c.unitAbbr
                                      ? "bg-primary/10 text-primary border-primary/30"
                                      : "bg-muted text-muted-foreground border-transparent"
                                  )}
                                >
                                  {c.unitAbbr} (×{c.factor})
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {qty > 0 && (
                            <button onClick={() => updateQty(p.id, -1)} className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center active:bg-border">
                              <Minus className="h-4 w-4" />
                            </button>
                          )}
                          {qty > 0 && (
                            <div className="text-center">
                              <span className="text-sm font-bold">{qty}</span>
                              <span className="text-[10px] text-muted-foreground block">{activeUnit}</span>
                            </div>
                          )}
                          <button
                            onClick={() => updateQty(p.id, 1, activeUnit, activeFactor)}
                            disabled={outOfStock || qty >= maxQtyInUnit}
                            className={cn(
                              "h-9 w-9 rounded-lg flex items-center justify-center",
                              outOfStock || qty >= maxQtyInUnit
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-primary/10 text-primary active:bg-primary/20"
                            )}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Floating cart bar */}
          {cartItems.length > 0 && (
            <div className="fixed bottom-20 left-0 right-0 px-4 z-20">
              <button
                onClick={() => setStep(2)}
                className="w-full bg-primary text-primary-foreground rounded-xl p-4 flex items-center justify-between font-semibold shadow-lg active:opacity-90"
              >
                <span>{cartItems.length} produit(s)</span>
                <span>{currency(totalAmount)} →</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <ArrowRightLeft className="h-4 w-4 text-primary" />
              Résumé commande
            </h3>
            {cartItems.map(([pid, item]) => {
              const p = mobileCatalog.find(x => x.id === pid)!;
              const baseQty = item.qty * item.factor;
              return (
                <div key={pid} className="py-2 border-b border-border last:border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.qty} {item.unitAbbr} = {baseQty} {p.baseUnit}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">{currency(p.unitPrice * baseQty)}</span>
                  </div>
                </div>
              );
            })}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="font-bold text-foreground">Total</span>
              <span className="font-bold text-lg text-primary">{currency(totalAmount)}</span>
            </div>
          </div>

          {/* Checks */}
          <div className="space-y-2">
            {/* Credit check */}
            <div className={cn("flex items-center gap-2 rounded-lg p-3 text-xs font-medium", creditResult.passed ? "bg-emerald-500/10 text-emerald-700" : "bg-destructive/10 text-destructive")}>
              {creditResult.passed ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              💳 Crédit: {creditResult.passed ? "Disponible" : creditResult.blocked ? "BLOQUÉ (impayés > 60j)" : "Insuffisant"} ({currency(creditResult.available)} disponible)
            </div>

            {/* Stock check */}
            <div className={cn("flex items-center gap-2 rounded-lg p-3 text-xs font-medium", stockOk ? "bg-emerald-500/10 text-emerald-700" : "bg-destructive/10 text-destructive")}>
              {stockOk ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              📦 Stock: {stockOk ? "Tous les produits disponibles" : `${stockIssues.length} produit(s) en rupture`}
            </div>

            {/* Stock issue details */}
            {stockIssues.length > 0 && (
              <div className="bg-destructive/5 rounded-lg p-2 space-y-1">
                {stockIssues.map((issue, i) => (
                  <p key={i} className="text-xs text-destructive">
                    • {issue.productName}: {issue.available} {issue.baseUnit} dispo / {issue.requested} {issue.baseUnit} demandé
                  </p>
                ))}
              </div>
            )}

            {/* Min order check */}
            <div className={cn("flex items-center gap-2 rounded-lg p-3 text-xs font-medium", minOrderMet ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-700")}>
              {minOrderMet ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              📏 Minimum: {minOrderMet ? "Atteint" : `${currency(5000)} requis (${currency(totalAmount)} actuel)`}
            </div>
          </div>

          {/* Partial delivery */}
          <label className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 cursor-pointer">
            <input type="checkbox" checked={acceptPartial} onChange={e => setAcceptPartial(e.target.checked)} className="h-5 w-5 rounded accent-primary" />
            <span className="text-sm text-foreground">Accepter livraison partielle</span>
          </label>

          {/* Offline indicator */}
          {!isOnline() && (
            <div className="flex items-center gap-2 rounded-lg p-3 bg-amber-500/10 text-amber-700 text-xs font-medium">
              <WifiOff className="h-4 w-4" />
              Hors ligne — la commande sera mise en file d'attente
            </div>
          )}

          <button
            onClick={() => handleSubmitOrder()}
            disabled={!canConfirm}
            className={cn(
              "w-full rounded-xl p-4 font-semibold text-center min-h-[52px] transition-opacity",
              canConfirm ? "bg-primary text-primary-foreground active:opacity-90" : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {canConfirm ? "Confirmer la commande ✅" : "Vérifications échouées"}
          </button>
        </div>
      )}

      {/* Step 3: Confirmed */}
      {step === 3 && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">Commande créée !</h2>
          <p className="text-sm text-muted-foreground mb-2">{currency(totalAmount)} — En attente d'approbation</p>
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="secondary" className="text-xs">💳 Crédit vérifié</Badge>
            <Badge variant="secondary" className="text-xs">📦 Stock réservé</Badge>
          </div>
          <div className="flex gap-3 w-full max-w-xs">
            <button onClick={() => navigate("/mobile/dashboard")} className="flex-1 bg-card border border-border rounded-xl p-3 text-sm font-medium active:bg-muted">
              Accueil
            </button>
            <button onClick={() => { setStep(1); setCart({}); setSearch(""); }} className="flex-1 bg-primary text-primary-foreground rounded-xl p-3 text-sm font-medium active:opacity-90">
              Nouvelle
            </button>
          </div>
        </div>
      )}

      {/* Anomaly Warning Dialog */}
      <AnomalyWarningDialog
        open={showAnomalyDialog}
        onOpenChange={setShowAnomalyDialog}
        anomalies={anomalies}
        onConfirm={() => {
          setShowAnomalyDialog(false);
          setStep(3);
          proceedWithConfirm();
        }}
        onCancel={() => setShowAnomalyDialog(false)}
      />
    </div>
  );
}
