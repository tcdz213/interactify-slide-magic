import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import { getInvoices, getCustomers, Invoice } from '@/lib/fake-api';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { SearchInput } from '@/components/SearchInput';
import { StatusBadge } from '@/components/StatusBadge';
import { KPIWidget } from '@/components/KPIWidget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FileText, Plus, Clock, AlertTriangle, CheckCircle, Send, Download, Trash2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function InvoicesPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ customerId: '', dueDate: '' });

  const { data: invoices = [], isLoading } = useQuery({ queryKey: ['invoices'], queryFn: () => getInvoices() });
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: () => getCustomers() });
  const [localInvoices, setLocalInvoices] = useState<Invoice[]>([]);

  const allInvoices = useMemo(() => [...invoices, ...localInvoices], [invoices, localInvoices]);

  const filtered = useMemo(() => {
    let result = allInvoices;
    if (statusFilter !== 'all') result = result.filter(i => i.status === statusFilter);
    if (dateFrom) result = result.filter(i => i.issueDate >= dateFrom);
    if (dateTo) result = result.filter(i => i.issueDate <= dateTo);
    return result;
  }, [allInvoices, statusFilter, dateFrom, dateTo]);

  const kpis = useMemo(() => {
    const total = allInvoices.reduce((s, i) => s + i.total, 0);
    const paid = allInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
    const overdue = allInvoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.remainingAmount, 0);
    const pending = allInvoices.filter(i => ['sent', 'partial'].includes(i.status)).reduce((s, i) => s + i.remainingAmount, 0);
    return { total, paid, overdue, pending };
  }, [allInvoices]);

  const fmt = (n: number) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(n);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };
  const toggleAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(i => i.id)));
  };

  const bulkSend = () => {
    toast.success(t('invoices.bulkSent', { count: selectedIds.size }));
    setSelectedIds(new Set());
  };

  const bulkExport = () => {
    const rows = allInvoices.filter(i => selectedIds.has(i.id));
    const csv = ['Invoice,Customer,Date,Total,Status', ...rows.map(r => `${r.invoiceNumber},${r.customerName},${r.issueDate},${r.total},${r.status}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'invoices_export.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('invoices.exported'));
    setSelectedIds(new Set());
  };

  const createInvoice = () => {
    const cust = customers.find(c => c.id === newInvoice.customerId);
    if (!cust) return;
    const inv: Invoice = {
      id: `inv-new-${Date.now()}`, tenantId: 't1', orderId: '', customerId: cust.id, customerName: cust.name,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`, status: 'draft',
      issueDate: new Date().toISOString().split('T')[0], dueDate: newInvoice.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      subtotal: 0, tva9: 0, tva19: 0, totalTva: 0, total: 0, paidAmount: 0, remainingAmount: 0,
      lineItems: [], payments: [], createdAt: new Date().toISOString(),
    };
    setLocalInvoices(prev => [inv, ...prev]);
    setCreateDialogOpen(false);
    setNewInvoice({ customerId: '', dueDate: '' });
    toast.success(t('invoices.created'));
  };

  const columns: ColumnDef<Invoice>[] = [
    {
      id: 'select', header: () => <Checkbox checked={selectedIds.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} />,
      cell: ({ row }) => <Checkbox checked={selectedIds.has(row.original.id)} onCheckedChange={() => toggleSelect(row.original.id)} />,
    },
    { accessorKey: 'invoiceNumber', header: t('invoices.number') },
    { accessorKey: 'customerName', header: t('common.name') },
    { accessorKey: 'issueDate', header: t('invoices.issueDate') },
    { accessorKey: 'dueDate', header: t('invoices.dueDate') },
    { accessorKey: 'total', header: t('invoices.total'), cell: ({ row }) => fmt(row.original.total) },
    { accessorKey: 'paidAmount', header: t('invoices.paid'), cell: ({ row }) => fmt(row.original.paidAmount) },
    { accessorKey: 'remainingAmount', header: t('invoices.remaining'), cell: ({ row }) => fmt(row.original.remainingAmount) },
    { accessorKey: 'status', header: t('common.status'), cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      id: 'actions', header: t('common.actions'),
      cell: ({ row }) => (
        <Link to={`/business/invoices/${row.original.id}`}>
          <Button variant="ghost" size="sm">{t('common.view')}</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('invoices.title')} description={t('invoices.subtitle')}>
        <Button onClick={() => setCreateDialogOpen(true)}><Plus className="h-4 w-4 me-2" />{t('invoices.create')}</Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIWidget title={t('invoices.totalInvoiced')} value={fmt(kpis.total)} icon={<FileText className="h-5 w-5" />} />
        <KPIWidget title={t('invoices.totalPaid')} value={fmt(kpis.paid)} icon={<CheckCircle className="h-5 w-5" />} trend="up" trendValue="+12%" />
        <KPIWidget title={t('invoices.totalOverdue')} value={fmt(kpis.overdue)} icon={<AlertTriangle className="h-5 w-5" />} trend="down" trendValue="2" />
        <KPIWidget title={t('invoices.totalPending')} value={fmt(kpis.pending)} icon={<Clock className="h-5 w-5" />} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder={t('invoices.searchPlaceholder')} className="flex-1" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('common.status')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="draft">{t('invoices.draft')}</SelectItem>
            <SelectItem value="sent">{t('invoices.sent')}</SelectItem>
            <SelectItem value="paid">{t('invoices.statusPaid')}</SelectItem>
            <SelectItem value="partial">{t('invoices.partial')}</SelectItem>
            <SelectItem value="overdue">{t('invoices.overdue')}</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-[160px]" placeholder={t('invoices.from')} />
        <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-[160px]" placeholder={t('invoices.to')} />
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border">
          <span className="text-sm font-medium">{selectedIds.size} {t('invoices.selected')}</span>
          <Button size="sm" variant="outline" onClick={bulkSend}><Send className="h-3.5 w-3.5 me-1" />{t('invoices.bulkSendAction')}</Button>
          <Button size="sm" variant="outline" onClick={bulkExport}><Download className="h-3.5 w-3.5 me-1" />{t('invoices.exportCsv')}</Button>
        </div>
      )}

      <DataTable columns={columns} data={filtered} isLoading={isLoading} searchValue={search} searchColumn="customerName" />

      {/* Create Invoice Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('invoices.create')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('createOrder.selectCustomer')}</Label>
              <Select value={newInvoice.customerId} onValueChange={v => setNewInvoice(p => ({ ...p, customerId: v }))}>
                <SelectTrigger><SelectValue placeholder={t('createOrder.chooseCustomer')} /></SelectTrigger>
                <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('invoices.dueDate')}</Label>
              <Input type="date" value={newInvoice.dueDate} onChange={e => setNewInvoice(p => ({ ...p, dueDate: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={createInvoice} disabled={!newInvoice.customerId}>{t('invoices.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
