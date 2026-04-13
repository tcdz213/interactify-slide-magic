import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getCustomers, getProducts, getOrders, getInventoryItems } from '@/lib/fake-api';
import type { Customer, Product, Order, InventoryItem } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ArrowLeft, Save, CheckCircle, Copy, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface OrderLine {
  productId: string;
  productName: string;
  unitId: string;
  unitName: string;
  qty: number;
  unitPrice: number;
  discount: number; // percentage
  tvaRate: number; // 9 or 19
  lineTotal: number;
  lineTotalTTC: number;
  stockAvailable: number;
  stockWarning: boolean;
}

export default function CreateOrderPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [previousOrders, setPreviousOrders] = useState<Order[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [notes, setNotes] = useState('');
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);

  useEffect(() => {
    Promise.all([getCustomers(), getProducts(), getOrders(), getInventoryItems()]).then(([c, p, o, inv]) => {
      setCustomers(c);
      setProducts(p);
      setPreviousOrders(o);
      setInventory(inv);
    });
  }, []);

  const customer = customers.find(c => c.id === selectedCustomer);

  // TVA rate per category
  const getTvaRate = (category: string): number => {
    const reduced = ['Basics', 'Grains', 'Dairy'];
    return reduced.includes(category) ? 9 : 19;
  };

  const getStockForProduct = (productId: string): number => {
    return inventory.filter(i => i.productId === productId).reduce((s, i) => s + i.quantity, 0);
  };

  const recalcLine = (line: OrderLine): OrderLine => {
    const discountedPrice = line.unitPrice * (1 - line.discount / 100);
    const lineTotal = line.qty * discountedPrice;
    const lineTotalTTC = lineTotal * (1 + line.tvaRate / 100);
    const prod = products.find(p => p.id === line.productId);
    const unit = prod?.units.find(u => u.id === line.unitId);
    const baseQty = line.qty * (unit?.conversionToBase || 1);
    const stockBase = getStockForProduct(line.productId);
    return { ...line, lineTotal, lineTotalTTC, stockAvailable: stockBase, stockWarning: baseQty > stockBase };
  };

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const totalDiscount = lines.reduce((s, l) => s + (l.qty * l.unitPrice * l.discount / 100), 0);
  const tva9 = lines.filter(l => l.tvaRate === 9).reduce((s, l) => s + l.lineTotal * 0.09, 0);
  const tva19 = lines.filter(l => l.tvaRate === 19).reduce((s, l) => s + l.lineTotal * 0.19, 0);
  const totalTva = tva9 + tva19;
  const total = subtotal + totalTva;

  const addLine = () => {
    setLines([...lines, { productId: '', productName: '', unitId: '', unitName: '', qty: 1, unitPrice: 0, discount: 0, tvaRate: 19, lineTotal: 0, lineTotalTTC: 0, stockAvailable: 0, stockWarning: false }]);
  };

  const updateLine = (idx: number, field: string, value: string | number) => {
    const updated = [...lines];
    let line = { ...updated[idx] };

    if (field === 'productId') {
      const prod = products.find(p => p.id === value);
      if (prod) {
        line.productId = prod.id;
        line.productName = prod.name;
        line.unitId = prod.units[0]?.id || '';
        line.unitName = prod.units[0]?.name || '';
        line.tvaRate = getTvaRate(prod.category);
        const rule = prod.pricingRules.find(r => r.unitId === line.unitId && r.segment === (customer?.segment || 'superette'));
        line.unitPrice = rule?.price || 0;
      }
    } else if (field === 'unitId') {
      const prod = products.find(p => p.id === line.productId);
      const unit = prod?.units.find(u => u.id === value);
      if (unit) {
        line.unitId = unit.id;
        line.unitName = unit.name;
        const rule = prod?.pricingRules.find(r => r.unitId === unit.id && r.segment === (customer?.segment || 'superette'));
        line.unitPrice = rule?.price || 0;
      }
    } else if (field === 'qty') {
      line.qty = Math.max(0, Number(value) || 0);
    } else if (field === 'discount') {
      line.discount = Math.min(100, Math.max(0, Number(value) || 0));
    }

    updated[idx] = recalcLine(line);
    setLines(updated);
  };

  const removeLine = (idx: number) => setLines(lines.filter((_, i) => i !== idx));

  const duplicateOrder = (order: Order) => {
    // Simulate filling lines from a previous order
    const mockLines: OrderLine[] = Array.from({ length: order.itemsCount }, (_, i) => {
      const prod = products[i % products.length];
      if (!prod) return null;
      const unit = prod.units[0];
      const rule = prod.pricingRules.find(r => r.unitId === unit?.id && r.segment === (customer?.segment || 'superette'));
      const line: OrderLine = {
        productId: prod.id, productName: prod.name,
        unitId: unit?.id || '', unitName: unit?.name || '',
        qty: Math.floor(Math.random() * 5) + 1,
        unitPrice: rule?.price || 0,
        discount: 0, tvaRate: getTvaRate(prod.category),
        lineTotal: 0, lineTotalTTC: 0, stockAvailable: 0, stockWarning: false,
      };
      return recalcLine(line);
    }).filter(Boolean) as OrderLine[];

    setLines(mockLines);
    setDuplicateDialogOpen(false);
    toast.success(t('createOrder.orderDuplicated'));
  };

  const handleSave = (asDraft: boolean) => {
    if (lines.some(l => l.stockWarning)) {
      toast.error(t('createOrder.stockWarning'));
      return;
    }
    toast.success(asDraft ? t('createOrder.savedAsDraft') : t('createOrder.orderConfirmed'));
    navigate('/business/orders');
  };

  const fmt = (n: number) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(n);

  const hasStockWarnings = lines.some(l => l.stockWarning);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/business/orders')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('createOrder.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('createOrder.subtitle')}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setDuplicateDialogOpen(true)}>
          <Copy className="h-4 w-4 me-2" />{t('createOrder.duplicatePrevious')}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader><CardTitle className="text-base">{t('createOrder.selectCustomer')}</CardTitle></CardHeader>
            <CardContent>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger><SelectValue placeholder={t('createOrder.chooseCustomer')} /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} — <span className="text-muted-foreground text-xs">{c.segment}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {customer && (
                <div className="mt-3 p-3 rounded-lg bg-muted text-sm space-y-1">
                  <p><span className="font-medium">{t('products.segment')}:</span> {customer.segment}</p>
                  <p><span className="font-medium">{t('common.address')}:</span> {customer.address}</p>
                  <p><span className="font-medium">{t('common.phone')}:</span> {customer.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Lines */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">{t('createOrder.orderLines')}</CardTitle>
              <Button size="sm" onClick={addLine}><Plus className="h-3.5 w-3.5 me-1" />{t('createOrder.addLine')}</Button>
            </CardHeader>
            <CardContent>
              {lines.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{t('createOrder.noLines')}</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('products.title')}</TableHead>
                        <TableHead>{t('products.unit')}</TableHead>
                        <TableHead>{t('createOrder.qty')}</TableHead>
                        <TableHead>{t('createOrder.unitPrice')}</TableHead>
                        <TableHead>{t('createOrder.discountPercent')}</TableHead>
                        <TableHead>{t('createOrder.tvaRate')}</TableHead>
                        <TableHead>{t('common.total')}</TableHead>
                        <TableHead>{t('createOrder.stock')}</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lines.map((line, idx) => (
                        <TableRow key={idx} className={line.stockWarning ? 'bg-destructive/5' : ''}>
                          <TableCell>
                            <Select value={line.productId} onValueChange={v => updateLine(idx, 'productId', v)}>
                              <SelectTrigger className="w-48"><SelectValue placeholder={t('createOrder.selectProduct')} /></SelectTrigger>
                              <SelectContent>{products.filter(p => p.isActive).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {line.productId && (
                              <Select value={line.unitId} onValueChange={v => updateLine(idx, 'unitId', v)}>
                                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {products.find(p => p.id === line.productId)?.units.map(u => (
                                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input type="number" min={1} value={line.qty} onChange={e => updateLine(idx, 'qty', e.target.value)} className="w-20" />
                          </TableCell>
                          <TableCell className="font-mono text-sm">{fmt(line.unitPrice)}</TableCell>
                          <TableCell>
                            <Input type="number" min={0} max={100} value={line.discount} onChange={e => updateLine(idx, 'discount', e.target.value)} className="w-20" />
                          </TableCell>
                          <TableCell>
                            <Badge variant={line.tvaRate === 9 ? 'secondary' : 'outline'}>{line.tvaRate}%</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{fmt(line.lineTotal)}</TableCell>
                          <TableCell>
                            {line.productId && (
                              <div className="flex items-center gap-1">
                                {line.stockWarning && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                                <span className={`text-xs ${line.stockWarning ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                                  {line.stockAvailable.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removeLine(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {hasStockWarnings && (
                <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {t('createOrder.stockInsufficient')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader><CardTitle className="text-base">{t('createOrder.notes')}</CardTitle></CardHeader>
            <CardContent>
              <Textarea placeholder={t('createOrder.notesPlaceholder')} value={notes} onChange={e => setNotes(e.target.value)} />
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader><CardTitle className="text-base">{t('createOrder.summary')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">{t('createOrder.subtotal')}</span><span>{fmt(subtotal + totalDiscount)}</span></div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-green-600"><span>{t('createOrder.totalDiscount')}</span><span>-{fmt(totalDiscount)}</span></div>
                )}
                <div className="flex justify-between"><span className="text-muted-foreground">{t('createOrder.subtotalAfterDiscount')}</span><span>{fmt(subtotal)}</span></div>
                {tva9 > 0 && <div className="flex justify-between"><span className="text-muted-foreground">TVA 9%</span><span>{fmt(tva9)}</span></div>}
                {tva19 > 0 && <div className="flex justify-between"><span className="text-muted-foreground">TVA 19%</span><span>{fmt(tva19)}</span></div>}
                <div className="border-t pt-2 flex justify-between font-bold text-base"><span>{t('common.total')} TTC</span><span>{fmt(total)}</span></div>
              </div>
              <div className="text-xs text-muted-foreground">
                {lines.length} {t('createOrder.linesCount')} · {lines.reduce((s, l) => s + l.qty, 0)} {t('createOrder.unitsCount')}
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="outline" className="w-full" onClick={() => handleSave(true)} disabled={!selectedCustomer || lines.length === 0}>
                  <Save className="h-4 w-4 me-2" />{t('createOrder.saveAsDraft')}
                </Button>
                <Button className="w-full" onClick={() => handleSave(false)} disabled={!selectedCustomer || lines.length === 0 || hasStockWarnings}>
                  <CheckCircle className="h-4 w-4 me-2" />{t('createOrder.confirmOrder')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Duplicate Previous Order Dialog */}
      <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('createOrder.duplicatePrevious')}</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {previousOrders.filter(o => o.status !== 'cancelled').map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => duplicateOrder(order)}>
                <div>
                  <p className="font-medium text-sm">{order.id.toUpperCase()} — {order.customerName}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('fr-FR')} · {order.itemsCount} {t('createOrder.linesCount')} · {fmt(order.totalAmount)}</p>
                </div>
                <Copy className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
