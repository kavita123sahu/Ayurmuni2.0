import React, { useState } from 'react';

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
import { Images } from '../common/Images';
import { showSuccessToast } from '../config/Key';
import { ADDRESS_UPDATED, AddressEvents } from '../common/Utils';

const ADDRESS_TYPES = [
    {
        label: 'Home',
        value: 'home',
        icon: Images.home,
    },
    {
        label: 'Office',
        value: 'office',
        icon: Images.office,
    },
    {
        label: 'Other',
        value: 'others',
        icon: Images.location,
    },
];

const AddEditAddress = ({ navigation, route }: any) => {

    const editData = route?.params?.data;
    const type = route?.params?.type;

    const isEdit = type === 'EDIT';

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

    const isDisabled =
        !address1 ||
        !city ||
        !zip ||
        !stateValue;

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

                const json = await res.json();

                console.log(
                    'UPDATE_ADDRESS_RESPONSE',
                    json,
                );

                if (json?.success) {

                    AddressEvents.emit(
                        ADDRESS_UPDATED,
                        json?.data,
                    );
                    showSuccessToast('Address updated successfully', 'success');

                    navigation.goBack();
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

                const json = await res.json();

                console.log(
                    'ADD_ADDRESS_RESPONSE',
                    res,
                );

                console.log(
                    'ADD_ADDRESS_RESPONSE_JSON',
                    json,
                );

                if (json?.success) {


                    AddressEvents.emit(
                        ADDRESS_UPDATED,
                        json?.data,
                    );
                    showSuccessToast('Address added successfully', 'success');

                    // Alert.alert(
                    //     'Success',
                    //     'Address added successfully',
                    // );

                    navigation.goBack();
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
                    leftIcon={Images.backIcon}
                    onLeftPress={() =>
                        navigation.goBack()
                    }
                />

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.content}
                >

                    {/* LOCATION */}

                    <View style={styles.locationBadge}>

                        <Image
                            source={Images.currentLocation}
                            style={styles.badgeIcon}
                        />

                        <Text style={styles.badgeText}>
                            Current Location
                        </Text>

                    </View>

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

                                        <Image
                                            source={item.icon}
                                            style={[
                                                styles.typeIcon,

                                                isSelected && {
                                                    tintColor:
                                                        Colors.primaryColor,
                                                },
                                            ]}
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
                        Address Line 1
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
                        Address Line 2
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
                                City
                            </Text>

                            <TextInput
                                value={city}
                                onChangeText={setCity}
                                placeholder="City"
                                placeholderTextColor="#98A2B3"
                                style={styles.input}
                            />

                        </View>

                        <View style={styles.space} />

                        <View style={styles.flex}>

                            <Text style={styles.label}>
                                Zip Code
                            </Text>

                            <TextInput
                                value={zip}
                                onChangeText={(text) => {
                                    // ONLY NUMBERS ALLOWED
                                    const cleanedText =
                                        text.replace(/[^0-9]/g, '');

                                    setZip(cleanedText);
                                }}
                                // onChangeText={setZip}
                                maxLength={6}
                                keyboardType="number-pad"
                                placeholder="122001"
                                placeholderTextColor="#98A2B3"
                                style={styles.input}
                            />

                        </View>

                    </View>

                    {/* STATE */}

                    <Text style={styles.label}>
                        State
                    </Text>

                    <TextInput
                        value={stateValue}
                        onChangeText={setStateValue}
                        placeholder="State"
                        placeholderTextColor="#98A2B3"
                        style={styles.input}
                    />

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

    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',

        backgroundColor: Colors.BGIcon,

        paddingHorizontal: 16,
        paddingVertical: 12,

        borderRadius: 18,

        alignSelf: 'flex-start',

        marginBottom: 28,
    },

    badgeIcon: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
    },

    badgeText: {
        marginLeft: 8,

        color: Colors.primaryColor,

        fontSize: 14,

        fontFamily: Fonts.PoppinsSemiBold,
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