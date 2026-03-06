import { Search } from "lucide-react";
import ColumnToggle, { type ColumnDef } from "@/components/ColumnToggle";
import type { Sector, SubCategory } from "@/data/masterData";
import { useTranslation } from "react-i18next";

interface ProductFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  filterSector: string;
  onFilterSectorChange: (v: string) => void;
  filterWh: string;
  onFilterWhChange: (v: string) => void;
  filterCat: string;
  onFilterCatChange: (v: string) => void;
  filterSubCat: string;
  onFilterSubCatChange: (v: string) => void;
  filterStatus: string;
  onFilterStatusChange: (v: string) => void;
  warehouses: { id: string; name: string }[];
  categories: string[];
  sectors: Sector[];
  subCategories: SubCategory[];
  columns: ColumnDef[];
  visible: Set<string>;
  onToggle: (key: string) => void;
}

export function ProductFilterBar({
  search, onSearchChange,
  filterSector, onFilterSectorChange,
  filterWh, onFilterWhChange,
  filterCat, onFilterCatChange,
  filterSubCat, onFilterSubCatChange,
  filterStatus, onFilterStatusChange,
  warehouses, categories, sectors, subCategories,
  columns, visible, onToggle,
}: ProductFilterBarProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute inset-inline-start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="text" placeholder={t("productPage.searchPlaceholder")} value={search} onChange={e => onSearchChange(e.target.value)}
          className="h-9 w-full rounded-lg border border-input bg-muted/50 ps-9 pe-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
      </div>
      <select value={filterSector} onChange={e => { onFilterSectorChange(e.target.value); onFilterCatChange("all"); onFilterSubCatChange("all"); }} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
        <option value="all">{t("productPage.allSectors")}</option>
        {sectors.filter(s => s.status === "Active").map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
      </select>
      <select value={filterCat} onChange={e => { onFilterCatChange(e.target.value); onFilterSubCatChange("all"); }} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
        <option value="all">{t("productPage.allCategories")}</option>
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={filterSubCat} onChange={e => onFilterSubCatChange(e.target.value)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
        <option value="all">{t("productPage.allSubCategories")}</option>
        {subCategories.filter(sc => sc.status === "Active").map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
      </select>
      <select value={filterWh} onChange={e => onFilterWhChange(e.target.value)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
        <option value="all">{t("productPage.allWarehouses")}</option>
        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
      </select>
      <select value={filterStatus} onChange={e => onFilterStatusChange(e.target.value)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
        <option value="all">{t("productPage.allStatuses")}</option>
        <option value="active">{t("productPage.active")}</option>
        <option value="inactive">{t("productPage.inactive")}</option>
      </select>
      <ColumnToggle columns={columns} visible={visible} onToggle={onToggle} />
    </div>
  );
}