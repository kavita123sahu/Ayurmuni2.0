import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { MaterialIcons, Feather } from '../common/Vector';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as ProfileServices from '../services/ProfileServices';
import { Utils } from '../common/Utils';

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

            const defaultAddress = json.addresses?.find(
                (item) => item.is_default
            );

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

                    {/* Profile Avatar */}
                    <TouchableOpacity
                        style={styles.profileCircle}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <Text style={styles.profileText}>
                            {user?.first_name?.[0]?.toUpperCase() || ''}
                        </Text>
                    </TouchableOpacity>

                    {/* Location */}
                    <View style={styles.locationContainer}>
                        <Text style={styles.locationLabel}>Your Location</Text>

                        <View style={styles.locationRow}>
                            <MaterialIcons name="location-on" size={18} color="#1F7A63" />
                            <Text style={styles.locationText}>
                                {address?.city || 'Select City'}
                            </Text>
                            <Feather name="chevron-down" size={16} />
                        </View>
                    </View>

                </View>

                {/* RIGHT SECTION */}
                <View style={styles.rightIcons}>

                    <TouchableOpacity style={styles.sosButton}>
                        <Text style={styles.sosText}>SOS</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.bellButton}>
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
        padding: 16,
        marginTop:15,
        backgroundColor: '#F7F7F7',
    },

    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    locationContainer: {
        marginLeft: 10,
    },

    profileCircle: {
        height: 42,
        width: 42,
        borderRadius: 21,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },

    profileText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D2939',
    },

    locationLabel: {
        fontSize: 12,
        color: '#98A2B3',
    },

    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },

    locationText: {
        fontSize: 15,
        fontWeight: '600',
        marginHorizontal: 4,
        color: '#1D2939',
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