import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, FileText, Eye, Filter } from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'export' | 'suspend';
  resource: string;
  resourceId: string;
  tenant: string;
  details: Record<string, unknown>;
}

const mockLogs: AuditLog[] = [
  { id: 'log-1', timestamp: '2025-04-10 14:23:45', user: 'Karim Benali', action: 'create', resource: 'tenant', resourceId: 'T-005', tenant: 'Platform', details: { name: 'NewCorp DZ', plan: 'starter' } },
  { id: 'log-2', timestamp: '2025-04-10 13:15:22', user: 'Amina Hadj', action: 'update', resource: 'subscription', resourceId: 'SUB-003', tenant: 'Sahel Distribution', details: { from: 'starter', to: 'professional' } },
  { id: 'log-3', timestamp: '2025-04-10 11:42:10', user: 'Karim Benali', action: 'suspend', resource: 'tenant', resourceId: 'T-008', tenant: 'Kabylie Fresh', details: { reason: 'Payment overdue' } },
  { id: 'log-4', timestamp: '2025-04-10 10:05:33', user: 'Youcef Khelifi', action: 'login', resource: 'session', resourceId: 'S-122', tenant: 'Platform', details: { ip: '192.168.1.45' } },
  { id: 'log-5', timestamp: '2025-04-09 18:30:00', user: 'Nadia Meziane', action: 'export', resource: 'report', resourceId: 'RPT-045', tenant: 'Platform', details: { type: 'revenue', format: 'csv' } },
  { id: 'log-6', timestamp: '2025-04-09 16:12:55', user: 'Karim Benali', action: 'delete', resource: 'user', resourceId: 'U-089', tenant: 'Atlas BTP', details: { email: 'old@atlas.dz' } },
  { id: 'log-7', timestamp: '2025-04-09 14:45:12', user: 'Amina Hadj', action: 'create', resource: 'user', resourceId: 'U-090', tenant: 'Aurès Trading', details: { role: 'manager', email: 'mgr@aures.dz' } },
  { id: 'log-8', timestamp: '2025-04-09 09:20:00', user: 'System', action: 'update', resource: 'billing', resourceId: 'BIL-034', tenant: 'Tlemcen Pharma', details: { event: 'payment_retry', attempt: 3 } },
];

const actionBadge = (action: string) => {
  const map: Record<string, string> = {
    create: 'bg-success/10 text-success border-success/20',
    update: 'bg-info/10 text-info border-info/20',
    delete: 'bg-destructive/10 text-destructive border-destructive/20',
    login: 'bg-muted text-muted-foreground',
    export: 'bg-primary/10 text-primary border-primary/20',
    suspend: 'bg-warning/10 text-warning border-warning/20',
  };
  return map[action] || '';
};

export default function AuditLogsPage() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { const timer = setTimeout(() => { setLogs(mockLogs); setLoading(false); }, 300); return () => clearTimeout(timer); }, []);

  const filtered = logs.filter(l => {
    const matchesSearch = l.user.toLowerCase().includes(search.toLowerCase()) || l.resource.toLowerCase().includes(search.toLowerCase()) || l.tenant.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === 'all' || l.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">{t('common.loading')}</div></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.auditLogs')}</h1>
        <p className="text-sm text-muted-foreground">{t('admin.auditLogsDescription')}</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="ps-9" placeholder={t('common.search')} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[160px]"><Filter className="h-4 w-4 me-2" /><SelectValue /></SelectTrigger>
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
                <TableHead>{t('common.details')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(log => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.timestamp}</TableCell>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell><Badge variant="outline" className={actionBadge(log.action)}>{log.action}</Badge></TableCell>
                  <TableCell>
                    <span className="text-sm">{log.resource}</span>
                    <span className="text-xs text-muted-foreground ms-1">({log.resourceId})</span>
                  </TableCell>
                  <TableCell className="text-sm">{log.tenant}</TableCell>
                  <TableCell>
                    <Sheet>
                      <SheetTrigger asChild><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></SheetTrigger>
                      <SheetContent>
                        <SheetHeader><SheetTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />{t('admin.logDetail')}</SheetTitle></SheetHeader>
                        <ScrollArea className="h-[calc(100vh-120px)] mt-4">
                          <div className="space-y-4">
                            <div><p className="text-xs text-muted-foreground">{t('admin.timestamp')}</p><p className="font-mono text-sm">{log.timestamp}</p></div>
                            <div><p className="text-xs text-muted-foreground">{t('admin.user')}</p><p className="font-medium">{log.user}</p></div>
                            <div><p className="text-xs text-muted-foreground">{t('admin.action')}</p><Badge variant="outline" className={actionBadge(log.action)}>{log.action}</Badge></div>
                            <div><p className="text-xs text-muted-foreground">{t('admin.resource')}</p><p>{log.resource} ({log.resourceId})</p></div>
                            <div><p className="text-xs text-muted-foreground mb-2">{t('admin.payload')}</p>
                              <pre className="rounded-lg bg-muted p-3 text-xs overflow-auto">{JSON.stringify(log.details, null, 2)}</pre>
                            </div>
                          </div>
                        </ScrollArea>
                      </SheetContent>
                    </Sheet>
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