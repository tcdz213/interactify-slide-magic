import { useMemo } from "react";
import { BarChart3, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { currency } from "@/data/mockData";
import type { QualityClaim, ReturnOrder } from "@/data/mockData";
import { useTranslation } from "react-i18next";

interface VendorScore {
  vendorId: string;
  vendorName: string;
  totalClaims: number;
  totalReturns: number;
  totalClaimedAmount: number;
  totalSettledAmount: number;
  avgResolutionDays: number;
  claimRate: number;
  repeatOffences: number;
  overallScore: number;
  status: "Good" | "Warning" | "Probation";
}

export default function VendorScorecardPage() {
  const { t } = useTranslation();
  const { qualityClaims, returns, grns, vendors } = useWMSData();

  const scorecards = useMemo(() => {
    const vendorMap = new Map<string, VendorScore>();

    const relevantVendorIds = new Set<string>();
    qualityClaims.forEach((c: QualityClaim) => relevantVendorIds.add(c.vendorId));
    returns.filter((r: ReturnOrder) => r.type === "Vendor").forEach((r: ReturnOrder) => {
      const vendor = vendors.find((v: any) => v.name === r.partyName);
      if (vendor) relevantVendorIds.add(vendor.id);
    });

    relevantVendorIds.forEach(vid => {
      const vendor = vendors.find((v: any) => v.id === vid);
      if (!vendor) return;

      const vendorClaims = qualityClaims.filter((c: QualityClaim) => c.vendorId === vid);
      const vendorReturns = returns.filter((r: ReturnOrder) => r.type === "Vendor" && r.partyName === vendor.name);
      const vendorGrns = grns.filter((g: any) => g.vendorId === vid || g.vendorName === vendor.name);

      const resolvedClaims = vendorClaims.filter((c: QualityClaim) => c.resolvedDate);
      const avgDays = resolvedClaims.length > 0
        ? resolvedClaims.reduce((sum: number, c: QualityClaim) => {
            const days = Math.ceil((new Date(c.resolvedDate!).getTime() - new Date(c.openedDate).getTime()) / (1000 * 60 * 60 * 24));
            return sum + days;
          }, 0) / resolvedClaims.length
        : 0;

      const claimRate = vendorGrns.length > 0 ? (vendorClaims.length / vendorGrns.length) * 100 : 0;
      const totalClaimed = vendorClaims.reduce((s: number, c: QualityClaim) => s + c.claimedAmount, 0);
      const totalSettled = vendorClaims.reduce((s: number, c: QualityClaim) => s + (c.settledAmount || 0), 0);

      const rootCauseCounts = new Map<string, number>();
      vendorClaims.forEach((c: QualityClaim) => {
        if (c.rootCause) rootCauseCounts.set(c.rootCause, (rootCauseCounts.get(c.rootCause) || 0) + 1);
      });
      const repeatOffences = Array.from(rootCauseCounts.values()).filter(v => v > 1).length;

      let score = 100;
      score -= Math.min(claimRate * 5, 30);
      score -= Math.min(avgDays * 0.5, 15);
      score -= repeatOffences * 10;
      score -= vendorClaims.filter((c: QualityClaim) => c.priority === "Critical").length * 10;
      score = Math.max(0, Math.round(score));

      vendorMap.set(vid, {
        vendorId: vid,
        vendorName: vendor.name,
        totalClaims: vendorClaims.length,
        totalReturns: vendorReturns.length,
        totalClaimedAmount: totalClaimed,
        totalSettledAmount: totalSettled,
        avgResolutionDays: Math.round(avgDays),
        claimRate: Math.round(claimRate * 10) / 10,
        repeatOffences,
        overallScore: score,
        status: score >= 70 ? "Good" : score >= 50 ? "Warning" : "Probation",
      });
    });

    return Array.from(vendorMap.values()).sort((a, b) => a.overallScore - b.overallScore);
  }, [qualityClaims, returns, grns, vendors]);

  const statusColors = { Good: "text-success", Warning: "text-warning", Probation: "text-destructive" };
  const statusLabels = { Good: t("vendorScorecard.statusGood"), Warning: t("vendorScorecard.statusWarning"), Probation: t("vendorScorecard.statusProbation") };
  const statusBg = { Good: "bg-success/10", Warning: "bg-warning/10", Probation: "bg-destructive/10" };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t("vendorScorecard.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("vendorScorecard.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("vendorScorecard.vendorsEvaluated")}</p>
          <p className="text-xl font-semibold">{scorecards.length}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("vendorScorecard.onProbation")}</p>
          <p className="text-xl font-semibold text-destructive">{scorecards.filter(s => s.status === "Probation").length}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("vendorScorecard.avgScore")}</p>
          <p className="text-xl font-semibold">{scorecards.length > 0 ? Math.round(scorecards.reduce((s, c) => s + c.overallScore, 0) / scorecards.length) : "—"}/100</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("vendorScorecard.totalClaimed")}</p>
          <p className="text-xl font-semibold text-primary">{currency(scorecards.reduce((s, c) => s + c.totalClaimedAmount, 0))}</p>
        </div>
      </div>

      {scorecards.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">{t("vendorScorecard.noData")}</p>
          <p className="text-sm mt-1">{t("vendorScorecard.noDataDesc")}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {scorecards.map(sc => (
            <div key={sc.vendorId} className={`glass-card rounded-xl p-4 border border-border/50 ${statusBg[sc.status]}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-base">{sc.vendorName}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBg[sc.status]} ${statusColors[sc.status]}`}>
                    {statusLabels[sc.status]}
                  </span>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${statusColors[sc.status]}`}>{sc.overallScore}</p>
                  <p className="text-xs text-muted-foreground">/ 100</p>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">{t("vendorScorecard.claims")}</p>
                  <p className="font-semibold">{sc.totalClaims}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("vendorScorecard.returns")}</p>
                  <p className="font-semibold">{sc.totalReturns}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("vendorScorecard.claimRate")}</p>
                  <p className="font-semibold">{sc.claimRate}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("vendorScorecard.avgResolution")}</p>
                  <p className="font-semibold">{t("vendorScorecard.resolutionDays", { days: sc.avgResolutionDays })}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("vendorScorecard.repeatOffences")}</p>
                  <p className={`font-semibold ${sc.repeatOffences > 0 ? "text-destructive" : ""}`}>{sc.repeatOffences}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("vendorScorecard.settledAmount")}</p>
                  <p className="font-semibold">{currency(sc.totalSettledAmount)}</p>
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full transition-all ${sc.overallScore >= 70 ? "bg-success" : sc.overallScore >= 50 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${sc.overallScore}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}