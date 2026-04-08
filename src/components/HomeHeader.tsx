import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { MaterialIcons, Feather } from '../common/Vector';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as ProfileServices from '../services/ProfileServices';
import { Utils } from '../common/Utils';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import { Images } from '../common/Images';
import { Styles } from '../common/Styles';

interface Address {
    city: string;
    
    house_details: string;
    is_default: boolean;
}

interface User {
    first_name: string;
    addresses?: Address[];
}

const HomeHeader = () => {
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();

    const [user, setUser] = useState<User | null>(null);
    const [address, setAddress] = useState<Address | null>(null);

    // 🔥 Optimized API Call
    const fetchUserData = useCallback(async () => {
     
        try {
            const token = await Utils.getData('_TOKEN');
            if (!token) return;

            const res: any = await ProfileServices.user_profile();
            if (res.status !== 200) return;

            const json: User = await res.json();

            setUser(json);

            console.log("jsonnnnnnnnnnnnnn", json);

            const defaultAddress = json.addresses?.find(
                (item) => item.is_default
            );

            console.log("addresssssssssssssssss", defaultAddress)

            setAddress(defaultAddress || null);
        } catch (error) {
            console.log('API Error:', error);
        }
    }, []);

    useEffect(() => {
        if (isFocused) {
            fetchUserData();
        }
    }, [isFocused, fetchUserData]);

    return (
        <View style={styles.container}>
            {/* 🔥 TOP ROW */}
            <View style={styles.topRow}>

                {/* LEFT SECTION */}
                <View style={styles.leftSection}>

                    <TouchableOpacity
                        style={styles.profileCircle}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <Text style={styles.profileText}>
                            {user?.first_name?.[0]?.toUpperCase() || ''}
                        </Text>
                    </TouchableOpacity>

                    {/* 📍 Location Section */}
                    <View style={styles.locationMain}>

                        {/* <View style={styles.profileCircle}>
                            <Image source={Images.location} tintColor={Colors.primaryColor} style={{ height: 22, width: 22, }} />

                        </View> */}


                        <View style={styles.locationContainer}>

                            {/* Header */}
                            <Text style={styles.locationLabel}>
                                {address?.city || 'Select Location'}
                            </Text>

                            {/* Sub Header Row */}
                            <View style={styles.locationRow}>
                                <Text style={styles.locationText}>
                                    {address?.house_details.slice(0,22) || 'Select City'}
                                </Text>
                                <Feather name="chevron-down" size={16} />
                            </View>

                        </View>
                    </View>

                </View>

                {/* RIGHT SECTION */}
                <View style={styles.rightIcons}>

                    <TouchableOpacity style={styles.sosButton} onPress={()=>navigation.navigate('EmergencySOS')}>
                        <Text style={styles.sosText}>SOS</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.bellButton} onPress={()=>navigation.navigate('Notifications')}>
                        <Feather name="bell" size={20} color="#000" />
                        <View style={styles.dot} />
                    </TouchableOpacity>

                </View>
            </View>
        </View>
    );
};

export default React.memo(HomeHeader);

const styles = StyleSheet.create({
    container: {
       paddingVertical:15,
    //    paddingHorizontal:15,
        marginTop: 20,
        backgroundColor: '#ffff',
    },

    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },



    profileCircle: {
        height: 42,
        width: 42,
        borderRadius: 21,
        backgroundColor: Colors.primaryColor,
        justifyContent: 'center',
        alignItems: 'center',
    },

    profileText: {
        fontSize: 16,
       fontFamily: Fonts.PoppinsMedium,
        color: Colors.white,
    },

    locationMain: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    locationContainer: {
        flexDirection: 'column',
        marginLeft:10
    },

    locationLabel: {
        fontSize: 12,
        color: Colors.textColor,
        fontFamily: Fonts.PoppinsMedium
    },

    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    locationText: {
        fontSize: 14,
       fontFamily : Fonts.PoppinsSemiBold,
        color: '#111827',
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    sosButton: {
        borderWidth: 1,
        borderColor: '#F04438',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginRight: 10,
        backgroundColor: '#FFF1F0',
    },

    sosText: {
        color: '#F04438',
        fontWeight: '600',
    },

    bellButton: {
        height: 40,
        width: 40,
        borderRadius: 12,
        backgroundColor: '#F2F4F7',
        justifyContent: 'center',
        alignItems: 'center',
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
});