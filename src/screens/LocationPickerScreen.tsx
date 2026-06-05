import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    PermissionsAndroid,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import { Images } from '../common/Images';
import AppHeader from '../components/AppHeader';

const LocationPickerScreen = ({ navigation }: any) => {
    const mapRef = useRef<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState<any>(null);
    const [initialRegion, setInitialRegion] = useState<any>(null);

    useEffect(() => {
        requestLocationPermission();
    }, []);

    const requestLocationPermission = async () => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission',
                        message: 'App needs access to your location',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );

                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert('Permission Denied', 'Location permission is required');
                    navigation.goBack();
                    return;
                }
            }

            getCurrentLocation();
        } catch (error) {
            console.log('PERMISSION_ERROR:', error);
            Alert.alert('Error', 'Failed to request location permission');
            navigation.goBack();
        }
    };

    const getCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                const region = {
                    latitude,
                    longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                };
                setInitialRegion(region);
                setSelectedLocation({ latitude, longitude });
                setLoading(false);
            },
            error => {
                console.log('GEO_ERROR:', error);
                Alert.alert('Error', 'Failed to get current location');
                navigation.goBack();
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
    };

    const reverseGeocode = async (latitude: number, longitude: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            );
            const data = await response.json();

            const address = data.address || {};
            const fullAddress = data.display_name || '';

            // Extract address components
            const addressLine1 = address.house_number
                ? `${address.house_number} ${address.road || ''}`
                : address.road || fullAddress.split(',')[0];

            const city = address.city || address.town || address.county || '';
            const state = address.state || '';
            const zipcode = address.postcode || '';

            return {
                address_line_1: addressLine1.trim(),
                address_line_2: address.neighbourhood || '',
                city: city.trim(),
                state: state.trim(),
                zipcode: zipcode.trim(),
                latitude,
                longitude,
            };
        } catch (error) {
            console.log('GEOCODING_ERROR:', error);
            throw error;
        }
    };

    const handleMapPress = (e: any) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setSelectedLocation({ latitude, longitude });
    };

    const handleConfirmLocation = async () => {
        if (!selectedLocation) {
            Alert.alert('Error', 'Please select a location');
            return;
        }

        try {
            setLoading(true);
            const addressData = await reverseGeocode(
                selectedLocation.latitude,
                selectedLocation.longitude,
            );

            setLoading(false);
            navigation.navigate('AddEditAddress', {
                selectedLocation: addressData,
            });
        } catch (error) {
            setLoading(false);
            Alert.alert('Error', 'Failed to get address details');
        }
    };

    if (loading && !initialRegion) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primaryColor} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Select Location"
                leftIcon={Images.backIcon}
                onLeftPress={() => navigation.goBack()}
            />

            <View style={styles.mapContainer}>
                {initialRegion && (
                    <MapView
                        ref={mapRef}
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        initialRegion={initialRegion}
                        onPress={handleMapPress}
                        showsUserLocation={true}
                        followsUserLocation={true}
                    >
                        {selectedLocation && (
                            <Marker
                                coordinate={selectedLocation}
                                title="Selected Location"
                                description="Drop pin here"
                            />
                        )}
                    </MapView>
                )}

                {/* Center PIN Indicator */}
                <View style={styles.centerPin}>
                    <Text style={styles.pinEmoji}>📍</Text>
                </View>
            </View>

            {/* BOTTOM INFO CARD */}
            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Tap on map to select location</Text>
                <Text style={styles.infoSubtitle}>
                    {selectedLocation
                        ? `Lat: ${selectedLocation.latitude.toFixed(4)}, Lon: ${selectedLocation.longitude.toFixed(4)}`
                        : 'Loading...'}
                </Text>
            </View>

            {/* FOOTER BUTTONS */}
            <View style={styles.footer}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => navigation.goBack()}
                    style={styles.cancelButton}
                >
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleConfirmLocation}
                    disabled={loading}
                    style={styles.confirmButton}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.confirmText}>Use This Location</Text>
                    )}
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

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },

    mapContainer: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
    },

    map: {
        ...StyleSheet.absoluteFillObject,
    },

    centerPin: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -30,
        marginLeft: -15,
        zIndex: 10,
    },

    pinEmoji: {
        fontSize: 60,
    },

    infoCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },

    infoTitle: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#111827',
        marginBottom: 4,
    },

    infoSubtitle: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
        color: '#6B7280',
    },

    footer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        gap: 12,
    },

    cancelButton: {
        flex: 1,
        height: 56,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },

    cancelText: {
        color: '#6B7280',
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    confirmButton: {
        flex: 1,
        height: 56,
        borderRadius: 18,
        backgroundColor: Colors.primaryColor,
        justifyContent: 'center',
        alignItems: 'center',
    },

    confirmText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
    },
});
