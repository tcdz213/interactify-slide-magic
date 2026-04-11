import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenants } from '@/lib/fake-api';
import type { Tenant } from '@/lib/fake-api/types';
import { PlanBadge, TenantStatusBadge, SubStatusBadge } from '@/components/StatusBadges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Building2, Mail, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function TenantsPage() {
  const { t } = useTranslation();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    getTenants().then(setTenants);
  }, []);

  const filtered = tenants.filter(ten =>
    ten.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('admin.tenantManagement')}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.manageCompanies')}</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t('admin.addTenant')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('common.search')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="ps-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.company')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('admin.plan')}</TableHead>
                <TableHead>{t('admin.subscription')}</TableHead>
                <TableHead>{t('admin.usersCount')}</TableHead>
                <TableHead>{t('nav.warehouses')}</TableHead>
                <TableHead>{t('dashboard.revenue')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(ten => (
                <TableRow key={ten.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{ten.name}</p>
                        <p className="text-xs text-muted-foreground">{ten.contactEmail}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><TenantStatusBadge status={ten.status} /></TableCell>
                  <TableCell><PlanBadge plan={ten.plan} /></TableCell>
                  <TableCell><SubStatusBadge status={ten.subscriptionStatus} /></TableCell>
                  <TableCell>{ten.usersCount}</TableCell>
                  <TableCell>{ten.warehousesCount}</TableCell>
                  <TableCell className="font-medium">${ten.monthlyRevenue}/mo</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedTenant(ten)}>
                          {t('common.view')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            {ten.name}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">{t('common.status')}</p>
                              <TenantStatusBadge status={ten.status} />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{t('admin.plan')}</p>
                              <PlanBadge plan={ten.plan} />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{t('admin.subscription')}</p>
                              <SubStatusBadge status={ten.subscriptionStatus} />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{t('common.created')}</p>
                              <p className="text-sm font-medium">{ten.createdAt}</p>
                            </div>
                          </div>
                          <div className="space-y-2 rounded-lg border p-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                              {ten.contactEmail}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              {ten.contactPhone}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="stat-card text-center">
                              <p className="text-lg font-bold">{ten.usersCount}</p>
                              <p className="text-xs text-muted-foreground">{t('admin.usersCount')}</p>
                            </div>
                            <div className="stat-card text-center">
                              <p className="text-lg font-bold">{ten.warehousesCount}</p>
                              <p className="text-xs text-muted-foreground">{t('nav.warehouses')}</p>
                            </div>
                            <div className="stat-card text-center">
                              <p className="text-lg font-bold">${ten.monthlyRevenue}</p>
                              <p className="text-xs text-muted-foreground">{t('admin.mrr')}</p>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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
