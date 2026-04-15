import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCustomers, getOrders, createCustomer } from '@/lib/fake-api';
import type { Customer, Order } from '@/lib/fake-api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, Phone, Plus, MapPin, ChevronRight, ShoppingCart, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function SalesCustomersPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // New customer form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSegment, setNewSegment] = useState<'superette' | 'wholesale' | 'shadow'>('superette');

  useEffect(() => {
    getCustomers().then(setCustomers);
    getOrders().then(setOrders);
  }, []);

  const filtered = customers
    .filter(c => segment === 'all' || c.segment === segment)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const customerOrders = (customerId: string) =>
    orders.filter(o => o.customerId === customerId).slice(0, 5);

  const handleAddCustomer = async () => {
    if (!newName || !newPhone) return;
    try {
      const c = await createCustomer({
        name: newName,
        phone: newPhone,
        address: newAddress,
        email: newEmail,
        segment: newSegment,
        isShadow: newSegment === 'shadow',
      });
      setCustomers(prev => [...prev, c]);
      setShowAdd(false);
      setNewName(''); setNewPhone(''); setNewAddress(''); setNewEmail('');
      toast({ title: t('mobile.sales.customerAdded') });
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
  };

  const handleCheckIn = (customer: Customer) => {
    toast({ title: t('mobile.sales.checkedInAt', { name: customer.name }), description: '36.7538° N, 3.0588° E' });
  };

  const openDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetail(true);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">{t('mobile.sales.customerList')}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setShowMap(true)}>
            <MapPin className="h-4 w-4" />
          </Button>
          <Button size="sm" className="gap-1 h-8" onClick={() => setShowAdd(true)}>
            <Plus className="h-3 w-3" />
            {t('common.add')}
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('mobile.sales.searchCustomer')}
          className="pl-9"
        />
      </div>

      <Tabs value={segment} onValueChange={setSegment}>
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1 text-xs">{t('common.all')}</TabsTrigger>
          <TabsTrigger value="superette" className="flex-1 text-xs">{t('customers.superette')}</TabsTrigger>
          <TabsTrigger value="wholesale" className="flex-1 text-xs">{t('customers.wholesale')}</TabsTrigger>
          <TabsTrigger value="shadow" className="flex-1 text-xs">{t('customers.shadow')}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        {filtered.map(customer => (
          <Card key={customer.id} className="border-0 shadow-sm cursor-pointer" onClick={() => openDetail(customer)}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{customer.name}</p>
                <p className="text-xs text-muted-foreground truncate">{customer.address}</p>
                <p className="text-xs text-muted-foreground">
                  {customer.totalOrders} {t('mobile.sales.orders')} — {customer.totalSpent.toLocaleString('fr-DZ')} DA
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={`tel:${customer.phone}`} className="p-2 rounded-full bg-primary/10" onClick={e => e.stopPropagation()}>
                  <Phone className="h-4 w-4 text-primary" />
                </a>
                <Badge variant="secondary" className="text-[10px]">{customer.segment}</Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-center py-8 text-sm text-muted-foreground">{t('common.noResults')}</p>
        )}
      </div>

      {/* Customer Detail Sheet */}
      <Sheet open={showDetail} onOpenChange={setShowDetail}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          {selectedCustomer && (
            <div className="space-y-4">
              <SheetHeader>
                <SheetTitle>{selectedCustomer.name}</SheetTitle>
              </SheetHeader>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedCustomer.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{selectedCustomer.phone}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-3 text-center">
                      <ShoppingCart className="h-4 w-4 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-bold text-foreground">{selectedCustomer.totalOrders}</p>
                      <p className="text-[10px] text-muted-foreground">{t('mobile.sales.orders')}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-3 text-center">
                      <p className="text-lg font-bold text-foreground">{selectedCustomer.totalSpent.toLocaleString('fr-DZ')}</p>
                      <p className="text-[10px] text-muted-foreground">DA {t('mobile.sales.totalSpent')}</p>
                    </CardContent>
                  </Card>
                </div>
                <Button variant="outline" className="w-full gap-2" onClick={() => handleCheckIn(selectedCustomer)}>
                  <CheckCircle className="h-4 w-4" />
                  {t('mobile.sales.checkInHere')}
                </Button>
                {/* Order History */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{t('mobile.sales.orderHistory')}</h3>
                  {customerOrders(selectedCustomer.id).length === 0 ? (
                    <p className="text-xs text-muted-foreground">{t('common.noData')}</p>
                  ) : (
                    <div className="space-y-2">
                      {customerOrders(selectedCustomer.id).map(order => (
                        <div key={order.id} className="flex justify-between items-center text-xs border-b pb-2">
                          <div>
                            <p className="text-foreground font-medium">{order.itemsCount} {t('mobile.sales.items')}</p>
                            <p className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('fr-DZ')}</p>
                          </div>
                          <div className="text-end">
                            <p className="font-medium text-foreground">{order.totalAmount.toLocaleString('fr-DZ')} DA</p>
                            <Badge variant="secondary" className="text-[10px]">{order.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Customer Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('mobile.sales.addCustomer')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">{t('common.name')}</Label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t('common.phone')}</Label>
              <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t('common.address')}</Label>
              <Input value={newAddress} onChange={e => setNewAddress(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t('common.email')}</Label>
              <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t('mobile.sales.segment')}</Label>
              <Select value={newSegment} onValueChange={(v: 'superette' | 'wholesale' | 'shadow') => setNewSegment(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="superette">{t('customers.superette')}</SelectItem>
                  <SelectItem value="wholesale">{t('customers.wholesale')}</SelectItem>
                  <SelectItem value="shadow">{t('customers.shadow')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleAddCustomer} disabled={!newName || !newPhone}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Map Mock Dialog */}
      <Dialog open={showMap} onOpenChange={setShowMap}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('mobile.sales.customerMap')}</DialogTitle>
          </DialogHeader>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center space-y-2">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">{t('mobile.sales.mapPlaceholder')}</p>
              <p className="text-xs text-muted-foreground">{filtered.length} {t('mobile.sales.customersOnMap')}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
