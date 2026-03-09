import { useState } from "react";
import { Globe, CreditCard, Bell, Shield, Database, Save, RotateCcw, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ── Types ──

interface PlanConfig {
  name: string;
  price: number;
  maxUsers: number;
  maxWarehouses: number;
  maxStorage: string;
  trialDays?: number;
}

interface GeneralConfig {
  currency: string;
  language: string;
  timezone: string;
  dateFormat: string;
  contactEmail: string;
  gracePeriodDays: number;
}

interface NotifConfig {
  unpaidReminderDays: string;
  trialExpiryAlertDays: string;
  highPriorityTicket: boolean;
  newOnboarding: boolean;
}

interface SecurityConfig {
  sessionTimeoutMin: number;
  auditLogRetentionMonths: number;
  twoFactorEnabled: boolean;
}

interface LimitsConfig {
  maxTrialSimultaneous: number;
  storageStandard: string;
  storagePro: string;
  apiRateLimit: number;
}

// ── Initial state ──

const INITIAL_PLANS: PlanConfig[] = [
  { name: "Trial", price: 0, maxUsers: 3, maxWarehouses: 1, maxStorage: "1 GB", trialDays: 30 },
  { name: "Standard", price: 45_000, maxUsers: 10, maxWarehouses: 1, maxStorage: "10 GB" },
  { name: "Pro", price: 85_000, maxUsers: 25, maxWarehouses: 3, maxStorage: "50 GB" },
  { name: "Enterprise", price: 150_000, maxUsers: 999, maxWarehouses: 999, maxStorage: "Illimité" },
];

const INITIAL_GENERAL: GeneralConfig = {
  currency: "DZD", language: "Français", timezone: "Africa/Algiers",
  dateFormat: "dd/MM/yyyy", contactEmail: "yacine@jawda.dz", gracePeriodDays: 7,
};

const INITIAL_NOTIF: NotifConfig = {
  unpaidReminderDays: "3, 7, 15", trialExpiryAlertDays: "7, 3, 1",
  highPriorityTicket: true, newOnboarding: true,
};

const INITIAL_SECURITY: SecurityConfig = {
  sessionTimeoutMin: 30, auditLogRetentionMonths: 12, twoFactorEnabled: true,
};

const INITIAL_LIMITS: LimitsConfig = {
  maxTrialSimultaneous: 50, storageStandard: "10 GB", storagePro: "50 GB", apiRateLimit: 1000,
};

const currency = (v: number) =>
  v === 0 ? "Gratuit" : new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(v) + " DZD";

// ── Component ──

export default function OwnerSettingsScreen() {
  const [plans, setPlans] = useState<PlanConfig[]>(INITIAL_PLANS.map(p => ({ ...p })));
  const [general, setGeneral] = useState<GeneralConfig>({ ...INITIAL_GENERAL });
  const [notif, setNotif] = useState<NotifConfig>({ ...INITIAL_NOTIF });
  const [security, setSecurity] = useState<SecurityConfig>({ ...INITIAL_SECURITY });
  const [limits, setLimits] = useState<LimitsConfig>({ ...INITIAL_LIMITS });

  const [editingPlan, setEditingPlan] = useState<number | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Dirty tracking
  const [saved, setSaved] = useState(true);
  const markDirty = () => setSaved(false);

  const handleSaveAll = () => {
    setSaved(true);
    toast({ title: "Paramètres sauvegardés ✅", description: "Toutes les modifications ont été enregistrées." });
  };

  const handleResetAll = () => {
    setPlans(INITIAL_PLANS.map(p => ({ ...p })));
    setGeneral({ ...INITIAL_GENERAL });
    setNotif({ ...INITIAL_NOTIF });
    setSecurity({ ...INITIAL_SECURITY });
    setLimits({ ...INITIAL_LIMITS });
    setEditingPlan(null);
    setEditingSection(null);
    setSaved(true);
    toast({ title: "Réinitialisé", description: "Paramètres remis aux valeurs par défaut." });
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1000px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold">Paramètres plateforme</h1>
          <p className="text-xs text-muted-foreground">Configuration globale de Jawda SaaS</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleResetAll} disabled={saved}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Réinitialiser
          </Button>
          <Button size="sm" onClick={handleSaveAll} disabled={saved}>
            <Save className="h-3.5 w-3.5 mr-1" /> Sauvegarder
          </Button>
        </div>
      </div>

      {!saved && (
        <div className="rounded-lg border border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5 p-2.5 text-xs text-[hsl(var(--warning))] flex items-center gap-2">
          <Pencil className="h-3.5 w-3.5" /> Modifications non sauvegardées
        </div>
      )}

      {/* ═══ Plans d'abonnement ═══ */}
      <SectionWrapper icon={CreditCard} title="Plans d'abonnement" description="Tarifs et limites par plan">
        <div className="divide-y divide-border">
          {plans.map((plan, idx) => (
            <div key={plan.name} className="px-4 py-3">
              {editingPlan === idx ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{plan.name}</span>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingPlan(null)} className="p-1 rounded hover:bg-muted"><Check className="h-3.5 w-3.5 text-[hsl(var(--success))]" /></button>
                      <button onClick={() => { setPlans(prev => prev.map((p, i) => i === idx ? { ...INITIAL_PLANS[idx] } : p)); setEditingPlan(null); }} className="p-1 rounded hover:bg-muted"><X className="h-3.5 w-3.5 text-destructive" /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <FieldInput label="Prix (DZD/mois)" type="number" value={String(plan.price)}
                      onChange={v => { setPlans(prev => prev.map((p, i) => i === idx ? { ...p, price: parseInt(v) || 0 } : p)); markDirty(); }} />
                    <FieldInput label="Max utilisateurs" type="number" value={String(plan.maxUsers)}
                      onChange={v => { setPlans(prev => prev.map((p, i) => i === idx ? { ...p, maxUsers: parseInt(v) || 0 } : p)); markDirty(); }} />
                    <FieldInput label="Max entrepôts" type="number" value={String(plan.maxWarehouses)}
                      onChange={v => { setPlans(prev => prev.map((p, i) => i === idx ? { ...p, maxWarehouses: parseInt(v) || 0 } : p)); markDirty(); }} />
                    <FieldInput label="Stockage" value={plan.maxStorage}
                      onChange={v => { setPlans(prev => prev.map((p, i) => i === idx ? { ...p, maxStorage: v } : p)); markDirty(); }} />
                  </div>
                  {plan.trialDays !== undefined && (
                    <FieldInput label="Durée trial (jours)" type="number" value={String(plan.trialDays)}
                      onChange={v => { setPlans(prev => prev.map((p, i) => i === idx ? { ...p, trialDays: parseInt(v) || 0 } : p)); markDirty(); }} />
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold">{plan.name}</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {currency(plan.price)}/mois · {plan.maxUsers === 999 ? "∞" : plan.maxUsers} users · {plan.maxWarehouses === 999 ? "∞" : plan.maxWarehouses} entrepôts · {plan.maxStorage}
                      {plan.trialDays !== undefined && ` · ${plan.trialDays}j`}
                    </p>
                  </div>
                  <button onClick={() => setEditingPlan(idx)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ═══ Configuration générale ═══ */}
      <SectionWrapper icon={Globe} title="Configuration générale" description="Devise, langue, fuseau horaire"
        editing={editingSection === "general"} onToggleEdit={() => setEditingSection(editingSection === "general" ? null : "general")}>
        {editingSection === "general" ? (
          <div className="px-4 py-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FieldSelect label="Devise" value={general.currency} options={["DZD", "EUR", "USD"]}
                onChange={v => { setGeneral(prev => ({ ...prev, currency: v })); markDirty(); }} />
              <FieldSelect label="Langue par défaut" value={general.language} options={["Français", "English", "العربية"]}
                onChange={v => { setGeneral(prev => ({ ...prev, language: v })); markDirty(); }} />
              <FieldSelect label="Fuseau horaire" value={general.timezone} options={["Africa/Algiers", "Europe/Paris", "UTC"]}
                onChange={v => { setGeneral(prev => ({ ...prev, timezone: v })); markDirty(); }} />
              <FieldSelect label="Format date" value={general.dateFormat} options={["dd/MM/yyyy", "MM/dd/yyyy", "yyyy-MM-dd"]}
                onChange={v => { setGeneral(prev => ({ ...prev, dateFormat: v })); markDirty(); }} />
            </div>
            <FieldInput label="Email de contact" value={general.contactEmail} type="email"
              onChange={v => { setGeneral(prev => ({ ...prev, contactEmail: v })); markDirty(); }} />
            <FieldInput label="Délai de grâce (jours)" value={String(general.gracePeriodDays)} type="number"
              onChange={v => { setGeneral(prev => ({ ...prev, gracePeriodDays: parseInt(v) || 0 })); markDirty(); }} />
          </div>
        ) : (
          <div className="divide-y divide-border">
            <ReadOnlyRow label="Devise" value={general.currency} />
            <ReadOnlyRow label="Langue par défaut" value={general.language} />
            <ReadOnlyRow label="Fuseau horaire" value={general.timezone} />
            <ReadOnlyRow label="Format date" value={general.dateFormat} />
            <ReadOnlyRow label="Email de contact" value={general.contactEmail} />
            <ReadOnlyRow label="Délai de grâce" value={`${general.gracePeriodDays} jours`} />
          </div>
        )}
      </SectionWrapper>

      {/* ═══ Notifications ═══ */}
      <SectionWrapper icon={Bell} title="Notifications & Alertes" description="Seuils et canaux de notification"
        editing={editingSection === "notif"} onToggleEdit={() => setEditingSection(editingSection === "notif" ? null : "notif")}>
        {editingSection === "notif" ? (
          <div className="px-4 py-3 space-y-3">
            <FieldInput label="Rappels facture impayée (jours)" value={notif.unpaidReminderDays}
              onChange={v => { setNotif(prev => ({ ...prev, unpaidReminderDays: v })); markDirty(); }} />
            <FieldInput label="Alertes trial expirant (jours)" value={notif.trialExpiryAlertDays}
              onChange={v => { setNotif(prev => ({ ...prev, trialExpiryAlertDays: v })); markDirty(); }} />
            <FieldSwitch label="Notification ticket haute priorité" value={notif.highPriorityTicket}
              onChange={v => { setNotif(prev => ({ ...prev, highPriorityTicket: v })); markDirty(); }} />
            <FieldSwitch label="Notification nouvel onboarding" value={notif.newOnboarding}
              onChange={v => { setNotif(prev => ({ ...prev, newOnboarding: v })); markDirty(); }} />
          </div>
        ) : (
          <div className="divide-y divide-border">
            <ReadOnlyRow label="Facture impayée" value={`Rappel J+${notif.unpaidReminderDays}`} />
            <ReadOnlyRow label="Trial expirant" value={`Alerte J-${notif.trialExpiryAlertDays}`} />
            <ReadOnlyRow label="Ticket haute priorité" value={notif.highPriorityTicket ? "Notification immédiate" : "Désactivé"} />
            <ReadOnlyRow label="Nouvel onboarding" value={notif.newOnboarding ? "Email + Dashboard" : "Désactivé"} />
          </div>
        )}
      </SectionWrapper>

      {/* ═══ Sécurité ═══ */}
      <SectionWrapper icon={Shield} title="Sécurité" description="Authentification et accès"
        editing={editingSection === "security"} onToggleEdit={() => setEditingSection(editingSection === "security" ? null : "security")}>
        {editingSection === "security" ? (
          <div className="px-4 py-3 space-y-3">
            <FieldInput label="Session timeout (minutes)" type="number" value={String(security.sessionTimeoutMin)}
              onChange={v => { setSecurity(prev => ({ ...prev, sessionTimeoutMin: parseInt(v) || 0 })); markDirty(); }} />
            <FieldInput label="Rétention logs d'audit (mois)" type="number" value={String(security.auditLogRetentionMonths)}
              onChange={v => { setSecurity(prev => ({ ...prev, auditLogRetentionMonths: parseInt(v) || 0 })); markDirty(); }} />
            <FieldSwitch label="Authentification 2FA" value={security.twoFactorEnabled}
              onChange={v => { setSecurity(prev => ({ ...prev, twoFactorEnabled: v })); markDirty(); }} />
          </div>
        ) : (
          <div className="divide-y divide-border">
            <ReadOnlyRow label="Auth Owner" value="Email + PIN 6 chiffres" />
            <ReadOnlyRow label="Session timeout" value={`${security.sessionTimeoutMin} minutes`} />
            <ReadOnlyRow label="Logs d'audit" value={`Activé — rétention ${security.auditLogRetentionMonths} mois`} />
            <ReadOnlyRow label="2FA" value={security.twoFactorEnabled ? "Activé" : "Désactivé"} />
          </div>
        )}
      </SectionWrapper>

      {/* ═══ Limites ═══ */}
      <SectionWrapper icon={Database} title="Limites plateforme" description="Quotas et restrictions globales"
        editing={editingSection === "limits"} onToggleEdit={() => setEditingSection(editingSection === "limits" ? null : "limits")}>
        {editingSection === "limits" ? (
          <div className="px-4 py-3 space-y-3">
            <FieldInput label="Max Trial simultanés" type="number" value={String(limits.maxTrialSimultaneous)}
              onChange={v => { setLimits(prev => ({ ...prev, maxTrialSimultaneous: parseInt(v) || 0 })); markDirty(); }} />
            <FieldInput label="Stockage Standard" value={limits.storageStandard}
              onChange={v => { setLimits(prev => ({ ...prev, storageStandard: v })); markDirty(); }} />
            <FieldInput label="Stockage Pro" value={limits.storagePro}
              onChange={v => { setLimits(prev => ({ ...prev, storagePro: v })); markDirty(); }} />
            <FieldInput label="API rate limit (req/min)" type="number" value={String(limits.apiRateLimit)}
              onChange={v => { setLimits(prev => ({ ...prev, apiRateLimit: parseInt(v) || 0 })); markDirty(); }} />
          </div>
        ) : (
          <div className="divide-y divide-border">
            <ReadOnlyRow label="Max Trial simultanés" value={String(limits.maxTrialSimultaneous)} />
            <ReadOnlyRow label="Stockage Standard" value={limits.storageStandard} />
            <ReadOnlyRow label="Stockage Pro" value={limits.storagePro} />
            <ReadOnlyRow label="API rate limit" value={`${limits.apiRateLimit} req/min/abonné`} />
          </div>
        )}
      </SectionWrapper>
    </div>
  );
}

// ══════════════════════════════════
// Reusable sub-components
// ══════════════════════════════════

function SectionWrapper({ icon: Icon, title, description, children, editing, onToggleEdit }: {
  icon: React.ElementType; title: string; description: string; children: React.ReactNode;
  editing?: boolean; onToggleEdit?: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-[10px] text-muted-foreground">{description}</p>
          </div>
        </div>
        {onToggleEdit && (
          <button onClick={onToggleEdit} className={cn("p-1.5 rounded-lg transition-colors", editing ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground")}>
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}

function FieldInput({ label, value, onChange, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-medium text-muted-foreground">{label}</label>
      <Input value={value} onChange={e => onChange(e.target.value)} type={type} className="h-8 text-xs" />
    </div>
  );
}

function FieldSelect({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-medium text-muted-foreground">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function FieldSwitch({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs text-muted-foreground">{label}</label>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}
