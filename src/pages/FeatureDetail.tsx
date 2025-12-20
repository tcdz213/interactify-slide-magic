import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  ThumbsUp,
  User,
  Calendar,
  Clock,
  Sparkles,
  Tag,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Play,
  RotateCcw,
  Shield,
  FileCheck,
  Code,
  Lock,
  Rocket,
} from 'lucide-react';
import { featuresApi } from '@/lib/api';
import {
  approvalApi,
  useApprovalWorkflow,
  useInitWorkflow,
  useApproveGate,
  useRejectGate,
  useRequestChanges,
} from '@/services/approvalApi';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import type { Feature, FeatureStatus, FeaturePriority, GateStatus, GateType } from '@/types/feature';

const STATUS_CONFIG: Record<FeatureStatus, { label: string; color: string }> = {
  idea: { label: 'Idea', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  review: { label: 'Review', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  approved: { label: 'Approved', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  planning: { label: 'Planning', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  design: { label: 'Design', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  development: { label: 'Development', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  testing: { label: 'Testing', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  release: { label: 'Release', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  live: { label: 'Live', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const PRIORITY_CONFIG: Record<FeaturePriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-slate-500/20 text-slate-400' },
  medium: { label: 'Medium', color: 'bg-blue-500/20 text-blue-400' },
  high: { label: 'High', color: 'bg-orange-500/20 text-orange-400' },
  critical: { label: 'Critical', color: 'bg-red-500/20 text-red-400' },
};

const GATE_ICONS: Record<GateType, React.ReactNode> = {
  design_review: <FileCheck className="h-5 w-5" />,
  technical_review: <Code className="h-5 w-5" />,
  security_review: <Shield className="h-5 w-5" />,
  release_approval: <Rocket className="h-5 w-5" />,
};

const GATE_STATUS_CONFIG: Record<GateStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-muted text-muted-foreground', icon: <Clock className="h-4 w-4" /> },
  approved: { label: 'Approved', color: 'bg-green-500/20 text-green-500', icon: <CheckCircle2 className="h-4 w-4" /> },
  rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-500', icon: <XCircle className="h-4 w-4" /> },
  changes_requested: { label: 'Changes Requested', color: 'bg-yellow-500/20 text-yellow-500', icon: <AlertCircle className="h-4 w-4" /> },
};

export default function FeatureDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [changesDialogOpen, setChangesDialogOpen] = useState(false);
  const [selectedGateId, setSelectedGateId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [changesComment, setChangesComment] = useState('');

  // Fetch feature
  const { data: featureData, isLoading: featureLoading } = useQuery({
    queryKey: ['feature', id],
    queryFn: () => featuresApi.getById(id!),
    enabled: !!id,
  });

  // Fetch approval workflow
  const { data: workflowData, isLoading: workflowLoading } = useApprovalWorkflow(id!);

  // Mutations
  const initWorkflow = useInitWorkflow();
  const approveGate = useApproveGate();
  const rejectGate = useRejectGate();
  const requestChanges = useRequestChanges();

  const feature = featureData?.data;
  const workflow = workflowData?.data;

  const handleVote = async () => {
    if (!feature || !user) return;
    try {
      const hasVoted = feature.votedBy?.includes(user.id);
      if (hasVoted) {
        await featuresApi.unvote(feature.id);
        toast.success('Vote removed');
      } else {
        await featuresApi.vote(feature.id);
        toast.success('Vote added');
      }
      queryClient.invalidateQueries({ queryKey: ['feature', id] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to vote');
    }
  };

  const handleInitWorkflow = () => {
    if (!id) return;
    initWorkflow.mutate({ featureId: id });
  };

  const handleApproveGate = (gateId: string) => {
    if (!id) return;
    approveGate.mutate({ featureId: id, gateId });
  };

  const handleRejectGate = () => {
    if (!id || !selectedGateId) return;
    rejectGate.mutate({ featureId: id, gateId: selectedGateId, reason: rejectReason });
    setRejectDialogOpen(false);
    setRejectReason('');
    setSelectedGateId(null);
  };

  const handleRequestChanges = () => {
    if (!id || !selectedGateId) return;
    requestChanges.mutate({ featureId: id, gateId: selectedGateId, comment: changesComment });
    setChangesDialogOpen(false);
    setChangesComment('');
    setSelectedGateId(null);
  };

  const getWorkflowProgress = () => {
    if (!workflow || !workflow.gates) return 0;
    const approvedCount = workflow.gates.filter(g => g.status === 'approved').length;
    return Math.round((approvedCount / workflow.gates.length) * 100);
  };

  if (featureLoading || !feature) {
    return (
      <DashboardLayout title="Feature Details" description="Loading...">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-secondary rounded-lg" />
          <div className="h-64 bg-secondary rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={feature.title}
      description={`Feature request for ${feature.productName}`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/dashboard/features')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            variant="outline"
            onClick={handleVote}
            className={feature.votedBy?.includes(user?.id || '') ? 'border-primary text-primary' : ''}
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            {feature.votes}
          </Button>
        </div>
      }
    >
      {/* Feature Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant="outline" className={STATUS_CONFIG[feature.status].color}>
                  {STATUS_CONFIG[feature.status].label}
                </Badge>
              </div>
              <Sparkles className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Priority</p>
                <Badge variant="outline" className={PRIORITY_CONFIG[feature.priority].color}>
                  {PRIORITY_CONFIG[feature.priority].label}
                </Badge>
              </div>
              <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Requested By</p>
                <p className="font-medium">{feature.requestedByName}</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{format(new Date(feature.createdAt), 'MMM d, yyyy')}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflow">Approval Workflow</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{feature.description}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Product
                  </span>
                  <span className="font-medium">{feature.productName}</span>
                </div>
                {feature.assigneeName && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Assignee
                    </span>
                    <span className="font-medium">{feature.assigneeName}</span>
                  </div>
                )}
                {feature.sprintName && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Sprint
                    </span>
                    <span className="font-medium">{feature.sprintName}</span>
                  </div>
                )}
                {feature.estimatedHours && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Estimated Hours
                    </span>
                    <span className="font-medium">{feature.estimatedHours}h</span>
                  </div>
                )}
                {feature.actualHours && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Actual Hours
                    </span>
                    <span className="font-medium">{feature.actualHours}h</span>
                  </div>
                )}
                {feature.dueDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Due Date
                    </span>
                    <span className="font-medium">{format(new Date(feature.dueDate), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                {feature.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {feature.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No tags assigned</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Approval Workflow Tab */}
        <TabsContent value="workflow" className="mt-6">
          {workflowLoading ? (
            <Card className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-secondary rounded w-1/3" />
                <div className="h-24 bg-secondary rounded" />
              </div>
            </Card>
          ) : !workflow ? (
            <Card className="p-12 text-center">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Approval Workflow</h3>
              <p className="text-muted-foreground mb-6">
                Initialize an approval workflow to track feature progress through review gates.
              </p>
              <Button onClick={handleInitWorkflow} disabled={initWorkflow.isPending}>
                <Play className="h-4 w-4 mr-2" />
                {initWorkflow.isPending ? 'Initializing...' : 'Initialize Workflow'}
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Workflow Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Workflow Progress</span>
                    <Badge variant={
                      workflow.status === 'approved' ? 'default' :
                      workflow.status === 'rejected' ? 'destructive' :
                      'secondary'
                    }>
                      {workflow.status.replace('_', ' ')}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {workflow.gates.filter(g => g.status === 'approved').length} of {workflow.gates.length} gates approved
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={getWorkflowProgress()} className="h-3" />
                </CardContent>
              </Card>

              {/* Approval Gates */}
              <div className="space-y-4">
                {workflow.gates.map((gate, index) => {
                  const isCurrentGate = index === workflow.currentGateIndex;
                  const isPast = index < workflow.currentGateIndex;
                  const isFuture = index > workflow.currentGateIndex;

                  return (
                    <Card
                      key={gate.id}
                      className={`transition-all ${
                        isCurrentGate ? 'border-primary ring-1 ring-primary/20' :
                        isPast ? 'opacity-75' : ''
                      }`}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-start gap-4">
                          {/* Gate Icon */}
                          <div className={`p-3 rounded-lg ${
                            gate.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                            gate.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                            gate.status === 'changes_requested' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {GATE_ICONS[gate.type as GateType] || <FileCheck className="h-5 w-5" />}
                          </div>

                          {/* Gate Info */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">{gate.label}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Gate {index + 1} • {gate.type.replace('_', ' ')}
                                </p>
                              </div>
                              <Badge className={GATE_STATUS_CONFIG[gate.status].color}>
                                {GATE_STATUS_CONFIG[gate.status].icon}
                                <span className="ml-1">{GATE_STATUS_CONFIG[gate.status].label}</span>
                              </Badge>
                            </div>

                            {/* Gate Details */}
                            {gate.approvedByName && (
                              <p className="text-sm text-muted-foreground">
                                <CheckCircle2 className="h-4 w-4 inline mr-1 text-green-500" />
                                Approved by {gate.approvedByName}
                                {gate.approvedAt && ` on ${format(new Date(gate.approvedAt), 'MMM d, yyyy')}`}
                              </p>
                            )}

                            {/* Gate Actions */}
                            {isCurrentGate && gate.status === 'pending' && (
                              <div className="flex items-center gap-2 mt-4">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveGate(gate.id)}
                                  disabled={approveGate.isPending}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedGateId(gate.id);
                                    setChangesDialogOpen(true);
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Request Changes
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedGateId(gate.id);
                                    setRejectDialogOpen(true);
                                  }}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            )}

                            {gate.status === 'changes_requested' && isCurrentGate && (
                              <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                <p className="text-sm font-medium text-yellow-600">Changes Requested</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Address the requested changes and re-submit for review.
                                </p>
                                <Button
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => handleApproveGate(gate.id)}
                                >
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Re-submit for Approval
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Gate</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this approval gate.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectGate}
              disabled={!rejectReason.trim() || rejectGate.isPending}
            >
              {rejectGate.isPending ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Changes Dialog */}
      <Dialog open={changesDialogOpen} onOpenChange={setChangesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Describe the changes needed before approval.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter required changes..."
              value={changesComment}
              onChange={(e) => setChangesComment(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangesDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRequestChanges}
              disabled={!changesComment.trim() || requestChanges.isPending}
            >
              {requestChanges.isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
