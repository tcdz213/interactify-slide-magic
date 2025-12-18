import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  DropdownMenuSeparator,
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
import { Search, MoreVertical, UserX, Shield, Key, Trash2, UserCog } from 'lucide-react';
import { adminUsersApi } from '@/services/adminApi';
import type { AdminUser, PaginatedResponse } from '@/types/admin';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { format } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  suspended: 'bg-red-500/10 text-red-400 border-red-500/30',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
};

const ROLE_COLORS: Record<string, string> = {
  superadmin: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  admin: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  moderator: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  user: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

const ROLES = ['superadmin', 'admin', 'moderator', 'user'] as const;

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (roleFilter !== 'all') params.role = roleFilter;
      
      const response: PaginatedResponse<AdminUser> = await adminUsersApi.list(params);
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (error) {
      // Mock data for demo
      const mockUsers: AdminUser[] = [
        {
          id: '1',
          email: 'john@example.com',
          name: 'John Doe',
          avatar: null,
          role: 'admin',
          status: 'active',
          emailVerified: true,
          workspaceId: 'ws-1',
          workspaceName: 'Acme Corp',
          lastLoginAt: '2024-01-15T10:30:00Z',
          createdAt: '2023-06-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          email: 'jane@example.com',
          name: 'Jane Smith',
          avatar: null,
          role: 'user',
          status: 'active',
          emailVerified: true,
          workspaceId: 'ws-2',
          workspaceName: 'Tech Startup',
          lastLoginAt: '2024-01-14T08:00:00Z',
          createdAt: '2023-08-20T14:00:00Z',
          updatedAt: '2024-01-14T08:00:00Z',
        },
        {
          id: '3',
          email: 'bob@example.com',
          name: 'Bob Wilson',
          avatar: null,
          role: 'moderator',
          status: 'suspended',
          emailVerified: false,
          workspaceId: 'ws-3',
          workspaceName: 'Design Agency',
          lastLoginAt: null,
          createdAt: '2023-12-01T09:00:00Z',
          updatedAt: '2024-01-10T11:00:00Z',
        },
      ];
      setUsers(mockUsers);
      setPagination({
        total: 150,
        totalPages: 8,
        hasNext: true,
        hasPrev: page > 1,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, statusFilter, roleFilter, page, limit]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, roleFilter]);

  const handleStatusChange = async (userId: string, status: 'active' | 'suspended') => {
    try {
      await adminUsersApi.updateStatus(userId, status);
      toast.success(`User ${status === 'active' ? 'activated' : 'suspended'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await adminUsersApi.updateRole(userId, role);
      toast.success('User role updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      await adminUsersApi.resetPassword(userId);
      toast.success('Password reset email sent');
    } catch (error) {
      toast.error('Failed to send password reset');
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      await adminUsersApi.delete(deleteUser.id);
      toast.success('User deleted');
      setDeleteUser(null);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <AdminLayout title="Users" description="Manage platform users">
      {/* Filters */}
      <Card className="bg-slate-900/50 border-slate-800/50 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search users..."
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
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px] bg-slate-800/50 border-slate-700/50 text-slate-100">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="superadmin">Superadmin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
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
                    <TableHead className="text-slate-400">Role</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Workspace</TableHead>
                    <TableHead className="text-slate-400">Last Login</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="border-slate-800/50 hover:bg-slate-800/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar || undefined} />
                            <AvatarFallback className="bg-slate-700 text-slate-300">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-100">{user.name}</p>
                            <p className="text-sm text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(ROLE_COLORS[user.role])}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(STATUS_COLORS[user.status])}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400">{user.workspaceName}</TableCell>
                      <TableCell className="text-slate-400">
                        {user.lastLoginAt ? format(new Date(user.lastLoginAt), 'MMM d, yyyy') : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-100">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'suspended' : 'active')}
                              className="text-slate-300 focus:bg-slate-700 focus:text-slate-100"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              {user.status === 'active' ? 'Suspend User' : 'Activate User'}
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="text-slate-300 focus:bg-slate-700 focus:text-slate-100">
                                <UserCog className="h-4 w-4 mr-2" />
                                Change Role
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent className="bg-slate-800 border-slate-700">
                                {ROLES.map((role) => (
                                  <DropdownMenuItem
                                    key={role}
                                    onClick={() => handleRoleChange(user.id, role)}
                                    className={cn(
                                      "text-slate-300 focus:bg-slate-700 focus:text-slate-100",
                                      user.role === role && "bg-slate-700/50"
                                    )}
                                  >
                                    <Badge variant="outline" className={cn("mr-2", ROLE_COLORS[role])}>
                                      {role}
                                    </Badge>
                                    {user.role === role && <span className="ml-auto text-xs text-amber-500">Current</span>}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuItem 
                              onClick={() => handleResetPassword(user.id)}
                              className="text-slate-300 focus:bg-slate-700 focus:text-slate-100"
                            >
                              <Key className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem 
                              onClick={() => setDeleteUser(user)}
                              className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
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
        open={!!deleteUser}
        onOpenChange={() => setDeleteUser(null)}
        title="Delete User"
        description={`Are you sure you want to delete "${deleteUser?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </AdminLayout>
  );
}
