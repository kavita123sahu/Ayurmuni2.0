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
  onConsultPress?: () => void;
};

const canConsultAgain = (item: RecentVisitedDoctor) => {
  const status = String(item.approval_status || '').toLowerCase();
  return item.is_active !== false && status !== 'suspended';
};

const VisitedDoctorHomeCard = ({ item, onPress, onConsultPress }: Props) => {
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
            {item.is_favorite ? (
              <TablerIcon name="heart-filled" size={13} color="#E11D48" />
            ) : null}
          </View>
          <Text style={styles.specialty} numberOfLines={1}>
            {specialty}
          </Text>
          <View style={styles.metaLine}>
            <TablerIcon name="star-filled" size={11} color="#F59E0B" />
            <Text style={styles.metaText}>{ratingLabel}</Text>
            {!!experience && (
              <>
                <Text style={styles.dotSep}>·</Text>
                <Text style={styles.metaText}>{experience} yr experience</Text>
              </>
            )}
            {/* {!!item.city && (
              <>
                <Text style={styles.dotSep}>·</Text>
                <Text style={styles.metaText} numberOfLines={1}>
                  {item.city}
                </Text>
              </>
            )} */}
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
          {feeLabel || 'Consult'}
        </Text>
        <Pressable
          style={[styles.cta, !available && styles.ctaOff]}
          onPress={e => {
            e.stopPropagation();
            if (available) onConsultPress?.();
          }}
          disabled={!available}
        >
          <Text style={styles.ctaText}>
            {available ? 'Consult again' : 'Unavailable'}
          </Text>
        </Pressable>
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
  specialty: {
    marginTop: 1,
    fontSize: 11,
    color: Colors.headercolor,
    fontFamily: Fonts.PoppinsMedium,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
    flexShrink: 1,
  },
  dotSep: {
    fontSize: 11,
    color: '#CBD5E1',
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
  cta: {
    backgroundColor: Colors.primaryColor,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ctaOff: {
    backgroundColor: '#94A3B8',
  },
  ctaText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
