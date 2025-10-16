import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon, Icons, IconName } from '@/components/ui/icon';

const IconShowcase: React.FC = () => {
  const iconCategories = [
    {
      name: 'Navigation',
      icons: ['home', 'search', 'plus', 'user', 'barChart', 'qrCode'] as IconName[],
      color: 'text-blue-500',
    },
    {
      name: 'Actions',
      icons: ['close', 'check', 'arrowLeft', 'arrowRight', 'eye', 'save', 'edit'] as IconName[],
      color: 'text-green-500',
    },
    {
      name: 'Communication',
      icons: ['phone', 'mail', 'message', 'share', 'calendar', 'globe'] as IconName[],
      color: 'text-purple-500',
    },
    {
      name: 'Interface',
      icons: ['filter', 'heart', 'star', 'settings', 'menu', 'moreHorizontal'] as IconName[],
      color: 'text-orange-500',
    },
    {
      name: 'Analytics',
      icons: ['trendingUp', 'users', 'zap', 'slidersHorizontal'] as IconName[],
      color: 'text-cyan-500',
    },
    {
      name: 'Social Media',
      icons: ['youtube', 'twitter', 'instagram', 'facebook'] as IconName[],
      color: 'text-pink-500',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          React Icons Library
        </h1>
        <p className="text-muted-foreground">
          Enhanced icon system with better performance and variety
        </p>
        <Badge variant="secondary" className="mt-2">
          Tree-shakable • Optimized • Consistent
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {iconCategories.map((category) => (
          <Card key={category.name} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className={`text-lg ${category.color}`}>
                {category.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {category.icons.map((iconName) => (
                  <div
                    key={String(iconName)}
                    className="flex flex-col items-center p-3 rounded-lg hover:bg-accent transition-colors group"
                  >
                    <Icon
                      name={iconName}
                      className={`w-6 h-6 mb-2 ${category.color} group-hover:scale-110 transition-transform`}
                    />
                    <span className="text-xs text-center text-muted-foreground">
                      {String(iconName)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Icon Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-accent/50">
              <Icon name="zap" className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <h3 className="font-semibold">Performance</h3>
              <p className="text-sm text-muted-foreground">Tree-shaking reduces bundle size</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-accent/50">
              <Icon name="sparkles" className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <h3 className="font-semibold">Variety</h3>
              <p className="text-sm text-muted-foreground">Thousands of icons available</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-accent/50">
              <Icon name="checkCircle" className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold">Consistency</h3>
              <p className="text-sm text-muted-foreground">Unified design system</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IconShowcase;