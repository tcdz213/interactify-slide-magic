import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Users, Package, Truck, Receipt } from 'lucide-react';

const reports = [
  { key: 'sales', icon: TrendingUp, route: '/business/reports/sales', color: 'text-blue-500' },
  { key: 'tax', icon: Receipt, route: '/business/reports/tax', color: 'text-green-500' },
  { key: 'inventory', icon: Package, route: '#', color: 'text-orange-500' },
  { key: 'customers', icon: Users, route: '#', color: 'text-purple-500' },
  { key: 'delivery', icon: Truck, route: '#', color: 'text-red-500' },
];

export default function ReportsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('reports.title')} description={t('reports.subtitle')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map(r => (
          <Card key={r.key} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${r.color}`}><r.icon className="h-5 w-5" /></div>
                <div>
                  <CardTitle className="text-base">{t(`reports.${r.key}.title`)}</CardTitle>
                  <CardDescription>{t(`reports.${r.key}.description`)}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link to={r.route}>
                <Button variant="outline" className="w-full" disabled={r.route === '#'}>
                  {t('reports.generate')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
