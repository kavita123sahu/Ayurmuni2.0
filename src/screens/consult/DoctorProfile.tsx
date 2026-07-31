import React, { memo, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    StatusBar,
    Dimensions,
    RefreshControl,
    Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '../../common/Vector';
import { Images } from '../../common/Images';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { getDoctorSlots } from '../../services/ConsultServce';
import * as _CONSULT_SERVICES from '../../services/ConsultServce';
import BackIconButton from '../../components/BackIconButton';
import { requireAuth } from '../../services/guestAuth';
import { showSuccessToast } from '../../config/Key';
import FavouriteButton from '../../components/FavouriteButton';
import TablerIcon from '../../components/TablerIcon';

const { width } = Dimensions.get('window');

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface DoctorData {
    id: Number;
    full_name?: string;
    is_favorite: boolean;
    designation?: string;
    about?: string;
    profile_image?: { url: string };
    total_patients?: number;
    total_reviews?: number;
    experience_display?: string;
    consultation_fee?: number;
    specialized_therapies?: string[];
}

interface StatItem {
    id: string;
    value: string | number;
    label: string;
}

/* -------------------------------------------------------------------------- */
/*                              REUSABLE COMPONENTS                           */
/* -------------------------------------------------------------------------- */

const StatBar = memo(({ stats }: { stats: StatItem[] }) => {
    if (!stats.length) return null;

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

const ReviewCard = memo(({ review }: { review: any }) => (


    <View style={styles.reviewCard}>
        <View style={styles.reviewTop}>
            <View style={styles.userRow}>
               {review.image ? (
  <Image source={review.image} style={styles.userImage} />
) : (
  <View style={styles.avatarPlaceholder}>
    <Text style={styles.avatarText}>
      {review.name?.charAt(0)?.toUpperCase()}
    </Text>
  </View>
)}

                <View style={styles.userInfo}>
                    <Text numberOfLines={1} style={styles.userName}>
                        {review.name}
                    </Text>
                    <View style={styles.ratingRow}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <Ionicons key={star} name="star" size={12} color="#FACC15" />
                        ))}
                    </View>
                </View>
            </View>
            <Text style={styles.time}>{review.time}</Text>
        </View>
        <Text style={styles.reviewText}>"{review.review}"</Text>
    </View>
));

const SpecializationTags = memo(({ therapies }: { therapies: string[] }) => {
    if (!therapies?.length) {
        return (
            <Text style={styles.emptyText}>
                No specializations listed
            </Text>
        );
    }

    return (
        <View style={styles.tagsWrapper}>
            {therapies.map((item, index) => (
                <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{item}</Text>
                </View>
            ))}
        </View>
    );
});

/* -------------------------------------------------------------------------- */
/*                                MAIN SCREEN                                 */
/* -------------------------------------------------------------------------- */

const DoctorProfile = ({ navigation, route }: any) => {
    const { doctorData } = route?.params;
    const insets = useSafeAreaInsets();
    const footerBottomPad = Math.max(insets.bottom, 12);

    console.log("docororpf", doctorData);

    const [refreshing, setRefreshing] = useState(false);
    const [showFullAbout, setShowFullAbout] = useState(false);
    const [isFavourite, setIsFavourite] = useState(false);

    const [doctorDetails, setDoctorDetails] = useState<any>(null);

    const doctor = useMemo(
        () => ({
            ...doctorData,
            ...doctorDetails,
        }),
        [doctorData, doctorDetails]
    );


    // Memoized Values
    const stats = useMemo(() => [
        {
            id: "1",
            value: doctor?.patients_display || doctor?.total_patients || 0,
            label: "PATIENTS",
        },
        {
            id: "2",
            value: doctor?.total_reviews || 0,
            label: "REVIEWS",
        },
        {
            id: "3",
            value: doctor?.experience_display || `${doctor?.experience_years || 0}+`,
            label: "EXPERIENCE",
        },
    ], [doctor]);

    const specializations = useMemo(
        () =>
            doctor?.specialized_therapies ||
            doctor?.specializations ||
            [],
        [
            doctor?.specialized_therapies,
            doctor?.specializations,
        ]
    );

    const reviews = useMemo(
        () => doctor?.reviews || [],
        [doctor?.reviews]
    );
    const formattedReviews = useMemo(
        () =>
            reviews?.map((review: any) => ({
                id: review.id,
                name: review.reviewer_name,
                review: review.review,
                time: review.time_ago,
                image: review.reviewer_profile_image
    ? { uri: review.reviewer_profile_image }
    : null,

            })),
        [reviews]
    );


    const aboutText = useMemo(
        () => doctor?.bio || '',
        [doctor?.bio]
    );
    const shouldTruncate = aboutText.length > 150;

    const truncatedAbout = useMemo(() => {
        if (!shouldTruncate || showFullAbout) return aboutText;
        return `${aboutText.substring(0, 150)}`;
    }, [aboutText, shouldTruncate, showFullAbout]);


    const getDoctorDetails = useCallback(async () => {
        try {
            const res = await getDoctorSlots({
                id: doctorData?.id
            }
            );
            console.log("dattaaa", res?.data);
            if (res?.data) {
                setDoctorDetails(res?.data
                );
            }
        } catch (error) {
            console.log(
                'DOCTOR DETAILS ERROR =>',
                error
            );
        }
    }, [doctorData?.id]);

    useEffect(() => {
        if (doctorData?.id) {
            getDoctorDetails();
        }
    }, [doctorData?.id]);


    const handleFavourite = async () => {
        const prev = isFavourite;

        console.log(
            'FAVOURITE DOCTOR ID =>',
            doctorData?.id,
            prev
        );

        setIsFavourite(!prev);

        try {
            const resposne = await _CONSULT_SERVICES.ToggleFavDoctor(
                doctorData?.id,
                'POST',
            );
            showSuccessToast(resposne?.message, 'success');
            console.log(
                'FAVOURITE SUCCESS =>',
                resposne
            );

        } catch (error) {
            setIsFavourite(prev);
            showSuccessToast('Failed to update favourite status', 'error')

            console.log(
                'FAVOURITE ERROR =>',
                error,
            );
        }
    };

    const handleRefresh = useCallback(async () => {
        try {
            setRefreshing(true);
            await getDoctorDetails();
        } finally {
            setRefreshing(false);
        }
    }, [getDoctorDetails]);

    useEffect(() => {
        setIsFavourite(
            doctor?.is_favorite ?? false
        );
    }, [doctor?.is_favorite]);


    // Handlers
    const handleBookAppointment = useCallback(async () => {
        if (!(await requireAuth('Please login to book an appointment'))) return;
        if (doctorDetails) {
            navigation.navigate('DoctorSlot', { doctorDetails });
        }
    }, [navigation, doctorDetails]);


    const handleToggleAbout = useCallback(() => {
        setShowFullAbout(prev => !prev);
    }, []);




    // Main Render
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#F3FAF7" barStyle="dark-content" />

            {/* Header */}
            <View style={styles.headerTop}>
                <BackIconButton
                    onPress={() => navigation.goBack()}
                    style={styles.iconBtn}
                />

                <Text style={styles.headerTitle}>Doctor Profile</Text>

                <FavouriteButton
                    isFavourite={isFavourite}
                    onPress={handleFavourite}
                    style={styles.iconBtn}
                />

            </View>

            {/* Scrollable Content */}
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[Colors.primaryColor]}
                        tintColor={Colors.primaryColor}
                    />
                }
            >
                {/* Profile Section */}
                <View style={styles.profileContainer}>
                    <View style={styles.avatarWrapper}>
                        {doctor?.profile_image ? (
                            <Image
                                source={{ uri: doctor?.profile_image }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View style={styles.avatarFallback}>
                                <Text style={styles.avatarLetter}>
                                    {doctor?.full_name?.charAt(0)?.toUpperCase() || ''}
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text numberOfLines={1} style={styles.doctorName}>
                        {doctor?.full_name || 'Doctor'}
                    </Text>

                    <Text numberOfLines={1} style={styles.speciality}>
                        {doctor?.designation || ''}
                    </Text>
                </View>

                {/* Stats Section */}
                <StatBar stats={stats} />

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.aboutText}>
                        {truncatedAbout}
                        {shouldTruncate && (
                            <Text onPress={handleToggleAbout} style={styles.readMore}>
                                {showFullAbout ? ' Read Less' : '... Read More'}
                            </Text>
                        )}
                    </Text>
                </View>

                {/* Specializations Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Specializations Therapies</Text>
                    <SpecializationTags therapies={specializations} />
                </View>

                {/* Reviews Section */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.reviewHeader} >
                        <Text style={styles.sectionTitle}>Patient Reviews</Text>

                        <TouchableOpacity onPress={() => navigation.navigate("ReviewPage", {
                            reviews: reviews,
                        })}>
                            <Text style={styles.viewAll}>View All</Text>
                        </TouchableOpacity>

                    </TouchableOpacity>

                    {reviews?.length > 0 ? (
                        formattedReviews
                            .slice(0, 3)
                            .map((review: any) => (
                                <ReviewCard
                                    key={review.id}
                                    review={review}
                                />
                            ))
                    ) : (
                        <Text style={styles.emptyText}>
                            No Reviews Found
                        </Text>
                    )}
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: footerBottomPad }]}>
                <View style={styles.priceContainer}>
                    <Text style={styles.feeText}>Consult Fee</Text>
                    <Text style={styles.price}>
                        {doctor?.consultation_fee
                        }

                    </Text>
                </View>

                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleBookAppointment}
                    style={styles.bookBtn}
                >
                    <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
                    <Text numberOfLines={1} style={styles.bookText}>
                        Book Appointment
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default DoctorProfile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 16,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#1E293B',
        marginHorizontal: 12,
    },
    profileContainer: {
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 20,
        paddingBottom: 24,
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
        shadowOffset: { width: 0, height: 4 },
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
        backgroundColor: Colors.primaryColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarLetter: {
        fontSize: 32,
        color: '#FFFFFF',
        fontFamily: Fonts.PoppinsBold,
    },
    doctorName: {
        marginTop: 14,
        fontSize: 22,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: -5,
        paddingHorizontal: 20,
    },
    speciality: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
        color: Colors.primaryColor,
        textAlign: 'center',
    },
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
        fontFamily: Fonts.PoppinsBold,
        color: '#1E293B',
    },
    statLabel: {
        marginTop: -2,
        fontSize: 11,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
        textAlign: 'center',
    },
    section: {
        marginTop: 26,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#1E293B',
    },
    aboutText: {
        marginTop: 10,
        fontSize: 14,
        lineHeight: 24,
        fontFamily: Fonts.PoppinsRegular,
        color: '#64748B',
    },
    readMore: {
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },
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
        fontFamily: Fonts.PoppinsMedium,
        color: Colors.primaryColor,
    },
    emptyText: {
        marginTop: 12,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    viewAll: {
        fontSize: 15,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.primaryColor,
    },
    reviewCard: {
        marginTop: 18,
    },
    reviewTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
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
    avatarPlaceholder: {
  width: 48,
  height: 48,
  marginRight:10,
  borderRadius: 24,
  backgroundColor: Colors.bgcolor,
  justifyContent: 'center',
  alignItems: 'center',
},

avatarText: {
  fontSize: 18,
  fontFamily: Fonts.PoppinsMedium,
  color: Colors.primaryColor,
},
    userName: {
        fontSize: 15,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#1E293B',
    },
    ratingRow: {
        flexDirection: 'row',
        marginTop: 4,
    },
    time: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
        marginLeft: 10,
    },
    reviewText: {
        marginTop: 12,
        fontSize: 14,
        lineHeight: 24,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        backgroundColor: '#FFFFFF',
    },
    priceContainer: {
        marginRight: 16,
        minWidth: 100,
    },
    feeText: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
    },
    price: {
        fontSize: 26,
        fontFamily: Fonts.PoppinsBold,
        color: Colors.primaryColor,
    },
    bookBtn: {
        flex: 1,
        minHeight: 56,
        borderRadius: 18,
        backgroundColor: Colors.primaryColor,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    bookBtnLocked: {
        backgroundColor: '#64748B',
    },
    bookText: {
        marginLeft: 8,
        fontSize: 15,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#FFFFFF',
        flexShrink: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
        textAlign: 'center',
    },
    retryBtn: {
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: Colors.primaryColor,
        borderRadius: 12,
    },
    retryText: {
        color: '#FFFFFF',
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 14,
    },
});