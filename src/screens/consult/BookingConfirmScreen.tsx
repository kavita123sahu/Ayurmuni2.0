import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  Pressable,
  BackHandler,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import { getAppointmentShareMessage } from '../../helper/shareMessage';
import { handleShareAction } from '../../hooks/DownloadFuction';
import { downloadPdfToDevice } from '../../utils/fileDownloadUtils';
import { createAppointmentPdfBytes } from '../../utils/buildConsultationDocumentPdf';
import { showSuccessToast } from '../../config/Key';
import TablerIcon, { TablerIconName } from '../../components/TablerIcon';
import {
  formatAppointmentDateFull,
  formatAppointmentTimeLabel,
  formatAppointmentWeekday,
  formatAppointmentDayLabel,
} from '../../utils/appointmentUtils';
import { formatAppointmentId } from '../../utils/formatDisplayId';
import { formatRupee } from '../../utils/currencyUtils';
import Utils from '../../common/Utils';

const { width, height } = Dimensions.get('window');
const SHEET_HEIGHT = height / 1.85;

type AppointmentStatus = 'CANCELLED' | 'CONFIRMED' | 'UPCOMING' | string;

const shareOptions = [
  {
    id: 1,
    title: 'WhatsApp',
    type: 'whatsapp',
    iconName: 'whatsapp' as TablerIconName,
    bg: '#E8F5F1',
    color: Colors.primaryColor,
  },
  {
    id: 2,
    title: 'Messages',
    type: 'message',
    iconName: 'chat-support' as TablerIconName,
    bg: '#DBEAFE',
    color: '#2563EB',
  },
  {
    id: 3,
    title: 'Email',
    type: 'email',
    iconName: 'mail' as TablerIconName,
    bg: '#FFEDD5',
    color: '#EA580C',
  },
  {
    id: 4,
    title: 'Copy Link',
    type: 'copy',
    iconName: 'share' as TablerIconName,
    bg: '#F1F5F9',
    color: '#475569',
  },
];

const BADGE_CONFIG: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  CONFIRMED: { bg: '#DCFCE7', color: '#15803D', label: 'Confirmed' },
  CANCELLED: { bg: '#FEE2E2', color: '#DC2626', label: 'Cancelled' },
  UPCOMING: { bg: '#FEF3C7', color: '#D97706', label: 'Upcoming' },
  BOOKED: { bg: '#DCFCE7', color: '#15803D', label: 'Booked' },
  PENDING: { bg: '#FEF3C7', color: '#D97706', label: 'Pending' },
};

const pickFirst = (...values: any[]) => {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return '';
};

const Badge = memo(({ status }: { status: AppointmentStatus }) => {
  const key = String(status || 'CONFIRMED').toUpperCase();
  const config = BADGE_CONFIG[key] || BADGE_CONFIG.CONFIRMED;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: config.color }]} />
      <Text style={[styles.badgeText, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
});

const DetailRow = memo(
  ({
    iconName,
    label,
    value,
    last,
  }: {
    iconName: TablerIconName;
    label: string;
    value: string;
    last?: boolean;
  }) => {
    if (!value) return null;

    return (
      <View style={[styles.detailRow, last && styles.detailRowLast]}>
        <View style={styles.iconWrapper}>
          <TablerIcon name={iconName} size={18} color={Colors.primaryColor} />
        </View>
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>{label}</Text>
          <Text style={styles.detailValue}>{value}</Text>
        </View>
      </View>
    );
  },
);

const BookingConfrimScreen = ({ navigation, route }: any) => {
  const { SlotsDetail } = route?.params || {};
  const [visible, setVisible] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const booking = useMemo(() => {
    const slot = SlotsDetail?.slot ?? SlotsDetail?.appointment ?? {};
    const info = SlotsDetail?.info ?? SlotsDetail?.doctor ?? {};

    const dateRaw = pickFirst(
      slot?.date,
      SlotsDetail?.date,
      SlotsDetail?.appointment_date,
      slot?.appointment_date,
    );
    const timeRaw = pickFirst(
      slot?.slot_time,
      slot?.start_time,
      slot?.time,
      SlotsDetail?.slot_time,
      SlotsDetail?.start_time,
      SlotsDetail?.time,
    );
    const endTimeRaw = pickFirst(slot?.end_time, SlotsDetail?.end_time);

    const weekday = formatAppointmentWeekday(dateRaw, false);
    const dayLabel = formatAppointmentDayLabel(dateRaw);
    const dateLabel = formatAppointmentDateFull(dateRaw);
    const timeLabel = formatAppointmentTimeLabel(timeRaw);
    const endTimeLabel = endTimeRaw
      ? formatAppointmentTimeLabel(endTimeRaw)
      : '';

    const specialization = Array.isArray(SlotsDetail?.doctor_specialization)
      ? SlotsDetail.doctor_specialization.filter(Boolean).join(', ')
      : pickFirst(
        SlotsDetail?.doctor_specialization,
        info?.specialization,
        info?.speciality,
        SlotsDetail?.specialization,
      );

    const status = pickFirst(
      SlotsDetail?.appointment_status,
      SlotsDetail?.status,
      slot?.appointment_status,
      'CONFIRMED',
    );

    return {
      doctorName: pickFirst(
        info?.doctor_name,
        SlotsDetail?.doctor_name,
        SlotsDetail?.doctor?.doctor_name,
        'Doctor',
      ),
      doctorImage: pickFirst(
        SlotsDetail?.doctor_image,
        info?.doctor_image,
        SlotsDetail?.doctor?.doctor_image,
      ),
      specialization,
      dateRaw,
      weekday,
      dayLabel,
      dateLabel,
      timeLabel,
      endTimeLabel,
      timeRange: endTimeLabel ? `${timeLabel} – ${endTimeLabel}` : timeLabel,
      concern: pickFirst(
        slot?.concern,
        SlotsDetail?.concern,
        SlotsDetail?.appointment?.concern,
      ),
      patientName: pickFirst(
        SlotsDetail?.patient?.patient_name,
        SlotsDetail?.patient_name,
        slot?.patient?.patient_name,
        SlotsDetail?.appointment?.patient?.patient_name,
      ),
      patientPhone: pickFirst(
        SlotsDetail?.patient?.phone_number,
        SlotsDetail?.patient?.phone,
        slot?.patient?.phone_number,
        slot?.patient?.phone,
        SlotsDetail?.patient_phone,
        SlotsDetail?.appointment?.patient?.phone_number,
        SlotsDetail?.appointment?.patient?.phone,
      ),
      hospitalName: pickFirst(
        SlotsDetail?.hospital_name,
        info?.hospital_name,
        SlotsDetail?.clinic_name,
      ),
      consultationMode: pickFirst(
        SlotsDetail?.consultation_mode,
        SlotsDetail?.mode,
        slot?.consultation_mode,
        'Video consultation',
      ),
      bookingId: pickFirst(
        SlotsDetail?.consultation_id,
        SlotDetailId(SlotsDetail),
        SlotsDetail?.appointment_id,
        SlotsDetail?.id,
        slot?.id,
      ),
      status,
      amount: pickFirst(
        SlotsDetail?.amount,
        SlotsDetail?.consultation_fee,
        SlotsDetail?.total_amount,
        slot?.amount,
      ),
    };
  }, [SlotsDetail]);

  const [registeredPhone, setRegisteredPhone] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const info = (await Utils.getData('_USER_INFO')) as
          | { phone_number?: string; phone?: string }
          | null;
        if (!active) return;
        const phone = pickFirst(info?.phone_number, info?.phone);
        if (phone) setRegisteredPhone(phone);
      } catch {
        // ignore
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const shareMessage = getAppointmentShareMessage({
    doctorName: booking.doctorName,
    patientPhone: booking.patientPhone || registeredPhone,
    date: [booking.weekday, booking.dateLabel].filter(Boolean).join(', '),
    time: booking.timeRange,
    status: booking.status,
    hospitalName: booking.hospitalName,
    consultationMode: booking.consultationMode,
  });

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true,
    );
    return () => subscription.remove();
  }, []);

  const closeBottomSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  }, [overlayAnim, slideAnim]);

  const openBottomSheet = useCallback(() => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [overlayAnim, slideAnim]);

  const onPressShareOption = useCallback(
    async (type: string) => {
      await handleShareAction({
        type,
        message: shareMessage,
        onComplete: closeBottomSheet,
      });
    },
    [closeBottomSheet, shareMessage],
  );

  const downloadAppointmentPdf = useCallback(async () => {
    if (downloadingPdf) return;
    try {
      setDownloadingPdf(true);
      const pdfBytes = await createAppointmentPdfBytes(SlotsDetail);
      const fileName = `Appointment_${formatAppointmentId(booking.bookingId).replace(/[^a-zA-Z0-9._-]/g, '_')}.pdf`;
      await downloadPdfToDevice({ fileName, pdfBytes });
    } catch (error: any) {
      showSuccessToast(
        error?.message || 'Unable to download appointment PDF',
        'error',
      );
    } finally {
      setDownloadingPdf(false);
    }
  }, [SlotsDetail, booking.bookingId, downloadingPdf]);

  const goHome = useCallback(() => {
    navigation.replace('HomeStack', { screen: 'Home' });
  }, [navigation]);

  const viewAppointments = useCallback(() => {
    navigation.navigate('Appointments');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#F4F8F6" barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Success hero */}
        <View style={styles.hero}>
          <View style={styles.successRingOuter}>
            <View style={styles.successRingInner}>
              <TablerIcon name="check" size={36} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.title}>Booking Confirmed</Text>
          <Text style={styles.subtitle}>
            Your consultation is secured. We’ve saved all appointment details
            below.
          </Text>

          <Badge status={booking.status} />
        </View>

        {/* Schedule highlight */}
        <View style={styles.scheduleCard}>
          <Text style={styles.scheduleEyebrow}>APPOINTMENT SCHEDULE</Text>

          <View style={styles.scheduleGrid}>
            <View style={styles.scheduleCell}>
              <View style={styles.scheduleIcon}>
                <TablerIcon name="calendar" size={18} color={Colors.primaryColor} />
              </View>
              <Text style={styles.scheduleLabel}>Day</Text>
              <Text style={styles.scheduleValue} numberOfLines={1}>
                {booking.weekday || booking.dayLabel || '—'}
              </Text>
              {!!booking.dayLabel &&
                booking.dayLabel !== booking.weekday &&
                (booking.dayLabel === 'Today' ||
                  booking.dayLabel === 'Tomorrow') && (
                  <Text style={styles.scheduleHint}>{booking.dayLabel}</Text>
                )}
            </View>

            <View style={styles.scheduleDivider} />

            <View style={styles.scheduleCell}>
              <View style={styles.scheduleIcon}>
                <TablerIcon name="calendar" size={18} color={Colors.primaryColor} />
              </View>
              <Text style={styles.scheduleLabel}>Date</Text>
              <Text style={styles.scheduleValue} numberOfLines={2}>
                {booking.dateLabel || '—'}
              </Text>
            </View>

            <View style={styles.scheduleDivider} />

            <View style={styles.scheduleCell}>
              <View style={styles.scheduleIcon}>
                <TablerIcon name="clock" size={18} color={Colors.primaryColor} />
              </View>
              <Text style={styles.scheduleLabel}>Time</Text>
              <Text style={styles.scheduleValue} numberOfLines={2}>
                {booking.timeRange || '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* Doctor + details */}
        <View style={styles.card}>
          <View style={styles.doctorRow}>
            <Image
              source={
                booking.doctorImage
                  ? { uri: booking.doctorImage }
                  : Images.doctorImage
              }
              style={styles.avatar}
            />
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName} numberOfLines={2}>
                {booking.doctorName}
              </Text>
              {!!booking.specialization && (
                <Text style={styles.speciality} numberOfLines={2}>
                  {booking.specialization}
                </Text>
              )}
              {!!booking.hospitalName && (
                <Text style={styles.hospitalText} numberOfLines={1}>
                  {booking.hospitalName}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.detailsDivider} />

          <View style={styles.detailsContainer}>
            <DetailRow
              iconName="calendar"
              label="Full date"
              value={
                [booking.weekday, booking.dateLabel].filter(Boolean).join(', ')
              }
            />
            <DetailRow
              iconName="clock"
              label="Consultation time"
              value={booking.timeRange}
            />
            <DetailRow
              iconName="video"
              label="Mode"
              value={booking.consultationMode}
            />
            <DetailRow
              iconName="user"
              label="Patient"
              value={booking.patientName}
            />
            <DetailRow
              iconName="stethoscope"
              label="Health concern"
              value={booking.concern}
            />
            <DetailRow
              iconName="building"
              label="Clinic / Hospital"
              value={booking.hospitalName}
            />
            <DetailRow
              iconName="receipt"
              label="Booking ID"
              value={formatAppointmentId(booking.bookingId)}
              last={!booking.amount}
            />
            {!!booking.amount && (
              <DetailRow
                iconName="cash"
                label="Amount paid"
                value={formatRupee(booking.amount)}
                last
              />
            )}
          </View>
        </View>

        <View style={styles.actionPair}>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('AddCalendar', {
                appointment: {
                  doctorName: booking.doctorName,
                  doctorImage: booking.doctorImage,
                  specialization: booking.specialization,
                  date: booking.dateRaw,
                  dateLabel: booking.dateLabel,
                  weekday: booking.weekday,
                  startTime: booking.timeLabel,
                  endTime: booking.endTimeLabel,
                  timeRange: booking.timeRange,
                  concern: booking.concern,
                  hospitalName: booking.hospitalName,
                  bookingId: booking.bookingId,
                  status: booking.status,
                },
              })
            }
            style={[styles.secondaryBtn, styles.actionHalf]}
          >
            <TablerIcon name="calendar" size={16} color={Colors.primaryColor} />
            <Text style={styles.secondaryText}>Add to Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={downloadAppointmentPdf}
            disabled={downloadingPdf}
            style={[styles.secondaryBtn, styles.actionHalf]}
          >
            <TablerIcon name="download" size={16} color={Colors.primaryColor} />
            <Text style={styles.secondaryText}>
              {downloadingPdf ? 'Downloading…' : 'Download PDF'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={openBottomSheet}
            style={[styles.secondaryBtn, styles.actionHalf]}
          >
            <TablerIcon name="share" size={16} color={Colors.primaryColor} />
            <Text style={styles.secondaryText}>Share</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.primaryBtn}
          onPress={goHome}
        >
          <Text style={styles.primaryText}>Go to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.75} onPress={viewAppointments}>
          <Text style={styles.bottomText}>View my appointments</Text>
        </TouchableOpacity>
      </ScrollView>

      {visible && (
        <View style={styles.absoluteContainer}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeBottomSheet}>
            <Animated.View
              style={[styles.overlay, { opacity: overlayAnim }]}
            />
          </Pressable>

          <Animated.View
            style={[
              styles.bottomSheet,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Share details</Text>
            <Text style={styles.sheetSubtitle}>
              Send this appointment summary to someone you trust.
            </Text>

            <View style={styles.shareCard}>
              <Image
                source={
                  booking.doctorImage
                    ? { uri: booking.doctorImage }
                    : Images.doctorImage
                }
                style={styles.doctorImage}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.doctorName1} numberOfLines={1}>
                  {booking.doctorName}
                </Text>
                {!!booking.specialization && (
                  <Text style={styles.speciality} numberOfLines={1}>
                    {booking.specialization}
                  </Text>
                )}
                <View style={styles.dateRow}>
                  <TablerIcon
                    name="calendar"
                    size={16}
                    color={Colors.primaryColor}
                  />
                  <Text style={styles.dateText} numberOfLines={2}>
                    {[booking.weekday, booking.dateLabel, booking.timeRange]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.optionsRow}>
              {shareOptions.map(item => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  style={styles.optionWrapper}
                  onPress={() => onPressShareOption(item.type)}
                >
                  <View
                    style={[styles.iconBox, { backgroundColor: item.bg }]}
                  >
                    <TablerIcon
                      name={item.iconName}
                      size={22}
                      color={item.color}
                    />
                  </View>
                  <Text style={styles.optionText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.cancelBtn}
              onPress={closeBottomSheet}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
};

/** Prefer readable short ids when API sends nested ids. */
function SlotDetailId(detail: any) {
  return pickFirst(
    detail?.booking_id,
    detail?.booking_code,
    detail?.order_code,
    detail?.reference_code,
  );
}

export default BookingConfrimScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8F6',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 50,
  },

  hero: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  successRingOuter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successRingInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 18,
    fontSize: 26,
    lineHeight: 34,
    textAlign: 'center',
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 14,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
    paddingHorizontal: 12,
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
  },

  scheduleCard: {
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCE8E3',
  },
  scheduleEyebrow: {
    fontSize: 11,
    letterSpacing: 0.8,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 14,
  },
  scheduleGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  scheduleCell: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  scheduleIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E8F5F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scheduleLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
    marginBottom: 4,
  },
  scheduleValue: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  scheduleHint: {
    marginTop: 4,
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  scheduleDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#D7E3DE',
    marginVertical: 4,
  },

  card: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: Math.min(width * 0.18, 72),
    height: Math.min(width * 0.18, 72),
    borderRadius: 18,
    marginRight: 14,
    backgroundColor: '#E2E8F0',
  },
  doctorInfo: {
    flex: 1,
    minWidth: 0,
  },
  doctorName: {
    fontSize: 18,
    lineHeight: 26,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  speciality: {
    marginTop: 2,
    fontSize: 12,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  hospitalText: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  detailsDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  detailsContainer: {
    gap: 0,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  detailRowLast: {
    marginBottom: 0,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F5F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
    minWidth: 0,
    paddingTop: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
    fontFamily: Fonts.PoppinsMedium,
  },
  detailValue: {
    fontSize: 14,
    lineHeight: 21,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsMedium,
  },

  actionPair: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 10,
  },
  actionHalf: {
    flex: 1,
    marginTop: 0,
  },
  secondaryBtn: {
    marginTop: 18,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0D614E33',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 10,
  },
  secondaryText: {
    fontSize: 13,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  primaryBtn: {
    marginTop: 12,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  bottomText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },

  absoluteContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    minHeight: height / 2.1,
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 20,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetTitle: {
    fontSize: 22,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  sheetSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  shareCard: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5F1',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#0D614E22',
  },
  doctorImage: {
    width: 54,
    height: 54,
    borderRadius: 14,
    marginRight: 12,
  },
  doctorName1: {
    fontSize: 16,
    lineHeight: 22,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  dateText: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  optionWrapper: {
    width: '22%',
    alignItems: 'center',
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    marginTop: 8,
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    fontFamily: Fonts.PoppinsMedium,
  },
  cancelBtn: {
    marginTop: 18,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    color: '#334155',
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
