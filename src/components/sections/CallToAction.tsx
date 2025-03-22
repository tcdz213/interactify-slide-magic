import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
const CallToAction = () => {
  const {
    t
  } = useTranslation();
  return <section className="section-padding bg-muted/50">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-center bg-slate-800">
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">{t('callToAction.title')}</h2>
              <p className="text-muted-foreground mb-6">
                {t('callToAction.description')}
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5 mr-3">
                    <span className="text-sm font-medium">1</span>
                  </div>
                  <div>
                    <h3 className="text-base font-medium">{t('callToAction.steps.step1.title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('callToAction.steps.step1.description')}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5 mr-3">
                    <span className="text-sm font-medium">2</span>
                  </div>
                  <div>
                    <h3 className="text-base font-medium">{t('callToAction.steps.step2.title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('callToAction.steps.step2.description')}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5 mr-3">
                    <span className="text-sm font-medium">3</span>
                  </div>
                  <div>
                    <h3 className="text-base font-medium">{t('callToAction.steps.step3.title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('callToAction.steps.step3.description')}</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="rounded-lg group" asChild>
                  <Link to="/get-started">
                    <span>{t('callToAction.getStarted')}</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="rounded-lg" asChild>
                  <Link to="/for-training-centers">
                    <span>{t('callToAction.forTrainingCenters')}</span>
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block relative">
              <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" alt="People learning together in a training center" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-primary/20"></div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default CallToAction;