import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Brain, TrendingUp, Users, Package, AlertTriangle, ShoppingCart, Filter, Download, RefreshCw, ChevronDown, Search, ArrowUpRight } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KPIWidget } from '@/components/KPIWidget';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { toast } from 'sonner';

const FORECAST_DATA = [
  { month: 'Jan', actual: 120, predicted: 115 },
  { month: 'Fév', actual: 145, predicted: 140 },
  { month: 'Mar', actual: 160, predicted: 155 },
  { month: 'Avr', actual: 180, predicted: 175 },
  { month: 'Mai', actual: null, predicted: 195 },
  { month: 'Jun', actual: null, predicted: 210 },
  { month: 'Jul', actual: null, predicted: 225 },
];

const RECOMMENDATIONS = [
  { id: 1, product: 'Paracétamol 500mg', coProduct: 'Ibuprofène 400mg', confidence: 87, buyers: 34, status: 'active' as const },
  { id: 2, product: 'Huile de tournesol 5L', coProduct: 'Concentré de tomate 800g', confidence: 82, buyers: 28, status: 'active' as const },
  { id: 3, product: 'Ciment CPJ 42.5', coProduct: 'Fer à béton T12', confidence: 79, buyers: 22, status: 'dismissed' as const },
  { id: 4, product: 'Lait UHT 1L', coProduct: 'Sucre blanc 1kg', confidence: 76, buyers: 45, status: 'active' as const },
  { id: 5, product: 'Savon liquide 1L', coProduct: 'Éponge ménagère', confidence: 71, buyers: 19, status: 'active' as const },
];

const CHURN_RISK = [
  { id: 1, customer: 'Superette El Baraka', wilaya: 'Oran', lastOrder: '45 jours', risk: 'high' as const, signal: 'Aucune commande depuis 45j', action: 'Appeler le commercial', contacted: false },
  { id: 2, customer: 'Pharmacie Centrale', wilaya: 'Alger', lastOrder: '30 jours', risk: 'medium' as const, signal: 'Volume en baisse -40%', action: 'Proposer une remise', contacted: true },
  { id: 3, customer: 'Grossiste Benamar', wilaya: 'Blida', lastOrder: '25 jours', risk: 'medium' as const, signal: 'Réclamation non résolue', action: 'Suivi réclamation', contacted: false },
  { id: 4, customer: 'Mini-market Yasmine', wilaya: 'Tizi Ouzou', lastOrder: '60 jours', risk: 'high' as const, signal: 'Client injoignable', action: 'Visite terrain', contacted: false },
  { id: 5, customer: 'Épicerie Fine Saïd', wilaya: 'Constantine', lastOrder: '35 jours', risk: 'medium' as const, signal: 'Fréquence en baisse', action: 'Offre fidélité', contacted: false },
];

const REORDER = [
  { id: 1, product: 'Paracétamol 500mg', stock: 45, forecast: 120, reorderQty: 200, urgency: 'high' as const, approved: false },
  { id: 2, product: 'Huile 5L Elio', stock: 80, forecast: 150, reorderQty: 150, urgency: 'medium' as const, approved: false },
  { id: 3, product: 'Semoule fine 25kg', stock: 200, forecast: 300, reorderQty: 250, urgency: 'medium' as const, approved: true },
  { id: 4, product: 'Ciment CPJ 50kg', stock: 30, forecast: 100, reorderQty: 200, urgency: 'high' as const, approved: false },
  { id: 5, product: 'Couches bébé T3', stock: 150, forecast: 180, reorderQty: 100, urgency: 'low' as const, approved: false },
];

export default function InsightsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('forecast');
  const [riskFilter, setRiskFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [recSearch, setRecSearch] = useState('');
  const [churnSearch, setChurnSearch] = useState('');
  const [recommendations, setRecommendations] = useState(RECOMMENDATIONS);
  const [churnRisk, setChurnRisk] = useState(CHURN_RISK);
  const [reorderItems, setReorderItems] = useState(REORDER);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; customer?: typeof CHURN_RISK[0] }>({ open: false });
  const [actionNote, setActionNote] = useState('');

  const filteredChurn = useMemo(() => {
    let items = churnRisk;
    if (riskFilter !== 'all') items = items.filter(c => c.risk === riskFilter);
    if (churnSearch) items = items.filter(c => c.customer.toLowerCase().includes(churnSearch.toLowerCase()));
    return items;
  }, [churnRisk, riskFilter, churnSearch]);

  const filteredReorder = useMemo(() => {
    let items = reorderItems;
    if (urgencyFilter !== 'all') items = items.filter(r => r.urgency === urgencyFilter);
    return items;
  }, [reorderItems, urgencyFilter]);

  const filteredRecs = useMemo(() => {
    let items = recommendations.filter(r => r.status === 'active');
    if (recSearch) items = items.filter(r => r.product.toLowerCase().includes(recSearch.toLowerCase()) || r.coProduct.toLowerCase().includes(recSearch.toLowerCase()));
    return items;
  }, [recommendations, recSearch]);

  const handleDismissRec = (id: number) => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' as const } : r));
    toast.success(t('common.success', 'Recommandation ignorée'));
  };

  const handleApproveReorder = (id: number) => {
    setReorderItems(prev => prev.map(r => r.id === id ? { ...r, approved: true } : r));
    toast.success(t('common.success', 'Réapprovisionnement approuvé'));
  };

  const handleContactCustomer = () => {
    if (!actionDialog.customer) return;
    setChurnRisk(prev => prev.map(c => c.id === actionDialog.customer!.id ? { ...c, contacted: true } : c));
    toast.success(`Action enregistrée pour ${actionDialog.customer.customer}`);
    setActionDialog({ open: false });
    setActionNote('');
  };

  const handleExportCSV = (section: string) => {
    let csv = '';
    if (section === 'churn') {
      csv = 'Client,Wilaya,Dernière Commande,Risque,Signal,Action\n' +
        filteredChurn.map(c => `"${c.customer}","${c.wilaya}","${c.lastOrder}","${c.risk}","${c.signal}","${c.action}"`).join('\n');
    } else if (section === 'reorder') {
      csv = 'Produit,Stock,Prévision,Qté Suggérée,Urgence\n' +
        filteredReorder.map(r => `"${r.product}",${r.stock},${r.forecast},${r.reorderQty},"${r.urgency}"`).join('\n');
    } else {
      csv = 'Produit,Co-Produit,Confiance,Acheteurs\n' +
        filteredRecs.map(r => `"${r.product}","${r.coProduct}",${r.confidence}%,${r.buyers}`).join('\n');
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `insights-${section}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('common.exportSuccess', 'Export CSV téléchargé'));
  };

  const atRiskCount = churnRisk.filter(c => !c.contacted).length;
  const pendingReorders = reorderItems.filter(r => !r.approved).length;

  return (
    <div className="space-y-6">
      <PageHeader title={t('saas.insights', 'AI Insights')} description={t('saas.insightsDesc', 'Recommandations intelligentes basées sur vos données')}>
        <Button variant="outline" size="sm" onClick={() => toast.info('Modèles actualisés')}><RefreshCw className="h-4 w-4 me-2" />{t('common.refresh', 'Actualiser')}</Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-4">
        <KPIWidget title={t('insights.forecastOrders', 'Prévision commandes')} value="+15%" icon={<TrendingUp className="h-4 w-4" />} />
        <KPIWidget title={t('insights.atRiskCustomers', 'Clients à risque')} value={atRiskCount} icon={<AlertTriangle className="h-4 w-4" />} />
        <KPIWidget title={t('insights.pendingReorders', 'Réappros en attente')} value={pendingReorders} icon={<Package className="h-4 w-4" />} />
        <KPIWidget title={t('insights.crossSell', 'Cross-sell actifs')} value={filteredRecs.length} icon={<ShoppingCart className="h-4 w-4" />} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="forecast">{t('insights.demandForecast', 'Prévision demande')}</TabsTrigger>
          <TabsTrigger value="recommendations">{t('insights.recommendations', 'Cross-sell')}</TabsTrigger>
          <TabsTrigger value="churn">{t('insights.churnRisk', 'Risque perte')}</TabsTrigger>
          <TabsTrigger value="reorder">{t('insights.reorderSuggestions', 'Réappro')}</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />{t('insights.demandForecast', 'Prévision de la demande')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={FORECAST_DATA}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="actual" name={t('insights.actual', 'Réel')} stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                  <Area type="monotone" dataKey="predicted" name={t('insights.predicted', 'Prévision')} stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-4 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder={t('common.search', 'Rechercher...')} value={recSearch} onChange={e => setRecSearch(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" onClick={() => handleExportCSV('recommendations')}><Download className="h-4 w-4 me-2" />CSV</Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {filteredRecs.map(r => (
              <Card key={r.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">Clients de <span className="text-primary">{r.product}</span></p>
                      <p className="text-xs text-muted-foreground mt-1">achètent aussi <span className="font-medium">{r.coProduct}</span> ({r.buyers} clients)</p>
                    </div>
                    <Badge variant="secondary">{r.confidence}%</Badge>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="text-xs h-7"><ArrowUpRight className="h-3 w-3 me-1" />{t('insights.createBundle', 'Créer bundle')}</Button>
                    <Button size="sm" variant="ghost" className="text-xs h-7 text-muted-foreground" onClick={() => handleDismissRec(r.id)}>{t('common.dismiss', 'Ignorer')}</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredRecs.length === 0 && <p className="text-sm text-muted-foreground col-span-2 text-center py-8">{t('common.noData', 'Aucun résultat')}</p>}
          </div>
        </TabsContent>

        <TabsContent value="churn" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder={t('insights.searchCustomer', 'Rechercher client...')} value={churnSearch} onChange={e => setChurnSearch(e.target.value)} />
            </div>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder={t('insights.riskLevel', 'Niveau risque')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all', 'Tous')}</SelectItem>
                <SelectItem value="high">{t('insights.high', 'Élevé')}</SelectItem>
                <SelectItem value="medium">{t('insights.medium', 'Moyen')}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => handleExportCSV('churn')}><Download className="h-4 w-4 me-2" />CSV</Button>
          </div>
          <div className="space-y-3">
            {filteredChurn.map(c => (
              <Card key={c.id} className={c.contacted ? 'opacity-60' : ''}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium flex items-center gap-2">{c.customer} {c.contacted && <Badge variant="outline" className="text-xs">{t('insights.contacted', 'Contacté')}</Badge>}</p>
                      <p className="text-xs text-muted-foreground mt-1">{c.signal} • {c.wilaya} • {c.lastOrder}</p>
                      <p className="text-xs text-primary mt-1">→ {c.action}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={c.risk === 'high' ? 'destructive' : 'secondary'}>{c.risk === 'high' ? t('insights.high', 'Élevé') : t('insights.medium', 'Moyen')}</Badge>
                      {!c.contacted && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setActionDialog({ open: true, customer: c })}>{t('insights.takeAction', 'Agir')}</Button>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reorder" className="mt-4 space-y-4">
          <div className="flex gap-3">
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder={t('insights.urgency', 'Urgence')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all', 'Tous')}</SelectItem>
                <SelectItem value="high">{t('insights.urgent', 'Urgent')}</SelectItem>
                <SelectItem value="medium">{t('insights.medium', 'Moyen')}</SelectItem>
                <SelectItem value="low">{t('insights.low', 'Bas')}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => handleExportCSV('reorder')}><Download className="h-4 w-4 me-2" />CSV</Button>
          </div>
          <Card>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-start py-2 font-medium">{t('common.product', 'Produit')}</th>
                      <th className="text-end py-2 font-medium">{t('insights.currentStock', 'Stock actuel')}</th>
                      <th className="text-end py-2 font-medium">{t('insights.forecastDemand', 'Demande prévue')}</th>
                      <th className="text-end py-2 font-medium">{t('insights.suggestedQty', 'Qté suggérée')}</th>
                      <th className="text-center py-2 font-medium">{t('insights.urgency', 'Urgence')}</th>
                      <th className="text-center py-2 font-medium">{t('common.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReorder.map(r => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="py-2.5 font-medium text-foreground">{r.product}</td>
                        <td className="text-end text-foreground">{r.stock}</td>
                        <td className="text-end text-foreground">{r.forecast}</td>
                        <td className="text-end font-medium text-primary">{r.reorderQty}</td>
                        <td className="text-center">
                          <Badge variant={r.urgency === 'high' ? 'destructive' : r.urgency === 'medium' ? 'secondary' : 'outline'}>
                            {r.urgency === 'high' ? t('insights.urgent', 'Urgent') : r.urgency === 'medium' ? t('insights.medium', 'Moyen') : t('insights.low', 'Bas')}
                          </Badge>
                        </td>
                        <td className="text-center">
                          {r.approved ? (
                            <Badge variant="outline" className="text-success border-success">{t('insights.approved', 'Approuvé')}</Badge>
                          ) : (
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleApproveReorder(r.id)}>{t('insights.approve', 'Approuver')}</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialog for Churn */}
      <Dialog open={actionDialog.open} onOpenChange={o => !o && setActionDialog({ open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('insights.recordAction', 'Enregistrer une action')}</DialogTitle>
            <DialogDescription>{actionDialog.customer?.customer} — {actionDialog.customer?.action}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>{t('insights.actionNote', 'Note de suivi')}</Label>
              <Textarea value={actionNote} onChange={e => setActionNote(e.target.value)} placeholder={t('insights.actionNotePlaceholder', 'Décrivez l\'action effectuée...')} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false })}>{t('common.cancel', 'Annuler')}</Button>
            <Button onClick={handleContactCustomer}>{t('insights.confirmAction', 'Confirmer')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
