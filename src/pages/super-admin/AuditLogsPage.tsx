import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, FileText, Eye, Filter, Download, Calendar, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface AuditLog {
  id: string; timestamp: string; user: string; avatar: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'export' | 'suspend';
  resource: string; resourceId: string; tenant: string; ip: string; country: string; details: Record<string, unknown>;
}

const mockLogs: AuditLog[] = [
  { id: 'log-1', timestamp: '2025-04-10 14:23:45', user: 'Karim Benali', avatar: 'KB', action: 'create', resource: 'tenant', resourceId: 'T-005', tenant: 'Platform', ip: '192.168.1.45', country: 'DZ', details: { name: 'NewCorp DZ', plan: 'starter' } },
  { id: 'log-2', timestamp: '2025-04-10 13:15:22', user: 'Amina Hadj', avatar: 'AH', action: 'update', resource: 'subscription', resourceId: 'SUB-003', tenant: 'Sahel Distribution', ip: '10.0.0.12', country: 'DZ', details: { from: 'starter', to: 'professional' } },
  { id: 'log-3', timestamp: '2025-04-10 11:42:10', user: 'Karim Benali', avatar: 'KB', action: 'suspend', resource: 'tenant', resourceId: 'T-008', tenant: 'Kabylie Fresh', ip: '192.168.1.45', country: 'DZ', details: { reason: 'Payment overdue' } },
  { id: 'log-4', timestamp: '2025-04-10 10:05:33', user: 'Youcef Khelifi', avatar: 'YK', action: 'login', resource: 'session', resourceId: 'S-122', tenant: 'Platform', ip: '41.111.45.23', country: 'DZ', details: { browser: 'Chrome 120', os: 'Windows 11' } },
  { id: 'log-5', timestamp: '2025-04-09 18:30:00', user: 'Nadia Meziane', avatar: 'NM', action: 'export', resource: 'report', resourceId: 'RPT-045', tenant: 'Platform', ip: '192.168.1.52', country: 'DZ', details: { type: 'revenue', format: 'csv' } },
  { id: 'log-6', timestamp: '2025-04-09 16:12:55', user: 'Karim Benali', avatar: 'KB', action: 'delete', resource: 'user', resourceId: 'U-089', tenant: 'Atlas BTP', ip: '192.168.1.45', country: 'DZ', details: { email: 'old@atlas.dz' } },
  { id: 'log-7', timestamp: '2025-04-09 14:45:12', user: 'Amina Hadj', avatar: 'AH', action: 'create', resource: 'user', resourceId: 'U-090', tenant: 'Aurès Trading', ip: '10.0.0.12', country: 'DZ', details: { role: 'manager', email: 'mgr@aures.dz' } },
  { id: 'log-8', timestamp: '2025-04-09 09:20:00', user: 'System', avatar: 'SY', action: 'update', resource: 'billing', resourceId: 'BIL-034', tenant: 'Tlemcen Pharma', ip: '127.0.0.1', country: '—', details: { event: 'payment_retry', attempt: 3 } },
  { id: 'log-9', timestamp: '2025-04-08 15:30:00', user: 'Karim Benali', avatar: 'KB', action: 'update', resource: 'settings', resourceId: 'SET-001', tenant: 'Platform', ip: '192.168.1.45', country: 'DZ', details: { field: 'maintenance_mode', value: false } },
  { id: 'log-10', timestamp: '2025-04-08 10:00:00', user: 'Sofiane Boudiaf', avatar: 'SB', action: 'login', resource: 'session', resourceId: 'S-121', tenant: 'Platform', ip: '105.235.12.8', country: 'DZ', details: { browser: 'Firefox 122' } },
];

const actionBadge = (action: string) => {
  const map: Record<string, string> = {
    create: 'bg-success/10 text-success border-success/20', update: 'bg-info/10 text-info border-info/20',
    delete: 'bg-destructive/10 text-destructive border-destructive/20', login: 'bg-muted text-muted-foreground',
    export: 'bg-primary/10 text-primary border-primary/20', suspend: 'bg-warning/10 text-warning border-warning/20',
  };
  return map[action] || '';
};

const PAGE_SIZE = 6;

export default function AuditLogsPage() {
  const { t } = useTranslation();
  const [logs] = useState<AuditLog[]>(mockLogs);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => { const timer = setTimeout(() => setLoading(false), 300); return () => clearTimeout(timer); }, []);

  const filtered = useMemo(() => logs.filter(l => {
    const matchesSearch = l.user.toLowerCase().includes(search.toLowerCase()) || l.resource.toLowerCase().includes(search.toLowerCase()) || l.tenant.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === 'all' || l.action === actionFilter;
    return matchesSearch && matchesAction;
  }), [logs, search, actionFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExport = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      const csv = ['Timestamp,User,Action,Resource,Tenant,IP,Country', ...filtered.map(l => `${l.timestamp},${l.user},${l.action},${l.resource},${l.tenant},${l.ip},${l.country}`)].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'audit-logs.csv'; a.click(); URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'audit-logs.json'; a.click(); URL.revokeObjectURL(url);
    }
    toast.success(`${t('admin.auditLogs')} ${t('common.exported', 'exported')} (${format.toUpperCase()})`);
  };

  if (loading) return <div className="space-y-6"><Skeleton className="h-8 w-64" /><Skeleton className="h-12 w-full" /><Skeleton className="h-96" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('admin.auditLogs')}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.auditLogsDescription')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}><Download className="h-4 w-4 me-1" />CSV</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('json')}><Download className="h-4 w-4 me-1" />JSON</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="ps-9" placeholder={t('common.search')} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <Select value={actionFilter} onValueChange={v => { setActionFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]"><Filter className="h-4 w-4 me-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="create">{t('admin.actionCreate')}</SelectItem>
                <SelectItem value="update">{t('admin.actionUpdate')}</SelectItem>
                <SelectItem value="delete">{t('admin.actionDelete')}</SelectItem>
                <SelectItem value="login">{t('admin.actionLogin')}</SelectItem>
                <SelectItem value="suspend">{t('admin.actionSuspend')}</SelectItem>
                <SelectItem value="export">{t('admin.actionExport')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={v => { setDateFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px]"><Calendar className="h-4 w-4 me-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="today">{t('dashboard.today', "Aujourd'hui")}</SelectItem>
                <SelectItem value="week">{t('dashboard.thisWeek', 'Cette semaine')}</SelectItem>
                <SelectItem value="month">{t('dashboard.thisMonth', 'Ce mois')}</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary">{filtered.length} logs</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.timestamp')}</TableHead>
                <TableHead>{t('admin.user')}</TableHead>
                <TableHead>{t('admin.action')}</TableHead>
                <TableHead>{t('admin.resource')}</TableHead>
                <TableHead>{t('nav.tenants')}</TableHead>
                <TableHead>IP / {t('admin.location', 'Location')}</TableHead>
                <TableHead>{t('common.details')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(log => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.timestamp}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{log.avatar}</div>
                      <span className="font-medium text-sm">{log.user}</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className={actionBadge(log.action)}>{log.action}</Badge></TableCell>
                  <TableCell>
                    <span className="text-sm">{log.resource}</span>
                    <span className="text-xs text-muted-foreground ms-1">({log.resourceId})</span>
                  </TableCell>
                  <TableCell className="text-sm">{log.tenant}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" />{log.ip}
                      {log.country !== '—' && <Badge variant="outline" className="text-[10px] px-1">{log.country}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedLog(log)}><Eye className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <p className="text-muted-foreground">{t('common.showing')} {(page-1)*PAGE_SIZE+1}-{Math.min(page*PAGE_SIZE, filtered.length)} {t('common.of')} {filtered.length}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p-1)}>{t('common.previous')}</Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p+1)}>{t('common.next')}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <SheetContent>
          <SheetHeader><SheetTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />{t('admin.logDetail')}</SheetTitle></SheetHeader>
          {selectedLog && (
            <ScrollArea className="h-[calc(100vh-120px)] mt-4">
              <div className="space-y-4">
                <div><p className="text-xs text-muted-foreground">{t('admin.timestamp')}</p><p className="font-mono text-sm">{selectedLog.timestamp}</p></div>
                <div><p className="text-xs text-muted-foreground">{t('admin.user')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{selectedLog.avatar}</div>
                    <p className="font-medium">{selectedLog.user}</p>
                  </div>
                </div>
                <div><p className="text-xs text-muted-foreground">{t('admin.action')}</p><Badge variant="outline" className={actionBadge(selectedLog.action)}>{selectedLog.action}</Badge></div>
                <div><p className="text-xs text-muted-foreground">{t('admin.resource')}</p><p>{selectedLog.resource} ({selectedLog.resourceId})</p></div>
                <div><p className="text-xs text-muted-foreground">IP</p><p className="font-mono text-sm">{selectedLog.ip} <Badge variant="outline" className="ms-1">{selectedLog.country}</Badge></p></div>
                <div><p className="text-xs text-muted-foreground mb-2">{t('admin.payload')}</p>
                  <pre className="rounded-lg bg-muted p-3 text-xs overflow-auto">{JSON.stringify(selectedLog.details, null, 2)}</pre>
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
