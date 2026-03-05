import { useMemo, useState } from "react";
import { RotateCcw, Search, CheckCircle2, XCircle, Package, Eye, BookOpen, ArrowRight, FileText } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { currency } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  generateSupplierReturnJournal,
  generateCustomerReturnJournal,
  getJournalsByReturnId,
  type ReturnJournalEntry,
} from "@/lib/returnsJournalEngine";

export default function SupplierReturnsPage() {
  const { returns, setReturns, creditNotes } = useWMSData();
  const [search, setSearch] = useState("");
  const [chainDialog, setChainDialog] = useState<any | null>(null);

  const vendorReturns = useMemo(() => returns.filter((r: any) => r.type === "Vendor"), [returns]);
  const customerReturns = useMemo(() => returns.filter((r: any) => r.type === "Customer"), [returns]);

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
    setReturns((prev: any[]) => prev.map((r) => r.id === id ? { ...r, status: "Approved" } : r));
    toast({ title: "Retour approuvé", description: id });
  };

  /** G4.1 / G4.2 — Process return + auto-generate journal */
  const processReturn = (id: string) => {
    const ret = returns.find((r: any) => r.id === id);
    if (!ret) return;

    // Find linked credit note if exists
    const linkedCN = creditNotes.find((cn: any) => cn.referenceId === id);

    // Generate journal entry based on return type
    if (ret.type === "Vendor") {
      const journal = generateSupplierReturnJournal({
        id: ret.id,
        partyName: ret.partyName,
        totalValue: ret.totalValue,
        creditNoteId: linkedCN?.id,
      });
      toast({
        title: "Retour fournisseur traité",
        description: `${id} — Journal ${journal.id} généré (${currency(journal.totalAmount)})`,
      });
    } else {
      const journal = generateCustomerReturnJournal({
        id: ret.id,
        partyName: ret.partyName,
        totalValue: ret.totalValue,
        creditNoteId: linkedCN?.id,
      });
      toast({
        title: "Retour client traité",
        description: `${id} — Journal ${journal.id} généré (${currency(journal.totalAmount)})`,
      });
    }

    setReturns((prev: any[]) => prev.map((r) => r.id === id ? { ...r, status: "Processed" } : r));
  };

  /** G4.3 — Show Return → CN → Journal chain */
  const showChain = (ret: any) => {
    const linkedCN = creditNotes.find((cn: any) => cn.referenceId === ret.id);
    const journals = getJournalsByReturnId(ret.id);
    setChainDialog({ ret, linkedCN, journals });
  };

  const statusColors: Record<string, string> = {
    Draft: "bg-muted text-muted-foreground",
    Submitted: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Pending_QC: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    Rejected: "bg-destructive/10 text-destructive",
    Processed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    Credited: "bg-primary/10 text-primary",
    Shipped: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
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
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${r.type === "Customer" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
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
                    {/* G4.3 — Chain breadcrumb button */}
                    <Button variant="ghost" size="sm" onClick={() => showChain(r)} aria-label="Voir la chaîne comptable">
                      <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
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
          <p className="text-sm text-muted-foreground">Retours clients et fournisseurs — inspection, re-stock, écritures comptables auto</p>
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

      {/* G4.3 — Return → Credit Note → Journal Chain Dialog */}
      <Dialog open={!!chainDialog} onOpenChange={() => setChainDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {chainDialog && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Chaîne comptable — {chainDialog.ret.id}
                </DialogTitle>
              </DialogHeader>

              {/* Visual chain breadcrumb */}
              <div className="flex items-center gap-2 py-4 flex-wrap">
                <Badge variant="outline" className="px-3 py-1.5 text-sm font-mono bg-primary/5 border-primary/30">
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  {chainDialog.ret.id}
                </Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                {chainDialog.linkedCN ? (
                  <Badge variant="outline" className="px-3 py-1.5 text-sm font-mono bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800">
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    {chainDialog.linkedCN.id}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="px-3 py-1.5 text-sm text-muted-foreground">
                    Pas d'avoir lié
                  </Badge>
                )}
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                {chainDialog.journals.length > 0 ? (
                  chainDialog.journals.map((j: ReturnJournalEntry) => (
                    <Badge key={j.id} variant="outline" className="px-3 py-1.5 text-sm font-mono bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                      <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                      {j.id}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline" className="px-3 py-1.5 text-sm text-muted-foreground">
                    Pas de journal (traiter d'abord)
                  </Badge>
                )}
              </div>

              {/* Return details */}
              <div className="rounded-lg border p-4 space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" /> Retour
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Type :</span> {chainDialog.ret.type === "Customer" ? "Client" : "Fournisseur"}</div>
                  <div><span className="text-muted-foreground">Partie :</span> <span className="font-medium">{chainDialog.ret.partyName}</span></div>
                  <div><span className="text-muted-foreground">Valeur :</span> <span className="font-medium">{currency(chainDialog.ret.totalValue)}</span></div>
                  <div><span className="text-muted-foreground">Statut :</span> <StatusBadge status={chainDialog.ret.status} /></div>
                </div>
              </div>

              {/* Credit Note details */}
              {chainDialog.linkedCN && (
                <div className="rounded-lg border p-4 space-y-2 border-emerald-200 dark:border-emerald-800">
                  <h4 className="text-sm font-semibold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <FileText className="h-4 w-4" /> Avoir — {chainDialog.linkedCN.id}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Montant TTC :</span> <span className="font-medium">{currency(chainDialog.linkedCN.totalAmount)}</span></div>
                    <div><span className="text-muted-foreground">Statut :</span> <StatusBadge status={chainDialog.linkedCN.status} /></div>
                  </div>
                </div>
              )}

              {/* Journal entries */}
              {chainDialog.journals.length > 0 && chainDialog.journals.map((j: ReturnJournalEntry) => (
                <div key={j.id} className="rounded-lg border p-4 space-y-2 border-amber-200 dark:border-amber-800">
                  <h4 className="text-sm font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <BookOpen className="h-4 w-4" /> Journal — {j.id}
                  </h4>
                  <p className="text-xs text-muted-foreground">{j.date} — {j.type === "SUPPLIER_RETURN" ? "Retour fournisseur" : "Retour client"}</p>
                  <table className="w-full text-xs mt-2">
                    <thead><tr className="border-b border-border"><th className="text-left py-1">Compte</th><th className="text-left py-1">Libellé</th><th className="text-right py-1">Débit</th><th className="text-right py-1">Crédit</th></tr></thead>
                    <tbody>
                      {j.lines.map((line, idx) => (
                        <tr key={idx} className="border-b border-border/30">
                          <td className="py-1 font-mono">{line.account} — {line.accountName}</td>
                          <td className="py-1 text-muted-foreground">{line.description}</td>
                          <td className="py-1 text-right">{line.debit > 0 ? currency(line.debit) : "—"}</td>
                          <td className="py-1 text-right">{line.credit > 0 ? currency(line.credit) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="font-semibold border-t">
                        <td className="py-1" colSpan={2}>Total</td>
                        <td className="py-1 text-right">{currency(j.lines.reduce((s, l) => s + l.debit, 0))}</td>
                        <td className="py-1 text-right">{currency(j.lines.reduce((s, l) => s + l.credit, 0))}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ))}

              {chainDialog.journals.length === 0 && chainDialog.ret.status !== "Processed" && (
                <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                  Le journal comptable sera généré automatiquement lors du traitement du retour.
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
