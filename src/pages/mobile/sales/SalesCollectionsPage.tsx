import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getInvoices } from '@/lib/fake-api';
import type { Invoice } from '@/lib/fake-api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SalesCollectionsPage() {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    getInvoices().then(all => setInvoices(all.filter(i => ['overdue', 'partial'].includes(i.status))));
  }, []);

  const totalOutstanding = invoices.reduce((s, i) => s + i.remainingAmount, 0);

  const getDaysOverdue = (dueDate: string) => {
    const diff = Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000);
    return Math.max(0, diff);
  };

  return (
    <div className="p-4 space-y-5">
      <div>
        <h1 className="text-lg font-bold text-foreground">{t('mobile.sales.collections')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('mobile.sales.totalOutstanding')}: <span className="font-bold text-destructive">{totalOutstanding.toLocaleString('fr-DZ')} DA</span>
        </p>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 mx-auto mb-3 text-success" />
          <p className="text-sm text-muted-foreground">{t('mobile.sales.noOverdue')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map(invoice => {
            const days = getDaysOverdue(invoice.dueDate);
            return (
              <Card key={invoice.id} className="border-0 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{invoice.customerName}</p>
                      <p className="text-xs text-muted-foreground">{invoice.invoiceNumber}</p>
                    </div>
                    {days > 0 && (
                      <Badge variant="secondary" className="bg-destructive/10 text-destructive text-[10px] gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {days}j
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('mobile.sales.remaining')}</p>
                      <p className="text-lg font-bold text-foreground">{invoice.remainingAmount.toLocaleString('fr-DZ')} DA</p>
                    </div>
                    <div className="flex gap-2">
                      <a href="tel:+213555010101" className="p-2 rounded-full bg-primary/10">
                        <Phone className="h-4 w-4 text-primary" />
                      </a>
                      <Button size="sm" variant="outline" className="text-xs h-9">
                        {t('mobile.sales.markPaid')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
