import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  DollarSign, 
  Activity, 
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Building2,
  FolderKanban
} from 'lucide-react';
import { adminStatsApi } from '@/services/adminApi';
import type { AdminStats } from '@/types/admin';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [userGrowth, setUserGrowth] = useState<{ date: string; count: number }[]>([]);
  const [revenueData, setRevenueData] = useState<{ date: string; amount: number }[]>([]);
  const [planDistribution, setPlanDistribution] = useState<{ plan: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, growthRes, revenueRes, plansRes] = await Promise.all([
          adminStatsApi.getOverview(),
          adminStatsApi.getUserGrowth('month'),
          adminStatsApi.getRevenueStats('month'),
          adminStatsApi.getPlanDistribution(),
        ]);
        
        // Handle nested data.data structure from API
        const extractData = (res: any) => {
          if (res?.data?.data) return res.data.data;
          if (res?.data) return res.data;
          return res;
        };
        
        setStats(extractData(statsRes));
        setUserGrowth(Array.isArray(extractData(growthRes)) ? extractData(growthRes) : []);
        setRevenueData(Array.isArray(extractData(revenueRes)) ? extractData(revenueRes) : []);
        setPlanDistribution(Array.isArray(extractData(plansRes)) ? extractData(plansRes) : []);
      } catch (error) {
        // Use mock data for demo
        setStats({
          totalUsers: 12847,
          activeUsers: 8234,
          newUsersThisMonth: 423,
          totalRevenue: 284500,
          monthlyRevenue: 32400,
          activeSubscriptions: 1892,
          totalWorkspaces: 3421,
          totalProjects: 8945,
          openReports: 23,
          resolvedReports: 187,
        });
        setUserGrowth([
          { date: 'Week 1', count: 120 },
          { date: 'Week 2', count: 145 },
          { date: 'Week 3', count: 98 },
          { date: 'Week 4', count: 160 },
        ]);
        setRevenueData([
          { date: 'Week 1', amount: 7800 },
          { date: 'Week 2', amount: 8200 },
          { date: 'Week 3', amount: 7500 },
          { date: 'Week 4', amount: 8900 },
        ]);
        setPlanDistribution([
          { plan: 'Free', count: 8234 },
          { plan: 'Starter', count: 2341 },
          { plan: 'Pro', count: 1892 },
          { plan: 'Enterprise', count: 380 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers?.toLocaleString() || '0',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats?.monthlyRevenue?.toLocaleString() || '0'}`,
      change: '+8.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Active Subscriptions',
      value: stats?.activeSubscriptions?.toLocaleString() || '0',
      change: '+5.3%',
      trend: 'up',
      icon: Activity,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Open Reports',
      value: stats?.openReports?.toString() || '0',
      change: '-15%',
      trend: 'down',
      icon: MessageSquare,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  const additionalStats = [
    { label: 'Total Workspaces', value: stats?.totalWorkspaces?.toLocaleString() || '0', icon: Building2 },
    { label: 'Total Projects', value: stats?.totalProjects?.toLocaleString() || '0', icon: FolderKanban },
    { label: 'Active Users', value: stats?.activeUsers?.toLocaleString() || '0', icon: Users },
    { label: 'Resolved Reports', value: stats?.resolvedReports?.toString() || '0', icon: MessageSquare },
  ];

  if (loading) {
    return (
      <AdminLayout title="Dashboard" description="Platform overview and analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard" description="Platform overview and analytics">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-slate-900/50 border-slate-800/50 hover:border-slate-700/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs font-medium",
                    stat.trend === 'up' ? "text-emerald-400 border-emerald-400/30" : "text-red-400 border-red-400/30"
                  )}
                >
                  {stat.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {stat.change}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Growth Chart */}
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardHeader>
            <CardTitle className="text-slate-100 text-lg">User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardHeader>
            <CardTitle className="text-slate-100 text-lg">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="plan"
                >
                  {planDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {planDistribution.map((item, index) => (
                <div key={item.plan} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-slate-400">{item.plan}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <Card className="bg-slate-900/50 border-slate-800/50">
        <CardHeader>
          <CardTitle className="text-slate-100 text-lg">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {additionalStats.map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                <div className="flex items-center gap-3">
                  <stat.icon className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xl font-semibold text-slate-100">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
