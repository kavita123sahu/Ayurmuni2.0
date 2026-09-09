import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    TextInput,
    StatusBar,
    Dimensions,
    Platform,
    KeyboardAvoidingView,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../common/Fonts';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../common/Colors';
import { generateFutureDates } from '../../common/DataInterface';
import { groupSlotsByTime } from '../../hooks/useConsultData';
import { getDoctorSlots } from '../../services/ConsultServce';
import {
    getSlotStatusKey,
    isSameSlot,
    isSlotBookable,
    isSlotMissedOrExpired,
    isSlotSelectedInList,
    pickFirstBookableSlot,
    withSlotDate,
} from '../../utils/slotAvailabilityUtils';
import { useMedicalRecord, useMedicalUpload } from '../../hooks/usePatientData';
import PrescriptionUpload from './Uploadreport';
import TablerIcon, { TablerIconName } from '../../components/TablerIcon';
import { requireAuth } from '../../services/guestAuth';
import UploadRecordModal from '../../components/UploadRecordModal';
import AppHeader from '../../components/AppHeader';
import { showSuccessToast } from '../../config/Key';
import { RupeeAmount } from '../../utils/currencyUtils';
import {
    getDoctorDisplayName,
    getDoctorRating,
    formatDoctorExperience,
} from '../../utils/doctorUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(64, Math.max(54, Math.floor(SCREEN_WIDTH * 0.135)));
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.22);

const MODE_META: Record<
    string,
    { label: string; icon: TablerIconName; bg: string; color: string }
> = {
    video: { label: 'Video', icon: 'video', bg: '#E0F2FE', color: '#0369A1' },
    chat: { label: 'Chat', icon: 'message', bg: '#F3E8FF', color: '#7E22CE' },
    audio: { label: 'Audio', icon: 'phone', bg: '#ECFDF5', color: '#047857' },
    voice: { label: 'Audio', icon: 'phone', bg: '#ECFDF5', color: '#047857' },
};

const SECTION_META: Record<
    string,
    { icon: TablerIconName; color: string; bg: string }
> = {
    Morning: { icon: 'clock', color: '#D97706', bg: '#FFFBEB' },
    Afternoon: { icon: 'clock', color: '#0369A1', bg: '#E0F2FE' },
    Evening: { icon: 'clock', color: '#7E22CE', bg: '#F3E8FF' },
};

const resolveProfileImageUri = (doctor: any): string => {
    const img = doctor?.profile_image;
    if (!img) return '';
    if (typeof img === 'string') return img;
    return String(img?.url || img?.uri || img?.media_url || '').trim();
};

const DoctorSlot = (props: any) => {
    const { route, navigation } = props;
    const insets = useSafeAreaInsets();
    const footerBottomPad = Math.max(insets.bottom, 8);

    const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
    const { doctorDetails } = route?.params || {};

    const { patientsRecord, patientsList, fetchPatientsRecord } =
        useMedicalRecord();

    const {
        selectFile,
        CameraUpload,
        pickedFile,
        uploading,
        modalVisible,
        submitRecord,
        closeUploadModal,
    } = useMedicalUpload(fetchPatientsRecord, (recordId) => {
        setSelectedRecords(prev => [...prev, recordId]);
    });

    const [doctorDetailData, setDoctorDetailData] = useState<any>(null);
    const doctorInfo = useMemo(() => doctorDetails, [doctorDetails]);
    const doctor = useMemo(
        () => ({
            ...doctorInfo,
            ...doctorDetailData,
        }),
        [doctorInfo, doctorDetailData],
    );

    const doctorName = useMemo(() => getDoctorDisplayName(doctor), [doctor]);
    const ratingValue = useMemo(() => getDoctorRating(doctor), [doctor]);
    const profileImageUri = useMemo(
        () => resolveProfileImageUri(doctor),
        [doctor],
    );
    const experienceLabel = useMemo(() => {
        const raw =
            doctor?.experience_display ||
            doctor?.experience_years ||
            doctor?.experience ||
            0;
        return formatDoctorExperience(raw);
    }, [doctor]);
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
        return city || state || '';
    }, [doctor]);
    const reviewCount = Number(doctor?.total_reviews || 0);
    const isVerified = Boolean(doctor?.is_verified);
    const consultationModes = useMemo(() => {
        const raw = doctor?.consultation_modes || [];
        if (!Array.isArray(raw)) return [];
        return raw.map((m: any) => String(m).toLowerCase().trim()).filter(Boolean);
    }, [doctor]);

    const [monthOffset, setMonthOffset] = useState(0);
    const DAYS = useMemo(
        () =>
            generateFutureDates(monthOffset).filter(
                (item: any) => !item.isDisabled,
            ),
        [monthOffset],
    );

    const getTodayDate = () => {
        const todayEntry = DAYS.find((d: any) => d.isToday);
        if (todayEntry) return todayEntry.fullDate;
        const first = DAYS.find((d: any) => !d.isDisabled);
        if (first) return first.fullDate;
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const [selectedDate, setSelectedDate] = useState(getTodayDate());
    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [concern, setConcern] = useState('');
    const [slotsData, setSlotsData] = useState<any | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const dateScrollRef = useRef<ScrollView>(null);
    const mainScrollRef = useRef<ScrollView>(null);
    const concernSectionY = useRef(0);
    const pendingConcernScrollRef = useRef(false);
    const isFirstRender = useRef(true);
    const doctorIdParam = doctorDetails?.id;

    const monthLabel = useMemo(
        () =>
            new Date(
                new Date().getFullYear(),
                new Date().getMonth() + monthOffset,
            ).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        [monthOffset],
    );

    const scrollToConcernSection = useCallback(() => {
        const scroll = () => {
            mainScrollRef.current?.scrollTo({
                y: Math.max(0, concernSectionY.current - 16),
                animated: true,
            });
        };

        if (concernSectionY.current > 0) {
            requestAnimationFrame(scroll);
            return;
        }

        pendingConcernScrollRef.current = true;
        requestAnimationFrame(() => {
            setTimeout(scroll, 200);
        });
    }, []);

    const handleSelectSlot = useCallback(
        (slot: any) => {
            const bookableSlot = withSlotDate(slot, selectedDate);
            if (!isSlotBookable(bookableSlot)) return;
            setSelectedSlot(bookableSlot);
            scrollToConcernSection();
        },
        [scrollToConcernSection, selectedDate],
    );

    const handleConcernSectionLayout = useCallback(
        (y: number) => {
            concernSectionY.current = y;
            if (pendingConcernScrollRef.current && y > 0) {
                pendingConcernScrollRef.current = false;
                scrollToConcernSection();
            }
        },
        [scrollToConcernSection],
    );

    useEffect(() => {
        if (!doctorIdParam) console.warn('Doctor ID missing in route params');
    }, [doctorIdParam]);

    useEffect(() => {
        const todayIndex = DAYS.findIndex((item: any) => item.isToday);
        if (todayIndex >= 0) {
            setTimeout(() => {
                dateScrollRef.current?.scrollTo({
                    x: todayIndex * (CARD_WIDTH + 8),
                    animated: false,
                });
            }, 100);
        }
    }, [DAYS]);

    const fetchSlotsForDate = useCallback(
        async (date: string) => {
            if (!doctorIdParam || !date) return;
            try {
                setLoadingSlots(true);
                const resp = await getDoctorSlots({
                    id: doctorIdParam,
                    date,
                });
                const rawData = resp?.data;
                const slots = (rawData?.slots || []).map((slot: any) =>
                    withSlotDate(slot, date),
                );
                setSlotsData(rawData ? { ...rawData, slots } : null);
                if (rawData) setDoctorDetailData(rawData);
            } finally {
                setLoadingSlots(false);
            }
        },
        [doctorIdParam],
    );

    useEffect(() => {
        if (selectedDate && doctorIdParam) {
            fetchSlotsForDate(selectedDate);
        }
    }, [selectedDate, doctorIdParam, fetchSlotsForDate]);

    useFocusEffect(
        useCallback(() => {
            if (isFirstRender.current) {
                isFirstRender.current = false;
                return;
            }
            fetchSlotsForDate(selectedDate);
        }, [selectedDate, fetchSlotsForDate]),
    );

    const onRefresh = useCallback(async () => {
        try {
            setRefreshing(true);
            await fetchSlotsForDate(selectedDate);
        } finally {
            setRefreshing(false);
        }
    }, [selectedDate, fetchSlotsForDate]);

    const groupedSlots = useMemo(
        () => groupSlotsByTime(slotsData?.slots || []),
        [slotsData],
    );

    useEffect(() => {
        if (loadingSlots) return;

        const slots = slotsData?.slots || [];
        if (!slots.length) {
            if (selectedSlot) setSelectedSlot(null);
            return;
        }

        if (isSlotSelectedInList(selectedSlot, slots, selectedDate)) {
            return;
        }

        const firstAvailable = pickFirstBookableSlot(slots, selectedDate);
        if (firstAvailable) {
            pendingConcernScrollRef.current = true;
            setSelectedSlot(firstAvailable);
            scrollToConcernSection();
            return;
        }

        if (selectedSlot) setSelectedSlot(null);
    }, [
        slotsData,
        selectedDate,
        loadingSlots,
        selectedSlot,
        scrollToConcernSection,
    ]);

    const handleContinue = async () => {
        if (!(await requireAuth('Please login to book a consultation'))) return;
        if (!selectedSlot?.id) return;

        if (!isSlotBookable(selectedSlot)) {
            showSuccessToast(
                'This slot has expired. Please pick another time.',
                'error',
            );
            setSelectedSlot(null);
            return;
        }

        const selectedSlotObj = slotsData?.slots?.find(
            (s: any) => String(s.id) === String(selectedSlot?.id),
        );

        navigation.navigate('RazorpayScreen', {
            doctorInfo,
            doctorId: doctorIdParam,
            slotId: selectedSlot,
            date: selectedDate,
            selectedTime:
                selectedSlotObj?.displayTime ||
                selectedSlotObj?.start_time ||
                selectedSlot?.displayTime ||
                selectedSlot?.start_time,
            concern,
            patientsList,
            medical_record_ids: selectedRecords,
            medical_records: (patientsRecord || []).filter((item: any) =>
                selectedRecords.includes(String(item?.id)),
            ),
        });
    };

    const consultFee =
        selectedSlot?.amount ??
        doctor?.consultation_fee ??
        doctor?.consult_fee?.amount ??
        doctorDetails?.consultation_fee ??
        0;

    const canContinue =
        !loadingSlots &&
        groupedSlots.length > 0 &&
        !!selectedSlot &&
        isSlotBookable(withSlotDate(selectedSlot, selectedDate));

    const selectedTimeLabel =
        selectedSlot?.displayTime || selectedSlot?.start_time || '';

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

            <AppHeader
                title="Book Appointment"
                onLeftPress={() => props.navigation.goBack()}
            />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    ref={mainScrollRef}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.primaryColor]}
                            tintColor={Colors.primaryColor}
                        />
                    }
                >
                    {/* Compact doctor hero */}
                    <LinearGradient
                        colors={['#E8F8F2', '#FFFFFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.heroCard}
                    >
                        <View style={styles.heroRow}>
                            <View style={styles.avatarWrap}>
                                {profileImageUri ? (
                                    <Image
                                        source={{ uri: profileImageUri }}
                                        style={styles.avatar}
                                    />
                                ) : (
                                    <View style={styles.avatarFallback}>
                                        <Text style={styles.avatarLetter}>
                                            {doctorName?.charAt(0)?.toUpperCase() ||
                                                'D'}
                                        </Text>
                                    </View>
                                )}
                                {isVerified ? (
                                    <View style={styles.verifiedDot}>
                                        <TablerIcon
                                            name="shield"
                                            size={10}
                                            color="#FFFFFF"
                                        />
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
                                        <Text style={styles.metaMuted}>
                                            {reviewCount} reviews
                                        </Text>
                                    ) : null}
                                    <View style={styles.expChip}>
                                        <Text style={styles.expChipText}>
                                            {experienceLabel}
                                        </Text>
                                    </View>
                                </View>

                                <Text style={styles.doctorName} numberOfLines={2}>
                                    {doctorName}
                                </Text>

                                {!!qualification && (
                                    <Text
                                        style={styles.qualification}
                                        numberOfLines={1}
                                    >
                                        {qualification}
                                    </Text>
                                )}

                                {/* {!!locationLabel && (
                                    <View style={styles.locRow}>
                                        <TablerIcon
                                            name="map-pin"
                                            size={12}
                                            color="#B45309"
                                        />
                                        <Text
                                            style={styles.locText}
                                            numberOfLines={1}
                                        >
                                            {locationLabel}
                                        </Text>
                                    </View>
                                )} */}
                            </View>
                        </View>

                        {(consultationModes.length > 0 || !!consultFee) && (
                            <View style={styles.heroFooter}>
                                {consultationModes.length > 0 ? (
                                    <View style={styles.modeRow}>
                                        {consultationModes.map(mode => {
                                            if (mode !== 'video') return null;
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
                                                        size={12}
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
                                ) : (
                                    <View />
                                )}
                                <View style={styles.feeMini}>
                                    <Text style={styles.feeMiniLabel}>Fee</Text>
                                    <RupeeAmount
                                        value={
                                            consultFee ??
                                            doctor?.consultation_fee ??
                                            doctor?.consult_fee?.amount ??
                                            0
                                        }
                                        style={styles.feeMiniValue}
                                        iconSize={13}
                                        iconColor={Colors.primaryColor}
                                    />
                                </View>
                            </View>
                        )}
                    </LinearGradient>

                    {/* Date + slots */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardHeaderLeft}>
                                <View
                                    style={[
                                        styles.sectionIcon,
                                        { backgroundColor: '#EAF8F4' },
                                    ]}
                                >
                                    <TablerIcon
                                        name="calendar"
                                        size={14}
                                        color={Colors.primaryColor}
                                    />
                                </View>
                                <Text style={styles.sectionTitle}>
                                    Select date & slot
                                </Text>
                            </View>
                            <View style={styles.monthNav}>
                                <TouchableOpacity
                                    disabled={monthOffset === 0}
                                    onPress={() =>
                                        setMonthOffset(prev => prev - 1)
                                    }
                                    hitSlop={8}
                                    style={styles.monthBtn}
                                >
                                    <TablerIcon
                                        name="chevron-left"
                                        size={16}
                                        color={
                                            monthOffset === 0
                                                ? '#CBD5E1'
                                                : Colors.primaryColor
                                        }
                                    />
                                </TouchableOpacity>
                                <Text style={styles.monthText}>{monthLabel}</Text>
                                <TouchableOpacity
                                    onPress={() =>
                                        setMonthOffset(prev => prev + 1)
                                    }
                                    hitSlop={8}
                                    style={styles.monthBtn}
                                >
                                    <TablerIcon
                                        name="chevron-right"
                                        size={16}
                                        color={Colors.primaryColor}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <ScrollView
                            ref={dateScrollRef}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.daysContainer}
                        >
                            {DAYS.map((item: any) => {
                                const isActive = selectedDate === item.fullDate;
                                return (
                                    <TouchableOpacity
                                        key={item.fullDate}
                                        disabled={item.isDisabled}
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            if (item.fullDate !== selectedDate) {
                                                setSelectedSlot(null);
                                            }
                                            setSelectedDate(item.fullDate);
                                        }}
                                        style={[
                                            styles.dayCard,
                                            isActive && styles.activeDayCard,
                                            item.isDisabled && styles.dayDisabled,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.dayText,
                                                isActive && styles.dayTextActive,
                                            ]}
                                        >
                                            {item.day}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.dateText,
                                                isActive && styles.dateTextActive,
                                            ]}
                                        >
                                            {item.date}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        {selectedTimeLabel ? (
                            <View style={styles.selectedHint}>
                                <TablerIcon
                                    name="circle-check"
                                    size={14}
                                    color={Colors.primaryColor}
                                />
                                <Text style={styles.selectedHintText}>
                                    Selected · {selectedTimeLabel}
                                </Text>
                            </View>
                        ) : null}

                        {loadingSlots ? (
                            <View style={styles.loadingBox}>
                                <ActivityIndicator
                                    size="small"
                                    color={Colors.primaryColor}
                                />
                                <Text style={styles.loadingText}>
                                    Loading slots...
                                </Text>
                            </View>
                        ) : groupedSlots?.length > 0 ? (
                            groupedSlots.map(
                                ([sectionTitle, sectionSlots]: any) => {
                                    const meta =
                                        SECTION_META[sectionTitle] ||
                                        SECTION_META.Morning;
                                    return (
                                        <View
                                            key={sectionTitle}
                                            style={styles.slotSection}
                                        >
                                            <View style={styles.slotHeader}>
                                                <View
                                                    style={[
                                                        styles.slotHeaderIcon,
                                                        {
                                                            backgroundColor:
                                                                meta.bg,
                                                        },
                                                    ]}
                                                >
                                                    <TablerIcon
                                                        name={meta.icon}
                                                        size={12}
                                                        color={meta.color}
                                                    />
                                                </View>
                                                <Text style={styles.slotTitle}>
                                                    {sectionTitle}
                                                </Text>
                                                <Text style={styles.slotCount}>
                                                    {sectionSlots.length}
                                                </Text>
                                            </View>

                                            <View style={styles.slotGrid}>
                                                {sectionSlots.map(
                                                    (
                                                        slot: any,
                                                        slotIndex: number,
                                                    ) => {
                                                        const status =
                                                            getSlotStatusKey(
                                                                slot,
                                                            );
                                                        const expired =
                                                            isSlotMissedOrExpired(
                                                                slot,
                                                            );
                                                        const isReserved =
                                                            !expired &&
                                                            status ===
                                                            'reserved';
                                                        const isBooked =
                                                            !expired &&
                                                            status === 'booked';
                                                        const selectable =
                                                            isSlotBookable(
                                                                slot,
                                                            );
                                                        const selected =
                                                            isSameSlot(
                                                                selectedSlot,
                                                                slot,
                                                            );

                                                        return (
                                                            <TouchableOpacity
                                                                key={String(
                                                                    slot?.id ??
                                                                    `${slot?.start_time}-${slotIndex}`,
                                                                )}
                                                                activeOpacity={0.8}
                                                                disabled={
                                                                    !selectable
                                                                }
                                                                onPress={() =>
                                                                    handleSelectSlot(
                                                                        slot,
                                                                    )
                                                                }
                                                                style={[
                                                                    styles.slotBtn,
                                                                    selected &&
                                                                    styles.activeSlotBtn,
                                                                    isReserved &&
                                                                    styles.reservedSlot,
                                                                    isBooked &&
                                                                    styles.bookedSlot,
                                                                    expired &&
                                                                    styles.expiredSlot,
                                                                ]}
                                                            >
                                                                <Text
                                                                    style={[
                                                                        styles.slotText,
                                                                        selected &&
                                                                        styles.activeSlotText,
                                                                        !selectable &&
                                                                        styles.slotTextMuted,
                                                                    ]}
                                                                >
                                                                    {
                                                                        slot?.displayTime
                                                                    }
                                                                </Text>
                                                                {isBooked ? (
                                                                    <Text
                                                                        style={
                                                                            styles.slotStatus
                                                                        }
                                                                    >
                                                                        Booked
                                                                    </Text>
                                                                ) : null}
                                                                {isReserved ? (
                                                                    <Text
                                                                        style={
                                                                            styles.slotStatus
                                                                        }
                                                                    >
                                                                        Hold
                                                                    </Text>
                                                                ) : null}
                                                                {expired ? (
                                                                    <Text
                                                                        style={
                                                                            styles.slotStatus
                                                                        }
                                                                    >
                                                                        {status ===
                                                                            'missed'
                                                                            ? 'Missed'
                                                                            : 'Gone'}
                                                                    </Text>
                                                                ) : null}
                                                            </TouchableOpacity>
                                                        );
                                                    },
                                                )}
                                            </View>
                                        </View>
                                    );
                                },
                            )
                        ) : (
                            <View style={styles.emptyBox}>
                                <View style={styles.emptyIcon}>
                                    <TablerIcon
                                        name="calendar"
                                        size={22}
                                        color="#94A3B8"
                                    />
                                </View>
                                <Text style={styles.emptyTitle}>
                                    No slots available
                                </Text>
                                <Text style={styles.emptySub}>
                                    Try another date
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Concern + records */}
                    <View
                        style={styles.card}
                        onLayout={event => {
                            handleConcernSectionLayout(
                                event.nativeEvent.layout.y,
                            );
                        }}
                    >
                        <View style={styles.cardHeaderLeft}>
                            <View
                                style={[
                                    styles.sectionIcon,
                                    { backgroundColor: '#EEF2FF' },
                                ]}
                            >
                                <TablerIcon
                                    name="notes"
                                    size={14}
                                    color="#4F46E5"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.sectionTitle}>
                                    Your concern
                                </Text>
                                <Text style={styles.sectionHint}>
                                    Optional — helps the doctor prepare
                                </Text>
                            </View>
                        </View>

                        <TextInput
                            multiline
                            value={concern}
                            onChangeText={setConcern}
                            placeholder="Briefly describe your symptoms..."
                            placeholderTextColor="#94A3B8"
                            style={styles.input}
                            textAlignVertical="top"
                        />

                        <PrescriptionUpload
                            records={patientsRecord}
                            selectedRecords={selectedRecords}
                            uploading={uploading}
                            onSelectRecord={setSelectedRecords}
                            onUpload={selectFile}
                            CameraUpload={CameraUpload}
                        />
                    </View>

                    <UploadRecordModal
                        visible={modalVisible}
                        file={pickedFile}
                        uploading={uploading}
                        onClose={closeUploadModal}
                        onSubmit={submitRecord}
                    />

                    <View style={{ height: 108 }} />
                </ScrollView>

                {/* Sticky CTA */}
                <View
                    style={[styles.stickyBar, { paddingBottom: footerBottomPad }]}
                >
                    <View style={styles.stickyRow}>
                        <View style={styles.stickyPriceBox}>
                            <RupeeAmount
                                value={consultFee}
                                style={styles.stickyPrice}
                                iconSize={16}
                                iconColor={Colors.primaryColor}
                            />
                            <Text style={styles.stickyHint} numberOfLines={1}>
                                {selectedTimeLabel
                                    ? selectedTimeLabel
                                    : 'Consult fee'}
                            </Text>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            disabled={!canContinue}
                            onPress={handleContinue}
                            style={styles.primaryBtnWrap}
                        >
                            <LinearGradient
                                colors={
                                    canContinue
                                        ? ['#0D614E', '#14937A']
                                        : ['#6c9180', '#6c9180']
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.primaryBtn}
                            >
                                {loadingSlots ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#FFFFFF"
                                    />
                                ) : (
                                    <>
                                        <TablerIcon
                                            name="calendar"
                                            size={16}
                                            color="#FFFFFF"
                                        />
                                        <Text style={styles.primaryBtnText}>
                                            Continue
                                        </Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default DoctorSlot;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F4F7F6',
    },
    flex: { flex: 1 },
    scrollContent: {
        paddingBottom: 8,
    },

    heroCard: {
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 12,
    },
    heroRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    avatarWrap: {
        width: 72,
        height: 72,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#F0F7F4',
        borderWidth: 2,
        borderColor: '#A7E0CF',
    },
    avatar: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    avatarFallback: {
        flex: 1,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarLetter: {
        fontSize: 26,
        color: '#FFFFFF',
        fontFamily: Fonts.PoppinsBold,
    },
    verifiedDot: {
        position: 'absolute',
        right: 4,
        bottom: 4,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    heroInfo: {
        flex: 1,
        minWidth: 0,
        paddingTop: 1,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 3,
    },
    ratingPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#15803D',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 3,
    },
    ratingText: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#FFFFFF',
        includeFontPadding: false,
    },
    metaMuted: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
    },
    expChip: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 4,
    },
    expChipText: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#475569',
        includeFontPadding: false,
    },
    doctorName: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        lineHeight: 21,
    },
    qualification: {
        marginTop: 1,
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
    },
    locRow: {
        marginTop: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locText: {
        flex: 1,
        fontSize: 11,
        fontFamily: Fonts.PoppinsMedium,
        color: '#B45309',
    },
    heroFooter: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    modeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        flex: 1,
    },
    modeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 8,
    },
    modeChipText: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsSemiBold,
        includeFontPadding: false,
    },
    feeMini: {
        alignItems: 'flex-end',
    },
    feeMiniLabel: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
    },
    feeMiniValue: {
        fontSize: 15,
        fontFamily: Fonts.PoppinsBold,
        color: Colors.primaryColor,
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
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        gap: 8,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexShrink: 1,
    },
    sectionIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        includeFontPadding: false,
    },
    sectionHint: {
        marginTop: 1,
        fontSize: 11,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
    },
    monthNav: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    monthBtn: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
    },
    monthText: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#334155',
        minWidth: 72,
        textAlign: 'center',
    },

    daysContainer: {
        gap: 8,
        paddingBottom: 4,
    },
    dayCard: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    activeDayCard: {
        backgroundColor: Colors.primaryColor,
        borderColor: Colors.primaryColor,
    },
    dayDisabled: {
        opacity: 0.4,
    },
    dayText: {
        fontSize: 10,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
        includeFontPadding: false,
    },
    dayTextActive: {
        color: '#D1FAE5',
    },
    dateText: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsBold,
        color: '#0F172A',
        includeFontPadding: false,
    },
    dateTextActive: {
        color: '#FFFFFF',
    },

    selectedHint: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#ECF8F3',
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 8,
    },
    selectedHintText: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: Colors.primaryColor,
        includeFontPadding: false,
    },

    loadingBox: {
        marginTop: 18,
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
    },
    loadingText: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
    },

    slotSection: {
        marginTop: 12,
    },
    slotHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    slotHeaderIcon: {
        width: 22,
        height: 22,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    slotTitle: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#334155',
        flex: 1,
    },
    slotCount: {
        fontSize: 11,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
    },
    slotGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    slotBtn: {
        minWidth: (SCREEN_WIDTH - 20 - 24 - 16) / 3,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeSlotBtn: {
        backgroundColor: Colors.primaryColor,
        borderColor: Colors.primaryColor,
    },
    reservedSlot: {
        backgroundColor: '#FEF3C7',
        borderColor: '#F59E0B',
    },
    bookedSlot: {
        backgroundColor: '#FFF1F2',
        borderColor: '#FECDD3',
    },
    expiredSlot: {
        backgroundColor: '#F1F5F9',
        borderColor: '#E2E8F0',
        opacity: 0.7,
    },
    slotText: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        includeFontPadding: false,
    },
    activeSlotText: {
        color: '#FFFFFF',
    },
    slotTextMuted: {
        color: '#94A3B8',
    },
    slotStatus: {
        marginTop: 2,
        fontSize: 9,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
        includeFontPadding: false,
    },

    emptyBox: {
        marginTop: 16,
        alignItems: 'center',
        paddingVertical: 18,
    },
    emptyIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    emptyTitle: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#334155',
    },
    emptySub: {
        marginTop: 2,
        fontSize: 11,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
    },

    input: {
        marginTop: 10,
        minHeight: 88,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 13,
        lineHeight: 19,
        fontFamily: Fonts.PoppinsRegular,
        color: '#0F172A',
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
    stickyPriceBox: {
        minWidth: 88,
    },
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
        fontSize: 15,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#FFFFFF',
    },
});
