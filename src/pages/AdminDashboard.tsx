import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";
import {
  adminApi,
  type AdminUser,
  type AdminCard,
  type AdminReport,
  type AdminStats,
  type ReportsResponse,
} from "@/services/adminApi";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { VerificationReviewPanel } from "@/components/VerificationReviewPanel";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { DashboardTab } from "@/components/admin/DashboardTab";
import { UsersTab } from "@/components/admin/UsersTab";
import { CardsTab } from "@/components/admin/CardsTab";
import { PackagesTab } from "@/components/admin/PackagesTab";
import { DomainsTab } from "@/components/admin/DomainsTab";
import { ReportsTab } from "@/components/admin/ReportsTab";

const AdminDashboard = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [businessCards, setBusinessCards] = useState<AdminCard[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCards: 0,
    totalDomains: 0,
    totalReports: 0,
    activeUsers: 0,
    pendingReviews: 0,
    monthlyGrowth: 0,
    verifiedCards: 0,
    premiumUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [
        usersData,
        cardsData,
        reportsData,
        statsData,
        reviewsData,
        feedbackData,
        subscriptionsData,
      ] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getCards(),
        adminApi.getReports(),
        adminApi.getStats(),
        adminApi.getAllReviews().catch(() => []),
        adminApi.getAllFeedback().catch(() => []),
        adminApi.getAllSubscriptions().catch(() => []),
      ]);

      setUsers(usersData);
      setBusinessCards(cardsData);
      setReports(reportsData.reports);
      setReviews(reviewsData);
      setFeedback(feedbackData);
      setSubscriptions(subscriptionsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (adminLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getTabTitle = () => {
    const titles: Record<string, { title: string; description: string }> = {
      dashboard: {
        title: "Dashboard",
        description: "Platform overview and analytics",
      },
      users: {
        title: "Users Management",
        description: "Manage user accounts and permissions",
      },
      verifications: {
        title: "Verifications",
        description: "Review and approve verification requests",
      },
      "pro-accounts": {
        title: "Pro Accounts",
        description: "Manage premium user accounts",
      },
      cards: {
        title: "Cards Management",
        description: "View and manage business cards",
      },
      packages: {
        title: "Packages",
        description: "Create and manage subscription packages",
      },
      domains: {
        title: "Domains",
        description: "Manage domains and categories",
      },
      reviews: {
        title: "Reviews",
        description: "Monitor and moderate user reviews",
      },
      feedback: {
        title: "Feedback",
        description: "User feedback and suggestions",
      },
      subscriptions: {
        title: "Subscriptions",
        description: "Monitor subscription activity",
      },
      analytics: {
        title: "Analytics",
        description: "Platform metrics and insights",
      },
      reports: {
        title: "Reports",
        description: "Review and handle user reports",
      },
    };
    return titles[activeTab] || { title: "Admin Dashboard", description: "" };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content - Always account for sidebar */}
      <div className="ml-64">
        {/* Top Bar */}
        <AdminTopBar
          title={getTabTitle().title}
          description={getTabTitle().description}
        />

        {/* Content Area */}
        <main className=" min-h-screen">
          <div className="container mx-auto px-6 py-8">
            {/* Database Setup Warning */}
            {stats.totalUsers === 0 && (
              <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-600 dark:text-yellow-400">
                  <strong>Setup Required:</strong> Connect your API endpoints to
                  enable full admin functionality.
                </AlertDescription>
              </Alert>
            )}
            {/* Tab Content */}
            {activeTab === "dashboard" && (
              <DashboardTab stats={stats} loading={loading} />
            )}
            {activeTab === "users" && (
              <UsersTab users={users} onRefresh={loadDashboardData} />
            )}
            {activeTab === "verifications" && <VerificationReviewPanel />}
            {activeTab === "cards" && (
              <CardsTab cards={businessCards} onRefresh={loadDashboardData} />
            )}
            {activeTab === "packages" && <PackagesTab />}
            {activeTab === "pro-accounts" && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg font-medium mb-2">
                    Pro Accounts Management
                  </p>
                  <p className="text-sm">Coming soon...</p>
                </div>
              </div>
            )}
            {activeTab === "domains" && <DomainsTab />}
            {activeTab === "reviews" && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg font-medium mb-2">Reviews Management</p>
                  <p className="text-sm">Coming soon...</p>
                </div>
              </div>
            )}
            {activeTab === "feedback" && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg font-medium mb-2">
                    Feedback Management
                  </p>
                  <p className="text-sm">Coming soon...</p>
                </div>
              </div>
            )}
            {activeTab === "subscriptions" && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg font-medium mb-2">
                    Subscriptions Management
                  </p>
                  <p className="text-sm">Coming soon...</p>
                </div>
              </div>
            )}
            {activeTab === "analytics" && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg font-medium mb-2">
                    Analytics Dashboard
                  </p>
                  <p className="text-sm">Coming soon...</p>
                </div>
              </div>
            )}
            {activeTab === "reports" && <ReportsTab />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
