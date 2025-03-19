
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { fetchCurrentUser } from "./redux/slices/authSlice";

import Index from "./pages/Index";
import Discover from "./pages/Discover";
import CenterDetails from "./pages/CenterDetails";
import ForTrainingCenters from "./pages/ForTrainingCenters";
import GetStarted from "./pages/GetStarted";
import Categories from "./pages/Categories";
import About from "./pages/About";
import Admin from "./pages/Admin";
import CenterOwnerDashboard from "./pages/CenterOwnerDashboard";
import TeacherJobPost from "./pages/TeacherJobPost";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import NotFound from "./pages/NotFound";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import { ROLES } from "./utils/roles";
import { Chatbot } from "./components/chatbot";
import Community from "./pages/Community";

// Import providers
import { CountryProvider } from "./contexts/CountryContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserRoleProvider } from "./contexts/UserRoleContext";
import TeacherProfileManagement from "./pages/TeacherProfileManagement";
import TeacherJobListings from "./pages/TeacherJobListings";
import LearnerProfilePage from "./pages/LearnerProfile";

// AppContent component to handle auth state persistence
const AppContent = () => {
  const dispatch = useAppDispatch();
  const { isSessionPersisted, user } = useAppSelector(state => state.auth);
  const location = useLocation();
  
  // On initial load or route change, check auth state
  useEffect(() => {
    if (isSessionPersisted && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isSessionPersisted, user]);
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/center/:id" element={<CenterDetails />} />
      <Route path="/for-training-centers" element={<ForTrainingCenters />} />
      <Route path="/get-started" element={<GetStarted />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/about" element={<About />} />
      <Route path="/teacher-job-post" element={<TeacherJobPost />} />
      <Route path="/teacher-job-listings" element={<TeacherJobListings />} />
      <Route path="/teacher-profile" element={<TeacherProfileManagement />} />
      <Route path="/community" element={<Community />} />
      <Route path="/community/user/:userId" element={<Community />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route 
        path="/admin" 
        element={
          <RoleProtectedRoute
            allowedRoles={[
              ROLES.PLATFORM_ADMIN,
              ROLES.CENTER_OWNER,
              ROLES.CONTENT_MODERATOR,
              ROLES.ADVERTISER,
              ROLES.SUPPORT_AGENT,
              ROLES.TECHNICAL_OWNER
            ]}
            fallbackPath="/"
            redirectToLogin={true}
          >
            <Admin />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/center-owner-dashboard" 
        element={
          <RoleProtectedRoute
            allowedRoles={[ROLES.CENTER_OWNER, ROLES.PLATFORM_ADMIN]}
            fallbackPath="/"
            redirectToLogin={true}
          >
            <CenterOwnerDashboard />
          </RoleProtectedRoute>
        } 
      />
      <Route 
        path="/learner-profile" 
        element={
          <RoleProtectedRoute
            allowedRoles={[ROLES.LEARNER, ROLES.PLATFORM_ADMIN]}
            fallbackPath="/"
            redirectToLogin={true}
          >
            <LearnerProfilePage />
          </RoleProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const queryClient = new QueryClient();

const App = () => {
  return (
    <CountryProvider>
      <ThemeProvider>
        <UserRoleProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <AppContent />
              <Chatbot />
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </QueryClientProvider>
        </UserRoleProvider>
      </ThemeProvider>
    </CountryProvider>
  );
};

export default App;
