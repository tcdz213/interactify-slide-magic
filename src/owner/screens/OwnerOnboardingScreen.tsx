import { useState } from "react";
import { onboardingRequests as initialRequests } from "../data/mockOwnerData";
import type { OnboardingRequest } from "../types/owner";
import { cn } from "@/lib/utils";
import { UserPlus, Building2, Truck, MapPin, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import OwnerConfirmDialog from "../components/OwnerConfirmDialog";
import RejectReasonDialog from "../components/RejectReasonDialog";

const STATUS_STYLES = {
  pending: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30",
  approved: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
};

export default function OwnerOnboardingScreen() {
  const [requests, setRequests] = useState<OnboardingRequest[]>([...initialRequests]);
  const [approveTarget, setApproveTarget] = useState<OnboardingRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<OnboardingRequest | null>(null);

  const pending = requests.filter(r => r.status === "pending");
  const processed = requests.filter(r => r.status !== "pending");

  const handleApprove = () => {
    if (!approveTarget) return;
    setRequests(prev => prev.map(r => r.id === approveTarget.id ? { ...r, status: "approved" as const } : r));
    toast({ title: "Demande approuvée ✅", description: `${approveTarget.companyName} a été approuvé. Abonné créé automatiquement.` });
    setApproveTarget(null);
  };

  const handleReject = (reason: string) => {
    if (!rejectTarget) return;
    setRequests(prev => prev.map(r => r.id === rejectTarget.id ? { ...r, status: "rejected" as const, notes: `Refusé : ${reason}` } : r));
    toast({ title: "Demande refusée", description: `${rejectTarget.companyName} — Motif : ${reason}` });
    setRejectTarget(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto animate-fade-in">
      <div>
        <h1 className="text-lg font-bold">Onboarding</h1>
        <p className="text-xs text-muted-foreground">{pending.length} demandes en attente · {processed.length} traitées</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "En attente", value: pending.length, icon: Clock, color: "text-[hsl(var(--warning))]", bg: "bg-[hsl(var(--warning))]/10" },
          { label: "Approuvées", value: requests.filter(r => r.status === "approved").length, icon: CheckCircle, color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success))]/10" },
          { label: "Refusées", value: requests.filter(r => r.status === "rejected").length, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
        ].map(c => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-3 space-y-1">
            <div className={`h-7 w-7 rounded-lg ${c.bg} flex items-center justify-center`}>
              <c.icon className={`h-3.5 w-3.5 ${c.color}`} />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase">{c.label}</p>
            <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Pending Requests */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-[hsl(var(--warning))]" /> En attente ({pending.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pending.map((req) => (
              <div key={req.id} className="rounded-xl border border-[hsl(var(--warning))]/20 bg-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {req.type === "entrepot" ? <Building2 className="h-4 w-4 text-[hsl(var(--info))]" /> : <Truck className="h-4 w-4 text-[hsl(var(--warning))]" />}
                    <div>
                      <p className="text-sm font-semibold">{req.companyName}</p>
                      <p className="text-[10px] text-muted-foreground">{req.type === "entrepot" ? "Entrepôt" : "Fournisseur"} · {req.sector}</p>
                    </div>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border", STATUS_STYLES.pending)}>En attente</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-muted-foreground"><UserPlus className="h-3 w-3" />{req.contactName}</div>
                  <div className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-3 w-3" />{req.city}, {req.wilaya}</div>
                  <div className="flex items-center gap-1.5 text-muted-foreground"><Calendar className="h-3 w-3" />{new Date(req.requestedAt).toLocaleDateString("fr-FR")}</div>
                  <div className="text-muted-foreground">Plan : <span className="font-medium text-foreground capitalize">{req.requestedPlan}</span></div>
                </div>

                {req.notes && <p className="text-[10px] text-muted-foreground bg-muted/50 rounded-lg p-2 italic">💬 {req.notes}</p>}

                <div className="flex gap-2 pt-1">
                  <button onClick={() => setApproveTarget(req)} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-medium bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/20 transition-colors border border-[hsl(var(--success))]/20">
                    <CheckCircle className="h-3.5 w-3.5" /> Approuver
                  </button>
                  <button onClick={() => setRejectTarget(req)} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors border border-destructive/20">
                    <XCircle className="h-3.5 w-3.5" /> Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processed */}
      {processed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Traités récemment ({processed.length})</h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Entreprise</th>
                  <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Ville</th>
                  <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Plan</th>
                  <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Statut</th>
                  <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {processed.map((req) => (
                  <tr key={req.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-3 font-medium">{req.companyName}</td>
                    <td className="px-3 py-3 text-muted-foreground">{req.type === "entrepot" ? "Entrepôt" : "Fournisseur"}</td>
                    <td className="px-3 py-3 text-muted-foreground">{req.city}</td>
                    <td className="px-3 py-3 capitalize">{req.requestedPlan}</td>
                    <td className="px-3 py-3">
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border", STATUS_STYLES[req.status])}>
                        {req.status === "approved" ? "Approuvé ✅" : "Refusé ❌"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground text-[10px] max-w-[200px] truncate">{req.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <OwnerConfirmDialog
        open={!!approveTarget}
        onOpenChange={(v) => !v && setApproveTarget(null)}
        title="Approuver la demande"
        description={`Approuver l'inscription de ${approveTarget?.companyName} (${approveTarget?.type === "entrepot" ? "Entrepôt" : "Fournisseur"}) en plan ${approveTarget?.requestedPlan} ? Un compte abonné sera créé automatiquement.`}
        confirmLabel="Approuver ✅"
        onConfirm={handleApprove}
      />
      <RejectReasonDialog
        open={!!rejectTarget}
        onOpenChange={(v) => !v && setRejectTarget(null)}
        companyName={rejectTarget?.companyName || ""}
        onConfirm={handleReject}
      />
    </div>
  );
}
