import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { REP_PROFILE } from "@/mobile/data/mockSalesData";
import { Delete, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import BiometricPrompt from "@/mobile/components/BiometricPrompt";

const PIN_LENGTH = 6;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

export default function MobileLoginScreen() {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [biometricOpen, setBiometricOpen] = useState(false);

  const handleKey = useCallback((key: string) => {
    if (loading) return;
    setError(false);

    if (key === "del") {
      setPin((p) => p.slice(0, -1));
      return;
    }

    const next = pin + key;
    if (next.length > PIN_LENGTH) return;
    setPin(next);

    if (next.length === PIN_LENGTH) {
      setLoading(true);
      // Simulate auth delay
      setTimeout(() => {
        if (next === REP_PROFILE.pin) {
          localStorage.setItem("mobile_auth", JSON.stringify(REP_PROFILE));
          toast({ title: `Bonjour, ${REP_PROFILE.name} 👋` });
          navigate("/mobile/dashboard", { replace: true });
        } else {
          setError(true);
          setPin("");
          setLoading(false);
          navigator.vibrate?.(200);
        }
      }, 400);
    }
  }, [pin, loading, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-background px-6">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-3">
          <span className="text-primary-foreground text-2xl font-bold">J</span>
        </div>
        <h1 className="text-xl font-bold text-foreground">JAWDA</h1>
        <p className="text-sm text-muted-foreground mt-1">Application Vendeur</p>
      </div>

      {/* Rep name */}
      <p className="text-sm text-muted-foreground mb-6">{REP_PROFILE.name}</p>

      {/* PIN dots */}
      <div className="flex gap-4 mb-2">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-4 w-4 rounded-full border-2 transition-all duration-150",
              i < pin.length
                ? error
                  ? "bg-destructive border-destructive scale-110"
                  : "bg-primary border-primary scale-110"
                : "border-muted-foreground/40"
            )}
          />
        ))}
      </div>

      {/* Error message */}
      <p className={cn(
        "text-xs text-destructive mb-6 h-4 transition-opacity",
        error ? "opacity-100" : "opacity-0"
      )}>
        Code PIN incorrect
      </p>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
        {KEYS.map((key, i) => {
          if (key === "") {
            return (
              <button
                key={i}
                className="h-16 flex items-center justify-center rounded-2xl text-primary"
                onClick={() => setBiometricOpen(true)}
              >
                <Fingerprint className="h-7 w-7" />
              </button>
            );
          }
          if (key === "del") {
            return (
              <button
                key={i}
                onClick={() => handleKey("del")}
                className="h-16 flex items-center justify-center rounded-2xl active:bg-muted transition-colors"
              >
                <Delete className="h-6 w-6 text-muted-foreground" />
              </button>
            );
          }
          return (
            <button
              key={i}
              onClick={() => handleKey(key)}
              className="h-16 flex items-center justify-center rounded-2xl bg-card border border-border text-xl font-semibold text-foreground active:bg-muted active:scale-95 transition-all"
            >
              {key}
            </button>
          );
        })}
      </div>

      {/* Hint */}
      <p className="text-[10px] text-muted-foreground/50 mt-8">PIN démo : 123456</p>

      {/* Biometric prompt */}
      <BiometricPrompt
        open={biometricOpen}
        onCancel={() => setBiometricOpen(false)}
        onSuccess={() => {
          setBiometricOpen(false);
          localStorage.setItem("mobile_auth", JSON.stringify(REP_PROFILE));
          toast({ title: `Bonjour, ${REP_PROFILE.name} 👋` });
          navigate("/mobile/dashboard", { replace: true });
        }}
      />
    </div>
  );
}
