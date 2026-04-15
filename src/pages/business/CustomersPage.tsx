import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/lib/fake-api';
import type { Customer, CustomerSegment } from '@/lib/fake-api/types';
import { SegmentBadge } from '@/components/StatusBadges';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Plus, Search, Users, Ghost, Pencil, Trash2, Eye, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

const emptyForm = { name: '', segment: 'superette' as CustomerSegment, isShadow: false, email: '', phone: '', address: '', creditLimit: 0 };

export default function CustomersPage() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => getCustomers().then(setCustomers);
  useEffect(() => { load(); }, []);

  const fmt = (n: number) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(n);

  const openCreate = (shadow = false) => {
    setEditing(null);
    setForm({ ...emptyForm, isShadow: shadow });
    setDialogOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ name: c.name, segment: c.segment, isShadow: c.isShadow, email: c.email, phone: c.phone, address: c.address, creditLimit: (c as any).creditLimit || 0 });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error(t('common.error')); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateCustomer(editing.id, form);
        toast.success(t('common.success'));
      } else {
        await createCustomer(form);
        toast.success(t('common.success'));
      }
      await load();
      setDialogOpen(false);
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCustomer(deleteTarget.id);
      toast.success(t('common.success'));
      await load();
    } catch (e: any) { toast.error(e.message); }
    setDeleteTarget(null);
  };

  const exportStatement = (c: Customer) => {
    const lines = [
      `${t('customers.statement')} — ${c.name}`,
      `${t('customers.segment')}: ${c.segment}`,
      `${t('common.phone')}: ${c.phone}`,
      `${t('common.address')}: ${c.address}`,
      '',
      `${t('orders.title')}: ${c.totalOrders}`,
      `${t('customers.totalSpent')}: ${fmt(c.totalSpent)}`,
      `${t('customers.creditLimit')}: ${fmt((c as any).creditLimit || 500000)}`,
    ].join('\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `statement-${c.name.replace(/\s/g, '_')}.txt`; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('customers.statementExported'));
  };

  const exportAll = () => {
    const csv = ['Name,Segment,Phone,Email,Orders,TotalSpent'];
    customers.forEach(c => csv.push(`"${c.name}",${c.segment},${c.phone},${c.email},${c.totalOrders},${c.totalSpent}`));
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'customers.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('common.export'));
  };

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchSegment = segmentFilter === 'all' || c.segment === segmentFilter;
    return matchSearch && matchSegment;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('customers.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('customers.manageRetailers')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={exportAll}>
            <Download className="h-4 w-4" />{t('common.export')}
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => openCreate(true)}>
            <Ghost className="h-4 w-4" />{t('customers.addShadow')}
          </Button>
          <Button className="gap-2" onClick={() => openCreate()}>
            <Plus className="h-4 w-4" />{t('customers.addCustomer')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('customers.searchCustomers')} value={search} onChange={e => setSearch(e.target.value)} className="ps-9" />
            </div>
            <Select value={segmentFilter} onValueChange={setSegmentFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="superette">Superette</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="shadow">Shadow</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('customers.title')}</TableHead>
                <TableHead>{t('customers.segment')}</TableHead>
                <TableHead>{t('common.type')}</TableHead>
                <TableHead>{t('common.phone')}</TableHead>
                <TableHead>{t('orders.title')}</TableHead>
                <TableHead>{t('customers.totalSpent')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.address}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><SegmentBadge segment={c.segment} /></TableCell>
                  <TableCell>
                    {c.isShadow ? (
                      <Badge variant="outline" className="bg-muted text-muted-foreground gap-1">
                        <Ghost className="h-3 w-3" /> {t('customers.shadow')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">{t('common.registered')}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{c.phone}</TableCell>
                  <TableCell>{c.totalOrders}</TableCell>
                  <TableCell className="font-medium">{fmt(c.totalSpent)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setDetailCustomer(c)} title={t('common.view')}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)} title={t('common.edit')}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => exportStatement(c)} title={t('customers.statement')}><FileText className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(c)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t('common.noData')}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? t('common.edit') : t('customers.addCustomer')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>{t('common.name')}</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t('customers.segment')}</Label>
              <Select value={form.segment} onValueChange={(v: CustomerSegment) => setForm(f => ({ ...f, segment: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="superette">Superette</SelectItem>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('common.email')}</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t('common.phone')}</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('common.address')}</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t('customers.creditLimit')} (DZD)</Label>
              <Input type="number" value={form.creditLimit} onChange={e => setForm(f => ({ ...f, creditLimit: Number(e.target.value) }))} min={0} />
            </div>
            <div className="flex items-center justify-between">
              <Label>{t('customers.shadow')}</Label>
              <Switch checked={form.isShadow} onCheckedChange={v => setForm(f => ({ ...f, isShadow: v }))} />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailCustomer} onOpenChange={() => setDetailCustomer(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{detailCustomer?.name}</DialogTitle></DialogHeader>
          {detailCustomer && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">{t('customers.segment')}:</span> <SegmentBadge segment={detailCustomer.segment} /></div>
                <div><span className="text-muted-foreground">{t('common.type')}:</span> {detailCustomer.isShadow ? t('customers.shadow') : t('common.registered')}</div>
                <div><span className="text-muted-foreground">{t('common.email')}:</span> {detailCustomer.email || '—'}</div>
                <div><span className="text-muted-foreground">{t('common.phone')}:</span> {detailCustomer.phone}</div>
                <div className="col-span-2"><span className="text-muted-foreground">{t('common.address')}:</span> {detailCustomer.address}</div>
                <div><span className="text-muted-foreground">{t('customers.creditLimit')}:</span> {fmt((detailCustomer as any).creditLimit || 500000)}</div>
              </div>
              <div className="border-t pt-3 grid grid-cols-2 gap-3">
                <Card className="p-3 text-center">
                  <p className="text-2xl font-bold">{detailCustomer.totalOrders}</p>
                  <p className="text-xs text-muted-foreground">{t('orders.title')}</p>
                </Card>
                <Card className="p-3 text-center">
                  <p className="text-2xl font-bold">{fmt(detailCustomer.totalSpent)}</p>
                  <p className="text-xs text-muted-foreground">{t('customers.totalSpent')}</p>
                </Card>
              </div>
              <Button variant="outline" className="w-full gap-2" onClick={() => exportStatement(detailCustomer)}>
                <FileText className="h-4 w-4" />{t('customers.exportStatement')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title={t('common.areYouSure')} description={t('common.cannotUndo')} onConfirm={handleDelete} />
    </div>
  );
}
