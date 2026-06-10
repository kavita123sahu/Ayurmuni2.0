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
    ImageBackground,
    Dimensions,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '../../common/Vector';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import { generateFutureDates, convertTo12Hour } from '../../common/DataInterface';
import { groupSlotsByTime } from '../../hooks/useConsultData';
import { getDoctorSlots } from '../../services/ConsultServce';
import { showSuccessToast } from '../../config/Key';
import { Utils } from '../../common/Utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(92, Math.max(64, Math.floor(SCREEN_WIDTH * 0.168)));
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.12);

const STORAGE_KEY = 'SELECTED_SLOT';
const RESERVE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const DoctorSlot = (props: any) => {
    const { route, navigation } = props;
    const { doctorData, initialSlots, initialSelectedDate, doctorId } = route?.params || {};

    const [monthOffset, setMonthOffset] = useState(0);
    const DAYS = useMemo(() => generateFutureDates(monthOffset), [monthOffset]);

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

    const [selectedDate, setSelectedDate] = useState(initialSelectedDate || getTodayDate());
    const [selectedSlot, setSelectedSlot] = useState('');
    const [concern, setConcern] = useState('');

    const [slotsData, setSlotsData] = useState<any | null>(initialSlots || null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotsError, setSlotsError] = useState<any>(null);

    const [reservedData, setReservedData] = useState<any | null>(null);
    const [reservedRemainingMs, setReservedRemainingMs] = useState<number>(0);
    const reserveIntervalRef = useRef<any>(null);

    const doctorIdParam = doctorId || doctorData?.id;

    useEffect(() => {
        if (!doctorIdParam) console.warn('Doctor ID missing in route params');
    }, [doctorIdParam]);

    useEffect(() => {
        setSelectedSlot('');
        setSlotsData(null);
    }, [selectedDate]);

    const fetchSlotsForDate = async (date: string) => {
        if (!doctorIdParam || !date) return null;
        try {
            setLoadingSlots(true);
            setSlotsError(null);
            const resp = await getDoctorSlots({ id: doctorIdParam, date });
            setSlotsData(resp?.data || null);
            return resp?.data || null;
        } catch (e) {
            setSlotsError(e);
            return null;
        } finally {
            setLoadingSlots(false);
        }
    };

    // clear reservation locally and refresh slot status
    const clearLocalReservation = useCallback(async () => {
        try {
            await Utils.storeData(STORAGE_KEY, null);
        } catch (e) {
            // ignore
        }

        setReservedData(null);
        setReservedRemainingMs(0);
        if (reserveIntervalRef.current) {
            clearInterval(reserveIntervalRef.current);
            reserveIntervalRef.current = null;
        }

        // refresh slots to show updated status
        await fetchSlotsForDate(selectedDate?.split('T')[0]);
    }, [selectedDate, doctorIdParam]);

    // Rehydrate stored reservation on focus and refresh slots
    useFocusEffect(
        useCallback(() => {
            let mounted = true;

            const rehydrate = async () => {
                try {
                    const stored: any = await Utils.getData(STORAGE_KEY);
                    const storedValid = stored && stored.slotId && stored.date === selectedDate && stored.doctorId === doctorIdParam;

                    if (storedValid) {
                        const expiresAt = (stored.reservedAt || 0) + RESERVE_TTL_MS;
                        const remaining = Math.max(0, expiresAt - Date.now());
                        if (mounted) {
                            setReservedData(stored);
                            setReservedRemainingMs(remaining);
                        }
                    } else {
                        if (mounted) {
                            setReservedData(null);
                            setReservedRemainingMs(0);
                        }
                    }

                    // fetch latest slots to update UI, but do NOT clear a local reservation
                    // just because server reports the slot as 'available' — keep local
                    // reservation authoritative until TTL expires. Only clear if
                    // the reservation expired or server reports the slot as 'booked'.
                    const data = await fetchSlotsForDate(selectedDate?.split('T')[0]);

                    if (storedValid) {
                        const expiresAt = (stored.reservedAt || 0) + RESERVE_TTL_MS;
                        if (Date.now() >= expiresAt) {
                            await Utils.storeData(STORAGE_KEY, null);
                            if (mounted) {
                                setReservedData(null);
                                setReservedRemainingMs(0);
                            }
                        } else {
                            const latest = (data?.slots || []).find((s: any) => String(s.id) === String(stored.slotId));
                            if (latest && String(latest.status || '').toLowerCase() === 'booked') {
                                // someone else booked it already on server — clear local reservation
                                await Utils.storeData(STORAGE_KEY, null);
                                if (mounted) {
                                    setReservedData(null);
                                    setReservedRemainingMs(0);
                                }
                            }
                        }
                    }
                } catch (e) {
                    // ignore
                }
            };

            rehydrate();

            return () => { mounted = false; };
        }, [selectedDate, doctorIdParam])
    );



    // countdown
    useEffect(() => {
        if (reserveIntervalRef.current) {
            clearInterval(reserveIntervalRef.current);
            reserveIntervalRef.current = null;
        }
        if (reservedRemainingMs > 0) {
            reserveIntervalRef.current = setInterval(() => {
                setReservedRemainingMs(prev => {
                    const next = Math.max(0, prev - 1000);
                    if (next === 0) {
                        // expired - clear local reservation and refresh slots
                        clearLocalReservation();
                    }
                    return next;
                });
            }, 1000);
        }
        return () => {
            if (reserveIntervalRef.current) {
                clearInterval(reserveIntervalRef.current);
                reserveIntervalRef.current = null;
            }
        };
    }, [reservedRemainingMs, clearLocalReservation]);

    // grouped slots
    const groupedSlots = useMemo(() => groupSlotsByTime(slotsData?.slots || []), [slotsData]);

    useEffect(() => {
        if (!selectedSlot && slotsData?.slots?.length) {
            const firstAvailable = slotsData.slots.find((s: any) => s.status === 'available');
            if (firstAvailable) setSelectedSlot(firstAvailable.id);
        }
    }, [slotsData]);

    const reserveLocalAndNavigate = async () => {
        if (!selectedSlot) return;
        const selectedSlotObj = (slotsData?.slots || []).find((s: any) => String(s.id) === String(selectedSlot));
        const reservedAt = Date.now();
        const saved = {
            slotId: selectedSlot,
            date: selectedDate,
            selectedTime: selectedSlotObj?.displayTime || selectedSlotObj?.start_time,
            doctorId: doctorIdParam,
            concern,
            reservedAt,
        };

        try {
            await Utils.storeData(STORAGE_KEY, saved);
            setReservedData(saved);
            setReservedRemainingMs(Math.max(0, reservedAt + RESERVE_TTL_MS - Date.now()));

            // start countdown
            if (reserveIntervalRef.current) {
                clearInterval(reserveIntervalRef.current);
                reserveIntervalRef.current = null;
            }
            reserveIntervalRef.current = setInterval(() => {
                setReservedRemainingMs(prev => Math.max(0, prev - 1000));
            }, 1000);
        } catch (e) {
            console.log('store reserve failed', e);
        }

        navigation.navigate('RazorpayScreen', {
            doctorData,
            doctorId: doctorIdParam,
            slotId: selectedSlot,
            date: selectedDate,
            selectedTime: selectedSlotObj?.displayTime || selectedSlotObj?.start_time,
            concern,
        });
    };

    const formatMs = (ms: number) => {
        const totalSec = Math.max(0, Math.floor(ms / 1000));
        const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
        const s = (totalSec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#0D614E0D" barStyle="dark-content" />

            <View style={styles.headerTop}>
                <TouchableOpacity onPress={() => { navigation.goBack(); }} style={styles.iconBtn}>
                    <Image source={Images.backIcon} style={{ height: 40, width: 40 }} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Doctor Profile</Text>

                <TouchableOpacity activeOpacity={0.8} style={styles.iconBtn}>
                    <Ionicons name="heart-outline" size={25} color="#0F172A" />
                </TouchableOpacity>
            </View>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={
                    Platform.OS === 'ios'
                        ? 'padding'
                        : 'height'
                }
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}> */}
                    <View style={styles.headerContainer}>
                        <View style={styles.profileContainer}>
                            <View style={styles.avatarBgWrapper}>
                                <ImageBackground source={Images.BackgroundImage} style={styles.avatarBg} imageStyle={{ borderRadius: 100 }}>
                                    <View style={styles.avatarWrapper}>
                                        <Image source={Images.doctorImage} style={styles.avatar} />
                                    </View>
                                </ImageBackground>
                            </View>

                            <Text style={styles.doctorName}>{slotsData?.full_name ?? doctorData?.full_name}</Text>
                            <Text style={styles.speciality}>{slotsData?.designation ?? doctorData?.designation}</Text>
                        </View>
                    </View>

                    <View style={styles.statsContainer}>
                        {[
                            { label: 'PATIENTS', value: slotsData?.total_patients ?? doctorData?.total_patients ?? '' },
                            { label: 'REVIEWS', value: slotsData?.total_reviews ?? doctorData?.total_reviews ?? '' },
                            { label: 'EXPERIENCE', value: slotsData?.experience_display ?? doctorData?.experience_display ?? '' },
                        ].map((item, index) => (
                            <View key={index} style={[styles.statBox, index !== 2 && styles.borderRight]}>
                                <Text style={styles.statValue}>{item.value}</Text>
                                <Text style={styles.statLabel}>{item.label}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.section}>
                        <View style={styles.rowBetween}>
                            <Text style={styles.sectionTitle}>Schedules</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <TouchableOpacity disabled={monthOffset === 0} onPress={() => setMonthOffset(prev => prev - 1)}>
                                    <Ionicons name="chevron-back" size={22} color={monthOffset === 0 ? '#CBD5E1' : Colors.primaryColor} />
                                </TouchableOpacity>
                                <Text style={styles.monthText}>{new Date(new Date().getFullYear(), new Date().getMonth() + monthOffset).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
                                <TouchableOpacity onPress={() => setMonthOffset(prev => prev + 1)}>
                                    <Ionicons name="chevron-forward" size={22} color={Colors.primaryColor} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysContainer}>
                            {DAYS.map((item: any) => {
                                const isActive = selectedDate === item.fullDate;
                                return (
                                    <TouchableOpacity key={item.fullDate} disabled={item.isDisabled} activeOpacity={0.8} onPress={() => setSelectedDate(item.fullDate)} style={[styles.dayCard, isActive && styles.activeDayCard, item.isDisabled && { opacity: 0.45 }]}>
                                        <Text style={[styles.dayText, isActive && { color: '#FFFFFF' }]}>{item.day}</Text>
                                        <Text style={[styles.dateText, isActive && { color: '#FFFFFF' }]}>{item.date}</Text>
                                        <Text style={[styles.monthDayText, isActive && { color: '#FFFFFF' }]}>{item.month}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        {/* Slots */}
                        {loadingSlots ? (
                            <View style={{ marginTop: 24, alignItems: 'center' }}>
                                <Ionicons name="hourglass-outline" size={32} color="#CBD5E1" />
                                <Text style={{ marginTop: 10, color: '#64748B', fontFamily: Fonts.PoppinsMedium }}>Loading available slots...</Text>
                            </View>
                        ) : groupedSlots?.length > 0 ? (
                            groupedSlots.map(([sectionTitle, sectionSlots]: any) => {
                                const sectionIcon = sectionTitle === 'Morning' ? 'sunny-outline' : sectionTitle === 'Afternoon' ? 'partly-sunny-outline' : 'moon-outline';
                                return (
                                    <View key={sectionTitle} style={styles.slotSection}>
                                        <View style={styles.slotHeader}>
                                            <Ionicons name={sectionIcon} size={16} color="#94A3B8" />
                                            <Text style={styles.slotTitle}>{sectionTitle}</Text>
                                        </View>

                                        <View style={styles.slotGrid}>
                                            {sectionSlots.map((slot: any) => {
                                                const status = String(slot?.status || '').toLowerCase();
                                                const isAvailable = status === 'available';
                                                const isBooked = status === 'booked';
                                                const isReservedByMe = reservedData?.slotId === slot?.id;
                                                const selectable = isAvailable || isReservedByMe;

                                                return (
                                                    <TouchableOpacity key={slot?.id} activeOpacity={0.8} disabled={!selectable} onPress={() => { if (isAvailable || isReservedByMe) setSelectedSlot(slot?.id); }} style={[
                                                        styles.slotBtn,
                                                        selectedSlot === slot?.id && styles.activeSlotBtn,
                                                        !selectable && { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0', opacity: 0.6 },
                                                        isReservedByMe && !(selectedSlot === slot?.id) && { borderColor: Colors.primaryColor, backgroundColor: '#E6FFFA' },
                                                        isBooked && { backgroundColor: '#FFF1F2', borderColor: '#FEE2E2' },
                                                    ]}>

                                                        <Text style={[styles.slotText, selectedSlot === slot?.id && styles.activeSlotText, !selectable && { color: '#94A3B8' }]}>{slot?.displayTime}</Text>

                                                        {isBooked && <Text style={styles.slotStatus}>Booked</Text>}
                                                        {!isAvailable && !isBooked && !isReservedByMe && <Text style={styles.slotStatus}>Reserved</Text>}

                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>
                                );
                            })
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="calendar-outline" size={42} color="#CBD5E1" />
                                <Text style={styles.emptyTitle}>No Slots Available</Text>
                            </View>
                        )}

                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Concern
                        </Text>

                        <TextInput
                            multiline
                            value={concern}
                            onChangeText={setConcern}
                            placeholder="Briefly describe your symptoms..."
                            placeholderTextColor="#94A3B8"
                            style={styles.input}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.footer}>
                        <View>
                            <Text style={styles.feeLabel}>Consult Fee</Text>
                            <Text style={styles.price}>Rs. {slotsData?.consult_fee?.amount ?? doctorData?.followup_fee ?? 0}</Text>
                        </View>

                        <TouchableOpacity activeOpacity={0.85} disabled={loadingSlots || groupedSlots.length === 0} style={[styles.payBtn, (!selectedSlot || loadingSlots || groupedSlots.length === 0) && { opacity: 0.5, backgroundColor: '#CBD5E1' }]} onPress={reserveLocalAndNavigate}>
                            <Ionicons name="card-outline" size={18} color="#FFFFFF" />
                            <Text style={styles.payText}>{loadingSlots ? 'Loading...' : 'Continue'}</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default DoctorSlot;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D614E0D' },
    scrollContent: { paddingBottom: 40, backgroundColor: '#FFFFFF' },
    headerContainer: { backgroundColor: '#0D614E0D', borderBottomLeftRadius: 56, borderBottomRightRadius: 56, paddingHorizontal: 20, paddingBottom: 28 },
    headerTop: { flexDirection: 'row', paddingHorizontal: 20, backgroundColor: '#F3FAF7', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, minHeight: 50 },
    iconBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
    avatarBgWrapper: { justifyContent: 'center', alignItems: 'center', marginBottom: -10 },
    avatarBg: { padding: 30, height: 150, width: '58%', aspectRatio: 1, borderRadius: 100, overflow: 'hidden', shadowOpacity: 4, shadowColor: Colors.primaryColor, alignItems: 'center', justifyContent: 'center' },
    avatarWrapper: { width: 105, height: 105, borderRadius: 24, borderWidth: 1, overflow: 'hidden', borderColor: '#DDEBE8', backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 12, padding: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6, elevation: 5 },
    avatar: { width: 90, height: 90, borderRadius: 16, resizeMode: 'cover' },
    headerTitle: { fontSize: 22, color: '#1E293B', fontFamily: Fonts.PoppinsSemiBold },
    profileContainer: { alignItems: 'center', marginTop: 18 },
    doctorName: { marginTop: 10, marginBottom: -5, fontSize: 20, fontFamily: Fonts.PoppinsSemiBold, color: '#1E293B' },
    speciality: { fontSize: 14, color: Colors.primaryColor, fontFamily: Fonts.PoppinsMedium },
    statsContainer: { flexDirection: 'row', marginTop: 22, marginHorizontal: 20, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9', overflow: 'hidden' },
    statBox: { flex: 1, alignItems: 'center', paddingVertical: 18 },
    borderRight: { borderRightWidth: 1, borderRightColor: '#F1F5F9' },
    statValue: { fontSize: 22, fontFamily: Fonts.PoppinsBold, color: '#1E293B' },
    statLabel: { fontSize: 12, color: '#94A3B8', fontFamily: Fonts.PoppinsMedium },
    section: { marginTop: 24, paddingHorizontal: 20 },
    rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sectionTitle: { fontSize: 18, fontFamily: Fonts.PoppinsSemiBold, color: '#0F172A' },
    monthText: { fontSize: 14, fontFamily: Fonts.PoppinsSemiBold, color: Colors.primaryColor, marginRight: 4 },
    daysContainer: { paddingTop: 18, paddingBottom: 8 },
    dayCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12, paddingHorizontal: 6 },
    activeDayCard: { backgroundColor: Colors.primaryColor, borderColor: Colors.background },
    dayText: { fontSize: Math.round(CARD_WIDTH * 0.18), fontFamily: Fonts.PoppinsMedium, color: '#64748B' },
    dateText: { fontSize: Math.round(CARD_WIDTH * 0.28), fontFamily: Fonts.PoppinsSemiBold, color: '#1E293B' },
    monthDayText: { fontSize: Math.round(CARD_WIDTH * 0.12), marginTop: 2, color: '#64748B', fontFamily: Fonts.PoppinsMedium },
    slotSection: { marginTop: 22 },
    slotHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    slotTitle: { marginLeft: 6, fontSize: 13, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' },
    slotGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    slotBtn: { width: '31%', minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: 12, paddingHorizontal: 8 },
    activeSlotBtn: { backgroundColor: Colors.primaryColor, borderColor: Colors.primaryColor },
    slotText: { fontSize: 14, fontFamily: Fonts.PoppinsMedium, color: '#475569', textAlign: 'center', includeFontPadding: false },
    activeSlotText: { color: '#FFFFFF', fontFamily: Fonts.PoppinsMedium, fontSize: 14 },
    emptyContainer: { marginTop: 35, alignItems: 'center', justifyContent: 'center' },
    emptyTitle: { marginTop: 10, fontSize: 16, color: '#94A3B8', fontFamily: Fonts.PoppinsMedium },
    slotStatus: { marginTop: 3, fontSize: 11, color: '#64748B', fontFamily: Fonts.PoppinsMedium },
    input: { marginTop: 14, height: 120, borderRadius: 18, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', padding: 16, fontFamily: Fonts.PoppinsMedium, fontSize: 14, color: '#1E293B' },
    footer: { marginTop: 28, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
    feeLabel: { fontSize: 14, fontFamily: Fonts.PoppinsMedium, color: '#94A3B8' },
    price: { fontSize: 28, fontFamily: Fonts.PoppinsSemiBold, color: Colors.primaryColor },
    payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryColor, height: 56, paddingHorizontal: 36, borderRadius: 18, flex: 1 },
    payText: { marginLeft: 8, fontSize: 16, fontFamily: Fonts.PoppinsSemiBold, color: '#FFFFFF' },
});
