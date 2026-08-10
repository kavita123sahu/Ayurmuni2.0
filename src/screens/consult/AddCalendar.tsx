import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Images } from '../../common/Images';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import TablerIcon, { TablerIconName } from '../../components/TablerIcon';
import {
  buildAppointmentCalendarEvent,
  openGoogleCalendar,
  openOutlookCalendar,
  shareCalendarInvite,
} from '../../utils/calendarUtils';
import {
  formatAppointmentDateFull,
  formatAppointmentTimeLabel,
  formatAppointmentWeekday,
} from '../../utils/appointmentUtils';
import { showSuccessToast } from '../../config/Key';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 360;

type AppointmentStatus = 'COMPLETED' | 'CANCELLED' | 'UPCOMING' | 'CONFIRMED' | string;

const BADGE_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  COMPLETED: { bg: '#DCFCE7', color: '#16A34A', label: 'Completed' },
  CANCELLED: { bg: '#FEE2E2', color: '#DC2626', label: 'Cancelled' },
  UPCOMING: { bg: '#FEF3C7', color: '#D97706', label: 'Upcoming' },
  CONFIRMED: { bg: '#DCFCE7', color: '#15803D', label: 'Confirmed' },
  BOOKED: { bg: '#DCFCE7', color: '#15803D', label: 'Booked' },
};

const Badge = memo(({ status }: { status: AppointmentStatus }) => {
  const key = String(status || 'CONFIRMED').toUpperCase();
  const config = BADGE_CONFIG[key] || BADGE_CONFIG.CONFIRMED;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
});

const DetailRow = memo(
  ({
    iconName,
    label,
    value,
  }: {
    iconName: TablerIconName;
    label: string;
    value: string;
  }) => {
    if (!value) return null;
    return (
      <View style={styles.detailRow}>
        <View style={styles.iconWrapper}>
          <TablerIcon name={iconName} size={20} color={Colors.primaryColor} />
        </View>
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>{label}</Text>
          <Text style={styles.detailValue} numberOfLines={2}>
            {value}
          </Text>
        </View>
      </View>
    );
  },
);

const AddCalendar = ({ navigation, route }: any) => {
  const appointment = route?.params?.appointment ?? {};
  const [busy, setBusy] = useState<'google' | 'outlook' | 'device' | null>(null);

  const display = useMemo(() => {
    const dateRaw = appointment.date || appointment.appointment_date || '';
    const startRaw =
      appointment.startTime ||
      appointment.time ||
      appointment.slot_time ||
      '';
    const endRaw = appointment.endTime || appointment.end_time || '';
    const weekday =
      appointment.weekday || formatAppointmentWeekday(dateRaw, false);
    const dateLabel =
      appointment.dateLabel || formatAppointmentDateFull(dateRaw);
    const startLabel =
      appointment.timeLabel || formatAppointmentTimeLabel(startRaw);
    const endLabel = endRaw ? formatAppointmentTimeLabel(endRaw) : '';
    const timeRange =
      appointment.timeRange ||
      (endLabel ? `${startLabel} – ${endLabel}` : startLabel);

    return {
      doctorName: appointment.doctorName || 'Doctor',
      doctorImage: appointment.doctorImage || '',
      specialization: appointment.specialization || '',
      dateRaw,
      weekday,
      dateLabel,
      startRaw,
      endRaw,
      timeRange,
      concern: appointment.concern || '',
      hospitalName: appointment.hospitalName || '',
      bookingId: appointment.bookingId || '',
      status: appointment.status || 'CONFIRMED',
    };
  }, [appointment]);

  const calendarEvent = useMemo(
    () =>
      buildAppointmentCalendarEvent({
        doctorName: display.doctorName,
        specialization: display.specialization,
        date: display.dateRaw,
        startTime: display.startRaw,
        endTime: display.endRaw,
        concern: display.concern,
        hospitalName: display.hospitalName,
        bookingId: display.bookingId,
      }),
    [display],
  );

  const runAction = useCallback(
    async (type: 'google' | 'outlook' | 'device') => {
      if (!display.dateRaw) {
        showSuccessToast('Appointment date is missing', 'error');
        return;
      }
      try {
        setBusy(type);
        if (type === 'google') await openGoogleCalendar(calendarEvent);
        else if (type === 'outlook') await openOutlookCalendar(calendarEvent);
        else await shareCalendarInvite(calendarEvent);
      } finally {
        setBusy(null);
      }
    },
    [calendarEvent, display.dateRaw],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.successWrapper}>
          <View style={styles.successCircle}>
            <TablerIcon name="calendar" size={42} color={Colors.primaryColor} />
          </View>
        </View>

        <Text style={styles.title}>Add to Calendar</Text>
        <Text style={styles.subtitle}>
          Sync your appointment with {display.doctorName} to get reminders on
          time.
        </Text>

        <View style={styles.card}>
          <View style={styles.badgeWrapper}>
            <Badge status={display.status} />
          </View>

          <View style={styles.doctorRow}>
            <Image
              source={
                display.doctorImage
                  ? { uri: display.doctorImage }
                  : Images.doctorImage
              }
              style={styles.avatar}
            />
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName} numberOfLines={2}>
                {display.doctorName}
              </Text>
              {!!display.specialization && (
                <Text style={styles.speciality} numberOfLines={1}>
                  {display.specialization}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <DetailRow
              iconName="calendar"
              label="DATE"
              value={[display.weekday, display.dateLabel]
                .filter(Boolean)
                .join(', ')}
            />
            <DetailRow iconName="clock" label="TIME" value={display.timeRange} />
            <DetailRow
              iconName="stethoscope"
              label="CONCERN"
              value={display.concern}
            />
            <DetailRow
              iconName="building"
              label="LOCATION"
              value={display.hospitalName || 'Video consultation'}
            />
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.secondaryBtn}
            disabled={!!busy}
            onPress={() => runAction('google')}
          >
            <View style={styles.leftContent}>
              <TablerIcon name="calendar" size={20} color={Colors.primaryColor} />
              <Text style={styles.secondaryText} numberOfLines={1}>
                Google Calendar
              </Text>
            </View>
            {busy === 'google' ? (
              <ActivityIndicator size="small" color={Colors.primaryColor} />
            ) : (
              <TablerIcon name="arrow-right" size={20} color={Colors.primaryColor} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.secondaryBtn}
            disabled={!!busy}
            onPress={() => runAction('outlook')}
          >
            <View style={styles.leftContent}>
              <TablerIcon name="mail" size={20} color={Colors.primaryColor} />
              <Text style={styles.secondaryText} numberOfLines={1}>
                Outlook Calendar
              </Text>
            </View>
            {busy === 'outlook' ? (
              <ActivityIndicator size="small" color={Colors.primaryColor} />
            ) : (
              <TablerIcon name="arrow-right" size={20} color={Colors.primaryColor} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.secondaryBtn}
            disabled={!!busy}
            onPress={() => runAction('device')}
          >
            <View style={styles.leftContent}>
              <TablerIcon name="share" size={20} color={Colors.primaryColor} />
              <Text style={styles.secondaryText} numberOfLines={1}>
                Other calendar apps
              </Text>
            </View>
            {busy === 'device' ? (
              <ActivityIndicator size="small" color={Colors.primaryColor} />
            ) : (
              <TablerIcon name="arrow-right" size={20} color={Colors.primaryColor} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.primaryBtn}
          onPress={() => {
            if (navigation.canGoBack?.()) {
              navigation.goBack();
              return;
            }
            navigation.navigate('HomeStack', { screen: 'Home' });
          }}
        >
          <Text style={styles.primaryText}>Done</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (navigation.canGoBack?.()) navigation.goBack();
          }}
        >
          <Text style={styles.bottomText}>I'll do it later</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddCalendar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  successWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },
  successCircle: {
    width: width * 0.28,
    height: width * 0.28,
    minWidth: 100,
    minHeight: 100,
    maxWidth: 120,
    maxHeight: 120,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  title: {
    marginTop: 20,
    fontSize: isSmallDevice ? 24 : 28,
    lineHeight: isSmallDevice ? 32 : 38,
    textAlign: 'center',
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  subtitle: {
    marginTop: 8,
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 24,
    textAlign: 'center',
    color: '#64748B',
    paddingHorizontal: 10,
    fontFamily: Fonts.PoppinsMedium,
  },
  card: {
    marginTop: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeWrapper: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    textTransform: 'uppercase',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: width * 0.18,
    height: width * 0.18,
    minWidth: 68,
    minHeight: 68,
    maxWidth: 80,
    maxHeight: 80,
    borderRadius: 18,
    marginRight: 14,
  },
  doctorInfo: {
    flex: 1,
    minWidth: 0,
  },
  doctorName: {
    fontSize: isSmallDevice ? 18 : 20,
    lineHeight: 28,
    color: '#1E293B',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  speciality: {
    marginTop: 2,
    fontSize: 14,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  detailsContainer: {
    marginTop: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.bgcolor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
    minWidth: 0,
  },
  detailLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 2,
    fontFamily: Fonts.PoppinsMedium,
  },
  detailValue: {
    fontSize: 14,
    lineHeight: 22,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsMedium,
  },
  actionRow: {
    marginTop: 22,
    gap: 12,
  },
  secondaryBtn: {
    minHeight: 60,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
    gap: 10,
  },
  secondaryText: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 16,
    color: '#334155',
    fontFamily: Fonts.PoppinsMedium,
  },
  primaryBtn: {
    marginTop: 24,
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
    marginTop: 18,
    textAlign: 'center',
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },
});
