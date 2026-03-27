// import React from 'react';
// import {
//     View,
//     Text,
//     StyleSheet,
//     Image,
//     TouchableOpacity,
//     ScrollView,
//     Alert,
// } from 'react-native';
// import { Fonts } from '../../common/Fonts';
// import { Utils } from '../../common/Utils';

// interface MenuItem {
//     id: number;
//     title: string;
//     icon: any;
//     screen: string;
// }

// const ProfilePage = ({ navigation }: any) => {

//     // 🔥 Dynamic user data (API se aayega)
//     const user = {
//         name: 'Arjun Sharma',
//         email: 'arjun@gmail.com',
//         image: 'https://i.pravatar.cc/150?img=3',
//         consults: 2,
//         orders: 14,
//         reports: 5,
//     };

//     // 🔥 Dynamic menu list
//     const accountMenu: MenuItem[] = [
//         { id: 1, title: 'Patient Details', icon: '👤', screen: 'PatientDetails' },
//         { id: 2, title: 'My Appointments', icon: '📅', screen: 'Appointments' },
//         { id: 3, title: 'Order History', icon: '🛒', screen: 'Orders' },
//         { id: 4, title: 'Medical Records', icon: '📄', screen: 'Records' },
//         { id: 5, title: 'Favourite Doctor', icon: '❤️', screen: 'FavDoctors' },
//     ];

//     const preferenceMenu: MenuItem[] = [
//         { id: 6, title: 'Payments', icon: '💳', screen: 'Payments' },
//         { id: 7, title: 'Settings', icon: '⚙️', screen: 'Settings' },
//     ];

//     const logout = async () => {
//         await Utils.clearAllData()
//         navigation.replace('AuthStack', { screen: 'Login' });
//     }




//     const handleMenuPress = (item: MenuItem) => {
//         if (item.title === 'Log Out') {
//             Alert.alert('Log Out', 'Are you sure you want to log out?', [
//                 { text: 'Cancel', style: 'cancel' },
//                 {
//                     text: 'Log Out',
//                     onPress: () => logout()
//                 },
//             ]);
//         } else {

//             switch (item.title) {
//                 case 'Personal Information':
//                     navigation.navigate('EditProfile');
//                     break;
//                 case 'Settings':
//                     navigation.navigate('Settings');
//                     break;
//                 case 'My Orders':
//                     navigation.navigate('MyOrders');
//                     break;
//                 case 'My Cart':
//                     navigation.navigate('CartScreen');
//                     break;
//                 case 'Health Records':
//                     navigation.navigate('HealthRecords');
//                     break;
//                 case 'Help & Support':
//                     navigation.navigate('HelpSupport');
//                     break;
//                 case 'Rate Us':
//                     navigation.navigate('RatingScreen');
//                     break;
//                 case 'Privacy Policy':
//                     navigation.navigate('PrivacyPolicy');
//                     break;

//                 case 'Terms & Conditions':
//                     navigation.navigate('TermsConditions', {
//                         agreed: true
//                     });
//                     break;
//                 case 'About Us':
//                     navigation.navigate('AboutUs');
//                     break;
//                 default:
//                     console.log('No navigation defined for:', item.title);
//             }
//         }
//     };

//     const renderMenuItem = (item: MenuItem) => (
//         <TouchableOpacity
//             key={item.id}
//             style={styles.menuItem}
//             onPress={() => handleMenuPress(item)}
//         // onPress={() => navigation.navigate(item.screen)}
//         >
//             <Text style={styles.menuIcon}>{item.icon}</Text>
//             <Text style={styles.menuText}>{item.title}</Text>
//             <Text style={styles.arrow}>{'>'}</Text>
//         </TouchableOpacity>
//     );

//     return (
//         <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

//             {/* Header */}
//             <Text style={styles.header}>Profile</Text>
//             <Text style={styles.subHeader}>Manage your account</Text>

//             {/* Profile Card */}
//             <View style={styles.profileCard}>
//                 <Image source={{ uri: user.image }} style={styles.avatar} />
//                 <Text style={styles.name}>{user.name}</Text>
//                 <Text style={styles.email}>{user.email}</Text>

//                 {/* Stats */}
//                 <View style={styles.statsRow}>
//                     <View style={styles.statBox}>
//                         <Text style={styles.statNumber}>{user.consults}</Text>
//                         <Text style={styles.statLabel}>CONSULTS</Text>
//                     </View>

//                     <View style={styles.statBox}>
//                         <Text style={styles.statNumber}>{user.orders}</Text>
//                         <Text style={styles.statLabel}>ORDERS</Text>
//                     </View>

//                     <View style={styles.statBox}>
//                         <Text style={styles.statNumber}>{user.reports}</Text>
//                         <Text style={styles.statLabel}>REPORTS</Text>
//                     </View>
//                 </View>
//             </View>

//             {/* Account Section */}
//             <Text style={styles.sectionTitle}>Account</Text>
//             <View style={styles.menuContainer}>
//                 {accountMenu.map(renderMenuItem)}
//             </View>

//             {/* Preference Section */}
//             <Text style={styles.sectionTitle}>Preference</Text>
//             <View style={styles.menuContainer}>
//                 {preferenceMenu.map(renderMenuItem)}
//             </View>

//             {/* Logout */}
//             <TouchableOpacity style={styles.logoutBtn}>
//                 <Text style={styles.logoutText}>Logout</Text>
//             </TouchableOpacity>

//             <Text style={styles.version}>APP VERSION 1.2</Text>

//         </ScrollView>
//     );
// };

// export default ProfilePage;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#F7F8FA',
//         paddingHorizontal: 16,
//     },

//     header: {
//         fontSize: 22,
//         fontFamily: Fonts.PoppinsBold,
//         marginTop: 20,
//         color: '#111',
//     },

//     subHeader: {
//         fontSize: 12,
//         color: '#6B7280',
//         marginBottom: 16,
//         fontFamily: Fonts.PoppinsRegular,
//     },

//     profileCard: {
//         backgroundColor: '#fff',
//         borderRadius: 20,
//         padding: 16,
//         alignItems: 'center',
//         marginBottom: 20,
//     },

//     avatar: {
//         width: 70,
//         height: 70,
//         borderRadius: 40,
//         marginBottom: 8,
//     },

//     name: {
//         fontSize: 16,
//         fontFamily: Fonts.PoppinsSemiBold,
//     },

//     email: {
//         fontSize: 12,
//         color: '#6B7280',
//         marginBottom: 12,
//     },

//     statsRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         width: '100%',
//     },

//     statBox: {
//         backgroundColor: '#F1F3F5',
//         padding: 10,
//         borderRadius: 10,
//         alignItems: 'center',
//         width: '30%',
//     },

//     statNumber: {
//         fontSize: 16,
//         fontFamily: Fonts.PoppinsSemiBold,
//     },

//     statLabel: {
//         fontSize: 10,
//         color: '#6B7280',
//     },

//     sectionTitle: {
//         fontSize: 14,
//         fontFamily: Fonts.PoppinsSemiBold,
//         marginBottom: 8,
//         color: '#111',
//     },

//     menuContainer: {
//         backgroundColor: '#fff',
//         borderRadius: 16,
//         marginBottom: 16,
//     },

//     menuItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         padding: 14,
//         borderBottomWidth: 0.5,
//         borderBottomColor: '#eee',
//     },

//     menuIcon: {
//         marginRight: 10,
//     },

//     menuText: {
//         flex: 1,
//         fontSize: 13,
//         fontFamily: Fonts.PoppinsMedium,
//     },

//     arrow: {
//         color: '#999',
//     },

//     logoutBtn: {
//         borderWidth: 1,
//         borderColor: '#FF4D4F',
//         padding: 14,
//         borderRadius: 12,
//         alignItems: 'center',
//     },

//     logoutText: {
//         color: '#FF4D4F',
//         fontFamily: Fonts.PoppinsSemiBold,
//     },

//     version: {
//         textAlign: 'center',
//         fontSize: 10,
//         marginTop: 10,
//         color: '#999',
//     },
// });


import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';

import ProfileHeader from '../../components/ProfileHeader';
import { Fonts } from '../../common/Fonts';

const ProfilePage = ({ navigation }: any) => {

    const user = {
        name: 'Arjun Sharma',
        email: 'arjun@gmail.com',
        image: 'https://i.pravatar.cc/150?img=3',
        consults: 2,
        orders: 14,
        reports: 5,
    };

    const accountMenu = [
        { id: 1, title: 'Patient Details', icon: '👤' },
        { id: 2, title: 'My Appointments', icon: '📅' },
        { id: 3, title: 'Order History', icon: '🛒' },
        { id: 4, title: 'Medical Records', icon: '📄' },
        { id: 5, title: 'Favourite Doctor', icon: '❤️' },
    ];

    const preferenceMenu = [
        { id: 6, title: 'Payments', icon: '💳' },
        { id: 7, title: 'Settings', icon: '⚙️' },
    ];


    const MenuItem = ({ item, onPress }: any) => {
        return (
            <TouchableOpacity style={styles.row} onPress={onPress}>
                <Text style={styles.icon}>{item.icon}</Text>

                <Text style={styles.title}>{item.title}</Text>

                <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
        );
    };



    const Section = ({ title, children }: any) => {
        return (
            <View style={styles.wrapper}>
                <Text style={styles.title}>{title}</Text>

                <View style={styles.card}>
                    {children}
                </View>
            </View>
        );
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            {/* HEADER */}
            <Text style={styles.header}>Profile</Text>
            <Text style={styles.subHeader}>Manage your account</Text>

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

            {/* LOGOUT */}
            <TouchableOpacity style={styles.logoutBtn}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <Text style={styles.version}>APP VERSION 1.2</Text>

        </ScrollView>
    );
};

export default ProfilePage;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F7FB',
        paddingHorizontal: 16,
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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 14,
    },

    icon: {
        marginRight: 12,
        fontSize: 16,
    },

    title: {
        flex: 1,
        fontSize: 13,
        fontFamily: Fonts.PoppinsMedium,
        color: '#111',
    },

    arrow: {
        fontSize: 18,
        color: '#C0C0C0',
    },

    wrapper: {
        marginTop: 18,
    },

   
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
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
        fontSize: 10,
        marginTop: 10,
        color: '#999',
    },
});