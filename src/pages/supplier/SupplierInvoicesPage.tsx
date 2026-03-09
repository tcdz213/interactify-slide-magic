/**
 * Supplier Invoices — filtered by supplier_id.
 */
import { useMemo } from "react";
import { FileText, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supplierInvoices } from "@/supplier/data/mockSupplierData";
import { PageShell } from "@/shared/components";
import { toast } from "@/hooks/use-toast";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { style: "decimal", maximumFractionDigits: 0 }).format(v) + " DZD";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  Paid: { label: "Payée", className: "bg-success/15 text-success border-success/30" },
  Pending: { label: "En attente", className: "bg-warning/15 text-warning border-warning/30" },
  Validated: { label: "Validée", className: "bg-info/15 text-info border-info/30" },
  Disputed: { label: "Litige", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

export default function SupplierInvoicesPage() {
  const totalPending = useMemo(
    () => supplierInvoices.filter((i) => i.status !== "Paid").reduce((s, i) => s + i.balance, 0),
    []
  );

  const isOverdue = (inv: typeof supplierInvoices[0]) =>
    inv.status !== "Paid" && new Date(inv.dueDate) < new Date();

  return (
    <PageShell title="Mes Factures" description={`Solde en attente : ${currency(totalPending)}`}>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-muted-foreground text-xs">
                  <th className="text-left p-3 font-medium">Facture</th>
                  <th className="text-left p-3 font-medium">Commande</th>
                  <th className="text-right p-3 font-medium">Montant</th>
                  <th className="text-right p-3 font-medium">Solde</th>
                  <th className="text-left p-3 font-medium">Statut</th>
                  <th className="text-left p-3 font-medium">Émission</th>
                  <th className="text-left p-3 font-medium">Échéance</th>
                  <th className="text-center p-3 font-medium">PDF</th>
                </tr>
              </thead>
              <tbody>
                {supplierInvoices.map((inv) => {
                  const overdue = isOverdue(inv);
                  const status = overdue ? { label: "En retard", className: "bg-destructive/15 text-destructive border-destructive/30" } : STATUS_MAP[inv.status];
                  return (
                    <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-mono text-xs font-medium">{inv.id}</td>
                      <td className="p-3 text-xs text-muted-foreground">{inv.poId}</td>
                      <td className="p-3 text-right font-medium text-xs">{currency(inv.amount)}</td>
                      <td className="p-3 text-right text-xs">{inv.balance > 0 ? currency(inv.balance) : "—"}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={`text-[10px] ${status?.className}`}>
                          {status?.label}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {new Date(inv.issuedAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {new Date(inv.dueDate).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast({ title: "Téléchargement PDF", description: inv.id })}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
