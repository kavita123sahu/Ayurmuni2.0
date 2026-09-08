import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
    StatusBar,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';

import { Fonts } from '../common/Fonts';
import { Images } from '../common/Images';
import { Colors } from '../common/Colors';
import *as _PROFILE_SERVICES from '../services/ProfileServices';
import { useFocusEffect } from '@react-navigation/native';
import { showSuccessToast } from '../config/Key';
import { ADDRESS_UPDATED, AddressEvents } from '../common/Utils';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import TablerIcon from '../components/TablerIcon';
import { useLocation } from '../context/LocationContext';
import { savedAddressToParsed } from '../services/locationService';
import { popToScreen } from '../navigation/navigationUtils';

interface AddressItem {
    id: string;
    title: string;
    address: string;
    is_default: boolean;
    city: string;
    address_line_1: string;
    address_line_2: string;
    address_type: string;
    icon: any;
}

const ManageAddress: React.FC<any> = ({ navigation, route }) => {



    const { currentAddress, deliveryLocation, loadingLocation, setDeliveryLocation } = useLocation();
    const returnTo = route?.params?.returnTo as string | undefined;

    const [selectedId, setSelectedId] = useState('current');
    const [loading, setloading] = useState(false);
    const [addressData, setAddressData] = useState<AddressItem[]>([]);
    // const { currentAddress } = useLocation();

    const fetchAddresses = async () => {

        try {
            setloading(true)
            const res: any = await _PROFILE_SERVICES.getAddresses();

            console.log('ADDRESS_RESPONSE', res);

            if (res?.success) {
                setloading(false)
                console.log(
                    'ADDRESS_DATA',
                    res?.data?.results
                );

                const addresses =
                    res?.data?.results || [];
                setAddressData(
                    addresses || []
                );

                const defaultAddress =
                    addresses.find((item: any) => item?.is_default
                    );

                if (defaultAddress) {
                    setSelectedId(
                        defaultAddress.id
                    );
                }
            }

        } catch (error) {
            setloading(false)
            console.log(
                'Address Error:',
                error
            );
        }
    };


    const DeleteAddresses = async (addressId: string) => {

        console.log('Delete Address ID:', addressId);

        try {
            const res: any = await _PROFILE_SERVICES.DeleteAddresses(addressId);

            console.log('ADDRESS_DELETE_RESPONSE', res);

            if (res?.success) {

                AddressEvents.emit(
                    ADDRESS_UPDATED,
                );
                showSuccessToast('Address deleted successfully', 'success');
                fetchAddresses();

            }

        } catch (error) {

            console.log(
                'Address Delete Error:',
                error
            );
        }

    };

    const UpdateDefaultAddress = useCallback(
        async (item: AddressItem) => {
            if (item?.is_default) {
                if (returnTo === 'Checkout') {
                    popToScreen(navigation, 'Checkout');
                }
                return;
            }

            const previousAddresses = [...addressData];
            const previousSelectedId = selectedId;

            // Optimistic local update
            setAddressData(prev =>
                prev.map(address => ({
                    ...address,
                    is_default: address.id === item.id,
                })),
            );

            setSelectedId(item?.id);

            try {
                const payload = {
                    is_default: true,
                };

                console.log('DEFAULT_ADDRESS_PAYLOAD', payload);

                const res: any = await _PROFILE_SERVICES.UpdateAddresses(
                    item?.id,
                    payload,
                );

                console.log('DEFAULT_ADDRESS_RESPONSE', res);

                if (res?.success || res?.status === 200) {
                    await setDeliveryLocation(savedAddressToParsed(item));
                    AddressEvents.emit(ADDRESS_UPDATED, res?.data ?? res);
                    if (returnTo === 'Checkout') {
                        popToScreen(navigation, 'Checkout');
                    } else {
                        navigation.goBack();
                    }

                    // showSuccessToast('Default address updated', 'success');

                    // fetchAddresses();
                } else {
                    throw new Error('Failed to update default address');
                }
            } catch (error) {
                setAddressData(previousAddresses);
                setSelectedId(previousSelectedId);
                console.log('DEFAULT_ADDRESS_ERROR', error);
            }
        },
        [addressData, selectedId, setDeliveryLocation, navigation, returnTo],
    );


    const formatTitle = (text: string) => {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    };

    useEffect(() => {

        fetchAddresses();

        const refreshAddress = () => {

            console.log(
                'ADDRESS_UPDATED_EVENT'
            );

            fetchAddresses();
        };

        // LISTENER
        const subscription =
            AddressEvents.addListener(
                ADDRESS_UPDATED,
                refreshAddress,
            );

        // CLEANUP
        return () => {

            subscription.remove();
        };

    }, []);

    const renderAddressItem = ({
        item,
    }: {
        item: AddressItem;
    }) => {

        const isSelected =
            selectedId === item?.id;


        console.log("itemitemitemaddresss", item)

        return (

            <TouchableOpacity
                activeOpacity={0.8}
                style={[
                    styles.addressCard,
                    isSelected &&
                    styles.selectedCard,
                ]}
                onPress={() =>
                    UpdateDefaultAddress(item)
                }
            >

                {/* LEFT */}

                <View style={styles.iconContainer}>
                    <TablerIcon name="home" size={16} color={Colors.primaryColor} />
                </View>

                {/* CENTER */}

                <View style={styles.cardContent}>

                    <Text style={styles.cardTitle}>
                        {formatTitle(item?.address_type)}
                    </Text>

                    <Text
                        style={styles.addressText}
                        numberOfLines={2}
                    >
                        {item?.address_line_1}, {item?.address_line_2}
                    </Text>

                    <Text style={styles.cityText}>
                        {item?.city}
                    </Text>

                    <View style={styles.actionRow}>

                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={{ backgroundColor: '#e9ebf3', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}
                            onPress={() =>
                                navigation.navigate(
                                    'AddEditAddress',
                                    {
                                        type: 'EDIT',
                                        data: item,
                                        returnTo,
                                    }
                                )
                            }
                        >

                            <Text style={styles.editText}>
                                Edit
                            </Text>


                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ marginLeft: 10, backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}
                            onPress={() => DeleteAddresses(item?.id)}
                            activeOpacity={0.7}
                        >

                            <Text style={styles.deleteText}>
                                Delete
                            </Text>

                        </TouchableOpacity>

                    </View>

                </View>

                {/* RIGHT */}

                {
                    isSelected && (
                        <TablerIcon name="tick-icon" size={16} color={Colors.primaryColor} />
                    )
                }

            </TouchableOpacity>
        );
    };

    return (

        <SafeAreaView style={styles.container}>

            <StatusBar
                barStyle="dark-content"
                backgroundColor="#FFFFFF"
            />

            <AppHeader
                title="Manage Address"
                onLeftPress={() =>
                    navigation.goBack()
                }
            />

            {loading ?

                <LoadingSpinner />

                :
                <ScrollView
                    contentContainerStyle={
                        styles.scroll
                    }
                    showsVerticalScrollIndicator={
                        false
                    }
                >

                    {/* CURRENT LOCATION */}

                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                            styles.currentCard,
                            selectedId === 'current' &&
                            styles.selectedCard,
                        ]}
                        onPress={() =>
                            navigation.navigate('LocationPickerScreen', {
                                returnTo,
                            })
                        }
                    >

                        <View
                            style={styles.locationBox}
                        >

                            <TablerIcon name="current-location" size={16} color={Colors.primaryColor} />

                        </View>

                        <View style={{ flex: 1 }}>

                            <Text
                                style={styles.currentTitle}
                            >
                                Current Location
                            </Text>

                            <Text
                                style={styles.addressText}
                            >
                                {currentAddress?.formatted_address || 'Tap to select current location on map'}
                            </Text>

                            <Text style={styles.cityText}>
                                {currentAddress
                                    ? [currentAddress.city, currentAddress.state, currentAddress.zipcode]
                                        .filter(Boolean)
                                        .join(', ')
                                    : 'Enable location for accurate address'}
                            </Text>

                            <TouchableOpacity>

                                <Text
                                    style={
                                        styles.useLocation
                                    }
                                >
                                    Use precise location
                                </Text>

                            </TouchableOpacity>

                        </View>

                        {
                            selectedId ===
                            'current' && (
                                <TablerIcon name="tick-icon" size={16} color={Colors.primaryColor} />
                            )
                        }

                    </TouchableOpacity>

                    {/* SECTION */}

                    <Text style={styles.heading}>
                        Saved Address
                    </Text>

                    <FlatList
                        data={addressData}
                        keyExtractor={(item) =>
                            item?.id
                        }
                        renderItem={
                            renderAddressItem
                        }
                        ListEmptyComponent={<EmptyState
                            iconName="location"
                            imageSize={20}
                            title="No Address Found"
                            subtitle="You haven't added any address yet."
                        />}
                        scrollEnabled={false}
                    />

                </ScrollView>
            }

            {/* FOOTER */}

            <View style={styles.footer}>

                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.addButton}
                    onPress={() =>
                        navigation.navigate(
                            'AddEditAddress',
                            {
                                type: 'ADD',
                                returnTo,
                            }
                        )
                    }
                >

                    <Text
                        style={
                            styles.addButtonText
                        }
                    >
                        Add New Address
                    </Text>

                </TouchableOpacity>

            </View>

        </SafeAreaView>
    );
};

export default ManageAddress;

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    scroll: {
        padding: 16,
        paddingBottom: 100,
    },

    currentCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#EEF2F6',
        gap: 10,
    },

    selectedCard: {
        borderColor: Colors.primaryColor,
        backgroundColor: '#F0FDF9',
    },

    locationBox: {
        height: 36,
        width: 36,
        borderRadius: 10,
        backgroundColor: '#ECFDF3',
        justifyContent: 'center',
        alignItems: 'center',
    },

    currentTitle: {
        fontSize: 13,
        color: '#111827',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    heading: {
        fontSize: 16,
        marginBottom: 10,
        color: '#111827',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    addressCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#EEF2F6',
        gap: 10,
    },

    iconContainer: {
        height: 36,
        width: 36,
        borderRadius: 10,
        backgroundColor: '#F5F7FA',
        justifyContent: 'center',
        alignItems: 'center',
    },

    cardContent: {
        flex: 1,
        minWidth: 0,
    },

    cardTitle: {
        fontSize: 13,
        color: '#111827',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    addressText: {
        fontSize: 12,
        lineHeight: 17,
        color: '#667085',
        fontFamily: Fonts.PoppinsRegular,
        marginTop: 2,
    },

    cityText: {
        fontSize: 11,
        marginTop: 2,
        color: '#98A2B3',
        fontFamily: Fonts.PoppinsRegular,
    },

    useLocation: {
        marginTop: 6,
        fontSize: 12,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    actionRow: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 8,
    },

    editText: {
        fontSize: 12,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    deleteText: {
        fontSize: 12,
        color: '#EF4444',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    tickIcon: {
        height: 20,
        width: 20,

        tintColor:
            Colors.primaryColor,
    },


    footer: {
        backgroundColor: '#FFFFFF',

        paddingHorizontal: 20,

        paddingTop: 12,
        paddingBottom: 20,

        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },


    addButton: {
        minHeight: 56,

        borderRadius: 18,

        backgroundColor:
            Colors.primaryColor,

        justifyContent: 'center',
        alignItems: 'center',

        paddingVertical: 14,
        paddingHorizontal: 16,
    },

    addButtonText: {
        color: '#FFFFFF',

        fontSize: 16,

        textAlign: 'center',

        fontFamily:
            Fonts.PoppinsSemiBold,
    },

});