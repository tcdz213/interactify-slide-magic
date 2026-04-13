import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import { getPayments, Payment } from '@/lib/fake-api';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { SearchInput } from '@/components/SearchInput';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';

const statusMap: Record<string, 'success' | 'warning' | 'error'> = {
  completed: 'success', pending: 'warning', failed: 'error',
};

export default function PaymentsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const { data: payments = [], isLoading } = useQuery({ queryKey: ['payments'], queryFn: () => getPayments() });

  const fmt = (n: number) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(n);

  const columns: ColumnDef<Payment>[] = [
    { accessorKey: 'date', header: t('payments.date') },
    { accessorKey: 'invoiceNumber', header: t('invoices.number') },
    { accessorKey: 'customerName', header: t('common.name') },
    { accessorKey: 'amount', header: t('payments.amount'), cell: ({ row }) => fmt(row.original.amount) },
    { accessorKey: 'method', header: t('payments.method'), cell: ({ row }) => t(`payments.methods.${row.original.method}`) },
    { accessorKey: 'reference', header: t('payments.reference') },
    { accessorKey: 'status', header: t('common.status'), cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('payments.title')} description={t('payments.subtitle')}>
        <Button><Plus className="h-4 w-4 me-2" />{t('payments.record')}</Button>
      </PageHeader>

      <SearchInput value={search} onChange={setSearch} placeholder={t('payments.searchPlaceholder')} />

      <DataTable columns={columns} data={payments} isLoading={isLoading} searchValue={search} searchColumn="customerName" />
    </div>
  );
}
