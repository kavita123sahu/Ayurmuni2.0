import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Image,
} from 'react-native';

import ProfileHeader from '../../components/ProfileHeader';
import { Fonts } from '../../common/Fonts';
import { Utils } from '../../common/Utils';
import Header from '../../components/Header';
import { Images } from '../../common/Images';
import { Colors } from '../../common/Colors';
import PrimaryButton from '../../components/PrimaryButton';

const ProfilePage = ({ navigation }: any) => {

    const user = {
        name: 'Arjun Sharma',
        phone: '+919691457891',
        email: 'arjun@gmail.com',
        image: 'https://i.pravatar.cc/150?img=3',
        consults: 2,
        orders: 14,
        reports: 5,
    };

    // ✅ MENU (NO SCREEN FIELD)
    const accountMenu = [
        { id: 1, title: 'Patient Details', icon: Images.patient },
        { id: 2, title: 'My Appointments', icon: Images.calender },
        { id: 3, title: 'Order History', icon: Images.orders },
        { id: 4, title: 'Medical Records', icon: Images.medical },
        { id: 5, title: 'Favourite Doctor', icon: Images.favourite },
    ];

    const preferenceMenu = [
        { id: 6, title: 'Payments', icon: Images.payment },
        { id: 7, title: 'Settings', icon: Images.setting },
    ];

    // ✅ TITLE BASED NAVIGATION
    const handleNavigation = (item: any) => {
        switch (item.title) {

            case 'Patient Details':
                navigation.navigate('PatientDetails');
                break;

            case 'My Appointments':
                navigation.navigate('Appointments');
                break;

            case 'Order History':
                navigation.navigate('OrderHistory');
                break;

            case 'Medical Records':
                navigation.navigate('MedicalRecords');
                break;

            case 'Favourite Doctor':
                navigation.navigate('FavDoctors');
                break;

            case 'Payments':
                navigation.navigate('Payments');
                break;

            case 'Settings':
                navigation.navigate('Settings');
                break;

            default:
                console.log('No navigation defined for:', item.title);
        }
    };

    // ✅ LOGOUT
    const logout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                onPress: async () => {
                    await Utils.clearAllData();
                    navigation.replace('AuthStack', { screen: 'Login' });
                },
            },
        ]);
    };

    // ✅ MENU ITEM
    const MenuItem = ({ item }: any) => {
        const isDisabled =
            item.title === 'Settings' || item.title === 'Payments';

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => handleNavigation(item)}
            >
                {/* Left Icon Box */}
                <View
                    style={[
                        styles.iconContainer,
                        { backgroundColor: isDisabled ? '#F8FAFC' : '#E8F3F1' },
                    ]}
                >
                    <Image
                        source={item.icon}
                        style={[
                            styles.icon,
                            { tintColor: isDisabled ? '#64748B' : '#1B5E54' },
                        ]}
                    />
                </View>

                {/* Title */}
                <Text style={styles.title}>{item.title}</Text>

                {/* Arrow */}
                <Image source={Images.arrow} style={{ height: 25, width: 25 }} />
            </TouchableOpacity>
        );
    };

    // ✅ SECTION
    const Section = ({ title, children }: any) => {
        return (
            <View style={styles.wrapper}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <View >
                    {children}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container} >

            {/* HEADER */}
            <Header
                title="Profile"
                subtitle="Manage your account"
                backIcon={Images.backIcon}
                onBack={() => { }}
            />

            <ScrollView showsVerticalScrollIndicator={false}>

                {/* PROFILE CARD */}

                <ProfileHeader user={user} />


                {/* ACCOUNT */}
                <Section title="Account">
                    {accountMenu.map((item) => (
                        <MenuItem key={item.id} item={item} />
                    ))}
                </Section>

                {/* PREFERENCE */}
                <Section title="Preference">
                    {preferenceMenu.map((item) => (
                        <MenuItem key={item.id} item={item} />
                    ))}
                </Section>

                {/* LOGOUT BUTTON */}
                {/* <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity> */}

                <PrimaryButton
                    title="Logout"
                    icon={Images.shopCart}
                    backgroundColor=""
                    textColor="#FFFFFF"
                    onPress={logout}



                />


                <Text style={styles.version}>APP VERSION 1.2</Text>

            </ScrollView>
        </View>
    );
};

export default ProfilePage;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 100

    },

    header: {
        fontSize: 22,
        fontFamily: Fonts.PoppinsBold,
        marginTop: 20,
    },

    subHeader: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 10,
    },

    wrapper: {
        marginTop: 18,
    },

    sectionTitle: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: 8,
        color: '#111',
    },

    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        paddingVertical: 16,
        paddingHorizontal: 14,
        borderRadius: 14,
        borderWidth: 1.5, borderColor: "#F1F5F9",
        marginBottom: 12,


    },

    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: "#E8F3F1", // light green like figma
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },

    icon: {
        height: 25,
        width: 25, // dark green icon
    },

    title: {
        flex: 1,
        fontSize: 16,
        color: Colors.textColor,
        fontFamily: Fonts.PoppinsMedium
    },

    arrow: {
        fontSize: 18,
        color: "#A0A0A0",
    },
    logoutBtn: {
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#FF4D4F',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },

    logoutText: {
        color: '#FF4D4F',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    version: {
        textAlign: 'center',
        fontFamily: Fonts.PoppinsMedium,
        fontSize: 14,
        marginTop: 10,
        paddingVertical: 10,
        color: "#A1A1AA",
    },
});