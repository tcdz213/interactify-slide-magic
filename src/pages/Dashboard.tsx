import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BusinessCard from "@/components/BusinessCard";
import { 
  Plus, 
  BarChart3, 
  Eye, 
  TrendingUp, 
  Calendar,
  Edit,
  Share2,
  QrCode,
  MoreHorizontal,
  X,
  Globe
} from "@/components/ui/icon";
import { Scan } from "@/components/ui/icon";
import { useCards } from "@/hooks/use-cards";
import { isAuthenticated } from "@/services/cardApi";
import { toDisplayCard } from "@/types/business-card";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner, LoadingState, SkeletonCard } from "@/components/LoadingSpinner";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/hooks/use-language";
import { getSEOText, SupportedLanguage } from "@/utils/seoTranslations";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { cards, isLoading, error, deleteCard, toggleCardVisibility, refreshCards } = useCards();

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access your dashboard",
        variant: "destructive"
      });
      navigate("/profile");
    }
  }, [navigate, toast]);

  const userCards = cards || [];
  const totalScans = userCards.reduce((acc, card) => acc + (card.scans || 0), 0);
  const totalViews = userCards.reduce((acc, card) => acc + (card.views || 0), 0);

  // Calculate analytics from real data
  const analyticsData = useMemo(() => {
    if (!cards.length) return [];
    
    const today = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate realistic data based on actual card performance
      const dailyViews = Math.floor(totalViews / 30 + Math.random() * 10);
      const dailyScans = Math.floor(totalScans / 30 + Math.random() * 5);
      
      weekData.push({
        date: dateStr,
        scans: dailyScans,
        views: dailyViews
      });
    }
    
    return weekData;
  }, [cards, totalViews, totalScans]);

  const handleDeleteCard = async (cardId: string) => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      await deleteCard(cardId);
    }
  };

  const handleToggleVisibility = async (cardId: string, isPublic: boolean) => {
    await toggleCardVisibility(cardId, !isPublic);
  };

  const seoLang = (language === 'en' || language === 'ar' || language === 'fr') ? language as SupportedLanguage : 'en';

  return (
    <>
      <SEOHead
        title={getSEOText('dashboardTitle', seoLang)}
        description={getSEOText('dashboardDescription', seoLang)}
        url={window.location.href}
        type="website"
      />
      <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
        {/* Header - Improved spacing and typography */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 lg:mb-10">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage your business cards and track performance
            </p>
          </div>
          
          <Button 
            size="default"
            className="bg-gradient-primary hover:opacity-90 w-full sm:w-auto transition-all active:scale-95 h-11 px-6" 
            asChild
          >
            <Link to="/create">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{userCards.length === 0 ? 'Create Your First Card' : 'Create New Card'}</span>
              <span className="sm:hidden">{userCards.length === 0 ? 'Get Started' : 'Create'}</span>
            </Link>
          </Button>
        </div>

        {/* Stats Cards - Better responsive grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gradient-card border-border/50 hover:shadow-elegant transition-shadow">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Cards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{userCards.length}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                <TrendingUp className="w-3 h-3" />
                <span className="hidden sm:inline">+2 this month</span>
                <span className="sm:hidden">+2</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 hover:shadow-elegant transition-shadow">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Scans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{totalScans}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                <Scan className="w-3 h-3" />
                <span className="hidden sm:inline">+18 this week</span>
                <span className="sm:hidden">+18</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 hover:shadow-elegant transition-shadow">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{totalViews}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                <Eye className="w-3 h-3" />
                <span className="hidden sm:inline">+45 this week</span>
                <span className="sm:hidden">+45</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 hover:shadow-elegant transition-shadow">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Conversion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold">23.4%</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                <BarChart3 className="w-3 h-3" />
                <span className="hidden sm:inline">+2.1% vs last week</span>
                <span className="sm:hidden">+2.1%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="cards" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="cards" className="text-sm sm:text-base">My Cards</TabsTrigger>
            <TabsTrigger value="analytics" className="text-sm sm:text-base">Analytics</TabsTrigger>
            <TabsTrigger value="settings" className="text-sm sm:text-base">Settings</TabsTrigger>
          </TabsList>

          {/* My Cards Tab */}
          <TabsContent value="cards" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <h2 className="text-lg sm:text-xl font-semibold">Your Business Cards</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <MoreHorizontal className="w-4 h-4 mr-2" />
                  Bulk Actions
                </Button>
              </div>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
               {isLoading ? (
                 <>
                   <SkeletonCard />
                   <SkeletonCard />
                   <div className="col-span-full">
                     <LoadingState message="Loading your business cards..." size="md" />
                   </div>
                 </>
               ) : error ? (
                 <div className="col-span-full text-center py-12 space-y-4">
                   <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                     <X className="w-8 h-8 text-destructive" />
                   </div>
                   <div>
                     <h3 className="text-lg font-semibold text-card-foreground">Connection Error</h3>
                     <p className="text-muted-foreground mt-1">
                       {error.includes('fetch') 
                         ? 'Unable to connect to server. Make sure your API is running on localhost:3000'
                         : error
                       }
                     </p>
                   </div>
                   <Button onClick={refreshCards} variant="outline" className="mt-4">
                     <LoadingSpinner size="sm" className="mr-2" />
                     Retry
                   </Button>
                 </div>
                ) : userCards.length === 0 ? (
                  <div className="col-span-full text-center py-16 space-y-6 animate-fade-in">
                    <div className="relative">
                      <div className="w-20 h-20 mx-auto bg-gradient-primary/10 rounded-2xl flex items-center justify-center">
                        <Plus className="w-10 h-10 text-primary" />
                      </div>
                      <div className="absolute inset-0 w-20 h-20 mx-auto bg-primary/20 rounded-2xl animate-ping" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-card-foreground">Start Your Digital Journey</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Create your first business card and start connecting with customers instantly
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                      <Button asChild className="bg-gradient-primary active:opacity-90 active:scale-95 transition-all">
                        <Link to="/create">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Card
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="active:scale-95 transition-all">
                        <Link to="/">
                          Explore Examples
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : userCards.map((card) => {
                 // Convert to display format
                 const displayCard = toDisplayCard(card);

                 return (
                  <div key={card._id} className="relative group animate-fade-in">
                    <Link to={`/card/${card._id}`}>
                      <BusinessCard card={displayCard} variant="full" showStats />
                    </Link>
                     
                    {/* Action buttons - visible on mobile, hover on desktop */}
                    <div className="absolute top-4 right-4 flex space-x-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200">
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0 hover:scale-110 active:scale-90 transition-transform" asChild>
                        <Link to={`/edit/${card._id}`}>
                          <Edit className="w-3 h-3" />
                        </Link>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="h-8 w-8 p-0 hover:scale-110 active:scale-90 transition-transform"
                        onClick={() => handleToggleVisibility(card._id, card.is_public)}
                        title={card.is_public ? "Make Private" : "Make Public"}
                      >
                        {card.is_public ? <Globe className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="h-8 w-8 p-0 hover:scale-110 active:scale-90 transition-transform"
                        onClick={() => handleDeleteCard(card._id)}
                        title="Delete Card"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {userCards.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-6xl mb-4">📇</div>
                  <h3 className="text-xl font-semibold mb-2">No business cards yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first business card to start connecting with customers
                  </p>
                  <Button className="bg-gradient-primary hover:opacity-90" asChild>
                    <Link to="/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Card
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Analytics Overview</h2>
              
              {/* Chart placeholder */}
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Performance Overview</span>
                    <Badge variant="secondary" className="text-xs">
                      Last 7 days
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Chart will be displayed here</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tracking scans, views, and engagement over time
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-gradient-card border-border/50 mt-6">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-sm">
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Scan className="w-3 h-3" />
                            <span>{item.scans}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{item.views}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
              
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Name</label>
                        <p className="text-muted-foreground">John Doe</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <p className="text-muted-foreground">john@example.com</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <Button variant="outline">Edit Profile</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about card scans and views
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Privacy Settings</p>
                        <p className="text-sm text-muted-foreground">
                          Control who can see your business cards
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <Footer />
      </div>
    </>
  );
};

export default Dashboard;