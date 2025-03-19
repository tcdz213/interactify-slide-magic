import React from 'react';
import { currencySymbols } from '../centers/types';
import { useCountry } from '@/contexts/CountryContext';

interface CurrencyDisplayProps {
  amount: string | number;
  currency?: string; 
  className?: string;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  amount, 
  currency,
  className = "" 
}) => {
  const { currentCountry } = useCountry();
  
  // Determine default currency based on country
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
  
  const activeCurrency = currency || getDefaultCurrency();
  const symbol = currencySymbols[activeCurrency] || '$';
  
  // If amount is already a string with currency formatting, return as is
  if (typeof amount === 'string' && (amount.startsWith('$') || amount.startsWith('€') || amount.startsWith('£'))) {
    return <span className={className}>{amount}</span>;
  }
  
  // Otherwise, format with the appropriate currency symbol
  return (
    <span className={className}>{symbol}{typeof amount === 'number' ? amount.toLocaleString() : amount}</span>
  );
};

export default CurrencyDisplay;
