import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOwnerAuth } from "../components/OwnerAuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Crown, Shield } from "lucide-react";

export default function OwnerLoginScreen() {
  const [step, setStep] = useState<"email" | "pin">("email");
  const [email, setEmail] = useState("yacine@jawda.dz");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useOwnerAuth();
  const navigate = useNavigate();

  const handleRequestPin = () => {
    if (!email.includes("@")) {
      toast({ title: "Email invalide", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("pin");
      toast({ title: "Code sécurisé envoyé", description: `Vérifiez ${email}` });
    }, 1000);
  };

  const handleVerify = () => {
    if (login(email, pin)) {
      toast({ title: "Bienvenue, Propriétaire" });
      navigate("/owner", { replace: true });
    } else {
      toast({ title: "Code invalide", description: "Entrez un code à 6 chiffres", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Branding */}
        <div className="text-center space-y-3">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 mx-auto flex items-center justify-center">
            <Crown className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">JAWDA</h1>
            <p className="text-sm text-muted-foreground">Accès Propriétaire</p>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Connexion sécurisée — Accès restreint</span>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
          {step === "email" ? (
            <>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email administrateur</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@jawda.dz"
                  autoFocus
                />
              </div>
              <Button onClick={handleRequestPin} className="w-full" disabled={loading}>
                {loading ? "Vérification…" : "Continuer"}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Code envoyé à <strong>{email}</strong>
              </p>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Code de sécurité</label>
                <Input
                  type="text"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-lg tracking-[0.5em] font-mono"
                  autoFocus
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Démo : entrez n'importe quel code à 6 chiffres
                </p>
              </div>
              <Button onClick={handleVerify} className="w-full">
                Accéder au tableau de bord
              </Button>
              <button
                onClick={() => setStep("email")}
                className="text-xs text-muted-foreground hover:underline w-full text-center"
              >
                ← Changer d'email
              </button>
            </>
          )}
        </div>

        <p className="text-[10px] text-center text-muted-foreground">
          Cet espace est réservé au propriétaire de la plateforme Jawda.
          <br />
          Toute tentative d'accès non autorisé est enregistrée.
        </p>
      </div>
    </div>
  );
}
