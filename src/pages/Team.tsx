import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  UserPlus, 
  Mail, 
  GitPullRequest, 
  CheckCircle, 
  Clock,
  MoreHorizontal,
  Filter,
  Search,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { teamApi } from '@/services/teamApi';
import { TeamMemberDialog } from '@/components/dialogs/TeamMemberDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import type { TeamMember, TeamMemberStatus, TeamRole, InviteTeamMemberRequest } from '@/types/team';

const StatusBadge = ({ status }: { status: TeamMemberStatus }) => {
  const styles: Record<TeamMemberStatus, string> = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    away: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    offline: 'bg-muted text-muted-foreground border-border',
    pending: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  };
  const dotStyles: Record<TeamMemberStatus, string> = {
    active: 'bg-emerald-400',
    away: 'bg-amber-400',
    offline: 'bg-muted-foreground',
    pending: 'bg-blue-400'
  };
  return (
    <Badge variant="outline" className={styles[status]}>
      <span className={`w-2 h-2 rounded-full mr-1.5 ${dotStyles[status]}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const roleLabels: Record<TeamRole, string> = {
  admin: 'Admin',
  tech_lead: 'Tech Lead',
  senior_developer: 'Senior Developer',
  developer: 'Developer',
  junior_developer: 'Junior Developer',
  devops: 'DevOps Engineer',
  qa: 'QA Engineer',
};

const TeamMemberCard = ({ 
  member, 
  onRemove,
  onUpdateStatus,
  onResendInvite,
  isResending
}: { 
  member: TeamMember; 
  onRemove: (id: string) => void;
  onUpdateStatus: (id: string, status: TeamMemberStatus) => void;
  onResendInvite: (id: string) => void;
  isResending: boolean;
}) => (
  <Card className="p-5 hover:border-primary/30 transition-colors">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border-2 border-primary/20">
          <AvatarImage src={member.avatar} alt={member.name} />
          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{member.name}</h3>
          <p className="text-sm text-muted-foreground">{roleLabels[member.role] || member.role}</p>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {member.status === 'pending' ? (
            <DropdownMenuItem 
              onClick={() => onResendInvite(member.id)}
              disabled={isResending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isResending ? 'animate-spin' : ''}`} />
              Resend Invitation
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem onClick={() => onUpdateStatus(member.id, 'active')}>
                Set Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus(member.id, 'away')}>
                Set Away
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus(member.id, 'offline')}>
                Set Offline
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive"
            onClick={() => onRemove(member.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove from Team
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div className="flex items-center gap-2 mb-4">
      <StatusBadge status={member.status} />
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Mail className="h-3 w-3" />
        {member.email}
      </span>
    </div>

    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Workload</span>
        <span className="font-medium">{member.availability}%</span>
      </div>
      <Progress value={member.availability} className="h-2" />
      
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
        <div className="text-center">
          <p className="text-lg font-semibold">{member.currentTasks}</p>
          <p className="text-xs text-muted-foreground">Tasks</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">{member.storyPoints}</p>
          <p className="text-xs text-muted-foreground">Points</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">{member.prsMerged}</p>
          <p className="text-xs text-muted-foreground">PRs</p>
        </div>
      </div>
    </div>
  </Card>
);

const TeamMemberSkeleton = () => (
  <Card className="p-5">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div>
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
    <div className="flex gap-2 mb-4">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-5 w-32" />
    </div>
    <Skeleton className="h-2 w-full mb-3" />
    <div className="grid grid-cols-3 gap-2 pt-2">
      <Skeleton className="h-12" />
      <Skeleton className="h-12" />
      <Skeleton className="h-12" />
    </div>
  </Card>
);

export default function Team() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  // Fetch team members
  const { data, isLoading, error } = useQuery({
    queryKey: ['team', search, statusFilter, roleFilter],
    queryFn: () => teamApi.list({
      search: search || undefined,
      status: statusFilter !== 'all' ? statusFilter as TeamMemberStatus : undefined,
      role: roleFilter !== 'all' ? roleFilter as TeamRole : undefined,
    }),
  });

  // Fetch team stats
  const { data: statsData } = useQuery({
    queryKey: ['team-stats'],
    queryFn: () => teamApi.getStats(),
  });

  // Invite mutation
  const inviteMutation = useMutation({
    mutationFn: (data: InviteTeamMemberRequest) => teamApi.invite(data),
    onSuccess: () => {
      toast({ title: 'Invitation sent', description: 'Team member has been invited.' });
      setInviteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Update status mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TeamMemberStatus }) => 
      teamApi.update(id, { status }),
    onSuccess: () => {
      toast({ title: 'Status updated' });
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: (id: string) => teamApi.remove(id),
    onSuccess: () => {
      toast({ title: 'Member removed', description: 'Team member has been removed.' });
      setRemoveDialogOpen(false);
      setMemberToRemove(null);
      queryClient.invalidateQueries({ queryKey: ['team'] });
      queryClient.invalidateQueries({ queryKey: ['team-stats'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Resend invite mutation
  const resendInviteMutation = useMutation({
    mutationFn: (id: string) => teamApi.resendInvite(id),
    onSuccess: () => {
      toast({ title: 'Invitation resent', description: 'A new invitation email has been sent.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleRemove = (id: string) => {
    setMemberToRemove(id);
    setRemoveDialogOpen(true);
  };

  const handleUpdateStatus = (id: string, status: TeamMemberStatus) => {
    updateMutation.mutate({ id, status });
  };

  const handleResendInvite = (id: string) => {
    resendInviteMutation.mutate(id);
  };

  const teamMembers = data?.data || [];
  const stats = statsData?.data;

  return (
    <DashboardLayout
      title="Team"
      description="Manage your development team and track workload"
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search team members..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="away">Away</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="tech_lead">Tech Lead</SelectItem>
              <SelectItem value="senior_developer">Senior Dev</SelectItem>
              <SelectItem value="developer">Developer</SelectItem>
              <SelectItem value="junior_developer">Junior Dev</SelectItem>
              <SelectItem value="devops">DevOps</SelectItem>
              <SelectItem value="qa">QA</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2" onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.totalMembers ?? teamMembers.length}</p>
              <p className="text-sm text-muted-foreground">Team Members</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats?.tasksCompleted ?? teamMembers.reduce((acc, m) => acc + m.tasksCompleted, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <GitPullRequest className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats?.prsMerged ?? teamMembers.reduce((acc, m) => acc + m.prsMerged, 0)}
              </p>
              <p className="text-sm text-muted-foreground">PRs Merged</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats?.activeTasks ?? teamMembers.reduce((acc, m) => acc + m.currentTasks, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Active Tasks</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="p-8 text-center">
          <p className="text-destructive mb-4">Failed to load team members</p>
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['team'] })}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <TeamMemberSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && teamMembers.length === 0 && (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No team members found</h3>
          <p className="text-muted-foreground mb-4">
            {search || statusFilter !== 'all' || roleFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Start by inviting your first team member'}
          </p>
          <Button onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </Card>
      )}

      {/* Team Members Grid */}
      {!isLoading && !error && teamMembers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onRemove={handleRemove}
              onUpdateStatus={handleUpdateStatus}
              onResendInvite={handleResendInvite}
              isResending={resendInviteMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <TeamMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onSubmit={(data) => inviteMutation.mutate(data)}
        isLoading={inviteMutation.isPending}
      />

      <ConfirmDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        title="Remove Team Member"
        description="Are you sure you want to remove this team member? This action cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={() => memberToRemove && removeMutation.mutate(memberToRemove)}
        isLoading={removeMutation.isPending}
      />
    </DashboardLayout>
  );
}
