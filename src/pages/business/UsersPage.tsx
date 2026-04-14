import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantUsers } from '@/lib/fake-api';
import type { TenantUser, UserRole } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { StatCard } from '@/components/StatCard';
import { UserPlus, Users, Shield, Truck, Search, Pencil, KeyRound, Clock } from 'lucide-react';
import { toast } from 'sonner';

const roleBadgeVariant: Record<UserRole, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  super_admin: 'destructive',
  manager: 'default',
  driver: 'secondary',
  sales_rep: 'outline',
  retailer: 'outline',
  accountant: 'secondary',
};

const PERMISSIONS = [
  'canManageOrders', 'canManageProducts', 'canManageCustomers', 'canManageInventory',
  'canViewReports', 'canManageDrivers', 'canManageInvoices', 'canManageSettings',
] as const;

const DEFAULT_PERMS: Record<UserRole, string[]> = {
  super_admin: [...PERMISSIONS],
  manager: [...PERMISSIONS],
  driver: ['canManageOrders'],
  sales_rep: ['canManageOrders', 'canManageCustomers', 'canViewReports'],
  retailer: ['canManageOrders'],
  accountant: ['canViewReports', 'canManageInvoices'],
};

type UserActivity = { id: string; userId: string; action: string; timestamp: string };

const MOCK_ACTIVITY: UserActivity[] = [
  { id: 'ua1', userId: 'u1', action: 'Connexion réussie', timestamp: '2025-01-15 09:00' },
  { id: 'ua2', userId: 'u1', action: 'Commande #ORD-0042 créée', timestamp: '2025-01-15 09:30' },
  { id: 'ua3', userId: 'u2', action: 'Livraison #DLV-018 terminée', timestamp: '2025-01-15 11:00' },
  { id: 'ua4', userId: 'u3', action: 'Produit "Huile Fleurial" mis à jour', timestamp: '2025-01-14 16:00' },
  { id: 'ua5', userId: 'u1', action: 'Facture #INV-0055 envoyée', timestamp: '2025-01-14 14:20' },
];

export default function UsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editUser, setEditUser] = useState<TenantUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('sales_rep');
  const [editPerms, setEditPerms] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('members');

  useEffect(() => {
    getTenantUsers().then(setUsers);
  }, []);

  const filtered = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const activeCount = users.filter(u => u.isActive).length;
  const drivers = users.filter(u => u.role === 'driver').length;
  const managers = users.filter(u => u.role === 'manager').length;

  const handleInvite = () => {
    toast.success(t('business.inviteSent'));
    setInviteOpen(false);
  };

  const openEdit = (u: TenantUser) => {
    setEditUser(u);
    setEditName(u.name);
    setEditRole(u.role);
    setEditPerms(new Set(DEFAULT_PERMS[u.role] || []));
  };

  const handleSaveEdit = () => {
    if (!editUser) return;
    setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, name: editName, role: editRole } : u));
    toast.success(t('business.userUpdated'));
    setEditUser(null);
  };

  const handleToggleActive = (u: TenantUser) => {
    setUsers(prev => prev.map(user => user.id === u.id ? { ...user, isActive: !user.isActive } : user));
    toast.success(u.isActive ? t('business.userDeactivated') : t('business.userActivated'));
  };

  const handleResetPassword = (u: TenantUser) => {
    toast.success(t('business.passwordReset'));
  };

  const togglePerm = (perm: string) => {
    setEditPerms(prev => {
      const next = new Set(prev);
      next.has(perm) ? next.delete(perm) : next.add(perm);
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('business.teamMembers')}</h1>
        <p className="text-sm text-muted-foreground">{t('business.manageStaff')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title={t('business.activeUsers')} value={activeCount} icon={Users} variant="primary" />
        <StatCard title={t('business.driversOnline')} value={drivers} icon={Truck} />
        <StatCard title={t('business.managersCount')} value={managers} icon={Shield} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="members">{t('business.allMembers')}</TabsTrigger>
          <TabsTrigger value="permissions">{t('business.permissionMatrix')}</TabsTrigger>
          <TabsTrigger value="activity">{t('business.userActivity')}</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base">{t('business.allMembers')}</CardTitle>
              <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><UserPlus className="h-4 w-4 me-2" />{t('business.inviteUser')}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('business.inviteUser')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>{t('common.email')}</Label>
                      <Input placeholder="user@company.com" type="email" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('admin.role')}</Label>
                      <Select defaultValue="sales_rep">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">{t('business.roleManager')}</SelectItem>
                          <SelectItem value="sales_rep">{t('business.roleSalesRep')}</SelectItem>
                          <SelectItem value="driver">{t('business.roleDriver')}</SelectItem>
                          <SelectItem value="accountant">{t('business.roleAccountant')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteOpen(false)}>{t('common.cancel')}</Button>
                    <Button onClick={handleInvite}>{t('business.sendInvite')}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder={t('business.searchUsers')} value={search} onChange={e => setSearch(e.target.value)} className="ps-9" />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="manager">{t('business.roleManager')}</SelectItem>
                    <SelectItem value="sales_rep">{t('business.roleSalesRep')}</SelectItem>
                    <SelectItem value="driver">{t('business.roleDriver')}</SelectItem>
                    <SelectItem value="accountant">{t('business.roleAccountant')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.name')}</TableHead>
                    <TableHead>{t('common.email')}</TableHead>
                    <TableHead>{t('admin.role')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead>{t('admin.lastLogin')}</TableHead>
                    <TableHead>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell><Badge variant={roleBadgeVariant[user.role]}>{user.role}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(user.lastLogin).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(user)} title={t('common.edit')}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleResetPassword(user)} title={t('business.resetPassword')}>
                            <KeyRound className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className={user.isActive ? 'text-destructive' : 'text-success'} onClick={() => handleToggleActive(user)}>
                            {user.isActive ? t('admin.deactivate') : t('common.active')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permission Matrix Tab */}
        <TabsContent value="permissions" className="mt-4">
          <Card>
            <CardHeader><CardTitle>{t('business.permissionMatrix')}</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('business.permissions')}</TableHead>
                      <TableHead className="text-center">{t('business.roleManager')}</TableHead>
                      <TableHead className="text-center">{t('business.roleSalesRep')}</TableHead>
                      <TableHead className="text-center">{t('business.roleDriver')}</TableHead>
                      <TableHead className="text-center">{t('business.roleAccountant')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PERMISSIONS.map(perm => (
                      <TableRow key={perm}>
                        <TableCell className="font-medium">{t(`business.${perm}`)}</TableCell>
                        {(['manager', 'sales_rep', 'driver', 'accountant'] as UserRole[]).map(role => (
                          <TableCell key={role} className="text-center">
                            <Checkbox checked={DEFAULT_PERMS[role]?.includes(perm)} disabled className="mx-auto" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4" />{t('business.userActivity')}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.date')}</TableHead>
                    <TableHead>{t('admin.user')}</TableHead>
                    <TableHead>{t('admin.action')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_ACTIVITY.map(a => {
                    const user = users.find(u => u.id === a.userId);
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{a.timestamp}</TableCell>
                        <TableCell className="font-medium">{user?.name || a.userId}</TableCell>
                        <TableCell>{a.action}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={(v) => { if (!v) setEditUser(null); }}>
        <DialogContent className="max-w-lg">
          {editUser && (
            <>
              <DialogHeader><DialogTitle>{t('business.editUser')}</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{t('common.name')}</Label>
                  <Input value={editName} onChange={e => setEditName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.role')}</Label>
                  <Select value={editRole} onValueChange={(v) => { setEditRole(v as UserRole); setEditPerms(new Set(DEFAULT_PERMS[v as UserRole] || [])); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">{t('business.roleManager')}</SelectItem>
                      <SelectItem value="sales_rep">{t('business.roleSalesRep')}</SelectItem>
                      <SelectItem value="driver">{t('business.roleDriver')}</SelectItem>
                      <SelectItem value="accountant">{t('business.roleAccountant')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('business.permissions')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PERMISSIONS.map(perm => (
                      <label key={perm} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox checked={editPerms.has(perm)} onCheckedChange={() => togglePerm(perm)} />
                        {t(`business.${perm}`)}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditUser(null)}>{t('common.cancel')}</Button>
                <Button onClick={handleSaveEdit}>{t('common.save')}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
