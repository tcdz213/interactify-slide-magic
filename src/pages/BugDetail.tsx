import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { bugsApi } from '@/services/bugApi';
import { BugDialog } from '@/components/dialogs/BugDialog';
import { BugLinkFeatureDialog } from '@/components/dialogs/BugLinkFeatureDialog';
import { BugAddToSprintDialog } from '@/components/dialogs/BugAddToSprintDialog';
import { BugRetestDialog } from '@/components/dialogs/BugRetestDialog';
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  Bug,
  Monitor,
  Smartphone,
  Server,
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle,
  TestTube,
  Plus,
  Package,
  Zap,
  Globe,
  Info,
  Link,
} from 'lucide-react';
import { format } from 'date-fns';
import type { UpdateBugData, BugStatus, BugSeverity, BugPlatform } from '@/types/bug';

const STATUS_CONFIG: Record<BugStatus, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  confirmed: { label: 'Confirmed', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  in_progress: { label: 'In Progress', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  fixed: { label: 'Fixed', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  verified: { label: 'Verified', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  closed: { label: 'Closed', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  reopened: { label: 'Reopened', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  wont_fix: { label: "Won't Fix", color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  duplicate: { label: 'Duplicate', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
};

const SEVERITY_CONFIG: Record<BugSeverity, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-gray-500/20 text-gray-400' },
  medium: { label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400' },
  high: { label: 'High', color: 'bg-orange-500/20 text-orange-400' },
  critical: { label: 'Critical', color: 'bg-red-500/20 text-red-400' },
};

const PLATFORM_ICONS: Record<BugPlatform, typeof Monitor> = {
  web: Globe,
  android: Smartphone,
  ios: Smartphone,
  api: Server,
  desktop: Monitor,
};

const ALL_STATUSES: BugStatus[] = ['new', 'confirmed', 'in_progress', 'fixed', 'verified', 'closed', 'reopened', 'wont_fix', 'duplicate'];

export default function BugDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [linkFeatureDialogOpen, setLinkFeatureDialogOpen] = useState(false);
  const [addToSprintDialogOpen, setAddToSprintDialogOpen] = useState(false);
  const [retestDialogOpen, setRetestDialogOpen] = useState(false);
  const [retestData, setRetestData] = useState({
    status: 'passed' as 'passed' | 'failed',
    notes: '',
    environment: '',
  });

  // Fetch bug
  const { data: bugData, isLoading } = useQuery({
    queryKey: ['bug', id],
    queryFn: () => bugsApi.getById(id!),
    enabled: !!id,
  });

  // Fetch retest history
  const { data: retestHistoryData } = useQuery({
    queryKey: ['bug-retest-history', id],
    queryFn: () => bugsApi.getRetestHistory(id!),
    enabled: !!id,
  });

  // Mutations
  const updateBugMutation = useMutation({
    mutationFn: (data: UpdateBugData) => bugsApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bug', id] });
      toast({ title: 'Bug updated' });
      setEditDialogOpen(false);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: BugStatus) => bugsApi.updateStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bug', id] });
      toast({ title: 'Status updated' });
    },
  });

  const addRetestMutation = useMutation({
    mutationFn: (data: { status: 'passed' | 'failed'; notes?: string; environment: string }) =>
      bugsApi.addRetest(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bug', id] });
      queryClient.invalidateQueries({ queryKey: ['bug-retest-history', id] });
      setRetestData({ status: 'passed', notes: '', environment: '' });
      setRetestDialogOpen(false);
      toast({ title: 'Retest result added' });
    },
  });

  const linkFeatureMutation = useMutation({
    mutationFn: (featureId: string) => bugsApi.linkFeature(id!, featureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bug', id] });
      toast({ title: 'Bug linked to feature' });
    },
  });

  const unlinkFeatureMutation = useMutation({
    mutationFn: () => bugsApi.unlinkFeature(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bug', id] });
      toast({ title: 'Bug unlinked from feature' });
    },
  });

  const addToSprintMutation = useMutation({
    mutationFn: (sprintId: string) => bugsApi.addToSprint(id!, sprintId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bug', id] });
      toast({ title: 'Bug added to sprint' });
    },
  });

  const removeFromSprintMutation = useMutation({
    mutationFn: () => bugsApi.removeFromSprint(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bug', id] });
      toast({ title: 'Bug removed from sprint' });
    },
  });

  const bug = bugData?.data;
  const retestHistory = retestHistoryData?.data || bug?.retestResults || [];

  if (isLoading) {
    return (
      <DashboardLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!bug) {
    return (
      <DashboardLayout title="Bug Not Found">
        <div className="text-center py-12">
          <Bug className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Bug not found</h2>
          <Button onClick={() => navigate('/dashboard/bugs')}>Go to Bugs</Button>
        </div>
      </DashboardLayout>
    );
  }

  const statusConfig = STATUS_CONFIG[bug.status] || STATUS_CONFIG.new;
  const severityConfig = SEVERITY_CONFIG[bug.severity] || SEVERITY_CONFIG.medium;
  const PlatformIcon = PLATFORM_ICONS[bug.platform] || Monitor;

  const handleAddRetest = (e: React.FormEvent) => {
    e.preventDefault();
    if (retestData.environment.trim()) {
      addRetestMutation.mutate({
        status: retestData.status,
        notes: retestData.notes || undefined,
        environment: retestData.environment.trim(),
      });
    }
  };

  const handleSaveEdit = async (data: UpdateBugData) => {
    await updateBugMutation.mutateAsync(data);
  };

  return (
    <DashboardLayout title="Bug Details">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/bugs')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Bug className={`h-6 w-6 ${SEVERITY_CONFIG[bug.severity].color.split(' ')[1]}`} />
                <h1 className="text-2xl font-bold">{bug.title}</h1>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                <Badge className={severityConfig.color}>{severityConfig.label} Severity</Badge>
                <Badge variant="outline" className="gap-1">
                  <PlatformIcon className="h-3 w-3" />
                  {bug.platform.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={bug.status} onValueChange={(v) => updateStatusMutation.mutate(v as BugStatus)}>
              <SelectTrigger className="w-32 sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_CONFIG[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setLinkFeatureDialogOpen(true)}>
              <Zap className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Link Feature</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAddToSprintDialogOpen(true)}>
              <Calendar className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Sprint</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setRetestDialogOpen(true)}>
              <TestTube className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Retest</span>
            </Button>
            <Button onClick={() => setEditDialogOpen(true)}>Edit Bug</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{bug.description}</p>
              </CardContent>
            </Card>

            {/* Bug Details Tabs */}
            <Tabs defaultValue="steps">
              <TabsList>
                <TabsTrigger value="steps">Reproduction Steps</TabsTrigger>
                <TabsTrigger value="behavior">Expected vs Actual</TabsTrigger>
                <TabsTrigger value="retest">Retest History ({retestHistory.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="steps" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      Steps to Reproduce
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap text-sm font-mono">{bug.stepsToReproduce}</pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="behavior" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2 text-green-500">
                        <CheckCircle className="h-5 w-5" />
                        Expected Behavior
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap">{bug.expectedBehavior}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2 text-red-500">
                        <XCircle className="h-5 w-5" />
                        Actual Behavior
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap">{bug.actualBehavior}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="retest" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    {/* Add retest form */}
                    <form onSubmit={handleAddRetest} className="space-y-4 mb-6 p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium flex items-center gap-2">
                        <TestTube className="h-4 w-4" />
                        Add Retest Result
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Select
                          value={retestData.status}
                          onValueChange={(v) => setRetestData({ ...retestData, status: v as 'passed' | 'failed' })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Result" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="passed">
                              <span className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                Passed
                              </span>
                            </SelectItem>
                            <SelectItem value="failed">
                              <span className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-500" />
                                Failed
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Environment (e.g., Staging)"
                          value={retestData.environment}
                          onChange={(e) => setRetestData({ ...retestData, environment: e.target.value })}
                          required
                        />
                        <Button type="submit" disabled={addRetestMutation.isPending}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Result
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Notes (optional)"
                        value={retestData.notes}
                        onChange={(e) => setRetestData({ ...retestData, notes: e.target.value })}
                        rows={2}
                      />
                    </form>

                    {/* Retest history list */}
                    <div className="space-y-3">
                      {retestHistory.map((retest) => (
                        <div
                          key={retest.id}
                          className={`p-4 rounded-lg border ${
                            retest.status === 'passed'
                              ? 'border-green-500/30 bg-green-500/5'
                              : 'border-red-500/30 bg-red-500/5'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {retest.status === 'passed' ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                              <span className="font-medium capitalize">{retest.status}</span>
                              <Badge variant="outline" className="text-xs">
                                {retest.environment}
                              </Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(retest.testedAt), 'MMM d, yyyy h:mm a')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <User className="h-4 w-4" />
                            Tested by {retest.testedByName}
                          </div>
                          {retest.notes && (
                            <p className="text-sm text-muted-foreground mt-2 pl-7">{retest.notes}</p>
                          )}
                        </div>
                      ))}
                      {retestHistory.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">
                          No retest results yet. Add a retest result after verifying the bug.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bug.reporterName && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Reported by</p>
                      <p className="text-sm font-medium">{bug.reporterName}</p>
                    </div>
                  </div>
                )}

                {bug.assigneeName && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Assigned to</p>
                      <p className="text-sm font-medium">{bug.assigneeName}</p>
                    </div>
                  </div>
                )}

                <Separator />

                {bug.productName && (
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Product</p>
                      <p className="text-sm">{bug.productName}</p>
                    </div>
                  </div>
                )}

                {bug.featureTitle && (
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Feature</p>
                      <p className="text-sm">{bug.featureTitle}</p>
                    </div>
                  </div>
                )}

                {bug.sprintName && (
                  <div className="flex items-center gap-2">
                    <TestTube className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Sprint</p>
                      <p className="text-sm">{bug.sprintName}</p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Environment</p>
                    <p className="text-sm">{bug.environment}</p>
                  </div>
                </div>

                {bug.version && (
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Version</p>
                      <p className="text-sm">{bug.version}</p>
                    </div>
                  </div>
                )}

                {bug.browserInfo && (
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Browser</p>
                      <p className="text-sm">{bug.browserInfo}</p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm">{format(new Date(bug.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Updated</p>
                    <p className="text-sm">{format(new Date(bug.updatedAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>

                {bug.resolvedAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Resolved</p>
                      <p className="text-sm">{format(new Date(bug.resolvedAt), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Latest Retest Status */}
            {retestHistory.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Latest Retest</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`p-3 rounded-lg ${
                      retestHistory[0].status === 'passed' ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {retestHistory[0].status === 'passed' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium capitalize">{retestHistory[0].status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(retestHistory[0].testedAt), 'MMM d, yyyy')} • {retestHistory[0].environment}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <BugDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        bug={bug}
        onSave={handleSaveEdit}
      />

      {/* Link Feature Dialog */}
      <BugLinkFeatureDialog
        open={linkFeatureDialogOpen}
        onOpenChange={setLinkFeatureDialogOpen}
        currentFeatureId={bug.featureId}
        currentFeatureTitle={bug.featureTitle}
        onLink={async (featureId) => {
          await linkFeatureMutation.mutateAsync(featureId);
        }}
        onUnlink={async () => {
          await unlinkFeatureMutation.mutateAsync();
        }}
      />

      {/* Add to Sprint Dialog */}
      <BugAddToSprintDialog
        open={addToSprintDialogOpen}
        onOpenChange={setAddToSprintDialogOpen}
        currentSprintId={bug.sprintId}
        currentSprintName={bug.sprintName}
        productId={bug.productId}
        onAddToSprint={async (sprintId) => {
          await addToSprintMutation.mutateAsync(sprintId);
        }}
        onRemoveFromSprint={async () => {
          await removeFromSprintMutation.mutateAsync();
        }}
      />

      {/* Retest Dialog */}
      <BugRetestDialog
        open={retestDialogOpen}
        onOpenChange={setRetestDialogOpen}
        onSubmit={async (data) => {
          await addRetestMutation.mutateAsync(data);
        }}
      />
    </DashboardLayout>
  );
}
