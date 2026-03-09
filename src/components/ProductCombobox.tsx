import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ProductOption {
  id: string;
  name: string;
  sku: string;
  stock: number;
  unitPrice: number;
  unitCost: number;
  isActive: boolean;
}

interface ProductComboboxProps {
  products: ProductOption[];
  value: string;
  onSelect: (product: ProductOption) => void;
  placeholder?: string;
  hideInactive?: boolean;
  className?: string;
}

export function ProductCombobox({
  products,
  value,
  onSelect,
  placeholder = "Choisir produit...",
  hideInactive = true,
  className,
}: ProductComboboxProps) {
  const [open, setOpen] = useState(false);

  const filteredProducts = useMemo(
    () => (hideInactive ? products.filter((p) => p.isActive) : products),
    [products, hideInactive]
  );

  const selected = products.find((p) => p.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between h-9 font-normal", className)}
        >
          {selected ? (
            <span className="truncate text-sm">
              {selected.name}{" "}
              <span className="text-muted-foreground">({selected.sku})</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher par nom ou SKU..." />
          <CommandList>
            <CommandEmpty>Aucun produit trouvé.</CommandEmpty>
            <CommandGroup>
              {filteredProducts.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.name} ${p.sku}`}
                  onSelect={() => {
                    onSelect(p);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-3.5 w-3.5",
                      value === p.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-sm font-medium">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground">{p.sku}</span>
                    </div>
                    <span
                      className={cn(
                        "ml-auto text-xs font-medium shrink-0",
                        p.stock < 10
                          ? "text-destructive"
                          : p.stock < 50
                          ? "text-yellow-600"
                          : "text-muted-foreground"
                      )}
                    >
                      Stock: {p.stock}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
