import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCustomers, getProducts } from '@/lib/fake-api';
import type { Customer, Product } from '@/lib/fake-api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Minus, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CartItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
}

export default function SalesCreateOrderPage() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<'customer' | 'products'>('customer');

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

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.productId === product.id);
      if (existing) {
        return prev.map(c => c.productId === product.id ? { ...c, qty: c.qty + 1 } : c);
      }
      const price = product.pricingRules[0]?.price ?? 0;
      return [...prev, { productId: product.id, name: product.name, qty: 1, price }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart(prev => prev
      .map(c => c.productId === productId ? { ...c, qty: Math.max(0, c.qty + delta) } : c)
      .filter(c => c.qty > 0)
    );
  };

  const total = cart.reduce((s, c) => s + c.qty * c.price, 0);
  const itemCount = cart.reduce((s, c) => s + c.qty, 0);

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

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <button onClick={() => setStep('customer')} className="text-xs text-primary mb-1">
          ← {t('mobile.sales.changeCustomer')}
        </button>
        <p className="text-sm font-semibold text-foreground">{selectedCustomer?.name}</p>
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

      {/* Product grid */}
      <div className="flex-1 p-4 pt-2 grid grid-cols-2 gap-3 content-start overflow-y-auto">
        {filteredProducts.map(product => {
          const inCart = cart.find(c => c.productId === product.id);
          const price = product.pricingRules[0]?.price ?? 0;
          return (
            <Card key={product.id} className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-3 space-y-2">
                <p className="text-xs font-medium text-foreground leading-tight line-clamp-2">{product.name}</p>
                <p className="text-sm font-bold text-primary">{price.toLocaleString('fr-DZ')} DA</p>
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
          <Button size="lg" className="w-full h-12 rounded-xl gap-2">
            <ShoppingCart className="h-5 w-5" />
            {itemCount} {t('mobile.sales.items')} — {total.toLocaleString('fr-DZ')} DA
          </Button>
        </div>
      )}
    </div>
  );
}
