import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getCustomers, getProducts } from '@/lib/fake-api';
import type { Customer, Product } from '@/lib/fake-api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Minus, ShoppingCart, MapPin, ScanLine, Camera, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  unit: string;
}

export default function SalesCreateOrderPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<'customer' | 'products' | 'confirm'>('customer');
  const [gpsCheckedIn, setGpsCheckedIn] = useState(false);
  const [notes, setNotes] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  useEffect(() => {
    getCustomers().then(setCustomers);
    getProducts().then(setProducts);
  }, []);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchCustomer.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const getSegmentPrice = (product: Product) => {
    if (!selectedCustomer) return product.pricingRules[0]?.price ?? 0;
    const segmentRule = product.pricingRules.find(r => r.segment === selectedCustomer.segment);
    return segmentRule?.price ?? product.pricingRules[0]?.price ?? 0;
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.productId === product.id);
      if (existing) {
        return prev.map(c => c.productId === product.id ? { ...c, qty: c.qty + 1 } : c);
      }
      const price = getSegmentPrice(product);
      return [...prev, { productId: product.id, name: product.name, qty: 1, price, unit: product.baseUnit }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart(prev => prev
      .map(c => c.productId === productId ? { ...c, qty: Math.max(0, c.qty + delta) } : c)
      .filter(c => c.qty > 0)
    );
  };

  const subtotal = cart.reduce((s, c) => s + c.qty * c.price, 0);
  const tva = Math.round(subtotal * 0.19);
  const total = subtotal + tva;
  const itemCount = cart.reduce((s, c) => s + c.qty, 0);

  const handleGpsCheckIn = () => {
    setGpsCheckedIn(true);
    toast({ title: t('mobile.sales.gpsCheckedIn'), description: '36.7538° N, 3.0588° E' });
  };

  const handleBarcodeScan = () => {
    // Mock: add random product
    if (products.length > 0) {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      addToCart(randomProduct);
      toast({ title: t('mobile.sales.barcodeScanned'), description: randomProduct.name });
    }
  };

  const handleSubmitOrder = () => {
    setOrderSubmitted(true);
    setTimeout(() => {
      setShowConfirm(false);
      toast({ title: t('mobile.sales.orderConfirmed') });
      if (!isOnline) {
        toast({ title: t('mobile.sales.savedOffline'), description: t('mobile.sales.syncWhenOnline') });
      }
      navigate('/m/sales');
    }, 1500);
  };

  // Step 1: Customer selection
  if (step === 'customer') {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-lg font-bold text-foreground">{t('mobile.sales.selectCustomer')}</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchCustomer}
            onChange={e => setSearchCustomer(e.target.value)}
            placeholder={t('mobile.sales.searchCustomer')}
            className="pl-9"
          />
        </div>
        <div className="space-y-2">
          {filteredCustomers.map(c => (
            <Card
              key={c.id}
              className="border-0 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => { setSelectedCustomer(c); setStep('products'); }}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.address}</p>
                </div>
                <Badge variant="secondary" className="text-[10px]">{c.segment}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Product selection
  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="p-4 border-b bg-card space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => setStep('customer')} className="text-xs text-primary mb-1">
              ← {t('mobile.sales.changeCustomer')}
            </button>
            <p className="text-sm font-semibold text-foreground">{selectedCustomer?.name}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOnline(!isOnline)}
            >
              {isOnline ? <Wifi className="h-4 w-4 text-primary" /> : <WifiOff className="h-4 w-4 text-destructive" />}
            </Button>
          </div>
        </div>
        {/* Action bar: GPS + Barcode */}
        <div className="flex gap-2">
          <Button
            variant={gpsCheckedIn ? 'default' : 'outline'}
            size="sm"
            className="flex-1 gap-1 text-xs h-8"
            onClick={handleGpsCheckIn}
            disabled={gpsCheckedIn}
          >
            <MapPin className="h-3 w-3" />
            {gpsCheckedIn ? t('mobile.sales.checkedIn') : t('mobile.sales.gpsCheckIn')}
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs h-8" onClick={handleBarcodeScan}>
            <ScanLine className="h-3 w-3" />
            {t('mobile.sales.scanBarcode')}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchProduct}
            onChange={e => setSearchProduct(e.target.value)}
            placeholder={t('mobile.sales.searchProduct')}
            className="pl-9"
          />
        </div>
      </div>

      {/* Segment pricing badge */}
      {selectedCustomer && (
        <div className="px-4">
          <Badge variant="secondary" className="text-[10px]">
            {t('mobile.sales.priceFor')} {selectedCustomer.segment}
          </Badge>
        </div>
      )}

      {/* Product grid */}
      <div className="flex-1 p-4 pt-2 grid grid-cols-2 gap-3 content-start overflow-y-auto">
        {filteredProducts.map(product => {
          const inCart = cart.find(c => c.productId === product.id);
          const price = getSegmentPrice(product);
          return (
            <Card key={product.id} className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-3 space-y-2">
                <p className="text-xs font-medium text-foreground leading-tight line-clamp-2">{product.name}</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-sm font-bold text-primary">{price.toLocaleString('fr-DZ')} DA</p>
                  <span className="text-[10px] text-muted-foreground">/{product.baseUnit}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {t('mobile.sales.stock')}: {product.stockBase}
                </p>
                {inCart ? (
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQty(product.id, -1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-bold text-foreground">{inCart.qty}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQty(product.id, 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1"
                    onClick={() => addToCart(product)}
                    disabled={product.stockBase <= 0}
                  >
                    <Plus className="h-3 w-3" />
                    {t('mobile.sales.add')}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sticky cart summary */}
      {cart.length > 0 && (
        <div className="sticky bottom-20 p-4 bg-card/95 backdrop-blur border-t">
          <Button size="lg" className="w-full h-12 rounded-xl gap-2" onClick={() => setShowConfirm(true)}>
            <ShoppingCart className="h-5 w-5" />
            {itemCount} {t('mobile.sales.items')} — {total.toLocaleString('fr-DZ')} DA
          </Button>
        </div>
      )}

      {/* Order Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>{t('mobile.sales.confirmOrder')}</DialogTitle>
          </DialogHeader>
          {orderSubmitted ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle className="h-16 w-16 mx-auto text-primary" />
              <p className="text-sm font-medium text-foreground">{t('mobile.sales.orderConfirmed')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{selectedCustomer?.name}</p>
                <p className="text-xs text-muted-foreground">{selectedCustomer?.address}</p>
              </div>
              <div className="border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.productId} className="flex justify-between text-xs">
                    <span className="text-foreground">{item.name} × {item.qty}</span>
                    <span className="font-medium text-foreground">{(item.qty * item.price).toLocaleString('fr-DZ')} DA</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('mobile.sales.subtotal')}</span>
                  <span>{subtotal.toLocaleString('fr-DZ')} DA</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('mobile.sales.tva')} (19%)</span>
                  <span>{tva.toLocaleString('fr-DZ')} DA</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-foreground pt-1 border-t">
                  <span>{t('mobile.sales.totalOrder')}</span>
                  <span>{total.toLocaleString('fr-DZ')} DA</span>
                </div>
              </div>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={t('mobile.sales.orderNotes')}
                className="text-sm"
                rows={2}
              />
              {!isOnline && (
                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 text-xs gap-1">
                  <WifiOff className="h-3 w-3" />
                  {t('mobile.sales.offlineMode')}
                </Badge>
              )}
            </div>
          )}
          {!orderSubmitted && (
            <DialogFooter className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>
                {t('common.cancel')}
              </Button>
              <Button className="flex-1" onClick={handleSubmitOrder}>
                {t('mobile.sales.confirmAndSend')}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
