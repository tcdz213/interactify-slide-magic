import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenants } from '@/lib/fake-api';
import type { Tenant } from '@/lib/fake-api/types';
import { PlanBadge, SubStatusBadge } from '@/components/StatusBadges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CreditCard, DollarSign, Users } from 'lucide-react';
import { StatCard } from '@/components/StatCard';

export default function SubscriptionsPage() {
  const { t } = useTranslation();
  const [tenants, setTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    getTenants().then(setTenants);
  }, []);

  const active = tenants.filter(ten => ten.subscriptionStatus === 'active');
  const trials = tenants.filter(ten => ten.subscriptionStatus === 'trial');
  const totalMRR = tenants.reduce((sum, ten) => sum + ten.monthlyRevenue, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('nav.subscriptions')}</h1>
        <p className="text-sm text-muted-foreground">{t('admin.subscriptionHealth')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title={t('admin.totalMRR')} value={`$${totalMRR.toLocaleString()}`} icon={DollarSign} variant="accent" trend={{ value: 8.5, label: t('admin.growth') }} />
        <StatCard title={t('admin.activeSubscriptions')} value={active.length} icon={CreditCard} variant="primary" />
        <StatCard title={t('admin.activeTrials')} value={trials.length} subtitle={t('admin.convertBeforeExpiry')} icon={Users} variant="warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('admin.allSubscriptions')}</CardTitle>
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
              {tenants.map(ten => (
                <TableRow key={ten.id}>
                  <TableCell className="font-medium">{ten.name}</TableCell>
                  <TableCell><PlanBadge plan={ten.plan} /></TableCell>
                  <TableCell><SubStatusBadge status={ten.subscriptionStatus} /></TableCell>
                  <TableCell className="font-medium">${ten.monthlyRevenue}</TableCell>
                  <TableCell className="text-muted-foreground">{ten.createdAt}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">{t('common.manage')}</Button>
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
