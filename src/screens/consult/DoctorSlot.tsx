// import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import {
//     View,
//     Text,
//     StyleSheet,
//     TouchableOpacity,
//     ScrollView,
//     Image,
//     TextInput,
//     StatusBar,
//     ImageBackground,
//     Dimensions,
//     Platform,
//     KeyboardAvoidingView,
//     RefreshControl,
// } from 'react-native';
// import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
// import { Images } from '../../common/Images';
// import { Fonts } from '../../common/Fonts';
// import { useFocusEffect } from '@react-navigation/native';
// import { Colors } from '../../common/Colors';
// import { formatDate, generateFutureDates, } from '../../common/DataInterface';
// import { groupSlotsByTime } from '../../hooks/useConsultData';
// import { getDoctorSlots } from '../../services/ConsultServce';
// import {
//     getSlotStatusKey,
//     isSlotBookable,
//     isSlotMissedOrExpired,
// } from '../../utils/slotAvailabilityUtils';
// import { useMedicalRecord, useMedicalUpload } from '../../hooks/usePatientData';
// import PrescriptionUpload from './Uploadreport';
// import { launchCamera } from 'react-native-image-picker';
// import { Ionicons } from '../../common/Vector';
// import TablerIcon from '../../components/TablerIcon';
// import { requireAuth } from '../../services/guestAuth';
// import UploadRecordModal from '../../components/UploadRecordModal';
// import AppHeader from '../../components/AppHeader';
// import { formatMessageTime } from '../../chatSystem/utils/dateFormatter';
// import DoctorConsultationSection from '../../components/consult/DoctorConsultationSection';
// import { showSuccessToast } from '../../config/Key';


// const { width: SCREEN_WIDTH } = Dimensions.get('window');
// const CARD_WIDTH = Math.min(92, Math.max(64, Math.floor(SCREEN_WIDTH * 0.168)));
// const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.12);


// const DoctorSlot = (props: any) => {

//     const { route, navigation } = props;
//     const insets = useSafeAreaInsets();
//     const footerBottomPad = Math.max(insets.bottom, 12);

//     const [selectedRecords, setSelectedRecords] =
//         useState<string[]>([]);

//     const { doctorDetails } = route?.params || {};

//     const { patientsRecord, patientsList, fetchPatientsRecord, } = useMedicalRecord();

//     const {
//         selectFile,
//         CameraUpload,
//         removeFile,
//         pickedFile,
//         uploading,

//         modalVisible,
//         submitRecord,
//         closeUploadModal,
//     } = useMedicalUpload(
//         fetchPatientsRecord,
//         (recordId) => {
//             setSelectedRecords(prev => [...prev, recordId]);
//         },
//     );

//     const [doctorDetailData, setDoctorDetailData] = useState<any>(null);
//     const doctorInfo = useMemo(() => doctorDetails, [doctorDetails]);
//     const doctor = useMemo(
//         () => ({
//             ...doctorInfo,
//             ...doctorDetailData,
//         }),
//         [doctorInfo, doctorDetailData],
//     );

//     const stats = useMemo(
//         () => [
//             {
//                 id: '1',
//                 value: doctor?.patients_display || doctor?.total_patients || 0,
//                 label: 'PATIENTS',
//             },
//             {
//                 id: '2',
//                 value: doctor?.total_reviews || 0,
//                 label: 'REVIEWS',
//             },
//             {
//                 id: '3',
//                 value: doctor?.experience_display || `${doctor?.experience_years || 0}+`,
//                 label: 'EXPERIENCE',
//             },
//         ],
//         [doctor],
//     );

//     const [monthOffset, setMonthOffset] = useState(0);
//     // const DAYS = useMemo(() => generateFutureDates(monthOffset), [monthOffset]);
//     const DAYS = useMemo(() => {
//         return generateFutureDates(monthOffset).filter(
//             (item: any) => !item.isDisabled,
//         );
//     }, [monthOffset]);

//     const getTodayDate = () => {
//         const todayEntry = DAYS.find((d: any) => d.isToday);
//         if (todayEntry) return todayEntry.fullDate;
//         const first = DAYS.find((d: any) => !d.isDisabled);
//         if (first) return first.fullDate;
//         const now = new Date();
//         const yyyy = now.getFullYear();
//         const mm = String(now.getMonth() + 1).padStart(2, '0');
//         const dd = String(now.getDate()).padStart(2, '0');
//         return `${yyyy}-${mm}-${dd}`;
//     };

//     const getDoctorDetails = useCallback(async () => {
//         try {
//             const res = await getDoctorSlots({
//                 id: doctorDetails?.id
//             }
//             );
//             console.log("dattaaa", res?.data);
//             if (res?.data) {
//                 setDoctorDetailData(res?.data
//                 );
//             }

//         } catch (error) {
//             console.log(
//                 'DOCTOR DETAILS ERROR =>',
//                 error
//             );
//         }
//     }, [doctorDetails?.id]);

//     useEffect(() => {
//         if (doctorDetails?.id) {
//             getDoctorDetails();
//         }
//     }, [doctorDetails?.id, getDoctorDetails]);

//     const [selectedDate, setSelectedDate] = useState(getTodayDate());
//     const [selectedSlot, setSelectedSlot] = useState<any>(null);

//     const [concern, setConcern] = useState('');

//     const [slotsData, setSlotsData] = useState<any | null>(null);
//     const [loadingSlots, setLoadingSlots] = useState(false);
//     const [refreshing, setRefreshing] = useState(false);

//     const dateScrollRef = useRef<ScrollView>(null);
//     const mainScrollRef = useRef<ScrollView>(null);
//     const concernSectionY = useRef(0);
//     const pendingConcernScrollRef = useRef(false);
//     const doctorIdParam = doctorDetails?.id;

//     const scrollToConcernSection = useCallback(() => {
//         const scroll = () => {
//             mainScrollRef.current?.scrollTo({
//                 y: Math.max(0, concernSectionY.current - 16),
//                 animated: true,
//             });
//         };

//         if (concernSectionY.current > 0) {
//             requestAnimationFrame(scroll);
//             return;
//         }

//         pendingConcernScrollRef.current = true;
//         requestAnimationFrame(() => {
//             setTimeout(scroll, 200);
//         });
//     }, []);

//     const handleSelectSlot = useCallback(
//         (slot: any) => {
//             setSelectedSlot(slot);
//             scrollToConcernSection();
//         },
//         [scrollToConcernSection],
//     );

//     const handleConcernSectionLayout = useCallback(
//         (y: number) => {
//             concernSectionY.current = y;
//             if (pendingConcernScrollRef.current && y > 0) {
//                 pendingConcernScrollRef.current = false;
//                 scrollToConcernSection();
//             }
//         },
//         [scrollToConcernSection],
//     );

//     console.log("doctorDetailsdoctorDetails", doctorDetails);

//     useEffect(() => {
//         if (!doctorIdParam) console.warn('Doctor ID missing in route params');
//     }, [doctorIdParam]);

//     const isFirstRender = useRef(true);

//     useEffect(() => {
//         const todayIndex = DAYS.findIndex(
//             (item: any) => item.isToday,
//         );

//         if (todayIndex >= 0) {
//             setTimeout(() => {
//                 dateScrollRef.current?.scrollTo({
//                     x: todayIndex * (CARD_WIDTH + 12),
//                     animated: false,
//                 });
//             }, 100);
//         }
//     }, [DAYS]);


//     useFocusEffect(
//         useCallback(() => {
//             if (isFirstRender.current) {
//                 isFirstRender.current = false;
//                 return;
//             }

//             fetchSlotsForDate(selectedDate);
//         }, [selectedDate])
//     );


//     const fetchSlotsForDate = useCallback(async (date: string) => {
//         if (!doctorIdParam || !date) return;

//         try {
//             setLoadingSlots(true);

//             const resp = await getDoctorSlots({
//                 id: doctorIdParam,
//                 date,
//             });
//             console.log("slotresposne--->>>", resp);
//             setSlotsData(resp?.data);

//         } finally {
//             setLoadingSlots(false);
//         }
//     }, [doctorIdParam]);
//     useEffect(() => {
//         if (selectedDate && doctorIdParam) {
//             fetchSlotsForDate(selectedDate);
//         }
//     }, [selectedDate, doctorIdParam, fetchSlotsForDate]);

//     const onRefresh = useCallback(async () => {
//         try {
//             setRefreshing(true);

//             // await fetchSlotsForDate(selectedDate);
//             await getDoctorDetails();

//         } finally {
//             setRefreshing(false);
//         }
//     }, [selectedDate, fetchSlotsForDate]);

//     const groupedSlots = useMemo(
//         () => groupSlotsByTime(slotsData?.slots || []),
//         [slotsData]
//     );



//     useEffect(() => {
//         if (!selectedSlot && slotsData?.slots?.length) {
//             const firstAvailable = slotsData.slots.find((s: any) =>
//                 isSlotBookable(s),
//             );
//             if (firstAvailable) {
//                 pendingConcernScrollRef.current = true;
//                 setSelectedSlot(firstAvailable);
//                 scrollToConcernSection();
//             }
//         }
//     }, [slotsData, selectedSlot, scrollToConcernSection]);

//     // Clear selection if the chosen slot becomes expired/missed
//     useEffect(() => {
//         if (selectedSlot && !isSlotBookable(selectedSlot)) {
//             setSelectedSlot(null);
//         }
//     }, [selectedSlot, slotsData]);

//     const handleContinue = async () => {
//         if (!(await requireAuth('Please login to book a consultation'))) return;
//         console.log("selectedSlotselectedSlot", selectedSlot?.id)

//         if (!selectedSlot?.id) return;

//         if (!isSlotBookable(selectedSlot)) {
//             showSuccessToast('This slot has expired. Please pick another time.', 'error');
//             setSelectedSlot(null);
//             return;
//         }

//         const selectedSlotObj = slotsData?.slots?.find(
//             (s: any) => String(s.id) === String(selectedSlot?.id)
//         );

//         navigation.navigate('RazorpayScreen', {
//             doctorInfo,
//             doctorId: doctorIdParam,
//             slotId: selectedSlot,
//             date: selectedDate,
//             selectedTime:
//                 selectedSlotObj?.displayTime ||
//                 selectedSlotObj?.start_time,
//             //    formatMessageTime( ),
//             concern,
//             patientsList,
//             medical_record_ids: selectedRecords,
//         });
//     };

//     return (
//         <SafeAreaView style={styles.container}>
//             <StatusBar backgroundColor="#F7FBF9" barStyle="dark-content" />

//             <AppHeader
//                 title="Book Appointment"
//                 leftIconName='arrow-left'
//                 onLeftPress={() =>
//                     props.navigation.goBack()
//                 }
//             />

//             <KeyboardAvoidingView
//                 style={{ flex: 1 }}
//                 behavior={
//                     Platform.OS === 'ios'
//                         ? 'padding'
//                         : 'height'
//                 }
//             >
//                 <ScrollView
//                     ref={mainScrollRef}
//                     keyboardShouldPersistTaps="handled"
//                     showsVerticalScrollIndicator={false}
//                     contentContainerStyle={styles.scrollContent}
//                     refreshControl={
//                         <RefreshControl
//                             refreshing={refreshing}
//                             onRefresh={onRefresh}
//                         />
//                     }
//                 >
//                           <View style={styles.heroCard}>
//                         <View style={styles.avatarRing}>
//                             <View style={styles.avatarWrapper}>
//                                 {doctor?.profile_image ? (
//                                     <Image
//                                         source={{ uri: doctor?.profile_image }}
//                                         style={styles.avatar}
//                                     />
//                                 ) : (
//                                     <View style={styles.avatarFallback}>
//                                         <Text style={styles.avatarLetter}>
//                                             {doctor?.full_name?.charAt(0)?.toUpperCase() || ''}
//                                         </Text>
//                                     </View>
//                                 )}
//                             </View>
//                         </View>

//                         <Text numberOfLines={2} style={styles.doctorName}>
//                             {doctor?.full_name || 'Doctor'}
//                         </Text>

//                         {!!(doctor?.designation || doctor?.qualification) && (
//                             <View style={styles.designationChip}>
//                                 <TablerIcon name="stethoscope" size={14} color={Colors.primaryColor} />
//                                 <Text numberOfLines={1} style={styles.speciality}>
//                                     {doctor?.designation || doctor?.qualification}
//                                 </Text>
//                             </View>
//                         )}

//                         {!!(doctor?.consultation_fee) && (
//                             <Text style={styles.heroFeeHint}>
//                                 Consultation from{' '}
//                                 <Text style={styles.heroFeeValue}>
//                                     {doctor?.consultation_fee}
//                                 </Text>
//                             </Text>
//                         )}
//                     </View>

//                     <View style={styles.statsContainer}>
//                         {stats.map((item, index) => (
//                             <React.Fragment key={item.id}>
//                                 <View style={styles.statItem}>
//                                     <Text style={styles.statValue}>{item.value}</Text>
//                                     <Text style={styles.statLabel}>{item.label}</Text>
//                                 </View>
//                                 {index !== stats.length - 1 ? <View style={styles.divider} /> : null}
//                             </React.Fragment>
//                         ))}
//                     </View>
//                     {/* <View style={styles.heroCard}>
//                         <View style={styles.heroTopRow}>
//                             <View style={styles.avatarWrapper}>
//                                 {doctor?.profile_image ? (
//                                     <Image
//                                         source={{ uri: doctor?.profile_image }}
//                                         style={styles.avatar}
//                                     />
//                                 ) : (
//                                     <View style={styles.avatarFallback}>
//                                         <Text style={styles.avatarLetter}>
//                                             {doctor?.full_name?.charAt(0)?.toUpperCase() || ''}
//                                         </Text>
//                                     </View>
//                                 )}
//                             </View>

//                             <View style={styles.heroInfo}>
//                                 <Text numberOfLines={2} style={styles.doctorName}>
//                                     {doctor?.full_name || 'Doctor'}
//                                 </Text>
//                                 {!!(doctor?.designation || doctor?.qualification) && (
//                                     <Text numberOfLines={1} style={styles.speciality}>
//                                         {doctor?.designation || doctor?.qualification}
//                                     </Text>
//                                 )}
//                                 <View style={styles.heroMetaRow}>
//                                     {!!(doctor?.experience_display || doctor?.experience_years) && (
//                                         <Text style={styles.heroMetaText}>
//                                             {doctor?.experience_display ||
//                                                 `${doctor?.experience_years}+ yrs`}
//                                         </Text>
//                                     )}
//                                     {!!doctor?.average_rating && (
//                                         <Text style={styles.heroMetaText}>
//                                             ★ {Number(doctor.average_rating).toFixed(1)}
//                                         </Text>
//                                     )}
//                                     {!!doctor?.consultation_fee && (
//                                         <Text style={styles.heroFeeValue}>
//                                             {doctor.consultation_fee}
//                                         </Text>
//                                     )}
//                                 </View>
//                             </View>
//                         </View>

//                         <View style={styles.heroStatsRow}>
//                             {stats.map((item, index) => (
//                                 <React.Fragment key={item.id}>
//                                     {index > 0 ? <View style={styles.heroStatDivider} /> : null}
//                                     <View style={styles.heroStatItem}>
//                                         <Text style={styles.heroStatValue}>{item.value}</Text>
//                                         <Text style={styles.heroStatLabel}>{item.label}</Text>
//                                     </View>
//                                 </React.Fragment>
//                             ))}
//                         </View>
//                     </View> */}

//                     <View style={styles.sectionCard}>
//                         <View style={styles.rowBetween}>
//                             <Text style={styles.sectionTitle}>Select date</Text>
//                             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
//                                 <TouchableOpacity disabled={monthOffset === 0} onPress={() => setMonthOffset(prev => prev - 1)}>
//                                     <Ionicons name="chevron-back" size={20} color={monthOffset === 0 ? '#CBD5E1' : Colors.primaryColor} />
//                                 </TouchableOpacity>
//                                 <Text style={styles.monthText}>{new Date(new Date().getFullYear(), new Date().getMonth() + monthOffset).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</Text>
//                                 <TouchableOpacity onPress={() => setMonthOffset(prev => prev + 1)}>
//                                     <Ionicons name="chevron-forward" size={20} color={Colors.primaryColor} />
//                                 </TouchableOpacity>
//                             </View>
//                         </View>

//                         <ScrollView
//                             ref={dateScrollRef}
//                             horizontal
//                             showsHorizontalScrollIndicator={false}
//                             contentContainerStyle={styles.daysContainer}
//                         >
//                             {DAYS.map((item: any) => {
//                                 const isActive = selectedDate === item.fullDate;
//                                 return (
//                                     <TouchableOpacity key={item.fullDate} disabled={item.isDisabled} activeOpacity={0.8} onPress={() => setSelectedDate(item.fullDate)} style={[styles.dayCard, isActive && styles.activeDayCard, item.isDisabled && { opacity: 0.45 }]}>
//                                         <Text style={[styles.dayText, isActive && { color: '#FFFFFF' }]}>{item.day}</Text>
//                                         <Text style={[styles.dateText, isActive && { color: '#FFFFFF' }]}>{item.date}</Text>
//                                         <Text style={[styles.monthDayText, isActive && { color: '#D1FAE5' }]}>{item.month}</Text>
//                                     </TouchableOpacity>
//                                 );
//                             })}
//                         </ScrollView>

//                         {loadingSlots ? (
//                             <View style={{ marginTop: 24, alignItems: 'center' }}>
//                                 <Ionicons name="hourglass-outline" size={32} color="#CBD5E1" />
//                                 <Text style={{ marginTop: 10, color: '#64748B', fontFamily: Fonts.PoppinsMedium }}>Loading available slots...</Text>
//                             </View>
//                         ) : groupedSlots?.length > 0 ? (
//                             groupedSlots.map(([sectionTitle, sectionSlots]: any) => {
//                                 const sectionIcon = sectionTitle === 'Morning' ? 'sunny-outline' : sectionTitle === 'Afternoon' ? 'partly-sunny-outline' : 'moon-outline';
//                                 return (
//                                     <View key={sectionTitle} style={styles.slotSection}>
//                                         <View style={styles.slotHeader}>
//                                             <Ionicons name={sectionIcon} size={16} color="#64748B" />
//                                             <Text style={styles.slotTitle}>{sectionTitle}</Text>
//                                         </View>

//                                         <View style={styles.slotGrid}>
//                                             {sectionSlots.map((slot: any) => {
//                                                 const status = getSlotStatusKey(slot);
//                                                 const expired = isSlotMissedOrExpired(slot);
//                                                 const isReserved = !expired && status === 'reserved';
//                                                 const isBooked = !expired && status === 'booked';
//                                                 const selectable = isSlotBookable(slot);

//                                                 return (
//                                                     <TouchableOpacity key={slot?.id} activeOpacity={0.8} disabled={!selectable}
//                                                         onPress={() => handleSelectSlot(slot)}
//                                                         style={[
//                                                             styles.slotBtn,
//                                                             selectedSlot?.id === slot.id && styles.activeSlotBtn,

//                                                             isReserved && {
//                                                                 backgroundColor: '#FEF3C7',
//                                                                 borderColor: '#F59E0B',
//                                                             },

//                                                             isBooked && {
//                                                                 backgroundColor: '#FFF1F2',
//                                                                 borderColor: '#FEE2E2',
//                                                             },

//                                                             expired && {
//                                                                 backgroundColor: '#F1F5F9',
//                                                                 borderColor: '#E2E8F0',
//                                                                 opacity: 0.72,
//                                                             },
//                                                         ]}

//                                                     >

//                                                         <Text style={[styles.slotText, selectedSlot?.id === slot?.id && styles.activeSlotText, !selectable && { color: '#94A3B8' }]}>{slot?.displayTime}</Text>

//                                                         {isBooked && <Text style={styles.slotStatus}>Booked</Text>}

//                                                         {isReserved && (
//                                                             <Text style={styles.slotStatus}>
//                                                                 Reserved
//                                                             </Text>
//                                                         )}

//                                                         {expired && (
//                                                             <Text style={styles.slotStatus}>
//                                                                 {status === 'missed' ? 'Missed' : 'Expired'}
//                                                             </Text>
//                                                         )}

//                                                     </TouchableOpacity>
//                                                 );
//                                             })}
//                                         </View>
//                                     </View>
//                                 );
//                             })
//                         ) : (
//                             <View style={styles.emptyContainer}>
//                                 <Ionicons name="calendar-outline" size={42} color="#CBD5E1" />
//                                 <Text style={styles.emptyTitle}>No Slots Available</Text>
//                             </View>
//                         )}
//                     </View>

//                     <View
//                         style={styles.sectionCard}
//                         onLayout={event => {
//                             handleConcernSectionLayout(event.nativeEvent.layout.y);
//                         }}
//                     >
//                         <Text style={styles.sectionTitle}>
//                             Your concern
//                         </Text>
//                         <Text style={styles.sectionHint}>
//                             Optional — helps the doctor prepare for your visit
//                         </Text>

//                         <TextInput
//                             multiline
//                             value={concern}
//                             onChangeText={setConcern}
//                             placeholder="Briefly describe your symptoms..."
//                             placeholderTextColor="#94A3B8"
//                             style={styles.input}
//                             textAlignVertical="top"
//                         />

//                         <PrescriptionUpload
//                             records={patientsRecord}
//                             selectedRecords={selectedRecords}
//                             uploading={uploading}
//                             onSelectRecord={setSelectedRecords}
//                             onUpload={selectFile}
//                             CameraUpload={CameraUpload}
//                         />

//                     </View>

//                     <UploadRecordModal
//                         visible={modalVisible}
//                         file={pickedFile}
//                         uploading={uploading}
//                         onClose={closeUploadModal}
//                         onSubmit={submitRecord}
//                     />

//                 </ScrollView>

//                 <View style={[styles.footer, { paddingBottom: footerBottomPad }]}>
//                     <View style={styles.priceContainer}>
//                         <Text style={styles.feeLabel}>Consult Fee</Text>
//                         <Text style={styles.price}>
//                             {selectedSlot?.amount ?? doctor?.consultation_fee ?? doctorDetails?.consultation_fee ?? 0}
//                         </Text>
//                     </View>

//                     <TouchableOpacity
//                         activeOpacity={0.85}
//                         disabled={!selectedSlot?.id || loadingSlots || groupedSlots.length === 0}
//                         style={[
//                             styles.payBtn,
//                             (!selectedSlot?.id || loadingSlots || groupedSlots?.length === 0) &&
//                                 styles.payBtnDisabled,
//                         ]}
//                         onPress={handleContinue}
//                     >
//                         <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
//                         <Text style={styles.payText} numberOfLines={1}>
//                             {loadingSlots ? 'Loading...' : 'Continue'}
//                         </Text>
//                     </TouchableOpacity>
//                 </View>
//             </KeyboardAvoidingView>
//         </SafeAreaView>
//     );
// };

// export default DoctorSlot;

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#F7FBF9' },
//     scrollContent: { paddingBottom: 20, backgroundColor: '#F7FBF9' },
//     heroCard: {
//         marginHorizontal: 16,
//         marginTop: 6,
//         paddingVertical: 12,
//         paddingHorizontal: 12,
//         borderRadius: 16,
//         backgroundColor: '#FFFFFF',
//         borderWidth: 1,
//         borderColor: '#E8F2EE',
//     },
//     heroTopRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 12,
//     },
//     avatarWrapper: {
//         width: 72,
//         height: 72,
//         borderRadius: 16,
//         backgroundColor: '#F0F7F4',
//         overflow: 'hidden',
//         alignItems: 'center',
//         justifyContent: 'center',
//         borderWidth: 1,
//         borderColor: '#D7EBE3',
//     },
//     avatar: {
//         width: '100%',
//         height: '100%',
//         resizeMode: 'cover',
//     },
//     avatarFallback: {
//         width: '100%',
//         height: '100%',
//         backgroundColor: Colors.primaryColor,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     avatarLetter: {
//         fontSize: 26,
//         color: '#FFFFFF',
//         fontFamily: Fonts.PoppinsBold,
//     },
//     heroInfo: {
//         flex: 1,
//         minWidth: 0,
//     },
//     doctorName: {
//         fontSize: 17,
//         lineHeight: 22,
//         fontFamily: Fonts.PoppinsSemiBold,
//         color: '#0F172A',
//     },
//       designationChip: {
//         marginTop: 10,
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 6,
//         maxWidth: '92%',
//         paddingHorizontal: 12,
//         paddingVertical: 6,
//         borderRadius: 999,
//         backgroundColor: '#ECF8F3',
//     },
//        avatarRing: {
//         padding: 4,
//         borderRadius: 28,
//         borderWidth: 2,
//         borderColor: '#C8E6DC',
//         marginBottom: 4,
//     },
//     speciality: {
//         marginTop: 2,
//         fontSize: 12,
//         fontFamily: Fonts.PoppinsMedium,
//         color: Colors.primaryColor,
//     },
//     heroMetaRow: {
//         marginTop: 6,
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         alignItems: 'center',
//         gap: 8,
//     },
//     heroMetaText: {
//         fontSize: 11,
//         fontFamily: Fonts.PoppinsMedium,
//         color: '#64748B',
//         backgroundColor: '#F1F5F9',
//         paddingHorizontal: 8,
//         paddingVertical: 3,
//         borderRadius: 8,
//     },
//      heroFeeHint: {
//         marginTop: 12,
//         fontSize: 13,
//         fontFamily: Fonts.PoppinsMedium,
//         color: '#64748B',
//     },
//     heroFeeValue: {
//         color: Colors.primaryColor,
//         fontFamily: Fonts.PoppinsSemiBold,
//     },
//     statsContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginTop: 14,
//         marginHorizontal: 16,
//         backgroundColor: '#FFFFFF',
//         borderRadius: 20,
//         borderWidth: 1,
//         borderColor: '#E8F2EE',
//         overflow: 'hidden',
//     },
//     statItem: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingVertical: 16,
//         paddingHorizontal: 8,
//     },
//     divider: {
//         width: 1,
//         height: 36,
//         backgroundColor: '#E8F2EE',
//     },
//     statValue: {
//         fontSize: 20,
//         fontFamily: Fonts.PoppinsBold,
//         color: '#0F172A',
//     },
//     statLabel: {
//         marginTop: 2,
//         fontSize: 10,
//         letterSpacing: 0.4,
//         fontFamily: Fonts.PoppinsMedium,
//         color: '#94A3B8',
//         textAlign: 'center',
//     },

//     // heroFeeValue: {
//     //     fontSize: 12,
//     //     color: Colors.primaryColor,
//     //     fontFamily: Fonts.PoppinsSemiBold,
//     //     backgroundColor: '#ECF8F3',
//     //     paddingHorizontal: 8,
//     //     paddingVertical: 3,
//     //     borderRadius: 8,
//     //     overflow: 'hidden',
//     // },
//     heroStatsRow: {
//         marginTop: 10,
//         flexDirection: 'row',
//         alignItems: 'center',
//         borderTopWidth: 1,
//         borderTopColor: '#EEF5F2',
//         paddingTop: 10,
//     },
//     heroStatItem: {
//         flex: 1,
//         alignItems: 'center',
//     },
//     heroStatDivider: {
//         width: 1,
//         height: 28,
//         backgroundColor: '#E8F2EE',
//     },
//     heroStatValue: {
//         fontSize: 15,
//         fontFamily: Fonts.PoppinsBold,
//         color: '#0F172A',
//     },
//     heroStatLabel: {
//         marginTop: 1,
//         fontSize: 9,
//         letterSpacing: 0.3,
//         fontFamily: Fonts.PoppinsMedium,
//         color: '#94A3B8',
//     },
//     sectionCard: {
//         marginTop: 10,
//         marginHorizontal: 16,
//         padding: 14,
//         borderRadius: 20,
//         backgroundColor: '#FFFFFF',
//         borderWidth: 1,
//         borderColor: '#E8F2EE',
//     },
//     sectionHint: {
//         marginTop: 4,
//         marginBottom: 4,
//         fontSize: 12,
//         color: '#94A3B8',
//         fontFamily: Fonts.PoppinsMedium,
//     },
//     rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
//     sectionTitle: { fontSize: 16, fontFamily: Fonts.PoppinsSemiBold, color: '#0F172A' },
//     monthText: { fontSize: 13, fontFamily: Fonts.PoppinsSemiBold, color: Colors.primaryColor },
//     daysContainer: { paddingTop: 16, paddingBottom: 4 },
//     dayCard: {
//         backgroundColor: '#FFFFFF',
//         borderWidth: 1.5,
//         borderColor: '#E8F2EE',
//         width: CARD_WIDTH,
//         height: CARD_HEIGHT,
//         borderRadius: 18,
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginRight: 10,
//         paddingHorizontal: 6,
//     },
//     activeDayCard: {
//         backgroundColor: Colors.primaryColor,
//         borderColor: Colors.primaryColor,
//     },
//     dayText: { fontSize: Math.round(CARD_WIDTH * 0.18), fontFamily: Fonts.PoppinsMedium, color: '#64748B' },
//     dateText: { fontSize: Math.round(CARD_WIDTH * 0.28), fontFamily: Fonts.PoppinsSemiBold, color: '#0F172A' },
//     monthDayText: { fontSize: Math.round(CARD_WIDTH * 0.12), marginTop: 2, color: '#94A3B8', fontFamily: Fonts.PoppinsMedium },
//     slotSection: { marginTop: 18 },
//     slotHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
//     slotTitle: { marginLeft: 6, fontSize: 12, fontFamily: Fonts.PoppinsSemiBold, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.4 },
//     slotGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
//     slotBtn: {
//         width: '31%',
//         minHeight: 52,
//         borderRadius: 16,
//         borderWidth: 1.5,
//         borderColor: '#E8F2EE',
//         backgroundColor: '#FFFFFF',
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginBottom: 10,
//         paddingHorizontal: 8,
//         paddingVertical: 8,
//     },
//     activeSlotBtn: {
//         backgroundColor: Colors.primaryColor,
//         borderColor: Colors.primaryColor,
//     },
//     slotText: {
//         fontSize: 13,
//         fontFamily: Fonts.PoppinsSemiBold,
//         color: '#334155',
//         textAlign: 'center',
//         includeFontPadding: false,
//     },
//     activeSlotText: {
//         color: '#FFFFFF',
//         fontFamily: Fonts.PoppinsSemiBold,
//         fontSize: 13,
//     },
//     emptyContainer: { marginTop: 28, alignItems: 'center', justifyContent: 'center' },
//     emptyTitle: { marginTop: 10, fontSize: 15, color: '#94A3B8', fontFamily: Fonts.PoppinsMedium },
//     slotStatus: { marginTop: 3, fontSize: 10, color: '#64748B', fontFamily: Fonts.PoppinsMedium },
//     input: {
//         marginTop: 12,
//         height: 110,
//         borderRadius: 16,
//         backgroundColor: '#F8FAFC',
//         borderWidth: 1,
//         borderColor: '#E2E8F0',
//         padding: 14,
//         fontFamily: Fonts.PoppinsMedium,
//         fontSize: 14,
//         color: '#0F172A',
//     },
//     footer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingTop: 12,
//         paddingHorizontal: 16,
//         borderTopWidth: 1,
//         borderTopColor: '#E8F2EE',
//         backgroundColor: '#FFFFFF',
//     },
//     priceContainer: {
//         marginRight: 14,
//         minWidth: 96,
//     },
//     feeLabel: {
//         fontSize: 12,
//         fontFamily: Fonts.PoppinsMedium,
//         color: '#94A3B8',
//     },
//     price: {
//         fontSize: 24,
//         fontFamily: Fonts.PoppinsBold,
//         color: Colors.primaryColor,
//     },
//     payBtn: {
//         flex: 1,
//         minHeight: 54,
//         borderRadius: 16,
//         backgroundColor: Colors.primaryColor,
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingHorizontal: 12,
//     },
//     payBtnDisabled: {
//         opacity: 0.55,
//         backgroundColor: '#94A3B8',
//     },
//     payText: {
//         marginLeft: 8,
//         fontSize: 15,
//         fontFamily: Fonts.PoppinsSemiBold,
//         color: '#FFFFFF',
//         flexShrink: 1,
//     },
// });
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../common/Colors';
import { formatDate, generateFutureDates, } from '../../common/DataInterface';
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
import { launchCamera } from 'react-native-image-picker';
import { Ionicons } from '../../common/Vector';
import TablerIcon from '../../components/TablerIcon';
import { requireAuth } from '../../services/guestAuth';
import UploadRecordModal from '../../components/UploadRecordModal';
import AppHeader from '../../components/AppHeader';
import { formatMessageTime } from '../../chatSystem/utils/dateFormatter';
import DoctorConsultationSection from '../../components/consult/DoctorConsultationSection';
import { showSuccessToast } from '../../config/Key';
import { RupeeAmount } from '../../utils/currencyUtils';


const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(92, Math.max(64, Math.floor(SCREEN_WIDTH * 0.168)));
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.12);


const DoctorSlot = (props: any) => {

    const { route, navigation } = props;
    const insets = useSafeAreaInsets();
    const footerBottomPad = Math.max(insets.bottom, 12);

    const [selectedRecords, setSelectedRecords] =
        useState<string[]>([]);

    const { doctorDetails } = route?.params || {};

    const { patientsRecord, patientsList, fetchPatientsRecord, } = useMedicalRecord();

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
    const doctorInfo = useMemo(() => doctorDetails, [doctorDetails]);
    const doctor = useMemo(
        () => ({
            ...doctorInfo,
            ...doctorDetailData,
        }),
        [doctorInfo, doctorDetailData],
    );

    const stats = useMemo(
        () => [
            {
                id: '1',
                value: doctor?.patients_display || doctor?.total_patients || 0,
                label: 'PATIENTS',
            },
            {
                id: '2',
                value: doctor?.total_reviews || 0,
                label: 'REVIEWS',
            },
            {
                id: '3',
                value: doctor?.experience_display || `${doctor?.experience_years || 0}+`,
                label: 'EXPERIENCE',
            },
        ],
        [doctor],
    );

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
    const doctorIdParam = doctorDetails?.id;

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

    const isFirstRender = useRef(true);

    useEffect(() => {
        const todayIndex = DAYS.findIndex(
            (item: any) => item.isToday,
        );

        if (todayIndex >= 0) {
            setTimeout(() => {
                dateScrollRef.current?.scrollTo({
                    x: todayIndex * (CARD_WIDTH + 12),
                    animated: false,
                });
            }, 100);
        }
    }, [DAYS]);

    const fetchSlotsForDate = useCallback(async (date: string) => {
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
            if (rawData) {
                setDoctorDetailData(rawData);
            }
        } finally {
            setLoadingSlots(false);
        }
    }, [doctorIdParam]);

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
        [slotsData]
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
        console.log("selectedSlotselectedSlot", selectedSlot?.id)

        if (!selectedSlot?.id) return;

        if (!isSlotBookable(selectedSlot)) {
            showSuccessToast('This slot has expired. Please pick another time.', 'error');
            setSelectedSlot(null);
            return;
        }

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
            //    formatMessageTime( ),
            concern,
            patientsList,
            medical_record_ids: selectedRecords,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#F7FBF9" barStyle="dark-content" />

            <AppHeader
                title="Book Appointment"
                leftIconName='arrow-left'
                onLeftPress={() =>
                    props.navigation.goBack()
                }
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
                    ref={mainScrollRef}
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
                    <View style={styles.heroCard}>
                        <View style={styles.avatarRing}>
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
                        </View>

                        <Text numberOfLines={2} style={styles.doctorName}>
                            {doctor?.full_name || 'Doctor'}
                        </Text>

                        {!!(doctor?.designation || doctor?.qualification) && (
                            <View style={styles.designationChip}>
                                <TablerIcon name="stethoscope" size={14} color={Colors.primaryColor} />
                                <Text numberOfLines={1} style={styles.speciality}>
                                    {doctor?.designation || doctor?.qualification}
                                </Text>
                            </View>
                        )}

                        {!!(doctor?.consultation_fee) && (
                            <View style={styles.heroFeeHintRow}>
                                <Text style={styles.heroFeeHint}>Consultation from </Text>
                                <RupeeAmount
                                    value={doctor?.consultation_fee}
                                    style={styles.heroFeeValue}
                                    iconSize={14}
                                    iconColor={Colors.primaryColor}
                                />
                            </View>
                        )}
                    </View>

                    <View style={styles.statsContainer}>
                        {stats.map((item, index) => (
                            <React.Fragment key={item.id}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{item.value}</Text>
                                    <Text style={styles.statLabel}>{item.label}</Text>
                                </View>
                                {index !== stats.length - 1 ? <View style={styles.divider} /> : null}
                            </React.Fragment>
                        ))}
                    </View>

                    <View style={styles.sectionCard}>
                        <View style={styles.rowBetween}>
                            <Text style={styles.sectionTitle}>Select date</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <TouchableOpacity disabled={monthOffset === 0} onPress={() => setMonthOffset(prev => prev - 1)}>
                                    <Ionicons name="chevron-back" size={20} color={monthOffset === 0 ? '#CBD5E1' : Colors.primaryColor} />
                                </TouchableOpacity>
                                <Text style={styles.monthText}>{new Date(new Date().getFullYear(), new Date().getMonth() + monthOffset).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</Text>
                                <TouchableOpacity onPress={() => setMonthOffset(prev => prev + 1)}>
                                    <Ionicons name="chevron-forward" size={20} color={Colors.primaryColor} />
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
                                    <TouchableOpacity key={item.fullDate} disabled={item.isDisabled} activeOpacity={0.8} onPress={() => {
                                        if (item.fullDate !== selectedDate) {
                                            setSelectedSlot(null);
                                        }
                                        setSelectedDate(item.fullDate);
                                    }} style={[styles.dayCard, isActive && styles.activeDayCard, item.isDisabled && { opacity: 0.45 }]}>
                                        <Text style={[styles.dayText, isActive && { color: '#FFFFFF' }]}>{item.day}</Text>
                                        <Text style={[styles.dateText, isActive && { color: '#FFFFFF' }]}>{item.date}</Text>
                                        <Text style={[styles.monthDayText, isActive && { color: '#D1FAE5' }]}>{item.month}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

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
                                            <Ionicons name={sectionIcon} size={16} color="#64748B" />
                                            <Text style={styles.slotTitle}>{sectionTitle}</Text>
                                        </View>

                                        <View style={styles.slotGrid}>
                                            {sectionSlots.map((slot: any, slotIndex: number) => {
                                                const status = getSlotStatusKey(slot);
                                                const expired = isSlotMissedOrExpired(slot);
                                                const isReserved = !expired && status === 'reserved';
                                                const isBooked = !expired && status === 'booked';
                                                const selectable = isSlotBookable(slot);

                                                return (
                                                    <TouchableOpacity
                                                        key={String(
                                                            slot?.id ??
                                                              `${slot?.start_time}-${slotIndex}`,
                                                        )}
                                                        activeOpacity={0.8}
                                                        disabled={!selectable}
                                                        onPress={() => handleSelectSlot(slot)}
                                                        style={[
                                                            styles.slotBtn,
                                                            isSameSlot(selectedSlot, slot) && styles.activeSlotBtn,

                                                            isReserved && {
                                                                backgroundColor: '#FEF3C7',
                                                                borderColor: '#F59E0B',
                                                            },

                                                            isBooked && {
                                                                backgroundColor: '#FFF1F2',
                                                                borderColor: '#FEE2E2',
                                                            },

                                                            expired && {
                                                                backgroundColor: '#F1F5F9',
                                                                borderColor: '#E2E8F0',
                                                                opacity: 0.72,
                                                            },
                                                        ]}

                                                    >

                                                        <Text style={[styles.slotText, isSameSlot(selectedSlot, slot) && styles.activeSlotText, !selectable && { color: '#94A3B8' }]}>{slot?.displayTime}</Text>

                                                        {isBooked && <Text style={styles.slotStatus}>Booked</Text>}

                                                        {isReserved && (
                                                            <Text style={styles.slotStatus}>
                                                                Reserved
                                                            </Text>
                                                        )}

                                                        {expired && (
                                                            <Text style={styles.slotStatus}>
                                                                {status === 'missed' ? 'Missed' : 'Expired'}
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

                    <View
                        style={styles.sectionCard}
                        onLayout={event => {
                            handleConcernSectionLayout(event.nativeEvent.layout.y);
                        }}
                    >
                        <Text style={styles.sectionTitle}>
                            Your concern
                        </Text>
                        <Text style={styles.sectionHint}>
                            Optional — helps the doctor prepare for your visit
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

                </ScrollView>

                <View style={[styles.footer, { paddingBottom: footerBottomPad }]}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.feeLabel}>Consult Fee</Text>
                        <RupeeAmount
                            value={
                                selectedSlot?.amount ??
                                doctor?.consultation_fee ??
                                doctorDetails?.consultation_fee ??
                                0
                            }
                            style={styles.price}
                            iconSize={16}
                            iconColor={Colors.primaryColor}
                        />
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        disabled={
                            loadingSlots ||
                            groupedSlots.length === 0 ||
                            !selectedSlot ||
                            !isSlotBookable(withSlotDate(selectedSlot, selectedDate))
                        }
                        style={[
                            styles.payBtn,
                            (loadingSlots ||
                                groupedSlots.length === 0 ||
                                !selectedSlot ||
                                !isSlotBookable(withSlotDate(selectedSlot, selectedDate))) &&
                                styles.payBtnDisabled,
                        ]}
                        onPress={handleContinue}
                    >
                        <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.payText} numberOfLines={1}>
                            {loadingSlots ? 'Loading...' : 'Continue'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default DoctorSlot;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FBF9' },
    scrollContent: { paddingBottom: 20, backgroundColor: '#F7FBF9' },
    heroCard: {
        marginHorizontal: 16,
        marginTop: 8,
        paddingTop: 28,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8F2EE',
    },
    avatarRing: {
        padding: 4,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: '#C8E6DC',
        marginBottom: 4,
    },
    avatarWrapper: {
        width: SCREEN_WIDTH * 0.28,
        height: SCREEN_WIDTH * 0.28,
        maxWidth: 112,
        maxHeight: 112,
        minWidth: 92,
        minHeight: 92,
        borderRadius: 24,
        backgroundColor: '#F0F7F4',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 22,
        resizeMode: 'cover',
    },
    avatarFallback: {
        width: '100%',
        height: '100%',
        borderRadius: 22,
        backgroundColor: Colors.primaryColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarLetter: {
        fontSize: 34,
        color: '#FFFFFF',
        fontFamily: Fonts.PoppinsBold,
    },
    doctorName: {
        marginTop: 14,
        fontSize: 24,
        lineHeight: 32,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#0F172A',
        textAlign: 'center',
        paddingHorizontal: 8,
    },
    designationChip: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        maxWidth: '92%',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: '#ECF8F3',
    },
    speciality: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsMedium,
        color: Colors.primaryColor,
        flexShrink: 1,
    },
    heroFeeHint: {
        marginTop: 12,
        fontSize: 13,
        fontFamily: Fonts.PoppinsMedium,
        color: '#64748B',
    },
    heroFeeHintRow: {
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 4,
    },
    heroFeeValue: {
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
        marginHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E8F2EE',
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
        height: 36,
        backgroundColor: '#E8F2EE',
    },
    statValue: {
        fontSize: 20,
        fontFamily: Fonts.PoppinsBold,
        color: '#0F172A',
    },
    statLabel: {
        marginTop: 2,
        fontSize: 10,
        letterSpacing: 0.4,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
        textAlign: 'center',
    },
    sectionCard: {
        marginTop: 14,
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8F2EE',
    },
    sectionHint: {
        marginTop: 4,
        marginBottom: 4,
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsMedium,
    },
    rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sectionTitle: { fontSize: 16, fontFamily: Fonts.PoppinsSemiBold, color: '#0F172A' },
    monthText: { fontSize: 13, fontFamily: Fonts.PoppinsSemiBold, color: Colors.primaryColor },
    daysContainer: { paddingTop: 16, paddingBottom: 4 },
    dayCard: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E8F2EE',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        paddingHorizontal: 6,
    },
    activeDayCard: {
        backgroundColor: Colors.primaryColor,
        borderColor: Colors.primaryColor,
    },
    dayText: { fontSize: Math.round(CARD_WIDTH * 0.18), fontFamily: Fonts.PoppinsMedium, color: '#64748B' },
    dateText: { fontSize: Math.round(CARD_WIDTH * 0.28), fontFamily: Fonts.PoppinsSemiBold, color: '#0F172A' },
    monthDayText: { fontSize: Math.round(CARD_WIDTH * 0.12), marginTop: 2, color: '#94A3B8', fontFamily: Fonts.PoppinsMedium },
    slotSection: { marginTop: 18 },
    slotHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    slotTitle: { marginLeft: 6, fontSize: 12, fontFamily: Fonts.PoppinsSemiBold, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.4 },
    slotGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    slotBtn: {
        width: '31%',
        minHeight: 52,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E8F2EE',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    activeSlotBtn: {
        backgroundColor: Colors.primaryColor,
        borderColor: Colors.primaryColor,
    },
    slotText: {
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#334155',
        textAlign: 'center',
        includeFontPadding: false,
    },
    activeSlotText: {
        color: '#FFFFFF',
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 13,
    },
    emptyContainer: { marginTop: 28, alignItems: 'center', justifyContent: 'center' },
    emptyTitle: { marginTop: 10, fontSize: 15, color: '#94A3B8', fontFamily: Fonts.PoppinsMedium },
    slotStatus: { marginTop: 3, fontSize: 10, color: '#64748B', fontFamily: Fonts.PoppinsMedium },
    input: {
        marginTop: 12,
        height: 110,
        borderRadius: 16,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 14,
        fontFamily: Fonts.PoppinsMedium,
        fontSize: 14,
        color: '#0F172A',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: '#E8F2EE',
        backgroundColor: '#FFFFFF',
    },
    priceContainer: {
        marginRight: 14,
        minWidth: 96,
    },
    feeLabel: {
        fontSize: 12,
        fontFamily: Fonts.PoppinsMedium,
        color: '#94A3B8',
    },
    price: {
        fontSize: 24,
        fontFamily: Fonts.PoppinsBold,
        color: Colors.primaryColor,
    },
    payBtn: {
        flex: 1,
        minHeight: 54,
        borderRadius: 16,
        backgroundColor: Colors.primaryColor,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    payBtnDisabled: {
        opacity: 0.55,
        backgroundColor: '#94A3B8',
    },
    payText: {
        marginLeft: 8,
        fontSize: 15,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#FFFFFF',
        flexShrink: 1,
    },
});