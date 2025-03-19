
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { currencySymbols } from './centers/types';

interface PriceDisplayProps {
  price: string | number;
  originalCurrency?: string;
  className?: string;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ 
  price, 
  originalCurrency = 'USD',
  className = "" 
}) => {
  const selectedCurrency = useSelector((state: RootState) => state.centers.filters.currency);
  
  // Extract numeric value from price string if it's a string (e.g. "$45" -> 45)
  const numericPrice = typeof price === 'string' 
    ? parseFloat(price.replace(/[^0-9.-]+/g, "")) 
    : price;
  
  // Very basic conversion rates (in a real app, these would come from an API)
  const conversionRates: Record<string, Record<string, number>> = {
    'USD': { 'EUR': 0.92, 'DZD': 134.5 },
    'EUR': { 'USD': 1.09, 'DZD': 146.8 },
    'DZD': { 'USD': 0.0074, 'EUR': 0.0068 }
  };
  
  // Convert price to selected currency
  const convertPrice = () => {
    if (originalCurrency === selectedCurrency) return numericPrice;
    
    const rate = conversionRates[originalCurrency]?.[selectedCurrency] || 1;
    return numericPrice * rate;
  };
  
  const convertedPrice = convertPrice();
  const symbol = currencySymbols[selectedCurrency] || '$';
  
  return (
    <span className={className}>
      {symbol}{convertedPrice.toFixed(2)}
    </span>
  );
};

export default PriceDisplay;
