import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HelpCircle, MessageSquare, BookOpen, ExternalLink, Search, Clock, CheckCircle, AlertCircle, Filter } from 'lucide-react';
import { toast } from 'sonner';

const faqKeys = ['createOrder', 'addProduct', 'manageStock', 'inviteUsers', 'exportData', 'contactSupport'];

const docLinks = [
  { title: 'Guide de démarrage', url: '#', icon: BookOpen, category: 'getting-started' },
  { title: 'Documentation API', url: '#', icon: ExternalLink, category: 'api' },
  { title: 'Gestion des stocks', url: '#', icon: BookOpen, category: 'inventory' },
  { title: 'Facturation et paiements', url: '#', icon: BookOpen, category: 'billing' },
  { title: 'Gestion des livraisons', url: '#', icon: BookOpen, category: 'delivery' },
  { title: 'Rapports et analytics', url: '#', icon: BookOpen, category: 'reports' },
];

type Ticket = {
  id: string;
  subject: string;
  priority: string;
  status: 'open' | 'in_progress' | 'resolved';
  date: string;
  message: string;
};

const MOCK_TICKETS: Ticket[] = [
  { id: 'TK-001', subject: 'Problème d\'export CSV', priority: 'high', status: 'in_progress', date: '2024-12-10', message: 'L\'export CSV ne fonctionne pas pour les commandes' },
  { id: 'TK-002', subject: 'Question facturation TVA', priority: 'medium', status: 'resolved', date: '2024-12-08', message: 'Comment configurer les taux TVA?' },
  { id: 'TK-003', subject: 'Ajout utilisateur bloqué', priority: 'low', status: 'open', date: '2024-12-12', message: 'Impossible d\'ajouter un nouvel utilisateur' },
];

export default function HelpPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('faq');
  const [faqSearch, setFaqSearch] = useState('');
  const [docFilter, setDocFilter] = useState('all');
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [newTicket, setNewTicket] = useState({ subject: '', priority: 'medium', message: '' });
  const [ticketFilter, setTicketFilter] = useState('all');

  const filteredFaqKeys = useMemo(() => {
    if (!faqSearch) return faqKeys;
    return faqKeys.filter(key => {
      const q = t(`business.faq_${key}_q`).toLowerCase();
      const a = t(`business.faq_${key}_a`).toLowerCase();
      return q.includes(faqSearch.toLowerCase()) || a.includes(faqSearch.toLowerCase());
    });
  }, [faqSearch, t]);

  const filteredDocs = useMemo(() => {
    if (docFilter === 'all') return docLinks;
    return docLinks.filter(d => d.category === docFilter);
  }, [docFilter]);

  const filteredTickets = useMemo(() => {
    if (ticketFilter === 'all') return tickets;
    return tickets.filter(t => t.status === ticketFilter);
  }, [tickets, ticketFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.message) return;
    const ticket: Ticket = {
      id: `TK-${String(tickets.length + 1).padStart(3, '0')}`,
      subject: newTicket.subject,
      priority: newTicket.priority,
      status: 'open',
      date: new Date().toISOString().split('T')[0],
      message: newTicket.message,
    };
    setTickets(prev => [ticket, ...prev]);
    setNewTicket({ subject: '', priority: 'medium', message: '' });
    toast.success(t('business.ticketSubmitted'));
    setActiveTab('tickets');
  };

  const statusIcon = (status: Ticket['status']) => {
    if (status === 'resolved') return <CheckCircle className="h-3.5 w-3.5 text-success" />;
    if (status === 'in_progress') return <Clock className="h-3.5 w-3.5 text-warning" />;
    return <AlertCircle className="h-3.5 w-3.5 text-info" />;
  };

  const statusLabel = (status: Ticket['status']) => {
    if (status === 'resolved') return t('help.resolved', 'Résolu');
    if (status === 'in_progress') return t('help.inProgress', 'En cours');
    return t('help.open', 'Ouvert');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('business.helpTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('business.helpDesc')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="faq"><HelpCircle className="h-4 w-4 me-1" />{t('business.faq')}</TabsTrigger>
          <TabsTrigger value="docs"><BookOpen className="h-4 w-4 me-1" />{t('business.documentation')}</TabsTrigger>
          <TabsTrigger value="tickets">
            <MessageSquare className="h-4 w-4 me-1" />{t('help.tickets', 'Tickets')}
            {tickets.filter(t => t.status !== 'resolved').length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 w-5 p-0 text-xs flex items-center justify-center">{tickets.filter(t => t.status !== 'resolved').length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="new"><MessageSquare className="h-4 w-4 me-1" />{t('help.newTicket', 'Nouveau ticket')}</TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="mt-4 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder={t('help.searchFaq', 'Rechercher dans la FAQ...')} value={faqSearch} onChange={e => setFaqSearch(e.target.value)} />
          </div>
          <Card>
            <CardContent className="pt-4">
              {filteredFaqKeys.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">{t('common.noData', 'Aucun résultat')}</p>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqKeys.map((key, i) => (
                    <AccordionItem key={key} value={`item-${i}`}>
                      <AccordionTrigger className="text-sm">{t(`business.faq_${key}_q`)}</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">{t(`business.faq_${key}_a`)}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="docs" className="mt-4 space-y-4">
          <Select value={docFilter} onValueChange={setDocFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder={t('help.filterCategory', 'Catégorie')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all', 'Toutes')}</SelectItem>
              <SelectItem value="getting-started">{t('help.gettingStarted', 'Démarrage')}</SelectItem>
              <SelectItem value="api">API</SelectItem>
              <SelectItem value="inventory">{t('help.inventory', 'Stock')}</SelectItem>
              <SelectItem value="billing">{t('help.billing', 'Facturation')}</SelectItem>
              <SelectItem value="delivery">{t('help.delivery', 'Livraison')}</SelectItem>
              <SelectItem value="reports">{t('help.reports', 'Rapports')}</SelectItem>
            </SelectContent>
          </Select>
          <div className="grid gap-3 md:grid-cols-2">
            {filteredDocs.map((link, i) => (
              <a key={i} href={link.url} className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                <link.icon className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <span className="text-sm font-medium">{link.title}</span>
                  <p className="text-xs text-muted-foreground capitalize">{link.category.replace('-', ' ')}</p>
                </div>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </a>
            ))}
          </div>
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="mt-4 space-y-4">
          <div className="flex gap-3">
            <Select value={ticketFilter} onValueChange={setTicketFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all', 'Tous')}</SelectItem>
                <SelectItem value="open">{t('help.open', 'Ouvert')}</SelectItem>
                <SelectItem value="in_progress">{t('help.inProgress', 'En cours')}</SelectItem>
                <SelectItem value="resolved">{t('help.resolved', 'Résolu')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            {filteredTickets.map(ticket => (
              <Card key={ticket.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {statusIcon(ticket.status)}
                        <span className="text-sm font-medium">{ticket.subject}</span>
                        <Badge variant="outline" className="text-xs">{ticket.id}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{ticket.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{ticket.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={ticket.priority === 'high' ? 'destructive' : ticket.priority === 'medium' ? 'secondary' : 'outline'}>
                        {ticket.priority === 'high' ? t('business.priorityHigh') : ticket.priority === 'medium' ? t('business.priorityMedium') : t('business.priorityLow')}
                      </Badge>
                      <Badge variant="outline">{statusLabel(ticket.status)}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredTickets.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">{t('common.noData', 'Aucun ticket')}</p>}
          </div>
        </TabsContent>

        {/* New Ticket Tab */}
        <TabsContent value="new" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" />{t('business.contactSupport')}</CardTitle>
              <CardDescription>{t('business.contactSupportDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('business.subject')}</Label>
                  <Input placeholder={t('business.subjectPlaceholder')} value={newTicket.subject} onChange={e => setNewTicket(p => ({ ...p, subject: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>{t('business.priority')}</Label>
                  <Select value={newTicket.priority} onValueChange={v => setNewTicket(p => ({ ...p, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t('business.priorityLow')}</SelectItem>
                      <SelectItem value="medium">{t('business.priorityMedium')}</SelectItem>
                      <SelectItem value="high">{t('business.priorityHigh')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('business.message')}</Label>
                  <Textarea placeholder={t('business.messagePlaceholder')} rows={4} value={newTicket.message} onChange={e => setNewTicket(p => ({ ...p, message: e.target.value }))} required />
                </div>
                <Button type="submit">{t('business.submitTicket')}</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
