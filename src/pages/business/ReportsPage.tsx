import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Users, Package, Truck, Receipt, Clock, Calendar, Download, Star } from 'lucide-react';
import { toast } from 'sonner';

const reports = [
  { key: 'sales', icon: TrendingUp, route: '/business/reports/sales', color: 'text-primary', ready: true },
  { key: 'tax', icon: Receipt, route: '/business/reports/tax', color: 'text-success', ready: true },
  { key: 'inventory', icon: Package, route: '/business/reports/inventory', color: 'text-warning', ready: true },
  { key: 'customers', icon: Users, route: '/business/reports/customers', color: 'text-info', ready: true },
  { key: 'delivery', icon: Truck, route: '/business/reports/delivery', color: 'text-destructive', ready: true },
];

const scheduledReports = [
  { id: 1, name: 'Weekly Sales Summary', frequency: 'Weekly', nextRun: '2025-04-18', lastRun: '2025-04-11', status: 'active' },
  { id: 2, name: 'Monthly Inventory Report', frequency: 'Monthly', nextRun: '2025-05-01', lastRun: '2025-04-01', status: 'active' },
  { id: 3, name: 'Quarterly Tax Declaration', frequency: 'Quarterly', nextRun: '2025-07-01', lastRun: '2025-04-01', status: 'paused' },
];

const recentReports = [
  { id: 1, name: 'Sales Report - March 2025', type: 'Sales', generatedAt: '2025-04-01 09:30', format: 'PDF' },
  { id: 2, name: 'G50 Tax Report - Q1 2025', type: 'Tax', generatedAt: '2025-04-02 14:00', format: 'PDF' },
  { id: 3, name: 'Inventory Snapshot - April 2025', type: 'Inventory', generatedAt: '2025-04-10 08:00', format: 'Excel' },
  { id: 4, name: 'Customer Analytics - Q1 2025', type: 'Customers', generatedAt: '2025-04-05 11:15', format: 'PDF' },
];

export default function ReportsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('reports');

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <PageHeader title={t('reports.title')} description={t('reports.subtitle')} />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="reports">{t('reports.allReports', 'All Reports')}</TabsTrigger>
          <TabsTrigger value="scheduled">{t('reports.scheduled', 'Scheduled')}</TabsTrigger>
          <TabsTrigger value="history">{t('reports.history', 'History')}</TabsTrigger>
          <TabsTrigger value="custom">{t('reports.customBuilder', 'Custom Builder')}</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map(r => (
              <Card key={r.key} className="hover:shadow-md transition-shadow group">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg bg-muted ${r.color}`}><r.icon className="h-5 w-5" /></div>
                    <div>
                      <CardTitle className="text-base">{t(`reports.${r.key}.title`)}</CardTitle>
                      <CardDescription>{t(`reports.${r.key}.description`)}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to={r.route}>
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <BarChart3 className="h-4 w-4 me-2" />{t('reports.generate')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{t('reports.scheduledReports', 'Scheduled Reports')}</CardTitle>
                <Button size="sm" onClick={() => toast.info(t('reports.scheduleNew', 'Schedule new report'))}>{t('reports.scheduleReport', 'Schedule Report')}</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {scheduledReports.map(sr => (
                <div key={sr.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium">{sr.name}</p>
                    <p className="text-xs text-muted-foreground">{sr.frequency} • {t('reports.nextRun', 'Next')}: {sr.nextRun}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={sr.status === 'active' ? 'default' : 'secondary'}>{sr.status === 'active' ? t('common.active') : t('reports.paused', 'Paused')}</Badge>
                    <Button variant="outline" size="sm" onClick={() => toast.success(t('reports.reportGenerated', 'Report generated'))}>{t('reports.runNow', 'Run Now')}</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{t('reports.recentReports', 'Recent Reports')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {recentReports.map(rr => (
                <div key={rr.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{rr.name}</p>
                      <p className="text-xs text-muted-foreground">{rr.generatedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{rr.format}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => toast.success(t('reports.downloaded', 'Report downloaded'))}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4 text-primary" />{t('reports.customReportBuilder', 'Custom Report Builder')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('reports.dataSource', 'Data Source')}</label>
                  <select className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                    <option>Orders</option>
                    <option>Products</option>
                    <option>Customers</option>
                    <option>Deliveries</option>
                    <option>Invoices</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('reports.dateRange', 'Date Range')}</label>
                  <div className="flex gap-2">
                    <Input type="date" className="flex-1" />
                    <Input type="date" className="flex-1" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('reports.metrics', 'Metrics')}</label>
                <div className="flex flex-wrap gap-2">
                  {['Revenue', 'Quantity', 'Count', 'Average', 'Growth %'].map(m => (
                    <Badge key={m} variant="outline" className="cursor-pointer hover:bg-primary/10">{m}</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('reports.groupBy', 'Group By')}</label>
                <div className="flex flex-wrap gap-2">
                  {['Day', 'Week', 'Month', 'Product', 'Customer', 'Driver', 'Region'].map(g => (
                    <Badge key={g} variant="outline" className="cursor-pointer hover:bg-primary/10">{g}</Badge>
                  ))}
                </div>
              </div>
              <Button className="w-full" onClick={() => toast.success(t('reports.reportGenerated', 'Report generated'))}>
                <BarChart3 className="h-4 w-4 me-2" />{t('reports.generate')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
