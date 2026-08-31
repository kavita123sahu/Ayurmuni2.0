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
import { Ionicons } from '../common/Vector';
import { Images } from '../common/Images';
import AvailabilityDot from './AvailabilityDot';
import {
  DOCTOR_GRID,
  DOCTOR_GRID_BODY_HEIGHT,
  DOCTOR_GRID_CARD_HEIGHT,
} from '../constants/doctorGridLayout';

type Props = {
  name: string;
  speciality?: string;
  ratingLabel: string;
  reviews?: string | number;
  experience: string | number;
  feeLabel?: string | null;
  imageUri?: string;
  available?: boolean;
  onPress?: () => void;
  topRight?: React.ReactNode;
  variant?: 'list' | 'grid';
  cardWidth?: number;
};

const LIST_PHOTO_W = 108;

const DoctorListCard = ({
  name,
  speciality,
  ratingLabel,
  reviews,
  experience,
  feeLabel,
  imageUri,
  available = false,
  onPress,
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

  if (isGrid) {
    const w = cardWidth ?? 160;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.gridCard,
          {
            width: w,
            height: DOCTOR_GRID_CARD_HEIGHT,
          },
          pressed && styles.cardPressed,
        ]}
        onPress={onPress}
      >
        <View style={styles.gridPhotoOuter}>
          <Image source={photo} style={styles.gridPhoto} resizeMode="cover" />
          {available ? (
            <View style={styles.onlineBadge}>
              <AvailabilityDot available size={7} />
              {/* <Text style={styles.onlineText}>Online</Text> */}
            </View>
          ) : null}
          {topRight ? <View style={styles.overlayRight}>{topRight}</View> : null}
        </View>

        <View style={[styles.gridBody, { height: DOCTOR_GRID_BODY_HEIGHT }]}>
          <View style={styles.gridTopRow}>
            <Text style={styles.gridName} numberOfLines={1}>
              {name}
            </Text>
            {feeLabel ? (
              <Text style={styles.gridFee} numberOfLines={1}>
                ₹{feeLabel}
              </Text>
            ) : (
              <View style={styles.feePlaceholder} />
            )}
          </View>

          <Text style={styles.gridSpeciality} numberOfLines={1}>
            {speciality || 'Ayurveda Specialist'}
          </Text>

          <View style={styles.gridStatsRow}>
            <View style={styles.gridRatingWrap}>
              <Ionicons name="star" size={12} color="#F5B301" />
              <Text style={styles.gridRatingText} numberOfLines={1}>
                {ratingLabel}
                {reviewText}
              </Text>
            </View>

            <View style={styles.gridExpWrap}>
              <View style={styles.gridStatsSep} />
              <Ionicons name="time-outline" size={12} color="#16A34A" />
              <Text style={styles.gridExpText} numberOfLines={1}>
                {experience} yrs
              </Text>
            </View>
          </View>
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
        {available ? (
          <View style={styles.listOnlineBadge}>
            <AvailabilityDot available size={7} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        ) : null}
        {topRight ? <View style={styles.overlayRight}>{topRight}</View> : null}
      </View>

      <View style={styles.listBody}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {feeLabel ? <Text style={styles.fee}>₹{feeLabel}</Text> : null}
        </View>

        {speciality ? (
          <Text style={styles.listSpeciality} numberOfLines={1}>
            {speciality}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <Ionicons name="star" size={13} color="#F5B301" />
          <Text style={styles.ratingText} numberOfLines={1}>
            {ratingLabel}
            {reviewText}
          </Text>
          <View style={styles.sep} />
          <Text style={styles.expText} numberOfLines={1}>
            {experience} yrs
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default React.memo(DoctorListCard);

const styles = StyleSheet.create({
  cardPressed: {
    opacity: 0.96,
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
  },
  gridPhoto: {
    width: '100%',
    height: '100%',
  },
  onlineBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  onlineText: {
    fontSize: 10,
    lineHeight: 12,
    color: '#047857',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  gridBody: {
    paddingHorizontal: DOCTOR_GRID.cardPaddingH,
    paddingTop: 8,
    paddingBottom: DOCTOR_GRID.cardPaddingBottom,
  },
  gridTopRow: {
    height: DOCTOR_GRID.nameHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  gridName: {
    flex: 1,
    fontSize: 13,
    lineHeight: DOCTOR_GRID.nameHeight,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  gridSpeciality: {
    height: DOCTOR_GRID.specialtyHeight,
    marginTop: 0,
    fontSize: 11,
    lineHeight: DOCTOR_GRID.specialtyHeight,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  gridStatsRow: {
    height: DOCTOR_GRID.statsHeight,
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
  },
  gridRatingWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  gridRatingText: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    lineHeight: DOCTOR_GRID.statsHeight,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  gridExpWrap: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    // marginLeft: 6,
    maxWidth: '42%',
  },
  gridStatsSep: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    // marginRight: 2,
  },
  gridExpText: {
    flexShrink: 1,
    fontSize: 11,
    lineHeight: DOCTOR_GRID.statsHeight,
    color: '#16A34A',
    fontFamily: Fonts.PoppinsMedium,
  },
  gridFee: {
    fontSize: 13,
    lineHeight: DOCTOR_GRID.nameHeight,
    color: '#C2410C',
    fontFamily: Fonts.PoppinsSemiBold,
    flexShrink: 0,
    maxWidth: '46%',
    textAlign: 'right',
  },
  feePlaceholder: {
    width: 36,
    height: DOCTOR_GRID.nameHeight,
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EEEA',
    minHeight: 125,
  },
  photoCol: {
    width: LIST_PHOTO_W,
    alignSelf: 'stretch',
    backgroundColor: '#E8F3EE',
  },
  listPhoto: {
    ...StyleSheet.absoluteFillObject,
    width: LIST_PHOTO_W,
    height: '100%',
    resizeMode: 'cover',
  },
  listOnlineBadge: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 3,
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
  },
  listBody: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: '#1E293B',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  fee: {
    fontSize: 15,
    lineHeight: 20,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
    flexShrink: 0,
  },
  listSpeciality: {
    marginTop: 2,
    fontSize: 11,
    color: '#64748B',
    fontFamily: Fonts.PoppinsRegular,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingText: {
    marginLeft: 4,
    flexShrink: 1,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
  sep: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 6,
  },
  expText: {
    flexShrink: 0,
    fontSize: 12,
    color: '#64748B',
    fontFamily: Fonts.PoppinsMedium,
  },
});
