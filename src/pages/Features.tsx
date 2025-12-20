import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
} from '@/components/ui/dropdown-menu';
import { 
  Plus, Search, MoreVertical, Sparkles, Edit, Trash2, 
  ThumbsUp, ArrowRight, Clock, User, Calendar, Eye, Zap,
  Monitor, Smartphone, Globe, Server, Laptop
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { featuresApi } from '@/lib/api';
import { FeatureDialog } from '@/components/dialogs/FeatureDialog';
import { FeatureSprintDialog } from '@/components/dialogs/FeatureSprintDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { Feature, FeatureStatus, FeaturePriority, FeaturePlatform, CreateFeatureRequest, UpdateFeatureRequest } from '@/types/feature';

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

const PLATFORM_CONFIG: Record<FeaturePlatform, { label: string; icon: React.ReactNode; color: string }> = {
  web: { label: 'Web', icon: <Globe className="h-3 w-3" />, color: 'bg-blue-500/20 text-blue-400' },
  android: { label: 'Android', icon: <Smartphone className="h-3 w-3" />, color: 'bg-green-500/20 text-green-400' },
  ios: { label: 'iOS', icon: <Smartphone className="h-3 w-3" />, color: 'bg-slate-500/20 text-slate-400' },
  api: { label: 'API', icon: <Server className="h-3 w-3" />, color: 'bg-purple-500/20 text-purple-400' },
  desktop: { label: 'Desktop', icon: <Laptop className="h-3 w-3" />, color: 'bg-orange-500/20 text-orange-400' },
};

export default function Features() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FeatureStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<FeaturePriority | 'all'>('all');
  const [platformFilter, setPlatformFilter] = useState<FeaturePlatform | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sprintDialogOpen, setSprintDialogOpen] = useState(false);
  const [sprintDialogFeature, setSprintDialogFeature] = useState<Feature | null>(null);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [deleteFeature, setDeleteFeature] = useState<Feature | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, hasNext: false, hasPrev: false });

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const response = await featuresApi.list({
        page,
        limit,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        platform: platformFilter !== 'all' ? platformFilter : undefined,
      });
      setFeatures(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      toast.error('Failed to load features');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, [search, statusFilter, priorityFilter, platformFilter, page]);

  const handleCreate = () => {
    setEditingFeature(null);
    setDialogOpen(true);
  };

  const handleEdit = (feature: Feature) => {
    setEditingFeature(feature);
    setDialogOpen(true);
  };

  const handleSave = async (data: CreateFeatureRequest | UpdateFeatureRequest) => {
    try {
      if (editingFeature) {
        await featuresApi.update(editingFeature.id, data);
        toast.success('Feature updated successfully');
      } else {
        await featuresApi.create(data as CreateFeatureRequest);
        toast.success('Feature created successfully');
      }
      fetchFeatures();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save feature');
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deleteFeature) return;
    try {
      await featuresApi.delete(deleteFeature.id);
      toast.success('Feature deleted successfully');
      setDeleteFeature(null);
      fetchFeatures();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete feature');
    }
  };

  const handleVote = async (feature: Feature) => {
    try {
      const hasVoted = feature.votedBy?.includes(user?.id || '');
      if (hasVoted) {
        await featuresApi.unvote(feature.id);
        toast.success('Vote removed');
      } else {
        await featuresApi.vote(feature.id);
        toast.success('Vote added');
      }
      fetchFeatures();
    } catch (error: any) {
      toast.error(error.message || 'Failed to vote');
    }
  };

  const handleStatusChange = async (feature: Feature, newStatus: FeatureStatus) => {
    try {
      await featuresApi.updateStatus(feature.id, newStatus);
      toast.success(`Status updated to ${STATUS_CONFIG[newStatus].label}`);
      fetchFeatures();
    } catch (error: any) {
      toast.error(error.message || 'Invalid status transition');
    }
  };

  const handleOpenSprintDialog = (feature: Feature) => {
    setSprintDialogFeature(feature);
    setSprintDialogOpen(true);
  };

  return (
    <DashboardLayout
      title="Features"
      description="Manage feature requests and track their progress"
      actions={
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Feature
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search features..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FeatureStatus | 'all')}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([value, config]) => (
              <SelectItem key={value} value={value}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as FeaturePriority | 'all')}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
              <SelectItem key={value} value={value}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={platformFilter} onValueChange={(v) => setPlatformFilter(v as FeaturePlatform | 'all')}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {Object.entries(PLATFORM_CONFIG).map(([value, config]) => (
              <SelectItem key={value} value={value}>
                <div className="flex items-center gap-2">
                  {config.icon}
                  {config.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Features List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 bg-secondary rounded w-1/2 mb-4" />
              <div className="h-4 bg-secondary rounded w-full mb-2" />
              <div className="h-4 bg-secondary rounded w-3/4" />
            </Card>
          ))}
        </div>
      ) : features.length === 0 ? (
        <Card className="p-12 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No features found</h3>
          <p className="text-muted-foreground mb-4">
            {search || statusFilter !== 'all' || priorityFilter !== 'all' || platformFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Start by creating your first feature request'}
          </p>
          {!search && statusFilter === 'all' && priorityFilter === 'all' && platformFilter === 'all' && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Feature
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {features.map((feature) => (
            <Card key={feature.id} className="p-6 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate(`/dashboard/features/${feature.id}`)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold truncate">{feature.title}</h3>
                    <Badge variant="outline" className={STATUS_CONFIG[feature.status].color}>
                      {STATUS_CONFIG[feature.status].label}
                    </Badge>
                    <Badge variant="outline" className={PRIORITY_CONFIG[feature.priority].color}>
                      {PRIORITY_CONFIG[feature.priority].label}
                    </Badge>
                    {feature.platform && PLATFORM_CONFIG[feature.platform] && (
                      <Badge variant="outline" className={PLATFORM_CONFIG[feature.platform].color}>
                        <span className="mr-1">{PLATFORM_CONFIG[feature.platform].icon}</span>
                        {PLATFORM_CONFIG[feature.platform].label}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {feature.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {feature.requestedByName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      {feature.productName}
                    </span>
                    {feature.estimatedHours && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {feature.estimatedHours}h estimated
                      </span>
                    )}
                    {feature.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(feature.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {feature.sprintName && (
                      <span className="flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5 text-primary" />
                        {feature.sprintName}
                      </span>
                    )}
                  </div>

                  {feature.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {feature.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVote(feature)}
                    className={feature.votedBy?.includes(user?.id || '') ? 'border-primary text-primary' : ''}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {feature.votes}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => navigate(`/dashboard/features/${feature.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(feature)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleOpenSprintDialog(feature)}>
                        <Zap className="h-4 w-4 mr-2" />
                        {feature.sprintId ? 'Change Sprint' : 'Assign to Sprint'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleStatusChange(feature, 'review')}>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Move to Review
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(feature, 'approved')}>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(feature, 'development')}>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Start Development
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setDeleteFeature(feature)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && features.length > 0 && (
        <PaginationControls
          page={page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          total={pagination.total}
          limit={limit}
        />
      )}

      {/* Dialogs */}
      <FeatureDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        feature={editingFeature}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleteFeature}
        onOpenChange={(open) => !open && setDeleteFeature(null)}
        title="Delete Feature"
        description={`Are you sure you want to delete "${deleteFeature?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />

      <FeatureSprintDialog
        open={sprintDialogOpen}
        onOpenChange={setSprintDialogOpen}
        featureId={sprintDialogFeature?.id || ''}
        featureTitle={sprintDialogFeature?.title || ''}
        currentSprintId={sprintDialogFeature?.sprintId}
        currentSprintName={sprintDialogFeature?.sprintName}
        onSuccess={fetchFeatures}
      />
    </DashboardLayout>
  );
}
