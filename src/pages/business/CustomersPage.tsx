import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, getOrders } from '@/lib/fake-api';
import type { Customer, CustomerSegment, Order } from '@/lib/fake-api/types';
import { SegmentBadge } from '@/components/StatusBadges';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { KPIWidget } from '@/components/KPIWidget';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Users, Ghost, Pencil, Trash2, Eye, Download, FileText, CreditCard, AlertTriangle, Upload, MapPin, ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';

const emptyForm = { name: '', segment: 'superette' as CustomerSegment, isShadow: false, email: '', phone: '', address: '', creditLimit: 0, lat: '', lng: '', notes: '' };
const PAGE_SIZE = 10;

export default function CustomersPage() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
  const [statementCustomer, setStatementCustomer] = useState<Customer | null>(null);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [importOpen, setImportOpen] = useState(false);
  const [importData, setImportData] = useState<{ rows: any[]; errors: string[] }>({ rows: [], errors: [] });
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = () => Promise.all([getCustomers(), getOrders()]).then(([c, o]) => { setCustomers(c); setOrders(o); });
  useEffect(() => { load(); }, []);

  const fmt = (n: number) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(n);

  const openCreate = (shadow = false) => {
    setEditing(null);
    setForm({ ...emptyForm, isShadow: shadow });
    setDialogOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ name: c.name, segment: c.segment, isShadow: c.isShadow, email: c.email, phone: c.phone, address: c.address, creditLimit: (c as any).creditLimit || 0, lat: (c as any).lat || '', lng: (c as any).lng || '', notes: (c as any).notes || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error(t('common.error')); return; }
    if (form.lat && isNaN(Number(form.lat))) { toast.error(t('customers.invalidGPS')); return; }
    if (form.lng && isNaN(Number(form.lng))) { toast.error(t('customers.invalidGPS')); return; }
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

  const handleExport = () => {
    const csv = ['Name,Segment,Phone,Email,Address,Lat,Lng,Orders,TotalSpent,CreditLimit'];
    filtered.forEach(c => csv.push(`"${c.name}",${c.segment},${c.phone},${c.email},"${c.address}",${(c as any).lat || ''},${(c as any).lng || ''},${c.totalOrders},${c.totalSpent},${(c as any).creditLimit || 0}`));
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'customers.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('common.export'));
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) { toast.error(t('customers.importEmpty')); return; }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const nameIdx = headers.indexOf('name');
      const phoneIdx = headers.indexOf('phone');
      const segIdx = headers.indexOf('segment');
      const emailIdx = headers.indexOf('email');
      const addressIdx = headers.indexOf('address');
      const latIdx = headers.indexOf('lat');
      const lngIdx = headers.indexOf('lng');

      if (nameIdx === -1) { toast.error(t('customers.importMissingName')); return; }

      const rows: any[] = [];
      const errors: string[] = [];
      lines.slice(1).forEach((line, i) => {
        const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        const name = cols[nameIdx];
        if (!name) { errors.push(`${t('customers.importRow')} ${i + 2}: ${t('customers.importMissingName')}`); return; }
        const seg = segIdx >= 0 ? cols[segIdx] : 'superette';
        if (seg && !['superette', 'wholesale', 'shadow'].includes(seg)) { errors.push(`${t('customers.importRow')} ${i + 2}: ${t('customers.importInvalidSegment')} "${seg}"`); }
        const lat = latIdx >= 0 ? cols[latIdx] : '';
        const lng = lngIdx >= 0 ? cols[lngIdx] : '';
        if (lat && isNaN(Number(lat))) { errors.push(`${t('customers.importRow')} ${i + 2}: ${t('customers.invalidGPS')}`); }
        rows.push({ name, segment: (['superette', 'wholesale'].includes(seg) ? seg : 'superette') as CustomerSegment, phone: phoneIdx >= 0 ? cols[phoneIdx] : '', email: emailIdx >= 0 ? cols[emailIdx] : '', address: addressIdx >= 0 ? cols[addressIdx] : '', isShadow: seg === 'shadow', lat, lng });
      });
      setImportData({ rows, errors });
      setImportOpen(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportConfirm = async () => {
    setSaving(true);
    let count = 0;
    for (const row of importData.rows) {
      try { await createCustomer(row); count++; } catch { /* skip */ }
    }
    toast.success(t('customers.importSuccess', { count }));
    await load();
    setImportOpen(false);
    setSaving(false);
  };

  const handleBulkDelete = async () => {
    for (const id of selected) {
      try { await deleteCustomer(id); } catch { /* skip */ }
    }
    toast.success(t('common.success'));
    setSelected(new Set());
    await load();
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleSelectAll = () => {
    if (selected.size === paginatedFiltered.length) setSelected(new Set());
    else setSelected(new Set(paginatedFiltered.map(c => c.id)));
  };

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchSegment = segmentFilter === 'all' || c.segment === segmentFilter;
    return matchSearch && matchSegment;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedFiltered = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalCustomers = customers.length;
  const shadowCount = customers.filter(c => c.isShadow).length;
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const avgOrderValue = customers.length > 0 ? totalRevenue / Math.max(customers.reduce((s, c) => s + c.totalOrders, 0), 1) : 0;
  const customerOrders = (customerId: string) => orders.filter(o => o.customerId === customerId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('customers.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('customers.manageRetailers')}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="gap-2" onClick={handleExport}><Download className="h-4 w-4" />{t('common.export')}</Button>
          <Button variant="outline" className="gap-2 relative">
            <Upload className="h-4 w-4" />{t('customers.import')}
            <input type="file" accept=".csv" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImportFile} />
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => openCreate(true)}><Ghost className="h-4 w-4" />{t('customers.addShadow')}</Button>
          <Button className="gap-2" onClick={() => openCreate()}><Plus className="h-4 w-4" />{t('customers.addCustomer')}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIWidget title={t('customers.totalCustomers')} value={totalCustomers} icon={<Users className="h-5 w-5" />} />
        <KPIWidget title={t('customers.shadowCustomers')} value={shadowCount} icon={<Ghost className="h-5 w-5" />} />
        <KPIWidget title={t('customers.totalRevenue')} value={fmt(totalRevenue)} icon={<CreditCard className="h-5 w-5" />} trend="up" trendValue="+15%" />
        <KPIWidget title={t('customers.avgOrderValue')} value={fmt(avgOrderValue)} icon={<FileText className="h-5 w-5" />} />
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
          <CheckSquare className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{selected.size} {t('common.selected')}</span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}><Trash2 className="h-3.5 w-3.5 mr-1" />{t('common.delete')}</Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('customers.searchCustomers')} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="ps-9" />
            </div>
            <Select value={segmentFilter} onValueChange={v => { setSegmentFilter(v); setPage(1); }}>
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
                <TableHead className="w-10">
                  <input type="checkbox" checked={selected.size === paginatedFiltered.length && paginatedFiltered.length > 0} onChange={toggleSelectAll} className="rounded border-input" />
                </TableHead>
                <TableHead>{t('customers.title')}</TableHead>
                <TableHead>{t('customers.segment')}</TableHead>
                <TableHead>{t('common.type')}</TableHead>
                <TableHead>{t('common.phone')}</TableHead>
                <TableHead>{t('orders.title')}</TableHead>
                <TableHead>{t('customers.totalSpent')}</TableHead>
                <TableHead>{t('customers.creditLimit')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedFiltered.map(c => {
                const creditLimit = (c as any).creditLimit || 500000;
                const overLimit = c.totalSpent > creditLimit * 0.9;
                const hasGPS = (c as any).lat && (c as any).lng;
                return (
                  <TableRow key={c.id} className={selected.has(c.id) ? 'bg-primary/5' : ''}>
                    <TableCell>
                      <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="rounded border-input" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium">{c.name}</p>
                            {hasGPS && <MapPin className="h-3 w-3 text-success" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{c.address}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><SegmentBadge segment={c.segment} /></TableCell>
                    <TableCell>
                      {c.isShadow ? (
                        <Badge variant="outline" className="bg-muted text-muted-foreground gap-1"><Ghost className="h-3 w-3" /> {t('customers.shadow')}</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">{t('common.registered')}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{c.phone}</TableCell>
                    <TableCell>{c.totalOrders}</TableCell>
                    <TableCell className="font-medium">{fmt(c.totalSpent)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {overLimit && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
                        <span className={overLimit ? 'text-warning font-medium' : 'text-muted-foreground'}>{fmt(creditLimit)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setDetailCustomer(c)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setStatementCustomer(c)} title={t('customers.statement')}><FileText className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(c)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginatedFiltered.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">{t('common.noData')}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-muted-foreground">{t('common.showing')} {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button key={i} variant={page === i + 1 ? 'default' : 'outline'} size="sm" onClick={() => setPage(i + 1)}>{i + 1}</Button>
                ))}
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog with GPS */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? t('common.edit') : t('customers.addCustomer')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {t('customers.latitude')}</Label>
                <Input type="text" placeholder="36.7538" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {t('customers.longitude')}</Label>
                <Input type="text" placeholder="3.0588" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('customers.creditLimit')} (DZD)</Label>
              <Input type="number" value={form.creditLimit} onChange={e => setForm(f => ({ ...f, creditLimit: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>{t('customers.notes')}</Label>
              <Textarea placeholder={t('customers.notesPlaceholder')} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
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
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{detailCustomer?.name}</DialogTitle></DialogHeader>
          {detailCustomer && (
            <Tabs defaultValue="info">
              <TabsList className="w-full">
                <TabsTrigger value="info" className="flex-1">{t('common.details')}</TabsTrigger>
                <TabsTrigger value="orders" className="flex-1">{t('orders.title')}</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-3 mt-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">{t('customers.segment')}:</span> <SegmentBadge segment={detailCustomer.segment} /></div>
                  <div><span className="text-muted-foreground">{t('common.type')}:</span> {detailCustomer.isShadow ? t('customers.shadow') : t('common.registered')}</div>
                  <div><span className="text-muted-foreground">{t('common.email')}:</span> {detailCustomer.email || '—'}</div>
                  <div><span className="text-muted-foreground">{t('common.phone')}:</span> {detailCustomer.phone}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">{t('common.address')}:</span> {detailCustomer.address}</div>
                  {((detailCustomer as any).lat || (detailCustomer as any).lng) && (
                    <div className="col-span-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-success" />
                      <span className="text-muted-foreground">GPS:</span> {(detailCustomer as any).lat}, {(detailCustomer as any).lng}
                    </div>
                  )}
                  {(detailCustomer as any).notes && (
                    <div className="col-span-2"><span className="text-muted-foreground">{t('customers.notes')}:</span> {(detailCustomer as any).notes}</div>
                  )}
                </div>
                <div className="border-t pt-3 grid grid-cols-3 gap-3">
                  <Card className="p-3 text-center">
                    <p className="text-2xl font-bold">{detailCustomer.totalOrders}</p>
                    <p className="text-xs text-muted-foreground">{t('orders.title')}</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <p className="text-2xl font-bold">{fmt(detailCustomer.totalSpent)}</p>
                    <p className="text-xs text-muted-foreground">{t('customers.totalSpent')}</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <p className="text-2xl font-bold">{fmt((detailCustomer as any).creditLimit || 500000)}</p>
                    <p className="text-xs text-muted-foreground">{t('customers.creditLimit')}</p>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="orders" className="mt-3">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {customerOrders(detailCustomer.id).length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">{t('common.noData')}</p>
                  ) : customerOrders(detailCustomer.id).map(o => (
                    <div key={o.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{o.id.toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm">{fmt(o.totalAmount)}</span>
                        <StatusBadge status={o.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Statement Dialog */}
      <Dialog open={!!statementCustomer} onOpenChange={() => setStatementCustomer(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('customers.statement')} — {statementCustomer?.name}</DialogTitle></DialogHeader>
          {statementCustomer && (() => {
            const custOrders = customerOrders(statementCustomer.id);
            const totalInvoiced = custOrders.reduce((s, o) => s + o.totalAmount, 0);
            const totalPaid = Math.round(totalInvoiced * 0.75);
            const balance = totalInvoiced - totalPaid;
            return (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-3 gap-3">
                  <Card className="p-3 text-center"><p className="text-lg font-bold">{fmt(totalInvoiced)}</p><p className="text-xs text-muted-foreground">{t('customers.totalInvoiced')}</p></Card>
                  <Card className="p-3 text-center"><p className="text-lg font-bold text-success">{fmt(totalPaid)}</p><p className="text-xs text-muted-foreground">{t('customers.totalPaid')}</p></Card>
                  <Card className="p-3 text-center"><p className="text-lg font-bold text-destructive">{fmt(balance)}</p><p className="text-xs text-muted-foreground">{t('customers.balance')}</p></Card>
                </div>
                <Table>
                  <TableHeader><TableRow><TableHead>{t('common.date')}</TableHead><TableHead>{t('orders.orderId')}</TableHead><TableHead>{t('common.total')}</TableHead><TableHead>{t('common.status')}</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {custOrders.map(o => (
                      <TableRow key={o.id}>
                        <TableCell className="text-sm">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell className="font-mono text-sm">{o.id.toUpperCase()}</TableCell>
                        <TableCell className="font-medium">{fmt(o.totalAmount)}</TableCell>
                        <TableCell><StatusBadge status={o.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button variant="outline" className="w-full gap-2" onClick={() => toast.success(t('customers.statementExported'))}>
                  <Download className="h-4 w-4" />{t('customers.exportStatement')}
                </Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('customers.importPreview')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">{t('customers.importReady', { count: importData.rows.length })}</p>
            {importData.errors.length > 0 && (
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 space-y-1">
                <p className="text-sm font-medium text-warning">{t('customers.importWarnings')}</p>
                {importData.errors.map((err, i) => <p key={i} className="text-xs text-muted-foreground">• {err}</p>)}
              </div>
            )}
            <div className="max-h-48 overflow-y-auto border rounded-lg">
              <Table>
                <TableHeader><TableRow><TableHead>{t('common.name')}</TableHead><TableHead>{t('customers.segment')}</TableHead><TableHead>{t('common.phone')}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {importData.rows.slice(0, 10).map((r, i) => (
                    <TableRow key={i}><TableCell className="text-sm">{r.name}</TableCell><TableCell className="text-sm">{r.segment}</TableCell><TableCell className="text-sm">{r.phone}</TableCell></TableRow>
                  ))}
                  {importData.rows.length > 10 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground text-xs">+{importData.rows.length - 10} {t('customers.importMore')}</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
            <Button className="w-full" onClick={handleImportConfirm} disabled={saving || importData.rows.length === 0}>
              {saving ? t('common.loading') : t('customers.importConfirm', { count: importData.rows.length })}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title={t('common.areYouSure')} description={t('common.cannotUndo')} onConfirm={handleDelete} />
    </div>
  );
}
