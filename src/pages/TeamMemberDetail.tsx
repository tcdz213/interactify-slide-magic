import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  GitPullRequest,
  Edit,
  Trash2,
  BarChart3,
  Briefcase,
} from 'lucide-react';
import { teamApi } from '@/services/teamApi';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { TeamMember, TeamMemberStatus, TeamRole } from '@/types/team';

const STATUS_COLORS: Record<TeamMemberStatus, string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  away: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  offline: 'bg-muted text-muted-foreground border-border',
  pending: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const ROLE_LABELS: Record<TeamRole, string> = {
  admin: 'Admin',
  tech_lead: 'Tech Lead',
  senior_developer: 'Senior Developer',
  developer: 'Developer',
  junior_developer: 'Junior Developer',
  devops: 'DevOps Engineer',
  qa: 'QA Engineer',
};

export default function TeamMemberDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch team member
  const { data: memberData, isLoading } = useQuery({
    queryKey: ['team-member', id],
    queryFn: () => teamApi.getById(id!),
    enabled: !!id,
  });

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: () => teamApi.remove(id!),
    onSuccess: () => {
      toast.success('Team member removed');
      queryClient.invalidateQueries({ queryKey: ['team'] });
      navigate('/dashboard/team');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: TeamMemberStatus) => teamApi.update(id!, { status }),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['team-member', id] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const member = memberData?.data;

  if (isLoading || !member) {
    return (
      <DashboardLayout title="Team Member" description="Loading...">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-secondary rounded-lg" />
          <div className="h-64 bg-secondary rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={member.name}
      description={ROLE_LABELS[member.role] || member.role}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/dashboard/team')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      }
    >
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={member.avatar} />
              <AvatarFallback className="text-2xl">
                {member.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{member.name}</h2>
                <Badge variant="outline" className={STATUS_COLORS[member.status]}>
                  {member.status}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-2">{ROLE_LABELS[member.role] || member.role}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {member.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {format(new Date(member.joinedAt), 'MMM yyyy')}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Tasks</p>
                <p className="text-2xl font-bold">{member.currentTasks}</p>
              </div>
              <Briefcase className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
                <p className="text-2xl font-bold">{member.tasksCompleted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Story Points</p>
                <p className="text-2xl font-bold">{member.storyPoints}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">PRs Merged</p>
                <p className="text-2xl font-bold">{member.prsMerged}</p>
              </div>
              <GitPullRequest className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Workload</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Availability</span>
                    <span>{member.availability}%</span>
                  </div>
                  <Progress value={member.availability} />
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {member.currentTasks} active tasks assigned
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Current Status:</span>
                  <Badge variant="outline" className={STATUS_COLORS[member.status]}>
                    {member.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateStatusMutation.mutate('active')}
                    disabled={member.status === 'active'}
                  >
                    Set Active
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateStatusMutation.mutate('away')}
                    disabled={member.status === 'away'}
                  >
                    Set Away
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateStatusMutation.mutate('offline')}
                    disabled={member.status === 'offline'}
                  >
                    Set Offline
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{member.tasksCompleted}</p>
                  <p className="text-xs text-muted-foreground">Tasks Completed</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{member.storyPoints}</p>
                  <p className="text-xs text-muted-foreground">Story Points</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{member.prsMerged}</p>
                  <p className="text-xs text-muted-foreground">PRs Merged</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{member.availability}%</p>
                  <p className="text-xs text-muted-foreground">Availability</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Activity history for this team member</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Activity history coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Remove Team Member"
        description={`Are you sure you want to remove "${member.name}" from the team? This action cannot be undone.`}
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={() => removeMutation.mutate()}
        isLoading={removeMutation.isPending}
      />
    </DashboardLayout>
  );
}
