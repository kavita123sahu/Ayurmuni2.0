import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Platform,
  Keyboard,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import AppHeader from '../components/AppHeader';
import InteractiveMapPicker from '../components/InteractiveMapPicker';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import TablerIcon from '../components/TablerIcon';
import {
  Coordinates,
  ParsedAddress,
  PlaceSuggestion,
  getCurrentPosition,
  getDefaultRegion,
  getPlaceDetails,
  geocodePincode,
  enrichAddressWithPincode,
  requestLocationPermission,
  reverseGeocode,
  searchPlaces,
  showLocationPermissionAlert,
} from '../services/locationService';
import { useDebounce } from '../hooks/useDebaunce';
import { useLocation } from '../context/LocationContext';
import { safeGoBack } from '../navigation/navigationUtils';

type RouteParams = {
  returnScreen?: string;
  returnParams?: Record<string, unknown>;
  useGps?: boolean;
  returnTo?: string;
};

const LocationPickerScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = (route.params || {}) as RouteParams;
  const useGpsOnly = params.useGps === true;
  const { currentAddress, deliveryLocation, refreshCurrentLocation, setDeliveryLocation } = useLocation();

  const initialCoords =
    currentAddress ||
    (deliveryLocation?.latitude && deliveryLocation?.longitude
      ? deliveryLocation
      : null);

  const [marker, setMarker] = useState<Coordinates>(
    initialCoords
      ? { latitude: initialCoords.latitude, longitude: initialCoords.longitude }
      : getDefaultRegion(),
  );
  const [address, setAddress] = useState<ParsedAddress | null>(
    currentAddress || deliveryLocation,
  );
  const [loading, setLoading] = useState(!initialCoords);
  const [geocoding, setGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [locationError, setLocationError] = useState('');

  // const [searching, setSearching] = useState(false);
  // const [locationError, setLocationError] = useState('');
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const lastPincodeLookupRef = useRef('');

  const debouncedQuery = useDebounce(searchQuery, 400);
  const debouncedPincode = useDebounce(pincodeInput, 500);

  const applyParsedAddress = useCallback((parsed: ParsedAddress) => {
    setAddress(parsed);
    setMarker({ latitude: parsed.latitude, longitude: parsed.longitude });
    if (parsed.zipcode) {
      setPincodeInput(parsed.zipcode.replace(/[^0-9]/g, '').slice(0, 6));
    }
  }, []);

  const updateLocation = useCallback(async (coords: Coordinates) => {
    setGeocoding(true);
    setLocationError('');
    try {
      const parsed = await reverseGeocode(coords);
      const enriched = await enrichAddressWithPincode(parsed);
      applyParsedAddress(enriched);
    } catch (error: any) {
      setMarker(coords);
      setLocationError(
        error?.message ||
        'Could not fetch address. Try search or move the map.',
      );
    } finally {
      setGeocoding(false);
    }
  }, [applyParsedAddress]);

  const loadCurrentLocation = useCallback(async () => {
    setLoading(true);
    setLocationError('');
    try {
      const granted = await requestLocationPermission();
      if (!granted) {
        setLocationError('Enable location permission in settings.');
        showLocationPermissionAlert();
        return;
      }
      const coords = await getCurrentPosition();
      await updateLocation(coords);
    } catch (error: any) {
      const refreshed = await refreshCurrentLocation();
      if (refreshed) {
        const enriched = await enrichAddressWithPincode(refreshed);
        applyParsedAddress(enriched);
      } else {
        const code = error?.code;
        if (code === 3) {
          setLocationError('GPS slow — move map or search your area.');
        } else if (code === 1) {
          setLocationError('Permission denied. Search or enable GPS.');
        } else {
          setLocationError('GPS unavailable. Search or drag map to select.');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [updateLocation, refreshCurrentLocation, applyParsedAddress]);

  useEffect(() => {
    if (initialCoords) {
      setLoading(false);
      if (currentAddress?.zipcode) {
        setPincodeInput(currentAddress.zipcode.replace(/[^0-9]/g, '').slice(0, 6));
      } else if (deliveryLocation?.zipcode) {
        setPincodeInput(deliveryLocation.zipcode.replace(/[^0-9]/g, '').slice(0, 6));
      }
      if (useGpsOnly) {
        loadCurrentLocation();
      }
      return;
    }
    loadCurrentLocation();
  }, []);

  useEffect(() => {
    const runSearch = async () => {
      if (!debouncedQuery.trim()) {
        setSuggestions([]);
        return;
      }
      setSearching(true);
      try {
        const results = await searchPlaces(debouncedQuery);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    };
    runSearch();
  }, [debouncedQuery]);

  useEffect(() => {
    const lookupByPincode = async () => {
      const cleaned = debouncedPincode.replace(/[^0-9]/g, '');
      if (cleaned.length !== 6 || cleaned === lastPincodeLookupRef.current) {
        return;
      }

      setPincodeLoading(true);
      setLocationError('');
      try {
        const parsed = await geocodePincode(cleaned);
        if (!parsed) {
          setLocationError('Invalid pincode. Please check and try again.');
          return;
        }

        lastPincodeLookupRef.current = cleaned;
        setAddress(prev => ({
          ...parsed,
          address_line_1: prev?.address_line_1 || parsed.address_line_1,
          address_line_2: prev?.address_line_2 || parsed.address_line_2,
          formatted_address:
            parsed.formatted_address ||
            [parsed.city, parsed.state, cleaned].filter(Boolean).join(', '),
        }));
        setMarker({ latitude: parsed.latitude, longitude: parsed.longitude });
      } catch {
        setLocationError('Could not fetch address for this pincode.');
      } finally {
        setPincodeLoading(false);
      }
    };

    lookupByPincode();
  }, [debouncedPincode]);

  const handleSelectSuggestion = async (item: PlaceSuggestion) => {
    Keyboard.dismiss();
    setSearchQuery(item.main_text);
    setSuggestions([]);
    setGeocoding(true);
    try {
      const parsed = await getPlaceDetails(item.place_id);
      const enriched = await enrichAddressWithPincode(parsed);
      applyParsedAddress(enriched);
    } catch {
      Alert.alert('Error', 'Could not load this place. Please try again.');
    } finally {
      setGeocoding(false);
    }
  };

  const handleContinue = async () => {
    if (!address) {
      Alert.alert('Select location', 'Move the map or search to pick your address.');
      return;
    }

    const selectedLocation = {
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2,
      city: address.city,
      state: address.state,
      zipcode: address.zipcode,
      country: address.country,
      latitude: address.latitude,
      longitude: address.longitude,
      formatted_address: address.formatted_address,
    };

    await setDeliveryLocation(address);

    if (params.returnScreen) {
      navigation.dispatch(
        CommonActions.navigate({
          name: params.returnScreen,
          params: { ...params.returnParams, selectedLocation },
          merge: true,
        }),
      );
      return;
    }

    navigation.navigate('AddEditAddress', {
      type: 'ADD',
      selectedLocation,
      returnTo: params.returnTo,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="Pin Your Location" onLeftPress={() => safeGoBack(navigation)} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
      >
        {/* <View style={styles.searchWrap}>
          <TablerIcon name="search" size={18} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search area, street, landmark..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searching && <ActivityIndicator size="small" color={Colors.primaryColor} />}
        </View> */}

        <View style={styles.pincodeWrap}>
          <TablerIcon name="map-pin" size={18} color="#64748B" />
          <TextInput
            style={styles.pincodeInput}
            placeholder="Enter 6-digit pincode"
            placeholderTextColor="#94A3B8"
            value={pincodeInput}
            onChangeText={text => {
              const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
              if (cleaned !== pincodeInput) {
                lastPincodeLookupRef.current = '';
              }
              setPincodeInput(cleaned);
            }}
            keyboardType="number-pad"
            maxLength={6}
          />
          {pincodeLoading && (
            <ActivityIndicator size="small" color={Colors.primaryColor} />
          )}
        </View>

        {suggestions.length > 0 && (
          <View style={styles.suggestionsBox}>
            {suggestions.map(item => (
              <TouchableOpacity
                key={item.place_id}
                style={styles.suggestionItem}
                onPress={() => handleSelectSuggestion(item)}
              >
                <TablerIcon name="map-pin" size={16} color={Colors.primaryColor} />
                <View style={styles.suggestionText}>
                  <Text style={styles.suggestionMain}>{item.main_text}</Text>
                  {!!item.secondary_text && (
                    <Text style={styles.suggestionSub}>{item.secondary_text}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <InteractiveMapPicker
          center={marker}
          onCenterChange={updateLocation}
          loading={loading}
        />

        <TouchableOpacity
          style={styles.recenterBtn}
          onPress={loadCurrentLocation}
          disabled={loading}
        >
          <TablerIcon name="current-location" size={20} color={Colors.primaryColor} />
          <Text style={styles.recenterText}>Use my current location</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>Move the map — pin stays at center</Text>

        {!!locationError && <Text style={styles.errorText}>{locationError}</Text>}

        <View style={styles.addressCard}>
          {geocoding ? (
            <ActivityIndicator color={Colors.primaryColor} />
          ) : (
            <>
              <TablerIcon name="map-pin" size={20} color={Colors.primaryColor} />
              <View style={{ flex: 1 }}>
                <Text style={styles.addressText} numberOfLines={4}>
                  {address?.formatted_address || 'Move map, search, or enter pincode'}
                </Text>
                {!!address?.city && (
                  <Text style={styles.addressMeta}>
                    {[address.city, address.state, address.zipcode].filter(Boolean).join(', ')}
                  </Text>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, (!address || geocoding) && styles.btnDisabled]}
          disabled={!address || geocoding}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>Continue</Text>
          <TablerIcon name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LocationPickerScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { paddingHorizontal: 16, paddingBottom: 16 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.PoppinsRegular,
    color: '#0F172A',
    paddingVertical: 0,
  },
  pincodeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  pincodeInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.PoppinsRegular,
    color: '#0F172A',
    paddingVertical: 0,
  },
  suggestionsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  suggestionText: { flex: 1 },
  suggestionMain: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
    color: '#0F172A',
  },
  suggestionSub: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
    color: '#64748B',
    marginTop: 2,
  },
  recenterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.primaryColor,
  },
  recenterText: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
  },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
    color: '#94A3B8',
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 6,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 14,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 60,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.PoppinsMedium,
    color: '#334155',
    lineHeight: 20,
  },
  addressMeta: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
    color: '#64748B',
    marginTop: 4,
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  continueBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: Colors.primaryColor,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  btnDisabled: { opacity: 0.5 },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
