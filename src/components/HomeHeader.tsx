import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Pressable,
    FlatList,
} from 'react-native';
import { Feather } from '../common/Vector';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as ProfileServices from '../services/ProfileServices';
import { ADDRESS_UPDATED, AddressEvents, Utils } from '../common/Utils';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import { Images } from '../common/Images';
import *as _PROFILE_SERVICES from '../services/ProfileServices';
import CustomBottomSheet from './CustomBottomSheet';
import { showSuccessToast } from '../config/Key';

interface Address {
    city: string;
    address_line_1?: string;
    is_default: boolean;
    state: string;
    zipcode: string;
}

interface UserData {
    first_name: string;
    profile_picture?: string;
    addresses: Address[];
}

interface AddressItem {
    id: string;
    type?: string;
    address_type: string;
    address_type_name: string;
    address_line_1?: string;
    city?: string;
    state?: string;
    zipcode?: string;
}




const HomeHeader = () => {
    const navigation = useNavigation<any>();
    const [showSheet, setShowSheet] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [user, setUser] = useState<UserData | null>(null);
    const [savedAddresses, setSavedAddresses] = useState<AddressItem[]>([]);
    const [address, setAddress] = useState<Address | null>(null);




    const profileImage =
        user?.profile_picture || '';

    const fetchUserData = useCallback(
        async () => {

            try {

                const token =
                    await Utils.getData(
                        '_TOKEN',
                    );

                if (!token) {
                    return;
                }

                const res: any =
                    await ProfileServices.user_profile();

                console.log("ressssssss", res);

                setUser(res?.data || null);

                const defaultAddress =
                    res?.data?.addresses?.find(
                        (item: any) =>
                            item?.is_default,
                    ) || null;

                setSavedAddresses(
                    res?.data?.addresses || [],
                );

                console.log('defaltaddresss',);
                setAddress(
                    defaultAddress,
                );

                setSelectedId(defaultAddress?.id || null);

            } catch (error) {

                console.log(
                    'Profile Error:',
                    error,
                );
            }
        },
        [],
    );

    useEffect(() => {

        fetchUserData();

        const refreshAddress = () => {
            fetchUserData();
        };

        AddressEvents.addListener(
            ADDRESS_UPDATED,
            refreshAddress,
        );

        return () => {

            AddressEvents.emit(
                ADDRESS_UPDATED,
                refreshAddress,
            );
        };

    }, []);




    const firstLetter = user?.first_name?.charAt(0)?.toUpperCase() || '';
    const addressCount =
        user?.addresses?.length || 0;

    const shortAddress = address?.address_line_1 ? address.address_line_1.slice(0, 22) + ", " + address?.city || 'Select City' : 'Select Location';


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
                    res,
                );
                // showSuccessToast(
                //     'Default address updated',
                //     'success',
                // ); 
                fetchUserData();
            }

        } catch (error) {

            console.log(
                'DEFAULT_ADDRESS_ERROR',
                error,
            );
        }
    };



    const renderSavedAddress = ({ item }: { item: AddressItem }) => {

        const fullAddress =
            `${item?.address_line_1 || ''}, ${item?.city || ''}, ${item?.state || ''} ${item?.zipcode || ''}`;

        const isSelected = selectedId === item?.id;

        return (

            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                    UpdateDefaultAddress(item)
                }
                style={[
                    styles.savedCard,
                    isSelected && styles.activeSavedCard,
                ]}
            >

                {/* LEFT ICON */}

                <View style={styles.homeBox}>

                    {
                        item?.address_type === 'home' ||
                            item?.address_type === 'other' ? (

                            <Feather
                                name="home"
                                size={20}
                                color={Colors.primaryColor}
                            />

                        ) : (

                            <Feather
                                name="briefcase"
                                size={20}
                                color={Colors.primaryColor}
                            />

                        )
                    }


                </View>

                {/* CONTENT */}

                <View style={styles.savedContent}>

                    <Text style={styles.homeTitle}>
                        {item?.address_type_name ?? ''}
                    </Text>

                    <Text
                        style={styles.savedAddress}
                        numberOfLines={2}
                    >
                        {fullAddress}
                    </Text>

                </View>

                {/* RIGHT */}

                <View
                    style={[
                        styles.radioOuter,
                        isSelected && styles.radioOuterActive,
                    ]}
                >
                    {
                        isSelected && (
                            <View style={styles.radioInner} />
                        )
                    }
                </View>

            </TouchableOpacity>
        );
    };


    return (
        <View style={styles.container}>
            <View style={styles.topRow}>

                {/* LEFT */}
                <View style={styles.leftSection}>

                    {/* PROFILE IMAGE / LETTER */}
                    <TouchableOpacity
                        style={styles.profileCircle}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        {profileImage ? (

                            <Image
                                source={{ uri: profileImage }}
                                style={styles.profileImage}
                            />

                        ) : (

                            <Text style={styles.profileText}>
                                {firstLetter}
                            </Text>

                        )}
                    </TouchableOpacity>



                    <TouchableOpacity style={styles.locationContainer} onPress={() => setShowSheet(true)}>

                        <Text style={styles.locationLabel}>
                            {
                                [address?.state, address?.zipcode]
                                    .filter(Boolean)
                                    .join(', ') || ''
                            }
                            {/* {address?.state + ', ' + address?.zipcode || '.....'} */}
                        </Text>

                        <View style={styles.locationRow}>

                            <Text
                                style={styles.locationText}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {shortAddress || 'Select Location'}
                            </Text>

                            {/* ICON WRAPPER */}
                            <View style={styles.iconWrapper}>
                                <Feather
                                    name="chevron-down"
                                    size={16}
                                    color="#111827"
                                />
                            </View>

                        </View>
                    </TouchableOpacity>

                </View>

                {/* RIGHT */}
                <View style={styles.rightIcons}>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('EmergencySOS')}
                    >
                        <Image source={Images.SOS} style={{ height: 40, width: 40 }} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.bellButton}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <Feather name="bell" size={20} color="#000" />
                        <View style={styles.dot} />
                    </TouchableOpacity>

                </View>

            </View>



            <CustomBottomSheet
                visible={showSheet}
                onClose={() => setShowSheet(false)}
            >

                {/* SEARCH
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.searchContainer}
                >

                    <Feather
                        name="search"
                        size={22}
                        color="#98A2B3"
                    />

                    <Text style={styles.searchText}>
                        Search area, apartment...
                    </Text>

                </TouchableOpacity> */}

                {/* CURRENT LOCATION CARD */}

                <View style={styles.bigCard}>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                            setShowSheet(false);
                            navigation.navigate('LocationPickerScreen');
                        }}
                        style={styles.rowCard}
                    >

                        <View style={styles.leftRow}>

                            <View style={styles.currentLocationIcon}>
                                <Feather
                                    name="crosshair"
                                    size={20}
                                    color={Colors.primaryColor}
                                />
                            </View>

                            <View style={styles.textContainer}>

                                <Text style={styles.greenTitle}>
                                    Use current location
                                </Text>

                                <Text
                                    numberOfLines={2}
                                    style={styles.subText}
                                >
                                    Gurgaon Sector 22, Haryana 122022
                                </Text>

                            </View>

                        </View>

                        <Feather
                            name="chevron-right"
                            size={20}
                            color="#98A2B3"
                        />

                    </TouchableOpacity>

                    {/* DIVIDER */}
                    <View style={styles.divider} />

                    {/* ADD ADDRESS */}

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('AddEditAddress', { type: 'ADD' })}
                        style={styles.rowCard}
                    >

                        <Pressable style={styles.leftRow} >

                            <View style={styles.plusWrapper}>
                                <Feather
                                    name="plus"
                                    size={20}
                                    color={Colors.primaryColor}
                                />
                            </View>

                            <Text style={styles.greenTitle}>
                                Add New Address
                            </Text>

                        </Pressable>

                        <Feather
                            name="chevron-right"
                            size={20}
                            color="#98A2B3"
                        />

                    </TouchableOpacity>

                </View>

                {/* SAVED ADDRESS */}

                <View style={styles.savedHeader}>

                    <Text style={styles.savedTitle}>
                        Saved Addresses
                    </Text>

                    {
                        addressCount > 2 && (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => {
                                    setShowSheet(false);

                                    navigation.navigate('ManageAdrees')

                                }}
                            >

                                <Text style={styles.viewAllText}>
                                    View All
                                </Text>

                            </TouchableOpacity>
                        )
                    }

                </View>

                <FlatList
                    data={savedAddresses}
                    keyExtractor={(item, index) =>
                        item?.id?.toString() || index.toString()
                    }
                    renderItem={renderSavedAddress}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: 100,
                    }}
                    ItemSeparatorComponent={() => (

                        <View style={{ height: 10 }} />
                    )}
                />

            </CustomBottomSheet>


        </View>
    );
};

export default React.memo(HomeHeader);


const styles = StyleSheet.create({

    container: {
        paddingVertical: 12,
        backgroundColor: '#fff',
        paddingHorizontal: 16, // important for responsiveness
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 21,
        resizeMode: 'cover',
    },
    profileText: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsMedium,
        color: Colors.white,
    },

    profileCircle: {
        height: 42,
        width: 42,
        borderRadius: 21,
        backgroundColor: Colors.primaryColor,
        justifyContent: 'center',
        alignItems: 'center',
    },

    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',

        flex: 1,
        minWidth: 0,
        marginRight: 10, // right icons se spacing
    },

    locationContainer: {
        flex: 1,
        minWidth: 0,
        marginLeft: 12,
    },

    locationLabel: {
        fontSize: 12,
        lineHeight: 16,
        color: '#6B7280',
        fontFamily: Fonts.PoppinsMedium,
        marginBottom: 2,

        flexShrink: 1,
    },

    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',

        flexShrink: 1,
        minWidth: 0,
        alignSelf: 'flex-start', // ⭐ icon text ke paas rahega
    },

    locationText: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#111827',

        maxWidth: '92%', // ⭐ device ke according adjust
        flexShrink: 1,

        marginRight: 2,
    },

    iconWrapper: {
        justifyContent: 'center',
        alignItems: 'center',

        marginTop: 1,

        flexShrink: 0,
    },

    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    bellButton: {
        height: 40,
        width: 40,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },

    dot: {
        position: 'absolute',
        top: 6,
        right: 8,
        height: 8,
        width: 8,
        borderRadius: 4,
        backgroundColor: '#F04438',
    },
    // STYLES

    searchContainer: {
        height: 56,

        borderRadius: 18,
        backgroundColor: '#FFFFFF',

        paddingHorizontal: 16,

        flexDirection: 'row',
        alignItems: 'center',

        marginBottom: 18,

        borderWidth: 1,
        borderColor: Colors.borderColor,
    },

    searchText: {
        marginLeft: 12,

        fontSize: 15,
        color: '#98A2B3',

        fontFamily: Fonts.PoppinsMedium,
    },

    bigCard: {
        backgroundColor: '#FFFFFF',

        borderRadius: 22,

        overflow: 'hidden',

        borderWidth: 1,
        borderColor: '#F2F4F7',

        marginBottom: 20,
    },

    rowCard: {
        minHeight: 72,

        paddingHorizontal: 16,
        paddingVertical: 16,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    leftRow: {
        flexDirection: 'row',
        alignItems: 'center',

        flex: 1,
        minWidth: 0,
    },

    currentLocationIcon: {
        height: 46,
        width: 46,

        borderRadius: 23,

        backgroundColor: Colors.BGIcon,

        justifyContent: 'center',
        alignItems: 'center',

        marginRight: 14,
    },

    plusWrapper: {
        height: 46,
        width: 46,

        borderRadius: 23,

        backgroundColor: '#EEF2FF',

        justifyContent: 'center',
        alignItems: 'center',

        marginRight: 14,
    },

    textContainer: {
        flex: 1,
        minWidth: 0,
    },

    greenTitle: {
        fontSize: 16,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    subText: {

        fontSize: 13,
        lineHeight: 20,

        color: '#667085',

        fontFamily: Fonts.PoppinsRegular,
    },

    divider: {
        height: 1,
        backgroundColor: '#F2F4F7',
    },

    savedTitle: {
        marginBottom: 10,
        fontSize: 18,
        color: '#111827',

        fontFamily: Fonts.PoppinsSemiBold,
    },

    sheetContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },

    savedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 10,
    },

    viewAllText: {
        fontSize: 15,
        marginBottom: 10,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    savedCard: {
        backgroundColor: '#FFFFFF',

        borderRadius: 22,

        padding: 16,

        flexDirection: 'row',
        alignItems: 'center',

        borderWidth: 1,
        borderColor: '#F2F4F7',
    },

    activeSavedCard: {
        borderColor: Colors.primaryColor,
        backgroundColor: '#F8FFFB',
    },
    radioOuter: {
        height: 22,
        width: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#D0D5DD',
        justifyContent: 'center',
        alignItems: 'center',
    },

    radioOuterActive: {
        borderColor: Colors.primaryColor,
    },

    radioInner: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: Colors.primaryColor,
    },

    homeBox: {
        height: 50,
        width: 50,

        borderRadius: 16,

        backgroundColor: '#EEF2FF',

        justifyContent: 'center',
        alignItems: 'center',

        marginRight: 14,
    },

    savedContent: {
        flex: 1,
        minWidth: 0,
    },

    homeTitle: {
        fontSize: 16,
        color: '#111827',
        marginBottom: 1,

        fontFamily: Fonts.PoppinsSemiBold,
    },

    savedAddress: {
        fontSize: 12,
        lineHeight: 20,
        color: '#667085',

        fontFamily: Fonts.PoppinsRegular,
    },
});

