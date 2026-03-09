import { useState } from "react";
import { useTranslation } from "react-i18next";
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

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function LotBatchPage() {
  const { t } = useTranslation();
  const { lotBatches } = useWMSData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [exportOpen, setExportOpen] = useState(false);

  const STATUS_CONFIG: Record<LotStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    Active: { label: t("lotBatch.statusActive"), variant: "default" },
    Quarantine: { label: t("lotBatch.statusQuarantine"), variant: "secondary" },
    Expired: { label: t("lotBatch.statusExpired"), variant: "destructive" },
    Recalled: { label: t("lotBatch.statusRecalled"), variant: "destructive" },
    Consumed: { label: t("lotBatch.statusConsumed"), variant: "outline" },
  };

  const lotExportCols: ExportColumn<typeof lotBatches[0]>[] = [
    { key: "lotNumber", label: t("lotBatch.lotNumber") }, { key: "productName", label: t("lotBatch.product") },
    { key: "vendorName", label: t("lotBatch.vendor") }, { key: "warehouseName", label: t("lotBatch.warehouse") },
    { key: "qty", label: t("lotBatch.qty") }, { key: "manufacturingDate", label: t("lotBatch.manufacturing") },
    { key: "expiryDate", label: t("lotBatch.expiry") }, { key: "qcStatus", label: t("lotBatch.qc") }, { key: "status", label: t("lotBatch.status") },
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
          <h1 className="text-2xl font-bold text-foreground">{t("lotBatch.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("lotBatch.subtitle")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setExportOpen(true)} className="gap-2"><Download className="h-4 w-4" /> {t("lotBatch.export")}</Button>
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
              <p className="text-xs text-muted-foreground">{t("lotBatch.activeLots")}</p>
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
              <p className="text-xs text-muted-foreground">{t("lotBatch.quarantine")}</p>
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
              <p className="text-xs text-muted-foreground">{t("lotBatch.expiredRecalled")}</p>
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
              <p className="text-xs text-muted-foreground">{t("lotBatch.nearExpiry")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <CardTitle className="text-lg">{t("lotBatch.registry")}</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t("lotBatch.searchPlaceholder")} className="pl-9 w-64" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("lotBatch.allStatuses")}</SelectItem>
                  <SelectItem value="Active">{t("lotBatch.statusActive")}</SelectItem>
                  <SelectItem value="Quarantine">{t("lotBatch.statusQuarantine")}</SelectItem>
                  <SelectItem value="Expired">{t("lotBatch.statusExpired")}</SelectItem>
                  <SelectItem value="Recalled">{t("lotBatch.statusRecalled")}</SelectItem>
                  <SelectItem value="Consumed">{t("lotBatch.statusConsumed")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("lotBatch.lotNumber")}</TableHead>
                <TableHead>{t("lotBatch.product")}</TableHead>
                <TableHead>{t("lotBatch.vendor")}</TableHead>
                <TableHead>{t("lotBatch.warehouse")}</TableHead>
                <TableHead className="text-right">{t("lotBatch.qty")}</TableHead>
                <TableHead>{t("lotBatch.manufacturing")}</TableHead>
                <TableHead>{t("lotBatch.expiry")}</TableHead>
                <TableHead>{t("lotBatch.daysRemaining")}</TableHead>
                <TableHead>{t("lotBatch.qc")}</TableHead>
                <TableHead>{t("lotBatch.status")}</TableHead>
                <TableHead className="text-right">{t("lotBatch.value")}</TableHead>
                <TableHead>{t("lotBatch.grn")}</TableHead>
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
                          {t("lotBatch.daysShort", { days })}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={lot.qcStatus === "Passed" ? "default" : lot.qcStatus === "Failed" ? "destructive" : "secondary"} className="text-xs">
                        {lot.qcStatus === "Passed" ? t("lotBatch.qcPassed") : lot.qcStatus === "Failed" ? t("lotBatch.qcFailed") : t("lotBatch.qcPending")}
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
                  <TableCell colSpan={12} className="text-center text-muted-foreground py-8">{t("lotBatch.noLotFound")}</TableCell>
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
