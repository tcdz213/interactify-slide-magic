/**
 * B13 — Column visibility toggle dropdown.
 */
import { useState } from "react";
import { Columns3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

export interface ColumnDef {
  key: string;
  label: string;
  defaultVisible?: boolean;
  alwaysVisible?: boolean; // Can't be hidden (e.g. ID, Actions)
}

export function useColumnVisibility(columns: ColumnDef[]) {
  const [visible, setVisible] = useState<Set<string>>(() => {
    return new Set(columns.filter(c => c.defaultVisible !== false).map(c => c.key));
  });

  const toggle = (key: string) => {
    setVisible(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isVisible = (key: string) => visible.has(key);

  return { visible, toggle, isVisible };
}

interface ColumnToggleProps {
  columns: ColumnDef[];
  visible: Set<string>;
  onToggle: (key: string) => void;
}

export default function ColumnToggle({ columns, visible, onToggle }: ColumnToggleProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-9">
          <Columns3 className="h-3.5 w-3.5" />
          Colonnes
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-2" align="end">
        <p className="text-xs font-medium text-muted-foreground mb-2 px-1">Colonnes visibles</p>
        <div className="space-y-1">
          {columns.map(col => (
            <label
              key={col.key}
              className="flex items-center gap-2 px-1 py-1 rounded hover:bg-muted/50 cursor-pointer text-sm"
            >
              <Checkbox
                checked={visible.has(col.key)}
                onCheckedChange={() => onToggle(col.key)}
                disabled={col.alwaysVisible}
              />
              {col.label}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
