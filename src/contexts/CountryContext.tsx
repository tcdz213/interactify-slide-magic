
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Country {
  code: string;
  name: string;
}

export const countries: Country[] = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'FR', name: 'France' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'TR', name: 'Turkey' },
  { code: 'AE', name: 'United Arab Emirates' },
];

interface CountryContextType {
  currentCountry: Country;
  setCountry: (country: Country) => void;
  isLoading: boolean;
}

const defaultCountry: Country = { code: 'US', name: 'United States' };

const CountryContext = createContext<CountryContextType>({
  currentCountry: defaultCountry,
  setCountry: () => {},
  isLoading: true,
});

export const useCountry = () => useContext(CountryContext);

export const CountryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCountry, setCurrentCountry] = useState<Country>(defaultCountry);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedCountry = localStorage.getItem('selectedCountry');
    
    if (savedCountry) {
      try {
        setCurrentCountry(JSON.parse(savedCountry));
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing saved country:', error);
        detectCountry();
      }
    } else {
      detectCountry();
    }
  }, []);

  const detectCountry = async () => {
    try {
      const response = await fetch('https://ipinfo.io/json?token=8dad427e6e8e1f');
      const data = await response.json();
      
      // Find the country in our list or use default
      const detectedCountry = countries.find(country => country.code === data.country) || defaultCountry;
      setCurrentCountry(detectedCountry);
      localStorage.setItem('selectedCountry', JSON.stringify(detectedCountry));
    } catch (error) {
      console.error('Error detecting country:', error);
      // If detection fails, use default country
      setCurrentCountry(defaultCountry);
    } finally {
      setIsLoading(false);
    }
  };

  const setCountry = (country: Country) => {
    setCurrentCountry(country);
    localStorage.setItem('selectedCountry', JSON.stringify(country));
  };

  return (
    <CountryContext.Provider value={{ currentCountry, setCountry, isLoading }}>
      {children}
    </CountryContext.Provider>
  );
};
