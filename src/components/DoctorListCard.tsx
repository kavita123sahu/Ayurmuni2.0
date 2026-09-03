import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import { Ionicons } from '../common/Vector';
import { Images } from '../common/Images';
import {
  DOCTOR_GRID,
  DOCTOR_GRID_BODY_HEIGHT,
  DOCTOR_GRID_CARD_HEIGHT,
} from '../constants/doctorGridLayout';
import { RupeeAmount } from '../utils/currencyUtils';

type Props = {
  name: string;
  speciality?: string;
  ratingLabel: string;
  reviews?: string | number;
  experience: string | number;
  feeLabel?: string | null;
  imageUri?: string;
  available?: boolean;
  availabilityLabel?: string;
  onPress?: () => void;
  onConsultPress?: () => void;
  topRight?: React.ReactNode;
  variant?: 'list' | 'grid';
  cardWidth?: number;
};

const LIST_PHOTO_W = 108;

const formatExperience = (value: string | number) => {
  const raw = String(value ?? '').trim();
  if (/yrs exp/i.test(raw)) return raw;
  const match = raw.match(/(\d+)/);
  return `${match ? match[1] : '0'} Yrs Exp`;
};

const DoctorListCard = ({
  name,
  speciality,
  ratingLabel,
  reviews,
  experience,
  feeLabel,
  imageUri,
  available = false,
  availabilityLabel,
  onPress,
  onConsultPress,
  topRight,
  variant = 'list',
  cardWidth,
}: Props) => {
  const isGrid = variant === 'grid';
  const photo = imageUri ? { uri: imageUri } : Images.doctorImage;
  const reviewText =
    reviews != null && String(reviews).trim() !== ''
      ? ` (${reviews})`
      : '';
  const expLabel = formatExperience(experience);
  const statusLabel =
    availabilityLabel || (available ? 'Available' : 'Unavailable');

  const handleConsult = () => {
    if (onConsultPress) {
      onConsultPress();
      return;
    }
    onPress?.();
  };

  const renderStatusBadge = () => (
    <View
      style={[
        styles.statusBadge,
        available ? styles.statusBadgeAvailable : styles.statusBadgeUnavailable,
      ]}
    >
      <Text style={styles.statusBadgeText} numberOfLines={1}>
        {statusLabel}
      </Text>
    </View>
  );

  const renderAvailabilityStrip = () => (
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
  );

  const renderStatsFeeRow = (compact = false) => (
    <View style={styles.statsFeeRow}>
      <View style={styles.statsLeft}>
        <View style={styles.statItem}>
          <Ionicons name="star" size={compact ? 12 : 13} color="#F5B301" />
          <Text
            style={[styles.ratingText, compact && styles.gridRatingText]}
            numberOfLines={1}
          >
            {ratingLabel}
            {reviewText}
          </Text>
        </View>
        {/* <View style={styles.statSep} /> */}
        <View style={styles.statItem}>
          <Ionicons
            name="time-outline"
            size={compact ? 12 : 13}
            color="#16A34A"
          />
          <Text
            style={[styles.expText, compact && styles.gridExpText]}
            numberOfLines={1}
          >
            {expLabel}
          </Text>
        </View>
      </View>
      {feeLabel ? (
        <RupeeAmount
          value={feeLabel}
          style={[styles.fee, compact && styles.gridFee]}
        />
      ) : (
        <View style={styles.feePlaceholder} />
      )}
    </View>
  );

  if (isGrid) {
    const w = cardWidth ?? 160;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.gridCard,
          { width: w, height: DOCTOR_GRID_CARD_HEIGHT },
          pressed && styles.cardPressed,
        ]}
        onPress={onPress}
      >
        <View style={styles.gridPhotoOuter}>
          <Image source={photo} style={styles.gridPhoto} resizeMode="cover" />
          {renderStatusBadge()}
          {topRight ? <View style={styles.overlayRight}>{topRight}</View> : null}
        </View>

        <View style={[styles.gridBody, { height: DOCTOR_GRID_BODY_HEIGHT }]}>
          {/* {renderAvailabilityStrip()} */}

          <Text style={styles.gridName} numberOfLines={2}>
            {name}
          </Text>

          <Text style={styles.gridSpeciality} numberOfLines={1}>
            {speciality || 'Ayurveda Specialist'}
          </Text>

          {renderStatsFeeRow(true)}

          <TouchableOpacity
            style={styles.gridCta}
            activeOpacity={0.88}
            onPress={e => {
              e?.stopPropagation?.();
              handleConsult();
            }}
          >
            <Text style={styles.gridCtaText}>Consult Now</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.listCard, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.photoCol}>
        <Image source={photo} style={styles.listPhoto} />
        {renderStatusBadge()}
        {topRight ? <View style={styles.overlayRight}>{topRight}</View> : null}
      </View>

      <View style={styles.listBody}>
        {renderAvailabilityStrip()}

        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>

        {speciality ? (
          <Text style={styles.listSpeciality} numberOfLines={1}>
            {speciality}
          </Text>
        ) : null}

        {renderStatsFeeRow(false)}

        <TouchableOpacity
          style={styles.consultBtn}
          activeOpacity={0.88}
          onPress={e => {
            e?.stopPropagation?.();
            handleConsult();
          }}
        >
          <Text style={styles.consultText}>Consult Now</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
};

export default React.memo(DoctorListCard);

const styles = StyleSheet.create({
  cardPressed: {
    opacity: 0.96,
  },
  statusBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderBottomRightRadius: 10,
    zIndex: 5,
    maxWidth: '78%',
  },
  statusBadgeAvailable: {
    backgroundColor: '#059669',
  },
  statusBadgeUnavailable: {
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
    includeFontPadding: false,
  },
  availabilityStripTextOn: {
    color: '#047857',
  },
  availabilityStripTextOff: {
    color: '#64748B',
  },
  statsFeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 6,
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
  statSep: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 6,
  },
  gridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: DOCTOR_GRID.cardRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8EEEA',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  gridPhotoOuter: {
    height: DOCTOR_GRID.photoHeight,
    borderTopLeftRadius: DOCTOR_GRID.imageRadius,
    borderTopRightRadius: DOCTOR_GRID.imageRadius,
    overflow: 'hidden',
    backgroundColor: '#F8FAFB',
    position: 'relative',
  },
  gridPhoto: {
    width: '100%',
    height: '100%',
  },
  gridBody: {
    paddingHorizontal: DOCTOR_GRID.cardPaddingH,
    paddingTop: 8,
    paddingBottom: DOCTOR_GRID.cardPaddingBottom,
  },
  gridName: {
    fontSize: 13,
    lineHeight: 16,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
    minHeight: DOCTOR_GRID.nameHeight,
  },
  gridSpeciality: {
    // marginTop: 2,
    fontSize: 11,
    lineHeight: DOCTOR_GRID.specialtyHeight,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  gridRatingText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  gridExpText: {
    fontSize: 10,
    color: '#16A34A',
    fontFamily: Fonts.PoppinsMedium,
  },
  gridFee: {
    fontSize: 13,
    color: '#C2410C',
    fontFamily: Fonts.PoppinsSemiBold,
    flexShrink: 0,
    textAlign: 'right',
  },
  feePlaceholder: {
    width: 28,
  },
  gridCta: {
    height: DOCTOR_GRID.ctaHeight,
    marginTop: 6,
    borderRadius: DOCTOR_GRID.ctaRadius,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCtaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EEEA',
    minHeight: 158,
  },
  photoCol: {
    width: LIST_PHOTO_W,
    alignSelf: 'stretch',
    backgroundColor: '#E8F3EE',
    position: 'relative',
    overflow: 'hidden',
  },
  listPhoto: {
    ...StyleSheet.absoluteFillObject,
    width: LIST_PHOTO_W,
    height: '100%',
    resizeMode: 'cover',
  },
  overlayRight: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 6,
  },
  listBody: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  name: {
    fontSize: 15,
    lineHeight: 19,
    color: '#1E293B',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  fee: {
    fontSize: 15,
    lineHeight: 19,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    flexShrink: 0,
    textAlign: 'right',
  },
  listSpeciality: {
    marginTop: 2,
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  ratingText: {
    flexShrink: 1,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  expText: {
    // flexShrink: 1,
    fontSize: 11,
    color: '#16A34A',
    fontFamily: Fonts.PoppinsMedium,
  },
  consultBtn: {
    marginTop: 8,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consultText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Fonts.PoppinsSemiBold,
  },
});
