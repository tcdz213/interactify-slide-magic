import React from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type PlanTier = 'starter' | 'professional' | 'enterprise';

const PLAN_ORDER: PlanTier[] = ['starter', 'professional', 'enterprise'];

interface FeatureGateProps {
  requiredPlan: PlanTier;
  currentPlan?: PlanTier;
  mode?: 'soft' | 'hard';
  children: React.ReactNode;
}

export function FeatureGate({ requiredPlan, currentPlan = 'starter', mode = 'soft', children }: FeatureGateProps) {
  const hasAccess = PLAN_ORDER.indexOf(currentPlan) >= PLAN_ORDER.indexOf(requiredPlan);
  if (hasAccess) return <>{children}</>;
  if (mode === 'hard') return <UpgradeBanner feature="" requiredPlan={requiredPlan} variant="block" />;
  return (
    <div className="relative">
      <div className="opacity-40 pointer-events-none blur-[1px]">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <UpgradeBanner feature="" requiredPlan={requiredPlan} variant="inline" />
      </div>
    </div>
  );
}

interface UpgradeBannerProps {
  feature: string;
  requiredPlan: PlanTier;
  variant?: 'inline' | 'block';
}

export function UpgradeBanner({ requiredPlan, variant = 'inline' }: UpgradeBannerProps) {
  const { t } = useTranslation();
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
        <Lock className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm font-medium text-foreground">{t('saas.featureLocked', 'Fonctionnalité verrouillée')}</p>
          <p className="text-xs text-muted-foreground">{t('saas.upgradeTo', 'Passez au plan')} <span className="font-semibold capitalize">{requiredPlan}</span></p>
        </div>
        <PlanComparisonModal>
          <Button size="sm" className="ms-auto gap-1"><Zap className="h-3 w-3" />{t('saas.upgrade', 'Upgrade')}</Button>
        </PlanComparisonModal>
      </div>
    );
  }
  return (
    <Card className="mx-auto max-w-lg border-primary/20">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="rounded-full bg-primary/10 p-4"><Lock className="h-8 w-8 text-primary" /></div>
        <h3 className="text-lg font-semibold text-foreground">{t('saas.featureLocked', 'Fonctionnalité verrouillée')}</h3>
        <p className="text-sm text-muted-foreground">{t('saas.upgradeDesc', 'Cette fonctionnalité nécessite le plan')} <span className="font-semibold capitalize">{requiredPlan}</span></p>
        <PlanComparisonModal>
          <Button className="gap-2"><Zap className="h-4 w-4" />{t('saas.viewPlans', 'Voir les plans')}</Button>
        </PlanComparisonModal>
      </CardContent>
    </Card>
  );
}

const PLANS = [
  {
    id: 'starter' as PlanTier, price: '9 900 DZD', features: [
      '50 produits', '2 utilisateurs', '1 entrepôt', 'Rapports basiques',
    ],
  },
  {
    id: 'professional' as PlanTier, price: '29 900 DZD', popular: true, features: [
      '500 produits', '10 utilisateurs', '5 entrepôts', 'Rapports avancés',
      'B2B Réseau', 'Automatisations', 'API accès',
    ],
  },
  {
    id: 'enterprise' as PlanTier, price: '79 900 DZD', features: [
      'Produits illimités', 'Utilisateurs illimités', 'Entrepôts illimités',
      'White Label', 'Support prioritaire', 'AI Insights', 'SLA garanti',
    ],
  },
];

export function PlanComparisonModal({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('saas.comparePlans', 'Comparer les plans')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-3 py-4">
          {PLANS.map((plan) => (
            <Card key={plan.id} className={cn('relative', plan.popular && 'border-primary ring-2 ring-primary/20')}>
              {plan.popular && (
                <Badge className="absolute -top-2.5 start-1/2 -translate-x-1/2 bg-primary text-primary-foreground">Populaire</Badge>
              )}
              <CardContent className="p-5 space-y-4">
                <div>
                  <h4 className="font-semibold capitalize text-foreground">{plan.id}</h4>
                  <p className="text-2xl font-bold text-foreground">{plan.price}<span className="text-sm font-normal text-muted-foreground">/mois</span></p>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ArrowRight className="h-3 w-3 text-primary" />{f}
                    </li>
                  ))}
                </ul>
                <Button variant={plan.popular ? 'default' : 'outline'} className="w-full">
                  {t('saas.choosePlan', 'Choisir')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
