import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getTaxReportData } from '@/lib/fake-api';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, FileText, Printer, CheckCircle, History, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const historicalData = [
  { period: 'Q1 2024', taxableBase: 8500000, tva: 1275000, status: 'filed' },
  { period: 'Q2 2024', taxableBase: 9200000, tva: 1380000, status: 'filed' },
  { period: 'Q3 2024', taxableBase: 10100000, tva: 1515000, status: 'filed' },
  { period: 'Q4 2024', taxableBase: 11500000, tva: 1725000, status: 'pending' },
];

export default function TaxReportPage() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('Q4');
  const { data } = useQuery({ queryKey: ['taxReport'], queryFn: getTaxReportData });

  const fmt = (n: number) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(n);

  const handleExport = (format: string) => {
    toast.success(t('reports.exportedAs', `Exported as ${format}`, { format }));
  };

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <PageHeader title={t('reports.tax.title')} description={t('reports.tax.description')}>
        <div className="flex gap-2">
          <Link to="/business/reports"><Button variant="outline"><ArrowLeft className="h-4 w-4 me-2" />{t('common.back')}</Button></Link>
          <Button variant="outline" onClick={() => handleExport('PDF')}><Download className="h-4 w-4 me-2" />{t('reports.tax.exportPdf')}</Button>
          <Button variant="outline" onClick={() => toast.success(t('reports.printed', 'Sent to printer'))}><Printer className="h-4 w-4 me-2" />{t('reports.print', 'Print')}</Button>
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

      <Tabs defaultValue="g50">
        <TabsList>
          <TabsTrigger value="g50"><FileText className="h-3.5 w-3.5 me-1" />{t('reports.tax.g50Preview')}</TabsTrigger>
          <TabsTrigger value="history"><History className="h-3.5 w-3.5 me-1" />{t('reports.tax.historicalComparison', 'Historical')}</TabsTrigger>
          <TabsTrigger value="exemptions"><AlertTriangle className="h-3.5 w-3.5 me-1" />{t('reports.tax.exemptions', 'Exemptions')}</TabsTrigger>
        </TabsList>

        <TabsContent value="g50" className="mt-4">
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
                  {/* G50 Form Header Mock */}
                  <div className="border rounded-lg p-4 mb-4 bg-muted/30">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">NIF:</span> <span className="font-mono">001234567890123</span></div>
                      <div><span className="text-muted-foreground">Article:</span> <span className="font-mono">12345678</span></div>
                      <div><span className="text-muted-foreground">{t('reports.tax.period')}:</span> <span className="font-medium">{data.period}</span></div>
                      <div><span className="text-muted-foreground">{t('reports.tax.filingDeadline', 'Deadline')}:</span> <span className="font-medium">20/01/2025</span></div>
                    </div>
                  </div>

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
                      {/* TVA 0% exemptions row */}
                      <TableRow>
                        <TableCell className="font-medium">0% ({t('reports.tax.exempt', 'Exempt')})</TableCell>
                        <TableCell className="text-end">{fmt(450000)}</TableCell>
                        <TableCell className="text-end">{fmt(0)}</TableCell>
                      </TableRow>
                      <TableRow className="font-bold border-t-2">
                        <TableCell>{t('invoices.total')}</TableCell>
                        <TableCell className="text-end">{fmt(data.totalTaxableBase + 450000)}</TableCell>
                        <TableCell className="text-end">{fmt(data.totalTva)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  {/* Credit notes impact */}
                  <div className="mt-4 rounded-lg border p-3 bg-warning/5">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <span className="font-medium">{t('reports.tax.creditNotesImpact', 'Credit Notes Impact')}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t('reports.tax.creditNotesDesc', '2 credit notes reduced taxable base by')} {fmt(85000)}</p>
                  </div>
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
                    <div className="flex justify-between"><span className="text-muted-foreground">{t('reports.tax.creditNotesDeduction', 'Credit Note Deduction')}</span><span className="text-destructive">-{fmt(85000)}</span></div>
                  </div>
                  <Button className="w-full" onClick={() => toast.success(t('reports.tax.g50Filed', 'G50 declaration filed'))}>
                    <CheckCircle className="h-4 w-4 me-2" />{t('reports.tax.fileDeclaration', 'File G50 Declaration')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>{t('reports.tax.quarterlyComparison', 'Quarterly Comparison')}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="period" className="text-xs" />
                    <YAxis tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} className="text-xs" />
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Bar dataKey="taxableBase" name={t('reports.tax.taxableBase')} fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="tva" name="TVA" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>{t('reports.tax.filingHistory', 'Filing History')}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {historicalData.map(h => (
                  <div key={h.period} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{h.period}</p>
                      <p className="text-xs text-muted-foreground">TVA: {fmt(h.tva)}</p>
                    </div>
                    <Badge variant={h.status === 'filed' ? 'default' : 'secondary'}>
                      {h.status === 'filed' ? <><CheckCircle className="h-3 w-3 me-1" />{t('reports.tax.filed', 'Filed')}</> : t('reports.tax.pendingFiling', 'Pending')}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exemptions" className="mt-4">
          <Card>
            <CardHeader><CardTitle>{t('reports.tax.tvaExemptions', 'TVA 0% Exemptions')}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('products.title')}</TableHead>
                    <TableHead>{t('reports.tax.exemptionReason', 'Reason')}</TableHead>
                    <TableHead className="text-end">{t('reports.tax.taxableBase')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>Semoule fine 25kg</TableCell><TableCell>Produit de première nécessité</TableCell><TableCell className="text-end">{fmt(200000)}</TableCell></TableRow>
                  <TableRow><TableCell>Lait UHT 1L</TableCell><TableCell>Produit subventionné</TableCell><TableCell className="text-end">{fmt(150000)}</TableCell></TableRow>
                  <TableRow><TableCell>Pain de mie</TableCell><TableCell>Produit de première nécessité</TableCell><TableCell className="text-end">{fmt(100000)}</TableCell></TableRow>
                  <TableRow className="font-bold border-t-2"><TableCell colSpan={2}>{t('invoices.total')}</TableCell><TableCell className="text-end">{fmt(450000)}</TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
