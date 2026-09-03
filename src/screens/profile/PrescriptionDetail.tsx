// import React, { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
// import {
//     View,
//     Text,
//     StyleSheet,
//     ScrollView,
//     TouchableOpacity,
//     Image,
//     Dimensions,
//     Linking,
//     ActivityIndicator,
//     Share,
//     StatusBar,
// } from 'react-native';
// import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
// import AppHeader from '../../components/AppHeader';
// import { Images } from '../../common/Images';
// import { Fonts } from '../../common/Fonts';
// import { Colors } from '../../common/Colors';
// import TablerIcon from '../../components/TablerIcon';
// import * as _CONSULT_SERVICE from '../../services/ConsultServce';
// import {
//     consultationHasPrescription,
//     formatIssuedLabel,
//     getAllergiesList,
//     getClinicalAdvisory,
//     getConcernText,
//     getDiagnosisText,
//     getDietAdvice,
//     getDoList,
//     getDontList,
//     getFamilyHistoryText,
//     getFollowUpInfo,
//     getMedicineItems,
//     getMedicinePrice,
//     getMedicineScheduleChips,
//     getPastIllnessText,
//     getPaymentAmount,
//     getRecommendedDietPlans,
//     getSuggestionList,
//     getSymptomDescription,
//     normalizePrescriptionPayload,
// } from '../../utils/prescriptionDetailUtils';
// import { getDoctorLocationLine } from '../../utils/doctorSlipUtils';
// import { showSuccessToast } from '../../config/Key';
// import { RupeeAmount } from '../../utils/currencyUtils';
// import { saveAndOpenPdfBase64 } from '../../utils/fileDownloadUtils';
// import { Buffer } from 'buffer';

// const { width } = Dimensions.get('window');

// const COLORS = {
//     primary: '#0D614E',
//     secondary: '#64748B',
//     background: '#F5F7F6',
//     white: '#FFFFFF',
//     border: '#E5E7EB',
//     text: '#0F172A',
//     success: '#10B981',
//     successBg: '#E8F7EF',
//     lightGray: '#F3F4F6',
//     mint: '#EEF3F1',
// };

// const handleCall = (phoneNumber?: string) => {
//     if (!phoneNumber) return;
//     Linking.openURL(`tel:${phoneNumber}`).catch(() => undefined);
// };

// const SectionTitle = ({ title }: { title: string }) => (
//     <View style={styles.sectionTitleWrap}>
//         <Text style={styles.sectionTitle}>{title}</Text>
//         <View style={styles.sectionUnderline} />
//     </View>
// );

// const AdviceRow = ({
//     icon,
//     text,
//     tone = 'default',
// }: {
//     icon: 'clock' | 'circle-check' | 'alert-circle' | 'leaf' | 'plus' | 'x';
//     text: string;
//     tone?: 'default' | 'do' | 'dont';
// }) => {
//     const iconColor =
//         tone === 'do' ? '#047857' : tone === 'dont' ? '#B91C1C' : COLORS.primary;
//     return (
//         <View style={styles.adviceRow}>
//             <View
//                 style={[
//                     styles.adviceIconWrap,
//                     tone === 'do' && styles.adviceIconDo,
//                     tone === 'dont' && styles.adviceIconDont,
//                 ]}
//             >
//                 <TablerIcon name={icon} size={14} color={iconColor} />
//             </View>
//             <Text style={styles.adviceText}>{text}</Text>
//         </View>
//     );
// };

// const HistoryBlock = ({
//     icon,
//     title,
//     tone = 'default',
//     children,
// }: {
//     icon: 'stethoscope' | 'alert-circle' | 'clipboard-list' | 'users' | 'heart';
//     title: string;
//     tone?: 'default' | 'alert' | 'family';
//     children: ReactNode;
// }) => (
//     <View
//         style={[
//             styles.historyCard,
//             tone === 'alert' && styles.historyCardAlert,
//             tone === 'family' && styles.historyCardFamily,
//         ]}
//     >
//         <View style={styles.historyHeader}>
//             <View
//                 style={[
//                     styles.historyIconWrap,
//                     tone === 'alert' && styles.historyIconAlert,
//                     tone === 'family' && styles.historyIconFamily,
//                 ]}
//             >
//                 <TablerIcon
//                     name={icon}
//                     size={15}
//                     color={
//                         tone === 'alert'
//                             ? '#B45309'
//                             : tone === 'family'
//                                 ? '#6D28D9'
//                                 : COLORS.primary
//                     }
//                 />
//             </View>
//             <Text style={styles.historyTitle}>{title}</Text>
//         </View>
//         {children}
//     </View>
// );

// const PrescriptionDetail = (props: any) => {
//     const insets = useSafeAreaInsets();
//     const params = props?.route?.params || {};

//     const lookupId = String(
//         params.appointment_id ||
//         params.consultation_id ||
//         params.PrisData?.appointment_id ||
//         params.PrisData?.consultation_id ||
//         '',
//     ).trim();

//     const [loading, setLoading] = useState(true);
//     const [downloadingPdf, setDownloadingPdf] = useState(false);
//     const [payload, setPayload] = useState<any>(
//         params.PrisData
//             ? { ...params.PrisData, doctor: params.doctorData || params.PrisData?.doctor }
//             : null,
//     );
//     const hasSeedData = useMemo(
//         () => consultationHasPrescription(params.PrisData),
//         // eslint-disable-next-line react-hooks/exhaustive-deps -- seed from first navigation only
//         [],
//     );

//     const fetchPrescription = useCallback(async () => {
//         if (!lookupId) {
//             if (!params.PrisData) {
//                 showSuccessToast('Appointment id missing', 'error');
//             }
//             setLoading(false);
//             return;
//         }

//         try {
//             if (!hasSeedData) {
//                 setLoading(true);
//             }
//             const res = await _CONSULT_SERVICE.getAppointmentDetail(lookupId);
//             console.log("prescriitonbyApntmetid,", res);
//             if (!res?.success) {
//                 if (!hasSeedData) {
//                     showSuccessToast(res?.message || 'Prescription not found', 'error');
//                     if (!params.PrisData) setPayload(null);
//                 }
//                 return;
//             }
//             setPayload(res?.data ?? null);
//         } catch {
//             if (!hasSeedData) {
//                 showSuccessToast('Unable to load prescription', 'error');
//             }
//         } finally {
//             setLoading(false);
//         }
//     }, [lookupId, hasSeedData]);

//     useEffect(() => {
//         fetchPrescription();
//     }, [fetchPrescription]);

//     const normalized = useMemo(
//         () => normalizePrescriptionPayload(payload),
//         [payload],
//     );

//     const doctor = normalized.doctor || params.doctorData || null;
//     const patient = normalized.patient;
//     const prescription = normalized.prescription;
//     const medicines = getMedicineItems(prescription);
//     const dietPlans = getRecommendedDietPlans(payload);
//     const dietItems = getDietAdvice(prescription);
//     const doItems = getDoList(prescription);
//     const dontItems = getDontList(prescription);
//     const suggestions = getSuggestionList(prescription);
//     const clinicalAdvisory = getClinicalAdvisory(prescription);
//     const doctorLocation = getDoctorLocationLine(doctor);
//     const doctorId = doctor?.doctor_id || doctor?.id || null;
//     const hasContent = consultationHasPrescription(payload);
//     const paymentAmount = getPaymentAmount(payload);
//     const concernText = getConcernText(payload);
//     const diagnosisText = getDiagnosisText(prescription);
//     const prescriptionCode = String(
//         prescription?.prescription_code || '',
//     ).trim();
//     const symptomText = getSymptomDescription(prescription);
//     const allergies = getAllergiesList(prescription);
//     const pastIllnessText = getPastIllnessText(prescription);
//     const familyHistoryText = getFamilyHistoryText(prescription);
//     const followUp = getFollowUpInfo(prescription, normalized.appointment);
//     const hasClinicalHistory =
//         !!symptomText ||
//         allergies.length > 0 ||
//         !!pastIllnessText ||
//         !!familyHistoryText;
//     const appointmentNotes = String(
//         normalized.appointment?.appointment_notes ||
//         payload?.appointment_notes ||
//         '',
//     ).trim();
//     const paymentMethod = String(
//         payload?.payment?.payment_method ||
//         payload?.payment?.mode ||
//         normalized.appointment?.payment?.payment_method ||
//         '',
//     ).trim();
//     const paymentStatus = String(
//         payload?.payment?.payment_status ||
//         payload?.payment?.status ||
//         normalized.appointment?.payment?.payment_status ||
//         '',
//     ).trim();

//     const openDietPlan = useCallback(
//         (diet: any) => {
//             const planId =
//                 diet?.diet_plan_id ||
//                 diet?.id ||
//                 diet?.plan_id ||
//                 null;
//             if (!planId) {
//                 showSuccessToast('Diet plan unavailable', 'error');
//                 return;
//             }
//             props.navigation.navigate('DietScreen', {
//                 item: {
//                     ...diet,
//                     id: planId,
//                     diet_plan_id: planId,
//                     name: diet?.name || diet?.title || 'Diet Plan',
//                 },
//             });
//         },
//         [props.navigation],
//     );

//     const openViewAll = () => {
//         if (!doctorId) {
//             showSuccessToast('Doctor details unavailable', 'error');
//             return;
//         }
//         props.navigation.navigate('DoctorConsultationHistory', {
//             doctorID: doctorId,
//             doctorName: doctor?.doctor_name,
//         });
//     };

//     const onShare = async () => {
//         try {
//             const medicineSummary = medicines
//                 .map((m: any) => m?.medicine_name)
//                 .filter(Boolean)
//                 .join(', ');
//             await Share.share({
//                 message: [
//                     `Prescription for ${patient?.patient_name || 'patient'}`,
//                     doctor?.doctor_name ? `Doctor: ${doctor.doctor_name}` : '',
//                     medicineSummary ? `Medicines: ${medicineSummary}` : '',
//                 ]
//                     .filter(Boolean)
//                     .join('\n'),
//             });
//         } catch {
//             // ignore
//         }
//     };

//     const onDownloadPdf = useCallback(async () => {
//         if (downloadingPdf) return;

//         const prescriptionId =
//             normalized.prescriptionId ||
//             String(
//                 prescription?.id ||
//                 prescription?.prescription_id ||
//                 '',
//             ).trim();

//         if (!prescriptionId) {
//             showSuccessToast('Prescription id missing', 'error');
//             return;
//         }

//         try {
//             setDownloadingPdf(true);

//             const response =
//                 await _CONSULT_SERVICE.downloadPrescriptionFile(
//                     prescriptionId,
//                 );

//             if (!response?.success) {
//                 throw new Error('Prescription PDF data not found');
//             }

//             let base64 = '';

//             /**
//              * API returned binary PDF
//              */
//             if (response.data) {
//                 base64 = Buffer.from(
//                     new Uint8Array(response.data),
//                 ).toString('base64');
//             }

//             /**
//              * API returned base64 directly
//              */
//             if (response.base64) {
//                 base64 = response.base64;
//             }

//             if (!base64) {
//                 throw new Error('Prescription PDF data is empty');
//             }

//             const code = String(
//                 prescription?.prescription_code ||
//                 prescriptionId,
//             )
//                 .replace(/[^a-zA-Z0-9._-]/g, '_')
//                 .slice(0, 40);

//             const fileName =
//                 `Ayurmuni_Prescription_${code}.pdf`;

//             /**
//              * Save PDF to device
//              */
//             const { savedLabel } =
//                 await saveAndOpenPdfBase64(
//                     base64,
//                     fileName,
//                 );

//             showSuccessToast(
//                 `Prescription saved to ${savedLabel}`,
//                 'success',
//             );
//         } catch (e: any) {
//             console.log(
//                 'Prescription download error:',
//                 e,
//             );

//             showSuccessToast(
//                 e?.message ||
//                 'Unable to download prescription PDF',
//                 'error',
//             );
//         } finally {
//             setDownloadingPdf(false);
//         }
//     }, [
//         downloadingPdf,
//         normalized.prescriptionId,
//         prescription?.id,
//         prescription?.prescription_id,
//         prescription?.prescription_code,
//     ]);

//     const specialization = Array.isArray(doctor?.doctor_specialization)
//         ? doctor.doctor_specialization.join(', ')
//         : doctor?.doctor_specialization ||
//         doctor?.specialization ||
//         doctor?.speciality ||
//         '';

//     return (
//         <SafeAreaView style={styles.container} edges={['top']}>
//             <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
//             <AppHeader
//                 title="Prescription History"
//                 leftIconName="arrow-left"
//                 onLeftPress={() => props.navigation.goBack()}
//                 rightContent={
//                     <View style={styles.headerActions}>
//                         {hasContent ? (
//                             <TouchableOpacity
//                                 onPress={onDownloadPdf}
//                                 disabled={downloadingPdf}
//                                 style={styles.headerIconBtn}
//                                 hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//                             >
//                                 {downloadingPdf ? (
//                                     <ActivityIndicator size="small" color={COLORS.primary} />
//                                 ) : (
//                                     <TablerIcon
//                                         name="download"
//                                         size={20}
//                                         color={COLORS.primary}
//                                     />
//                                 )}
//                             </TouchableOpacity>
//                         ) : null}
//                         {!!doctorId && (
//                             <TouchableOpacity onPress={openViewAll} style={styles.headerLabelBtn}>
//                                 <Text style={styles.headerLabelText}>View all</Text>
//                             </TouchableOpacity>
//                         )}
//                     </View>
//                 }
//             />

//             {loading && !payload ? (
//                 <View style={styles.loader}>
//                     <ActivityIndicator size="large" color={COLORS.primary} />
//                     <Text style={styles.loaderText}>Loading prescription…</Text>
//                 </View>
//             ) : !hasContent ? (
//                 <View style={styles.emptyWrap}>
//                     <TablerIcon name="prescription" size={36} color="#94A3B8" />
//                     <Text style={styles.emptyTitle}>No prescription yet</Text>
//                     <Text style={styles.emptySub}>
//                         Medicines, diet advice, and do’s & don’ts will appear here once the
//                         doctor issues them.
//                     </Text>
//                     {!!doctorId && (
//                         <TouchableOpacity style={styles.emptyBtn} onPress={openViewAll}>
//                             <Text style={styles.emptyBtnText}>View all consultations</Text>
//                         </TouchableOpacity>
//                     )}
//                 </View>
//             ) : (
//                 <>
//                     <ScrollView
//                         showsVerticalScrollIndicator={false}
//                         contentContainerStyle={{
//                             paddingBottom: insets.bottom + 110,
//                             paddingHorizontal: 16,
//                             paddingTop: 8,
//                         }}
//                         refreshControl={undefined}
//                     >
//                         {loading ? (
//                             <View style={styles.inlineLoader}>
//                                 <ActivityIndicator color={COLORS.primary} />
//                             </View>
//                         ) : null}

//                         {/* Patient */}
//                         <View style={styles.patientRow}>
//                             {patient?.patient_image ? (
//                                 <Image
//                                     source={{ uri: patient.patient_image }}
//                                     style={styles.avatar}
//                                 />
//                             ) : (
//                                 <View style={styles.initialAvatar}>
//                                     <Text style={styles.initialText}>
//                                         {patient?.patient_name?.charAt(0)?.toUpperCase() || 'P'}
//                                     </Text>
//                                 </View>
//                             )}
//                             <View style={styles.patientContent}>
//                                 <Text numberOfLines={1} style={styles.patientName}>
//                                     {patient?.patient_name || 'Patient'}
//                                 </Text>
//                                 <Text style={styles.patientSubText}>
//                                     {[
//                                         patient?.age != null ? `Age ${patient.age}` : '',
//                                         patient?.gender ? String(patient.gender) : '',
//                                         patient?.relation ? String(patient.relation) : '',
//                                     ]
//                                         .filter(Boolean)
//                                         .join(' · ') || '—'}
//                                 </Text>
//                                 <Text style={styles.patientSubText}>
//                                     Issued {formatIssuedLabel(normalized.issuedOn)}
//                                 </Text>
//                             </View>
//                             {paymentAmount != null && (
//                                 <RupeeAmount
//                                     value={paymentAmount}
//                                     style={styles.patientFee}
//                                     iconColor={COLORS.primary}
//                                     iconSize={15}
//                                 />
//                             )}
//                         </View>

//                         {(!!concernText ||
//                             (!!diagnosisText &&
//                                 diagnosisText.toLowerCase() !==
//                                 concernText.toLowerCase() &&
//                                 diagnosisText.toLowerCase() !==
//                                 symptomText.toLowerCase()) ||
//                             !!appointmentNotes ||
//                             !!prescriptionCode ||
//                             paymentAmount != null ||
//                             !!paymentMethod ||
//                             !!paymentStatus) && (
//                                 <View style={styles.metaCard}>
//                                     {!!prescriptionCode && (
//                                         <View style={styles.metaRow}>
//                                             <Text style={styles.metaLabel}>Prescription Code</Text>
//                                             <Text style={styles.metaValue}>{prescriptionCode}</Text>
//                                         </View>
//                                     )}
//                                     {!!concernText && (
//                                         <View style={styles.metaRow}>
//                                             <Text style={styles.metaLabel}>Chief complaint</Text>
//                                             <Text style={styles.metaValue}>{concernText}</Text>
//                                         </View>
//                                     )}
//                                     {!!diagnosisText &&
//                                         diagnosisText.toLowerCase() !==
//                                         concernText.toLowerCase() &&
//                                         diagnosisText.toLowerCase() !==
//                                         symptomText.toLowerCase() && (
//                                             <View style={styles.metaRow}>
//                                                 <Text style={styles.metaLabel}>Diagnosis</Text>
//                                                 <Text style={styles.metaValue}>{diagnosisText}</Text>
//                                             </View>
//                                         )}
//                                     {!!appointmentNotes && (
//                                         <View style={styles.metaRow}>
//                                             <Text style={styles.metaLabel}>Notes</Text>
//                                             <Text style={styles.metaValue}>{appointmentNotes}</Text>
//                                         </View>
//                                     )}
//                                     {(paymentAmount != null ||
//                                         !!paymentMethod ||
//                                         !!paymentStatus) && (
//                                             <View style={[styles.metaRow, styles.metaRowLast]}>
//                                                 <Text style={styles.metaLabel}>Payment</Text>
//                                                 <View style={styles.metaPaymentCol}>
//                                                     {paymentAmount != null ? (
//                                                         <RupeeAmount
//                                                             value={paymentAmount}
//                                                             style={styles.metaValue}
//                                                             iconSize={13}
//                                                             iconColor={COLORS.primary}
//                                                         />
//                                                     ) : null}
//                                                     {!!(paymentMethod || paymentStatus) && (
//                                                         <Text style={styles.metaSubValue}>
//                                                             {[paymentMethod, paymentStatus]
//                                                                 .filter(Boolean)
//                                                                 .join(' · ')}
//                                                         </Text>
//                                                     )}
//                                                 </View>
//                                             </View>
//                                         )}
//                                 </View>
//                             )}

//                         {followUp.hasContent && (
//                             <>
//                                 <SectionTitle title="Follow-up" />
//                                 <View style={styles.followUpCard}>
//                                     <View style={styles.followUpTop}>
//                                         <View style={styles.followUpIcon}>
//                                             <TablerIcon
//                                                 name="calendar"
//                                                 size={18}
//                                                 color={COLORS.primary}
//                                             />
//                                         </View>
//                                         <View style={styles.followUpMain}>
//                                             <Text style={styles.followUpEyebrow}>
//                                                 {followUp.schedule
//                                                     ? 'Scheduled follow-up'
//                                                     : 'Follow-up advised'}
//                                             </Text>
//                                             <Text style={styles.followUpDate}>
//                                                 {followUp.dateLabel || 'Date to be confirmed'}
//                                             </Text>
//                                         </View>
//                                         {!!followUp.status && (
//                                             <View style={styles.followUpStatus}>
//                                                 <Text style={styles.followUpStatusText}>
//                                                     {followUp.status}
//                                                 </Text>
//                                             </View>
//                                         )}
//                                     </View>
//                                     {!!followUp.reason && (
//                                         <View style={styles.followUpBlock}>
//                                             <Text style={styles.followUpLabel}>Reason</Text>
//                                             <Text style={styles.followUpValue}>
//                                                 {followUp.reason}
//                                             </Text>
//                                         </View>
//                                     )}
//                                     {!!followUp.notes && (
//                                         <View style={styles.followUpBlock}>
//                                             <Text style={styles.followUpLabel}>Notes</Text>
//                                             <Text style={styles.followUpValue}>
//                                                 {followUp.notes}
//                                             </Text>
//                                         </View>
//                                     )}
//                                 </View>
//                             </>
//                         )}

//                         {hasClinicalHistory && (
//                             <>
//                                 <SectionTitle title="Clinical History" />
//                                 <View style={styles.historyList}>
//                                     {!!symptomText && (
//                                         <HistoryBlock
//                                             icon="stethoscope"
//                                             title="Symptoms"
//                                         >
//                                             <Text style={styles.historyBody}>
//                                                 {symptomText}
//                                             </Text>
//                                         </HistoryBlock>
//                                     )}

//                                     {allergies.length > 0 && (
//                                         <HistoryBlock
//                                             icon="alert-circle"
//                                             title="Allergies"
//                                             tone="alert"
//                                         >
//                                             <View style={styles.allergyChipRow}>
//                                                 {allergies.map((item, index) => (
//                                                     <View
//                                                         key={`allergy-${index}`}
//                                                         style={styles.allergyChip}
//                                                     >
//                                                         <Text style={styles.allergyChipText}>
//                                                             {item}
//                                                         </Text>
//                                                     </View>
//                                                 ))}
//                                             </View>
//                                         </HistoryBlock>
//                                     )}

//                                     {!!pastIllnessText && (
//                                         <HistoryBlock
//                                             icon="clipboard-list"
//                                             title="Past illness"
//                                         >
//                                             <Text style={styles.historyBody}>
//                                                 {pastIllnessText}
//                                             </Text>
//                                         </HistoryBlock>
//                                     )}

//                                     {!!familyHistoryText && (
//                                         <HistoryBlock
//                                             icon="users"
//                                             title="Family history"
//                                             tone="family"
//                                         >
//                                             <Text style={styles.historyBody}>
//                                                 {familyHistoryText}
//                                             </Text>
//                                         </HistoryBlock>
//                                     )}
//                                 </View>
//                             </>
//                         )}

//                         {/* Medicines */}
//                         <SectionTitle title="Primary Medications" />
//                         {medicines.length === 0 ? (
//                             <Text style={styles.emptySection}>No medicines prescribed</Text>
//                         ) : (
//                             <View style={styles.medicineList}>
//                                 {medicines.map((medicine: any, index: number) => {
//                                     const price = getMedicinePrice(medicine);
//                                     const chips = getMedicineScheduleChips(medicine);
//                                     const subtitle =
//                                         medicine?.product_name ||
//                                         medicine?.description ||
//                                         medicine?.brand_name ||
//                                         medicine?.composition ||
//                                         '';

//                                     return (
//                                         <View
//                                             key={
//                                                 medicine?.id ||
//                                                 `${medicine?.medicine_name}-${index}`
//                                             }
//                                             style={styles.medicineCard}
//                                         >
//                                             <View style={styles.medicineCardTop}>
//                                                 <View style={styles.medicineIcon}>
//                                                     <TablerIcon
//                                                         name="pill"
//                                                         size={16}
//                                                         color={COLORS.primary}
//                                                     />
//                                                 </View>
//                                                 <View style={styles.medicineMain}>
//                                                     <Text
//                                                         style={styles.medicineName}
//                                                         numberOfLines={2}
//                                                     >
//                                                         {medicine?.medicine_name ||
//                                                             medicine?.product_name ||
//                                                             'Medicine'}
//                                                     </Text>
//                                                     {!!subtitle &&
//                                                         String(subtitle).toLowerCase() !==
//                                                         String(
//                                                             medicine?.medicine_name || '',
//                                                         ).toLowerCase() && (
//                                                             <Text
//                                                                 style={styles.medicineDesc}
//                                                                 numberOfLines={2}
//                                                             >
//                                                                 {subtitle}
//                                                             </Text>
//                                                         )}
//                                                 </View>
//                                                 {price != null ? (
//                                                     <RupeeAmount
//                                                         value={price}
//                                                         style={styles.medicinePrice}
//                                                         iconSize={12}
//                                                         iconColor={COLORS.primary}
//                                                     />
//                                                 ) : null}
//                                             </View>

//                                             {chips.length > 0 ? (
//                                                 <View style={styles.scheduleRow}>
//                                                     {chips.map(chip => (
//                                                         <View
//                                                             key={chip.key}
//                                                             style={styles.scheduleItem}
//                                                         >
//                                                             <Text style={styles.scheduleCaption}>
//                                                                 {chip.caption}
//                                                             </Text>
//                                                             <Text style={styles.scheduleValue}>
//                                                                 {chip.label}
//                                                             </Text>
//                                                         </View>
//                                                     ))}
//                                                 </View>
//                                             ) : null}

//                                             {!!medicine?.instruction && (
//                                                 <View style={styles.instructionRow}>
//                                                     <TablerIcon
//                                                         name="clock"
//                                                         size={13}
//                                                         color={COLORS.secondary}
//                                                     />
//                                                     <Text style={styles.instructionText}>
//                                                         {String(medicine.instruction)}
//                                                     </Text>
//                                                 </View>
//                                             )}
//                                         </View>
//                                     );
//                                 })}
//                             </View>
//                         )}

//                         {/* Recommended diet plans */}
//                         {dietPlans.length > 0 && (
//                             <>
//                                 <SectionTitle title="Recommended Diet Plans" />
//                                 <View style={styles.dietPlanList}>
//                                     {dietPlans.map((diet: any, index: number) => {
//                                         const planId =
//                                             diet?.diet_plan_id || diet?.id || index;
//                                         const calories = diet?.avg_daily_calories;
//                                         const meals = diet?.meals_per_day;
//                                         return (
//                                             <TouchableOpacity
//                                                 key={String(planId)}
//                                                 style={styles.dietPlanCard}
//                                                 activeOpacity={0.85}
//                                                 onPress={() => openDietPlan(diet)}
//                                             >
//                                                 <View style={styles.dietPlanIcon}>
//                                                     <TablerIcon
//                                                         name="leaf"
//                                                         size={18}
//                                                         color={COLORS.primary}
//                                                     />
//                                                 </View>
//                                                 <View style={styles.dietPlanMain}>
//                                                     <Text
//                                                         style={styles.dietPlanName}
//                                                         numberOfLines={2}
//                                                     >
//                                                         {diet?.name ||
//                                                             diet?.title ||
//                                                             'Diet Plan'}
//                                                     </Text>
//                                                     <Text style={styles.dietPlanMeta}>
//                                                         {[
//                                                             calories != null
//                                                                 ? `~${Math.round(
//                                                                     Number(calories),
//                                                                 )} kcal/day`
//                                                                 : '',
//                                                             meals != null
//                                                                 ? `${meals} meals/day`
//                                                                 : '',
//                                                         ]
//                                                             .filter(Boolean)
//                                                             .join(' · ') ||
//                                                             'Tap to view & start'}
//                                                     </Text>
//                                                 </View>
//                                                 <View style={styles.dietPlanCta}>
//                                                     <Text style={styles.dietPlanCtaText}>
//                                                         View
//                                                     </Text>
//                                                     <TablerIcon
//                                                         name="chevron-right"
//                                                         size={16}
//                                                         color={COLORS.primary}
//                                                     />
//                                                 </View>
//                                             </TouchableOpacity>
//                                         );
//                                     })}
//                                 </View>
//                             </>
//                         )}

//                         {/* Diet advice text (if any free-form advice) */}
//                         {dietItems.length > 0 && (
//                             <>
//                                 <SectionTitle title="Diet Advice" />
//                                 <View style={styles.softCard}>
//                                     {dietItems.map((item, index) => (
//                                         <AdviceRow
//                                             key={`diet-${index}`}
//                                             icon="leaf"
//                                             text={item}
//                                         />
//                                     ))}
//                                 </View>
//                             </>
//                         )}

//                         {/* Patient instructions / suggestions */}
//                         {suggestions.length > 0 && (
//                             <>
//                                 <SectionTitle title="Diagnosis" />
//                                 <View style={styles.softCard}>
//                                     {suggestions.map((item, index) => (
//                                         <AdviceRow
//                                             key={`sug-${index}`}
//                                             icon="circle-check"
//                                             text={item}
//                                         />
//                                     ))}
//                                 </View>
//                             </>
//                         )}

//                         {/* Do / Don't */}
//                         {(doItems.length > 0 || dontItems.length > 0) && (
//                             <>
//                                 <SectionTitle title="Do’s & Don’ts" />
//                                 {doItems.length > 0 && (
//                                     <View style={[styles.softCard, styles.doCard]}>
//                                         <Text style={styles.doCardTitle}>Do</Text>
//                                         {doItems.map((item, index) => (
//                                             <AdviceRow
//                                                 key={`do-${index}`}
//                                                 icon="plus"
//                                                 text={item}
//                                                 tone="do"
//                                             />
//                                         ))}
//                                     </View>
//                                 )}
//                                 {dontItems.length > 0 && (
//                                     <View style={[styles.softCard, styles.dontCard]}>
//                                         <Text style={styles.dontCardTitle}>Don’t</Text>
//                                         {dontItems.map((item, index) => (
//                                             <AdviceRow
//                                                 key={`dont-${index}`}
//                                                 icon="x"
//                                                 text={item}
//                                                 tone="dont"
//                                             />
//                                         ))}
//                                     </View>
//                                 )}
//                             </>
//                         )}

//                         {/* Clinical advisory */}
//                         {!!clinicalAdvisory && (
//                             <View style={styles.successCard}>
//                                 <View style={styles.successTop}>
//                                     <TablerIcon name="alert-circle" size={16} color="#FFFFFF" />
//                                     <Text style={styles.successTitle}>CLINICAL OBSERVATIONS</Text>
//                                 </View>
//                                 <Text style={styles.successDesc}>{clinicalAdvisory}</Text>
//                             </View>
//                         )}

//                         {/* Doctor */}
//                         <SectionTitle title="Prescribing Physician" />
//                         <View style={styles.doctorCard}>
//                             <View style={styles.doctorRow}>
//                                 <Image
//                                     source={
//                                         doctor?.doctor_image
//                                             ? { uri: doctor.doctor_image }
//                                             : Images.doctorImage
//                                     }
//                                     style={styles.doctorImage}
//                                 />
//                                 <View style={{ flex: 1 }}>
//                                     <Text numberOfLines={1} style={styles.doctorName}>
//                                         {doctor?.doctor_name || 'Doctor'}
//                                     </Text>
//                                     {!!specialization && (
//                                         <Text style={styles.doctorSpeciality}>{specialization}</Text>
//                                     )}
//                                 </View>
//                             </View>

//                             <View style={styles.doctorInfo}>
//                                 {!!doctorLocation && (
//                                     <View style={styles.infoRow}>
//                                         <TablerIcon name="map-pin" size={14} color={COLORS.secondary} />
//                                         <Text style={styles.infoText}>{doctorLocation}</Text>
//                                     </View>
//                                 )}
//                                 {!!(doctor?.phone || doctor?.mobile || doctor?.contact_number) && (
//                                     <View style={styles.infoRow}>
//                                         <TablerIcon name="phone" size={14} color={COLORS.secondary} />
//                                         <Text style={styles.infoText}>
//                                             {doctor?.phone || doctor?.mobile || doctor?.contact_number}
//                                         </Text>
//                                     </View>
//                                 )}
//                                 {!!doctor?.email && (
//                                     <View style={styles.infoRow}>
//                                         <TablerIcon name="mail" size={14} color={COLORS.secondary} />
//                                         <Text style={styles.infoText}>{doctor.email}</Text>
//                                     </View>
//                                 )}
//                                 {!!doctor?.registration_number && (
//                                     <View style={styles.infoRow}>
//                                         <TablerIcon
//                                             name="prescription"
//                                             size={14}
//                                             color={COLORS.secondary}
//                                         />
//                                         <Text style={styles.infoText}>
//                                             Reg. {doctor.registration_number}
//                                         </Text>
//                                     </View>
//                                 )}
//                             </View>
//                         </View>

//                         {/* Status */}
//                         <SectionTitle title="Prescription Status" />
//                         <View style={styles.statusCard}>
//                             <View style={styles.activeBadge}>
//                                 <View style={styles.activeDot} />
//                                 <Text style={styles.activeText}>
//                                     {normalized.status
//                                         ? String(normalized.status).replace(/_/g, ' ')
//                                         : 'Issued'}
//                                 </Text>
//                             </View>
//                             <Text style={styles.dateInfo}>
//                                 Issued on {formatIssuedLabel(normalized.issuedOn)}
//                             </Text>
//                         </View>

//                         {/* Help */}
//                         <View style={styles.helpCard}>
//                             <Text style={styles.helpTitle}>Need Assistance?</Text>
//                             <Text style={styles.helpDesc}>
//                                 If you experience severe reactions, dizziness, or allergic
//                                 reactions, contact your doctor immediately.
//                             </Text>
//                             <TouchableOpacity
//                                 activeOpacity={0.8}
//                                 onPress={() =>
//                                     handleCall(
//                                         doctor?.phone ||
//                                         doctor?.mobile ||
//                                         doctor?.contact_number ||
//                                         '',
//                                     )
//                                 }
//                                 style={styles.contactBtn}
//                             >
//                                 <Text style={styles.contactText}>Contact Now</Text>
//                             </TouchableOpacity>
//                         </View>

//                         {!!doctorId && (
//                             <TouchableOpacity style={styles.viewAllLink} onPress={openViewAll}>
//                                 <Text style={styles.viewAllLinkText}>
//                                     View all consultations with{' '}
//                                     {doctor?.doctor_name || 'this doctor'}
//                                 </Text>
//                                 <TablerIcon name="chevron-right" size={16} color={COLORS.primary} />
//                             </TouchableOpacity>
//                         )}
//                     </ScrollView>

//                     <View
//                         style={[
//                             styles.bottomContainer,
//                             { paddingBottom: Math.max(insets.bottom, 16) },
//                         ]}
//                     >
//                         <TouchableOpacity
//                             activeOpacity={0.8}
//                             style={styles.shareBtn}
//                             onPress={onShare}
//                         >
//                             <TablerIcon name="share" size={16} color={COLORS.secondary} />
//                             <Text style={styles.shareText}>Share Record</Text>
//                         </TouchableOpacity>

//                         <TouchableOpacity
//                             activeOpacity={0.8}
//                             style={styles.orderBtn}
//                             onPress={() => props.navigation.navigate('MyCart')}
//                         >
//                             <Text style={styles.orderText}>Order Medicines</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </>
//             )}
//         </SafeAreaView>
//     );
// };

// export default PrescriptionDetail;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: COLORS.background,
//     },
//     loader: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//         gap: 10,
//     },
//     loaderText: {
//         fontSize: 13,
//         color: COLORS.secondary,
//         fontFamily: Fonts.PoppinsMedium,
//     },
//     inlineLoader: {
//         alignItems: 'center',
//         marginBottom: 8,
//     },
//     emptyWrap: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingHorizontal: 32,
//         gap: 8,
//     },
//     emptyTitle: {
//         marginTop: 8,
//         fontSize: 16,
//         color: COLORS.text,
//         fontFamily: Fonts.PoppinsSemiBold,
//     },
//     emptySub: {
//         textAlign: 'center',
//         fontSize: 13,
//         lineHeight: 20,
//         color: COLORS.secondary,
//         fontFamily: Fonts.PoppinsRegular,
//     },
//     emptyBtn: {
//         marginTop: 12,
//         backgroundColor: COLORS.primary,
//         borderRadius: 12,
//         paddingHorizontal: 16,
//         paddingVertical: 10,
//     },
//     emptyBtnText: {
//         color: '#fff',
//         fontSize: 13,
//         fontFamily: Fonts.PoppinsSemiBold,
//     },
//     patientRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: COLORS.mint,
//         borderRadius: 18,
//         padding: 14,
//     },
//     avatar: {
//         width: Math.min(64, width * 0.16),
//         height: Math.min(64, width * 0.16),
//         borderRadius: 18,
//         marginRight: 14,
//     },
//     initialAvatar: {
//         width: 64,
//         height: 64,
//         marginRight: 12,
//         borderRadius: 18,
//         backgroundColor: COLORS.primary,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     initialText: {
//         color: '#FFFFFF',
//         fontSize: 20,
//         fontFamily: Fonts.PoppinsSemiBold,
//     },
//     patientContent: {
//         flex: 1,
//         minWidth: 0,
//     },
//     patientName: {
//         fontSize: 16,
//         color: COLORS.text,
//         fontFamily: Fonts.PoppinsSemiBold,
//     },
//     patientSubText: {
//         marginTop: 2,
//         fontSize: 12,
//         color: COLORS.secondary,
//         fontFamily: Fonts.PoppinsMedium,
//     },
//     patientFee: {
//         fontSize: 13,
//         color: COLORS.primary,
//         fontFamily: Fonts.PoppinsSemiBold,
//     },
//     metaCard: {
//         marginTop: 10,
//         backgroundColor: COLORS.white,
//         borderRadius: 14,
//         borderWidth: 1,
//         borderColor: COLORS.border,
//         paddingHorizontal: 12,
//         paddingVertical: 10,
//         gap: 8,
//     },
//     metaRow: {
//         flexDirection: 'row',
//         alignItems: 'flex-start',
//         gap: 10,
//     },
//     metaRowLast: {
//         paddingTop: 2,
//     },
//     metaLabel: {
//         width: 78,
//         fontSize: 11,
//         color: '#94A3B8',
//         fontFamily: Fonts.PoppinsSemiBold,
//         textTransform: 'uppercase',
//         marginTop: 2,
//     },
//     metaValue: {
//         flex: 1,
//         fontSize: 13,
//         lineHeight: 18,
//         color: COLORS.text,
//         fontFamily: Fonts.PoppinsMedium,
//     },
//     metaSubValue: {
//         marginTop: 2,
//         fontSize: 11,
//         color: COLORS.secondary,
//         fontFamily: Fonts.PoppinsRegular,
//         textTransform: 'capitalize',
//     },
//     followUpCard: {
//         backgroundColor: COLORS.white,
//         borderRadius: 16,
//         borderWidth: 1,
//         borderColor: '#D8EBE4',
//         padding: 14,
//         gap: 10,
//         shadowColor: '#0D614E',
//         shadowOffset: { width: 0, height: 3 },
//         shadowOpacity: 0.05,
//         shadowRadius: 8,
//         elevation: 2,
//     },
//     followUpTop: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 10,
//     },
//     followUpIcon: {
//         width: 40,
//         height: 40,
//         borderRadius: 12,
//         backgroundColor: COLORS.mint,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     followUpMain: {
//         flex: 1,
//         minWidth: 0,
//     },
//     followUpEyebrow: {
//         fontSize: 11,
//         color: COLORS.primary,
//         fontFamily: Fonts.PoppinsSemiBold,
//         textTransform: 'uppercase',
//         letterSpacing: 0.3,
//     },
//     followUpDate: {
//         marginTop: 2,
//         fontSize: 16,
//         color: COLORS.text,
//         fontFamily: Fonts.PoppinsSemiBold,
//     },
//     followUpStatus: {
//         backgroundColor: '#ECFDF5',
//         borderRadius: 999,
//         paddingHorizontal: 10,
//         paddingVertical: 5,
//     },
//     followUpStatusText: {
//         fontSize: 11,
//         color: '#047857',
//         fontFamily: Fonts.PoppinsSemiBold,
//         textTransform: 'capitalize',
//     },
//     followUpBlock: {
//         backgroundColor: COLORS.mint,
//         borderRadius: 12,
//         paddingHorizontal: 12,
//         paddingVertical: 10,
//     },
//     followUpLabel: {
//         fontSize: 11,
//         color: COLORS.secondary,
//         fontFamily: Fonts.PoppinsSemiBold,
//         textTransform: 'uppercase',
//         marginBottom: 3,
//     },
//     followUpValue: {
//         fontSize: 13,
//         lineHeight: 19,
//         color: COLORS.text,
//         fontFamily: Fonts.PoppinsMedium,
//     },
//     historyList: {
//         gap: 10,
//     },
//     historyCard: {
//         backgroundColor: COLORS.white,
//         borderRadius: 14,
//         borderWidth: 1,
//         borderColor: COLORS.border,
//         padding: 12,
//     },
//     historyCardAlert: {
//         borderColor: '#FDE68A',
//         backgroundColor: '#FFFBEB',
//     },
//     historyCardFamily: {
//         borderColor: '#E9D5FF',
//         backgroundColor: '#FAF5FF',
//     },
//     historyHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 8,
//         marginBottom: 8,
//     },
//     historyIconWrap: {
//         width: 28,
//         height: 28,
//         borderRadius: 9,
//         backgroundColor: COLORS.mint,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     historyIconAlert: {
//         backgroundColor: '#FEF3C7',
//     },
//     historyIconFamily: {
//         backgroundColor: '#F3E8FF',
//     },
//     historyTitle: {
//         fontSize: 13,
//         color: COLORS.text,
//         fontFamily: Fonts.PoppinsSemiBold,
//     },
//     historyBody: {
//         fontSize: 13,
//         lineHeight: 20,
//         color: '#334155',
//         fontFamily: Fonts.PoppinsRegular,
//     },
//     allergyChipRow: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         gap: 8,
//     },
//     allergyChip: {
//         backgroundColor: '#FFF7ED',
//         borderWidth: 1,
//         borderColor: '#FDBA74',
//         borderRadius: 999,
//         paddingHorizontal: 10,
//         paddingVertical: 5,
//     },
//     allergyChipText: {
//         fontSize: 12,
//         color: '#9A3412',
//         fontFamily: Fonts.PoppinsSemiBold,
//     },
//     metaPaymentCol: {
//         flex: 1,
//     },
//     sectionTitleWrap: {
//         marginTop: 16,
//         marginBottom: 8,
//     },
//     sectionTitle: {
//         fontSize: 15,
//         color: COLORS.text,
//         fontFamily: Fonts.PoppinsSemiBold,
//     },
//     sectionUnderline: {
//         marginTop: 5,
//         width: 36,
//         height: 3,
//         borderRadius: 2,
//         backgroundColor: COLORS.primary,
//     },
//     emptySection: {
//         fontSize: 13,
//         color: '#94A3B8',
//         fontFamily: Fonts.PoppinsRegular,
//     },
//     medicineList: {
//         gap: 8,
//     },
//     medicineCard: {
//         backgroundColor: COLORS.white,
//         borderRadius: 14,
//         borderWidth: 1,
//         borderColor: COLORS.border,
//         padding: 12,
//     },
//     medicineCardTop: {
//         flexDirection: 'row',
//         alignItems: 'flex-start',
//         gap: 10,
//     },
//     medicineIcon: {
//         width: 34,
//         height: 34,
//         borderRadius: 10,
//         backgroundColor: '#E8F3EF',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     medicineMain: {
//         flex: 1,
//         minWidth: 0,
//     },
//     medicineName: {
//         fontSize: 14,
//         lineHeight: 19,
//         color: COLORS.text,
//         fontFamily: Fonts.PoppinsSemiBold,
//     },
//     medicineDesc: {
//         marginTop: 2,
//         fontSize: 12,
//         lineHeight: 17,
//         color: COLORS.secondary,
//         fontFamily: Fonts.PoppinsRegular,
//     },
//     medicinePrice: {
//         fontSize: 12,
//         color: COLORS.primary,
//         fontFamily: Fonts.PoppinsSemiBold,
//     },
//     scheduleRow: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         marginTop: 10,
//         gap: 8,
//     },
//     scheduleItem: {
//         flexGrow: 1,
//         flexBasis: '30%',
//         minWidth: 96,
//         backgroundColor: '#F3F7F5',
//         borderRadius: 10,
//         borderWidth: 1,
//         borderColor: '#E5EFEA',
//         paddingHorizontal: 10,
//         paddingVertical: 8,
//     },
//     scheduleCaption: {
//         fontSize: 10,
//         lineHeight: 14,
//         color: '#64748B',
//         fontFamily: Fonts.PoppinsMedium,
//         textTransform: 'uppercase',
//         letterSpacing: 0.3,
//     },
//     scheduleValue: {
//         marginTop: 2,
//         fontSize: 13,
//         lineHeight: 18,
//         color: COLORS.text,
//         fontFamily: Fonts.PoppinsSemiBold,
//     },
//     chipRow: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         gap: 6,
//         marginTop: 8,
//     },
//     chip: {
//         backgroundColor: '#F1F5F9',
//         borderRadius: 999,
//         paddingHorizontal: 9,
//         paddingVertical: 4,
//     },
//     chipText: {
//         fontSize: 11,
//         color: '#475569',
//         fontFamily: Fonts.PoppinsMedium,
//     },
//     dietPlanList: {
//         gap: 8,
//     },
//     dietPlanCard: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 10,
//         backgroundColor: COLORS.white,
//         borderRadius: 14,
//         borderWidth: 1,
//         borderColor: COLORS.border,
//         padding: 12,
//     },
//     dietPlanIcon: {
//         width: 40,
//         height: 40,
//         borderRadius: 12,
//         backgroundColor: '#E8F3EF',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     dietPlanMain: {
//         flex: 1,
//         minWidth: 0,
//     },
//     dietPlanName: {
//         fontSize: 14,
//         lineHeight: 19,
//         color: COLORS.text,
//         fontFamily: Fonts.PoppinsSemiBold,
//     },
//     dietPlanMeta: {
//         marginTop: 2,
//         fontSize: 12,
//         lineHeight: 16,
//         color: COLORS.secondary,
//         fontFamily: Fonts.PoppinsRegular,
//     },
//     dietPlanCta: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 2,
//     },
//     dietPlanCtaText: {
//         fontSize: 12,
//         color: COLORS.primary,
//         fontFamily: Fonts.PoppinsSemiBold,
//     },
//     instructionRow: {
//         flexDirection: 'row',
//         alignItems: 'flex-start',
//         gap: 6,
//         marginTop: 8,
//         paddingTop: 8,
//         borderTopWidth: 1,
//         borderTopColor: '#F1F5F9',
//     },
//     instructionText: {
//         flex: 1,
//         fontSize: 12,
//         lineHeight: 17,
//         color: COLORS.secondary,
//         fontFamily: Fonts.PoppinsMedium,
//     },
//     softCard: {
//         backgroundColor: COLORS.white,
//         borderRadius: 16,
//         borderWidth: 1,
//         borderColor: COLORS.border,
//         padding: 14,
//         gap: 10,
//     },
//     doCard: {
//         backgroundColor: '#ECFDF5',
//         borderColor: '#A7F3D0',
//         marginBottom: 10,
//     },
//     dontCard: {
//         backgroundColor: '#FEF2F2',
//         borderColor: '#FECACA',
//     },
//     doCardTitle: {
//         fontSize: 13,
//         color: '#047857',
//         fontFamily: Fonts.PoppinsSemiBold,
//         marginBottom: 2,
//     },
//     dontCardTitle: {
//         fontSize: 13,
//         color: '#B91C1C',
//         fontFamily: Fonts.PoppinsSemiBold,
//         marginBottom: 2,
//     },
//     adviceRow: {
//         flexDirection: 'row',
//         alignItems: 'flex-start',
//         gap: 10,
//     },
//     adviceIconWrap: {
//         width: 24,
//         height: 24,
//         borderRadius: 12,
//         backgroundColor: '#E8F3EF',
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginTop: 1,
//     },
//     adviceIconDo: {
//         backgroundColor: '#D1FAE5',
//     },
//     adviceIconDont: {
//         backgroundColor: '#FEE2E2',
//     },
//     adviceText: {
//         flex: 1,
//         fontSize: 13,
//         lineHeight: 20,
//         color: COLORS.secondary,
//         fontFamily: Fonts.PoppinsMedium,
//     },
//     successCard: {
//         backgroundColor: COLORS.primary,
//         borderRadius: 18,
//         padding: 16,
//         marginTop: 18,
//     },
//     successTop: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 8,
//     },
//     successTitle: {
//         fontSize: 13,
//         color: '#FFFFFF',
//         fontFamily: Fonts.PoppinsSemiBold,
//         letterSpacing: 0.4,
//     },
//     successDesc: {
//         marginTop: 10,
//         fontSize: 13,
//         lineHeight: 22,
//         color: '#E2E8F0',
//         fontFamily: Fonts.PoppinsRegular,
//     },
//     doctorCard: {
//         backgroundColor: COLORS.white,
//         borderRadius: 16,
//         borderWidth: 1,
//         borderColor: COLORS.border,
//         padding: 14,
//     },
//     doctorRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     doctorImage: {
//         width: 52,
//         height: 52,
//         borderRadius: 16,
//         marginRight: 12,
//         backgroundColor: '#EFE9DC',
//     },
//     doctorName: {
//         fontSize: 15,
//         color: COLORS.text,
//         fontFamily: Fonts.PoppinsSemiBold,
//     },
//     doctorSpeciality: {
//         marginTop: 3,
//         fontSize: 12,
//         color: COLORS.secondary,
//         fontFamily: Fonts.PoppinsMedium,
//     },
//     doctorInfo: {
//         marginTop: 14,
//         gap: 10,
//     },
//     infoRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 8,
//     },
//     infoText: {
//         flex: 1,
//         fontSize: 13,
//         color: COLORS.secondary,
//         fontFamily: Fonts.PoppinsMedium,
//     },
//     statusCard: {
//         backgroundColor: COLORS.white,
//         borderRadius: 16,
//         borderWidth: 1,
//         borderColor: COLORS.border,
//         padding: 14,
//         gap: 10,
//     },
//     activeBadge: {
//         alignSelf: 'flex-start',
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: COLORS.successBg,
//         paddingHorizontal: 12,
//         paddingVertical: 8,
//         borderRadius: 999,
//     },
//     activeDot: {
//         width: 8,
//         height: 8,
//         borderRadius: 20,
//         backgroundColor: COLORS.success,
//         marginRight: 8,
//     },
//     activeText: {
//         fontSize: 12,
//         color: COLORS.success,
//         fontFamily: Fonts.PoppinsSemiBold,
//         textTransform: 'capitalize',
//     },
//     dateInfo: {
//         fontSize: 12,
//         color: COLORS.secondary,
//         fontFamily: Fonts.PoppinsMedium,
//     },
//     helpCard: {
//         marginTop: 22,
//         backgroundColor: COLORS.primary,
//         borderRadius: 20,
//         padding: 18,
//     },
//     helpTitle: {
//         fontSize: 16,
//         color: '#FFFFFF',
//         fontFamily: Fonts.PoppinsSemiBold,
//     },
//     helpDesc: {
//         marginTop: 10,
//         fontSize: 13,
//         lineHeight: 22,
//         color: '#DCE7E4',
//         fontFamily: Fonts.PoppinsRegular,
//     },
//     contactBtn: {
//         marginTop: 18,
//         backgroundColor: COLORS.white,
//         height: 48,
//         borderRadius: 14,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     contactText: {
//         fontSize: 14,
//         color: COLORS.primary,
//         fontFamily: Fonts.PoppinsSemiBold,
//     },
//     viewAllLink: {
//         marginTop: 18,
//         marginBottom: 8,
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         gap: 4,
//     },
//     viewAllLinkText: {
//         fontSize: 13,
//         color: COLORS.primary,
//         fontFamily: Fonts.PoppinsSemiBold,
//         textAlign: 'center',
//     },
//     bottomContainer: {
//         position: 'absolute',
//         left: 0,
//         right: 0,
//         bottom: 0,
//         flexDirection: 'row',
//         backgroundColor: COLORS.white,
//         paddingHorizontal: 16,
//         paddingTop: 14,
//         borderTopWidth: 1,
//         borderTopColor: COLORS.border,
//         gap: 10,
//         alignItems: 'center',
//     },
//     shareBtn: {
//         flex: 1,
//         height: 52,
//         borderRadius: 16,
//         borderWidth: 1,
//         borderColor: COLORS.border,
//         justifyContent: 'center',
//         alignItems: 'center',
//         flexDirection: 'row',
//         gap: 6,
//     },
//     shareText: {
//         fontSize: 13,
//         color: COLORS.secondary,
//         fontFamily: Fonts.PoppinsSemiBold,
//     },
//     orderBtn: {
//         flex: 1,
//         height: 52,
//         borderRadius: 16,
//         backgroundColor: COLORS.primary,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     orderText: {
//         fontSize: 14,
//         color: '#FFFFFF',
//         fontFamily: Fonts.PoppinsSemiBold,
//     },
//     headerActions: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 4,
//     },
//     headerIconBtn: {
//         width: 40,
//         height: 40,
//         borderRadius: 12,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     headerLabelBtn: {
//         paddingHorizontal: 6,
//         paddingVertical: 8,
//     },
//     headerLabelText: {
//         fontSize: 13,
//         color: COLORS.primary,
//         fontFamily: Fonts.PoppinsMedium,
//     },
// });

import React, { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    Linking,
    ActivityIndicator,
    Share,
    StatusBar,
    Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import TablerIcon from '../../components/TablerIcon';
import * as _CONSULT_SERVICE from '../../services/ConsultServce';
import {
    consultationHasPrescription,
    formatIssuedLabel,
    getAllergiesList,
    getClinicalAdvisory,
    getConcernText,
    getDiagnosisText,
    getDietAdvice,
    getDoList,
    getDontList,
    getFamilyHistoryText,
    getFollowUpInfo,
    getMedicineItems,
    getMedicinePrice,
    getMedicineScheduleChips,
    getPastIllnessText,
    getPaymentAmount,
    getRecommendedDietPlans,
    getSuggestionList,
    buildPrescriptionDownloadText,
    getSymptomDescription,
    normalizePrescriptionPayload,
} from '../../utils/prescriptionDetailUtils';
import { formatPrescriptionId } from '../../utils/formatDisplayId';
import { getDoctorLocationLine } from '../../utils/doctorSlipUtils';
import { showSuccessToast } from '../../config/Key';
import { RupeeAmount } from '../../utils/currencyUtils';
import {
    downloadPdfToDevice,
} from '../../utils/fileDownloadUtils';
import { createPrescriptionPdfBytes } from '../../utils/buildConsultationDocumentPdf';
import { createPlainTextPdfBytes } from '../../utils/pdfPlainTextFallback';

const { width } = Dimensions.get('window');

const COLORS = {
    primary: '#0D614E',
    secondary: '#64748B',
    background: '#F5F7F6',
    white: '#FFFFFF',
    border: '#E5E7EB',
    text: '#0F172A',
    success: '#10B981',
    successBg: '#E8F7EF',
    lightGray: '#F3F4F6',
    mint: '#EEF3F1',
};

const handleCall = (phoneNumber?: string) => {
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber}`).catch(() => undefined);
};

const SectionTitle = ({ title }: { title: string }) => (
    <View style={styles.sectionTitleWrap}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionUnderline} />
    </View>
);

const AdviceRow = ({
    icon,
    text,
    tone = 'default',
}: {
    icon: 'clock' | 'circle-check' | 'alert-circle' | 'leaf' | 'plus' | 'x';
    text: string;
    tone?: 'default' | 'do' | 'dont';
}) => {
    const iconColor =
        tone === 'do' ? '#047857' : tone === 'dont' ? '#B91C1C' : COLORS.primary;
    return (
        <View style={styles.adviceRow}>
            <View
                style={[
                    styles.adviceIconWrap,
                    tone === 'do' && styles.adviceIconDo,
                    tone === 'dont' && styles.adviceIconDont,
                ]}
            >
                <TablerIcon name={icon} size={14} color={iconColor} />
            </View>
            <Text style={styles.adviceText}>{text}</Text>
        </View>
    );
};

const HistoryBlock = ({
    icon,
    title,
    tone = 'default',
    children,
}: {
    icon: 'stethoscope' | 'alert-circle' | 'clipboard-list' | 'users' | 'heart';
    title: string;
    tone?: 'default' | 'alert' | 'family';
    children: ReactNode;
}) => (
    <View
        style={[
            styles.historyCard,
            tone === 'alert' && styles.historyCardAlert,
            tone === 'family' && styles.historyCardFamily,
        ]}
    >
        <View style={styles.historyHeader}>
            <View
                style={[
                    styles.historyIconWrap,
                    tone === 'alert' && styles.historyIconAlert,
                    tone === 'family' && styles.historyIconFamily,
                ]}
            >
                <TablerIcon
                    name={icon}
                    size={15}
                    color={
                        tone === 'alert'
                            ? '#B45309'
                            : tone === 'family'
                                ? '#6D28D9'
                                : COLORS.primary
                    }
                />
            </View>
            <Text style={styles.historyTitle}>{title}</Text>
        </View>
        {children}
    </View>
);

const PrescriptionDetail = (props: any) => {
    const insets = useSafeAreaInsets();
    const params = props?.route?.params || {};

    const lookupId = String(
        params.appointment_id ||
        params.consultation_id ||
        params.PrisData?.appointment_id ||
        params.PrisData?.consultation_id ||
        '',
    ).trim();

    const [loading, setLoading] = useState(true);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [payload, setPayload] = useState<any>(
        params.PrisData
            ? { ...params.PrisData, doctor: params.doctorData || params.PrisData?.doctor }
            : null,
    );
    const hasSeedData = useMemo(
        () => consultationHasPrescription(params.PrisData),
        // eslint-disable-next-line react-hooks/exhaustive-deps -- seed from first navigation only
        [],
    );

    const fetchPrescription = useCallback(async () => {
        if (!lookupId) {
            if (!params.PrisData) {
                showSuccessToast('Appointment id missing', 'error');
            }
            setLoading(false);
            return;
        }

        try {
            if (!hasSeedData) {
                setLoading(true);
            }
            const res = await _CONSULT_SERVICE.getAppointmentDetail(lookupId);
            console.log("prescriitonbyApntmetid,", res);
            if (!res?.success) {
                if (!hasSeedData) {
                    showSuccessToast(res?.message || 'Prescription not found', 'error');
                    if (!params.PrisData) setPayload(null);
                }
                return;
            }
            setPayload(res?.data ?? null);
        } catch {
            if (!hasSeedData) {
                showSuccessToast('Unable to load prescription', 'error');
            }
        } finally {
            setLoading(false);
        }
    }, [lookupId, hasSeedData]);

    useEffect(() => {
        fetchPrescription();
    }, [fetchPrescription]);

    const normalized = useMemo(
        () => normalizePrescriptionPayload(payload),
        [payload],
    );

    const doctor = normalized.doctor || params.doctorData || null;
    const patient = normalized.patient;
    const prescription = normalized.prescription;
    const medicines = getMedicineItems(prescription);
    const dietPlans = getRecommendedDietPlans(payload);
    const dietItems = getDietAdvice(prescription);
    const doItems = getDoList(prescription);
    const dontItems = getDontList(prescription);
    const suggestions = getSuggestionList(prescription);
    const clinicalAdvisory = getClinicalAdvisory(prescription);
    const doctorLocation = getDoctorLocationLine(doctor);
    const doctorId = doctor?.doctor_id || doctor?.id || null;
    const hasContent = consultationHasPrescription(payload);
    const paymentAmount = getPaymentAmount(payload);
    const concernText = getConcernText(payload);
    const diagnosisText = getDiagnosisText(prescription);
    const prescriptionCode = formatPrescriptionId(
        prescription?.prescription_code ||
            prescription?.id ||
            normalized.prescriptionId,
    );
    const symptomText = getSymptomDescription(prescription);
    const allergies = getAllergiesList(prescription);
    const pastIllnessText = getPastIllnessText(prescription);
    const familyHistoryText = getFamilyHistoryText(prescription);
    const followUp = getFollowUpInfo(prescription, normalized.appointment);
    const hasClinicalHistory =
        !!symptomText ||
        allergies.length > 0 ||
        !!pastIllnessText ||
        !!familyHistoryText;
    const appointmentNotes = String(
        normalized.appointment?.appointment_notes ||
        payload?.appointment_notes ||
        '',
    ).trim();
    const paymentMethod = String(
        payload?.payment?.payment_method ||
        payload?.payment?.mode ||
        normalized.appointment?.payment?.payment_method ||
        '',
    ).trim();
    const paymentStatus = String(
        payload?.payment?.payment_status ||
        payload?.payment?.status ||
        normalized.appointment?.payment?.payment_status ||
        '',
    ).trim();

    const openDietPlan = useCallback(
        (diet: any) => {
            const planId =
                diet?.diet_plan_id ||
                diet?.id ||
                diet?.plan_id ||
                null;
            if (!planId) {
                showSuccessToast('Diet plan unavailable', 'error');
                return;
            }
            props.navigation.navigate('DietScreen', {
                item: {
                    ...diet,
                    id: planId,
                    diet_plan_id: planId,
                    name: diet?.name || diet?.title || 'Diet Plan',
                },
            });
        },
        [props.navigation],
    );

    const openViewAll = () => {
        if (!doctorId) {
            showSuccessToast('Doctor details unavailable', 'error');
            return;
        }
        props.navigation.navigate('DoctorConsultationHistory', {
            doctorID: doctorId,
            doctorName: doctor?.doctor_name,
        });
    };

    const onShare = async () => {
        try {
            const medicineSummary = medicines
                .map((m: any) => m?.medicine_name)
                .filter(Boolean)
                .join(', ');
            await Share.share({
                message: [
                    `Prescription for ${patient?.patient_name || 'patient'}`,
                    doctor?.doctor_name ? `Doctor: ${doctor.doctor_name}` : '',
                    medicineSummary ? `Medicines: ${medicineSummary}` : '',
                ]
                    .filter(Boolean)
                    .join('\n'),
            });
        } catch {
            // ignore
        }
    };

  const onDownloadPdf = useCallback(async () => {
  if (downloadingPdf) return;

  const prescriptionId =
    normalized.prescriptionId ||
    String(
      prescription?.id ||
        prescription?.prescription_id ||
        '',
    ).trim();

  if (!prescriptionId) {
    showSuccessToast('Prescription id missing', 'error');
    return;
  }

  try {
    setDownloadingPdf(true);

    const response =
      await _CONSULT_SERVICE.downloadPrescriptionFile(
        prescriptionId,
      );

    if (!response?.success) {
      throw new Error('Prescription PDF data not found');
    }

    const code = formatPrescriptionId(
      response.prescriptionData?.prescription_code ||
        prescription?.prescription_code ||
        prescriptionId,
    ).replace(/[^a-zA-Z0-9._-]/g, '_');

    /**
     * API returned structured JSON — save as text (same as medical receipt).
     */
    if (response.prescriptionData) {
      const fileName = `Ayurmuni_Prescription_${code}.pdf`;
      const mergedPayload = {
        ...(payload ?? {}),
        ...response.prescriptionData,
        doctor:
          response.prescriptionData.doctor ??
          payload?.doctor ??
          params.doctorData,
        patient: response.prescriptionData.patient ?? payload?.patient,
        appointment:
          response.prescriptionData.appointment ?? payload?.appointment,
        prescription:
          response.prescriptionData.prescription ?? response.prescriptionData,
        diets:
          response.prescriptionData.diets ??
          payload?.diets ??
          payload?.appointment?.diets,
      };
      try {
        const pdfBytes = await createPrescriptionPdfBytes(mergedPayload);
        await downloadPdfToDevice({ fileName, pdfBytes });
      } catch (pdfBuildError) {
        console.log('PRESCRIPTION_PDF_BUILD_ERROR', pdfBuildError);
        const fallbackText = buildPrescriptionDownloadText(mergedPayload);
        const plainBytes = await createPlainTextPdfBytes(fallbackText);
        await downloadPdfToDevice({ fileName, pdfBytes: plainBytes });
      }
      return;
    }

    if (response.data && !response.base64) {
      const fileName = `Ayurmuni_Prescription_${code}.pdf`;
      await downloadPdfToDevice({
        fileName,
        arrayBuffer: response.data as ArrayBuffer,
      });
      return;
    }

    let base64 = '';

    if (response.base64) {
      base64 = response.base64;
    }

    if (!base64) {
      throw new Error('Prescription PDF data is empty');
    }

    const fileName = `Ayurmuni_Prescription_${code}.pdf`;
    await downloadPdfToDevice({ fileName, base64 });
  } catch (e: any) {
    console.log(
      'Prescription download error:',
      e,
    );

    showSuccessToast(
      e?.message ||
        'Unable to download prescription PDF',
      'error',
    );
  } finally {
    setDownloadingPdf(false);
  }
}, [
  downloadingPdf,
  normalized.prescriptionId,
  prescription?.id,
  prescription?.prescription_id,
  prescription?.prescription_code,
]);

    const specialization = Array.isArray(doctor?.doctor_specialization)
        ? doctor.doctor_specialization.join(', ')
        : doctor?.doctor_specialization ||
        doctor?.specialization ||
        doctor?.speciality ||
        '';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
            <AppHeader
                title="Prescription History"
                leftIconName="arrow-left"
                onLeftPress={() => props.navigation.goBack()}
                rightContent={
                    <View style={styles.headerActions}>
                        {hasContent ? (
                            <TouchableOpacity
                                onPress={onDownloadPdf}
                                disabled={downloadingPdf}
                                style={styles.headerIconBtn}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                {downloadingPdf ? (
                                    <ActivityIndicator size="small" color={COLORS.primary} />
                                ) : (
                                    <TablerIcon
                                        name="download"
                                        size={20}
                                        color={COLORS.primary}
                                    />
                                )}
                            </TouchableOpacity>
                        ) : null}
                        {!!doctorId && (
                            <TouchableOpacity onPress={openViewAll} style={styles.headerLabelBtn}>
                                <Text style={styles.headerLabelText}>View all</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                }
            />

            {loading && !payload ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loaderText}>Loading prescription…</Text>
                </View>
            ) : !hasContent ? (
                <View style={styles.emptyWrap}>
                    <TablerIcon name="prescription" size={36} color="#94A3B8" />
                    <Text style={styles.emptyTitle}>No prescription yet</Text>
                    <Text style={styles.emptySub}>
                        Medicines, diet advice, and do’s & don’ts will appear here once the
                        doctor issues them.
                    </Text>
                    {!!doctorId && (
                        <TouchableOpacity style={styles.emptyBtn} onPress={openViewAll}>
                            <Text style={styles.emptyBtnText}>View all consultations</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingBottom: insets.bottom + 110,
                            paddingHorizontal: 16,
                            paddingTop: 8,
                        }}
                        refreshControl={undefined}
                    >
                        {loading ? (
                            <View style={styles.inlineLoader}>
                                <ActivityIndicator color={COLORS.primary} />
                            </View>
                        ) : null}

                        {/* Patient */}
                        <View style={styles.patientRow}>
                            {patient?.patient_image ? (
                                <Image
                                    source={{ uri: patient.patient_image }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <View style={styles.initialAvatar}>
                                    <Text style={styles.initialText}>
                                        {patient?.patient_name?.charAt(0)?.toUpperCase() || 'P'}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.patientContent}>
                                <Text numberOfLines={1} style={styles.patientName}>
                                    {patient?.patient_name || 'Patient'}
                                </Text>
                                <Text style={styles.patientSubText}>
                                    {[
                                        patient?.age != null ? `Age ${patient.age}` : '',
                                        patient?.gender ? String(patient.gender) : '',
                                        patient?.relation ? String(patient.relation) : '',
                                    ]
                                        .filter(Boolean)
                                        .join(' · ') || '—'}
                                </Text>
                                <Text style={styles.patientSubText}>
                                    Issued {formatIssuedLabel(normalized.issuedOn)}
                                </Text>
                            </View>
                            {paymentAmount != null && (
                                <RupeeAmount
                                    value={paymentAmount}
                                    style={styles.patientFee}
                                    iconColor={COLORS.primary}
                                    iconSize={15}
                                />
                            )}
                        </View>

                        {(!!concernText ||
                            (!!diagnosisText &&
                                diagnosisText.toLowerCase() !==
                                concernText.toLowerCase() &&
                                diagnosisText.toLowerCase() !==
                                symptomText.toLowerCase()) ||
                            !!appointmentNotes ||
                            !!prescriptionCode ||
                            paymentAmount != null ||
                            !!paymentMethod ||
                            !!paymentStatus) && (
                                <View style={styles.metaCard}>
                                    {!!prescriptionCode && (
                                        <View style={styles.metaRow}>
                                            <Text style={styles.metaLabel}>Prescription Code</Text>
                                            <Text style={styles.metaValue}>{prescriptionCode}</Text>
                                        </View>
                                    )}
                                    {!!concernText && (
                                        <View style={styles.metaRow}>
                                            <Text style={styles.metaLabel}>Chief complaint</Text>
                                            <Text style={styles.metaValue}>{concernText}</Text>
                                        </View>
                                    )}
                                    {!!diagnosisText &&
                                        diagnosisText.toLowerCase() !==
                                        concernText.toLowerCase() &&
                                        diagnosisText.toLowerCase() !==
                                        symptomText.toLowerCase() && (
                                            <View style={styles.metaRow}>
                                                <Text style={styles.metaLabel}>Diagnosis</Text>
                                                <Text style={styles.metaValue}>{diagnosisText}</Text>
                                            </View>
                                        )}
                                    {!!appointmentNotes && (
                                        <View style={styles.metaRow}>
                                            <Text style={styles.metaLabel}>Notes</Text>
                                            <Text style={styles.metaValue}>{appointmentNotes}</Text>
                                        </View>
                                    )}
                                    {(paymentAmount != null ||
                                        !!paymentMethod ||
                                        !!paymentStatus) && (
                                            <View style={[styles.metaRow, styles.metaRowLast]}>
                                                <Text style={styles.metaLabel}>Payment</Text>
                                                <View style={styles.metaPaymentCol}>
                                                    {paymentAmount != null ? (
                                                        <RupeeAmount
                                                            value={paymentAmount}
                                                            style={styles.metaValue}
                                                            iconSize={13}
                                                            iconColor={COLORS.primary}
                                                        />
                                                    ) : null}
                                                    {!!(paymentMethod || paymentStatus) && (
                                                        <Text style={styles.metaSubValue}>
                                                            {[paymentMethod, paymentStatus]
                                                                .filter(Boolean)
                                                                .join(' · ')}
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                        )}
                                </View>
                            )}

                        {followUp.hasContent && (
                            <>
                                <SectionTitle title="Follow-up" />
                                <View style={styles.followUpCard}>
                                    <View style={styles.followUpTop}>
                                        <View style={styles.followUpIcon}>
                                            <TablerIcon
                                                name="calendar"
                                                size={18}
                                                color={COLORS.primary}
                                            />
                                        </View>
                                        <View style={styles.followUpMain}>
                                            <Text style={styles.followUpEyebrow}>
                                                {followUp.schedule
                                                    ? 'Scheduled follow-up'
                                                    : 'Follow-up advised'}
                                            </Text>
                                            <Text style={styles.followUpDate}>
                                                {followUp.dateLabel || 'Date to be confirmed'}
                                            </Text>
                                        </View>
                                        {!!followUp.status && (
                                            <View style={styles.followUpStatus}>
                                                <Text style={styles.followUpStatusText}>
                                                    {followUp.status}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    {!!followUp.reason && (
                                        <View style={styles.followUpBlock}>
                                            <Text style={styles.followUpLabel}>Reason</Text>
                                            <Text style={styles.followUpValue}>
                                                {followUp.reason}
                                            </Text>
                                        </View>
                                    )}
                                    {!!followUp.notes && (
                                        <View style={styles.followUpBlock}>
                                            <Text style={styles.followUpLabel}>Notes</Text>
                                            <Text style={styles.followUpValue}>
                                                {followUp.notes}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </>
                        )}

                        {hasClinicalHistory && (
                            <>
                                <SectionTitle title="Clinical History" />
                                <View style={styles.historyList}>
                                    {!!symptomText && (
                                        <HistoryBlock
                                            icon="stethoscope"
                                            title="Symptoms"
                                        >
                                            <Text style={styles.historyBody}>
                                                {symptomText}
                                            </Text>
                                        </HistoryBlock>
                                    )}

                                    {allergies.length > 0 && (
                                        <HistoryBlock
                                            icon="alert-circle"
                                            title="Allergies"
                                            tone="alert"
                                        >
                                            <View style={styles.allergyChipRow}>
                                                {allergies.map((item, index) => (
                                                    <View
                                                        key={`allergy-${index}`}
                                                        style={styles.allergyChip}
                                                    >
                                                        <Text style={styles.allergyChipText}>
                                                            {item}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </HistoryBlock>
                                    )}

                                    {!!pastIllnessText && (
                                        <HistoryBlock
                                            icon="clipboard-list"
                                            title="Past illness"
                                        >
                                            <Text style={styles.historyBody}>
                                                {pastIllnessText}
                                            </Text>
                                        </HistoryBlock>
                                    )}

                                    {!!familyHistoryText && (
                                        <HistoryBlock
                                            icon="users"
                                            title="Family history"
                                            tone="family"
                                        >
                                            <Text style={styles.historyBody}>
                                                {familyHistoryText}
                                            </Text>
                                        </HistoryBlock>
                                    )}
                                </View>
                            </>
                        )}

                        {/* Medicines */}
                        <SectionTitle title="Primary Medications" />
                        {medicines.length === 0 ? (
                            <Text style={styles.emptySection}>No medicines prescribed</Text>
                        ) : (
                            <View style={styles.medicineList}>
                                {medicines.map((medicine: any, index: number) => {
                                    const price = getMedicinePrice(medicine);
                                    const chips = getMedicineScheduleChips(medicine);
                                    const subtitle =
                                        medicine?.product_name ||
                                        medicine?.description ||
                                        medicine?.brand_name ||
                                        medicine?.composition ||
                                        '';

                                    return (
                                        <View
                                            key={
                                                medicine?.id ||
                                                `${medicine?.medicine_name}-${index}`
                                            }
                                            style={styles.medicineCard}
                                        >
                                            <View style={styles.medicineCardTop}>
                                                <View style={styles.medicineIcon}>
                                                    <TablerIcon
                                                        name="pill"
                                                        size={16}
                                                        color={COLORS.primary}
                                                    />
                                                </View>
                                                <View style={styles.medicineMain}>
                                                    <Text
                                                        style={styles.medicineName}
                                                        numberOfLines={2}
                                                    >
                                                        {medicine?.medicine_name ||
                                                            medicine?.product_name ||
                                                            'Medicine'}
                                                    </Text>
                                                    {!!subtitle &&
                                                        String(subtitle).toLowerCase() !==
                                                        String(
                                                            medicine?.medicine_name || '',
                                                        ).toLowerCase() && (
                                                            <Text
                                                                style={styles.medicineDesc}
                                                                numberOfLines={2}
                                                            >
                                                                {subtitle}
                                                            </Text>
                                                        )}
                                                </View>
                                                {price != null ? (
                                                    <RupeeAmount
                                                        value={price}
                                                        style={styles.medicinePrice}
                                                        iconSize={12}
                                                        iconColor={COLORS.primary}
                                                    />
                                                ) : null}
                                            </View>

                                            {chips.length > 0 ? (
                                                <View style={styles.scheduleRow}>
                                                    {chips.map(chip => (
                                                        <View
                                                            key={chip.key}
                                                            style={styles.scheduleItem}
                                                        >
                                                            <Text style={styles.scheduleCaption}>
                                                                {chip.caption}
                                                            </Text>
                                                            <Text style={styles.scheduleValue}>
                                                                {chip.label}
                                                            </Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            ) : null}

                                            {!!medicine?.instruction && (
                                                <View style={styles.instructionRow}>
                                                    <TablerIcon
                                                        name="clock"
                                                        size={13}
                                                        color={COLORS.secondary}
                                                    />
                                                    <Text style={styles.instructionText}>
                                                        {String(medicine.instruction)}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {/* Recommended diet plans */}
                        {dietPlans.length > 0 && (
                            <>
                                <SectionTitle title="Recommended Diet Plans" />
                                <View style={styles.dietPlanList}>
                                    {dietPlans.map((diet: any, index: number) => {
                                        const planId =
                                            diet?.diet_plan_id || diet?.id || index;
                                        const calories = diet?.avg_daily_calories;
                                        const meals = diet?.meals_per_day;
                                        return (
                                            <TouchableOpacity
                                                key={String(planId)}
                                                style={styles.dietPlanCard}
                                                activeOpacity={0.85}
                                                onPress={() => openDietPlan(diet)}
                                            >
                                                <View style={styles.dietPlanIcon}>
                                                    <TablerIcon
                                                        name="leaf"
                                                        size={18}
                                                        color={COLORS.primary}
                                                    />
                                                </View>
                                                <View style={styles.dietPlanMain}>
                                                    <Text
                                                        style={styles.dietPlanName}
                                                        numberOfLines={2}
                                                    >
                                                        {diet?.name ||
                                                            diet?.title ||
                                                            'Diet Plan'}
                                                    </Text>
                                                    <Text style={styles.dietPlanMeta}>
                                                        {[
                                                            calories != null
                                                                ? `~${Math.round(
                                                                    Number(calories),
                                                                )} kcal/day`
                                                                : '',
                                                            meals != null
                                                                ? `${meals} meals/day`
                                                                : '',
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' · ') ||
                                                            'Tap to view & start'}
                                                    </Text>
                                                </View>
                                                <View style={styles.dietPlanCta}>
                                                    <Text style={styles.dietPlanCtaText}>
                                                        View
                                                    </Text>
                                                    <TablerIcon
                                                        name="chevron-right"
                                                        size={16}
                                                        color={COLORS.primary}
                                                    />
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </>
                        )}

                        {/* Diet advice text (if any free-form advice) */}
                        {dietItems.length > 0 && (
                            <>
                                <SectionTitle title="Diet Advice" />
                                <View style={styles.softCard}>
                                    {dietItems.map((item, index) => (
                                        <AdviceRow
                                            key={`diet-${index}`}
                                            icon="leaf"
                                            text={item}
                                        />
                                    ))}
                                </View>
                            </>
                        )}

                        {/* Patient instructions / suggestions */}
                        {suggestions.length > 0 && (
                            <>
                                <SectionTitle title="Diagnosis" />
                                <View style={styles.softCard}>
                                    {suggestions.map((item, index) => (
                                        <AdviceRow
                                            key={`sug-${index}`}
                                            icon="circle-check"
                                            text={item}
                                        />
                                    ))}
                                </View>
                            </>
                        )}

                        {/* Do / Don't */}
                        {(doItems.length > 0 || dontItems.length > 0) && (
                            <>
                                <SectionTitle title="Do’s & Don’ts" />
                                {doItems.length > 0 && (
                                    <View style={[styles.softCard, styles.doCard]}>
                                        <Text style={styles.doCardTitle}>Do</Text>
                                        {doItems.map((item, index) => (
                                            <AdviceRow
                                                key={`do-${index}`}
                                                icon="plus"
                                                text={item}
                                                tone="do"
                                            />
                                        ))}
                                    </View>
                                )}
                                {dontItems.length > 0 && (
                                    <View style={[styles.softCard, styles.dontCard]}>
                                        <Text style={styles.dontCardTitle}>Don’t</Text>
                                        {dontItems.map((item, index) => (
                                            <AdviceRow
                                                key={`dont-${index}`}
                                                icon="x"
                                                text={item}
                                                tone="dont"
                                            />
                                        ))}
                                    </View>
                                )}
                            </>
                        )}

                        {/* Clinical advisory */}
                        {!!clinicalAdvisory && (
                            <View style={styles.successCard}>
                                <View style={styles.successTop}>
                                    <TablerIcon name="alert-circle" size={16} color="#FFFFFF" />
                                    <Text style={styles.successTitle}>CLINICAL OBSERVATIONS</Text>
                                </View>
                                <Text style={styles.successDesc}>{clinicalAdvisory}</Text>
                            </View>
                        )}

                        {/* Doctor */}
                        <SectionTitle title="Prescribing Physician" />
                        <View style={styles.doctorCard}>
                            <View style={styles.doctorRow}>
                                <Image
                                    source={
                                        doctor?.doctor_image
                                            ? { uri: doctor.doctor_image }
                                            : Images.doctorImage
                                    }
                                    style={styles.doctorImage}
                                />
                                <View style={{ flex: 1 }}>
                                    <Text numberOfLines={1} style={styles.doctorName}>
                                        {doctor?.doctor_name || 'Doctor'}
                                    </Text>
                                    {!!specialization && (
                                        <Text style={styles.doctorSpeciality}>{specialization}</Text>
                                    )}
                                </View>
                            </View>

                            <View style={styles.doctorInfo}>
                                {!!doctorLocation && (
                                    <View style={styles.infoRow}>
                                        <TablerIcon name="map-pin" size={14} color={COLORS.secondary} />
                                        <Text style={styles.infoText}>{doctorLocation}</Text>
                                    </View>
                                )}
                                {!!(doctor?.phone || doctor?.mobile || doctor?.contact_number) && (
                                    <View style={styles.infoRow}>
                                        <TablerIcon name="phone" size={14} color={COLORS.secondary} />
                                        <Text style={styles.infoText}>
                                            {doctor?.phone || doctor?.mobile || doctor?.contact_number}
                                        </Text>
                                    </View>
                                )}
                                {!!doctor?.email && (
                                    <View style={styles.infoRow}>
                                        <TablerIcon name="mail" size={14} color={COLORS.secondary} />
                                        <Text style={styles.infoText}>{doctor.email}</Text>
                                    </View>
                                )}
                                {!!doctor?.registration_number && (
                                    <View style={styles.infoRow}>
                                        <TablerIcon
                                            name="prescription"
                                            size={14}
                                            color={COLORS.secondary}
                                        />
                                        <Text style={styles.infoText}>
                                            Reg. {doctor.registration_number}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Status */}
                        <SectionTitle title="Prescription Status" />
                        <View style={styles.statusCard}>
                            <View style={styles.activeBadge}>
                                <View style={styles.activeDot} />
                                <Text style={styles.activeText}>
                                    {normalized.status
                                        ? String(normalized.status).replace(/_/g, ' ')
                                        : 'Issued'}
                                </Text>
                            </View>
                            <Text style={styles.dateInfo}>
                                Issued on {formatIssuedLabel(normalized.issuedOn)}
                            </Text>
                        </View>

                        {/* Help */}
                        <View style={styles.helpCard}>
                            <Text style={styles.helpTitle}>Need Assistance?</Text>
                            <Text style={styles.helpDesc}>
                                If you experience severe reactions, dizziness, or allergic
                                reactions, contact your doctor immediately.
                            </Text>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() =>
                                    handleCall(
                                        doctor?.phone ||
                                        doctor?.mobile ||
                                        doctor?.contact_number ||
                                        '',
                                    )
                                }
                                style={styles.contactBtn}
                            >
                                <Text style={styles.contactText}>Contact Now</Text>
                            </TouchableOpacity>
                        </View>

                        {!!doctorId && (
                            <TouchableOpacity style={styles.viewAllLink} onPress={openViewAll}>
                                <Text style={styles.viewAllLinkText}>
                                    View all consultations with{' '}
                                    {doctor?.doctor_name || 'this doctor'}
                                </Text>
                                <TablerIcon name="chevron-right" size={16} color={COLORS.primary} />
                            </TouchableOpacity>
                        )}
                    </ScrollView>

                    <View
                        style={[
                            styles.bottomContainer,
                            { paddingBottom: Math.max(insets.bottom, 16) },
                        ]}
                    >
                        {/* <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.shareBtn}
                            onPress={onShare}
                        >
                            <TablerIcon name="share" size={16} color={COLORS.secondary} />
                            <Text style={styles.shareText}>Share Record</Text>
                        </TouchableOpacity> */}

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.orderBtn}
                            onPress={() => props.navigation.navigate('MyCart')}
                        >
                            <Text style={styles.orderText}>Order Medicines</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
};

export default PrescriptionDetail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loader: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    loaderText: {
        fontSize: 13,
        color: COLORS.secondary,
        fontFamily: Fonts.PoppinsMedium,
    },
    inlineLoader: {
        alignItems: 'center',
        marginBottom: 8,
    },
    emptyWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        gap: 8,
    },
    emptyTitle: {
        marginTop: 8,
        fontSize: 16,
        color: COLORS.text,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    emptySub: {
        textAlign: 'center',
        fontSize: 13,
        lineHeight: 20,
        color: COLORS.secondary,
        fontFamily: Fonts.PoppinsRegular,
    },
    emptyBtn: {
        marginTop: 12,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    emptyBtnText: {
        color: '#fff',
        fontSize: 13,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    patientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.mint,
        borderRadius: 18,
        padding: 14,
    },
    avatar: {
        width: Math.min(64, width * 0.16),
        height: Math.min(64, width * 0.16),
        borderRadius: 18,
        marginRight: 14,
    },
    initialAvatar: {
        width: 64,
        height: 64,
        marginRight: 12,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initialText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    patientContent: {
        flex: 1,
        minWidth: 0,
    },
    patientName: {
        fontSize: 16,
        color: COLORS.text,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    patientSubText: {
        marginTop: 2,
        fontSize: 12,
        color: COLORS.secondary,
        fontFamily: Fonts.PoppinsMedium,
    },
    patientFee: {
        fontSize: 13,
        color: COLORS.primary,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    metaCard: {
        marginTop: 10,
        backgroundColor: COLORS.white,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    metaRowLast: {
        paddingTop: 2,
    },
    metaLabel: {
        width: 78,
        fontSize: 11,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsSemiBold,
        textTransform: 'uppercase',
        marginTop: 2,
    },
    metaValue: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
        color: COLORS.text,
        fontFamily: Fonts.PoppinsMedium,
    },
    metaSubValue: {
        marginTop: 2,
        fontSize: 11,
        color: COLORS.secondary,
        fontFamily: Fonts.PoppinsRegular,
        textTransform: 'capitalize',
    },
    followUpCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#D8EBE4',
        padding: 14,
        gap: 10,
        shadowColor: '#0D614E',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    followUpTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    followUpIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.mint,
        alignItems: 'center',
        justifyContent: 'center',
    },
    followUpMain: {
        flex: 1,
        minWidth: 0,
    },
    followUpEyebrow: {
        fontSize: 11,
        color: COLORS.primary,
        fontFamily: Fonts.PoppinsSemiBold,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    followUpDate: {
        marginTop: 2,
        fontSize: 16,
        color: COLORS.text,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    followUpStatus: {
        backgroundColor: '#ECFDF5',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    followUpStatusText: {
        fontSize: 11,
        color: '#047857',
        fontFamily: Fonts.PoppinsSemiBold,
        textTransform: 'capitalize',
    },
    followUpBlock: {
        backgroundColor: COLORS.mint,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    followUpLabel: {
        fontSize: 11,
        color: COLORS.secondary,
        fontFamily: Fonts.PoppinsSemiBold,
        textTransform: 'uppercase',
        marginBottom: 3,
    },
    followUpValue: {
        fontSize: 13,
        lineHeight: 19,
        color: COLORS.text,
        fontFamily: Fonts.PoppinsMedium,
    },
    historyList: {
        gap: 10,
    },
    historyCard: {
        backgroundColor: COLORS.white,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 12,
    },
    historyCardAlert: {
        borderColor: '#FDE68A',
        backgroundColor: '#FFFBEB',
    },
    historyCardFamily: {
        borderColor: '#E9D5FF',
        backgroundColor: '#FAF5FF',
    },
    historyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    historyIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 9,
        backgroundColor: COLORS.mint,
        alignItems: 'center',
        justifyContent: 'center',
    },
    historyIconAlert: {
        backgroundColor: '#FEF3C7',
    },
    historyIconFamily: {
        backgroundColor: '#F3E8FF',
    },
    historyTitle: {
        fontSize: 13,
        color: COLORS.text,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    historyBody: {
        fontSize: 13,
        lineHeight: 20,
        color: '#334155',
        fontFamily: Fonts.PoppinsRegular,
    },
    allergyChipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    allergyChip: {
        backgroundColor: '#FFF7ED',
        borderWidth: 1,
        borderColor: '#FDBA74',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    allergyChipText: {
        fontSize: 12,
        color: '#9A3412',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    metaPaymentCol: {
        flex: 1,
    },
    sectionTitleWrap: {
        marginTop: 16,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 15,
        color: COLORS.text,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    sectionUnderline: {
        marginTop: 5,
        width: 36,
        height: 3,
        borderRadius: 2,
        backgroundColor: COLORS.primary,
    },
    emptySection: {
        fontSize: 13,
        color: '#94A3B8',
        fontFamily: Fonts.PoppinsRegular,
    },
    medicineList: {
        gap: 8,
    },
    medicineCard: {
        backgroundColor: COLORS.white,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 12,
    },
    medicineCardTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    medicineIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#E8F3EF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    medicineMain: {
        flex: 1,
        minWidth: 0,
    },
    medicineName: {
        fontSize: 14,
        lineHeight: 19,
        color: COLORS.text,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    medicineDesc: {
        marginTop: 2,
        fontSize: 12,
        lineHeight: 17,
        color: COLORS.secondary,
        fontFamily: Fonts.PoppinsRegular,
    },
    medicinePrice: {
        fontSize: 12,
        color: COLORS.primary,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    scheduleRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
        gap: 8,
    },
    scheduleItem: {
        flexGrow: 1,
        flexBasis: '30%',
        minWidth: 96,
        backgroundColor: '#F3F7F5',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5EFEA',
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    scheduleCaption: {
        fontSize: 10,
        lineHeight: 14,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    scheduleValue: {
        marginTop: 2,
        fontSize: 13,
        lineHeight: 18,
        color: COLORS.text,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 8,
    },
    chip: {
        backgroundColor: '#F1F5F9',
        borderRadius: 999,
        paddingHorizontal: 9,
        paddingVertical: 4,
    },
    chipText: {
        fontSize: 11,
        color: '#475569',
        fontFamily: Fonts.PoppinsMedium,
    },
    dietPlanList: {
        gap: 8,
    },
    dietPlanCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: COLORS.white,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 12,
    },
    dietPlanIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#E8F3EF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dietPlanMain: {
        flex: 1,
        minWidth: 0,
    },
    dietPlanName: {
        fontSize: 14,
        lineHeight: 19,
        color: COLORS.text,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    dietPlanMeta: {
        marginTop: 2,
        fontSize: 12,
        lineHeight: 16,
        color: COLORS.secondary,
        fontFamily: Fonts.PoppinsRegular,
    },
    dietPlanCta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    dietPlanCtaText: {
        fontSize: 12,
        color: COLORS.primary,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    instructionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    instructionText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 17,
        color: COLORS.secondary,
        fontFamily: Fonts.PoppinsMedium,
    },
    softCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 14,
        gap: 10,
    },
    doCard: {
        backgroundColor: '#ECFDF5',
        borderColor: '#A7F3D0',
        marginBottom: 10,
    },
    dontCard: {
        backgroundColor: '#FEF2F2',
        borderColor: '#FECACA',
    },
    doCardTitle: {
        fontSize: 13,
        color: '#047857',
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: 2,
    },
    dontCardTitle: {
        fontSize: 13,
        color: '#B91C1C',
        fontFamily: Fonts.PoppinsSemiBold,
        marginBottom: 2,
    },
    adviceRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    adviceIconWrap: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#E8F3EF',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
    },
    adviceIconDo: {
        backgroundColor: '#D1FAE5',
    },
    adviceIconDont: {
        backgroundColor: '#FEE2E2',
    },
    adviceText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 20,
        color: COLORS.secondary,
        fontFamily: Fonts.PoppinsMedium,
    },
    successCard: {
        backgroundColor: COLORS.primary,
        borderRadius: 18,
        padding: 16,
        marginTop: 18,
    },
    successTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    successTitle: {
        fontSize: 13,
        color: '#FFFFFF',
        fontFamily: Fonts.PoppinsSemiBold,
        letterSpacing: 0.4,
    },
    successDesc: {
        marginTop: 10,
        fontSize: 13,
        lineHeight: 22,
        color: '#E2E8F0',
        fontFamily: Fonts.PoppinsRegular,
    },
    doctorCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 14,
    },
    doctorRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    doctorImage: {
        width: 52,
        height: 52,
        borderRadius: 16,
        marginRight: 12,
        backgroundColor: '#EFE9DC',
    },
    doctorName: {
        fontSize: 15,
        color: COLORS.text,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    doctorSpeciality: {
        marginTop: 3,
        fontSize: 12,
        color: COLORS.secondary,
        fontFamily: Fonts.PoppinsMedium,
    },
    doctorInfo: {
        marginTop: 14,
        gap: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.secondary,
        fontFamily: Fonts.PoppinsMedium,
    },
    statusCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 14,
        gap: 10,
    },
    activeBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.successBg,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 20,
        backgroundColor: COLORS.success,
        marginRight: 8,
    },
    activeText: {
        fontSize: 12,
        color: COLORS.success,
        fontFamily: Fonts.PoppinsSemiBold,
        textTransform: 'capitalize',
    },
    dateInfo: {
        fontSize: 12,
        color: COLORS.secondary,
        fontFamily: Fonts.PoppinsMedium,
    },
    helpCard: {
        marginTop: 22,
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        padding: 18,
    },
    helpTitle: {
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    helpDesc: {
        marginTop: 10,
        fontSize: 13,
        lineHeight: 22,
        color: '#DCE7E4',
        fontFamily: Fonts.PoppinsRegular,
    },
    contactBtn: {
        marginTop: 18,
        backgroundColor: COLORS.white,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactText: {
        fontSize: 14,
        color: COLORS.primary,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    viewAllLink: {
        marginTop: 18,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    viewAllLinkText: {
        fontSize: 13,
        color: COLORS.primary,
        fontFamily: Fonts.PoppinsSemiBold,
        textAlign: 'center',
    },
    bottomContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        gap: 10,
        alignItems: 'center',
    },
    shareBtn: {
        flex: 1,
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    shareText: {
        fontSize: 13,
        color: COLORS.secondary,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    orderBtn: {
        flex: 1,
        height: 52,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orderText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontFamily: Fonts.PoppinsSemiBold,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    headerIconBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerLabelBtn: {
        paddingHorizontal: 6,
        paddingVertical: 8,
    },
    headerLabelText: {
        fontSize: 13,
        color: COLORS.primary,
        fontFamily: Fonts.PoppinsMedium,
    },
});

