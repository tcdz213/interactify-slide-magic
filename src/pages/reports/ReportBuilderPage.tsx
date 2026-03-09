import { useState, useMemo } from "react";
import { BarChart3, FileSpreadsheet, Download, Plus, Trash2, Eye, Table as TableIcon } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { currency } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import ExportDialog from "@/components/ExportDialog";
import { useTranslation } from "react-i18next";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"];

type DataSource = "inventory" | "products" | "salesOrders" | "purchaseOrders" | "payments" | "cycleCounts";
type AggFn = "count" | "sum" | "avg" | "min" | "max";
type ChartType = "table" | "bar" | "pie";

interface ReportConfig {
  dataSource: DataSource;
  groupBy: string;
  metric: string;
  aggFn: AggFn;
  chartType: ChartType;
}

export default function ReportBuilderPage() {
  const { t } = useTranslation();
  const wms = useWMSData();

  const DATA_SOURCES: Record<DataSource, { label: string; groupFields: string[]; metricFields: string[] }> = {
    inventory: { label: t("reportBuilder.inventory"), groupFields: ["category", "warehouseName", "zone"], metricFields: ["qtyOnHand", "qtyAvailable", "unitCostAvg"] },
    products: { label: t("reportBuilder.productsSource"), groupFields: ["category", "uom"], metricFields: ["unitCost", "unitPrice", "reorderPoint"] },
    salesOrders: { label: t("reportBuilder.salesOrders"), groupFields: ["status", "customerName"], metricFields: ["totalAmount"] },
    purchaseOrders: { label: t("reportBuilder.purchaseOrders"), groupFields: ["status", "vendorName"], metricFields: ["totalAmount"] },
    payments: { label: t("reportBuilder.paymentsSource"), groupFields: ["method", "status"], metricFields: ["amount"] },
    cycleCounts: { label: t("reportBuilder.cycleCounts"), groupFields: ["status", "warehouseId"], metricFields: ["totalVariance"] },
  };

  const AGG_LABELS: Record<AggFn, string> = {
    count: t("reportBuilder.count"),
    sum: t("reportBuilder.sum"),
    avg: t("reportBuilder.avg"),
    min: t("reportBuilder.min"),
    max: t("reportBuilder.max"),
  };

  const [config, setConfig] = useState<ReportConfig>({
    dataSource: "inventory",
    groupBy: "category",
    metric: "qtyOnHand",
    aggFn: "sum",
    chartType: "bar",
  });
  const [exportOpen, setExportOpen] = useState(false);

  const sourceConfig = DATA_SOURCES[config.dataSource];

  const rawData = useMemo(() => {
    switch (config.dataSource) {
      case "inventory": return wms.inventory as any[];
      case "products": return wms.products as any[];
      case "salesOrders": return wms.salesOrders as any[];
      case "purchaseOrders": return wms.purchaseOrders as any[];
      case "payments": return wms.payments as any[];
      case "cycleCounts": return wms.cycleCounts as any[];
      default: return [];
    }
  }, [config.dataSource, wms]);

  const reportData = useMemo(() => {
    const groups = new Map<string, number[]>();
    rawData.forEach((row: any) => {
      const key = String(row[config.groupBy] ?? "N/A");
      const val = Number(row[config.metric]) || 0;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(val);
    });

    return Array.from(groups.entries()).map(([name, values]) => {
      let value: number;
      switch (config.aggFn) {
        case "count": value = values.length; break;
        case "sum": value = values.reduce((a, b) => a + b, 0); break;
        case "avg": value = values.reduce((a, b) => a + b, 0) / values.length; break;
        case "min": value = Math.min(...values); break;
        case "max": value = Math.max(...values); break;
      }
      return { name, value: Math.round(value * 100) / 100, count: values.length };
    }).sort((a, b) => b.value - a.value);
  }, [rawData, config]);

  const exportColumns = [
    { key: "name" as const, label: config.groupBy },
    { key: "value" as const, label: `${AGG_LABELS[config.aggFn]} ${config.metric}` },
    { key: "count" as const, label: t("reportBuilder.number") },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("reportBuilder.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("reportBuilder.subtitle")}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1" onClick={() => setExportOpen(true)}>
          <Download className="h-4 w-4" /> {t("reportBuilder.export")}
        </Button>
      </div>

      {/* Config panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("reportBuilder.reportConfig")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("reportBuilder.dataSource")}</label>
              <Select value={config.dataSource} onValueChange={(v) => {
                const ds = v as DataSource;
                const src = DATA_SOURCES[ds];
                setConfig({ ...config, dataSource: ds, groupBy: src.groupFields[0], metric: src.metricFields[0] });
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(DATA_SOURCES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("reportBuilder.groupBy")}</label>
              <Select value={config.groupBy} onValueChange={(v) => setConfig({ ...config, groupBy: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {sourceConfig.groupFields.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("reportBuilder.metric")}</label>
              <Select value={config.metric} onValueChange={(v) => setConfig({ ...config, metric: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {sourceConfig.metricFields.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("reportBuilder.aggregation")}</label>
              <Select value={config.aggFn} onValueChange={(v) => setConfig({ ...config, aggFn: v as AggFn })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(AGG_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("reportBuilder.visualization")}</label>
              <Select value={config.chartType} onValueChange={(v) => setConfig({ ...config, chartType: v as ChartType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">{t("reportBuilder.tableView")}</SelectItem>
                  <SelectItem value="bar">{t("reportBuilder.bars")}</SelectItem>
                  <SelectItem value="pie">{t("reportBuilder.pie")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {AGG_LABELS[config.aggFn]} {t("common.of", { defaultValue: "de" })} {config.metric} {t("reportBuilder.groupBy").toLowerCase()} {config.groupBy}
            </CardTitle>
            <Badge variant="outline">{reportData.length} {t("reportBuilder.groups")} · {rawData.length} {t("reportBuilder.records")}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {config.chartType === "bar" && (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.slice(0, 15)} margin={{ left: 10, right: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => v.toLocaleString("fr-DZ")} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {config.chartType === "pie" && (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={reportData.slice(0, 8)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {reportData.slice(0, 8).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => v.toLocaleString("fr-DZ")} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {config.chartType === "table" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">{config.groupBy}</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">{AGG_LABELS[config.aggFn]} {config.metric}</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">{t("reportBuilder.number")}</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((r) => (
                    <tr key={r.name} className="border-b border-border/40 hover:bg-muted/20">
                      <td className="px-4 py-2 font-medium">{r.name}</td>
                      <td className="px-4 py-2 text-right font-mono">{r.value.toLocaleString("fr-DZ")}</td>
                      <td className="px-4 py-2 text-right text-muted-foreground">{r.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        data={reportData}
        columns={exportColumns}
        filename={`rapport-${config.dataSource}-${config.groupBy}`}
      />
    </div>
  );
}
