import { useState } from "react";
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateFilterProps {
  value: string; // ISO string yyyy-MM-dd or ""
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DateFilter({ value, onChange, placeholder = "Choisir date", className }: DateFilterProps) {
  const [open, setOpen] = useState(false);
  const date = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 justify-start text-left font-normal gap-2",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5" />
          {date ? format(date, "dd/MM/yyyy", { locale: fr }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            onChange(d ? format(d, "yyyy-MM-dd") : "");
            setOpen(false);
          }}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}
