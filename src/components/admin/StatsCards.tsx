import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, FolderTree, Flag, TrendingUp } from "lucide-react";
import { AdminStats } from "@/services/adminApi";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  stats: AdminStats;
  loading: boolean;
}

export const StatsCards = ({ stats, loading }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-card border-border/50 hover:shadow-elegant transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Total Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-24 mb-2" />
          ) : (
            <>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="flex items-center space-x-1 text-xs text-success">
                <TrendingUp className="w-3 h-3" />
                <span>+{stats.monthlyGrowth}% this month</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border/50 hover:shadow-elegant transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Total Cards
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-24 mb-2" />
          ) : (
            <>
              <div className="text-2xl font-bold">{stats.totalCards}</div>
              <div className="text-xs text-muted-foreground">
                {stats.verifiedCards} verified
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border/50 hover:shadow-elegant transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <FolderTree className="w-4 h-4 mr-2" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <>
              <div className="text-2xl font-bold">{stats.totalDomains}</div>
              <div className="text-xs text-muted-foreground">
                Active domains
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border/50 hover:shadow-elegant transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <Flag className="w-4 h-4 mr-2" />
            Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-24 mb-2" />
          ) : (
            <>
              <div className="text-2xl font-bold text-destructive">{stats.totalReports}</div>
              <div className="text-xs text-muted-foreground">
                {stats.pendingReviews} pending review
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
