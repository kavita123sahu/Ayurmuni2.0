import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { GOOGLE_PLACES_API_KEY } from '../config/Key';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type ParsedAddress = {
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
};

export type PlaceSuggestion = {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
};

const DEFAULT_REGION: Coordinates = {
  latitude: 28.4595,
  longitude: 77.0266,
};

export const getDefaultRegion = () => DEFAULT_REGION;

export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    return true;
  }

  const fineGranted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location Permission',
      message:
        'Ayurmuni needs your location to show nearby services and deliver to your address.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
  );

  if (fineGranted === PermissionsAndroid.RESULTS.GRANTED) {
    return true;
  }

  const coarseGranted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    {
      title: 'Location Permission',
      message: 'Ayurmuni needs approximate location access.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
  );

  return coarseGranted === PermissionsAndroid.RESULTS.GRANTED;
};

export const checkLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    return true;
  }

  const fine = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  if (fine) return true;

  return PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  );
};

export const openLocationSettings = () => {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
};

const readPosition = (
  highAccuracy: boolean,
  timeout: number,
): Promise<Coordinates> =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        console.log('GPS_ERROR', error);
        reject(error);
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout,
        maximumAge: 15000,
      },
    );
  });

const watchPositionOnce = (timeout: number): Promise<Coordinates> =>
  new Promise((resolve, reject) => {
    let watchId: number | null = null;

    const timer = setTimeout(() => {
      if (watchId != null) {
        Geolocation.clearWatch(watchId);
      }
      reject(new Error('Location watch timed out'));
    }, timeout);

    watchId = Geolocation.watchPosition(
      position => {
        clearTimeout(timer);
        if (watchId != null) {
          Geolocation.clearWatch(watchId);
        }
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        clearTimeout(timer);
        if (watchId != null) {
          Geolocation.clearWatch(watchId);
        }
        reject(error);
      },
      {
        enableHighAccuracy: false,
        distanceFilter: 0,
        maximumAge: 15000,
      },
    );
  });

export const getCurrentPosition = async (): Promise<Coordinates> => {
  try {
    return await readPosition(false, 30000);
  } catch {
    try {
      return await readPosition(true, 45000);
    } catch {
      return watchPositionOnce(30000);
    }
  }
};

const parseAddressComponents = (
  components: any[],
  formattedAddress: string,
  coords: Coordinates,
): ParsedAddress => {
  const get = (type: string, useShort = false) => {
    const comp = components.find((c: any) => c.types?.includes(type));
    if (!comp) return '';
    return useShort ? comp.short_name : comp.long_name;
  };

  const streetNumber = get('street_number');
  const route = get('route');
  const sublocality =
    get('sublocality_level_1') ||
    get('sublocality') ||
    get('neighborhood');
  const city =
    get('locality') ||
    get('administrative_area_level_2') ||
    get('administrative_area_level_3');
  const state = get('administrative_area_level_1', true);
  const zipcode = get('postal_code');
  const country = get('country');

  const addressLine1 =
    [streetNumber, route].filter(Boolean).join(' ') ||
    sublocality ||
    formattedAddress.split(',')[0] ||
    '';

  return {
    address_line_1: addressLine1.trim(),
    address_line_2:
      sublocality && sublocality !== addressLine1 ? sublocality : '',
    city: city || '',
    state: state || '',
    zipcode: zipcode || '',
    country: country || 'India',
    formatted_address: formattedAddress,
    latitude: coords.latitude,
    longitude: coords.longitude,
  };
};

export const reverseGeocode = async (
  coords: Coordinates,
): Promise<ParsedAddress> => {
  const url =
    `https://maps.googleapis.com/maps/api/geocode/json` +
    `?latlng=${coords.latitude},${coords.longitude}` +
    `&key=${GOOGLE_PLACES_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK' || !data.results?.length) {
    throw new Error(
      data.error_message || 'Unable to fetch address for this location',
    );
  }

  const result = data.results[0];
  return parseAddressComponents(
    result.address_components,
    result.formatted_address,
    coords,
  );
};

export const searchPlaces = async (
  query: string,
): Promise<PlaceSuggestion[]> => {
  if (!query.trim()) return [];

  const url =
    `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
    `?input=${encodeURIComponent(query)}` +
    `&components=country:in` +
    `&key=${GOOGLE_PLACES_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(data.error_message || 'Places search failed');
  }

  return (data.predictions || []).map((p: any) => ({
    place_id: p.place_id,
    description: p.description,
    main_text: p.structured_formatting?.main_text || p.description,
    secondary_text: p.structured_formatting?.secondary_text || '',
  }));
};

export const getPlaceDetails = async (
  placeId: string,
): Promise<ParsedAddress> => {
  const url =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${placeId}` +
    `&fields=address_component,formatted_address,geometry` +
    `&key=${GOOGLE_PLACES_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK' || !data.result) {
    throw new Error(data.error_message || 'Unable to fetch place details');
  }

  const { lat, lng } = data.result.geometry.location;
  return parseAddressComponents(
    data.result.address_components,
    data.result.formatted_address,
    { latitude: lat, longitude: lng },
  );
};

export const showLocationPermissionAlert = () => {
  Alert.alert(
    'Enable Location',
    'Please enable location access in settings to use your current location for delivery.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: openLocationSettings },
    ],
  );
};

export const fetchCurrentAddress = async (): Promise<ParsedAddress | null> => {
  try {
    const hasPermission =
      (await checkLocationPermission()) ||
      (await requestLocationPermission());
    if (!hasPermission) return null;

    const coords = await getCurrentPosition();
    return await reverseGeocode(coords);
  } catch (error) {
    console.log('FETCH_CURRENT_ADDRESS_ERROR', error);
    return null;
  }
};
