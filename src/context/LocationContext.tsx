import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ParsedAddress,
  checkLocationPermission,
  getCurrentPosition,
  requestLocationPermission,
  reverseGeocode,
} from '../services/locationService';
import LocationPermissionModal from '../components/LocationPermissionModal';

const LOCATION_PROMPT_KEY = '@ayurmuni_location_prompt_shown';

type LocationContextType = {
  currentAddress: ParsedAddress | null;
  loadingLocation: boolean;
  locationEnabled: boolean;
  refreshCurrentLocation: () => Promise<ParsedAddress | null>;
  requestPermission: () => Promise<boolean>;
};

const LocationContext = createContext<LocationContextType | null>(null);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentAddress, setCurrentAddress] =
    useState<ParsedAddress | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const fetchLocationFromGps = useCallback(async () => {
    setLoadingLocation(true);
    try {
      const coords = await getCurrentPosition();
      const address = await reverseGeocode(coords);
      setCurrentAddress(address);
      setLocationEnabled(true);
      return address;
    } catch (error) {
      console.log('GPS_FETCH_ERROR', error);
      return null;
    } finally {
      setLoadingLocation(false);
    }
  }, []);

  const refreshCurrentLocation = useCallback(async () => {
    const hasPermission =
      (await checkLocationPermission()) ||
      (await requestLocationPermission());
    if (!hasPermission) {
      setLocationEnabled(false);
      return null;
    }
    return fetchLocationFromGps();
  }, [fetchLocationFromGps]);

  const requestPermission = useCallback(async () => {
    const granted = await requestLocationPermission();
    setLocationEnabled(granted);
    if (granted) {
      await fetchLocationFromGps();
    }
    return granted;
  }, [fetchLocationFromGps]);

  useEffect(() => {
    const init = async () => {
      const prompted = await AsyncStorage.getItem(LOCATION_PROMPT_KEY);
      if (!prompted) {
        setShowPermissionModal(true);
        await AsyncStorage.setItem(LOCATION_PROMPT_KEY, 'true');
        return;
      }

      const granted = await checkLocationPermission();
      if (granted) {
        setLocationEnabled(true);
        fetchLocationFromGps();
      }
    };

    init();
  }, [fetchLocationFromGps]);

  const handleAllowLocation = async () => {
    setShowPermissionModal(false);
    await requestPermission();
  };

  const handleDenyLocation = () => {
    setShowPermissionModal(false);
  };

  return (
    <LocationContext.Provider
      value={{
        currentAddress,
        loadingLocation,
        locationEnabled,
        refreshCurrentLocation,
        requestPermission,
      }}
    >
      {children}
      <LocationPermissionModal
        visible={showPermissionModal}
        onAllow={handleAllowLocation}
        onDeny={handleDenyLocation}
      />
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    return {
      currentAddress: null,
      loadingLocation: false,
      locationEnabled: false,
      refreshCurrentLocation: async () => null,
      requestPermission: async () => false,
    };
  }
  return ctx;
};

export default LocationContext;
