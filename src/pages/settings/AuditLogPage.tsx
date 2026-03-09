import { useMemo, useState, Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ScrollText, Search, Clock, User, ChevronDown, ChevronRight, ArrowRight, Download } from "lucide-react";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import { Button } from "@/components/ui/button";
import ExportDialog from "@/components/ExportDialog";
import type { ExportColumn } from "@/lib/exportUtils";
import { getAuditLog, logAudit, type AuditEntry } from "@/services/auditService";

interface DiffField {
  field: string;
  oldValue: string;
  newValue: string;
}

// Seed default entries on first load
const SEED_ENTRIES: Omit<AuditEntry, "id" | "timestamp">[] = [
  { action: "APPROVE", module: "GRN", entityId: "GRN-20260220-0001", performedBy: "Karim Ben Ali", details: "GRN approuvé — 3 lignes, valeur 661 500 DZD",
    diff: [{ field: "status", oldValue: "Approval_Pending", newValue: "Approved" }, { field: "approvedBy", oldValue: "—", newValue: "Karim Ben Ali" }] },
  { action: "QC_COMPLETE", module: "QC", entityId: "QC-20260220-001", performedBy: "Sara Khalil", details: "Inspection QC terminée — résultat: Passed",
    diff: [{ field: "status", oldValue: "In_Progress", newValue: "Passed" }] },
  { action: "ORDER_CREATE", module: "Sales", entityId: "ORD-20260220-0042", performedBy: "Omar Fadel", details: "Commande Carrefour 116 380 DZD — 3 lignes",
    diff: [{ field: "status", oldValue: "—", newValue: "Pending" }] },
  { action: "APPROVE", module: "Sales", entityId: "ORD-20260220-0042", performedBy: "Ahmed Mansour", details: "Commande approuvée par CEO",
    diff: [{ field: "status", oldValue: "Pending", newValue: "Approved" }] },
  { action: "CREDIT_HOLD", module: "Sales", entityId: "ORD-20260219-0037", performedBy: "System", details: "Commande bloquée — crédit dépassé",
    diff: [{ field: "status", oldValue: "Pending", newValue: "Credit_Hold" }] },
  { action: "PAYMENT_RECEIVE", module: "Finance", entityId: "PAY-002", performedBy: "Nadia Salim", details: "Virement 540 000 DZD — Sonelgaz" },
  { action: "LOGIN", module: "Auth", entityId: "U001", performedBy: "Ahmed Mansour", details: "Connexion depuis 192.168.1.100" },
];

function ensureSeedData() {
  const existing = getAuditLog();
  if (existing.length === 0) {
    // Seed in reverse so newest is first
    [...SEED_ENTRIES].reverse().forEach((e) => logAudit(e));
  }
}

const actionColors: Record<string, string> = {
  APPROVE: "bg-success/10 text-success",
  GRN_RECEIVE: "bg-info/10 text-info",
  QC_COMPLETE: "bg-info/10 text-info",
  PUTAWAY_COMPLETE: "bg-success/10 text-success",
  ORDER_CREATE: "bg-primary/10 text-primary",
  ADJUSTMENT_CREATE: "bg-warning/10 text-warning",
  ADJUSTMENT_APPROVE: "bg-success/10 text-success",
  CREDIT_HOLD: "bg-destructive/10 text-destructive",
  TRANSFER_APPROVE: "bg-success/10 text-success",
  CYCLE_COUNT: "bg-info/10 text-info",
  PAYMENT_RECEIVE: "bg-success/10 text-success",
  RETURN_CREATE: "bg-warning/10 text-warning",
  GRN_REJECT: "bg-destructive/10 text-destructive",
  LOGIN: "bg-muted text-muted-foreground",
};

export default function AuditLogPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);

  useEffect(() => {
    ensureSeedData();
    setAuditEntries(getAuditLog());
  }, []);

  const auditExportCols: ExportColumn<AuditEntry>[] = [
    { key: "id", label: "ID" }, { key: "timestamp", label: "Horodatage" },
    { key: "action", label: "Action" }, { key: "module", label: "Module" },
    { key: "entityId", label: "Entité" }, { key: "performedBy", label: "Utilisateur" },
    { key: "details", label: "Détails" },
  ];

  const modules = useMemo(() => [...new Set(auditEntries.map((e) => e.module))], [auditEntries]);

  const filtered = auditEntries.filter(
    (e) =>
      (moduleFilter === "all" || e.module === moduleFilter) &&
      (e.details.toLowerCase().includes(search.toLowerCase()) ||
        e.performedBy.toLowerCase().includes(search.toLowerCase()) ||
        e.entityId.toLowerCase().includes(search.toLowerCase()) ||
        e.action.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <WarehouseScopeBanner />

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <ScrollText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t("auditLog.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("auditLog.subtitle")}</p>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={() => setExportOpen(true)} className="gap-2"><Download className="h-4 w-4" /> {t("auditLog.export")}</Button>
      </div>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} data={filtered} columns={auditExportCols} filename="audit-log" />

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t("auditLog.searchPlaceholder")}
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm" />
        </div>
        <div className="flex gap-1 flex-wrap">
          <Button variant={moduleFilter === "all" ? "default" : "outline"} size="sm"
            onClick={() => setModuleFilter("all")}>{t("auditLog.all")}</Button>
          {modules.map((m) => (
            <Button key={m} variant={moduleFilter === m ? "default" : "outline"} size="sm"
              onClick={() => setModuleFilter(m)}>{m}</Button>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-2 py-3 w-8"></th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("auditLog.timestamp")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("auditLog.action")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("auditLog.module")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("auditLog.entity")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("auditLog.user")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("auditLog.details")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <Fragment key={e.id}>
                <tr className="border-b border-border/40 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => e.diff && setExpandedId(expandedId === e.id ? null : e.id)}>
                  <td className="px-2 py-3">
                    {e.diff ? (
                      expandedId === e.id ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-muted-foreground" />{e.timestamp}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${actionColors[e.action] ?? "bg-muted"}`}>
                      {e.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium">{e.module}</td>
                  <td className="px-4 py-3 font-mono text-xs">{e.entityId}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{e.performedBy}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">{e.details}</td>
                </tr>
                {expandedId === e.id && e.diff && (
                  <tr className="bg-muted/10">
                    <td colSpan={7} className="px-8 py-3">
                      <div className="text-xs space-y-1.5">
                        <p className="font-semibold text-muted-foreground mb-2">{t("auditLog.changes")}</p>
                        {e.diff.map((d) => (
                          <div key={d.field} className="flex items-center gap-2">
                            <span className="font-medium text-foreground w-32 shrink-0">{d.field}</span>
                            <span className="px-1.5 py-0.5 rounded bg-destructive/10 text-destructive line-through">{d.oldValue}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="px-1.5 py-0.5 rounded bg-success/10 text-success font-medium">{d.newValue}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} {t("auditLog.entries")}
        {" · "}{auditEntries.filter(e => e.diff).length} {t("auditLog.withDiff")}
        {" · "}{t("auditLog.persistedLocal")}
      </p>
    </div>
  );
}
