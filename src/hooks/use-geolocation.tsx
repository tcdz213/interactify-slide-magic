import { useState } from 'react';
import { errorHandler } from '@/utils/errorHandler';

export interface GeolocationData {
  latitude: number;
  longitude: number;
  city?: string;
  accuracy?: number;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const requestLocation = async (showToast: boolean = true): Promise<GeolocationData | null> => {
    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by your browser';
      setError(errorMsg);
      if (showToast) {
        errorHandler.showApiError('geolocation', errorMsg);
      }
      return null;
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Try to get city name from reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'SpotyCard/1.0'
                }
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              const city = data.address?.city || data.address?.town || data.address?.village || 'Unknown';
              
              const locationData: GeolocationData = {
                latitude,
                longitude,
                city,
                accuracy
              };
              
              setLocation(locationData);
              setHasPermission(true);
              
              if (showToast) {
                errorHandler.showSuccess(`Found your location near ${city}`, "Location detected");
              }
              
              setIsLoading(false);
              resolve(locationData);
            } else {
              throw new Error('Geocoding failed');
            }
          } catch (geocodeError) {
            console.error('Reverse geocoding failed:', geocodeError);
            
            // Set location without city name
            const locationData: GeolocationData = {
              latitude,
              longitude,
              accuracy
            };
            
            setLocation(locationData);
            setHasPermission(true);
            setIsLoading(false);
            resolve(locationData);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMsg = 'Failed to get your location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Location permission denied';
              setHasPermission(false);
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMsg = 'Location request timed out';
              break;
          }
          
          setError(errorMsg);
          setHasPermission(false);
          setIsLoading(false);
          
          if (showToast) {
            errorHandler.showApiError('geolocation', errorMsg);
          }
          
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // Cache for 5 minutes
        }
      );
    });
  };

  const clearLocation = () => {
    setLocation(null);
    setError(null);
  };

  return {
    location,
    isLoading,
    error,
    hasPermission,
    requestLocation,
    clearLocation
  };
};
