import { useState, useMemo } from "react";
import { ClipboardCheck, FileText, AlertTriangle, CheckCircle2, DollarSign, Truck, Package, RotateCcw, Download } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { currency } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { generateDailyClosingPDF } from "@/lib/pdfExport";

interface ClosingRecord {
  id: string;
  date: string;
  driverName: string;
  status: "open" | "pending_review" | "closed" | "discrepancy";
  cashExpected: number;
  cashCollected: number;
  chequesCollected: number;
  chequesCount: number;
  deliveriesTotal: number;
  deliveriesCompleted: number;
  returnsCount: number;
  truckStockStart: number;
  truckStockEnd: number;
  truckStockSold: number;
  discrepancies: string[];
}

const MOCK_CLOSINGS: ClosingRecord[] = [
  {
    id: "CLO-20260225-001", date: "2026-02-25", driverName: "Youcef Benmoussa", status: "open",
    cashExpected: 485000, cashCollected: 478500, chequesCollected: 320000, chequesCount: 3,
    deliveriesTotal: 8, deliveriesCompleted: 6, returnsCount: 1,
    truckStockStart: 450, truckStockEnd: 85, truckStockSold: 352,
    discrepancies: ["Écart espèces: -6,500 DZD", "Stock camion: 13 articles manquants (450 - 85 - 352 = 13)"],
  },
  {
    id: "CLO-20260224-002", date: "2026-02-24", driverName: "Rachid Khelifi", status: "closed",
    cashExpected: 620000, cashCollected: 620000, chequesCollected: 180000, chequesCount: 2,
    deliveriesTotal: 10, deliveriesCompleted: 10, returnsCount: 0,
    truckStockStart: 520, truckStockEnd: 0, truckStockSold: 520,
    discrepancies: [],
  },
  {
    id: "CLO-20260224-003", date: "2026-02-24", driverName: "Youcef Benmoussa", status: "discrepancy",
    cashExpected: 390000, cashCollected: 375000, chequesCollected: 250000, chequesCount: 4,
    deliveriesTotal: 7, deliveriesCompleted: 5, returnsCount: 2,
    truckStockStart: 380, truckStockEnd: 45, truckStockSold: 310,
    discrepancies: ["Écart espèces: -15,000 DZD", "Stock camion: 25 articles manquants", "2 retours non validés par manager"],
  },
  {
    id: "CLO-20260223-004", date: "2026-02-23", driverName: "Rachid Khelifi", status: "closed",
    cashExpected: 550000, cashCollected: 550000, chequesCollected: 400000, chequesCount: 5,
    deliveriesTotal: 12, deliveriesCompleted: 12, returnsCount: 0,
    truckStockStart: 600, truckStockEnd: 0, truckStockSold: 600,
    discrepancies: [],
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open: { label: "Ouvert", color: "bg-info/10 text-info border-info/20", icon: ClipboardCheck },
  pending_review: { label: "En revue", color: "bg-warning/10 text-warning border-warning/20", icon: AlertTriangle },
  closed: { label: "Clôturé", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  discrepancy: { label: "Écart", color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
};

export default function DailyClosingPage() {
  const { salesOrders, deliveryTrips } = useWMSData();
  const [closings, setClosings] = useState<ClosingRecord[]>(MOCK_CLOSINGS);
  const [filterDate, setFilterDate] = useState<string>("all");
  const [filterDriver, setFilterDriver] = useState<string>("all");

  const uniqueDates = [...new Set(closings.map((c) => c.date))].sort().reverse();
  const uniqueDrivers = [...new Set(closings.map((c) => c.driverName))];

  const filtered = closings.filter((c) => {
    if (filterDate !== "all" && c.date !== filterDate) return false;
    if (filterDriver !== "all" && c.driverName !== filterDriver) return false;
    return true;
  });

  const stats = useMemo(() => ({
    total: closings.length,
    open: closings.filter((c) => c.status === "open").length,
    closed: closings.filter((c) => c.status === "closed").length,
    withDiscrepancy: closings.filter((c) => c.status === "discrepancy" || c.discrepancies.length > 0).length,
    totalCash: closings.reduce((s, c) => s + c.cashCollected, 0),
    totalCheques: closings.reduce((s, c) => s + c.chequesCollected, 0),
  }), [closings]);

  const closeDay = (id: string) => {
    setClosings((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const hasDisc = c.discrepancies.length > 0;
        return { ...c, status: hasDisc ? "discrepancy" : "closed" };
      })
    );
    toast({ title: "Clôture validée", description: `${id} — journée clôturée` });
  };

  const downloadPDF = (closing: ClosingRecord) => {
    const deliveries = Array.from({ length: closing.deliveriesTotal }, (_, i) => ({
      client: `Client ${i + 1}`,
      amount: Math.round(closing.cashExpected / closing.deliveriesTotal),
      status: i < closing.deliveriesCompleted ? "Livré" : "En attente",
      paymentMethod: i % 3 === 0 ? "Chèque" : "Espèces",
    }));

    const returns = Array.from({ length: closing.returnsCount }, (_, i) => ({
      product: `Produit retourné ${i + 1}`,
      qty: Math.floor(Math.random() * 10) + 1,
      reason: i % 2 === 0 ? "Produit endommagé" : "Erreur de commande",
    }));

    generateDailyClosingPDF({
      date: closing.date,
      driverName: closing.driverName,
      deliveries,
      cashCollected: closing.cashCollected,
      cashExpected: closing.cashExpected,
      chequesCollected: closing.chequesCollected,
      chequesCount: closing.chequesCount,
      returns,
      truckStockStart: closing.truckStockStart,
      truckStockEnd: closing.truckStockEnd,
      truckStockSold: closing.truckStockSold,
      discrepancies: closing.discrepancies,
    });

    toast({ title: "PDF généré", description: `Rapport clôture ${closing.date} — ${closing.driverName}` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ClipboardCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Clôture Quotidienne</h1>
            <p className="text-sm text-muted-foreground">Réconciliation cash, stock camion, chèques et rapport PDF</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total clôtures</p>
            <p className="text-xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Ouvertes</p>
            <p className="text-xl font-bold text-info">{stats.open}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Clôturées</p>
            <p className="text-xl font-bold text-success">{stats.closed}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Avec écarts</p>
            <p className="text-xl font-bold text-destructive">{stats.withDiscrepancy}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total espèces</p>
            <p className="text-lg font-bold">{currency(stats.totalCash)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total chèques</p>
            <p className="text-lg font-bold">{currency(stats.totalCheques)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={filterDate} onValueChange={setFilterDate}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filtrer par date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les dates</SelectItem>
            {uniqueDates.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterDriver} onValueChange={setFilterDriver}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Filtrer par chauffeur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les chauffeurs</SelectItem>
            {uniqueDrivers.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Closing Records */}
      <div className="space-y-4">
        {filtered.map((closing) => {
          const sc = statusConfig[closing.status];
          const cashDiff = closing.cashCollected - closing.cashExpected;
          const stockDiff = closing.truckStockStart - closing.truckStockEnd - closing.truckStockSold;

          return (
            <Card key={closing.id} className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base font-mono">{closing.id}</CardTitle>
                    <Badge variant="outline" className={sc.color}>
                      <sc.icon className="h-3 w-3 mr-1" />
                      {sc.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => downloadPDF(closing)}>
                      <Download className="h-3 w-3 mr-1" /> PDF
                    </Button>
                    {closing.status === "open" && (
                      <Button size="sm" onClick={() => closeDay(closing.id)}>
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Clôturer
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{closing.date} — {closing.driverName}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {/* Cash */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <DollarSign className="h-3 w-3" /> Espèces
                    </div>
                    <p className="text-sm font-medium">{currency(closing.cashCollected)} / {currency(closing.cashExpected)}</p>
                    <p className={`text-xs font-medium ${cashDiff === 0 ? "text-success" : "text-destructive"}`}>
                      Écart: {cashDiff >= 0 ? "+" : ""}{currency(cashDiff)}
                    </p>
                  </div>
                  {/* Cheques */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" /> Chèques
                    </div>
                    <p className="text-sm font-medium">{currency(closing.chequesCollected)}</p>
                    <p className="text-xs text-muted-foreground">{closing.chequesCount} chèque(s)</p>
                  </div>
                  {/* Deliveries */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Truck className="h-3 w-3" /> Livraisons
                    </div>
                    <p className="text-sm font-medium">{closing.deliveriesCompleted} / {closing.deliveriesTotal}</p>
                    <p className="text-xs text-muted-foreground">{closing.returnsCount} retour(s)</p>
                  </div>
                  {/* Truck Stock */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Package className="h-3 w-3" /> Stock camion
                    </div>
                    <p className="text-sm font-medium">{closing.truckStockStart} → {closing.truckStockEnd}</p>
                    <p className={`text-xs font-medium ${stockDiff === 0 ? "text-success" : "text-destructive"}`}>
                      {stockDiff === 0 ? "✓ Conforme" : `${stockDiff} articles manquants`}
                    </p>
                  </div>
                </div>

                {/* Discrepancies */}
                {closing.discrepancies.length > 0 && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                    <p className="text-xs font-semibold text-destructive flex items-center gap-1 mb-1">
                      <AlertTriangle className="h-3 w-3" /> Écarts détectés
                    </p>
                    <ul className="space-y-1">
                      {closing.discrepancies.map((d, i) => (
                        <li key={i} className="text-xs text-destructive/80">• {d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
