import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Clock, Package, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { todayTrip, pendingStopOrders } from "../data/mockDeliveryData";
import { StopStatusBadge, SLABadge } from "../components/DeliveryComponents";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { style: "decimal", maximumFractionDigits: 0 }).format(v) + " DH";

export default function StopDetailScreen() {
  const { stopId } = useParams<{ stopId: string }>();
  const navigate = useNavigate();
  const stop = todayTrip.stops.find((s) => s.id === stopId);

  if (!stop) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Arrêt introuvable</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">Retour</Button>
      </div>
    );
  }

  const lines = stop.deliveryResult?.lines ?? pendingStopOrders[stop.id]?.map((l, i) => ({
    lineId: i + 1,
    productId: l.productId,
    productName: l.productName,
    orderedQty: l.orderedQty,
    deliveredQty: 0,
    returnedQty: 0,
    returnReason: undefined as string | undefined,
  })) ?? [];

  const canDeliver = stop.status === "pending" || stop.status === "in_progress";

  return (
    <div className="p-4 space-y-4 animate-fade-in pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">Arrêt #{stop.sequence}</h1>
            <StopStatusBadge status={stop.status} />
          </div>
          <p className="text-xs text-muted-foreground">{stop.customerName}</p>
        </div>
      </div>

      {/* Customer info */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
          <span>{stop.address}</span>
        </div>
        {stop.plannedTime && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>Prévu: {stop.plannedTime}</span>
            <SLABadge plannedTime={stop.plannedTime} actualTime={stop.actualTime} />
          </div>
        )}
      </div>

      {/* Order lines */}
      <div>
        <h2 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
          <Package className="h-4 w-4 text-muted-foreground" /> Articles
        </h2>
        <div className="rounded-xl border border-border bg-card divide-y divide-border/50">
          <div className="grid grid-cols-[1fr,60px,60px] px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            <span>Produit</span>
            <span className="text-center">Cmd</span>
            <span className="text-center">Livré</span>
          </div>
          {lines.map((line) => (
            <div key={line.lineId} className="grid grid-cols-[1fr,60px,60px] px-4 py-3 items-center">
              <div>
                <p className="text-sm font-medium truncate">{line.productName}</p>
                {line.returnedQty > 0 && (
                  <p className="text-[10px] text-destructive">↩ {line.returnedQty} retourné · {line.returnReason}</p>
                )}
              </div>
              <p className="text-sm text-center text-muted-foreground">{line.orderedQty}</p>
              <p className={`text-sm text-center font-semibold ${
                line.deliveredQty === line.orderedQty ? "text-foreground" :
                line.deliveredQty > 0 ? "text-amber-600" : "text-muted-foreground"
              }`}>
                {stop.deliveryResult ? line.deliveredQty : "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Cash info */}
      {stop.cashCollection && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-1">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <Banknote className="h-4 w-4 text-muted-foreground" /> Encaissement
          </h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Facture</span>
            <span>{currency(stop.cashCollection.invoiceAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Reçu</span>
            <span className="font-semibold">{currency(stop.cashCollection.collectedAmount)}</span>
          </div>
          {stop.cashCollection.invoiceAmount !== stop.cashCollection.collectedAmount && (
            <div className="flex justify-between text-sm">
              <span className="text-destructive">Écart</span>
              <span className="text-destructive font-semibold">
                {currency(stop.cashCollection.collectedAmount - stop.cashCollection.invoiceAmount)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Delivery notes */}
      {stop.deliveryResult?.notes && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Notes</p>
          <p className="text-sm">{stop.deliveryResult.notes}</p>
        </div>
      )}

      {/* Actions */}
      {canDeliver && (
        <div className="space-y-2">
          <Button
            onClick={() => navigate(`/delivery/confirm/${stop.id}`)}
            className="w-full min-h-14 text-base"
          >
            📦 Confirmer la livraison
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/delivery/cash/${stop.id}`)}
            className="w-full"
          >
            💰 Encaisser
          </Button>
        </div>
      )}
    </div>
  );
}
