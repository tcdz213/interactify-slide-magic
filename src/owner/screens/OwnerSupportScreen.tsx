import { useState } from "react";
import { supportTickets as initialTickets } from "../data/mockOwnerData";
import type { SupportTicket } from "../types/owner";
import { cn } from "@/lib/utils";
import { MessageSquare, AlertTriangle, Clock, CheckCircle, Circle, MoreHorizontal, PlayCircle, Lock } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import OwnerConfirmDialog from "../components/OwnerConfirmDialog";

const PRIORITY_STYLES = {
  critical: "bg-destructive/10 text-destructive border-destructive/30",
  high: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30",
  medium: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))] border-[hsl(var(--info))]/30",
  low: "bg-muted text-muted-foreground border-border",
};
const STATUS_ICONS = { open: Circle, in_progress: Clock, resolved: CheckCircle, closed: Lock };
const STATUS_LABELS: Record<string, string> = { open: "Ouvert", in_progress: "En cours", resolved: "Résolu", closed: "Fermé" };
const PRIORITY_LABELS: Record<string, string> = { critical: "Critique", high: "Haute", medium: "Moyenne", low: "Basse" };

type TicketAction = "take" | "resolve" | "close";

export default function OwnerSupportScreen() {
  const [tickets, setTickets] = useState<SupportTicket[]>([...initialTickets]);
  const [statusFilter, setStatusFilter] = useState<"all" | SupportTicket["status"]>("all");
  const [confirmAction, setConfirmAction] = useState<{ ticket: SupportTicket; action: TicketAction } | null>(null);

  const filtered = tickets.filter(t => statusFilter === "all" || t.status === statusFilter);
  const openCount = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved").length;

  const updateTicket = (id: string, patch: Partial<SupportTicket>) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t));
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    const { ticket, action } = confirmAction;
    if (action === "take") {
      updateTicket(ticket.id, { status: "in_progress" });
      toast({ title: "Ticket pris en charge", description: `${ticket.id} — ${ticket.subject}` });
    } else if (action === "resolve") {
      updateTicket(ticket.id, { status: "resolved" });
      toast({ title: "Ticket résolu ✅", description: `${ticket.id} marqué comme résolu.` });
    } else if (action === "close") {
      updateTicket(ticket.id, { status: "closed" });
      toast({ title: "Ticket fermé 🔒", description: `${ticket.id} fermé définitivement.` });
    }
    setConfirmAction(null);
  };

  const confirmTitle = confirmAction?.action === "take" ? "Prendre en charge"
    : confirmAction?.action === "resolve" ? "Résoudre le ticket"
    : "Fermer le ticket";
  const confirmDesc = confirmAction?.action === "take"
    ? `Prendre en charge le ticket ${confirmAction.ticket.id} (${confirmAction.ticket.subject}) ?`
    : confirmAction?.action === "resolve"
    ? `Marquer le ticket ${confirmAction?.ticket.id} comme résolu ?`
    : `Fermer définitivement le ticket ${confirmAction?.ticket.id} ?`;

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1400px] mx-auto animate-fade-in">
      <div>
        <h1 className="text-lg font-bold">Support</h1>
        <p className="text-xs text-muted-foreground">{tickets.length} tickets · {openCount} ouverts · {inProgressCount} en cours</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Ouverts", value: openCount, icon: Circle, color: "text-[hsl(var(--warning))]", bg: "bg-[hsl(var(--warning))]/10" },
          { label: "En cours", value: inProgressCount, icon: Clock, color: "text-[hsl(var(--info))]", bg: "bg-[hsl(var(--info))]/10" },
          { label: "Résolus", value: resolvedCount, icon: CheckCircle, color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success))]/10" },
          { label: "Total", value: tickets.length, icon: MessageSquare, color: "text-muted-foreground", bg: "bg-muted" },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-3 space-y-1">
            <div className={`h-7 w-7 rounded-lg ${c.bg} flex items-center justify-center`}>
              <c.icon className={`h-3.5 w-3.5 ${c.color}`} />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase">{c.label}</p>
            <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "open", "in_progress", "resolved", "closed"] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors", statusFilter === s ? "bg-primary/10 text-primary border-primary/30" : "bg-card text-muted-foreground border-border hover:bg-muted")}>
            {s === "all" ? "Tous" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Tickets */}
      <div className="space-y-2">
        {filtered.map((ticket) => {
          const StatusIcon = STATUS_ICONS[ticket.status];
          return (
            <div key={ticket.id} className="rounded-xl border border-border bg-card p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors">
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", PRIORITY_STYLES[ticket.priority])}>
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold">{ticket.subject}</p>
                    <p className="text-[10px] text-muted-foreground">{ticket.subscriberName} · {ticket.category} · <span className="font-mono">{ticket.id}</span></p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-medium border", PRIORITY_STYLES[ticket.priority])}>
                      {PRIORITY_LABELS[ticket.priority]}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <StatusIcon className="h-3 w-3" />{STATUS_LABELS[ticket.status]}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded hover:bg-muted transition-colors"><MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {ticket.status === "open" && (
                          <DropdownMenuItem onClick={() => setConfirmAction({ ticket, action: "take" })}>
                            <PlayCircle className="h-3.5 w-3.5 mr-2" /> Prendre en charge
                          </DropdownMenuItem>
                        )}
                        {(ticket.status === "open" || ticket.status === "in_progress") && (
                          <DropdownMenuItem onClick={() => setConfirmAction({ ticket, action: "resolve" })}>
                            <CheckCircle className="h-3.5 w-3.5 mr-2" /> Résoudre
                          </DropdownMenuItem>
                        )}
                        {ticket.status === "resolved" && (
                          <DropdownMenuItem onClick={() => setConfirmAction({ ticket, action: "close" })}>
                            <Lock className="h-3.5 w-3.5 mr-2" /> Fermer
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Créé {new Date(ticket.createdAt).toLocaleDateString("fr-FR")} · MAJ {new Date(ticket.updatedAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Aucun ticket trouvé</div>}
      </div>

      <OwnerConfirmDialog
        open={!!confirmAction}
        onOpenChange={(v) => !v && setConfirmAction(null)}
        title={confirmTitle}
        description={confirmDesc}
        confirmLabel={confirmAction?.action === "take" ? "Prendre en charge" : confirmAction?.action === "resolve" ? "Résoudre" : "Fermer"}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
