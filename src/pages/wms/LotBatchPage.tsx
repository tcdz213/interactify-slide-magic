import { useState } from "react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Package, AlertTriangle, ShieldOff, Clock, CheckCircle, Download } from "lucide-react";
import type { LotStatus } from "@/data/mockData";
import { currency } from "@/data/mockData";
import ExportDialog from "@/components/ExportDialog";
import type { ExportColumn } from "@/lib/exportUtils";

const STATUS_CONFIG: Record<LotStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  Active: { label: "Actif", variant: "default" },
  Quarantine: { label: "Quarantaine", variant: "secondary" },
  Expired: { label: "Expiré", variant: "destructive" },
  Recalled: { label: "Rappelé", variant: "destructive" },
  Consumed: { label: "Consommé", variant: "outline" },
};

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function LotBatchPage() {
  const { lotBatches } = useWMSData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [exportOpen, setExportOpen] = useState(false);

  const lotExportCols: ExportColumn<typeof lotBatches[0]>[] = [
    { key: "lotNumber", label: "N° Lot" }, { key: "productName", label: "Produit" },
    { key: "vendorName", label: "Fournisseur" }, { key: "warehouseName", label: "Entrepôt" },
    { key: "qty", label: "Quantité" }, { key: "manufacturingDate", label: "Fabrication" },
    { key: "expiryDate", label: "DLC" }, { key: "qcStatus", label: "QC" }, { key: "status", label: "Statut" },
  ];

  const filtered = lotBatches.filter((lot) => {
    const matchSearch = !search || lot.lotNumber.toLowerCase().includes(search.toLowerCase()) || lot.productName.toLowerCase().includes(search.toLowerCase()) || lot.vendorName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || lot.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeLots = lotBatches.filter((l) => l.status === "Active").length;
  const quarantineLots = lotBatches.filter((l) => l.status === "Quarantine").length;
  const expiredLots = lotBatches.filter((l) => l.status === "Expired" || l.status === "Recalled").length;
  const nearExpiry = lotBatches.filter((l) => l.status === "Active" && daysUntil(l.expiryDate) <= 30 && daysUntil(l.expiryDate) > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Lots / Batch</h1>
          <p className="text-muted-foreground text-sm">Traçabilité complète des lots — DLC, fournisseur, QC, statut</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setExportOpen(true)} className="gap-2"><Download className="h-4 w-4" /> Exporter</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeLots}</p>
              <p className="text-xs text-muted-foreground">Lots actifs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
              <ShieldOff className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{quarantineLots}</p>
              <p className="text-xs text-muted-foreground">En quarantaine</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{expiredLots}</p>
              <p className="text-xs text-muted-foreground">Expirés / Rappelés</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{nearExpiry}</p>
              <p className="text-xs text-muted-foreground">DLC &lt; 30 jours</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <CardTitle className="text-lg">Registre des lots</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher lot, produit, fournisseur…" className="pl-9 w-64" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="Active">Actif</SelectItem>
                  <SelectItem value="Quarantine">Quarantaine</SelectItem>
                  <SelectItem value="Expired">Expiré</SelectItem>
                  <SelectItem value="Recalled">Rappelé</SelectItem>
                  <SelectItem value="Consumed">Consommé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Lot</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Entrepôt</TableHead>
                <TableHead className="text-right">Qté</TableHead>
                <TableHead>Fabrication</TableHead>
                <TableHead>DLC</TableHead>
                <TableHead>Jours restants</TableHead>
                <TableHead>QC</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Valeur</TableHead>
                <TableHead>GRN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lot) => {
                const days = daysUntil(lot.expiryDate);
                const cfg = STATUS_CONFIG[lot.status];
                return (
                  <TableRow key={lot.id}>
                    <TableCell className="font-mono text-xs">{lot.lotNumber}</TableCell>
                    <TableCell className="font-medium">{lot.productName}</TableCell>
                    <TableCell>{lot.vendorName}</TableCell>
                    <TableCell className="text-xs">{lot.warehouseName}</TableCell>
                    <TableCell className="text-right font-medium">{lot.qty}</TableCell>
                    <TableCell className="text-xs">{lot.manufacturingDate}</TableCell>
                    <TableCell className="text-xs">{lot.expiryDate}</TableCell>
                    <TableCell>
                      {lot.status === "Active" ? (
                        <Badge variant={days <= 7 ? "destructive" : days <= 30 ? "secondary" : "outline"} className="text-xs">
                          {days}j
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={lot.qcStatus === "Passed" ? "default" : lot.qcStatus === "Failed" ? "destructive" : "secondary"} className="text-xs">
                        {lot.qcStatus === "Passed" ? "OK" : lot.qcStatus === "Failed" ? "Échoué" : "En attente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-xs">{currency(lot.qty * ((lot as any).unitCost ?? 0))}</TableCell>
                    <TableCell className="font-mono text-xs">{lot.grnId}</TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} className="text-center text-muted-foreground py-8">Aucun lot trouvé</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} data={filtered} columns={lotExportCols} filename="lots-batch" statusKey="status" statusOptions={["Active", "Quarantine", "Expired", "Recalled", "Consumed"]} />
    </div>
  );
}
