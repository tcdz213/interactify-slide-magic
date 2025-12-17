import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { releaseApi } from '@/services/releaseApi';
import { toast } from 'sonner';
import { 
  ArrowLeft, Rocket, Play, RotateCcw, CheckCircle, XCircle, Clock, 
  AlertTriangle, RefreshCw, Send, FileText, Link2, Unlink, Bug, 
  Sparkles, Download, Edit, Save, X, Users, MessageSquare
} from 'lucide-react';
import type { Release, ReleaseStatus, PipelineStep, Approver } from '@/types/release';

const statusColors: Record<ReleaseStatus, string> = {
  planning: 'bg-muted text-muted-foreground',
  scheduled: 'bg-blue-500/20 text-blue-500',
  in_development: 'bg-yellow-500/20 text-yellow-500',
  testing: 'bg-purple-500/20 text-purple-500',
  staged: 'bg-orange-500/20 text-orange-500',
  released: 'bg-green-500/20 text-green-500',
  rolled_back: 'bg-red-500/20 text-red-500',
};

const platformIcons: Record<string, string> = {
  web: '🌐',
  android: '🤖',
  ios: '🍎',
  api: '⚡',
  desktop: '💻',
};

const pipelineStatusConfig = {
  pending: { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted' },
  running: { icon: Play, color: 'text-blue-500', bg: 'bg-blue-500/20' },
  passed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/20' },
  failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/20' },
  skipped: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
};

export default function ReleaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false);
  const [isRollbackDialogOpen, setIsRollbackDialogOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isLinkFeatureDialogOpen, setIsLinkFeatureDialogOpen] = useState(false);
  const [isLinkBugDialogOpen, setIsLinkBugDialogOpen] = useState(false);
  const [deployEnvironment, setDeployEnvironment] = useState<'staging' | 'production'>('staging');
  const [rollbackReason, setRollbackReason] = useState('');
  const [rollbackVersion, setRollbackVersion] = useState('');
  const [approvalComment, setApprovalComment] = useState('');
  const [newFeatureId, setNewFeatureId] = useState('');
  const [newBugId, setNewBugId] = useState('');
  const [approverIds, setApproverIds] = useState('');

  const { data: release, isLoading, error } = useQuery({
    queryKey: ['release', id],
    queryFn: () => releaseApi.getById(id!),
    enabled: !!id,
  });

  // Mutations
  const updateNotesMutation = useMutation({
    mutationFn: (notes: string) => releaseApi.updateNotes(id!, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release', id] });
      setIsEditingNotes(false);
      toast.success('Release notes updated');
    },
    onError: () => toast.error('Failed to update release notes'),
  });

  const generateNotesMutation = useMutation({
    mutationFn: () => releaseApi.generateNotes(id!),
    onSuccess: (notes) => {
      setEditedNotes(notes);
      toast.success('Release notes generated');
    },
    onError: () => toast.error('Failed to generate release notes'),
  });

  const deployMutation = useMutation({
    mutationFn: (environment: 'staging' | 'production') => 
      releaseApi.deploy(id!, { environment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release', id] });
      setIsDeployDialogOpen(false);
      toast.success(`Deployed to ${deployEnvironment}`);
    },
    onError: () => toast.error('Deployment failed'),
  });

  const rollbackMutation = useMutation({
    mutationFn: () => releaseApi.rollback(id!, { 
      reason: rollbackReason, 
      targetVersion: rollbackVersion 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release', id] });
      setIsRollbackDialogOpen(false);
      setRollbackReason('');
      setRollbackVersion('');
      toast.success('Rollback initiated');
    },
    onError: () => toast.error('Rollback failed'),
  });

  const startPipelineMutation = useMutation({
    mutationFn: (stage: string) => releaseApi.startPipelineStage(id!, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release', id] });
      toast.success('Pipeline stage started');
    },
    onError: () => toast.error('Failed to start pipeline stage'),
  });

  const retryPipelineMutation = useMutation({
    mutationFn: (stage: string) => releaseApi.retryPipelineStage(id!, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release', id] });
      toast.success('Pipeline stage retried');
    },
    onError: () => toast.error('Failed to retry pipeline stage'),
  });

  const requestApprovalMutation = useMutation({
    mutationFn: (approvers: string[]) => releaseApi.requestApproval(id!, { approvers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release', id] });
      setIsApprovalDialogOpen(false);
      setApproverIds('');
      toast.success('Approval requested');
    },
    onError: () => toast.error('Failed to request approval'),
  });

  const approveMutation = useMutation({
    mutationFn: (comment?: string) => releaseApi.approve(id!, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release', id] });
      setApprovalComment('');
      toast.success('Release approved');
    },
    onError: () => toast.error('Failed to approve release'),
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => releaseApi.reject(id!, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release', id] });
      toast.success('Release rejected');
    },
    onError: () => toast.error('Failed to reject release'),
  });

  const linkFeatureMutation = useMutation({
    mutationFn: (featureId: string) => releaseApi.linkFeature(id!, featureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release', id] });
      setIsLinkFeatureDialogOpen(false);
      setNewFeatureId('');
      toast.success('Feature linked');
    },
    onError: () => toast.error('Failed to link feature'),
  });

  const unlinkFeatureMutation = useMutation({
    mutationFn: (featureId: string) => releaseApi.unlinkFeature(id!, featureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release', id] });
      toast.success('Feature unlinked');
    },
    onError: () => toast.error('Failed to unlink feature'),
  });

  const linkBugMutation = useMutation({
    mutationFn: (bugId: string) => releaseApi.linkBug(id!, bugId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release', id] });
      setIsLinkBugDialogOpen(false);
      setNewBugId('');
      toast.success('Bug fix linked');
    },
    onError: () => toast.error('Failed to link bug fix'),
  });

  const unlinkBugMutation = useMutation({
    mutationFn: (bugId: string) => releaseApi.unlinkBug(id!, bugId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release', id] });
      toast.success('Bug fix unlinked');
    },
    onError: () => toast.error('Failed to unlink bug fix'),
  });

  const exportNotesMutation = useMutation({
    mutationFn: (format: 'markdown' | 'html' | 'pdf') => releaseApi.exportNotes(id!, format),
    onSuccess: (data) => {
      window.open(data.downloadUrl, '_blank');
      toast.success('Export ready');
    },
    onError: () => toast.error('Failed to export release notes'),
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Loading..." description="">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !release) {
    return (
      <DashboardLayout title="Error" description="">
        <Card>
          <CardContent className="py-12 text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-medium mb-2">Release not found</h3>
            <Button onClick={() => navigate('/dashboard/releases')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Releases
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const handleSaveNotes = () => {
    updateNotesMutation.mutate(editedNotes);
  };

  const handleStartEdit = () => {
    setEditedNotes(release.releaseNotes);
    setIsEditingNotes(true);
  };

  return (
    <DashboardLayout 
      title={`Release v${release.version}`} 
      description={`${release.productName} - ${release.platform}`}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/releases')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{platformIcons[release.platform]}</span>
                <h1 className="text-2xl font-bold">v{release.version}</h1>
                <Badge className={statusColors[release.status]}>
                  {release.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                Build: {release.buildId} • {release.productName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDeployDialogOpen(true)}
              disabled={release.status === 'released' || release.status === 'rolled_back'}
            >
              <Rocket className="h-4 w-4 mr-2" />
              Deploy
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setIsRollbackDialogOpen(true)}
              disabled={release.status !== 'released' && release.status !== 'staged'}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Rollback
            </Button>
          </div>
        </div>

        <Tabs defaultValue="pipeline" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="content">Features & Bugs</TabsTrigger>
            <TabsTrigger value="notes">Release Notes</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>CI/CD Pipeline</CardTitle>
                <CardDescription>Monitor and control pipeline stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {release.pipeline.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No pipeline stages configured</p>
                  ) : (
                    release.pipeline.map((step, index) => {
                      const config = pipelineStatusConfig[step.status];
                      const Icon = config.icon;
                      return (
                        <div key={index} className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${config.bg}`}>
                            <Icon className={`h-5 w-5 ${config.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium capitalize">{step.stage}</p>
                                <p className="text-sm text-muted-foreground">
                                  {step.status === 'running' && 'In progress...'}
                                  {step.status === 'passed' && step.completedAt && 
                                    `Completed ${new Date(step.completedAt).toLocaleString()}`}
                                  {step.status === 'failed' && 'Failed'}
                                  {step.status === 'pending' && 'Waiting'}
                                  {step.status === 'skipped' && 'Skipped'}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {step.status === 'pending' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => startPipelineMutation.mutate(step.stage)}
                                    disabled={startPipelineMutation.isPending}
                                  >
                                    <Play className="h-3 w-3 mr-1" />
                                    Start
                                  </Button>
                                )}
                                {step.status === 'failed' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => retryPipelineMutation.mutate(step.stage)}
                                    disabled={retryPipelineMutation.isPending}
                                  >
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Retry
                                  </Button>
                                )}
                              </div>
                            </div>
                            {step.logs && (
                              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                                {step.logs}
                              </pre>
                            )}
                          </div>
                          {index < release.pipeline.length - 1 && (
                            <div className="absolute left-6 mt-10 h-4 w-0.5 bg-border" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Test Coverage */}
            <Card>
              <CardHeader>
                <CardTitle>Test Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        release.testCoverage >= 80 ? 'bg-green-500' :
                        release.testCoverage >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${release.testCoverage}%` }}
                    />
                  </div>
                  <span className="font-bold text-lg">{release.testCoverage}%</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Approval Workflow</CardTitle>
                  <CardDescription>Manage release approvals</CardDescription>
                </div>
                <Button onClick={() => setIsApprovalDialogOpen(true)}>
                  <Users className="h-4 w-4 mr-2" />
                  Request Approval
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <Badge variant={
                    release.approvalStatus === 'approved' ? 'default' :
                    release.approvalStatus === 'rejected' ? 'destructive' :
                    'secondary'
                  } className="text-base px-4 py-1">
                    {release.approvalStatus.toUpperCase()}
                  </Badge>
                  <span className="text-muted-foreground">
                    {release.approvers.filter(a => a.status === 'approved').length} of {release.approvers.length} approved
                  </span>
                </div>

                {release.approvers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No approvers assigned</p>
                ) : (
                  <div className="space-y-3">
                    {release.approvers.map((approver, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            approver.status === 'approved' ? 'bg-green-500/20' :
                            approver.status === 'rejected' ? 'bg-red-500/20' :
                            'bg-muted'
                          }`}>
                            {approver.status === 'approved' ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : approver.status === 'rejected' ? (
                              <XCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <Clock className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{approver.userName}</p>
                            {approver.comment && (
                              <p className="text-sm text-muted-foreground">{approver.comment}</p>
                            )}
                          </div>
                        </div>
                        {approver.approvedAt && (
                          <span className="text-sm text-muted-foreground">
                            {new Date(approver.approvedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <Separator className="my-6" />

                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label>Your Comment (optional)</Label>
                    <Textarea
                      placeholder="Add a comment..."
                      value={approvalComment}
                      onChange={(e) => setApprovalComment(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={() => approveMutation.mutate(approvalComment || undefined)}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      if (!approvalComment) {
                        toast.error('Please provide a reason for rejection');
                        return;
                      }
                      rejectMutation.mutate(approvalComment);
                    }}
                    disabled={rejectMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features & Bugs Tab */}
          <TabsContent value="content" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Features */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Features
                    </CardTitle>
                    <CardDescription>{release.features.length} features in this release</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setIsLinkFeatureDialogOpen(true)}>
                    <Link2 className="h-4 w-4 mr-1" />
                    Link
                  </Button>
                </CardHeader>
                <CardContent>
                  {release.features.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No features linked</p>
                  ) : (
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {release.features.map((feature) => (
                          <div 
                            key={feature.featureId}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{feature.featureTitle}</p>
                              <p className="text-xs text-muted-foreground">{feature.featureId}</p>
                            </div>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => unlinkFeatureMutation.mutate(feature.featureId)}
                              disabled={unlinkFeatureMutation.isPending}
                            >
                              <Unlink className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              {/* Bug Fixes */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bug className="h-5 w-5" />
                      Bug Fixes
                    </CardTitle>
                    <CardDescription>{release.bugFixes.length} bugs fixed in this release</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setIsLinkBugDialogOpen(true)}>
                    <Link2 className="h-4 w-4 mr-1" />
                    Link
                  </Button>
                </CardHeader>
                <CardContent>
                  {release.bugFixes.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No bug fixes linked</p>
                  ) : (
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {release.bugFixes.map((bug) => (
                          <div 
                            key={bug.bugId}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{bug.bugTitle}</p>
                              <p className="text-xs text-muted-foreground">{bug.bugId}</p>
                            </div>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => unlinkBugMutation.mutate(bug.bugId)}
                              disabled={unlinkBugMutation.isPending}
                            >
                              <Unlink className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Release Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Release Notes
                  </CardTitle>
                  <CardDescription>Document changes for this release</CardDescription>
                </div>
                <div className="flex gap-2">
                  {!isEditingNotes ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => generateNotesMutation.mutate()}
                        disabled={generateNotesMutation.isPending}
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        Generate
                      </Button>
                      <Button size="sm" onClick={handleStartEdit}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditingNotes(false)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleSaveNotes}
                        disabled={updateNotesMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditingNotes ? (
                  <Textarea
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    placeholder="# Release Notes\n\n## Features\n- Feature 1\n\n## Bug Fixes\n- Fix 1"
                    className="min-h-[400px] font-mono"
                  />
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {release.releaseNotes ? (
                      <pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg">
                        {release.releaseNotes}
                      </pre>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No release notes yet. Click Edit to add notes.
                      </p>
                    )}
                  </div>
                )}

                <Separator className="my-6" />

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exportNotesMutation.mutate('markdown')}
                    disabled={exportNotesMutation.isPending}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Markdown
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exportNotesMutation.mutate('html')}
                    disabled={exportNotesMutation.isPending}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    HTML
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exportNotesMutation.mutate('pdf')}
                    disabled={exportNotesMutation.isPending}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rollback History</CardTitle>
                <CardDescription>Previous rollbacks for this release</CardDescription>
              </CardHeader>
              <CardContent>
                {release.rollbackLogs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No rollbacks recorded</p>
                ) : (
                  <div className="space-y-4">
                    {release.rollbackLogs.map((log) => (
                      <div key={log.id} className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="destructive">v{log.version}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(log.rolledBackAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="font-medium">{log.reason}</p>
                        <p className="text-sm text-muted-foreground">
                          By: {log.rolledBackBy}
                        </p>
                        {log.notes && (
                          <p className="text-sm mt-2 text-muted-foreground">{log.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Release Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-muted">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(release.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {release.plannedDate && (
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-blue-500/20">
                        <Clock className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">Planned Release</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(release.plannedDate).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {release.releaseDate && (
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-green-500/20">
                        <Rocket className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">Released</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(release.releaseDate).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-muted">
                      <Edit className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Last Updated</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(release.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Deploy Dialog */}
        <Dialog open={isDeployDialogOpen} onOpenChange={setIsDeployDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deploy Release</DialogTitle>
              <DialogDescription>
                Deploy v{release.version} to an environment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Environment</Label>
                <Select 
                  value={deployEnvironment} 
                  onValueChange={(v: 'staging' | 'production') => setDeployEnvironment(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {deployEnvironment === 'production' && (
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <p className="text-sm text-destructive font-medium">
                    ⚠️ You are about to deploy to production. This action cannot be undone easily.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeployDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => deployMutation.mutate(deployEnvironment)}
                disabled={deployMutation.isPending}
              >
                {deployMutation.isPending ? 'Deploying...' : `Deploy to ${deployEnvironment}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rollback Dialog */}
        <Dialog open={isRollbackDialogOpen} onOpenChange={setIsRollbackDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rollback Release</DialogTitle>
              <DialogDescription>
                Rollback v{release.version} to a previous version
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Target Version *</Label>
                <Input
                  placeholder="e.g., 1.0.0"
                  value={rollbackVersion}
                  onChange={(e) => setRollbackVersion(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Reason *</Label>
                <Textarea
                  placeholder="Why are you rolling back this release?"
                  value={rollbackReason}
                  onChange={(e) => setRollbackReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRollbackDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => rollbackMutation.mutate()}
                disabled={rollbackMutation.isPending || !rollbackVersion || !rollbackReason}
              >
                {rollbackMutation.isPending ? 'Rolling back...' : 'Confirm Rollback'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Request Approval Dialog */}
        <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Approval</DialogTitle>
              <DialogDescription>
                Add approvers for this release
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Approver IDs (comma-separated)</Label>
                <Input
                  placeholder="user_1, user_2, user_3"
                  value={approverIds}
                  onChange={(e) => setApproverIds(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter user IDs of team members who should approve this release
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  const ids = approverIds.split(',').map(id => id.trim()).filter(Boolean);
                  if (ids.length === 0) {
                    toast.error('Please enter at least one approver ID');
                    return;
                  }
                  requestApprovalMutation.mutate(ids);
                }}
                disabled={requestApprovalMutation.isPending}
              >
                {requestApprovalMutation.isPending ? 'Requesting...' : 'Request Approval'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Link Feature Dialog */}
        <Dialog open={isLinkFeatureDialogOpen} onOpenChange={setIsLinkFeatureDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Link Feature</DialogTitle>
              <DialogDescription>
                Add a feature to this release
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Feature ID</Label>
                <Input
                  placeholder="feat_123"
                  value={newFeatureId}
                  onChange={(e) => setNewFeatureId(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLinkFeatureDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (!newFeatureId) {
                    toast.error('Please enter a feature ID');
                    return;
                  }
                  linkFeatureMutation.mutate(newFeatureId);
                }}
                disabled={linkFeatureMutation.isPending}
              >
                {linkFeatureMutation.isPending ? 'Linking...' : 'Link Feature'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Link Bug Dialog */}
        <Dialog open={isLinkBugDialogOpen} onOpenChange={setIsLinkBugDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Link Bug Fix</DialogTitle>
              <DialogDescription>
                Add a bug fix to this release
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Bug ID</Label>
                <Input
                  placeholder="bug_123"
                  value={newBugId}
                  onChange={(e) => setNewBugId(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLinkBugDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (!newBugId) {
                    toast.error('Please enter a bug ID');
                    return;
                  }
                  linkBugMutation.mutate(newBugId);
                }}
                disabled={linkBugMutation.isPending}
              >
                {linkBugMutation.isPending ? 'Linking...' : 'Link Bug Fix'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
