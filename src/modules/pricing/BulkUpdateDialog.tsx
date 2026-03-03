import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currency } from "@/data/masterData";
import { calcMargin } from "./pricing.types";
import { MarginBadge } from "./MarginBadge";

interface PreviewItem {
  name: string;
  sku: string;
  currentPrice: number;
  cost: number;
}

interface BulkUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onApply: (percentChange: number) => void;
  previewData?: PreviewItem[];
}

export function BulkUpdateDialog({ open, onOpenChange, selectedCount, onApply, previewData = [] }: BulkUpdateDialogProps) {
  const [pct, setPct] = useState<string>("5");

  const pctVal = parseFloat(pct);
  const isValid = !isNaN(pctVal);

  const preview = useMemo(() => {
    if (!isValid || previewData.length === 0) return [];
    return previewData.map(item => {
      const newPrice = Math.round(item.currentPrice * (1 + pctVal / 100));
      return {
        ...item,
        newPrice,
        oldMargin: calcMargin(item.currentPrice, item.cost),
        newMargin: calcMargin(newPrice, item.cost),
      };
    });
  }, [previewData, pctVal, isValid]);

  const handleApply = () => {
    if (!isValid) return;
    onApply(pctVal);
    onOpenChange(false);
    setPct("5");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Mise à jour en masse</DialogTitle>
          <DialogDescription>{selectedCount} prix sélectionnés</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label>Variation en pourcentage (%)</Label>
          <Input
            type="number"
            value={pct}
            onChange={(e) => setPct(e.target.value)}
            placeholder="Ex: 5 pour +5%, -3 pour -3%"
          />
          <p className="text-xs text-muted-foreground">
            Positif = augmentation, négatif = réduction. Les prix mis à jour passeront en statut "En attente".
          </p>
        </div>

        {/* Preview table */}
        {preview.length > 0 && (
          <div className="flex-1 overflow-auto border rounded-lg mt-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Produit</th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground">Ancien prix</th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground">Nouveau prix</th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground">Marge</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((item, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="px-3 py-2">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-muted-foreground font-mono">{item.sku}</div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{currency(item.currentPrice)}</td>
                    <td className="px-3 py-2 text-right font-mono">
                      <span className={item.newPrice > item.currentPrice ? "text-emerald-600" : item.newPrice < item.currentPrice ? "text-destructive" : ""}>
                        {currency(item.newPrice)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <MarginBadge unitPrice={item.newPrice} cost={item.cost} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 10 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                + {preview.length - 10} autres produit(s)
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleApply} disabled={!isValid}>Appliquer ({pct}%)</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
