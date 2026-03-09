/**
 * Phase 5 — Row-level action dropdown menu.
 */
import { ReactNode } from "react";
import { MoreHorizontal, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface ActionMenuItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
  /** Insert separator before this item */
  separator?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  trigger?: ReactNode;
  align?: "start" | "end" | "center";
}

export default function ActionMenu({ items, trigger, align = "end" }: ActionMenuProps) {
  if (items.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        {trigger ?? (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        {items.map((item, i) => (
          <span key={i}>
            {item.separator && i > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
              }}
              disabled={item.disabled}
              className={cn(
                "gap-2 cursor-pointer",
                item.variant === "destructive" && "text-destructive focus:text-destructive"
              )}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </DropdownMenuItem>
          </span>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
