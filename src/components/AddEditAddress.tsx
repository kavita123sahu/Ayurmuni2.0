import React, { useState, useEffect, useMemo, useRef } from 'react';

import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from '../components/AppHeader';

import * as _PROFILE_SERVICES from '../services/ProfileServices';

import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import { showSuccessToast } from '../config/Key';
import { ADDRESS_UPDATED, AddressEvents } from '../common/Utils';
import TablerIcon, { TablerIconName } from './TablerIcon';
import { geocodePincode, savedAddressToParsed } from '../services/locationService';
import { useLocation } from '../context/LocationContext';
import {
    popToHomeAfterAddressSave,
    popToScreen,
} from '../navigation/navigationUtils';

const ADDRESS_TYPES: { label: string; value: string; iconName: TablerIconName }[] = [
    {
        label: 'Home',
        value: 'home',
        iconName: 'home',
    },
    {
        label: 'Office',
        value: 'office',
        iconName: 'office',
    },
    {
        label: 'Other',
        value: 'others',
        iconName: 'location',
    },
];

const AddEditAddress = ({ navigation, route }: any) => {

    const editData = route?.params?.data;
    const type = route?.params?.type;
    const selectedLocation = route?.params?.selectedLocation;
    const returnToHome = route?.params?.returnToHome === true;
    const returnTo = route?.params?.returnTo as string | undefined;

    const isEdit = type === 'EDIT';
    const { setDeliveryLocation } = useLocation();

    const [loading, setLoading] =
        useState(false);

    const [selectedType, setSelectedType] =
        useState(
            editData?.address_type || 'home',
        );

    const [address1, setAddress1] =
        useState(
            editData?.address_line_1 || '',
        );

    const [address2, setAddress2] =
        useState(
            editData?.address_line_2 || '',
        );

    const [city, setCity] =
        useState(
            editData?.city || '',
        );

    const [zip, setZip] =
        useState(
            editData?.zipcode || '',
        );

    const [stateValue, setStateValue] =
        useState(
            editData?.state || '',
        );

    const [pincodeLoading, setPincodeLoading] = useState(false);
    const lastPincodeLookupRef = useRef('');
    // City/state locked after GPS or pincode autofill (and when editing saved address)
    const [cityStateLocked, setCityStateLocked] = useState(
        Boolean(editData?.city && editData?.state),
    );

    const isDisabled =
        !address1 ||
        !city ||
        !zip ||
        !stateValue;

    // AUTO-FILL FORM FROM LOCATION PICKER
    useEffect(() => {
        if (selectedLocation) {
            setAddress1(selectedLocation.address_line_1 || '');
            setAddress2(selectedLocation.address_line_2 || '');
            setCity(selectedLocation.city || '');
            setStateValue(selectedLocation.state || '');
            setZip(selectedLocation.zipcode || '');
            if (selectedLocation.city || selectedLocation.state) {
                setCityStateLocked(true);
            }
        }
    }, [selectedLocation]);

    useEffect(() => {
        const lookupPincode = async () => {
            const cleaned = zip.replace(/[^0-9]/g, '');
            if (cleaned.length !== 6 || cleaned === lastPincodeLookupRef.current) {
                return;
            }

            setPincodeLoading(true);
            try {
                const result = await geocodePincode(cleaned);
                if (result) {
                    lastPincodeLookupRef.current = cleaned;
                    setCity(result.city || '');
                    setStateValue(result.state || '');
                    if (result.city || result.state) {
                        setCityStateLocked(true);
                    }
                    if (!address1.trim()) {
                        setAddress1(result.address_line_1 || '');
                    }
                }
            } finally {
                setPincodeLoading(false);
            }
        };

        const timer = setTimeout(lookupPincode, 500);
        return () => clearTimeout(timer);
    }, [zip, address1]);

    useEffect(() => {
        if (zip.length < 6) {
            lastPincodeLookupRef.current = '';
        }
    }, [zip]);

    const locationPreview = useMemo(() => {
        if (selectedLocation?.formatted_address) {
            return selectedLocation.formatted_address;
        }
        const parts = [address1, city, stateValue, zip].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : 'Pin your location on the map';
    }, [selectedLocation, address1, city, stateValue, zip]);

    const finishAfterSave = async (savedItem: any) => {
        const addressRow =
            savedItem?.data ??
            savedItem?.address ??
            savedItem ??
            null;

        if (addressRow) {
            await setDeliveryLocation(savedAddressToParsed(addressRow));
        } else {
            await setDeliveryLocation(
                savedAddressToParsed({
                    address_line_1: address1,
                    address_line_2: address2,
                    city,
                    state: stateValue,
                    zipcode: zip,
                    country: 'India',
                }),
            );
        }

        AddressEvents.emit(ADDRESS_UPDATED, savedItem);

        if (returnToHome) {
            popToHomeAfterAddressSave(navigation);
            return;
        }

        if (returnTo === 'Checkout') {
            popToScreen(navigation, 'Checkout');
            return;
        }

        navigation.goBack();
    };

    const handleSubmit = async () => {

        try {

            setLoading(true);

            if (isEdit) {

                const payload = {

                    address_type: selectedType,

                    address_line_1: address1,

                    address_line_2: address2,

                    city: city,

                    state: stateValue,

                    zipcode: zip,

                    is_default: true,
                };

                console.log(
                    'EDIT_PAYLOAD',
                    payload,
                );

                const res: any =
                    await _PROFILE_SERVICES.UpdateAddresses(
                        editData?.id,
                        payload,
                    );

                console.log(
                    'EDIT_ADDRESS_RESPONSE',
                    res,
                );

                console.log(
                    'UPDATE_ADDRESS_RESPONSE',
                    res,
                );

                if (res?.success) {
                    showSuccessToast('Address updated successfully', 'success');
                    await finishAfterSave(res?.data ?? editData);
                }

            } else {

                const payload = {

                    address_type: selectedType,

                    address_line_1: address1,

                    address_line_2: address2,

                    city: city,

                    state: stateValue,

                    zipcode: zip,

                    is_default: true,

                    country: 'India',
                };

                console.log(
                    'ADD_PAYLOAD',
                    payload,
                );

                const res: any =
                    await _PROFILE_SERVICES.AddAddresses(
                        payload,
                    );

                console.log(
                    'ADD_ADDRESS_RESPONSE',
                    res.data,
                );

                if (res?.success) {
                    showSuccessToast('Address added successfully', 'success');
                    await finishAfterSave(res?.data ?? res);
                }

            }

        } catch (error) {

            console.log(
                'ADDRESS_ERROR',
                error,
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <SafeAreaView style={styles.container}>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={
                    Platform.OS === 'ios'
                        ? 'padding'
                        : 'height'
                }
                
                keyboardVerticalOffset={
                    Platform.OS === 'ios'
                        ? 20
                        : 0
                }
            >

                <AppHeader
                    title={
                        isEdit
                            ? 'Edit Address'
                            : 'Add Address'
                    }
                    onLeftPress={() =>
                        navigation.goBack()
                    }
                />

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.content}
                >

                    {/* LOCATION OPTIONS */}
                    <View style={styles.locationActions}>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() =>
                                navigation.navigate('LocationPickerScreen', {
                                    returnScreen: 'AddEditAddress',
                                    returnParams: {
                                        type,
                                        data: editData,
                                        returnToHome,
                                        returnTo,
                                    },
                                    returnTo,
                                })
                            }
                            style={styles.locationBadge}
                        >
                            <TablerIcon name="map-pin" size={18} color={Colors.primaryColor} />
                            <Text style={styles.badgeText}>Pick on map</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() =>
                                navigation.navigate('LocationPickerScreen', {
                                    returnScreen: 'AddEditAddress',
                                    returnParams: {
                                        type,
                                        data: editData,
                                        returnToHome,
                                        returnTo,
                                    },
                                    returnTo,
                                    useGps: true,
                                })
                            }
                            style={styles.locationBadgeAlt}
                        >
                            <TablerIcon name="current-location" size={18} color={Colors.primaryColor} />
                            <Text style={styles.badgeText}>Use GPS</Text>
                        </TouchableOpacity>
                    </View>

                    {!!selectedLocation && (
                        <View style={styles.locationCard}>
                            <Text style={styles.locationCardTitle}>Selected location</Text>
                            <Text style={styles.locationPreview} numberOfLines={3}>
                                {locationPreview}
                            </Text>
                        </View>
                    )}

                    {/* ADDRESS TYPE */}

                    <Text style={styles.label}>
                        Address Type
                    </Text>

                    <View style={styles.typeRow}>

                        {
                            ADDRESS_TYPES.map((item) => {

                                const isSelected =
                                    selectedType === item.value;

                                return (

                                    <TouchableOpacity
                                        key={item.value}
                                        activeOpacity={0.8}
                                        onPress={() =>
                                            setSelectedType(
                                                item.value,
                                            )
                                        }
                                        style={[
                                            styles.typeCard,

                                            isSelected &&
                                            styles.activeTypeCard,
                                        ]}
                                    >

                                        <TablerIcon
                                            name={item.iconName}
                                            size={18}
                                            color={
                                                isSelected
                                                    ? Colors.primaryColor
                                                    : '#6B7280'
                                            }
                                        />

                                        <Text
                                            style={[
                                                styles.typeText,

                                                isSelected &&
                                                styles.activeTypeText,
                                            ]}
                                        >
                                            {item.label}
                                        </Text>

                                    </TouchableOpacity>
                                );
                            })
                        }

                    </View>

                    {/* ADDRESS LINE 1 */}

                    <Text style={styles.label}>
                        Address Line 1 *
                    </Text>

                    <TextInput
                        value={address1}
                        onChangeText={setAddress1}
                        placeholder="Enter address"
                        placeholderTextColor="#98A2B3"
                        style={styles.input}
                    />

                    {/* ADDRESS LINE 2 */}

                    <Text style={styles.label}>
                        Address Line 2 *
                    </Text>

                    <TextInput
                        value={address2}
                        onChangeText={setAddress2}
                        placeholder="Apartment, floor"
                        placeholderTextColor="#98A2B3"
                        style={styles.input}
                    />

                    {/* CITY + ZIP */}

                    <View style={styles.row}>

                        <View style={styles.flex}>

                            <Text style={styles.label}>
                                City *
                            </Text>

                            <TextInput
                                value={city}
                                onChangeText={setCity}
                                editable={!cityStateLocked}
                                placeholder="City"
                                placeholderTextColor="#98A2B3"
                                style={[
                                    styles.input,
                                    cityStateLocked && styles.inputLocked,
                                ]}
                            />

                        </View>

                        <View style={styles.space} />

                        <View style={styles.flex}>

                            <Text style={styles.label}>
                                Zip Code *
                            </Text>

                            <TextInput
                                value={zip}
                                onChangeText={(text) => {
                                    const cleanedText =
                                        text.replace(/[^0-9]/g, '').slice(0, 6);
                                    if (cleanedText !== zip) {
                                        lastPincodeLookupRef.current = '';
                                    }
                                    // Unlock city/state only when user edits away from a full pincode
                                    if (zip.length === 6 && cleanedText.length < 6) {
                                        setCityStateLocked(false);
                                    }
                                    setZip(cleanedText);
                                }}
                                maxLength={6}
                                keyboardType="number-pad"
                                placeholder="122001"
                                placeholderTextColor="#98A2B3"
                                style={styles.input}
                            />
                            {pincodeLoading && (
                                <ActivityIndicator
                                    size="small"
                                    color={Colors.primaryColor}
                                    style={styles.pinLoader}
                                />
                            )}

                        </View>

                    </View>

                    {/* STATE */}

                    <Text style={styles.label}>
                        State *
                    </Text>

                    <TextInput
                        value={stateValue}
                        onChangeText={setStateValue}
                        editable={!cityStateLocked}
                        placeholder="State"
                        placeholderTextColor="#98A2B3"
                        style={[
                            styles.input,
                            cityStateLocked && styles.inputLocked,
                        ]}
                    />
                    {cityStateLocked ? (
                        <Text style={styles.lockedHint}>
                            City & state are filled from pincode / GPS and can&apos;t be edited
                        </Text>
                    ) : null}

                </ScrollView>

                {/* FOOTER BUTTON */}

                <View style={styles.footer}>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        disabled={
                            isDisabled || loading
                        }
                        onPress={handleSubmit}
                        style={[
                            styles.button,

                            isDisabled &&
                            styles.disabledButton,
                        ]}
                    >

                        {
                            loading
                                ? (
                                    <ActivityIndicator
                                        color="#FFFFFF"
                                    />
                                )
                                : (
                                    <Text style={styles.buttonText}>

                                        {
                                            isEdit
                                                ? 'Update Address'
                                                : 'Save Address'
                                        }

                                    </Text>
                                )
                        }

                    </TouchableOpacity>

                </View>

            </KeyboardAvoidingView>

        </SafeAreaView>
    );
};

export default AddEditAddress;

const styles = StyleSheet.create({

    flex: {
        flex: 1,
    },

    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    content: {
        padding: 20,
        paddingBottom: 120,
    },

    locationActions: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    locationBadge: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: Colors.BGIcon,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#D4ECE5',
    },
    locationBadgeAlt: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    badgeText: {
        color: Colors.primaryColor,
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    locationCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 12,
        marginBottom: 20,
    },
    locationCardTitle: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#64748B',
        marginBottom: 4,
    },
    locationPreview: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsRegular,
        color: '#334155',
        lineHeight: 20,
    },
    pinLoader: {
        position: 'absolute',
        right: 12,
        top: 38,
    },

    label: {
        fontSize: 14,

        marginBottom: 10,

        color: '#111827',

        fontFamily: Fonts.PoppinsSemiBold,
    },

    typeRow: {
        flexDirection: 'row',

        justifyContent: 'space-between',

        marginBottom: 22,
    },

    typeCard: {
        flex: 1,

        height: 58,

        borderRadius: 18,

        backgroundColor: '#FFFFFF',

        borderWidth: 1,
        borderColor: '#E5E7EB',

        justifyContent: 'center',
        alignItems: 'center',

        marginHorizontal: 4,
    },

    activeTypeCard: {
        borderColor: Colors.primaryColor,
        backgroundColor: Colors.BGIcon,
    },

    typeIcon: {
        height: 18,
        width: 18,

        resizeMode: 'contain',

        tintColor: '#6B7280',

        marginBottom: 4,
    },

    typeText: {
        fontSize: 12,

        color: '#6B7280',

        fontFamily: Fonts.PoppinsMedium,
    },

    activeTypeText: {
        color: Colors.primaryColor,
    },

    input: {
        height: 56,

        borderWidth: 1,
        borderColor: '#E5E7EB',

        backgroundColor: '#FFFFFF',

        borderRadius: 18,

        paddingHorizontal: 16,

        marginBottom: 18,

        fontSize: 14,
        color: '#111827',

        fontFamily: Fonts.PoppinsMedium,
    },

    inputLocked: {
        backgroundColor: '#F3F4F6',
        color: '#6B7280',
        borderColor: '#E5E7EB',
    },

    lockedHint: {
        marginTop: -10,
        marginBottom: 14,
        fontSize: 11,
        color: '#64748B',
        fontFamily: Fonts.PoppinsRegular,
    },

    row: {
        flexDirection: 'row',
    },

    space: {
        width: 12,
    },

    footer: {
        padding: 20,

        backgroundColor: '#FFFFFF',

        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },

    button: {
        height: 58,

        borderRadius: 20,

        backgroundColor: Colors.primaryColor,

        justifyContent: 'center',
        alignItems: 'center',
    },

    disabledButton: {
        opacity: 0.5,
    },

    buttonText: {
        color: '#FFFFFF',

        fontSize: 16,

        fontFamily: Fonts.PoppinsSemiBold,
    },

});