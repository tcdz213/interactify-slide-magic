import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Search, Shield, MoreHorizontal, Mail, KeyRound } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'support' | 'billing_admin';
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
}

const mockAccounts: AdminAccount[] = [
  { id: 'sa-1', name: 'Karim Benali', email: 'karim@jawda.io', role: 'super_admin', status: 'active', lastLogin: '2025-04-10 14:23', createdAt: '2024-01-15' },
  { id: 'sa-2', name: 'Amina Hadj', email: 'amina@jawda.io', role: 'super_admin', status: 'active', lastLogin: '2025-04-10 09:15', createdAt: '2024-02-01' },
  { id: 'sa-3', name: 'Youcef Khelifi', email: 'youcef@jawda.io', role: 'support', status: 'active', lastLogin: '2025-04-09 16:42', createdAt: '2024-03-10' },
  { id: 'sa-4', name: 'Nadia Meziane', email: 'nadia@jawda.io', role: 'billing_admin', status: 'active', lastLogin: '2025-04-08 11:30', createdAt: '2024-04-20' },
  { id: 'sa-5', name: 'Sofiane Boudiaf', email: 'sofiane@jawda.io', role: 'support', status: 'inactive', lastLogin: '2025-03-15 08:00', createdAt: '2024-05-05' },
];

const roleBadge = (role: string) => {
  const map: Record<string, string> = {
    super_admin: 'bg-primary/10 text-primary border-primary/20',
    support: 'bg-info/10 text-info border-info/20',
    billing_admin: 'bg-warning/10 text-warning border-warning/20',
  };
  return map[role] || '';
};

export default function AccountsPage() {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => { setAccounts(mockAccounts); setLoading(false); }, 300);
    return () => clearTimeout(timer);
  }, []);

  const filtered = accounts.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">{t('common.loading')}</div></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('admin.accounts')}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.manageAdminAccounts')}</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button><UserPlus className="h-4 w-4 me-2" />{t('admin.inviteUser')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('admin.inviteUser')}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>{t('common.email')}</Label>
                <Input placeholder="admin@jawda.io" type="email" />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.role')}</Label>
                <Select defaultValue="support">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="billing_admin">Billing Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full"><Mail className="h-4 w-4 me-2" />{t('admin.sendInvite')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="ps-9" placeholder={t('common.search')} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
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
                <TableHead>{t('admin.lastLogin')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(account => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-primary" />
                      </div>
                      {account.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{account.email}</TableCell>
                  <TableCell><Badge variant="outline" className={roleBadge(account.role)}>{account.role.replace('_', ' ')}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                      {t(`common.${account.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{account.lastLogin}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><KeyRound className="h-4 w-4 me-2" />{t('auth.resetPassword')}</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">{t('admin.deactivate')}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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