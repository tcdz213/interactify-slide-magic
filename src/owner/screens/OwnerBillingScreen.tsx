import { useState } from "react";
import { subscriptionInvoices as initialInvoices } from "../data/mockOwnerData";
import type { SubscriptionInvoice } from "../types/owner";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, AlertTriangle, XCircle, MoreHorizontal, Send, FileText, Download, FileSpreadsheet } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import OwnerConfirmDialog from "../components/OwnerConfirmDialog";
import { exportInvoicesCSV, exportInvoicesPDF } from "../utils/ownerExport";
import { Button } from "@/components/ui/button";

const STATUS_STYLES = {
  paid: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/30",
  pending: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30",
  overdue: "bg-destructive/10 text-destructive border-destructive/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};
const STATUS_ICONS = { paid: CheckCircle, pending: Clock, overdue: AlertTriangle, cancelled: XCircle };
const STATUS_LABELS = { paid: "Payée", pending: "En attente", overdue: "En retard", cancelled: "Annulée" };

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(v) + " DZD";

type InvStatus = SubscriptionInvoice["status"];

export default function OwnerBillingScreen() {
  const [invoices, setInvoices] = useState<SubscriptionInvoice[]>([...initialInvoices]);
  const [statusFilter, setStatusFilter] = useState<"all" | InvStatus>("all");
  const [confirmAction, setConfirmAction] = useState<{ inv: SubscriptionInvoice; action: "markPaid" | "cancel" } | null>(null);

  const filtered = invoices.filter(inv => statusFilter === "all" || inv.status === statusFilter);

  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0);
  const totalAll = invoices.reduce((s, i) => s + i.amount, 0);

  const updateInvoice = (id: string, patch: Partial<SubscriptionInvoice>) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    const { inv, action } = confirmAction;
    if (action === "markPaid") {
      updateInvoice(inv.id, { status: "paid", paidAt: new Date().toISOString().slice(0, 10) });
      toast({ title: "Facture payée", description: `${inv.id} marquée comme payée.` });
    } else {
      updateInvoice(inv.id, { status: "cancelled" });
      toast({ title: "Facture annulée", description: `${inv.id} a été annulée.` });
    }
    setConfirmAction(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1400px] mx-auto animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold">Facturation plateforme</h1>
          <p className="text-xs text-muted-foreground">{invoices.length} factures · Total : {currency(totalAll)}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              <Download className="h-3.5 w-3.5 mr-1" /> Exporter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { exportInvoicesCSV(filtered); toast({ title: "CSV exporté", description: `${filtered.length} factures exportées.` }); }}>
              <FileSpreadsheet className="h-3.5 w-3.5 mr-2" /> Export CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { exportInvoicesPDF(filtered); toast({ title: "PDF exporté", description: `${filtered.length} factures exportées.` }); }}>
              <FileText className="h-3.5 w-3.5 mr-2" /> Export PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total facturé", value: totalAll, icon: FileText, color: "text-foreground", bg: "bg-muted" },
          { label: "Encaissé", value: totalPaid, icon: CheckCircle, color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success))]/10" },
          { label: "En attente", value: totalPending, icon: Clock, color: "text-[hsl(var(--warning))]", bg: "bg-[hsl(var(--warning))]/10" },
          { label: "Impayé", value: totalOverdue, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-3 space-y-1">
            <div className={`h-7 w-7 rounded-lg ${c.bg} flex items-center justify-center`}>
              <c.icon className={`h-3.5 w-3.5 ${c.color}`} />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase">{c.label}</p>
            <p className={`text-sm font-bold ${c.color}`}>{currency(c.value)}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "paid", "pending", "overdue", "cancelled"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors", statusFilter === s ? "bg-primary/10 text-primary border-primary/30" : "bg-card text-muted-foreground border-border hover:bg-muted")}>
            {s === "all" ? "Toutes" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Facture</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Abonné</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Période</th>
                <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Montant</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Statut</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Échéance</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Payée le</th>
                <th className="px-3 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => {
                const Icon = STATUS_ICONS[inv.status];
                return (
                  <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-3 font-mono font-medium">{inv.id}</td>
                    <td className="px-3 py-3 font-medium">{inv.subscriberName}</td>
                    <td className="px-3 py-3 text-muted-foreground">{inv.period}</td>
                    <td className="px-3 py-3 text-right font-bold">{currency(inv.amount)}</td>
                    <td className="px-3 py-3">
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border", STATUS_STYLES[inv.status])}>
                        <Icon className="h-3 w-3" />{STATUS_LABELS[inv.status]}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{inv.dueDate}</td>
                    <td className="px-3 py-3 text-muted-foreground">{inv.paidAt || "—"}</td>
                    <td className="px-3 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded hover:bg-muted transition-colors"><MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" /></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          {(inv.status === "pending" || inv.status === "overdue") && (
                            <DropdownMenuItem onClick={() => setConfirmAction({ inv, action: "markPaid" })}>
                              <CheckCircle className="h-3.5 w-3.5 mr-2" /> Marquer payée
                            </DropdownMenuItem>
                          )}
                          {inv.status === "overdue" && (
                            <DropdownMenuItem onClick={() => toast({ title: "Rappel envoyé", description: `Relance envoyée pour ${inv.id} à ${inv.subscriberName}.` })}>
                              <Send className="h-3.5 w-3.5 mr-2" /> Relancer
                            </DropdownMenuItem>
                          )}
                          {inv.status !== "paid" && inv.status !== "cancelled" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirmAction({ inv, action: "cancel" })}>
                                <XCircle className="h-3.5 w-3.5 mr-2" /> Annuler
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={() => toast({ title: "PDF", description: `Aperçu facture ${inv.id} (simulation).` })}>
                            <FileText className="h-3.5 w-3.5 mr-2" /> Voir PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Aucune facture trouvée</div>}
      </div>

      <OwnerConfirmDialog
        open={!!confirmAction}
        onOpenChange={(v) => !v && setConfirmAction(null)}
        title={confirmAction?.action === "markPaid" ? "Confirmer le paiement" : "Annuler la facture"}
        description={confirmAction?.action === "markPaid"
          ? `Marquer la facture ${confirmAction?.inv.id} (${currency(confirmAction?.inv.amount ?? 0)}) comme payée ?`
          : `Annuler la facture ${confirmAction?.inv.id} ? Cette action est irréversible.`}
        confirmLabel={confirmAction?.action === "markPaid" ? "Confirmer paiement" : "Annuler la facture"}
        variant={confirmAction?.action === "cancel" ? "destructive" : "default"}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
