import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  ActivityIndicator,
  Share,
  StatusBar,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AppHeader from '../../components/AppHeader';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import TablerIcon, { TablerIconName } from '../../components/TablerIcon';
import * as _CONSULT_SERVICE from '../../services/ConsultServce';
import {
  consultationHasPrescription,
  formatIssuedLabel,
  getAllergiesList,
  getClinicalAdvisory,
  getConcernText,
  getDiagnosisText,
  getDoList,
  getDontList,
  getFamilyHistoryText,
  getFollowUpInfo,
  getMedicineItems,
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
import { downloadPdfToDevice } from '../../utils/fileDownloadUtils';
import { createPrescriptionPdfBytes } from '../../utils/buildConsultationDocumentPdf';
import { createPlainTextPdfBytes } from '../../utils/pdfPlainTextFallback';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const C = {
  primary: Colors.primaryColor,
  text: '#0F172A',
  muted: '#64748B',
  soft: '#94A3B8',
  line: '#EEF2F6',
  paper: '#FFFFFF',
  page: Colors.background,
  mint: '#ECF8F3',
  warn: '#B45309',
  warnBg: '#FFFBEB',
  danger: '#B91C1C',
  dangerBg: '#FEF2F2',
  ok: '#047857',
  okBg: '#ECFDF5',
};

const GRADIENT = ['#0D614E', '#14937A'];

const handleCall = (phoneNumber?: string) => {
  if (!phoneNumber) return;
  Linking.openURL(`tel:${phoneNumber}`).catch(() => undefined);
};

const SectionLabel = ({
  title,
  badge,
  icon,
  color = C.primary,
}: {
  title: string;
  badge?: string;
  icon?: TablerIconName;
  color?: string;
}) => (
  <View style={styles.sectionLabelRow}>
    <View style={styles.sectionLabelLeft}>
      {icon ? (
        <View style={[styles.sectionIcon, { backgroundColor: `${color}18` }]}>
          <TablerIcon name={icon} size={15} color={color} />
        </View>
      ) : null}
      <Text style={styles.sectionLabel}>{title}</Text>
    </View>
    {badge ? (
      <View style={[styles.sectionBadge, { backgroundColor: `${color}18` }]}>
        <Text style={[styles.sectionBadgeText, { color }]}>{badge}</Text>
      </View>
    ) : null}
  </View>
);

const FindingRow = ({
  icon,
  label,
  value,
  alert,
}: {
  icon: TablerIconName;
  label: string;
  value: string;
  alert?: boolean;
}) => (
  <View style={[styles.findingRow, alert && styles.findingAlert]}>
    <View style={[styles.findingIcon, alert && styles.findingIconAlert]}>
      <TablerIcon
        name={icon}
        size={14}
        color={alert ? '#9A3412' : C.primary}
      />
    </View>
    <View style={styles.findingBody}>
      <Text style={[styles.findingLabel, alert && styles.findingLabelAlert]}>
        {label}
      </Text>
      <Text style={styles.findingValue}>{value}</Text>
    </View>
  </View>
);

const ExpandableList = ({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'do' | 'dont';
}) => {
  const [expanded, setExpanded] = useState(false);
  const preview = 2;
  const shown = expanded ? items : items.slice(0, preview);
  const canToggle = items.length > preview;
  const accent = tone === 'do' ? C.primary : '#57534E';

  return (
    <View
      style={[
        styles.adviceBlock,
        tone === 'do' ? styles.adviceDo : styles.adviceDont,
      ]}
    >
      <View style={styles.adviceHead}>
        <View
          style={[
            styles.adviceIcon,
            tone === 'do' ? styles.adviceIconDo : styles.adviceIconDont,
          ]}
        >
          <TablerIcon
            name={tone === 'do' ? 'check' : 'x'}
            size={14}
            color={accent}
          />
        </View>
        <Text style={[styles.adviceTitle, { color: accent }]}>{title}</Text>
        <Text style={styles.adviceCount}>{items.length}</Text>
      </View>

      {shown.map((item, index) => (
        <View key={`${title}-${index}`} style={styles.adviceItem}>
          <Text style={[styles.adviceIndex, { color: accent }]}>
            {index + 1}.
          </Text>
          <Text style={styles.adviceText}>{item}</Text>
        </View>
      ))}

      {canToggle ? (
        <TouchableOpacity
          onPress={() => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );
            setExpanded(v => !v);
          }}
          style={styles.adviceToggle}
          activeOpacity={0.8}
        >
          <Text style={[styles.adviceToggleText, { color: accent }]}>
            {expanded ? 'Read less' : `Read more (+${items.length - preview})`}
          </Text>
          <TablerIcon
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={accent}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

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
      ? {
          ...params.PrisData,
          doctor: params.doctorData || params.PrisData?.doctor,
        }
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
      if (!hasSeedData) setLoading(true);
      const res = await _CONSULT_SERVICE.getAppointmentDetail(lookupId);
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
  const patient =
    normalized.patient ||
    payload?.appointment?.patient ||
    payload?.patient ||
    null;
  const prescription = normalized.prescription;
  const appointment = normalized.appointment || payload?.appointment || null;

  const medicines = getMedicineItems(prescription);
  const dietPlans = getRecommendedDietPlans(payload);
  const doItems = getDoList(prescription);
  const dontItems = getDontList(prescription);
  const suggestions = getSuggestionList(prescription);
  const clinicalNotes = getClinicalAdvisory(prescription);
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
  const followUp = getFollowUpInfo(prescription, appointment);

  const paymentStatus = String(
    payload?.payment?.status ||
      payload?.payment?.payment_status ||
      appointment?.payment?.status ||
      appointment?.payment?.payment_status ||
      '',
  ).trim();

  const doctorPhone =
    doctor?.phone || doctor?.mobile || doctor?.contact_number || '';

  const diseaseTags = useMemo(() => {
    const list = Array.isArray(doctor?.health_diseases)
      ? doctor.health_diseases.map((d: any) => d?.name).filter(Boolean)
      : [];
    return list.slice(0, 4);
  }, [doctor]);

  const specialization = Array.isArray(doctor?.doctor_specialization)
    ? doctor.doctor_specialization.filter(Boolean).join(', ')
    : doctor?.doctor_specialization ||
      doctor?.specialization ||
      doctor?.speciality ||
      diseaseTags.slice(0, 2).join(' · ') ||
      '';

  const patientLine = [
    patient?.age != null ? `${patient.age} yrs` : '',
    patient?.gender ? String(patient.gender) : '',
    patient?.relation ? String(patient.relation) : '',
  ]
    .filter(Boolean)
    .join(' · ');

  const visitLine = [
    appointment?.consultation_type
      ? String(appointment.consultation_type).replace(/_/g, ' ')
      : '',
    appointment?.start_time && appointment?.end_time
      ? `${String(appointment.start_time).slice(0, 5)}–${String(
          appointment.end_time,
        ).slice(0, 5)}`
      : '',
  ]
    .filter(Boolean)
    .join(' · ');

  const statusLabel = String(
    prescription?.status || normalized.status || 'issued',
  )
    .replace(/_/g, ' ')
    .trim();

  const openDietPlan = useCallback(
    (diet: any) => {
      const planId = diet?.diet_plan_id || diet?.id || diet?.plan_id || null;
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
          `Prescription ${prescriptionCode || ''}`.trim(),
          `Patient: ${patient?.patient_name || 'patient'}`,
          doctor?.doctor_name ? `Doctor: ${doctor.doctor_name}` : '',
          diagnosisText ? `Diagnosis: ${diagnosisText}` : '',
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
      String(prescription?.id || prescription?.prescription_id || '').trim();

    if (!prescriptionId) {
      showSuccessToast('Prescription id missing', 'error');
      return;
    }

    try {
      setDownloadingPdf(true);
      const response =
        await _CONSULT_SERVICE.downloadPrescriptionFile(prescriptionId);

      if (!response?.success) {
        throw new Error('Prescription PDF data not found');
      }

      const code = formatPrescriptionId(
        response.prescriptionData?.prescription_code ||
          prescription?.prescription_code ||
          prescriptionId,
      ).replace(/[^a-zA-Z0-9._-]/g, '_');

      if (response.prescriptionData) {
        const fileName = `Ayurmuni_Prescription_${code}.pdf`;
        const mergedPayload = {
          ...(payload ?? {}),
          ...response.prescriptionData,
          doctor:
            response.prescriptionData.doctor ??
            payload?.doctor ??
            params.doctorData,
          patient:
            response.prescriptionData.patient ??
            payload?.patient ??
            payload?.appointment?.patient,
          appointment:
            response.prescriptionData.appointment ?? payload?.appointment,
          prescription:
            response.prescriptionData.prescription ??
            response.prescriptionData,
          diets:
            response.prescriptionData.diets ??
            payload?.diets ??
            payload?.appointment?.diets,
        };
        try {
          const pdfBytes = await createPrescriptionPdfBytes(mergedPayload);
          await downloadPdfToDevice({ fileName, pdfBytes });
        } catch {
          const fallbackText = buildPrescriptionDownloadText(mergedPayload);
          const plainBytes = await createPlainTextPdfBytes(fallbackText);
          await downloadPdfToDevice({ fileName, pdfBytes: plainBytes });
        }
        return;
      }

      if (response.data && !response.base64) {
        await downloadPdfToDevice({
          fileName: `Ayurmuni_Prescription_${code}.pdf`,
          arrayBuffer: response.data as ArrayBuffer,
        });
        return;
      }

      if (!response.base64) {
        throw new Error('Prescription PDF data is empty');
      }

      await downloadPdfToDevice({
        fileName: `Ayurmuni_Prescription_${code}.pdf`,
        base64: response.base64,
      });
    } catch (e: any) {
      showSuccessToast(
        e?.message || 'Unable to download prescription PDF',
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
    payload,
    params.doctorData,
  ]);

  const stickyPad = Math.max(insets.bottom, 12);

  const presentingComplaint =
    concernText &&
    concernText.toLowerCase() !== symptomText.toLowerCase()
      ? concernText
      : '';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader
        title="Prescription"
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
                  <ActivityIndicator size="small" color={C.primary} />
                ) : (
                  <TablerIcon name="download" size={20} color={C.primary} />
                )}
              </TouchableOpacity>
            ) : null}
            {!!doctorId && (
              <TouchableOpacity onPress={openViewAll} style={styles.headerLabelBtn}>
                <Text style={styles.headerLabelText}>History</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {loading && !payload ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.loaderText}>Loading prescription…</Text>
        </View>
      ) : !hasContent ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <TablerIcon name="prescription" size={28} color={C.primary} />
          </View>
          <Text style={styles.emptyTitle}>No prescription yet</Text>
          <Text style={styles.emptySub}>
            Medicines and advice will appear here once the doctor issues them.
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: stickyPad + 92,
              paddingHorizontal: 14,
              paddingTop: 10,
            }}
          >
            {/* ===== RX PAPER ===== */}
            <View style={styles.paper}>
              {/* Doctor letterhead */}
              <View style={styles.letterhead}>
                <Image
                  source={
                    doctor?.doctor_image
                      ? { uri: doctor.doctor_image }
                      : Images.doctorImage
                  }
                  style={styles.doctorAvatar}
                />
                <View style={styles.letterheadMain}>
                  <Text style={styles.doctorName} numberOfLines={2}>
                    {doctor?.doctor_name || 'Doctor'}
                  </Text>
                  {!!specialization && (
                    <Text style={styles.doctorSpec} numberOfLines={2}>
                      {specialization}
                    </Text>
                  )}
                  <Text style={styles.doctorMeta} numberOfLines={1}>
                    {[
                      doctor?.experience_display
                        ? `${doctor.experience_display} yrs exp`
                        : doctor?.experience_years
                          ? `${doctor.experience_years} yrs exp`
                          : '',
                      doctorLocation,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>
                <View style={styles.rxMark}>
                  <Text style={styles.rxMarkText}>℞</Text>
                </View>
              </View>

              {diseaseTags.length > 0 ? (
                <View style={styles.tagRow}>
                  {diseaseTags.map((tag: string) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              <View style={styles.divider} />

              {/* Patient + Rx meta */}
              <View style={styles.patientBlock}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.eyebrow}>Patient</Text>
                  <Text style={styles.patientName} numberOfLines={1}>
                    {patient?.patient_name || 'Patient'}
                  </Text>
                  {!!patientLine && (
                    <Text style={styles.patientSub}>{patientLine}</Text>
                  )}
                  {!!visitLine && (
                    <Text style={styles.patientSub}>{visitLine}</Text>
                  )}
                </View>
                <View style={styles.rxMeta}>
                  {!!prescriptionCode && (
                    <Text style={styles.rxCode}>{prescriptionCode}</Text>
                  )}
                  <Text style={styles.rxDate}>
                    {formatIssuedLabel(normalized.issuedOn)}
                  </Text>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusText}>{statusLabel}</Text>
                  </View>
                  {paymentAmount != null ? (
                    <RupeeAmount
                      value={paymentAmount}
                      style={styles.feeText}
                      iconColor={C.primary}
                      iconSize={12}
                    />
                  ) : null}
                  {!!paymentStatus && (
                    <Text style={styles.payStatus}>{paymentStatus}</Text>
                  )}
                </View>
              </View>
            </View>

            {/* Clinical findings */}
            {(!!presentingComplaint ||
              !!symptomText ||
              !!clinicalNotes ||
              allergies.length > 0 ||
              !!pastIllnessText ||
              !!familyHistoryText) && (
              <View style={styles.card}>
                <SectionLabel
                  title="Clinical findings"
                  icon="stethoscope"
                />
                {!!presentingComplaint && (
                  <FindingRow
                    icon="clipboard-list"
                    label="Chief complaint"
                    value={presentingComplaint}
                  />
                )}
                {!!symptomText && (
                  <FindingRow
                    icon="notes"
                    label="Symptoms"
                    value={symptomText}
                  />
                )}
                {!!clinicalNotes && (
                  <FindingRow
                    icon="file-medical"
                    label="Examination"
                    value={clinicalNotes}
                  />
                )}
                {allergies.length > 0 && (
                  <FindingRow
                    icon="alert-circle"
                    label="Allergies"
                    value={allergies.join(', ')}
                    alert
                  />
                )}
                {!!pastIllnessText && (
                  <FindingRow
                    icon="history"
                    label="Past illness"
                    value={pastIllnessText}
                  />
                )}
                {!!familyHistoryText && (
                  <FindingRow
                    icon="users"
                    label="Family history"
                    value={familyHistoryText}
                  />
                )}
              </View>
            )}

            {/* Diagnosis */}
            {!!diagnosisText && (
              <View style={styles.diagnosisCard}>
                <View style={styles.diagnosisHead}>
                  <View style={styles.diagnosisIcon}>
                    <TablerIcon name="notes" size={16} color={C.primary} />
                  </View>
                  <Text style={styles.diagnosisTitle}>Diagnosis & advice</Text>
                </View>
                <Text style={styles.diagnosisText}>{diagnosisText}</Text>
              </View>
            )}

            {/* Medicines */}
            <View style={styles.card}>
              <SectionLabel
                title="Prescribed medicines"
                icon="pill"
                badge={medicines.length ? String(medicines.length) : undefined}
              />
              {medicines.length === 0 ? (
                <Text style={styles.emptySection}>No medicines prescribed</Text>
              ) : (
                medicines.map((medicine: any, index: number) => {
                  const chips = getMedicineScheduleChips(medicine);
                  const subtitle =
                    medicine?.product_name ||
                    medicine?.brand_name ||
                    medicine?.composition ||
                    '';
                  const showSub =
                    !!subtitle &&
                    String(subtitle).toLowerCase() !==
                      String(medicine?.medicine_name || '').toLowerCase();

                  return (
                    <View
                      key={medicine?.id || `${medicine?.medicine_name}-${index}`}
                      style={[
                        styles.medItem,
                        index === medicines.length - 1 && styles.medItemLast,
                      ]}
                    >
                      <View style={styles.medIndex}>
                        <Text style={styles.medIndexText}>{index + 1}</Text>
                      </View>
                      <View style={styles.medBody}>
                        <Text style={styles.medName}>
                          {medicine?.medicine_name ||
                            medicine?.product_name ||
                            'Medicine'}
                        </Text>
                        {showSub ? (
                          <Text style={styles.medSub}>{subtitle}</Text>
                        ) : null}

                        {chips.length > 0 ? (
                          <View style={styles.scheduleGrid}>
                            {chips.map(chip => (
                              <View key={chip.key} style={styles.scheduleCell}>
                                <Text style={styles.scheduleCap}>
                                  {chip.caption}
                                </Text>
                                <Text style={styles.scheduleVal}>
                                  {chip.label}
                                </Text>
                              </View>
                            ))}
                          </View>
                        ) : null}

                        {!!medicine?.instruction && (
                          <View style={styles.instructionBox}>
                            <TablerIcon name="notes" size={13} color={C.muted} />
                            <Text style={styles.instructionText}>
                              {String(medicine.instruction)}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            {/* Diet plans */}
            {dietPlans.length > 0 && (
              <View style={styles.card}>
                <SectionLabel title="Recommended diet" icon="leaf" />
                {dietPlans.map((diet: any, index: number) => {
                  const planId = diet?.diet_plan_id || diet?.id || index;
                  const calories = diet?.avg_daily_calories;
                  const meals = diet?.meals_per_day;
                  return (
                    <TouchableOpacity
                      key={String(planId)}
                      style={styles.dietRow}
                      activeOpacity={0.85}
                      onPress={() => openDietPlan(diet)}
                    >
                      <View style={styles.dietIcon}>
                        <TablerIcon name="leaf" size={18} color={C.primary} />
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.dietName} numberOfLines={2}>
                          {diet?.name || diet?.title || 'Diet Plan'}
                        </Text>
                        <Text style={styles.dietMeta}>
                          {[
                            calories != null
                              ? `~${Math.round(Number(calories))} kcal/day`
                              : '',
                            meals != null ? `${meals} meals/day` : '',
                          ]
                            .filter(Boolean)
                            .join(' · ') || 'Tap to view'}
                        </Text>
                      </View>
                      <View style={styles.dietCta}>
                        <Text style={styles.dietCtaText}>Open</Text>
                        <TablerIcon
                          name="chevron-right"
                          size={16}
                          color={C.primary}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Lifestyle */}
            {(doItems.length > 0 || dontItems.length > 0) && (
              <View style={styles.card}>
                <SectionLabel title="Lifestyle guidelines" icon="heart" />
                <View style={styles.lifestyleStack}>
                  {doItems.length > 0 ? (
                    <ExpandableList title="Do's" items={doItems} tone="do" />
                  ) : null}
                  {dontItems.length > 0 ? (
                    <ExpandableList
                      title="Don'ts"
                      items={dontItems}
                      tone="dont"
                    />
                  ) : null}
                </View>
              </View>
            )}

            {/* Extra instructions */}
            {suggestions.length > 0 && (
              <View style={styles.card}>
                <SectionLabel
                  title="Additional instructions"
                  icon="clipboard-list"
                />
                {suggestions.map((item, index) => (
                  <View key={`sug-${index}`} style={styles.bulletRow}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Follow-up */}
            {followUp.hasContent && (
              <View style={styles.followCard}>
                <View style={styles.followIcon}>
                  <TablerIcon name="calendar" size={18} color={C.primary} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.followEyebrow}>
                    {followUp.schedule
                      ? 'Follow-up scheduled'
                      : 'Follow-up advised'}
                  </Text>
                  <Text style={styles.followDate}>
                    {followUp.dateLabel || 'Date to be confirmed'}
                  </Text>
                  {!!followUp.reason && (
                    <Text style={styles.followReason}>{followUp.reason}</Text>
                  )}
                </View>
              </View>
            )}

            {/* Help / contact */}
            <View style={styles.helpCard}>
              <View style={styles.helpIcon}>
                <TablerIcon name="phone" size={16} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.helpTitle}>Need help with this Rx?</Text>
                <Text style={styles.helpDesc}>
                  For severe reactions or worsening symptoms, contact your
                  doctor right away.
                </Text>
                {!!doctorPhone && (
                  <TouchableOpacity
                    style={styles.contactBtn}
                    activeOpacity={0.85}
                    onPress={() => handleCall(doctorPhone)}
                  >
                    <Text style={styles.contactText}>Call doctor</Text>
                    <TablerIcon name="arrow-right" size={14} color={C.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>

          <View style={[styles.stickyBar, { paddingBottom: stickyPad }]}>
            <TouchableOpacity
              style={styles.shareBtn}
              activeOpacity={0.85}
              onPress={onShare}
            >
              <TablerIcon name="share" size={16} color={C.primary} />
              <Text style={styles.shareText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.orderWrap}
              activeOpacity={0.9}
              onPress={() => props.navigation.navigate('MyCart')}
            >
              <LinearGradient
                colors={GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.orderBtn}
              >
                <Text style={styles.orderText}>Order medicines</Text>
                <TablerIcon name="arrow-right" size={16} color="#FFFFFF" />
              </LinearGradient>
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
    backgroundColor: C.page,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.mint,
  },
  headerLabelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: C.mint,
  },
  headerLabelText: {
    fontSize: 12,
    color: C.primary,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loaderText: {
    fontSize: 13,
    color: C.muted,
    fontFamily: Fonts.PoppinsMedium,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    color: C.text,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  emptySub: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    color: C.muted,
    fontFamily: Fonts.PoppinsRegular,
  },

  paper: {
    backgroundColor: C.paper,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    padding: 14,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#0D614E',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
  },
  letterhead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.mint,
    marginRight: 12,
  },
  letterheadMain: {
    flex: 1,
    minWidth: 0,
  },
  doctorName: {
    fontSize: 16,
    color: C.text,
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },
  doctorSpec: {
    marginTop: 2,
    fontSize: 12,
    color: C.primary,
    fontFamily: Fonts.PoppinsMedium,
  },
  doctorMeta: {
    marginTop: 2,
    fontSize: 11,
    color: C.muted,
    fontFamily: Fonts.PoppinsRegular,
  },
  rxMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  rxMarkText: {
    fontSize: 22,
    color: C.primary,
    fontFamily: Fonts.PoppinsBold,
    includeFontPadding: false,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  tag: {
    backgroundColor: C.mint,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 10,
    color: C.primary,
    fontFamily: Fonts.PoppinsMedium,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.line,
    marginVertical: 12,
  },
  patientBlock: {
    flexDirection: 'row',
    gap: 12,
  },
  eyebrow: {
    fontSize: 10,
    color: C.soft,
    fontFamily: Fonts.PoppinsSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  patientName: {
    marginTop: 2,
    fontSize: 15,
    color: C.text,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  patientSub: {
    marginTop: 2,
    fontSize: 12,
    color: C.muted,
    fontFamily: Fonts.PoppinsMedium,
    textTransform: 'capitalize',
  },
  rxMeta: {
    alignItems: 'flex-end',
    maxWidth: '42%',
  },
  rxCode: {
    fontSize: 12,
    color: C.primary,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  rxDate: {
    marginTop: 2,
    fontSize: 11,
    color: C.muted,
    fontFamily: Fonts.PoppinsMedium,
  },
  statusPill: {
    marginTop: 6,
    backgroundColor: C.okBg,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 10,
    color: C.ok,
    fontFamily: Fonts.PoppinsSemiBold,
    textTransform: 'capitalize',
  },
  feeText: {
    marginTop: 6,
    fontSize: 13,
    color: C.primary,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  payStatus: {
    marginTop: 2,
    fontSize: 10,
    color: C.soft,
    fontFamily: Fonts.PoppinsMedium,
    textTransform: 'capitalize',
  },

  card: {
    backgroundColor: C.paper,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.line,
    padding: 14,
    marginBottom: 12,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionLabelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.mint,
  },
  sectionLabel: {
    fontSize: 14,
    color: C.text,
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.1,
    includeFontPadding: false,
  },
  sectionBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  sectionBadgeText: {
    fontSize: 11,
    color: C.primary,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  findingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
    backgroundColor: '#F8FAF9',
    borderColor: C.line,
  },
  findingAlert: {
    backgroundColor: '#FFF8F1',
    borderColor: '#F0E4D4',
  },
  findingIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    backgroundColor: C.mint,
  },
  findingIconAlert: {
    backgroundColor: '#F5EBE0',
  },
  findingBody: {
    flex: 1,
    minWidth: 0,
  },
  findingLabel: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 3,
    color: C.primary,
  },
  findingLabelAlert: {
    color: '#9A3412',
  },
  findingValue: {
    fontSize: 13,
    lineHeight: 19,
    color: C.text,
    fontFamily: Fonts.PoppinsMedium,
  },

  diagnosisCard: {
    backgroundColor: C.paper,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.line,
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
    padding: 14,
    marginBottom: 12,
  },
  diagnosisHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  diagnosisIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diagnosisTitle: {
    fontSize: 13,
    color: C.primary,
    fontFamily: Fonts.PoppinsSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  diagnosisText: {
    fontSize: 14,
    lineHeight: 22,
    color: C.text,
    fontFamily: Fonts.PoppinsMedium,
  },

  emptySection: {
    fontSize: 13,
    color: C.soft,
    fontFamily: Fonts.PoppinsRegular,
  },
  medItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAF9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.line,
  },
  medItemLast: {
    marginBottom: 0,
  },
  medIndex: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    borderWidth: 1,
    borderColor: C.line,
  },
  medIndexText: {
    fontSize: 12,
    color: C.primary,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  medBody: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },
  medName: {
    fontSize: 15,
    color: C.text,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  medSub: {
    marginTop: 2,
    fontSize: 12,
    color: C.muted,
    fontFamily: Fonts.PoppinsRegular,
  },
  scheduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  scheduleCell: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 90,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.line,
  },
  scheduleCap: {
    fontSize: 10,
    color: C.soft,
    fontFamily: Fonts.PoppinsMedium,
    textTransform: 'uppercase',
  },
  scheduleVal: {
    marginTop: 2,
    fontSize: 13,
    color: C.text,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  instructionBox: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: C.line,
  },
  instructionText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: C.muted,
    fontFamily: Fonts.PoppinsMedium,
  },

  dietRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAF9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  dietIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dietName: {
    fontSize: 14,
    color: C.text,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  dietMeta: {
    marginTop: 2,
    fontSize: 12,
    color: C.muted,
    fontFamily: Fonts.PoppinsRegular,
  },
  dietCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  dietCtaText: {
    fontSize: 12,
    color: C.primary,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  lifestyleStack: {
    gap: 0,
  },
  adviceBlock: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  adviceDo: {
    backgroundColor: '#F4F9F7',
    borderColor: '#D8EBE4',
  },
  adviceDont: {
    backgroundColor: '#FAFAFA',
    borderColor: '#E8E8E8',
    marginBottom: 0,
  },
  adviceHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  adviceIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adviceIconDo: {
    backgroundColor: C.mint,
  },
  adviceIconDont: {
    backgroundColor: '#F1F1F1',
  },
  adviceTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  adviceCount: {
    fontSize: 12,
    color: C.soft,
    fontFamily: Fonts.PoppinsMedium,
  },
  adviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 6,
  },
  adviceIndex: {
    width: 18,
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    marginTop: 1,
  },
  adviceText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#334155',
    fontFamily: Fonts.PoppinsRegular,
  },
  adviceToggle: {
    marginTop: 6,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  adviceToggleText: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.primary,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#334155',
    fontFamily: Fonts.PoppinsRegular,
  },

  followCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.paper,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.line,
    padding: 14,
    marginBottom: 12,
  },
  followIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followEyebrow: {
    fontSize: 11,
    color: C.primary,
    fontFamily: Fonts.PoppinsSemiBold,
    textTransform: 'uppercase',
  },
  followDate: {
    marginTop: 2,
    fontSize: 16,
    color: C.text,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  followReason: {
    marginTop: 3,
    fontSize: 12,
    color: C.muted,
    fontFamily: Fonts.PoppinsRegular,
  },

  helpCard: {
    backgroundColor: C.paper,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.line,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    gap: 12,
  },
  helpIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpTitle: {
    fontSize: 14,
    color: C.text,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  helpDesc: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: C.muted,
    fontFamily: Fonts.PoppinsRegular,
  },
  contactBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.mint,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 13,
    color: C.primary,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    backgroundColor: 'rgba(253,253,251,0.97)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.line,
  },
  shareBtn: {
    width: 96,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: C.primary,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  shareText: {
    fontSize: 13,
    color: C.primary,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  orderWrap: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  orderBtn: {
    minHeight: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  orderText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
