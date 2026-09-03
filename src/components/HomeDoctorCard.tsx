import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Fonts } from '../common/Fonts';
import { Ionicons } from '../common/Vector';
import { Images } from '../common/Images';
import { Colors } from '../common/Colors';
import {
  HOME_DOCTOR,
  HOME_DOCTOR_CARD_HEIGHT,
} from '../constants/doctorGridLayout';
import { formatDoctorExperience } from '../utils/doctorUtils';
import { RupeeAmount } from '../utils/currencyUtils';

type Props = {
  name: string;
  speciality?: string;
  qualification?: string;
  ratingLabel: string;
  reviews?: string | number;
  experience: string | number;
  feeLabel?: string | null;
  totalPatients?: string | number | null;
  imageUri?: string;
  available?: boolean;
  availabilityLabel?: string;
  onPress?: () => void;
  cardWidth: number;
};

const HomeDoctorCard = ({
  name,
  speciality,
  qualification,
  ratingLabel,
  reviews,
  experience,
  feeLabel,
  imageUri,
  available = false,
  availabilityLabel,
  onPress,
  cardWidth,
}: Props) => {
  const photo = imageUri ? { uri: imageUri } : Images.doctorImage;
  const subtitle = qualification || speciality || 'Ayurveda Specialist';
  const expLabel = formatDoctorExperience(experience);
  const reviewText =
    reviews != null && String(reviews).trim() !== '' ? ` (${reviews})` : '';
  const statusLabel =
    availabilityLabel || (available ? 'Available' : 'Unavailable');

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { width: cardWidth, height: HOME_DOCTOR_CARD_HEIGHT },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.statusBadge,
          available ? styles.statusBadgeOn : styles.statusBadgeOff,
        ]}
      >
        <Text style={styles.statusBadgeText} numberOfLines={1}>
          {statusLabel}
        </Text>
      </View>

      <View style={styles.avatarRing}>
        <View style={styles.avatarRingInner}>
          <View style={styles.avatarWrap}>
            <Image source={photo} style={styles.avatar} resizeMode="cover" />
          </View>
        </View>
      </View>

      <View
        style={[
          styles.availabilityStrip,
          available ? styles.availabilityStripOn : styles.availabilityStripOff,
        ]}
      >
        <Text
          style={[
            styles.availabilityStripText,
            available
              ? styles.availabilityStripTextOn
              : styles.availabilityStripTextOff,
          ]}
          numberOfLines={1}
        >
          {statusLabel}
        </Text>
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {name}
      </Text>

      <Text style={styles.qual} numberOfLines={1}>
        {subtitle}
      </Text>

      <View style={styles.statsFeeRow}>
        <View style={styles.statsLeft}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={12} color="#F5B301" />
            <Text style={styles.statText} numberOfLines={1}>
              {ratingLabel}
              {reviewText}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={12} color="#16A34A" />
            <Text style={styles.statText} numberOfLines={1}>
              {expLabel}
            </Text>
          </View>
        </View>
        {feeLabel ? (
          <RupeeAmount value={feeLabel} style={styles.fee} />
        ) : null}
      </View>
    </Pressable>
  );
};

export default React.memo(HomeDoctorCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: HOME_DOCTOR.cardRadius,
    padding: HOME_DOCTOR.cardPadding,
    borderWidth: 1,
    borderColor: '#E8EEEA',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  pressed: {
    opacity: 0.96,
  },
  statusBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderBottomRightRadius: 10,
    zIndex: 3,
    maxWidth: '72%',
  },
  statusBadgeOn: {
    backgroundColor: '#059669',
  },
  statusBadgeOff: {
    backgroundColor: '#64748B',
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: Fonts.PoppinsSemiBold,
    includeFontPadding: false,
  },
  availabilityStrip: {
    alignSelf: 'stretch',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  availabilityStripOn: {
    backgroundColor: '#ECFDF5',
  },
  availabilityStripOff: {
    backgroundColor: '#F1F5F9',
  },
  availabilityStripText: {
    fontSize: 9,
    lineHeight: 12,
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
  },
  availabilityStripTextOn: {
    color: '#047857',
  },
  availabilityStripTextOff: {
    color: '#64748B',
  },
  avatarRing: {
    width: HOME_DOCTOR.avatarSize + 14,
    height: HOME_DOCTOR.avatarSize + 14,
    borderRadius: (HOME_DOCTOR.avatarSize + 14) / 2,
    backgroundColor: '#EAF6F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#0D614E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarRingInner: {
    width: HOME_DOCTOR.avatarSize + 6,
    height: HOME_DOCTOR.avatarSize + 6,
    borderRadius: (HOME_DOCTOR.avatarSize + 6) / 2,
    backgroundColor: '#DDF3EA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarWrap: {
    width: HOME_DOCTOR.avatarSize,
    height: HOME_DOCTOR.avatarSize,
    borderRadius: HOME_DOCTOR.avatarSize / 2,
    overflow: 'hidden',
  },
  avatar: {
    width: HOME_DOCTOR.avatarSize,
    height: HOME_DOCTOR.avatarSize,
    borderRadius: HOME_DOCTOR.avatarSize / 2,
    backgroundColor: '#F1F5F9',
  },
  name: {
    width: '100%',
    minHeight: 32,
    fontSize: 13,
    lineHeight: 16,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    textAlign: 'center',
  },
  qual: {
    width: '100%',
    height: HOME_DOCTOR.qualHeight,
    fontSize: 11,
    lineHeight: HOME_DOCTOR.qualHeight,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
    textAlign: 'center',
  },
  statsFeeRow: {
    width: '100%',
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAF9',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 6,
    gap: 6,
  },
  statsLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 1,
    minWidth: 0,
  },
  statText: {
    flexShrink: 1,
    fontSize: 9.5,
    lineHeight: 13,
    color: '#475569',
    fontFamily: Fonts.PoppinsMedium,
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: '#DCE4E0',
    marginHorizontal: 4,
  },
  fee: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsBold,
    flexShrink: 0,
  },
});
