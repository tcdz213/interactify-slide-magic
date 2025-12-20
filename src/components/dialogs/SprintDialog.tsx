import { useEffect, useState } from 'react';
import { addWeeks, format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { productsApi } from '@/lib/api';
import type { Product } from '@/types/product';
import type { Sprint, CreateSprintData, UpdateSprintData } from '@/types/sprint';

type DurationType = '1week' | '2weeks' | 'manual';

interface SprintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sprint: Sprint | null;
  onSave: (data: CreateSprintData | UpdateSprintData) => Promise<void>;
}

export function SprintDialog({ open, onOpenChange, sprint, onSave }: SprintDialogProps) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [productId, setProductId] = useState('');
  const [durationType, setDurationType] = useState<DurationType>('2weeks');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const isEditing = !!sprint;

  // Fetch products on dialog open
  useEffect(() => {
    if (open && !isEditing) {
      const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
          const response = await productsApi.list({ status: 'active' });
          setProducts(response.data);
        } catch (error) {
          console.error('Failed to load products:', error);
        } finally {
          setLoadingProducts(false);
        }
      };
      fetchProducts();
    }
  }, [open, isEditing]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (sprint) {
        setName(sprint.name);
        setGoal(sprint.goal);
        setProductId(sprint.productId);
        setStartDate(new Date(sprint.startDate));
        setEndDate(new Date(sprint.endDate));
        setDurationType('manual');
      } else {
        setName('');
        setGoal('');
        setProductId('');
        setStartDate(undefined);
        setEndDate(undefined);
        setDurationType('2weeks');
      }
    }
  }, [open, sprint]);

  // Auto-calculate end date based on duration type
  useEffect(() => {
    if (startDate && durationType !== 'manual') {
      const weeks = durationType === '1week' ? 1 : 2;
      setEndDate(addWeeks(startDate, weeks));
    }
  }, [startDate, durationType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    setLoading(true);

    try {
      const data: CreateSprintData | UpdateSprintData = isEditing
        ? {
            name,
            goal,
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),
          }
        : {
            name,
            goal,
            productId,
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),
          };

      await onSave(data);
      onOpenChange(false);
    } catch (error) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Sprint' : 'Create Sprint'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update sprint details. Only available for sprints in planning status.'
                : 'Create a new sprint to organize your work.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Sprint Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sprint 24"
                required
                minLength={2}
                maxLength={100}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="goal">Sprint Goal</Label>
              <Textarea
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Describe the main objective of this sprint..."
                required
                minLength={10}
                maxLength={500}
                rows={3}
              />
            </div>

            {!isEditing && (
              <div className="grid gap-2">
                <Label>Product</Label>
                <Select value={productId} onValueChange={setProductId} required>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingProducts ? "Loading products..." : "Select a product"} />
                  </SelectTrigger>
                  <SelectContent className="z-[100] bg-popover">
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label>Sprint Duration</Label>
              <Select value={durationType} onValueChange={(v) => setDurationType(v as DurationType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-popover">
                  <SelectItem value="1week">1 Week</SelectItem>
                  <SelectItem value="2weeks">2 Weeks</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "MMM d, yyyy") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[100]" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                      disabled={durationType !== 'manual'}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "MMM d, yyyy") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[100]" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => startDate ? date < startDate : false}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !startDate || !endDate || (!isEditing && !productId)}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
