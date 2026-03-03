import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePortalAuth } from "../components/PortalAuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

export default function PortalLoginScreen() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("appro@uno.dz");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = usePortalAuth();
  const navigate = useNavigate();

  const handleRequestOtp = () => {
    if (!email.includes("@")) {
      toast({ title: "Email invalide", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      toast({ title: "📧 Code envoyé", description: `Un code OTP a été envoyé à ${email}` });
    }, 800);
  };

  const handleVerify = () => {
    if (login(email, otp)) {
      toast({ title: "✅ Connexion réussie" });
      navigate("/portal/dashboard", { replace: true });
    } else {
      toast({ title: "Code invalide", description: "Entrez un code à 6 chiffres", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="h-16 w-16 rounded-2xl bg-primary mx-auto flex items-center justify-center">
            <span className="text-2xl font-black text-primary-foreground">J</span>
          </div>
          <h1 className="text-xl font-bold">🏪 JAWDA</h1>
          <p className="text-sm text-muted-foreground">Espace Client</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          {step === "email" ? (
            <>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email ou téléphone</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@mail.com"
                  autoFocus
                />
              </div>
              <Button onClick={handleRequestOtp} className="w-full" disabled={loading}>
                {loading ? "Envoi…" : "Recevoir le code"}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Code envoyé à <strong>{email}</strong>
              </p>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Code OTP (6 chiffres)</label>
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  className="text-center text-lg tracking-[0.5em] font-mono"
                  autoFocus
                />
                <p className="text-[10px] text-muted-foreground mt-1">Entrez n'importe quel code à 6 chiffres (démo)</p>
              </div>
              <Button onClick={handleVerify} className="w-full">
                Se connecter ✅
              </Button>
              <button onClick={() => setStep("email")} className="text-xs text-muted-foreground hover:underline w-full text-center">
                ← Changer d'email
              </button>
            </>
          )}
        </div>

        <p className="text-[11px] text-center text-muted-foreground">
          Pas de compte ? Contactez votre commercial.
        </p>
      </div>
    </div>
  );
}
