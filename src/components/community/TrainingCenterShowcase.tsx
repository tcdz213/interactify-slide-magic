
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Star, Users, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Center } from '@/types/center.types';
import { useWishlist } from '@/hooks/useWishlist';
import { useShareTracking } from '@/hooks/useShareTracking';

interface TrainingCenterShowcaseProps {
  centers: Center[];
}

const TrainingCenterShowcase = ({ centers }: TrainingCenterShowcaseProps) => {
  const { isFavorite, toggleFavoriteItem } = useWishlist();
  const { trackCourseShare } = useShareTracking();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Featured Training Centers
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/40">
          {centers.map((center) => (
            <div key={center.id} className="p-3 hover:bg-muted/50 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <Link 
                    to={`/center/${center.id}`}
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    {center.name}
                  </Link>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{center.location}</span>
                  </div>
                </div>
                <Badge variant={center.verified ? "default" : "outline"}>
                  {center.status}
                </Badge>
              </div>
              
              {center.description && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {center.description}
                </p>
              )}
              
              <div className="flex justify-between items-center mt-3">
                <div className="flex items-center gap-1 text-xs">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Members: 125</span>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={() => toggleFavoriteItem(center.id, center.name)}
                  >
                    <Star className={`h-4 w-4 ${isFavorite(center.id) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => trackCourseShare(center.id, 'community')}
                    asChild
                  >
                    <Link to={`/center/${center.id}`}>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainingCenterShowcase;
