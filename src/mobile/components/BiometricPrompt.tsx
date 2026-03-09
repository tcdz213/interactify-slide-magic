import { useState } from "react";
import { Fingerprint, ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BiometricPromptProps {
  onSuccess: () => void;
  onCancel: () => void;
  open: boolean;
}

/**
 * Simulated biometric authentication prompt.
 * Uses WebAuthn API check + mock fallback for demo.
 */
export default function BiometricPrompt({ onSuccess, onCancel, open }: BiometricPromptProps) {
  const [status, setStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");

  if (!open) return null;

  const handleBiometric = async () => {
    setStatus("scanning");
    navigator.vibrate?.(30);

    // Check WebAuthn availability
    const webAuthnAvailable =
      typeof window !== "undefined" &&
      window.PublicKeyCredential &&
      (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.().catch(() => false));

    if (webAuthnAvailable) {
      try {
        // Real WebAuthn challenge (demo credential)
        const credential = await navigator.credentials.get({
          publicKey: {
            challenge: crypto.getRandomValues(new Uint8Array(32)),
            timeout: 30000,
            userVerification: "preferred",
            rpId: window.location.hostname,
            allowCredentials: [],
          },
        });
        if (credential) {
          setStatus("success");
          navigator.vibrate?.(50);
          setTimeout(onSuccess, 600);
          return;
        }
      } catch {
        // WebAuthn failed or cancelled — fall through to mock
      }
    }

    // Mock biometric for demo (simulate scan delay)
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("success");
    navigator.vibrate?.(50);
    setTimeout(onSuccess, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end justify-center">
      <div className="w-full max-w-sm bg-card border border-border rounded-t-3xl p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Close button */}
        <button onClick={onCancel} className="absolute top-4 right-4 p-2 text-muted-foreground">
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div
            className={cn(
              "h-20 w-20 rounded-full flex items-center justify-center mb-4 transition-all duration-300",
              status === "idle" && "bg-primary/10",
              status === "scanning" && "bg-primary/20 animate-pulse",
              status === "success" && "bg-emerald-500/10",
              status === "error" && "bg-destructive/10"
            )}
          >
            {status === "success" ? (
              <ShieldCheck className="h-10 w-10 text-emerald-600" />
            ) : (
              <Fingerprint
                className={cn(
                  "h-10 w-10 transition-colors",
                  status === "scanning" ? "text-primary animate-pulse" : "text-primary/70"
                )}
              />
            )}
          </div>

          {/* Text */}
          <h3 className="text-lg font-bold text-foreground mb-1">
            {status === "success" ? "Identifié !" : "Authentification biométrique"}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {status === "idle" && "Appuyez pour scanner votre empreinte digitale"}
            {status === "scanning" && "Scan en cours..."}
            {status === "success" && "Accès autorisé"}
            {status === "error" && "Échec — réessayez ou utilisez votre PIN"}
          </p>

          {/* Action */}
          {status === "idle" && (
            <button
              onClick={handleBiometric}
              className="w-full bg-primary text-primary-foreground rounded-xl p-4 font-semibold active:opacity-90 transition-opacity min-h-[52px]"
            >
              Scanner l'empreinte
            </button>
          )}

          {status === "error" && (
            <div className="flex gap-3 w-full">
              <button
                onClick={onCancel}
                className="flex-1 bg-muted text-muted-foreground rounded-xl p-3 text-sm font-medium"
              >
                Utiliser PIN
              </button>
              <button
                onClick={() => { setStatus("idle"); }}
                className="flex-1 bg-primary text-primary-foreground rounded-xl p-3 text-sm font-medium"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
