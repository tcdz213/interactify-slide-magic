import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { LanguageProvider } from "@/hooks/use-language";
import { AuthProvider } from "@/hooks/use-auth";
import ErrorBoundary from "@/components/ErrorBoundary";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import BottomNavigation from "@/components/BottomNavigation";
import { SEOFooterTicker } from "@/components/SEOFooterTicker";
import { AnimatedLoading } from "@/components/AnimatedLoading";
import { SplashScreen } from "@/components/SplashScreen";
import { usePageTransition } from "@/hooks/use-page-transition";
import { useAppLoading } from "@/hooks/use-app-loading";
import Index from "@/pages/Index";

// Lazy load pages for better performance
const Home = lazy(() => import("@/pages/Home"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const CardDetail = lazy(() => import("@/pages/CardDetail"));
const CreateCard = lazy(() => import("@/pages/CreateCard"));
const EditCard = lazy(() => import("@/pages/EditCard"));
const Profile = lazy(() => import("@/pages/Profile"));
const Favorites = lazy(() => import("@/pages/Favorites"));
const Messages = lazy(() => import("@/pages/Messages"));
const Packages = lazy(() => import("@/pages/Packages"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const AppContent = () => {
  const isAppLoading = useAppLoading(800);
  const isTransitioning = usePageTransition(200);
  
  return (
    <>
      <SplashScreen isVisible={isAppLoading || isTransitioning} />
      <OfflineIndicator />
      <div className="min-h-screen bg-background overflow-hidden flex flex-col">
        <main className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
          <div className={`transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <ErrorBoundary>
              <Suspense fallback={
                <div className="flex justify-center items-center min-h-screen">
                  <AnimatedLoading size={80} />
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/card/:id" element={<CardDetail />} />
                  <Route path="/create" element={<CreateCard />} />
                  <Route path="/edit/:id" element={<EditCard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/packages" element={<Packages />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
        <SEOFooterTicker />
        <BottomNavigation />
      </div>
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="spotycard-theme">
        <LanguageProvider defaultLanguage="en" storageKey="spotycard-language">
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
