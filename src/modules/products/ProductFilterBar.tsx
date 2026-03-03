import { Search } from "lucide-react";
import ColumnToggle, { type ColumnDef } from "@/components/ColumnToggle";

interface ProductFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  filterWh: string;
  onFilterWhChange: (v: string) => void;
  filterCat: string;
  onFilterCatChange: (v: string) => void;
  filterStatus: string;
  onFilterStatusChange: (v: string) => void;
  warehouses: { id: string; name: string }[];
  categories: string[];
  columns: ColumnDef[];
  visible: Set<string>;
  onToggle: (key: string) => void;
}

export function ProductFilterBar({
  search, onSearchChange, filterWh, onFilterWhChange, filterCat, onFilterCatChange,
  filterStatus, onFilterStatusChange, warehouses, categories, columns, visible, onToggle,
}: ProductFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="text" placeholder="Rechercher par nom ou SKU..." value={search} onChange={e => onSearchChange(e.target.value)}
          className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
      </div>
      <select value={filterWh} onChange={e => onFilterWhChange(e.target.value)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
        <option value="all">Tous les entrepôts</option>
        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
      </select>
      <select value={filterCat} onChange={e => onFilterCatChange(e.target.value)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
        <option value="all">Toutes catégories</option>
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={filterStatus} onChange={e => onFilterStatusChange(e.target.value)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
        <option value="all">Tous statuts</option>
        <option value="active">Actif</option>
        <option value="inactive">Inactif</option>
      </select>
      <ColumnToggle columns={columns} visible={visible} onToggle={onToggle} />
    </div>
  );
}
