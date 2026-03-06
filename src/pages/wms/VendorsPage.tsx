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
import { useTranslation } from "react-i18next";

function nextVendorId(vendors: Vendor[]): string {
  const nums = vendors.map((v) => parseInt(v.id.replace("V", ""), 10)).filter((n) => !Number.isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `V${String(next).padStart(3, "0")}`;
}

export default function VendorsPage() {
  const { t } = useTranslation();
  const { vendors, setVendors } = useWMSData();
  const { currentUser } = useAuth();
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
    ? t("vendors.nifError")
    : "";

  const handleCreate = () => {
    if (!form.name || !form.contact) return;
    if (!form.taxId) { toast({ title: t("vendors.nifRequired"), description: t("vendors.nifRequiredDesc"), variant: "destructive" }); return; }
    if (!NIF_REGEX.test(form.taxId)) { toast({ title: t("vendors.nifInvalid"), description: t("vendors.nifInvalidDesc"), variant: "destructive" }); return; }
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
    toast({ title: t("vendors.created"), description: form.name });
  };

  const toggleStatus = (id: string) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, status: (v.status === "Active" ? "On Hold" : "Active") as Vendor["status"] } : v));
  };

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
    toast({ title: t("vendors.modified"), description: `${editingVendor.name} — ${editForm.paymentTerms.replace(/_/g, " ")}` });
    setEditingVendor(null);
    if (selectedVendor?.id === editingVendor.id) {
      setSelectedVendor(prev => prev ? { ...prev, paymentTerms: editForm.paymentTerms as Vendor["paymentTerms"], phone: editForm.phone, email: editForm.email, city: editForm.city, bankAccount: editForm.bankAccount } : null);
    }
  };

  const handleExportCSV = () => {
    const cols: ExportColumn<Vendor>[] = [
      { key: "id", label: t("common.id") },
      { key: "name", label: t("vendors.companyName") },
      { key: "contact", label: t("common.contact") },
      { key: "email", label: t("common.email") },
      { key: "phone", label: t("common.phone") },
      { key: "city", label: t("common.city") },
      { key: "taxId", label: "NIF" },
      { key: "status", label: t("common.status") },
      { key: "paymentTerms", label: t("vendors.paymentTerms") },
      { key: "rating", label: t("common.rating") },
      { key: "totalPOs", label: t("vendors.totalPOs") },
      { key: "totalValue", label: t("vendors.totalRevenue") },
      { key: "avgLeadDays", label: t("vendors.avgLeadDays") },
      { key: "lastDelivery", label: t("vendors.lastDelivery") },
      { key: "bankAccount", label: t("vendors.bankAccountShort") },
      { key: "currencyId", label: t("vendors.currency") },
    ];
    exportToCSV(filtered, cols, "fournisseurs");
    toast({ title: t("common.exportCSV"), description: t("vendors.exportDesc", { count: filtered.length }) });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("vendors.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("vendors.subtitle", { count: vendors.length })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2"><Download className="h-4 w-4" /> {t("common.exportCSV")}</Button>
          {canCreateVendor && (
            <Button onClick={() => setShowCreate(true)} className="gap-2"><Plus className="h-4 w-4" /> {t("vendors.newVendor")}</Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder={t("vendors.searchPlaceholder")} value={search} onChange={e => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="all">{t("vendors.allStatuses")}</option>
          <option value="Active">{t("vendors.activeOnly")}</option>
          <option value="On Hold">{t("vendors.onHoldOnly")}</option>
          <option value="Blocked">{t("vendors.blockedOnly")}</option>
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
              <div><span className="text-muted-foreground">{t("vendors.pos")}</span> <span className="font-medium">{v.totalPOs}</span></div>
              <div><span className="text-muted-foreground">{t("vendors.lead")}</span> <span className="font-medium">{t("vendors.leadDays", { days: v.avgLeadDays })}</span></div>
            </div>
            <div className="text-xs"><span className="text-muted-foreground">{t("vendors.totalRevenue")} :</span> <span className="font-semibold">{currency(v.totalValue)}</span></div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => setSelectedVendor(v)}>
                <Eye className="h-3 w-3 mr-1" /> {t("common.details")}
              </Button>
              <Button variant={v.status === "Active" ? "outline-destructive" : "default"} size="sm" className="text-xs h-8" onClick={() => toggleStatus(v.id)}>
                {v.status === "Active" ? t("common.suspend") : t("common.activate")}
              </Button>
            </div>
            {v.isBlacklisted && (
              <div className="flex items-center gap-1 text-[10px] text-destructive font-medium mt-1">
                <ShieldAlert className="h-3 w-3" /> {t("common.blacklisted")}
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
                  <div className="dialog-icon-primary"><Building2 className="h-4 w-4" /></div>
                  <div>
                    <span className="block">{selectedVendor.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{selectedVendor.id}</span>
                  </div>
                  <div className="ml-auto"><StatusBadge status={selectedVendor.status} /></div>
                </DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-1.5 mb-4">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`h-4 w-4 ${s <= Math.round(selectedVendor.rating) ? "text-warning fill-warning" : "text-muted-foreground/20"}`} />
                ))}
                <span className="text-sm font-medium ml-1">{selectedVendor.rating} / 5</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: t("common.contact"), value: selectedVendor.contact },
                  { label: t("common.email"), value: selectedVendor.email },
                  { label: t("common.phone"), value: selectedVendor.phone },
                  { label: t("common.city"), value: selectedVendor.city },
                  { label: "NIF", value: selectedVendor.taxId || "—" },
                  { label: t("vendors.currency"), value: selectedVendor.currencyId || "DZD" },
                  { label: t("vendors.bankAccountShort"), value: selectedVendor.bankAccount ? `...${selectedVendor.bankAccount.slice(-8)}` : "—" },
                  { label: t("vendors.paymentTerms"), value: selectedVendor.paymentTerms?.replace(/_/g, " ") || "—" },
                  { label: t("vendors.totalPOs"), value: String(selectedVendor.totalPOs) },
                  { label: t("vendors.avgLeadDays"), value: t("vendors.leadDays", { days: selectedVendor.avgLeadDays }) },
                  { label: t("vendors.totalRevenue"), value: currency(selectedVendor.totalValue) },
                  { label: t("vendors.lastDelivery"), value: selectedVendor.lastDelivery },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-muted/30 border border-border/40 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
                    <p className="text-sm font-medium truncate">{value}</p>
                  </div>
                ))}
              </div>
              {canEditVendor && (
                <div className="pt-3 border-t border-border/40">
                  <Button variant="outline" className="w-full gap-2" onClick={() => { openEditVendor(selectedVendor); setSelectedVendor(null); }}>
                    <Pencil className="h-4 w-4" /> {t("vendors.editVendor")}
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
              <div className="dialog-icon-primary"><Users className="h-4 w-4" /></div>
              {t("vendors.newVendor")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <FormField label={t("vendors.companyName")} required>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder={t("vendors.companyNamePlaceholder")} className={formInputClass} autoFocus />
            </FormField>
            <FormField label={t("vendors.contactPerson")} required>
              <input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })}
                placeholder={t("vendors.contactPlaceholder")} className={formInputClass} />
            </FormField>
            <FormField label={t("vendors.nif")} required hint={t("vendors.nifHint")}
              error={nifError || undefined}>
              <input value={form.taxId} onChange={e => setForm({ ...form, taxId: e.target.value.replace(/\D/g, "").slice(0, 15) })}
                placeholder="000216045678901" className={`${formInputClass} ${nifError ? "border-destructive" : ""}`} maxLength={15} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label={t("common.phone")}>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+213-21-xx-xx-xx" className={formInputClass} />
              </FormField>
              <FormField label={t("common.city")}>
                <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                  placeholder="Alger, Oran..." className={formInputClass} />
              </FormField>
            </div>
            <FormField label={t("common.email")}>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="contact@fournisseur.dz" className={formInputClass} />
            </FormField>
            <FormField label={t("vendors.bankAccount")} hint={t("vendors.bankAccountHint")}>
              <input value={form.bankAccount} onChange={e => setForm({ ...form, bankAccount: e.target.value })}
                placeholder="DZ580002100000000123456789" className={formInputClass} />
            </FormField>
            <FormField label={t("vendors.paymentTerms")}>
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
            <Button variant="outline" onClick={() => setShowCreate(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleCreate} disabled={!form.name || !form.contact || !!nifError}>
              <Plus className="h-4 w-4" /> {t("vendors.createVendor")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog open={!!editingVendor} onOpenChange={() => setEditingVendor(null)}>
        <DialogContent className="max-w-md">
          {editingVendor && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="dialog-icon-primary"><Pencil className="h-4 w-4" /></div>
                  {t("vendors.modify", { name: editingVendor.name })}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <FormField label={t("vendors.paymentTerms")}>
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
                  <FormField label={t("common.phone")}>
                    <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className={formInputClass} />
                  </FormField>
                  <FormField label={t("common.city")}>
                    <input value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} className={formInputClass} />
                  </FormField>
                </div>
                <FormField label={t("common.email")}>
                  <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className={formInputClass} />
                </FormField>
                <FormField label={t("vendors.bankAccount")}>
                  <input value={editForm.bankAccount} onChange={e => setEditForm({ ...editForm, bankAccount: e.target.value })} className={formInputClass} />
                </FormField>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingVendor(null)}>{t("common.cancel")}</Button>
                <Button onClick={handleEditVendor}>{t("common.save")}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
