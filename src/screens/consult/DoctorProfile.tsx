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
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '../../common/Vector';
import { Images } from '../../common/Images';
import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { getDoctorSlots } from '../../services/ConsultServce';
import * as _CONSULT_SERVICES from '../../services/ConsultServce';
import { showSuccessToast } from '../../config/Key';

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
                <Image source={review.image} style={styles.userImage} />
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
    const doctorId = route?.params?.doctorId || null;

    // State
    const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showFullAbout, setShowFullAbout] = useState(false);
    const [isFavourite, setIsFavourite] = useState(false);

    // Memoized Values
    const stats = useMemo<StatItem[]>(() => {
        if (!doctorData) return [];
        return [
            { id: '1', value: doctorData?.total_patients || 0, label: 'PATIENTS' },
            { id: '2', value: doctorData?.total_reviews || 0, label: 'REVIEWS' },
            { id: '3', value: doctorData?.experience_display || 0, label: 'EXPERIENCE' },
        ];
    }, [doctorData]);

    const specializations = useMemo(
        () => doctorData?.specialized_therapies || [],
        [doctorData]
    );

    const aboutText = useMemo(() => doctorData?.about || '', [doctorData]);
    const shouldTruncate = aboutText.length > 150;

    const truncatedAbout = useMemo(() => {
        if (!shouldTruncate || showFullAbout) return aboutText;
        return `${aboutText.substring(0, 150)}`;
    }, [aboutText, shouldTruncate, showFullAbout]);

    // Data Fetching
    const fetchDoctorData = useCallback(async (id: string, isRefresh = false) => {
        if (!id) {
            setError('Doctor ID not found');
            setLoading(false);
            return;
        }

        try {
            if (!isRefresh) setLoading(true);
            setError(null);

            const response = await getDoctorSlots({ id });

            if (response?.data) {

                setDoctorData(response.data);
            } else {
                setError('Failed to load doctor data');
            }
        } catch (err) {
            console.error('Fetch Doctor Error:', err);
            setError('Unable to load doctor profile. Please try again.');
        } finally {
            setLoading(false);
            if (isRefresh) setRefreshing(false);
        }
    }, []);


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
            showSuccessToast(error?.message || 'Failed to update favourite status', 'error')

            console.log(
                'FAVOURITE ERROR =>',
                error,
            );
        }
    };

    const handleRefresh = useCallback(() => {
        if (!doctorId) return;
        setRefreshing(true);
        fetchDoctorData(doctorId, true);
    }, [doctorId, fetchDoctorData]);


    useEffect(() => {
        if (doctorData) {
            setIsFavourite(
                doctorData.is_favorite,
            );
        }
    }, [doctorData]);
    // Effects
    useEffect(() => {
        if (doctorId) {
            fetchDoctorData(doctorId);
        } else {
            setLoading(false);
            setError('No doctor selected');
        }
    }, [doctorId, fetchDoctorData]);

    // Handlers
    const handleBookAppointment = useCallback(() => {
        if (doctorData) {
            navigation.navigate('DoctorSlot', { doctorData });
        }
    }, [navigation, doctorData]);

    const handleToggleAbout = useCallback(() => {
        setShowFullAbout(prev => !prev);
    }, []);

    const scaleAnim = useRef(
        new Animated.Value(1),
    ).current;

    const animateHeart = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.3,
                duration: 120,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 120,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const onFavouritePress = () => {
        animateHeart();
        handleFavourite();
    };

    // Loading State
    // if (loading) {
    //     return (
    //         <SafeAreaView style={styles.container}>
    //             <StatusBar backgroundColor="#F3FAF7" barStyle="dark-content" />
    //             <LoadingSpinner message="Loading doctor profile..." />
    //         </SafeAreaView>
    //     );
    // }

    // Error State
    // if (error || !doctorData) {
    //     return (
    //         <SafeAreaView style={styles.container}>
    //             <StatusBar backgroundColor="#F3FAF7" barStyle="dark-content" />
    //             <View style={styles.errorContainer}>
    //                 <Ionicons name="alert-circle-outline" size={64} color={Colors.primaryColor} />
    //                 <Text style={styles.errorText}>{error || 'Doctor not found'}</Text>
    //                 <TouchableOpacity style={styles.retryBtn} onPress={handleRefresh}>
    //                     <Text style={styles.retryText}>Retry</Text>
    //                 </TouchableOpacity>
    //             </View>
    //         </SafeAreaView>
    //     );
    // }

    // Main Render
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#F3FAF7" barStyle="dark-content" />

            {/* Header */}
            <View style={styles.headerTop}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => navigation.goBack()}
                    style={styles.iconBtn}
                >
                    <Image source={Images.backIcon} style={styles.backIcon} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Doctor Profile</Text>



                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.iconBtn}
                    onPress={onFavouritePress}>
                    <Animated.View
                        style={{
                            transform: [{ scale: scaleAnim }],
                        }}>
                        <Ionicons
                            name={
                                isFavourite
                                    ? 'heart'
                                    : 'heart-outline'
                            }
                            size={24}
                            color={
                                isFavourite
                                    ? '#FF3B30'
                                    : Colors.primaryColor
                            }
                        />
                    </Animated.View>
                </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView
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
                        {doctorData?.profile_image?.url ? (
                            <Image
                                source={{ uri: doctorData?.profile_image.url }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View style={styles.avatarFallback}>
                                <Text style={styles.avatarLetter}>
                                    {doctorData?.full_name?.charAt(0)?.toUpperCase() || ''}
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text numberOfLines={1} style={styles.doctorName}>
                        {doctorData?.full_name || 'Doctor'}
                    </Text>

                    <Text numberOfLines={1} style={styles.speciality}>
                        {doctorData?.designation || 'Medical Specialist'}
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
                    <Text style={styles.sectionTitle}>Specializations</Text>
                    <SpecializationTags therapies={specializations} />
                </View>

                {/* Reviews Section */}
                <View style={styles.section}>
                    <View style={styles.reviewHeader}>
                        <Text style={styles.sectionTitle}>Patient Reviews</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAll}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {REVIEWS.map(review => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.priceContainer}>
                    <Text style={styles.feeText}>Consult Fee</Text>
                    <Text numberOfLines={1} adjustsFontSizeToFit style={styles.price}>
                        Rs. {doctorData?.consultation_fee || 0}
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

// Sample reviews data (move to separate file in production)
const REVIEWS = [
    {
        id: '1',
        name: 'Rohan Mishra',
        image: Images.doctorImage,
        review: 'Dr. Arjun was incredibly thorough and took the time to explain everything clearly. Highly recommended!',
        time: '2 days ago',
    },
];

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