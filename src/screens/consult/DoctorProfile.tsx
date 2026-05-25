import React, { memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    StatusBar,
    Dimensions,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../common/Vector';

import { Images } from '../../common/Images';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';

/* -------------------------------------------------------------------------- */
/*                                   DATA                                     */
/* -------------------------------------------------------------------------- */

const { width } = Dimensions.get('window');

const SPECIALIZATIONS = [
    'Cardiovascular Disease',
    'Echocardiography',
    'Heart Failure',
    'Hypertension',
];

const REVIEWS = [
    {
        id: '1',
        name: 'Rohan Mishra',
        image: Images.doctorImage,
        review:
            'Dr. Arjun was incredibly thorough and took the time to explain everything clearly. Highly recommended!',
        time: '2 days ago',
    },
];

const STATS = [
    {
        id: '1',
        value: '1,200+',
        label: 'PATIENTS',
    },
    {
        id: '2',
        value: '978',
        label: 'REVIEWS',
    },
    {
        id: '3',
        value: '12+',
        label: 'EXPERIENCE',
    },
];

/* -------------------------------------------------------------------------- */
/*                              REUSABLE COMPONENTS                           */
/* -------------------------------------------------------------------------- */

const StatBar = memo(() => {
    return (
        <View style={styles.statsContainer}>
            {STATS.map((item, index) => (
                <React.Fragment key={item.id}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                            {item.value}
                        </Text>

                        <Text style={styles.statLabel}>
                            {item.label}
                        </Text>
                    </View>

                    {index !== STATS.length - 1 && (
                        <View style={styles.divider} />
                    )}
                </React.Fragment>
            ))}
        </View>
    );
});

const ReviewCard = memo(
    ({
        item,
    }: {
        item: (typeof REVIEWS)[0];
    }) => {
        return (
            <View style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                    <View style={styles.userRow}>
                        <Image
                            source={item.image}
                            style={styles.userImage}
                        />

                        <View style={styles.userInfo}>
                            <Text
                                numberOfLines={1}
                                style={styles.userName}
                            >
                                {item.name}
                            </Text>

                            <View style={styles.ratingRow}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Ionicons
                                        key={star}
                                        name="star"
                                        size={12}
                                        color="#FACC15"
                                    />
                                ))}
                            </View>
                        </View>
                    </View>

                    <Text style={styles.time}>
                        {item.time}
                    </Text>
                </View>

                <Text style={styles.reviewText}>
                    "{item.review}"
                </Text>
            </View>
        );
    },
);

/* -------------------------------------------------------------------------- */
/*                                MAIN SCREEN                                 */
/* -------------------------------------------------------------------------- */

const DoctorProfile = ({
    navigation,
}: any) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                backgroundColor="#F3FAF7"
                barStyle="dark-content"
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                    styles.scrollContent
                }
            >
                {/* HEADER */}

                <View style={styles.headerContainer}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() =>
                                navigation.goBack()
                            }
                            style={styles.iconBtn}
                        >
                            <Image
                                source={Images.backIcon}
                                style={styles.backIcon}
                            />
                        </TouchableOpacity>

                        <Text style={styles.headerTitle}>
                            Doctor Profile
                        </Text>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.iconBtn}
                        >
                            <Ionicons
                                name="heart-outline"
                                size={22}
                                color={
                                    Colors.primaryColor
                                }
                            />
                        </TouchableOpacity>
                    </View>

                    {/* PROFILE */}

                    <View style={styles.profileContainer}>
                        <View style={styles.avatarWrapper}>
                            <Image
                                source={Images.doctorImage}
                                style={styles.avatar}
                            />
                        </View>

                        <Text
                            numberOfLines={1}
                            style={styles.doctorName}
                        >
                            Dr. Arjun R Nair
                        </Text>

                        <Text
                            numberOfLines={1}
                            style={styles.speciality}
                        >
                            Senior Cardiologist
                        </Text>
                    </View>
                </View>

                {/* STATS */}

                <StatBar />

                {/* ABOUT */}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        About
                    </Text>

                    <Text style={styles.aboutText}>
                        Dr. Arjun R Nair is highly
                        experienced Cardiologists
                        with over 12 years of
                        expertise in holistic
                        healing and Ayurvedic
                        medicine. He specialized in
                        detoxification and
                        rejuvenation therapies...
                        <Text style={styles.readMore}>
                            {' '}
                            Read More
                        </Text>
                    </Text>
                </View>

                {/* SPECIALIZATION */}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Specializations
                    </Text>

                    <View style={styles.tagsWrapper}>
                        {SPECIALIZATIONS.map(
                            (item, index) => (
                                <View
                                    key={index}
                                    style={styles.tag}
                                >
                                    <Text
                                        style={styles.tagText}
                                    >
                                        {item}
                                    </Text>
                                </View>
                            ),
                        )}
                    </View>
                </View>

                {/* REVIEWS */}

                <View style={styles.section}>
                    <View style={styles.reviewHeader}>
                        <Text style={styles.sectionTitle}>
                            Patient Reviews
                        </Text>

                        <TouchableOpacity>
                            <Text style={styles.viewAll}>
                                View All
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {REVIEWS.map(item => (
                        <ReviewCard
                            key={item.id}
                            item={item}
                        />
                    ))}
                </View>

                {/* FOOTER */}

                <View style={styles.footer}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.feeText}>
                            Consult Fee
                        </Text>

                        <Text
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            style={styles.price}
                        >
                            Rs. 1499.00
                        </Text>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={()=>navigation.navigate('DoctorSlot')}
                        style={styles.bookBtn}
                    >
                        <Ionicons
                            name="calendar-outline"
                            size={18}
                            color="#FFFFFF"
                        />

                        <Text
                            numberOfLines={1}
                            style={styles.bookText}
                        >
                            Book Appointment
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default DoctorProfile;

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    scrollContent: {
        paddingBottom: 30,
    },

    /* HEADER */

    headerContainer: {
        backgroundColor: '#F3FAF7',

        borderBottomLeftRadius: 42,
        borderBottomRightRadius: 42,

        paddingHorizontal: 20,
        paddingBottom: 28,
    },

    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:
            'space-between',

        minHeight: 50,
        marginTop: 8,
    },

    iconBtn: {
        width: 40,
        height: 40,

        borderRadius: 12,

        backgroundColor: '#FFFFFF',

        alignItems: 'center',
        justifyContent: 'center',
    },

    backIcon: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },

    headerTitle: {
        flex: 1,

        textAlign: 'center',

        fontSize: 20,
        fontFamily:
            Fonts.PoppinsSemiBold,

        color: '#1E293B',

        marginHorizontal: 12,
    },

    /* PROFILE */

    profileContainer: {
        alignItems: 'center',

        marginTop: 20,
    },

    avatarWrapper: {
        width: width * 0.28,
        height: width * 0.28,

        maxWidth: 110,
        maxHeight: 110,

        minWidth: 90,
        minHeight: 90,

        borderRadius: 24,

        backgroundColor: '#FFFFFF',

        borderWidth: 1,
        borderColor: '#DDEBE8',

        padding: 8,

        alignItems: 'center',
        justifyContent: 'center',

        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowRadius: 6,

        elevation: 4,
    },

    avatar: {
        width: '100%',
        height: '100%',

        borderRadius: 18,

        resizeMode: 'cover',
    },

    doctorName: {
        marginTop: 14,

        fontSize: 22,
        fontFamily:
            Fonts.PoppinsSemiBold,

        color: '#1E293B',


        textAlign: 'center',
        marginBottom: -5,
        paddingHorizontal: 20,
    },

    speciality: {
        fontSize: 14,
        fontFamily:
            Fonts.PoppinsMedium,

        color: Colors.primaryColor,

        textAlign: 'center',
    },

    /* STATS */

    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',

        marginTop: 24,
        marginHorizontal: 20,

        backgroundColor: '#FFFFFF',

        borderRadius: 18,

        borderWidth: 1,
        borderColor: '#F1F5F9',

        overflow: 'hidden',
    },

    statItem: {
        flex: 1,

        alignItems: 'center',
        justifyContent: 'center',

        paddingVertical: 16,
        paddingHorizontal: 8,
    },

    divider: {
        width: 1,
        height: 40,

        backgroundColor: '#E2E8F0',
    },

    statValue: {
        fontSize: 22,
        fontFamily:
            Fonts.PoppinsBold,

        color: '#1E293B',
    },

    statLabel: {
        marginTop: -2,

        fontSize: 11,
        fontFamily:
            Fonts.PoppinsMedium,

        color: '#94A3B8',

        textAlign: 'center',
    },

    /* COMMON SECTION */

    section: {
        marginTop: 26,
        paddingHorizontal: 20,
    },

    sectionTitle: {
        fontSize: 18,
        fontFamily:
            Fonts.PoppinsSemiBold,

        color: '#1E293B',
    },

    /* ABOUT */

    aboutText: {
        marginTop: 10,

        fontSize: 14,
        lineHeight: 24,

        fontFamily:
            Fonts.PoppinsRegular,

        color: '#64748B',
    },

    readMore: {
        color: Colors.primaryColor,
        fontFamily:
            Fonts.PoppinsSemiBold,
    },

    /* TAGS */

    tagsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',

        marginTop: 16,
    },

    tag: {
        borderWidth: 1,
        borderColor: '#E2E8F0',

        borderRadius: 12,

        paddingHorizontal: 14,
        paddingVertical: 8,

        marginRight: 10,
        marginBottom: 10,

        backgroundColor: '#FFFFFF',
    },

    tagText: {
        fontSize: 13,
        fontFamily:
            Fonts.PoppinsMedium,

        color: Colors.primaryColor,
    },

    /* REVIEW */

    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:
            'space-between',
    },

    viewAll: {
        fontSize: 15,
        fontFamily:
            Fonts.PoppinsSemiBold,

        color: Colors.primaryColor,
    },

    reviewCard: {
        marginTop: 18,
    },

    reviewTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent:
            'space-between',
    },

    userRow: {
        flexDirection: 'row',
        alignItems: 'center',

        flex: 1,
        minWidth: 0,
    },

    userInfo: {
        flex: 1,
        minWidth: 0,
    },

    userImage: {
        width: 48,
        height: 48,

        borderRadius: 24,

        marginRight: 12,
    },

    userName: {
        fontSize: 15,
        fontFamily:
            Fonts.PoppinsSemiBold,

        color: '#1E293B',
    },

    ratingRow: {
        flexDirection: 'row',

        marginTop: 4,
    },

    time: {
        fontSize: 12,
        fontFamily:
            Fonts.PoppinsMedium,

        color: '#94A3B8',

        marginLeft: 10,
    },

    reviewText: {
        marginTop: 12,

        fontSize: 14,
        lineHeight: 24,

        fontFamily:
            Fonts.PoppinsMedium,

        color: '#64748B',
    },

    /* FOOTER */

    footer: {
        flexDirection: 'row',
        alignItems: 'center',

        marginTop: 34,
        marginHorizontal: 20,

        marginBottom: 20,
    },

    priceContainer: {
        marginRight: 16,
        minWidth: 100,
    },

    feeText: {
        fontSize: 14,
        fontFamily:
            Fonts.PoppinsMedium,

        color: '#94A3B8',
    },

    price: {
        fontSize: 26,
        fontFamily:
            Fonts.PoppinsBold,

        color: Colors.primaryColor,
    },

    bookBtn: {
        flex: 1,

        minHeight: 56,

        borderRadius: 18,

        backgroundColor:
            Colors.primaryColor,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        paddingHorizontal: 12,
    },

    bookText: {
        marginLeft: 8,

        fontSize: 15,
        fontFamily:
            Fonts.PoppinsSemiBold,

        color: '#FFFFFF',

        flexShrink: 1,
    },
});