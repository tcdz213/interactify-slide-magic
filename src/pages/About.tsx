
import React from "react";
import Header from "@/components/Header";
import Sponsors from "@/components/Sponsors";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mt-24">
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-6">{t('about.title')}</h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t('about.subtitle')}
            </p>
            
            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-semibold mb-4">{t('about.mission.title')}</h2>
                <p className="text-muted-foreground">
                  {t('about.mission.content')}
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4">{t('about.story.title')}</h2>
                <p className="text-muted-foreground mb-4">
                  {t('about.story.part1')}
                </p>
                <p className="text-muted-foreground">
                  {t('about.story.part2')}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-primary/5 p-6 rounded-lg">
                  <h3 className="text-xl font-medium mb-3">{t('about.forLearners.title')}</h3>
                  <p className="text-muted-foreground">
                    {t('about.forLearners.content')}
                  </p>
                </div>
                
                <div className="bg-primary/5 p-6 rounded-lg">
                  <h3 className="text-xl font-medium mb-3">{t('about.forCenters.title')}</h3>
                  <p className="text-muted-foreground">
                    {t('about.forCenters.content')}
                  </p>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4">{t('about.values.title')}</h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 mt-1">1</div>
                    <div>
                      <h3 className="font-medium">{t('about.values.quality.title')}</h3>
                      <p className="text-muted-foreground">{t('about.values.quality.content')}</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 mt-1">2</div>
                    <div>
                      <h3 className="font-medium">{t('about.values.accessibility.title')}</h3>
                      <p className="text-muted-foreground">{t('about.values.accessibility.content')}</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 mt-1">3</div>
                    <div>
                      <h3 className="font-medium">{t('about.values.transparency.title')}</h3>
                      <p className="text-muted-foreground">{t('about.values.transparency.content')}</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 mt-1">4</div>
                    <div>
                      <h3 className="font-medium">{t('about.values.innovation.title')}</h3>
                      <p className="text-muted-foreground">{t('about.values.innovation.content')}</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4">{t('about.team.title')}</h2>
                <p className="text-muted-foreground mb-6">
                  {t('about.team.content')}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="text-center">
                      <div className="aspect-square rounded-full bg-muted mb-3 overflow-hidden">
                        <img
                          src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${20 + i}.jpg`}
                          alt="Team member"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="font-medium">Team Member {i}</h4>
                      <p className="text-sm text-muted-foreground">Position</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Sponsors />
      <Footer />
    </div>
  );
};

export default About;
