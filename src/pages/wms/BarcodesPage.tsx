import { useState, useMemo } from "react";
import { ScanBarcode, Plus, Pencil, Trash2, Search, Check } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import type { Barcode, BarcodeType } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormField, formInputClass, formSelectClass } from "@/components/ui/form-field";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const BARCODE_TYPES: BarcodeType[] = ["EAN-13", "EAN-8", "UPC-A", "Code128", "QR", "DataMatrix"];
const empty: Omit<Barcode, "id"> = { productId: "", productName: "", type: "EAN-13", value: "", isPrimary: false, createdAt: "" };

export default function BarcodesPage() {
  const { t } = useTranslation();
  const { barcodes: data, setBarcodes: setData, products } = useWMSData();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Barcode | null>(null);
  const [form, setForm] = useState(empty);
  const [deleteConfirm, setDeleteConfirm] = useState<Barcode | null>(null);

  const filtered = useMemo(() => data.filter(b => {
    if (filterType !== "all" && b.type !== filterType) return false;
    if (search && !b.value.toLowerCase().includes(search.toLowerCase()) && !b.productName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [data, search, filterType]);

  const openCreate = () => { setEditing(null); setForm({ ...empty, createdAt: new Date().toISOString().slice(0, 10) }); setShowForm(true); };
  const openEdit = (b: Barcode) => { setEditing(b); setForm({ ...b }); setShowForm(true); };

  const handleSave = () => {
    if (!form.value || !form.productId) return;
    const product = products.find(p => p.id === form.productId);
    const updated = { ...form, productName: product?.name ?? form.productName };
    if (editing) {
      setData(prev => prev.map(b => b.id === editing.id ? { ...b, ...updated } : b));
      toast({ title: t("barcodes.modified") });
    } else {
      setData(prev => [...prev, { id: `BC-${String(prev.length + 1).padStart(3, "0")}`, ...updated }]);
      toast({ title: t("barcodes.created") });
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    setData(prev => prev.filter(b => b.id !== deleteConfirm.id));
    toast({ title: t("barcodes.deleted") }); setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><ScanBarcode className="h-5 w-5 text-primary" /></div>
          <div><h1 className="text-xl font-bold tracking-tight">{t("barcodes.title")}</h1><p className="text-sm text-muted-foreground">{t("barcodes.subtitle", { count: data.length })}</p></div>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {t("barcodes.newBarcode")}</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder={t("barcodes.searchPlaceholder")} value={search} onChange={e => setSearch(e.target.value)} className="h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="h-9 rounded-lg border border-input bg-muted/50 px-3 text-sm">
          <option value="all">{t("common.allTypes")}</option>
          {BARCODE_TYPES.map(tp => <option key={tp} value={tp}>{tp}</option>)}
        </select>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border/50 bg-muted/30">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("barcodes.code")}</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("common.type")}</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("barcodes.product")}</th>
            <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("barcodes.primary")}</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("common.createdAt")}</th>
            <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("common.actions")}</th>
          </tr></thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold">{b.value}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-muted text-xs">{b.type}</span></td>
                <td className="px-4 py-3 font-medium">{b.productName}</td>
                <td className="px-4 py-3 text-center">{b.isPrimary && <Check className="h-4 w-4 text-primary mx-auto" />}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.createdAt}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => openEdit(b)} className="p-1.5 rounded-md hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setDeleteConfirm(b)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground">{t("barcodes.noFound")}</div>}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? t("barcodes.editBarcode") : t("barcodes.newBarcode")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormField label={t("barcodes.product")} required>
              <select className={formSelectClass} value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })}>
                <option value="">{t("barcodes.selectProduct")}</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
              </select>
            </FormField>
            <FormField label={t("common.type")} required>
              <select className={formSelectClass} value={form.type} onChange={e => setForm({ ...form, type: e.target.value as BarcodeType })}>
                {BARCODE_TYPES.map(tp => <option key={tp} value={tp}>{tp}</option>)}
              </select>
            </FormField>
            <FormField label={t("common.value")} required><input className={formInputClass} value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} /></FormField>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isPrimary} onChange={e => setForm({ ...form, isPrimary: e.target.checked })} className="rounded" />
              {t("barcodes.primaryBarcode")}
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleSave} disabled={!form.value || !form.productId}>{editing ? t("common.save") : t("common.create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{t("barcodes.deleteConfirm")}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{t("barcodes.deleteMsg", { value: deleteConfirm?.value })}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>{t("common.cancel")}</Button>
            <Button variant="destructive" onClick={handleDelete}>{t("common.delete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
