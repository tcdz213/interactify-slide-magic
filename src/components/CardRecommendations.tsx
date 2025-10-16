import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import BusinessCard from "@/components/BusinessCard";
import { businessApi, BusinessCardDisplay } from "@/services/businessApi";
import { AnimatedLoading } from "@/components/AnimatedLoading";
import { useNavigate } from "react-router-dom";

interface CardRecommendationsProps {
  currentCardId: string;
  domainKey: string;
  subdomainKey?: string | string[];
}

export const CardRecommendations = ({ 
  currentCardId, 
  domainKey, 
  subdomainKey 
}: CardRecommendationsProps) => {
  const [similar, setSimilar] = useState<BusinessCardDisplay[]>([]);
  const [featured, setFeatured] = useState<BusinessCardDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true);
      try {
        // Normalize subdomain to string or undefined
        const normalizedSubdomain = Array.isArray(subdomainKey) 
          ? subdomainKey[0] 
          : subdomainKey;
        
        // Fetch similar professionals (same domain/subdomain)
        const similarData = await businessApi.searchBusinesses({
          domain: domainKey,
          subdomain: normalizedSubdomain,
          sort_by: 'popular',
          limit: 6
        });
        
        // Filter out current card
        const filteredSimilar = similarData.businesses.filter(
          b => b._id !== currentCardId
        ).slice(0, 4);
        
        setSimilar(filteredSimilar);

        // Fetch featured professionals (verified + popular in domain)
        const featuredData = await businessApi.searchBusinesses({
          domain: domainKey,
          verified: true,
          sort_by: 'popular',
          limit: 6
        });
        
        const filteredFeatured = featuredData.businesses.filter(
          b => b._id !== currentCardId
        ).slice(0, 4);
        
        setFeatured(filteredFeatured);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [currentCardId, domainKey, subdomainKey]);

  const handleCardClick = async (card: BusinessCardDisplay) => {
    await businessApi.recordView(card._id, 'recommendation');
    navigate(`/card/${card._id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <AnimatedLoading size={60} />
      </div>
    );
  }

  if (similar.length === 0 && featured.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Similar Professionals */}
      {similar.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Similar Professionals</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {similar.map((card) => (
                <div
                  key={card._id}
                  onClick={() => handleCardClick(card)}
                  className="cursor-pointer hover:scale-[1.02] transition-transform"
                >
                  <BusinessCard card={card} variant="compact" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Featured Professionals */}
      {featured.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Featured Professionals</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featured.map((card) => (
                <div
                  key={card._id}
                  onClick={() => handleCardClick(card)}
                  className="cursor-pointer hover:scale-[1.02] transition-transform"
                >
                  <BusinessCard card={card} variant="compact" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
