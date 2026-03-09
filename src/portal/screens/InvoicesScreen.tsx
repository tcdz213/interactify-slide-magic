import { useState } from "react";
import { Download, Mail } from "lucide-react";
import PortalStatusBadge from "../components/PortalStatusBadge";
import { portalInvoices, PORTAL_CUSTOMER } from "../data/mockPortalData";
import { toast } from "@/hooks/use-toast";
import { exportPortalInvoicePDF } from "@/lib/pdfExport";
import { useTranslation } from "react-i18next";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { style: "decimal", maximumFractionDigits: 0 }).format(v) + " DZD";

export default function InvoicesScreen() {
  const { t } = useTranslation();

  const FILTERS = [
    { key: "all", label: t("portal.invoices.all") },
    { key: "pending", label: t("portal.invoices.pending") },
    { key: "paid", label: t("portal.invoices.paid") },
    { key: "overdue", label: t("portal.invoices.overdue") },
  ];

  const [filter, setFilter] = useState("all");

  const filterMatch = (status: string, f: string) => {
    if (f === "all") return true;
    if (f === "pending") return ["issued", "partially_paid"].includes(status);
    if (f === "paid") return status === "paid";
    if (f === "overdue") return status === "overdue";
    return true;
  };

  const filtered = portalInvoices.filter((inv) => filterMatch(inv.status, filter));

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <h1 className="text-lg font-bold">{t("portal.invoices.title")}</h1>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
              filter === f.key ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((inv) => {
          const isOverdue = inv.status === "overdue";
          return (
            <div
              key={inv.id}
              className={`rounded-xl border bg-card p-4 space-y-2 ${isOverdue ? "border-destructive/40" : "border-border"}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-medium">🧾 {inv.id}</span>
                <PortalStatusBadge status={inv.status} />
              </div>
              <p className="text-base font-bold">{currency(inv.totalAmount)}</p>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{t("portal.invoices.issued")} {new Date(inv.issuedDate).toLocaleDateString("fr-FR")}</span>
                <span>{t("portal.invoices.dueDate")} {new Date(inv.dueDate).toLocaleDateString("fr-FR")}</span>
              </div>
              {inv.balance > 0 && (
                <p className={`text-xs font-medium ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                  {t("portal.invoices.balance")} {currency(inv.balance)}
                </p>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    exportPortalInvoicePDF({ ...inv, customerName: PORTAL_CUSTOMER.name });
                    toast({ title: t("portal.invoices.pdfDownloaded"), description: `${inv.id}.pdf` });
                  }}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Download className="h-3 w-3" /> PDF
                </button>
                <button
                  onClick={() => toast({ title: t("portal.invoices.emailSent"), description: t("portal.invoices.emailSentDesc", { id: inv.id }) })}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:underline"
                >
                  <Mail className="h-3 w-3" /> Email
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">{t("portal.invoices.noInvoices")}</div>
        )}
      </div>
    </div>
  );
}
