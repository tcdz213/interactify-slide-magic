import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { portalOrders } from "../data/mockPortalData";
import type { ReturnItemReason } from "../types/portal";

const REASONS: { value: ReturnItemReason; label: string }[] = [
  { value: "damaged", label: "Produit abîmé" },
  { value: "expired", label: "Produit périmé" },
  { value: "wrong_product", label: "Mauvais produit" },
  { value: "quality_issue", label: "Problème qualité" },
  { value: "not_ordered", label: "Non commandé" },
  { value: "other", label: "Autre" },
];

export default function ReturnRequestScreen() {
  const navigate = useNavigate();
  const deliveredOrders = portalOrders.filter((o) => o.status === "Delivered");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedItems, setSelectedItems] = useState<Record<string, { selected: boolean; qty: number; reason: ReturnItemReason }>>({});
  const [comment, setComment] = useState("");

  const selectedOrder = deliveredOrders.find((o) => o.id === selectedOrderId);

  const handleToggleItem = (productId: string, orderedQty: number) => {
    setSelectedItems((prev) => {
      const existing = prev[productId];
      if (existing?.selected) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: { selected: true, qty: 1, reason: "damaged" } };
    });
  };

  const handleSubmit = () => {
    const items = Object.entries(selectedItems).filter(([, v]) => v.selected);
    if (items.length === 0) {
      toast({ title: "Sélectionnez au moins un article", variant: "destructive" });
      return;
    }
    toast({ title: "✅ Demande de retour soumise", description: `${items.length} article(s) — en attente de validation` });
    navigate("/portal/orders");
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Demande de retour</h1>
      </div>

      {/* Order select */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Commande</label>
        <Select value={selectedOrderId} onValueChange={(v) => { setSelectedOrderId(v); setSelectedItems({}); }}>
          <SelectTrigger><SelectValue placeholder="Sélectionner une commande" /></SelectTrigger>
          <SelectContent>
            {deliveredOrders.map((o) => (
              <SelectItem key={o.id} value={o.id}>{o.id} — {new Date(o.createdAt).toLocaleDateString("fr-FR")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Items */}
      {selectedOrder && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Articles à retourner :</p>
          {selectedOrder.lines.map((line) => {
            const item = selectedItems[line.productId];
            return (
              <div key={line.productId} className="rounded-xl border border-border bg-card p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={!!item?.selected}
                    onCheckedChange={() => handleToggleItem(line.productId, line.qty)}
                  />
                  <span className="text-sm">{line.productName} x{line.qty}</span>
                </div>
                {item?.selected && (
                  <div className="pl-6 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground">Qté:</label>
                      <input
                        type="number"
                        min={1}
                        max={line.qty}
                        value={item.qty}
                        onChange={(e) => setSelectedItems((prev) => ({
                          ...prev,
                          [line.productId]: { ...prev[line.productId], qty: Math.min(Number(e.target.value), line.qty) },
                        }))}
                        className="w-16 h-7 rounded border border-border px-2 text-xs bg-background"
                      />
                    </div>
                    <Select
                      value={item.reason}
                      onValueChange={(v) => setSelectedItems((prev) => ({
                        ...prev,
                        [line.productId]: { ...prev[line.productId], reason: v as ReturnItemReason },
                      }))}
                    >
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {REASONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Comment */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Commentaire</label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Décrivez le problème..."
          rows={3}
        />
      </div>

      <Button onClick={handleSubmit} className="w-full" disabled={!selectedOrderId}>
        Soumettre demande ✅
      </Button>
    </div>
  );
}
