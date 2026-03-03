import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { todayTrip, pendingStopOrders } from "../data/mockDeliveryData";
import SignatureCanvas from "../components/SignatureCanvas";
import type { ReturnReason } from "../types/trip";

const REASONS: { value: ReturnReason; label: string }[] = [
  { value: "damaged", label: "Produit abîmé" },
  { value: "expired", label: "Produit périmé" },
  { value: "wrong_product", label: "Mauvais produit" },
  { value: "customer_refused", label: "Client refuse" },
  { value: "quality_issue", label: "Problème qualité" },
  { value: "other", label: "Autre" },
];

interface LineState {
  deliveredQty: number;
  returnReason?: ReturnReason;
}

export default function DeliveryConfirmScreen() {
  const { stopId } = useParams<{ stopId: string }>();
  const navigate = useNavigate();
  const stop = todayTrip.stops.find((s) => s.id === stopId);
  const orderLines = pendingStopOrders[stopId ?? ""] ?? [];

  const [lines, setLines] = useState<Record<string, LineState>>(() => {
    const init: Record<string, LineState> = {};
    orderLines.forEach((l) => { init[l.productId] = { deliveredQty: l.orderedQty }; });
    return init;
  });
  const [notes, setNotes] = useState("");
  const [showSignature, setShowSignature] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  if (!stop || orderLines.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Arrêt introuvable ou déjà livré</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">Retour</Button>
      </div>
    );
  }

  const isPartial = orderLines.some((l) => (lines[l.productId]?.deliveredQty ?? 0) < l.orderedQty);
  const totalReturned = orderLines.reduce((s, l) => {
    const delivered = lines[l.productId]?.deliveredQty ?? 0;
    return s + Math.max(0, l.orderedQty - delivered);
  }, 0);

  const handleConfirm = () => {
    toast({
      title: isPartial ? "⚠️ Livraison partielle confirmée" : "✅ Livraison confirmée",
      description: `${stop.customerName} — ${totalReturned > 0 ? `${totalReturned} unité(s) retournée(s)` : "Complet"}`,
    });
    navigate("/delivery/trip", { replace: true });
  };

  if (showSignature) {
    return (
      <div className="p-4 space-y-4 animate-fade-in">
        <SignatureCanvas
          onSave={(dataUrl) => { setSignature(dataUrl); setShowSignature(false); }}
          onCancel={() => setShowSignature(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in pb-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold">Livraison — Arrêt #{stop.sequence}</h1>
          <p className="text-xs text-muted-foreground">🏪 {stop.customerName}</p>
        </div>
      </div>

      {/* Lines with qty inputs */}
      <div className="rounded-xl border border-border bg-card divide-y divide-border/50">
        <div className="grid grid-cols-[1fr,60px,80px] px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          <span>Produit</span>
          <span className="text-center">Cmd</span>
          <span className="text-center">Livré</span>
        </div>
        {orderLines.map((l) => {
          const state = lines[l.productId];
          const isShort = (state?.deliveredQty ?? 0) < l.orderedQty;
          return (
            <div key={l.productId} className="px-4 py-3 space-y-2">
              <div className="grid grid-cols-[1fr,60px,80px] items-center">
                <p className="text-sm font-medium truncate">{l.productName}</p>
                <p className="text-sm text-center text-muted-foreground">{l.orderedQty}</p>
                <input
                  type="number"
                  min={0}
                  max={l.orderedQty}
                  value={state?.deliveredQty ?? 0}
                  onChange={(e) => setLines((prev) => ({
                    ...prev,
                    [l.productId]: { ...prev[l.productId], deliveredQty: Math.min(Number(e.target.value), l.orderedQty) },
                  }))}
                  className="w-16 mx-auto h-8 rounded border border-border px-2 text-sm text-center bg-background font-semibold"
                />
              </div>
              {isShort && (
                <div className="pl-0">
                  <p className="text-[10px] text-destructive mb-1">⚠️ Retour: {l.orderedQty - (state?.deliveredQty ?? 0)} unité(s)</p>
                  <Select
                    value={state?.returnReason ?? ""}
                    onValueChange={(v) => setLines((prev) => ({
                      ...prev,
                      [l.productId]: { ...prev[l.productId], returnReason: v as ReturnReason },
                    }))}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Raison du retour" />
                    </SelectTrigger>
                    <SelectContent>
                      {REASONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isPartial && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-3 text-xs text-amber-700 dark:text-amber-400 font-medium">
          ⚠️ Livraison partielle — {totalReturned} unité(s) en retour
        </div>
      )}

      {/* Notes */}
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optionnel)..."
        rows={2}
      />

      {/* Signature */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setShowSignature(true)} className="flex-1">
          {signature ? "✅ Signature capturée" : "✍️ Signature client"}
        </Button>
        <Button variant="outline" className="flex-1">
          📷 Photo preuve
        </Button>
      </div>

      <Button onClick={handleConfirm} className="w-full min-h-14 text-base">
        Confirmer livraison ✅
      </Button>
    </div>
  );
}
