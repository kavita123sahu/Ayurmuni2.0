import React, { memo, useEffect, useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    StatusBar,
    RefreshControl,
    Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import { Colors } from '../../common/Colors';
import { Fonts } from '../../common/Fonts';
import { getDoctorSlots } from '../../services/ConsultServce';
import * as _CONSULT_SERVICES from '../../services/ConsultServce';
import { getReviewsAll } from '../../services/ProductServices';
import AppHeader from '../../components/AppHeader';
import ReviewSection from '../../components/ReviewSecton';
import { requireAuth } from '../../services/guestAuth';
import { showSuccessToast } from '../../config/Key';
import TablerIcon, { TablerIconName } from '../../components/TablerIcon';
import { RupeeAmount } from '../../utils/currencyUtils';
import {
    getDoctorId,
    getDoctorFavoriteState,
    getFavoriteStateFromToggleResponse,
    getDoctorDisplayName,
    getDoctorRating,
    formatDoctorExperience,
} from '../../utils/doctorUtils';

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

const MODE_META: Record<
    string,
    { label: string; icon: TablerIconName; bg: string; color: string }
> = {
    video: {
        label: 'Video',
        icon: 'video',
        bg: '#E0F2FE',
        color: '#0369A1',
    },
    chat: {
        label: 'Chat',
        icon: 'message',
        bg: '#F3E8FF',
        color: '#7E22CE',
    },
    audio: {
        label: 'Audio',
        icon: 'phone',
        bg: '#ECFDF5',
        color: '#047857',
    },
    voice: {
        label: 'Audio',
        icon: 'phone',
        bg: '#ECFDF5',
        color: '#047857',
    },
    in_person: {
        label: 'Clinic',
        icon: 'building',
        bg: '#FEF3C7',
        color: '#B45309',
    },
    clinic: {
        label: 'Clinic',
        icon: 'building',
        bg: '#FEF3C7',
        color: '#B45309',
    },
};

const formatEarliestDate = (value?: string | null) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

const toLabelList = (value: any): string[] => {
    if (value == null || value === '') return [];
    if (Array.isArray(value)) {
        return value
            .map(item => {
                if (typeof item === 'string') return item.trim();
                if (item?.name) return String(item.name).trim();
                if (item?.title) return String(item.title).trim();
                if (item?.label) return String(item.label).trim();
                return '';
            })
            .filter(Boolean);
    }
    if (typeof value === 'string') {
        return value
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
    }
    return [];
};

const resolveDoctorSpecializations = (doctor: any): string[] => {
    const candidates = [
        doctor?.doctor_specialization,
        doctor?.specializations,
        doctor?.specialization,
        doctor?.specialization_name,
        doctor?.speciality,
        doctor?.specialty,
    ];
    for (const c of candidates) {
        const list = toLabelList(c);
        if (list.length) return list;
    }
    return [];
};

const resolveDoctorHealthDiseases = (doctor: any): string[] =>
    toLabelList(doctor?.health_diseases);

const resolveProfileImageUri = (doctor: any): string => {
    const img = doctor?.profile_image;
    if (!img) return '';
    if (typeof img === 'string') return img;
    return String(img?.url || img?.uri || img?.media_url || '').trim();
};

const resolveConsultationModes = (doctor: any): string[] => {
    const raw =
        doctor?.consultation_modes ||
        doctor?.consultation_mode ||
        doctor?.modes ||
        [];
    if (Array.isArray(raw)) {
        return raw.map(m => String(m).toLowerCase().trim()).filter(Boolean);
    }
    if (typeof raw === 'string') {
        return raw
            .split(',')
            .map(s => s.toLowerCase().trim())
            .filter(Boolean);
    }
    return [];
};

const resolveLanguages = (doctor: any): string[] => {
    const list = toLabelList(
        doctor?.languages_spoken ||
        doctor?.preferred_languages ||
        doctor?.languages ||
        doctor?.language,
    );
    return list;
};

/* -------------------------------------------------------------------------- */
/*                              REUSABLE COMPONENTS                           */
/* -------------------------------------------------------------------------- */

const ChipRow = memo(
    ({
        items,
        tone = 'green',
    }: {
        items: string[];
        tone?: 'green' | 'amber' | 'blue' | 'slate';
    }) => {
        if (!items?.length) return null;
        const toneStyle =
            tone === 'amber'
                ? styles.tagAmber
                : tone === 'blue'
                    ? styles.tagBlue
                    : tone === 'slate'
                        ? styles.tagSlate
                        : styles.tagGreen;
        const textStyle =
            tone === 'amber'
                ? styles.tagAmberText
                : tone === 'blue'
                    ? styles.tagBlueText
                    : tone === 'slate'
                        ? styles.tagSlateText
                        : styles.tagGreenText;

        return (
            <View style={styles.tagsWrapper}>
                {items.map((item, index) => (
                    <View key={`${item}-${index}`} style={[styles.tag, toneStyle]}>
                        <Text style={[styles.tagText, textStyle]}>{item}</Text>
                    </View>
                ))}
            </View>
        );
    },
);

/* -------------------------------------------------------------------------- */
/*                                MAIN SCREEN                                 */
/* -------------------------------------------------------------------------- */

const DoctorProfile = ({ navigation, route }: any) => {
    const rawDoctorParam =
        route?.params?.doctorData ??
        route?.params?.doctor ??
        route?.params?.doctorId ??
        route?.params?.id;

    const doctorData = useMemo(() => {
        if (rawDoctorParam == null || rawDoctorParam === '') return null;
        if (typeof rawDoctorParam === 'string' || typeof rawDoctorParam === 'number') {
            const id = String(rawDoctorParam).trim();
            return id ? { id, doctor_id: id } : null;
        }
        if (typeof rawDoctorParam === 'object') {
            const id = String(
                rawDoctorParam.id ??
                rawDoctorParam.doctor_id ??
                rawDoctorParam.doctorId ??
                '',
            ).trim();
            if (!id && !rawDoctorParam.full_name && !rawDoctorParam.doctor_name) {
                return rawDoctorParam;
            }
            return {
                ...rawDoctorParam,
                id: id || rawDoctorParam.id,
                doctor_id:
                    rawDoctorParam.doctor_id ||
                    rawDoctorParam.doctorId ||
                    id ||
                    rawDoctorParam.id,
            };
        }
        return null;
    }, [rawDoctorParam]);

    const insets = useSafeAreaInsets();
    const footerBottomPad = Math.max(insets.bottom, 8);

    const [refreshing, setRefreshing] = useState(false);
    const [showFullAbout, setShowFullAbout] = useState(false);
    const [isFavourite, setIsFavourite] = useState(
        getDoctorFavoriteState(doctorData),
    );
    const [showAllConditions, setShowAllConditions] = useState(false);

    const [doctorDetails, setDoctorDetails] = useState<any>(null);
    const [patientReviews, setPatientReviews] = useState<any[] | null>(null);

    const doctor = useMemo(
        () => ({
            ...(doctorData && typeof doctorData === 'object' ? doctorData : {}),
            ...doctorDetails,
        }),
        [doctorData, doctorDetails],
    );

    const doctorName = useMemo(() => getDoctorDisplayName(doctor), [doctor]);
    const ratingValue = useMemo(() => getDoctorRating(doctor), [doctor]);
    const profileImageUri = useMemo(() => resolveProfileImageUri(doctor), [doctor]);

    const experienceLabel = useMemo(() => {
        const raw =
            doctor?.experience_display ||
            doctor?.experience_years ||
            doctor?.experience ||
            0;
        return formatDoctorExperience(raw);
    }, [doctor]);

    const reviewCount = useMemo(
        () => Number(doctor?.total_reviews || patientReviews?.length || 0),
        [doctor?.total_reviews, patientReviews],
    );

    const qualification = useMemo(
        () =>
            String(
                doctor?.qualification ||
                doctor?.designation ||
                doctor?.degree ||
                '',
            ).trim(),
        [doctor],
    );

    const locationLabel = useMemo(() => {
        const city = String(doctor?.city || '').trim();
        const state = String(doctor?.state || '').trim();
        if (city && state) return `${city}, ${state}`;
        return state || '';
    }, [doctor]);

    const isVerified = Boolean(doctor?.is_verified);
    const hasAvailability = Boolean(doctor?.has_availability);
    const slotsCount = Number(doctor?.available_slots_count || 0);
    const earliestDate = formatEarliestDate(doctor?.earliest_available_date);

    const consultationModes = useMemo(
        () => resolveConsultationModes(doctor),
        [doctor],
    );
    const languages = useMemo(() => resolveLanguages(doctor), [doctor]);
    const specializations = useMemo(
        () => resolveDoctorSpecializations(doctor),
        [doctor],
    );
    const healthDiseases = useMemo(
        () => resolveDoctorHealthDiseases(doctor),
        [doctor],
    );

    const visibleConditions = showAllConditions
        ? healthDiseases
        : healthDiseases.slice(0, 6);
    const hiddenConditions = Math.max(0, healthDiseases.length - 6);

    const consultFee = doctor?.consultation_fee;
    const followupFee = doctor?.followup_fee;

    const aboutText = useMemo(
        () =>
            String(doctor?.bio || doctor?.about || doctor?.description || '')
                .replace(/\r\n/g, '\n')
                .trim(),
        [doctor?.bio, doctor?.about, doctor?.description],
    );
    const shouldTruncate = aboutText.length > 160;
    const truncatedAbout = useMemo(() => {
        if (!shouldTruncate || showFullAbout) return aboutText;
        return `${aboutText.substring(0, 150)}`;
    }, [aboutText, shouldTruncate, showFullAbout]);

    const reviews = useMemo(() => {
        if (patientReviews !== null) return patientReviews;
        if (Array.isArray(doctor?.reviews)) return doctor.reviews;
        return [];
    }, [patientReviews, doctor?.reviews]);

    const pickDoctorField = useCallback(
        (...keys: string[]) => {
            for (const key of keys) {
                const value = doctor?.[key];
                if (value == null) continue;
                if (typeof value === 'string' && value.trim()) return value.trim();
                if (typeof value === 'number' && Number.isFinite(value)) {
                    return String(value);
                }
            }
            return '';
        },
        [doctor],
    );

    const socialAccounts = useMemo(() => {
        const social =
            doctor?.social_media ||
            doctor?.social_links ||
            doctor?.social ||
            doctor?.socials ||
            {};
        const entries: {
            label: string;
            url: string;
            icon: 'website' | 'facebook' | 'instagram' | 'x' | 'linkedin' | 'youtube';
        }[] = [
                {
                    label: 'Website',
                    icon: 'website',
                    url:
                        pickDoctorField('website', 'website_url', 'web_url') ||
                        String(social?.website || social?.web || ''),
                },
                {
                    label: 'Facebook',
                    icon: 'facebook',
                    url:
                        pickDoctorField('facebook', 'facebook_url') ||
                        String(social?.facebook || social?.fb || ''),
                },
                {
                    label: 'Instagram',
                    icon: 'instagram',
                    url:
                        pickDoctorField('instagram', 'instagram_url') ||
                        String(social?.instagram || social?.ig || ''),
                },
                {
                    label: 'X',
                    icon: 'x',
                    url:
                        pickDoctorField('twitter', 'twitter_url', 'x_url') ||
                        String(social?.twitter || social?.x || ''),
                },
                {
                    label: 'LinkedIn',
                    icon: 'linkedin',
                    url:
                        pickDoctorField('linkedin', 'linkedin_url') ||
                        String(social?.linkedin || ''),
                },
                {
                    label: 'YouTube',
                    icon: 'youtube',
                    url:
                        pickDoctorField('youtube', 'youtube_url') ||
                        String(social?.youtube || ''),
                },
            ];
        return entries.filter(item => String(item.url || '').trim());
    }, [doctor, pickDoctorField]);

    const getDoctorDetails = useCallback(async () => {
        const id =
            getDoctorId(doctorData) || doctorData?.id || doctorData?.doctor_id;
        if (!id) return;
        try {
            const res = await getDoctorSlots({ id: String(id) });
            if (res?.data) {
                setDoctorDetails(res?.data);
            } else if (res?.success === false) {
                showSuccessToast(res?.message || 'Doctor not found', 'error');
            }
        } catch (error) {
            console.log('DOCTOR DETAILS ERROR =>', error);
        }
    }, [doctorData]);

    const fetchDoctorReviews = useCallback(async () => {
        const id =
            getDoctorId(doctorData) || doctorData?.id || doctorData?.doctor_id;
        if (!id) return;
        try {
            const res = await getReviewsAll({
                entity_type: 'doctor',
                doctor_id: String(id),
            });
            const list =
                res?.data?.results ||
                res?.data?.reviews ||
                res?.data ||
                [];
            setPatientReviews(Array.isArray(list) ? list : []);
        } catch (error) {
            console.log('DOCTOR REVIEWS ERROR =>', error);
        }
    }, [doctorData]);

    useEffect(() => {
        const id =
            getDoctorId(doctorData) || doctorData?.id || doctorData?.doctor_id;
        if (id) {
            getDoctorDetails();
            fetchDoctorReviews();
        }
    }, [doctorData, getDoctorDetails, fetchDoctorReviews]);

    const handleFavourite = async () => {
        const doctorId = getDoctorId(doctor);
        if (!doctorId) {
            showSuccessToast('Doctor unavailable', 'error');
            return;
        }
        if (!(await requireAuth('Please login to save favourite doctors'))) {
            return;
        }

        const prev = isFavourite;
        setIsFavourite(!prev);

        try {
            const response = await _CONSULT_SERVICES.ToggleFavDoctor(
                doctorId,
                'POST',
            );
            if (!response?.success) {
                setIsFavourite(prev);
                showSuccessToast(
                    response?.message || 'Failed to update favourite',
                    'error',
                );
                return;
            }
            const next = getFavoriteStateFromToggleResponse(response);
            if (next !== undefined) {
                setIsFavourite(next);
            } else {
                showSuccessToast(response?.message || 'Favourite updated', 'success');
            }
        } catch {
            setIsFavourite(prev);
            showSuccessToast('Failed to update favourite status', 'error');
        }
    };

    const handleRefresh = useCallback(async () => {
        try {
            setRefreshing(true);
            await Promise.all([getDoctorDetails(), fetchDoctorReviews()]);
        } finally {
            setRefreshing(false);
        }
    }, [getDoctorDetails, fetchDoctorReviews]);

    useEffect(() => {
        setIsFavourite(getDoctorFavoriteState(doctor));
    }, [
        doctor?.is_favorite,
        doctor?.is_favourite,
        doctor?.id,
        doctor?.doctor_id,
    ]);

    const handleBookAppointment = useCallback(async () => {
        if (!(await requireAuth('Please login to book an appointment'))) return;
        if (doctorDetails) {
            navigation.navigate('DoctorSlot', { doctorDetails });
        }
    }, [navigation, doctorDetails]);

    const openSocial = useCallback((url: string) => {
        const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
        Linking.openURL(href).catch(() => { });
    }, []);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

            <AppHeader
                title="Doctor Details"
                onLeftPress={() => navigation.goBack()}
                rightIconName={isFavourite ? 'heart-filled' : 'heart'}
                rightIconColor={isFavourite ? Colors.primaryColor : '#0F172A'}
                onRightPress={handleFavourite}
            />

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
                {/* Eye-catching hero */}
                <LinearGradient
                    colors={['#E8F8F2', '#FFFFFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.heroCard}
                >
                    <View style={styles.heroRow}>
                        <View style={styles.avatarCol}>
                            <View style={styles.avatarRing}>
                                {profileImageUri ? (
                                    <Image
                                        source={{ uri: profileImageUri }}
                                        style={styles.avatar}
                                    />
                                ) : (
                                    <View style={styles.avatarFallback}>
                                        <Text style={styles.avatarLetter}>
                                            {doctorName?.charAt(0)?.toUpperCase() || 'D'}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            {isVerified ? (
                                <View style={styles.verifiedBadge}>
                                    <TablerIcon name="shield" size={11} color="#FFFFFF" />
                                    <Text style={styles.verifiedText}>Verified</Text>
                                </View>
                            ) : null}
                        </View>

                        <View style={styles.heroInfo}>
                            <View style={styles.metaRow}>
                                {ratingValue > 0 ? (
                                    <View style={styles.ratingPill}>
                                        <TablerIcon
                                            name="star-filled"
                                            size={10}
                                            color="#FFFFFF"
                                        />
                                        <Text style={styles.ratingText}>
                                            {ratingValue.toFixed(1)}
                                        </Text>
                                    </View>
                                ) : null}
                                {reviewCount > 0 ? (
                                    <Text style={styles.reviewCount}>
                                        {reviewCount}{' '}
                                        {reviewCount === 1 ? 'review' : 'reviews'}
                                    </Text>
                                ) : null}
                            </View>

                            <Text style={styles.doctorName} numberOfLines={2}>
                                {doctorName}
                            </Text>

                            {!!qualification && (
                                <Text style={styles.qualification} numberOfLines={2}>
                                    {qualification}
                                </Text>
                            )}

                            <View style={styles.heroChipRow}>
                                <View style={styles.expChip}>
                                    <TablerIcon
                                        name="briefcase"
                                        size={11}
                                        color={Colors.primaryColor}
                                    />
                                    <Text style={styles.expChipText}>{experienceLabel}</Text>
                                </View>
                                {!!locationLabel && (
                                    <View style={styles.expChip}>
                                        <TablerIcon name="map-pin" size={11} color={Colors.primaryColor} />
                                        <Text style={styles.expChipText} numberOfLines={1}>
                                            {locationLabel}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Fees row */}
                    <View style={styles.feeStrip}>
                        <View style={styles.feeBlock}>
                            <Text style={styles.feeLabel}>Consultation</Text>
                            <RupeeAmount
                                value={consultFee}
                                style={styles.feeValue}
                                iconSize={16}
                                iconColor={Colors.primaryColor}
                            />
                        </View>
                        {/* {!!followupFee && Number(followupFee) > 0 ? (
                            <>
                                <View style={styles.feeDivider} />
                                <View style={styles.feeBlock}>
                                    <Text style={styles.feeLabel}>Follow-up</Text>
                                    <RupeeAmount
                                        value={followupFee}
                                        style={styles.followupValue}
                                        iconSize={14}
                                        iconColor="#475569"
                                    />
                                </View>
                            </>
                        ) : null} */}

                        {consultationModes.length > 0 ? (
                            <>
                                <View style={styles.feeDivider} />
                                <View style={styles.feeBlock}>
                                    <Text style={styles.feeLabel}>Consult via</Text>
                                    <View style={styles.modeRow}>
                                        <View
                                            key="consultation"
                                            style={[
                                                styles.modeChip,
                                                { backgroundColor: "#f8fafc", borderRadius: 8 },
                                            ]}
                                        >
                                            <TablerIcon
                                                name="video"
                                                size={14}
                                                color="#475569"
                                            />
                                            <Text
                                                style={[
                                                    styles.modeChipText,
                                                    { color: "#475569" },
                                                ]}
                                            >
                                                Video Consult
                                            </Text>
                                        </View>
                                        {/* {consultationModes.map(mode => {
                                            const meta = MODE_META[mode] || {
                                                label: mode,
                                                icon: 'stethoscope' as TablerIconName,
                                                bg: '#F1F5F9',
                                                color: '#475569',
                                            };
                                            return (
                                                <View
                                                    key={mode}
                                                    style={[
                                                        styles.modeChip,
                                                        { backgroundColor: meta.bg },
                                                    ]}
                                                >
                                                    <TablerIcon
                                                        name={meta.icon}
                                                        size={14}
                                                        color={meta.color}
                                                    />
                                                    <Text
                                                        style={[
                                                            styles.modeChipText,
                                                            { color: meta.color },
                                                        ]}
                                                    >
                                                        {meta.label}
                                                    </Text>
                                                </View>
                                            );
                                        })} */}
                                    </View>
                                </View>
                            </>
                        ) : null}
                    </View>
                </LinearGradient>

                {/* Availability banner */}
                {(hasAvailability || slotsCount > 0 || earliestDate) && (
                    <LinearGradient
                        colors={
                            hasAvailability
                                ? ['#ECFDF5', '#D1FAE5']
                                : ['#FEF3C7', '#FDE68A']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.availBanner}
                    >
                        <View style={styles.availLeft}>
                            <View
                                style={[
                                    styles.availDot,
                                    {
                                        backgroundColor: hasAvailability
                                            ? '#16A34A'
                                            : '#D97706',
                                    },
                                ]}
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.availTitle}>
                                    {hasAvailability
                                        ? 'Available for booking'
                                        : 'Limited availability'}
                                </Text>
                                <Text style={styles.availSub} numberOfLines={1}>
                                    {[
                                        slotsCount > 0
                                            ? `${slotsCount} slots open`
                                            : null,
                                        earliestDate
                                            ? `Next: ${earliestDate}`
                                            : null,
                                    ]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </Text>
                            </View>
                        </View>
                        <TablerIcon
                            name="calendar"
                            size={18}
                            color={hasAvailability ? '#15803D' : '#B45309'}
                        />
                    </LinearGradient>
                )}

                {/* Modes + languages */}
                {(consultationModes.length > 0 || languages.length > 0) && (
                    <View style={styles.card}>
                        {/* {consultationModes.length > 0 ? (
                            <>
                                <Text style={styles.sectionHeader}>Consult via</Text>
                                <View style={styles.modeRow}>
                                    {consultationModes.map(mode => {
                                        const meta = MODE_META[mode] || {
                                            label: mode,
                                            icon: 'stethoscope' as TablerIconName,
                                            bg: '#F1F5F9',
                                            color: '#475569',
                                        };
                                        return (
                                            <View
                                                key={mode}
                                                style={[
                                                    styles.modeChip,
                                                    { backgroundColor: meta.bg },
                                                ]}
                                            >
                                                <TablerIcon
                                                    name={meta.icon}
                                                    size={14}
                                                    color={meta.color}
                                                />
                                                <Text
                                                    style={[
                                                        styles.modeChipText,
                                                        { color: meta.color },
                                                    ]}
                                                >
                                                    {meta.label}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </>
                        ) : null} */}

                        {languages.length > 0 ? (
                            <View
                                style={
                                    consultationModes.length > 5
                                        ? styles.langBlock
                                        : undefined
                                }
                            >
                                <Text style={styles.sectionHeader}>Languages</Text>
                                <ChipRow items={languages} tone="slate" />
                            </View>
                        ) : null}
                    </View>
                )}

                {/* Stats */}
                <View style={styles.trustStrip}>
                    <View style={styles.trustItem}>
                        <View style={[styles.trustIcon, { backgroundColor: '#FEF3C7' }]}>
                            <TablerIcon name="briefcase" size={15} color="#B45309" />
                        </View>
                        <Text style={styles.trustValue}>{experienceLabel}</Text>
                        <Text style={styles.trustLabel}>Experience</Text>
                    </View>
                    <View style={styles.trustDivider} />
                    <View style={styles.trustItem}>
                        <View style={[styles.trustIcon, { backgroundColor: '#ECFDF5' }]}>
                            <TablerIcon name="star-filled" size={15} color="#15803D" />
                        </View>
                        <Text style={styles.trustValue}>
                            {ratingValue > 0 ? ratingValue.toFixed(1) : '—'}
                        </Text>
                        <Text style={styles.trustLabel}>Rating</Text>
                    </View>
                    <View style={styles.trustDivider} />
                    <View style={styles.trustItem}>
                        <View style={[styles.trustIcon, { backgroundColor: '#E0F2FE' }]}>
                            <TablerIcon name="message" size={15} color="#0369A1" />
                        </View>
                        <Text style={styles.trustValue}>{reviewCount}</Text>
                        <Text style={styles.trustLabel}>Reviews</Text>
                    </View>
                </View>

                {/* About */}
                <View style={styles.card}>
                    <View style={styles.sectionTitleRow}>
                        <View style={[styles.sectionIcon, { backgroundColor: '#EAF8F4' }]}>
                            <TablerIcon name="notes" size={14} color={Colors.primaryColor} />
                        </View>
                        <Text style={styles.sectionHeaderInline}>About doctor</Text>
                    </View>
                    {aboutText ? (
                        <Text style={styles.aboutText}>
                            {truncatedAbout}
                            {shouldTruncate ? (
                                <Text
                                    onPress={() => setShowFullAbout(v => !v)}
                                    style={styles.readMore}
                                >
                                    {showFullAbout ? ' less' : '... more'}
                                </Text>
                            ) : null}
                        </Text>
                    ) : (
                        <Text style={styles.emptyText}>No bio available yet.</Text>
                    )}
                </View>

                {specializations.length > 0 ? (
                    <View style={styles.card}>
                        <View style={styles.sectionTitleRow}>
                            <View style={[styles.sectionIcon, { backgroundColor: '#EEF2FF' }]}>
                                <TablerIcon name="stethoscope" size={14} color="#4F46E5" />
                            </View>
                            <Text style={styles.sectionHeaderInline}>Specializations</Text>
                        </View>
                        <ChipRow items={specializations} tone="blue" />
                    </View>
                ) : null}

                {healthDiseases.length > 0 ? (
                    <View style={styles.card}>
                        <View style={styles.sectionTitleRow}>
                            <View style={[styles.sectionIcon, { backgroundColor: '#EAF8F4' }]}>
                                <TablerIcon
                                    name="heart-handshake"
                                    size={14}
                                    color={Colors.primaryColor}
                                />
                            </View>
                            <Text style={styles.sectionHeaderInline}>
                                Treats conditions
                            </Text>
                            <Text style={styles.countHint}>{healthDiseases.length}</Text>
                        </View>
                        <ChipRow items={visibleConditions} tone="green" />
                        {hiddenConditions > 0 ? (
                            <TouchableOpacity
                                onPress={() => setShowAllConditions(v => !v)}
                                style={styles.moreBtn}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.moreBtnText}>
                                    {showAllConditions
                                        ? 'Show less'
                                        : `+${hiddenConditions} more`}
                                </Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                ) : null}

                {(locationLabel || qualification || socialAccounts.length > 0) && (
                    <View style={styles.card}>
                        <View style={styles.sectionTitleRow}>
                            <View style={[styles.sectionIcon, { backgroundColor: '#F1F5F9' }]}>
                                <TablerIcon
                                    name="clipboard-list"
                                    size={14}
                                    color="#475569"
                                />
                            </View>
                            <Text style={styles.sectionHeaderInline}>Quick info</Text>
                        </View>
                        <View style={styles.specGrid}>
                            {!!qualification && (
                                <View style={[styles.specCell, styles.specCellFull]}>
                                    <Text style={styles.specLabel}>Qualification</Text>
                                    <Text style={styles.specValue}>{qualification}</Text>
                                </View>
                            )}
                            {!!locationLabel && (
                                <View style={[styles.specCell, styles.specCellLeft]}>
                                    <Text style={styles.specLabel}>Location</Text>
                                    <Text style={styles.specValue}>{locationLabel}</Text>
                                </View>
                            )}
                            {!!experienceLabel && (
                                <View style={styles.specCell}>
                                    <Text style={styles.specLabel}>Experience</Text>
                                    <Text style={styles.specValue}>{experienceLabel}</Text>
                                </View>
                            )}
                        </View>
                        {socialAccounts.length > 0 ? (
                            <View style={styles.socialRow}>
                                {socialAccounts.map(item => (
                                    <TouchableOpacity
                                        key={item.label}
                                        style={styles.socialBtn}
                                        activeOpacity={0.8}
                                        onPress={() => openSocial(item.url)}
                                    >
                                        <TablerIcon
                                            name={item.icon}
                                            size={16}
                                            color={Colors.primaryColor}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : null}
                    </View>
                )}

                {/* Reviews — same UI as Product Details */}
                <View style={styles.card}>
                    <ReviewSection
                        navigation={navigation}
                        reviews={reviews}
                        entityType="doctor"
                        doctorId={String(
                            getDoctorId(doctor) ||
                            doctorData?.id ||
                            doctorData?.doctor_id ||
                            '',
                        )}
                        title="Ratings & reviews"
                    />
                </View>

                <View style={{ height: 108 }} />
            </ScrollView>

            <View style={[styles.stickyBar, { paddingBottom: footerBottomPad }]}>
                <View style={styles.stickyRow}>
                    <View style={styles.stickyPriceBox}>
                        <RupeeAmount
                            value={consultFee}
                            style={styles.stickyPrice}
                            iconSize={16}
                            iconColor={Colors.primaryColor}
                        />
                        <Text style={styles.stickyHint}>
                            {hasAvailability && slotsCount > 0
                                ? `${slotsCount} slots`
                                : 'Consult fee'}
                        </Text>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleBookAppointment}
                        disabled={!doctorDetails}
                        style={styles.primaryBtnWrap}
                    >
                        <LinearGradient
                            colors={
                                doctorDetails
                                    ? ['#0D614E', '#14937A']
                                    : ['#6c9180', '#6c9180']
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.primaryBtn}
                        >
                            <TablerIcon name="calendar" size={16} color="#FFFFFF" />
                            <Text style={styles.primaryBtnText}>Book appointment</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default DoctorProfile;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F4F7F6',
    },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 8 },

    heroCard: {
        paddingHorizontal: 14,
        paddingTop: 14,
        paddingBottom: 12,
    },
    heroRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
    },
    avatarCol: {
        alignItems: 'center',
        gap: 8,
    },
    avatarRing: {
        width: 96,
        height: 96,
        borderRadius: 22,
        padding: 3,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#A7E0CF',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 18,
        resizeMode: 'cover',
    },
    avatarFallback: {
        flex: 1,
        borderRadius: 18,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarLetter: {
        fontSize: 32,
        color: '#FFFFFF',
        fontFamily: Fonts.PoppinsBold,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.primaryColor,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
    },
    verifiedText: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#FFFFFF',
        includeFontPadding: false,
    },
    heroInfo: {
        flex: 1,
        minWidth: 0,
        paddingTop: 2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 4,
    },
    ratingPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#15803D',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 5,
        gap: 3,
    },
    ratingText: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#FFFFFF',
        includeFontPadding: false,
    },
    reviewCount: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
    },
    doctorName: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        lineHeight: 24,
        marginBottom: 2,
    },
    qualification: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
        color: '#475569',
        lineHeight: 17,
        marginBottom: 8,
    },
    heroChipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    expChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#ECF8F3',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    expChipText: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.primaryColor,
        includeFontPadding: false,
    },
    locChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FFF7ED',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        maxWidth: '70%',
    },
    locChipText: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#B45309',
        includeFontPadding: false,
        flexShrink: 1,
    },

    feeStrip: {
        marginTop: 14,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D7EBE3',
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    feeBlock: {
        flex: 1,
    },
    feeDivider: {
        width: 1,
        height: 32,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 12,
    },
    feeLabel: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
        marginBottom: 2,
    },
    feeValue: {
        fontSize: 20,
        fontFamily: Fonts.PoppinsBold,
        color: Colors.primaryColor,
        includeFontPadding: false,
    },
    followupValue: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#334155',
        includeFontPadding: false,
    },

    availBanner: {
        marginTop: 8,
        marginHorizontal: 10,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    availLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    availDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    availTitle: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#14532D',
        includeFontPadding: false,
    },
    availSub: {
        marginTop: 1,
        fontSize: 11,
        fontFamily: Fonts.PoppinsMedium,
        color: '#3F6212',
        includeFontPadding: false,
    },

    card: {
        marginTop: 8,
        marginHorizontal: 10,
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 12,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#E8EEF2',
    },
    sectionHeader: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        marginBottom: 8,
        includeFontPadding: false,
    },
    sectionHeaderInline: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        includeFontPadding: false,
        flex: 1,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    sectionIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countHint: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#94A3B8',
    },

    modeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    modeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    modeChipText: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        includeFontPadding: false,
    },
    langBlock: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#EEF2F0',
    },

    trustStrip: {
        marginTop: 8,
        marginHorizontal: 10,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#E8EEF2',
        paddingVertical: 12,
        paddingHorizontal: 6,
    },
    trustItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    trustIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    trustDivider: {
        width: StyleSheet.hairlineWidth,
        backgroundColor: '#E2E8F0',
        marginVertical: 4,
    },
    trustValue: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        includeFontPadding: false,
        textAlign: 'center',
    },
    trustLabel: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
        includeFontPadding: false,
    },

    aboutText: {
        fontSize: 12,
        lineHeight: 19,
        fontFamily: Fonts.PoppinsRegular,
        color: '#475569',
    },
    readMore: {
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 12,
    },
    emptyText: {
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsMedium,
    },

    tagsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    tag: {
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
    },
    tagGreen: {
        backgroundColor: '#F0FDFA',
        borderColor: '#99F6E4',
    },
    tagAmber: {
        backgroundColor: '#FFFBEB',
        borderColor: '#FDE68A',
    },
    tagBlue: {
        backgroundColor: '#EEF2FF',
        borderColor: '#C7D2FE',
    },
    tagSlate: {
        backgroundColor: '#F8FAFC',
        borderColor: '#E2E8F0',
    },
    tagText: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsMedium,
        includeFontPadding: false,
    },
    tagGreenText: { color: Colors.primaryColor },
    tagAmberText: { color: '#B45309' },
    tagBlueText: { color: '#4338CA' },
    tagSlateText: { color: '#475569' },
    moreBtn: {
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    moreBtnText: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.primaryColor,
    },

    specGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderWidth: 1,
        borderColor: '#EEF2F0',
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#F8FAF9',
    },
    specCell: {
        width: '50%',
        paddingHorizontal: 10,
        paddingVertical: 9,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#EEF2F0',
    },
    specCellLeft: {
        borderRightWidth: StyleSheet.hairlineWidth,
        borderRightColor: '#EEF2F0',
    },
    specCellFull: {
        width: '100%',
        borderRightWidth: 0,
    },
    specLabel: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
        marginBottom: 2,
        includeFontPadding: false,
    },
    specValue: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        lineHeight: 16,
    },
    socialRow: {
        marginTop: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    socialBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F0FDFA',
        borderWidth: 1,
        borderColor: '#CCFBF1',
        alignItems: 'center',
        justifyContent: 'center',
    },

    stickyBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#FFFFFF',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#E8F2EE',
        paddingTop: 8,
        paddingHorizontal: 12,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 8,
    },
    stickyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    stickyPriceBox: { minWidth: 88 },
    stickyPrice: {
        fontSize: 18,
        fontFamily: Fonts.PoppinsBold,
        color: Colors.primaryColor,
        includeFontPadding: false,
    },
    stickyHint: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
        includeFontPadding: false,
    },
    primaryBtnWrap: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    primaryBtn: {
        minHeight: 50,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 14,
    },
    primaryBtnText: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#FFFFFF',
    },
});
