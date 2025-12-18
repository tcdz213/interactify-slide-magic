import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, MoreVertical, CreditCard, XCircle, RotateCcw, ArrowUpCircle } from 'lucide-react';
import { adminBillingApi } from '@/services/adminApi';
import type { AdminBillingRecord, PaginatedResponse } from '@/types/admin';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { format } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  past_due: 'bg-red-500/10 text-red-400 border-red-500/30',
  canceled: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  trialing: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
};

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  starter: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  pro: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  enterprise: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
};

const PLANS = ['free', 'starter', 'pro', 'enterprise'] as const;

export default function AdminBilling() {
  const [records, setRecords] = useState<AdminBillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (planFilter !== 'all') params.plan = planFilter;
      
      const response: PaginatedResponse<AdminBillingRecord> = await adminBillingApi.list(params);
      setRecords(response.data);
      setPagination(response.pagination);
    } catch (error) {
      // Mock data for demo
      setRecords([
        {
          id: '1',
          userId: 'u1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          workspaceId: 'ws-1',
          workspaceName: 'Acme Corp',
          plan: 'pro',
          status: 'active',
          amount: 49,
          currency: 'USD',
          billingCycle: 'monthly',
          nextBillingDate: '2024-02-15T00:00:00Z',
          createdAt: '2023-06-15T10:30:00Z',
        },
        {
          id: '2',
          userId: 'u2',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          workspaceId: 'ws-2',
          workspaceName: 'Tech Startup',
          plan: 'enterprise',
          status: 'active',
          amount: 199,
          currency: 'USD',
          billingCycle: 'yearly',
          nextBillingDate: '2024-08-20T00:00:00Z',
          createdAt: '2023-08-20T14:00:00Z',
        },
        {
          id: '3',
          userId: 'u3',
          userName: 'Bob Wilson',
          userEmail: 'bob@example.com',
          workspaceId: 'ws-3',
          workspaceName: 'Design Agency',
          plan: 'starter',
          status: 'past_due',
          amount: 19,
          currency: 'USD',
          billingCycle: 'monthly',
          nextBillingDate: '2024-01-01T00:00:00Z',
          createdAt: '2023-12-01T09:00:00Z',
        },
      ]);
      setPagination({
        total: 85,
        totalPages: 5,
        hasNext: true,
        hasPrev: page > 1,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [search, statusFilter, planFilter, page, limit]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, planFilter]);

  const handleCancelSubscription = async (id: string) => {
    try {
      await adminBillingApi.cancelSubscription(id);
      toast.success('Subscription canceled');
      fetchRecords();
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  const handleRefund = async (id: string) => {
    try {
      await adminBillingApi.refund(id, 0); // Full refund
      toast.success('Refund processed');
      fetchRecords();
    } catch (error) {
      toast.error('Failed to process refund');
    }
  };

  const handleChangePlan = async (id: string, plan: string) => {
    try {
      await adminBillingApi.updatePlan(id, plan);
      toast.success('Plan updated');
      fetchRecords();
    } catch (error) {
      toast.error('Failed to update plan');
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <AdminLayout title="Billing" description="Manage subscriptions and payments">
      {/* Filters */}
      <Card className="bg-slate-900/50 border-slate-800/50 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search by user or workspace..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-slate-800/50 border-slate-700/50 text-slate-100">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="trialing">Trialing</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[150px] bg-slate-800/50 border-slate-700/50 text-slate-100">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Billing Table */}
      <Card className="bg-slate-900/50 border-slate-800/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800/50 hover:bg-transparent">
                    <TableHead className="text-slate-400">User</TableHead>
                    <TableHead className="text-slate-400">Workspace</TableHead>
                    <TableHead className="text-slate-400">Plan</TableHead>
                    <TableHead className="text-slate-400">Amount</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Next Billing</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id} className="border-slate-800/50 hover:bg-slate-800/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-100">{record.userName}</p>
                          <p className="text-sm text-slate-500">{record.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400">{record.workspaceName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(PLAN_COLORS[record.plan])}>
                          {record.plan}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-100 font-medium">
                        ${record.amount}/{record.billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(STATUS_COLORS[record.status])}>
                          {record.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {format(new Date(record.nextBillingDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-100">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="text-slate-300 focus:bg-slate-700 focus:text-slate-100">
                                <ArrowUpCircle className="h-4 w-4 mr-2" />
                                Change Plan
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent className="bg-slate-800 border-slate-700">
                                {PLANS.map((plan) => (
                                  <DropdownMenuItem
                                    key={plan}
                                    onClick={() => handleChangePlan(record.id, plan)}
                                    className={cn(
                                      "text-slate-300 focus:bg-slate-700 focus:text-slate-100",
                                      record.plan === plan && "bg-slate-700/50"
                                    )}
                                  >
                                    <Badge variant="outline" className={cn("mr-2", PLAN_COLORS[plan])}>
                                      {plan}
                                    </Badge>
                                    {record.plan === plan && <span className="ml-auto text-xs text-amber-500">Current</span>}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuItem 
                              onClick={() => handleRefund(record.id)}
                              className="text-slate-300 focus:bg-slate-700 focus:text-slate-100"
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Issue Refund
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleCancelSubscription(record.id)}
                              className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Subscription
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              <PaginationControls
                page={page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={handleLimitChange}
              />
            </>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
