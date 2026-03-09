import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, FileText, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import PortalStatusBadge from "../components/PortalStatusBadge";
import { portalOrders, portalInvoices } from "../data/mockPortalData";
import { toast } from "@/hooks/use-toast";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { style: "decimal", maximumFractionDigits: 0 }).format(v) + " DZD";

export default function OrderDetailScreen() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const order = portalOrders.find((o) => o.id === orderId);
  const invoice = portalInvoices.find((inv) => inv.orderId === orderId);

  if (!order) {
    return (
      <div className="p-4 text-center py-16 text-muted-foreground">
        <p>Commande introuvable</p>
        <Button variant="outline" className="mt-3" onClick={() => navigate("/portal/orders")}>Retour</Button>
      </div>
    );
  }

  const handleReorder = () => {
    toast({ title: "🔄 Commande dupliquée", description: "Votre panier a été pré-rempli avec les articles de cette commande." });
    navigate("/portal/place-order");
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/portal/orders")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-base font-bold font-mono">{order.id}</h1>
          <p className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</p>
        </div>
        <PortalStatusBadge status={order.status} />
      </div>

      {/* Delivery info */}
      {order.status === "Shipped" && order.eta && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 flex items-center gap-3">
          <Truck className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs font-semibold text-primary">En cours de livraison</p>
            <p className="text-[10px] text-muted-foreground">Livraison prévue: {order.deliveryDate} à {order.eta}</p>
          </div>
        </div>
      )}

      {/* Lines */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-2 border-b border-border bg-muted/30">
          <p className="text-xs font-semibold">Articles ({order.lines.length})</p>
        </div>
        {order.lines.map((line, i) => (
          <div key={i} className="px-4 py-3 border-b border-border/50 last:border-0 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{line.productName}</p>
              <p className="text-[10px] text-muted-foreground">x{line.qty} · {currency(line.unitPrice)}/u</p>
            </div>
            <p className="text-sm font-semibold">{currency(line.lineTotal)}</p>
          </div>
        ))}
        <div className="px-4 py-3 bg-muted/30 flex items-center justify-between">
          <p className="text-sm font-semibold">Total</p>
          <p className="text-base font-bold text-primary">{currency(order.totalAmount)}</p>
        </div>
      </div>

      {/* Invoice link */}
      {invoice && (
        <button
          onClick={() => navigate("/portal/invoices")}
          className="w-full rounded-xl border border-border bg-card p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
        >
          <FileText className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1 text-left">
            <p className="text-xs font-medium">{invoice.id}</p>
            <p className="text-[10px] text-muted-foreground">
              {currency(invoice.totalAmount)} · <PortalStatusBadge status={invoice.status} />
            </p>
          </div>
        </button>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {order.status === "Delivered" && (
          <Button onClick={handleReorder} className="flex-1" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" /> Recommander
          </Button>
        )}
      </div>
    </div>
  );
}
