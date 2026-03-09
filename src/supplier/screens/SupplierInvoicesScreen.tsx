import { FileText, Download, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supplierInvoices } from "../data/mockSupplierData";
import { toast } from "@/hooks/use-toast";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(v) + " DZD";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  Pending: { label: "En attente", color: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  Validated: { label: "Validée", color: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  Paid: { label: "Payée", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  Disputed: { label: "Contestée", color: "bg-destructive/15 text-destructive" },
};

export default function SupplierInvoicesScreen() {
  const totalPending = supplierInvoices.filter((i) => i.status !== "Paid").reduce((s, i) => s + i.balance, 0);
  const totalPaid = supplierInvoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="p-4 space-y-4 pb-6">
      <h1 className="text-lg font-bold">Factures & Paiements</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-[10px] text-muted-foreground uppercase">En attente</p>
          <p className="text-lg font-bold text-amber-600">{currency(totalPending)}</p>
          <p className="text-[10px] text-muted-foreground">{supplierInvoices.filter((i) => i.status !== "Paid").length} factures</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-[10px] text-muted-foreground uppercase">Payé</p>
          <p className="text-lg font-bold text-emerald-600">{currency(totalPaid)}</p>
          <p className="text-[10px] text-muted-foreground">{supplierInvoices.filter((i) => i.status === "Paid").length} factures</p>
        </div>
      </div>

      {/* Invoice List */}
      <div className="space-y-2">
        {supplierInvoices.map((inv) => {
          const meta = STATUS_MAP[inv.status] || STATUS_MAP.Pending;
          return (
            <div key={inv.id} className="rounded-xl border border-border bg-card p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-mono font-semibold">{inv.id}</span>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", meta.color)}>
                    {meta.label}
                  </span>
                </div>
                <button
                  onClick={() => toast({ title: "Export PDF", description: `${inv.id} téléchargé` })}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <Download className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">PO : {inv.poId}</span>
                <span className="font-bold">{currency(inv.amount)}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Émise le {new Date(inv.issuedAt).toLocaleDateString("fr-FR")}</span>
                <span>Échéance : {new Date(inv.dueDate).toLocaleDateString("fr-FR")}</span>
              </div>
              {inv.balance > 0 && inv.status !== "Paid" && (
                <div className="text-xs text-amber-600 font-medium">
                  Solde restant : {currency(inv.balance)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
