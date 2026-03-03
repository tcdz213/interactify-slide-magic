import { Eye, History, FileDown } from "lucide-react";
import { currency } from "@/data/mockData";
import { exportOrderPDF } from "@/lib/pdfExport";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { SalesOrder } from "@/data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import StatusBadge from "@/components/StatusBadge";
import { NEXT_STATUS, NEXT_STATUS_TOOLTIP, STATUS_LABELS_FR, CHANNEL_LABELS, getStatusHistory } from "./orderStatus";
import type { useOrderForm } from "./useOrderForm";

type FormHook = ReturnType<typeof useOrderForm>;

interface OrderDetailDrawerProps {
  hook: FormHook;
}

export function OrderDetailDrawer({ hook }: OrderDetailDrawerProps) {
  const {
    selectedOrder, setSelectedOrder,
    cancelDialogOrder, setCancelDialogOrder,
    historyDialogOrder, setHistoryDialogOrder,
    canApprove, handleStatusChange, handleCancel,
  } = hook;

  return (
    <>
      {/* Order detail dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className="font-mono">{selectedOrder.id}</span>
                  <StatusBadge status={selectedOrder.status} />
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <div><span className="text-muted-foreground">Client :</span> <span className="font-medium">{selectedOrder.customerName}</span></div>
                <div><span className="text-muted-foreground">Vendeur :</span> {selectedOrder.salesRep}</div>
                <div><span className="text-muted-foreground">Date :</span> {selectedOrder.orderDate}</div>
                <div><span className="text-muted-foreground">Livraison :</span> {selectedOrder.deliveryDate}</div>
                <div><span className="text-muted-foreground">Canal :</span> {CHANNEL_LABELS[selectedOrder.channel] ?? selectedOrder.channel}</div>
                <div><span className="text-muted-foreground">Remise :</span> {selectedOrder.discountPct}%</div>
                <div><span className="text-muted-foreground">Conditions :</span> {selectedOrder.paymentTerms.replace(/_/g, " ")}</div>
                <div><span className="text-muted-foreground">Sous-total :</span> {currency(selectedOrder.subtotal)}</div>
                <div><span className="text-muted-foreground">TVA :</span> {currency(selectedOrder.taxAmount)}</div>
                <div className="col-span-2 text-lg font-bold">Total : {currency(selectedOrder.totalAmount)}</div>
                {selectedOrder.notes && <div className="col-span-2 text-muted-foreground italic">{selectedOrder.notes}</div>}
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    exportOrderPDF({
                      ...selectedOrder,
                      lines: selectedOrder.lines.map((l) => ({
                        productName: l.productName,
                        orderedQty: l.orderedQty,
                        unitPrice: l.unitPrice,
                        lineTotal: l.lineTotal,
                      })),
                    });
                    toast({ title: "PDF exporté", description: `Commande ${selectedOrder.id}` });
                  }}
                >
                  <FileDown className="h-3.5 w-3.5 mr-1" /> Exporter PDF
                </Button>
              </div>
              {NEXT_STATUS[selectedOrder.status] && canApprove("salesOrder") && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      const next = NEXT_STATUS[selectedOrder.status]!;
                      handleStatusChange(selectedOrder.id, next);
                      setSelectedOrder((prev) =>
                        prev ? { ...prev, status: next, lines: prev.lines.map((l) => ({ ...l, shippedQty: next === "Shipped" || next === "Delivered" ? l.orderedQty : l.shippedQty })) } : null
                      );
                    }}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    {NEXT_STATUS_TOOLTIP[selectedOrder.status] ?? `Passer à ${STATUS_LABELS_FR[NEXT_STATUS[selectedOrder.status]!] ?? NEXT_STATUS[selectedOrder.status]}`}
                  </button>
                </div>
              )}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Lignes de commande</h4>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 text-muted-foreground">Produit</th>
                      <th className="text-right py-2 px-2 text-muted-foreground">Qté</th>
                      <th className="text-right py-2 px-2 text-muted-foreground">Réservé</th>
                      <th className="text-right py-2 px-2 text-muted-foreground">Expédié</th>
                      <th className="text-right py-2 px-2 text-muted-foreground">Prix U.</th>
                      <th className="text-right py-2 px-2 text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.lines.map((line) => (
                      <tr key={line.lineId} className="border-b border-border/50">
                        <td className="py-2 px-2 font-medium">{line.productName}</td>
                        <td className="py-2 px-2 text-right">{line.orderedQty}</td>
                        <td className="py-2 px-2 text-right">{line.reservedQty}</td>
                        <td className="py-2 px-2 text-right">{line.shippedQty}</td>
                        <td className="py-2 px-2 text-right">{currency(line.unitPrice)}</td>
                        <td className="py-2 px-2 text-right font-medium">{currency(line.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel dialog */}
      <AlertDialog open={!!cancelDialogOrder} onOpenChange={() => setCancelDialogOrder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler la commande ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler la commande <span className="font-mono font-semibold">{cancelDialogOrder?.id}</span> pour {cancelDialogOrder?.customerName} ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Non, garder</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => cancelDialogOrder && handleCancel(cancelDialogOrder)}>
              Oui, annuler
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status history dialog */}
      <Dialog open={!!historyDialogOrder} onOpenChange={() => setHistoryDialogOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Historique — {historyDialogOrder?.id}
            </DialogTitle>
          </DialogHeader>
          {historyDialogOrder && (() => {
            const entries = getStatusHistory(historyDialogOrder.id);
            return entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <History className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">Aucun changement de statut enregistré.</p>
                <p className="text-xs mt-1">L'historique sera enregistré à partir des prochaines transitions.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[50vh] overflow-auto">
                {entries.slice().reverse().map((e, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <StatusBadge status={e.from} />
                        <span className="text-muted-foreground">→</span>
                        <StatusBadge status={e.to} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(e.changedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        {" · "}{e.changedBy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
}
