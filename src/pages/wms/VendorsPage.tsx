import { useState } from "react";
import { Users, Eye, Plus, Star, Search, Phone, Mail, MapPin, Building2, CreditCard, Landmark, ShieldAlert, Download, Pencil } from "lucide-react";
import { currency } from "@/data/mockData";
import type { Vendor } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { FormField, formInputClass, formSelectClass } from "@/components/ui/form-field";
import { getRoleLevel } from "@/lib/rbac";
import { exportToCSV, type ExportColumn } from "@/lib/exportUtils";

function nextVendorId(vendors: Vendor[]): string {
  const nums = vendors.map((v) => parseInt(v.id.replace("V", ""), 10)).filter((n) => !Number.isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `V${String(next).padStart(3, "0")}`;
}

export default function VendorsPage() {
  const { vendors, setVendors } = useWMSData();
  const { currentUser } = useAuth();
  // Phase 10.2: Only Managers+ (level ≤ 3) can create vendors
  const canCreateVendor = currentUser ? getRoleLevel(currentUser.role) <= 3 : false;
  const canEditVendor = currentUser ? getRoleLevel(currentUser.role) <= 3 : false;
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [editForm, setEditForm] = useState({ paymentTerms: "", phone: "", email: "", city: "", bankAccount: "" });
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [form, setForm] = useState({ name: "", contact: "", phone: "", email: "", city: "", taxId: "", bankAccount: "", paymentTerms: "Net_30" as string });

  const filtered = vendors.filter(v => {
    if (filterStatus !== "all" && v.status !== filterStatus) return false;
    if (search && !v.name.toLowerCase().includes(search.toLowerCase()) && !v.contact.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const NIF_REGEX = /^\d{15}$/;
  const nifError = form.taxId && !NIF_REGEX.test(form.taxId)
    ? "Le NIF doit contenir exactement 15 chiffres (ex: 000216045678901)"
    : "";

  const handleCreate = () => {
    if (!form.name || !form.contact) return;
    if (!form.taxId) { toast({ title: "NIF requis", description: "Le numéro d'identification fiscale est obligatoire.", variant: "destructive" }); return; }
    if (!NIF_REGEX.test(form.taxId)) { toast({ title: "NIF invalide", description: "Le NIF algérien doit contenir exactement 15 chiffres.", variant: "destructive" }); return; }
    const newVendor: Vendor = {
      id: nextVendorId(vendors),
      name: form.name, contact: form.contact, phone: form.phone, email: form.email, city: form.city,
      rating: 0, status: "Active", totalPOs: 0, totalValue: 0, avgLeadDays: 0, lastDelivery: "—",
      taxId: form.taxId, bankAccount: form.bankAccount, currencyId: "DZD",
      paymentTerms: form.paymentTerms as Vendor["paymentTerms"],
    };
    setVendors(prev => [newVendor, ...prev]);
    setShowCreate(false);
    setForm({ name: "", contact: "", phone: "", email: "", city: "", taxId: "", bankAccount: "", paymentTerms: "Net_30" });
    toast({ title: "Fournisseur créé", description: form.name });
  };

  const toggleStatus = (id: string) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, status: (v.status === "Active" ? "On Hold" : "Active") as Vendor["status"] } : v));
  };

  // GAP 2.10: Edit vendor details
  const openEditVendor = (v: Vendor) => {
    setEditingVendor(v);
    setEditForm({
      paymentTerms: v.paymentTerms ?? "Net_30",
      phone: v.phone,
      email: v.email,
      city: v.city,
      bankAccount: v.bankAccount ?? "",
    });
  };

  const handleEditVendor = () => {
    if (!editingVendor) return;
    setVendors(prev => prev.map(v => v.id === editingVendor.id ? {
      ...v,
      paymentTerms: editForm.paymentTerms as Vendor["paymentTerms"],
      phone: editForm.phone,
      email: editForm.email,
      city: editForm.city,
      bankAccount: editForm.bankAccount,
    } : v));
    toast({ title: "Fournisseur modifié", description: `${editingVendor.name} — conditions : ${editForm.paymentTerms.replace(/_/g, " ")}` });
    setEditingVendor(null);
    // Refresh detail view if open
    if (selectedVendor?.id === editingVendor.id) {
      setSelectedVendor(prev => prev ? { ...prev, paymentTerms: editForm.paymentTerms as Vendor["paymentTerms"], phone: editForm.phone, email: editForm.email, city: editForm.city, bankAccount: editForm.bankAccount } : null);
    }
  };

  // GAP 2.12: Export vendors CSV
  const handleExportCSV = () => {
    const cols: ExportColumn<Vendor>[] = [
      { key: "id", label: "ID" },
      { key: "name", label: "Raison sociale" },
      { key: "contact", label: "Contact" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Téléphone" },
      { key: "city", label: "Ville" },
      { key: "taxId", label: "NIF" },
      { key: "status", label: "Statut" },
      { key: "paymentTerms", label: "Conditions paiement" },
      { key: "rating", label: "Note" },
      { key: "totalPOs", label: "Total POs" },
      { key: "totalValue", label: "CA total" },
      { key: "avgLeadDays", label: "Délai moyen (j)" },
      { key: "lastDelivery", label: "Dernière livraison" },
      { key: "bankAccount", label: "Compte bancaire" },
      { key: "currencyId", label: "Devise" },
    ];
    exportToCSV(filtered, cols, "fournisseurs");
    toast({ title: "Export CSV", description: `${filtered.length} fournisseur(s) exporté(s).` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Fournisseurs</h1>
            <p className="text-sm text-muted-foreground">{vendors.length} fournisseurs enregistrés</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2"><Download className="h-4 w-4" /> Exporter CSV</Button>
          {canCreateVendor && (
            <Button onClick={() => setShowCreate(true)} className="gap-2"><Plus className="h-4 w-4" /> Nouveau fournisseur</Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Rechercher fournisseur..." value={search} onChange={e => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="all">Tous</option>
          <option value="Active">Actifs</option>
          <option value="On Hold">En attente</option>
          <option value="Blocked">Bloqués</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(v => (
          <div key={v.id} className="glass-card rounded-xl p-5 space-y-3 hover:shadow-md hover:border-border/70 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-sm">{v.name}</h3>
                <p className="text-xs text-muted-foreground">{v.contact}</p>
              </div>
              <StatusBadge status={v.status} />
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`h-3 w-3 ${s <= Math.round(v.rating) ? "text-warning fill-warning" : "text-muted-foreground/30"}`} />
              ))}
              <span className="text-xs text-muted-foreground ml-1">{v.rating}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" /> {v.city}</div>
              <div className="flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" /> {v.phone.slice(-9)}</div>
              <div><span className="text-muted-foreground">POs :</span> <span className="font-medium">{v.totalPOs}</span></div>
              <div><span className="text-muted-foreground">Délai :</span> <span className="font-medium">{v.avgLeadDays}j</span></div>
            </div>
            <div className="text-xs"><span className="text-muted-foreground">CA total :</span> <span className="font-semibold">{currency(v.totalValue)}</span></div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => setSelectedVendor(v)}>
                <Eye className="h-3 w-3 mr-1" /> Détails
              </Button>
              <Button variant={v.status === "Active" ? "outline-destructive" : "default"} size="sm" className="text-xs h-8" onClick={() => toggleStatus(v.id)}>
                {v.status === "Active" ? "Suspendre" : "Activer"}
              </Button>
            </div>
            {v.isBlacklisted && (
              <div className="flex items-center gap-1 text-[10px] text-destructive font-medium mt-1">
                <ShieldAlert className="h-3 w-3" /> Liste noire
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Detail Dialog ── */}
      <Dialog open={!!selectedVendor} onOpenChange={() => setSelectedVendor(null)}>
        <DialogContent className="max-w-lg">
          {selectedVendor && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="dialog-icon-primary">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block">{selectedVendor.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{selectedVendor.id}</span>
                  </div>
                  <div className="ml-auto">
                    <StatusBadge status={selectedVendor.status} />
                  </div>
                </DialogTitle>
              </DialogHeader>

              {/* Rating strip */}
              <div className="flex items-center gap-1.5 mb-4">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`h-4 w-4 ${s <= Math.round(selectedVendor.rating) ? "text-warning fill-warning" : "text-muted-foreground/20"}`} />
                ))}
                <span className="text-sm font-medium ml-1">{selectedVendor.rating} / 5</span>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Contact", value: selectedVendor.contact },
                  { label: "Email", value: selectedVendor.email },
                  { label: "Téléphone", value: selectedVendor.phone },
                  { label: "Ville", value: selectedVendor.city },
                  { label: "NIF", value: selectedVendor.taxId || "—" },
                  { label: "Devise", value: selectedVendor.currencyId || "DZD" },
                  { label: "Compte bancaire", value: selectedVendor.bankAccount ? `...${selectedVendor.bankAccount.slice(-8)}` : "—" },
                  { label: "Conditions paiement", value: selectedVendor.paymentTerms?.replace(/_/g, " ") || "—" },
                  { label: "Total POs", value: String(selectedVendor.totalPOs) },
                  { label: "Délai moyen", value: `${selectedVendor.avgLeadDays} j` },
                  { label: "CA total", value: currency(selectedVendor.totalValue) },
                  { label: "Dernière livraison", value: selectedVendor.lastDelivery },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-muted/30 border border-border/40 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
                    <p className="text-sm font-medium truncate">{value}</p>
                  </div>
                ))}
              </div>

              {/* Edit button for managers+ */}
              {canEditVendor && (
                <div className="pt-3 border-t border-border/40">
                  <Button variant="outline" className="w-full gap-2" onClick={() => { openEditVendor(selectedVendor); setSelectedVendor(null); }}>
                    <Pencil className="h-4 w-4" /> Modifier ce fournisseur
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Create Dialog ── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="dialog-icon-primary">
                <Users className="h-4 w-4" />
              </div>
              Nouveau fournisseur
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <FormField label="Raison sociale" required>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Nom de l'entreprise" className={formInputClass} autoFocus />
            </FormField>
            <FormField label="Contact" required>
              <input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })}
                placeholder="Nom du contact principal" className={formInputClass} />
            </FormField>
            <FormField label="NIF (Numéro d'Identification Fiscale)" required hint="Format: 15 chiffres"
              error={nifError || undefined}>
              <input value={form.taxId} onChange={e => setForm({ ...form, taxId: e.target.value.replace(/\D/g, "").slice(0, 15) })}
                placeholder="000216045678901" className={`${formInputClass} ${nifError ? "border-destructive" : ""}`} maxLength={15} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Téléphone">
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+213-21-xx-xx-xx" className={formInputClass} />
              </FormField>
              <FormField label="Ville">
                <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                  placeholder="Alger, Oran..." className={formInputClass} />
              </FormField>
            </div>
            <FormField label="Email">
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="contact@fournisseur.dz" className={formInputClass} />
            </FormField>
            <FormField label="Compte bancaire (IBAN)" hint="Format: DZ58...">
              <input value={form.bankAccount} onChange={e => setForm({ ...form, bankAccount: e.target.value })}
                placeholder="DZ580002100000000123456789" className={formInputClass} />
            </FormField>
            <FormField label="Conditions de paiement">
              <select value={form.paymentTerms} onChange={e => setForm({ ...form, paymentTerms: e.target.value })}
                className={formSelectClass}>
                <option value="Comptant">Comptant</option>
                <option value="Net_15">Net 15</option>
                <option value="Net_30">Net 30</option>
                <option value="Net_45">Net 45</option>
                <option value="Net_60">Net 60</option>
                <option value="30_jours_fin_mois">30j fin de mois</option>
              </select>
            </FormField>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={!form.name || !form.contact || !!nifError}>
              <Plus className="h-4 w-4" /> Créer fournisseur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* ── Edit Dialog (GAP 2.10) ── */}
      <Dialog open={!!editingVendor} onOpenChange={() => setEditingVendor(null)}>
        <DialogContent className="max-w-md">
          {editingVendor && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="dialog-icon-primary"><Pencil className="h-4 w-4" /></div>
                  Modifier — {editingVendor.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <FormField label="Conditions de paiement">
                  <select value={editForm.paymentTerms} onChange={e => setEditForm({ ...editForm, paymentTerms: e.target.value })} className={formSelectClass}>
                    <option value="Comptant">Comptant</option>
                    <option value="Net_15">Net 15</option>
                    <option value="Net_30">Net 30</option>
                    <option value="Net_45">Net 45</option>
                    <option value="Net_60">Net 60</option>
                    <option value="30_jours_fin_mois">30j fin de mois</option>
                  </select>
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Téléphone">
                    <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className={formInputClass} />
                  </FormField>
                  <FormField label="Ville">
                    <input value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} className={formInputClass} />
                  </FormField>
                </div>
                <FormField label="Email">
                  <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className={formInputClass} />
                </FormField>
                <FormField label="Compte bancaire (IBAN)">
                  <input value={editForm.bankAccount} onChange={e => setEditForm({ ...editForm, bankAccount: e.target.value })} className={formInputClass} />
                </FormField>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingVendor(null)}>Annuler</Button>
                <Button onClick={handleEditVendor}>Enregistrer</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
