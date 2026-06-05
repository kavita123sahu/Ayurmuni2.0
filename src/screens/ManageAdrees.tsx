import React, { useEffect, useState } from 'react';
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

interface AddressItem {
    id: string;
    title: string;
    address: string;
    city: string;
    address_line_1: string;
    address_line_2: string;
    address_type: string;
    icon: any;
}

const ManageAddress: React.FC<any> = ({ navigation }) => {

    const [selectedId, setSelectedId] = useState('current');

    const [addressData, setAddressData] = useState<AddressItem[]>([]);

    const fetchAddresses = async () => {

        try {

            const res: any = await _PROFILE_SERVICES.getAddresses();

            console.log('ADDRESS_RESPONSE', res);

            if (res?.success) {

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
                    addresses.find((item: any) => item.is_default
                    );

                if (defaultAddress) {
                    setSelectedId(
                        defaultAddress.id
                    );
                }
            }

        } catch (error) {

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

    const UpdateDefaultAddress = async (item: AddressItem) => {

        try {

            // UI instant update
            setSelectedId(item.id);

            const payload = {
                is_default: true,
            };

            console.log(
                'DEFAULT_ADDRESS_PAYLOAD',
                payload,
            );

            const res: any =
                await _PROFILE_SERVICES.UpdateAddresses(
                    item.id,
                    payload,
                );

            console.log(
                'DEFAULT_ADDRESS_RESPONSE',
                res,
            );

            if (res?.success) {


                AddressEvents.emit(
                    ADDRESS_UPDATED,
                    res.data,
                );
                showSuccessToast(
                    'Default address updated',
                    'success',
                );

                fetchAddresses();
            }

        } catch (error) {

            console.log(
                'DEFAULT_ADDRESS_ERROR',
                error,
            );
        }
    };


    const formatTitle = (text: string) => {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    };

    useEffect(() => {

        // INITIAL API HIT
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
            selectedId === item.id;


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

                    <Image
                        source={Images.home}
                        style={styles.icon}
                    />

                </View>

                {/* CENTER */}

                <View style={styles.cardContent}>

                    <Text style={styles.cardTitle}>
                        {formatTitle(item.address_type)}
                    </Text>

                    <Text
                        style={styles.addressText}
                        numberOfLines={2}
                    >
                        {item.address_line_1}, {item.address_line_2}
                    </Text>

                    <Text style={styles.cityText}>
                        {item.city}
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
                            onPress={() => DeleteAddresses(item.id)}
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
                        <Image
                            source={Images.tickIcon}
                            style={styles.tickIcon}
                        />
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
                leftIcon={Images.backIcon}
                onLeftPress={() =>
                    navigation.goBack()
                }
            />

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
                        setSelectedId('current')
                    }
                >

                    <View
                        style={styles.locationBox}
                    >

                        <Image
                            source={
                                Images.currentLocation
                            }
                            style={
                                styles.locationIcon
                            }
                        />

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
                            Sector 22 Gurgaon Haryana
                        </Text>

                        <Text style={styles.cityText}>
                            Gurgaon, HR 122001
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
                            <Image
                                source={
                                    Images.tickIcon
                                }
                                style={
                                    styles.tickIcon
                                }
                            />
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
                        item.id
                    }
                    renderItem={
                        renderAddressItem
                    }
                    ListEmptyComponent={<EmptyState
                        image={Images.location}
                        imageSize={20}
                        title="No Address Found"
                        subtitle="You haven't added any address yet."
                    />}
                    scrollEnabled={false}
                />

            </ScrollView>

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
        padding: 20,
        paddingBottom: 120,
    },

    currentCard: {
        flexDirection: 'row',

        backgroundColor: '#FFFFFF',

        borderRadius: 22,

        padding: 16,

        marginBottom: 24,

        borderWidth: 1,
        borderColor: '#EEF2F6',
    },

    selectedCard: {
        borderColor:
            Colors.primaryColor,

        backgroundColor: '#F0FDF9',
    },

    locationBox: {
        height: 48,
        width: 48,

        borderRadius: 16,

        backgroundColor: '#ECFDF3',

        justifyContent: 'center',
        alignItems: 'center',

        marginRight: 14,
    },

    locationIcon: {
        height: 22,
        width: 22,
        resizeMode: 'contain',
    },

    currentTitle: {
        fontSize: 15,

        color: '#111827',

        fontFamily:
            Fonts.PoppinsSemiBold,
    },

    heading: {
        fontSize: 20,

        marginBottom: 16,

        color: '#111827',

        fontFamily:
            Fonts.PoppinsSemiBold,
    },

    addressCard: {
        flexDirection: 'row',

        backgroundColor: '#FFFFFF',

        borderRadius: 22,

        padding: 16,

        marginBottom: 14,

        borderWidth: 1,
        borderColor: '#EEF2F6',
    },

    iconContainer: {
        height: 46,
        width: 46,

        borderRadius: 14,

        backgroundColor: '#F5F7FA',

        justifyContent: 'center',
        alignItems: 'center',

        marginRight: 14,
    },

    icon: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
    },

    cardContent: {
        flex: 1,
    },

    cardTitle: {
        fontSize: 15,

        color: '#111827',

        marginBottom: 2,

        fontFamily:
            Fonts.PoppinsSemiBold,
    },

    addressText: {
        fontSize: 13,

        lineHeight: 20,

        color: '#667085',

        fontFamily:
            Fonts.PoppinsMedium,
    },

    cityText: {
        fontSize: 12,

        marginTop: 2,

        color: '#98A2B3',

        fontFamily:
            Fonts.PoppinsMedium,
    },

    useLocation: {
        marginTop: 8,

        fontSize: 13,

        color:
            Colors.primaryColor,

        fontFamily:
            Fonts.PoppinsSemiBold,
    },

    actionRow: {
        flexDirection: 'row',

        marginTop: 10,

        gap: 16,
    },

    editText: {
        fontSize: 13,

        color:
            Colors.primaryColor,

        fontFamily:
            Fonts.PoppinsSemiBold,
    },

    deleteText: {
        fontSize: 13,

        color: '#EF4444',

        fontFamily:
            Fonts.PoppinsSemiBold,
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