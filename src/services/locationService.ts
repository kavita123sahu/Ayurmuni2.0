import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {
  GOOGLE_MAPS_API_KEY,
  GOOGLE_PLACES_API_KEY,
} from '../config/Key';

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


const GOOGLE_KEYS = [
  GOOGLE_PLACES_API_KEY,
  GOOGLE_MAPS_API_KEY,
].filter(Boolean);

const DEFAULT_REGION: Coordinates = {
  latitude: 28.4595,
  longitude: 77.0266,
};

export const getDefaultRegion = () => DEFAULT_REGION;

export const getGoogleApiSetupHint = (status?: string, errorMessage?: string) => {
  if (status === 'REQUEST_DENIED') {
    if (errorMessage?.toLowerCase().includes('billing')) {
      return 'Enable billing on Google Cloud Console for your API keys.';
    }
    return 'Enable Geocoding API, Places API, and Maps JavaScript API for your keys.';
  }
  if (status === 'OVER_QUERY_LIMIT') {
    return 'Google API quota exceeded. Try again later.';
  }
  return errorMessage || 'Google location API unavailable.';
};

const fetchGoogleJson = async (url: string) => {
  const response = await fetch(url);
  return response.json();
};

const tryGoogleRequest = async (buildUrl: (key: string) => string) => {
  let lastError = 'Google API unavailable';

  for (const key of GOOGLE_KEYS) {
    try {
      const data = await fetchGoogleJson(buildUrl(key));
      if (
        data.status === 'OK' ||
        data.status === 'ZERO_RESULTS' ||
        data.results?.length ||
        data.result ||
        data.predictions
      ) {
        return { data, key };
      }
      lastError = getGoogleApiSetupHint(data.status, data.error_message);
      console.log('GOOGLE_API_STATUS', data.status, data.error_message);
    } catch (error: any) {
      lastError = error?.message || lastError;
    }
  }

  throw new Error(lastError);
};

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
  maxAccuracyMeters?: number,
  maximumAge = 0,
): Promise<Coordinates> =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        const accuracy = position.coords.accuracy;
        if (
          maxAccuracyMeters != null &&
          accuracy != null &&
          accuracy > maxAccuracyMeters
        ) {
          reject(new Error(`Low accuracy fix (${accuracy}m)`));
          return;
        }
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => reject(error),
      {
        enableHighAccuracy: highAccuracy,
        timeout,
        maximumAge,
      },
    );
  });

/** Fast cached fix first, then high-accuracy GPS. */
export const getCurrentPosition = async (): Promise<Coordinates> => {
  try {
    return await readPosition(false, 4000, undefined, 120000);
  } catch {
    // continue
  }

  try {
    return await readPosition(true, 12000, 200);
  } catch {
    return watchPositionOnce(15000);
  }
};

const watchPositionOnce = (timeout: number): Promise<Coordinates> =>
  new Promise((resolve, reject) => {
    let watchId: number | null = null;
    let best: Coordinates | null = null;
    let bestAccuracy = Infinity;

    const timer = setTimeout(() => {
      if (watchId != null) {
        Geolocation.clearWatch(watchId);
      }
      if (best) {
        resolve(best);
        return;
      }
      reject(new Error('Location watch timed out'));
    }, timeout);

    watchId = Geolocation.watchPosition(
      position => {
        const accuracy = position.coords.accuracy ?? Infinity;
        if (accuracy < bestAccuracy) {
          bestAccuracy = accuracy;
          best = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        }
        if (accuracy <= 50) {
          clearTimeout(timer);
          if (watchId != null) {
            Geolocation.clearWatch(watchId);
          }
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }
      },
      error => {
        clearTimeout(timer);
        if (watchId != null) {
          Geolocation.clearWatch(watchId);
        }
        if (best) {
          resolve(best);
          return;
        }
        reject(error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 0,
        maximumAge: 10000,
      },
    );
  });

const scoreGeocodeResult = (result: any): number => {
  let score = 0;
  const types: string[] = result?.types || [];
  const locType = result?.geometry?.location_type;

  if (locType === 'ROOFTOP') score += 120;
  else if (locType === 'RANGE_INTERPOLATED') score += 90;
  else if (locType === 'GEOMETRIC_CENTER') score += 40;

  if (types.includes('street_address')) score += 70;
  if (types.includes('premise')) score += 60;
  if (types.includes('subpremise')) score += 55;
  if (types.includes('neighborhood')) score += 35;
  if (types.includes('sublocality')) score += 30;
  if (types.includes('sublocality_level_1')) score += 32;

  const hasPostal = result?.address_components?.some((c: any) =>
    c.types?.includes('postal_code'),
  );
  if (hasPostal) score += 25;

  return score;
};

const pickBestGeocodeResult = (results: any[]) =>
  [...results].sort((a, b) => scoreGeocodeResult(b) - scoreGeocodeResult(a))[0];

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
    get('sublocality_level_2') ||
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

const reverseGeocodeNominatim = async (
  coords: Coordinates,
): Promise<ParsedAddress> => {
  const url =
    `https://nominatim.openstreetmap.org/reverse` +
    `?format=json&lat=${coords.latitude}&lon=${coords.longitude}` +
    `&addressdetails=1&zoom=18`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'AyurmuniApp/1.0',
      Accept: 'application/json',
    },
  });
  const data = await response.json();

  if (!data?.address) {
    throw new Error('Could not resolve address for this pin.');
  }

  const addr = data.address;
  const city =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.suburb ||
    addr.county ||
    '';
  const state = addr.state || '';
  const zipcode = addr.postcode || '';
  const line1 =
    [addr.house_number, addr.road, addr.neighbourhood, addr.suburb]
      .filter(Boolean)
      .join(', ') ||
    data.display_name?.split(',')[0] ||
    '';

  return {
    address_line_1: line1,
    address_line_2: addr.suburb || '',
    city,
    state,
    zipcode,
    country: addr.country || 'India',
    formatted_address: data.display_name || `${line1}, ${city}`,
    latitude: coords.latitude,
    longitude: coords.longitude,
  };
};

export const reverseGeocode = async (
  coords: Coordinates,
): Promise<ParsedAddress> => {
  try {
    const { data } = await tryGoogleRequest(
      key =>
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&language=en&region=in&key=${key}`,
    );

    if (data.status !== 'OK' || !data.results?.length) {
      throw new Error(
        getGoogleApiSetupHint(data.status, data.error_message),
      );
    }

    const result = pickBestGeocodeResult(data.results);
    return parseAddressComponents(
      result.address_components,
      result.formatted_address,
      coords,
    );
  } catch (googleError) {
    console.log('GOOGLE_REVERSE_GEOCODE_FALLBACK', googleError);
    return reverseGeocodeNominatim(coords);
  }
};

export const geocodePincode = async (
  pincode: string,
): Promise<ParsedAddress | null> => {
  const cleaned = pincode.replace(/[^0-9]/g, '');
  if (cleaned.length < 6) return null;

  try {
    const { data } = await tryGoogleRequest(
      key =>
        `https://maps.googleapis.com/maps/api/geocode/json?components=postal_code:${cleaned}|country:IN&language=en&region=in&key=${key}`,
    );

    if (data.status !== 'OK' || !data.results?.length) {
      return null;
    }

    const result = pickBestGeocodeResult(data.results);

    const { lat, lng } = result.geometry.location;
    return parseAddressComponents(
      result.address_components,
      result.formatted_address,
      { latitude: lat, longitude: lng },
    );
  } catch {
    return null;
  }
};

export const searchPlaces = async (
  query: string,
): Promise<PlaceSuggestion[]> => {
  if (!query.trim()) return [];

  const { data } = await tryGoogleRequest(
    key =>
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:in&key=${key}`,
  );

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(getGoogleApiSetupHint(data.status, data.error_message));
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
  const { data } = await tryGoogleRequest(
    key =>
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=address_component,formatted_address,geometry&key=${key}`,
  );

  if (data.status !== 'OK' || !data.result) {
    throw new Error(getGoogleApiSetupHint(data.status, data.error_message));
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

type SavedAddressInput = {
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
};

export const savedAddressToParsed = (
  item: SavedAddressInput,
): ParsedAddress => {
  const line1 = item?.address_line_1 || '';
  const city = item?.city || '';
  const state = item?.state || '';
  const zip = item?.zipcode || '';
  const formatted = [line1, city, state, zip].filter(Boolean).join(', ');

  return {
    address_line_1: line1,
    address_line_2: item?.address_line_2 || '',
    city,
    state,
    zipcode: zip,
    country: item?.country || 'India',
    formatted_address: formatted || line1 || city || 'Saved address',
    latitude: 0,
    longitude: 0,
  };
};
