import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../common/Fonts';
import { Colors } from '../../common/Colors';
import TablerIcon, { TablerIconName } from '../../components/TablerIcon';
import DoctorAvatar from '../../components/DoctorAvatar';
import AppHeader from '../../components/AppHeader';
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

type AppointmentStatus =
  | 'COMPLETED'
  | 'CANCELLED'
  | 'UPCOMING'
  | 'CONFIRMED'
  | string;

const BADGE_CONFIG: Record<
  string,
  { bg: string; color: string; label: string }
> = {
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
  }: {
    iconName: TablerIconName;
    label: string;
    value: string;
  }) => {
    if (!value) return null;
    return (
      <View style={styles.detailRow}>
        <View style={styles.iconWrapper}>
          <TablerIcon name={iconName} size={16} color={Colors.primaryColor} />
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
  const [busy, setBusy] = useState<'google' | 'outlook' | 'device' | null>(
    null,
  );

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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <AppHeader title="Add to Calendar" onLeftPress={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <LinearGradient
          colors={['#E8F8F2', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroIcon}>
            <TablerIcon name="calendar" size={22} color={Colors.primaryColor} />
          </View>
          <Text style={styles.title}>Save this visit</Text>
          <Text style={styles.subtitle}>
            Add {display.doctorName} to your calendar for timely reminders.
          </Text>
        </LinearGradient>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.doctorRow}>
              <DoctorAvatar
                uri={display.doctorImage}
                name={display.doctorName}
                size={52}
                shape="circle"
                emptyMode="icon"
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
            <Badge status={display.status} />
          </View>

          <View style={styles.detailsContainer}>
            <DetailRow
              iconName="calendar"
              label="Date"
              value={[display.weekday, display.dateLabel]
                .filter(Boolean)
                .join(', ')}
            />
            <DetailRow iconName="clock" label="Time" value={display.timeRange} />
            <DetailRow
              iconName="stethoscope"
              label="Concern"
              value={display.concern}
            />
            <DetailRow
              iconName="building"
              label="Location"
              value={display.hospitalName || 'Video consultation'}
            />
          </View>
        </View>

        <Text style={styles.actionLabel}>Choose calendar</Text>

        <View style={styles.actionList}>
          {(
            [
              { key: 'google', label: 'Google Calendar', icon: 'calendar' },
              { key: 'outlook', label: 'Outlook Calendar', icon: 'mail' },
              { key: 'device', label: 'Other calendar apps', icon: 'share' },
            ] as const
          ).map(item => (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.85}
              style={styles.secondaryBtn}
              disabled={!!busy}
              onPress={() => runAction(item.key)}
            >
              <View style={styles.leftContent}>
                <View style={styles.actionIcon}>
                  <TablerIcon
                    name={item.icon}
                    size={16}
                    color={Colors.primaryColor}
                  />
                </View>
                <Text style={styles.secondaryText} numberOfLines={1}>
                  {item.label}
                </Text>
              </View>
              {busy === item.key ? (
                <ActivityIndicator size="small" color={Colors.primaryColor} />
              ) : (
                <TablerIcon name="chevron-right" size={18} color="#94A3B8" />
              )}
            </TouchableOpacity>
          ))}
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
          <LinearGradient
            colors={['#0D614E', '#12856A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryGradient}
          >
            <Text style={styles.primaryText}>Done</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.laterBtn}
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
    backgroundColor: '#F7FAF8',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 28,
  },
  hero: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D8EBE4',
  },
  heroIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5EFEA',
    marginBottom: 14,
  },
  cardHeader: {
    gap: 10,
    marginBottom: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  doctorInfo: {
    flex: 1,
    minWidth: 0,
  },
  doctorName: {
    fontSize: 16,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  speciality: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  detailsContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E8EEF0',
    paddingTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F0F8F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
    minWidth: 0,
  },
  detailLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsMedium,
  },
  detailValue: {
    marginTop: 1,
    fontSize: 13,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  actionLabel: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: Fonts.PoppinsSemiBold,
    marginBottom: 8,
    marginLeft: 2,
  },
  actionList: {
    gap: 8,
    marginBottom: 14,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5EFEA',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F0F8F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsMedium,
  },
  primaryBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0D614E',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 3 },
    }),
  },
  primaryGradient: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  laterBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  bottomText: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
});
