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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, MoreVertical, CheckCircle, Clock, Trash2, AlertCircle, XCircle } from 'lucide-react';
import { adminReportsApi } from '@/services/adminApi';
import type { AdminReport, PaginatedResponse } from '@/types/admin';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { format } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  closed: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  medium: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  high: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  critical: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const TYPE_COLORS: Record<string, string> = {
  bug: 'bg-red-500/10 text-red-400 border-red-500/30',
  feedback: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  support: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  feature_request: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

const STATUSES = ['new', 'in_progress', 'resolved', 'closed'] as const;

export default function AdminReports() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [deleteReport, setDeleteReport] = useState<AdminReport | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      
      const response: PaginatedResponse<AdminReport> = await adminReportsApi.list(params);
      setReports(response.data);
      setPagination(response.pagination);
    } catch (error) {
      // Mock data for demo
      setReports([
        {
          id: '1',
          type: 'bug',
          title: 'Login button not working on Safari',
          description: 'Users report that the login button is unresponsive on Safari browser.',
          status: 'new',
          priority: 'high',
          userId: 'u1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          assignedTo: null,
          assignedToName: null,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          type: 'feature_request',
          title: 'Add dark mode support',
          description: 'Many users have requested a dark mode option for the platform.',
          status: 'in_progress',
          priority: 'medium',
          userId: 'u2',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          assignedTo: 'admin1',
          assignedToName: 'Admin User',
          createdAt: '2024-01-14T08:00:00Z',
          updatedAt: '2024-01-15T09:00:00Z',
        },
        {
          id: '3',
          type: 'feedback',
          title: 'Great platform, love the UI!',
          description: 'Just wanted to say the new dashboard looks amazing.',
          status: 'resolved',
          priority: 'low',
          userId: 'u3',
          userName: 'Bob Wilson',
          userEmail: 'bob@example.com',
          assignedTo: null,
          assignedToName: null,
          createdAt: '2024-01-13T14:00:00Z',
          updatedAt: '2024-01-14T10:00:00Z',
        },
      ]);
      setPagination({
        total: 156,
        totalPages: 8,
        hasNext: true,
        hasPrev: page > 1,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [search, statusFilter, typeFilter, priorityFilter, page, limit]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter, priorityFilter]);

  const handleStatusChange = async (reportId: string, status: string) => {
    try {
      await adminReportsApi.updateStatus(reportId, status);
      toast.success('Report status updated');
      fetchReports();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteReport) return;
    try {
      await adminReportsApi.delete(deleteReport.id);
      toast.success('Report deleted');
      setDeleteReport(null);
      fetchReports();
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <AlertCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <AdminLayout title="Reports & Feedback" description="Manage user reports and feedback">
      {/* Filters */}
      <Card className="bg-slate-900/50 border-slate-800/50 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search reports..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px] bg-slate-800/50 border-slate-700/50 text-slate-100">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="feedback">Feedback</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="feature_request">Feature Request</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-slate-800/50 border-slate-700/50 text-slate-100">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px] bg-slate-800/50 border-slate-700/50 text-slate-100">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
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
                    <TableHead className="text-slate-400">Report</TableHead>
                    <TableHead className="text-slate-400">Type</TableHead>
                    <TableHead className="text-slate-400">Priority</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Reporter</TableHead>
                    <TableHead className="text-slate-400">Date</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id} className="border-slate-800/50 hover:bg-slate-800/30">
                      <TableCell>
                        <div className="max-w-[300px]">
                          <p className="font-medium text-slate-100 truncate">{report.title}</p>
                          <p className="text-sm text-slate-500 truncate">{report.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(TYPE_COLORS[report.type])}>
                          {report.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(PRIORITY_COLORS[report.priority])}>
                          {report.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(STATUS_COLORS[report.status])}>
                          {report.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-slate-300">{report.userName}</p>
                          <p className="text-xs text-slate-500">{report.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {format(new Date(report.createdAt), 'MMM d, yyyy')}
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
                                <Clock className="h-4 w-4 mr-2" />
                                Change Status
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent className="bg-slate-800 border-slate-700">
                                {STATUSES.map((status) => (
                                  <DropdownMenuItem
                                    key={status}
                                    onClick={() => handleStatusChange(report.id, status)}
                                    className={cn(
                                      "text-slate-300 focus:bg-slate-700 focus:text-slate-100",
                                      report.status === status && "bg-slate-700/50"
                                    )}
                                  >
                                    {getStatusIcon(status)}
                                    <span className="ml-2 capitalize">{status.replace('_', ' ')}</span>
                                    {report.status === status && <span className="ml-auto text-xs text-amber-500">Current</span>}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem 
                              onClick={() => setDeleteReport(report)}
                              className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
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

      <ConfirmDialog
        open={!!deleteReport}
        onOpenChange={() => setDeleteReport(null)}
        title="Delete Report"
        description={`Are you sure you want to delete this report? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </AdminLayout>
  );
}
