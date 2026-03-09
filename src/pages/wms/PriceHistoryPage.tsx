import { useState, useMemo } from "react";
import { History, Search, TrendingUp, TrendingDown, Minus, ArrowUpDown } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { currency } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { exportToCSV, exportToExcel } from "@/lib/exportUtils";
import { exportToPDF } from "@/lib/pdfExport";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface PriceRecord {
  id: string; productId: string; productName: string; sku: string; date: string;
  oldCost: number; newCost: number; oldPrice: number; newPrice: number;
  changedBy: string; reason: string;
}

function generatePriceHistory(products: any[]): PriceRecord[] {
  const records: PriceRecord[] = [];
  const dates = ["2025-12-01", "2025-12-15", "2026-01-01", "2026-01-15", "2026-02-01", "2026-02-10", "2026-02-20"];
  const users = ["Karim Ben Ali", "Samir Rafik", "Hassan Nour", "Ahmed Mansour"];
  const reasons = ["Mise à jour fournisseur", "Ajustement marge", "Promotion", "Hausse matière première", "Négociation contrat"];

  products.forEach((p, pi) => {
    const changes = 2 + (pi % 3);
    let currentCost = p.unitCost * 0.85;
    let currentPrice = p.unitPrice * 0.9;
    for (let i = 0; i < changes; i++) {
      const factor = 1 + (Math.random() * 0.1 - 0.03);
      const newCost = Math.round(currentCost * factor);
      const newPrice = Math.round(currentPrice * factor);
      records.push({
        id: `PH-${p.id}-${i}`, productId: p.id, productName: p.name, sku: p.sku,
        date: dates[i % dates.length], oldCost: Math.round(currentCost), newCost,
        oldPrice: Math.round(currentPrice), newPrice,
        changedBy: users[i % users.length], reason: reasons[(pi + i) % reasons.length],
      });
      currentCost = newCost;
      currentPrice = newPrice;
    }
  });
  return records.sort((a, b) => b.date.localeCompare(a.date));
}

export default function PriceHistoryPage() {
  const { t } = useTranslation();
  const { products } = useWMSData();
  const priceHistory = useMemo(() => generatePriceHistory(products), [products]);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");

  const filtered = priceHistory.filter((r) => {
    if (selectedProduct !== "all" && r.productId !== selectedProduct) return false;
    if (search && !r.productName.toLowerCase().includes(search.toLowerCase()) && !r.sku.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const chartData = useMemo(() => {
    if (selectedProduct === "all") return [];
    const productRecords = priceHistory.filter((r) => r.productId === selectedProduct).sort((a, b) => a.date.localeCompare(b.date));
    return productRecords.map((r) => ({
      date: r.date,
      [t("priceHistory.cost")]: r.newCost,
      [t("priceHistory.salePrice")]: r.newPrice,
      [t("priceHistory.margin")]: r.newPrice - r.newCost,
    }));
  }, [selectedProduct, priceHistory, t]);

  const stats = useMemo(() => ({
    totalChanges: priceHistory.length,
    increases: priceHistory.filter((r) => r.newPrice > r.oldPrice).length,
    decreases: priceHistory.filter((r) => r.newPrice < r.oldPrice).length,
    productsAffected: new Set(priceHistory.map((r) => r.productId)).size,
  }), [priceHistory]);

  const exportColumns = [
    { key: "date" as const, label: t("priceHistory.colDate") },
    { key: "productName" as const, label: t("priceHistory.colProduct") },
    { key: "sku" as const, label: "SKU" },
    { key: "oldCost" as const, label: t("priceHistory.colOldCost") },
    { key: "newCost" as const, label: t("priceHistory.colNewCost") },
    { key: "oldPrice" as const, label: t("priceHistory.colOldPrice") },
    { key: "newPrice" as const, label: t("priceHistory.colNewPrice") },
    { key: "changedBy" as const, label: t("priceHistory.colBy") },
    { key: "reason" as const, label: t("priceHistory.colReason") },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <History className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("priceHistory.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("priceHistory.subtitle")}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { exportToCSV(filtered, exportColumns, "historique-prix"); toast({ title: t("priceHistory.csvExported") }); }}>CSV</Button>
          <Button variant="outline" size="sm" onClick={() => { exportToExcel(filtered, exportColumns, "historique-prix"); toast({ title: t("priceHistory.excelExported") }); }}>Excel</Button>
          <Button variant="outline" size="sm" onClick={() => { exportToPDF(filtered, exportColumns, "historique-prix", t("priceHistory.pdfTitle")); toast({ title: t("priceHistory.pdfExported") }); }}>PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/50"><CardContent className="p-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("priceHistory.totalChanges")}</p>
          <p className="text-xl font-bold">{stats.totalChanges}</p>
        </CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><TrendingUp className="h-3 w-3 text-destructive" /> {t("priceHistory.increases")}</p>
          <p className="text-xl font-bold text-destructive">{stats.increases}</p>
        </CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><TrendingDown className="h-3 w-3 text-success" /> {t("priceHistory.decreases")}</p>
          <p className="text-xl font-bold text-success">{stats.decreases}</p>
        </CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("priceHistory.productsAffected")}</p>
          <p className="text-xl font-bold">{stats.productsAffected}</p>
        </CardContent></Card>
      </div>

      <div className="flex gap-3">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t("priceHistory.search")}
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm" />
        </div>
        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
          <SelectTrigger className="w-60"><SelectValue placeholder={t("priceHistory.allProducts")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("priceHistory.allProducts")}</SelectItem>
            {products.map((p: any) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProduct !== "all" && chartData.length > 0 && (
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-3">{t("priceHistory.chartTitle", { name: products.find((p: any) => p.id === selectedProduct)?.name })}</p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend />
                <Line type="monotone" dataKey={t("priceHistory.cost")} stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey={t("priceHistory.salePrice")} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey={t("priceHistory.margin")} stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("priceHistory.colDate")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("priceHistory.colProduct")}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">{t("priceHistory.colOldCost")}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">{t("priceHistory.colNewCost")}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">{t("priceHistory.colOldPrice")}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">{t("priceHistory.colNewPrice")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("priceHistory.colVariation")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("priceHistory.colBy")}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("priceHistory.colReason")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map((r) => {
              const priceDiff = r.newPrice - r.oldPrice;
              const pctChange = r.oldPrice > 0 ? ((priceDiff / r.oldPrice) * 100).toFixed(1) : "0";
              return (
                <tr key={r.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono">{r.date}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{r.productName}</p>
                    <p className="text-xs text-muted-foreground">{r.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">{currency(r.oldCost)}</td>
                  <td className="px-4 py-3 text-right text-xs font-medium">{currency(r.newCost)}</td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">{currency(r.oldPrice)}</td>
                  <td className="px-4 py-3 text-right text-xs font-medium">{currency(r.newPrice)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={priceDiff > 0 ? "text-destructive border-destructive/30" : priceDiff < 0 ? "text-success border-success/30" : "text-muted-foreground"}>
                      {priceDiff > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : priceDiff < 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : <Minus className="h-3 w-3 mr-1" />}
                      {priceDiff >= 0 ? "+" : ""}{pctChange}%
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs">{r.changedBy}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.reason}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}