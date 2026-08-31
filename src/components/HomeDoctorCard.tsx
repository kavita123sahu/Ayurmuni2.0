import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Fonts } from '../common/Fonts';
import { Ionicons } from '../common/Vector';
import { Images } from '../common/Images';
import AvailabilityDot from './AvailabilityDot';
import {
  HOME_DOCTOR,
  HOME_DOCTOR_CARD_HEIGHT,
} from '../constants/doctorGridLayout';

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
  onPress?: () => void;
  cardWidth: number;
};

const HomeDoctorCard = ({
  name,
  speciality,
  qualification,
  ratingLabel,
  experience,
  feeLabel,
  imageUri,
  available = false,
  onPress,
  cardWidth,
}: Props) => {
  const photo = imageUri ? { uri: imageUri } : Images.doctorImage;
  const subtitle = qualification || speciality || 'Ayurveda Specialist';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { width: cardWidth, height: HOME_DOCTOR_CARD_HEIGHT },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      {available ? (
        <View style={styles.availableBadge}>
          <Text style={styles.availableText}>Available</Text>
        </View>
      ) : null}

      <View style={styles.avatarRing}>
        <View style={styles.avatarRingInner}>
          <View style={styles.avatarWrap}>
            <Image source={photo} style={styles.avatar} resizeMode="cover" />
            {available ? (
              <View style={styles.onlineDot}>
                <AvailabilityDot available size={8} />
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>

      <Text style={styles.qual} numberOfLines={1}>
        {subtitle}
      </Text>

      <View style={styles.topStatsRow}>
        <View style={styles.topStat}>
          <Ionicons name="star" size={12} color="#F5B301" />
          <Text style={styles.topStatText} numberOfLines={1}>
            {ratingLabel}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.topStat}>
          <Ionicons name="time-outline" size={12} color="#16A34A" />
          <Text style={styles.topStatText} numberOfLines={1}>
            {experience}+ yrs
          </Text>
        </View>
      </View>

      <View style={styles.feeRow}>
        <Text style={styles.feeLabel}>Fees</Text>
        {feeLabel ? <Text style={styles.fee}>₹{feeLabel}</Text> : null}
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
  },
  pressed: {
    opacity: 0.96,
  },
  availableBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 2,
  },
  availableText: {
    fontSize: 9,
    lineHeight: 12,
    color: '#047857',
    fontFamily: Fonts.PoppinsSemiBold,
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
    overflow: 'visible',
  },
  avatar: {
    width: HOME_DOCTOR.avatarSize,
    height: HOME_DOCTOR.avatarSize,
    borderRadius: HOME_DOCTOR.avatarSize / 2,
    backgroundColor: '#F1F5F9',
  },
  onlineDot: {
    position: 'absolute',
    right: 0,
    bottom: 2,
  },
  name: {
    width: '100%',
    height: HOME_DOCTOR.nameHeight,
    fontSize: 13,
    lineHeight: HOME_DOCTOR.nameHeight,
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
  topStatsRow: {
    width: '100%',
    height: 28,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAF9',
    borderRadius: 8,
    paddingHorizontal: 7,
  },
  topStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minWidth: 0,
  },
  topStatText: {
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
  },
  feeRow: {
    width: '100%',
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 20,
  },
  feeLabel: {
    fontSize: 9,
    color: '#404751',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  fee: {
    fontSize: 13,
    lineHeight: 18,
    color: '#C2410C',
    fontFamily: Fonts.PoppinsBold,
  },
});
