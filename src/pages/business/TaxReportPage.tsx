import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getTaxReportData } from '@/lib/fake-api';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KPIWidget } from '@/components/KPIWidget';
import { ArrowLeft, Download, FileText, TrendingUp, Receipt, AlertTriangle, CheckCircle, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';

const PERIODS = ['Q4 2024', 'Q3 2024', 'Q2 2024', 'Q1 2024', 'Q4 2023', 'Q3 2023'];

const MONTHLY_TVA = [
  { month: 'Jul', tva9: 145000, tva19: 890000 },
  { month: 'Aoû', tva9: 162000, tva19: 920000 },
  { month: 'Sep', tva9: 155000, tva19: 875000 },
  { month: 'Oct', tva9: 178000, tva19: 945000 },
  { month: 'Nov', tva9: 189000, tva19: 1020000 },
  { month: 'Déc', tva9: 201000, tva19: 1100000 },
];

const G50_FIELDS = [
  { code: '001', label: 'Chiffre d\'affaires imposable', value: 12500000 },
  { code: '010', label: 'TVA collectée (19%)', value: 2375000 },
  { code: '011', label: 'TVA collectée (9%)', value: 830000 },
  { code: '020', label: 'TVA déductible sur achats', value: 1890000 },
  { code: '030', label: 'TVA nette à payer', value: 1315000 },
  { code: '040', label: 'Taxe sur l\'activité professionnelle (TAP)', value: 250000 },
  { code: '050', label: 'IRG / Salaires', value: 450000 },
];

const EXEMPTIONS = [
  { product: 'Pain traditionnel', base: 2500000, reason: 'Exonéré art. 9 CTCA' },
  { product: 'Lait pasteurisé en sachet', base: 1800000, reason: 'Exonéré art. 9 CTCA' },
  { product: 'Semoule subventionnée', base: 950000, reason: 'Exonéré art. 9 CTCA' },
];

export default function TaxReportPage() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('Q4 2024');
  const [activeTab, setActiveTab] = useState('overview');
  const { data } = useQuery({ queryKey: ['taxReport'], queryFn: getTaxReportData });

  const fmt = (n: number) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(n);

  const handleExportCSV = () => {
    if (!data) return;
    const csv = 'Taux TVA,Base Imposable,TVA Collectée\n' +
      data.rows.map((r: any) => `${r.taxRate}%,${r.taxableBase},${r.tvaCollected}`).join('\n') +
      `\nTotal,${data.totalTaxableBase},${data.totalTva}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `rapport-fiscal-${period.replace(' ', '-')}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('common.exportSuccess', 'Export CSV téléchargé'));
  };

  const handlePrint = () => {
    window.print();
    toast.info(t('common.printSent', 'Impression lancée'));
  };

  const totalNetTva = data ? data.totalTva - 1890000 : 0;

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('reports.tax.title')} description={t('reports.tax.description')}>
        <div className="flex gap-2">
          <Link to="/business/reports"><Button variant="outline"><ArrowLeft className="h-4 w-4 me-2" />{t('common.back')}</Button></Link>
          <Button variant="outline" onClick={handleExportCSV}><Download className="h-4 w-4 me-2" />CSV</Button>
          <Button variant="outline" onClick={handlePrint}><Printer className="h-4 w-4 me-2" />{t('common.print', 'Imprimer')}</Button>
        </div>
      </PageHeader>

      <div className="flex gap-3 flex-wrap">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PERIODS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <KPIWidget title={t('reports.tax.taxableBase', 'Base imposable')} value={fmt(data.totalTaxableBase)} icon={<Receipt className="h-4 w-4" />} />
            <KPIWidget title={t('reports.tax.tvaCollected', 'TVA collectée')} value={fmt(data.totalTva)} icon={<TrendingUp className="h-4 w-4" />} />
            <KPIWidget title={t('reports.tax.tvaDeductible', 'TVA déductible')} value={fmt(1890000)} icon={<AlertTriangle className="h-4 w-4" />} />
            <KPIWidget title={t('reports.tax.netTva', 'TVA nette')} value={fmt(totalNetTva)} icon={<CheckCircle className="h-4 w-4" />} />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">{t('reports.tax.overview', 'Synthèse')}</TabsTrigger>
              <TabsTrigger value="g50">{t('reports.tax.g50Preview', 'Déclaration G50')}</TabsTrigger>
              <TabsTrigger value="monthly">{t('reports.tax.monthlyTrend', 'Tendance mensuelle')}</TabsTrigger>
              <TabsTrigger value="exemptions">{t('reports.tax.exemptions', 'Exonérations')}</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-muted-foreground" /><CardTitle>{t('reports.tax.breakdownByRate', 'Ventilation par taux')}</CardTitle></div>
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
                        {data.rows.map((row: any, i: number) => (
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
                      <p className="text-3xl font-bold mt-1">{fmt(totalNetTva)}</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">{t('reports.tax.period')}</span><span>{period}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">{t('reports.tax.tvaCollected', 'Collectée')}</span><span>{fmt(data.totalTva)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">{t('reports.tax.tvaDeductible', 'Déductible')}</span><span className="text-destructive">-{fmt(1890000)}</span></div>
                      <div className="flex justify-between font-bold border-t pt-2"><span>{t('reports.tax.netTva', 'Net à payer')}</span><span>{fmt(totalNetTva)}</span></div>
                    </div>
                    <div className="rounded-lg border border-warning/20 bg-warning/5 p-3">
                      <p className="text-xs font-medium">{t('reports.tax.deadline', 'Échéance')}: 20/01/2025</p>
                      <p className="text-xs text-muted-foreground">{t('reports.tax.deadlineNote', 'Date limite de dépôt G50')}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* G50 Tab */}
            <TabsContent value="g50" className="mt-4">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" />{t('reports.tax.g50Preview', 'Aperçu déclaration G50')}</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">{t('reports.tax.code', 'Code')}</TableHead>
                        <TableHead>{t('reports.tax.designation', 'Désignation')}</TableHead>
                        <TableHead className="text-end">{t('reports.tax.amount', 'Montant')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {G50_FIELDS.map(f => (
                        <TableRow key={f.code} className={f.code === '030' ? 'font-bold bg-muted/50' : ''}>
                          <TableCell><Badge variant="outline">{f.code}</Badge></TableCell>
                          <TableCell>{f.label}</TableCell>
                          <TableCell className="text-end font-mono">{fmt(f.value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Monthly Trend Tab */}
            <TabsContent value="monthly" className="mt-4">
              <Card>
                <CardHeader><CardTitle>{t('reports.tax.monthlyTrend', 'Évolution mensuelle TVA')}</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={MONTHLY_TVA}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => fmt(v)} />
                      <Legend />
                      <Bar dataKey="tva9" name="TVA 9%" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="tva19" name="TVA 19%" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Exemptions Tab */}
            <TabsContent value="exemptions" className="mt-4">
              <Card>
                <CardHeader><CardTitle>{t('reports.tax.exemptions', 'Exonérations TVA 0%')}</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('common.product', 'Produit')}</TableHead>
                        <TableHead className="text-end">{t('reports.tax.taxableBase', 'Base')}</TableHead>
                        <TableHead>{t('reports.tax.reason', 'Motif')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {EXEMPTIONS.map((e, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{e.product}</TableCell>
                          <TableCell className="text-end">{fmt(e.base)}</TableCell>
                          <TableCell className="text-muted-foreground">{e.reason}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold border-t-2">
                        <TableCell>{t('invoices.total')}</TableCell>
                        <TableCell className="text-end">{fmt(EXEMPTIONS.reduce((s, e) => s + e.base, 0))}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
