import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCustomers } from '@/lib/fake-api';
import type { Customer } from '@/lib/fake-api/types';
import { SegmentBadge } from '@/components/StatusBadges';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Users, Ghost } from 'lucide-react';

export default function CustomersPage() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getCustomers().then(setCustomers);
  }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('customers.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('customers.manageRetailers')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Ghost className="h-4 w-4" />
            {t('customers.addShadow')}
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t('customers.addCustomer')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t('customers.searchCustomers')} value={search} onChange={e => setSearch(e.target.value)} className="ps-9" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('customers.title')}</TableHead>
                <TableHead>{t('customers.segment')}</TableHead>
                <TableHead>{t('common.type')}</TableHead>
                <TableHead>{t('common.phone')}</TableHead>
                <TableHead>{t('orders.title')}</TableHead>
                <TableHead>{t('customers.totalSpent')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.address}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><SegmentBadge segment={c.segment} /></TableCell>
                  <TableCell>
                    {c.isShadow ? (
                      <Badge variant="outline" className="bg-muted text-muted-foreground gap-1">
                        <Ghost className="h-3 w-3" /> {t('customers.shadow')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">{t('common.registered')}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{c.phone}</TableCell>
                  <TableCell>{c.totalOrders}</TableCell>
                  <TableCell className="font-medium">${c.totalSpent.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
