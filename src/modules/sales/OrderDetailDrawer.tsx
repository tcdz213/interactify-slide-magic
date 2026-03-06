import { History, FileDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { currency } from "@/data/mockData";
import { exportOrderPDF } from "@/lib/pdfExport";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { SalesOrder } from "@/data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import StatusBadge from "@/components/StatusBadge";
import { NEXT_STATUS, getStatusHistory } from "./orderStatus";
import type { useOrderForm } from "./useOrderForm";

const STATUS_KEYS: Record<string, string> = {
  Draft: "orders.statusDraft", Credit_Hold: "orders.statusCreditHold", Approved: "orders.statusApproved",
  Picking: "orders.statusPicking", Packed: "orders.statusPacked", Shipped: "orders.statusShipped",
  Partially_Delivered: "orders.statusPartiallyDelivered", Delivered: "orders.statusDelivered",
  Invoiced: "orders.statusInvoiced", Cancelled: "orders.statusCancelled",
};

const CHANNEL_KEYS: Record<string, string> = {
  Web: "orders.channelWeb", Phone: "orders.channelPhone", Manual: "orders.channelManual", Mobile_App: "orders.channelMobileApp",
};

const TOOLTIP_KEYS: Record<string, string> = {
  Draft: "orders.tooltipApprove", Approved: "orders.tooltipPicking", Picking: "orders.tooltipPacked",
  Packed: "orders.tooltipShip", Shipped: "orders.tooltipDeliver",
};

type FormHook = ReturnType<typeof useOrderForm>;

interface OrderDetailDrawerProps {
  hook: FormHook;
}

export function OrderDetailDrawer({ hook }: OrderDetailDrawerProps) {
  const { t } = useTranslation();
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
                <div><span className="text-muted-foreground">{t("orders.detailClient")}</span> <span className="font-medium">{selectedOrder.customerName}</span></div>
                <div><span className="text-muted-foreground">{t("orders.detailSalesRep")}</span> {selectedOrder.salesRep}</div>
                <div><span className="text-muted-foreground">{t("orders.detailDate")}</span> {selectedOrder.orderDate}</div>
                <div><span className="text-muted-foreground">{t("orders.detailDelivery")}</span> {selectedOrder.deliveryDate}</div>
                <div><span className="text-muted-foreground">{t("orders.detailChannel")}</span> {t(CHANNEL_KEYS[selectedOrder.channel] ?? selectedOrder.channel)}</div>
                <div><span className="text-muted-foreground">{t("orders.detailDiscount")}</span> {selectedOrder.discountPct}%</div>
                <div><span className="text-muted-foreground">{t("orders.detailTerms")}</span> {selectedOrder.paymentTerms.replace(/_/g, " ")}</div>
                <div><span className="text-muted-foreground">{t("orders.detailSubtotal")}</span> {currency(selectedOrder.subtotal)}</div>
                <div><span className="text-muted-foreground">{t("orders.detailTax")}</span> {currency(selectedOrder.taxAmount)}</div>
                <div className="col-span-2 text-lg font-bold">{t("orders.detailTotal")} {currency(selectedOrder.totalAmount)}</div>
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
                        productName: l.productName, orderedQty: l.orderedQty, unitPrice: l.unitPrice, lineTotal: l.lineTotal,
                      })),
                    });
                    toast({ title: t("orders.pdfExported"), description: `${selectedOrder.id}` });
                  }}
                >
                  <FileDown className="h-3.5 w-3.5 mr-1" /> {t("orders.exportPdf")}
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
                    {t(TOOLTIP_KEYS[selectedOrder.status] ?? "orders.advanceTo", { status: t(STATUS_KEYS[NEXT_STATUS[selectedOrder.status]!] ?? NEXT_STATUS[selectedOrder.status]!) })}
                  </button>
                </div>
              )}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">{t("orders.orderLines")}</h4>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 text-muted-foreground">{t("orders.colProduct")}</th>
                      <th className="text-right py-2 px-2 text-muted-foreground">{t("orders.colQty")}</th>
                      <th className="text-right py-2 px-2 text-muted-foreground">{t("orders.colReserved")}</th>
                      <th className="text-right py-2 px-2 text-muted-foreground">{t("orders.colShipped")}</th>
                      <th className="text-right py-2 px-2 text-muted-foreground">{t("orders.colUnitPrice")}</th>
                      <th className="text-right py-2 px-2 text-muted-foreground">{t("orders.colLineTotal")}</th>
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
            <AlertDialogTitle>{t("orders.cancelDialogTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("orders.cancelDialogDesc", { id: cancelDialogOrder?.id, customer: cancelDialogOrder?.customerName })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("orders.cancelNo")}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => cancelDialogOrder && handleCancel(cancelDialogOrder)}>
              {t("orders.cancelYes")}
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
              {t("orders.historyTitle", { id: historyDialogOrder?.id })}
            </DialogTitle>
          </DialogHeader>
          {historyDialogOrder && (() => {
            const entries = getStatusHistory(historyDialogOrder.id);
            return entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <History className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">{t("orders.historyEmpty")}</p>
                <p className="text-xs mt-1">{t("orders.historyHint")}</p>
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
