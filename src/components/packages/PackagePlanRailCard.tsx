import React, { memo } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../common/Fonts';
import TablerIcon from '../TablerIcon';
import { RupeeAmount } from '../../utils/currencyUtils';
import type { PackagePlan } from '../../services/PackageServices';
import {
  PLAN_GOLD,
  getDiscountPercent,
  getPlanDurationLabel,
  getPlanTheme,
  isCarePlan,
  toAmount,
} from './packageUi';

export const RAIL_CARD_HEIGHT = 168;

type Props = {
  plan: PackagePlan;
  width: number;
  /** Card tap and "Buy now" both open the details sheet. */
  onPress: (plan: PackagePlan) => void;
  /** 0 → 1 sweep shared by the rail (native driver). */
  shine?: Animated.Value;
  /** User already has this package active → "Buy again". */
  owned?: boolean;
};

const SHINE_W = 46;

/** Compact gradient plan card for horizontal rails (Home / Consult). */
const PackagePlanRailCard = ({ plan, width, onPress, shine, owned = false }: Props) => {
  const shineX = shine?.interpolate({
    inputRange: [0, 1],
    outputRange: [-SHINE_W * 2, width + SHINE_W],
  });
  const theme = getPlanTheme(plan);
  const carePlan = isCarePlan(plan);
  const discount = getDiscountPercent(plan);
  const showOriginal = toAmount(plan.original_price) > toAmount(plan.selling_price);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(plan)}
      style={[styles.card, { width }]}
    >
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fill}
      >
        <View style={[styles.orb, styles.orbLarge]} />
        <View style={[styles.orb, styles.orbSmall]} />
        {shineX ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.shine, { transform: [{ translateX: shineX }, { rotate: '18deg' }] }]}
          />
        ) : null}

        <View style={styles.topRow}>
          {plan.image_url ? (
            <Image source={{ uri: plan.image_url }} style={styles.icon} />
          ) : (
            <View style={styles.icon}>
              <TablerIcon name={theme.icon} size={14} color="#FFFFFF" />
            </View>
          )}
          {plan.category_name ? (
            <Text style={styles.category} numberOfLines={1}>
              {plan.category_name}
            </Text>
          ) : (
            <View style={styles.flex} />
          )}
          {carePlan ? (
            <View style={styles.badge}>
              <TablerIcon name="star-filled" size={9} color="#3B2A06" />
              <Text style={styles.badgeText}>CARE PLAN</Text>
            </View>
          ) : discount > 0 ? (
            <View style={styles.offBadge}>
              <Text style={styles.offBadgeText}>{discount}% OFF</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.name} numberOfLines={2}>
          {plan.name}
        </Text>
        <Text style={styles.duration} numberOfLines={1}>
          {getPlanDurationLabel(plan)}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.priceWrap}>
            <RupeeAmount
              value={plan.selling_price}
              style={styles.price}
              iconColor="#FFFFFF"
              decimals={false}
            />
            {showOriginal ? (
              <RupeeAmount
                value={plan.original_price}
                style={styles.original}
                iconColor="rgba(255,255,255,0.6)"
                decimals={false}
              />
            ) : null}
          </View>
          <View style={styles.cta}>
            <Text style={[styles.ctaText, { color: theme.accent }]}>
              {carePlan ? (owned ? 'Buy again' : 'Buy now') : 'Book'}
            </Text>
          </View>
        </View>
        <View style={styles.goldLine} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default memo(PackagePlanRailCard);

const styles = StyleSheet.create({
  card: {
    height: RAIL_CARD_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#0A3D31',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  fill: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  orbLarge: {
    width: 130,
    height: 130,
    top: -55,
    right: -40,
  },
  shine: {
    position: 'absolute',
    top: -30,
    bottom: -30,
    left: 0,
    width: SHINE_W,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  orbSmall: {
    width: 64,
    height: 64,
    bottom: -22,
    right: 60,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  category: {
    flex: 1,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.85)',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: PLAN_GOLD,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 8.5,
    letterSpacing: 0.5,
    color: '#3B2A06',
  },
  offBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  offBadgeText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 9,
    color: '#FFFFFF',
  },
  name: {
    fontFamily: Fonts.PoppinsBold,
    fontSize: 14,
    lineHeight: 19,
    color: '#FFFFFF',
  },
  duration: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: 11,
    color: PLAN_GOLD,
    marginTop: -6,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  priceWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontFamily: Fonts.PoppinsBold,
    fontSize: 17,
    color: '#FFFFFF',
  },
  original: {
    fontFamily: Fonts.PoppinsRegular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    textDecorationLine: 'line-through',
  },
  cta: {
    height: 30,
    borderRadius: 15,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: 12,
  },
  goldLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: PLAN_GOLD,
    opacity: 0.85,
  },
});
