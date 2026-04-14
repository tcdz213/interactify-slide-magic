import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getInventoryItems, updateInventoryItem, getWarehouses } from '@/lib/fake-api';
import type { InventoryItem, Warehouse } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KPIWidget } from '@/components/KPIWidget';
import { Package, AlertTriangle, DollarSign, RotateCcw, Search, Warehouse as WarehouseIcon, Pencil, Download, History, ArrowRightLeft, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { toast } from 'sonner';

const PAGE_SIZE = 12;

const stockBadge = (status: string) => {
  const map: Record<string, string> = {
    normal: 'bg-success/10 text-success border-success/20',
    low: 'bg-warning/10 text-warning border-warning/20',
    out: 'bg-destructive/10 text-destructive border-destructive/20',
  };
  return map[status] || '';
};

const mockMovements = (productName: string) => [
  { id: 'm1', date: '2024-12-05', type: 'in', qty: 600, ref: 'GRN-1024', note: 'Réception fournisseur', batch: 'LOT-2024-A1' },
  { id: 'm2', date: '2024-12-04', type: 'out', qty: -120, ref: 'ORD-2045', note: 'Commande Superette El Baraka', batch: 'LOT-2024-A1' },
  { id: 'm3', date: '2024-12-03', type: 'out', qty: -48, ref: 'ADJ-001', note: 'Ajustement — dommage transport', batch: 'LOT-2024-A1' },
  { id: 'm4', date: '2024-12-02', type: 'in', qty: 1200, ref: 'GRN-1020', note: 'Réception fournisseur', batch: 'LOT-2024-B3' },
  { id: 'm5', date: '2024-12-01', type: 'out', qty: -240, ref: 'ORD-2040', note: 'Commande Gros Bazar Oran', batch: 'LOT-2024-B3' },
  { id: 'm6', date: '2024-11-28', type: 'transfer', qty: -100, ref: 'TRF-003', note: 'Transfert → Entrepôt Oran', batch: 'LOT-2024-B3' },
];

const mockBatches = (item: InventoryItem) => [
  { lot: 'LOT-2024-A1', qty: Math.round(item.quantity * 0.6), expiry: '2025-06-15', received: '2024-12-05' },
  { lot: 'LOT-2024-B3', qty: Math.round(item.quantity * 0.3), expiry: '2025-09-20', received: '2024-12-02' },
  { lot: 'LOT-2024-C2', qty: Math.round(item.quantity * 0.1), expiry: '2025-03-10', received: '2024-11-20' },
];

export default function InventoryPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [allWarehouses, setAllWarehouses] = useState<Warehouse[]>([]);
  const [search, setSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editReorder, setEditReorder] = useState(0);
  const [editMinStock, setEditMinStock] = useState(0);
  const [editMaxStock, setEditMaxStock] = useState(0);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
  const [transferItem, setTransferItem] = useState<InventoryItem | null>(null);
  const [transferQty, setTransferQty] = useState(0);
  const [transferTo, setTransferTo] = useState('');
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);

  const load = async () => {
    const [data, whs] = await Promise.all([getInventoryItems(), getWarehouses()]);
    setItems(data); setAllWarehouses(whs); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i => {
    const matchSearch = i.productName.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase());
    const matchWarehouse = warehouseFilter === 'all' || i.warehouseId === warehouseFilter;
    const matchStatus = statusFilter === 'all' || i.stockStatus === statusFilter;
    return matchSearch && matchWarehouse && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalSKUs = new Set(items.map(i => i.productId)).size;
  const lowStockCount = items.filter(i => i.stockStatus === 'low' || i.stockStatus === 'out').length;
  const totalValue = items.reduce((sum, i) => sum + i.inventoryValue, 0);
  const warehouses = [...new Map(items.map(i => [i.warehouseId, i.warehouseName])).entries()];

  const fmt = (n: number) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(n);

  const openEdit = (item: InventoryItem) => {
    setEditItem(item);
    setEditReorder(item.reorderPoint);
    setEditMinStock(Math.round(item.reorderPoint * 0.5));
    setEditMaxStock(Math.round(item.reorderPoint * 5));
  };

  const handleSaveReorder = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      const newStatus = editItem.quantity === 0 ? 'out' : editItem.quantity <= editReorder ? 'low' : 'normal';
      await updateInventoryItem(editItem.id, { reorderPoint: editReorder, stockStatus: newStatus as any });
      toast.success(t('common.success'));
      await load();
      setEditItem(null);
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleTransfer = async () => {
    if (!transferItem || !transferTo || transferQty <= 0) { toast.error(t('common.error')); return; }
    if (transferQty > transferItem.quantity) { toast.error(t('inventory.transferExceeds')); return; }
    setSaving(true);
    try {
      await updateInventoryItem(transferItem.id, { quantity: transferItem.quantity - transferQty } as any);
      toast.success(t('inventory.transferSuccess', { qty: transferQty, warehouse: allWarehouses.find(w => w.id === transferTo)?.name }));
      await load();
      setTransferItem(null);
      setTransferQty(0);
      setTransferTo('');
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleExport = () => {
    const csv = ['Product,SKU,Warehouse,Qty,Reorder,Min,Max,Status,Value,Batches'];
    filtered.forEach(i => csv.push(`"${i.productName}",${i.sku},${i.warehouseName},${i.quantity},${i.reorderPoint},${Math.round(i.reorderPoint * 0.5)},${Math.round(i.reorderPoint * 5)},${i.stockStatus},${i.inventoryValue},${mockBatches(i).length}`));
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'inventory.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('common.export'));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">{t('common.loading')}</div></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('inventory.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('inventory.description')}</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" />{t('common.export')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPIWidget title={t('inventory.totalSKUs')} value={totalSKUs} icon={<Package className="h-5 w-5" />} />
        <KPIWidget title={t('inventory.lowStockItems')} value={lowStockCount} icon={<AlertTriangle className="h-5 w-5" />} />
        <KPIWidget title={t('inventory.inventoryValue')} value={fmt(totalValue)} icon={<DollarSign className="h-5 w-5" />} />
        <KPIWidget title={t('inventory.turnoverRate')} value="4.2x" icon={<RotateCcw className="h-5 w-5" />} />
      </div>

      {lowStockCount > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <p className="text-sm font-medium">{t('inventory.lowStockAlert', { count: lowStockCount })}</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="ps-9" placeholder={t('inventory.searchStock')} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <Select value={warehouseFilter} onValueChange={v => { setWarehouseFilter(v); setPage(1); }}>
              <SelectTrigger className="w-48"><SelectValue placeholder={t('inventory.allWarehouses')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('inventory.allWarehouses')}</SelectItem>
                {warehouses.map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="normal">{t('inventory.normal')}</SelectItem>
                <SelectItem value="low">{t('inventory.low')}</SelectItem>
                <SelectItem value="out">{t('inventory.outOfStock')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('products.productName')}</TableHead>
                <TableHead>{t('products.sku')}</TableHead>
                <TableHead>{t('nav.warehouses')}</TableHead>
                <TableHead>{t('inventory.qty')}</TableHead>
                <TableHead>{t('inventory.reorderPoint')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('inventory.value')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(item => (
                <TableRow key={item.id} className={item.stockStatus !== 'normal' ? 'bg-warning/5' : ''}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.sku}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <WarehouseIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{item.warehouseName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{item.quantity.toLocaleString()} {item.baseUnit}s</TableCell>
                  <TableCell className="text-muted-foreground">{item.reorderPoint.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={stockBadge(item.stockStatus)}>
                      {t(`inventory.${item.stockStatus === 'out' ? 'outOfStock' : item.stockStatus}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{fmt(item.inventoryValue)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setHistoryItem(item)} title={t('inventory.movementHistory')}>
                        <History className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setTransferItem(item); setTransferQty(0); setTransferTo(''); }} title={t('inventory.transfer')}>
                        <ArrowRightLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)} title={t('inventory.reorderPoint')}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-muted-foreground">{t('common.showing')} {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                  <Button key={i} variant={page === i + 1 ? 'default' : 'outline'} size="sm" onClick={() => setPage(i + 1)}>{i + 1}</Button>
                ))}
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Reorder / Min-Max Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('inventory.stockConfig')} — {editItem?.productName}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">{t('nav.warehouses')}:</span> {editItem?.warehouseName}</div>
              <div><span className="text-muted-foreground">{t('inventory.qty')}:</span> {editItem?.quantity.toLocaleString()}</div>
            </div>
            <div className="space-y-2">
              <Label>{t('inventory.reorderPoint')}</Label>
              <Input type="number" value={editReorder} onChange={e => setEditReorder(Number(e.target.value))} min={0} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('inventory.minStock')}</Label>
                <Input type="number" value={editMinStock} onChange={e => setEditMinStock(Number(e.target.value))} min={0} />
              </div>
              <div className="space-y-2">
                <Label>{t('inventory.maxStock')}</Label>
                <Input type="number" value={editMaxStock} onChange={e => setEditMaxStock(Number(e.target.value))} min={0} />
              </div>
            </div>
            <Button className="w-full" onClick={handleSaveReorder} disabled={saving}>
              {saving ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Movement History + Batch Tracking Dialog */}
      <Dialog open={!!historyItem} onOpenChange={() => setHistoryItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{t('inventory.movementHistory')} — {historyItem?.productName}</DialogTitle></DialogHeader>
          {historyItem && (
            <Tabs defaultValue="movements">
              <TabsList>
                <TabsTrigger value="movements">{t('inventory.movements')}</TabsTrigger>
                <TabsTrigger value="batches" className="gap-1"><Tag className="h-3.5 w-3.5" />{t('inventory.batches')}</TabsTrigger>
              </TabsList>
              <TabsContent value="movements" className="mt-3">
                <div className="text-sm text-muted-foreground mb-3">{historyItem.warehouseName} · {t('inventory.qty')}: {historyItem.quantity.toLocaleString()}</div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('common.date')}</TableHead>
                      <TableHead>{t('common.type')}</TableHead>
                      <TableHead>{t('inventory.qty')}</TableHead>
                      <TableHead>{t('inventory.batch')}</TableHead>
                      <TableHead>{t('inventory.reference')}</TableHead>
                      <TableHead>{t('inventory.note')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockMovements(historyItem.productName).map(m => (
                      <TableRow key={m.id}>
                        <TableCell className="text-sm">{m.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            m.type === 'in' ? 'bg-success/10 text-success border-success/20' :
                            m.type === 'transfer' ? 'bg-primary/10 text-primary border-primary/20' :
                            'bg-destructive/10 text-destructive border-destructive/20'
                          }>
                            {m.type === 'in' ? t('inventory.stockIn') : m.type === 'transfer' ? t('inventory.transfer') : t('inventory.stockOut')}
                          </Badge>
                        </TableCell>
                        <TableCell className={`font-bold ${m.qty > 0 ? 'text-success' : 'text-destructive'}`}>
                          {m.qty > 0 ? '+' : ''}{m.qty}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{m.batch}</TableCell>
                        <TableCell className="font-mono text-xs">{m.ref}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{m.note}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="batches" className="mt-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('inventory.batch')}</TableHead>
                      <TableHead>{t('inventory.qty')}</TableHead>
                      <TableHead>{t('inventory.expiryDate')}</TableHead>
                      <TableHead>{t('inventory.receivedDate')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockBatches(historyItem).map(b => {
                      const isExpiring = new Date(b.expiry) < new Date(Date.now() + 90 * 86400000);
                      return (
                        <TableRow key={b.lot}>
                          <TableCell className="font-mono text-sm font-medium">{b.lot}</TableCell>
                          <TableCell className="font-medium">{b.qty.toLocaleString()}</TableCell>
                          <TableCell className={isExpiring ? 'text-warning font-medium' : ''}>{b.expiry}</TableCell>
                          <TableCell className="text-muted-foreground">{b.received}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={isExpiring ? 'bg-warning/10 text-warning border-warning/20' : 'bg-success/10 text-success border-success/20'}>
                              {isExpiring ? t('inventory.expiringSoon') : t('inventory.normal')}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={!!transferItem} onOpenChange={() => setTransferItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('inventory.transfer')} — {transferItem?.productName}</DialogTitle></DialogHeader>
          {transferItem && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">{t('inventory.from')}:</span> <span className="font-medium">{transferItem.warehouseName}</span></div>
                <div><span className="text-muted-foreground">{t('inventory.available')}:</span> <span className="font-medium">{transferItem.quantity.toLocaleString()}</span></div>
              </div>
              <div className="space-y-2">
                <Label>{t('inventory.transferTo')}</Label>
                <Select value={transferTo} onValueChange={setTransferTo}>
                  <SelectTrigger><SelectValue placeholder={t('inventory.selectWarehouse')} /></SelectTrigger>
                  <SelectContent>
                    {allWarehouses.filter(w => w.id !== transferItem.warehouseId).map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('inventory.transferQty')}</Label>
                <Input type="number" value={transferQty} onChange={e => setTransferQty(Number(e.target.value))} min={1} max={transferItem.quantity} />
                {transferQty > transferItem.quantity && <p className="text-xs text-destructive">{t('inventory.transferExceeds')}</p>}
              </div>
              <Button className="w-full" onClick={handleTransfer} disabled={saving || !transferTo || transferQty <= 0}>
                {saving ? t('common.loading') : t('inventory.confirmTransfer')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
