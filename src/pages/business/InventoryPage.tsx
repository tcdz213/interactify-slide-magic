import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getInventoryItems, updateInventoryItem } from '@/lib/fake-api';
import type { InventoryItem } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { KPIWidget } from '@/components/KPIWidget';
import { Package, AlertTriangle, DollarSign, RotateCcw, Search, Warehouse, Pencil, Download, History, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { toast } from 'sonner';

const stockBadge = (status: string) => {
  const map: Record<string, string> = {
    normal: 'bg-success/10 text-success border-success/20',
    low: 'bg-warning/10 text-warning border-warning/20',
    out: 'bg-destructive/10 text-destructive border-destructive/20',
  };
  return map[status] || '';
};

interface StockMovement {
  id: string;
  date: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reference: string;
  note: string;
}

const mockMovements = (productName: string): StockMovement[] => [
  { id: 'm1', date: '2024-12-15', type: 'in', quantity: 200, reference: 'PO-1045', note: 'Purchase order received' },
  { id: 'm2', date: '2024-12-14', type: 'out', quantity: -45, reference: 'ORD-2089', note: `Sale to client` },
  { id: 'm3', date: '2024-12-13', type: 'out', quantity: -30, reference: 'ORD-2085', note: `Delivery` },
  { id: 'm4', date: '2024-12-12', type: 'adjustment', quantity: -5, reference: 'ADJ-012', note: 'Damage write-off' },
  { id: 'm5', date: '2024-12-10', type: 'in', quantity: 500, reference: 'PO-1040', note: 'Restock' },
];

export default function InventoryPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editReorder, setEditReorder] = useState(0);
  const [editMinMax, setEditMinMax] = useState({ min: 0, max: 0 });
  const [saving, setSaving] = useState(false);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);

  const load = () => getInventoryItems().then(data => { setItems(data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i => {
    const matchSearch = i.productName.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase());
    const matchWarehouse = warehouseFilter === 'all' || i.warehouseId === warehouseFilter;
    const matchStatus = statusFilter === 'all' || i.stockStatus === statusFilter;
    return matchSearch && matchWarehouse && matchStatus;
  });

  const totalSKUs = new Set(items.map(i => i.productId)).size;
  const lowStockCount = items.filter(i => i.stockStatus === 'low' || i.stockStatus === 'out').length;
  const totalValue = items.reduce((sum, i) => sum + i.inventoryValue, 0);
  const warehouses = [...new Map(items.map(i => [i.warehouseId, i.warehouseName])).entries()];

  const openEdit = (item: InventoryItem) => {
    setEditItem(item);
    setEditReorder(item.reorderPoint);
    setEditMinMax({ min: item.reorderPoint, max: item.reorderPoint * 5 });
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

  const handleExport = () => {
    const csv = ['Product,SKU,Warehouse,Qty,Reorder,Status,Value'];
    filtered.forEach(i => csv.push(`${i.productName},${i.sku},${i.warehouseName},${i.quantity},${i.reorderPoint},${i.stockStatus},${i.inventoryValue}`));
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'inventory.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('common.export'));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">{t('common.loading')}</div></div>;

  const movements = historyItem ? mockMovements(historyItem.productName) : [];

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
        <KPIWidget title={t('inventory.inventoryValue')} value={`${(totalValue / 100).toLocaleString()} DZD`} icon={<DollarSign className="h-5 w-5" />} />
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
              <Input className="ps-9" placeholder={t('inventory.searchStock')} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder={t('inventory.allWarehouses')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('inventory.allWarehouses')}</SelectItem>
                {warehouses.map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
              {filtered.map(item => (
                <TableRow key={item.id} className={item.stockStatus !== 'normal' ? 'bg-warning/5' : ''}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.sku}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Warehouse className="h-3.5 w-3.5 text-muted-foreground" />
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
                  <TableCell className="font-medium">{(item.inventoryValue / 100).toLocaleString()} DZD</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)} title={t('common.edit')}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setHistoryItem(item)} title={t('inventory.movementHistory')}>
                        <History className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Reorder Point Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('inventory.reorderPoint')} — {editItem?.productName}</DialogTitle></DialogHeader>
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
                <Input type="number" value={editMinMax.min} onChange={e => setEditMinMax(p => ({ ...p, min: Number(e.target.value) }))} min={0} />
              </div>
              <div className="space-y-2">
                <Label>{t('inventory.maxStock')}</Label>
                <Input type="number" value={editMinMax.max} onChange={e => setEditMinMax(p => ({ ...p, max: Number(e.target.value) }))} min={0} />
              </div>
            </div>
            <Button className="w-full" onClick={handleSaveReorder} disabled={saving}>
              {saving ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Movement History Dialog */}
      <Dialog open={!!historyItem} onOpenChange={() => setHistoryItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('inventory.movementHistory')} — {historyItem?.productName}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            {movements.map(m => (
              <div key={m.id} className="flex items-start gap-3 rounded-lg border p-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                  m.type === 'in' ? 'bg-success/10' : m.type === 'out' ? 'bg-destructive/10' : 'bg-warning/10'
                }`}>
                  {m.type === 'in' ? <ArrowDownRight className="h-4 w-4 text-success" /> :
                   m.type === 'out' ? <ArrowUpRight className="h-4 w-4 text-destructive" /> :
                   <RotateCcw className="h-3.5 w-3.5 text-warning" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${m.quantity > 0 ? 'text-success' : 'text-destructive'}`}>
                      {m.quantity > 0 ? '+' : ''}{m.quantity}
                    </span>
                    <span className="text-xs text-muted-foreground">{m.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{m.note}</p>
                  <Badge variant="outline" className="mt-1 text-[10px]">{m.reference}</Badge>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
