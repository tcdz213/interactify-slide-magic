import { useState, useMemo } from "react";
import { ScrollText, Search, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, ChevronDown, ChevronUp, Download } from "lucide-react";
import { DateFilter } from "@/components/DateFilter";
import { useWMSData } from "@/contexts/WMSDataContext";
import type { StockMovement, MovementType } from "@/data/mockData";
import { MOVEMENT_TYPE_LABELS } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import { WarehouseScopeBanner } from "@/components/WarehouseScopeBanner";
import { useWarehouseScope } from "@/hooks/useWarehouseScope";
import ExportDialog from "@/components/ExportDialog";
import type { ExportColumn } from "@/lib/exportUtils";

const DIRECTION_ICON: Record<string, React.ElementType> = {
  In: ArrowDownLeft,
  Out: ArrowUpRight,
  Internal: ArrowLeftRight,
};

const DIRECTION_STYLE: Record<string, string> = {
  In: "text-success",
  Out: "text-destructive",
  Internal: "text-info",
};

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Tous les types" },
  { value: "GRN_Receipt", label: "Réception GRN" },
  { value: "Putaway", label: "Rangement" },
  { value: "Transfer_Out", label: "Transfert sortant" },
  { value: "Transfer_In", label: "Transfert entrant" },
  { value: "Adjustment_Increase", label: "Ajustement (+)" },
  { value: "Adjustment_Decrease", label: "Ajustement (−)" },
  { value: "Picking", label: "Prélèvement" },
  { value: "Return_In", label: "Retour entrant" },
  { value: "Return_Out", label: "Retour sortant" },
  { value: "QC_Quarantine", label: "Quarantaine QC" },
  { value: "QC_Release", label: "Libération QC" },
];

interface ExportRow {
  ID: string;
  Date: string;
  Type: string;
  Référence: string;
  Produit: string;
  Lot: string;
  Entrepôt: string;
  De: string;
  Vers: string;
  Quantité: number;
  Direction: string;
  Par: string;
  Notes: string;
}

const EXPORT_COLUMNS: ExportColumn<ExportRow>[] = [
  { key: "ID", label: "ID" }, { key: "Date", label: "Date" }, { key: "Type", label: "Type" },
  { key: "Référence", label: "Référence" }, { key: "Produit", label: "Produit" }, { key: "Lot", label: "Lot" },
  { key: "Entrepôt", label: "Entrepôt" }, { key: "De", label: "De" }, { key: "Vers", label: "Vers" },
  { key: "Quantité", label: "Quantité" }, { key: "Direction", label: "Direction" }, { key: "Par", label: "Par" },
  { key: "Notes", label: "Notes" },
];

export default function MovementJournalPage() {
  const { stockMovements, warehouses } = useWMSData();
  const { operationalWarehouseIds } = useWarehouseScope();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDirection, setFilterDirection] = useState("all");
  const [filterWh, setFilterWh] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [exportOpen, setExportOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = stockMovements.filter((m) => {
      if (filterType !== "all" && m.movementType !== filterType) return false;
      if (filterDirection !== "all" && m.direction !== filterDirection) return false;
      if (filterWh !== "all" && m.warehouseId !== filterWh) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!m.id.toLowerCase().includes(q) && !m.productName.toLowerCase().includes(q) && !m.referenceId.toLowerCase().includes(q) && !m.performedBy.toLowerCase().includes(q)) return false;
      }
      if (dateFrom || dateTo) {
        const d = m.timestamp.split(" ")[0] ?? "";
        if (dateFrom && d < dateFrom) return false;
        if (dateTo && d > dateTo) return false;
      }
      return true;
    });
    const mult = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => mult * a.timestamp.localeCompare(b.timestamp));
    return list;
  }, [stockMovements, filterType, filterDirection, filterWh, search, dateFrom, dateTo, sortDir]);

  const stats = useMemo(() => ({
    totalIn: filtered.filter(m => m.direction === "In").reduce((s, m) => s + m.qty, 0),
    totalOut: filtered.filter(m => m.direction === "Out").reduce((s, m) => s + m.qty, 0),
    totalInternal: filtered.filter(m => m.direction === "Internal").reduce((s, m) => s + m.qty, 0),
    count: filtered.length,
  }), [filtered]);

  const exportRows = useMemo<ExportRow[]>(() => filtered.map(m => ({
    ID: m.id,
    Date: m.timestamp,
    Type: MOVEMENT_TYPE_LABELS[m.movementType],
    Référence: m.referenceId,
    Produit: m.productName,
    Lot: m.batchNumber ?? "",
    Entrepôt: m.warehouseName,
    De: m.fromLocationId ?? "",
    Vers: m.toLocationId ?? "",
    Quantité: m.qty,
    Direction: m.direction,
    Par: m.performedBy,
    Notes: m.notes,
  })), [filtered]);

  return (
    <div className="space-y-6 animate-fade-in">
      <WarehouseScopeBanner />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ScrollText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Journal des Mouvements</h1>
            <p className="text-sm text-muted-foreground">Traçabilité complète de tous les mouvements stock</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setExportOpen(true)} className="gap-1">
          <Download className="h-4 w-4" /> Exporter
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total mouvements</p>
          <p className="text-xl font-semibold">{stats.count}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><ArrowDownLeft className="h-3.5 w-3.5 text-success" /> Entrées</p>
          <p className="text-xl font-semibold text-success">{stats.totalIn.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><ArrowUpRight className="h-3.5 w-3.5 text-destructive" /> Sorties</p>
          <p className="text-xl font-semibold text-destructive">{stats.totalOut.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><ArrowLeftRight className="h-3.5 w-3.5 text-info" /> Internes</p>
          <p className="text-xl font-semibold text-info">{stats.totalInternal.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Rechercher mouvement, produit, réf..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <DateFilter value={dateFrom} onChange={setDateFrom} placeholder="Date début" />
        <DateFilter value={dateTo} onChange={setDateTo} placeholder="Date fin" />
        <select value={filterWh} onChange={(e) => setFilterWh(e.target.value)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
          <option value="all">Tous les entrepôts</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
          {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={filterDirection} onChange={(e) => setFilterDirection(e.target.value)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
          <option value="all">Toutes directions</option>
          <option value="In">Entrées</option>
          <option value="Out">Sorties</option>
          <option value="Internal">Internes</option>
        </select>
        <button type="button" onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")} className="h-9 px-2 rounded-lg border border-input bg-muted/50">
          {sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-3 py-3 text-left font-medium text-muted-foreground text-xs">Date</th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground text-xs">ID</th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground text-xs">Type</th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground text-xs">Réf.</th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground text-xs">Produit</th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground text-xs">Entrepôt</th>
                <th className="px-3 py-3 text-center font-medium text-muted-foreground text-xs">De → Vers</th>
                <th className="px-3 py-3 text-right font-medium text-muted-foreground text-xs">Qté</th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground text-xs">Par</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const DirIcon = DIRECTION_ICON[m.direction] ?? ArrowLeftRight;
                return (
                  <tr key={m.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{m.timestamp}</td>
                    <td className="px-3 py-2.5 font-mono text-xs">{m.id}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1 text-xs">
                        <DirIcon className={`h-3.5 w-3.5 ${DIRECTION_STYLE[m.direction]}`} />
                        {MOVEMENT_TYPE_LABELS[m.movementType]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{m.referenceId}</td>
                    <td className="px-3 py-2.5 text-sm font-medium">{m.productName}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{m.warehouseName}</td>
                    <td className="px-3 py-2.5 text-center text-xs text-muted-foreground">
                      {m.fromLocationId ?? "—"} → {m.toLocationId ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold">{m.qty.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{m.performedBy}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <ScrollText className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="font-medium">Aucun mouvement trouvé</p>
            <p className="text-sm mt-1">Ajustez vos filtres pour afficher des résultats.</p>
          </div>
        )}
      </div>

      {/* Export Dialog (CSV + Excel) */}
      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        data={exportRows}
        columns={EXPORT_COLUMNS}
        filename="journal-mouvements"
        dateKey="Date"
      />
    </div>
  );
}
