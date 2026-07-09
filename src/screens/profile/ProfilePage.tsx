import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

import ProfileHeader from '../../components/ProfileHeader';
import { Fonts } from '../../common/Fonts';
import { Utils } from '../../common/Utils';
import Header from '../../components/Header';
import { Colors } from '../../common/Colors';
import PrimaryButton from '../../components/PrimaryButton';
import ScreenShell from '../../components/ScreenShell';
import TablerIcon, { TablerIconName } from '../../components/TablerIcon';
import * as ProfileServices from '../../services/ProfileServices';
import CommonModal from '../../components/LogoutModal';
import { SECTION_GAP } from '../../constants/layout';
import { useAuth } from '../../hooks/useAuth';
import { clearGuestMode, navigateToLogin } from '../../services/guestAuth';

type MenuEntry = {
    id: number;
    title: string;
    icon: TablerIconName;
    guestLocked?: boolean;
};

type ExploreItem = {
    id: string;
    title: string;
    subtitle: string;
    icon: TablerIconName;
    color: string;
    bg: string;
    onPress: () => void;
};

const GUEST_BROWSABLE_MENU = new Set(['FAQ', 'Mentor']);

const ProfilePage = ({ navigation }: any) => {
    const stackNav = navigation.getParent?.() || navigation;
    const { isGuest, refresh } = useAuth();

    const [logoutVisible, setLogoutVisible] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            const CustomerInfo = await Utils.getData('_USER_INFO');
            if (CustomerInfo) {
                setUser(CustomerInfo);
            }
            fetchUserData();
        };
        loadUser();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = await Utils.getData('_TOKEN');
            const CustomerInfo = await Utils.getData('_USER_INFO');
            if (!token) return;
            const res: any = await ProfileServices.user_profile();
            setUser(CustomerInfo || res?.data);
        } catch (error) {
            console.log('Profile Error:', error);
        }
    };

    const logout = () => setLogoutVisible(true);

    const accountMenu: MenuEntry[] = [
        { id: 1, title: 'Patient Details', icon: 'users', guestLocked: true },
        { id: 2, title: 'Saved Address', icon: 'map-pin', guestLocked: true },
        { id: 3, title: 'My Appointments', icon: 'calendar', guestLocked: true },
        { id: 4, title: 'Order History', icon: 'receipt', guestLocked: true },
        { id: 5, title: 'Medical Records', icon: 'file-medical', guestLocked: true },
        { id: 6, title: 'Favourite Doctor', icon: 'heart', guestLocked: true },
        { id: 7, title: 'Wishlist', icon: 'heart-filled', guestLocked: true },
        { id: 8, title: 'Mentor', icon: 'school', guestLocked: false },
        { id: 9, title: 'MyCart', icon: 'shopping-cart', guestLocked: true },
        { id: 10, title: 'Analysis', icon: 'chart-pie', guestLocked: true },
    ];

    const preferenceMenu: MenuEntry[] = [
        { id: 6, title: 'Payments', icon: 'credit-card', guestLocked: true },
        { id: 7, title: 'Settings', icon: 'settings', guestLocked: true },
        { id: 8, title: 'FAQ', icon: 'help', guestLocked: false },
    ];

    const exploreItems: ExploreItem[] = [
        {
            id: 'doctors',
            title: 'Doctors',
            subtitle: 'Browse experts',
            icon: 'stethoscope',
            color: '#0D614E',
            bg: '#E8F3F1',
            onPress: () => stackNav.navigate('AllDoctors', { all: true }),
        },
        {
            id: 'medicines',
            title: 'Medicines',
            subtitle: 'Ayurvedic care',
            icon: 'pill',
            color: '#B45309',
            bg: '#FEF3C7',
            onPress: () => navigation.navigate('Medicine'),
        },
        {
            id: 'products',
            title: 'Products',
            subtitle: 'Wellness picks',
            icon: 'package',
            color: '#1D4ED8',
            bg: '#DBEAFE',
            onPress: () => navigation.navigate('Products'),
        },
        {
            id: 'yoga',
            title: 'Yoga',
            subtitle: 'Sessions',
            icon: 'mood-smile',
            color: '#7C3AED',
            bg: '#EDE9FE',
            onPress: () => stackNav.navigate('YogaScreen'),
        },
        {
            id: 'diet',
            title: 'Diet Plan',
            subtitle: 'Personalized',
            icon: 'spoon',
            color: '#059669',
            bg: '#D1FAE5',
            onPress: () => stackNav.navigate('DietScreen'),
        },
        {
            id: 'prakriti',
            title: 'Prakriti',
            subtitle: 'Know your type',
            icon: 'ingredient',
            color: '#0F766E',
            bg: '#CCFBF1',
            onPress: () => stackNav.navigate('PrakritiProfile'),
        },
    ];

    const handleNavigation = async (item: MenuEntry) => {
        if (isGuest && item.guestLocked) {
            navigateToLogin(`Please login to access ${item.title}`);
            return;
        }
        if (isGuest && !GUEST_BROWSABLE_MENU.has(item.title)) {
            navigateToLogin(`Please login to access ${item.title}`);
            return;
        }
        switch (item.title) {
            case 'Patient Details':
                stackNav.navigate('PatientDetails');
                break;
            case 'My Appointments':
                stackNav.navigate('Appointments');
                break;
            case 'Order History':
                stackNav.navigate('OrderHistory');
                break;
            case 'Saved Address':
                stackNav.navigate('ManageAdrees');
                break;
            case 'Medical Records':
                stackNav.navigate('MedicalRecords');
                break;
            case 'Favourite Doctor':
                stackNav.navigate('FavDoctors');
                break;
            case 'Wishlist':
                stackNav.navigate('Wishlist');
                break;
            case 'Mentor':
                stackNav.navigate('Mentor');
                break;
            case 'MyCart':
                stackNav.navigate('MyCart');
                break;
            case 'Payments':
                stackNav.navigate('PaymentsScreen');
                break;
            case 'Settings':
                stackNav.navigate('Settings');
                break;
            case 'FAQ':
                stackNav.navigate('FAQScreen');
                break;
            case 'Analysis':
                stackNav.navigate('PrakritiProfile');
                break;
            default:
                break;
        }
    };

    const handleLogout = async () => {
        setLogoutVisible(false);
        await Utils.clearAllData();
        navigation.replace('Welcome');
    };

    const handleGuestLogin = () => {
        navigateToLogin('Create an account to unlock cart, bookings & more');
    };

    const handleExitGuest = async () => {
        await clearGuestMode();
        await refresh();
        navigation.replace('Welcome');
    };

    const MenuItem = ({ item }: { item: MenuEntry }) => {
        const locked = isGuest && !!item.guestLocked;
        const iconColor = locked ? '#94A3B8' : '#1B5E54';

        return (
            <TouchableOpacity
                style={[styles.card, locked && styles.cardLocked]}
                activeOpacity={0.7}
                onPress={() => handleNavigation(item)}
            >
                <View
                    style={[
                        styles.iconContainer,
                        { backgroundColor: locked ? '#F8FAFC' : '#E8F3F1' },
                    ]}
                >
                    <TablerIcon name={item.icon} size={22} color={iconColor} />
                </View>
                <Text style={[styles.menuTitle, locked && styles.menuTitleLocked]}>
                    {item.title}
                </Text>
                {locked ? (
                    <View style={styles.lockPill}>
                        <TablerIcon name="lock" size={12} color="#64748B" />
                        <Text style={styles.lockText}>Login</Text>
                    </View>
                ) : (
                    <TablerIcon name="chevron-right" size={20} color="#CBD5E1" />
                )}
            </TouchableOpacity>
        );
    };

    const Section = ({ title, children }: any) => (
        <View style={styles.wrapper}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View>{children}</View>
        </View>
    );

    const GuestHero = () => (
        <View style={styles.guestHero}>
            <View style={styles.guestHeroTop}>
                <View style={styles.guestAvatar}>
                    <TablerIcon name="user" size={36} color={Colors.primaryColor} />
                </View>
                <View style={styles.guestBadge}>
                    <TablerIcon name="eye" size={12} color="#0D614E" />
                    <Text style={styles.guestBadgeText}>Guest Mode</Text>
                </View>
            </View>

            <Text style={styles.guestHeroTitle}>Explore Ayurmuni freely</Text>
            <Text style={styles.guestHeroSubtitle}>
                Browse doctors, medicines, products, yoga, diet plans & panchakarma.
                Login only when you want to cart, book, or save items.
            </Text>

            <View style={styles.guestPerks}>
                {['Browse all content', 'View doctor profiles', 'See prices & details'].map(
                    perk => (
                        <View key={perk} style={styles.perkRow}>
                            <TablerIcon name="check" size={14} color="#0D614E" />
                            <Text style={styles.perkText}>{perk}</Text>
                        </View>
                    ),
                )}
            </View>

            <PrimaryButton
                title="Login / Sign Up"
                iconName="arrow-right"
                TextFont={Fonts.PoppinsSemiBold}
                backgroundColor={Colors.primaryColor}
                textColor={Colors.white}
                onPress={handleGuestLogin}
            />

            <TouchableOpacity style={styles.exitGuestBtn} onPress={handleExitGuest}>
                <Text style={styles.exitGuestText}>Back to Welcome</Text>
            </TouchableOpacity>
        </View>
    );

    const ExploreGrid = () => (
        <View style={styles.exploreSection}>
            <Text style={styles.exploreTitle}>Start Exploring</Text>
            <View style={styles.exploreGrid}>
                {exploreItems.map(item => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.exploreCard}
                        activeOpacity={0.8}
                        onPress={item.onPress}
                    >
                        <View style={[styles.exploreIconWrap, { backgroundColor: item.bg }]}>
                            <TablerIcon name={item.icon} size={22} color={item.color} />
                        </View>
                        <Text style={styles.exploreCardTitle}>{item.title}</Text>
                        <Text style={styles.exploreCardSub}>{item.subtitle}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    if (isGuest) {
        return (
            <ScreenShell withTabBar scroll contentStyle={styles.shellContent}>
                <Header title="Profile" subtitle="Guest explorer" />
                <GuestHero />
                <ExploreGrid />

                <Section title="Account">
                    {accountMenu.map(item => (
                        <MenuItem key={item.id} item={item} />
                    ))}
                </Section>

                <Section title="Preference">
                    {preferenceMenu.map(item => (
                        <MenuItem key={item.id} item={item} />
                    ))}
                </Section>

                <Text style={styles.version}>APP VERSION 1.2</Text>
            </ScreenShell>
        );
    }

    return (
        <ScreenShell withTabBar scroll contentStyle={styles.shellContent}>
            <Header title="Profile" subtitle="Manage your account" />
            <ProfileHeader user={user} />

            <Section title="Account">
                {accountMenu.map((item) => (
                    <MenuItem key={item.id} item={item} />
                ))}
            </Section>

            <Section title="Preference">
                {preferenceMenu.map((item) => (
                    <MenuItem key={item.id} item={item} />
                ))}
            </Section>

            <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
                <TablerIcon name="logout" size={20} color={Colors.errorColor} />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <Text style={styles.version}>APP VERSION 1.2</Text>

            {logoutVisible && (
                <CommonModal
                    visible={logoutVisible}
                    icon="👋"
                    title="Logout"
                    subtitle="Are you sure you want to logout from Ayurmuni?"
                    cancelText="No"
                    confirmText="Yes, Logout"
                    onClose={() => setLogoutVisible(false)}
                    onConfirm={handleLogout}
                />
            )}
        </ScreenShell>
    );
};

export default ProfilePage;

const styles = StyleSheet.create({
    shellContent: {
        paddingTop: 0,
    },
    wrapper: {
        marginTop: SECTION_GAP,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: 8,
        color: '#111',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        marginBottom: 10,
    },
    cardLocked: {
        backgroundColor: '#FAFAFA',
    },
    iconContainer: {
        width: 46,
        height: 46,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuTitle: {
        flex: 1,
        fontSize: 15,
        color: Colors.textColor,
        fontFamily: Fonts.PoppinsMedium,
    },
    menuTitleLocked: {
        color: '#94A3B8',
    },
    lockPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    lockText: {
        fontSize: 11,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: SECTION_GAP,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FFCECE',
    },
    logoutText: {
        fontSize: 15,
        color: Colors.errorColor,
        fontFamily: Fonts.PoppinsMedium,
    },
    version: {
        textAlign: 'center',
        fontFamily: Fonts.PoppinsMedium,
        fontSize: 13,
        marginTop: 12,
        paddingVertical: 8,
        color: '#A1A1AA',
    },
    guestHero: {
        marginTop: SECTION_GAP,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 22,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0D614E',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    guestHeroTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    guestAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E8F3F1',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#C6E7DF',
    },
    guestBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#E8F3F1',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    guestBadgeText: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0D614E',
    },
    guestHeroTitle: {
        fontSize: 22,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        marginBottom: 8,
    },
    guestHeroSubtitle: {
        fontSize: 14,
        lineHeight: 22,
        fontFamily: Fonts.PoppinsRegular,
        color: '#64748B',
        marginBottom: 14,
    },
    guestPerks: {
        marginBottom: 18,
        gap: 8,
    },
    perkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    perkText: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsMedium,
        color: '#334155',
    },
    exitGuestBtn: {
        marginTop: 14,
        paddingVertical: 10,
        alignItems: 'center',
    },
    exitGuestText: {
        fontSize: 14,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },
    exploreSection: {
        marginTop: SECTION_GAP,
    },
    exploreTitle: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#111',
        marginBottom: 12,
    },
    exploreGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'space-between',
    },
    exploreCard: {
        width: '31%',
        minWidth: 100,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        alignItems: 'center',
    },
    exploreIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    exploreCardTitle: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        textAlign: 'center',
    },
    exploreCardSub: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsRegular,
        color: '#94A3B8',
        textAlign: 'center',
        marginTop: 2,
    },
});
