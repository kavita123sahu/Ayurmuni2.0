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
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../common/Colors';
import { generateFutureDates, } from '../../common/DataInterface';
import { groupSlotsByTime } from '../../hooks/useConsultData';
import { getDoctorSlots } from '../../services/ConsultServce';
import { useMedicalRecord, useMedicalUpload } from '../../hooks/usePatientData';
import PrescriptionUpload from './Uploadreport';
import { launchCamera } from 'react-native-image-picker';
import { Ionicons } from '../../common/Vector';
import TablerIcon from '../../components/TablerIcon';
import { requireAuth } from '../../services/guestAuth';
import UploadRecordModal from '../../components/UploadRecordModal';
import AppHeader from '../../components/AppHeader';


const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(92, Math.max(64, Math.floor(SCREEN_WIDTH * 0.168)));
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.12);


const DoctorSlot = (props: any) => {

    const { route, navigation } = props;

    const [selectedRecords, setSelectedRecords] =
        useState<string[]>([]);

    const { doctorDetails } = route?.params || {};

    const { patientsRecord, fetchPatientsRecord, } = useMedicalRecord();

    const {
        selectFile,
        CameraUpload,
        removeFile,
        pickedFile,
        uploading,

        modalVisible,
        submitRecord,
        closeUploadModal,
    } = useMedicalUpload(
        fetchPatientsRecord,
        (recordId) => {
            setSelectedRecords(prev => [...prev, recordId]);
        },
    );


    const [doctorDetailData, setDoctorDetailData] = useState<any>(null);
    // const [records, setRecords] = useState<any[]>([]);
    const doctorInfo = useMemo(() => doctorDetails, [doctorDetails]);
    const [prescriptionFiles, setPrescriptionFiles] = useState([]);
    console.log("dcorsolotdata", doctorDetails);


    const [monthOffset, setMonthOffset] = useState(0);
    // const DAYS = useMemo(() => generateFutureDates(monthOffset), [monthOffset]);
    const DAYS = useMemo(() => {
        return generateFutureDates(monthOffset).filter(
            (item: any) => !item.isDisabled,
        );
    }, [monthOffset]);

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

    const getDoctorDetails = useCallback(async () => {
        try {
            const res = await getDoctorSlots({
                id: doctorDetails?.id
            }
            );
            console.log("dattaaa", res?.data);
            if (res?.data) {
                setDoctorDetailData(res?.data
                );
            }
        } catch (error) {
            console.log(
                'DOCTOR DETAILS ERROR =>',
                error
            );
        }
    }, [doctorDetails?.id]);

    const [selectedDate, setSelectedDate] = useState(getTodayDate());
    const [selectedSlot, setSelectedSlot] = useState<any>(null);

    const [concern, setConcern] = useState('');

    const [slotsData, setSlotsData] = useState<any | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const scrollRef = useRef<ScrollView>(null);
    const doctorIdParam = doctorDetails?.id;

    console.log("doctorDetailsdoctorDetails", doctorDetails);

    useEffect(() => {
        if (!doctorIdParam) console.warn('Doctor ID missing in route params');
    }, [doctorIdParam]);

    const isFirstRender = useRef(true);

    useEffect(() => {
        const todayIndex = DAYS.findIndex(
            (item: any) => item.isToday,
        );

        if (todayIndex >= 0) {
            setTimeout(() => {
                scrollRef.current?.scrollTo({
                    x: todayIndex * (CARD_WIDTH + 12),
                    animated: false,
                });
            }, 100);
        }
    }, [DAYS]);


    useFocusEffect(
        useCallback(() => {
            if (isFirstRender.current) {
                isFirstRender.current = false;
                return;
            }

            fetchSlotsForDate(selectedDate);
        }, [selectedDate])
    );


    const fetchSlotsForDate = useCallback(async (date: string) => {
        if (!doctorIdParam || !date) return;

        try {
            setLoadingSlots(true);

            const resp = await getDoctorSlots({
                id: doctorIdParam,
                date,
            });
            console.log("slotresposne--->>>", resp);
            setSlotsData(resp?.data);

        } finally {
            setLoadingSlots(false);
        }
    }, [doctorIdParam]);
    useEffect(() => {
        if (selectedDate && doctorIdParam) {
            fetchSlotsForDate(selectedDate);
        }
    }, [selectedDate, doctorIdParam, fetchSlotsForDate]);

    const onRefresh = useCallback(async () => {
        try {
            setRefreshing(true);

            // await fetchSlotsForDate(selectedDate);
            await getDoctorDetails();

        } finally {
            setRefreshing(false);
        }
    }, [selectedDate, fetchSlotsForDate]);

    const groupedSlots = useMemo(
        () => groupSlotsByTime(slotsData?.slots || []),
        [slotsData]
    );



    useEffect(() => {
        if (!selectedSlot && slotsData?.slots?.length) {
            const firstAvailable = slotsData.slots.find((s: any) => s.status === 'available');
            if (firstAvailable) setSelectedSlot(firstAvailable);
        }
    }, [slotsData]);

    const handleContinue = async () => {
        if (!(await requireAuth('Please login to book a consultation'))) return;
        console.log("selectedSlotselectedSlot", selectedSlot?.id)

        if (!selectedSlot?.id) return;

        const selectedSlotObj = slotsData?.slots?.find(
            (s: any) => String(s.id) === String(selectedSlot?.id)
        );

        navigation.navigate('RazorpayScreen', {
            doctorInfo,
            doctorId: doctorIdParam,
            slotId: selectedSlot,
            date: selectedDate,
            selectedTime:
                selectedSlotObj?.displayTime ||
                selectedSlotObj?.start_time,
            concern,

            medical_record_ids: selectedRecords,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={Colors.background} barStyle="dark-content" />

            {/* <View style={styles.headerTop}>
                <TouchableOpacity onPress={() => { navigation.goBack(); }} style={styles.iconBtn}>
                    <Image source={Images.backIcon} style={styles.backIcon} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Doctor Profile</Text>

                {/* <TouchableOpacity activeOpacity={0.8} style={styles.iconBtn}>
                    {doctorInfo?.is_favorite ?
                        <Ionicons name="heart" size={25} color={Colors.primaryColor} /> :
                        <Ionicons name="heart-outline" size={25} color="#0F172A" />
                    }

                </TouchableOpacity> */}


            <AppHeader
                title="Doctor Profile"
                leftIconName='arrow-left'
                onLeftPress={() =>
                    props.navigation.goBack()
                }
            // onRightPress={() => props.navigation.navigate('NotificationsScreen')}
            // rightIconName={doctorInfo?.is_favorite ? "heart" : "heart-outline"}
            />

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
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                >

                    <View style={styles.headerContainer}>
                        <View style={styles.profileContainer}>
                            <View style={styles.avatarBgWrapper}>
                                {/* <ImageBackground source={Images.BackgroundImage} style={styles.avatarBg} imageStyle={{ borderRadius: 100 }}> */}
                                <View style={styles.avatarWrapper}>
                                    {doctorInfo?.profile_image ? (
                                        <Image
                                            source={{ uri: doctorInfo?.profile_image }}
                                            style={styles.avatar}
                                        />
                                    ) : (
                                        <View style={styles.avatarFallback}>
                                            <Text style={styles.avatarLetter}>
                                                {doctorInfo?.full_name?.charAt(0)?.toUpperCase() || ''}
                                            </Text>
                                        </View>
                                    )}
                                    {/* <Image source={Images.doctorImage} style={styles.avatar} /> */}
                                </View>
                                {/* </ImageBackground> */}
                            </View>

                            <Text style={styles.doctorName}>{doctorInfo?.full_name}</Text>
                            <Text style={styles.speciality}>{doctorInfo?.designation || doctorInfo?.qualification}</Text>
                        </View>
                    </View>

                    <View style={styles.statsContainer}>
                        {[
                            { label: 'PATIENTS', value: doctorInfo?.total_patients ?? '0' },
                            { label: 'REVIEWS', value: doctorInfo?.total_reviews ?? '0' },
                            { label: 'EXPERIENCE', value: doctorInfo?.experience_display ?? '0' },
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
                                                const isReserved = status === 'reserved';
                                                const isBooked = status === 'booked';
                                                const selectable = isAvailable;

                                                return (
                                                    <TouchableOpacity key={slot?.id} activeOpacity={0.8} disabled={!selectable}
                                                        // onPress={() => setSelectedSlot(slot.id)}
                                                        onPress={() => {
                                                            console.log("slotiddddddd", slot?.id)
                                                            setSelectedSlot(slot)
                                                        }}
                                                        style={[
                                                            styles.slotBtn,
                                                            selectedSlot?.id === slot.id && styles.activeSlotBtn,

                                                            isReserved && {
                                                                backgroundColor: '#FEF3C7',
                                                                borderColor: '#F59E0B',
                                                            },

                                                            isBooked && {
                                                                backgroundColor: '#FFF1F2',
                                                                borderColor: '#FEE2E2',
                                                            },
                                                        ]}

                                                    >

                                                        <Text style={[styles.slotText, selectedSlot?.id === slot?.id && styles.activeSlotText, !selectable && { color: '#94A3B8' }]}>{slot?.displayTime}</Text>

                                                        {isBooked && <Text style={styles.slotStatus}>Booked</Text>}

                                                        {isReserved && (
                                                            <Text style={styles.slotStatus}>
                                                                Reserved
                                                            </Text>
                                                        )}

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
                        {/* 
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.uploadBtn}
                            onPress={() => navigation.navigate('MedicalRecords')}
                        >
                            <Ionicons
                                name="cloud-upload-outline"
                                size={20}
                                color={Colors.primaryColor}
                            />

                            <Text style={styles.uploadText}>
                                Upload Medical Records
                            </Text>
                        </TouchableOpacity> */}

                        <PrescriptionUpload
                            records={patientsRecord}
                            selectedRecords={selectedRecords}
                            uploading={uploading}
                            onSelectRecord={setSelectedRecords}
                            onUpload={selectFile}
                            CameraUpload={CameraUpload}
                        />

                    </View>


                    <View style={styles.footer}>
                        <View>
                            <Text style={styles.feeLabel}>Consult Fee</Text>
                            <Text style={styles.price}>Rs {selectedSlot?.amount ?? doctorDetails?.consultation_fee ?? 0}</Text>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            disabled={loadingSlots || groupedSlots.length === 0}
                            style={[
                                styles.payBtn,
                                (!selectedSlot?.id || loadingSlots || groupedSlots?.length === 0) && {
                                    opacity: 0.5,
                                    backgroundColor: '#CBD5E1',
                                },
                            ]}
                            onPress={handleContinue}
                        >
                            <Ionicons name="card-outline" size={18} color="#FFFFFF" />
                            <Text style={styles.payText}>
                                {loadingSlots ? 'Loading...' : 'Continue'}
                            </Text>
                        </TouchableOpacity>
                    </View>


                    <UploadRecordModal
                        visible={modalVisible}
                        file={pickedFile}
                        uploading={uploading}
                        onClose={closeUploadModal}
                        onSubmit={submitRecord}
                    />

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default DoctorSlot;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollContent: { paddingBottom: 40, backgroundColor: '#FFFFFF' },
    headerContainer: { backgroundColor: '#0D614E0D', borderBottomLeftRadius: 56, borderBottomRightRadius: 56, paddingHorizontal: 20, paddingBottom: 28 },
    headerTop: { flexDirection: 'row', paddingHorizontal: 20, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'space-between', minHeight: 50 },
    iconBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
    backIcon: { width: 36, height: 36, resizeMode: 'contain' },
    avatarBgWrapper: { justifyContent: 'center', alignItems: 'center', marginBottom: -10 },

    avatarWrapper: { width: 105, height: 105, borderRadius: 24, borderWidth: 1, overflow: 'hidden', borderColor: '#DDEBE8', backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 12, padding: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6, elevation: 5 },
    avatar: { width: 90, height: 90, borderRadius: 16, resizeMode: 'cover' },

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

    recordTitle: {
        fontSize: 16,
        marginBottom: 12,
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
    },

    recordCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFF',
        marginBottom: 10,
    },

    selectedRecordCard: {
        borderColor: Colors.primaryColor,
        backgroundColor: '#F0FDF4',
    },

    recordName: {
        flex: 1,
        marginLeft: 10,
        color: '#334155',
        fontFamily: Fonts.PoppinsMedium,
    },
    uploadBtn: {
        marginTop: 16,
        height: 56,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: Colors.primaryColor,
        backgroundColor: '#F8FFFC',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },

    uploadText: {
        fontSize: 15,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },
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
    payBtnLocked: { backgroundColor: '#64748B' },
    payText: { marginLeft: 8, fontSize: 16, fontFamily: Fonts.PoppinsSemiBold, color: '#FFFFFF' },
});
