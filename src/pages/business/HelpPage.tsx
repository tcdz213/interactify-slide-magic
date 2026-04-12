import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HelpCircle, MessageSquare, BookOpen, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const faqKeys = ['createOrder', 'addProduct', 'manageStock', 'inviteUsers', 'exportData', 'contactSupport'];

const docLinks = [
  { title: 'Guide de démarrage', url: '#', icon: BookOpen },
  { title: 'Documentation API', url: '#', icon: ExternalLink },
  { title: 'Gestion des stocks', url: '#', icon: BookOpen },
  { title: 'Facturation et paiements', url: '#', icon: BookOpen },
];

export default function HelpPage() {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t('business.ticketSubmitted'));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('business.helpTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('business.helpDesc')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HelpCircle className="h-4 w-4 text-primary" />
              {t('business.faq')}
            </CardTitle>
            <CardDescription>{t('business.faqDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqKeys.map((key, i) => (
                <AccordionItem key={key} value={`item-${i}`}>
                  <AccordionTrigger className="text-sm">{t(`business.faq_${key}_q`)}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {t(`business.faq_${key}_a`)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4 text-primary" />
                {t('business.contactSupport')}
              </CardTitle>
              <CardDescription>{t('business.contactSupportDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('business.subject')}</Label>
                  <Input placeholder={t('business.subjectPlaceholder')} required />
                </div>
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
                <div className="space-y-2">
                  <Label>{t('business.message')}</Label>
                  <Textarea placeholder={t('business.messagePlaceholder')} rows={4} required />
                </div>
                <Button type="submit">{t('business.submitTicket')}</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-primary" />
                {t('business.documentation')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {docLinks.map((link, i) => (
                  <a key={i} href={link.url} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                    <link.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{link.title}</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground ms-auto" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
