import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCustomers } from '@/lib/fake-api';
import type { Customer } from '@/lib/fake-api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Phone, ChevronRight } from 'lucide-react';

export default function SalesCustomersPage() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState('all');

  useEffect(() => { getCustomers().then(setCustomers); }, []);

  const filtered = customers
    .filter(c => segment === 'all' || c.segment === segment)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-bold text-foreground">{t('mobile.sales.customerList')}</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('mobile.sales.searchCustomer')}
          className="pl-9"
        />
      </div>

      <Tabs value={segment} onValueChange={setSegment}>
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1 text-xs">{t('common.all')}</TabsTrigger>
          <TabsTrigger value="superette" className="flex-1 text-xs">{t('customers.superette')}</TabsTrigger>
          <TabsTrigger value="wholesale" className="flex-1 text-xs">{t('customers.wholesale')}</TabsTrigger>
          <TabsTrigger value="shadow" className="flex-1 text-xs">{t('customers.shadow')}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        {filtered.map(customer => (
          <Card key={customer.id} className="border-0 shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{customer.name}</p>
                <p className="text-xs text-muted-foreground">
                  {customer.totalOrders} {t('mobile.sales.orders')} — {customer.totalSpent.toLocaleString('fr-DZ')} DA
                </p>
              </div>
              <a href={`tel:${customer.phone}`} className="p-2 rounded-full bg-primary/10 shrink-0" onClick={e => e.stopPropagation()}>
                <Phone className="h-4 w-4 text-primary" />
              </a>
              <Badge variant="secondary" className="text-[10px] shrink-0">{customer.segment}</Badge>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-center py-8 text-sm text-muted-foreground">{t('common.noResults')}</p>
        )}
      </div>
    </div>
  );
}
