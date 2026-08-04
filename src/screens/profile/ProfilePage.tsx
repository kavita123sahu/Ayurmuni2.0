

// import React, { useCallback, useState } from 'react';
// import {
//     View,
//     Text,
//     StyleSheet,
//     TouchableOpacity,
//     ScrollView,
// } from 'react-native';

// import ProfileHeader from '../../components/ProfileHeader';
// import { Fonts } from '../../common/Fonts';
// import { Utils } from '../../common/Utils';
// import Header from '../../components/Header';
// import { Colors } from '../../common/Colors';
// import PrimaryButton from '../../components/PrimaryButton';
// import ScreenShell from '../../components/ScreenShell';
// import TablerIcon, { TablerIconName } from '../../components/TablerIcon';
// import * as ProfileServices from '../../services/ProfileServices';
// import CommonModal from '../../components/LogoutModal';
// import { SECTION_GAP } from '../../constants/layout';
// import { useFocusEffect } from '@react-navigation/native';



// type MenuEntry = {
//     id: number;
//     title: string;
//     icon: TablerIconName;
// };

// type ExploreItem = {
//     id: string;
//     title: string;
//     subtitle: string;
//     icon: TablerIconName;
//     color: string;
//     bg: string;
//     onPress: () => void;
// };

// const ProfilePage = ({ navigation }: any) => {
//     const stackNav = navigation.getParent?.() || navigation;

//     const [logoutVisible, setLogoutVisible] = useState(false);
//     const [user, setUser] = useState(null);

//     useFocusEffect(
//         useCallback(() => {
//             const loadUser = async () => {
//                 const CustomerInfo = await Utils.getData('_USER_INFO');

//                 if (CustomerInfo) {
//                     setUser(CustomerInfo);
//                 }

//                 await fetchUserData();
//             };

//             loadUser();
//         }, [])
//     );

//     const fetchUserData = async () => {
//         try {
//             const token = await Utils.getData('_TOKEN');
//             const CustomerInfo = await Utils.getData('_USER_INFO');
//             if (!token) return;
//             const res: any = await ProfileServices.user_profile();
//             console.log('USERPROFILE =>', res?.data);
//             setUser(CustomerInfo || res?.data);
//         } catch (error) {
//             console.log('Profile Error:', error);
//         }
//     };

//     const logout = () => setLogoutVisible(true);

//     const accountMenu: MenuEntry[] = [
//         { id: 1, title: 'Patient Details', icon: 'users' },
//         { id: 2, title: 'Saved Address', icon: 'map-pin' },
//         { id: 3, title: 'My Appointments', icon: 'calendar' },
//         { id: 4, title: 'Order History', icon: 'receipt' },
//         { id: 5, title: 'Medical Records', icon: 'file-medical' },
//         { id: 6, title: 'Favourite Doctor', icon: 'heart' },
//         { id: 7, title: 'Wishlist', icon: 'heart-filled' },
//         { id: 8, title: 'Mentor', icon: 'school' },
//         { id: 9, title: 'Cart', icon: 'shopping-cart' },
//         { id: 10, title: 'Analysis', icon: 'chart-pie' },
//     ];

//     const preferenceMenu: MenuEntry[] = [
//         { id: 6, title: 'Payments', icon: 'credit-card' },
//         { id: 7, title: 'Settings', icon: 'settings' },
//         { id: 8, title: 'FAQ', icon: 'help' },
//     ];

//     const exploreItems: ExploreItem[] = [
//         {
//             id: 'doctors',
//             title: 'Doctors',
//             subtitle: 'Browse experts',
//             icon: 'stethoscope',
//             color: '#0D614E',
//             bg: '#E8F3F1',
//             onPress: () => stackNav.navigate('AllDoctors', { all: true }),
//         },
//         {
//             id: 'medicines',
//             title: 'Medicines',
//             subtitle: 'Ayurvedic care',
//             icon: 'pill',
//             color: '#B45309',
//             bg: '#FEF3C7',
//             onPress: () => navigation.navigate('Medicine'),
//         },
//         {
//             id: 'products',
//             title: 'Products',
//             subtitle: 'Wellness picks',
//             icon: 'package',
//             color: '#1D4ED8',
//             bg: '#DBEAFE',
//             onPress: () => navigation.navigate('Products'),
//         },
//         {
//             id: 'yoga',
//             title: 'Yoga',
//             subtitle: 'Sessions',
//             icon: 'mood-smile',
//             color: '#7C3AED',
//             bg: '#EDE9FE',
//             onPress: () => stackNav.navigate('YogaScreen'),
//         },
//         {
//             id: 'diet',
//             title: 'Diet Plan',
//             subtitle: 'Personalized',
//             icon: 'spoon',
//             color: '#059669',
//             bg: '#D1FAE5',
//             onPress: () => stackNav.navigate('DietScreen'),
//         },
//         {
//             id: 'prakriti',
//             title: 'Prakriti',
//             subtitle: 'Know your type',
//             icon: 'ingredient',
//             color: '#0F766E',
//             bg: '#CCFBF1',
//             onPress: () => stackNav.navigate('PrakritiProfile'),
//         },
//     ];

//     const handleNavigation = (item: MenuEntry) => {
//         switch (item.title) {
//             case 'Patient Details':
//                 stackNav.navigate('PatientDetails');
//                 break;
//             case 'My Appointments':
//                 stackNav.navigate('Appointments');
//                 break;
//             case 'Order History':
//                 stackNav.navigate('OrderHistory');
//                 break;
//             case 'Saved Address':
//                 stackNav.navigate('ManageAdrees');
//                 break;
//             case 'Medical Records':
//                 stackNav.navigate('MedicalRecords');
//                 break;
//             case 'Favourite Doctor':
//                 stackNav.navigate('FavDoctors');
//                 break;
//             case 'Wishlist':
//                 stackNav.navigate('Wishlist');
//                 break;
//             case 'Mentor':
//                 stackNav.navigate('Mentor');
//                 break;
//             case 'Cart':
//                 stackNav.navigate('MyCart');
//                 break;
//             case 'Payments':
//                 stackNav.navigate('PaymentsScreen');
//                 break;
//             case 'Settings':
//                 stackNav.navigate('Settings');
//                 break;
//             case 'FAQ':
//                 stackNav.navigate('FAQScreen');
//                 break;
//             case 'Analysis':
//                 stackNav.navigate('PrakritiProfile');
//                 break;
//             default:
//                 break;
//         }
//     };

//     const handleLogout = async () => {
//         setLogoutVisible(false);
//         await Utils.clearAllData();
//         navigation.replace('Welcome');
//     };

//     const MenuItem = ({ item }: { item: MenuEntry }) => (
//         <TouchableOpacity
//             style={styles.card}
//             activeOpacity={0.7}
//             onPress={() => handleNavigation(item)}
//         >
//             <View style={[styles.iconContainer, { backgroundColor: '#E8F3F1' }]}>
//                 <TablerIcon name={item.icon} size={22} color="#1B5E54" />
//             </View>
//             <Text style={styles.menuTitle}>{item.title}</Text>
//             <TablerIcon name="chevron-right" size={20} color="#CBD5E1" />
//         </TouchableOpacity>
//     );

//     const Section = ({ title, children }: any) => (
//         <View style={styles.wrapper}>
//             <Text style={styles.sectionTitle}>{title}</Text>
//             <View>{children}</View>
//         </View>
//     );

//     return (
//         <>
//             <ScreenShell withTabBar contentStyle={styles.shellContent}>
//                 <Header title="Profile" subtitle="Manage your account" onBack={() => navigation.goBack()} />

//                 <ScrollView
//                     style={styles.scrollArea}
//                     showsVerticalScrollIndicator={false}
//                     contentContainerStyle={styles.scrollContent}
//                     keyboardShouldPersistTaps="handled"
//                 >

//                     <ProfileHeader user={user} navigation={navigation} />

//                     <Section title="Account">
//                         {accountMenu.map((item) => (
//                             <MenuItem key={item.id} item={item} />
//                         ))}
//                     </Section>

//                     <Section title="Preference">
//                         {preferenceMenu.map((item) => (
//                             <MenuItem key={item.id} item={item} />
//                         ))}
//                     </Section>

//                     <TouchableOpacity
//                         style={styles.logoutBtn}
//                         onPress={logout}
//                         activeOpacity={0.8}
//                     >
//                         <TablerIcon name="logout" size={20} color={Colors.errorColor} />
//                         <Text style={styles.logoutText}>Logout</Text>
//                     </TouchableOpacity>

//                     <Text style={styles.version}>APP VERSION 1.0</Text>
//                 </ScrollView>
//             </ScreenShell>

//             {logoutVisible && (
//                 <CommonModal
//                     visible={logoutVisible}
//                     icon="👋"
//                     title="Logout"
//                     subtitle="Are you sure you want to logout from Ayurmuni?"
//                     cancelText="No"
//                     confirmText="Yes, Logout"
//                     onClose={() => setLogoutVisible(false)}
//                     onConfirm={handleLogout}
//                 />
//             )}
//         </>
//     );
// };

// export default ProfilePage;

// const styles = StyleSheet.create({
//     shellContent: {
//         flex: 1,
//         paddingTop: 0,
//     },
//     scrollArea: {
//         flex: 1,
//     },
//     scrollContent: {
//         flexGrow: 1,
//         paddingTop: 4,
//     },
//     wrapper: {
//         marginTop: SECTION_GAP,
//     },
//     sectionTitle: {
//         fontSize: 18,
//         fontFamily: Fonts.PoppinsSemiBold,
//         marginBottom: 8,
//         color: '#111',
//     },
//     card: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#FFFFFF',
//         paddingVertical: 14,
//         paddingHorizontal: 14,
//         borderRadius: 14,
//         borderWidth: 1,
//         borderColor: '#F1F5F9',
//         marginBottom: 10,
//     },
//     cardLocked: {
//         backgroundColor: '#FAFAFA',
//     },
//     iconContainer: {
//         width: 46,
//         height: 46,
//         borderRadius: 12,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginRight: 12,
//     },
//     menuTitle: {
//         flex: 1,
//         fontSize: 15,
//         color: Colors.textColor,
//         fontFamily: Fonts.PoppinsMedium,
//     },
//     menuTitleLocked: {
//         color: '#94A3B8',
//     },
//     lockPill: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 4,
//         backgroundColor: '#F1F5F9',
//         paddingHorizontal: 10,
//         paddingVertical: 5,
//         borderRadius: 20,
//     },
//     lockText: {
//         fontSize: 11,
//         color: '#64748B',
//         fontFamily: Fonts.PoppinsMedium,
//     },
//     logoutBtn: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         gap: 8,
//         marginTop: SECTION_GAP,
//         paddingVertical: 14,
//         borderRadius: 14,
//         backgroundColor: '#FEF2F2',
//         borderWidth: 1,
//         borderColor: '#FFCECE',
//     },
//     logoutText: {
//         fontSize: 15,
//         color: Colors.errorColor,
//         fontFamily: Fonts.PoppinsMedium,
//     },
//     version: {
//         textAlign: 'center',
//         fontFamily: Fonts.PoppinsMedium,
//         fontSize: 13,
//         marginTop: 12,
//         paddingVertical: 8,
//         color: '#A1A1AA',
//     },
//     guestHero: {
//         marginTop: SECTION_GAP,
//         backgroundColor: '#FFFFFF',
//         borderRadius: 24,
//         padding: 22,
//         borderWidth: 1,
//         borderColor: '#E2E8F0',
//         shadowColor: '#0D614E',
//         shadowOffset: { width: 0, height: 8 },
//         shadowOpacity: 0.08,
//         shadowRadius: 16,
//         elevation: 4,
//     },
//     guestHeroTop: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         marginBottom: 16,
//     },
//     guestAvatar: {
//         width: 64,
//         height: 64,
//         borderRadius: 32,
//         backgroundColor: '#E8F3F1',
//         justifyContent: 'center',
//         alignItems: 'center',
//         borderWidth: 2,
//         borderColor: '#C6E7DF',
//     },
//     guestBadge: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 5,
//         backgroundColor: '#E8F3F1',
//         paddingHorizontal: 12,
//         paddingVertical: 6,
//         borderRadius: 20,
//     },
//     guestBadgeText: {
//         fontSize: 12,
//         fontFamily: Fonts.PoppinsSemiBold,
//         color: '#0D614E',
//     },
//     guestHeroTitle: {
//         fontSize: 22,
//         fontFamily: Fonts.PoppinsSemiBold,
//         color: '#0F172A',
//         marginBottom: 8,
//     },
//     guestHeroSubtitle: {
//         fontSize: 14,
//         lineHeight: 22,
//         fontFamily: Fonts.PoppinsRegular,
//         color: '#64748B',
//         marginBottom: 14,
//     },
//     guestPerks: {
//         marginBottom: 18,
//         gap: 8,
//     },
//     perkRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 8,
//     },
//     perkText: {
//         fontSize: 13,
//         fontFamily: Fonts.PoppinsMedium,
//         color: '#334155',
//     },
//     exitGuestBtn: {
//         marginTop: 14,
//         paddingVertical: 10,
//         alignItems: 'center',
//     },
//     exitGuestText: {
//         fontSize: 14,
//         color: '#64748B',
//         fontFamily: Fonts.PoppinsMedium,
//     },
//     exploreSection: {
//         marginTop: SECTION_GAP,
//     },
//     exploreTitle: {
//         fontSize: 18,
//         fontFamily: Fonts.PoppinsSemiBold,
//         color: '#111',
//         marginBottom: 12,
//     },
//     exploreGrid: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         gap: 10,
//         justifyContent: 'space-between',
//     },
//     exploreCard: {
//         width: '31%',
//         minWidth: 100,
//         backgroundColor: '#FFFFFF',
//         borderRadius: 16,
//         padding: 12,
//         borderWidth: 1,
//         borderColor: '#F1F5F9',
//         alignItems: 'center',
//     },
//     exploreIconWrap: {
//         width: 44,
//         height: 44,
//         borderRadius: 12,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginBottom: 8,
//     },

//     exploreCardTitle: {
//         fontSize: 12,
//         fontFamily: Fonts.PoppinsSemiBold,
//         color: '#0F172A',
//         textAlign: 'center',
//     },
//     exploreCardSub: {
//         fontSize: 10,
//         fontFamily: Fonts.PoppinsRegular,
//         color: '#94A3B8',
//         textAlign: 'center',
//         marginTop: 2,
//     },
// });

// import React, { useCallback, useState } from 'react';
// import {
//     View,
//     Text,
//     StyleSheet,
//     TouchableOpacity,
//     ScrollView,
// } from 'react-native';

// import ProfileHeader from '../../components/ProfileHeader';
// import { Fonts } from '../../common/Fonts';
// import { Utils } from '../../common/Utils';
// import Header from '../../components/Header';
// import { Colors } from '../../common/Colors';
// import PrimaryButton from '../../components/PrimaryButton';
// import ScreenShell from '../../components/ScreenShell';
// import TablerIcon, { TablerIconName } from '../../components/TablerIcon';
// import * as ProfileServices from '../../services/ProfileServices';
// import CommonModal from '../../components/LogoutModal';
// import { getScreenBottomPadding, SECTION_GAP } from '../../constants/layout';
// import { useFocusEffect } from '@react-navigation/native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';



// type MenuEntry = {
//     id: number;
//     title: string;
//     icon: TablerIconName;
// };

// type ExploreItem = {
//     id: string;
//     title: string;
//     subtitle: string;
//     icon: TablerIconName;
//     color: string;
//     bg: string;
//     onPress: () => void;
// };

// const ProfilePage = ({ navigation }: any) => {
//     const stackNav = navigation.getParent?.() || navigation;
//     const insets = useSafeAreaInsets();
//     const tabClearance = getScreenBottomPadding(insets);

//     const [logoutVisible, setLogoutVisible] = useState(false);
//     const [user, setUser] = useState(null);

//     useFocusEffect(
//         useCallback(() => {
//             const loadUser = async () => {
//                 const CustomerInfo = await Utils.getData('_USER_INFO');

//                 if (CustomerInfo) {
//                     setUser(CustomerInfo);
//                 }

//                 await fetchUserData();
//             };

//             loadUser();
//         }, [])
//     );

//     const fetchUserData = async () => {
//         try {
//             const token = await Utils.getData('_TOKEN');
//             const CustomerInfo = await Utils.getData('_USER_INFO');
//             if (!token) return;
//             const res: any = await ProfileServices.user_profile();
//             console.log('USERPROFILE =>', res?.data);
//             setUser(CustomerInfo || res?.data);
//         } catch (error) {
//             console.log('Profile Error:', error);
//         }
//     };

//     const logout = () => setLogoutVisible(true);

//     const accountMenu: MenuEntry[] = [
//         { id: 1, title: 'Patient Details', icon: 'users' },
//         { id: 2, title: 'Saved Address', icon: 'map-pin' },
//         { id: 3, title: 'My Appointments', icon: 'calendar' },
//         { id: 4, title: 'Order History', icon: 'receipt' },
//         { id: 5, title: 'Medical Records', icon: 'file-medical' },
//         { id: 6, title: 'Favourite Doctor', icon: 'heart' },
//         { id: 7, title: 'Wishlist', icon: 'heart-filled' },
//         { id: 8, title: 'Mentor', icon: 'school' },
//         { id: 9, title: 'Cart', icon: 'shopping-cart' },
//         { id: 10, title: 'Analysis', icon: 'chart-pie' },
//     ];

//     const preferenceMenu: MenuEntry[] = [
//         { id: 6, title: 'Payments', icon: 'credit-card' },
//         { id: 7, title: 'Settings', icon: 'settings' },
//         { id: 8, title: 'FAQ', icon: 'help' },
//     ];

//     const exploreItems: ExploreItem[] = [
//         {
//             id: 'doctors',
//             title: 'Doctors',
//             subtitle: 'Browse experts',
//             icon: 'stethoscope',
//             color: '#0D614E',
//             bg: '#E8F3F1',
//             onPress: () => stackNav.navigate('AllDoctors', { all: true }),
//         },
//         {
//             id: 'medicines',
//             title: 'Medicines',
//             subtitle: 'Ayurvedic care',
//             icon: 'pill',
//             color: '#B45309',
//             bg: '#FEF3C7',
//             onPress: () => navigation.navigate('Medicine'),
//         },
//         {
//             id: 'products',
//             title: 'Products',
//             subtitle: 'Wellness picks',
//             icon: 'package',
//             color: '#1D4ED8',
//             bg: '#DBEAFE',
//             onPress: () => navigation.navigate('Products'),
//         },
//         {
//             id: 'yoga',
//             title: 'Yoga',
//             subtitle: 'Sessions',
//             icon: 'mood-smile',
//             color: '#7C3AED',
//             bg: '#EDE9FE',
//             onPress: () => stackNav.navigate('YogaScreen'),
//         },
//         {
//             id: 'diet',
//             title: 'Diet Plan',
//             subtitle: 'Personalized',
//             icon: 'spoon',
//             color: '#059669',
//             bg: '#D1FAE5',
//             onPress: () => stackNav.navigate('DietScreen'),
//         },
//         {
//             id: 'prakriti',
//             title: 'Prakriti',
//             subtitle: 'Know your type',
//             icon: 'ingredient',
//             color: '#0F766E',
//             bg: '#CCFBF1',
//             onPress: () => stackNav.navigate('PrakritiProfile'),
//         },
//     ];

//     const handleNavigation = (item: MenuEntry) => {
//         switch (item.title) {
//             case 'Patient Details':
//                 stackNav.navigate('PatientDetails');
//                 break;
//             case 'My Appointments':
//                 stackNav.navigate('Appointments');
//                 break;
//             case 'Order History':
//                 stackNav.navigate('OrderHistory');
//                 break;
//             case 'Saved Address':
//                 stackNav.navigate('ManageAdrees');
//                 break;
//             case 'Medical Records':
//                 stackNav.navigate('MedicalRecords');
//                 break;
//             case 'Favourite Doctor':
//                 stackNav.navigate('FavDoctors');
//                 break;
//             case 'Wishlist':
//                 stackNav.navigate('Wishlist');
//                 break;
//             case 'Mentor':
//                 stackNav.navigate('Mentor');
//                 break;
//             case 'Cart':
//                 stackNav.navigate('MyCart');
//                 break;
//             case 'Payments':
//                 stackNav.navigate('PaymentsScreen');
//                 break;
//             case 'Settings':
//                 stackNav.navigate('Settings');
//                 break;
//             case 'FAQ':
//                 stackNav.navigate('FAQScreen');
//                 break;
//             case 'Analysis':
//                 stackNav.navigate('PrakritiProfile');
//                 break;
//             default:
//                 break;
//         }
//     };

//     const handleLogout = async () => {
//         setLogoutVisible(false);
//         await Utils.clearAllData();
//         navigation.replace('Welcome');
//     };

//     const MenuItem = ({ item }: { item: MenuEntry }) => (
//         <TouchableOpacity
//             style={styles.card}
//             activeOpacity={0.7}
//             onPress={() => handleNavigation(item)}
//         >
//             <View style={[styles.iconContainer, { backgroundColor: '#E8F3F1' }]}>
//                 <TablerIcon name={item.icon} size={22} color="#1B5E54" />
//             </View>
//             <Text style={styles.menuTitle}>{item.title}</Text>
//             <TablerIcon name="chevron-right" size={20} color="#CBD5E1" />
//         </TouchableOpacity>
//     );

//     const Section = ({ title, children }: any) => (
//         <View style={styles.wrapper}>
//             <Text style={styles.sectionTitle}>{title}</Text>
//             <View>{children}</View>
//         </View>
//     );

//     return (
//         <>
//             <ScreenShell contentStyle={styles.shellContent}>
//                 <Header title="Profile" subtitle="Manage your account" onBack={() => navigation.goBack()} />

//                 <ScrollView
//                     style={[styles.scrollArea, { marginBottom: tabClearance }]}
//                     showsVerticalScrollIndicator={false}
//                     contentContainerStyle={[styles.scrollContent, { paddingBottom: 16 }]}
//                     keyboardShouldPersistTaps="handled"
//                 >

//                     <ProfileHeader user={user} navigation={navigation} />

//                     <Section title="Account">
//                         {accountMenu.map((item) => (
//                             <MenuItem key={item.id} item={item} />
//                         ))}
//                     </Section>

//                     <Section title="Preference">
//                         {preferenceMenu.map((item) => (
//                             <MenuItem key={item.id} item={item} />
//                         ))}
//                     </Section>

//                     <TouchableOpacity
//                         style={styles.logoutBtn}
//                         onPress={logout}
//                         activeOpacity={0.8}
//                     >
//                         <TablerIcon name="logout" size={20} color={Colors.errorColor} />
//                         <Text style={styles.logoutText}>Logout</Text>
//                     </TouchableOpacity>

//                     <Text style={styles.version}>APP VERSION 1.0</Text>
//                 </ScrollView>
//             </ScreenShell>

//             {logoutVisible && (
//                 <CommonModal
//                     visible={logoutVisible}
//                     icon="👋"
//                     title="Logout"
//                     subtitle="Are you sure you want to logout from Ayurmuni?"
//                     cancelText="No"
//                     confirmText="Yes, Logout"
//                     onClose={() => setLogoutVisible(false)}
//                     onConfirm={handleLogout}
//                 />
//             )}
//         </>
//     );
// };

// export default ProfilePage;

// const styles = StyleSheet.create({
//     shellContent: {
//         flex: 1,
//         paddingTop: 0,
//     },
//     scrollArea: {
//         flex: 1,
//     },
//     scrollContent: {
//         flexGrow: 1,
//         paddingTop: 4,
//     },
//     wrapper: {
//         marginTop: SECTION_GAP,
//     },
//     sectionTitle: {
//         fontSize: 18,
//         fontFamily: Fonts.PoppinsSemiBold,
//         marginBottom: 8,
//         color: '#111',
//     },
//     card: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#FFFFFF',
//         paddingVertical: 14,
//         paddingHorizontal: 14,
//         borderRadius: 14,
//         borderWidth: 1,
//         borderColor: '#F1F5F9',
//         marginBottom: 10,
//     },
//     cardLocked: {
//         backgroundColor: '#FAFAFA',
//     },
//     iconContainer: {
//         width: 46,
//         height: 46,
//         borderRadius: 12,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginRight: 12,
//     },
//     menuTitle: {
//         flex: 1,
//         fontSize: 15,
//         color: Colors.textColor,
//         fontFamily: Fonts.PoppinsMedium,
//     },
//     menuTitleLocked: {
//         color: '#94A3B8',
//     },
//     lockPill: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 4,
//         backgroundColor: '#F1F5F9',
//         paddingHorizontal: 10,
//         paddingVertical: 5,
//         borderRadius: 20,
//     },
//     lockText: {
//         fontSize: 11,
//         color: '#64748B',
//         fontFamily: Fonts.PoppinsMedium,
//     },
//     logoutBtn: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         gap: 8,
//         marginTop: SECTION_GAP,                                                      
//         paddingVertical: 14,
//         borderRadius: 14,
//         backgroundColor: '#FEF2F2',                                  
//         borderWidth: 1,
//         borderColor: '#FFCECE',
//     },
//     logoutText: {
//         fontSize: 15,
//         color: Colors.errorColor,
//         fontFamily: Fonts.PoppinsMedium,
//     },
//     version: {
//         textAlign: 'center',
//         fontFamily: Fonts.PoppinsMedium,
//         fontSize: 13,
//         marginTop: 12,
//         paddingVertical: 8,
//         color: '#A1A1AA',
//     },
//     guestHero: {
//         marginTop: SECTION_GAP,
//         backgroundColor: '#FFFFFF',
//         borderRadius: 24,
//         padding: 22,
//         borderWidth: 1,
//         borderColor: '#E2E8F0',
//         shadowColor: '#0D614E',
//         shadowOffset: { width: 0, height: 8 },
//         shadowOpacity: 0.08,
//         shadowRadius: 16,
//         elevation: 4,
//     },
//     guestHeroTop: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         marginBottom: 16,
//     },
//     guestAvatar: {
//         width: 64,
//         height: 64,
//         borderRadius: 32,
//         backgroundColor: '#E8F3F1',
//         justifyContent: 'center',
//         alignItems: 'center',
//         borderWidth: 2,
//         borderColor: '#C6E7DF',
//     },
//     guestBadge: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 5,
//         backgroundColor: '#E8F3F1',
//         paddingHorizontal: 12,
//         paddingVertical: 6,
//         borderRadius: 20,
//     },
//     guestBadgeText: {
//         fontSize: 12,
//         fontFamily: Fonts.PoppinsSemiBold,
//         color: '#0D614E',
//     },
//     guestHeroTitle: {
//         fontSize: 22,
//         fontFamily: Fonts.PoppinsSemiBold,
//         color: '#0F172A',
//         marginBottom: 8,
//     },
//     guestHeroSubtitle: {
//         fontSize: 14,
//         lineHeight: 22,
//         fontFamily: Fonts.PoppinsRegular,
//         color: '#64748B',
//         marginBottom: 14,
//     },
//     guestPerks: {
//         marginBottom: 18,
//         gap: 8,
//     },
//     perkRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 8,
//     },
//     perkText: {
//         fontSize: 13,
//         fontFamily: Fonts.PoppinsMedium,
//         color: '#334155',
//     },
//     exitGuestBtn: {
//         marginTop: 14,
//         paddingVertical: 10,
//         alignItems: 'center',
//     },
//     exitGuestText: {
//         fontSize: 14,
//         color: '#64748B',
//         fontFamily: Fonts.PoppinsMedium,
//     },
//     exploreSection: {
//         marginTop: SECTION_GAP,
//     },
//     exploreTitle: {
//         fontSize: 18,
//         fontFamily: Fonts.PoppinsSemiBold,
//         color: '#111',
//         marginBottom: 12,
//     },
//     exploreGrid: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         gap: 10,
//         justifyContent: 'space-between',
//     },
//     exploreCard: {
//         width: '31%',
//         minWidth: 100,
//         backgroundColor: '#FFFFFF',
//         borderRadius: 16,
//         padding: 12,
//         borderWidth: 1,
//         borderColor: '#F1F5F9',
//         alignItems: 'center',
//     },
//     exploreIconWrap: {
//         width: 44,
//         height: 44,
//         borderRadius: 12,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginBottom: 8,
//     },
//     exploreCardTitle: {
//         fontSize: 12,
//         fontFamily: Fonts.PoppinsSemiBold,
//         color: '#0F172A',
//         textAlign: 'center',
//     },
//     exploreCardSub: {
//         fontSize: 10,
//         fontFamily: Fonts.PoppinsRegular,
//         color: '#94A3B8',
//         textAlign: 'center',
//         marginTop: 2,
//     },
// });


import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
} from 'react-native';

import ProfileHeader from '../../components/ProfileHeader';
import { Fonts } from '../../common/Fonts';
import { Utils } from '../../common/Utils';
import Header from '../../components/Header';
import { Colors } from '../../common/Colors';
import { Images } from '../../common/Images';
import ScreenShell from '../../components/ScreenShell';
import TablerIcon, { TablerIconName } from '../../components/TablerIcon';
import * as ProfileServices from '../../services/ProfileServices';
import CommonModal from '../../components/LogoutModal';
import { getScreenBottomPadding, SECTION_GAP } from '../../constants/layout';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isGuestUser, navigateToCompleteDetails } from '../../services/guestAuth';
import LinearGradient from 'react-native-linear-gradient';



type MenuEntry = {
    id: number;
    title: string;
    icon: TablerIconName;
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

const ProfilePage = ({ navigation }: any) => {
    const stackNav = navigation.getParent?.() || navigation;
    const insets = useSafeAreaInsets();
    const tabClearance = getScreenBottomPadding(insets);

    const [logoutVisible, setLogoutVisible] = useState(false);
    const [user, setUser] = useState(null);
    const [isGuest, setIsGuest] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const loadUser = async () => {
                const guest = await isGuestUser();
                setIsGuest(guest);

                // Incomplete guests: do not load / show full profile
                if (guest) {
                    setUser(null);
                    return;
                }

                const CustomerInfo = await Utils.getData('_USER_INFO');

                if (CustomerInfo) {
                    setUser(CustomerInfo);
                }

                await fetchUserData();
            };

            loadUser();
        }, [])
    );

    const fetchUserData = async () => {
        try {
            if (await isGuestUser()) return;
            const token = await Utils.getData('_TOKEN');
            const CustomerInfo = await Utils.getData('_USER_INFO');
            if (!token) return;
            const res: any = await ProfileServices.user_profile();
            console.log('USERPROFILE =>', res?.data);
            setUser(CustomerInfo || res?.data);
        } catch (error) {
            console.log('Profile Error:', error);
        }
    };

    const logout = () => setLogoutVisible(true);

    const accountMenu: MenuEntry[] = [
        { id: 1, title: 'Patient Details', icon: 'users' },
        { id: 2, title: 'Saved Address', icon: 'map-pin' },
        { id: 3, title: 'My Appointments', icon: 'calendar' },
        { id: 4, title: 'Order History', icon: 'receipt' },
        { id: 5, title: 'Medical Records', icon: 'file-medical' },
        { id: 6, title: 'Favourite Doctor', icon: 'heart' },
        { id: 7, title: 'Wishlist', icon: 'heart-filled' },
        { id: 8, title: 'Mentor', icon: 'school' },
        { id: 9, title: 'Cart', icon: 'shopping-cart' },
        { id: 10, title: 'Analysis', icon: 'chart-pie' },
    ];

    const preferenceMenu: MenuEntry[] = [
        { id: 6, title: 'Payments', icon: 'credit-card' },
        { id: 7, title: 'Settings', icon: 'settings' },
        { id: 8, title: 'FAQ', icon: 'help' },
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

    const handleNavigation = (item: MenuEntry) => {
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
            case 'Cart':
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

    const MenuItem = ({ item }: { item: MenuEntry }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => handleNavigation(item)}
        >
            <View style={[styles.iconContainer, { backgroundColor: '#E8F3F1' }]}>
                <TablerIcon name={item.icon} size={22} color="#1B5E54" />
            </View>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <TablerIcon name="chevron-right" size={20} color="#CBD5E1" />
        </TouchableOpacity>
    );

    const Section = ({ title, children }: any) => (
        <View style={styles.wrapper}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View>{children}</View>
        </View>
    );

    if (isGuest) {
        const unlockSteps = [
            {
                id: 'profile',
                icon: 'user' as TablerIconName,
                title: 'Your profile',
                subtitle: 'Name, DOB & essentials',
            },
            {
                id: 'prakriti',
                icon: 'ingredient' as TablerIconName,
                title: 'Prakriti assessment',
                subtitle: 'Personalised wellness map',
            },
        ];

        const lockedPreviews = [
            { icon: 'calendar' as TablerIconName, label: 'Appointments' },
            { icon: 'receipt' as TablerIconName, label: 'Orders' },
            { icon: 'heart' as TablerIconName, label: 'Wishlist' },
            { icon: 'map-pin' as TablerIconName, label: 'Addresses' },
        ];

        return (
            <>
                <StatusBar barStyle="light-content" backgroundColor="#0B3D32" />
                <View style={styles.guestRoot}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[
                            styles.guestScroll,
                            { paddingBottom: tabClearance + 16 },
                        ]}
                    >
                        <LinearGradient
                            colors={['#0B3D32', '#0D614E', '#1A7A62']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.guestHeroBand, { paddingTop: insets.top + 12 }]}
                        >
                            <View style={styles.guestHeroOrnament} />
                            <View style={styles.guestHeroOrnamentSoft} />

                            <View style={styles.guestTopRow}>
                                <View>
                                    <Text style={styles.guestBrand}>AYURMUNI</Text>
                                    <Text style={styles.guestTopLabel}>Guest session</Text>
                                </View>
                                <View style={styles.guestLivePill}>
                                    <View style={styles.guestLiveDot} />
                                    <Text style={styles.guestLiveText}>Browsing</Text>
                                </View>
                            </View>

                            <View style={styles.guestMonogramWrap}>
                                <LinearGradient
                                    colors={['#E8C77B', '#C9A227', '#A8841A']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.guestMonogramRing}
                                >
                                    <View style={styles.guestMonogramInner}>
                                        <Image
                                            source={Images.FinalLogo}
                                            style={styles.guestLogo}
                                            resizeMode="contain"
                                        />
                                    </View>
                                </LinearGradient>
                            </View>

                            <Text style={styles.guestHeroHeadline}>
                                Your wellness{'\n'}space awaits
                            </Text>
                            <Text style={styles.guestHeroCopy}>
                                Explore the app freely. Unlock your private account —
                                appointments, orders, and preferences — with a short setup.
                            </Text>
                        </LinearGradient>

                        <View style={styles.guestBody}>
                            <View style={styles.guestUnlockCard}>
                                <Text style={styles.guestUnlockEyebrow}>UNLOCK FULL ACCESS</Text>
                                <Text style={styles.guestUnlockTitle}>
                                    Two quiet steps. Full Ayurmuni.
                                </Text>

                                {unlockSteps.map((step, index) => (
                                    <View
                                        key={step.id}
                                        style={[
                                            styles.guestStepRow,
                                            index < unlockSteps.length - 1 && styles.guestStepDivider,
                                        ]}
                                    >
                                        <View style={styles.guestStepIcon}>
                                            <TablerIcon
                                                name={step.icon}
                                                size={18}
                                                color={Colors.primaryColor}
                                            />
                                        </View>
                                        <View style={styles.guestStepCopy}>
                                            <Text style={styles.guestStepTitle}>{step.title}</Text>
                                            <Text style={styles.guestStepSub}>{step.subtitle}</Text>
                                        </View>
                                        <Text style={styles.guestStepIndex}>0{index + 1}</Text>
                                    </View>
                                ))}

                                <TouchableOpacity
                                    style={styles.guestCta}
                                    activeOpacity={0.9}
                                    onPress={() =>
                                        navigateToCompleteDetails(
                                            'Complete your profile and prakriti assessment to continue.',
                                        )
                                    }
                                >
                                    <LinearGradient
                                        colors={['#0D614E', '#14876A']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.guestCtaGradient}
                                    >
                                        <Text style={styles.guestCtaText}>Complete details</Text>
                                        <TablerIcon name="arrow-right" size={18} color="#FFFFFF" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.guestLockedLabel}>Waiting behind the lock</Text>
                            <View style={styles.guestLockedRow}>
                                {lockedPreviews.map(item => (
                                    <View key={item.label} style={styles.guestLockedChip}>
                                        <View style={styles.guestLockedIcon}>
                                            <TablerIcon name={item.icon} size={16} color="#8AA399" />
                                        </View>
                                        <Text style={styles.guestLockedChipText}>{item.label}</Text>
                                        <TablerIcon name="lock" size={12} color="#B7C4BE" />
                                    </View>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={styles.guestExitBtn}
                                onPress={logout}
                                activeOpacity={0.85}
                            >
                                <TablerIcon name="logout" size={16} color="#8B6B6B" />
                                <Text style={styles.guestExitText}>Sign out of guest session</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>

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
            </>
        );
    }

    return (
        <>
            <ScreenShell contentStyle={styles.shellContent}>
                <Header title="Profile" subtitle="Manage your account" onBack={() => navigation.goBack()} />

                <ScrollView
                    style={styles.scrollArea}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: tabClearance },
                    ]}
                    keyboardShouldPersistTaps="handled"
                >

                    <ProfileHeader user={user} navigation={navigation} />

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

                    <TouchableOpacity
                        style={styles.logoutBtn}
                        onPress={logout}
                        activeOpacity={0.8}
                    >
                        <TablerIcon name="logout" size={20} color={Colors.errorColor} />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>

                    <Text style={styles.version}>APP VERSION 1.0</Text>
                </ScrollView>
            </ScreenShell>

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
        </>
    );
};

export default ProfilePage;

const styles = StyleSheet.create({
    shellContent: {
        flex: 1,
        paddingTop: 0,
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: 4,
    },
    guestRoot: {
        flex: 1,
        backgroundColor: '#F4F1EA',
    },
    guestScroll: {
        flexGrow: 1,
    },
    guestHeroBand: {
        paddingHorizontal: 24,
        paddingBottom: 36,
        overflow: 'hidden',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    guestHeroOrnament: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: 'rgba(232,199,123,0.12)',
        top: -60,
        right: -40,
    },
    guestHeroOrnamentSoft: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.06)',
        bottom: 20,
        left: -50,
    },
    guestTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 28,
    },
    guestBrand: {
        fontSize: 11,
        letterSpacing: 3,
        color: 'rgba(232,199,123,0.95)',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    guestTopLabel: {
        marginTop: 4,
        fontSize: 13,
        color: 'rgba(255,255,255,0.72)',
        fontFamily: Fonts.PoppinsRegular,
    },
    guestLivePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.12)',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
    },
    guestLiveDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#E8C77B',
    },
    guestLiveText: {
        fontSize: 11,
        color: '#F7F3EA',
        fontFamily: Fonts.PoppinsMedium,
    },
    guestMonogramWrap: {
        alignItems: 'center',
        marginBottom: 20,
    },
    guestMonogramRing: {
        width: 84,
        height: 84,
        borderRadius: 42,
        padding: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    guestMonogramInner: {
        width: '100%',
        height: '100%',
        borderRadius: 42,
        backgroundColor: '#0B3D32',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(232,199,123,0.35)',
        overflow: 'hidden',
    },
    guestLogo: {
        width: 52,
        height: 52,
    },
    guestHeroHeadline: {
        fontSize: 30,
        lineHeight: 38,
        color: '#FFFFFF',
        fontFamily: Fonts.PoppinsSemiBold,
        textAlign: 'center',
    },
    guestHeroCopy: {
        marginTop: 12,
        fontSize: 14,
        lineHeight: 22,
        color: 'rgba(247,243,234,0.82)',
        fontFamily: Fonts.PoppinsRegular,
        textAlign: 'center',
        paddingHorizontal: 8,
    },
    guestBody: {
        paddingHorizontal: 20,
        marginTop: -18,
    },
    guestUnlockCard: {
        backgroundColor: '#FFFcf7',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(13,97,78,0.08)',
        shadowColor: '#0B3D32',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 6,
    },
    guestUnlockEyebrow: {
        fontSize: 11,
        letterSpacing: 1.4,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    guestUnlockTitle: {
        marginTop: 6,
        marginBottom: 18,
        fontSize: 20,
        lineHeight: 28,
        color: '#14231F',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    guestStepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    guestStepDivider: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(13,97,78,0.08)',
    },
    guestStepIcon: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: '#E8F3EF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    guestStepCopy: {
        flex: 1,
    },
    guestStepTitle: {
        fontSize: 14,
        color: '#1A2E28',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    guestStepSub: {
        marginTop: 2,
        fontSize: 12,
        color: '#6B7C76',
        fontFamily: Fonts.PoppinsRegular,
    },
    guestStepIndex: {
        fontSize: 12,
        color: '#C9A227',
        fontFamily: Fonts.PoppinsSemiBold,
        letterSpacing: 1,
    },
    guestCta: {
        marginTop: 18,
        borderRadius: 16,
        overflow: 'hidden',
    },
    guestCtaGradient: {
        minHeight: 54,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingHorizontal: 18,
    },
    guestCtaText: {
        fontSize: 15,
        color: '#FFFFFF',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    guestLockedLabel: {
        marginTop: 28,
        marginBottom: 12,
        fontSize: 12,
        letterSpacing: 1.2,
        color: '#8AA399',
        fontFamily: Fonts.PoppinsSemiBold,
        textAlign: 'center',
    },
    guestLockedRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'space-between',
    },
    guestLockedChip: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,252,247,0.9)',
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: 'rgba(13,97,78,0.07)',
    },
    guestLockedIcon: {
        width: 30,
        height: 30,
        borderRadius: 10,
        backgroundColor: '#Eef3F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    guestLockedChipText: {
        flex: 1,
        fontSize: 12,
        color: '#6B7C76',
        fontFamily: Fonts.PoppinsMedium,
    },
    guestExitBtn: {
        marginTop: 28,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    guestExitText: {
        fontSize: 13,
        color: '#8B6B6B',
        fontFamily: Fonts.PoppinsMedium,
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