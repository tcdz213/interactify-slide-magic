import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Features from "./pages/Features";
import Sprints from "./pages/Sprints";
import Tasks from "./pages/Tasks";
import TaskDetail from "./pages/TaskDetail";
import Bugs from "./pages/Bugs";
import BugDetail from "./pages/BugDetail";
import ApiDocs from "./pages/ApiDocs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/features"
              element={
                <ProtectedRoute>
                  <Features />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/sprints"
              element={
                <ProtectedRoute>
                  <Sprints />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/tasks"
              element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/tasks/:id"
              element={
                <ProtectedRoute>
                  <TaskDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/bugs"
              element={
                <ProtectedRoute>
                  <Bugs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/bugs/:id"
              element={
                <ProtectedRoute>
                  <BugDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/api-docs"
              element={
                <ProtectedRoute>
                  <ApiDocs />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
