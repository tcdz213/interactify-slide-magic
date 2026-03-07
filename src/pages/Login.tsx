/**
 * Login page — enterprise persona picker with PIN + biometric authentication.
 */

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { users } from "@/data/mockData";
import { ShieldCheck, Building2, Warehouse, Fingerprint, KeyRound, ArrowLeft } from "lucide-react";
import { getRoleBadgeStyle, getWarehouseBadgeStyle, getWarehouseShortName, getRoleLevel } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const LEVEL_COLORS = [
  "border-l-purple-500",
  "border-l-indigo-500",
  "border-l-blue-500",
  "border-l-cyan-400",
  "border-l-slate-400",
];

const USER_PINS: Record<string, string> = {
  U001: "1234", U002: "2345", U003: "3456", U004: "4567", U005: "5678",
  U006: "6789", U007: "7890", U008: "8901", U009: "9012", U010: "0123",
  U011: "1111", U012: "2222", U013: "3333", U014: "4444",
};

type LoginStep = "select" | "pin";

export default function Login() {
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<LoginStep>("select");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    if (currentUser) navigate("/", { replace: true });
  }, [currentUser, navigate]);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.()
        .then((available) => setBiometricAvailable(available))
        .catch(() => setBiometricAvailable(false));
    }
  }, []);

  const selectedUser = users.find((u) => u.id === selectedUserId) ?? null;

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setStep("pin");
    setPin("");
    setPinError(false);
  };

  const handlePinComplete = useCallback((value: string) => {
    if (!selectedUserId) return;
    const correctPin = USER_PINS[selectedUserId] ?? "0000";
    if (value === correctPin) {
      login(selectedUserId);
      toast({ title: t("login.loginSuccess"), description: t("login.welcome", { name: selectedUser?.name }) });
    } else {
      setPinError(true);
      setPin("");
      setTimeout(() => setPinError(false), 1500);
      toast({ title: t("login.pinError"), description: t("login.pinRetry"), variant: "destructive" });
    }
  }, [selectedUserId, selectedUser, login, t]);

  const handleBiometric = useCallback(async () => {
    if (!selectedUserId) return;
    try {
      const credential = await navigator.credentials?.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: "Jawda WMS" },
          user: {
            id: new Uint8Array(16),
            name: selectedUser?.name ?? "user",
            displayName: selectedUser?.name ?? "User",
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
          timeout: 60000,
        },
      });

      if (credential) {
        login(selectedUserId);
        toast({ title: t("login.biometricSuccess"), description: t("login.welcome", { name: selectedUser?.name }) });
      }
    } catch {
      toast({ title: t("login.biometricCancelled"), description: t("login.biometricFallback"), variant: "destructive" });
    }
  }, [selectedUserId, selectedUser, login, t]);

  const handleBack = () => {
    setStep("select");
    setSelectedUserId(null);
    setPin("");
    setPinError(false);
  };

  const usersByLevel = [...users].sort((a, b) => getRoleLevel(a.role) - getRoleLevel(b.role));

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }} />

      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary)), transparent 70%)' }} />
      <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary)), transparent 70%)' }} />

      <div className={cn(
        "w-full max-w-2xl relative z-10 transition-all duration-700",
        ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-5 ring-1 ring-primary/20 shadow-lg"
            style={{ boxShadow: '0 0 40px -10px hsl(var(--primary) / 0.3)' }}>
            <Warehouse className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t("login.title")}
          </h1>
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mt-1.5">
            {t("login.subtitle")}
          </p>
          <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">
            {step === "select"
              ? t("login.selectProfile")
              : t("login.authFor", { name: selectedUser?.name })}
          </p>
        </div>

        {step === "select" && (
          <>
            <div className={cn(
              "mb-6 rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm px-4 py-3 text-xs text-muted-foreground flex items-start gap-2.5 transition-all duration-500 delay-200",
              ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}>
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 shrink-0 mt-0.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              </div>
              <span>
                <strong className="text-foreground">{t("login.sodNotice")}</strong>{" "}
                {t("login.sodDesc")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {usersByLevel.map((user, i) => {
                const level = getRoleLevel(user.role);
                const levelColor = LEVEL_COLORS[Math.min(level - 1, 4)];
                const isFullAccess = user.assignedWarehouseIds === "all";

                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectUser(user.id)}
                    className={cn(
                      "group flex items-start gap-3 rounded-xl border border-border/80 bg-card/80 backdrop-blur-sm px-4 py-3.5 text-left",
                      "border-l-4 transition-all duration-200",
                      "hover:border-primary/40 hover:bg-card hover:shadow-md hover:-translate-y-0.5",
                      "active:scale-[0.98]",
                      levelColor,
                      ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                    )}
                    style={{ transitionDelay: ready ? `${300 + i * 40}ms` : '0ms' }}
                    aria-label={t("login.loginAs", { name: user.name, role: user.roleLabel })}
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0 mt-0.5 ring-1 ring-primary/10 group-hover:ring-primary/30 transition-all">
                      {user.avatar}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm leading-tight truncate group-hover:text-primary transition-colors">
                        {user.name}
                      </p>

                      <span className={cn(
                        "inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border",
                        getRoleBadgeStyle(user.role)
                      )}>
                        {user.roleLabel}
                      </span>

                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {isFullAccess ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border bg-purple-50 text-purple-700 border-purple-200">
                            <Building2 className="h-2.5 w-2.5" />
                            {t("login.allWarehouses")}
                          </span>
                        ) : (
                          (user.assignedWarehouseIds as string[]).map((whId) => (
                            <span
                              key={whId}
                              className={cn(
                                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border",
                                getWarehouseBadgeStyle(whId)
                              )}
                            >
                              <Building2 className="h-2.5 w-2.5" />
                              {getWarehouseShortName(whId)}
                            </span>
                          ))
                        )}

                        {user.approvalThresholdPct !== null && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                            <ShieldCheck className="h-2.5 w-2.5" />
                            {t("login.approves", { pct: user.approvalThresholdPct })}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === "pin" && selectedUser && (
          <div className="flex flex-col items-center gap-6">
            <Button variant="ghost" size="sm" onClick={handleBack} className="self-start">
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t("login.back")}
            </Button>

            <div className="flex items-center gap-4 rounded-xl border bg-card px-6 py-4 w-full max-w-sm">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary ring-2 ring-primary/20">
                {selectedUser.avatar}
              </div>
              <div>
                <p className="font-semibold">{selectedUser.name}</p>
                <span className={cn(
                  "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border",
                  getRoleBadgeStyle(selectedUser.role)
                )}>
                  {selectedUser.roleLabel}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <KeyRound className="h-4 w-4" />
                {t("login.enterPin")}
              </div>

              <div className={cn(
                "transition-all duration-300",
                pinError && "animate-[shake_0.5s_ease-in-out]"
              )}>
                <InputOTP
                  maxLength={4}
                  value={pin}
                  onChange={(v) => {
                    setPin(v);
                    if (v.length === 4) handlePinComplete(v);
                  }}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className={cn("h-14 w-14 text-xl", pinError && "border-destructive")} />
                    <InputOTPSlot index={1} className={cn("h-14 w-14 text-xl", pinError && "border-destructive")} />
                    <InputOTPSlot index={2} className={cn("h-14 w-14 text-xl", pinError && "border-destructive")} />
                    <InputOTPSlot index={3} className={cn("h-14 w-14 text-xl", pinError && "border-destructive")} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {pinError && (
                <p className="text-sm text-destructive font-medium animate-in fade-in">
                  {t("login.pinIncorrect")}
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                {t("login.demoPin")} <code className="bg-muted px-1.5 py-0.5 rounded font-mono">{USER_PINS[selectedUserId!]}</code>
              </p>
            </div>

            {biometricAvailable && (
              <div className="flex flex-col items-center gap-2 pt-2">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border w-16" />
                  <span className="text-xs text-muted-foreground">{t("login.or")}</span>
                  <div className="h-px flex-1 bg-border w-16" />
                </div>

                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 h-14 px-8 rounded-xl"
                  onClick={handleBiometric}
                >
                  <Fingerprint className="h-6 w-6 text-primary" />
                  {t("login.biometric")}
                </Button>
              </div>
            )}
          </div>
        )}

        <div className={cn(
          "flex items-center justify-center gap-2 mt-6 transition-all duration-500 delay-700",
          ready ? "opacity-100" : "opacity-0"
        )}>
          <Fingerprint className="h-3 w-3 text-muted-foreground/50" />
          <p className="text-[11px] text-muted-foreground/60">
            {t("login.demoEnv")}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          75% { transform: translateX(-4px); }
        }
      `}</style>
    </div>
  );
}
