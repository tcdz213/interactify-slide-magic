import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Minus, Plus, Check, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import CreditGauge from "../components/CreditGauge";
import { portalCatalog, PORTAL_CUSTOMER } from "../data/mockPortalData";

const currency = (v: number) =>
  new Intl.NumberFormat("fr-DZ", { style: "decimal", maximumFractionDigits: 0 }).format(v) + " DZD";

type CartItem = { productId: string; qty: number };

export default function PlaceOrderScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"catalog" | "cart" | "confirm">("catalog");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [acceptPartial, setAcceptPartial] = useState(false);

  const categories = useMemo(() => [...new Set(portalCatalog.map((p) => p.category))], []);
  const [catFilter, setCatFilter] = useState<string>("Toutes");

  const filteredProducts = portalCatalog
    .filter((p) => catFilter === "Toutes" || p.category === catFilter)
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  const getQty = (id: string) => cart.find((c) => c.productId === id)?.qty ?? 0;
  const setQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.productId !== id));
    } else {
      setCart((prev) => {
        const existing = prev.find((c) => c.productId === id);
        if (existing) return prev.map((c) => (c.productId === id ? { ...c, qty } : c));
        return [...prev, { productId: id, qty }];
      });
    }
  };

  const cartItems = cart.map((c) => {
    const product = portalCatalog.find((p) => p.id === c.productId)!;
    return { ...product, qty: c.qty, lineTotal: product.unitPrice * c.qty };
  });
  const cartTotal = cartItems.reduce((s, i) => s + i.lineTotal, 0);
  const creditAvailable = PORTAL_CUSTOMER.creditLimit - PORTAL_CUSTOMER.creditUsed;
  const creditOk = cartTotal <= creditAvailable;

  const handleConfirm = () => {
    const orderId = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 900 + 100)}`;
    toast({ title: "✅ Commande envoyée", description: `${orderId} — ${currency(cartTotal)}. En attente d'approbation.` });
    setStep("confirm");
  };

  if (step === "confirm") {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] animate-fade-in text-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-lg font-bold mb-1">Commande envoyée ✅</h2>
        <p className="text-sm text-muted-foreground mb-1">{currency(cartTotal)}</p>
        <p className="text-xs text-muted-foreground mb-6">En attente d'approbation</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/portal/orders")}>📋 Mes commandes</Button>
          <Button onClick={() => { setCart([]); setStep("catalog"); }}>➕ Nouvelle cmd</Button>
        </div>
      </div>
    );
  }

  if (step === "cart") {
    return (
      <div className="p-4 space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setStep("catalog")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">Mon panier ({cart.length})</h1>
        </div>

        <div className="space-y-2">
          {cartItems.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-[10px] text-muted-foreground">x{item.qty} · {currency(item.unitPrice)}/u</p>
              </div>
              <p className="text-sm font-semibold">{currency(item.lineTotal)}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total</span>
            <span className="font-bold">{currency(cartTotal)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">💳 Crédit</span>
            <span className={creditOk ? "text-primary font-medium" : "text-destructive font-medium"}>
              {creditOk ? "✅ OK" : "⛔ Insuffisant"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox checked={acceptPartial} onCheckedChange={(v) => setAcceptPartial(!!v)} id="partial" />
          <label htmlFor="partial" className="text-xs text-muted-foreground">Livraison partielle acceptée</label>
        </div>

        <Button onClick={handleConfirm} className="w-full" disabled={cart.length === 0 || !creditOk}>
          Confirmer ✅
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <h1 className="text-lg font-bold">Commander</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Chercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["Toutes", ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setCatFilter(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
              catFilter === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Products */}
      <div className="space-y-2">
        {filteredProducts.map((p) => {
          const qty = getQty(p.id);
          return (
            <div key={p.id} className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${p.stock > 100 ? "bg-emerald-100 text-emerald-700" : p.stock > 20 ? "bg-amber-100 text-amber-700" : "bg-destructive/10 text-destructive"}`}>
                    {p.stock > 100 ? "🟢 En stock" : p.stock > 20 ? "🟡 Stock bas" : "🔴 Critique"}
                  </span>
                  <span className="text-xs font-semibold">{currency(p.unitPrice)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {qty > 0 && (
                  <button onClick={() => setQty(p.id, qty - 1)} className="h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted">
                    <Minus className="h-3 w-3" />
                  </button>
                )}
                {qty > 0 && <span className="text-sm font-bold w-8 text-center">{qty}</span>}
                <button onClick={() => setQty(p.id, qty + 1)} className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90">
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating cart bar */}
      {cart.length > 0 && (
        <div className="sticky bottom-0 pt-3">
          <button
            onClick={() => setStep("cart")}
            className="w-full rounded-xl bg-primary text-primary-foreground py-3 px-4 flex items-center justify-between font-semibold text-sm shadow-lg"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" /> Panier: {currency(cartTotal)}
            </span>
            <span>Suivant →</span>
          </button>
        </div>
      )}
    </div>
  );
}
