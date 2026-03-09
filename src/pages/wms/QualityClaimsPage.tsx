import { useMemo, useState } from "react";
import { AlertTriangle, Plus, Eye, Search, Clock, ArrowUpRight, CheckCircle2, XCircle } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { currency } from "@/data/mockData";
import type { QualityClaim, ClaimStatus, ClaimPriority, SettlementType, RootCauseCode } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const PRIORITY_COLORS: Record<ClaimPriority, string> = {
  Low: "bg-muted text-muted-foreground", Medium: "bg-warning/10 text-warning",
  High: "bg-destructive/10 text-destructive", Critical: "bg-destructive text-destructive-foreground",
};

const SLA_DAYS: Record<ClaimPriority, number> = { Low: 30, Medium: 15, High: 7, Critical: 3 };

export default function QualityClaimsPage() {
  const { t } = useTranslation();
  const { qualityClaims, setQualityClaims, vendors } = useWMSData();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<QualityClaim | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newClaim, setNewClaim] = useState({ claimType: "Quality" as QualityClaim["claimType"], vendorId: "", priority: "Medium" as ClaimPriority, claimedAmount: 0, rootCause: "MFG_DEFECT" as RootCauseCode, notes: "" });

  const STATUS_LABELS: Record<ClaimStatus, string> = {
    Opened: t("qualityClaims.statusOpened"), Under_Review: t("qualityClaims.statusUnderReview"), Vendor_Notified: t("qualityClaims.statusVendorNotified"),
    Disputed: t("qualityClaims.statusDisputed"), Escalated: t("qualityClaims.statusEscalated"), Resolved: t("qualityClaims.statusResolved"), Closed: t("qualityClaims.statusClosed"), Cancelled: t("qualityClaims.statusCancelled"),
  };

  const ROOT_CAUSE_LABELS: Record<RootCauseCode, string> = {
    MFG_DEFECT: t("qualityClaims.rootMfgDefect"), RAW_MATERIAL: t("qualityClaims.rootRawMaterial"),
    PACKAGING: t("qualityClaims.rootPackaging"), TRANSPORT: t("qualityClaims.rootTransport"),
    STORAGE_VENDOR: t("qualityClaims.rootStorageVendor"), LABELLING: t("qualityClaims.rootLabelling"),
    SPEC_DEVIATION: t("qualityClaims.rootSpecDeviation"), CONTAMINATION: t("qualityClaims.rootContamination"),
    SHELF_LIFE: t("qualityClaims.rootShelfLife"), DOCUMENTATION: t("qualityClaims.rootDocumentation"),
  };

  const SETTLEMENT_LABELS: Record<SettlementType, string> = {
    Full_Credit: t("qualityClaims.settlementFullCredit"), Partial_Credit: t("qualityClaims.settlementPartialCredit"), Replacement: t("qualityClaims.settlementReplacement"),
    Price_Reduction: t("qualityClaims.settlementPriceReduction"), Penalty: t("qualityClaims.settlementPenalty"), No_Action: t("qualityClaims.settlementNoAction"), Mixed: t("qualityClaims.settlementMixed"),
  };

  const filtered = useMemo(() => qualityClaims.filter((c: QualityClaim) => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      return c.id.toLowerCase().includes(s) || c.vendorName.toLowerCase().includes(s);
    }
    return true;
  }), [qualityClaims, search, filterStatus]);

  const stats = useMemo(() => ({
    total: qualityClaims.length,
    open: qualityClaims.filter((c: QualityClaim) => !["Resolved", "Closed", "Cancelled"].includes(c.status)).length,
    resolved: qualityClaims.filter((c: QualityClaim) => c.status === "Resolved" || c.status === "Closed").length,
    totalClaimed: qualityClaims.reduce((s: number, c: QualityClaim) => s + c.claimedAmount, 0),
    totalSettled: qualityClaims.filter((c: QualityClaim) => c.settledAmount).reduce((s: number, c: QualityClaim) => s + (c.settledAmount || 0), 0),
    overdue: qualityClaims.filter((c: QualityClaim) => {
      if (["Resolved", "Closed", "Cancelled"].includes(c.status)) return false;
      return new Date(c.slaDueDate) < new Date();
    }).length,
  }), [qualityClaims]);

  const advanceStatus = (id: string, newStatus: ClaimStatus) => {
    setQualityClaims((prev: QualityClaim[]) => prev.map(c => c.id === id ? { ...c, status: newStatus, ...(newStatus === "Resolved" ? { resolvedDate: new Date().toISOString().slice(0, 10) } : {}) } : c));
    toast({ title: t("qualityClaims.statusAdvanced", { status: STATUS_LABELS[newStatus] }), description: id });
    if (selected?.id === id) setSelected(null);
  };

  const handleResolve = (id: string, settlementType: SettlementType, settledAmount: number) => {
    setQualityClaims((prev: QualityClaim[]) => prev.map(c => c.id === id ? { ...c, status: "Resolved" as const, settlementType, settledAmount, resolvedDate: new Date().toISOString().slice(0, 10) } : c));
    toast({ title: t("qualityClaims.claimResolved"), description: `${id} — ${SETTLEMENT_LABELS[settlementType]}` });
    setSelected(null);
  };

  const handleCreate = () => {
    const vendor = vendors.find((v: any) => v.id === newClaim.vendorId);
    if (!vendor || newClaim.claimedAmount <= 0) return;
    const slaDays = SLA_DAYS[newClaim.priority];
    const slaDue = new Date(); slaDue.setDate(slaDue.getDate() + slaDays);
    const claim: QualityClaim = {
      id: `CLM-${String(qualityClaims.length + 1).padStart(3, "0")}`,
      claimType: newClaim.claimType, vendorId: vendor.id, vendorName: vendor.name,
      openedDate: new Date().toISOString().slice(0, 10), status: "Opened",
      priority: newClaim.priority, claimedAmount: newClaim.claimedAmount,
      rootCause: newClaim.rootCause, slaDueDate: slaDue.toISOString().slice(0, 10),
      assignedTo: "Karim Ben Ali",
    };
    setQualityClaims((prev: QualityClaim[]) => [claim, ...prev]);
    setShowCreate(false);
    setNewClaim({ claimType: "Quality", vendorId: "", priority: "Medium", claimedAmount: 0, rootCause: "MFG_DEFECT", notes: "" });
    toast({ title: t("qualityClaims.claimCreated"), description: claim.id });
  };

  const getDaysRemaining = (dueDate: string) => {
    return Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("qualityClaims.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("qualityClaims.subtitle")}</p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2"><Plus className="h-4 w-4" /> {t("qualityClaims.newClaim")}</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        {[
          { label: t("qualityClaims.total"), value: stats.total, color: "" },
          { label: t("qualityClaims.open"), value: stats.open, color: "text-warning" },
          { label: t("qualityClaims.resolved"), value: stats.resolved, color: "text-success" },
          { label: t("qualityClaims.overdueSla"), value: stats.overdue, color: "text-destructive" },
          { label: t("qualityClaims.claimedAmount"), value: currency(stats.totalClaimed), color: "text-primary" },
          { label: t("qualityClaims.settledAmount"), value: currency(stats.totalSettled), color: "text-success" },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-lg p-3 border border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className={`text-lg font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder={t("qualityClaims.search")} value={search} onChange={e => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
          <option value="all">{t("qualityClaims.allStatuses")}</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">{t("qualityClaims.noClaims")}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("qualityClaims.colId")}</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("qualityClaims.colVendor")}</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("qualityClaims.colType")}</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("qualityClaims.colPriority")}</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("qualityClaims.colCause")}</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("qualityClaims.colAmount")}</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("qualityClaims.colSla")}</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("qualityClaims.colStatus")}</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{t("qualityClaims.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c: QualityClaim) => {
                const daysLeft = getDaysRemaining(c.slaDueDate);
                const isOverdue = daysLeft < 0 && !["Resolved", "Closed", "Cancelled"].includes(c.status);
                return (
                  <tr key={c.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${isOverdue ? "bg-destructive/5" : ""}`}>
                    <td className="px-4 py-3 font-mono text-xs font-medium">{c.id}</td>
                    <td className="px-4 py-3 font-medium">{c.vendorName}</td>
                    <td className="px-4 py-3 text-xs">{c.claimType}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[c.priority]}`}>{c.priority}</span>
                    </td>
                    <td className="px-4 py-3 text-xs">{c.rootCause ? ROOT_CAUSE_LABELS[c.rootCause] : "—"}</td>
                    <td className="px-4 py-3 text-right font-medium">{currency(c.claimedAmount)}</td>
                    <td className="px-4 py-3 text-xs">
                      {["Resolved", "Closed", "Cancelled"].includes(c.status) ? (
                        <span className="text-success">✓</span>
                      ) : isOverdue ? (
                        <span className="text-destructive font-medium">{t("qualityClaims.daysOverdue", { days: Math.abs(daysLeft) })}</span>
                      ) : (
                        <span>{t("qualityClaims.daysRemaining", { days: daysLeft })}</span>
                      )}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelected(c)} className="p-1.5 rounded-md hover:bg-muted transition-colors"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></button>
                        {c.status === "Opened" && <button onClick={() => advanceStatus(c.id, "Under_Review")} className="p-1.5 rounded-md hover:bg-info/10" title={t("qualityClaims.review")}><Search className="h-3.5 w-3.5 text-info" /></button>}
                        {c.status === "Under_Review" && <button onClick={() => advanceStatus(c.id, "Vendor_Notified")} className="p-1.5 rounded-md hover:bg-warning/10" title={t("qualityClaims.notifyVendor")}><ArrowUpRight className="h-3.5 w-3.5 text-warning" /></button>}
                        {(c.status === "Vendor_Notified" || c.status === "Disputed") && <button onClick={() => handleResolve(c.id, "Full_Credit", c.claimedAmount)} className="p-1.5 rounded-md hover:bg-success/10" title={t("qualityClaims.fullCredit")}><CheckCircle2 className="h-3.5 w-3.5 text-success" /></button>}
                        {!["Resolved", "Closed", "Cancelled", "Escalated"].includes(c.status) && <button onClick={() => advanceStatus(c.id, "Escalated")} className="p-1.5 rounded-md hover:bg-destructive/10" title={t("qualityClaims.escalate")}><AlertTriangle className="h-3.5 w-3.5 text-destructive" /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className="font-mono">{selected.id}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[selected.priority]}`}>{selected.priority}</span>
                  <StatusBadge status={selected.status} />
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <div><span className="text-muted-foreground">{t("qualityClaims.detailVendor")}</span> <span className="font-medium">{selected.vendorName}</span></div>
                <div><span className="text-muted-foreground">{t("qualityClaims.detailType")}</span> {selected.claimType}</div>
                <div><span className="text-muted-foreground">{t("qualityClaims.detailOpened")}</span> {selected.openedDate}</div>
                <div><span className="text-muted-foreground">{t("qualityClaims.detailSlaDue")}</span> <span className={new Date(selected.slaDueDate) < new Date() ? "text-destructive font-medium" : ""}>{selected.slaDueDate}</span></div>
                <div><span className="text-muted-foreground">{t("qualityClaims.detailClaimed")}</span> <span className="font-bold">{currency(selected.claimedAmount)}</span></div>
                {selected.settledAmount !== undefined && <div><span className="text-muted-foreground">{t("qualityClaims.detailSettled")}</span> <span className="font-bold text-success">{currency(selected.settledAmount)}</span></div>}
                {selected.rootCause && <div><span className="text-muted-foreground">{t("qualityClaims.detailRootCause")}</span> {ROOT_CAUSE_LABELS[selected.rootCause]}</div>}
                {selected.settlementType && <div><span className="text-muted-foreground">{t("qualityClaims.detailSettlement")}</span> {SETTLEMENT_LABELS[selected.settlementType]}</div>}
                <div><span className="text-muted-foreground">{t("qualityClaims.detailAssigned")}</span> {selected.assignedTo}</div>
                {selected.escalatedTo && <div><span className="text-muted-foreground">{t("qualityClaims.detailEscalated")}</span> <span className="text-destructive">{selected.escalatedTo}</span></div>}
                {selected.grnId && <div><span className="text-muted-foreground">{t("qualityClaims.detailGrn")}</span> <span className="font-mono">{selected.grnId}</span></div>}
                {selected.returnId && <div><span className="text-muted-foreground">{t("qualityClaims.detailReturn")}</span> <span className="font-mono">{selected.returnId}</span></div>}
                {selected.correctiveAction && <div className="col-span-2"><span className="text-muted-foreground">{t("qualityClaims.detailCorrective")}</span> {selected.correctiveAction}</div>}
                {selected.resolutionNotes && <div className="col-span-2"><span className="text-muted-foreground">{t("qualityClaims.detailResolutionNotes")}</span> {selected.resolutionNotes}</div>}
              </div>

              <div className="mt-4 flex gap-2 flex-wrap">
                {selected.status === "Opened" && <Button size="sm" onClick={() => advanceStatus(selected.id, "Under_Review")}>{t("qualityClaims.review")}</Button>}
                {selected.status === "Under_Review" && <Button size="sm" onClick={() => advanceStatus(selected.id, "Vendor_Notified")}>{t("qualityClaims.notifyVendor")}</Button>}
                {(selected.status === "Vendor_Notified" || selected.status === "Disputed" || selected.status === "Escalated") && (
                  <>
                    <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90" onClick={() => handleResolve(selected.id, "Full_Credit", selected.claimedAmount)}>{t("qualityClaims.fullCredit")}</Button>
                    <Button size="sm" variant="outline" onClick={() => handleResolve(selected.id, "Partial_Credit", Math.round(selected.claimedAmount * 0.5))}>{t("qualityClaims.partialCredit")}</Button>
                    <Button size="sm" variant="outline" onClick={() => handleResolve(selected.id, "Replacement", 0)}>{t("qualityClaims.replacement")}</Button>
                    <Button size="sm" variant="outline" onClick={() => handleResolve(selected.id, "Penalty", selected.claimedAmount)}>{t("qualityClaims.penalty")}</Button>
                  </>
                )}
                {selected.status === "Vendor_Notified" && <Button size="sm" variant="outline" className="text-warning" onClick={() => advanceStatus(selected.id, "Disputed")}>{t("qualityClaims.markDisputed")}</Button>}
                {!["Resolved", "Closed", "Cancelled", "Escalated"].includes(selected.status) && <Button size="sm" variant="outline" className="text-destructive" onClick={() => advanceStatus(selected.id, "Escalated")}>{t("qualityClaims.escalate")}</Button>}
                {selected.status === "Resolved" && <Button size="sm" onClick={() => advanceStatus(selected.id, "Closed")}>{t("qualityClaims.close")}</Button>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t("qualityClaims.newClaimTitle")}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("qualityClaims.vendor")}</label>
              <select value={newClaim.vendorId} onChange={e => setNewClaim(p => ({ ...p, vendorId: e.target.value }))} className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm">
                <option value="">{t("qualityClaims.selectVendor")}</option>
                {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t("qualityClaims.claimType")}</label>
                <select value={newClaim.claimType} onChange={e => setNewClaim(p => ({ ...p, claimType: e.target.value as any }))} className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm">
                  {["Quality", "Quantity", "Delivery", "Contract", "Pricing"].map(t2 => <option key={t2} value={t2}>{t2}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t("qualityClaims.priority")}</label>
                <select value={newClaim.priority} onChange={e => setNewClaim(p => ({ ...p, priority: e.target.value as ClaimPriority }))} className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm">
                  {(["Low", "Medium", "High", "Critical"] as const).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("qualityClaims.rootCause")}</label>
              <select value={newClaim.rootCause} onChange={e => setNewClaim(p => ({ ...p, rootCause: e.target.value as RootCauseCode }))} className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm">
                {Object.entries(ROOT_CAUSE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("qualityClaims.claimedAmountDZD")}</label>
              <input type="number" value={newClaim.claimedAmount || ""} onChange={e => setNewClaim(p => ({ ...p, claimedAmount: Number(e.target.value) }))} className="mt-1 h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>{t("qualityClaims.cancel")}</Button>
            <Button onClick={handleCreate} disabled={!newClaim.vendorId || newClaim.claimedAmount <= 0}>{t("qualityClaims.create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}