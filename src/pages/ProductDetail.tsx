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
  Package,
  Users,
  Bug,
  Sparkles,
  Calendar,
  Edit,
  Trash2,
  UserPlus,
  BarChart3,
  Globe,
  Smartphone,
  Server,
  Laptop,
  ExternalLink,
} from 'lucide-react';
import { productsApi } from '@/lib/api';
import { ProductDialog } from '@/components/dialogs/ProductDialog';
import { ProductTeamDialog } from '@/components/dialogs/ProductTeamDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Product, ProductPlatform, ProductStats, UpdateProductRequest } from '@/types/product';

const PLATFORM_CONFIG: Record<ProductPlatform, { label: string; icon: React.ReactNode; color: string }> = {
  web: { label: 'Web', icon: <Globe className="h-4 w-4" />, color: 'bg-blue-500/20 text-blue-400' },
  android: { label: 'Android', icon: <Smartphone className="h-4 w-4" />, color: 'bg-green-500/20 text-green-400' },
  ios: { label: 'iOS', icon: <Smartphone className="h-4 w-4" />, color: 'bg-slate-500/20 text-slate-400' },
  api: { label: 'API', icon: <Server className="h-4 w-4" />, color: 'bg-purple-500/20 text-purple-400' },
  desktop: { label: 'Desktop', icon: <Laptop className="h-4 w-4" />, color: 'bg-orange-500/20 text-orange-400' },
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch product
  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id!),
    enabled: !!id,
  });

  // Fetch product stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['product-stats', id],
    queryFn: () => productsApi.getStats(id!),
    enabled: !!id,
  });

  // Fetch product team
  const { data: teamData, isLoading: teamLoading } = useQuery({
    queryKey: ['product-team', id],
    queryFn: () => productsApi.getTeam(id!),
    enabled: !!id,
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateProductRequest) => productsApi.update(id!, data),
    onSuccess: () => {
      toast.success('Product updated');
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      setEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: () => productsApi.delete(id!),
    onSuccess: () => {
      toast.success('Product archived');
      navigate('/dashboard/products');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const product = productData?.data;
  const stats = statsData?.data;
  const team = teamData?.data || [];

  if (productLoading || !product) {
    return (
      <DashboardLayout title="Product Details" description="Loading...">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-secondary rounded-lg" />
          <div className="h-64 bg-secondary rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={product.name}
      description={product.description}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/dashboard/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      }
    >
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                  {product.status}
                </Badge>
              </div>
              <Package className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Features</p>
                <p className="text-2xl font-bold">{product.featuresCount}</p>
              </div>
              <Sparkles className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bugs</p>
                <p className="text-2xl font-bold">{product.bugsCount}</p>
              </div>
              <Bug className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team</p>
                <p className="text-2xl font-bold">{product.teamMembersCount}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Owner</span>
                  <span className="font-medium">{product.ownerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{format(new Date(product.createdAt), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span className="font-medium">{format(new Date(product.updatedAt), 'MMM d, yyyy')}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platforms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {product.platforms.map((platform) => {
                    const config = PLATFORM_CONFIG[platform];
                    return (
                      <Badge key={platform} variant="outline" className={config.color}>
                        <span className="mr-1">{config.icon}</span>
                        {config.label}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate(`/dashboard/features?productId=${product.id}`)}>
                <Sparkles className="h-4 w-4 mr-2" />
                View Features
              </Button>
              <Button variant="outline" onClick={() => navigate(`/dashboard/bugs?productId=${product.id}`)}>
                <Bug className="h-4 w-4 mr-2" />
                View Bugs
              </Button>
              <Button variant="outline" onClick={() => setTeamDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Manage Team
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Archive Product
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>{team.length} members</CardDescription>
              </div>
              <Button onClick={() => setTeamDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </CardHeader>
            <CardContent>
              {teamLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : team.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No team members yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {team.map((member) => (
                    <div key={member.userId} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                      <Avatar>
                        <AvatarImage src={member.userAvatar} />
                        <AvatarFallback>{member.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{member.userName}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      <Badge variant="secondary">{member.role}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="mt-6">
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stats ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-2xl font-bold">{stats.totalFeatures}</p>
                    <p className="text-sm text-muted-foreground">Total Features</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-2xl font-bold">{stats.completedFeatures}</p>
                    <p className="text-sm text-muted-foreground">Completed Features</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-2xl font-bold">{stats.openBugs}</p>
                    <p className="text-sm text-muted-foreground">Open Bugs</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-2xl font-bold">{stats.resolvedBugs}</p>
                    <p className="text-sm text-muted-foreground">Resolved Bugs</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Feature Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {stats.totalFeatures > 0 
                          ? Math.round((stats.completedFeatures / stats.totalFeatures) * 100) 
                          : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={stats.totalFeatures > 0 
                        ? (stats.completedFeatures / stats.totalFeatures) * 100 
                        : 0} 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bug Resolution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Resolved</span>
                      <span>
                        {(stats.openBugs + stats.resolvedBugs) > 0 
                          ? Math.round((stats.resolvedBugs / (stats.openBugs + stats.resolvedBugs)) * 100) 
                          : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={(stats.openBugs + stats.resolvedBugs) > 0 
                        ? (stats.resolvedBugs / (stats.openBugs + stats.resolvedBugs)) * 100 
                        : 0} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No statistics available</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ProductDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        product={product}
        onSave={async (data) => { updateMutation.mutate(data as UpdateProductRequest); }}
      />

      <ProductTeamDialog
        open={teamDialogOpen}
        onOpenChange={setTeamDialogOpen}
        productId={product.id}
        productName={product.name}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Archive Product"
        description={`Are you sure you want to archive "${product.name}"? This action can be undone later.`}
        confirmLabel="Archive"
        variant="destructive"
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
