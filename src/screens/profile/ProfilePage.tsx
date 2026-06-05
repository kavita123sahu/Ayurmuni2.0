import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Image,
    StatusBar,
    Modal,
    Pressable,
} from 'react-native';

import ProfileHeader from '../../components/ProfileHeader';
import { Fonts } from '../../common/Fonts';
import { Utils } from '../../common/Utils';
import Header from '../../components/Header';
import { Images } from '../../common/Images';
import { Colors } from '../../common/Colors';
import PrimaryButton from '../../components/PrimaryButton';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ProfileServices from '../../services/ProfileServices';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import CommonModal from '../../components/LogoutModal';

const ProfilePage = ({ navigation }: any) => {


    const [logoutVisible, setLogoutVisible] = useState(false);
    const [user, setUser] = useState(null);

    const fetchUserData = async () => {
        try {
            const token = await Utils.getData('_TOKEN');

            if (!token) return;
            const res: any = await ProfileServices.user_profile();
            console.log("profile_response", res.data);
            setUser(res?.data || null);
        } catch (error) {
            console.log('Profile Error:', error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchUserData();
        }, [])
    );

    const logout = () => {
        setLogoutVisible(true);
    };


    const accountMenu = [
        { id: 1, title: 'Patient Details', icon: Images.patient },

        { id: 2, title: 'Saved Address', icon: Images.SaveAddress },
        { id: 3, title: 'My Appointments', icon: Images.calender },

        { id: 4, title: 'Order History', icon: Images.orders },
        { id: 5, title: 'Medical Records', icon: Images.medical },
        { id: 6, title: 'Favourite Doctor', icon: Images.favourite },

        { id: 7, title: 'Wishlist', icon: Images.favourite },
        { id: 8, title: 'Mentor', icon: Images.medical },


        { id: 9, title: 'MyCart', icon: Images.shopCart },
        { id: 10, title: 'Analysis', icon: Images.ImageContain }
    ];

    const preferenceMenu = [
        { id: 6, title: 'Payments', icon: Images.payment },
        { id: 7, title: 'Settings', icon: Images.setting },
        { id: 8, title: 'FAQ', icon: Images.FAQ },
    ];

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

            case 'Saved Address':
                navigation.navigate('ManageAdrees');
                break;

            case 'Medical Records':
                navigation.navigate('MedicalRecords');
                break;

            case 'Favourite Doctor':
                navigation.navigate('AllDoctors');
                break;

            case 'Wishlist':
                navigation.navigate('Wishlist');
                break;

            case 'Mentor':
                navigation.navigate('Mentor');
                break;

            case 'MyCart':
                navigation.navigate('MyCart');
                break;

            case 'Payments':
                navigation.navigate('PaymentsScreen');
                break;

            case 'Settings':
                navigation.navigate('Settings');
                break;


            case 'FAQ':
                navigation.navigate('FAQScreen');
                break;

            case 'Analysis':
                navigation.navigate('PrakritiProfile');
                break;



            default:
                console.log('No navigation defined for:', item.title);
        }
    };

    const handleLogout = async () => {
        setLogoutVisible(false);

        await Utils.clearAllData();

        navigation.replace('AuthStack', {
            screen: 'Login',
        });
    };

    const MenuItem = ({ item }: any) => {
        const isDisabled =
            item.title === 'Settings' || item.title === 'Payments' || item.title === 'FAQ';

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() =>

                    handleNavigation(item)}
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

        <SafeAreaView style={styles.container} >

            <StatusBar barStyle={'dark-content'} backgroundColor={Colors.background} />

            <Header
                title="Profile"
                subtitle="Manage your account"
                backIcon={Images.backIcon}

                onBack={() => { navigation.goBack() }}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }} >

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

                <PrimaryButton
                    title="Logout"
                    icon={Images.logout}
                    backgroundColor="#FEF2F2"
                    textColor={Colors.errorColor}
                    borderColor='#FFCECE'
                    TextFont={Fonts.PoppinsRegular}
                    onPress={logout}
                />


                <Text style={styles.version}>APP VERSION 1.2</Text>

            </ScrollView>


            {/* ================= LOGOUT MODAL ================= */}

            {logoutVisible && (
                <CommonModal
                    visible={logoutVisible}
                    icon="👋"
                    title="Logout"
                    subtitle="Are you sure you want to logout from Ayurmuni?"
                    cancelText="No"
                    confirmText="Yes, Logout"
                    // loading={logoutLoading}
                    onClose={() => setLogoutVisible(false)}
                    onConfirm={handleLogout}
                />
            )}
        </SafeAreaView>

    );
};

export default ProfilePage;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: '#FDFDFB'

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

    version: {
        textAlign: 'center',
        fontFamily: Fonts.PoppinsMedium,
        fontSize: 14,
        marginTop: 10,
        paddingVertical: 10,
        color: "#A1A1AA",
    },

    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },

});