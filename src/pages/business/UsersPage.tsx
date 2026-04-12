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
import { StatCard } from '@/components/StatCard';
import { UserPlus, Users, Shield, Truck, Search } from 'lucide-react';
import { toast } from 'sonner';

const roleBadgeVariant: Record<UserRole, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  super_admin: 'destructive',
  manager: 'default',
  driver: 'secondary',
  sales_rep: 'outline',
  retailer: 'outline',
  accountant: 'secondary',
};

export default function UsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [inviteOpen, setInviteOpen] = useState(false);

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
                <div className="space-y-2">
                  <Label>{t('nav.warehouses')}</Label>
                  <Select defaultValue="w1">
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
                      <Button variant="ghost" size="sm">{t('common.edit')}</Button>
                      <Button variant="ghost" size="sm" className="text-destructive">{t('admin.deactivate')}</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
