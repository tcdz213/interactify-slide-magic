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

interface PriceRecord {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  date: string;
  oldCost: number;
  newCost: number;
  oldPrice: number;
  newPrice: number;
  changedBy: string;
  reason: string;
}

// Generate mock price history from products
function generatePriceHistory(products: any[]): PriceRecord[] {
  const records: PriceRecord[] = [];
  const dates = [
    "2025-12-01", "2025-12-15", "2026-01-01", "2026-01-15",
    "2026-02-01", "2026-02-10", "2026-02-20",
  ];
  const users = ["Karim Ben Ali", "Samir Rafik", "Hassan Nour", "Ahmed Mansour"];
  const reasons = ["Mise à jour fournisseur", "Ajustement marge", "Promotion", "Hausse matière première", "Négociation contrat"];

  products.forEach((p, pi) => {
    // Each product gets 2-4 price changes
    const changes = 2 + (pi % 3);
    let currentCost = p.unitCost * 0.85;
    let currentPrice = p.unitPrice * 0.9;

    for (let i = 0; i < changes; i++) {
      const factor = 1 + (Math.random() * 0.1 - 0.03);
      const newCost = Math.round(currentCost * factor);
      const newPrice = Math.round(currentPrice * factor);
      records.push({
        id: `PH-${p.id}-${i}`,
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        date: dates[i % dates.length],
        oldCost: Math.round(currentCost),
        newCost,
        oldPrice: Math.round(currentPrice),
        newPrice,
        changedBy: users[i % users.length],
        reason: reasons[(pi + i) % reasons.length],
      });
      currentCost = newCost;
      currentPrice = newPrice;
    }
  });

  return records.sort((a, b) => b.date.localeCompare(a.date));
}

export default function PriceHistoryPage() {
  const { products } = useWMSData();
  const priceHistory = useMemo(() => generatePriceHistory(products), [products]);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");

  const filtered = priceHistory.filter((r) => {
    if (selectedProduct !== "all" && r.productId !== selectedProduct) return false;
    if (search && !r.productName.toLowerCase().includes(search.toLowerCase()) && !r.sku.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Chart data for selected product
  const chartData = useMemo(() => {
    if (selectedProduct === "all") return [];
    const productRecords = priceHistory
      .filter((r) => r.productId === selectedProduct)
      .sort((a, b) => a.date.localeCompare(b.date));

    return productRecords.map((r) => ({
      date: r.date,
      "Coût": r.newCost,
      "Prix vente": r.newPrice,
      "Marge": r.newPrice - r.newCost,
    }));
  }, [selectedProduct, priceHistory]);

  const stats = useMemo(() => ({
    totalChanges: priceHistory.length,
    increases: priceHistory.filter((r) => r.newPrice > r.oldPrice).length,
    decreases: priceHistory.filter((r) => r.newPrice < r.oldPrice).length,
    productsAffected: new Set(priceHistory.map((r) => r.productId)).size,
  }), [priceHistory]);

  const exportColumns = [
    { key: "date" as const, label: "Date" },
    { key: "productName" as const, label: "Produit" },
    { key: "sku" as const, label: "SKU" },
    { key: "oldCost" as const, label: "Ancien coût" },
    { key: "newCost" as const, label: "Nouveau coût" },
    { key: "oldPrice" as const, label: "Ancien prix" },
    { key: "newPrice" as const, label: "Nouveau prix" },
    { key: "changedBy" as const, label: "Modifié par" },
    { key: "reason" as const, label: "Motif" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <History className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Historique des Prix</h1>
            <p className="text-sm text-muted-foreground">Suivi des changements de prix avec timestamps et motifs</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { exportToCSV(filtered, exportColumns, "historique-prix"); toast({ title: "CSV exporté" }); }}>CSV</Button>
          <Button variant="outline" size="sm" onClick={() => { exportToExcel(filtered, exportColumns, "historique-prix"); toast({ title: "Excel exporté" }); }}>Excel</Button>
          <Button variant="outline" size="sm" onClick={() => { exportToPDF(filtered, exportColumns, "historique-prix", "Historique des Prix"); toast({ title: "PDF exporté" }); }}>PDF</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/50"><CardContent className="p-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total changements</p>
          <p className="text-xl font-bold">{stats.totalChanges}</p>
        </CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><TrendingUp className="h-3 w-3 text-destructive" /> Hausses</p>
          <p className="text-xl font-bold text-destructive">{stats.increases}</p>
        </CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><TrendingDown className="h-3 w-3 text-success" /> Baisses</p>
          <p className="text-xl font-bold text-success">{stats.decreases}</p>
        </CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Produits affectés</p>
          <p className="text-xl font-bold">{stats.productsAffected}</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher produit…"
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm" />
        </div>
        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
          <SelectTrigger className="w-60"><SelectValue placeholder="Tous les produits" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les produits</SelectItem>
            {products.map((p: any) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Chart for selected product */}
      {selectedProduct !== "all" && chartData.length > 0 && (
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-3">Évolution des prix — {products.find((p: any) => p.id === selectedProduct)?.name}</p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend />
                <Line type="monotone" dataKey="Coût" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Prix vente" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Marge" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Produit</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Ancien coût</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Nouveau coût</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Ancien prix</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Nouveau prix</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Variation</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Par</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Motif</th>
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
