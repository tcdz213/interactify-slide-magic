import { Eye, Pencil, DollarSign, ToggleLeft, ToggleRight, Trash2, ArrowRightLeft, Copy } from "lucide-react";
import type { Product } from "@/data/mockData";
import SortableHeader from "@/components/SortableHeader";
import ProductStockBadge from "@/components/ProductStockBadge";
import StatusBadge from "@/components/StatusBadge";
import { RBACGuard } from "@/components/RBACGuard";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface ProductTableProps {
  items: Product[];
  isVisible: (key: string) => boolean;
  sortKey: string;
  sortDir: "asc" | "desc";
  onSort: (key: string) => void;
  onView: (p: Product) => void;
  onEdit: (p: Product) => void;
  onPricing: (p: Product) => void;
  onToggle: (p: Product) => void;
  onDelete: (p: Product) => void;
  onUnits?: (p: Product) => void;
  onClone?: (p: Product) => void;
  subCatMap?: Map<string, string>;
}

export function ProductTable({ items, isVisible, sortKey, sortDir, onSort, onView, onEdit, onPricing, onToggle, onDelete, onUnits, onClone, subCatMap }: ProductTableProps) {
  const { unitsOfMeasure, productUnitConversions, productBaseUnits } = useWMSData();
  const { t } = useTranslation();

  const productMeta = useMemo(() => {
    const map = new Map<string, { baseLabel: string; convCount: number }>();
    items.forEach(p => {
      const bu = productBaseUnits.find(b => b.productId === p.id);
      let baseLabel = p.uom;
      if (p.baseUnitId) {
        const uom = unitsOfMeasure.find(u => u.id === p.baseUnitId);
        if (uom) baseLabel = uom.abbreviation;
      } else if (bu) {
        baseLabel = bu.baseUnitAbbreviation;
      }
      const convCount = productUnitConversions.filter(c => c.productId === p.id).length;
      map.set(p.id, { baseLabel, convCount });
    });
    return map;
  }, [items, unitsOfMeasure, productUnitConversions, productBaseUnits]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[700px]">
        <thead>
          <tr className="border-b border-border/50 bg-muted/30">
            {isVisible("sku") && <SortableHeader label={t("table.sku")} sortKey="sku" currentSortKey={sortKey} currentDirection={sortDir} onSort={onSort} />}
            {isVisible("name") && <SortableHeader label={t("table.name")} sortKey="name" currentSortKey={sortKey} currentDirection={sortDir} onSort={onSort} />}
            {isVisible("category") && <SortableHeader label={t("table.category")} sortKey="category" currentSortKey={sortKey} currentDirection={sortDir} onSort={onSort} />}
            {isVisible("subcategory") && <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("table.subCategory")}</th>}
            {isVisible("uom") && <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("table.baseUnit")}</th>}
            {isVisible("conversions") && <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("table.conversions")}</th>}
            {isVisible("stock") && <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("table.stockTotal")}</th>}
            {isVisible("status") && <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("table.status")}</th>}
            {isVisible("actions") && <th className="px-4 py-3 text-center font-medium text-muted-foreground" style={{ minWidth: 200 }}>{t("table.actions")}</th>}
          </tr>
        </thead>
        <tbody>
          {items.map(p => {
            const meta = productMeta.get(p.id);
            return (
              <tr key={p.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                {isVisible("sku") && <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>}
                {isVisible("name") && <td className="px-4 py-3 font-medium">{p.name}</td>}
                {isVisible("category") && <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{p.category}</span></td>}
                {isVisible("subcategory") && (
                  <td className="px-4 py-3">
                    {p.subcategoryId && subCatMap?.get(p.subcategoryId) ? (
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs">{subCatMap.get(p.subcategoryId)}</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                )}
                {isVisible("uom") && (
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold">{meta?.baseLabel ?? p.uom}</span>
                  </td>
                )}
                {isVisible("conversions") && (
                  <td className="px-4 py-3 text-center">
                    {(meta?.convCount ?? 0) > 0 ? (
                      <span className="inline-flex items-center justify-center min-w-[24px] rounded-full px-2 py-0.5 text-xs font-semibold bg-accent text-accent-foreground">{meta?.convCount}</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                )}
                {isVisible("stock") && <td className="px-4 py-3 text-center"><ProductStockBadge productId={p.id} /></td>}
                {isVisible("status") && <td className="px-4 py-3 text-center"><StatusBadge status={p.isActive ? "active" : "inactive"} /></td>}
                {isVisible("actions") && (
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onView(p)} className="p-1.5 rounded-md hover:bg-muted" title="Voir détails">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <RBACGuard permission="manage_products">
                        <button onClick={() => onEdit(p)} className="p-1.5 rounded-md hover:bg-muted" title="Modifier">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </RBACGuard>
                      <button onClick={() => onPricing(p)} className="p-1.5 rounded-md hover:bg-muted text-primary" title="Tarification">
                        <DollarSign className="h-3.5 w-3.5" />
                      </button>
                      {onUnits && (
                        <button onClick={() => onUnits(p)} className="p-1.5 rounded-md hover:bg-muted text-blue-600" title="Conversions d'unités">
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {/* Sprint 5: Clone button */}
                      <RBACGuard permission="manage_products">
                        {onClone && (
                          <button onClick={() => onClone(p)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" title="Cloner">
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button onClick={() => onToggle(p)} className={`p-1.5 rounded-md hover:bg-muted ${p.isActive ? "text-amber-600" : "text-emerald-600"}`} title={p.isActive ? "Désactiver" : "Activer"}>
                          {p.isActive ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={() => onDelete(p)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive" title="Archiver">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </RBACGuard>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
