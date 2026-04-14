import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDeliveries } from '@/lib/fake-api';
import type { Delivery } from '@/lib/fake-api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, MapPin, Truck, Phone, Clock, CheckCircle, XCircle, Package, User, Camera, MessageSquare, RefreshCw, Navigation } from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  in_transit: 'bg-info/10 text-info',
  delivered: 'bg-success/10 text-success',
  failed: 'bg-destructive/10 text-destructive',
};

const timelineSteps = [
  { key: 'pending', icon: Package, label: 'deliveries.orderPrepared' },
  { key: 'in_transit', icon: Truck, label: 'deliveries.inTransitStatus' },
  { key: 'delivered', icon: CheckCircle, label: 'orders.delivered' },
];

const MOCK_EVENTS = [
  { time: '08:30', event: 'Commande préparée', user: 'Système' },
  { time: '09:15', event: 'Chargement véhicule', user: 'Rachid B.' },
  { time: '09:45', event: 'Départ entrepôt', user: 'Rachid B.' },
  { time: '10:20', event: 'En route vers client', user: 'GPS' },
];

export default function DeliveryDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [statusDialog, setStatusDialog] = useState<{ open: boolean; newStatus: string }>({ open: false, newStatus: '' });
  const [reassignDialog, setReassignDialog] = useState(false);
  const [noteDialog, setNoteDialog] = useState(false);
  const [note, setNote] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [failReason, setFailReason] = useState('');
  const [notes, setNotes] = useState<Array<{ time: string; text: string }>>([]);

  useEffect(() => {
    getDeliveries().then(all => {
      setDelivery(all.find(d => d.id === id) || null);
    });
  }, [id]);

  if (!delivery) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">{t('common.loading')}</div>;
  }

  const statusIndex = delivery.status === 'failed' ? -1 : timelineSteps.findIndex(s => s.key === delivery.status);

  const handleMarkDelivered = () => {
    setDelivery(prev => prev ? { ...prev, status: 'delivered' as any, actualArrival: new Date().toISOString() } : null);
    toast.success(t('deliveries.markedDelivered'));
    setStatusDialog({ open: false, newStatus: '' });
  };

  const handleMarkFailed = () => {
    setDelivery(prev => prev ? { ...prev, status: 'failed' as any } : null);
    toast.error(t('deliveries.markedFailed'));
    setStatusDialog({ open: false, newStatus: '' });
    setFailReason('');
  };

  const handleReassign = () => {
    if (!selectedDriver) return;
    setDelivery(prev => prev ? { ...prev, driverName: selectedDriver } : null);
    toast.success(t('deliveries.driverReassigned'));
    setReassignDialog(false);
    setSelectedDriver('');
  };

  const handleAddNote = () => {
    if (!note.trim()) return;
    setNotes(prev => [...prev, { time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), text: note }]);
    toast.success(t('common.success', 'Note ajoutée'));
    setNoteDialog(false);
    setNote('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/business/deliveries')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{t('deliveries.deliveryDetail')}</h1>
          <p className="text-sm text-muted-foreground font-mono">{delivery.orderId.toUpperCase()}</p>
        </div>
        <Badge variant="secondary" className={`text-sm px-3 py-1 ${statusColors[delivery.status]}`}>
          {t(`deliveries.${delivery.status === 'in_transit' ? 'inTransitStatus' : delivery.status}`)}
        </Badge>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader><CardTitle className="text-base">{t('deliveries.trackingTimeline')}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
            <div className="absolute top-5 left-0 h-0.5 bg-primary transition-all" style={{ width: `${Math.max(0, statusIndex) * 50}%` }} />
            {timelineSteps.map((step, idx) => {
              const isActive = idx <= statusIndex;
              const isCurrent = idx === statusIndex;
              return (
                <div key={step.key} className="relative flex flex-col items-center gap-2 z-10">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    isCurrent ? 'bg-primary text-primary-foreground border-primary' :
                    isActive ? 'bg-primary/20 text-primary border-primary' : 'bg-background text-muted-foreground border-muted'
                  }`}>
                    <step.icon className="h-4 w-4" />
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{t(step.label)}</span>
                </div>
              );
            })}
          </div>
          {delivery.status === 'failed' && (
            <div className="mt-4 flex items-center gap-2 text-destructive">
              <XCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{t('deliveries.deliveryFailed')}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Info */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" />{t('orders.customer')}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><span className="text-sm text-muted-foreground">{t('common.name')}:</span><p className="font-medium">{delivery.customerName}</p></div>
            <div><span className="text-sm text-muted-foreground">{t('common.address')}:</span><p className="text-sm flex items-center gap-1"><MapPin className="h-3 w-3" />{delivery.customerAddress}</p></div>
          </CardContent>
        </Card>

        {/* Driver Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Truck className="h-4 w-4" />{t('orders.driver')}</CardTitle>
              {delivery.status !== 'delivered' && delivery.status !== 'failed' && (
                <Button size="sm" variant="outline" onClick={() => setReassignDialog(true)}><RefreshCw className="h-3 w-3 me-1" />{t('deliveries.reassignDriver')}</Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><span className="text-sm text-muted-foreground">{t('common.name')}:</span><p className="font-medium">{delivery.driverName}</p></div>
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t('deliveries.eta')}:</span>
                <p className="font-medium">{new Date(delivery.estimatedArrival).toLocaleString()}</p>
              </div>
              {delivery.actualArrival && (
                <div>
                  <span className="text-muted-foreground">{t('deliveries.actualArrival')}:</span>
                  <p className="font-medium">{new Date(delivery.actualArrival).toLocaleString()}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" />{t('deliveries.activityLog', 'Journal d\'activité')}</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setNoteDialog(true)}><MessageSquare className="h-3 w-3 me-1" />{t('deliveries.addNote', 'Ajouter note')}</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...MOCK_EVENTS, ...notes.map(n => ({ time: n.time, event: n.text, user: 'Vous' }))].map((evt, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">{i + 1}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{evt.event}</p>
                  <p className="text-xs text-muted-foreground">{evt.time} • {evt.user}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {(delivery.status === 'in_transit' || delivery.status === 'pending') && (
        <Card>
          <CardContent className="pt-6 flex flex-wrap gap-3">
            {delivery.status === 'in_transit' && (
              <>
                <Button className="gap-2" onClick={() => setStatusDialog({ open: true, newStatus: 'delivered' })}><CheckCircle className="h-4 w-4" />{t('deliveries.markDelivered')}</Button>
                <Button variant="destructive" className="gap-2" onClick={() => setStatusDialog({ open: true, newStatus: 'failed' })}><XCircle className="h-4 w-4" />{t('deliveries.markFailed')}</Button>
              </>
            )}
            <Button variant="outline" className="gap-2"><Camera className="h-4 w-4" />{t('deliveries.proofOfDelivery', 'Preuve de livraison')}</Button>
            <Button variant="outline" className="gap-2"><Phone className="h-4 w-4" />{t('deliveries.callDriver', 'Appeler chauffeur')}</Button>
          </CardContent>
        </Card>
      )}

      {/* Status Change Dialog */}
      <Dialog open={statusDialog.open} onOpenChange={o => !o && setStatusDialog({ open: false, newStatus: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{statusDialog.newStatus === 'delivered' ? t('deliveries.markDelivered') : t('deliveries.markFailed')}</DialogTitle>
            <DialogDescription>{t('deliveries.confirmStatusChange', 'Confirmez le changement de statut')}</DialogDescription>
          </DialogHeader>
          {statusDialog.newStatus === 'failed' && (
            <div className="space-y-2">
              <Label>{t('deliveries.failReason', 'Raison de l\'échec')}</Label>
              <Select value={failReason} onValueChange={setFailReason}>
                <SelectTrigger><SelectValue placeholder={t('deliveries.selectReason', 'Sélectionner...')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="absent">{t('deliveries.customerAbsent', 'Client absent')}</SelectItem>
                  <SelectItem value="refused">{t('deliveries.orderRefused', 'Commande refusée')}</SelectItem>
                  <SelectItem value="address">{t('deliveries.wrongAddress', 'Adresse incorrecte')}</SelectItem>
                  <SelectItem value="damaged">{t('deliveries.goodsDamaged', 'Marchandise endommagée')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog({ open: false, newStatus: '' })}>{t('common.cancel', 'Annuler')}</Button>
            <Button variant={statusDialog.newStatus === 'failed' ? 'destructive' : 'default'} onClick={statusDialog.newStatus === 'delivered' ? handleMarkDelivered : handleMarkFailed}>
              {t('common.confirm', 'Confirmer')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reassign Dialog */}
      <Dialog open={reassignDialog} onOpenChange={setReassignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deliveries.reassignDriver')}</DialogTitle>
            <DialogDescription>{t('deliveries.reassignDescription', { order: delivery.orderId })}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>{t('deliveries.newDriver')}</Label>
            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
              <SelectTrigger><SelectValue placeholder={t('deliveries.selectDriver', 'Sélectionner chauffeur')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Ahmed K.">Ahmed K.</SelectItem>
                <SelectItem value="Karim M.">Karim M.</SelectItem>
                <SelectItem value="Yacine B.">Yacine B.</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignDialog(false)}>{t('common.cancel', 'Annuler')}</Button>
            <Button onClick={handleReassign}>{t('deliveries.confirmReassign')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deliveries.addNote', 'Ajouter une note')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>{t('deliveries.noteContent', 'Contenu')}</Label>
            <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder={t('deliveries.notePlaceholder', 'Décrivez la situation...')} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialog(false)}>{t('common.cancel', 'Annuler')}</Button>
            <Button onClick={handleAddNote}>{t('common.save', 'Enregistrer')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
