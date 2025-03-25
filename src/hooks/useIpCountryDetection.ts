
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { detectCountryChange } from '@/utils/ipCountryDetection';
import { Country } from '@/contexts/CountryContext';
import { setLoading, setLocationInfo } from '@/redux/slices/locationSlice';
import { RootState } from '@/redux/store';

/**
 * Hook to detect country changes based on IP address
 * @returns The detected country and loading state
 */
export const useIpCountryDetection = () => {
  const dispatch = useDispatch();
  const locationState = useSelector((state: RootState) => state.location);
  
  useEffect(() => {
    const detectCountry = async () => {
      dispatch(setLoading(true));
      try {
        const result = await detectCountryChange(dispatch);
        if (result && result.country && result.ip) {
          dispatch(setLocationInfo({ 
            ip: result.ip, 
            country: result.country 
          }));
        }
      } catch (error) {
        console.error("Error detecting country:", error);
      }
    };

    // Detect on component mount
    detectCountry();
    
    // Set up periodic detection (every 30 minutes)
    const intervalId = setInterval(detectCountry, 30 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [dispatch]);

  return {
    detectedCountry: locationState.country,
    isLoading: locationState.isLoading,
    ip: locationState.ip,
    lastDetected: locationState.lastDetected
  };
};
