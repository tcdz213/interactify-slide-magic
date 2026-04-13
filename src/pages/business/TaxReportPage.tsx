import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getTaxReportData } from '@/lib/fake-api';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

export default function TaxReportPage() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('Q4');
  const { data } = useQuery({ queryKey: ['taxReport'], queryFn: getTaxReportData });

  const fmt = (n: number) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('reports.tax.title')} description={t('reports.tax.description')}>
        <div className="flex gap-2">
          <Link to="/business/reports"><Button variant="outline"><ArrowLeft className="h-4 w-4 me-2" />{t('common.back')}</Button></Link>
          <Button variant="outline"><Download className="h-4 w-4 me-2" />{t('reports.tax.exportPdf')}</Button>
        </div>
      </PageHeader>

      <div className="flex gap-3">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Q4">Q4 2024</SelectItem>
            <SelectItem value="Q3">Q3 2024</SelectItem>
            <SelectItem value="Q2">Q2 2024</SelectItem>
            <SelectItem value="Q1">Q1 2024</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <CardTitle>{t('reports.tax.g50Preview')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('reports.tax.taxRate')}</TableHead>
                    <TableHead className="text-end">{t('reports.tax.taxableBase')}</TableHead>
                    <TableHead className="text-end">{t('reports.tax.tvaCollected')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.rows.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row.taxRate}%</TableCell>
                      <TableCell className="text-end">{fmt(row.taxableBase)}</TableCell>
                      <TableCell className="text-end">{fmt(row.tvaCollected)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold border-t-2">
                    <TableCell>{t('invoices.total')}</TableCell>
                    <TableCell className="text-end">{fmt(data.totalTaxableBase)}</TableCell>
                    <TableCell className="text-end">{fmt(data.totalTva)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t('reports.tax.summary')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">{t('reports.tax.totalTvaDue')}</p>
                <p className="text-3xl font-bold mt-1">{fmt(data.totalTva)}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">{t('reports.tax.period')}</span><span>{data.period}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('reports.tax.taxableBase')}</span><span>{fmt(data.totalTaxableBase)}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
