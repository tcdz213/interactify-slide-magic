import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Shield, Package, ArrowRight, Building2, Truck, BarChart3,
  Check, Smartphone, Globe, Zap, Lock, HeadphonesIcon,
  Mail, MapPin, Phone
} from 'lucide-react';

const featureIcons = [Building2, Package, Truck, BarChart3, Lock, Globe];

const plans = [
  { key: 'starter', price: '29', popular: false },
  { key: 'business', price: '79', popular: true },
  { key: 'enterprise', price: null, popular: false },
];

export default function Index() {
  const { t } = useTranslation();

  const features = [
    { icon: Building2, title: t('landing.features.multiTenant.title'), desc: t('landing.features.multiTenant.desc') },
    { icon: Package, title: t('landing.features.smartCatalog.title'), desc: t('landing.features.smartCatalog.desc') },
    { icon: Truck, title: t('landing.features.logistics.title'), desc: t('landing.features.logistics.desc') },
    { icon: BarChart3, title: t('landing.features.analytics.title'), desc: t('landing.features.analytics.desc') },
    { icon: Lock, title: t('landing.features.security.title'), desc: t('landing.features.security.desc') },
    { icon: Globe, title: t('landing.features.i18n.title'), desc: t('landing.features.i18n.desc') },
  ];

  const testimonials = [
    { name: 'Karim B.', role: t('landing.testimonials.role1'), quote: t('landing.testimonials.quote1') },
    { name: 'Amina T.', role: t('landing.testimonials.role2'), quote: t('landing.testimonials.quote2') },
    { name: 'Youcef M.', role: t('landing.testimonials.role3'), quote: t('landing.testimonials.quote3') },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 flex items-center justify-between h-14">
          <span className="text-xl font-bold text-primary">Jawda Pro</span>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">{t('landing.nav.features')}</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">{t('landing.nav.pricing')}</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">{t('landing.nav.testimonials')}</a>
            <a href="#contact" className="hover:text-foreground transition-colors">{t('landing.nav.contact')}</a>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button asChild size="sm">
              <Link to="/business">{t('landing.nav.getStarted')}</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden" id="main-content">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <Badge variant="secondary" className="gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              {t('landing.hero.badge')}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              {t('landing.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
              {t('landing.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="gap-2 w-full sm:w-auto">
                <Link to="/admin">
                  <Shield className="h-4 w-4" />
                  {t('landing.hero.ctaAdmin')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                <Link to="/business">
                  <Package className="h-4 w-4" />
                  {t('landing.hero.ctaBusiness')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Check className="h-4 w-4 text-green-500" /> {t('landing.hero.noCC')}</span>
              <span className="flex items-center gap-1"><Check className="h-4 w-4 text-green-500" /> {t('landing.hero.freeTier')}</span>
              <span className="flex items-center gap-1"><Check className="h-4 w-4 text-green-500" /> {t('landing.hero.setup')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">{t('landing.features.heading')}</h2>
          <p className="text-muted-foreground mt-2">{t('landing.features.subheading')}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Card key={i} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <CardContent className="pt-6">
                <div className="rounded-lg bg-primary/10 p-2.5 w-fit mb-3">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Mobile Apps */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">{t('landing.mobile.heading')}</h2>
            <p className="text-muted-foreground mt-2">{t('landing.mobile.subheading')}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                <Truck className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground">{t('landing.mobile.driver.title')}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t('landing.mobile.driver.desc')}</p>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link to="/mobile/driver">{t('landing.mobile.driver.cta')}</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Smartphone className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground">{t('landing.mobile.sales.title')}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t('landing.mobile.sales.desc')}</p>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link to="/mobile/sales">{t('landing.mobile.sales.cta')}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">{t('landing.pricing.heading')}</h2>
          <p className="text-muted-foreground mt-2">{t('landing.pricing.subheading')}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.key} className={plan.popular ? 'border-primary ring-2 ring-primary/20 relative' : ''}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">{t('landing.pricing.popular')}</Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle>{t(`landing.pricing.plans.${plan.key}.name`)}</CardTitle>
                <div className="mt-2">
                  {plan.price ? (
                    <span className="text-4xl font-bold text-foreground">${plan.price}<span className="text-base font-normal text-muted-foreground">/{t('landing.pricing.month')}</span></span>
                  ) : (
                    <span className="text-2xl font-bold text-foreground">{t('landing.pricing.contactUs')}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {[1, 2, 3, 4].map((i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-muted-foreground">{t(`landing.pricing.plans.${plan.key}.f${i}`)}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant={plan.popular ? 'default' : 'outline'} className="w-full mt-6">
                  <Link to="/business">{t('landing.pricing.cta')}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">{t('landing.testimonials.heading')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {testimonials.map((t2, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground italic">"{t2.quote}"</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {t2.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{t2.name}</p>
                      <p className="text-xs text-muted-foreground">{t2.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / CTA */}
      <section id="contact" className="container mx-auto px-4 py-16 md:py-24">
        <Card className="max-w-2xl mx-auto text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">{t('landing.contact.heading')}</h2>
            <p className="text-muted-foreground">{t('landing.contact.subheading')}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" /> contact@jawda.pro
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" /> +213 555 123 456
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> Alger, Algérie
              </div>
            </div>
            <Button asChild size="lg" className="mt-4">
              <Link to="/business">{t('landing.contact.cta')}</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Jawda Pro. {t('landing.footer.rights')}</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors">{t('landing.footer.privacy')}</a>
            <a href="#" className="hover:text-foreground transition-colors">{t('landing.footer.terms')}</a>
            <a href="#" className="hover:text-foreground transition-colors">{t('landing.footer.legal')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
