import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProductPrice, PriceApprovalStatus } from "./pricing.types";
import { MarginBadge } from "./MarginBadge";

const priceSchema = z.object({
  unitPrice: z.coerce.number().min(0, "Le prix doit être ≥ 0"),
  minQty: z.coerce.number().min(0).optional(),
  approvalStatus: z.enum(["draft", "pending", "approved"]),
});

type PriceFormValues = z.infer<typeof priceSchema>;

interface PriceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  price: ProductPrice | null;
  productName: string;
  cost: number;
  onSave: (values: PriceFormValues) => void;
}

export function PriceForm({ open, onOpenChange, price, productName, cost, onSave }: PriceFormProps) {
  const form = useForm<PriceFormValues>({
    resolver: zodResolver(priceSchema),
    defaultValues: {
      unitPrice: price?.unitPrice ?? 0,
      minQty: price?.minQty ?? undefined,
      approvalStatus: price?.approvalStatus ?? "draft",
    },
  });

  const watchedPrice = form.watch("unitPrice");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Prix — {productName}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => { onSave(v); onOpenChange(false); })} className="space-y-4">
            <div className="flex items-center gap-3">
              <FormField control={form.control} name="unitPrice" render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Prix unitaire (DZD) *</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="pt-6">
                <MarginBadge unitPrice={watchedPrice || 0} cost={cost} />
              </div>
            </div>
            <FormField control={form.control} name="minQty" render={({ field }) => (
              <FormItem>
                <FormLabel>Quantité minimum</FormLabel>
                <FormControl><Input type="number" placeholder="Optionnel" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="approvalStatus" render={({ field }) => (
              <FormItem>
                <FormLabel>Statut d'approbation</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="approved">Approuvé</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
