import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getWarehouses } from '@/lib/fake-api';
import type { Warehouse } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { KPIWidget } from '@/components/KPIWidget';
import { Plus, Warehouse as WarehouseIcon, MapPin, User, Package, ArrowRight, Pencil, Trash2, ArrowLeftRight, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function WarehousesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Warehouse | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);

  // Form
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formManager, setFormManager] = useState('');
  const [formCapacity, setFormCapacity] = useState('5000');

  // Transfer form
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferProduct, setTransferProduct] = useState('');
  const [transferQty, setTransferQty] = useState('');

  useEffect(() => {
    getWarehouses().then(data => { setWarehouses(data); setLoading(false); });
  }, []);

  const resetForm = () => {
    setFormName(''); setFormAddress(''); setFormManager(''); setFormCapacity('5000'); setEditing(null);
  };

  const openCreate = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (wh: Warehouse) => {
    setEditing(wh);
    setFormName(wh.name); setFormAddress(wh.address);
    setFormManager(wh.managerName); setFormCapacity(wh.capacity.toString());
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formName || !formAddress) { toast.error(t('common.error')); return; }
    if (editing) {
      setWarehouses(prev => prev.map(w => w.id === editing.id ? {
        ...w, name: formName, address: formAddress, managerName: formManager,
        capacity: parseInt(formCapacity) || 5000,
      } : w));
      toast.success(t('warehouses.updated'));
    } else {
      const newWh: Warehouse = {
        id: `wh${Date.now()}`, tenantId: 't1', name: formName, address: formAddress,
        managerId: `mgr${Date.now()}`, managerName: formManager,
        productsCount: 0, capacity: parseInt(formCapacity) || 5000, utilization: 0,
      };
      setWarehouses(prev => [...prev, newWh]);
      toast.success(t('warehouses.created'));
    }
    setDialogOpen(false); resetForm();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setWarehouses(prev => prev.filter(w => w.id !== deleteTarget.id));
    toast.success(t('warehouses.deleted'));
    setDeleteTarget(null);
  };

  const handleTransfer = () => {
    if (!transferFrom || !transferTo || !transferQty) { toast.error(t('common.error')); return; }
    toast.success(t('warehouses.transferCompleted'));
    setTransferOpen(false);
    setTransferFrom(''); setTransferTo(''); setTransferProduct(''); setTransferQty('');
  };

  const utilizationColor = (pct: number) => {
    if (pct >= 85) return 'text-destructive';
    if (pct >= 60) return 'text-warning';
    return 'text-success';
  };

  const totalCapacity = warehouses.reduce((s, w) => s + w.capacity, 0);
  const avgUtilization = warehouses.length ? Math.round(warehouses.reduce((s, w) => s + w.utilization, 0) / warehouses.length) : 0;
  const totalProducts = warehouses.reduce((s, w) => s + w.productsCount, 0);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-muted-foreground">{t('common.loading')}</div></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('warehouses.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('warehouses.description')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setTransferOpen(true)}>
            <ArrowLeftRight className="h-4 w-4" />{t('warehouses.transfer')}
          </Button>
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />{t('business.addWarehouse')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KPIWidget title={t('warehouses.totalWarehouses')} value={warehouses.length} icon={<WarehouseIcon className="h-5 w-5" />} />
        <KPIWidget title={t('warehouses.totalCapacity')} value={totalCapacity.toLocaleString()} icon={<Package className="h-5 w-5" />} />
        <KPIWidget title={t('warehouses.avgUtilization')} value={`${avgUtilization}%`} icon={<BarChart3 className="h-5 w-5" />} />
        <KPIWidget title={t('warehouses.totalProducts')} value={totalProducts} icon={<Package className="h-5 w-5" />} />
      </div>

      <Tabs defaultValue="cards">
        <TabsList>
          <TabsTrigger value="cards">{t('warehouses.cardView')}</TabsTrigger>
          <TabsTrigger value="table">{t('warehouses.tableView')}</TabsTrigger>
          <TabsTrigger value="capacity">{t('warehouses.capacityPlanning')}</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            {warehouses.map(wh => (
              <Card key={wh.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <WarehouseIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{wh.name}</CardTitle>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3" />{wh.address}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(wh)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(wh)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate(`/business/inventory?warehouse=${wh.id}`)}>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1"><User className="h-3 w-3" />{t('business.manager')}</div>
                      <p className="text-sm font-medium">{wh.managerName}</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1"><Package className="h-3 w-3" />{t('nav.products')}</div>
                      <p className="text-sm font-medium">{wh.productsCount}</p>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs mb-1">{t('business.capacity')}</div>
                      <p className="text-sm font-medium">{wh.capacity.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('business.utilization')}</span>
                      <span className={`font-bold ${utilizationColor(wh.utilization)}`}>{wh.utilization}%</span>
                    </div>
                    <Progress value={wh.utilization} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.name')}</TableHead>
                    <TableHead>{t('common.address')}</TableHead>
                    <TableHead>{t('business.manager')}</TableHead>
                    <TableHead>{t('nav.products')}</TableHead>
                    <TableHead>{t('business.capacity')}</TableHead>
                    <TableHead>{t('business.utilization')}</TableHead>
                    <TableHead>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouses.map(wh => (
                    <TableRow key={wh.id}>
                      <TableCell className="font-medium">{wh.name}</TableCell>
                      <TableCell className="text-muted-foreground">{wh.address}</TableCell>
                      <TableCell>{wh.managerName}</TableCell>
                      <TableCell>{wh.productsCount}</TableCell>
                      <TableCell>{wh.capacity.toLocaleString()}</TableCell>
                      <TableCell><span className={`font-bold ${utilizationColor(wh.utilization)}`}>{wh.utilization}%</span></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(wh)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(wh)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capacity" className="mt-4">
          <Card>
            <CardHeader><CardTitle>{t('warehouses.capacityPlanning')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {warehouses.map(wh => (
                <div key={wh.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{wh.name}</span>
                    <span className="text-muted-foreground">{Math.round(wh.capacity * wh.utilization / 100)} / {wh.capacity.toLocaleString()}</span>
                  </div>
                  <Progress value={wh.utilization} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t('warehouses.available')}: {Math.round(wh.capacity * (100 - wh.utilization) / 100).toLocaleString()}</span>
                    <span className={utilizationColor(wh.utilization)}>{wh.utilization}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={v => { if (!v) resetForm(); setDialogOpen(v); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? t('warehouses.editWarehouse') : t('business.addWarehouse')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2"><Label>{t('common.name')}</Label><Input value={formName} onChange={e => setFormName(e.target.value)} placeholder={t('warehouses.namePlaceholder')} /></div>
            <div className="space-y-2"><Label>{t('common.address')}</Label><Input value={formAddress} onChange={e => setFormAddress(e.target.value)} placeholder={t('warehouses.addressPlaceholder')} /></div>
            <div className="space-y-2"><Label>{t('business.manager')}</Label><Input value={formManager} onChange={e => setFormManager(e.target.value)} placeholder={t('warehouses.managerPlaceholder')} /></div>
            <div className="space-y-2"><Label>{t('business.capacity')}</Label><Input type="number" value={formCapacity} onChange={e => setFormCapacity(e.target.value)} /></div>
            <Button className="w-full" onClick={handleSave}>{t('common.save')}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('warehouses.transfer')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>{t('warehouses.from')}</Label>
              <Select value={transferFrom} onValueChange={setTransferFrom}>
                <SelectTrigger><SelectValue placeholder={t('warehouses.selectWarehouse')} /></SelectTrigger>
                <SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('warehouses.to')}</Label>
              <Select value={transferTo} onValueChange={setTransferTo}>
                <SelectTrigger><SelectValue placeholder={t('warehouses.selectWarehouse')} /></SelectTrigger>
                <SelectContent>{warehouses.filter(w => w.id !== transferFrom).map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>{t('warehouses.productToTransfer')}</Label><Input value={transferProduct} onChange={e => setTransferProduct(e.target.value)} placeholder={t('pricing.selectProduct')} /></div>
            <div className="space-y-2"><Label>{t('adjustments.qtyChange')}</Label><Input type="number" value={transferQty} onChange={e => setTransferQty(e.target.value)} /></div>
            <Button className="w-full" onClick={handleTransfer}>{t('warehouses.executeTransfer')}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog open={!!deleteTarget} onOpenChange={v => { if (!v) setDeleteTarget(null); }} title={t('common.areYouSure')} description={t('common.cannotUndo')} onConfirm={handleDelete} />
    </div>
  );
}
