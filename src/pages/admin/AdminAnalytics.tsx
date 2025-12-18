import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminStatsApi } from '@/services/adminApi';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'];

export default function AdminAnalytics() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [userGrowth, setUserGrowth] = useState<{ date: string; count: number }[]>([]);
  const [revenueData, setRevenueData] = useState<{ date: string; amount: number }[]>([]);
  const [planDistribution, setPlanDistribution] = useState<{ plan: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [growthRes, revenueRes, plansRes] = await Promise.all([
          adminStatsApi.getUserGrowth(period),
          adminStatsApi.getRevenueStats(period),
          adminStatsApi.getPlanDistribution(),
        ]);
        setUserGrowth(growthRes.data);
        setRevenueData(revenueRes.data);
        setPlanDistribution(plansRes.data);
      } catch (error) {
        // Use mock data for demo
        if (period === 'week') {
          setUserGrowth([
            { date: 'Mon', count: 45 },
            { date: 'Tue', count: 52 },
            { date: 'Wed', count: 38 },
            { date: 'Thu', count: 65 },
            { date: 'Fri', count: 78 },
            { date: 'Sat', count: 32 },
            { date: 'Sun', count: 28 },
          ]);
          setRevenueData([
            { date: 'Mon', amount: 2400 },
            { date: 'Tue', amount: 1398 },
            { date: 'Wed', amount: 9800 },
            { date: 'Thu', amount: 3908 },
            { date: 'Fri', amount: 4800 },
            { date: 'Sat', amount: 3800 },
            { date: 'Sun', amount: 4300 },
          ]);
        } else if (period === 'month') {
          setUserGrowth([
            { date: 'Week 1', count: 320 },
            { date: 'Week 2', count: 445 },
            { date: 'Week 3', count: 398 },
            { date: 'Week 4', count: 523 },
          ]);
          setRevenueData([
            { date: 'Week 1', amount: 12400 },
            { date: 'Week 2', amount: 15398 },
            { date: 'Week 3', amount: 11800 },
            { date: 'Week 4', amount: 18908 },
          ]);
        } else {
          setUserGrowth([
            { date: 'Jan', count: 1200 },
            { date: 'Feb', count: 1900 },
            { date: 'Mar', count: 2400 },
            { date: 'Apr', count: 2800 },
            { date: 'May', count: 3100 },
            { date: 'Jun', count: 3800 },
            { date: 'Jul', count: 4200 },
            { date: 'Aug', count: 4800 },
            { date: 'Sep', count: 5200 },
            { date: 'Oct', count: 5900 },
            { date: 'Nov', count: 6500 },
            { date: 'Dec', count: 7200 },
          ]);
          setRevenueData([
            { date: 'Jan', amount: 24000 },
            { date: 'Feb', amount: 28000 },
            { date: 'Mar', amount: 32000 },
            { date: 'Apr', amount: 35000 },
            { date: 'May', amount: 42000 },
            { date: 'Jun', amount: 48000 },
            { date: 'Jul', amount: 52000 },
            { date: 'Aug', amount: 58000 },
            { date: 'Sep', amount: 62000 },
            { date: 'Oct', amount: 68000 },
            { date: 'Nov', amount: 75000 },
            { date: 'Dec', amount: 82000 },
          ]);
        }
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
  }, [period]);

  // Calculate some derived metrics
  const totalUsers = userGrowth.reduce((sum, d) => sum + d.count, 0);
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.amount, 0);
  const avgRevenue = revenueData.length ? Math.round(totalRevenue / revenueData.length) : 0;

  if (loading) {
    return (
      <AdminLayout title="Analytics" description="Platform analytics and insights">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics" description="Platform analytics and insights">
      {/* Period Selector */}
      <div className="flex justify-end mb-6">
        <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <SelectTrigger className="w-[150px] bg-slate-800/50 border-slate-700/50 text-slate-100">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardContent className="p-6">
            <p className="text-sm text-slate-400">New Users ({period})</p>
            <p className="text-3xl font-bold text-slate-100 mt-2">{totalUsers.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardContent className="p-6">
            <p className="text-sm text-slate-400">Total Revenue ({period})</p>
            <p className="text-3xl font-bold text-emerald-400 mt-2">${totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardContent className="p-6">
            <p className="text-sm text-slate-400">Avg. Revenue / Period</p>
            <p className="text-3xl font-bold text-amber-400 mt-2">${avgRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Growth Area Chart */}
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardHeader>
            <CardTitle className="text-slate-100 text-lg">User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowth}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Bar Chart */}
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardHeader>
            <CardTitle className="text-slate-100 text-lg">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
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
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      <Card className="bg-slate-900/50 border-slate-800/50">
        <CardHeader>
          <CardTitle className="text-slate-100 text-lg">Plan Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="w-full lg:w-1/2">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
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
            </div>
            <div className="w-full lg:w-1/2 space-y-4">
              {planDistribution.map((item, index) => (
                <div key={item.plan} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-slate-100 font-medium">{item.plan}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-100 font-semibold">{item.count.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">
                      {((item.count / planDistribution.reduce((a, b) => a + b.count, 0)) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
