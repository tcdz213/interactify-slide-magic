import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { INSPECTION_CHECKLIST, vehicles } from "../data/mockDeliveryData";
import type { InspectionItem } from "../types/vehicle";

export default function VehicleCheckScreen() {
  const navigate = useNavigate();
  const authData = JSON.parse(localStorage.getItem("delivery_auth") || "{}");
  const vehicle = vehicles.find((v) => v.id === authData.vehicleId);
  const [checklist, setChecklist] = useState<InspectionItem[]>(
    INSPECTION_CHECKLIST.map((i) => ({ ...i }))
  );
  const [notes, setNotes] = useState("");

  const toggleItem = (key: string) => {
    setChecklist((prev) =>
      prev.map((i) => (i.key === key ? { ...i, checked: !i.checked } : i))
    );
  };

  const allChecked = checklist.every((i) => i.checked);
  const checkedCount = checklist.filter((i) => i.checked).length;

  const handleSubmit = () => {
    if (!allChecked) {
      toast({ title: "⚠️ Inspection incomplète", description: "Cochez tous les éléments", variant: "destructive" });
      return;
    }
    toast({ title: "✅ Inspection validée", description: "Bonne route !" });
    navigate("/delivery/trip", { replace: true });
  };

  return (
    <div className="min-h-[100dvh] bg-background p-4 space-y-4">
      <div>
        <h1 className="text-lg font-bold">Inspection véhicule</h1>
        <p className="text-xs text-muted-foreground">
          {vehicle?.plate} — {vehicle?.model}
        </p>
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Progression</span>
          <span className="font-medium">{checkedCount}/{checklist.length}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(checkedCount / checklist.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="rounded-xl border border-border bg-card divide-y divide-border/50">
        {checklist.map((item) => (
          <button
            key={item.key}
            onClick={() => toggleItem(item.key)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
          >
            <Checkbox checked={item.checked} />
            <span className={`text-sm ${item.checked ? "text-muted-foreground line-through" : "font-medium"}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Notes */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Notes</label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Remarques éventuelles..."
          rows={2}
        />
      </div>

      <Button onClick={handleSubmit} className="w-full min-h-14 text-base" disabled={!allChecked}>
        {allChecked ? "Valider ✅" : `Cocher les ${checklist.length - checkedCount} éléments restants`}
      </Button>
    </div>
  );
}
