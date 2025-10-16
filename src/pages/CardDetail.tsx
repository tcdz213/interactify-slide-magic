import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BusinessCard from "@/components/BusinessCard";
import { BackButton } from "@/components/BackButton";
import { ArrowLeft, MapPin, Phone, Mail, Globe, Clock, Star, MessageCircle } from "@/components/ui/icon";
import { domains } from "@/data/domains";
import { businessApi } from "@/services/businessApi";
import { cardApi } from "@/services/cardApi";
import { BusinessCardDisplay, toDisplayCard } from "@/types/business-card";
import { toast } from "@/hooks/use-toast";
import { errorHandler } from "@/utils/errorHandler";
import { ReportModal } from "@/components/ReportModal";
import { FeedbackModal } from "@/components/FeedbackModal";
import { ExportCardMenu } from "@/components/ExportCardMenu";
import { subscriptionApi } from "@/services/subscriptionApi";
import { SocialShare } from "@/components/SocialShare";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/Footer";
import { ReviewsList } from "@/components/reviews/ReviewsList";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { reviewsApi, CreateReviewData } from "@/services/reviewsApi";
import { messagingApi } from "@/services/messagingApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { getDomainIcon } from "@/utils/categoryIcons";
import StaticMapView from "@/components/StaticMapView";
import { CardRecommendations } from "@/components/CardRecommendations";

const CardDetail = () => {
  const { id } = useParams();
  const [card, setCard] = useState<BusinessCardDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const currentUserId = localStorage.getItem('userId');
  const { t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    const loadCard = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        let businessCard: BusinessCardDisplay;
        
        // First try to fetch as user's own card (authenticated endpoint)
        try {
          const userCard = await cardApi.getCard(id);
          businessCard = toDisplayCard(userCard);
        } catch (authError) {
          // If auth fails, try public business endpoint
          businessCard = await businessApi.getBusinessById(id);
        }
        
        setCard(businessCard);
        
        // Record view only for public cards
        if (!businessCard.user_id || businessCard.user_id !== currentUserId) {
          await businessApi.recordView(businessCard._id, 'direct_link');
        }
        
        // Check pro status
        const proStatus = await subscriptionApi.checkProStatus();
        setIsPro(proStatus);
      } catch (error) {
        console.error('Failed to load card:', error);
        setError('Failed to load business card');
      } finally {
        setLoading(false);
      }
    };

    loadCard();
  }, [id, currentUserId]);

  const handleSubmitReview = async (reviewData: Omit<CreateReviewData, 'business_id'>) => {
    if (!id) return;
    
    try {
      await reviewsApi.createReview({
        business_id: id,
        ...reviewData
      });
      setShowReviewForm(false);
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const handleStartConversation = async () => {
    if (!id || !currentUserId) {
      errorHandler.showApiError('startConversation', t('sign_in_to_message'));
      return;
    }

    try {
      const conversation = await messagingApi.createConversation({
        business_id: id
      });
      window.location.href = `/messages?conversation=${conversation.id}`;
    } catch (error) {
      // Error already handled by messagingApi
      errorHandler.logError('CardDetail.handleStartConversation', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">{t('loading_business_card')}</p>
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-8">
            <div className="text-4xl mb-4">😔</div>
            <h2 className="text-lg font-semibold mb-2">Card Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The business card you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Search
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const domain = domains.find(d => d.key === card.domain_key);
  const subdomain = domain?.subcategories.find(s => s.key === card.subdomain_key || s.fr === card.subdomain_key || s.ar === card.subdomain_key);

  // Card is already in display format from businessApi

  return (
    <>
      <SEOHead
        title={`${card.title} - ${card.description}`}
        description={card.description || `Connect with ${card.title}`}
        url={window.location.href}
        type="profile"
      />
      <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-lg border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <BackButton fallbackPath="/dashboard" label={card.user_id ? "My Cards" : "Explore"} />
          
          <div className="flex items-center space-x-2">
            <SocialShare
              cardId={card._id}
              cardTitle={card.title}
              cardDescription={card.description}
            />
            <ExportCardMenu 
              card={card} 
              isPro={isPro}
              variant="ghost"
              size="sm"
            />
            <ReportModal cardId={card._id} cardTitle={card.title} />
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 lg:px-6 py-6 max-w-2xl">
        {/* Main Business Card */}
        <div className="mb-6">
          <BusinessCard card={card} variant="full" showStats={false} />
        </div>

        {/* Additional Details */}
        <div className="space-y-4">
          {/* Description */}
          {card.description && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Category Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {domain && getDomainIcon(domain.key)}
                </div>
                <div>
                  <p className="font-medium">{domain?.fr || card.domain_key}</p>
                  <p className="text-sm text-muted-foreground">{subdomain?.fr || card.subdomain_key}</p>
                </div>
              </div>
              
              {card.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {card.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Actions */}
          <div className="grid grid-cols-2 gap-3">
            {card.mobile_phones?.[0] && (
              <Button className="flex-1" asChild>
                 <a href={`tel:${card.mobile_phones[0]}`}>
                  <Phone className="w-4 h-4 mr-2" />
                  {t('call')}
                </a>
              </Button>
            )}
            
            {card.social_links?.whatsapp && (
              <Button variant="outline" className="flex-1" asChild>
                <a href={`https://wa.me/${card.social_links.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </a>
              </Button>
            )}
          </div>

          {/* Performance Stats */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Performance</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{card.views}</div>
                  <div className="text-xs text-muted-foreground">{t('total_views')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{card.scans}</div>
                  <div className="text-xs text-muted-foreground">QR Scans</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          {(card.address || (card.location?.lat && card.location?.lng)) && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3 mb-4">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Location</h3>
                    {card.address && (
                      <p className="text-sm text-muted-foreground">{card.address}</p>
                    )}
                  </div>
                </div>
                
                {card.location?.lat && card.location?.lng && (
                  <div className="mb-3">
                    <StaticMapView
                      latitude={card.location.lat}
                      longitude={card.location.lng}
                      title={card.title}
                      address={card.address}
                    />
                  </div>
                )}
                
                {card.address && (
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a 
                      href={`https://maps.google.com/?q=${card.location?.lat && card.location?.lng ? `${card.location.lat},${card.location.lng}` : encodeURIComponent(card.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Open in Google Maps
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Working Hours */}
          {card.work_hours && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Working Hours</h3>
                    <p className="text-sm text-muted-foreground">{card.work_hours}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Languages */}
          {card.languages && card.languages.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {card.languages.map((language, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {language}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Details (if additional phones/fax) */}
          {(card.landline_phones?.length > 0 || card.fax_numbers?.length > 0 || card.email || card.website) && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Contact Details</h3>
                <div className="space-y-2 text-sm">
                  {card.landline_phones?.map((phone, index) => (
                    <div key={`landline-${index}`} className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{phone}</span>
                      <Badge variant="outline" className="text-xs">Landline</Badge>
                    </div>
                  ))}
                  {card.fax_numbers?.map((fax, index) => (
                    <div key={`fax-${index}`} className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{fax}</span>
                      <Badge variant="outline" className="text-xs">Fax</Badge>
                    </div>
                  ))}
                  {card.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${card.email}`} className="hover:underline">{card.email}</a>
                    </div>
                  )}
                  {card.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <a href={card.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {card.website}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message Business Button */}
          {!card.user_id && currentUserId && (
            <Button 
              onClick={handleStartConversation}
              className="w-full"
              variant="outline"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message Business
            </Button>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mt-8 space-y-6">
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="reviews" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="write">Write Review</TabsTrigger>
                </TabsList>

                <TabsContent value="reviews" className="mt-6">
                  <ReviewsList
                    businessId={id || ''}
                    currentUserId={currentUserId || undefined}
                    onEditReview={() => setShowReviewForm(true)}
                  />
                </TabsContent>

                <TabsContent value="write" className="mt-6">
                  {currentUserId ? (
                    <ReviewForm
                      businessId={id || ''}
                      onSubmit={handleSubmitReview}
                      submitLabel="Post Review"
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Sign in to write a review
                      </p>
                      <Button asChild>
                        <Link to="/profile">Sign In</Link>
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <div className="mt-8">
          <CardRecommendations 
            currentCardId={card._id}
            domainKey={card.domain_key}
            subdomainKey={card.subdomain_key}
          />
        </div>

        {/* Feedback */}
        <div className="mt-8 text-center">
          <FeedbackModal cardId={card._id} cardTitle={card.title} />
        </div>

        {/* Context-aware CTA */}
        {user && card.user_id === user.id && (
          <div className="mt-6 p-4 bg-gradient-card rounded-lg border border-border/50 animate-fade-in">
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">Want to make changes?</p>
              <Button variant="outline" size="sm" asChild className="active:scale-95 transition-all">
                <Link to={`/edit/${card._id}`}>
                  Edit This Card
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
    </>
  );
};

export default CardDetail;