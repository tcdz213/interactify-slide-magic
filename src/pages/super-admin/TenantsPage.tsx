import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenants, createTenant, suspendTenant, activateTenant, updateTenant } from '@/lib/fake-api';
import type { Tenant, TenantStatus, SubscriptionPlan } from '@/lib/fake-api/types';
import { PlanBadge, TenantStatusBadge, SubStatusBadge } from '@/components/StatusBadges';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Building2, Mail, Phone, MoreHorizontal, Ban, CheckCircle, Eye, MapPin, Edit, Download, Trash2, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';

const PAGE_SIZE = 5;

type SortField = 'name' | 'usersCount' | 'monthlyRevenue' | 'createdAt';

export default function TenantsPage() {
  const { t } = useTranslation();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ tenant: Tenant; action: 'suspend' | 'activate' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Create form
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPlan, setFormPlan] = useState<SubscriptionPlan>('starter');

  useEffect(() => { getTenants().then(t => { setTenants(t); setLoading(false); }); }, []);

  const filtered = useMemo(() => {
    let result = tenants.filter(ten => {
      const matchSearch = ten.name.toLowerCase().includes(search.toLowerCase()) || ten.contactEmail.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || ten.status === statusFilter;
      const matchPlan = planFilter === 'all' || ten.plan === planFilter;
      return matchSearch && matchStatus && matchPlan;
    });
    result.sort((a, b) => {
      const aVal = a[sortField]; const bVal = b[sortField];
      if (typeof aVal === 'number' && typeof bVal === 'number') return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
    return result;
  }, [tenants, search, statusFilter, planFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleCreate = async () => {
    if (!formName || !formEmail) { toast.error(t('common.required')); return; }
    const newTenant = await createTenant({ name: formName, contactEmail: formEmail, contactPhone: formPhone, address: formAddress, plan: formPlan, status: 'onboarding', subscriptionStatus: 'trial' });
    setTenants(prev => [newTenant, ...prev]);
    setCreateOpen(false);
    setFormName(''); setFormEmail(''); setFormPhone(''); setFormAddress('');
    toast.success(`${newTenant.name} ${t('common.created')}`);
  };

  const handleEdit = async () => {
    if (!editTenant) return;
    const updated = await updateTenant(editTenant.id, { name: formName, contactEmail: formEmail, contactPhone: formPhone, address: formAddress, plan: formPlan });
    setTenants(prev => prev.map(t => t.id === updated.id ? updated : t));
    setEditOpen(false);
    setEditTenant(null);
    toast.success(`${updated.name} ${t('admin.updated', 'updated')}`);
  };

  const openEdit = (tenant: Tenant) => {
    setEditTenant(tenant);
    setFormName(tenant.name);
    setFormEmail(tenant.contactEmail);
    setFormPhone(tenant.contactPhone);
    setFormAddress(tenant.address);
    setFormPlan(tenant.plan);
    setEditOpen(true);
  };

  const handleSuspend = async (tenant: Tenant) => {
    const updated = await suspendTenant(tenant.id);
    setTenants(prev => prev.map(t => t.id === updated.id ? updated : t));
    toast.success(`${tenant.name} ${t('admin.suspended', 'suspended')}`);
  };

  const handleActivate = async (tenant: Tenant) => {
    const updated = await activateTenant(tenant.id);
    setTenants(prev => prev.map(t => t.id === updated.id ? updated : t));
    toast.success(`${tenant.name} ${t('admin.activated', 'activated')}`);
  };

  const toggleSelect = (id: string) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginated.map(t => t.id)));
  };

  const handleBulkSuspend = async () => {
    for (const id of selectedIds) {
      const ten = tenants.find(t => t.id === id);
      if (ten && ten.status === 'active') await suspendTenant(id);
    }
    const updated = await getTenants();
    setTenants(updated);
    setSelectedIds(new Set());
    setBulkConfirmOpen(false);
    toast.success(t('admin.bulkSuspended', `${selectedIds.size} tenants suspended`));
  };

  const handleExport = () => {
    const csv = ['Company,Email,Status,Plan,Users,Revenue,Created', ...filtered.map(t => `${t.name},${t.contactEmail},${t.status},${t.plan},${t.usersCount},${t.monthlyRevenue},${t.createdAt}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'tenants-export.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('common.exported', 'Exported'));
  };

  if (loading) return <div className="space-y-6"><Skeleton className="h-8 w-64" /><Skeleton className="h-12 w-full" /><Skeleton className="h-96 w-full" /></div>;

  const tenantFormContent = (
    <div className="space-y-4 pt-2">
      <div className="space-y-2"><Label>{t('admin.tenantName')}</Label><Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Entreprise XYZ" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Label>{t('common.email')}</Label><Input value={formEmail} onChange={e => setFormEmail(e.target.value)} type="email" placeholder="admin@xyz.dz" /></div>
        <div className="space-y-2"><Label>{t('common.phone')}</Label><Input value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="+213 555 0000" /></div>
      </div>
      <div className="space-y-2"><Label>{t('common.address')}</Label><Input value={formAddress} onChange={e => setFormAddress(e.target.value)} placeholder="Zone Industrielle, Alger" /></div>
      <div className="space-y-2">
        <Label>{t('admin.plan')}</Label>
        <Select value={formPlan} onValueChange={v => setFormPlan(v as SubscriptionPlan)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="starter">Starter</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('admin.tenantManagement')}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.manageCompanies')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 me-1" />{t('common.export')}</Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />{t('admin.addTenant')}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t('admin.addTenant')}</DialogTitle><DialogDescription>{t('admin.createTenantDesc', 'Ajouter un nouveau tenant à la plateforme')}</DialogDescription></DialogHeader>
              {tenantFormContent}
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>{t('common.cancel')}</Button>
                <Button onClick={handleCreate}>{t('common.save')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('common.search')} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="ps-9" />
            </div>
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder={t('common.status')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="active">{t('common.active')}</SelectItem>
                <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={v => { setPlanFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder={t('admin.plan')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary">{filtered.length} {t('common.items')}</Badge>
            {selectedIds.size > 0 && (
              <Button variant="destructive" size="sm" onClick={() => setBulkConfirmOpen(true)}>
                <Ban className="h-3.5 w-3.5 me-1" />{t('admin.suspendSelected', `Suspend ${selectedIds.size}`)}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox checked={selectedIds.size === paginated.length && paginated.length > 0} onCheckedChange={toggleAll} /></TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('name')}>{t('common.company')} <ArrowUpDown className="inline h-3 w-3" /></TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('admin.plan')}</TableHead>
                <TableHead>{t('admin.subscription')}</TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('usersCount')}>{t('admin.usersCount')} <ArrowUpDown className="inline h-3 w-3" /></TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('monthlyRevenue')}>{t('dashboard.revenue')} <ArrowUpDown className="inline h-3 w-3" /></TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(ten => (
                <TableRow key={ten.id}>
                  <TableCell><Checkbox checked={selectedIds.has(ten.id)} onCheckedChange={() => toggleSelect(ten.id)} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Building2 className="h-4 w-4 text-primary" /></div>
                      <div><p className="font-medium">{ten.name}</p><p className="text-xs text-muted-foreground">{ten.contactEmail}</p></div>
                    </div>
                  </TableCell>
                  <TableCell><TenantStatusBadge status={ten.status} /></TableCell>
                  <TableCell><PlanBadge plan={ten.plan} /></TableCell>
                  <TableCell><SubStatusBadge status={ten.subscriptionStatus} /></TableCell>
                  <TableCell>{ten.usersCount}</TableCell>
                  <TableCell className="font-medium">${ten.monthlyRevenue}/mo</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedTenant(ten); setSheetOpen(true); }}><Eye className="h-4 w-4 me-2" />{t('common.view')}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(ten)}><Edit className="h-4 w-4 me-2" />{t('common.edit')}</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {ten.status === 'active' ? (
                          <DropdownMenuItem className="text-destructive" onClick={() => setConfirmAction({ tenant: ten, action: 'suspend' })}><Ban className="h-4 w-4 me-2" />{t('admin.actionSuspend')}</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => setConfirmAction({ tenant: ten, action: 'activate' })}><CheckCircle className="h-4 w-4 me-2" />{t('common.active')}</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <p className="text-muted-foreground">{t('common.showing')} {(page-1)*PAGE_SIZE+1}-{Math.min(page*PAGE_SIZE, filtered.length)} {t('common.of')} {filtered.length}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p-1)}>{t('common.previous')}</Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p+1)}>{t('common.next')}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tenant detail sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader><SheetTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" />{selectedTenant?.name}</SheetTitle></SheetHeader>
          {selectedTenant && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">{t('common.status')}</p><TenantStatusBadge status={selectedTenant.status} /></div>
                <div><p className="text-xs text-muted-foreground">{t('admin.plan')}</p><PlanBadge plan={selectedTenant.plan} /></div>
                <div><p className="text-xs text-muted-foreground">{t('admin.subscription')}</p><SubStatusBadge status={selectedTenant.subscriptionStatus} /></div>
                <div><p className="text-xs text-muted-foreground">{t('common.created')}</p><p className="text-sm font-medium">{selectedTenant.createdAt}</p></div>
              </div>
              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center gap-2 text-sm"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{selectedTenant.contactEmail}</div>
                <div className="flex items-center gap-2 text-sm"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{selectedTenant.contactPhone}</div>
                <div className="flex items-center gap-2 text-sm"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{selectedTenant.address}</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border p-3 text-center"><p className="text-lg font-bold">{selectedTenant.usersCount}</p><p className="text-xs text-muted-foreground">{t('admin.usersCount')}</p></div>
                <div className="rounded-lg border p-3 text-center"><p className="text-lg font-bold">{selectedTenant.warehousesCount}</p><p className="text-xs text-muted-foreground">{t('nav.warehouses')}</p></div>
                <div className="rounded-lg border p-3 text-center"><p className="text-lg font-bold">${selectedTenant.monthlyRevenue}</p><p className="text-xs text-muted-foreground">{t('admin.mrr')}</p></div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => { setSheetOpen(false); openEdit(selectedTenant); }}><Edit className="h-4 w-4 me-2" />{t('common.edit')}</Button>
                {selectedTenant.status === 'active' ? (
                  <Button variant="destructive" className="flex-1" onClick={() => { setSheetOpen(false); setConfirmAction({ tenant: selectedTenant, action: 'suspend' }); }}><Ban className="h-4 w-4 me-2" />{t('admin.actionSuspend')}</Button>
                ) : (
                  <Button className="flex-1" onClick={() => { setSheetOpen(false); setConfirmAction({ tenant: selectedTenant, action: 'activate' }); }}><CheckCircle className="h-4 w-4 me-2" />{t('common.active')}</Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit tenant dialog */}
      <Dialog open={editOpen} onOpenChange={v => { setEditOpen(v); if (!v) setEditTenant(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('common.edit')} — {editTenant?.name}</DialogTitle></DialogHeader>
          {tenantFormContent}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleEdit}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm suspend/activate */}
      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
        title={t('common.areYouSure')}
        description={confirmAction ? `${confirmAction.action === 'suspend' ? t('admin.actionSuspend') : t('common.active')} ${confirmAction.tenant.name}?` : ''}
        onConfirm={() => { if (confirmAction?.action === 'suspend') handleSuspend(confirmAction.tenant); else if (confirmAction?.action === 'activate') handleActivate(confirmAction.tenant); setConfirmAction(null); }}
      />

      {/* Bulk confirm */}
      <ConfirmDialog
        open={bulkConfirmOpen}
        onOpenChange={setBulkConfirmOpen}
        title={t('common.areYouSure')}
        description={t('admin.bulkSuspendDesc', `Suspend ${selectedIds.size} selected tenants?`)}
        onConfirm={handleBulkSuspend}
      />
    </div>
  );
}
