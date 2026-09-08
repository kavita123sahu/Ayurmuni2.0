import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Fonts } from '../common/Fonts';
import { Colors } from '../common/Colors';
import TablerIcon from './TablerIcon';
import {
  couponExpiryLabel,
  couponMinNote,
  couponOfferTitle,
  couponSavingsLabel,
  type Coupon,
} from '../utils/couponUtils';

type Props = {
  coupon: Coupon;
  onApply?: (code: string) => void;
  onCopy?: (code: string) => void;
  applied?: boolean;
  applyLabel?: string;
  notchColor?: string;
};

/** Compact coupon row — all key details, minimal height */
const CouponTicket = ({
  coupon,
  onApply,
  onCopy,
  applied,
  applyLabel = 'APPLY',
}: Props) => {
  const minNote = couponMinNote(coupon);

  return (
    <View style={[styles.wrap, applied && styles.wrapApplied]}>
      <View style={styles.logoWrap}>
        {coupon.image_url ? (
          <Image
            source={{ uri: coupon.image_url }}
            style={styles.logo}
            resizeMode="cover"
          />
        ) : (
          <TablerIcon name="receipt" size={16} color={Colors.primaryColor} />
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {couponOfferTitle(coupon)}
          </Text>
          {onApply ? (
            <TouchableOpacity
              style={[styles.applyBtn, applied && styles.applyBtnOn]}
              onPress={() => onApply(coupon.code)}
              disabled={applied}
              activeOpacity={0.85}
            >
              <Text style={[styles.applyText, applied && styles.applyTextOn]}>
                {applied ? 'APPLIED' : applyLabel}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.midRow}>
          <TouchableOpacity
            onPress={() =>
              onCopy ? onCopy(coupon.code) : onApply?.(coupon.code)
            }
            activeOpacity={0.85}
          >
            <Text style={styles.code}>{coupon.code}</Text>
          </TouchableOpacity>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.save} numberOfLines={1}>
            {couponSavingsLabel(coupon)}
          </Text>
        </View>

        <Text style={styles.meta} numberOfLines={1}>
          {[
            couponExpiryLabel(coupon),
            minNote,
            coupon.visibility === 'private' ? 'For you' : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </View>
    </View>
  );
};

export default CouponTicket;

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 8,
  },
  wrapApplied: {
    borderColor: Colors.primaryColor,
    backgroundColor: '#F4FBF8',
  },
  logoWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EEF4F2',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: '#0F172A',
    fontFamily: Fonts.PoppinsSemiBold,
  },
  applyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: Colors.primaryColor,
  },
  applyBtnOn: {
    backgroundColor: '#D7E8E1',
  },
  applyText: {
    color: '#FFFFFF',
    fontSize: 10,
    letterSpacing: 0.3,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  applyTextOn: {
    color: Colors.primaryColor,
  },
  midRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  code: {
    fontSize: 11,
    letterSpacing: 0.4,
    color: Colors.primaryColor,
    fontFamily: Fonts.PoppinsSemiBold,
  },
  dot: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  save: {
    flex: 1,
    fontSize: 11,
    color: '#15803D',
    fontFamily: Fonts.PoppinsMedium,
  },
  meta: {
    marginTop: 2,
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: Fonts.PoppinsRegular,
  },
});
