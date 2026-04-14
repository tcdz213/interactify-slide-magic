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
import { KPIWidget } from '@/components/KPIWidget';
import { Plus, ArrowUpDown, CheckCircle, XCircle, Clock, Search, Download, Eye, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

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
  const [search, setSearch] = useState('');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [detailAdj, setDetailAdj] = useState<(StockAdjustment & { comments?: { user: string; text: string; date: string }[] }) | null>(null);
  const [commentText, setCommentText] = useState('');
  const [page, setPage] = useState(1);

  const load = async () => {
    const [adj, prods, whs] = await Promise.all([getStockAdjustments(), getProducts(), getWarehouses()]);
    setAdjustments(adj); setProducts(prods); setWarehouses(whs); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filterAdj = (list: StockAdjustment[]) => list.filter(a => {
    const matchSearch = a.productName.toLowerCase().includes(search.toLowerCase()) || a.warehouseName.toLowerCase().includes(search.toLowerCase());
    const matchReason = reasonFilter === 'all' || a.reason === reasonFilter;
    return matchSearch && matchReason;
  });

  const pending = filterAdj(adjustments.filter(a => a.status === 'pending'));
  const history = filterAdj(adjustments.filter(a => a.status !== 'pending'));

  const totalPending = adjustments.filter(a => a.status === 'pending').length;
  const totalApproved = adjustments.filter(a => a.status === 'approved').length;
  const totalRejected = adjustments.filter(a => a.status === 'rejected').length;
  const netChange = adjustments.filter(a => a.status === 'approved').reduce((s, a) => s + a.quantityChange, 0);

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

  const handleApprove = async (id: string, comment?: string) => {
    await approveStockAdjustment(id, 'Manager');
    if (comment) toast.success(t('adjustments.approvedWithComment'));
    else toast.success(t('adjustments.approved'));
    await load();
  };

  const handleReject = async (id: string, comment?: string) => {
    await rejectStockAdjustment(id, 'Manager');
    toast.success(t('adjustments.rejected'));
    await load();
  };

  const handleApproveAll = async () => {
    for (const a of pending) await approveStockAdjustment(a.id, 'Manager');
    toast.success(t('adjustments.approveAll'));
    await load();
  };

  const handleExport = () => {
    const csv = ['Date,Product,Warehouse,QtyChange,Reason,Status,CreatedBy,Notes'];
    adjustments.forEach(a => csv.push(`${new Date(a.createdAt).toLocaleDateString()},"${a.productName}","${a.warehouseName}",${a.quantityChange},${a.reason},${a.status},"${a.createdBy}","${a.notes || ''}"`));
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'stock-adjustments.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('common.export'));
  };

  const openDetail = (adj: StockAdjustment) => {
    setDetailAdj({
      ...adj,
      comments: [
        { user: adj.createdBy, text: adj.notes || t('adjustments.noComment'), date: new Date(adj.createdAt).toLocaleDateString() },
        ...(adj.status !== 'pending' ? [{ user: adj.approvedBy || 'Manager', text: `${adj.status === 'approved' ? t('adjustments.approved') : t('adjustments.rejected')}`, date: new Date(adj.createdAt).toLocaleDateString() }] : []),
      ]
    });
    setCommentText('');
  };

  const addComment = () => {
    if (!commentText.trim() || !detailAdj) return;
    setDetailAdj({
      ...detailAdj,
      comments: [...(detailAdj.comments || []), { user: 'Current User', text: commentText, date: new Date().toLocaleDateString() }]
    });
    setCommentText('');
    toast.success(t('adjustments.commentAdded'));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">{t('common.loading')}</div></div>;

  const AdjustmentTable = ({ data, showActions = false }: { data: StockAdjustment[]; showActions?: boolean }) => {
    const tablePages = Math.ceil(data.length / PAGE_SIZE);
    const pageData = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    return (
      <>
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
              <TableHead>{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map(adj => {
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
                  <TableCell><Badge variant="outline" className={badge.class}>{t(`adjustments.${adj.status}`)}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openDetail(adj)}><Eye className="h-4 w-4" /></Button>
                      {showActions && (
                        <>
                          <Button variant="ghost" size="icon" className="text-success" onClick={() => handleApprove(adj.id)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleReject(adj.id)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {pageData.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">{t('common.noData')}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        {tablePages > 1 && (
          <div className="flex items-center justify-end mt-3 gap-1">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm text-muted-foreground px-2">{page}/{tablePages}</span>
            <Button variant="outline" size="sm" disabled={page === tablePages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('adjustments.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('adjustments.description')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport}><Download className="h-4 w-4" />{t('common.export')}</Button>
          <Button className="gap-2" onClick={() => { setForm(emptyForm); setDialogOpen(true); }}>
            <Plus className="h-4 w-4" />{t('adjustments.createAdjustment')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIWidget title={t('adjustments.pendingApprovals')} value={totalPending} icon={<Clock className="h-5 w-5" />} />
        <KPIWidget title={t('adjustments.approved')} value={totalApproved} icon={<CheckCircle className="h-5 w-5" />} />
        <KPIWidget title={t('adjustments.rejected')} value={totalRejected} icon={<XCircle className="h-5 w-5" />} />
        <KPIWidget title={t('adjustments.netChange')} value={netChange > 0 ? `+${netChange}` : String(netChange)} icon={<ArrowUpDown className="h-5 w-5" />} />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="ps-9" placeholder={t('adjustments.searchAdjustments')} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={reasonFilter} onValueChange={v => { setReasonFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="damage">🔨 Damage</SelectItem>
            <SelectItem value="expiry">📅 Expiry</SelectItem>
            <SelectItem value="count_correction">📋 Count Correction</SelectItem>
            <SelectItem value="return">↩️ Return</SelectItem>
            <SelectItem value="transfer">🔄 Transfer</SelectItem>
            <SelectItem value="other">📝 Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="pending" onValueChange={() => setPage(1)}>
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
              {pending.length > 1 && (
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

      {/* Detail + Comments Dialog */}
      <Dialog open={!!detailAdj} onOpenChange={() => setDetailAdj(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('adjustments.detail')}</DialogTitle></DialogHeader>
          {detailAdj && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">{t('products.productName')}:</span> <span className="font-medium">{detailAdj.productName}</span></div>
                <div><span className="text-muted-foreground">{t('nav.warehouses')}:</span> {detailAdj.warehouseName}</div>
                <div><span className="text-muted-foreground">{t('adjustments.qtyChange')}:</span> <span className={`font-bold ${detailAdj.quantityChange > 0 ? 'text-success' : 'text-destructive'}`}>{detailAdj.quantityChange > 0 ? '+' : ''}{detailAdj.quantityChange}</span></div>
                <div><span className="text-muted-foreground">{t('adjustments.reason')}:</span> {reasonLabels[detailAdj.reason]}</div>
                <div><span className="text-muted-foreground">{t('common.status')}:</span> <Badge variant="outline" className={statusBadge(detailAdj.status).class}>{t(`adjustments.${detailAdj.status}`)}</Badge></div>
                <div><span className="text-muted-foreground">{t('adjustments.createdBy')}:</span> {detailAdj.createdBy}</div>
              </div>

              <div className="border-t pt-3">
                <p className="text-sm font-medium flex items-center gap-1 mb-2"><MessageSquare className="h-4 w-4" /> {t('adjustments.comments')}</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {detailAdj.comments?.map((c, i) => (
                    <div key={i} className="p-2 rounded-lg bg-muted/50 text-sm">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span className="font-medium">{c.user}</span><span>{c.date}</span>
                      </div>
                      <p>{c.text}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <Input placeholder={t('adjustments.addComment')} value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addComment()} />
                  <Button size="sm" onClick={addComment} disabled={!commentText.trim()}>{t('common.add')}</Button>
                </div>
              </div>

              {detailAdj.status === 'pending' && (
                <div className="flex gap-2">
                  <Button className="flex-1 gap-1" variant="default" onClick={() => { handleApprove(detailAdj.id, commentText); setDetailAdj(null); }}>
                    <CheckCircle className="h-4 w-4" />{t('common.confirm')}
                  </Button>
                  <Button className="flex-1 gap-1" variant="destructive" onClick={() => { handleReject(detailAdj.id, commentText); setDetailAdj(null); }}>
                    <XCircle className="h-4 w-4" />{t('adjustments.reject')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
