import React, { useCallback, useEffect, useState } from 'react';
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
};

const LocationPickerScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = (route.params || {}) as RouteParams;
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

  const debouncedQuery = useDebounce(searchQuery, 400);

  const updateLocation = useCallback(async (coords: Coordinates) => {
    setGeocoding(true);
    setLocationError('');
    try {
      const parsed = await reverseGeocode(coords);
      setAddress(parsed);
      setMarker({ latitude: parsed.latitude, longitude: parsed.longitude });
    } catch (error: any) {
      setMarker(coords);
      setLocationError(
        error?.message ||
        'Could not fetch address. Try search or move the map.',
      );
    } finally {
      setGeocoding(false);
    }
  }, []);

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
        setMarker({ latitude: refreshed.latitude, longitude: refreshed.longitude });
        setAddress(refreshed);
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
  }, [updateLocation, refreshCurrentLocation]);

  useEffect(() => {
    if (initialCoords) {
      setLoading(false);
      loadCurrentLocation();
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

  const handleSelectSuggestion = async (item: PlaceSuggestion) => {
    Keyboard.dismiss();
    setSearchQuery(item.main_text);
    setSuggestions([]);
    setGeocoding(true);
    try {
      const parsed = await getPlaceDetails(item.place_id);
      setAddress(parsed);
      setMarker({ latitude: parsed.latitude, longitude: parsed.longitude });
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

    navigation.navigate('AddEditAddress', { type: 'ADD', selectedLocation });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="Pin Your Location" onLeftPress={() => safeGoBack(navigation)} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.searchWrap}>
          <TablerIcon name="search" size={18} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search area, street, landmark..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searching && <ActivityIndicator size="small" color={Colors.primaryColor} />}
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
              <Text style={styles.addressText} numberOfLines={4}>
                {address?.formatted_address || 'Move map or search to detect address'}
              </Text>
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
