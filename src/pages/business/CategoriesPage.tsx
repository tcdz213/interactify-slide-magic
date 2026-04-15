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
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Plus, FolderTree, ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CategoriesPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '', isActive: true });
  const [saving, setSaving] = useState(false);

  const load = () => getCategories().then(data => { setCategories(data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const sorted = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', isActive: true });
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description, isActive: cat.isActive });
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

  const moveCategory = async (cat: Category, direction: 'up' | 'down') => {
    const idx = sorted.findIndex(c => c.id === cat.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const other = sorted[swapIdx];
    await Promise.all([
      updateCategory(cat.id, { displayOrder: other.displayOrder }),
      updateCategory(other.id, { displayOrder: cat.displayOrder }),
    ]);
    await load();
    toast.success(t('categories.reordered'));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">{t('common.loading')}</div></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('categories.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('categories.description')}</p>
        </div>
        <Button className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />{t('categories.addCategory')}</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderTree className="h-4 w-4 text-primary" />
            {t('categories.allCategories')} ({categories.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">{t('categories.order')}</TableHead>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('categories.descriptionField')}</TableHead>
                <TableHead>{t('categories.productCount')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((cat, idx) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    <div className="flex gap-0.5">
                      <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === 0} onClick={() => moveCategory(cat, 'up')}>
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === sorted.length - 1} onClick={() => moveCategory(cat, 'down')}>
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? t('common.edit') : t('categories.addCategory')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
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

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title={t('common.areYouSure')}
        description={t('common.cannotUndo')}
        onConfirm={handleDelete}
      />
    </div>
  );
}
