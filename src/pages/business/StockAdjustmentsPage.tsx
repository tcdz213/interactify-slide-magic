import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getStockAdjustments, createStockAdjustment, approveStockAdjustment, rejectStockAdjustment, getProducts, getWarehouses } from '@/lib/fake-api';
import type { StockAdjustment, AdjustmentReason, Product, Warehouse } from '@/lib/fake-api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ArrowUpDown, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const statusBadge = (status: string) => {
  const map: Record<string, { class: string; icon: typeof Clock }> = {
    pending: { class: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
    approved: { class: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
    rejected: { class: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
  };
  return map[status] || { class: '', icon: Clock };
};

const reasonLabels: Record<string, string> = {
  damage: '🔨 Damage', expiry: '📅 Expiry', count_correction: '📋 Count Correction',
  return: '↩️ Return', transfer: '🔄 Transfer', other: '📝 Other',
};

const emptyForm = { productId: '', productName: '', warehouseId: '', warehouseName: '', quantityChange: 0, reason: 'damage' as AdjustmentReason, notes: '', createdBy: 'Current User' };

export default function StockAdjustmentsPage() {
  const { t } = useTranslation();
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [adj, prods, whs] = await Promise.all([getStockAdjustments(), getProducts(), getWarehouses()]);
    setAdjustments(adj); setProducts(prods); setWarehouses(whs); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const pending = adjustments.filter(a => a.status === 'pending');
  const history = adjustments.filter(a => a.status !== 'pending');

  const handleCreate = async () => {
    if (!form.productId || !form.warehouseId || form.quantityChange === 0) { toast.error(t('common.error')); return; }
    setSaving(true);
    try {
      await createStockAdjustment(form);
      toast.success(t('common.success'));
      await load();
      setDialogOpen(false);
      setForm(emptyForm);
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleApprove = async (id: string) => {
    await approveStockAdjustment(id, 'Manager');
    toast.success(t('adjustments.approved'));
    await load();
  };

  const handleReject = async (id: string) => {
    await rejectStockAdjustment(id, 'Manager');
    toast.success(t('adjustments.rejected'));
    await load();
  };

  const handleApproveAll = async () => {
    for (const a of pending) await approveStockAdjustment(a.id, 'Manager');
    toast.success(t('adjustments.approveAll'));
    await load();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">{t('common.loading')}</div></div>;

  const AdjustmentTable = ({ data, showActions = false }: { data: StockAdjustment[]; showActions?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('common.date')}</TableHead>
          <TableHead>{t('products.productName')}</TableHead>
          <TableHead>{t('nav.warehouses')}</TableHead>
          <TableHead>{t('adjustments.qtyChange')}</TableHead>
          <TableHead>{t('adjustments.reason')}</TableHead>
          <TableHead>{t('adjustments.createdBy')}</TableHead>
          <TableHead>{t('common.status')}</TableHead>
          {showActions && <TableHead>{t('common.actions')}</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(adj => {
          const badge = statusBadge(adj.status);
          return (
            <TableRow key={adj.id}>
              <TableCell className="text-muted-foreground text-sm">{new Date(adj.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="font-medium">{adj.productName}</TableCell>
              <TableCell className="text-sm">{adj.warehouseName}</TableCell>
              <TableCell>
                <span className={`font-bold ${adj.quantityChange > 0 ? 'text-success' : 'text-destructive'}`}>
                  {adj.quantityChange > 0 ? '+' : ''}{adj.quantityChange}
                </span>
              </TableCell>
              <TableCell><Badge variant="outline">{reasonLabels[adj.reason] || adj.reason}</Badge></TableCell>
              <TableCell className="text-sm">{adj.createdBy}</TableCell>
              <TableCell>
                <Badge variant="outline" className={badge.class}>{t(`adjustments.${adj.status}`)}</Badge>
              </TableCell>
              {showActions && (
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="text-success gap-1" onClick={() => handleApprove(adj.id)}>
                      <CheckCircle className="h-3.5 w-3.5" />{t('common.confirm')}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive gap-1" onClick={() => handleReject(adj.id)}>
                      <XCircle className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          );
        })}
        {data.length === 0 && (
          <TableRow><TableCell colSpan={showActions ? 8 : 7} className="text-center text-muted-foreground py-8">{t('common.noData')}</TableCell></TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('adjustments.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('adjustments.description')}</p>
        </div>
        <Button className="gap-2" onClick={() => { setForm(emptyForm); setDialogOpen(true); }}>
          <Plus className="h-4 w-4" />{t('adjustments.createAdjustment')}
        </Button>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-3.5 w-3.5" />{t('adjustments.pendingApprovals')} ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <ArrowUpDown className="h-3.5 w-3.5" />{t('adjustments.history')} ({history.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <Card>
            <CardContent className="pt-6">
              <AdjustmentTable data={pending} showActions />
              {pending.length > 0 && (
                <div className="flex justify-end gap-2 mt-4">
                  <Button size="sm" className="gap-1" onClick={handleApproveAll}>
                    <CheckCircle className="h-3.5 w-3.5" />{t('adjustments.approveAll')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card><CardContent className="pt-6"><AdjustmentTable data={history} /></CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('adjustments.createAdjustment')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>{t('nav.products')}</Label>
              <Select value={form.productId} onValueChange={v => {
                const p = products.find(x => x.id === v);
                setForm(f => ({ ...f, productId: v, productName: p?.name || '' }));
              }}>
                <SelectTrigger><SelectValue placeholder={t('adjustments.selectProduct')} /></SelectTrigger>
                <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('nav.warehouses')}</Label>
              <Select value={form.warehouseId} onValueChange={v => {
                const w = warehouses.find(x => x.id === v);
                setForm(f => ({ ...f, warehouseId: v, warehouseName: w?.name || '' }));
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('adjustments.qtyChange')}</Label>
              <Input type="number" value={form.quantityChange} onChange={e => setForm(f => ({ ...f, quantityChange: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>{t('adjustments.reason')}</Label>
              <Select value={form.reason} onValueChange={(v: AdjustmentReason) => setForm(f => ({ ...f, reason: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="damage">Damage</SelectItem>
                  <SelectItem value="expiry">Expiry</SelectItem>
                  <SelectItem value="count_correction">Count Correction</SelectItem>
                  <SelectItem value="return">Return</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('adjustments.notes')}</Label>
              <Textarea placeholder={t('adjustments.notesPlaceholder')} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <Button className="w-full" onClick={handleCreate} disabled={saving}>
              {saving ? t('common.loading') : t('adjustments.submit')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
