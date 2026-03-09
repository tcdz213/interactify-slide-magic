import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Subscriber, SubscriptionPlan } from "../types/owner";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Check } from "lucide-react";
import { useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriber: Subscriber | null;
  direction: "upgrade" | "downgrade";
  onConfirm: (subscriberId: string, newPlan: SubscriptionPlan) => void;
}

const PLAN_ORDER: SubscriptionPlan[] = ["trial", "standard", "pro", "enterprise"];

const PLAN_INFO: Record<SubscriptionPlan, { label: string; fee: number; desc: string }> = {
  trial: { label: "Trial", fee: 0, desc: "Gratuit · 30j · 1 entrepôt · 3 users" },
  standard: { label: "Standard", fee: 45_000, desc: "45,000 DZD/mois · 1 entrepôt · 10 users" },
  pro: { label: "Pro", fee: 85_000, desc: "85,000 DZD/mois · 3 entrepôts · 25 users" },
  enterprise: { label: "Enterprise", fee: 150_000, desc: "150,000 DZD/mois · Illimité" },
};

export default function ChangePlanDialog({ open, onOpenChange, subscriber, direction, onConfirm }: Props) {
  const [selected, setSelected] = useState<SubscriptionPlan | null>(null);

  if (!subscriber) return null;

  const currentIdx = PLAN_ORDER.indexOf(subscriber.plan);
  const options = direction === "upgrade"
    ? PLAN_ORDER.slice(currentIdx + 1)
    : PLAN_ORDER.slice(0, currentIdx);

  const handleConfirm = () => {
    if (selected) {
      onConfirm(subscriber.id, selected);
      setSelected(null);
      onOpenChange(false);
    }
  };

  const isUpgrade = direction === "upgrade";

  return (
    <Dialog open={open} onOpenChange={(v) => { setSelected(null); onOpenChange(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isUpgrade ? <ArrowUp className="h-4 w-4 text-[hsl(var(--success))]" /> : <ArrowDown className="h-4 w-4 text-[hsl(var(--warning))]" />}
            {isUpgrade ? "Upgrader" : "Downgrader"} le plan
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{subscriber.name}</span> — Plan actuel : <span className="font-semibold capitalize">{subscriber.plan}</span>
          </p>

          {options.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-4 text-center">
              Aucun plan disponible pour {direction === "upgrade" ? "upgrader" : "downgrader"}.
            </p>
          ) : (
            <div className="space-y-2">
              {options.map((p) => {
                const info = PLAN_INFO[p];
                const isSelected = selected === p;
                return (
                  <button
                    key={p}
                    onClick={() => setSelected(p)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {isSelected ? <Check className="h-4 w-4" /> : <span className="text-xs font-bold">{info.label[0]}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">{info.label}</p>
                      <p className="text-[10px] text-muted-foreground">{info.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button size="sm" onClick={handleConfirm} disabled={!selected}>
            {isUpgrade ? "Upgrader" : "Downgrader"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
