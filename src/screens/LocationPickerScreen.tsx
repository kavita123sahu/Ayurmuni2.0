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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import AppHeader from '../components/AppHeader';
import StaticMapPicker from '../components/StaticMapPicker';
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
import { showSuccessToast } from '../config/Key';

type RouteParams = {
  returnScreen?: string;
  returnParams?: Record<string, unknown>;
};

const LocationPickerScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = (route.params || {}) as RouteParams;

  const [marker, setMarker] = useState<Coordinates>(getDefaultRegion());
  const [address, setAddress] = useState<ParsedAddress | null>(null);
  const [loading, setLoading] = useState(true);
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
      setMarker({
        latitude: parsed.latitude,
        longitude: parsed.longitude,
      });
    } catch (error: any) {
      console.log('REVERSE_GEOCODE_ERROR', error);
      setMarker(coords);
      setLocationError('Could not fetch address. Try moving the pin or search.');
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
        setLocationError('Location permission denied. Enable it in settings.');
        showLocationPermissionAlert();
        return;
      }

      const coords = await getCurrentPosition();
      await updateLocation(coords);
      showSuccessToast('Current location detected', 'success');
    } catch (error: any) {
      console.log('INIT_LOCATION_ERROR', error);
      const code = error?.code;
      const fallback = getDefaultRegion();
      setMarker(fallback);
      try {
        await updateLocation(fallback);
      } catch {
        // keep map usable even if geocode fails
      }
      if (code === 1) {
        setLocationError('Location permission denied. Search or drag the map to pick address.');
        showLocationPermissionAlert();
      } else if (code === 2) {
        setLocationError('GPS unavailable. Turn on location or search for your area.');
      } else if (code === 3) {
        setLocationError('GPS timed out. Map loaded — search or tap My Location to retry.');
      } else {
        setLocationError('Could not detect GPS. Search or drag the map to select address.');
      }
    } finally {
      setLoading(false);
    }
  }, [updateLocation]);

  useEffect(() => {
    loadCurrentLocation();
  }, [loadCurrentLocation]);

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
      } catch (error) {
        console.log('PLACES_SEARCH_ERROR', error);
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    };
    runSearch();
  }, [debouncedQuery]);

  const handleMapCenterChange = (coords: Coordinates) => {
    updateLocation(coords);
    Keyboard.dismiss();
    setSuggestions([]);
  };

  const handleSelectSuggestion = async (item: PlaceSuggestion) => {
    Keyboard.dismiss();
    setSearchQuery(item.main_text);
    setSuggestions([]);
    setGeocoding(true);
    try {
      const parsed = await getPlaceDetails(item.place_id);
      setAddress(parsed);
      setMarker({
        latitude: parsed.latitude,
        longitude: parsed.longitude,
      });
    } catch (error) {
      console.log('PLACE_DETAILS_ERROR', error);
      Alert.alert('Error', 'Could not load this place. Please try again.');
    } finally {
      setGeocoding(false);
    }
  };

  const handleConfirm = () => {
    if (!address) {
      Alert.alert('Select location', 'Please wait for address to load or pick a place on the map.');
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

    if (params.returnScreen) {
      navigation.dispatch(
        CommonActions.navigate({
          name: params.returnScreen,
          params: {
            ...params.returnParams,
            selectedLocation,
          },
          merge: true,
        }),
      );
      return;
    }

    navigation.navigate('AddEditAddress', {
      type: 'ADD',
      selectedLocation,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader
        title="Select Location"
        onLeftPress={() => navigation.goBack()}
      />

      <View style={styles.searchWrap}>
        <TablerIcon name="search" size={18} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for area, street, landmark..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searching && (
          <ActivityIndicator size="small" color={Colors.primaryColor} />
        )}
      </View>

      {suggestions.length > 0 && (
        <View style={styles.suggestionsBox}>
          <FlatList
            data={suggestions}
            keyExtractor={item => item.place_id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
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
            )}
          />
        </View>
      )}

      <View style={styles.mapSection}>
        <StaticMapPicker
          center={marker}
          onCenterChange={handleMapCenterChange}
          loading={loading}
        />

        <TouchableOpacity
          style={styles.recenterBtn}
          onPress={loadCurrentLocation}
          disabled={loading}
        >
          <TablerIcon name="current-location" size={22} color={Colors.primaryColor} />
          <Text style={styles.recenterText}>My Location</Text>
        </TouchableOpacity>

        <Text style={styles.dragHint}>Drag map to adjust pin position</Text>
      </View>

      {!!locationError && (
        <Text style={styles.errorText}>{locationError}</Text>
      )}

      <View style={styles.addressCard}>
        {geocoding ? (
          <ActivityIndicator color={Colors.primaryColor} />
        ) : (
          <>
            <TablerIcon name="map-pin" size={20} color={Colors.primaryColor} />
            <Text style={styles.addressText} numberOfLines={3}>
              {address?.formatted_address ||
                'Move the map or tap My Location to detect address'}
            </Text>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, (!address || geocoding) && styles.confirmDisabled]}
          disabled={!address || geocoding}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LocationPickerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: 180,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  suggestionText: {
    flex: 1,
  },
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
  mapSection: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recenterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 16,
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
  dragHint: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
    color: '#94A3B8',
  },
  errorText: {
    marginHorizontal: 16,
    marginBottom: 4,
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
    color: '#DC2626',
    textAlign: 'center',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    margin: 16,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 56,
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
  confirmBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmDisabled: {
    opacity: 0.5,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
