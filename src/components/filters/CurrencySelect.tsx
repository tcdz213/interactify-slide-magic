
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { currencySymbols } from '../centers/types';
import { useCountry } from '@/contexts/CountryContext';
import { DollarSign, Euro, Coins } from 'lucide-react';

interface CurrencySelectProps {
  value: string;
  onChange: (value: string) => void;
}

const CurrencySelect = ({ value, onChange }: CurrencySelectProps) => {
  const { currentCountry } = useCountry();
  const [isOpen, setIsOpen] = useState(false);

  const getDefaultCurrency = () => {
    switch (currentCountry.code) {
      case 'FR':
      case 'DE':
        return 'EUR';
      case 'GB':
        return 'GBP';
      case 'DZ':
        return 'DZD';
      case 'SA':
      case 'AE':
        return 'SAR';
      default:
        return 'USD';
    }
  };

  const getCurrencyIcon = (currencyCode: string) => {
    switch (currencyCode) {
      case 'USD':
      case 'GBP':
        return <DollarSign className="h-4 w-4" />;
      case 'EUR':
        return <Euro className="h-4 w-4" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-1 px-3 flex items-center"
        >
          {getCurrencyIcon(value || getDefaultCurrency())}
          <span>{currencySymbols[value || getDefaultCurrency()]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuLabel>Select Currency</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={value || getDefaultCurrency()} onValueChange={onChange}>
          {Object.entries(currencySymbols).map(([code, symbol]) => (
            <DropdownMenuRadioItem key={code} value={code} className="flex items-center gap-2">
              {getCurrencyIcon(code)}
              <span>{code}</span>
              <span className="ml-auto">{symbol}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencySelect;
