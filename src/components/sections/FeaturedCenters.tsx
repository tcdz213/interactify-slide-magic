import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Mock data for featured training centers
const centers = [
  {
    id: 1,
    name: "Elite Fitness Academy",
    category: "Fitness & Health",
    rating: 4.9,
    reviews: 128,
    location: "San Francisco, CA",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    price: "$45/session",
    featured: true,
  },
  {
    id: 2,
    name: "Tech Skills Institute",
    category: "Programming",
    rating: 4.8,
    reviews: 94,
    location: "Austin, TX",
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    price: "$299/course",
    featured: false,
  },
  {
    id: 3,
    name: "Global Language Center",
    category: "Language Learning",
    rating: 4.7,
    reviews: 112,
    location: "New York, NY",
    image:
      "https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    price: "$199/month",
    featured: false,
  },
  {
    id: 4,
    name: "Business Leadership Academy",
    category: "Professional Skills",
    rating: 4.9,
    reviews: 156,
    location: "Chicago, IL",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    price: "$399/program",
    featured: true,
  },
];

const FeaturedCenters = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleViewDetails = (centerId: number) => {
    navigate(`/center/${centerId}`);
  };

  return (
    <section id="featured" className="section-padding bg-muted/30">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Featured Training Centers
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Discover top-rated training centers that have been carefully
            selected based on quality, student satisfaction, and exceptional
            learning experiences.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {[
            "Fitness",
            "Business",
            "IT & Software",
            "Language",
            "Arts",
            "Professional Skills",
          ].map((tag) => (
            <a
              key={tag}
              href={`/discover?category=${encodeURIComponent(tag)}`}
              className="text-sm px-3 py-1 rounded-full bg-background border border-border hover:bg-primary/5 hover:border-primary/30 transition-colors"
            >
              {tag}
            </a>
          ))}
        </div>
        <br />
        <br />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {centers.map((center, index) => (
            <Card
              key={center.id}
              className="overflow-hidden border-0 rounded-xl shadow-sm hover-card-effect"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={center.image}
                  alt={center.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
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
                >
                  <span>View Details</span>
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-10">
          <br />

          <Button
            size="lg"
            className="rounded-full px-8"
            onClick={() => navigate("/discover")}
          >
            View All Centers
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCenters;
