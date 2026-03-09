import { useMemo, useState } from "react";
import { Box, Search, Tag, CheckCircle2, Printer, Trash2, Undo2, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useWMSData } from "@/contexts/WMSDataContext";
import { currency } from "@/data/mockData";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ExportDialog from "@/components/ExportDialog";
import type { ExportColumn } from "@/lib/exportUtils";

export default function PackingPage() {
  const { t } = useTranslation();
  const { salesOrders, setSalesOrders } = useWMSData();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const orders = useMemo(
    () => salesOrders.filter((o) => ["Packed"].includes(o.status)),
    [salesOrders]
  );

  const filtered = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const stats = useMemo(() => ({
    orders: orders.length,
    totalLines: orders.reduce((s, o) => s + o.lines.length, 0),
    value: orders.reduce((s, o) => s + o.totalAmount, 0),
  }), [orders]);

  const printLabel = (orderId: string) => {
    toast({ title: t("packingPage.labelGenerated"), description: t("packingPage.labelDesc", { id: orderId }) });
  };

  const moveToShipping = (orderId: string) => {
    setSalesOrders((prev) =>
      prev.map((o) => o.id === orderId ? { ...o, status: "Shipped" as const } : o)
    );
    toast({ title: t("packingPage.movedToShipping"), description: t("packingPage.movedToShippingDesc", { id: orderId }) });
  };

  const revertToPicking = () => {
    if (!deleteTarget) return;
    setSalesOrders((prev) =>
      prev.map((o) => o.id === deleteTarget ? {
        ...o,
        status: "Picking" as const,
        lines: o.lines.map((l) => ({ ...l, shippedQty: 0 })),
      } : o)
    );
    toast({ title: t("packingPage.packingCancelled"), description: t("packingPage.packingCancelledDesc", { id: deleteTarget }) });
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <WarehouseScopeBanner />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Box className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("packingPage.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("packingPage.subtitle")}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}><Download className="h-4 w-4 mr-1" /> {t("packingPage.export")}</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("packingPage.ordersToPack")}</p>
          <p className="text-xl font-semibold">{stats.orders}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("packingPage.totalLines")}</p>
          <p className="text-xl font-semibold">{stats.totalLines}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("packingPage.valueInPrep")}</p>
          <p className="text-xl font-semibold text-primary">{currency(stats.value)}</p>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={t("packingPage.searchPlaceholder")}
          className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm" />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Box className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">{t("packingPage.noOrderInPacking")}</p>
            <p className="text-sm">{t("packingPage.noOrderHint")}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("packingPage.colOrder")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("packingPage.colClient")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("packingPage.colDelivery")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">{t("packingPage.colLines")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">{t("packingPage.colTotal")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("packingPage.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{o.id}</td>
                  <td className="px-4 py-3 text-sm font-medium">{o.customerName}</td>
                  <td className="px-4 py-3 text-xs">{o.deliveryDate}</td>
                  <td className="px-4 py-3 text-right text-xs">{o.lines.length}</td>
                  <td className="px-4 py-3 text-right font-medium">{currency(o.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => printLabel(o.id)}>
                        <Printer className="h-3 w-3 mr-1" /> {t("packingPage.label")}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => moveToShipping(o.id)}>
                        <Tag className="h-3 w-3 mr-1" /> {t("packingPage.ship")}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteTarget(o.id)}>
                        <Undo2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="glass-card rounded-xl p-4 border border-border/60">
          <h2 className="text-sm font-semibold mb-3">{t("packingPage.parcelDetail", { id: filtered[0]?.id })}</h2>
          <div className="space-y-2">
            {filtered[0]?.lines.map((l) => (
              <div key={l.lineId} className="flex items-center justify-between rounded-lg border border-border/40 p-3">
                <div>
                  <p className="text-sm font-medium">{l.productName}</p>
                  <p className="text-xs text-muted-foreground">Qté: {l.orderedQty} — {currency(l.lineTotal)}</p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-success" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revert to Picking confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("packingPage.cancelPacking")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("packingPage.cancelPackingMsg", { id: deleteTarget })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.no")}</AlertDialogCancel>
            <AlertDialogAction onClick={revertToPicking}>{t("common.yes")}, {t("common.cancel").toLowerCase()}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ExportDialog
        open={exportOpen} onOpenChange={setExportOpen}
        data={filtered}
        columns={[
          { key: "id" as const, label: t("packingPage.colOrder") }, { key: "customerName" as const, label: t("packingPage.colClient") },
          { key: "deliveryDate" as const, label: t("packingPage.colDelivery") }, { key: "totalAmount" as const, label: t("packingPage.colTotal") },
          { key: "status" as const, label: t("common.status") },
        ]}
        filename="packing"
      />
    </div>
  );
}
