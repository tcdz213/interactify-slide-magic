import { todayTrip } from "../data/mockDeliveryData";

export default function ProofsScreen() {
  const stopsWithProof = todayTrip.stops.filter((s) => s.deliveryResult);

  return (
    <div className="p-4 space-y-4 animate-fade-in pb-6">
      <h1 className="text-lg font-bold">📷 Preuves de livraison</h1>

      {stopsWithProof.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Aucune preuve capturée</p>
      ) : (
        <div className="space-y-3">
          {stopsWithProof.map((stop) => (
            <div key={stop.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold">#{stop.sequence} {stop.customerName}</p>
                <span className="text-[10px] text-muted-foreground">
                  {stop.deliveryResult?.confirmedAt
                    ? new Date(stop.deliveryResult.confirmedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                    : ""}
                </span>
              </div>

              <div className="flex gap-2 flex-wrap">
                {stop.deliveryResult?.signatureBase64 && (
                  <div className="rounded-lg border border-border bg-muted p-2 text-center">
                    <span className="text-[10px] text-muted-foreground">✍️ Signature</span>
                  </div>
                )}
                {stop.deliveryResult?.photoUrls.length ? (
                  stop.deliveryResult.photoUrls.map((_, i) => (
                    <div key={i} className="rounded-lg border border-border bg-muted p-2 text-center">
                      <span className="text-[10px] text-muted-foreground">📷 Photo {i + 1}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-muted-foreground">Pas de photos</p>
                )}
              </div>

              {stop.deliveryResult?.notes && (
                <p className="text-xs text-muted-foreground italic">{stop.deliveryResult.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
