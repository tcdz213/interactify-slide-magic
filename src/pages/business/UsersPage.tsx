import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantUsers } from '@/lib/fake-api';
import type { TenantUser, UserRole } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/StatCard';
import { UserPlus, Users, Shield, Truck, Search, MoreHorizontal, Key, History, Eye, Ban, RefreshCw } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const roleBadgeVariant: Record<UserRole, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  super_admin: 'destructive', manager: 'default', driver: 'secondary', sales_rep: 'outline', retailer: 'outline', accountant: 'secondary',
};

const PERMISSIONS = [
  { id: 'products', label: 'Produits' },
  { id: 'orders', label: 'Commandes' },
  { id: 'customers', label: 'Clients' },
  { id: 'inventory', label: 'Inventaire' },
  { id: 'invoices', label: 'Factures' },
  { id: 'reports', label: 'Rapports' },
  { id: 'settings', label: 'Paramètres' },
  { id: 'users', label: 'Utilisateurs' },
];

interface UserActivity { date: string; action: string; resource: string; }

export default function UsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editUser, setEditUser] = useState<TenantUser | null>(null);
  const [activityUser, setActivityUser] = useState<TenantUser | null>(null);
  const [permissionsUser, setPermissionsUser] = useState<TenantUser | null>(null);
  const [inviteForm, setInviteForm] = useState({ email: '', name: '', role: 'sales_rep' as UserRole, warehouse: 'w1' });
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set(PERMISSIONS.map(p => p.id)));

  useEffect(() => { getTenantUsers().then(setUsers); }, []);

  const filtered = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const activeCount = users.filter(u => u.isActive).length;
  const drivers = users.filter(u => u.role === 'driver').length;
  const managers = users.filter(u => u.role === 'manager').length;

  const handleInvite = () => {
    if (!inviteForm.email || !inviteForm.name) { toast.error(t('common.required')); return; }
    const newUser: TenantUser = {
      id: `u${Date.now()}`, tenantId: 't1', name: inviteForm.name, email: inviteForm.email,
      role: inviteForm.role, isActive: true, lastLogin: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    toast.success(t('business.inviteSent'));
    setInviteOpen(false);
    setInviteForm({ email: '', name: '', role: 'sales_rep', warehouse: 'w1' });
  };

  const toggleActive = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
    toast.success(t('common.success'));
  };

  const handlePasswordReset = (user: TenantUser) => {
    toast.success(t('users.resetSent', { email: user.email, defaultValue: `Lien de réinitialisation envoyé à ${user.email}` }));
  };

  const mockActivity: UserActivity[] = [
    { date: '2025-04-12 14:32', action: 'Commande créée', resource: 'ORD-2024-0342' },
    { date: '2025-04-12 10:15', action: 'Produit modifié', resource: 'Couscous Fin 1kg' },
    { date: '2025-04-11 16:40', action: 'Livraison terminée', resource: 'DEL-0089' },
    { date: '2025-04-11 09:00', action: 'Connexion', resource: '—' },
    { date: '2025-04-10 15:22', action: 'Facture créée', resource: 'FA-1041' },
  ];

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
                <DialogDescription>{t('users.inviteDesc', 'Envoyez une invitation par email')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{t('common.name')}</Label>
                  <Input value={inviteForm.name} onChange={e => setInviteForm(p => ({ ...p, name: e.target.value }))} placeholder="Ahmed B." />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.email')}</Label>
                  <Input value={inviteForm.email} onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))} placeholder="user@company.com" type="email" />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.role')}</Label>
                  <Select value={inviteForm.role} onValueChange={v => setInviteForm(p => ({ ...p, role: v as UserRole }))}>
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
                  <Label>{t('nav.warehouses')}</Label>
                  <Select value={inviteForm.warehouse} onValueChange={v => setInviteForm(p => ({ ...p, warehouse: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="w1">Entrepôt Principal</SelectItem>
                      <SelectItem value="w2">Dépôt Ouest</SelectItem>
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
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell><Badge variant={roleBadgeVariant[user.role]}>{t(`business.role${user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', '')}`, user.role)}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? t('common.active') : t('common.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(user.lastLogin).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditUser(user)}><Eye className="h-4 w-4 me-2" />{t('common.edit')}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPermissionsUser(user)}><Shield className="h-4 w-4 me-2" />{t('users.permissions', 'Permissions')}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setActivityUser(user)}><History className="h-4 w-4 me-2" />{t('users.activity', 'Activité')}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePasswordReset(user)}><Key className="h-4 w-4 me-2" />{t('users.resetPassword', 'Réinitialiser MDP')}</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toggleActive(user.id)} className={user.isActive ? 'text-destructive' : ''}>
                          <Ban className="h-4 w-4 me-2" />{user.isActive ? t('admin.deactivate') : t('users.activate', 'Activer')}
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

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('common.edit')} — {editUser?.name}</DialogTitle></DialogHeader>
          {editUser && (
            <div className="space-y-4 py-2">
              <div className="space-y-2"><Label>{t('common.name')}</Label><Input defaultValue={editUser.name} /></div>
              <div className="space-y-2"><Label>{t('common.email')}</Label><Input defaultValue={editUser.email} /></div>
              <div className="space-y-2">
                <Label>{t('admin.role')}</Label>
                <Select defaultValue={editUser.role}>
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
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>{t('common.cancel')}</Button>
            <Button onClick={() => { toast.success(t('common.success')); setEditUser(null); }}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Dialog */}
      <Dialog open={!!activityUser} onOpenChange={() => setActivityUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('users.activity', 'Activité')} — {activityUser?.name}</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {mockActivity.map((a, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{a.action}</p>
                  <p className="text-xs text-muted-foreground">{a.resource}</p>
                </div>
                <span className="text-xs text-muted-foreground">{a.date}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={!!permissionsUser} onOpenChange={() => setPermissionsUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('users.permissions', 'Permissions')} — {permissionsUser?.name}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {PERMISSIONS.map(p => (
              <label key={p.id} className="flex items-center gap-2 text-sm rounded-lg border p-3 cursor-pointer hover:bg-muted/50">
                <Checkbox checked={selectedPerms.has(p.id)} onCheckedChange={c => {
                  setSelectedPerms(prev => { const n = new Set(prev); c ? n.add(p.id) : n.delete(p.id); return n; });
                }} />
                {p.label}
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionsUser(null)}>{t('common.cancel')}</Button>
            <Button onClick={() => { toast.success(t('common.success')); setPermissionsUser(null); }}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
