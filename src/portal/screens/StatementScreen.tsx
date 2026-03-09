import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { portalStatement, PORTAL_CUSTOMER } from "../data/mockPortalData";
import { toast } from "@/hooks/use-toast";
import { exportPortalStatementPDF } from "@/lib/pdfExport";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { style: "decimal", maximumFractionDigits: 0 }).format(v);

export default function StatementScreen() {
  const currentBalance = portalStatement[0]?.runningBalance ?? 0;

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Relevé de compte</h1>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            exportPortalStatementPDF(PORTAL_CUSTOMER.name, portalStatement, currentBalance);
            toast({ title: "📥 Export PDF", description: "Relevé téléchargé" });
          }}
        >
          <Download className="h-3 w-3 mr-1" /> PDF
        </Button>
      </div>

      {/* Current balance */}
      <div className="rounded-xl border border-border bg-card p-4 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Solde actuel</p>
        <p className={`text-2xl font-bold ${currentBalance > 0 ? "text-destructive" : "text-primary"}`}>
          {currency(currentBalance)} DZD
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          {currentBalance > 0 ? "↗ Vous devez ce montant" : "Crédit en votre faveur"}
        </p>
      </div>

      {/* Statement entries */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {portalStatement.map((entry, i) => (
          <div key={entry.id} className={`px-4 py-3 flex items-center gap-3 ${i < portalStatement.length - 1 ? "border-b border-border/50" : ""}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
              entry.type === "debit"
                ? "bg-destructive/10 text-destructive"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            }`}>
              {entry.type === "debit" ? "+" : "−"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{entry.description}</p>
              <p className="text-[10px] text-muted-foreground">{new Date(entry.date).toLocaleDateString("fr-FR")}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${entry.type === "debit" ? "text-destructive" : "text-emerald-600"}`}>
                {entry.type === "debit" ? "+" : "−"}{currency(entry.amount)}
              </p>
              <p className="text-[10px] text-muted-foreground">= {currency(entry.runningBalance)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
