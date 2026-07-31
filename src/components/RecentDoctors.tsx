import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import { Images } from '../common/Images';
import { getStatusStyle } from '../common/DataInterface';
import TablerIcon from './TablerIcon';
import { CARD_RADIUS_MD, CARD_SURFACE } from '../constants/cardStyles';
import { canRescheduleAppointment } from '../utils/appointmentUtils';

interface Props {
  image: ImageSourcePropType;
  name: string;
  speciality: string;
  /** Raw date string or preformatted date label */
  date?: string;
  /** Preformatted day label (Today / Thu) */
  day?: string;
  /** Preformatted time (10:30 AM) */
  time?: string;
  status?: string;
  onPressReceipt?: () => void;
  onPressReschedule?: (item?: any) => void;
  onPressBookAgain?: () => void;
  onPress?: () => void;
}

const AVATAR = 56;

const formatStatusLabel = (status?: string) =>
  String(status || '')
    .replace(/_/g, ' ')
    .trim();

const RecentDoctors: React.FC<Props> = ({
  image,
  name,
  speciality,
  date,
  day,
  time,
  status,
  onPressReceipt,
  onPressReschedule,
  onPressBookAgain,
  onPress,
}) => {
  const hasImage =
    image &&
    typeof image === 'object' &&
    'uri' in image &&
    Boolean((image as { uri?: string }).uri);

  const statusLabel = formatStatusLabel(status);
  const statusStyle = useMemo(
    () => getStatusStyle(String(status || '').toLowerCase()),
    [status],
  );
  const showReschedule = useMemo(
    () => canRescheduleAppointment(status),
    [status],
  );
  const showBookAgain = !showReschedule && Boolean(onPressBookAgain);

  const hasSchedule = Boolean(day || date || time);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={onPress ? 0.88 : 1}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.topRow}>
        <Image
          source={hasImage ? image : Images.doctorImage}
          style={styles.avatar}
        />

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {name || 'Doctor'}
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

          {speciality ? (
            <Text style={styles.speciality} numberOfLines={1}>
              {speciality}
            </Text>
          ) : null}

          {hasSchedule ? (
            <View style={styles.metaChips}>
              {day ? (
                <View style={styles.chip}>
                  <TablerIcon name="calendar" size={12} color="#64748B" />
                  <Text style={styles.chipText} numberOfLines={1}>
                    {day}
                  </Text>
                </View>
              ) : null}
              {date ? (
                <View style={styles.chip}>
                  <Text style={styles.chipText} numberOfLines={1}>
                    {date}
                  </Text>
                </View>
              ) : null}
              {time ? (
                <View style={styles.chip}>
                  <TablerIcon name="clock" size={12} color="#64748B" />
                  <Text style={styles.chipText} numberOfLines={1}>
                    {time}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.actions}>
        {onPressReceipt ? (
          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              !showReschedule && !showBookAgain && styles.fullBtn,
            ]}
            onPress={onPressReceipt}
            activeOpacity={0.8}
          >
            <TablerIcon name="receipt" size={14} color="#475569" />
            <Text style={styles.secondaryText}>Receipt</Text>
          </TouchableOpacity>
        ) : null}

        {showReschedule ? (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => onPressReschedule?.()}
            activeOpacity={0.8}
          >
            <TablerIcon name="calendar" size={14} color="#FFFFFF" />
            <Text style={styles.primaryText}>
              {String(status || '').toLowerCase() === 'reschedule'
                ? 'Request Change'
                : 'Reschedule'}
            </Text>
          </TouchableOpacity>
        ) : showBookAgain ? (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onPressBookAgain}
            activeOpacity={0.8}
          >
            <TablerIcon name="stethoscope" size={14} color="#FFFFFF" />
            <Text style={styles.primaryText}>Book Again</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default memo(RecentDoctors);

const styles = StyleSheet.create({
  card: {
    ...CARD_SURFACE,
    borderRadius: CARD_RADIUS_MD,
    padding: 12,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: 14,
    backgroundColor: '#E8F2EE',
  },
  info: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Fonts.PoppinsSemiBold,
    color: '#0F172A',
  },
  statusChip: {
    maxWidth: 92,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsSemiBold,
    textTransform: 'capitalize',
  },
  speciality: {
    fontSize: 12,
    lineHeight: 16,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  metaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
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
  secondaryBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  fullBtn: {
    flex: 1,
  },
  secondaryText: {
    fontSize: 12,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
  },
  primaryBtn: {
    flex: 1.15,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  primaryText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
