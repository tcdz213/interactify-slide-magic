import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Card } from "@/components/ui/card";

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [products] = useState([
    { id: 1, name: "منتج تجريبي 1", price: 2500, stock: 45, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
    { id: 2, name: "منتج تجريبي 2", price: 1800, stock: 32, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" },
    { id: 3, name: "منتج تجريبي 3", price: 3200, stock: 18, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400" },
  ]);

  return (
    <div dir="rtl">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">المنتجات</h1>
          <p className="text-muted-foreground">إدارة منتجاتك</p>
        </div>
        <Button className="bg-gradient-primary">
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

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="لا توجد منتجات"
          description="ابدأ بإضافة منتجك الأول"
          action={{
            label: "إضافة منتج",
            onClick: () => {},
          }}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-2xl font-bold text-primary">{product.price} د.ج</p>
                  <p className="text-sm text-muted-foreground">المخزون: {product.stock}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 ml-2" />
                    تعديل
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
