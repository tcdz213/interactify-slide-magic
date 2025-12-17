import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { releaseApi } from '@/services/releaseApi';
import { productsApi } from '@/services/productApi';
import { toast } from 'sonner';
import { Plus, Search, Rocket, CheckCircle, XCircle, Clock, AlertTriangle, Play, RotateCcw } from 'lucide-react';
import type { Release, ReleaseStatus, ReleasePlatform, CreateReleaseRequest } from '@/types/release';

const statusColors: Record<ReleaseStatus, string> = {
  planning: 'bg-muted text-muted-foreground',
  scheduled: 'bg-blue-500/20 text-blue-500',
  in_development: 'bg-yellow-500/20 text-yellow-500',
  testing: 'bg-purple-500/20 text-purple-500',
  staged: 'bg-orange-500/20 text-orange-500',
  released: 'bg-green-500/20 text-green-500',
  rolled_back: 'bg-red-500/20 text-red-500',
};

const platformIcons: Record<ReleasePlatform, string> = {
  web: '🌐',
  android: '🤖',
  ios: '🍎',
  api: '⚡',
  desktop: '💻',
};

const pipelineStatusIcons = {
  pending: <Clock className="h-4 w-4 text-muted-foreground" />,
  running: <Play className="h-4 w-4 text-blue-500 animate-pulse" />,
  passed: <CheckCircle className="h-4 w-4 text-green-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
  skipped: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
};

export default function Releases() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRelease, setNewRelease] = useState<CreateReleaseRequest>({
    version: '',
    buildId: '',
    productId: '',
    platform: 'web',
    releaseNotes: '',
  });

  const { data: releasesData, isLoading } = useQuery({
    queryKey: ['releases', statusFilter, platformFilter],
    queryFn: () => releaseApi.getAll({
      status: statusFilter !== 'all' ? statusFilter as ReleaseStatus : undefined,
      platform: platformFilter !== 'all' ? platformFilter as ReleasePlatform : undefined,
    }),
  });

  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.list({ limit: 100 }),
  });

  const products = productsData?.data || [];

  const createMutation = useMutation({
    mutationFn: releaseApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      setIsCreateDialogOpen(false);
      setNewRelease({ version: '', buildId: '', productId: '', platform: 'web', releaseNotes: '' });
      toast.success('Release created successfully');
    },
    onError: () => toast.error('Failed to create release'),
  });

  const deleteMutation = useMutation({
    mutationFn: releaseApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      toast.success('Release deleted');
    },
    onError: () => toast.error('Failed to delete release'),
  });

  const releases = releasesData?.data || [];
  const filteredReleases = releases.filter((r: Release) =>
    r.version.toLowerCase().includes(search.toLowerCase()) ||
    r.productName.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!newRelease.version || !newRelease.buildId || !newRelease.productId) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate(newRelease);
  };

  return (
    <DashboardLayout title="Releases" description="Manage software releases and deployments">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search releases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_development">In Development</SelectItem>
              <SelectItem value="testing">Testing</SelectItem>
              <SelectItem value="staged">Staged</SelectItem>
              <SelectItem value="released">Released</SelectItem>
              <SelectItem value="rolled_back">Rolled Back</SelectItem>
            </SelectContent>
          </Select>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="web">Web</SelectItem>
              <SelectItem value="android">Android</SelectItem>
              <SelectItem value="ios">iOS</SelectItem>
              <SelectItem value="api">API</SelectItem>
              <SelectItem value="desktop">Desktop</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Release
          </Button>
        </div>

        {/* Releases Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading releases...</div>
        ) : filteredReleases.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Rocket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No releases found</h3>
              <p className="text-muted-foreground mb-4">Create your first release to get started</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Release
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredReleases.map((release: Release) => (
              <Card 
                key={release.id} 
                className="hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/dashboard/releases/${release.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span>{platformIcons[release.platform]}</span>
                        v{release.version}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{release.productName}</p>
                    </div>
                    <Badge className={statusColors[release.status]}>
                      {release.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p>Build: {release.buildId}</p>
                    {release.plannedDate && (
                      <p>Planned: {new Date(release.plannedDate).toLocaleDateString()}</p>
                    )}
                  </div>

                  {/* Pipeline Progress */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Pipeline</p>
                    <div className="flex gap-1">
                      {release.pipeline.slice(0, 6).map((step, i) => (
                        <div
                          key={i}
                          className="flex-1 h-2 rounded-full bg-muted overflow-hidden"
                          title={`${step.stage}: ${step.status}`}
                        >
                          <div
                            className={`h-full ${
                              step.status === 'passed' ? 'bg-green-500' :
                              step.status === 'running' ? 'bg-blue-500 animate-pulse' :
                              step.status === 'failed' ? 'bg-red-500' :
                              'bg-transparent'
                            }`}
                            style={{ width: step.status !== 'pending' ? '100%' : '0%' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {release.features.length} features
                    </span>
                    <span className="text-muted-foreground">
                      {release.bugFixes.length} fixes
                    </span>
                    <span className="text-muted-foreground">
                      {release.testCoverage}% coverage
                    </span>
                  </div>

                  {/* Approval Status */}
                  {release.approvers.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        release.approvalStatus === 'approved' ? 'default' :
                        release.approvalStatus === 'rejected' ? 'destructive' :
                        'secondary'
                      }>
                        {release.approvalStatus}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {release.approvers.filter(a => a.status === 'approved').length}/{release.approvers.length} approved
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Release</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Version *</Label>
                  <Input
                    placeholder="1.0.0"
                    value={newRelease.version}
                    onChange={(e) => setNewRelease({ ...newRelease, version: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Build ID *</Label>
                  <Input
                    placeholder="build-2025-01-01"
                    value={newRelease.buildId}
                    onChange={(e) => setNewRelease({ ...newRelease, buildId: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product *</Label>
                  <Select
                    value={newRelease.productId}
                    onValueChange={(v) => setNewRelease({ ...newRelease, productId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select
                    value={newRelease.platform}
                    onValueChange={(v: ReleasePlatform) => setNewRelease({ ...newRelease, platform: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web">🌐 Web</SelectItem>
                      <SelectItem value="android">🤖 Android</SelectItem>
                      <SelectItem value="ios">🍎 iOS</SelectItem>
                      <SelectItem value="api">⚡ API</SelectItem>
                      <SelectItem value="desktop">💻 Desktop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Release Notes</Label>
                <Textarea
                  placeholder="# Release Notes..."
                  value={newRelease.releaseNotes}
                  onChange={(e) => setNewRelease({ ...newRelease, releaseNotes: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Release'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
