import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GoaLocation } from '../types';
import { GOA_LOCATIONS } from '../data/locations';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '../services/storage';

interface LocationContextType {
  currentLocation: GoaLocation;
  allLocations: GoaLocation[];
  changeLocation: (locationId: string) => void;
  isTalukaServiceable: (vendorTaluka: string, serviceableTalukas?: string[]) => boolean;
  isLocationSelectorOpen: boolean;
  setIsLocationSelectorOpen: (open: boolean) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<GoaLocation>(GOA_LOCATIONS[0]);
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);

  useEffect(() => {
    const saved = getStoredItem<GoaLocation>(STORAGE_KEYS.SELECTED_LOCATION, GOA_LOCATIONS[0]);
    setCurrentLocation(saved);
  }, []);

  const changeLocation = (locationId: string) => {
    const found = GOA_LOCATIONS.find((l) => l.id === locationId);
    if (found) {
      setCurrentLocation(found);
      setStoredItem(STORAGE_KEYS.SELECTED_LOCATION, found);
      setIsLocationSelectorOpen(false);
    }
  };

  const isTalukaServiceable = (vendorTaluka: string, serviceableTalukas?: string[]): boolean => {
    if (!currentLocation.isServiceable) return false;
    if (serviceableTalukas && serviceableTalukas.length > 0) {
      return serviceableTalukas.some((t) => t.toLowerCase() === currentLocation.taluka.toLowerCase());
    }
    // Default fallback: same taluka or generally serviceable North/South hub
    return true;
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        allLocations: GOA_LOCATIONS,
        changeLocation,
        isTalukaServiceable,
        isLocationSelectorOpen,
        setIsLocationSelectorOpen,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
