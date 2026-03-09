import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Subscriber } from "../types/owner";
import { Building2, Truck, MapPin, Mail, Phone, Calendar, Users, Package, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriber: Subscriber | null;
}

const currency = (v: number) =>
  v === 0 ? "Gratuit" : new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(v) + " DZD";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
  trial: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]",
  suspended: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
  pending: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
};

export default function SubscriberDetailDrawer({ open, onOpenChange, subscriber }: Props) {
  if (!subscriber) return null;
  const s = subscriber;
  const userPct = s.maxUsers > 0 ? Math.round((s.userCount / s.maxUsers) * 100) : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-base">
            {s.type === "entrepot" ? <Building2 className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
            {s.name}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 mt-4">
          {/* Status + Plan */}
          <div className="flex items-center gap-2">
            <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-medium capitalize", STATUS_STYLES[s.status])}>
              {s.status}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-primary/10 text-primary capitalize">
              Plan {s.plan}
            </span>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-muted-foreground" />{s.contactName}</div>
              <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{s.contactEmail}</div>
              <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{s.contactPhone}</div>
              <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{s.city}, {s.wilaya}</div>
            </div>
          </div>

          {/* Subscription */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Abonnement</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-muted/50 p-2.5">
                <p className="text-[10px] text-muted-foreground">Redevance</p>
                <p className="font-bold">{currency(s.monthlyFee)}/mois</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5">
                <p className="text-[10px] text-muted-foreground">Secteur</p>
                <p className="font-medium">{s.sector}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5">
                <p className="text-[10px] text-muted-foreground">Début</p>
                <p className="font-medium">{s.startDate || "—"}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5">
                <p className="text-[10px] text-muted-foreground">Renouvellement</p>
                <p className="font-medium">{s.renewalDate || "—"}</p>
              </div>
            </div>
          </div>

          {/* Usage */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Utilisation</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Utilisateurs</span>
                  <span className="font-medium">{s.userCount} / {s.maxUsers}</span>
                </div>
                <Progress value={userPct} className="h-1.5" />
              </div>
              {s.type === "entrepot" && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Entrepôts</span>
                    <span className="font-medium">{s.warehouseCount} / {s.maxWarehouses}</span>
                  </div>
                  <Progress value={s.maxWarehouses > 0 ? (s.warehouseCount / s.maxWarehouses) * 100 : 0} className="h-1.5" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                  <Package className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-sm font-bold">{s.totalOrders.toLocaleString()}</p>
                  <p className="text-[9px] text-muted-foreground">Commandes</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                  <DollarSign className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-sm font-bold">{currency(s.totalRevenue)}</p>
                  <p className="text-[9px] text-muted-foreground">CA total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Last Active */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-3">
            <Calendar className="h-3.5 w-3.5" />
            Dernière activité : {s.lastActive ? new Date(s.lastActive).toLocaleString("fr-FR") : "—"}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
