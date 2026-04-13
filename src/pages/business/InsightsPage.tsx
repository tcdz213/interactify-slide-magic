import { useTranslation } from 'react-i18next';
import { Brain, TrendingUp, TrendingDown, Users, Package, AlertTriangle, ShoppingCart } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KPIWidget } from '@/components/KPIWidget';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';

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
  { customer: 'Superette El Baraka', wilaya: 'Oran', lastOrder: '45 jours', risk: 'high' as const, signal: 'Aucune commande depuis 45j', action: 'Appeler le commercial' },
  { customer: 'Pharmacie Centrale', wilaya: 'Alger', lastOrder: '30 jours', risk: 'medium' as const, signal: 'Volume en baisse -40%', action: 'Proposer une remise' },
  { customer: 'Grossiste Benamar', wilaya: 'Blida', lastOrder: '25 jours', risk: 'medium' as const, signal: 'Réclamation non résolue', action: 'Suivi réclamation' },
  { customer: 'Mini-market Yasmine', wilaya: 'Tizi Ouzou', lastOrder: '60 jours', risk: 'high' as const, signal: 'Client injoignable', action: 'Visite terrain' },
];

const REORDER = [
  { product: 'Paracétamol 500mg', stock: 45, forecast: 120, reorderQty: 200, urgency: 'high' },
  { product: 'Huile 5L Elio', stock: 80, forecast: 150, reorderQty: 150, urgency: 'medium' },
  { product: 'Semoule fine 25kg', stock: 200, forecast: 300, reorderQty: 250, urgency: 'medium' },
  { product: 'Ciment CPJ 50kg', stock: 30, forecast: 100, reorderQty: 200, urgency: 'high' },
  { product: 'Couches bébé T3', stock: 150, forecast: 180, reorderQty: 100, urgency: 'low' },
];

export default function InsightsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader title={t('saas.insights', 'AI Insights')} description={t('saas.insightsDesc', 'Recommandations intelligentes basées sur vos données')} />

      <div className="grid gap-4 sm:grid-cols-4">
        <KPIWidget title="Prévision commandes" value="+15%" icon={<TrendingUp className="h-4 w-4" />} />
        <KPIWidget title="Clients à risque" value={4} icon={<AlertTriangle className="h-4 w-4" />} />
        <KPIWidget title="Réappros suggérés" value={5} icon={<Package className="h-4 w-4" />} />
        <KPIWidget title="Cross-sell détectés" value={RECOMMENDATIONS.length} icon={<ShoppingCart className="h-4 w-4" />} />
      </div>

      {/* Demand Forecast */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Prévision de la demande</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={FORECAST_DATA}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="actual" name="Réel" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
              <Area type="monotone" dataKey="predicted" name="Prévision" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Product Recommendations */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Brain className="h-4 w-4 text-primary" />Recommandations produits</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {RECOMMENDATIONS.map((r) => (
              <div key={r.product} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Clients de <span className="text-primary">{r.product}</span></p>
                  <Badge variant="secondary">{r.confidence}% confiance</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">achètent aussi <span className="font-medium">{r.coProduct}</span> ({r.buyers} clients)</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Churn Risk */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4 text-destructive" />Risque de perte client</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {CHURN_RISK.map((c) => (
              <div key={c.customer} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{c.customer}</p>
                  <Badge variant={c.risk === 'high' ? 'destructive' : 'secondary'}>{c.risk === 'high' ? 'Élevé' : 'Moyen'}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{c.signal} • {c.wilaya}</p>
                <p className="text-xs text-primary mt-1">→ {c.action}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Reorder Suggestions */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Package className="h-4 w-4 text-primary" />Suggestions de réapprovisionnement</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-start py-2 font-medium">Produit</th>
                  <th className="text-end py-2 font-medium">Stock actuel</th>
                  <th className="text-end py-2 font-medium">Demande prévue</th>
                  <th className="text-end py-2 font-medium">Qté suggérée</th>
                  <th className="text-center py-2 font-medium">Urgence</th>
                </tr>
              </thead>
              <tbody>
                {REORDER.map((r) => (
                  <tr key={r.product} className="border-b last:border-0">
                    <td className="py-2.5 font-medium text-foreground">{r.product}</td>
                    <td className="text-end text-foreground">{r.stock}</td>
                    <td className="text-end text-foreground">{r.forecast}</td>
                    <td className="text-end font-medium text-primary">{r.reorderQty}</td>
                    <td className="text-center">
                      <Badge variant={r.urgency === 'high' ? 'destructive' : r.urgency === 'medium' ? 'secondary' : 'outline'}>
                        {r.urgency === 'high' ? 'Urgent' : r.urgency === 'medium' ? 'Moyen' : 'Bas'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
