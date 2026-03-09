import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Subscriber, SubscriberType, SubscriptionPlan } from "../types/owner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (subscriber: Subscriber) => void;
}

const PLANS: { value: SubscriptionPlan; label: string; fee: number }[] = [
  { value: "trial", label: "Trial (Gratuit)", fee: 0 },
  { value: "standard", label: "Standard (45,000 DZD)", fee: 45_000 },
  { value: "pro", label: "Pro (85,000 DZD)", fee: 85_000 },
  { value: "enterprise", label: "Enterprise (150,000 DZD)", fee: 150_000 },
];

const PLAN_LIMITS: Record<SubscriptionPlan, { maxUsers: number; maxWarehouses: number }> = {
  trial: { maxUsers: 3, maxWarehouses: 1 },
  standard: { maxUsers: 10, maxWarehouses: 1 },
  pro: { maxUsers: 25, maxWarehouses: 3 },
  enterprise: { maxUsers: 999, maxWarehouses: 999 },
};

export default function CreateSubscriberDialog({ open, onOpenChange, onConfirm }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<SubscriberType>("entrepot");
  const [plan, setPlan] = useState<SubscriptionPlan>("standard");
  const [city, setCity] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [sector, setSector] = useState("");

  const reset = () => {
    setName(""); setType("entrepot"); setPlan("standard");
    setCity(""); setWilaya(""); setContactName("");
    setContactEmail(""); setContactPhone(""); setSector("");
  };

  const handleSubmit = () => {
    const limits = PLAN_LIMITS[plan];
    const fee = PLANS.find(p => p.value === plan)!.fee;
    const now = new Date().toISOString().slice(0, 10);
    const renewal = new Date();
    renewal.setFullYear(renewal.getFullYear() + 1);

    const newSub: Subscriber = {
      id: `SUB-${Date.now().toString(36).toUpperCase()}`,
      name, type, plan,
      status: plan === "trial" ? "trial" : "active",
      city, wilaya: wilaya || city,
      contactName, contactEmail, contactPhone,
      startDate: now,
      renewalDate: renewal.toISOString().slice(0, 10),
      monthlyFee: fee,
      userCount: 1,
      maxUsers: limits.maxUsers,
      warehouseCount: type === "entrepot" ? 1 : 0,
      maxWarehouses: type === "entrepot" ? limits.maxWarehouses : 0,
      totalOrders: 0,
      totalRevenue: 0,
      lastActive: new Date().toISOString(),
      sector,
    };
    onConfirm(newSub);
    reset();
    onOpenChange(false);
  };

  const valid = name.trim() && city.trim() && contactName.trim() && contactEmail.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvel abonné</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nom de l'entreprise *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Entrepôt Oran" className="text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Type *</Label>
              <select value={type} onChange={e => setType(e.target.value as SubscriberType)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs">
                <option value="entrepot">🏪 Entrepôt</option>
                <option value="fournisseur">📦 Fournisseur</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Plan d'abonnement *</Label>
            <select value={plan} onChange={e => setPlan(e.target.value as SubscriptionPlan)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs">
              {PLANS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Ville *</Label>
              <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Alger" className="text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Wilaya</Label>
              <Input value={wilaya} onChange={e => setWilaya(e.target.value)} placeholder="Alger" className="text-xs" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Secteur d'activité</Label>
            <Input value={sector} onChange={e => setSector(e.target.value)} placeholder="Agroalimentaire" className="text-xs" />
          </div>

          <div className="border-t border-border pt-3 space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Contact principal</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nom *</Label>
                <Input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Ahmed Mansour" className="text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email *</Label>
                <Input value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="ahmed@example.dz" className="text-xs" type="email" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Téléphone</Label>
              <Input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+213-XX-XXX-XXX" className="text-xs" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button size="sm" onClick={handleSubmit} disabled={!valid}>Créer l'abonné</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
