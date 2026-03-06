import { useState, useMemo } from "react";
import { CreditCard, Plus, Pencil, Trash2, Search, AlertTriangle, Percent } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import type { PaymentTerm } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormField, formInputClass, formSelectClass } from "@/components/ui/form-field";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const empty: Omit<PaymentTerm, "id"> = {
  name: "", code: "Net_30", description: "", dueDays: 30,
  discountPct: 0, discountDays: 0, isActive: true,
};

export default function PaymentTermsPage() {
  const { t } = useTranslation();
  const { paymentTerms: data, setPaymentTerms: setData, vendors } = useWMSData();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PaymentTerm | null>(null);
  const [form, setForm] = useState(empty);
  const [deleteConfirm, setDeleteConfirm] = useState<PaymentTerm | null>(null);

  const filtered = useMemo(() => data.filter(pt => {
    if (search && !pt.name.toLowerCase().includes(search.toLowerCase()) && !pt.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [data, search]);

  const vendorCountMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(pt => {
      const count = vendors.filter(v => v.paymentTerms === pt.code).length;
      map.set(pt.id, count);
    });
    return map;
  }, [data, vendors]);

  const openCreate = () => { setEditing(null); setForm(empty); setShowForm(true); };
  const openEdit = (pt: PaymentTerm) => { setEditing(pt); setForm({ name: pt.name, code: pt.code, description: pt.description, dueDays: pt.dueDays, discountPct: pt.discountPct, discountDays: pt.discountDays, isActive: pt.isActive }); setShowForm(true); };

  const handleSave = () => {
    if (!form.name) return;
    if (form.discountPct > 0 && form.discountDays <= 0) {
      toast({ title: t("paymentTermsPage.validationError"), description: t("paymentTermsPage.discountDaysRequired"), variant: "destructive" });
      return;
    }
    if (editing) {
      setData(prev => prev.map(pt => pt.id === editing.id ? { ...pt, ...form } : pt));
      toast({ title: t("paymentTermsPage.modified"), description: form.name });
    } else {
      const id = `PT-${String(data.length + 1).padStart(3, "0")}`;
      setData(prev => [...prev, { id, ...form }]);
      toast({ title: t("paymentTermsPage.created"), description: form.name });
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    const usedBy = vendors.filter(v => v.paymentTerms === deleteConfirm.code);
    if (usedBy.length > 0) {
      toast({ title: t("paymentTermsPage.deleteImpossible"), description: t("paymentTermsPage.deleteUsedBy", { count: usedBy.length }), variant: "destructive" });
      setDeleteConfirm(null);
      return;
    }
    setData(prev => prev.filter(pt => pt.id !== deleteConfirm.id));
    toast({ title: t("paymentTermsPage.deleted") });
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("paymentTermsPage.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("paymentTermsPage.subtitle", { count: data.length })}</p>
          </div>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {t("paymentTermsPage.newTerm")}</Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="text" placeholder={t("common.searchPlaceholder")} value={search} onChange={e => setSearch(e.target.value)}
          className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("common.name")}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("common.code")}</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t("paymentTermsPage.days")}</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t("paymentTermsPage.discount")}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("common.description")}</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("paymentTermsPage.vendors")}</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("common.status")}</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(pt => {
              const vendorCount = vendorCountMap.get(pt.id) ?? 0;
              return (
                <tr key={pt.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{pt.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{pt.code}</td>
                  <td className="px-4 py-3 text-right font-mono">{pt.dueDays}j</td>
                  <td className="px-4 py-3 text-right">
                    {pt.discountPct > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 text-success px-2 py-0.5 text-xs font-semibold">
                        <Percent className="h-3 w-3" /> {pt.discountPct}% / {pt.discountDays}j
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate">{pt.description}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center min-w-[24px] rounded-full px-2 py-0.5 text-xs font-semibold ${vendorCount > 0 ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>
                      {vendorCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${pt.isActive ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-border"}`}>
                      {pt.isActive ? t("common.active") : t("common.inactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(pt)} className="p-1.5 rounded-md hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setDeleteConfirm(pt)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground">{t("paymentTermsPage.noFound")}</div>}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? t("paymentTermsPage.editTerm") : t("paymentTermsPage.newTermFull")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormField label={t("common.name")} required>
              <input className={formInputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t("paymentTermsPage.namePlaceholder")} />
            </FormField>
            <FormField label={t("common.code")} required>
              <select className={formSelectClass} value={form.code} onChange={e => setForm({ ...form, code: e.target.value as PaymentTerm["code"] })}>
                <option value="Comptant">Comptant</option>
                <option value="Net_15">Net_15</option>
                <option value="Net_30">Net_30</option>
                <option value="Net_45">Net_45</option>
                <option value="Net_60">Net_60</option>
                <option value="30_jours_fin_mois">30_jours_fin_mois</option>
              </select>
            </FormField>
            <FormField label={t("common.description")}>
              <input className={formInputClass} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder={t("paymentTermsPage.descPlaceholder")} />
            </FormField>
            <div className="grid grid-cols-3 gap-3">
              <FormField label={t("paymentTermsPage.dueDays")} required>
                <input type="number" className={formInputClass} value={form.dueDays} onChange={e => setForm({ ...form, dueDays: Number(e.target.value) })} min={0} />
              </FormField>
              <FormField label={t("paymentTermsPage.discountPct")} hint={t("paymentTermsPage.discountPctHint")}>
                <input type="number" step="0.1" className={formInputClass} value={form.discountPct} onChange={e => setForm({ ...form, discountPct: Number(e.target.value) })} min={0} max={100} />
              </FormField>
              <FormField label={t("paymentTermsPage.discountDays")}>
                <input type="number" className={formInputClass} value={form.discountDays} onChange={e => setForm({ ...form, discountDays: Number(e.target.value) })} min={0} />
              </FormField>
            </div>
            <FormField label={t("common.status")}>
              <select className={formSelectClass} value={form.isActive ? "true" : "false"} onChange={e => setForm({ ...form, isActive: e.target.value === "true" })}>
                <option value="true">{t("common.active")}</option>
                <option value="false">{t("common.inactive")}</option>
              </select>
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleSave} disabled={!form.name}>{editing ? t("common.save") : t("common.create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{t("paymentTermsPage.deleteConfirm")}</DialogTitle></DialogHeader>
          {deleteConfirm && (() => {
            const usedBy = vendors.filter(v => v.paymentTerms === deleteConfirm.code);
            return usedBy.length > 0 ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2">
                <div className="flex items-center gap-2 text-destructive font-medium text-sm"><AlertTriangle className="h-4 w-4" /> {t("paymentTermsPage.deleteImpossible")}</div>
                <p className="text-sm text-muted-foreground">
                  {t("paymentTermsPage.deleteUsedByNames", { count: usedBy.length, names: usedBy.slice(0, 3).map(v => v.name).join(", ") + (usedBy.length > 3 ? "…" : "") })}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("paymentTermsPage.deleteMsg", { name: deleteConfirm.name })}</p>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>{t("common.cancel")}</Button>
            <Button variant="destructive" onClick={handleDelete}>{t("common.delete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
