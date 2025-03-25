
import { addNotification } from "@/redux/slices/notificationsSlice";
import { v4 as uuidv4 } from 'uuid';
import { Country, countries } from "@/contexts/CountryContext";

// Track the last detected country to compare with new detections
let lastDetectedCountry: string | null = null;

/**
 * Detects the user's country from their IP address and notifies
 * if there has been a change from the previous detection
 */
export const detectCountryChange = async (dispatch: any): Promise<{ country: Country | null, ip: string | null }> => {
  try {
    // Get the user's IP info from ipinfo.io (free tier - limited to 50,000 requests per month)
    const response = await fetch('https://ipinfo.io/json?token=8dad427e6e8e1f');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch IP info: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('IP detection data:', data);
    
    // If this is not the first detection and the country has changed
    if (lastDetectedCountry !== null && lastDetectedCountry !== data.country) {
      // Find the country object from our list
      const newCountry = countries.find(country => country.code === data.country);
      
      if (newCountry) {
        // Send a notification about country change
        dispatch(addNotification({
          id: uuidv4(),
          title: 'Location Change Detected',
          message: `We've detected you're now in ${newCountry.name}. Would you like to switch to this location?`,
          isRead: false,
          createdAt: new Date().toISOString(),
          type: 'system',
          link: '/discover'
        }));
        
        console.log(`Country change detected: ${lastDetectedCountry} -> ${data.country}`);
      }
    }
    
    // Update the last detected country
    lastDetectedCountry = data.country;
    
    // Return the detected country object and IP address
    const detectedCountry = countries.find(country => country.code === data.country);
    return { 
      country: detectedCountry || null,
      ip: data.ip || null
    };
    
  } catch (error) {
    console.error('Error detecting country from IP:', error);
    return { country: null, ip: null };
  }
};
