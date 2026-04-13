import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDeliveryRoutes, getOrders } from '@/lib/fake-api';
import type { RouteStop, Order } from '@/lib/fake-api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Camera, PenLine, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DeliveryStopPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [stop, setStop] = useState<RouteStop | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    getDeliveryRoutes().then(routes => {
      for (const r of routes) {
        const found = r.stops.find(s => s.orderId === id);
        if (found) { setStop(found); break; }
      }
    });
    if (id) getOrders().then(orders => setOrder(orders.find(o => o.id === id) ?? null));
  }, [id]);

  if (!stop) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      {t('common.loading')}
    </div>
  );

  // Mock delivery items
  const items = [
    { id: '1', name: 'Couscous Fin 1kg', qty: 40, unit: 'Pack (12)' },
    { id: '2', name: 'Huile de Tournesol 5L', qty: 60, unit: 'Pièce' },
    { id: '3', name: 'Lait UHT 1L', qty: 24, unit: 'Pack (24)' },
  ];

  const toggleItem = (itemId: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  };

  const allChecked = checkedItems.size === items.length;

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Customer Info */}
      <div className="bg-primary/5 p-4 space-y-1">
        <h1 className="text-lg font-bold text-foreground">{stop.customerName}</h1>
        <p className="text-sm text-muted-foreground">{stop.address}</p>
        <a href="tel:+213555010101" className="inline-flex items-center gap-1.5 text-sm text-primary font-medium mt-1">
          <Phone className="h-4 w-4" />
          {t('mobile.driver.callCustomer')}
        </a>
      </div>

      {/* Items Checklist */}
      <div className="p-4 space-y-3 flex-1">
        <h2 className="text-sm font-semibold text-foreground">{t('mobile.driver.itemsList')}</h2>
        {items.map(item => (
          <Card
            key={item.id}
            className={cn(
              'border-0 shadow-sm cursor-pointer transition-all',
              checkedItems.has(item.id) && 'bg-success/5'
            )}
            onClick={() => toggleItem(item.id)}
          >
            <CardContent className="p-3 flex items-center gap-3">
              <Checkbox
                checked={checkedItems.has(item.id)}
                onCheckedChange={() => toggleItem(item.id)}
                className="h-5 w-5"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.qty} × {item.unit}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="outline" className="h-12 gap-2 rounded-xl">
            <Camera className="h-4 w-4" />
            {t('mobile.driver.takePhoto')}
          </Button>
          <Button variant="outline" className="h-12 gap-2 rounded-xl">
            <PenLine className="h-4 w-4" />
            {t('mobile.driver.signature')}
          </Button>
        </div>

        {/* Collapsible Notes */}
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="flex items-center gap-1 text-sm text-primary font-medium mt-2"
        >
          <ChevronRight className={cn('h-4 w-4 transition-transform', showNotes && 'rotate-90')} />
          {t('mobile.driver.addNotes')}
        </button>
        {showNotes && (
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={t('mobile.driver.notesPlaceholder')}
            className="min-h-[80px]"
          />
        )}
      </div>

      {/* Complete CTA */}
      <div className="sticky bottom-20 p-4">
        <Button
          size="lg"
          disabled={!allChecked}
          className={cn(
            'w-full h-14 text-base rounded-xl transition-all',
            allChecked ? 'bg-success hover:bg-success/90 text-success-foreground' : ''
          )}
        >
          {allChecked
            ? t('mobile.driver.completeDelivery')
            : t('mobile.driver.checkAllItems')}
        </Button>
      </div>
    </div>
  );
}
