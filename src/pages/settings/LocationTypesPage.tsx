import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useWMSData } from "@/contexts/WMSDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePagination } from "@/hooks/usePagination";
import DataTablePagination from "@/components/DataTablePagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { FormField, FormSection, formInputClass } from "@/components/ui/form-field";
import { Plus, Search, MapPin, Trash2, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { LocationType } from "@/data/mockDataPhase20_22";

export default function LocationTypesPage() {
  const { t } = useTranslation();
  const { locationTypes, setLocationTypes } = useWMSData();
  const { isSystemAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editType, setEditType] = useState<LocationType | null>(null);
  const [form, setForm] = useState({ name: "", code: "", description: "", allowPicking: false, allowPutaway: true, allowStorage: true, isQuarantine: false, temperatureControlled: false, maxWeight: "", color: "#3b82f6" });

  const filtered = useMemo(() => {
    let d = locationTypes as LocationType[];
    if (search) { const s = search.toLowerCase(); d = d.filter(x => x.name.toLowerCase().includes(s) || x.code.toLowerCase().includes(s)); }
    return d;
  }, [locationTypes, search]);
  const pag = usePagination(filtered, 10);

  const openCreate = () => { setEditType(null); setForm({ name: "", code: "", description: "", allowPicking: false, allowPutaway: true, allowStorage: true, isQuarantine: false, temperatureControlled: false, maxWeight: "", color: "#3b82f6" }); setShowForm(true); };
  const openEdit = (lt: LocationType) => { setEditType(lt); setForm({ name: lt.name, code: lt.code, description: lt.description, allowPicking: lt.allowPicking, allowPutaway: lt.allowPutaway, allowStorage: lt.allowStorage, isQuarantine: lt.isQuarantine, temperatureControlled: lt.temperatureControlled, maxWeight: lt.maxWeight?.toString() || "", color: lt.color }); setShowForm(true); };

  const save = () => {
    if (!form.name || !form.code) { toast({ title: t("locationTypes.error"), description: t("locationTypes.requiredFields"), variant: "destructive" }); return; }
    if (editType) {
      setLocationTypes((prev: LocationType[]) => prev.map(lt => lt.id === editType.id ? { ...lt, ...form, maxWeight: form.maxWeight ? Number(form.maxWeight) : undefined, isActive: true } : lt));
      toast({ title: t("locationTypes.typeModified") });
    } else {
      const nt: LocationType = { id: `LT-${String(Date.now()).slice(-4)}`, ...form, maxWeight: form.maxWeight ? Number(form.maxWeight) : undefined, isActive: true };
      setLocationTypes((prev: LocationType[]) => [nt, ...prev]);
      toast({ title: t("locationTypes.typeCreated") });
    }
    setShowForm(false);
  };

  const toggleActive = (id: string) => setLocationTypes((prev: LocationType[]) => prev.map(lt => lt.id === id ? { ...lt, isActive: !lt.isActive } : lt));
  const deleteType = (id: string) => { setLocationTypes((prev: LocationType[]) => prev.filter(lt => lt.id !== id)); toast({ title: t("locationTypes.typeDeleted") }); };

  const BoolIcon = ({ val }: { val: boolean }) => val ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-muted-foreground/30" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><MapPin className="h-6 w-6" /> {t("locationTypes.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("locationTypes.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={t("common.searchPlaceholder")} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
          {isSystemAdmin && <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1" /> {t("locationTypes.newType")}</Button>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{(locationTypes as LocationType[]).length}</div><p className="text-xs text-muted-foreground">{t("locationTypes.typesConfigured")}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-green-600">{(locationTypes as LocationType[]).filter(lt => lt.isActive).length}</div><p className="text-xs text-muted-foreground">{t("locationTypes.activeTypes")}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-cyan-600">{(locationTypes as LocationType[]).filter(lt => lt.temperatureControlled).length}</div><p className="text-xs text-muted-foreground">{t("locationTypes.tempControlled")}</p></CardContent></Card>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>{t("locationTypes.colColor")}</TableHead><TableHead>{t("locationTypes.colName")}</TableHead><TableHead>{t("locationTypes.colCode")}</TableHead><TableHead>{t("locationTypes.colDescription")}</TableHead><TableHead>{t("locationTypes.colPicking")}</TableHead><TableHead>{t("locationTypes.colPutaway")}</TableHead><TableHead>{t("locationTypes.colStorage")}</TableHead><TableHead>{t("locationTypes.colQuarantine")}</TableHead><TableHead>{t("locationTypes.colTemp")}</TableHead><TableHead>{t("locationTypes.colActive")}</TableHead><TableHead>{t("locationTypes.colActions")}</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {pag.paginatedItems.map(lt => (
              <TableRow key={lt.id} className={!lt.isActive ? "opacity-50" : ""}>
                <TableCell><div className="h-5 w-5 rounded-full border" style={{ backgroundColor: lt.color }} /></TableCell>
                <TableCell className="font-medium">{lt.name}</TableCell>
                <TableCell className="font-mono text-xs">{lt.code}</TableCell>
                <TableCell className="text-xs max-w-[200px] truncate">{lt.description}</TableCell>
                <TableCell><BoolIcon val={lt.allowPicking} /></TableCell>
                <TableCell><BoolIcon val={lt.allowPutaway} /></TableCell>
                <TableCell><BoolIcon val={lt.allowStorage} /></TableCell>
                <TableCell><BoolIcon val={lt.isQuarantine} /></TableCell>
                <TableCell><BoolIcon val={lt.temperatureControlled} /></TableCell>
                <TableCell><Switch checked={lt.isActive} onCheckedChange={() => toggleActive(lt.id)} /></TableCell>
                <TableCell className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(lt)}>✏️</Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteType(lt.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination {...pag} totalItems={filtered.length} onPageChange={pag.setCurrentPage} onPageSizeChange={pag.setPageSize} />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent><DialogHeader><DialogTitle>{editType ? t("locationTypes.editType") : t("locationTypes.newType")}</DialogTitle></DialogHeader>
          <FormSection title={t("locationTypes.typeConfig")}>
            <FormField label={t("common.name")}><Input className={formInputClass} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></FormField>
            <FormField label={t("common.code")}><Input className={formInputClass} value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder={t("locationTypes.codePlaceholder")} /></FormField>
            <FormField label={t("common.description")}><Input className={formInputClass} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></FormField>
            <FormField label={t("locationTypes.colColor")}><Input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="h-10 w-20" /></FormField>
            <FormField label={t("locationTypes.maxWeight")}><Input className={formInputClass} type="number" value={form.maxWeight} onChange={e => setForm(p => ({ ...p, maxWeight: e.target.value }))} /></FormField>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.allowPicking} onCheckedChange={v => setForm(p => ({ ...p, allowPicking: !!v }))} /> {t("locationTypes.pickingAllowed")}</label>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.allowPutaway} onCheckedChange={v => setForm(p => ({ ...p, allowPutaway: !!v }))} /> {t("locationTypes.putawayAllowed")}</label>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.allowStorage} onCheckedChange={v => setForm(p => ({ ...p, allowStorage: !!v }))} /> {t("locationTypes.storageAllowed")}</label>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.isQuarantine} onCheckedChange={v => setForm(p => ({ ...p, isQuarantine: !!v }))} /> {t("locationTypes.quarantine")}</label>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.temperatureControlled} onCheckedChange={v => setForm(p => ({ ...p, temperatureControlled: !!v }))} /> {t("locationTypes.tempControlledLabel")}</label>
            </div>
          </FormSection>
          <DialogFooter><Button variant="outline" onClick={() => setShowForm(false)}>{t("common.cancel")}</Button><Button onClick={save}>{t("common.save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
