import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, Package, CheckCircle2, XCircle, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supplierPOs } from "../data/mockSupplierData";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(v) + " DZD";

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  Confirmed: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  Shipped: "bg-primary/15 text-primary",
  Delivered: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  Rejected: "bg-destructive/15 text-destructive",
};

export default function SupplierOrderDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const po = supplierPOs.find((p) => p.id === id);
  const [localStatus, setLocalStatus] = useState(po?.status);

  if (!po) {
    return (
      <div className="p-4 text-center py-20">
        <p className="text-muted-foreground">Commande introuvable</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate(-1)}>← Retour</Button>
      </div>
    );
  }

  const handleAction = (action: "confirm" | "reject" | "propose") => {
    if (action === "confirm") {
      setLocalStatus("Confirmed");
      toast({ title: "Commande confirmée", description: `${po.id} a été confirmée.` });
    } else if (action === "reject") {
      setLocalStatus("Rejected");
      toast({ title: "Commande refusée", description: `${po.id} a été refusée.`, variant: "destructive" });
    } else {
      toast({ title: "Date alternative proposée", description: "Votre proposition a été envoyée." });
    }
  };

  return (
    <div className="p-4 space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold font-mono">{po.id}</h1>
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[localStatus || po.status])}>
            {localStatus || po.status}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{po.warehouseName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>Créée le {new Date(po.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          <span>Livraison prévue : {new Date(po.expectedDelivery).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</span>
        </div>
        <div className="pt-2 border-t border-border">
          <span className="text-lg font-bold">{currency(po.totalAmount)}</span>
        </div>
      </div>

      {/* Lines */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-2.5 bg-muted/50 border-b border-border">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <Package className="h-4 w-4" /> Lignes de commande
          </h2>
        </div>
        <div className="divide-y divide-border">
          {po.lines.map((line, i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{line.productName}</p>
                <p className="text-xs text-muted-foreground">{line.qty} {line.unit}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{currency(line.qty * line.unitPrice)}</p>
                <p className="text-[10px] text-muted-foreground">{currency(line.unitPrice)} / {line.unit}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {(localStatus === "Pending") && (
        <div className="space-y-2">
          <Button className="w-full gap-2" onClick={() => handleAction("confirm")}>
            <CheckCircle2 className="h-4 w-4" /> Confirmer la commande
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="gap-2" onClick={() => handleAction("propose")}>
              <CalendarClock className="h-4 w-4" /> Proposer date
            </Button>
            <Button variant="destructive" className="gap-2" onClick={() => handleAction("reject")}>
              <XCircle className="h-4 w-4" /> Refuser
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
