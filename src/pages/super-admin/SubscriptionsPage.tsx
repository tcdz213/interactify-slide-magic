import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenants, updateTenant } from '@/lib/fake-api';
import type { Tenant, SubscriptionPlan } from '@/lib/fake-api/types';
import { PlanBadge, SubStatusBadge } from '@/components/StatusBadges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, DollarSign, Users, TrendingUp, ArrowUpRight, Search, XCircle, Clock, Gift } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const mrrHistory = [
  { month: 'Nov', mrr: 18200 }, { month: 'Dec', mrr: 19800 }, { month: 'Jan', mrr: 20500 },
  { month: 'Feb', mrr: 21200 }, { month: 'Mar', mrr: 22800 }, { month: 'Apr', mrr: 23700 },
];

const PAGE_SIZE = 5;

export default function SubscriptionsPage() {
  const { t } = useTranslation();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Dialogs
  const [manageTenant, setManageTenant] = useState<Tenant | null>(null);
  const [newPlan, setNewPlan] = useState<SubscriptionPlan>('starter');
  const [cancelTenant, setCancelTenant] = useState<Tenant | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [extendTenant, setExtendTenant] = useState<Tenant | null>(null);
  const [extendDays, setExtendDays] = useState(14);
  const [discountTenant, setDiscountTenant] = useState<Tenant | null>(null);
  const [discountPct, setDiscountPct] = useState(10);

  useEffect(() => { getTenants().then(t => { setTenants(t); setLoading(false); }); }, []);

  const filtered = useMemo(() => {
    return tenants.filter(ten => {
      const matchSearch = ten.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || ten.subscriptionStatus === statusFilter;
      const matchPlan = planFilter === 'all' || ten.plan === planFilter;
      return matchSearch && matchStatus && matchPlan;
    });
  }, [tenants, search, statusFilter, planFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const active = tenants.filter(ten => ten.subscriptionStatus === 'active');
  const trials = tenants.filter(ten => ten.subscriptionStatus === 'trial');
  const totalMRR = tenants.reduce((sum, ten) => sum + ten.monthlyRevenue, 0);

  const handlePlanChange = async () => {
    if (!manageTenant) return;
    const updated = await updateTenant(manageTenant.id, { plan: newPlan });
    setTenants(prev => prev.map(t => t.id === updated.id ? updated : t));
    setManageTenant(null);
    toast.success(`${updated.name} → ${newPlan}`);
  };

  const handleCancel = async () => {
    if (!cancelTenant) return;
    const updated = await updateTenant(cancelTenant.id, { subscriptionStatus: 'suspended' });
    setTenants(prev => prev.map(t => t.id === updated.id ? updated : t));
    setCancelTenant(null); setCancelReason('');
    toast.success(`${cancelTenant.name} ${t('admin.subscriptionCancelled', 'subscription cancelled')}`);
  };

  const handleExtendTrial = async () => {
    if (!extendTenant) return;
    toast.success(`${extendTenant.name}: ${t('admin.trialExtended', 'trial extended by')} ${extendDays} ${t('admin.days', 'days')}`);
    setExtendTenant(null);
  };

  const handleApplyDiscount = async () => {
    if (!discountTenant) return;
    const newRevenue = Math.round(discountTenant.monthlyRevenue * (1 - discountPct / 100));
    const updated = await updateTenant(discountTenant.id, { monthlyRevenue: newRevenue });
    setTenants(prev => prev.map(t => t.id === updated.id ? updated : t));
    setDiscountTenant(null);
    toast.success(`${discountTenant.name}: -${discountPct}% → $${newRevenue}/mo`);
  };

  if (loading) return <div className="space-y-6"><Skeleton className="h-8 w-64" /><div className="grid gap-4 md:grid-cols-3">{[1,2,3].map(i => <Skeleton key={i} className="h-28" />)}</div><Skeleton className="h-96" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.subscriptions')}</h1><p className="text-sm text-muted-foreground">{t('admin.subscriptionHealth')}</p></div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title={t('admin.totalMRR')} value={`$${totalMRR.toLocaleString()}`} icon={DollarSign} variant="accent" trend={{ value: 8.5, label: t('admin.growth') }} />
        <StatCard title={t('admin.activeSubscriptions')} value={active.length} icon={CreditCard} variant="primary" />
        <StatCard title={t('admin.activeTrials')} value={trials.length} subtitle={t('admin.convertBeforeExpiry')} icon={Users} variant="warning" />
        <StatCard title={t('admin.avgRevenue', 'ARPU')} value={`$${tenants.length ? Math.round(totalMRR / tenants.length) : 0}`} icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4 text-primary" />MRR Trend</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={mrrHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'MRR']} />
              <Line type="monotone" dataKey="mrr" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('common.search')} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="ps-9" />
            </div>
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="active">{t('common.active')}</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="suspended">{t('admin.suspended', 'Suspended')}</SelectItem>
                <SelectItem value="cancelled">{t('admin.cancelled', 'Cancelled')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={v => { setPlanFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary">{filtered.length} {t('common.items')}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.company')}</TableHead>
                <TableHead>{t('admin.plan')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('admin.mrr')}</TableHead>
                <TableHead>{t('common.since')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(ten => (
                <TableRow key={ten.id}>
                  <TableCell className="font-medium">{ten.name}</TableCell>
                  <TableCell><PlanBadge plan={ten.plan} /></TableCell>
                  <TableCell><SubStatusBadge status={ten.subscriptionStatus} /></TableCell>
                  <TableCell className="font-medium">${ten.monthlyRevenue}</TableCell>
                  <TableCell className="text-muted-foreground">{ten.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setManageTenant(ten); setNewPlan(ten.plan); }}><ArrowUpRight className="h-3.5 w-3.5 me-1" />{t('common.manage')}</Button>
                      {ten.subscriptionStatus === 'trial' && (
                        <Button variant="ghost" size="icon" title={t('admin.extendTrial', 'Extend trial')} onClick={() => setExtendTenant(ten)}><Clock className="h-3.5 w-3.5" /></Button>
                      )}
                      {ten.subscriptionStatus === 'active' && (
                        <>
                          <Button variant="ghost" size="icon" title={t('admin.applyDiscount', 'Discount')} onClick={() => setDiscountTenant(ten)}><Gift className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" title={t('common.cancel')} onClick={() => setCancelTenant(ten)}><XCircle className="h-3.5 w-3.5 text-destructive" /></Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <p className="text-muted-foreground">{(page-1)*PAGE_SIZE+1}-{Math.min(page*PAGE_SIZE, filtered.length)} / {filtered.length}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p-1)}>{t('common.previous')}</Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p+1)}>{t('common.next')}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Change Dialog */}
      <Dialog open={!!manageTenant} onOpenChange={() => setManageTenant(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('common.manage')} — {manageTenant?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">{t('admin.currentPlan', 'Current Plan')}</span>
              <PlanBadge plan={manageTenant?.plan || 'starter'} />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.changePlan', 'Change Plan')}</Label>
              <Select value={newPlan} onValueChange={v => setNewPlan(v as SubscriptionPlan)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter — $29/mo</SelectItem>
                  <SelectItem value="professional">Professional — $79/mo</SelectItem>
                  <SelectItem value="enterprise">Enterprise — $199/mo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManageTenant(null)}>{t('common.cancel')}</Button>
            <Button onClick={handlePlanChange} disabled={newPlan === manageTenant?.plan}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog open={!!cancelTenant} onOpenChange={() => setCancelTenant(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('admin.cancelSubscription', 'Cancel Subscription')}</DialogTitle><DialogDescription>{cancelTenant?.name}</DialogDescription></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <p className="text-sm text-destructive font-medium">{t('admin.cancelWarning', 'This will suspend the subscription immediately.')}</p>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.cancelReason', 'Cancellation reason')}</Label>
              <Textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder={t('admin.cancelReasonPlaceholder', 'Why is this subscription being cancelled?')} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTenant(null)}>{t('common.cancel')}</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={!cancelReason}>{t('admin.confirmCancel', 'Confirm cancellation')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Trial Dialog */}
      <Dialog open={!!extendTenant} onOpenChange={() => setExtendTenant(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('admin.extendTrial', 'Extend Trial')} — {extendTenant?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>{t('admin.extendDays', 'Additional days')}</Label>
              <Select value={String(extendDays)} onValueChange={v => setExtendDays(+v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 {t('admin.days', 'days')}</SelectItem>
                  <SelectItem value="14">14 {t('admin.days', 'days')}</SelectItem>
                  <SelectItem value="30">30 {t('admin.days', 'days')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendTenant(null)}>{t('common.cancel')}</Button>
            <Button onClick={handleExtendTrial}>{t('admin.extend', 'Extend')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discount Dialog */}
      <Dialog open={!!discountTenant} onOpenChange={() => setDiscountTenant(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('admin.applyDiscount', 'Apply Discount')} — {discountTenant?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">{t('admin.currentMRR', 'Current MRR')}</span>
              <span className="font-semibold">${discountTenant?.monthlyRevenue}/mo</span>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.discountPct', 'Discount %')}</Label>
              <Select value={String(discountPct)} onValueChange={v => setDiscountPct(+v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="15">15%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                  <SelectItem value="25">25%</SelectItem>
                  <SelectItem value="50">50%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {discountTenant && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                {t('admin.newPrice', 'New price')}: <span className="font-semibold">${Math.round(discountTenant.monthlyRevenue * (1 - discountPct / 100))}/mo</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscountTenant(null)}>{t('common.cancel')}</Button>
            <Button onClick={handleApplyDiscount}>{t('admin.applyDiscount', 'Apply')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
