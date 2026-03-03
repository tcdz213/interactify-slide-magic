import { useParams, useNavigate } from "react-router-dom";
import { mockCustomers, mockOrders } from "@/mobile/data/mockSalesData";
import { ArrowLeft, Phone, MapPin, ShoppingCart, AlertTriangle, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const currency = (v: number) => v.toLocaleString("fr-DZ", { maximumFractionDigits: 0 }) + " DZD";

export default function MobileCustomerDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const customer = mockCustomers.find(c => c.id === id);

  if (!customer) return <div className="p-4 text-center text-muted-foreground">Client introuvable</div>;

  const creditPct = Math.round((customer.creditUsed / customer.creditLimit) * 100);
  const isBlocked = customer.oldestOverdueDays >= 60;
  const isWarning = customer.oldestOverdueDays >= 30;
  const orders = mockOrders.filter(o => o.customerId === customer.id);

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-bold text-foreground truncate">{customer.name}</h1>
      </div>

      {/* Debt warning */}
      {(isBlocked || isWarning) && (
        <div className={cn(
          "mx-4 mt-3 rounded-lg p-3 flex items-center gap-2 text-xs font-medium",
          isBlocked ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-700"
        )}>
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {isBlocked
            ? `Client bloqué — ${customer.oldestOverdueDays} jours de retard`
            : `Attention — ${customer.oldestOverdueDays} jours d'impayé`
          }
        </div>
      )}

      {/* Info */}
      <div className="px-4 mt-4 space-y-4">
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a href={`tel:${customer.phone}`} className="text-sm text-primary font-medium">{customer.phone}</a>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{customer.address}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Catégorie</span>
            <Badge variant="secondary">{customer.category}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Dernière visite</span>
            <span className="text-xs font-medium text-foreground">{customer.lastVisit}</span>
          </div>
        </div>

        {/* Credit */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Crédit</h3>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted-foreground">Utilisé / Limite</span>
            <span className={cn("font-bold", isBlocked ? "text-destructive" : isWarning ? "text-amber-600" : "text-foreground")}>
              {creditPct}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                isBlocked ? "bg-destructive" : isWarning ? "bg-amber-500" : "bg-primary"
              )}
              style={{ width: `${Math.min(creditPct, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span>{currency(customer.creditUsed)}</span>
            <span>{currency(customer.creditLimit)}</span>
          </div>
        </div>

        {/* Orders */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">Commandes récentes</h3>
            <span className="text-xs text-muted-foreground">{orders.length} total</span>
          </div>
          {orders.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">Aucune commande</p>
          ) : (
            <div className="space-y-2">
              {orders.map(o => (
                <div key={o.id} className="bg-card border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">{o.id}</span>
                    <Badge variant={o.status === "Delivered" ? "secondary" : o.status === "Rejected" ? "destructive" : "outline"} className="text-[10px]">
                      {o.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-semibold text-foreground">{currency(o.totalAmount)}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <a
            href={`tel:${customer.phone}`}
            className="flex-1 bg-card border border-border rounded-xl p-3 flex items-center justify-center gap-2 text-sm font-medium active:bg-muted min-h-[48px]"
          >
            <Phone className="h-4 w-4 text-primary" />
            Appeler
          </a>
          <button
            onClick={() => {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${customer.lat},${customer.lng}`;
              window.open(url, "_blank");
            }}
            className="flex-1 bg-card border border-border rounded-xl p-3 flex items-center justify-center gap-2 text-sm font-medium active:bg-muted min-h-[48px]"
          >
            <Navigation className="h-4 w-4 text-primary" />
            Naviguer
          </button>
        </div>
        {!isBlocked && (
          <button
            onClick={() => { navigator.vibrate?.(20); navigate(`/mobile/new-order?customer=${customer.id}`); }}
            className="w-full bg-primary text-primary-foreground rounded-xl p-4 flex items-center justify-center gap-2 font-semibold active:opacity-90 transition-opacity min-h-[52px]"
          >
            <ShoppingCart className="h-5 w-5" />
            Nouvelle commande
          </button>
        )}
      </div>
    </div>
  );
}
