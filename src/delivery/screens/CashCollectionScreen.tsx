import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { todayTrip } from "../data/mockDeliveryData";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { style: "decimal", maximumFractionDigits: 0 }).format(v) + " DH";

export default function CashCollectionScreen() {
  const { stopId } = useParams<{ stopId: string }>();
  const navigate = useNavigate();
  const stop = todayTrip.stops.find((s) => s.id === stopId);

  // Default invoice amount from pending orders
  const invoiceAmount = stop?.cashCollection?.invoiceAmount ?? 500000;
  const [collectedAmount, setCollectedAmount] = useState(invoiceAmount);
  const [method, setMethod] = useState<"cash" | "check" | "transfer">("cash");
  const [shortageReason, setShortageReason] = useState("");

  const shortage = collectedAmount - invoiceAmount;
  const hasShortage = shortage < 0;

  const handleSubmit = () => {
    if (hasShortage && !shortageReason.trim()) {
      toast({ title: "Explication requise pour l'écart", variant: "destructive" });
      return;
    }
    toast({
      title: "💰 Paiement enregistré",
      description: `${currency(collectedAmount)} — ${method === "cash" ? "Espèces" : method === "check" ? "Chèque" : "Virement"}`,
    });
    navigate(-1);
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in pb-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold">Encaissement</h1>
          <p className="text-xs text-muted-foreground">🏪 {stop?.customerName ?? "Client"}</p>
        </div>
      </div>

      {/* Invoice amount */}
      <div className="rounded-xl border border-border bg-card p-4 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Montant facture</p>
        <p className="text-2xl font-bold">{currency(invoiceAmount)}</p>
      </div>

      {/* Collected amount */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Montant reçu</label>
        <Input
          type="number"
          value={collectedAmount}
          onChange={(e) => setCollectedAmount(Number(e.target.value))}
          className="text-lg font-semibold text-center"
        />
      </div>

      {/* Shortage warning */}
      {hasShortage && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">Écart: {currency(shortage)}</p>
            <Textarea
              value={shortageReason}
              onChange={(e) => setShortageReason(e.target.value)}
              placeholder="Explication de l'écart (obligatoire)..."
              rows={2}
              className="mt-2"
            />
          </div>
        </div>
      )}

      {/* Payment method */}
      <div>
        <label className="text-sm font-medium mb-2 block">Mode de paiement</label>
        <div className="flex gap-2">
          {([
            { value: "cash", label: "💵 Espèces" },
            { value: "check", label: "📝 Chèque" },
            { value: "transfer", label: "🏦 Virement" },
          ] as const).map((m) => (
            <button
              key={m.value}
              onClick={() => setMethod(m.value)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-colors ${
                method === m.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleSubmit} className="w-full min-h-14 text-base">
        Valider paiement ✅
      </Button>
    </div>
  );
}
