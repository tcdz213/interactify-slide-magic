import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEO } from "@/components/SEO";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsService, Product } from "@/services/products";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { toast } from "sonner";
import { ProductDialog } from "@/components/ProductDialog";

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: async ({ data, images }: { data: any; images?: File[] }) => {
      const product = await productsService.create(data);
      
      if (images && images.length > 0) {
        for (const image of images) {
          await productsService.uploadImage(product.id, image);
        }
      }
      
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('تم إضافة المنتج بنجاح');
      setDialogOpen(false);
      setSelectedProduct(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة المنتج');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, images }: { id: string; data: any; images?: File[] }) => {
      const product = await productsService.update(id, data);
      
      if (images && images.length > 0) {
        for (const image of images) {
          await productsService.uploadImage(id, image);
        }
      }
      
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('تم تحديث المنتج بنجاح');
      setDialogOpen(false);
      setSelectedProduct(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث المنتج');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('تم حذف المنتج بنجاح');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المنتج');
    },
  });

  const handleProductSubmit = async (data: any, images?: File[]) => {
    if (selectedProduct) {
      await updateMutation.mutateAsync({ id: selectedProduct.id, data, images });
    } else {
      await createMutation.mutateAsync({ data, images });
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div dir="rtl">
      <SEO
        title="المنتجات"
        description="إدارة منتجاتك - إضافة، تعديل، وحذف المنتجات من متجرك الإلكتروني."
        noindex={true}
      />
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">المنتجات</h1>
          <p className="text-muted-foreground">إدارة منتجاتك</p>
        </div>
        <Button className="bg-gradient-primary" onClick={handleAddNew}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة منتج
        </Button>
      </div>

      <Card className="p-4 mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="ابحث عن منتج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
      </Card>

      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="لا توجد منتجات"
          description="ابدأ بإضافة منتجك الأول"
          action={{
            label: "إضافة منتج",
            onClick: handleAddNew,
          }}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={product.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-2xl font-bold text-primary">{product.price} {product.currency}</p>
                  <p className="text-sm text-muted-foreground">المخزون: {product.stock}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(product)}>
                    <Edit className="w-4 h-4 ml-2" />
                    تعديل
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => {
                      if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                        deleteMutation.mutate(product.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
        onSubmit={handleProductSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};

export default Products;
