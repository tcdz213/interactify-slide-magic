import { useState, useMemo } from "react";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useWarehouseScope } from "@/hooks/useWarehouseScope";
import { useAuth } from "@/contexts/AuthContext";
import { usePagination } from "@/hooks/usePagination";
import DataTablePagination from "@/components/DataTablePagination";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { FormField, FormSection, formSelectClass, formInputClass } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Bell, Trash2, Send, Mail, Smartphone, Monitor } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { logAudit } from "@/services/auditService";
import type { AlertRule, NotificationChannel } from "@/data/mockDataPhase20_22";

const CHANNEL_OPTIONS: { value: NotificationChannel; label: string; icon: React.ElementType; color: string }[] = [
  { value: "InApp", label: "In-App", icon: Monitor, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "Email", label: "Email", icon: Mail, color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "SMS", label: "SMS", icon: Smartphone, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
];

export default function AlertRulesPage() {
  const { alertRules, setAlertRules, warehouses } = useWMSData();
  const { canOperateOn, operationalWarehouses } = useWarehouseScope();
  const { isSystemAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editRule, setEditRule] = useState<AlertRule | null>(null);
  const [form, setForm] = useState({
    name: "", warehouseId: "", metric: "StockLevel" as AlertRule["metric"],
    condition: "Below" as AlertRule["condition"], threshold: "",
    channels: ["InApp"] as NotificationChannel[],
    recipients: "", isActive: true, notes: "",
  });

  const filtered = useMemo(() => {
    let d = (alertRules as AlertRule[]).filter(x => canOperateOn(x.warehouseId));
    if (search) { const s = search.toLowerCase(); d = d.filter(x => x.name.toLowerCase().includes(s)); }
    return d;
  }, [alertRules, canOperateOn, search]);
  const pag = usePagination(filtered, 10);

  const openCreate = () => {
    setEditRule(null);
    setForm({
      name: "", warehouseId: operationalWarehouses[0]?.id || "",
      metric: "StockLevel", condition: "Below", threshold: "",
      channels: ["InApp"], recipients: "", isActive: true, notes: "",
    });
    setShowForm(true);
  };

  const openEdit = (r: AlertRule) => {
    setEditRule(r);
    setForm({
      name: r.name, warehouseId: r.warehouseId, metric: r.metric,
      condition: r.condition, threshold: r.threshold,
      channels: r.channels || (r.channel === "Both" ? ["InApp", "Email"] : r.channel === "Email" ? ["Email"] : ["InApp"]),
      recipients: r.recipients, isActive: r.isActive, notes: r.notes,
    });
    setShowForm(true);
  };

  const toggleChannel = (ch: NotificationChannel) => {
    setForm(p => ({
      ...p,
      channels: p.channels.includes(ch)
        ? p.channels.filter(c => c !== ch)
        : [...p.channels, ch],
    }));
  };

  /** G2.3 — Simulate email/SMS delivery with toast + audit log */
  const simulateSend = (rule: AlertRule) => {
    const channels = rule.channels || ["InApp"];
    const recipientList = rule.recipients.split(",").map(r => r.trim()).filter(Boolean);

    channels.forEach(ch => {
      if (ch === "Email") {
        recipientList.forEach(recipient => {
          logAudit({
            action: "Email envoyé (simulé)",
            module: "Notifications",
            entityId: rule.id,
            performedBy: "Système",
            details: `Email → ${recipient} | Alerte: "${rule.name}" | Seuil: ${rule.threshold}`,
          });
        });
        toast({
          title: "📧 Email simulé",
          description: `Email envoyé à ${recipientList.join(", ")} pour "${rule.name}"`,
        });
      }
      if (ch === "SMS") {
        recipientList.forEach(recipient => {
          logAudit({
            action: "SMS envoyé (simulé)",
            module: "Notifications",
            entityId: rule.id,
            performedBy: "Système",
            details: `SMS → ${recipient} | Alerte: "${rule.name}" | Seuil: ${rule.threshold}`,
          });
        });
        toast({
          title: "📱 SMS simulé",
          description: `SMS envoyé à ${recipientList.join(", ")} pour "${rule.name}"`,
        });
      }
      if (ch === "InApp") {
        toast({ title: "🔔 Notification In-App", description: `Alerte "${rule.name}" déclenchée` });
      }
    });
  };

  const deriveChannel = (channels: NotificationChannel[]): AlertRule["channel"] => {
    if (channels.includes("InApp") && (channels.includes("Email") || channels.includes("SMS"))) return "Both";
    if (channels.includes("Email")) return "Email";
    return "InApp";
  };

  const save = () => {
    if (!form.name || !form.warehouseId || !form.threshold) {
      toast({ title: "Erreur", description: "Champs obligatoires manquants", variant: "destructive" });
      return;
    }
    if (form.channels.length === 0) {
      toast({ title: "Erreur", description: "Sélectionnez au moins un canal", variant: "destructive" });
      return;
    }
    const wh = warehouses.find(w => w.id === form.warehouseId);
    if (editRule) {
      setAlertRules((prev: AlertRule[]) => prev.map(r => r.id === editRule.id ? {
        ...r, ...form, channel: deriveChannel(form.channels), warehouseName: wh?.name || "",
      } : r));
      toast({ title: "Règle d'alerte modifiée" });
    } else {
      const nr: AlertRule = {
        id: `ALR-${String(Date.now()).slice(-4)}`,
        ...form, channel: deriveChannel(form.channels),
        warehouseName: wh?.name || "", triggerCount: 0,
        createdBy: "Utilisateur courant",
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setAlertRules((prev: AlertRule[]) => [nr, ...prev]);
      toast({ title: "Règle d'alerte créée" });
    }
    setShowForm(false);
  };

  const toggleActive = (id: string) => setAlertRules((prev: AlertRule[]) => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  const deleteRule = (id: string) => { setAlertRules((prev: AlertRule[]) => prev.filter(r => r.id !== id)); toast({ title: "Règle supprimée" }); };

  const channelBadges = (rule: AlertRule) => {
    const chs = rule.channels || (rule.channel === "Both" ? ["InApp", "Email"] : rule.channel === "Email" ? ["Email"] : ["InApp"]);
    return (
      <div className="flex gap-1 flex-wrap">
        {(chs as NotificationChannel[]).map(ch => {
          const opt = CHANNEL_OPTIONS.find(o => o.value === ch);
          if (!opt) return null;
          const Icon = opt.icon;
          return (
            <Badge key={ch} variant="outline" className={`text-[10px] px-1.5 py-0 ${opt.color}`}>
              <Icon className="h-3 w-3 mr-0.5" />{opt.label}
            </Badge>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Bell className="h-6 w-6" /> Règles d'Alertes</h1>
          <p className="text-sm text-muted-foreground mt-1">Configuration des seuils, canaux (In-App / Email / SMS) et déclencheurs</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
          {isSystemAdmin && <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1" /> Nouvelle alerte</Button>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{(alertRules as AlertRule[]).length}</div><p className="text-xs text-muted-foreground">Total règles</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-green-600">{(alertRules as AlertRule[]).filter(r => r.isActive).length}</div><p className="text-xs text-muted-foreground">Actives</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-orange-500">{(alertRules as AlertRule[]).reduce((s, r) => s + r.triggerCount, 0)}</div><p className="text-xs text-muted-foreground">Déclenchements</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-blue-600">{(alertRules as AlertRule[]).filter(r => (r.channels || []).includes("Email")).length}</div><p className="text-xs text-muted-foreground">Avec Email</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-emerald-600">{(alertRules as AlertRule[]).filter(r => (r.channels || []).includes("SMS")).length}</div><p className="text-xs text-muted-foreground">Avec SMS</p></CardContent></Card>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Nom</TableHead><TableHead>Entrepôt</TableHead><TableHead>Métrique</TableHead><TableHead>Condition</TableHead><TableHead>Seuil</TableHead><TableHead>Canaux</TableHead><TableHead>Décl.</TableHead><TableHead>Active</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {pag.paginatedItems.map(r => (
              <TableRow key={r.id} className={!r.isActive ? "opacity-50" : ""}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{r.warehouseName}</TableCell>
                <TableCell><StatusBadge status={r.metric} /></TableCell>
                <TableCell>{r.condition}</TableCell>
                <TableCell className="font-mono">{r.threshold}</TableCell>
                <TableCell>{channelBadges(r)}</TableCell>
                <TableCell className="text-center">{r.triggerCount}</TableCell>
                <TableCell><Switch checked={r.isActive} onCheckedChange={() => toggleActive(r.id)} /></TableCell>
                <TableCell className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(r)} aria-label="Modifier">✏️</Button>
                  <Button variant="ghost" size="sm" onClick={() => simulateSend(r)} aria-label="Tester l'envoi">
                    <Send className="h-4 w-4 text-primary" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteRule(r.id)} aria-label="Supprimer"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination {...pag} totalItems={filtered.length} onPageChange={pag.setCurrentPage} onPageSizeChange={pag.setPageSize} />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent><DialogHeader><DialogTitle>{editRule ? "Modifier alerte" : "Nouvelle alerte"}</DialogTitle></DialogHeader>
          <FormSection title="Détails alerte">
            <FormField label="Nom"><Input className={formInputClass} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></FormField>
            <FormField label="Entrepôt"><select className={formSelectClass} value={form.warehouseId} onChange={e => setForm(p => ({ ...p, warehouseId: e.target.value }))}>{operationalWarehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></FormField>
            <FormField label="Métrique"><select className={formSelectClass} value={form.metric} onChange={e => setForm(p => ({ ...p, metric: e.target.value as AlertRule["metric"] }))}>{(["StockLevel","ExpiryDate","Temperature","OrderDelay","CycleCountVariance","Custom"] as const).map(m => <option key={m} value={m}>{m}</option>)}</select></FormField>
            <FormField label="Condition"><select className={formSelectClass} value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value as AlertRule["condition"] }))}>{(["Below","Above","Equals","Within","Overdue"] as const).map(c => <option key={c} value={c}>{c}</option>)}</select></FormField>
            <FormField label="Seuil"><Input className={formInputClass} value={form.threshold} onChange={e => setForm(p => ({ ...p, threshold: e.target.value }))} placeholder="ex: 500, 7 jours, 2%" /></FormField>

            {/* G2.2 — Per-rule channel selection */}
            <FormField label="Canaux de notification">
              <div className="flex gap-4 pt-1">
                {CHANNEL_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={form.channels.includes(opt.value)}
                        onCheckedChange={() => toggleChannel(opt.value)}
                      />
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
              {form.channels.length === 0 && (
                <p className="text-xs text-destructive mt-1">Au moins un canal requis</p>
              )}
            </FormField>

            <FormField label="Destinataires"><Input className={formInputClass} value={form.recipients} onChange={e => setForm(p => ({ ...p, recipients: e.target.value }))} placeholder="Noms séparés par virgule" /></FormField>
            <FormField label="Notes"><Input className={formInputClass} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></FormField>
          </FormSection>
          <DialogFooter><Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button><Button onClick={save}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
