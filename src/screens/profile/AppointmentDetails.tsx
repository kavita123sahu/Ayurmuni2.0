
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  BackHandler,
  Platform,
  Pressable,
  RefreshControl,
} from 'react-native';
import AppHeader from '../../components/AppHeader';
import { Fonts } from '../../common/Fonts';
import { Foundation, Ionicons } from '../../common/Vector';
import { Colors } from '../../common/Colors';
import { Images } from '../../common/Images';
import * as _CONSULT_SERVICE from '../../services/ConsultServce';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppointmentDetailSkeleton } from '../../simmerScreen/ShimmerHook';
import RescheduleModal from '../../components/RescheduleModal';
import CancelAppointmentModal from '../../components/CancelAppointModal';
import { handleAppointmentAction } from '../../hooks/AppointmentData';
import { showSuccessToast } from '../../config/Key';
import { Utils } from '../../common/Utils';
import FeedbackModal from '../../components/FeedbackModal';
import TablerIcon from '../../components/TablerIcon';
import {
  buildVideoCallNavParams,
  formatAppointmentDateFull,
  getAppointmentIds,
  resolveAppointmentLookupId,
} from '../../utils/appointmentUtils';
import { getStatusStyle, shadow, Theme } from '../../common/DataInterface';
import DoctorConsultationSection from '../../components/consult/DoctorConsultationSection';
import { consultationHasPrescription } from '../../utils/prescriptionDetailUtils';
import { hasPrescribedData } from '../../utils/doctorSlipUtils';
import { formatRupee, RupeeAmount } from '../../utils/currencyUtils';
import { SCREEN_THEME } from '../../constants/screenTheme';

const PrimaryButton = ({
  title,
  onPress,
  page,
}: {
  title: string;
  page: string;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.primaryBtn,
        { backgroundColor: page === 'appoint' ? Theme.emerald : Theme.danger },
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Ionicons name="videocam" size={18} color="#fff" />
        <Text style={styles.primaryText}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

type Props = {
  data: any;
  refreshData: () => void;
  navigation: any;
  token: any;
};

const DoctorDetail = ({ data, refreshData, navigation, token }: Props) => {
  const appointmentData = {
    doctorName: data?.doctor?.doctor_name || '',
    doctor_image: data?.doctor?.doctor_image || '',
    consultationId: resolveAppointmentLookupId({
      rawData: data,
      appointment: data?.appointment,
    }),
    patientName: data?.appointment?.patient?.patient_name || '',
    patientAvatar: data?.appointment?.patient?.patient_image || '',
  };

  const isLive = data?.appointment?.call_status === 'in_progress';
  const canOpenChat = !!appointmentData.consultationId;

  return (
    <View style={styles.heroCard}>
      <View style={styles.heroTopRow}>
        <Image
          source={
            data?.doctor?.doctor_image
              ? { uri: data?.doctor?.doctor_image }
              : Images.doctorImage
          }
          style={styles.heroAvatar}
        />
        <View style={styles.heroInfo}>
          <View style={styles.heroNameRow}>
            <Text numberOfLines={2} style={styles.doctorName}>
              {data?.doctor?.doctor_name}
            </Text>
            {isLive ? (
              <View style={styles.liveBadge}>
                <View style={styles.liveBadgeDot} />
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
            ) : null}
          </View>
          {!!data?.doctor?.doctor_specialization && (
            <Text numberOfLines={1} style={styles.specialtyText}>
              {Array.isArray(data?.doctor?.doctor_specialization)
                ? data.doctor.doctor_specialization.join(', ')
                : data?.doctor?.doctor_specialization}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.heroBody}>
        <View style={styles.dateTimeBox}>
          <View style={styles.dtItem}>
            <View style={styles.iconCircle}>
              <TablerIcon name="calendar" size={16} color={Colors.primaryColor} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>DATE</Text>
              <Text style={styles.value} numberOfLines={1}>
                {data?.appointment?.appointment_date}
              </Text>
            </View>
          </View>

          <View style={styles.dtDividerVertical} />

          <View style={styles.dtItem}>
            <View style={styles.iconCircle}>
              <TablerIcon name="clock" size={16} color={Colors.primaryColor} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>TIME</Text>
              <Text style={styles.value} numberOfLines={1}>
                {data?.appointment?.start_time}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.heroActions}>
          {isLive && (
            <PrimaryButton
              title="Join Video Call"
              page="appoint"
              onPress={() => {
                navigation.navigate(
                  'PatientVideoCallScreen',
                  buildVideoCallNavParams(
                    { rawData: data, appointment: data?.appointment },
                    {
                      role: 'patient',
                      otherPartyName: appointmentData.doctorName,
                      otherPartyImage: appointmentData.doctor_image,
                    },
                  ),
                );
              }}
            />
          )}

          {canOpenChat && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.secondaryBtn}
              onPress={() => {
                navigation.navigate('ChatScreen', {
                  doctorName: data?.doctor?.doctor_name,
                  doctorAvatar: data?.doctor?.doctor_image,
                  patientName: data?.appointment?.patient?.patient_name,
                  patientAvatar: data?.appointment?.patient?.patient_image,
                  appointmentId: appointmentData.consultationId,
                  role: 'patient',
                  appointmentDate: data?.appointment?.appointment_date,
                  chatContext: {
                    call_status: data?.appointment?.call_status,
                    appointment_status: data?.appointment?.appointment_status,
                    appointment_date: data?.appointment?.appointment_date,
                    follow_up:
                      data?.appointment?.follow_up ||
                      data?.prescription?.follow_up ||
                      data?.follow_up,
                  },
                });
              }}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={17}
                color={Theme.emerald}
              />
              <Text style={styles.secondaryText}>Chat with Doctor</Text>
            </TouchableOpacity>
          )}
        </View>

      </View>

    </View>
  );
};

const AppointmentDetailScreen = ({ route, navigation }: any) => {
  const routeLookupId = resolveAppointmentLookupId({
    consultation_id: route.params?.consultation_id,
    appointment_id:
      route.params?.appointment_id ??
      route.params?.appointmentId ??
      route.params?.id,
    id: route.params?.id ?? route.params?.appointmentId,
  });

  const [loading1, setLoading] = React.useState(true);
  const [detail, setDetail] = React.useState<any>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [token, setToken] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const alreadyReviewed = detail?.appointment?.review?.is_rated === true;

  const shouldShowReviewModal =
    detail?.appointment?.appointment_status?.toLowerCase() === 'completed' &&
    !alreadyReviewed;

  useEffect(() => {
    if (!shouldShowReviewModal) return;
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [shouldShowReviewModal]);

  useEffect(() => {
    if (!showModal) return;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, [showModal]);

  useLayoutEffect(() => {
    navigation.setOptions({ gestureEnabled: !showModal });
  }, [navigation, showModal]);

  const openShareExperience = (rating: number) => {
    if (alreadyReviewed) {
      showSuccessToast('You have already reviewed this consultation', 'error');
      return;
    }

    navigation.navigate('ShareExperienceScreen', {
      entityType: 'doctor',
      entityName: detail?.doctor?.doctor_name ?? 'Doctor',
      entitySubtitle: detail?.doctor?.doctor_specialization ?? '',
      appointmentId: routeLookupId,
      initialRating: rating,
      initialReview: '',
      initialImages: [],
      isEdit: false,
    });
  };

  const handleRatingContinue = (rating: number) => {
    setShowModal(false);
    openShareExperience(rating);
  };

  const fetchInFlightRef = useRef(false);

  const fetchDetail = useCallback(async (opts?: { silent?: boolean }) => {
    if (!routeLookupId) {
      showSuccessToast('Appointment id missing', 'error');
      setLoading(false);
      setDetail(null);
      return;
    }

    if (fetchInFlightRef.current) return;
    fetchInFlightRef.current = true;

    try {
      if (!opts?.silent) {
        setLoading(true);
      }
      const res = await _CONSULT_SERVICE.getAppointmentDetail(routeLookupId);
      if (!res?.success) {
        showSuccessToast(res?.message || 'Appointment not found', 'error');
        setDetail(null);
        return;
      }
      setDetail(res?.data ?? null);
    } catch (error) {
      showSuccessToast('Something went wrong', 'error');
    } finally {
      fetchInFlightRef.current = false;
      setLoading(false);
    }
  }, [routeLookupId]);

  useEffect(() => {
    const init = async () => {
      const userToken = await Utils.getData('_TOKEN');
      setToken(userToken);
    };
    init();
    fetchDetail();
  }, [fetchDetail]);

  const skipFocusFetchRef = useRef(true);

  useFocusEffect(
    useCallback(() => {
      // Skip the first focus (mount already fetches) to avoid double API call.
      if (skipFocusFetchRef.current) {
        skipFocusFetchRef.current = false;
        return;
      }
      if (routeLookupId) {
        fetchDetail({ silent: true });
      }
    }, [routeLookupId, fetchDetail]),
  );

  const normalizedAppointment = useMemo(() => {
    if (!detail?.appointment) return null;
    const item = detail;
    const ids = getAppointmentIds({
      rawData: detail,
      appointment: detail?.appointment,
    });

    return {
      consultation_id: ids.consultationId || ids.appointmentId,
      appointment_id: ids.appointmentId || ids.consultationId,
      doctorName: item.doctor?.doctor_name || '',
      specialty: item.doctor?.doctor_specialization || 'General Physician',
      date: item.appointment?.appointment_date,
      time: item?.appointment?.start_time,
      status: item?.appointment?.appointment_status,
      call_status: item?.appointment?.call_status,
      image: item.doctor?.doctor_image,
      availability: item.availability || [],
      rawData: item,
    };
  }, [detail]);

  const prscriptionData = detail?.prescription || detail?.appointment?.prescription;
  const appointmentStatus = normalizedAppointment?.status?.toLowerCase();

  const showButtons = !['cancelled', 'completed', 'rescheduled'].includes(appointmentStatus);
  const isRescheduleRequest = appointmentStatus === 'reschedule';

  // status pill color mapping — luxury muted tones instead of loud flat colors
  const statusStyleMap: Record<string, { bg: string; text: string }> = {
    completed: { bg: Theme.emeraldSoft, text: Theme.emerald },
    cancelled: { bg: Theme.dangerSoft, text: Theme.danger },
    rescheduled: { bg: Theme.goldSoft, text: Theme.gold },
    reschedule: { bg: Theme.goldSoft, text: Theme.gold },
    confirmed: { bg: Theme.emeraldSoft, text: Theme.emerald },
    pending: { bg: '#F1EEE7', text: Theme.subInk },
  };
  // const statusStyle = statusStyleMap[appointmentStatus || ''] || statusStyleMap.pending;

  const statusStyle = useMemo(
    () => getStatusStyle(appointmentStatus),
    [appointmentStatus]


  );

  const handleReschedule = async (
    appointmentId: string,
    payload: {
      action: string;
      availability: number;
      reschedule_reason?: string;
      cancellation_reason?: string;
    }
  ) => {
    let payloadSend: any = { action: payload.action };

    switch (payload.action) {
      case 'reschedule':
        payloadSend.availability = payload.availability;
        payloadSend.reschedule_reason = payload.reschedule_reason;
        break;
      case 'confirm_reschedule':
        payloadSend.availability = payload.availability;
        payloadSend.reschedule_reason = payload.reschedule_reason;
        break;
      case 'cancel':
        payloadSend.cancellation_reason = payload.cancellation_reason;
        break;
    }

    const res = await handleAppointmentAction({ appointmentId, payload: payloadSend });

    if (res?.success) {
      fetchDetail?.();
      setShowRescheduleModal(false);
      showSuccessToast(res.message, 'success');
      return;
    }

    showSuccessToast(res?.message || 'You cannot reschedule multiple times', 'error');
  };

  const handleCancel = async (
    appointmentId: string,
    payload: { action: string; cancellation_reason: string }
  ) => {
    let payloadSend: any = {
      action: payload.action,
      cancellation_reason: payload.cancellation_reason,
    };

    const res = await handleAppointmentAction({ appointmentId, payload: payloadSend });

    if (res?.success) {
      navigation.navigate('Appointments');
      setShowCancelModal(false);
      showSuccessToast(res?.message, 'success');
      return;
    }

    setShowCancelModal(false);
    showSuccessToast(res?.message || 'Something went wrong', 'error');
  };


  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchDetail?.();
    } catch (error) {
      console.log('REFRESH_ERROR', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchDetail]);

  const patient = detail?.appointment?.patient;
  const appointment = detail?.appointment;

  const formatLabel = (value?: string | null) => {
    if (!value) return '';
    return String(value)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  const patientFields = [
    { icon: 'person-outline', label: 'Name', value: patient?.patient_name },
    { icon: 'people-outline', label: 'Relation', value: patient?.relation ?? patient?.patient_relation },
    { icon: 'calendar-outline', label: 'Age', value: patient?.age },
    { icon: 'body-outline', label: 'Gender', value: formatLabel(patient?.gender) },
    { icon: 'call-outline', label: 'Phone', value: patient?.phone ?? patient?.phone_number },
    { icon: 'mail-outline', label: 'Email', value: patient?.email },
  ].filter(field => field.value !== undefined && field.value !== null && field.value !== '');

  const paymentAmount =
    detail?.payment?.consultation_fee ??
    detail?.payment?.amount ??
    appointment?.payment?.consultation_fee ??
    appointment?.payment?.amount ??
    null;
  const paymentStatusValue =
    detail?.payment?.status ||
    appointment?.payment_status ||
    appointment?.payment?.status ||
    null;

  const appointmentFields = [
    { icon: 'document-text-outline', label: 'Appointment ID', value: appointment?.appointment_id ?? appointment?.id },
    { icon: 'calendar-outline', label: 'Date', value: appointment?.appointment_date },
    { icon: 'time-outline', label: 'Start Time', value: appointment?.start_time },
    { icon: 'time-outline', label: 'End Time', value: appointment?.end_time },
    { icon: 'flag-outline', label: 'Status', value: formatLabel(appointment?.appointment_status) },
    { icon: 'videocam-outline', label: 'Call Status', value: formatLabel(appointment?.call_status) },
    {
      icon: 'medkit-outline',
      label: 'Consultation Type',
      value: formatLabel(appointment?.consultation_type ?? appointment?.mode),
    },
    {
      icon: 'cash-outline',
      label: 'Consultation Fee',
      value: paymentAmount != null ? formatRupee(paymentAmount) : null,
      isAmount: true,
      amountValue: paymentAmount,
    },
    {
      icon: 'cash-outline',
      label: 'Payment',
      value: formatLabel(paymentStatusValue),
    },
    {
      icon: 'repeat-outline',
      label: 'Follow-up date',
      value: (() => {
        const fu =
          appointment?.follow_up ||
          detail?.prescription?.follow_up ||
          detail?.follow_up ||
          null;
        const raw =
          fu?.date ??
          fu?.follow_up_date ??
          appointment?.follow_up_date ??
          detail?.follow_up_date ??
          null;
        if (!raw) {
          if (fu?.schedule) return 'Scheduled';
          return null;
        }
        return formatAppointmentDateFull(String(raw)) || String(raw);
      })(),
    },
    { icon: 'close-circle-outline', label: 'Cancellation Reason', value: appointment?.cancellation_reason },
    { icon: 'refresh-outline', label: 'Reschedule Reason', value: appointment?.reschedule_reason },
  ].filter(field => field.value !== undefined && field.value !== null && field.value !== '');

  const renderInfoFields = (fields: typeof patientFields | typeof appointmentFields) =>
    fields.map((field: any, index: number) => (
      <React.Fragment key={field.label}>
        {index > 0 ? <View style={styles.infoDivider} /> : null}
        <View style={styles.infoRow}>
          <View style={styles.infoLabelWrap}>
            <View style={styles.infoIconCircle}>
              <Ionicons name={field.icon as any} size={14} color={Theme.emerald} />
            </View>
            <Text style={styles.infoLabel}>{field.label}</Text>
          </View>
          {field.isAmount && field.amountValue != null ? (
            <RupeeAmount
              value={field.amountValue}
              style={styles.infoValue}
              iconSize={14}
              iconColor={Theme.emerald}
            />
          ) : (
            <Text style={styles.infoValue} numberOfLines={2}>
              {String(field.value)}
            </Text>
          )}
        </View>
      </React.Fragment>
    ));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right','bottom']}>
      <StatusBar
        barStyle={SCREEN_THEME.statusBarStyle}
        backgroundColor={SCREEN_THEME.statusBarBackground}
      />

      <AppHeader
        title="Appointment Details"
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: SCREEN_THEME.screenBackground }}
        refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#0D614E']}
          tintColor="#0D614E"
        />
      }>
        {loading1 ? (
          <AppointmentDetailSkeleton />
        ) : (
          <>
            {!!normalizedAppointment?.status ? (
              <View style={styles.statusRow}>
                <View style={[styles.statusPill, { backgroundColor: statusStyle.backgroundColor }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusStyle.color }]} />
                  <Text style={[styles.statusPillText, { color: statusStyle.color }]}>
                    {normalizedAppointment.status}
                  </Text>
                </View>
              </View>
            ) : null}

            <DoctorDetail
              refreshData={() => fetchDetail?.()}
              data={detail}
              token={token}
              navigation={navigation}
            />

            <View style={styles.sectionHeaderRow}>
              <Ionicons name="person-outline" size={15} color={Theme.gold} />
              <Text style={styles.sectionTitle}>Patient Information</Text>
            </View>
            <View style={styles.card}>
              {renderInfoFields(patientFields)}
            </View>

            {appointmentFields.length > 0 && (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="clipboard-outline" size={15} color={Theme.gold} />
                  <Text style={styles.sectionTitle}>Appointment Details</Text>
                </View>
                <View style={styles.card}>
                  {renderInfoFields(appointmentFields)}
                </View>
              </>
            )}

            {!!detail?.appointment?.concern ? (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="document-text-outline" size={15} color={Theme.gold} />
                  <Text style={styles.sectionTitle}>Reason for Visit</Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.reason}>{detail?.appointment?.concern}</Text>
                </View>
              </>
            ) : null}


            {/* {(consultationHasPrescription(detail) ||
              hasPrescribedData({
                prescription:
                  detail?.prescription || detail?.appointment?.prescription,
              }) || */}
            {detail?.prescription ? (
              <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={styles.prescriptionBtn}
                  onPress={() => {
                    navigation.navigate('PrescriptionDetail', {
                      appointment_id:
                        appointment?.appointment_id ||
                        appointment?.consultation_id ||
                        routeLookupId,
                      consultation_id:
                        appointment?.consultation_id || routeLookupId,
                    });
                  }}
                >
                  <TablerIcon name="prescription" size={18} color="#FFFFFF" />
                  <Text style={styles.prescriptionBtnText}>View Prescription</Text>
                  <TablerIcon name="chevron-right" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : null}


            {appointmentStatus === 'completed' ? (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="star-outline" size={15} color={Theme.gold} />
                  <Text style={styles.sectionTitle}>Your Review</Text>
                </View>


                <View style={styles.card}>
                  {detail?.appointment?.review?.is_rated ? (
                    <View>
                      <View style={styles.ratingRow}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Ionicons
                            key={i}
                            name={
                              i < (detail?.appointment?.review?.rating || 0)
                                ? 'star'
                                : 'star-outline'
                            }
                            size={18}
                            color={Theme.gold}
                            style={{ marginRight: 3 }}
                          />
                        ))}
                      </View>

                      <Text style={styles.reviewText}>
                        {detail?.appointment?.review?.review}
                      </Text>

                      {/* <Text style={styles.reviewSubmittedHint}>
                        Review submitted — editing is not allowed
                      </Text> */}
                    </View>
                  ) : (
                    <Pressable
                      style={styles.emptyReviewWrap}
                      onPress={() => setShowModal(true)}
                    >
                      <Ionicons name="star-outline" size={26} color={Theme.divider} />
                      <Text style={styles.emptyReview}>Tap to rate your consultation</Text>
                    </Pressable>
                  )}
                </View>
              </>
            ) : null}

            <View style={{ paddingHorizontal: 16, marginTop: showButtons ? 4 : 10 }}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.calendarBtn}
                onPress={() => {
                  const appt = detail?.appointment ?? {};
                  const doctor = detail?.doctor ?? {};
                  const specialization = Array.isArray(
                    doctor?.doctor_specialization,
                  )
                    ? doctor.doctor_specialization.join(', ')
                    : doctor?.doctor_specialization ||
                    doctor?.specialization ||
                    doctor?.speciality ||
                    '';
                  navigation.navigate('AddCalendar', {
                    appointment: {
                      doctorName: doctor?.doctor_name,
                      doctorImage: doctor?.doctor_image,
                      specialization,
                      date: appt?.appointment_date || appt?.date,
                      startTime: appt?.start_time || appt?.time,
                      endTime: appt?.end_time,
                      concern: appt?.concern,
                      hospitalName:
                        doctor?.hospital_name || appt?.hospital_name,
                      bookingId:
                        appt?.consultation_id ||
                        appt?.appointment_id ||
                        appt?.id,
                      status: appt?.appointment_status || appt?.status,
                    },
                  });
                }}
              >
                <View style={styles.calendarIconWrap}>
                  <Ionicons name="calendar-outline" size={18} color={Theme.emerald} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.calendarTitle}>Add to Calendar</Text>
                  <Text style={styles.calendarSub}>Save this visit on your device</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {showButtons ? (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.rescheduleBtn}
                  onPress={() => setShowRescheduleModal(true)}
                >
                  <Ionicons name="time-outline" size={16} color={Theme.emerald} />
                  <Text style={styles.rescheduleBtnText} numberOfLines={1}>
                    {isRescheduleRequest ? 'Request Change' : 'Reschedule'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.cancelBtn}
                  onPress={() => setShowCancelModal(true)}
                >
                  <Text style={styles.cancelBtnText} numberOfLines={1}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

          </>
        )}

        <RescheduleModal
          visible={showRescheduleModal}
          appointment={normalizedAppointment}
          isRescheduleRequest={isRescheduleRequest}
          onClose={() => setShowRescheduleModal(false)}
          onSubmit={(payload) => {
            const appointmentId =
              normalizedAppointment?.appointment_id ||
              normalizedAppointment?.consultation_id ||
              routeLookupId;
            if (!appointmentId) return;
            handleReschedule(appointmentId, payload);
            setShowRescheduleModal(false);
          }}
        />


        <FeedbackModal
          visible={showModal && !alreadyReviewed}
          loading={false}
          isEdit={false}
          mode="continue"
          initialRating={0}
          onClose={() => {
            setShowModal(false);
          }}
          onContinue={handleRatingContinue}
        />


        <CancelAppointmentModal
          visible={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onSubmit={(payload: any) => {
            const appointmentId =
              normalizedAppointment?.appointment_id ||
              normalizedAppointment?.consultation_id ||
              routeLookupId;
            if (!appointmentId) return;
            handleCancel(appointmentId, payload);
            setShowCancelModal(false);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AppointmentDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SCREEN_THEME.screenBackground,
  },

  // ---------- Status pill (top) ----------
  statusRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusPillText: {
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
    textTransform: 'capitalize',
    letterSpacing: 0.2,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 6,
  },

  consultSectionWrap: {
    marginHorizontal: 6,
    marginTop: 8,
  },

  sectionTitle: {
    marginLeft: 6,
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Theme.ink,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  card: {
    backgroundColor: Theme.cardBg,
    marginHorizontal: 16,
    marginTop: 0,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.cardBorder,
  },

  // ---------- Hero (Doctor) card ----------
  heroCard: {
    backgroundColor: Theme.cardBg,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.cardBorder,
    padding: 12,
    ...shadow('md'),
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroAvatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#EFE9DC',
  },

  heroInfo: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },

  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  heroBody: {
    marginTop: 12,
  },

  heroActions: {
    marginTop: 10,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  doctorName: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Theme.ink,
    marginBottom: 2,
  },

  specialtyText: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
    color: Theme.subInk,
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },

  liveBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#fff',
    marginRight: 4,
  },

  liveBadgeText: {
    fontSize: 9,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#fff',
    letterSpacing: 0.4,
  },

  divider: {
    height: 1,
    backgroundColor: Theme.divider,
    marginVertical: 10,
  },

  dateTimeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBF9F4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.divider,
  },

  dtItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },

  dtDividerVertical: {
    width: 1,
    height: 28,
    backgroundColor: Theme.divider,
  },

  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Theme.goldSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  textContainer: {
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
  },

  label: {
    marginBottom: 1,
    fontSize: 10,
    color: Theme.subInk,
    fontFamily: Fonts.PoppinsMedium,
    letterSpacing: 0.3,
  },

  value: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 12,
    color: Theme.ink,
  },

  primaryBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    ...shadow('md'),
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.2,
  },

  secondaryBtn: {
    flexDirection: 'row',
    backgroundColor: Theme.emeraldSoft,
    marginTop: 8,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryText: {
    color: Theme.emerald,
    marginLeft: 8,
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },

  infoLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: Theme.emeraldSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  infoDivider: {
    height: 1,
    backgroundColor: Theme.divider,
  },

  infoLabel: {
    fontSize: 12,
    color: Theme.subInk,
    fontFamily: Fonts.PoppinsMedium,
  },

  infoValue: {
    flexShrink: 1,
    marginLeft: 10,
    textAlign: 'right',
    fontSize: 13,
    color: Theme.ink,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  reason: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
    fontFamily: Fonts.PoppinsMedium,
    fontStyle: 'italic',
  },

  ratingRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },

  editReviewBtn: {
    marginTop: 14,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
  },

  editReviewText: {
    marginLeft: 6,
    fontSize: 14,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  reviewText: {
    fontSize: 14,
    color: Theme.ink,
    lineHeight: 20,
    fontFamily: Fonts.PoppinsMedium,
  },
  reviewSubmittedHint: {
    marginTop: 10,
    fontSize: 12,
    color: Theme.subInk,
    fontFamily: Fonts.PoppinsMedium,
  },

  emptyReviewWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },

  emptyReview: {
    marginTop: 6,
    fontSize: 13,
    color: Theme.subInk,
    fontFamily: Fonts.PoppinsMedium,
    fontStyle: 'italic',
  },

  outlineBtn: {
    flexDirection: 'row',
    marginTop: 10,
    borderWidth: 1.2,
    borderColor: Theme.emerald,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  outlineBtnText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Theme.emerald,
  },

  calendarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8E6',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  calendarIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F3F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarTitle: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  calendarSub: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: Fonts.PoppinsRegular,
    color: '#64748B',
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
  },

  rescheduleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: Theme.emerald,
    backgroundColor: '#FFFFFF',
  },
  rescheduleBtnText: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Theme.emerald,
  },

  prescriptionBtn: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: Theme.emerald,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },

  prescriptionBtnText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },

  cancelBtn: {
    flex: 1,
    marginTop: 0,
    marginBottom: 0,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.dangerSoft,
  },

  cancelBtnText: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Theme.danger,
  },
});