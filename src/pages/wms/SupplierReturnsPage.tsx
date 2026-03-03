import { useMemo, useState } from "react";
import { RotateCcw, Search, CheckCircle2, XCircle, Package, Eye } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { currency } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

export default function SupplierReturnsPage() {
  const { returns, setReturns } = useWMSData();
  const [search, setSearch] = useState("");

  const vendorReturns = useMemo(
    () => returns.filter((r: any) => r.type === "Vendor"),
    [returns]
  );
  const customerReturns = useMemo(
    () => returns.filter((r: any) => r.type === "Customer"),
    [returns]
  );

  const allReturns = returns;
  const filtered = allReturns.filter(
    (r: any) =>
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.partyName.toLowerCase().includes(search.toLowerCase())
  );

  const stats = useMemo(() => ({
    total: allReturns.length,
    pending: allReturns.filter((r: any) => ["Pending_QC", "Submitted", "Draft"].includes(r.status)).length,
    processed: allReturns.filter((r: any) => ["Processed", "Credited", "Approved"].includes(r.status)).length,
    totalValue: allReturns.reduce((s: number, r: any) => s + r.totalValue, 0),
  }), [allReturns]);

  const approveReturn = (id: string) => {
    setReturns((prev: any[]) =>
      prev.map((r) => r.id === id ? { ...r, status: "Approved" } : r)
    );
    toast({ title: "Retour approuvé", description: id });
  };

  const processReturn = (id: string) => {
    setReturns((prev: any[]) =>
      prev.map((r) => r.id === id ? { ...r, status: "Processed" } : r)
    );
    toast({ title: "Retour traité", description: `${id} — stock mis à jour` });
  };

  const statusColors: Record<string, string> = {
    Draft: "bg-muted text-muted-foreground",
    Submitted: "bg-info/10 text-info",
    Pending_QC: "bg-warning/10 text-warning",
    Approved: "bg-success/10 text-success",
    Rejected: "bg-destructive/10 text-destructive",
    Processed: "bg-success/10 text-success",
    Credited: "bg-primary/10 text-primary",
    Shipped: "bg-info/10 text-info",
  };

  const renderTable = (items: any[]) => (
    <div className="glass-card rounded-xl overflow-hidden">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <RotateCcw className="h-12 w-12 mb-3 opacity-50" />
          <p className="font-medium">Aucun retour.</p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Partie</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Référence</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Raison</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Valeur</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Statut</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r: any) => (
              <tr key={r.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                <td className="px-4 py-3 text-xs">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${r.type === "Customer" ? "bg-info/10 text-info" : "bg-warning/10 text-warning"}`}>
                    {r.type === "Customer" ? "Client" : "Fournisseur"}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">{r.partyName}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.referenceId}</td>
                <td className="px-4 py-3 text-xs">{r.reason}</td>
                <td className="px-4 py-3 text-right font-medium">{currency(r.totalValue)}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[r.status] ?? "bg-muted"}`}>
                    {r.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {r.status === "Pending_QC" && (
                      <Button variant="outline" size="sm" onClick={() => approveReturn(r.id)}>
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Approuver
                      </Button>
                    )}
                    {r.status === "Approved" && (
                      <Button variant="outline" size="sm" onClick={() => processReturn(r.id)}>
                        <Package className="h-3 w-3 mr-1" /> Traiter
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <WarehouseScopeBanner />

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <RotateCcw className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Retours (RMA)</h1>
          <p className="text-sm text-muted-foreground">Retours clients et fournisseurs — inspection, re-stock, mise au rebut</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total retours</p>
          <p className="text-xl font-semibold">{stats.total}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">En attente</p>
          <p className="text-xl font-semibold text-warning">{stats.pending}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Traités</p>
          <p className="text-xl font-semibold text-success">{stats.processed}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Valeur totale</p>
          <p className="text-xl font-semibold text-primary">{currency(stats.totalValue)}</p>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher…"
          className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm" />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Tous ({allReturns.length})</TabsTrigger>
          <TabsTrigger value="customer">Clients ({customerReturns.length})</TabsTrigger>
          <TabsTrigger value="vendor">Fournisseurs ({vendorReturns.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all">{renderTable(filtered)}</TabsContent>
        <TabsContent value="customer">{renderTable(customerReturns.filter((r: any) => r.partyName.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase())))}</TabsContent>
        <TabsContent value="vendor">{renderTable(vendorReturns.filter((r: any) => r.partyName.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase())))}</TabsContent>
      </Tabs>
    </div>
  );
}
