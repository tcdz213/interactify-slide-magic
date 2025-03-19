
import { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from "@/components/ui/input";
import { currencySymbols } from '../centers/types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

type PriceRangeFilterProps = {
  value: number[];
  onChange: (value: number[]) => void;
};

const PriceRangeFilter = ({ value, onChange }: PriceRangeFilterProps) => {
  const isMobile = useIsMobile();
  const [localValue, setLocalValue] = useState<number[]>(value);
  const currency = useSelector((state: RootState) => state.centers.filters.currency);
  const currencySymbol = currencySymbols[currency] || '$';
  
  // Sync local state with props
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  // Ensure we always have an array with two values
  const normalizedValue = localValue.length === 1 ? [localValue[0], 1000] : localValue;
  
  const handleSliderChange = (newValue: number[]) => {
    setLocalValue(newValue);
    onChange(newValue);
  };
  
  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseInt(e.target.value) || 0;
    const newValue = [newMin, normalizedValue[1]];
    setLocalValue(newValue);
    onChange(newValue);
  };
  
  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseInt(e.target.value) || 0;
    const newValue = [normalizedValue[0], newMax];
    setLocalValue(newValue);
    onChange(newValue);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Price Range</h3>
        <span className="text-sm text-muted-foreground">
          {currencySymbol}{normalizedValue[0]} - {currencySymbol}{normalizedValue[1]}
        </span>
      </div>
      
      <Slider
        defaultValue={normalizedValue}
        min={0}
        max={1000}
        step={50}
        value={normalizedValue}
        onValueChange={handleSliderChange}
        className="mb-6"
      />
      
      {!isMobile && (
        <div className="flex items-center gap-4">
          <div className="grid flex-1 gap-2">
            <label htmlFor="min-price" className="text-xs text-muted-foreground">Min Price</label>
            <div className="flex items-center">
              <span className="mr-1 text-sm">{currencySymbol}</span>
              <Input
                id="min-price"
                type="number"
                min={0}
                max={normalizedValue[1]}
                value={normalizedValue[0]}
                onChange={handleMinInputChange}
                className="h-8"
              />
            </div>
          </div>
          
          <div className="grid flex-1 gap-2">
            <label htmlFor="max-price" className="text-xs text-muted-foreground">Max Price</label>
            <div className="flex items-center">
              <span className="mr-1 text-sm">{currencySymbol}</span>
              <Input
                id="max-price"
                type="number"
                min={normalizedValue[0]}
                max={1000}
                value={normalizedValue[1]}
                onChange={handleMaxInputChange}
                className="h-8"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceRangeFilter;
