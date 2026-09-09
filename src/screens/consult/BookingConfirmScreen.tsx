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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import { getAppointmentShareMessage } from '../../helper/shareMessage';
import { handleShareAction } from '../../hooks/DownloadFuction';
import TablerIcon, { TablerIconName } from '../../components/TablerIcon';
import {
  formatAppointmentDateFull,
  formatAppointmentTimeLabel,
  formatAppointmentWeekday,
} from '../../utils/appointmentUtils';
import { formatAppointmentId } from '../../utils/formatDisplayId';
import { formatRupee } from '../../utils/currencyUtils';
import { Utils } from '../../common/Utils';

const { height } = Dimensions.get('window');
const SHEET_HEIGHT = height / 2.1;

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
    title: 'Copy',
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

/** Prefer readable short ids when API sends nested ids. */
function SlotDetailId(detail: any) {
  return pickFirst(
    detail?.booking_id,
    detail?.booking_code,
    detail?.order_code,
    detail?.reference_code,
  );
}

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

const MetaChip = memo(
  ({
    icon,
    label,
    value,
  }: {
    icon: TablerIconName;
    label: string;
    value: string;
  }) => {
    if (!value) return null;
    return (
      <View style={styles.metaChip}>
        <View style={styles.metaIcon}>
          <TablerIcon name={icon} size={13} color={Colors.primaryColor} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.metaLabel}>{label}</Text>
          <Text style={styles.metaValue} numberOfLines={2}>
            {value}
          </Text>
        </View>
      </View>
    );
  },
);

const InfoRow = memo(
  ({
    label,
    value,
    last,
  }: {
    label: string;
    value: string;
    last?: boolean;
  }) => {
    if (!value) return null;
    return (
      <View style={[styles.infoRow, last && styles.infoRowLast]}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
    );
  },
);

const BookingConfrimScreen = ({ navigation, route }: any) => {
  const { SlotsDetail } = route?.params || {};
  const insets = useSafeAreaInsets();
  const footerBottomPad = Math.max(insets.bottom, 8);
  const [visible, setVisible] = useState(false);

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

  const goHome = useCallback(() => {
    navigation.replace('HomeStack', { screen: 'Home' });
  }, [navigation]);

  const viewAppointments = useCallback(() => {
    navigation.navigate('Appointments');
  }, [navigation]);

  const addToCalendar = useCallback(() => {
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
    });
  }, [booking, navigation]);

  const dateDisplay = [booking.weekday, booking.dateLabel]
    .filter(Boolean)
    .join(', ');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#F4F7F6" barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Compact success */}
        <LinearGradient
          colors={['#E8F8F2', '#F4F7F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.checkCircle}>
            <TablerIcon name="check" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Booking confirmed</Text>
          <Text style={styles.subtitle}>
            Your consultation is booked. Details are saved below.
          </Text>
          <View style={styles.heroMeta}>
            <Badge status={booking.status} />
            {!!booking.bookingId && (
              <View style={styles.idChip}>
                <Text style={styles.idChipText}>
                  ID {formatAppointmentId(booking.bookingId)}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Doctor + schedule */}
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
                <Text style={styles.speciality} numberOfLines={1}>
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

          <View style={styles.metaGrid}>
            <MetaChip icon="calendar" label="Date" value={dateDisplay} />
            <MetaChip icon="clock" label="Time" value={booking.timeRange} />
            <MetaChip
              icon="video"
              label="Mode"
              value={booking.consultationMode}
            />
            {!!booking.amount && (
              <MetaChip
                icon="cash"
                label="Paid"
                value={formatRupee(booking.amount)}
              />
            )}
          </View>
        </View>

        {/* More details */}
        {(booking.patientName || booking.concern) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Appointment details</Text>
            <InfoRow label="Patient" value={booking.patientName} />
            <InfoRow
              label="Concern"
              value={booking.concern}
              last={!booking.hospitalName}
            />
            <InfoRow
              label="Clinic"
              value={booking.hospitalName}
              last
            />
          </View>
        )}

        {/* Quick actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={addToCalendar}
            style={styles.actionChip}
          >
            <TablerIcon name="calendar" size={15} color={Colors.primaryColor} />
            <Text style={styles.actionChipText}>Calendar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={openBottomSheet}
            style={styles.actionChip}
          >
            <TablerIcon name="share" size={15} color={Colors.primaryColor} />
            <Text style={styles.actionChipText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={viewAppointments}
            style={styles.actionChip}
          >
            <TablerIcon
              name="clipboard-list"
              size={15}
              color={Colors.primaryColor}
            />
            <Text style={styles.actionChipText}>Appointments</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 88 }} />
      </ScrollView>

      {/* Sticky home CTA */}
      <View style={[styles.stickyBar, { paddingBottom: footerBottomPad }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={goHome}
          style={styles.primaryBtnWrap}
        >
          <LinearGradient
            colors={['#0D614E', '#14937A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryText}>Go to Home</Text>
            <TablerIcon name="arrow-right" size={16} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

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
              Send this appointment summary
            </Text>

            <View style={styles.shareCard}>
              <Image
                source={
                  booking.doctorImage
                    ? { uri: booking.doctorImage }
                    : Images.doctorImage
                }
                style={styles.shareAvatar}
              />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.shareDoctor} numberOfLines={1}>
                  {booking.doctorName}
                </Text>
                {!!booking.specialization && (
                  <Text style={styles.shareSpec} numberOfLines={1}>
                    {booking.specialization}
                  </Text>
                )}
                <Text style={styles.shareWhen} numberOfLines={1}>
                  {[dateDisplay, booking.timeRange]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
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
                      size={20}
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

export default BookingConfrimScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7F6',
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 4,
    paddingBottom: 8,
  },

  hero: {
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 8,
  },
  checkCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    includeFontPadding: false,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    fontFamily: Fonts.PoppinsMedium,
    color: '#64748B',
    paddingHorizontal: 12,
  },
  heroMeta: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },
  idChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7EBE3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  idChipText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
    includeFontPadding: false,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8EEF2',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    marginBottom: 6,
    includeFontPadding: false,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#EAF8F4',
  },
  doctorInfo: {
    flex: 1,
    minWidth: 0,
  },
  doctorName: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    lineHeight: 19,
  },
  speciality: {
    marginTop: 1,
    fontSize: 11,
    fontFamily: Fonts.PoppinsMedium,
    color: '#64748B',
  },
  hospitalText: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: Fonts.PoppinsMedium,
    color: Colors.primaryColor,
  },

  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    width: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EEF2F0',
  },
  metaIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#EAF8F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaLabel: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsMedium,
    color: '#94A3B8',
    includeFontPadding: false,
  },
  metaValue: {
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    includeFontPadding: false,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  infoRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  infoLabel: {
    width: 72,
    fontSize: 11,
    fontFamily: Fonts.PoppinsMedium,
    color: '#94A3B8',
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
    lineHeight: 16,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  actionChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D7EBE3',
  },
  actionChipText: {
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.primaryColor,
    includeFontPadding: false,
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
  primaryBtnWrap: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryBtn: {
    minHeight: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: {
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#FFFFFF',
  },

  absoluteContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 10,
  },
  sheetTitle: {
    fontSize: 16,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  sheetSubtitle: {
    marginTop: 2,
    marginBottom: 12,
    fontSize: 12,
    fontFamily: Fonts.PoppinsMedium,
    color: '#64748B',
  },
  shareCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8EEF2',
    marginBottom: 14,
  },
  shareAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EAF8F4',
  },
  shareDoctor: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  shareSpec: {
    marginTop: 1,
    fontSize: 11,
    fontFamily: Fonts.PoppinsMedium,
    color: '#64748B',
  },
  shareWhen: {
    marginTop: 3,
    fontSize: 11,
    fontFamily: Fonts.PoppinsMedium,
    color: Colors.primaryColor,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  optionWrapper: {
    alignItems: 'center',
    width: '23%',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  optionText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#475569',
    textAlign: 'center',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 13,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#64748B',
  },
});
