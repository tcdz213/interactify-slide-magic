import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/fake-api';
import type { Category } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Plus, FolderTree, Pencil, Trash2, ChevronUp, ChevronDown, Search, Download, Image, CheckSquare, ToggleLeft } from 'lucide-react';
import { toast } from 'sonner';

const ICONS = ['📦', '🥤', '🧴', '🍫', '🧁', '🥫', '🧃', '🍪', '🧀', '🥛', '🍚', '☕'];

export default function CategoriesPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '', isActive: true, icon: '📦' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = () => getCategories().then(data => { setCategories(data.sort((a, b) => a.displayOrder - b.displayOrder)); setLoading(false); });
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', isActive: true, icon: '📦' });
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description, isActive: cat.isActive, icon: (cat as any).icon || '📦' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error(t('common.error'), { description: t('categories.namePlaceholder') }); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing.id, form);
        toast.success(t('common.success'), { description: `${form.name} ${t('common.updated').toLowerCase()}` });
      } else {
        await createCategory({ ...form, displayOrder: categories.length + 1 });
        toast.success(t('common.success'), { description: `${form.name} ${t('common.created').toLowerCase()}` });
      }
      await load();
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(t('common.error'), { description: e.message });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id);
      toast.success(t('common.success'), { description: `${deleteTarget.name} ${t('common.delete').toLowerCase()}` });
      await load();
    } catch (e: any) {
      toast.error(t('common.error'), { description: e.message });
    }
    setDeleteTarget(null);
  };

  const moveCategory = async (idx: number, direction: 'up' | 'down') => {
    const sorted = [...filteredCategories];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;
    const tempOrder = sorted[idx].displayOrder;
    sorted[idx].displayOrder = sorted[targetIdx].displayOrder;
    sorted[targetIdx].displayOrder = tempOrder;
    await updateCategory(sorted[idx].id, { displayOrder: sorted[idx].displayOrder });
    await updateCategory(sorted[targetIdx].id, { displayOrder: sorted[targetIdx].displayOrder });
    await load();
    toast.success(t('categories.orderUpdated'));
  };

  const handleExport = () => {
    const csv = ['Name,Description,ProductCount,Active,Order,Icon'];
    categories.forEach(c => csv.push(`"${c.name}","${c.description}",${c.productsCount},${c.isActive},${c.displayOrder},${(c as any).icon || '📦'}`));
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'categories.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('common.export'));
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleSelectAll = () => {
    if (selected.size === filteredCategories.length) setSelected(new Set());
    else setSelected(new Set(filteredCategories.map(c => c.id)));
  };

  const handleBulkToggle = async (active: boolean) => {
    for (const id of selected) {
      await updateCategory(id, { isActive: active });
    }
    toast.success(t('common.success'));
    setSelected(new Set());
    await load();
  };

  const handleBulkDelete = async () => {
    let deleted = 0;
    for (const id of selected) {
      const cat = categories.find(c => c.id === id);
      if (cat && cat.productsCount === 0) {
        try { await deleteCategory(id); deleted++; } catch { /* skip */ }
      }
    }
    toast.success(t('categories.bulkDeleted', { count: deleted }));
    setSelected(new Set());
    await load();
  };

  const filteredCategories = categories.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? c.isActive : !c.isActive);
    return matchSearch && matchStatus;
  });

  const totalProducts = categories.reduce((s, c) => s + c.productsCount, 0);
  const activeCount = categories.filter(c => c.isActive).length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">{t('common.loading')}</div></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('categories.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('categories.description')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport}><Download className="h-4 w-4" />{t('common.export')}</Button>
          <Button className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />{t('categories.addCategory')}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <FolderTree className="h-8 w-8 text-primary" />
          <div><p className="text-2xl font-bold">{categories.length}</p><p className="text-xs text-muted-foreground">{t('categories.totalCategories')}</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <ToggleLeft className="h-8 w-8 text-success" />
          <div><p className="text-2xl font-bold">{activeCount}/{categories.length}</p><p className="text-xs text-muted-foreground">{t('common.active')}</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Image className="h-8 w-8 text-muted-foreground" />
          <div><p className="text-2xl font-bold">{totalProducts}</p><p className="text-xs text-muted-foreground">{t('categories.totalProducts')}</p></div>
        </Card>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
          <CheckSquare className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{selected.size} {t('common.selected')}</span>
          <Button variant="outline" size="sm" onClick={() => handleBulkToggle(true)}>{t('categories.activateAll')}</Button>
          <Button variant="outline" size="sm" onClick={() => handleBulkToggle(false)}>{t('categories.deactivateAll')}</Button>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}><Trash2 className="h-3.5 w-3.5 mr-1" />{t('common.delete')}</Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="ps-9" placeholder={t('categories.searchCategories')} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="active">{t('common.active')}</SelectItem>
                <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input type="checkbox" checked={selected.size === filteredCategories.length && filteredCategories.length > 0} onChange={toggleSelectAll} className="rounded border-input" />
                </TableHead>
                <TableHead className="w-20">{t('categories.order')}</TableHead>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('categories.descriptionField')}</TableHead>
                <TableHead>{t('categories.productCount')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((cat, idx) => (
                <TableRow key={cat.id} className={selected.has(cat.id) ? 'bg-primary/5' : ''}>
                  <TableCell>
                    <input type="checkbox" checked={selected.has(cat.id)} onChange={() => toggleSelect(cat.id)} className="rounded border-input" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === 0} onClick={() => moveCategory(idx, 'up')}>
                        <ChevronUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === filteredCategories.length - 1} onClick={() => moveCategory(idx, 'down')}>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{(cat as any).icon || '📦'}</span>
                      <span className="font-medium">{cat.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{cat.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{cat.productsCount} {t('nav.products').toLowerCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cat.isActive ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground'}>
                      {cat.isActive ? t('common.active') : t('common.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="gap-1" onClick={() => openEdit(cat)}>
                        <Pencil className="h-3.5 w-3.5" />{t('common.edit')}
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(cat)} disabled={cat.productsCount > 0}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog with Icon picker */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? t('common.edit') : t('categories.addCategory')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>{t('categories.icon')}</Label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map(icon => (
                  <button key={icon} type="button" onClick={() => setForm(f => ({ ...f, icon }))}
                    className={`text-xl p-2 rounded-lg border transition-colors ${form.icon === icon ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-muted'}`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('common.name')}</Label>
              <Input placeholder={t('categories.namePlaceholder')} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t('categories.descriptionField')}</Label>
              <Input placeholder={t('categories.descPlaceholder')} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex items-center justify-between">
              <Label>{t('common.active')}</Label>
              <Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title={t('common.areYouSure')}
        description={deleteTarget?.productsCount ? t('categories.cannotDeleteWithProducts') : t('common.cannotUndo')}
        onConfirm={handleDelete}
      />
    </div>
  );
}
