import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getOrder, getDrivers } from '@/lib/fake-api';
import type { Order, OrderStatus, Driver } from '@/lib/fake-api/types';
import { OrderStatusBadge } from '@/components/StatusBadges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, CheckCircle, Truck, XCircle, Package, Edit, FileText, MessageSquare, UserCheck, Send } from 'lucide-react';
import { toast } from 'sonner';

const statusFlow: Array<{ key: string; icon: React.ElementType; next?: string; action?: string }> = [
  { key: 'draft', icon: Package, next: 'confirmed', action: 'Confirmer' },
  { key: 'confirmed', icon: CheckCircle, next: 'picking', action: 'Lancer picking' },
  { key: 'picking', icon: Package, next: 'dispatched', action: 'Expédier' },
  { key: 'dispatched', icon: Truck, next: 'delivered', action: 'Marquer livré' },
  { key: 'delivered', icon: CheckCircle, next: 'settled', action: 'Régler' },
  { key: 'settled', icon: CheckCircle },
];

interface OrderComment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  // Dialogs
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDriverDialog, setShowDriverDialog] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState('');

  // Editable fields (draft only)
  const [editItems, setEditItems] = useState(0);
  const [editTotal, setEditTotal] = useState(0);

  // Comments
  const [comments, setComments] = useState<OrderComment[]>([
    { id: 'c1', author: 'Karim M.', text: 'Client confirmé par téléphone', date: '2024-12-06T10:00:00' },
    { id: 'c2', author: 'Système', text: 'Commande créée via portail web', date: '2024-12-06T08:15:00' },
  ]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (id) getOrder(id).then(o => {
      setOrder(o || null);
      if (o) { setEditItems(o.itemsCount); setEditTotal(o.totalAmount); }
    });
    getDrivers().then(setDrivers);
  }, [id]);

  if (!order) return <div className="p-8 text-center text-muted-foreground">{t('common.loading')}</div>;

  const currentIdx = statusFlow.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'cancelled';
  const currentStep = statusFlow[currentIdx];

  const advanceStatus = () => {
    if (!currentStep?.next) return;
    setOrder(prev => prev ? { ...prev, status: currentStep.next as OrderStatus, updatedAt: new Date().toISOString() } : prev);
    const label = statusFlow.find(s => s.key === currentStep.next)?.key || '';
    toast.success(`Commande → ${t(`orders.${label}`)}`);
    setComments(prev => [{ id: `c${Date.now()}`, author: 'Système', text: `Statut changé → ${label}`, date: new Date().toISOString() }, ...prev]);
  };

  const handleCancel = () => {
    if (!cancelReason.trim()) { toast.error('Veuillez saisir un motif'); return; }
    setOrder(prev => prev ? { ...prev, status: 'cancelled' as OrderStatus, updatedAt: new Date().toISOString() } : prev);
    setComments(prev => [{ id: `c${Date.now()}`, author: 'Système', text: `Annulée — motif: ${cancelReason}`, date: new Date().toISOString() }, ...prev]);
    toast.success('Commande annulée');
    setShowCancelDialog(false);
    setCancelReason('');
  };

  const handleSaveEdit = () => {
    setOrder(prev => prev ? { ...prev, itemsCount: editItems, totalAmount: editTotal, updatedAt: new Date().toISOString() } : prev);
    toast.success('Commande mise à jour');
    setShowEditDialog(false);
  };

  const handleAssignDriver = () => {
    const driver = drivers.find(d => d.id === selectedDriver);
    if (!driver) return;
    setOrder(prev => prev ? { ...prev, assignedDriver: driver.name, updatedAt: new Date().toISOString() } : prev);
    setComments(prev => [{ id: `c${Date.now()}`, author: 'Système', text: `Chauffeur assigné: ${driver.name}`, date: new Date().toISOString() }, ...prev]);
    toast.success(`Chauffeur ${driver.name} assigné`);
    setShowDriverDialog(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments(prev => [{ id: `c${Date.now()}`, author: 'Rachid B.', text: newComment, date: new Date().toISOString() }, ...prev]);
    setNewComment('');
    toast.success('Commentaire ajouté');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/business/orders')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{t('orderDetail.title')} #{order.id.toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground">{order.customerName}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Status Timeline */}
      {!isCancelled && (
        <Card>
          <CardHeader><CardTitle className="text-base">{t('orderDetail.statusTimeline')}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {statusFlow.map((step, idx) => {
                const isCompleted = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <div key={step.key} className="flex items-center gap-2 min-w-fit">
                    <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${isCurrent ? 'bg-primary text-primary-foreground' : isCompleted ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      <step.icon className="h-3.5 w-3.5" />
                      {t(`orders.${step.key}`)}
                    </div>
                    {idx < statusFlow.length - 1 && <div className={`w-8 h-0.5 ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {isCancelled && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Commande annulée</p>
              <p className="text-sm text-muted-foreground">
                {comments.find(c => c.text.startsWith('Annulée'))?.text || 'Annulée par le système'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t('orderDetail.orderInfo')}</CardTitle>
              {order.status === 'draft' && (
                <Button variant="ghost" size="sm" onClick={() => setShowEditDialog(true)} className="gap-1">
                  <Edit className="h-3.5 w-3.5" />Modifier
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{t('orders.orderId')}</span><span className="font-mono">{order.id.toUpperCase()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t('orders.items')}</span><span>{order.itemsCount}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t('common.total')}</span><span className="font-bold">{order.totalAmount.toLocaleString()} {t('common.currency')}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t('common.created')}</span><span>{new Date(order.createdAt).toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t('common.updated')}</span><span>{new Date(order.updatedAt).toLocaleDateString()}</span></div>
          </CardContent>
        </Card>

        {/* Customer & Delivery Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t('orderDetail.customerDelivery')}</CardTitle>
              {!['settled', 'cancelled', 'delivered'].includes(order.status) && (
                <Button variant="ghost" size="sm" onClick={() => setShowDriverDialog(true)} className="gap-1">
                  <UserCheck className="h-3.5 w-3.5" />Assigner chauffeur
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{t('orders.customer')}</span><span className="font-medium">{order.customerName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t('orders.salesRep')}</span><span>{order.assignedSalesRep || '—'}</span></div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('orders.driver')}</span>
              <span>{order.assignedDriver || <Badge variant="outline" className="text-xs">Non assigné</Badge>}</span>
            </div>
            {!isCancelled && (
              <Button variant="outline" size="sm" className="w-full mt-2 gap-1" onClick={() => toast.info('Facture générée (mock)')}>
                <FileText className="h-3.5 w-3.5" />Générer facture
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {!isCancelled && (
        <Card>
          <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {currentStep?.next && (
              <Button onClick={advanceStatus} className="gap-2">
                <CheckCircle className="h-4 w-4" />{currentStep.action}
              </Button>
            )}
            {!['settled', 'cancelled', 'delivered'].includes(order.status) && (
              <Button variant="destructive" onClick={() => setShowCancelDialog(true)} className="gap-2">
                <XCircle className="h-4 w-4" />Annuler la commande
              </Button>
            )}
            {order.status === 'draft' && (
              <Button variant="outline" onClick={() => setShowEditDialog(true)} className="gap-2">
                <Edit className="h-4 w-4" />Modifier
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comments / History */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" />Historique & commentaires</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Ajouter un commentaire..." className="flex-1"
              onKeyDown={e => { if (e.key === 'Enter') handleAddComment(); }}
            />
            <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {comments.map(c => (
              <div key={c.id} className="flex gap-3 text-sm">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-primary">{c.author.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{c.author}</span>
                    <span className="text-xs text-muted-foreground">{new Date(c.date).toLocaleString()}</span>
                  </div>
                  <p className="text-muted-foreground">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Annuler la commande #{order.id.toUpperCase()}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label>Motif d'annulation *</Label>
            <Textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Ex: demande client, rupture de stock, erreur de saisie..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>Retour</Button>
            <Button variant="destructive" onClick={handleCancel}>Confirmer l'annulation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog (draft only) */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier la commande #{order.id.toUpperCase()}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre d'articles</Label>
              <Input type="number" value={editItems} onChange={e => setEditItems(parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Total (DZD)</Label>
              <Input type="number" value={editTotal} onChange={e => setEditTotal(parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Annuler</Button>
            <Button onClick={handleSaveEdit}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Driver Assignment Dialog */}
      <Dialog open={showDriverDialog} onOpenChange={setShowDriverDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assigner un chauffeur</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label>Chauffeur</Label>
            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
              <SelectTrigger><SelectValue placeholder="Sélectionner un chauffeur" /></SelectTrigger>
              <SelectContent>
                {drivers.filter(d => d.status !== 'offline').map(d => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} — {d.vehicle.split('—')[0].trim()} ({d.status === 'available' ? '✅ Disponible' : '🚛 En route'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDriverDialog(false)}>Annuler</Button>
            <Button onClick={handleAssignDriver} disabled={!selectedDriver}>Assigner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}