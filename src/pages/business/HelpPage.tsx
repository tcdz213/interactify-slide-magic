import { useState } from 'react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HelpCircle, MessageSquare, BookOpen, ExternalLink, Search, Play, Headphones, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const faqKeys = ['createOrder', 'addProduct', 'manageStock', 'inviteUsers', 'exportData', 'contactSupport'];

interface Ticket { id: string; subject: string; priority: string; status: 'open' | 'in_progress' | 'resolved'; createdAt: string; lastUpdate: string; }

const MOCK_TICKETS: Ticket[] = [
  { id: 'TKT-001', subject: 'Problème d\'export CSV', priority: 'medium', status: 'resolved', createdAt: '2025-04-10', lastUpdate: '2025-04-11' },
  { id: 'TKT-002', subject: 'Erreur lors de la création de commande', priority: 'high', status: 'in_progress', createdAt: '2025-04-12', lastUpdate: '2025-04-12' },
];

const VIDEO_TUTORIALS = [
  { title: 'Démarrage rapide', duration: '5:30', category: 'Général' },
  { title: 'Créer votre premier produit', duration: '3:45', category: 'Produits' },
  { title: 'Gestion des commandes', duration: '7:20', category: 'Commandes' },
  { title: 'Planifier une tournée de livraison', duration: '4:15', category: 'Livraisons' },
  { title: 'Facturation et paiements', duration: '6:00', category: 'Finance' },
  { title: 'Paramètres et personnalisation', duration: '4:50', category: 'Paramètres' },
];

const KNOWLEDGE_BASE = [
  { title: 'Guide de démarrage', category: 'Général', icon: BookOpen },
  { title: 'Documentation API', category: 'Technique', icon: ExternalLink },
  { title: 'Gestion des stocks', category: 'Inventaire', icon: BookOpen },
  { title: 'Facturation et paiements', category: 'Finance', icon: BookOpen },
  { title: 'Configuration des prix', category: 'Produits', icon: BookOpen },
  { title: 'Gestion des utilisateurs', category: 'Admin', icon: BookOpen },
];

export default function HelpPage() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [searchKB, setSearchKB] = useState('');
  const [chatMessages, setChatMessages] = useState<{ from: string; text: string }[]>([
    { from: 'bot', text: 'Bonjour ! Comment puis-je vous aider ?' },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const subject = (form.elements.namedItem('subject') as HTMLInputElement).value;
    const newTicket: Ticket = {
      id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`, subject, priority: 'medium', status: 'open',
      createdAt: new Date().toISOString().split('T')[0], lastUpdate: new Date().toISOString().split('T')[0],
    };
    setTickets(prev => [newTicket, ...prev]);
    toast.success(t('business.ticketSubmitted'));
    form.reset();
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { from: 'user', text: chatInput }]);
    const input = chatInput;
    setChatInput('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, { from: 'bot', text: `Merci pour votre question concernant "${input}". Un agent vous répondra sous peu. En attendant, consultez notre base de connaissances.` }]);
    }, 1000);
  };

  const filteredKB = KNOWLEDGE_BASE.filter(kb => kb.title.toLowerCase().includes(searchKB.toLowerCase()) || kb.category.toLowerCase().includes(searchKB.toLowerCase()));

  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    open: { label: 'Ouvert', variant: 'outline' },
    in_progress: { label: 'En cours', variant: 'default' },
    resolved: { label: 'Résolu', variant: 'secondary' },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('business.helpTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('business.helpDesc')}</p>
      </div>

      <Tabs defaultValue="faq">
        <TabsList className="flex-wrap">
          <TabsTrigger value="faq"><HelpCircle className="h-4 w-4 me-1" />{t('business.faq')}</TabsTrigger>
          <TabsTrigger value="tickets"><MessageSquare className="h-4 w-4 me-1" />{t('help.tickets', 'Tickets')}</TabsTrigger>
          <TabsTrigger value="chat"><Headphones className="h-4 w-4 me-1" />{t('help.liveChat', 'Chat en direct')}</TabsTrigger>
          <TabsTrigger value="kb"><BookOpen className="h-4 w-4 me-1" />{t('help.knowledgeBase', 'Base de connaissances')}</TabsTrigger>
          <TabsTrigger value="videos"><Play className="h-4 w-4 me-1" />{t('help.videos', 'Tutoriels vidéo')}</TabsTrigger>
        </TabsList>

        {/* FAQ */}
        <TabsContent value="faq" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><HelpCircle className="h-4 w-4 text-primary" />{t('business.faq')}</CardTitle>
              <CardDescription>{t('business.faqDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqKeys.map((key, i) => (
                  <AccordionItem key={key} value={`item-${i}`}>
                    <AccordionTrigger className="text-sm">{t(`business.faq_${key}_q`)}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{t(`business.faq_${key}_a`)}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tickets */}
        <TabsContent value="tickets" className="mt-4 space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><MessageSquare className="h-4 w-4 text-primary" />{t('business.contactSupport')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2"><Label>{t('business.subject')}</Label><Input name="subject" placeholder={t('business.subjectPlaceholder')} required /></div>
                  <div className="space-y-2">
                    <Label>{t('business.priority')}</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t('business.priorityLow')}</SelectItem>
                        <SelectItem value="medium">{t('business.priorityMedium')}</SelectItem>
                        <SelectItem value="high">{t('business.priorityHigh')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>{t('business.message')}</Label><Textarea placeholder={t('business.messagePlaceholder')} rows={4} required /></div>
                  <Button type="submit">{t('business.submitTicket')}</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">{t('help.ticketHistory', 'Historique des tickets')}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>{t('business.subject')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead>{t('common.date')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map(ticket => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono text-xs">{ticket.id}</TableCell>
                        <TableCell className="text-sm">{ticket.subject}</TableCell>
                        <TableCell><Badge variant={statusConfig[ticket.status].variant}>{statusConfig[ticket.status].label}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{ticket.createdAt}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Live Chat */}
        <TabsContent value="chat" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Headphones className="h-4 w-4 text-primary" />{t('help.liveChat', 'Chat en direct')}</CardTitle>
              <CardDescription>{t('help.chatDesc', 'Discutez avec notre assistant ou un agent')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg h-80 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${msg.from === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t p-3 flex gap-2">
                  <Input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder={t('help.typeMessage', 'Tapez votre message...')} onKeyDown={e => e.key === 'Enter' && sendChat()} />
                  <Button onClick={sendChat}>{t('help.send', 'Envoyer')}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Knowledge Base */}
        <TabsContent value="kb" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><BookOpen className="h-4 w-4 text-primary" />{t('help.knowledgeBase', 'Base de connaissances')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={searchKB} onChange={e => setSearchKB(e.target.value)} placeholder={t('help.searchKB', 'Rechercher dans la documentation...')} className="ps-9" />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {filteredKB.map((doc, i) => (
                  <a key={i} href="#" className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                    <doc.icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="text-sm font-medium">{doc.title}</span>
                      <p className="text-xs text-muted-foreground">{doc.category}</p>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Tutorials */}
        <TabsContent value="videos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Play className="h-4 w-4 text-primary" />{t('help.videos', 'Tutoriels vidéo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {VIDEO_TUTORIALS.map((video, i) => (
                  <div key={i} className="rounded-lg border overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => toast.info(`Lecture: ${video.title}`)}>
                    <div className="h-28 bg-muted flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Play className="h-5 w-5 text-primary ms-0.5" />
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium">{video.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">{video.category}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{video.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
