import { useMemo } from "react";
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, Package } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { currency } from "@/data/mockData";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useTranslation } from "react-i18next";

const COLORS = ["hsl(160,84%,39%)", "hsl(217,91%,60%)", "hsl(38,92%,50%)", "hsl(280,65%,60%)", "hsl(340,75%,55%)"];

export default function ReportsOverviewPage() {
  const { t } = useTranslation();
  const { inventory, salesOrders, cycleCounts, stockAdjustments, payments, invoices } = useWMSData();

  const accuracyData = useMemo(() => {
    const counted = cycleCounts.filter((c: any) => c.status === "Approved" || c.status === "Pending_Review");
    const totalExpected = counted.reduce((s: number, c: any) => s + c.lines.reduce((ls: number, l: any) => ls + l.expectedQty, 0), 0);
    const totalVariance = counted.reduce((s: number, c: any) => s + Math.abs(c.totalVariance), 0);
    const accuracy = totalExpected > 0 ? ((totalExpected - totalVariance) / totalExpected * 100) : 100;
    return { accuracy: accuracy.toFixed(1), totalExpected, totalVariance, counts: counted.length };
  }, [cycleCounts]);

  const valuationData = useMemo(() => {
    const byCategory: Record<string, number> = {};
    inventory.forEach((i: any) => {
      byCategory[i.category] = (byCategory[i.category] || 0) + i.qtyOnHand * i.unitCostAvg;
    });
    return Object.entries(byCategory).map(([name, value]) => ({ name, value }));
  }, [inventory]);

  const totalStockValue = inventory.reduce((s: number, i: any) => s + i.qtyOnHand * i.unitCostAvg, 0);
  const lowStockCount = inventory.filter((i: any) => i.qtyAvailable < i.reorderPoint).length;
  const expiringSoon = inventory.filter((i: any) => i.daysToExpiry <= 30).length;

  const movementData = useMemo(() => {
    const fast = inventory.filter((i: any) => i.daysSinceMovement <= 7).length;
    const medium = inventory.filter((i: any) => i.daysSinceMovement > 7 && i.daysSinceMovement <= 30).length;
    const slow = inventory.filter((i: any) => i.daysSinceMovement > 30 && i.daysSinceMovement <= 90).length;
    const dead = inventory.filter((i: any) => i.daysSinceMovement > 90).length;
    return [
      { name: t("reportsOverview.fast"), value: fast, color: "hsl(160,84%,39%)" },
      { name: t("reportsOverview.medium"), value: medium, color: "hsl(217,91%,60%)" },
      { name: t("reportsOverview.slow"), value: slow, color: "hsl(38,92%,50%)" },
      { name: t("reportsOverview.deadStock"), value: dead, color: "hsl(340,75%,55%)" },
    ];
  }, [inventory, t]);

  const adjustmentValue = stockAdjustments.filter((a: any) => a.status === "Approved").reduce((s: number, a: any) => s + a.valueLoss, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <WarehouseScopeBanner />
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t("reportsOverview.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("reportsOverview.subtitle")}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("reportsOverview.inventoryAccuracy")}</p>
          <p className="text-xl font-semibold text-success">{accuracyData.accuracy}%</p>
          <p className="text-[10px] text-muted-foreground">{accuracyData.counts} {t("reportsOverview.counts")}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("reportsOverview.stockValuation")}</p>
          <p className="text-xl font-semibold text-primary">{currency(totalStockValue)}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("reportsOverview.belowThreshold")}</p>
          <p className="text-xl font-semibold text-warning">{lowStockCount}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("reportsOverview.expiring30d")}</p>
          <p className="text-xl font-semibold text-destructive">{expiringSoon}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("reportsOverview.approvedLosses")}</p>
          <p className="text-xl font-semibold text-destructive">{currency(adjustmentValue)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Valuation by category */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">{t("reportsOverview.valuationByCategory")}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={valuationData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [currency(v), t("reportsOverview.value")]} />
              <Bar dataKey="value" fill="hsl(160,84%,39%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Movement analysis */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">{t("reportsOverview.articleRotation")}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={movementData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {movementData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v} ${t("reportsOverview.articles")}`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {movementData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shortage table */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" /> {t("reportsOverview.stockShortages")}
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">{t("reportsOverview.colProduct")}</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">{t("reportsOverview.colAvailable")}</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">{t("reportsOverview.colThreshold")}</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">{t("reportsOverview.colDeficit")}</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">{t("reportsOverview.colExpDays")}</th>
            </tr>
          </thead>
          <tbody>
            {inventory
              .filter((i: any) => i.qtyAvailable < i.reorderPoint)
              .sort((a: any, b: any) => (a.qtyAvailable - a.reorderPoint) - (b.qtyAvailable - b.reorderPoint))
              .map((i: any) => (
                <tr key={i.id} className="border-b border-border/40 bg-destructive/5">
                  <td className="px-4 py-2 font-medium">{i.productName}</td>
                  <td className="px-4 py-2 text-right">{i.qtyAvailable}</td>
                  <td className="px-4 py-2 text-right text-muted-foreground">{i.reorderPoint}</td>
                  <td className="px-4 py-2 text-right font-medium text-destructive">{i.qtyAvailable - i.reorderPoint}</td>
                  <td className="px-4 py-2 text-right">{i.daysToExpiry}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
