import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWMSData } from "@/contexts/WMSDataContext";
import { Navigate } from "react-router-dom";
import {
  Shield, Save, RotateCcw, Percent, CheckCircle2, AlertTriangle,
  Building2, Globe, Bell, Database, Settings2, Activity,
  Lock, Users, FileText, Package, Truck, Calculator, BarChart3,
  Eye, EyeOff, Trash2, Download, Upload, RefreshCw, Clock,
  Server, HardDrive, Zap, ToggleLeft, ToggleRight, Info,
  ShieldCheck, Mail, Smartphone, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { warehouses as allWarehouses } from "@/data/mockData";

// ── Settings tab types ──────────────────────────────────────────────────
type SettingsTab = "general" | "approval" | "warehouses" | "security" | "modules" | "notifications" | "data" | "audit";

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "Général", icon: Globe },
  { id: "approval", label: "Approbations", icon: ShieldCheck },
  { id: "warehouses", label: "Entrepôts", icon: Building2 },
  { id: "security", label: "Sécurité", icon: Lock },
  { id: "modules", label: "Modules", icon: Layers },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "data", label: "Données", icon: Database },
  { id: "audit", label: "Journal d'audit", icon: Activity },
];

// ── Config types ──────────────────────────────────────────────────────
interface CompanyConfig {
  name: string;
  legalName: string;
  nif: string;
  nis: string;
  rc: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  timezone: string;
  fiscalYearStart: string;
}

interface ApprovalConfig {
  autoApprovalPct: number;
  managerPct: number;
  financePct: number;
  requireDualApproval: boolean;
  requireSeparationOfDuties: boolean;
}

interface TaxConfig {
  standard: number;
  reduced: number;
  zero: number;
  defaultRate: number;
}

interface SecurityConfig {
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireTwoFactor: boolean;
  ipWhitelistEnabled: boolean;
  ipWhitelist: string;
  auditRetentionDays: number;
  enforceStrongPasswords: boolean;
}

interface ModuleConfig {
  wms: boolean;
  sales: boolean;
  distribution: boolean;
  accounting: boolean;
  bi: boolean;
  purchaseOrders: boolean;
  cycleCount: boolean;
  returns: boolean;
}

interface NotificationConfig {
  emailEnabled: boolean;
  smsEnabled: boolean;
  stockAlerts: boolean;
  approvalReminders: boolean;
  overdueInvoices: boolean;
  expiryAlerts: boolean;
  dailyDigest: boolean;
  expiryDaysThreshold: number;
  lowStockThreshold: number;
}

interface POConfig {
  defaultTaxRate: number;
  maxPOValueWithoutCEO: number;
}

// ── Audit log mock ──────────────────────────────────────────────────────
const AUDIT_LOG = [
  { id: 1, timestamp: "2026-02-23 09:45", user: "Ahmed Mansour", action: "Configuration modifiée", detail: "Seuil auto-approbation changé de 0.3% à 0.5%", module: "Système", severity: "warning" },
  { id: 2, timestamp: "2026-02-23 09:30", user: "Ahmed Mansour", action: "Utilisateur créé", detail: "Hassan Nour (Responsable WH-Constantine) ajouté", module: "Utilisateurs", severity: "info" },
  { id: 3, timestamp: "2026-02-22 16:20", user: "Ahmed Mansour", action: "Module activé", detail: "Module BI & Analytics activé", module: "Modules", severity: "info" },
  { id: 4, timestamp: "2026-02-22 14:00", user: "Karim Ben Ali", action: "GRN approuvé", detail: "GRN-20260220-0001 — Cevital — 661 500 DZD", module: "WMS", severity: "info" },
  { id: 5, timestamp: "2026-02-22 11:30", user: "Ahmed Mansour", action: "Sécurité modifiée", detail: "Authentification 2FA activée pour tous les rôles direction", module: "Sécurité", severity: "warning" },
  { id: 6, timestamp: "2026-02-21 17:15", user: "Nadia Salim", action: "Export données", detail: "Export comptabilité Février 2026 (PDF + CSV)", module: "Données", severity: "info" },
  { id: 7, timestamp: "2026-02-21 10:00", user: "Ahmed Mansour", action: "Entrepôt modifié", detail: "WH03 — capacité mise à jour de 15 000 à 20 000", module: "Entrepôts", severity: "info" },
  { id: 8, timestamp: "2026-02-20 15:45", user: "Sara Khalil", action: "QC rejeté", detail: "GRN-20260218-0005 — Tlidjen — chaîne du froid rompue", module: "WMS", severity: "error" },
  { id: 9, timestamp: "2026-02-20 09:00", user: "Ahmed Mansour", action: "Utilisateur supprimé", detail: "Test User supprimé du système", module: "Utilisateurs", severity: "warning" },
  { id: 10, timestamp: "2026-02-19 14:30", user: "Anis Boucetta", action: "Ajustement approuvé", detail: "ADJ-002 — Poulet surgelé — perte 2 600 DZD", module: "WMS", severity: "warning" },
  { id: 11, timestamp: "2026-02-19 08:00", user: "Ahmed Mansour", action: "Données réinitialisées", detail: "Réinitialisation complète des données de démonstration", module: "Données", severity: "error" },
  { id: 12, timestamp: "2026-02-18 16:00", user: "Ahmed Mansour", action: "Rôle modifié", detail: "Permissions Comptable mises à jour — ajout factures", module: "Utilisateurs", severity: "info" },
];

export default function SystemSettingsPage() {
  const { isSystemAdmin, currentUser } = useAuth();
  const { resetData } = useWMSData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [saved, setSaved] = useState(false);
  const [auditFilter, setAuditFilter] = useState("");

  // ── State for all configs (must be before early return) ────────────
  const [company, setCompany] = useState<CompanyConfig>({
    name: "Jawda",
    legalName: "Jawda Distribution SARL",
    nif: "001625019000143",
    nis: "19-47-25019-0001",
    rc: "16/00-B001234",
    address: "Zone Industrielle Rouiba, Alger, Algérie",
    phone: "+213-21-100-200",
    email: "contact@jawda.dz",
    currency: "DZD",
    timezone: "Africa/Algiers",
    fiscalYearStart: "01-01",
  });

  const [tax, setTax] = useState<TaxConfig>({
    standard: 19, reduced: 9, zero: 0, defaultRate: 19,
  });

  const [approval, setApproval] = useState<ApprovalConfig>({
    autoApprovalPct: 0.5, managerPct: 2, financePct: 5,
    requireDualApproval: true, requireSeparationOfDuties: true,
  });

  const [security, setSecurity] = useState<SecurityConfig>({
    sessionTimeoutMinutes: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireTwoFactor: false,
    ipWhitelistEnabled: false,
    ipWhitelist: "",
    auditRetentionDays: 365,
    enforceStrongPasswords: true,
  });

  const [modules, setModules] = useState<ModuleConfig>({
    wms: true, sales: true, distribution: true, accounting: true,
    bi: true, purchaseOrders: true, cycleCount: true, returns: true,
  });

  const [notifications, setNotifications] = useState<NotificationConfig>({
    emailEnabled: true, smsEnabled: false,
    stockAlerts: true, approvalReminders: true,
    overdueInvoices: true, expiryAlerts: true, dailyDigest: false,
    expiryDaysThreshold: 30, lowStockThreshold: 20,
  });

  const [po, setPO] = useState<POConfig>({
    defaultTaxRate: 19, maxPOValueWithoutCEO: 5000000,
  });

  // Layer 3 governance guard — AFTER all hooks
  if (!isSystemAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleSave = () => {
    setSaved(true);
    toast({ title: "Configuration enregistrée", description: "Tous les paramètres ont été sauvegardés." });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetData();
    toast({ title: "Données réinitialisées", description: "Toutes les données ont été remises à leur état initial.", variant: "destructive" });
  };

  const filteredAuditLogs = AUDIT_LOG.filter((log) =>
    !auditFilter || log.action.toLowerCase().includes(auditFilter.toLowerCase()) ||
    log.user.toLowerCase().includes(auditFilter.toLowerCase()) ||
    log.detail.toLowerCase().includes(auditFilter.toLowerCase()) ||
    log.module.toLowerCase().includes(auditFilter.toLowerCase())
  );

  const MODULE_LIST = [
    { key: "wms" as const, label: "Gestion des Entrepôts (WMS)", icon: Package, desc: "GRN, inventaire, ajustements, comptages, transferts" },
    { key: "sales" as const, label: "Ventes & Commandes", icon: Truck, desc: "Commandes clients, bons de livraison" },
    { key: "distribution" as const, label: "Distribution & Logistique", icon: Truck, desc: "Tournées, chauffeurs, livraisons" },
    { key: "accounting" as const, label: "Comptabilité", icon: Calculator, desc: "Factures, paiements, rapports financiers" },
    { key: "bi" as const, label: "BI & Analytics", icon: BarChart3, desc: "Tableaux de bord, KPIs, alertes" },
    { key: "purchaseOrders" as const, label: "Bons de Commande", icon: FileText, desc: "Achats fournisseurs, suivi PO" },
    { key: "cycleCount" as const, label: "Comptage Cyclique", icon: RefreshCw, desc: "Inventaires tournants, variances" },
    { key: "returns" as const, label: "Retours", icon: RotateCcw, desc: "Retours clients et fournisseurs" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Paramètres Système</h1>
            <p className="text-sm text-muted-foreground">
              Centre de contrôle — Gouvernance Niveau 3
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Réinitialiser données
          </Button>
          <Button size="sm" onClick={handleSave}>
            {saved ? <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
            {saved ? "Enregistré ✓" : "Enregistrer tout"}
          </Button>
        </div>
      </div>

      {/* Admin badge */}
      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm">
        <Shield className="h-4 w-4 text-primary" />
        <span className="font-medium text-primary">Administrateur :</span>
        <span className="text-foreground">{currentUser?.name}</span>
        <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          SYSTEM_ADMIN
        </span>
      </div>

      {/* System overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-blue-200/50 bg-blue-50/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-700">{allWarehouses.length}</p>
              <p className="text-xs text-blue-600">Entrepôts actifs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200/50 bg-emerald-50/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-emerald-600" />
            <div>
              <p className="text-2xl font-bold text-emerald-700">11</p>
              <p className="text-xs text-emerald-600">Utilisateurs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200/50 bg-amber-50/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Layers className="h-8 w-8 text-amber-600" />
            <div>
              <p className="text-2xl font-bold text-amber-700">{Object.values(modules).filter(Boolean).length}</p>
              <p className="text-xs text-amber-600">Modules actifs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-200/50 bg-purple-50/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Activity className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-700">{AUDIT_LOG.length}</p>
              <p className="text-xs text-purple-600">Actions auditées</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <nav className="w-56 shrink-0 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* ── GENERAL ── */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-4.5 w-4.5 text-primary" />
                    Informations de l'entreprise
                  </CardTitle>
                  <CardDescription>Identité légale et paramètres régionaux</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Nom commercial</Label>
                      <Input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Raison sociale</Label>
                      <Input value={company.legalName} onChange={(e) => setCompany({ ...company, legalName: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label>NIF</Label>
                      <Input value={company.nif} onChange={(e) => setCompany({ ...company, nif: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>NIS</Label>
                      <Input value={company.nis} onChange={(e) => setCompany({ ...company, nis: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Registre de commerce</Label>
                      <Input value={company.rc} onChange={(e) => setCompany({ ...company, rc: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Adresse</Label>
                    <Input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Téléphone</Label>
                      <Input value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} />
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label>Devise</Label>
                      <Input value={company.currency} disabled className="bg-muted/50" />
                      <p className="text-[10px] text-muted-foreground">Non modifiable — Dinar Algérien</p>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Fuseau horaire</Label>
                      <Input value={company.timezone} disabled className="bg-muted/50" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Début exercice fiscal</Label>
                      <Input value={company.fiscalYearStart} onChange={(e) => setCompany({ ...company, fiscalYearStart: e.target.value })} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="h-4.5 w-4.5 text-primary" />
                    Taux de TVA
                  </CardTitle>
                  <CardDescription>Taux de taxe appliqués aux transactions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Standard</Label>
                        <span className="text-sm font-semibold">{tax.standard}%</span>
                      </div>
                      <Slider value={[tax.standard]} onValueChange={([v]) => setTax({ ...tax, standard: v })} min={0} max={30} step={0.5} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Réduit</Label>
                        <span className="text-sm font-semibold">{tax.reduced}%</span>
                      </div>
                      <Slider value={[tax.reduced]} onValueChange={([v]) => setTax({ ...tax, reduced: v })} min={0} max={20} step={0.5} />
                    </div>
                    <div className="space-y-2">
                      <Label>Zéro (export)</Label>
                      <Input type="number" value={0} disabled className="bg-muted/50" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Paramètres des Bons de Commande</CardTitle>
                  <CardDescription>Règles par défaut pour la création et l'approbation des PO</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Taux TVA par défaut (%)</Label>
                      <Input type="number" value={po.defaultTaxRate} onChange={(e) => setPO({ ...po, defaultTaxRate: Number(e.target.value) })} min={0} max={30} />
                    </div>
                    <div className="space-y-2">
                      <Label>Montant max PO sans DG (DZD)</Label>
                      <Input type="number" value={po.maxPOValueWithoutCEO} onChange={(e) => setPO({ ...po, maxPOValueWithoutCEO: Number(e.target.value) })} min={0} />
                      <p className="text-xs text-muted-foreground">{po.maxPOValueWithoutCEO.toLocaleString("fr-DZ")} DZD</p>
                    </div>
                    <div className="flex items-end gap-3 pb-1">
                      <div className="flex items-center gap-2">
                        <Switch checked={approval.requireDualApproval} onCheckedChange={(c) => setApproval({ ...approval, requireDualApproval: c })} />
                        <Label className="text-sm font-normal">Double approbation</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── APPROVAL ── */}
          {activeTab === "approval" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                    Seuils d'Escalade
                  </CardTitle>
                  <CardDescription>Paliers d'approbation selon la variance de stock détectée</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Auto-approbation (≤)</Label>
                      <span className="text-sm font-semibold text-emerald-600">{approval.autoApprovalPct}%</span>
                    </div>
                    <Slider value={[approval.autoApprovalPct]} onValueChange={([v]) => setApproval({ ...approval, autoApprovalPct: v })} min={0} max={2} step={0.1} />
                    <p className="text-xs text-muted-foreground">Les variances sous ce seuil sont approuvées automatiquement.</p>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Responsable Entrepôt (≤)</Label>
                      <span className="text-sm font-semibold text-blue-600">{approval.managerPct}%</span>
                    </div>
                    <Slider value={[approval.managerPct]} onValueChange={([v]) => setApproval({ ...approval, managerPct: v })} min={0.5} max={5} step={0.1} />
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Finance + Direction (≤)</Label>
                      <span className="text-sm font-semibold text-amber-600">{approval.financePct}%</span>
                    </div>
                    <Slider value={[approval.financePct]} onValueChange={([v]) => setApproval({ ...approval, financePct: v })} min={2} max={10} step={0.5} />
                    <p className="text-xs text-muted-foreground">Au-delà → escalade au DG avec enquête obligatoire.</p>
                  </div>

                  {/* Visual summary */}
                  <div className="mt-2 rounded-lg border bg-muted/30 p-4">
                    <p className="mb-3 text-xs font-semibold text-foreground">Résumé des paliers :</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full bg-emerald-500" />
                        <span className="font-medium w-32">≤ {approval.autoApprovalPct}%</span>
                        <span className="text-muted-foreground">→ Auto-approuvé</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full bg-blue-500" />
                        <span className="font-medium w-32">≤ {approval.managerPct}%</span>
                        <span className="text-muted-foreground">→ Responsable Entrepôt</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full bg-amber-500" />
                        <span className="font-medium w-32">≤ {approval.financePct}%</span>
                        <span className="text-muted-foreground">→ Finance + Direction</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full bg-red-500" />
                        <span className="font-medium w-32">&gt; {approval.financePct}%</span>
                        <span className="text-muted-foreground">→ DG + Investigation obligatoire</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Règles de gouvernance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Séparation des tâches obligatoire</p>
                        <p className="text-xs text-muted-foreground">Le créateur d'une transaction ne peut jamais être son propre approbateur</p>
                      </div>
                    </div>
                    <Switch checked={approval.requireSeparationOfDuties} onCheckedChange={(c) => setApproval({ ...approval, requireSeparationOfDuties: c })} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Double approbation requise</p>
                        <p className="text-xs text-muted-foreground">Deux approbateurs distincts pour les transactions à fort impact</p>
                      </div>
                    </div>
                    <Switch checked={approval.requireDualApproval} onCheckedChange={(c) => setApproval({ ...approval, requireDualApproval: c })} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── WAREHOUSES ── */}
          {activeTab === "warehouses" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-4.5 w-4.5 text-blue-600" />
                    Entrepôts configurés
                  </CardTitle>
                  <CardDescription>Vue d'ensemble et paramétrage de chaque site logistique</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allWarehouses.map((wh) => (
                      <div key={wh.id} className="rounded-lg border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-10 w-10 rounded-lg flex items-center justify-center font-bold text-sm",
                              wh.id === "WH01" ? "bg-blue-100 text-blue-700" :
                              wh.id === "WH02" ? "bg-emerald-100 text-emerald-700" :
                              "bg-amber-100 text-amber-700"
                            )}>
                              {wh.id}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{wh.name}</p>
                              <p className="text-xs text-muted-foreground">{wh.address}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <div className="text-center">
                              <p className="font-bold text-foreground">{wh.zones}</p>
                              <p className="text-muted-foreground">Zones</p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-foreground">{wh.capacity.toLocaleString()}</p>
                              <p className="text-muted-foreground">Capacité</p>
                            </div>
                            <div className="text-center">
                              <p className={cn("font-bold", wh.utilization > 80 ? "text-amber-600" : "text-emerald-600")}>{wh.utilization}%</p>
                              <p className="text-muted-foreground">Utilisation</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Resp: {wh.manager}</span>
                          <span className="flex items-center gap-1"><Smartphone className="h-3 w-3" /> {wh.phone}</span>
                          <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {wh.city}</span>
                        </div>
                        {/* Utilization bar */}
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={cn("h-2 rounded-full transition-all", wh.utilization > 80 ? "bg-amber-500" : "bg-emerald-500")}
                            style={{ width: `${wh.utilization}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-4.5 w-4.5 text-red-500" />
                    Politique de sécurité
                  </CardTitle>
                  <CardDescription>Authentification, sessions et contrôle d'accès</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Expiration de session (minutes)</Label>
                      <Input type="number" value={security.sessionTimeoutMinutes} onChange={(e) => setSecurity({ ...security, sessionTimeoutMinutes: Number(e.target.value) })} min={5} max={480} />
                      <p className="text-xs text-muted-foreground">Déconnexion automatique après inactivité</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Tentatives de connexion max</Label>
                      <Input type="number" value={security.maxLoginAttempts} onChange={(e) => setSecurity({ ...security, maxLoginAttempts: Number(e.target.value) })} min={3} max={10} />
                      <p className="text-xs text-muted-foreground">Verrouillage du compte après X échecs</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Longueur minimale du mot de passe</Label>
                      <Input type="number" value={security.passwordMinLength} onChange={(e) => setSecurity({ ...security, passwordMinLength: Number(e.target.value) })} min={6} max={32} />
                    </div>
                    <div className="space-y-2">
                      <Label>Rétention des logs d'audit (jours)</Label>
                      <Input type="number" value={security.auditRetentionDays} onChange={(e) => setSecurity({ ...security, auditRetentionDays: Number(e.target.value) })} min={30} max={3650} />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Authentification à deux facteurs (2FA)</p>
                          <p className="text-xs text-muted-foreground">Exiger un code OTP pour tous les utilisateurs direction</p>
                        </div>
                      </div>
                      <Switch checked={security.requireTwoFactor} onCheckedChange={(c) => setSecurity({ ...security, requireTwoFactor: c })} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Mots de passe forts obligatoires</p>
                          <p className="text-xs text-muted-foreground">Majuscule, minuscule, chiffre et caractère spécial requis</p>
                        </div>
                      </div>
                      <Switch checked={security.enforceStrongPasswords} onCheckedChange={(c) => setSecurity({ ...security, enforceStrongPasswords: c })} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <Server className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Liste blanche d'IP</p>
                          <p className="text-xs text-muted-foreground">Restreindre l'accès à des adresses IP spécifiques</p>
                        </div>
                      </div>
                      <Switch checked={security.ipWhitelistEnabled} onCheckedChange={(c) => setSecurity({ ...security, ipWhitelistEnabled: c })} />
                    </div>
                    {security.ipWhitelistEnabled && (
                      <div className="ml-12 space-y-1.5">
                        <Label>Adresses IP autorisées (une par ligne)</Label>
                        <textarea
                          value={security.ipWhitelist}
                          onChange={(e) => setSecurity({ ...security, ipWhitelist: e.target.value })}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="192.168.1.0/24&#10;10.0.0.1"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── MODULES ── */}
          {activeTab === "modules" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-4.5 w-4.5 text-primary" />
                    Modules du système
                  </CardTitle>
                  <CardDescription>Activez ou désactivez les modules selon vos besoins opérationnels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {MODULE_LIST.map((mod) => (
                    <div key={mod.key} className={cn(
                      "flex items-center justify-between rounded-lg border p-4 transition-colors",
                      modules[mod.key] ? "border-border" : "border-border/50 bg-muted/30 opacity-60"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center",
                          modules[mod.key] ? "bg-primary/10" : "bg-muted"
                        )}>
                          <mod.icon className={cn("h-5 w-5", modules[mod.key] ? "text-primary" : "text-muted-foreground")} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{mod.label}</p>
                          <p className="text-xs text-muted-foreground">{mod.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", modules[mod.key] ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>
                          {modules[mod.key] ? "Actif" : "Inactif"}
                        </span>
                        <Switch checked={modules[mod.key]} onCheckedChange={(c) => setModules({ ...modules, [mod.key]: c })} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-4.5 w-4.5 text-primary" />
                    Canaux de notification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">Notifications par email</p>
                        <p className="text-xs text-muted-foreground">Alertes et rappels envoyés par email</p>
                      </div>
                    </div>
                    <Switch checked={notifications.emailEnabled} onCheckedChange={(c) => setNotifications({ ...notifications, emailEnabled: c })} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="text-sm font-medium">Notifications SMS</p>
                        <p className="text-xs text-muted-foreground">Alertes urgentes par SMS</p>
                      </div>
                    </div>
                    <Switch checked={notifications.smsEnabled} onCheckedChange={(c) => setNotifications({ ...notifications, smsEnabled: c })} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Types d'alertes</CardTitle>
                  <CardDescription>Choisissez quels événements déclenchent une notification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { key: "stockAlerts" as const, label: "Alertes de stock bas", desc: "Notification quand le stock passe sous le seuil de réapprovisionnement" },
                    { key: "approvalReminders" as const, label: "Rappels d'approbation", desc: "Rappels pour les transactions en attente d'approbation" },
                    { key: "overdueInvoices" as const, label: "Factures en retard", desc: "Notification des factures dépassant leur date d'échéance" },
                    { key: "expiryAlerts" as const, label: "Alertes d'expiration", desc: "Produits proches de leur date d'expiration" },
                    { key: "dailyDigest" as const, label: "Résumé quotidien", desc: "Rapport synthétique envoyé chaque matin" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch checked={notifications[item.key]} onCheckedChange={(c) => setNotifications({ ...notifications, [item.key]: c })} />
                    </div>
                  ))}
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Seuil d'alerte expiration (jours)</Label>
                      <Input type="number" value={notifications.expiryDaysThreshold} onChange={(e) => setNotifications({ ...notifications, expiryDaysThreshold: Number(e.target.value) })} min={7} max={90} />
                    </div>
                    <div className="space-y-2">
                      <Label>Seuil de stock bas (%)</Label>
                      <Input type="number" value={notifications.lowStockThreshold} onChange={(e) => setNotifications({ ...notifications, lowStockThreshold: Number(e.target.value) })} min={5} max={50} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── DATA ── */}
          {activeTab === "data" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-4.5 w-4.5 text-primary" />
                    Gestion des données
                  </CardTitle>
                  <CardDescription>Export, import et maintenance des données système</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-blue-500" />
                        <h3 className="font-semibold text-sm">Exporter les données</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">Téléchargez une copie complète de toutes les données du système en format JSON.</p>
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Exporter (JSON)
                      </Button>
                    </div>
                    <div className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-emerald-500" />
                        <h3 className="font-semibold text-sm">Importer des données</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">Chargez des données depuis un fichier JSON exporté précédemment.</p>
                      <Button variant="outline" size="sm" className="w-full">
                        <Upload className="mr-1.5 h-3.5 w-3.5" />
                        Importer (JSON)
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <h3 className="font-semibold text-sm text-destructive">Zone dangereuse</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">Réinitialiser toutes les données du système à leur état initial. Cette action est irréversible.</p>
                    <Button variant="destructive" size="sm" onClick={handleReset}>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Réinitialiser toutes les données
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-4.5 w-4.5 text-primary" />
                    Stockage local
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Données persistées dans le navigateur (localStorage)</span>
                    <Button variant="ghost" size="sm" onClick={() => { localStorage.clear(); toast({ title: "Cache vidé", description: "Le stockage local a été nettoyé." }); }}>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Vider le cache
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── AUDIT LOG ── */}
          {activeTab === "audit" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-4.5 w-4.5 text-purple-500" />
                    Journal d'audit système
                  </CardTitle>
                  <CardDescription>Historique complet des actions système, utilisateurs et données</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Rechercher dans le journal (utilisateur, action, détail...)"
                    value={auditFilter}
                    onChange={(e) => setAuditFilter(e.target.value)}
                    className="max-w-md"
                  />
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="text-left px-4 py-2.5 font-semibold text-xs">Date & Heure</th>
                          <th className="text-left px-4 py-2.5 font-semibold text-xs">Utilisateur</th>
                          <th className="text-left px-4 py-2.5 font-semibold text-xs">Module</th>
                          <th className="text-left px-4 py-2.5 font-semibold text-xs">Action</th>
                          <th className="text-left px-4 py-2.5 font-semibold text-xs">Détail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAuditLogs.map((log, i) => (
                          <tr key={log.id} className={cn("border-b border-border/50 last:border-0", i % 2 === 0 ? "" : "bg-muted/20")}>
                            <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono whitespace-nowrap">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {log.timestamp}
                            </td>
                            <td className="px-4 py-2.5 text-xs font-medium">{log.user}</td>
                            <td className="px-4 py-2.5">
                              <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border bg-muted">
                                {log.module}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border",
                                log.severity === "error" ? "bg-red-50 text-red-700 border-red-200" :
                                log.severity === "warning" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                "bg-blue-50 text-blue-700 border-blue-200"
                              )}>
                                {log.severity === "error" && <AlertTriangle className="h-2.5 w-2.5" />}
                                {log.action}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-xs truncate">{log.detail}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Affichage de {filteredAuditLogs.length} entrées — Rétention : {security.auditRetentionDays} jours
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}