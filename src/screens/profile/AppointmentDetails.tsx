
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
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
import { useCreateReview } from '../../hooks/useCreateReview';
import TablerIcon from '../../components/TablerIcon';
import { resolveAppointmentLookupId } from '../../utils/appointmentUtils';
import { getStatusStyle, shadow, Theme } from '../../common/DataInterface';

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
      consultation_id: data?.appointment?.consultation_id,
      appointment_id: data?.appointment?.appointment_id,
      id: data?.appointment?.id,
    }),
    patientName: data?.appointment?.patient?.patient_name || '',
    patientAvatar: data?.appointment?.patient?.patient_image || ''

  };

  const isLive = data?.appointment?.call_status === 'in_progress';

  const canOpenChat = !!appointmentData.consultationId;

  return (
    <View style={styles.heroCard}>
      {/* ---------- Banner ---------- */}
      <View style={styles.banner}>
        <Image
          source={data?.doctor?.doctor_image ? { uri: data?.doctor?.doctor_image } : Images.doctorImage}
          style={styles.bannerImage}
        />
        {/* scrim layers to fake a gradient without extra deps */}
        <View style={styles.scrimTop} />
        <View style={styles.scrimBottom} />

        {isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveBadgeDot} />
            <Text style={styles.liveBadgeText}>LIVE NOW</Text>
          </View>
        )}

        <View style={styles.bannerTextWrap}>
          <Text style={styles.doctorName}>{data?.doctor?.doctor_name}</Text>
          <View style={styles.specialtyPill}>
            <Ionicons name="medkit-outline" size={12} color={Theme.gold} />
            <Text style={styles.specialtyText}>{data?.doctor?.doctor_specialization}</Text>
          </View>
        </View>
      </View>

      {/* ---------- Content ---------- */}
      <View style={styles.heroBody}>
        <View style={styles.dateTimeBox}>
          <View style={styles.dtItem}>
            <View style={styles.iconCircle}>
              <TablerIcon name="calendar" size={18} color={Colors.primaryColor} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>DATE</Text>
              <Text style={styles.value}>{data?.appointment?.appointment_date}</Text>
            </View>
          </View>

          <View style={styles.dtDividerVertical} />

          <View style={styles.dtItem}>
            <View style={styles.iconCircle}>
              <TablerIcon name="clock" size={18} color={Colors.primaryColor} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>TIME</Text>
              <Text style={styles.value}>{data?.appointment?.start_time}</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 4 }}>
          {isLive && (
            <PrimaryButton
              title="Join Video Call"
              page="appoint"
              onPress={() => {
                navigation.navigate('PatientVideoCallScreen', {
                  appointmentId: appointmentData?.consultationId,
                  role: 'patient',
                  otherPartyImage: appointmentData?.doctor_image,
                  otherPartyName: appointmentData?.doctorName,



                });
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
                    follow_up: data?.appointment?.follow_up,
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
  const routeConsultationId =
    route.params?.consultation_id || route.params?.appointment_id;
  const consultation_id = resolveAppointmentLookupId({
    consultation_id: routeConsultationId,
    ...route.params,
  });

  console.log("consultionidddddd", consultation_id);

  const [loading1, setLoading] = React.useState(true);
  const [detail, setDetail] = React.useState<any>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [token, setToken] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [isEditReview, setIsEditReview] = useState(false);


  const [refreshing, setRefreshing] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const { loading, submitReview } = useCreateReview();

  const shouldShowReviewModal =
    detail?.appointment?.appointment_status?.toLowerCase() === 'completed' &&
    detail?.appointment?.review?.is_rated === false;

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

  const handleReviewSubmit = async ({
    rating,
    review,
    images = [],
  }: {
    rating: number;
    review: string;
    images?: string[];
  }) => {
    const response = await submitReview({
      entityType: 'doctor',
      appointmentId: consultation_id,
      method: isEditReview ? 'PATCH' : 'POST',
      reviewData: {
        rating,
        review,
        ...(isEditReview
          ? {}
          : { appointment: consultation_id }),
        image_urls: images,
      },
    });

    if (response?.success) {
      showSuccessToast(response?.message, 'success');

      setShowModal(false);
      setIsEditReview(false);

      fetchDetail();
      return;
    }

    showSuccessToast(
      response?.message ||
      (isEditReview
        ? 'Unable to update review'
        : 'Unable to submit review'),
      'error',
    );
  };

  const fetchDetail = async () => {
    // if (!consultation_id) {
    //   showSuccessToast('Appointment id missing', 'error');
    //   setLoading(false);
    //   return;
    // }

    try {
      setLoading(true);
      const res = await _CONSULT_SERVICE.getAppointmentDetail(consultation_id);
      console.log("apponitdetaillss", res);
      if (!res?.success) {
        showSuccessToast(res?.message || 'Appointment not found', 'error');
        setDetail(null);
        return;
      }
      setDetail(res?.data ?? null);
    } catch (error) {
      showSuccessToast('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const userToken = await Utils.getData('_TOKEN');
      setToken(userToken);
    };
    init();
    fetchDetail();
  }, [consultation_id]);

  const normalizedAppointment = useMemo(() => {
    if (!detail?.appointment) return null;
    const item = detail;
    return {
      consultation_id:
        resolveAppointmentLookupId({
          consultation_id: item?.appointment?.consultation_id || consultation_id,
          appointment: item?.appointment,
          rawData: item,
        }) || consultation_id,
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
  }, [detail, consultation_id]);

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.bg} />

      <AppHeader
        title="Appointment Details"
        onLeftPress={() => navigation.goBack()}
      // rightIconName="search"
      // onRightPress={() => console.log('Search clicked')}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: Theme.bg }} refreshControl={
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
            {normalizedAppointment?.status && (
              <View style={styles.statusRow}>
                <View style={[styles.statusPill, { backgroundColor: statusStyle.backgroundColor }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusStyle.color }]} />
                  <Text style={[styles.statusPillText, { color: statusStyle.color }]}>
                    {normalizedAppointment.status}
                  </Text>
                </View>
              </View>
            )}

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
              <View style={styles.infoRow}>
                <View style={styles.infoLabelWrap}>
                  <View style={styles.infoIconCircle}>
                    <Ionicons name="person-outline" size={14} color={Theme.emerald} />
                  </View>
                  <Text style={styles.infoLabel}>Name</Text>
                </View>
                <Text style={styles.infoValue}>{detail?.appointment?.patient?.patient_name}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <View style={styles.infoLabelWrap}>
                  <View style={styles.infoIconCircle}>
                    <Ionicons name="calendar-outline" size={14} color={Theme.emerald} />
                  </View>
                  <Text style={styles.infoLabel}>Age</Text>
                </View>
                <Text style={styles.infoValue}>{detail?.appointment?.patient?.age}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <View style={styles.infoLabelWrap}>
                  <View style={styles.infoIconCircle}>
                    <Ionicons name="body-outline" size={14} color={Theme.emerald} />
                  </View>
                  <Text style={styles.infoLabel}>Gender</Text>
                </View>
                <Text style={styles.infoValue}>{detail?.appointment?.patient?.gender}</Text>
              </View>
            </View>


            {detail?.appointment?.concern && (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="document-text-outline" size={15} color={Theme.gold} />
                  <Text style={styles.sectionTitle}>Reason for Visit</Text>
                </View>

                <View style={styles.card}>
                  <Foundation name="quote" size={20} color={Theme.goldSoft} style={{ marginBottom: 4 }} />
                  <Text style={styles.reason}>{detail?.appointment?.concern}</Text>
                </View>
              </>)}

            {appointmentStatus === 'completed' && (
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

                      <TouchableOpacity
                        style={styles.editReviewBtn}
                        onPress={() => {
                          setReviewRating(detail?.appointment?.review?.rating || 0);
                          setReviewText(detail?.appointment?.review?.review || '');
                          setSelectedImages(
                            detail?.appointment?.review?.attachments || []
                          ); // agar images hain
                          setIsEditReview(true);
                          setShowModal(true);
                        }}
                      >
                        <Ionicons
                          name="create-outline"
                          size={16}
                          color="#0D614E"
                        />
                        <Text style={styles.editReviewText}>
                          Edit Review
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Pressable style={styles.emptyReviewWrap} >
                      <Ionicons name="star-outline" size={26} color={Theme.divider} />
                      <Text style={styles.emptyReview}>You have not submitted a review yet.</Text>
                    </Pressable>
                  )}
                </View>
              </>
            )}

            {showButtons && (
              <View style={{ paddingHorizontal: 16 }}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.outlineBtn}
                  onPress={() => setShowRescheduleModal(true)}
                >
                  <Ionicons name="calendar-outline" size={17} color={Theme.emerald} />
                  <Text style={styles.outlineBtnText}>
                    {isRescheduleRequest ? 'Request To Change' : 'Reschedule'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.cancelBtn}
                  onPress={() => setShowCancelModal(true)}
                >
                  <Text style={styles.cancelBtnText}>Cancel Appointment</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        <RescheduleModal
          visible={showRescheduleModal}
          appointment={normalizedAppointment}
          isRescheduleRequest={isRescheduleRequest}
          onClose={() => setShowRescheduleModal(false)}
          onSubmit={(payload) => {
            handleReschedule(normalizedAppointment?.consultation_id, payload);
            setShowRescheduleModal(false);
          }}
        />

        <FeedbackModal
          visible={showModal}
          loading={loading}
          isEdit={isEditReview}
          initialRating={detail?.appointment?.review?.rating}
          initialReview={detail?.appointment?.review?.review}
          initialImages={detail?.appointment?.review?.attachments || []}
          onClose={() => {
            setShowModal(false);
            setIsEditReview(false);
          }}
          onSubmit={handleReviewSubmit}
        />


        <CancelAppointmentModal
          visible={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onSubmit={(payload: any) => {
            handleCancel(normalizedAppointment?.consultation_id, payload);
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
    backgroundColor: Theme.bg,
  },

  // ---------- Status pill (top) ----------
  statusRow: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusPillText: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    textTransform: 'capitalize',
    letterSpacing: 0.3,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginHorizontal: 20,
    marginBottom: 10,
  },

  sectionTitle: {
    marginLeft: 6,
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Theme.ink,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  card: {
    backgroundColor: Theme.cardBg,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.cardBorder,
    // ...shadow('md'),
  },

  // ---------- Hero (Doctor) card ----------
  heroCard: {
    backgroundColor: Theme.cardBg,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Theme.cardBorder,
    overflow: 'hidden',
    ...shadow('lg'),
  },

  banner: {
    width: '100%',
    height: 168,
    backgroundColor: '#EFE9DC',
  },

  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  scrimTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },

  scrimBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 92,
    backgroundColor: 'rgba(15,20,17,0.55)',
  },

  bannerTextWrap: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 14,
  },

  heroBody: {
    padding: 18,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  doctorName: {
    fontSize: 19,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#fff',
    marginBottom: 8,
  },

  specialtyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(244,233,211,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  specialtyText: {
    marginLeft: 5,
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
    color: '#F4E9D3',
  },

  liveBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  liveBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 5,
  },

  liveBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#fff',
    letterSpacing: 0.6,
  },

  divider: {
    height: 1,
    backgroundColor: Theme.divider,
    marginVertical: 16,
  },

  dateTimeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBF9F4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.divider,
    paddingVertical: 4,
  },

  dtItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  dtDividerVertical: {
    width: 1,
    height: 34,
    backgroundColor: Theme.divider,
  },

  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Theme.goldSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  textContainer: {
    flexDirection: 'column',
  },

  label: {
    marginBottom: 2,
    fontSize: 11,
    color: Theme.subInk,
    fontFamily: Fonts.PoppinsMedium,
    letterSpacing: 0.4,
  },

  value: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 14,
    color: Theme.ink,
  },

  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
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
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    letterSpacing: 0.3,
  },

  secondaryBtn: {
    flexDirection: 'row',
    backgroundColor: Theme.emeraldSoft,
    marginTop: 10,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryText: {
    color: Theme.emerald,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },

  infoLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 8,
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
    fontSize: 13,
    color: Theme.subInk,
    fontFamily: Fonts.PoppinsMedium,
  },

  infoValue: {
    fontSize: 14,
    color: Theme.ink,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  reason: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 21,
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
    marginTop: 14,
    borderWidth: 1.4,
    borderColor: Theme.emerald,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  outlineBtnText: {
    marginLeft: 8,
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Theme.emerald,
  },

  cancelBtn: {
    marginTop: 12,
    marginBottom: 30,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: Theme.dangerSoft,
  },

  cancelBtnText: {
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Theme.danger,
  },
});