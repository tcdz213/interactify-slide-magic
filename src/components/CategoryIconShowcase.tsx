import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDomainIcon, getDomainIconName, getDomainColor } from '@/utils/categoryIcons';
import { Icon } from '@/components/ui/icon';

const CategoryIconShowcase: React.FC = () => {
  const categories = [
    { key: 'healthcare', name: 'Healthcare' },
    { key: 'beauty_personal_care', name: 'Beauty & Personal Care' },
    { key: 'food_beverage', name: 'Food & Beverage' },
    { key: 'auto_services', name: 'Auto Services' },
    { key: 'it_software_services', name: 'IT & Software Services' },
    { key: 'education_training', name: 'Education & Training' },
    { key: 'professional_services', name: 'Professional Services' },
    { key: 'home_services', name: 'Home Services' },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Category Icons with React Icon Library
        </h1>
        <p className="text-muted-foreground">
          Updated category system with consistent icon design
        </p>
        <Badge variant="secondary" className="mt-2">
          React Icons • Consistent • Scalable
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Card key={category.key} className="hover:shadow-lg transition-all hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-3 ${getDomainColor(category.key)}`}>
                <div className="text-2xl">
                  {getDomainIcon(category.key)}
                </div>
              </div>
              <CardTitle className="text-lg">{category.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Badge variant="outline" className="text-xs">
                {String(getDomainIconName(category.key))}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Icon Usage Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-accent/50 rounded-lg">
              <div className="text-xl">{getDomainIcon('healthcare')}</div>
              <div>
                <h3 className="font-semibold">Healthcare Services</h3>
                <p className="text-sm text-muted-foreground">Medical, dental, therapy services</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-accent/50 rounded-lg">
              <div className="text-xl">{getDomainIcon('it_software_services')}</div>
              <div>
                <h3 className="font-semibold">IT & Software</h3>
                <p className="text-sm text-muted-foreground">Development, consulting, tech support</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-accent/50 rounded-lg">
              <div className="text-xl">{getDomainIcon('food_beverage')}</div>
              <div>
                <h3 className="font-semibold">Food & Beverage</h3>
                <p className="text-sm text-muted-foreground">Restaurants, catering, food delivery</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="checkCircle" className="w-5 h-5 text-green-500" />
            Migration Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-background/50">
              <Icon name="zap" className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <h3 className="font-semibold">Performance</h3>
              <p className="text-sm text-muted-foreground">Replaced emoji with optimized icons</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-background/50">
              <Icon name="star" className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <h3 className="font-semibold">Consistency</h3>
              <p className="text-sm text-muted-foreground">Unified design across all categories</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-background/50">
              <Icon name="settings" className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-semibold">Scalability</h3>
              <p className="text-sm text-muted-foreground">Easy to add new categories</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryIconShowcase;