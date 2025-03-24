
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Users, ArrowRight } from "lucide-react";
import SectionTitle from "./common/SectionTitle";
import { featuredCentersData } from "@/data/featuredCentersData";

const FeaturedCenters = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleViewDetails = (centerId: number) => {
    navigate(`/center/${centerId}`);
  };

  const handleViewAllCenters = () => {
    navigate("/discover");
  };

  return (
    <section 
      id="featured" 
      className="section-padding bg-muted/30"
      aria-labelledby="featured-centers-title"
    >
      <div className="container-custom">
        <SectionTitle
          title={t('centers.featuredTitle', 'Featured Training Centers')}
          description={t('centers.featuredDescription', 'Discover top-rated training centers that have been carefully selected based on quality, student satisfaction, and exceptional learning experiences.')}
        />

        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {featuredCentersData.tags.map((tag) => (
            <a
              key={tag}
              href={`/discover?category=${encodeURIComponent(tag)}`}
              className="text-sm px-3 py-1 rounded-full bg-background border border-border hover:bg-primary/5 hover:border-primary/30 transition-colors"
              aria-label={`View ${tag} training centers`}
            >
              {tag}
            </a>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {featuredCentersData.centers.map((center) => (
            <Card
              key={center.id}
              className="overflow-hidden border-0 rounded-xl shadow-sm hover-card-effect"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={center.image}
                  alt={center.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  loading="lazy"
                />
                {center.featured && (
                  <Badge className="absolute top-3 left-3 bg-primary text-white">
                    Featured
                  </Badge>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                  <Badge
                    variant="outline"
                    className="bg-black/40 text-white border-none backdrop-blur-sm"
                  >
                    {center.category}
                  </Badge>
                  <div className="flex items-center bg-black/40 text-white text-sm px-2 py-1 rounded-md backdrop-blur-sm">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                    <span>{center.rating}</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-2">{center.name}</h3>
                <div className="flex items-center text-muted-foreground text-sm mb-3">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>{center.location}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-3.5 w-3.5 mr-1" />
                    <span>{center.reviews} reviews</span>
                  </div>
                  <div className="text-primary font-medium">{center.price}</div>
                </div>
                <Button
                  variant="outline"
                  className="w-full group"
                  onClick={() => handleViewDetails(center.id)}
                  aria-label={`View details for ${center.name}`}
                >
                  <span>View Details</span>
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button
            size="lg"
            className="rounded-full px-8"
            onClick={handleViewAllCenters}
            aria-label="View all training centers"
          >
            View All Centers
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCenters;
