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
import { Plus, Search, MoreVertical, Package, Edit, Trash2, BarChart3, Users } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { ProductDialog } from '@/components/dialogs/ProductDialog';
import { ProductStatsDialog } from '@/components/dialogs/ProductStatsDialog';
import { ProductTeamDialog } from '@/components/dialogs/ProductTeamDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { toast } from 'sonner';
import type { Product, ProductPlatform, ProductStatus, CreateProductRequest, UpdateProductRequest } from '@/types/product';

const PLATFORM_COLORS: Record<ProductPlatform, string> = {
  web: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  android: 'bg-green-500/20 text-green-400 border-green-500/30',
  ios: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  api: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  desktop: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all');
  const [platformFilter, setPlatformFilter] = useState<ProductPlatform | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [statsProduct, setStatsProduct] = useState<Product | null>(null);
  const [teamProduct, setTeamProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.list({
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        platform: platformFilter !== 'all' ? platformFilter : undefined,
      });
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, statusFilter, platformFilter]);

  const handleCreate = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleSave = async (data: CreateProductRequest | UpdateProductRequest) => {
    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, data);
        toast.success('Product updated successfully');
      } else {
        await productsApi.create(data as CreateProductRequest);
        toast.success('Product created successfully');
      }
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;
    try {
      await productsApi.delete(deleteProduct.id);
      toast.success('Product archived successfully');
      setDeleteProduct(null);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  return (
    <DashboardLayout
      title="Products"
      description="Manage your products and applications"
      actions={
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Product
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ProductStatus | 'all')}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={platformFilter} onValueChange={(v) => setPlatformFilter(v as ProductPlatform | 'all')}>
          <SelectTrigger className="w-32">
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
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 bg-secondary rounded w-3/4 mb-4" />
              <div className="h-4 bg-secondary rounded w-full mb-2" />
              <div className="h-4 bg-secondary rounded w-2/3" />
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            {search || statusFilter !== 'all' || platformFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first product'}
          </p>
          {!search && statusFilter === 'all' && platformFilter === 'all' && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Product
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="p-6 hover:border-primary/30 transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">by {product.ownerName}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(product)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatsProduct(product)}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Stats
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTeamProduct(product)}>
                      <Users className="h-4 w-4 mr-2" />
                      Manage Team
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setDeleteProduct(product)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {product.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {product.platforms.map((platform) => (
                  <Badge key={platform} variant="outline" className={PLATFORM_COLORS[platform]}>
                    {platform}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-4">
                <span>{product.featuresCount} features</span>
                <span>{product.bugsCount} bugs</span>
                <span>{product.teamMembersCount} members</span>
              </div>

              {product.status === 'archived' && (
                <Badge variant="secondary" className="mt-3">Archived</Badge>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleteProduct}
        onOpenChange={(open) => !open && setDeleteProduct(null)}
        title="Archive Product"
        description={`Are you sure you want to archive "${deleteProduct?.name}"? This action can be undone later.`}
        confirmLabel="Archive"
        variant="destructive"
        onConfirm={handleDelete}
      />

      <ProductStatsDialog
        open={!!statsProduct}
        onOpenChange={(open) => !open && setStatsProduct(null)}
        productId={statsProduct?.id || null}
        productName={statsProduct?.name || ''}
      />

      <ProductTeamDialog
        open={!!teamProduct}
        onOpenChange={(open) => !open && setTeamProduct(null)}
        productId={teamProduct?.id || null}
        productName={teamProduct?.name || ''}
      />
    </DashboardLayout>
  );
}
