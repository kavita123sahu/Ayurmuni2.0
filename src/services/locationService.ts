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

// Geocode / GPS address: maps key only (first key)
const GOOGLE_GEOCODE_KEYS = [GOOGLE_MAPS_API_KEY].filter(
  (key, index, arr) => Boolean(key) && arr.indexOf(key) === index,
);

// Building / POI names need Places API — maps key first, places key fallback
const GOOGLE_PLACES_KEYS = [GOOGLE_MAPS_API_KEY, GOOGLE_PLACES_API_KEY].filter(
  (key, index, arr) => Boolean(key) && arr.indexOf(key) === index,
);

const GOOGLE_KEYS = GOOGLE_GEOCODE_KEYS;

// Android: use Google Play Services fused provider (not coarse cell tower)
Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'whenInUse',
  locationProvider: 'auto',
});

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

const tryGoogleRequest = async (
  buildUrl: (key: string) => string,
  keys: string[] = GOOGLE_KEYS,
) => {
  let lastError = 'Google API unavailable';

  for (const key of keys) {
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
      console.log(
        'GOOGLE_API_STATUS',
        data.status,
        data.error_message || '',
        'key_suffix:',
        key.slice(-6),
      );
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

const geoOptions = (
  highAccuracy: boolean,
  timeout: number,
  maximumAge = 0,
) => ({
  enableHighAccuracy: highAccuracy,
  timeout,
  maximumAge,
  // Android: force a fresh fused GPS reading (avoids 500–800m cell/Wi‑Fi blobs)
  forceRequestLocation: true,
  forceLocationManager: false,
  showLocationDialog: true,
  distanceFilter: 0,
});

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
        console.log('GPS_FIX', {
          accuracy,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
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
      geoOptions(highAccuracy, timeout, maximumAge),
    );
  });

const haversineMeters = (a: Coordinates, b: Coordinates): number => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

/**
 * Prefer a fresh high-accuracy GPS fix.
 * Never accept a ~700m network blob as "current" when GPS can still settle.
 */
export const getCurrentPosition = async (): Promise<Coordinates> => {
  // Continuous GPS watch first — single getCurrentPosition often returns
  // a coarse cell/Wi‑Fi fix (~500–800m) on Android.
  try {
    return await watchPositionOnce(25000, 35, 80);
  } catch {
    // continue
  }

  try {
    return await readPosition(true, 12000, 100, 0);
  } catch {
    // continue
  }

  try {
    return await watchPositionOnce(15000, 60, 120);
  } catch {
    // Absolute last resort — may be coarse
    return readPosition(true, 10000, undefined, 0);
  }
};

/**
 * Watch GPS until accuracy is good enough (or timeout with best sample).
 * @param goodEnoughM resolve early when accuracy ≤ this
 * @param acceptBestM after timeout, only accept best if ≤ this (else reject)
 */
const watchPositionOnce = (
  timeout: number,
  goodEnoughM = 40,
  acceptBestM = 100,
): Promise<Coordinates> =>
  new Promise((resolve, reject) => {
    let watchId: number | null = null;
    let best: Coordinates | null = null;
    let bestAccuracy = Infinity;

    const finish = (coords: Coordinates | null, err?: any) => {
      if (watchId != null) {
        Geolocation.clearWatch(watchId);
        watchId = null;
      }
      if (coords) {
        resolve(coords);
        return;
      }
      reject(err || new Error('Location watch timed out'));
    };

    const timer = setTimeout(() => {
      if (best && bestAccuracy <= acceptBestM) {
        finish(best);
        return;
      }
      finish(null, new Error(`GPS accuracy too low (${bestAccuracy}m)`));
    }, timeout);

    watchId = Geolocation.watchPosition(
      position => {
        const accuracy = position.coords.accuracy ?? Infinity;
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        if (accuracy < bestAccuracy) {
          bestAccuracy = accuracy;
          best = coords;
        }
        if (accuracy <= goodEnoughM) {
          clearTimeout(timer);
          finish(coords);
        }
      },
      error => {
        clearTimeout(timer);
        if (best && bestAccuracy <= acceptBestM) {
          finish(best);
          return;
        }
        finish(null, error);
      },
      {
        ...geoOptions(true, Math.max(timeout, 20000), 0),
      },
    );
  });

const scoreGeocodeResult = (result: any, pin?: Coordinates): number => {
  let score = 0;
  const types: string[] = result?.types || [];
  const locType = result?.geometry?.location_type;

  // Prefer exact building / street hits so Sector 99 is not snapped to 100
  if (locType === 'ROOFTOP') score += 160;
  else if (locType === 'RANGE_INTERPOLATED') score += 110;
  else if (locType === 'GEOMETRIC_CENTER') score += 35;
  else if (locType === 'APPROXIMATE') score -= 40;

  if (types.includes('street_address')) score += 90;
  if (types.includes('premise')) score += 100;
  if (types.includes('subpremise')) score += 95;
  if (types.includes('establishment')) score += 85;
  if (types.includes('point_of_interest')) score += 80;
  if (types.includes('route')) score += 45;
  if (types.includes('neighborhood')) score += 40;
  if (types.includes('sublocality_level_2')) score += 48;
  if (types.includes('sublocality_level_1')) score += 42;
  if (types.includes('sublocality')) score += 38;
  // Broad locality results drift sectors — de-prioritize
  if (types.includes('locality') && types.length <= 2) score -= 40;
  if (types.includes('political') && !types.includes('street_address')) {
    score -= 15;
  }

  const hasPostal = result?.address_components?.some((c: any) =>
    c.types?.includes('postal_code'),
  );
  if (hasPostal) score += 15;

  // Prefer the result whose geometry is closest to the actual pin
  if (pin && result?.geometry?.location) {
    const dist = haversineMeters(pin, {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
    });
    if (dist < 25) score += 80;
    else if (dist < 60) score += 50;
    else if (dist < 120) score += 20;
    else if (dist > 400) score -= 60;
    else if (dist > 200) score -= 30;
  }

  return score;
};

const pickBestGeocodeResult = (results: any[], pin?: Coordinates) =>
  [...results].sort(
    (a, b) => scoreGeocodeResult(b, pin) - scoreGeocodeResult(a, pin),
  )[0];

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

  const premise =
    get('premise') ||
    get('subpremise') ||
    get('establishment') ||
    get('point_of_interest');
  const streetNumber = get('street_number');
  const route = get('route');
  const sublocality =
    get('sublocality_level_2') ||
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

  // Building / POI first, then street, then sector — never only "Sector 99"
  // when a more specific name exists in the formatted address head.
  const street = [streetNumber, route].filter(Boolean).join(' ');
  const formattedHead = (formattedAddress.split(',')[0] || '').trim();
  const addressLine1 =
    premise ||
    street ||
    (formattedHead &&
    !/^sector\b/i.test(formattedHead) &&
    formattedHead.length > 2
      ? formattedHead
      : '') ||
    sublocality ||
    formattedHead ||
    '';

  const line2Parts = [street && premise ? street : '', sublocality].filter(
    p => p && p !== addressLine1,
  );

  return {
    address_line_1: addressLine1.trim(),
    address_line_2: line2Parts.join(', '),
    city: city || '',
    state: state || '',
    zipcode: zipcode || '',
    country: country || 'India',
    formatted_address: formattedAddress,
    latitude: coords.latitude,
    longitude: coords.longitude,
  };
};

const isSectorOnlyLabel = (name: string) =>
  /^sector\s*\d+/i.test(name.trim()) ||
  /^(near|area|locality)\b/i.test(name.trim());

const isWeakPlaceType = (types: string[] = []) =>
  types.includes('locality') ||
  types.includes('political') ||
  types.includes('route') ||
  types.includes('plus_code') ||
  types.includes('sublocality') ||
  types.includes('sublocality_level_1') ||
  types.includes('sublocality_level_2') ||
  types.includes('neighborhood') ||
  types.includes('administrative_area_level_1') ||
  types.includes('administrative_area_level_2') ||
  types.includes('country');

const pickClosestPlaceName = (
  places: any[],
  coords: Coordinates,
  maxMeters: number,
): string | null => {
  let bestName: string | null = null;
  let bestDist = Infinity;

  for (const place of places) {
    const loc = place?.geometry?.location;
    const name = String(place?.name || '').trim();
    if (!loc || !name || isSectorOnlyLabel(name)) continue;
    if (isWeakPlaceType(place.types || [])) continue;

    const dist = haversineMeters(coords, {
      latitude: loc.lat,
      longitude: loc.lng,
    });
    if (dist > maxMeters || dist >= bestDist) continue;
    bestDist = dist;
    bestName = name;
  }

  if (bestName) {
    console.log('NEAREST_PLACE', { name: bestName, meters: Math.round(bestDist) });
  }
  return bestName;
};

/**
 * Nearest named place (building / clinic / shop) at the pin.
 * Reverse geocode alone often only returns "Sector 99".
 * Uses Places keys (maps first, then placesApiKey) so building names resolve.
 */
const fetchNearestPlaceName = async (
  coords: Coordinates,
): Promise<string | null> => {
  const queries = [
    // Closest place of any type
    (key: string) =>
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
      `?location=${coords.latitude},${coords.longitude}` +
      `&rankby=distance&key=${key}`,
    // Establishments / businesses within 100m (e.g. Opus Medi)
    (key: string) =>
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
      `?location=${coords.latitude},${coords.longitude}` +
      `&radius=100&type=establishment&key=${key}`,
  ];

  for (const buildUrl of queries) {
    try {
      const { data } = await tryGoogleRequest(buildUrl, GOOGLE_PLACES_KEYS);
      if (data.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.log('NEARBY_STATUS', data.status, data.error_message);
        continue;
      }
      const places = Array.isArray(data?.results) ? data.results : [];
      const name = pickClosestPlaceName(places, coords, 120);
      if (name) return name;
    } catch (e) {
      console.log('NEAREST_PLACE_LOOKUP_FAILED', e);
    }
  }
  return null;
};

/** Prefer a geocode result whose formatted head is a building, not only Sector N. */
const extractBuildingFromGeocodeResults = (
  results: any[],
  coords: Coordinates,
): string | null => {
  let best: { name: string; score: number } | null = null;

  for (const result of results) {
    const loc = result?.geometry?.location;
    if (!loc) continue;
    const dist = haversineMeters(coords, {
      latitude: loc.lat,
      longitude: loc.lng,
    });
    if (dist > 150) continue;

    const types: string[] = result.types || [];
    const comps: any[] = result.address_components || [];
    const premise =
      comps.find((c: any) =>
        c.types?.some((t: string) =>
          ['premise', 'subpremise', 'establishment', 'point_of_interest'].includes(
            t,
          ),
        ),
      )?.long_name || '';
    const head = String(result.formatted_address || '')
      .split(',')[0]
      .trim();
    const name = premise || head;
    if (!name || isSectorOnlyLabel(name)) continue;

    let score = 200 - dist;
    if (types.includes('premise')) score += 80;
    if (types.includes('establishment')) score += 70;
    if (types.includes('point_of_interest')) score += 60;
    if (types.includes('street_address')) score += 30;
    if (!best || score > best.score) {
      best = { name, score };
    }
  }

  return best?.name || null;
};

const attachNearestPlace = async (
  address: ParsedAddress,
  coords: Coordinates,
  geocodeHint?: string | null,
): Promise<ParsedAddress> => {
  const placeName =
    (await fetchNearestPlaceName(coords)) ||
    (geocodeHint && !isSectorOnlyLabel(geocodeHint) ? geocodeHint : null);

  if (!placeName) return address;

  const line1 = address.address_line_1 || '';
  const alreadyHas =
    line1.toLowerCase().includes(placeName.toLowerCase()) ||
    placeName.toLowerCase().includes(line1.toLowerCase());
  if (alreadyHas && line1.length >= placeName.length) {
    return address;
  }

  const sectorBits = [address.address_line_2, address.city]
    .filter(Boolean)
    .join(', ');

  return {
    ...address,
    address_line_1: placeName,
    address_line_2: [line1, sectorBits]
      .filter(Boolean)
      .filter((v, i, arr) => arr.indexOf(v) === i && v !== placeName)
      .join(', '),
    formatted_address: [placeName, address.formatted_address]
      .filter(Boolean)
      .join(', '),
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
    `&addressdetails=1&zoom=19`;

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
  const building =
    addr.building ||
    addr.amenity ||
    addr.office ||
    addr.shop ||
    addr.tourism ||
    addr.healthcare ||
    '';
  const street = [addr.house_number, addr.road].filter(Boolean).join(' ');
  const line1 =
    building ||
    street ||
    addr.neighbourhood ||
    addr.suburb ||
    data.display_name?.split(',')[0] ||
    '';

  return {
    address_line_1: line1,
    address_line_2: [street && building ? street : '', addr.suburb]
      .filter(Boolean)
      .join(', '),
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
    // Unfiltered — location_type filters drop many building/POI hits
    const { data } = await tryGoogleRequest(
      key =>
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&language=en&region=in&key=${key}`,
    );

    const results = Array.isArray(data.results) ? data.results : [];
    if (data.status !== 'OK' || !results.length) {
      throw new Error(
        getGoogleApiSetupHint(data.status, data.error_message),
      );
    }

    const result = pickBestGeocodeResult(results, coords);
    const parsed = parseAddressComponents(
      result.address_components,
      result.formatted_address,
      coords,
    );
    const geocodeBuilding = extractBuildingFromGeocodeResults(results, coords);
    // Nearby Places fills building names (e.g. Opus Medi) geocode often misses
    return attachNearestPlace(parsed, coords, geocodeBuilding);
  } catch (googleError) {
    console.log('GOOGLE_REVERSE_GEOCODE_FALLBACK', googleError);
    const nominatim = await reverseGeocodeNominatim(coords);
    return attachNearestPlace(nominatim, coords);
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
      return geocodePincodeNominatim(cleaned);
    }

    const result = pickBestGeocodeResult(data.results);

    const { lat, lng } = result.geometry.location;
    return parseAddressComponents(
      result.address_components,
      result.formatted_address,
      { latitude: lat, longitude: lng },
    );
  } catch {
    return geocodePincodeNominatim(cleaned);
  }
};

const geocodePincodeNominatim = async (
  pincode: string,
): Promise<ParsedAddress | null> => {
  try {
    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?postalcode=${encodeURIComponent(pincode)}` +
      `&country=India&format=json&addressdetails=1&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AyurmuniApp/1.0',
        Accept: 'application/json',
      },
    });
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const item = data[0];
    const addr = item.address || {};
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.suburb ||
      addr.county ||
      '';
    const state = addr.state || '';

    return {
      address_line_1: city || pincode,
      address_line_2: addr.suburb || '',
      city,
      state,
      zipcode: pincode,
      country: addr.country || 'India',
      formatted_address: item.display_name || `${city}, ${state} ${pincode}`,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    };
  } catch {
    return null;
  }
};

/**
 * Fill missing city/state from a 6-digit pincode.
 * Never overwrite lat/lng — that snaps the map pin away from the user's drop.
 */
export const enrichAddressWithPincode = async (
  address: ParsedAddress,
): Promise<ParsedAddress> => {
  const zip = address.zipcode?.replace(/[^0-9]/g, '') || '';
  if (zip.length !== 6) {
    return address;
  }

  // Already have city + state — keep pin coords as-is
  if (address.city && address.state) {
    return address;
  }

  const fromPin = await geocodePincode(zip);
  if (!fromPin) {
    return address;
  }

  return {
    ...address,
    city: address.city || fromPin.city,
    state: address.state || fromPin.state,
    zipcode: fromPin.zipcode || zip,
    country: fromPin.country || address.country,
    // Keep the exact pin the user selected
    latitude: address.latitude,
    longitude: address.longitude,
    formatted_address:
      address.formatted_address ||
      fromPin.formatted_address ||
      [address.address_line_1, fromPin.city || address.city, fromPin.state || address.state, zip]
        .filter(Boolean)
        .join(', '),
  };
};

export const searchPlaces = async (
  query: string,
): Promise<PlaceSuggestion[]> => {
  if (!query.trim()) return [];

  const { data } = await tryGoogleRequest(
    key =>
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:in&key=${key}`,
    GOOGLE_PLACES_KEYS,
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
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=address_component,formatted_address,geometry,name&key=${key}`,
    GOOGLE_PLACES_KEYS,
  );

  if (data.status !== 'OK' || !data.result) {
    throw new Error(getGoogleApiSetupHint(data.status, data.error_message));
  }

  const { lat, lng } = data.result.geometry.location;
  const parsed = parseAddressComponents(
    data.result.address_components,
    data.result.formatted_address,
    { latitude: lat, longitude: lng },
  );
  const placeName = String(data.result.name || '').trim();
  if (placeName && !isSectorOnlyLabel(placeName)) {
    return {
      ...parsed,
      address_line_1: placeName,
      address_line_2: [parsed.address_line_1, parsed.address_line_2]
        .filter(Boolean)
        .filter(v => v !== placeName)
        .join(', '),
      formatted_address: [placeName, parsed.formatted_address]
        .filter(Boolean)
        .join(', '),
    };
  }
  return parsed;
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
