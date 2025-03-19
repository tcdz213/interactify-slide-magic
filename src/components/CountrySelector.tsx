
import { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCountry, countries } from '@/contexts/CountryContext';
import { useTranslation } from 'react-i18next';

const CountrySelector = () => {
  const { currentCountry, setCountry, isLoading } = useCountry();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" className="h-8 px-2 gap-1 text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span className="text-xs">Loading...</span>
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 gap-1 text-muted-foreground hover:text-foreground">
          <MapPin className="h-4 w-4" />
          <span className="text-xs font-normal">{currentCountry.name}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        {countries.map((country) => (
          <DropdownMenuItem
            key={country.code}
            onClick={() => {
              setCountry(country);
              setIsOpen(false);
            }}
            className={`flex items-center justify-between ${currentCountry.code === country.code ? 'bg-muted' : ''}`}
          >
            <span>{country.name}</span>
            {country.code === currentCountry.code && (
              <span className="h-2 w-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CountrySelector;
