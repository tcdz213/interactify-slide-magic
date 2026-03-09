/**
 * R3 — Reusable unit selector for stock operations.
 * Shows available units for a product and displays the base-unit equivalent.
 */
import { useMemo } from "react";
import { useUnitConversion, type UnitOption } from "@/hooks/useUnitConversion";
import { formSelectClass } from "@/components/ui/form-field";

interface UnitSelectorProps {
  productId: string;
  mode?: "buy" | "sell";
  selectedUnitId: string;
  onUnitChange: (unitId: string, unit: UnitOption) => void;
  qty?: number;
  showBaseEquiv?: boolean;
  className?: string;
}

export default function UnitSelector({
  productId,
  mode = "buy",
  selectedUnitId,
  onUnitChange,
  qty,
  showBaseEquiv = true,
  className,
}: UnitSelectorProps) {
  const { getUnitsForProduct, getBaseUnitAbbr } = useUnitConversion();
  const units = useMemo(() => getUnitsForProduct(productId, mode), [productId, mode, getUnitsForProduct]);
  const baseAbbr = getBaseUnitAbbr(productId);

  const selected = units.find(u => u.id === selectedUnitId) ?? units[0];
  const baseEquiv = selected && qty ? qty * selected.conversionFactor : null;

  if (units.length <= 1) return null;

  return (
    <div className={className}>
      <select
        value={selectedUnitId || units[0]?.id || ""}
        onChange={e => {
          const u = units.find(u => u.id === e.target.value);
          if (u) onUnitChange(u.id, u);
        }}
        className={formSelectClass}
      >
        {units.map(u => (
          <option key={u.id} value={u.id}>
            {u.unitAbbreviation} ({u.conversionFactor === 1 ? "base" : `×${u.conversionFactor}`})
          </option>
        ))}
      </select>
      {showBaseEquiv && baseEquiv !== null && baseEquiv > 0 && selected && !selected.isStockUnit && (
        <p className="text-[10px] text-muted-foreground mt-0.5">
          = {baseEquiv.toLocaleString("fr-FR")} {baseAbbr}
        </p>
      )}
    </div>
  );
}

/** Hook helper: get conversion factor for a unit ID from product units */
export function useUnitFactor(productId: string, unitId: string, mode: "buy" | "sell" = "buy"): number {
  const { getUnitsForProduct } = useUnitConversion();
  const units = useMemo(() => getUnitsForProduct(productId, mode), [productId, mode, getUnitsForProduct]);
  const unit = units.find(u => u.id === unitId);
  return unit?.conversionFactor ?? 1;
}
