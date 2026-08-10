import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Images } from '../common/Images';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import { getStatusStyle } from '../common/DataInterface';
import TablerIcon from './TablerIcon';
import { CARD_RADIUS_MD, CARD_SURFACE } from '../constants/cardStyles';
import {
  buildAppointmentDetailsParams,
  canRescheduleAppointment,
  getConsultationScheduleLabels,
} from '../utils/appointmentUtils';

export type AppointmentStatus =
  | 'confirmed'
  | 'cancelled'
  | 'upcoming'
  | string;

export type ActionKey =
  | 'view_receipt'
  | 'book_again'
  | 'view_details'
  | 'reschedule';

export interface Appointment {
  consultation_id: string;
  doctorName?: string;
  specialty?: string;
  date?: string;
  time?: string;
  status?: string;
  image?: string | null;
  rawData?: any;
  appointment_status?: AppointmentStatus;
  start_time?: string;
  appointment_date?: string;
  doctor?: {
    doctor_id?: string;
    doctor_name?: string;
    doctor_specialization?: string | null;
    doctor_designation?: string | null;
    qualification?: string | null;
    doctor_image?: string | null;
  };
}

interface AppointmentCardProps {
  item: Appointment;
  navigation: any;
  onAction?: (actionKey: ActionKey, item: Appointment) => void;
  style?: ViewStyle;
}

const formatStatusLabel = (status?: string) =>
  String(status || '')
    .replace(/_/g, ' ')
    .trim();

const AppointmentCard = ({
  item,
  onAction,
  style,
  navigation,
}: AppointmentCardProps) => {
  const doctor = item?.doctor;
  const doctorName =
    doctor?.doctor_name || item?.doctorName || 'Doctor';
  const specialty =
    doctor?.doctor_specialization ||
    doctor?.doctor_designation ||
    doctor?.qualification ||
    item?.specialty ||
    'General Physician';
  const avatarUrl = doctor?.doctor_image || item?.image;

  const schedule = useMemo(
    () => getConsultationScheduleLabels(item),
    [item],
  );
  const status = schedule.status || String(item?.appointment_status || '');
  const statusStyle = useMemo(() => getStatusStyle(status.toLowerCase()), [status]);
  const statusLabel = formatStatusLabel(status);

  const showReschedule = canRescheduleAppointment(status);
  const showReceipt = Boolean(item?.consultation_id);
  const showBookAgain = !showReschedule;

  const handleAction = (action: ActionKey) => {
    onAction?.(action, item);
  };

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate(
          'AppointmentDetails',
          buildAppointmentDetailsParams({ rawData: item.rawData, ...item }),
        )
      }
    >
      <View style={styles.topRow}>
        <Image
          source={avatarUrl ? { uri: avatarUrl } : Images.doctorImage}
          style={styles.avatar}
        />

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text numberOfLines={1} style={styles.doctorName}>
              {doctorName}
            </Text>
            {statusLabel ? (
              <View
                style={[
                  styles.statusChip,
                  { backgroundColor: statusStyle.backgroundColor },
                ]}
              >
                <Text
                  style={[styles.statusText, { color: statusStyle.color }]}
                  numberOfLines={1}
                >
                  {statusLabel}
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.specialty} numberOfLines={1}>
            {specialty}
          </Text>

          <View style={styles.metaChips}>
            {schedule.dayLabel || schedule.weekday ? (
              <View style={styles.chip}>
                <TablerIcon name="calendar" size={12} color="#64748B" />
                <Text style={styles.chipText} numberOfLines={1}>
                  {schedule.dayLabel || schedule.weekday}
                </Text>
              </View>
            ) : null}
            {schedule.dateLabel ? (
              <View style={styles.chip}>
                <Text style={styles.chipText} numberOfLines={1}>
                  {schedule.dateLabel}
                </Text>
              </View>
            ) : null}
            {schedule.timeLabel ? (
              <View style={styles.chip}>
                <TablerIcon name="clock" size={12} color="#64748B" />
                <Text style={styles.chipText} numberOfLines={1}>
                  {schedule.timeLabel}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        {showReceipt ? (
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.secondaryBtn,
              !showReschedule && !showBookAgain && styles.fullBtn,
            ]}
            onPress={() => handleAction('view_receipt')}
          >
            <TablerIcon name="receipt" size={14} color="#475569" />
            <Text style={styles.secondaryBtnText}>Receipt</Text>
          </TouchableOpacity>
        ) : null}

        {showReschedule ? (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.primaryBtn}
            onPress={() => handleAction('reschedule')}
          >
            <TablerIcon name="calendar" size={14} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>
              {status.toLowerCase() === 'reschedule'
                ? 'Request Change'
                : 'Reschedule'}
            </Text>
          </TouchableOpacity>
        ) : showBookAgain ? (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.primaryBtn}
            onPress={() => handleAction('book_again')}
          >
            <TablerIcon name="stethoscope" size={14} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Book Again</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default memo(AppointmentCard);

const styles = StyleSheet.create({
  card: {
    ...CARD_SURFACE,
    borderRadius: CARD_RADIUS_MD,
    padding: 14,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#E8F2EE',
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  doctorName: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  statusChip: {
    maxWidth: 96,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    textTransform: 'capitalize',
  },
  specialty: {
    fontSize: 12,
    lineHeight: 16,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  metaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  chipText: {
    fontSize: 11,
    lineHeight: 14,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  fullBtn: {
    flex: 1,
  },
  secondaryBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  secondaryBtnText: {
    fontSize: 12,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
  },
  primaryBtn: {
    flex: 1.15,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.primaryColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  primaryBtnText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
