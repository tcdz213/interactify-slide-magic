import { useState } from "react";
import { AiOutlineCheck } from "react-icons/ai";

const Check = AiOutlineCheck;
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Subcategory } from "@/services/domainsApi";
import { cn } from "@/lib/utils";

interface MultiSelectSubcategoriesProps {
  subcategories: Subcategory[];
  selectedSubcategories: string[];
  onSelectionChange: (selected: string[]) => void;
  language?: 'fr' | 'ar';
  placeholder?: string;
  disabled?: boolean;
}

export function MultiSelectSubcategories({
  subcategories,
  selectedSubcategories,
  onSelectionChange,
  language = 'fr',
  placeholder = "Sélectionner les spécialités...",
  disabled = false
}: MultiSelectSubcategoriesProps) {
  const [open, setOpen] = useState(false);

  const toggleSubcategory = (subcategoryKey: string) => {
    if (disabled) return;
    
    const newSelection = selectedSubcategories.includes(subcategoryKey)
      ? selectedSubcategories.filter(s => s !== subcategoryKey)
      : [...selectedSubcategories, subcategoryKey];
    
    onSelectionChange(newSelection);
  };

  const getSubcategoryName = (sub: Subcategory) => sub[language];
  const getSubcategoryByKey = (key: string) => subcategories.find(s => s.key === key);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between bg-background/50 hover:bg-background/80",
              disabled && "opacity-75 cursor-not-allowed"
            )}
          >
            {selectedSubcategories.length === 0
              ? placeholder
              : `${selectedSubcategories.length} selected`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover" align="start" sideOffset={4}>
          <Command>
            <CommandInput placeholder="Rechercher une spécialité..." />
            <CommandList>
              <CommandEmpty>Aucune spécialité trouvée.</CommandEmpty>
              <CommandGroup>
                {subcategories.map((subcategory) => {
                  const name = getSubcategoryName(subcategory);
                  const isSelected = selectedSubcategories.includes(subcategory.key);
                  
                  return (
                    <CommandItem
                      key={subcategory.key}
                      value={name}
                      onSelect={() => toggleSubcategory(subcategory.key)}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className="h-4 w-4" />
                      </div>
                      <span>{name}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Display selected subcategories as badges */}
      {selectedSubcategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSubcategories.map((key) => {
            const subcategory = getSubcategoryByKey(key);
            const displayName = subcategory ? getSubcategoryName(subcategory) : key;
            
            return (
              <Badge
                key={key}
                variant="secondary"
                className={cn(
                  !disabled && "cursor-pointer hover:bg-destructive hover:text-destructive-foreground",
                  disabled && "opacity-75"
                )}
                onClick={() => !disabled && toggleSubcategory(key)}
              >
                {displayName}
                {!disabled && <span className="ml-1">×</span>}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
