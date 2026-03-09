import PortalStatusBadge from "../components/PortalStatusBadge";
import { portalPayments } from "../data/mockPortalData";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { useTranslation } from "react-i18next";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { style: "decimal", maximumFractionDigits: 0 }).format(v) + " DZD";

export default function PaymentsScreen() {
  const { t } = useTranslation();

  const METHOD_LABELS: Record<string, string> = {
    cash: t("portal.payments.cash"),
    cheque: t("portal.payments.cheque"),
    transfer: t("portal.payments.transfer"),
    card: t("portal.payments.card"),
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">{t("portal.payments.title")}</h1>
        <Button
          size="sm"
          variant="outline"
          onClick={() => toast({ title: t("portal.payments.uploadProof"), description: t("portal.payments.uploadProofDesc") })}
        >
          <Upload className="h-3 w-3 mr-1" /> {t("portal.payments.proof")}
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
            <p className="text-[10px] text-muted-foreground font-mono">{t("portal.payments.ref")} {p.reference}</p>
            <p className="text-[10px] text-muted-foreground">{t("portal.payments.invoice")} {p.invoiceId}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
