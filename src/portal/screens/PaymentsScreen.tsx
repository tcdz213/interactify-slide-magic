import PortalStatusBadge from "../components/PortalStatusBadge";
import { portalPayments } from "../data/mockPortalData";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { style: "decimal", maximumFractionDigits: 0 }).format(v) + " DZD";

const METHOD_LABELS: Record<string, string> = {
  cash: "Espèces",
  cheque: "Chèque",
  transfer: "Virement",
  card: "Carte",
};

export default function PaymentsScreen() {
  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Mes paiements</h1>
        <Button
          size="sm"
          variant="outline"
          onClick={() => toast({ title: "📷 Upload", description: "Sélectionnez une preuve de paiement (démo)" })}
        >
          <Upload className="h-3 w-3 mr-1" /> Preuve
        </Button>
      </div>

      <div className="space-y-2">
        {portalPayments.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-medium">{p.id}</span>
              <PortalStatusBadge status={p.status} />
            </div>
            <p className="text-base font-bold">{currency(p.amount)}</p>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{METHOD_LABELS[p.method] ?? p.method}</span>
              <span>{new Date(p.paidAt).toLocaleDateString("fr-FR")}</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">Réf: {p.reference}</p>
            <p className="text-[10px] text-muted-foreground">Facture: {p.invoiceId}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
