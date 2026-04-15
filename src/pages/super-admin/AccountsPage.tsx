import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { UserPlus, Search, Shield, MoreHorizontal, KeyRound, History, Eye, ShieldCheck, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { StatCard } from '@/components/StatCard';
import { toast } from 'sonner';

interface AdminAccount {
  id: string; name: string; email: string; role: 'super_admin' | 'support' | 'billing_admin';
  status: 'active' | 'inactive'; lastLogin: string; createdAt: string; twoFA: boolean;
}

interface ActivityEntry { date: string; action: string; resource: string; ip: string; }

const initialAccounts: AdminAccount[] = [
  { id: 'sa-1', name: 'Karim Benali', email: 'karim@jawda.io', role: 'super_admin', status: 'active', lastLogin: '2025-04-10 14:23', createdAt: '2024-01-15', twoFA: true },
  { id: 'sa-2', name: 'Amina Hadj', email: 'amina@jawda.io', role: 'super_admin', status: 'active', lastLogin: '2025-04-10 09:15', createdAt: '2024-02-01', twoFA: true },
  { id: 'sa-3', name: 'Youcef Khelifi', email: 'youcef@jawda.io', role: 'support', status: 'active', lastLogin: '2025-04-09 16:42', createdAt: '2024-03-10', twoFA: false },
  { id: 'sa-4', name: 'Nadia Meziane', email: 'nadia@jawda.io', role: 'billing_admin', status: 'active', lastLogin: '2025-04-08 11:30', createdAt: '2024-04-20', twoFA: false },
  { id: 'sa-5', name: 'Sofiane Boudiaf', email: 'sofiane@jawda.io', role: 'support', status: 'inactive', lastLogin: '2025-03-15 08:00', createdAt: '2024-05-05', twoFA: false },
];

const PERMISSIONS_MATRIX = [
  { id: 'tenants', label: 'Tenants' }, { id: 'billing', label: 'Billing' },
  { id: 'subscriptions', label: 'Subscriptions' }, { id: 'analytics', label: 'Analytics' },
  { id: 'audit_logs', label: 'Audit Logs' }, { id: 'settings', label: 'Settings' },
  { id: 'white_label', label: 'White Label' }, { id: 'accounts', label: 'Accounts' },
];

const ROLE_PERMS: Record<string, string[]> = {
  super_admin: PERMISSIONS_MATRIX.map(p => p.id),
  support: ['tenants', 'audit_logs'],
  billing_admin: ['billing', 'subscriptions', 'analytics'],
};

const roleBadge = (role: string) => {
  const map: Record<string, string> = { super_admin: 'bg-primary/10 text-primary border-primary/20', support: 'bg-info/10 text-info border-info/20', billing_admin: 'bg-warning/10 text-warning border-warning/20' };
  return map[role] || '';
};

const MOCK_ACTIVITY: ActivityEntry[] = [
  { date: '2025-04-10 14:23', action: 'Login', resource: 'Platform', ip: '192.168.1.45' },
  { date: '2025-04-10 14:30', action: 'Updated tenant', resource: 'Sahel Distribution', ip: '192.168.1.45' },
  { date: '2025-04-10 15:12', action: 'Suspended tenant', resource: 'Kabylie Fresh', ip: '192.168.1.45' },
  { date: '2025-04-09 09:00', action: 'Login', resource: 'Platform', ip: '10.0.0.12' },
  { date: '2025-04-09 10:30', action: 'Created user', resource: 'Atlas BTP', ip: '10.0.0.12' },
  { date: '2025-04-08 16:45', action: 'Exported report', resource: 'Revenue Q1', ip: '192.168.1.45' },
];

export default function AccountsPage() {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AdminAccount['role']>('support');
  const [deactivateTarget, setDeactivateTarget] = useState<AdminAccount | null>(null);
  const [activityAccount, setActivityAccount] = useState<AdminAccount | null>(null);
  const [permsAccount, setPermsAccount] = useState<AdminAccount | null>(null);
  const [permsSelected, setPermsSelected] = useState<Set<string>>(new Set());

  useEffect(() => { const timer = setTimeout(() => { setAccounts(initialAccounts); setLoading(false); }, 300); return () => clearTimeout(timer); }, []);

  const filtered = accounts.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || a.role === roleFilter;
    return matchSearch && matchRole;
  });

  const activeCount = accounts.filter(a => a.status === 'active').length;
  const twoFACount = accounts.filter(a => a.twoFA).length;

  const handleInvite = () => {
    if (!inviteEmail || !inviteName) { toast.error(t('common.required')); return; }
    const newAccount: AdminAccount = {
      id: `sa-${Date.now()}`, name: inviteName, email: inviteEmail,
      role: inviteRole, status: 'active', lastLogin: '—', createdAt: new Date().toISOString().split('T')[0], twoFA: false,
    };
    setAccounts(prev => [newAccount, ...prev]);
    setInviteOpen(false);
    setInviteName(''); setInviteEmail('');
    toast.success(t('business.inviteSent'));
  };

  const handleDeactivate = (account: AdminAccount) => {
    setAccounts(prev => prev.map(a => a.id === account.id ? { ...a, status: a.status === 'active' ? 'inactive' as const : 'active' as const } : a));
    toast.success(`${account.name} ${account.status === 'active' ? t('admin.deactivated', 'deactivated') : t('admin.activated', 'activated')}`);
    setDeactivateTarget(null);
  };

  const handleResetPassword = (account: AdminAccount) => toast.success(t('admin.resetSent', `Password reset link sent to ${account.email}`));

  const toggle2FA = (id: string) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, twoFA: !a.twoFA } : a));
    toast.success(t('admin.2faUpdated', '2FA updated'));
  };

  const openPerms = (account: AdminAccount) => {
    setPermsAccount(account);
    setPermsSelected(new Set(ROLE_PERMS[account.role] || []));
  };

  if (loading) return <div className="space-y-6"><Skeleton className="h-8 w-64" /><Skeleton className="h-96" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('admin.accounts')}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.manageAdminAccounts')}</p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild><Button><UserPlus className="h-4 w-4 me-2" />{t('admin.inviteUser')}</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('admin.inviteUser')}</DialogTitle><DialogDescription>{t('admin.inviteAdminDesc', 'Invitez un administrateur à la plateforme')}</DialogDescription></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>{t('common.name')}</Label><Input placeholder="Ahmed B." value={inviteName} onChange={e => setInviteName(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('common.email')}</Label><Input placeholder="admin@jawda.io" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>{t('admin.role')}</Label>
                <Select value={inviteRole} onValueChange={v => setInviteRole(v as AdminAccount['role'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="billing_admin">Billing Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteOpen(false)}>{t('common.cancel')}</Button>
              <Button onClick={handleInvite}>{t('admin.sendInvite')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title={t('admin.activeAdmins', 'Admins actifs')} value={activeCount} icon={Users} variant="primary" />
        <StatCard title={t('admin.totalAdmins', 'Total admins')} value={accounts.length} icon={Shield} />
        <StatCard title={t('admin.with2FA', 'Avec 2FA')} value={twoFACount} subtitle={`${Math.round(twoFACount / accounts.length * 100)}%`} icon={ShieldCheck} variant="accent" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="ps-9" placeholder={t('common.search')} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="billing_admin">Billing Admin</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary">{filtered.length} {t('admin.accounts').toLowerCase()}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('common.email')}</TableHead>
                <TableHead>{t('admin.role')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>2FA</TableHead>
                <TableHead>{t('admin.lastLogin')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(account => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"><Shield className="h-4 w-4 text-primary" /></div>
                      {account.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{account.email}</TableCell>
                  <TableCell><Badge variant="outline" className={roleBadge(account.role)}>{account.role.replace('_', ' ')}</Badge></TableCell>
                  <TableCell><Badge variant={account.status === 'active' ? 'default' : 'secondary'}>{t(`common.${account.status}`)}</Badge></TableCell>
                  <TableCell>
                    <Switch checked={account.twoFA} onCheckedChange={() => toggle2FA(account.id)} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{account.lastLogin}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openPerms(account)}><ShieldCheck className="h-4 w-4 me-2" />{t('admin.permissions', 'Permissions')}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setActivityAccount(account)}><History className="h-4 w-4 me-2" />{t('admin.activityHistory', 'Historique')}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(account)}><KeyRound className="h-4 w-4 me-2" />{t('auth.resetPassword')}</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeactivateTarget(account)}>
                          {account.status === 'active' ? t('admin.deactivate') : t('common.active')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Activity History Dialog */}
      <Dialog open={!!activityAccount} onOpenChange={() => setActivityAccount(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('admin.activityHistory', 'Historique')} — {activityAccount?.name}</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {MOCK_ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{a.action}</p>
                  <p className="text-xs text-muted-foreground">{a.resource}</p>
                </div>
                <div className="text-end">
                  <span className="text-xs text-muted-foreground">{a.date}</span>
                  <p className="text-xs font-mono text-muted-foreground">{a.ip}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Permission Matrix Dialog */}
      <Dialog open={!!permsAccount} onOpenChange={() => setPermsAccount(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('admin.permissions', 'Permissions')} — {permsAccount?.name}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {PERMISSIONS_MATRIX.map(p => (
              <label key={p.id} className="flex items-center gap-2 text-sm rounded-lg border p-3 cursor-pointer hover:bg-muted/50">
                <Checkbox checked={permsSelected.has(p.id)} onCheckedChange={c => setPermsSelected(prev => { const n = new Set(prev); c ? n.add(p.id) : n.delete(p.id); return n; })} />
                {p.label}
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermsAccount(null)}>{t('common.cancel')}</Button>
            <Button onClick={() => { toast.success(t('common.success')); setPermsAccount(null); }}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deactivateTarget}
        onOpenChange={() => setDeactivateTarget(null)}
        title={t('common.areYouSure')}
        description={deactivateTarget ? `${deactivateTarget.status === 'active' ? t('admin.deactivate') : t('common.active')} ${deactivateTarget.name}?` : ''}
        onConfirm={() => deactivateTarget && handleDeactivate(deactivateTarget)}
      />
    </div>
  );
}
