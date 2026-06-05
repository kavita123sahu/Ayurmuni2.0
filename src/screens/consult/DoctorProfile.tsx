import React, { memo, useEffect, useState } from 'react';
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
import { getDoctorSlots } from '../../services/ConsultServce';

/* -------------------------------------------------------------------------- */
/*                                   DATA                                     */
/* -------------------------------------------------------------------------- */

const { width } = Dimensions.get('window');



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



/* -------------------------------------------------------------------------- */
/*                              REUSABLE COMPONENTS                           */
/* -------------------------------------------------------------------------- */

const StatBar = memo(({ stats }: { stats: { id: string; value: any; label: string }[] }) => {
    return (
        <View style={styles.statsContainer}>
            {stats.map((item, index) => (
                <React.Fragment key={item.id}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{item.value}</Text>
                        <Text style={styles.statLabel}>{item.label}</Text>
                    </View>
                    {index !== stats.length - 1 && <View style={styles.divider} />}
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

const DoctorProfile = ({ navigation, route }: any) => {

    // prefer doctorId from navigation params if provided
    const doctorIdFromParams = route?.params?.doctorId || null;

    console.log("doctorIdFromParams", doctorIdFromParams);

    const [showFullAbout, setShowFullAbout] = useState(false);
    const [slots, setSlots] = useState<any>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotsError, setSlotsError] = useState<any>(null);

    const doctorIdParam = doctorIdFromParams;

    const fetchDoctor = async (id: string) => {
        try {
            setLoadingSlots(true);
            setSlotsError(null);
            const resp = await getDoctorSlots({ id });
            console.log("fetchDoctor response", resp);
            setSlots(resp?.data || null);
        } catch (err) {
            setSlotsError(err);
        } finally {
            setLoadingSlots(false);
        }
    };

    useEffect(() => {
        if (doctorIdParam) fetchDoctor(doctorIdParam);
    }, [doctorIdParam]);

    const SPECIALIZATIONS = Array.isArray(slots?.specialized_therapies)
        ? slots.specialized_therapies
        : [];
    // const SPECIALIZATIONS = slots?.specialized_therapies || [];

    const STATS = [
        { id: '1', value: slots?.total_patients || 0, label: 'PATIENTS' },
        { id: '2', value: slots?.total_reviews || 0, label: 'REVIEWS' },
        { id: '3', value: slots?.experience_display || 0, label: 'EXPERIENCE' },
    ];

    return (



        <SafeAreaView style={styles.container}>
            <StatusBar
                backgroundColor="#F3FAF7"
                barStyle="dark-content"
            />

            {/* FIXED HEADER ONLY */}
            <View style={styles.headerTop}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => navigation.goBack()}
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
                        color={Colors.primaryColor}
                    />
                </TouchableOpacity>
            </View>

            {/* SCROLL START */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >

                {/* PROFILE */}
                <View style={styles.profileContainer}>
                    <View style={styles.avatarWrapper}>
                        {slots?.profile_image?.url ? (
                            <Image
                                source={{
                                    uri: slots?.profile_image?.url,
                                }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View style={styles.avatarFallback}>
                                <Text style={styles.avatarLetter}>
                                    {slots?.full_name
                                        ?.charAt(0)
                                        ?.toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text
                        numberOfLines={1}
                        style={styles.doctorName}
                    >
                        {slots?.full_name}
                    </Text>

                    <Text
                        numberOfLines={1}
                        style={styles.speciality}
                    >
                        {slots?.designation}
                    </Text>
                </View>

                {/* STATS */}
                <StatBar stats={STATS} />

                <View style={styles.section}>

                    <Text style={styles.sectionTitle}>
                        About
                    </Text>

                    <Text style={styles.aboutText}>

                        {
                            showFullAbout
                                ? slots?.about
                                : `${slots?.about?.substring(0, 150)}`
                        }

                        {
                            slots?.about?.length > 150 && (
                                <Text
                                    onPress={() =>
                                        setShowFullAbout(
                                            !showFullAbout,
                                        )
                                    }

                                    style={styles.readMore}
                                >
                                    {
                                        showFullAbout
                                            ? ' Read Less'
                                            : '... Read More'
                                    }
                                </Text>
                            )
                        }

                    </Text>

                </View>
                {/* SPECIALIZATION */}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Specializations
                    </Text>

                    <View style={styles.tagsWrapper}>
                        {SPECIALIZATIONS?.length ? (
                            SPECIALIZATIONS?.map((item: string, index: number) => (
                                <View key={index} style={styles.tag}>
                                    <Text style={styles.tagText}>{item}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={{ color: '#64748B', fontFamily: Fonts.PoppinsMedium }}>
                                No specializations listed
                            </Text>
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
            </ScrollView>

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
                        Rs. {slots?.consultation_fee || 0}
                    </Text>
                </View>

                <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('DoctorSlot', { doctorData: slots })} style={styles.bookBtn}>
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
        // backgroundColor: ''

        minHeight: 50,
        marginTop: 8,
        paddingHorizontal: 20,
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

        marginTop: 12,

        paddingTop: 30,
        paddingBottom: 35,

        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,

        overflow: 'hidden',
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

    avatarFallback: {
        width: 90,
        height: 90,

        borderRadius: 16,

        backgroundColor:
            Colors.primaryColor,

        justifyContent: 'center',
        alignItems: 'center',
    },

    avatarLetter: {
        fontSize: 32,

        color: '#FFFFFF',

        fontFamily:
            Fonts.PoppinsBold,
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