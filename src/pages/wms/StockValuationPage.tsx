import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUnitConversion } from "@/hooks/useUnitConversion";
import { canViewFinancials } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, DollarSign, TrendingUp, Package, BarChart3, ShieldAlert, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExportDialog from "@/components/ExportDialog";
import type { ExportColumn } from "@/lib/exportUtils";
import { currency } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899"];

type ValuationMethod = "WAC" | "FIFO" | "LAST_COST";

export default function StockValuationPage() {
  const { t } = useTranslation();
  const { inventory, products } = useWMSData();
  const { currentUser } = useAuth();
  const { getBaseUnitAbbr, getUnitsForProduct } = useUnitConversion();
  const showFinancials = currentUser ? canViewFinancials(currentUser) : false;
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [method, setMethod] = useState<ValuationMethod>("WAC");
  const [exportOpen, setExportOpen] = useState(false);

  type ValuationRow = { productId: string; productName: string; sku: string; category: string; totalQty: number; totalValue: number; avgCost: number; fifoCost: number; lastCost: number; items: typeof inventory };
  const valuationExportCols: ExportColumn<ValuationRow>[] = [
    { key: "productName", label: t("stockValuation.colProduct") }, { key: "sku", label: t("stockValuation.colSKU") },
    { key: "category", label: t("stockValuation.colCategory") }, { key: "totalQty", label: t("stockValuation.colQtyInStock") },
    { key: "avgCost", label: t("stockValuation.colAvgCost") }, { key: "totalValue", label: t("stockValuation.colTotalValue") },
  ];

  // Compute valuation per product
  const valuationData = useMemo(() => {
    const grouped = new Map<string, ValuationRow>();

    inventory.forEach((item) => {
      if (warehouseFilter !== "all" && item.warehouseId !== warehouseFilter) return;

      const existing = grouped.get(item.productId);
      const value = item.qtyOnHand * item.unitCostAvg;
      if (existing) {
        existing.totalQty += item.qtyOnHand;
        existing.totalValue += value;
        existing.avgCost = existing.totalQty > 0 ? existing.totalValue / existing.totalQty : 0;
        existing.fifoCost = Math.min(existing.fifoCost, item.unitCostAvg);
        existing.lastCost = item.unitCostAvg;
        existing.items.push(item);
      } else {
        grouped.set(item.productId, {
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          category: item.category,
          totalQty: item.qtyOnHand,
          totalValue: value,
          avgCost: item.unitCostAvg,
          fifoCost: item.unitCostAvg,
          lastCost: item.unitCostAvg,
          items: [item],
        });
      }
    });

    const result = Array.from(grouped.values()).map(v => {
      const prod = products.find(p => p.id === v.productId);
      if (prod) {
        v.lastCost = prod.unitCost ?? v.avgCost;
        v.fifoCost = Math.min(v.fifoCost, v.avgCost * 0.95);
      }
      return v;
    });

    return result.sort((a, b) => b.totalValue - a.totalValue);
  }, [inventory, warehouseFilter, products]);

  const filtered = valuationData.filter((v) =>
    !search || v.productName.toLowerCase().includes(search.toLowerCase()) || v.sku.toLowerCase().includes(search.toLowerCase())
  );

  const getMethodCost = (v: typeof valuationData[0]) => {
    switch (method) {
      case "FIFO": return v.fifoCost;
      case "LAST_COST": return v.lastCost;
      default: return v.avgCost;
    }
  };
  const getMethodValue = (v: typeof valuationData[0]) => v.totalQty * getMethodCost(v);

  const totalStockValue = valuationData.reduce((sum, v) => sum + getMethodValue(v), 0);
  const totalItems = valuationData.reduce((sum, v) => sum + v.totalQty, 0);
  const uniqueProducts = valuationData.length;

  const totalWACValue = valuationData.reduce((sum, v) => sum + v.totalValue, 0);
  const methodDiff = method !== "WAC" ? totalStockValue - totalWACValue : 0;

  const costMethodLabel = method === "WAC" ? t("stockValuation.costAvg") : method === "FIFO" ? t("stockValuation.costFIFO") : t("stockValuation.costLast");

  const categoryData = useMemo(() => {
    const cats = new Map<string, number>();
    valuationData.forEach((v) => {
      cats.set(v.category, (cats.get(v.category) || 0) + getMethodValue(v));
    });
    return Array.from(cats.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [valuationData]);

  const topProducts = filtered.slice(0, 8).map((v) => ({
    name: v.productName.length > 15 ? v.productName.slice(0, 15) + "…" : v.productName,
    value: v.totalValue,
    qty: v.totalQty,
  }));

  const warehouses = [...new Set(inventory.map((i) => i.warehouseId))];
  const warehouseNames: Record<string, string> = {};
  inventory.forEach((i) => { warehouseNames[i.warehouseId] = i.warehouseName; });

  if (!showFinancials) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <ShieldAlert className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">{t("stockValuation.restrictedAccess")}</h2>
        <p className="text-muted-foreground text-center max-w-md">{t("stockValuation.restrictedMsg")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("stockValuation.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("stockValuation.subtitle")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setExportOpen(true)} className="gap-2"><Download className="h-4 w-4" /> {t("stockValuation.export")}</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{currency(totalStockValue)}</p>
              <p className="text-xs text-muted-foreground">{t("stockValuation.totalValue")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Package className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xl font-bold">{totalItems.toLocaleString("fr-DZ")}</p>
              <p className="text-xs text-muted-foreground">{t("stockValuation.unitsInStock")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <BarChart3 className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold">{uniqueProducts}</p>
              <p className="text-xs text-muted-foreground">{t("stockValuation.references")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <TrendingUp className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xl font-bold">{totalItems > 0 ? currency(Math.round(totalStockValue / totalItems)) : "—"}</p>
              <p className="text-xs text-muted-foreground">{t("stockValuation.costPerUnit", { method: costMethodLabel })}</p>
              {method !== "WAC" && (
                <p className={`text-[10px] font-medium ${methodDiff > 0 ? "text-destructive" : methodDiff < 0 ? "text-success" : "text-muted-foreground"}`}>
                  {methodDiff > 0 ? "+" : ""}{currency(methodDiff)} {t("stockValuation.vsWAC")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("stockValuation.valueByCat")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => currency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("stockValuation.topProducts")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => currency(v)} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div>
              <CardTitle className="text-lg">{t("stockValuation.valuationDetail")}</CardTitle>
              <CardDescription className="text-xs">
                {t("stockValuation.methodLabel")} : {method === "WAC" ? t("stockValuation.methodWACFull") : method === "FIFO" ? t("stockValuation.methodFIFOFull") : t("stockValuation.methodLastCostFull")}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={method} onValueChange={(v) => setMethod(v as ValuationMethod)}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WAC">{t("stockValuation.methodWAC")}</SelectItem>
                  <SelectItem value="FIFO">{t("stockValuation.methodFIFO")}</SelectItem>
                  <SelectItem value="LAST_COST">{t("stockValuation.methodLastCost")}</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t("stockValuation.searchPlaceholder")} className="pl-9 w-56" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("stockValuation.allWarehouses")}</SelectItem>
                  {warehouses.map((wh) => (
                    <SelectItem key={wh} value={wh}>{warehouseNames[wh]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("stockValuation.colProduct")}</TableHead>
                <TableHead>{t("stockValuation.colSKU")}</TableHead>
                <TableHead>{t("stockValuation.colCategory")}</TableHead>
                <TableHead>{t("stockValuation.colUnit")}</TableHead>
                <TableHead className="text-right">{t("stockValuation.colQtyInStock")}</TableHead>
                <TableHead className="text-right">{t("stockValuation.colQtyBase")}</TableHead>
                <TableHead className="text-right">{t("stockValuation.colAvgCost")}</TableHead>
                <TableHead className="text-right">{t("stockValuation.colTotalValue")}</TableHead>
                <TableHead className="text-right">{t("stockValuation.colPctStock")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v) => {
                const methodValue = getMethodValue(v);
                const methodCost = getMethodCost(v);
                const pct = totalStockValue > 0 ? ((methodValue / totalStockValue) * 100).toFixed(1) : "0";
                const prod = products.find(p => p.id === v.productId);
                const baseAbbr = getBaseUnitAbbr(v.productId);
                const stockUom = prod?.uom ?? baseAbbr;
                const units = getUnitsForProduct(v.productId);
                const breakdownParts: string[] = [];
                if (units.length > 1 && v.totalQty > 0) {
                  let remaining = v.totalQty;
                  const sorted = [...units].sort((a, b) => b.conversionFactor - a.conversionFactor);
                  for (const u of sorted) {
                    if (u.conversionFactor > remaining) continue;
                    const qty = Math.floor(remaining / u.conversionFactor);
                    if (qty > 0) {
                      breakdownParts.push(`${qty} ${u.unitAbbreviation}`);
                      remaining -= qty * u.conversionFactor;
                    }
                  }
                }
                return (
                  <TableRow key={v.productId}>
                    <TableCell className="font-medium">{v.productName}</TableCell>
                    <TableCell className="font-mono text-xs">{v.sku}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{v.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium">{stockUom}</span>
                      {baseAbbr !== stockUom && (
                        <span className="text-[10px] text-muted-foreground ml-1">(base: {baseAbbr})</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {v.totalQty.toLocaleString("fr-DZ")} <span className="text-xs text-muted-foreground">{stockUom}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      {breakdownParts.length > 0 ? (
                        <span className="text-xs text-muted-foreground" title={breakdownParts.join(" + ")}>
                          {breakdownParts.join(" + ")}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{currency(Math.round(methodCost))}</TableCell>
                    <TableCell className="text-right font-bold">{currency(methodValue)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={Number(pct) >= 20 ? "default" : Number(pct) >= 10 ? "secondary" : "outline"} className="text-xs">
                        {pct}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">{t("stockValuation.noProduct")}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Total row */}
          {filtered.length > 0 && (
            <div className="mt-4 flex justify-end border-t pt-3">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{t("stockValuation.totalDisplayed")}</p>
                <p className="text-2xl font-bold text-foreground">{currency(filtered.reduce((s, v) => s + v.totalValue, 0))}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} data={filtered} columns={valuationExportCols} filename="valorisation-stock" />
    </div>
  );
}
