/**
 * Supplier Orders — Shows only orders containing this supplier's items.
 */
import { useState, useMemo } from "react";
import { ClipboardList, Search, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supplierPOs } from "@/supplier/data/mockSupplierData";
import type { SupplierPO } from "@/supplier/types/supplier";
import { PageShell } from "@/shared/components";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { style: "decimal", maximumFractionDigits: 0 }).format(v) + " DZD";

const STATUSES = ["Tous", "Pending", "Confirmed", "Shipped", "Delivered", "Rejected"] as const;

const STATUS_BADGE: Record<string, string> = {
  Pending: "bg-warning/15 text-warning border-warning/30",
  Confirmed: "bg-info/15 text-info border-info/30",
  Shipped: "bg-primary/15 text-primary border-primary/30",
  Delivered: "bg-success/15 text-success border-success/30",
  Rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

export default function SupplierOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Tous");
  const [detailPO, setDetailPO] = useState<SupplierPO | null>(null);

  const filtered = useMemo(() => {
    return supplierPOs.filter((po) => {
      const matchSearch =
        po.id.toLowerCase().includes(search.toLowerCase()) ||
        po.warehouseName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "Tous" || po.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  return (
    <PageShell title="Mes Commandes" description={`${supplierPOs.length} commandes au total`}>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par n° ou entrepôt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s === "Tous" ? "Tous les statuts" : s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="mt-4">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-muted-foreground text-xs">
                  <th className="text-left p-3 font-medium">Commande</th>
                  <th className="text-left p-3 font-medium">Client (Entrepôt)</th>
                  <th className="text-left p-3 font-medium">Produits</th>
                  <th className="text-right p-3 font-medium">Quantité</th>
                  <th className="text-right p-3 font-medium">Montant</th>
                  <th className="text-left p-3 font-medium">Statut</th>
                  <th className="text-left p-3 font-medium">Livraison</th>
                  <th className="text-center p-3 font-medium">Détails</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((po) => (
                  <tr key={po.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-mono text-xs font-medium">{po.id}</td>
                    <td className="p-3 text-xs">{po.warehouseName}</td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {po.lines.map((l) => l.productName).join(", ")}
                    </td>
                    <td className="p-3 text-xs text-right">
                      {po.lines.reduce((s, l) => s + l.qty, 0)}
                    </td>
                    <td className="p-3 text-right font-medium text-xs">{currency(po.totalAmount)}</td>
                    <td className="p-3">
                      <Badge variant="outline" className={`text-[10px] ${STATUS_BADGE[po.status] || ""}`}>
                        {po.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {new Date(po.expectedDelivery).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="p-3 text-center">
                      <Button variant="ghost" size="sm" onClick={() => setDetailPO(po)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      Aucune commande trouvée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailPO} onOpenChange={() => setDetailPO(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> Commande {detailPO?.id}
            </DialogTitle>
          </DialogHeader>
          {detailPO && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Entrepôt</p>
                  <p className="font-medium">{detailPO.warehouseName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Statut</p>
                  <Badge variant="outline" className={STATUS_BADGE[detailPO.status]}>{detailPO.status}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Montant total</p>
                  <p className="font-bold">{currency(detailPO.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Livraison prévue</p>
                  <p>{new Date(detailPO.expectedDelivery).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase">Lignes de commande</p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-1.5">Produit</th>
                      <th className="text-right py-1.5">Qté</th>
                      <th className="text-left py-1.5">Unité</th>
                      <th className="text-right py-1.5">P.U.</th>
                      <th className="text-right py-1.5">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailPO.lines.map((l, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-1.5">{l.productName}</td>
                        <td className="py-1.5 text-right">{l.qty}</td>
                        <td className="py-1.5">{l.unit}</td>
                        <td className="py-1.5 text-right">{currency(l.unitPrice)}</td>
                        <td className="py-1.5 text-right font-medium">{currency(l.qty * l.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
