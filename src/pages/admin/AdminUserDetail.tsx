import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Shield,
  Key,
  UserX,
  Trash2,
  Activity,
  Building,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { adminUsersApi } from '@/services/adminApi';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { AdminUser } from '@/types/admin';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  suspended: 'bg-red-500/20 text-red-400 border-red-500/30',
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  admin: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  moderator: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  user: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);

  // Fetch user
  const { data: userData, isLoading } = useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => adminUsersApi.getById(id!),
    enabled: !!id,
  });

  // Suspend/Activate mutation
  const statusMutation = useMutation({
    mutationFn: (status: 'active' | 'suspended') => adminUsersApi.updateStatus(id!, status),
    onSuccess: () => {
      toast.success('User status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-user', id] });
      setSuspendDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: () => adminUsersApi.resetPassword(id!),
    onSuccess: () => {
      toast.success('Password reset email sent');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => adminUsersApi.delete(id!),
    onSuccess: () => {
      toast.success('User deleted');
      navigate('/admin/users');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Role change mutation
  const roleChangeMutation = useMutation({
    mutationFn: (role: string) => adminUsersApi.updateRole(id!, role),
    onSuccess: () => {
      toast.success('User role updated');
      queryClient.invalidateQueries({ queryKey: ['admin-user', id] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const user = userData?.data;

  if (isLoading || !user) {
    return (
      <AdminLayout title="User Details" description="Loading...">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-slate-800/50 rounded-lg" />
          <div className="h-64 bg-slate-800/50 rounded-lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={user.name}
      description="User account details"
    >
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </div>

      {/* Profile Header */}
      <Card className="mb-6 bg-slate-900/50 border-slate-800/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20 border-4 border-slate-700">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="bg-slate-700 text-slate-300 text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-100">{user.name}</h2>
                <Badge variant="outline" className={cn(STATUS_COLORS[user.status])}>
                  {user.status}
                </Badge>
                <Badge variant="outline" className={cn(ROLE_COLORS[user.role])}>
                  {user.role}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </span>
                {user.emailVerified && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {!user.emailVerified && (
                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-400">
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Verified
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => resetPasswordMutation.mutate()}
                disabled={resetPasswordMutation.isPending}
              >
                <Key className="h-4 w-4 mr-2" />
                Reset Password
              </Button>
              <Button 
                variant={user.status === 'active' ? 'secondary' : 'default'}
                size="sm"
                onClick={() => setSuspendDialogOpen(true)}
              >
                <UserX className="h-4 w-4 mr-2" />
                {user.status === 'active' ? 'Suspend' : 'Activate'}
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-slate-800/50">
              <CardHeader>
                <CardTitle className="text-slate-100">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    User ID
                  </span>
                  <code className="text-xs bg-slate-800 px-2 py-1 rounded">{user.id}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </span>
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Workspace
                  </span>
                  <span>{user.workspaceName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Created
                  </span>
                  <span>{format(new Date(user.createdAt), 'PPP')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Last Login
                  </span>
                  <span>{user.lastLoginAt ? format(new Date(user.lastLoginAt), 'PPp') : 'Never'}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800/50">
              <CardHeader>
                <CardTitle className="text-slate-100">Role & Permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Current Role</span>
                  <Badge variant="outline" className={cn(ROLE_COLORS[user.role])}>
                    {user.role}
                  </Badge>
                </div>
                <div className="border-t border-slate-700 pt-4">
                  <p className="text-sm text-slate-400 mb-3">Change Role</p>
                  <div className="flex flex-wrap gap-2">
                    {['user', 'moderator', 'admin', 'owner'].map((role) => (
                      <Button
                        key={role}
                        variant={user.role === role ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => roleChangeMutation.mutate(role)}
                        disabled={user.role === role || roleChangeMutation.isPending}
                        className="capitalize"
                      >
                        {role}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-6">
          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Log
              </CardTitle>
              <CardDescription className="text-slate-400">
                Recent activity for this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto text-slate-600 mb-4" />
                <p className="text-slate-400">Activity log coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="mt-6">
          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permissions
              </CardTitle>
              <CardDescription className="text-slate-400">
                User permissions based on role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.role === 'owner' && (
                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <p className="text-purple-400 font-medium">Owner</p>
                    <p className="text-sm text-slate-400">Full access to all platform features and administration.</p>
                  </div>
                )}
                {user.role === 'admin' && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-400 font-medium">Admin</p>
                    <p className="text-sm text-slate-400">Access to user management, reports, and analytics.</p>
                  </div>
                )}
                {user.role === 'moderator' && (
                  <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                    <p className="text-cyan-400 font-medium">Moderator</p>
                    <p className="text-sm text-slate-400">Can manage content and handle reports.</p>
                  </div>
                )}
                {user.role === 'user' && (
                  <div className="p-4 bg-slate-500/10 border border-slate-500/20 rounded-lg">
                    <p className="text-slate-300 font-medium">User</p>
                    <p className="text-sm text-slate-400">Standard user access.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ConfirmDialog
        open={suspendDialogOpen}
        onOpenChange={setSuspendDialogOpen}
        title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
        description={
          user.status === 'active'
            ? `Are you sure you want to suspend "${user.name}"? They will lose access to the platform.`
            : `Are you sure you want to activate "${user.name}"? They will regain access to the platform.`
        }
        confirmLabel={user.status === 'active' ? 'Suspend' : 'Activate'}
        variant={user.status === 'active' ? 'destructive' : 'default'}
        onConfirm={() => statusMutation.mutate(user.status === 'active' ? 'suspended' : 'active')}
        isLoading={statusMutation.isPending}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User"
        description={`Are you sure you want to permanently delete "${user.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
      />
    </AdminLayout>
  );
}
