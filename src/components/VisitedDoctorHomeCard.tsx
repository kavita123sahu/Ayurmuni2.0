import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import { Images } from '../common/Images';
import TablerIcon from './TablerIcon';
import AvailabilityDot from './AvailabilityDot';
import { formatRupee } from '../utils/currencyUtils';
import {
  formatAppointmentDateFull,
  formatAppointmentTimeLabel,
} from '../utils/appointmentUtils';
import type { RecentVisitedDoctor } from '../hooks/useRecentVisitedDoctors';

type Props = {
  item: RecentVisitedDoctor;
  onPress?: () => void;
};

const canConsultAgain = (item: RecentVisitedDoctor) => {
  const status = String(item.approval_status || '').toLowerCase();
  return item.is_active !== false && status !== 'suspended';
};

const VisitedDoctorHomeCard = ({ item, onPress }: Props) => {
  const photo = item.doctor_image
    ? { uri: String(item.doctor_image) }
    : Images.doctorImage;
  const available = canConsultAgain(item);
  const rating = Number(item.average_rating);
  const ratingLabel = Number.isFinite(rating) ? rating.toFixed(1) : '—';
  const experience =
    item.experience_display ||
    (item.experience_years != null ? `${item.experience_years}+ yrs` : '');
  const specialty =
    item.qualification ||
    item.doctor_designation ||
    'Ayurveda Specialist';
  const lastDate = formatAppointmentDateFull(item.last_consulted_date || '');
  const lastTime = formatAppointmentTimeLabel(item.last_start_time || '');
  const lastVisit = [lastDate, lastTime].filter(Boolean).join(' · ');
  const feeLabel =
    item.consultation_fee != null
      ? formatRupee(item.consultation_fee)
      : null;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.top}>
        <View style={styles.avatarRing}>
          <Image source={photo} style={styles.avatar} resizeMode="cover" />
          <View style={styles.dot}>
            <AvailabilityDot available={available} size={8} />
          </View>
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.doctor_name}
            </Text>
            <View style={styles.ratingBadge}>
              <TablerIcon name="star-filled" size={11} color="#F59E0B" />
              <Text style={styles.ratingText}>{ratingLabel}</Text>
            </View>
          </View>

          <View style={styles.specialtyRow}>
            <Text style={styles.specialty} numberOfLines={1}>
              {specialty}
            </Text>
            {!!experience && (
              <Text style={styles.experience} numberOfLines={1}>
                {experience}
              </Text>
            )}
          </View>
        </View>
      </View>

      {!!lastVisit && (
        <Text style={styles.lastVisit} numberOfLines={1}>
          Last visit · {lastVisit}
        </Text>
      )}

      <View style={styles.footer}>
        <Text style={styles.fee} numberOfLines={1}>
          {feeLabel || 'Consultation'}
        </Text>
        {available ? (
          <View style={styles.availablePill}>
            <Text style={styles.availablePillText}>Available</Text>
          </View>
        ) : (
          <View style={[styles.availablePill, styles.unavailablePill]}>
            <Text style={[styles.availablePillText, styles.unavailablePillText]}>
              Unavailable
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default React.memo(VisitedDoctorHomeCard);

const styles = StyleSheet.create({
  card: {
    width: 248,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5EFEA',
    padding: 12,
    marginRight: 10,
  },
  pressed: {
    opacity: 0.96,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#D8EBE3',
    padding: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: Colors.bgcolor,
  },
  dot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    flex: 1,
    fontSize: 14,
    color: Colors.textColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  specialtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  specialty: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    color: Colors.headercolor,
    fontFamily: Fonts.PoppinsMedium,
  },
  experience: {
    flexShrink: 0,
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  ratingBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  ratingText: {
    fontSize: 11,
    color: '#B45309',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  lastVisit: {
    marginTop: 10,
    fontSize: 11,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsMedium,
  },
  footer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  fee: {
    fontSize: 14,
    color: Colors.textColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  availablePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  availablePillText: {
    fontSize: 11,
    color: '#047857',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  unavailablePill: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  unavailablePillText: {
    color: '#64748B',
  },
});
