import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Brain, TrendingUp, Users, Package, AlertTriangle, ShoppingCart, Phone, Mail, CheckCircle, Settings } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { KPIWidget } from '@/components/KPIWidget';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  { product: 'Paracétamol 500mg', coProduct: 'Ibuprofène 400mg', confidence: 87, buyers: 34 },
  { product: 'Huile de tournesol 5L', coProduct: 'Concentré de tomate 800g', confidence: 82, buyers: 28 },
  { product: 'Ciment CPJ 42.5', coProduct: 'Fer à béton T12', confidence: 79, buyers: 22 },
  { product: 'Lait UHT 1L', coProduct: 'Sucre blanc 1kg', confidence: 76, buyers: 45 },
];

const CHURN_RISK = [
  { customer: 'Superette El Baraka', wilaya: 'Oran', lastOrder: '45 jours', risk: 'high' as const, signal: 'Aucune commande depuis 45j', action: 'Appeler le commercial', contacted: false },
  { customer: 'Pharmacie Centrale', wilaya: 'Alger', lastOrder: '30 jours', risk: 'medium' as const, signal: 'Volume en baisse -40%', action: 'Proposer une remise', contacted: false },
  { customer: 'Grossiste Benamar', wilaya: 'Blida', lastOrder: '25 jours', risk: 'medium' as const, signal: 'Réclamation non résolue', action: 'Suivi réclamation', contacted: false },
  { customer: 'Mini-market Yasmine', wilaya: 'Tizi Ouzou', lastOrder: '60 jours', risk: 'high' as const, signal: 'Client injoignable', action: 'Visite terrain', contacted: false },
];

const REORDER = [
  { product: 'Paracétamol 500mg', stock: 45, forecast: 120, reorderQty: 200, urgency: 'high', ordered: false },
  { product: 'Huile 5L Elio', stock: 80, forecast: 150, reorderQty: 150, urgency: 'medium', ordered: false },
  { product: 'Semoule fine 25kg', stock: 200, forecast: 300, reorderQty: 250, urgency: 'medium', ordered: false },
  { product: 'Ciment CPJ 50kg', stock: 30, forecast: 100, reorderQty: 200, urgency: 'high', ordered: false },
  { product: 'Couches bébé T3', stock: 150, forecast: 180, reorderQty: 100, urgency: 'low', ordered: false },
];

const ACCURACY_DATA = [
  { month: 'Oct', accuracy: 89 }, { month: 'Nov', accuracy: 91 }, { month: 'Dec', accuracy: 88 },
  { month: 'Jan', accuracy: 92 }, { month: 'Fév', accuracy: 94 }, { month: 'Mar', accuracy: 93 },
];

export default function InsightsPage() {
  const { t } = useTranslation();
  const [churnData, setChurnData] = useState(CHURN_RISK);
  const [reorderData, setReorderData] = useState(REORDER);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [forecastDays, setForecastDays] = useState([90]);
  const [confidenceThreshold, setConfidenceThreshold] = useState([75]);

  const handleContact = (idx: number, method: 'call' | 'email') => {
    setChurnData(prev => prev.map((c, i) => i === idx ? { ...c, contacted: true } : c));
    toast.success(method === 'call' ? t('insights.callInitiated', 'Call initiated') : t('insights.emailSent', 'Email sent'));
  };

  const handleOrder = (idx: number) => {
    setReorderData(prev => prev.map((r, i) => i === idx ? { ...r, ordered: true } : r));
    toast.success(t('insights.orderCreated', 'Reorder created'));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title={t('saas.insights', 'AI Insights')} description={t('saas.insightsDesc', 'Smart recommendations based on your data')}>
        <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
          <Settings className="h-4 w-4 me-2" />{t('insights.forecastSettings', 'Settings')}
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-4">
        <KPIWidget title={t('insights.forecastGrowth', 'Forecast Growth')} value="+15%" icon={<TrendingUp className="h-4 w-4" />} />
        <KPIWidget title={t('insights.churnRisk', 'Churn Risk')} value={churnData.filter(c => !c.contacted).length} icon={<AlertTriangle className="h-4 w-4" />} />
        <KPIWidget title={t('insights.reorderSuggestions', 'Reorder Suggestions')} value={reorderData.filter(r => !r.ordered).length} icon={<Package className="h-4 w-4" />} />
        <KPIWidget title={t('insights.crossSell', 'Cross-sell')} value={RECOMMENDATIONS.length} icon={<ShoppingCart className="h-4 w-4" />} />
      </div>

      {/* Demand Forecast */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />{t('insights.demandForecast', 'Demand Forecast')}</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={FORECAST_DATA}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="actual" name={t('insights.actual', 'Actual')} stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
              <Area type="monotone" dataKey="predicted" name={t('insights.predicted', 'Predicted')} stroke="hsl(var(--warning, 38 92% 50%))" fill="hsl(var(--warning, 38 92% 50%))" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Product Recommendations */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Brain className="h-4 w-4 text-primary" />{t('insights.productRecommendations', 'Product Recommendations')}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {RECOMMENDATIONS.filter(r => r.confidence >= confidenceThreshold[0]).map((r) => (
              <div key={r.product} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{t('insights.buyersOf', 'Buyers of')} <span className="text-primary">{r.product}</span></p>
                  <Badge variant="secondary">{r.confidence}%</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t('insights.alsoBuy', 'also buy')} <span className="font-medium">{r.coProduct}</span> ({r.buyers} {t('insights.clients', 'clients')})</p>
                <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => toast.success(t('insights.campaignCreated', 'Cross-sell campaign created'))}>
                  <ShoppingCart className="h-3.5 w-3.5 me-1" />{t('insights.createCampaign', 'Create Campaign')}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Churn Risk */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4 text-destructive" />{t('insights.churnRiskTitle', 'Customer Churn Risk')}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {churnData.map((c, idx) => (
              <div key={c.customer} className={`rounded-lg border p-3 ${c.contacted ? 'opacity-60' : ''}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{c.customer}</p>
                  <Badge variant={c.risk === 'high' ? 'destructive' : 'secondary'}>
                    {c.contacted ? <CheckCircle className="h-3 w-3 me-1" /> : null}
                    {c.risk === 'high' ? t('insights.highRisk', 'High') : t('insights.mediumRisk', 'Medium')}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{c.signal} • {c.wilaya}</p>
                {!c.contacted && (
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleContact(idx, 'call')}>
                      <Phone className="h-3.5 w-3.5 me-1" />{t('insights.call', 'Call')}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleContact(idx, 'email')}>
                      <Mail className="h-3.5 w-3.5 me-1" />{t('insights.sendEmail', 'Email')}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Reorder Suggestions */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Package className="h-4 w-4 text-primary" />{t('insights.reorderTitle', 'Reorder Suggestions')}</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-start py-2 font-medium">{t('products.title', 'Product')}</th>
                  <th className="text-end py-2 font-medium">{t('insights.currentStock', 'Current Stock')}</th>
                  <th className="text-end py-2 font-medium">{t('insights.forecastDemand', 'Forecast Demand')}</th>
                  <th className="text-end py-2 font-medium">{t('insights.suggestedQty', 'Suggested Qty')}</th>
                  <th className="text-center py-2 font-medium">{t('insights.urgencyLabel', 'Urgency')}</th>
                  <th className="text-center py-2 font-medium">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {reorderData.map((r, idx) => (
                  <tr key={r.product} className={`border-b last:border-0 ${r.ordered ? 'opacity-50' : ''}`}>
                    <td className="py-2.5 font-medium text-foreground">{r.product}</td>
                    <td className="text-end text-foreground">{r.stock}</td>
                    <td className="text-end text-foreground">{r.forecast}</td>
                    <td className="text-end font-medium text-primary">{r.reorderQty}</td>
                    <td className="text-center">
                      <Badge variant={r.urgency === 'high' ? 'destructive' : r.urgency === 'medium' ? 'secondary' : 'outline'}>
                        {r.urgency === 'high' ? t('insights.urgent', 'Urgent') : r.urgency === 'medium' ? t('insights.medium', 'Medium') : t('insights.low', 'Low')}
                      </Badge>
                    </td>
                    <td className="text-center">
                      {r.ordered ? (
                        <Badge variant="outline"><CheckCircle className="h-3 w-3 me-1" />{t('insights.ordered', 'Ordered')}</Badge>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleOrder(idx)}>{t('insights.createOrder', 'Order')}</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Forecast Accuracy */}
      <Card>
        <CardHeader><CardTitle className="text-base">{t('insights.forecastAccuracy', 'Forecast Accuracy History')}</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ACCURACY_DATA}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis domain={[80, 100]} className="text-xs" />
              <Tooltip />
              <Line type="monotone" dataKey="accuracy" name={t('insights.accuracy', 'Accuracy %')} className="stroke-primary" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('insights.forecastSettings', 'Forecast Settings')}</DialogTitle></DialogHeader>
          <div className="space-y-6 pt-2">
            <div className="space-y-3">
              <Label>{t('insights.forecastHorizon', 'Forecast Horizon')}: {forecastDays[0]} {t('insights.days', 'days')}</Label>
              <Slider value={forecastDays} onValueChange={setForecastDays} min={30} max={180} step={30} />
            </div>
            <div className="space-y-3">
              <Label>{t('insights.confidenceMin', 'Min Confidence')}: {confidenceThreshold[0]}%</Label>
              <Slider value={confidenceThreshold} onValueChange={setConfidenceThreshold} min={50} max={95} step={5} />
            </div>
            <Button className="w-full" onClick={() => { setSettingsOpen(false); toast.success(t('insights.settingsSaved', 'Settings saved')); }}>{t('common.save')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
