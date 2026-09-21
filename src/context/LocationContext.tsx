import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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
const DELIVERY_LOCATION_KEY = '@ayurmuni_delivery_location';

type LocationContextType = {
  currentAddress: ParsedAddress | null;
  deliveryLocation: ParsedAddress | null;
  loadingLocation: boolean;
  locationEnabled: boolean;
  /** True while the home location permission modal is visible. */
  isLocationPromptVisible: boolean;
  /** True after Home has finished the first-run location prompt (shown or skipped). */
  locationPromptSettled: boolean;
  refreshCurrentLocation: () => Promise<ParsedAddress | null>;
  requestPermission: () => Promise<boolean>;
  setDeliveryLocation: (address: ParsedAddress | null) => Promise<void>;
  promptLocationOnHome: () => void;
  /** Clear GPS + cached delivery address (call on logout). */
  clearLocationSession: () => Promise<void>;
};

const LocationContext = createContext<LocationContextType | null>(null);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentAddress, setCurrentAddress] =
    useState<ParsedAddress | null>(null);
  const [deliveryLocation, setDeliveryLocationState] =
    useState<ParsedAddress | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [locationPromptSettled, setLocationPromptSettled] = useState(false);
  const homePromptChecked = useRef(false);

  const setDeliveryLocation = useCallback(
    async (address: ParsedAddress | null) => {
      setDeliveryLocationState(address);
      try {
        if (address) {
          await AsyncStorage.setItem(
            DELIVERY_LOCATION_KEY,
            JSON.stringify(address),
          );
        } else {
          await AsyncStorage.removeItem(DELIVERY_LOCATION_KEY);
        }
      } catch (error) {
        console.log('DELIVERY_LOCATION_SAVE_ERROR', error);
      }
    },
    [],
  );

  const clearLocationSession = useCallback(async () => {
    homePromptChecked.current = false;
    setCurrentAddress(null);
    setDeliveryLocationState(null);
    setLoadingLocation(false);
    setLocationEnabled(false);
    setShowPermissionModal(false);
    setLocationPromptSettled(false);
    try {
      await AsyncStorage.multiRemove([
        DELIVERY_LOCATION_KEY,
        LOCATION_PROMPT_KEY,
      ]);
    } catch (error) {
      console.log('LOCATION_SESSION_CLEAR_ERROR', error);
    }
  }, []);

  const fetchLocationFromGps = useCallback(async () => {
    setLoadingLocation(true);
    try {
      const coords = await getCurrentPosition();
      const address = await reverseGeocode(coords);
      setCurrentAddress(address);
      setLocationEnabled(true);

      const savedDelivery = await AsyncStorage.getItem(DELIVERY_LOCATION_KEY);
      if (!savedDelivery) {
        await setDeliveryLocation(address);
      }

      return address;
    } catch (error) {
      console.log('GPS_FETCH_ERROR', error);
      return null;
    } finally {
      setLoadingLocation(false);
    }
  }, [setDeliveryLocation]);

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

  /** Blinkit-style: ask only after user reaches Home, not on splash. */
  const promptLocationOnHome = useCallback(async () => {
    if (homePromptChecked.current) {
      setLocationPromptSettled(true);
      return;
    }
    homePromptChecked.current = true;

    const prompted = await AsyncStorage.getItem(LOCATION_PROMPT_KEY);
    if (prompted) {
      const granted = await checkLocationPermission();
      if (granted) {
        setLocationEnabled(true);
        if (!currentAddress) {
          fetchLocationFromGps();
        }
      }
      setLocationPromptSettled(true);
      return;
    }

    setShowPermissionModal(true);
  }, [currentAddress, fetchLocationFromGps]);

  useEffect(() => {
    const init = async () => {
      try {
        const savedDelivery = await AsyncStorage.getItem(DELIVERY_LOCATION_KEY);
        if (savedDelivery) {
          setDeliveryLocationState(JSON.parse(savedDelivery));
        }

        const granted = await checkLocationPermission();
        if (granted) {
          setLocationEnabled(true);
          // Don't GPS on cold start — Home prompts via promptLocationOnHome.
          // First-open GPS races caused native crashes before nav was ready.
        }
      } catch {
        // ignore corrupt cache
      }
    };

    init();
  }, []);

  const handleAllowLocation = async () => {
    setShowPermissionModal(false);
    await AsyncStorage.setItem(LOCATION_PROMPT_KEY, 'true');
    setLocationPromptSettled(true);
    await requestPermission();
  };

  const handleDenyLocation = async () => {
    setShowPermissionModal(false);
    await AsyncStorage.setItem(LOCATION_PROMPT_KEY, 'true');
    setLocationPromptSettled(true);
  };

  return (
    <LocationContext.Provider
      value={{
        currentAddress,
        deliveryLocation,
        loadingLocation,
        locationEnabled,
        isLocationPromptVisible: showPermissionModal,
        locationPromptSettled,
        refreshCurrentLocation,
        requestPermission,
        setDeliveryLocation,
        promptLocationOnHome,
        clearLocationSession,
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
      deliveryLocation: null,
      loadingLocation: false,
      locationEnabled: false,
      isLocationPromptVisible: false,
      locationPromptSettled: true,
      refreshCurrentLocation: async () => null,
      requestPermission: async () => false,
      setDeliveryLocation: async () => {},
      promptLocationOnHome: () => {},
      clearLocationSession: async () => {},
    };
  }
  return ctx;
};

export default LocationContext;
