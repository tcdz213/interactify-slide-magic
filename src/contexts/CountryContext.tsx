
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

// Function to detect user's country from IP address
const detectUserCountry = async (): Promise<Country> => {
  try {
    // Using ipinfo.io API to get user's IP and country information
    const response = await fetch('https://ipinfo.io/json?token=8dad427e6e8e1f');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch IP info: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('IP Info data:', data);
    
    // Find the country in our list or use default
    const detectedCountry = countries.find(country => country.code === data.country) || defaultCountry;
    
    console.log('Detected country:', detectedCountry);
    return detectedCountry;
  } catch (error) {
    console.error('Error detecting country:', error);
    return defaultCountry;
  }
};

export const CountryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCountry, setCurrentCountry] = useState<Country>(defaultCountry);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize country on component mount
  useEffect(() => {
    const initializeCountry = async () => {
      setIsLoading(true);
      const savedCountry = localStorage.getItem('selectedCountry');
      
      // Use saved country if available
      if (savedCountry) {
        try {
          const parsedCountry = JSON.parse(savedCountry);
          // Validate if the parsed data has the right shape
          if (parsedCountry && parsedCountry.code && parsedCountry.name) {
            setCurrentCountry(parsedCountry);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error parsing saved country:', error);
          // Continue to country detection if parsing fails
        }
      }
      
      // Detect country if no saved preference
      try {
        const detectedCountry = await detectUserCountry();
        setCurrentCountry(detectedCountry);
        localStorage.setItem('selectedCountry', JSON.stringify(detectedCountry));
      } catch (error) {
        console.error('Error in country detection:', error);
        // Fallback to default country
        setCurrentCountry(defaultCountry);
      } finally {
        setIsLoading(false);
      }
    };

    initializeCountry();
  }, []);

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
